// Deploys the site to the Tencent Cloud COS bucket from the local machine.
//
//   npm run deploy
//
// The site is built with the root base path and synced to the bucket root
// with coscli, the same way the release workflow does it: files that are
// already in the bucket with the same CRC64 are skipped, so a release that
// only touches a few pages uploads a few files.
//
// The bucket, region and CAM key come from the environment or from a `.env`
// file in the project root:
//
//   COS_BUCKET=inwa-1250000000
//   COS_REGION=ap-guangzhou
//   COS_SECRET_ID=...
//   COS_SECRET_KEY=...
//
// TENCENTCLOUD_SECRET_ID/TENCENTCLOUD_SECRET_KEY and
// TENCENT_CLOUD_SECRET_ID/TENCENT_CLOUD_SECRET_KEY are accepted as well.
// Set COS_CLEAN=false to keep the files that are no longer part of the
// build, and COSCLI_PATH to use a coscli that is already installed.

import { spawn } from 'node:child_process';
import { chmod, mkdir, readFile, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { dirname, join } from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const coscliVersion = '1.0.9';
const cacheDir = '.cache';
const coscliPath = join(cacheDir, `coscli-v${coscliVersion}`);

// The values that are not part of the environment yet come from `.env`.
async function loadEnvFile() {
  let source;
  try {
    source = await readFile('.env', 'utf8');
  } catch {
    return;
  }
  for (const line of source.split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || line.trimStart().startsWith('#')) continue;
    const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
    if (process.env[match[1]] === undefined) process.env[match[1]] = value;
  }
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code}`));
    });
  });
}

function platformAsset() {
  const os = { darwin: 'darwin', linux: 'linux', win32: 'windows' }[process.platform];
  const arch = { x64: 'amd64', arm64: 'arm64', ia32: '386' }[process.arch];
  if (!os || !arch) {
    throw new Error(`no coscli build for ${process.platform} ${process.arch}`);
  }
  return `coscli-v${coscliVersion}-${os}-${arch}${os === 'windows' ? '.exe' : ''}`;
}

// Downloads coscli into the project cache so that the deploy works without
// a globally installed copy.
async function ensureCoscli() {
  if (process.env.COSCLI_PATH) return process.env.COSCLI_PATH;

  const existing = await stat(coscliPath).catch(() => null);
  if (existing?.isFile()) {
    await chmod(coscliPath, 0o755);
    return coscliPath;
  }

  const asset = platformAsset();
  const url = `https://github.com/tencentyun/coscli/releases/download/v${coscliVersion}/${asset}`;
  console.log(`downloading ${asset}`);
  await mkdir(dirname(coscliPath), { recursive: true });
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`could not download coscli: ${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(coscliPath));
  await chmod(coscliPath, 0o755);
  return coscliPath;
}

await loadEnvFile();

const bucket = process.env.COS_BUCKET;
const region = process.env.COS_REGION;
const secretId =
  process.env.COS_SECRET_ID ??
  process.env.TENCENTCLOUD_SECRET_ID ??
  process.env.TENCENT_CLOUD_SECRET_ID;
const secretKey =
  process.env.COS_SECRET_KEY ??
  process.env.TENCENTCLOUD_SECRET_KEY ??
  process.env.TENCENT_CLOUD_SECRET_KEY;

const missing = [];
if (!bucket) missing.push('COS_BUCKET');
if (!region) missing.push('COS_REGION');
if (!secretId) missing.push('COS_SECRET_ID');
if (!secretKey) missing.push('COS_SECRET_KEY');
if (missing.length > 0) {
  console.error(`${missing.join(', ')} ${missing.length === 1 ? 'is' : 'are'} not set`);
  console.error('put them in the environment or in a .env file in the project root');
  process.exit(1);
}

const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  console.log('building the site');
  try {
    await run(process.execPath, ['node_modules/astro/astro.js', 'build', '--base', '/'], {
      env: { ...process.env, SITE_URL: process.env.SITE_URL || 'https://i-space.design' },
    });
  } catch {
    console.error('the build failed');
    process.exit(1);
  }
}

const coscli = await ensureCoscli();
const endpoint = `cos.${region}.myqcloud.com`;
const args = [
  'sync',
  'dist',
  `cos://${bucket}/`,
  '--recursive',
  '--routines',
  '16',
  '--thread-num',
  '4',
  '--retry-num',
  '5',
  '--err-retry-num',
  '5',
  '--err-retry-interval',
  '2',
  '--check-point',
  '--force',
  '--secret-id',
  secretId,
  '--secret-key',
  secretKey,
  '--endpoint',
  endpoint,
];

if ((process.env.COS_CLEAN || 'true') === 'true') args.push('--delete');

console.log(`syncing dist to cos://${bucket}/ (${endpoint})`);
try {
  await run(coscli, args);
} catch {
  console.error('the sync to COS failed, check the bucket name, the region and the CAM key');
  process.exit(1);
}
console.log('done');
