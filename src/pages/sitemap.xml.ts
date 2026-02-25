import { getSortedPosts } from '../lib/content';
import { siteMetadata } from '../data/site';

function loc(pathname: string): string {
  return new URL(pathname, siteMetadata.url).toString();
}

function urlEntry(pathname: string, lastmod?: string): string {
  if (!lastmod) {
    return `<url><loc>${loc(pathname)}</loc></url>`;
  }

  return `<url><loc>${loc(pathname)}</loc><lastmod>${lastmod}</lastmod></url>`;
}

export async function GET() {
  const posts = await getSortedPosts();
  const staticPaths = ['/', '/blog', '/docs', '/docs/setup', '/docs/career', '/about', '/contact'];

  const postEntries = posts.map((post) =>
    urlEntry(`/blog/${post.slug}`, post.data.pubDate.toISOString().slice(0, 10))
  );
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
