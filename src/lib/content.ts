import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

export type BlogPost = CollectionEntry<'blog'>;

export function toSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function getSortedPosts(): Promise<BlogPost[]> {
  const posts = await getCollection('blog');
  return posts.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function buildTagMap(posts: BlogPost[]): Map<string, number> {
  const tags = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const key = toSlug(tag);
      tags.set(key, (tags.get(key) ?? 0) + 1);
    }
  }
  return tags;
}

export function buildCategoryMap(posts: BlogPost[]): Map<string, number> {
  const categories = new Map<string, number>();
  for (const post of posts) {
    if (!post.data.category) continue;
    const key = toSlug(post.data.category);
    categories.set(key, (categories.get(key) ?? 0) + 1);
  }
  return categories;
}

export function getPostsByTag(posts: BlogPost[], tagSlug: string): BlogPost[] {
  return posts.filter((post) => post.data.tags.some((tag) => toSlug(tag) === tagSlug));
}

export function getPostsByCategory(posts: BlogPost[], categorySlug: string): BlogPost[] {
  return posts.filter((post) => post.data.category && toSlug(post.data.category) === categorySlug);
}
