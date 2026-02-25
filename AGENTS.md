# AGENTS.md

## Project
- Personal site for `techdufus.com`
- Static Astro build (no Jekyll runtime, no redirect layer)
- Deploy target: GitHub Pages via `.github/workflows/deploy.yml`

## Stack
- Astro + TypeScript
- Tailwind CSS
- Markdown content collections
- No React runtime (`react` and `@astrojs/react` are not installed)
- No shadcn/ui runtime components (only `components.json` metadata remains)

## Local workflow
- Install: `npm install`
- Dev server: `npm run dev`
- Type/content checks: `npm run check`
- Production build: `npm run build`
- Bundle budget check: `npm run check:perf`

## Content locations
- Blog posts: `src/content/blog/*.md`
- Setup docs: `src/content/docs/setup.md`
- Career docs: `src/content/docs/career.md`
- Site-wide metadata/copy/nav: `src/data/site.ts`
- Global layout + metadata tags: `src/layouts/BaseLayout.astro`
- Public icons/manifest: `public/*`

## Guardrails
- Keep the site static-first and GitHub Pages compatible.
- Do not reintroduce legacy Jekyll layouts/includes/collections.
- Do not add redirect scaffolding unless explicitly requested.
- Preserve writing tone and content voice already established in `src/data/site.ts` and markdown content.

## Definition of done for changes
- `npm run check` passes.
- `npm run build` passes.
- For UI/content-impacting work, verify key routes:
  - `/`
  - `/about`
  - `/blog`
  - `/docs`
  - `/contact`
