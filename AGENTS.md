# AGENTS.md

## Project
- Personal site for `techdufus.com`
- Static Astro build (no Jekyll runtime, no redirect layer)
- Deploy target: GitHub Pages via `.github/workflows/deploy.yml`

## Stack
- Astro + TypeScript
- Markdown content collections
- Design system: Studio Midnight in `src/styles/global.css` (tokens, components, utilities; ported from the `design/pro-studio/` mockup, class names match it)
- Living gold: foil gradients with a travelling glint (§17 of `global.css`); motion classes are toggled by `src/scripts/site.ts`, reduced motion falls back to static foil
- UI components: `src/components/ui/` (Astro only; shared SVG symbols in `SvgDefs.astro`)
- Site guide: `src/components/SiteGuide.astro` launcher, `src/scripts/guide.ts` dock, answers loaded lazily from `/guide.json` (`src/pages/guide.json.ts`)
- Tailwind CSS only as a utility layer (`@tailwind base` + `utilities`, preflight off); page styling lives in `global.css`
- No React runtime (`react` and `@astrojs/react` are not installed)
- No shadcn/ui runtime components (only `components.json` metadata remains; do not run `shadcn add`)

## Local workflow
- Install: `npm install`
- Dev server: `npm run dev`
- Type/content checks: `npm run check`
- Production build: `npm run build`
- Bundle budget check: `npm run check:perf` (after a build; JS/CSS/HTML budgets across home, about, blog, docs, contact, lab, projects)

## Content locations
- Blog posts: `src/content/blog/*.md`
- Setup docs: `src/content/docs/setup.md`
- Site-wide metadata/copy/nav: `src/data/site.ts`
  - `business`: `enabled` flag plus services, pricing, FAQ and legal data
  - `heroCopy` and `topics` (home hero and ticker)
  - `labSpec`: homelab spec rendered on `/lab/`
  - `featuredRepos`, `featuredProject` (YahwAI) and `earlierWork`: rendered on `/projects/` (repos and YahwAI also on the home Projects section)
- Lab page: `src/pages/lab.astro`
- Projects page: `src/pages/projects.astro`
- Global layout + metadata tags: `src/layouts/BaseLayout.astro`
- Public icons/manifest: `public/*`

## Guardrails
- Keep the site static-first and GitHub Pages compatible.
- Do not reintroduce legacy Jekyll layouts/includes/collections.
- Do not add redirect scaffolding unless explicitly requested.
- Preserve writing tone and content voice already established in `src/data/site.ts` and markdown content.
- `business.enabled` (`src/data/site.ts`) gates `/app/`, the services and pricing sections, and every placeholder (`[Bracketed]` / `$—` copy, Draft chips). It must stay `false` until real names and pricing exist.
- The site guide is scripted (prewritten answers plus a transparent keyword match over posts, not a live AI) and must stay labelled as such.
- No fake forms: contact and waitlist go through real links (email, socials). Never add a form that pretends to submit or collect data; the only forms are client-side (blog filters, guide input).

## Definition of done for changes
- `npm run check` passes.
- `npm run build` passes.
- For UI/content-impacting work, verify key routes:
  - `/`
  - `/about`
  - `/blog`
  - `/blog/<slug>`
  - `/docs`
  - `/contact`
  - `/lab`
  - `/projects`
