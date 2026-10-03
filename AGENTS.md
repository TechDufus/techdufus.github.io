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
- Drawing kit ("Drawn to spec"): gold-ink engineering drawings generated at build time from typed data. Start with `src/components/drawing/README.md`. Two tiers: full sheets (`Sheet` + views; sheet components in `rack/`, `r730/`, `stack/`, plus `r720xd/`, the frozen archive of the old R720xd sheet) and post-sized figures (`src/components/drawing/figure/`: Flow, Stack, Compare, Lanes, Bars on a `Figure` wrapper that lays itself out for desktop and phone; post-specific ones in `post/`). Clickable parts are numbered and open a card (`PartCard` + `template[data-card]`). Helpers in `src/lib/drawing/`, behaviour in `src/scripts/drawing.ts`, styles in `src/styles/drawing.css` and `src/styles/figure.css` (loaded only where a drawing renders)
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
- Bundle budget check: `npm run check:perf` (after a build; per-page HTML/CSS/JS budgets for home, about, blog, docs, contact, lab, projects, the drawing pages `/lab/rack/`, `/lab/r730/`, `/lab/r720xd/`, `/lab/stack/` and the R720xd post, and the lazily fetched sheet views `/lab/rack/views/`, `/lab/r730/views/`, `/lab/r720xd/views/`)
- Image privacy check: `npm run check:images` (fails if any tracked image has EXIF/XMP location data; strip with `exiftool -all= -overwrite_original <file>`)

## Content locations
- Blog posts: `src/content/blog/*.md` and `*.mdx`
- Setup docs: `src/content/docs/setup.md`
- Site-wide metadata/copy/nav: `src/data/site.ts`
  - `business`: `enabled` flag plus services, pricing, FAQ and legal data
  - `heroCopy` and `topics` (home hero and ticker)
  - `labSpec`: homelab spec rendered on `/lab/`
  - `featuredRepos`, `featuredProject` (YahwAI) and `earlierWork`: rendered on `/projects/` (repos and YahwAI also on the home Projects section)
- Lab data: `src/data/lab/` (`types.ts`; `rack.ts` for the cabinet, its devices and network links; `server.ts` for the R730 as built; `stack.ts` for the software layers; `snapshots/` for the R720xd as built on 2026-09-28, frozen with its own types: the R720xd post and the archived `/lab/r720xd/` sheet read only this, never edit it). Plain values; every clickable thing carries a `card`. Stack items are `running` or `planned` (planned draws as dashed phantom lines): flip the status as the homelab rebuild lands, and every drawing, the home lab section and the site guide follow
- Syncing the lab with the homelab repo (`../homelab`): follow `.omp/skills/lab-sync/SKILL.md` (source map, status rules, drawing limits, privacy scan); the last synced homelab commit is the marker on line 1 of `src/data/lab/stack.ts`
- Lab page: `src/pages/lab.astro` (the cabinet and stack excerpts, the sheet index, changelog, desk); drawing sheets: `src/pages/lab/rack.astro` (Sheet 01), `src/pages/lab/r730.astro` (Sheet 02, the R730), `src/pages/lab/stack.astro` (Sheet 03), with heavy secondary views pre-rendered as partials in `src/pages/lab/*/views.astro` (Sheet 02's is `src/pages/lab/r730/views.astro`). `src/pages/lab/r720xd.astro` is the frozen archive of the R720xd sheet (stamped SUPERSEDED, off the `/lab/` index, reachable from the post, the changelog and Sheet 02) on `src/data/lab/snapshots/`; don't change it
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
- Lab data and drawings are public: never publish IP addresses, subnets, VLAN IDs, VIPs, VM IDs, internal hostnames, MACs, serials or WWNs, bucket names, credentials or 1Password references, firmware versions, or security design (secrets flow, agent autonomy levels). Leave facts off rather than invent them; no citation or provenance clutter on the drawings.

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
  - `/lab/r730`
  - `/lab/r720xd`
  - `/lab/stack`
  - `/projects`
