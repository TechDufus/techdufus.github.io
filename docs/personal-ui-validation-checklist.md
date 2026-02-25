# Personal-Touch UI Redesign Validation Checklist

Scope: redesign work that adds profile image, quote, intro sections, and richer layout on Astro pages (likely `/about` and possibly `/`).

Primary files to watch during review:

- `src/pages/about.astro`
- `src/pages/index.astro`
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`
- `src/data/site.ts`

## 1) Accessibility Checklist

### Semantics and structure

- [ ] Exactly one `<h1>` per page and heading levels do not skip (`h1 -> h2 -> h3`).
- [ ] Intro text is plain paragraph content, not styled heading text masquerading as body copy.
- [ ] Quote content uses semantic markup (`<blockquote>` and `<cite>` when attribution exists).
- [ ] Profile image and its caption/role are grouped semantically (`<figure>/<figcaption>` if captioned).
- [ ] Landmark structure remains clear: `<header>`, `<main>`, `<footer>` unchanged and valid.

### Image accessibility

- [ ] Profile image has meaningful `alt` text (not "profile image" or filename).
- [ ] Decorative images use empty alt (`alt=""`) and are not announced by screen readers.
- [ ] No critical quote or intro text is embedded in image assets.

### Keyboard and focus behavior

- [ ] All new interactive UI (cards, CTAs, toggles) is keyboard reachable in logical order.
- [ ] Focus indicators remain visible against dark backgrounds (`bg-canvas`, `bg-panel`).
- [ ] Hover-only affordances have keyboard equivalents (focus style and actionable target).
- [ ] No keyboard trap is introduced in popovers/details/animated sections.

### Color and readability

- [ ] Text contrast meets WCAG AA: normal text >= 4.5:1, large text >= 3:1.
- [ ] Muted text (`text-muted`) remains readable when layered on gradients or translucent panels.
- [ ] Quote styling does not rely only on color to communicate emphasis or hierarchy.
- [ ] Body copy line length remains readable (target about 45-90 characters per line on desktop).

### Motion and reduced motion

- [ ] New animations/transitions (intro reveal, profile glow, status pulse) are disabled or simplified under `prefers-reduced-motion: reduce`.
- [ ] No motion triggers vestibular risk (large parallax, continuous pulsing, aggressive zoom).
- [ ] Animation is not required to understand content or reveal essential information.

### Screen-reader spot checks

- [ ] VoiceOver/NVDA reads hero region in expected order (name -> intro -> quote -> actions).
- [ ] Link names are unique and descriptive (avoid multiple generic "Read more" links).
- [ ] External links still announce behavior where relevant (new tab text remains clear).

## 2) Performance Checklist

### Asset strategy

- [ ] Profile image is optimized (AVIF/WebP preferred) and not served as a large original JPEG/PNG.
- [ ] `width` and `height` are set for all new images to avoid CLS.
- [ ] Only above-the-fold media is eager; below-the-fold media is lazy loaded.
- [ ] No duplicate copies of the same new asset are added under both `img/` and `public/img/` unless required by pipeline.

### Rendering and runtime

- [ ] New quote/intro sections are static HTML/CSS unless interactivity is required.
- [ ] No new hydrated island is added for purely presentational behavior.
- [ ] CSS additions avoid expensive effects on large surfaces (heavy blur, huge box-shadow, fixed background repaint costs).
- [ ] Google font usage does not increase render-blocking behavior beyond current baseline.

### Budget and metric gates

- [ ] Mobile Lighthouse Performance score >= 85 on `/about` and `/`.
- [ ] Mobile Lighthouse Accessibility score >= 95 on `/about` and `/`.
- Core Web Vitals target on mobile emulation:
- [ ] LCP <= 2.5s
- [ ] CLS <= 0.10
- [ ] INP <= 200ms
- [ ] Added initial page weight from redesign (HTML + CSS + JS + critical images) stays under 300 KB compressed budget.
- [ ] Client JS main bundle does not exceed current baseline by more than 20 KB unless justified.

## 3) Responsive Behavior Checklist

Test viewports:

- [ ] 320x568 (small phone)
- [ ] 390x844 (modern phone)
- [ ] 768x1024 (tablet portrait)
- [ ] 1024x768 (tablet landscape / small laptop)
- [ ] 1280x800 (desktop)

Checks per viewport:

- [ ] No horizontal scrolling at any breakpoint.
- [ ] Profile image scales without cropping critical facial area.
- [ ] Quote block wraps naturally and does not overflow panel bounds.
- [ ] Intro cards stack and reorder logically (content order stays meaningful for DOM and screen readers).
- [ ] Sticky header and nav do not overlap new hero content.
- [ ] Tap targets are comfortable on touch (target approximately 44x44 px minimum).
- [ ] Layout remains usable at 200% browser zoom and with increased text size.
- [ ] Long strings (social handles, role labels, quote attribution) do not break layout.

## 4) Regression and QA Commands

Run before merge:

```bash
npm run check
npm run build
```

Manual performance/a11y pass (local):

```bash
# terminal 1
npm run dev -- --host

# terminal 2
npx lighthouse http://127.0.0.1:4321/about --only-categories=performance,accessibility --preset=desktop
npx lighthouse http://127.0.0.1:4321/about --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile=true
npx lighthouse http://127.0.0.1:4321/ --only-categories=performance,accessibility --form-factor=mobile --screenEmulation.mobile=true
npx @axe-core/cli http://127.0.0.1:4321/about
npx @axe-core/cli http://127.0.0.1:4321/
```

Responsive spot-check (browser devtools):

- [ ] About page (`/about`)
- [ ] Home page (`/`)
- [ ] Contact page (`/contact`) to confirm shared card styles did not regress

## 5) Known Risk Hotspots For This Repo

- [ ] `src/styles/global.css` is global; verify new styles do not accidentally change blog/docs prose (`.doc-prose`) or nav links.
- [ ] Existing dark-only palette (`canvas/panel/muted/signal`) can hide low-contrast text in new translucent cards; verify contrast after every palette tweak.
- [ ] Legacy content migration script copies assets into `public/`; avoid introducing oversized personal images that silently bloat `dist/`.
- [ ] Current nav uses `details/summary`; ensure new hero sections do not interfere with focus or z-index around the sticky header.
