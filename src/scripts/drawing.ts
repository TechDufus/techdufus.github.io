/**
 * Drawing kit behaviour (tabs, parts, cards, plot, motion, pan), bundled once by Sheet.astro.
 * Wires every figure[data-dwg] on load; later ones: initDrawings(root). The hooks and the card
 * contract are in src/components/drawing/README.md.
 */

type Open = { fig: HTMLElement; part: HTMLElement; off: () => void; ret: HTMLElement };

const doc = document;
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const coarse = matchMedia('(pointer: coarse)');
let io: IntersectionObserver | null = null;

const cssMs = (el: Element, name: string, fallback: number): number =>
  parseFloat(getComputedStyle(el).getPropertyValue(name)) || fallback;
const clamp = (v: number, lo: number, hi: number): number => Math.max(lo, Math.min(v, Math.max(lo, hi)));
const shown = (el: Element): boolean => el.getBoundingClientRect().width > 0;

/* ---------- the part card (one per page) ---------- */
let card: HTMLElement | null = null;
let body: HTMLElement;
let open: Open | null = null;
let hideT = 0;

function cardEl(): HTMLElement {
  if (card) return card;
  const c = (card = doc.createElement('div'));
  c.className = 'dwg-card';
  c.id = 'dwg-card';
  c.setAttribute('role', 'dialog');
  c.tabIndex = -1;
  c.hidden = true;
  c.innerHTML =
    '<button type="button" class="dwg-card__x" aria-label="Close"><svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 2l8 8M10 2 2 10"/></svg></button><div class="dwg-card__b"></div>';
  body = c.lastElementChild as HTMLElement;
  c.firstElementChild?.addEventListener('click', () => closeCard(true));
  c.addEventListener('keydown', (e) => {
    const f = [...c.querySelectorAll<HTMLElement>('a[href],button')];
    const a = doc.activeElement;
    if (e.key === 'Escape' || (e.key === 'Tab' && (e.shiftKey ? a === c || a === f[0] : a === f[f.length - 1]))) {
      e.preventDefault();
      closeCard(true);
    }
  });
  doc.addEventListener('click', (e) => {
    const t = e.target as Element;
    if (open && !c.contains(t) && !t.closest?.('[data-part],[data-balloon-for]')) closeCard(doc.activeElement === doc.body);
  });
  addEventListener('resize', place);
  doc.body.append(c);
  return c;
}

/** Popover beside the part (right, left, below, above: first that fits), or the bottom sheet. */
function place(): void {
  if (!open || !card) return;
  const c = card;
  const sheet = coarse.matches || innerWidth <= 640;
  c.classList.toggle('is-sheet', sheet);
  const r = open.part.getBoundingClientRect();
  if (sheet) {
    c.style.left = c.style.top = '';
    const d = Math.min(r.bottom - (innerHeight - c.offsetHeight - 16), r.top - 80);
    if (d > 0) scrollBy({ top: d, behavior: reduce.matches ? 'auto' : 'smooth' });
    return;
  }
  const vw = doc.documentElement.clientWidth, vh = innerHeight, g = 16, m = 12;
  const L = Math.max(r.left, 0), R = Math.min(r.right, vw), T = Math.max(r.top, 0), B = Math.min(r.bottom, vh);
  const w = c.offsetWidth, h = c.offsetHeight;
  let x: number, y: number, side: string;
  if (R + g + w <= vw - m) (x = R + g), (side = 'r');
  else if (L - g - w >= m) (x = L - g - w), (side = 'l');
  else (x = clamp((L + R - w) / 2, m, vw - w - m)), (side = B + g + h <= vh - m ? 'b' : 't');
  if (side === 'r' || side === 'l') y = clamp((T + B - h) / 2, m, vh - h - m);
  else y = side === 'b' ? B + g : Math.max(m, T - g - h);
  c.dataset.side = side;
  c.style.left = `${x + scrollX}px`;
  c.style.top = `${y + scrollY}px`;
  c.style.setProperty('--a', `${side === 'r' || side === 'l' ? clamp((T + B) / 2 - y, 14, h - 14) : clamp((L + R) / 2 - x, 14, w - 14)}px`);
}

