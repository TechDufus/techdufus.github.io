import { getPostMetas } from '../lib/content';
import { business, siteMetadata } from '../data/site';

function urlEntry(pathname: string, lastmod?: string): string {
  const loc = new URL(pathname, siteMetadata.url).toString();
  return lastmod ? `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>` : `<url><loc>${loc}</loc></url>`;
}

export async function GET() {
  const posts = await getPostMetas();
  // Trailing slashes match the site's own links (and the directory-style build output).
  const staticPaths = [
    '/',
    '/blog/',
    '/projects/',
    '/lab/',
    '/lab/rack/',
    '/lab/r720xd/',
    ...(business.enabled ? [business.appHref] : []),
    '/docs/',
    '/docs/setup/',
    '/about/',
    '/contact/',
    '/support/'
  ];

  const postEntries = posts.map((post) => urlEntry(post.href, post.date.toISOString().slice(0, 10)));
  const staticEntries = staticPaths.map((path) => urlEntry(path));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...postEntries,
    '</urlset>'
  ].join('');

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8'
    }
  });
}
