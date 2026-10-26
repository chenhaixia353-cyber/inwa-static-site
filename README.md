# INWA SPACE — Static portfolio

Static Astro portfolio for INWA SPACE, using the authorized 2x4.org homepage as a visual reference and selected media from the existing INWA WordPress site. The build does not need PHP, WordPress, or a database.

## Routes

| Page | Local route | Source |
| --- | --- | --- |
| Portfolio homepage | `/` | `https://2x4.org/` (visual reference) |
| About | `/about/` | INWA studio profile |
| Contact | `/contact/` | INWA contact information and social channels |
| Careers | `/job/{role-id}/` | Static job descriptions and application links |
| Project detail | `/work/{case-id}/` | Generated from each case Markdown file |

The homepage includes a rotating studio statement, searchable project cards, and filters for featured work, client, sector, service, and all projects. Project details are generated from the same Markdown content source.

Only media selected for this site is copied into `public/assets/`; the 5.4 GB WordPress uploads directory is not part of this project.

The About and Contact pages and their navigation links are hosted locally.

## Local development

Requires Node.js 22.12 or newer.

```sh
npm install
npm run dev
```

Run the static production build:

```sh
npm run build
npm run preview
```

## Add a case

1. Add its cover image (and optional project media) under `public/assets/cases/<case-id>/`.
2. Create `src/content/cases/<case-id>.md` using this frontmatter:

   ```md
   ---
   title: 项目中文名
   titleEn: PROJECT NAME
   category: 项目类别
   sector: 所属领域
   services:
     - 品牌识别
     - 空间设计
   client: 客户名称
   cover: /assets/cases/<case-id>/cover.jpg
   alt: 封面图片的中文说明
   home: true
   order: 9
   ---

   在此补充项目介绍。
   ```

3. Use a unique, URL-safe case ID. `order` controls the homepage order. `sector` and `services` supply filter options. Set `home: false` to keep the case in the detail routes and All filter, but omit it from Featured.
4. Run `npm run build`, then commit the Markdown and media files.

The generated case URL is `/work/<case-id>/`.

## GitHub Pages deployment

The included Actions workflow (`.github/workflows/deploy-pages.yml`) builds and publishes `dist` on every push to `main`. In repository settings, enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The build base path is controlled by the `PAGES_BASE_PATH` environment variable in the workflow, which `astro.config.mjs` reads:

- **Project URL** (`https://chenhaixia353-cyber.github.io/inwa-static-site/`) — set `PAGES_BASE_PATH: inwa-static-site` in the workflow. This is the current setting.
- **Custom domain** (`https://www.inwa.top/`) — remove `PAGES_BASE_PATH` from the workflow and add a `public/CNAME` file containing `www.inwa.top`, then point the domain at GitHub Pages with a `CNAME` DNS record (`www` → `chenhaixia353-cyber.github.io`, apex → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).

Only one of the two can be active at a time, because the base path is baked into the built HTML.

## Media notes

Use optimized project-specific assets rather than copying the full WordPress uploads directory. GIF covers preserve their animation; images and the hero reel are loaded locally. Keep individual GitHub-hosted media files reasonably small and consider object storage/CDN for large videos.
