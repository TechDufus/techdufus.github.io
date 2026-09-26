# Scripts Directory

This repository uses Astro content collections with source material in `src/content/`.

## Available scripts

### `newpost`
Creates a new source blog post in `src/content/blog/`.

```bash
./scripts/newpost "Your Post Title"
```

### `check-performance.mjs`
Checks total JS, inline JS and CSS budgets plus a per-page HTML budget across the built top-level pages (home, about, blog, docs, contact, lab). Run after `npm run build`.

```bash
npm run check:perf
```
