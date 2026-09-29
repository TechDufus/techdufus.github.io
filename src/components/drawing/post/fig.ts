/**
 * Shared helpers for the blog figures (TD-LAB-02 · FIG n) in "From hardware RAID to ZFS".
 *
 * Every figure has a wide layout and, where the drawing would get too small on a phone, a narrow
 * one (PostFigure.astro swaps the viewBox). Blocks that exist in both layouts are drawn once and
 * moved with `at(wide, narrow)`: the wide position is the SVG transform attribute, the narrow one
 * a CSS variable that PostFigure's container query applies as a CSS transform. Lines that differ
 * between layouts go in `.pf-w` (wide only) and `.pf-n` (narrow only) groups.
 */
import { r720xd } from '../../../data/hardware/r720xd';
import type { Drive, PoolId } from '../../../data/hardware/types';

export type P = [number, number];

/** Number → compact SVG coordinate string. */
export const f = (v: number): string => String(Math.round(v * 100) / 100);

/** Placement for a block that moves between layouts (see file header). `style` is appended. */
export function at(w: P, n?: P, cls = '', style = ''): { transform: string; style?: string; class?: string } {
  const c = [n ? 'pf-m' : '', cls].filter(Boolean).join(' ');
  const s = [n ? `--n:translate(${f(n[0])}px,${f(n[1])}px)` : '', style].filter(Boolean).join(';');
  return { transform: `translate(${f(w[0])} ${f(w[1])})`, style: s || undefined, class: c || undefined };
}

/** "M x y H …" polyline through points. */
export const pl = (pts: P[]): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');

export const rc = (x: number, y: number, w: number, h: number): string => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;

export const POOL_CLASS: Record<PoolId, string> = { rpool: 'pool-rpool', fast: 'pool-fast', bulk: 'pool-bulk' };

/** Collects path data per class so each colour is one <path> (keeps the post's HTML small). */
export class Pen {
  private m = new Map<string, string>();
  add(cls: string, d: string): this {
    this.m.set(cls, (this.m.get(cls) ?? '') + d);
    return this;
  }
  get list(): { c: string; d: string }[] {
    return [...this.m].map(([c, d]) => ({ c, d }));
  }
}

/**
 * One <text> for many short labels: every glyph gets its own x (and y, when given) via SVG
 * per-glyph positioning; with text-anchor: middle each glyph is centred on its x.
 * `items` are [centre x, label, baseline y?].
 */
export function glyphRun(items: [number, string, number?][], size = 10.5): { x: string; y?: string; t: string } {
  const w = size * 0.6;
  const xs: string[] = [];
  const ys: string[] = [];
  let t = '';
  for (const [cx, s, y] of items) {
    [...s].forEach((_, i) => {
      xs.push(f(cx + (i - (s.length - 1) / 2) * w));
      if (y !== undefined) ys.push(f(y));
    });
    t += s;
  }
  return { x: xs.join(' '), y: ys.length ? ys.join(' ') : undefined, t };
}

export const drive = (id: string): Drive => {
  const d = r720xd.drives.find((x) => x.id === id);
  if (!d) throw new Error(`r720xd drive ${id} missing`);
  return d;
};

/** Size the OS reports, in GiB ("~238 GiB" → 238). */
export const gib = (d: Drive): number => parseFloat(d.osSize.value.replace(/[^\d.]/g, ''));

/** Short drawing label: "Gigastone 256 GB #1", "MX500 1 TB", "ST300MP0004". */
export const shortName = (d: Drive): string => d.label.replace(/\s*SSD/, '').replace(/^(Crucial|Seagate) /, '').replace(/\s*\(.+\)/, '');

/** Greedy word wrap to at most `max` characters per line. */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const w of text.split(/\s+/)) {
    const last = out.length - 1;
    if (last >= 0 && out[last].length + 1 + w.length <= max) out[last] += ` ${w}`;
    else out.push(w);
  }
  return out;
}

/** Widths of mono lettering in paper units: labels (12, +0.08em) and notes (10.5, +0.06em). */
export const wLabel = (t: string): number => t.length * 12 * 0.68;
export const wNote = (t: string): number => t.length * 10.5 * 0.66;

/** Kept drives in pool order (rpool, fast, bulk), then the ones that leave. */
export const poolOrder = (): Drive[] => {
  const kept = r720xd.pools.flatMap((p) => p.members.map(drive));
  return [...kept, ...r720xd.drives.filter((d) => d.fate === 'remove')];
};

export const cls = (d: Drive): string => (d.fate === 'remove' ? 'sem-removed' : d.pool ? POOL_CLASS[d.pool] : '');
