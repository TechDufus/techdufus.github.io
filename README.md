# { TechDufus }

Personal site for `techdufus.com`, built with Astro and deployed to GitHub Pages.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run check
npm run build
npm run check:perf
```

## Content

- Blog posts: `src/content/blog/*.md`
- Docs: `src/content/docs/*.md`
- Site copy/nav/meta: `src/data/site.ts`

## Deploy

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Custom domain: `public/CNAME`
