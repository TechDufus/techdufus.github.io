/**
 * Drawing kit behaviour, bundled once per page by Sheet.astro; wires every figure[data-dwg] on
 * load (later ones: initDrawings(root)).
 *   tabs    [role=tab][data-view] ↔ [data-view-panel]: click, ←/→/Home/End; the shown panel
 *           gets data-active and re-plots quickly.
 *   layers  [data-layer-toggle] flips aria-pressed and data-off on [data-layer=<id>] in the figure.
 *   parts   [data-part]: click/Enter/Space toggles aria-pressed (one id per figure; same-id parts
 *           select together; Esc clears) and dispatches bubbling `dwg:select` {dwg, id, selected}.
 *           Balloons [data-balloon-for=<id>] get .is-hot with their part.
 *   plot    figure[data-plot] pending → run (≥ 15% on screen) → done; status bar PLOTTING… n%.
 *   motion  .is-idle off screen, html.dwg-paused in a hidden tab: particles pause. Reduced
 *           motion skips to the final state.
 *   cursor  fine pointers: X/Y mm from the hovered [data-mm], U from data-u0/-u1, zone from
 *           data-frame/-zones, title/scale from data-view-title/-scale.
 *   pan     .dwg__view.is-pannable when the SVG overflows (hint, focusable region), .is-panned.
 */

type Mat = number[];

const doc = document;
const U_MM = 44.45;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');
const mats = new WeakMap<Element, Mat | null>();
let io: IntersectionObserver | null = null;

const n1 = (v: number): string => (Math.abs(v) < 0.05 ? '0.0' : v.toFixed(1));
const cssMs = (el: Element, name: string, fallback: number): number =>
  parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;

/** Parse matrix(a,b,c,d,e,f) once and keep its inverse. */
function inverse(el: Element): Mat | null {
  if (mats.has(el)) return mats.get(el) ?? null;
  const m = (el.getAttribute('data-mm') ?? '').match(/-?[\d.]+(?:e-?\d+)?/g)?.map(Number);
  let inv: Mat | null = null;
  if (m && m.length === 6) {
    const [a, b, c, d, e, f] = m;
    const det = a * d - b * c;
    if (det) inv = [d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det];
  }
  mats.set(el, inv);
  return inv;
}

