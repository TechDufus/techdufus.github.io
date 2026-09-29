# AGENTS.md

## Project
- Personal site for `techdufus.com`
- Static Astro build (no Jekyll runtime, no redirect layer)
- Deploy target: GitHub Pages via `.github/workflows/deploy.yml`

## Stack
- Astro + TypeScript
- Markdown/MDX content collections (MDX posts can import Astro components, e.g. drawings)
- Design system: Studio Midnight in `src/styles/global.css` (tokens, components, utilities; ported from the `design/pro-studio/` mockup, class names match it)
- Lamplight gold: static sheen with a warm glow (§17 of `global.css`); button and guide-coin sweeps play on hover/focus only; the home hero ambience lives in `src/components/ui/HeroAmbience.astro`; `src/scripts/site.ts` pauses ongoing gold motion off screen and in hidden tabs, reduced motion is static
- Drawing kit ("Drawn to spec"): gold-ink engineering drawings generated at build time from typed data. Components in `src/components/drawing/` (sheets in `rack/`, `server/`, `post/`), helpers in `src/lib/drawing/`, behaviour in `src/scripts/drawing.ts`, styles in `src/styles/drawing.css` (loaded only by pages that render a `Sheet`); API documented in the header comments of `drawing.css` and `projection.ts`
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
- Bundle budget check: `npm run check:perf` (after a build; per-page HTML/CSS/JS budgets for home, about, blog, docs, contact, lab, projects and the drawing pages: `/lab/rack/`, `/lab/r720xd/`, the R720xd post)
- Image privacy check: `npm run check:images` (fails if any tracked image has EXIF/XMP location data; strip with `exiftool -all= -overwrite_original <file>`)

## Content locations
- Blog posts: `src/content/blog/*.md` and `*.mdx`
- Setup docs: `src/content/docs/setup.md`
- Site-wide metadata/copy/nav: `src/data/site.ts`
  - `business`: `enabled` flag plus services, pricing, FAQ and legal data
  - `heroCopy` and `topics` (home hero and ticker)
  - `labSpec`: homelab spec rendered on `/lab/`
  - `featuredRepos`, `featuredProject` (YahwAI) and `earlierWork`: rendered on `/projects/` (repos and YahwAI also on the home Projects section)
- Hardware data: `src/data/hardware/` (`types.ts`, `rack.ts` for the cabinet and network, `r720xd.ts` for the server); every fact carries provenance (measured / vendor / owner / inferred / assumed) and the drawings render it
- Lab page: `src/pages/lab.astro`; drawing sheets: `src/pages/lab/rack.astro` (Sheet 01) and `src/pages/lab/r720xd.astro` (Sheet 02)
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
- Hardware data and drawings are public: never publish IP addresses, subnets, VLAN IDs, internal hostnames, MACs, serials or service tags, credentials or 1Password references, or management-controller firmware versions. Unknowns stay marked as unknown (assumed / "verify in field"), never invented.

## Definition of done for changes
- `npm run check` passes.
- `npm run build` passes.
- `npm run check:images` passes (runs in CI before the build).
- For UI/content-impacting work, verify key routes:
  - `/`
  - `/about`
  - `/blog`
  - `/blog/<slug>`
  - `/docs`
  - `/contact`
  - `/lab`
  - `/lab/rack`
  - `/lab/r720xd`
  - `/projects`
