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

The homepage includes a rotating studio statement, searchable project cards, and filters for all projects, client, sector, and service. The **All** filter is the default view and comes first in the toolbar. Cases appear four at a time; scrolling to the end of the visible list loads the next batch, and changing a filter or search starts again from the first batch. Project detail pages are generated from the same Markdown content source.

Only media selected for this site is copied into `public/assets/`; the 5.4 GB WordPress uploads directory is not part of this project.

The About and Contact pages and their navigation links are hosted locally.

## SEO

The canonical site URL is `https://i-space.design/`.
The build generates `sitemap.xml` from the homepage, studio pages, job listings, and
project collection. `robots.txt` points crawlers to that sitemap. Page titles,
descriptions, canonical URLs, social-sharing metadata, and Organization structured
data are rendered into each page.

`astro.config.mjs` reads the deployment target from the `SITE_URL` environment
variable and falls back to `https://i-space.design/`. Each workflow sets it before
building: the COS workflow uses the `SITE_URL` repository variable when it exists,
and the Pages workflow uses the origin that `actions/configure-pages` detects.
Set `SITE_URL` yourself to build for another domain.

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

## Analytics

Baidu Tongji (百度统计) records the page views. The snippet lives in
`src/components/BaiduAnalytics.astro` and is rendered by `SiteLayout` in the page
head. It is only emitted when `PUBLIC_BAIDU_ID` is set, so a build without that
variable ships no tracking code at all, and it is skipped during `npm run dev` so
local browsing never lands in the reports.

Copy `.env.example` to `.env` and fill in the site ID from
<https://tongji.baidu.com> for local builds:

```sh
PUBLIC_BAIDU_ID=your-site-id npm run build
```

The Pages workflow reads the same name from the repository settings, so add it once
under **Settings → Secrets and variables → Actions → Variables → `PUBLIC_BAIDU_ID`**
and every deployment picks it up.

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

1. Add its homepage card image as `cover.*` under `public/assets/cases/<case-id>/`. Add the original detail images in display order as `gallery-01.*`, `gallery-02.*`, and so on. `gallery-01` becomes the detail-page banner; the remaining images are shown in the project gallery. Supported formats are JPG, PNG, GIF, WebP, and AVIF. Run `npm run images` afterwards to store them as WebP.
2. Create `src/content/cases/<case-id>.md` using this frontmatter:

   ```md
   ---
   title: 项目中文名
   titleEn: PROJECT NAME
   category: 展陈设计
   sector: 所属领域
   services:
     - 品牌识别
     - 空间设计
   client: 客户名称
   cover: /assets/cases/<case-id>/cover.jpg
   alt: 封面图片的中文说明
   order: 9
   ---

   在此补充中文项目介绍。使用空行分段。
   ```

3. Use a unique, URL-safe case ID. `order` controls the homepage order. `sector` and `services` supply filter options.
4. Run `npm run build`, then commit the Markdown and media files.

The generated case URL is `/work/<case-id>/`.

### Case order and category

`order` follows the studio's project master list: it is the position of the case in
that list, and the homepage renders the cases in that order. `category` uses one
of five values — 展陈设计, 标识设计, 商业空间, 装置设计, 包装设计 — and is shown on
the project card and on the project detail page. `sector` and `services` are
separate fields that feed the homepage Client, Sector and Service filters.

## Deployment

The site is published at `https://i-space.design/`, served from a Tencent Cloud COS bucket. Two workflows cover it.

### Tencent COS release deployment

The workflow `.github/workflows/cos-release.yml` builds the site and publishes it to the COS bucket on every push to a `release-*` branch. The deploy job runs on the `cos-release` environment, so it waits for a manual approval before it writes to the bucket:

- **Settings → Environments → New environment** named `cos-release`, with **Required reviewers** enabled. The approval button appears on the pending run in the Actions tab.
- **Settings → Secrets and variables → Actions → Secrets**: `TENCENT_CLOUD_SECRET_ID` and `TENCENT_CLOUD_SECRET_KEY` hold the Tencent Cloud CAM key. `TENCENTCLOUD_SECRET_ID` and `TENCENTCLOUD_SECRET_KEY` work as well.
- **Settings → Secrets and variables → Actions → Variables**: `COS_BUCKET` and `COS_REGION` hold the bucket name and its region, for example `inwa-1250000000` and `ap-guangzhou`. Both names are also read from secrets when they are stored there instead.

