# { TechDufus }

Personal site for `techdufus.com`, built with Astro and deployed to GitHub Pages.

Design: Studio Midnight (deep navy, living gold foil) in `src/styles/global.css`, ported from the `design/pro-studio/` mockup. Tailwind is only a utility layer.

Pages: home, writing (`/blog/`, `/blog/<slug>/`), lab (`/lab/`), docs, about, contact, support. A scripted site guide (not a live AI) answers from `/guide.json`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run check
npm run build
npm run check:perf   # JS/CSS/HTML budgets on the built pages
```

## Content

- Blog posts: `src/content/blog/*.md` (new post: `./scripts/newpost "Title"`)
- Docs: `src/content/docs/*.md`
- Site copy/nav/meta, hero, topics, lab spec: `src/data/site.ts`
- UI components: `src/components/ui/`
- Business sections (`/app/`, services, pricing) stay off until `business.enabled` in `src/data/site.ts` is set with real names and pricing.

## Deploy

- GitHub Actions workflow: `.github/workflows/deploy.yml`
- Custom domain: `public/CNAME`
