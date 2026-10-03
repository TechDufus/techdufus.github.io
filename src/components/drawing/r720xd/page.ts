/**
 * Sheet 02 (the archived R720xd sheet) page behaviour (bundled by src/pages/lab/r720xd.astro).
 *
 * Lazy views: the EXPLODED and BEFORE / AFTER tab panels ship empty and fill from
 * /lab/r720xd/views/ (fetched once: on idle, or at the first touch of a view tab), which keeps the
 * page HTML inside budget. The drawings they <use> (ServerDefs) and every card are already on the
 * page. Without JS the tabs are hidden and only the orthographic views show.
 *
 * Tab stops: one per part per view. A drive drawn in three places on a tab is still one stop;
 * pointer users can click any of them.
 *
 * Everything else (tabs, parts, balloons, cards, plotting) is the kit's (src/scripts/drawing.ts).
 */
export {};

const doc = document;
const fig = doc.querySelector<HTMLElement>('figure[data-dwg="lab02"]');
let loading: Promise<void> | null = null;

function tabStops(panel: Element): void {
  const seen = new Set<string>();
  for (const p of panel.querySelectorAll('[data-part]')) {
    const id = p.getAttribute('data-part') ?? '';
    if (seen.has(id)) p.setAttribute('tabindex', '-1');
    else seen.add(id);
  }
}

function adopt(root: Element): void {
  if (!fig) return;
  const on = fig.querySelector('[data-part][aria-pressed="true"]')?.getAttribute('data-part');
  for (const src of root.querySelectorAll('[data-view-panel]')) {
    const home = fig.querySelector(`[data-view-panel="${src.getAttribute('data-view-panel')}"]`);
    if (!home || home.childElementCount > 1) continue;
    for (const n of [...src.children]) if (!n.classList.contains('dwg-hit')) home.append(doc.importNode(n, true));
    // what drawing.ts sets on parts at load: the card affordance, and the current selection
    for (const p of home.querySelectorAll('[data-part]')) {
      p.setAttribute('aria-haspopup', 'dialog');
      p.setAttribute('aria-expanded', 'false');
      if (p.getAttribute('data-part') === on) p.setAttribute('aria-pressed', 'true');
    }
    tabStops(home);
  }
}

function load(): Promise<void> {
  const url = fig?.closest<HTMLElement>('[data-srv-views]')?.dataset.srvViews;
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
  for (const panel of fig.querySelectorAll('[data-view-panel]')) tabStops(panel);
  addEventListener(
    'load',
    () => ('requestIdleCallback' in window ? requestIdleCallback(() => void load(), { timeout: 4000 }) : setTimeout(() => void load(), 1200)),
    { once: true },
  );
  for (const t of fig.querySelectorAll('[role="tab"]')) {
    for (const ev of ['pointerenter', 'focus', 'click']) t.addEventListener(ev, () => void load(), { once: true });
  }
}
