/**
 * Sheet 01 page behaviour (bundled by src/pages/lab/rack.astro):
 *  - lazy views: fetches /lab/rack/views/ once (on idle, or at the first tab, part or table
 *    pick) and moves the front, side and rear panels and the rear symbols into the sheet,
 *    carrying over the current layer and selection state;
 *  - the detail panel: on `dwg:select` it shows that device's card (from the same partial);
 *  - [data-pick] buttons in the schedules select the device in the drawing.
 */
import { DWG } from './dwg';

const doc = document;
const fig = doc.querySelector<HTMLElement>(`figure[data-dwg="${DWG}"]`);
const panel = doc.querySelector<HTMLElement>('[data-rack-detail]');
const cards = new Map<string, HTMLTemplateElement>();
let loading: Promise<void> | null = null;

function adopt(root: Element): void {
  if (!fig) return;
  const svg = fig.querySelector('.dwg__svg');
  const defs = root.querySelector('svg > defs');
  if (svg && defs) svg.insertBefore(doc.importNode(defs, true), svg.querySelector('.dwg-gridbg'));
  for (const src of root.querySelectorAll<SVGGElement>('[data-view-panel]')) {
    const home = fig.querySelector(`[data-view-panel="${src.getAttribute('data-view-panel')}"]`);
    if (!home || home.childElementCount > 1) continue;
    for (const n of [...src.children]) if (!n.classList.contains('dwg-hit')) home.append(doc.importNode(n, true));
  }
  // carry over layer toggles and the current selection
  for (const b of fig.querySelectorAll<HTMLElement>('[data-layer-toggle][aria-pressed="false"]')) {
    for (const el of fig.querySelectorAll(`[data-layer="${b.dataset.layerToggle}"]`)) el.setAttribute('data-off', '');
  }
  const on = fig.querySelector('[data-part][aria-pressed="true"]')?.getAttribute('data-part');
  if (on) for (const p of fig.querySelectorAll(`[data-part="${on}"]`)) p.setAttribute('aria-pressed', 'true');
}

function load(): Promise<void> {
  const url = fig?.closest<HTMLElement>('[data-rack-views]')?.dataset.rackViews;
  if (!url) return Promise.resolve();
  loading ??= fetch(url)
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    .then((html) => {
      const root = new DOMParser().parseFromString(html, 'text/html').body;
      adopt(root);
      for (const t of root.querySelectorAll<HTMLTemplateElement>('template[data-dev]')) cards.set(t.dataset.dev ?? '', t);
    })
    .catch(() => {
      loading = null;
    });
  return loading;
}

let want: string | null = null;
let hint = '';
async function show(id: string | null): Promise<void> {
  want = id;
  if (!panel) return;
  const empty = panel.querySelector<HTMLElement>('[data-rack-empty]');
  const slot = panel.querySelector<HTMLElement>('[data-rack-card]');
  if (!slot || !empty) return;
  hint ||= empty.textContent ?? '';
  if (!id) {
    slot.replaceChildren();
    empty.textContent = hint;
    empty.hidden = false;
    return;
  }
  empty.hidden = true;
  await load();
  if (want !== id) return; // deselected or replaced while the partial was loading
  const t = cards.get(id);
  empty.hidden = !!t;
  slot.replaceChildren(...(t ? [doc.importNode(t.content, true)] : []));
  if (!t) empty.textContent = 'Couldn’t load the details. The tables below have the numbers.';
}

if (fig) {
  const idle = (cb: () => void): void => {
    if ('requestIdleCallback' in window) requestIdleCallback(cb, { timeout: 4000 });
    else setTimeout(cb, 1200);
  };
  addEventListener('load', () => idle(() => void load()), { once: true });
  for (const t of fig.querySelectorAll('[role="tab"]')) {
    for (const ev of ['pointerenter', 'focus', 'click']) t.addEventListener(ev, () => void load(), { once: true });
  }
  fig.addEventListener('dwg:select', (e) => {
    const { id, selected } = (e as CustomEvent<{ id: string; selected: boolean }>).detail;
    void show(selected ? id : null);
  });
  // Esc from outside the drawing (a schedule button, the card) clears the selection too
  doc.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || e.defaultPrevented || fig.contains(e.target as Node)) return;
    fig.querySelector('[data-part][aria-pressed="true"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  for (const b of doc.querySelectorAll<HTMLButtonElement>('[data-pick]')) {
    b.addEventListener('click', () => {
      const part = fig.querySelector<SVGElement>(`[data-part="${b.dataset.pick}"]`);
      if (!part) return;
      if (part.getAttribute('aria-pressed') !== 'true') part.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      panel?.scrollIntoView({ block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  }
}
