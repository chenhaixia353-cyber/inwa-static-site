import { defineConfig } from 'astro/config';

const pagesBasePath = process.env.PAGES_BASE_PATH?.replace(/^\/|\/$/g, '');

export default defineConfig({
  site: 'https://chenhaixia353-cyber.github.io',
  output: 'static',
  trailingSlash: 'always',
  base: pagesBasePath ? `/${pagesBasePath}/` : '/',
});
