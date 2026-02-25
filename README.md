# { TechDufus }

[![Deploy Astro site to GitHub Pages](https://github.com/TechDufus/techdufus.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/TechDufus/techdufus.github.io/actions/workflows/deploy.yml)

TechDufus.com is a full in-place Astro rebuild with a new IA, dark-only terminal-editorial design system, and no legacy redirect layer.

## Stack

- Astro (TypeScript)
- React integration for UI primitives
- Tailwind + shadcn-style component foundation
- Markdown content collections
- GitHub Pages deployment via Actions

## Route map

- `/`
- `/blog`
- `/blog/[slug]`
- `/docs`
- `/docs/setup`
- `/docs/career`
- `/about`
- `/contact`
- `/404`
- `/feed.xml`
- `/sitemap.xml`

## Local development

### Prerequisites

- Node.js 22+
- npm 10+

### Install

```bash
npm install
```

### Start dev server

```bash
npm run dev
```

### Build

```bash
npm run build
```

Build pipeline: `astro build`

## Content locations

- Blog posts: `src/content/blog/*.md`
- Setup docs: `src/content/docs/setup.md`
- Docs career source: `src/content/docs/career.md`
- Site metadata/nav/copy: `src/data/site.ts`

## Media and Preview Metadata

- Global metadata lives in `src/data/site.ts` under `siteMetadata` and `siteMetadata.media`.
- Head tags are rendered in `src/layouts/BaseLayout.astro`.
- Per-post social previews can be set in blog frontmatter:
  - `socialImage`
  - `socialImageAlt`
  - `socialImageWidth`
  - `socialImageHeight`
- App/browser icons and manifest files are in `public/`:
  - `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`
  - `apple-touch-icon.png`
  - `android-chrome-192x192.png`, `android-chrome-512x512.png`
  - `site.webmanifest`

## New post helper

```bash
./scripts/newpost "Your Post Title"
```

## Notes

- This build intentionally does not generate or serve legacy redirects.
- `public/CNAME` preserves the `techdufus.com` custom domain during GitHub Pages deploys.
