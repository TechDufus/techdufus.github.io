# Scripts Directory

This repository uses Astro content collections with source material in `src/content/`.

## Available scripts

### `newpost`
Creates a new source blog post in `src/content/blog/`.

```bash
./scripts/newpost "Your Post Title"
```

### `check-performance.mjs`
Checks the built top-level pages for JS/CSS size budget regressions.

```bash
node scripts/check-performance.mjs
```