function init(fig: HTMLElement): void {
  if (fig.dataset.dwgReady !== undefined) return;
  fig.dataset.dwgReady = '';
  const svg = fig.querySelector<SVGSVGElement>('.dwg__svg');
  if (!svg) return;
  const q = <T extends Element>(sel: string): T[] => [...fig.querySelectorAll<T>(sel)];
  const cell = (k: string): HTMLElement | null => fig.querySelector(`[data-st="${k}"]`);
  const put = (k: string, text: string): void => {
    const el = cell(k);
    if (el && el.textContent !== text) el.textContent = text;
  };
  const status = fig.querySelector<HTMLElement>('.dwg-status');

  /* ---------- plot ---------- */
  let plotting = 0;
  const progress = (k: number): void => {
    put('pct', k < 1 ? `PLOTTING… ${Math.round(k * 100)}%` : 'PLOT COMPLETE · 100%');
    status?.style.setProperty('--plot', k.toFixed(3));
    status?.classList.toggle('is-plotting', k < 1);
  };
  const plot = (target: Element, ms: number): void => {
    if (reduce.matches) {
      target.setAttribute('data-plot', 'done');
      progress(1);
      return;
    }
    const box = svg.getBoundingClientRect();
    if (box.width) fig.style.setProperty('--dwg-u', (svg.viewBox.baseVal.width / box.width).toFixed(4));
    target.setAttribute('data-plot', 'run');
    const run = ++plotting;
    const t0 = performance.now();
    const tick = (now: number): void => {
      if (run !== plotting) return;
      const k = Math.min(1, (now - t0) / ms);
      progress(k);
      if (k < 1) requestAnimationFrame(tick);
      else target.setAttribute('data-plot', 'done');
    };
    requestAnimationFrame(tick);
  };
  if (reduce.matches) plot(fig, 0);
  else progress(0);

  /* ---------- tabs ---------- */
  const tabs = q<HTMLButtonElement>('[role="tab"][data-view]');
  const panelOf = (t: HTMLElement): SVGElement | null => fig.querySelector(`[data-view-panel="${t.dataset.view}"]`);
  let base: Element | null = null;
  let baseLabel = 'MODEL';
  const describe = (v: Element | null): void => {
    put('view', v?.getAttribute('data-view-title') || baseLabel);
    put('scale', v?.getAttribute('data-view-scale') || 'SCALE AS NOTED');
  };
  const show = (tab: HTMLButtonElement, focus: boolean): void => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panelOf(t)?.toggleAttribute('data-active', on);
    }
    if (focus) tab.focus();
    base = panelOf(tab);
    baseLabel = (tab.textContent ?? '').trim().toUpperCase();
    describe(base);
    const p = base;
    if (p && fig.dataset.plot === 'done') plot(p, cssMs(fig, '--dwg-replot-ms', 1200));
  };
  for (const t of tabs) {
    t.addEventListener('click', () => t.getAttribute('aria-selected') !== 'true' && show(t, false));
    t.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(t);
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
      if (to === undefined) return;
      e.preventDefault();
      show(tabs[(to + tabs.length) % tabs.length], true);
    });
  }
  const first = tabs.find((t) => t.getAttribute('aria-selected') === 'true');
  if (first) baseLabel = (first.textContent ?? '').trim().toUpperCase();
  base = fig.querySelector('[data-view-panel][data-active]') ?? fig.querySelector('[data-view-title]');
  describe(base);

  /* ---------- layers ---------- */
  for (const b of q<HTMLButtonElement>('[data-layer-toggle]')) {
    const apply = (): void => {
      const on = b.getAttribute('aria-pressed') !== 'false';
      for (const el of q(`[data-layer="${b.dataset.layerToggle}"]`)) el.toggleAttribute('data-off', !on);
    };
    apply();
    b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') === 'false'));
      apply();
    });
  }

  /* ---------- parts ---------- */
  // Parts sharing an id (the same box in several views) select together. A selected part with a
  // rail is drawn last in its group while it is out, so the slid box sits on top in iso views.
  let selected: string | null = null;
  const home = new Map<Element, Node | null>();
  const same = (id: string): Element[] => q(`[data-part="${id}"]`);
  const hot = (id: string, on: boolean): void => {
    for (const b of q(`[data-balloon-for="${id}"]`)) b.classList.toggle('is-hot', on);
  };
  const lift = (p: Element, on: boolean): void => {
    const g = p.parentNode;
    if (!g || !(p as SVGElement).style?.getPropertyValue('--rail')) return;
    const f = doc.activeElement === p;
    if (on && !home.has(p)) {
      home.set(p, p.nextSibling);
      g.appendChild(p);
    } else if (!on && home.has(p)) {
      const n = home.get(p) ?? null;
      home.delete(p);
      setTimeout(() => p.getAttribute('aria-pressed') !== 'true' && g.insertBefore(p, n?.parentNode === g ? n : null), reduce.matches ? 0 : 820);
    }
    if (f) (p as SVGElement).focus({ preventScroll: true });
  };
  const set = (id: string, on: boolean): void => {
    for (const p of same(id)) {
      p.setAttribute('aria-pressed', String(on));
      lift(p, on);
    }
    hot(id, on);
  };
  const toggle = (part: Element): void => {
    const id = part.getAttribute('data-part') ?? '';
    const on = selected !== id;
    if (on && selected) set(selected, false);
    set(id, on);
    selected = on ? id : null;
    part.dispatchEvent(new CustomEvent('dwg:select', { bubbles: true, detail: { dwg: fig.dataset.dwg, id, selected: on } }));
  };
  const partOf = (e: Event): Element | null => (e.target as Element | null)?.closest?.('[data-part]') ?? null;
  fig.addEventListener('click', (e) => {
    const part = partOf(e);
    if (part) toggle(part);
  });
  fig.addEventListener('keydown', (e) => {
    const part = partOf(e);
    if (part && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle(part);
    } else if (e.key === 'Escape' && selected) toggle(same(selected)[0] ?? fig);
  });
  const hover = (on: boolean) => (e: Event): void => {
    const id = partOf(e)?.getAttribute('data-part');
    if (id && id !== selected) hot(id, on);
  };
  fig.addEventListener('pointerover', hover(true));
  fig.addEventListener('pointerout', hover(false));
  fig.addEventListener('focusin', hover(true));
  fig.addEventListener('focusout', hover(false));

  /* ---------- cursor readout ---------- */
  const frame = fig.dataset.frame?.split(',').map(Number);
  const zones = fig.dataset.zones?.split(',').map(Number);
  let pending: PointerEvent | null = null;
  const blank = (): void => {
    put('xy', 'X ——— Y ———');
    put('u', 'U ——');
  };
  const read = (): void => {
    const e = pending;
    pending = null;
    const ctm = svg.getScreenCTM();
    if (!e || !ctm) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    let zone = '——';
    if (frame && zones) {
      const cx = Math.floor(((p.x - frame[0]) / frame[2]) * zones[0]);
      const cy = Math.floor(((p.y - frame[1]) / frame[3]) * zones[1]);
      if (cx >= 0 && cy >= 0 && cx < zones[0] && cy < zones[1]) zone = String.fromCharCode(65 + cy) + (cx + 1);
    }
    put('zone', `ZONE ${zone}`);
    const t = e.target as Element;
    describe(t.closest?.('[data-view-title]') ?? base);
    const host = t.closest?.('[data-mm]');
    const m = host ? inverse(host) : null;
    if (!host || !m) return blank();
    const x = m[0] * p.x + m[2] * p.y + m[4];
    const y = m[1] * p.x + m[3] * p.y + m[5];
    put('xy', `X ${n1(x)}  Y ${n1(y)} mm`);
    const u0 = host.getAttribute('data-u0');
    put('u', u0 === null ? 'U ——' : `U ${((y - Number(u0)) / U_MM + Number(host.getAttribute('data-u1') ?? 1)).toFixed(2)}`);
  };
  if (!coarse.matches && status) {
    svg.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'touch') return;
      if (!pending) requestAnimationFrame(read);
      pending = e;
    });
    svg.addEventListener('pointerleave', () => {
      pending = null;
      blank();
      put('zone', 'ZONE ——');
      describe(base);
    });
  }

  /* ---------- pan ---------- */
  const view = fig.querySelector<HTMLElement>('.dwg__view');
  const pan = fig.querySelector<HTMLElement>('.dwg__pan');
  if (view && pan) {
    const measure = (): void => {
      const on = pan.scrollWidth > pan.clientWidth + 2;
      view.classList.toggle('is-pannable', on);
      if (on) {
        pan.tabIndex = 0;
        pan.setAttribute('role', 'region');
        pan.setAttribute('aria-label', 'Drawing (scrolls sideways)');
      } else {
        pan.removeAttribute('tabindex');
        pan.removeAttribute('role');
        pan.removeAttribute('aria-label');
      }
    };
    measure();
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(pan);
    pan.addEventListener('scroll', () => view.classList.add('is-panned'), { once: true, passive: true });
  }

  /* ---------- visibility ---------- */
  fig.addEventListener('dwg:plot', () => plot(fig, cssMs(fig, '--dwg-plot-ms', 2400)), { once: true });
  if (io) io.observe(fig);
  else if (fig.dataset.plot === 'pending') fig.dispatchEvent(new Event('dwg:plot'));
}

/** Wire every figure[data-dwg] under `root` (idempotent). */
export function initDrawings(root: ParentNode = doc): void {
  if (!io && 'IntersectionObserver' in window) {
    io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          const fig = en.target as HTMLElement;
          fig.classList.toggle('is-idle', !en.isIntersecting);
          if (en.isIntersecting && fig.dataset.plot === 'pending') fig.dispatchEvent(new Event('dwg:plot'));
        }
      },
      { threshold: 0.15 },
    );
  }
  for (const fig of root.querySelectorAll<HTMLElement>('figure[data-dwg]')) init(fig);
}

doc.addEventListener('visibilitychange', () => doc.documentElement.classList.toggle('dwg-paused', doc.hidden));
initDrawings();
