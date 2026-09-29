/**
 * Sheet 01 page behaviour (bundled by src/pages/lab/rack.astro): lazy views. Fetches
 * /lab/rack/views/ once (on idle, or at the first touch of a view tab) and moves the front, side
 * and rear panels and the rear panel symbols into the sheet, carrying over the current selection.
 * Everything else (parts, balloons, the schedule rows, cards) is the kit's (src/scripts/drawing.ts).
 */
import { DWG } from './dwg';

const doc = document;
const fig = doc.querySelector<HTMLElement>(`figure[data-dwg="${DWG}"]`);
let loading: Promise<void> | null = null;

function adopt(root: Element): void {
  if (!fig) return;
  const svg = fig.querySelector('.dwg__svg');
  const defs = root.querySelector('svg > defs');
  if (svg && defs) svg.insertBefore(doc.importNode(defs, true), svg.querySelector('.dwg-gridbg'));
  const on = fig.querySelector('[data-part][aria-pressed="true"]')?.getAttribute('data-part');
  for (const src of root.querySelectorAll<SVGGElement>('[data-view-panel]')) {
    const home = fig.querySelector(`[data-view-panel="${src.getAttribute('data-view-panel')}"]`);
    if (!home || home.childElementCount > 1) continue;
    for (const n of [...src.children]) if (!n.classList.contains('dwg-hit')) home.append(doc.importNode(n, true));
    // what drawing.ts sets on parts at load: the card affordance, and the current selection
    for (const p of home.querySelectorAll('[data-part]')) {
      p.setAttribute('aria-haspopup', 'dialog');
      p.setAttribute('aria-expanded', 'false');
      if (p.getAttribute('data-part') === on) p.setAttribute('aria-pressed', 'true');
    }
  }
}

function load(): Promise<void> {
  const url = fig?.closest<HTMLElement>('[data-rack-views]')?.dataset.rackViews;
  if (!url) return Promise.resolve();
  loading ??= fetch(url)
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    .then((html) => adopt(new DOMParser().parseFromString(html, 'text/html').body))
    .catch(() => {
      loading = null;
    });
  return loading;
}

if (fig) {
  addEventListener(
    'load',
    () => ('requestIdleCallback' in window ? requestIdleCallback(() => void load(), { timeout: 4000 }) : setTimeout(() => void load(), 1200)),
    { once: true },
  );
  for (const t of fig.querySelectorAll('[role="tab"]')) {
    for (const ev of ['pointerenter', 'focus', 'click']) t.addEventListener(ev, () => void load(), { once: true });
  }
}
