// Converts the case images to WebP and points the case files at the new ones.
//
//   npm run images
//
// Static images become WebP at quality 80, animated GIFs become animated
// WebP at quality 70, and everything wider than 1600 pixels is scaled down.
// The source file is removed once the WebP is written, and the `cover` entry
// of every case file is updated to the new extension.

import { readdir, readFile, stat, writeFile, unlink } from 'node:fs/promises';
import { join, extname, parse } from 'node:path';
import sharp from 'sharp';

const assetRoot = 'public/assets/cases';
const contentRoot = 'src/content/cases';
const maxWidth = 1600;
const staticQuality = 80;
const animatedQuality = 70;
const concurrency = 6;
const sourceExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

async function collectImages(directory) {
  const images = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      images.push(...(await collectImages(path)));
    } else if (sourceExtensions.includes(extname(entry.name).toLowerCase())) {
      images.push(path);
    }
  }
  return images;
}

async function convert(path) {
  const { dir, name } = parse(path);
  const target = join(dir, `${name}.webp`);
  const input = await readFile(path);
  const animated = extname(path).toLowerCase() === '.gif';
  // The animated GIFs are filmstrips and exceed the default pixel limit.
  const image = sharp(input, { animated, limitInputPixels: false });
  const output = await image
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: animated ? animatedQuality : staticQuality, effort: 4 })
    .toBuffer();
  await writeFile(target, output);
  await unlink(path);
  return { path, target, before: input.length, after: output.length, animated };
}

async function updateCovers() {
  const files = await readdir(contentRoot);
  let updated = 0;
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const path = join(contentRoot, file);
    const source = await readFile(path, 'utf8');
    const next = source.replace(
      /^cover: (.+)\.(?:jpg|jpeg|png|gif)$/m,
      'cover: $1.webp',
    );
    if (next !== source) {
      await writeFile(path, next);
      updated += 1;
    }
  }
  return updated;
}

// Every cover has to point at a file that is there, otherwise the page
// shows a broken image. The placeholder cases have no cover of their own.
async function verifyCovers() {
  const files = await readdir(contentRoot);
  const broken = [];
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    const source = await readFile(join(contentRoot, file), 'utf8');
    const cover = source.match(/^cover: (.+)$/m)?.[1]?.trim();
    if (!cover) {
      if (!/^placeholder: true$/m.test(source)) broken.push(`${file}: no cover`);
      continue;
    }
    try {
      await stat(join('public', cover));
    } catch {
      broken.push(`${file}: ${cover} is missing`);
    }
  }
  return broken;
}

const images = await collectImages(assetRoot);
const results = [];
const failures = [];
let index = 0;

await Promise.all(
  Array.from({ length: concurrency }, async () => {
    while (index < images.length) {
      const path = images[index++];
      try {
        results.push(await convert(path));
      } catch (error) {
        failures.push(`${path}: ${error.message}`);
      }
    }
  }),
);

const before = results.reduce((sum, result) => sum + result.before, 0);
const after = results.reduce((sum, result) => sum + result.after, 0);
const animated = results.filter((result) => result.animated).length;

console.log(
  `converted ${results.length} images (${animated} animated), ` +
    `${(before / 1024 / 1024).toFixed(1)} MB -> ${(after / 1024 / 1024).toFixed(1)} MB`,
);

if (failures.length > 0) {
  console.log(`left untouched, not readable as an image:`);
  for (const failure of failures) {
    console.log(`  ${failure}`);
  }
}

const updated = await updateCovers();
console.log(`updated ${updated} case files`);

const broken = await verifyCovers();
if (broken.length > 0) {
  console.log('covers that do not point at a file:');
  for (const entry of broken) {
    console.log(`  ${entry}`);
  }
  process.exitCode = 1;
}
