/**
 * Site chrome behaviour, ported from design/pro-studio/shared.js (Studio · Midnight).
 *
 *   nav      .nav gets .is-scrolled past 8px; mobile .sheet opens from .nav__menu (focus trap,
 *            Esc, scrim/link close, focus restore); on the homepage, nav links with
 *            data-section="…" get .is-active while that section is in view.
 *   reveal   [data-reveal] fades/rises in once when scrolled into view (stagger: style="--d:N").
 *   copy     [data-copy="text"] copies text; an empty value inside a .code-block copies its <pre>.
 *            A [data-copy-label] child flips to "Copied" for 1.6s.
 *   gold     living gold (global.css §17): on-screen foil gets .gold-live plus a staggered
 *            --glint-delay; headline words tilt toward a fine pointer; a hidden tab sets
 *            html.gold-paused.
 *   marquee  .marquee__track pauses while off screen or while the tab is hidden.
 *
 * Reduced motion: reveal shows everything at once and the tilt is off (CSS stops the rest).
 * Content rendered after load can be wired with `enhance(root)`, exported below.
 */

const doc = document;
const root = doc.documentElement;
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const reducedMotion = (): boolean => motionQuery.matches;
const hasIO = 'IntersectionObserver' in window;

/* ---------- live region ---------- */
let liveEl: HTMLElement | null = null;
function announce(message: string): void {
  if (!liveEl) {
    liveEl = doc.createElement('div');
    liveEl.className = 'sr-only';
    liveEl.setAttribute('aria-live', 'polite');
    liveEl.setAttribute('aria-atomic', 'true');
    doc.body.appendChild(liveEl);
  }
  const el = liveEl;
  el.textContent = '';
  window.setTimeout(() => {
    el.textContent = message;
  }, 60);
}

/* ---------- focus trap ---------- */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapTab(event: KeyboardEvent, container: HTMLElement): void {
  const items = [...container.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length > 0);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = doc.activeElement;
  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

/* ---------- nav ---------- */
function initNav(): void {
  const host = doc.querySelector<HTMLElement>('[data-site-nav]');
  const nav = host?.querySelector<HTMLElement>('.nav');
  if (!host || !nav) return;

  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // mobile sheet
  const sheet = host.querySelector<HTMLElement>('.sheet');
  const panel = sheet?.querySelector<HTMLElement>('.sheet__panel');
  const menuButton = host.querySelector<HTMLButtonElement>('.nav__menu');
  if (sheet && panel && menuButton) {
    let lastFocus: HTMLElement | null = null;
    let closeTimer = 0;

    const open = () => {
      window.clearTimeout(closeTimer);
      lastFocus = doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
      sheet.classList.add('is-open');
      menuButton.setAttribute('aria-expanded', 'true');
      doc.body.style.overflow = 'hidden';
      requestAnimationFrame(() => requestAnimationFrame(() => sheet.classList.add('is-shown')));
      window.setTimeout(() => sheet.querySelector<HTMLElement>('.sheet__links a')?.focus(), 30);
    };
    const close = (restoreFocus = true) => {
      if (!sheet.classList.contains('is-open')) return;
      sheet.classList.remove('is-shown');
      menuButton.setAttribute('aria-expanded', 'false');
      doc.body.style.overflow = '';
      closeTimer = window.setTimeout(() => sheet.classList.remove('is-open'), reducedMotion() ? 0 : 260);
      if (restoreFocus && lastFocus) lastFocus.focus();
    };

    menuButton.addEventListener('click', open);
    sheet.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      // Following a link navigates away (or to an anchor): don't pull focus back to the menu button.
      if (target?.closest('[data-sheet-close]')) close(!target.closest('a'));
    });
    sheet.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'Tab') trapTab(event, panel);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) close(false);
    });
  }

  // homepage scroll-spy: highlight the nav item for the section in view
  if (location.pathname === '/' && hasIO) {
    const map = new Map<Element, HTMLElement>();
    host.querySelectorAll<HTMLElement>('.nav__link[data-section]').forEach((link) => {
      const section = doc.getElementById(link.dataset.section ?? '');
      if (section) map.set(section, link);
    });
    if (map.size) {
      const io = new IntersectionObserver(
        (entries) => entries.forEach((en) => map.get(en.target)?.classList.toggle('is-active', en.isIntersecting)),
        { rootMargin: '-45% 0px -50% 0px' }
      );
      map.forEach((_, section) => io.observe(section));
    }
  }
}

/* ---------- reveal ---------- */
let revealIO: IntersectionObserver | null = null;
function initReveal(scope: ParentNode): void {
  const els = scope.querySelectorAll<HTMLElement>('[data-reveal]:not(.is-in)');
  if (!hasIO || reducedMotion()) {
    els.forEach((el) => el.classList.add('is-in'));
    return;
  }
  revealIO ??= new IntersectionObserver(
    (entries) =>
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        revealIO?.unobserve(en.target);
      }),
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
  );
  els.forEach((el) => revealIO?.observe(el));
}

/* ---------- copy ---------- */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = doc.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    doc.body.appendChild(ta);
    ta.select();
    const ok = doc.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

