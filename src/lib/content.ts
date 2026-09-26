import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';
import readingTime from 'reading-time';

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

export type PostMeta = {
  slug: string;
  href: `/blog/${string}/`;
  title: string;
  description: string;
  date: Date;
  tags: string[];
  words: number;
  minutes: number;
};

export type PostStats = {
  count: number;
  words: number;
  minutes: number;
  first: Date;
  latest: Date;
  /** Oldest year first, including years with no posts. */
  years: { year: number; count: number }[];
};

export function postMeta(post: BlogPost): PostMeta {
  const stats = readingTime(post.body);
  return {
    slug: post.slug,
    href: `/blog/${post.slug}/`,
    title: post.data.title,
    description: post.data.description,
    date: post.data.pubDate,
    tags: post.data.tags,
    words: stats.words,
    // Same rounding as reading-time's own "N min read" text.
    minutes: Math.max(1, Math.ceil(stats.minutes))
  };
}

/** Newest first. */
export async function getPostMetas(): Promise<PostMeta[]> {
  return (await getSortedPosts()).map(postMeta);
}

export function postStats(metas: PostMeta[]): PostStats {
  if (metas.length === 0) {
    const now = new Date();
    return { count: 0, words: 0, minutes: 0, first: now, latest: now, years: [] };
  }

  let first = metas[0].date;
  let latest = metas[0].date;
  let words = 0;
  let minutes = 0;
  const counts = new Map<number, number>();
  for (const meta of metas) {
    if (meta.date < first) first = meta.date;
    if (meta.date > latest) latest = meta.date;
    words += meta.words;
    minutes += meta.minutes;
    const year = meta.date.getUTCFullYear();
    counts.set(year, (counts.get(year) ?? 0) + 1);
  }

  const years: PostStats['years'] = [];
  for (let year = first.getUTCFullYear(); year <= latest.getUTCFullYear(); year++) {
    years.push({ year, count: counts.get(year) ?? 0 });
  }

  return { count: metas.length, words, minutes, first, latest, years };
}

/** Newest year first; posts keep their incoming order (newest first from getPostMetas). */
export function groupByYear(metas: PostMeta[]): { year: number; posts: PostMeta[] }[] {
  const groups = new Map<number, PostMeta[]>();
  for (const meta of metas) {
    const year = meta.date.getUTCFullYear();
    const posts = groups.get(year);
    if (posts) posts.push(meta);
    else groups.set(year, [meta]);
  }
  return [...groups.entries()].sort(([a], [b]) => b - a).map(([year, posts]) => ({ year, posts }));
}

/** `prev` is the older post, `next` the newer one. Order-independent. */
export function adjacentPosts(metas: PostMeta[], slug: string): { prev: PostMeta | null; next: PostMeta | null } {
  const sorted = [...metas].sort((a, b) => b.date.getTime() - a.date.getTime());
  const index = sorted.findIndex((meta) => meta.slug === slug);
  if (index === -1) return { prev: null, next: null };
  return {
    prev: sorted[index + 1] ?? null,
    next: index > 0 ? sorted[index - 1] : null
  };
}