function showCard(fig: HTMLElement, part: HTMLElement, id: string, off: () => void, ret: HTMLElement): void {
  const sel = `template[data-card="${id}"]`;
  const tpl = (fig.querySelector(sel) ?? doc.querySelector(sel)) as HTMLTemplateElement | null;
  if (!tpl) return;
  const c = cardEl();
  clearTimeout(hideT);
  body.replaceChildren(tpl.content.cloneNode(true));
  const n = fig.querySelector(`[data-balloon-for="${id}"] .balloon__n`)?.textContent;
  if (n) body.prepend(Object.assign(doc.createElement('b'), { className: 'dwg-card__n', textContent: n }));
  const t = body.querySelector('.dwg-card__t');
  c.setAttribute('aria-label', part.getAttribute('aria-label') ?? id);
  if (t) c.setAttribute('aria-labelledby', (t.id = 'dwg-card-t'));
  else c.removeAttribute('aria-labelledby');
  open = { fig, part, off, ret };
  c.hidden = false;
  c.classList.remove('is-open');
  place();
  part.addEventListener('transitionend', place, { once: true });
  requestAnimationFrame(() => c.classList.add('is-open'));
  c.focus({ preventScroll: true });
}

function closeCard(focus: boolean): void {
  const o = open;
  if (!o || !card) return;
  const c = card;
  open = null;
  c.classList.remove('is-open');
  hideT = window.setTimeout(() => (c.hidden = true), reduce.matches ? 0 : 200);
  o.off();
  if (focus) o.ret.focus({ preventScroll: true });
}