const copyTimers = new WeakMap<HTMLElement, number>();
function initCopy(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>('[data-copy]:not([data-copy-wired])').forEach((btn) => {
    btn.setAttribute('data-copy-wired', '');
    const label = btn.querySelector<HTMLElement>('[data-copy-label]');
    const restingLabel = label?.textContent ?? null;
    btn.addEventListener('click', async (event) => {
      event.preventDefault();
      let text = btn.getAttribute('data-copy') ?? '';
      if (!text) text = btn.closest('.code-block')?.querySelector('pre')?.innerText ?? '';
      const ok = await copyText(text);
      btn.classList.add('is-copied');
      if (label) label.textContent = ok ? 'Copied' : 'Press ⌘C';
      announce(ok ? 'Copied to clipboard' : 'Copy failed');
      window.clearTimeout(copyTimers.get(btn));
      copyTimers.set(
        btn,
        window.setTimeout(() => {
          btn.classList.remove('is-copied');
          if (label) label.textContent = restingLabel;
        }, 1600)
      );
    });
  });
}

/* ---------- living gold (global.css §17) ---------- */
const GOLD_LIVE = ':is(.display, .h1, .h2, .h3) em, .foil, .stat__value .accent, .btn--primary, .chat-launcher__icon, .r-glint';
const GOLD_TILT = ':is(.display, .h1) em, .post-title .foil';
const GOLD_PERIOD = 8.4; // s, keep in step with the gold-glint animation
const goldSeen = new WeakSet<Element>();
const goldTilt: HTMLElement[] = [];
let goldIO: IntersectionObserver | null = null;
let goldCount = 0;

function initGoldTilt(): void {
  let x = 0;
  let raf = 0;
  const frame = () => {
    raf = 0;
    if (reducedMotion()) return;
    const live = goldTilt.filter((el) => el.classList.contains('gold-live'));
    const rects = live.map((el) => el.getBoundingClientRect()); // read all, then write
    live.forEach((el, i) => {
      const center = rects[i].left + rects[i].width / 2;
      const dx = Math.max(-1, Math.min(1, (x - center) / (window.innerWidth / 2)));
      el.style.setProperty('--foil-angle', `${(105 + dx * 24).toFixed(1)}deg`);
    });
  };
  doc.addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return;
      x = event.clientX;
      if (!raf) raf = requestAnimationFrame(frame);
    },
    { passive: true }
  );
}

function initGold(scope: ParentNode): void {
  // Without @property or IntersectionObserver the foil stays static.
  if (!(window.CSS && 'registerProperty' in CSS) || !hasIO) return;
  if (!goldIO) {
    goldIO = new IntersectionObserver((entries) =>
      entries.forEach((en) => en.target.classList.toggle('gold-live', en.isIntersecting))
    );
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) initGoldTilt();
  }
  scope.querySelectorAll<HTMLElement | SVGElement>(GOLD_LIVE).forEach((el) => {
    if (goldSeen.has(el)) return;
    goldSeen.add(el);
    // Phases step 3.1s through the 8.4s cycle, so foil on screen together never glints together.
    el.style.setProperty('--glint-delay', `${-((goldCount++ * 3.1) % GOLD_PERIOD).toFixed(2)}s`);
    if (el instanceof HTMLElement && el.matches(GOLD_TILT)) goldTilt.push(el);
    goldIO?.observe(el);
  });
}

/* ---------- marquee ---------- */
const marqueeTracks = new Set<HTMLElement>();
const marqueeOffscreen = new WeakSet<HTMLElement>();
let marqueeIO: IntersectionObserver | null = null;

function syncMarquee(track: HTMLElement): void {
  // '' hands control back to CSS (which also pauses on hover).
  track.style.animationPlayState = doc.hidden || marqueeOffscreen.has(track) ? 'paused' : '';
}

function initMarquee(scope: ParentNode): void {
  scope.querySelectorAll<HTMLElement>('.marquee__track').forEach((track) => {
    if (marqueeTracks.has(track)) return;
    marqueeTracks.add(track);
    if (hasIO) {
      marqueeIO ??= new IntersectionObserver((entries) =>
        entries.forEach((en) => {
          const t = en.target as HTMLElement;
          if (en.isIntersecting) marqueeOffscreen.delete(t);
          else marqueeOffscreen.add(t);
          syncMarquee(t);
        })
      );
      marqueeIO.observe(track);
    }
    syncMarquee(track);
  });
}

/* ---------- tab visibility: pause gold and marquees while hidden ---------- */
function onVisibility(): void {
  root.classList.toggle('gold-paused', doc.hidden);
  marqueeTracks.forEach(syncMarquee);
}

/* ---------- enhance ---------- */
/** Wires reveal, copy, living gold and marquees inside `scope` (safe to call repeatedly). */
export function enhance(scope: ParentNode = doc): void {
  initReveal(scope);
  initCopy(scope);
  initGold(scope);
  initMarquee(scope);
}

/* ---------- boot ---------- */
initNav();
doc.addEventListener('visibilitychange', onVisibility);
onVisibility();
enhance(doc);
