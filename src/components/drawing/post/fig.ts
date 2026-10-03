/**
 * Post-only helpers for the hand-drawn figures in "From hardware RAID to ZFS" (Pools, BayMap,
 * TwoCables). Everything generic (at, rc, pl, Pen, wrap, wLabel, wNote, f) comes from the kit's
 * src/lib/drawing/figure.ts; this file only knows about the R720xd's drives and pools.
 */
import { server } from '../../../data/lab/snapshots/server-2026-09-28';
import type { Drive, PoolId } from '../../../data/lab/snapshots/types-2026-09-28';
import { f } from '../../../lib/drawing/figure';

export const POOL_CLASS: Record<PoolId, string> = { rpool: 'pool-rpool', fast: 'pool-fast', bulk: 'pool-bulk' };

/** Drives in pool order: rpool, fast, bulk. */
export const poolDrives = (id: PoolId): Drive[] => server.drives.filter((d) => d.pool === id);

/** Short drawing label: "Gigastone 256 GB", "MX500 500 GB", "MX500 1 TB", "ST300MP0004". */
export const shortName = (d: { card: { title: string } }): string => d.card.title.replace(/\s*SSD$/, '').replace(/^(Crucial|Seagate) /, '');

/** Fits a rotated bay carrier (≤ 10 characters): "Gigastone", "MX500 500", "MX500 1TB". */
export const bayName = (d: Drive): string => {
  const s = shortName(d).replace(/ (\d+) GB$/, ' $1').replace(/ (\d+) TB$/, ' $1TB');
  return s.length > 10 ? s.split(' ')[0] : s;
};

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
