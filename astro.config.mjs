import { defineConfig } from 'astro/config';

const pagesBasePath = process.env.PAGES_BASE_PATH?.replace(/^\/|\/$/g, '');
const site = process.env.SITE_URL || 'https://i-space.design';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  base: pagesBasePath ? `/${pagesBasePath}/` : '/',
});
