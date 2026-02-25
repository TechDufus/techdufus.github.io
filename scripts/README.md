# Scripts Directory

This repository uses Astro content collections with source material in `src/content/`.

## Available scripts

### `newpost`
Creates a new source blog post in `src/content/blog/`.

```bash
./scripts/newpost "Your Post Title"
```

### `migrate-content.mjs`
One-time legacy migration tool. It copies Jekyll-era `_posts/` and `_setup/` content into `src/content/*` and refreshes static assets in `public/`.

```bash
node scripts/migrate-content.mjs
```