The upload runs through [coscli](https://github.com/tencentyun/coscli), the Tencent Cloud command line tool. It compares the CRC64 of every file with the copy in the bucket and sends only what changed, so a release that touches one page uploads one file instead of the whole site. Files that are no longer part of the build are removed from the bucket; set the `COS_CLEAN` variable to `false` to keep them.

The CAM key needs `cos:GetBucket`, `cos:HeadObject`, `cos:PutObject` and `cos:DeleteObject` on that bucket.

### Caching

The upload runs in two groups, and each group carries its own `Cache-Control`:

| Group | Paths | Header |
| --- | --- | --- |
| assets | `assets/`, `_astro/` | `public, max-age=31536000, immutable` |
| pages | everything else | `no-cache` |

The pages are read again on every visit, the images and the hashed CSS and JS bundles can stay in the browser cache for a year. Without a `Cache-Control` header the CDN keeps a page for hours, so a release is only visible after the cached copy expires — that is how the old `.jpg` references were still being served after the switch to WebP.

Set the CDN to **follow the origin** for the cache expiration (**缓存过期配置 → 跟随源站**) and purge the cached pages after a release (**刷新预热 → URL 刷新**).

The headers only reach the objects that are uploaded, and coscli skips the files whose CRC64 already matches. To give the files that are already in the bucket the headers as well, delete them once and upload them again:

```sh
coscli rm cos://inwa-1250000000/ --recursive --include "\.(html|xml|txt)$" --force \
  --secret-id "$COS_SECRET_ID" --secret-key "$COS_SECRET_KEY" --endpoint cos.ap-guangzhou.myqcloud.com
npm run deploy
```

### Local deploy

`npm run deploy` builds the site and syncs it to the bucket from the local machine, with the same coscli command the workflow uses. Put the credentials in a `.env` file in the project root — git ignores it — or export them in the shell:

```sh
COS_BUCKET=inwa-1250000000
COS_REGION=ap-guangzhou
COS_SECRET_ID=your-cam-key-id
COS_SECRET_KEY=your-cam-key
```

The script builds the site with the root base path and syncs `dist` to the bucket root: files that are already there with the same CRC64 are skipped, and the files that are no longer part of the build are removed. `TENCENT_CLOUD_SECRET_ID`/`TENCENT_CLOUD_SECRET_KEY` and `TENCENTCLOUD_SECRET_ID`/`TENCENTCLOUD_SECRET_KEY` work as well.

- `--skip-build` syncs the `dist` that is already there instead of building first.
- `COS_CLEAN=false` keeps the files in the bucket that are no longer part of the build.
- `COSCLI_PATH` uses a coscli that is already installed; without it the script downloads the matching build into `.cache/`.

### GitHub Pages deployment

The workflow `.github/workflows/astro.yml` builds and publishes `dist` on every push to `main`. In repository settings, enable **Settings → Pages → Build and deployment → Source: GitHub Actions**.

The workflow calls `actions/configure-pages`, which reads the Pages settings and passes the correct `--site` and `--base` to `astro build`. The base path therefore follows the Pages configuration automatically:

- **Project URL** (`https://chenhaixia353-cyber.github.io/inwa-static-site/`) — the current setting, no extra configuration needed.
- **Custom domain** — set the custom domain in **Settings → Pages** and add a `public/CNAME` file containing the domain.

For local previews of a subpath build, set `PAGES_BASE_PATH` before `npm run build`; `astro.config.mjs` reads it as the base path.

## Media notes

Use optimized project-specific assets rather than copying the full WordPress uploads directory. GIF covers preserve their animation; images and the hero reel are loaded locally. Keep individual GitHub-hosted media files reasonably small and consider object storage/CDN for large videos.

### Image format

Every case image is stored as WebP. `npm run images` converts the JPG, PNG and GIF files under `public/assets/cases` with sharp: static images become WebP at quality 80, animated GIFs become animated WebP at quality 70, and anything wider than 1600 pixels is scaled down. The source file is removed and the `cover` entry of the case files is updated, so run it after adding new media. The batch of 724 images went from 273 MB to 87 MB.

### Imported case batch

31 projects were migrated from the WordPress site in one batch. Their copy comes from the original `work` posts (Chinese body text); the eight projects that had no body text on the live site (阿里云云谷、龙城CC、净地良材、净地良材产品&空间) have copy written from the project scope. `year` is only set where the original text states one, and should be filled in for the remaining cases. Two further WordPress posts were published later: INCLUSION 品牌空间规范 (`branding-space-of-inclusion`) and 盈致未来文创 (`branding-of-into-create`), both with their original copy and CDN media.

Image files were requested from `cdn.inwa.top` with `imageMogr2/thumbnail/1600x>/quality/80/interlace/1`, so JPEGs and PNGs are resized copies rather than the multi-megabyte originals. Animated GIFs were re-encoded as animated WebP via `imageMogr2/format/webp`; three GIFs that the CDN refused to process (too many frames) were still stored as GIF. Every case image is now stored as WebP. All 31 cases appear under the **All** filter and their own detail routes.

### Title-only cases

23 projects without confirmed public copy or imagery carry metadata only. Their Markdown entries use `placeholder: true`; the cards appear in the **All** filter, show the default `public/assets/cases/_placeholder.svg` cover instead of a photograph, are not links, and generate no detail route or sitemap URL. Because the frontmatter is filled in, they also take part in the **Client**, **Sector** and **Service** filters.

The metadata for these 23 projects — English title, category, sector, services and client — was derived from the project names, because none of them exist as `work` posts in the WordPress database. Treat it as provisional until the source material is confirmed.

百年江丰文献展 (Discover Jiang Feng) is a separate case: the exhibition was never published on the WordPress site, but its 20 photographs were still on the CDN, so the case is published with the real images and placeholder copy.

To complete a placeholder when approved source material is available:

1. Add the cover and ordered gallery images under `public/assets/cases/<case-id>/`.
2. Set `cover` to the new image and remove `placeholder: true`; the rest of the frontmatter is already in place.
3. Add the verified Chinese project description to the Markdown file.

Astro will then generate its detail route and include it in the sitemap.