function init(fig: HTMLElement): void {
  if (fig.dataset.dwgReady !== undefined) return;
  fig.dataset.dwgReady = '';
  const svg = fig.querySelector<SVGSVGElement>('.dwg__svg');
  if (!svg) return;
  const q = <T extends Element>(sel: string): T[] => [...fig.querySelectorAll<T>(sel)];

  /* ---------- plot ---------- */
  let plotting = 0;
  const plot = (target: Element, ms: number): void => {
    if (reduce.matches) return void target.setAttribute('data-plot', 'done');
    const box = svg.getBoundingClientRect();
    if (box.width) fig.style.setProperty('--dwg-u', (svg.viewBox.baseVal.width / box.width).toFixed(4));
    target.setAttribute('data-plot', 'run');
    const run = ++plotting;
    setTimeout(() => run === plotting && target.setAttribute('data-plot', 'done'), ms);
  };
  if (reduce.matches) plot(fig, 0);

  /* ---------- tabs ---------- */
  const tabs = q<HTMLButtonElement>('[role="tab"][data-view]');
  const panelOf = (t: HTMLElement): SVGElement | null => fig.querySelector(`[data-view-panel="${t.dataset.view}"]`);
  const show = (tab: HTMLButtonElement, focus: boolean): void => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panelOf(t)?.toggleAttribute('data-active', on);
    }
    if (focus) tab.focus();
    const p = panelOf(tab);
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

  /* ---------- parts ---------- (a selected part with a --rail is drawn last in its group) */
  let selected: string | null = null;
  let lit: string | null = null;
  const home = new Map<Element, Node | null>();
  const same = (id: string): HTMLElement[] => q(`[data-part="${id}"]`);
  const hot = (id: string, on: boolean): void => {
    for (const b of q(`[data-balloon-for="${id}"]`)) b.classList.toggle('is-hot', on);
  };
  const lift = (p: HTMLElement, on: boolean): void => {
    const g = p.parentNode;
    if (!g || !p.style?.getPropertyValue('--rail')) return;
    const f = doc.activeElement === p;
    if (on && !home.has(p)) {
      home.set(p, p.nextSibling);
      g.appendChild(p);
    } else if (!on && home.has(p)) {
      const n = home.get(p) ?? null;
      home.delete(p);
      setTimeout(() => p.getAttribute('aria-pressed') !== 'true' && g.insertBefore(p, n?.parentNode === g ? n : null), reduce.matches ? 0 : 820);
    }
    if (f) p.focus({ preventScroll: true });
  };
  const set = (id: string, on: boolean): void => {
    for (const p of same(id)) {
      p.setAttribute('aria-pressed', String(on));
      if (p.hasAttribute('aria-expanded')) p.setAttribute('aria-expanded', String(on && open?.fig === fig));
      lift(p, on);
    }
    hot(id, on || id === lit);
  };
  const emit = (el: Element, id: string, on: boolean): void => {
    el.dispatchEvent(new CustomEvent('dwg:select', { bubbles: true, detail: { dwg: fig.dataset.dwg, id, selected: on } }));
  };
  const drop = (): void => {
    const id = selected;
    if (!id) return;
    selected = null;
    set(id, false);
    emit(same(id)[0] ?? fig, id, false);
  };
  const toggle = (part: HTMLElement, ret = part): void => {
    const id = part.getAttribute('data-part') ?? '';
    const on = selected !== id;
    if (open?.fig === fig) closeCard(false);
    drop();
    if (!on) return;
    selected = id;
    if (lit === id) tag(null);
    showCard(fig, part, id, drop, ret);
    set(id, true);
    emit(part, id, true);
  };
  for (const p of q<HTMLElement>('[data-part]')) {
    const id = p.dataset.part;
    if (doc.querySelector(`template[data-card="${id}"]`)) {
      p.setAttribute('aria-haspopup', 'dialog');
      p.setAttribute('aria-expanded', 'false');
    }
  }
  const idOf = (t: EventTarget | null): [string | null, HTMLElement | null] => {
    const el = (t as Element | null)?.closest?.('[data-part],[data-balloon-for]') as HTMLElement | null;
    return el && fig.contains(el) ? [el.dataset.part ?? el.dataset.balloonFor ?? null, el.dataset.part ? el : null] : [null, null];
  };
  fig.addEventListener('click', (e) => {
    const [id, part] = idOf(e.target);
    const p = part ?? (id ? same(id).find(shown) : null);
    // an HTML row with data-balloon-for gets focus back when its card closes
    const b = (e.target as Element).closest?.('[data-balloon-for]');
    if (p) toggle(p, b instanceof HTMLElement ? b : p);
  });
  fig.addEventListener('keydown', (e) => {
    const [, part] = idOf(e.target);
    if (part && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      toggle(part);
    } else if (e.key === 'Escape' && selected && !open) drop();
  });

  /* name tag + hover light */
  const view = fig.querySelector<HTMLElement>('.dwg__view');
  let tagEl: HTMLElement | null = null;
  const tag = (p: HTMLElement | null): void => {
    const label = p?.getAttribute('aria-label');
    if (!p || !label || !view) return void tagEl?.classList.remove('is-on');
    const t = (tagEl ??= view.appendChild(Object.assign(doc.createElement('span'), { className: 'dwg-tag' })));
    t.setAttribute('aria-hidden', 'true');
    t.textContent = label;
    const r = p.getBoundingClientRect(), v = view.getBoundingClientRect();
    const below = r.top < 48;
    const half = t.offsetWidth / 2 + 4;
    t.style.left = `${clamp(r.left + r.width / 2 - v.left, half, v.width - half)}px`;
    t.style.top = `${below ? Math.min(r.bottom, v.bottom, innerHeight - 40) - v.top + 10 : r.top - v.top - 10}px`;
    t.classList.toggle('is-below', below);
    t.classList.add('is-on');
  };
  const light = (id: string | null, p: HTMLElement | null): void => {
    if (lit && lit !== id) {
      hot(lit, lit === selected);
      for (const el of same(lit)) el.classList.remove('is-lit');
    }
    lit = id;
    if (id) {
      hot(id, true);
      for (const el of same(id)) el.classList.add('is-lit');
    }
    tag(id && id !== selected ? p ?? same(id).find(shown) ?? null : null);
  };
  fig.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const [id, p] = idOf(e.target);
    if (id && id !== lit) light(id, p);
  });
  fig.addEventListener('pointerout', (e) => {
    if (lit && idOf(e.relatedTarget)[0] !== lit) light(null, null);
  });
  fig.addEventListener('focusin', (e) => {
    const [id, p] = idOf(e.target);
    if (id && (e.target as Element).matches(':focus-visible')) light(id, p);
  });
  fig.addEventListener('focusout', () => lit && light(null, null));

  /* ---------- pan ---------- */
  const pan = fig.querySelector<HTMLElement>('.dwg__pan');
  if (view && pan) {
    const measure = (): void => {
      const on = pan.scrollWidth > pan.clientWidth + 2;
      view.classList.toggle('is-pannable', on);
      for (const [k, v] of [['tabindex', '0'], ['role', 'region'], ['aria-label', 'Drawing (scrolls sideways)']]) {
        if (on) pan.setAttribute(k, v);
        else pan.removeAttribute(k);
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
