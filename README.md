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

Run Astro diagnostics and TypeScript checks:

```sh
npm run check
```

Run the static production build:

```sh
npm run build
npm run preview
```

## Add a case

1. Add its homepage card image as `cover.*` under `public/assets/cases/<case-id>/`. Add the original detail images in display order as `gallery-01.*`, `gallery-02.*`, and so on. `gallery-01` becomes the detail-page banner; the remaining images are shown in the project gallery. Supported formats are JPG, PNG, GIF, WebP, and AVIF.
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
   descriptionEn: |
     English project description. Separate paragraphs with a blank line.
   cover: /assets/cases/<case-id>/cover.jpg
   alt: 封面图片的中文说明
   home: true
   order: 9
   ---

   在此补充中文项目介绍。使用空行分段；英文介绍写在 `descriptionEn` 中。
   ```

3. Use a unique, URL-safe case ID. `order` controls the homepage order. `sector` and `services` supply filter options. Set `home: false` to keep the case in the detail routes and All filter, but omit it from Featured.
4. Run `npm run build`, then commit the Markdown and media files.

The generated case URL is `/work/<case-id>/`.

## GitHub Pages deployment

The included Actions workflow (`.github/workflows/astro.yml`) builds and publishes `dist` on every push to `main`. In repository settings, enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow calls `actions/configure-pages`, which reads the Pages settings and passes the correct `--site` and `--base` to `astro build`. The base path therefore follows the Pages configuration automatically:

- **Project URL** (`https://chenhaixia353-cyber.github.io/inwa-static-site/`) — the current setting, no extra configuration needed.
- **Custom domain** (`https://www.inwa.top/`) — set the custom domain in **Settings → Pages**, add a `public/CNAME` file containing `www.inwa.top`, and point the domain at GitHub Pages with a `CNAME` DNS record (`www` → `chenhaixia353-cyber.github.io`, apex → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`).

For local previews of a subpath build, set `PAGES_BASE_PATH` before `npm run build`; `astro.config.mjs` reads it as the base path.

## Media notes

Use optimized project-specific assets rather than copying the full WordPress uploads directory. GIF covers preserve their animation; images and the hero reel are loaded locally. Keep individual GitHub-hosted media files reasonably small and consider object storage/CDN for large videos.
