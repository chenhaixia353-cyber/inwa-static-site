import { getCollection } from 'astro:content';
import { jobs } from '../data/jobs';

export async function GET({ site }: { site: URL | undefined }) {
  if (!site) {
    throw new Error('Set the Astro site URL to generate the sitemap.');
  }

  const cases = await getCollection('cases');
  const routes = [
    '',
    'about/',
    'contact/',
    ...jobs.map((job) => `job/${job.slug}/`),
    ...cases
      .filter(({ data }) => !data.placeholder)
      .map((entry) => `work/${entry.id}/`),
  ];
  const base = import.meta.env.BASE_URL;
  const urls = routes
    .map((route) => new URL(`${base}${route}`, site).href)
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    },
  );
}
