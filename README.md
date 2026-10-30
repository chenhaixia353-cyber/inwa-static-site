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

The homepage includes a rotating studio statement, searchable project cards, and filters for featured work, client, sector, service, and all projects. The **All** filter is the default view; Featured narrows the grid to the eight projects marked `home: true`. Cases appear four at a time; scrolling to the end of the visible list loads the next batch, and changing a filter or search starts again from the first batch. Project detail pages are generated from the same Markdown content source.

Only media selected for this site is copied into `public/assets/`; the 5.4 GB WordPress uploads directory is not part of this project.

The About and Contact pages and their navigation links are hosted locally.

## SEO

The canonical site URL is `https://chenhaixia353-cyber.github.io/inwa-static-site/`.
The build generates `sitemap.xml` from the homepage, studio pages, job listings, and
project collection. `robots.txt` points crawlers to that sitemap. Page titles,
descriptions, canonical URLs, social-sharing metadata, and Organization structured
data are rendered into each page.

Use descriptive, natural-language phrases in visible page titles, headings, project
copy, and image alt text. Prioritize a small number of topic clusters:

- Studio and location: INWA SPACE, 因未设计, 北京独立设计机构, Beijing design studio.
- Services: 北京品牌设计, 品牌策略与识别, 展览视觉设计, 文化空间设计, 导视系统设计,
  品牌体验设计; branding, exhibition design, cultural space design.
- Case-specific searches: 高德地图办公空间文化展陈设计, 济宁市美术馆品牌与导视设计,
  故宫玻璃展览视觉设计, and the matching English project names.

Use the studio/location terms on the homepage and About page, service terms on About
and Contact, and specific client/project terms on each case page. Avoid keyword
stuffing and `meta keywords`; major search engines do not use that tag for ranking.
Google's search-result sitelinks (like those in the reference image) are selected
automatically; a sitemap helps discovery and crawling but cannot request specific
sitelinks. After deployment, verify the site in Google Search Console and Baidu
Search Resource Platform, submit the sitemap URL, and monitor indexing reports.

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

### Imported case batch

31 projects were migrated from the WordPress site in one batch. Their copy comes from the original `work` posts (Chinese body text and the `txt_en` field); the eight projects that had no body text on the live site (阿里云云谷、龙城CC、净地良材、净地良材产品&空间) have copy written from the project scope, and the four cases missing only the English body (阿里巴巴访客中心、盒马鲜生昆明店、「历史与创想」展) were translated from the Chinese. `year` is only set where the original text states one, and should be filled in for the remaining cases.

Image files were requested from `cdn.inwa.top` with `imageMogr2/thumbnail/1600x>/quality/80/interlace/1`, so JPEGs and PNGs are resized copies rather than the multi-megabyte originals. Animated GIFs were re-encoded as animated WebP via `imageMogr2/format/webp`; three GIFs that the CDN refused to process (too many frames) are still stored as GIF. All 31 cases use `home: false`, so they appear under the **All** filter and their own detail routes without changing the homepage Featured selection.

### Title-only cases

23 projects without confirmed public copy or imagery carry metadata only. Their Markdown entries use `placeholder: true`; the cards appear in the **All** filter, show the default `public/assets/cases/_placeholder.svg` cover instead of a photograph, are not links, and generate no detail route or sitemap URL. Because the frontmatter is filled in, they also take part in the **Client**, **Sector** and **Service** filters.

The metadata for these 23 projects — English title, category, sector, services and client — was derived from the project names, because none of them exist as `work` posts in the WordPress database. Treat it as provisional until the source material is confirmed.

百年江丰文献展 (Discover Jiang Feng) is a separate case: the exhibition was never published on the WordPress site, but its 20 photographs were still on the CDN, so the case is published with the real images and placeholder copy.

To complete a placeholder when approved source material is available:

1. Add the cover and ordered gallery images under `public/assets/cases/<case-id>/`.
2. Set `cover` to the new image and remove `placeholder: true`; the rest of the frontmatter is already in place.
3. Add the verified Chinese and English project descriptions to the Markdown file.

Astro will then generate its detail route and include it in the sitemap. Keep `home: false` until the project is ready for the Featured selection.
