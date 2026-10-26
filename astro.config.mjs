import { defineConfig } from 'astro/config';

const pagesBasePath = process.env.PAGES_BASE_PATH?.replace(/^\/|\/$/g, '');

export default defineConfig({
  output: 'static',
  trailingSlash: 'always',
  base: pagesBasePath ? `/${pagesBasePath}/` : '/',
});
