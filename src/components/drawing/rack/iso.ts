/**
 * Sheet 01 · the isometric stack as a broken view: the rails from U1 down to U15, a break, then
 * U40 to U42 at the bottom. Nothing lives in U15–40, so the break keeps the drawing about the
 * boxes. Two projections share one scale: `hi` for the top of the cabinet, `lo` for the bottom,
 * raised to sit a short gap under the break.
 */
import { U_MM, isometric, type Iso } from '../../../lib/drawing/projection';
import { yBot, yTop, type Slot } from './model';

/** The break: the upper run ends at the bottom of U15, the lower run starts at the top of U40. */
export const BREAK = { upper: 15, lower: 40, gap: 1.3 * U_MM };

/**
 * (x, y): paper point of the upper run's bottom front-left corner (model x 0, the bottom of U15,
 * z 0). k: paper units per mm.
 */
export function isoStack(x: number, y: number, k: number): { hi: Iso; lo: Iso; of: (s: Slot) => Iso; cut: [number, number] } {
  const hi = isometric({ x, y: y + yBot(BREAK.upper) * k, scale: k });
  const lo = isometric({ x, y: y + (BREAK.gap + yTop(BREAK.lower)) * k, scale: k });
  return { hi, lo, of: (s) => (s.y0 < yBot(BREAK.upper) ? lo : hi), cut: [yBot(BREAK.upper), yTop(BREAK.lower)] };
}
