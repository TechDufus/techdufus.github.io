import rss from '@astrojs/rss';
import { siteMetadata } from '../data/site';
import { entrySlug, getSortedPosts } from '../lib/content';

export async function GET() {
  const posts = await getSortedPosts();

  return rss({
    title: siteMetadata.title,
    description: siteMetadata.description,
    site: siteMetadata.url,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: `/blog/${entrySlug(post.id)}`
    }))
  });
}
