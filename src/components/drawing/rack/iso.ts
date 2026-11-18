/**
 * Sheet 01 · the isometric stack as a broken view: the rails from U1 down to U16, a break, then
 * the bottom shelf at the bottom. Nothing lives between, so the break keeps the drawing about the
 * boxes. Two projections share one scale: `hi` for the top of the cabinet, `lo` for the bottom,
 * raised to sit a short gap under the break.
 */
import { U_MM, isometric, type Iso } from '../../../lib/drawing/projection';
import { CAB, yBot, yTop, type Slot } from './model';

/** The break: the upper run ends at the bottom of U16, the lower run is the bottom shelf's two units. */
export const BREAK = { upper: 16, lower: CAB.units - 1, gap: 1.3 * U_MM };

/**
 * (x, y): paper point of the upper run's bottom front-left corner (model x 0, the bottom of U16,
 * z 0). k: paper units per mm.
 */
export function isoStack(x: number, y: number, k: number): { hi: Iso; lo: Iso; of: (s: Slot) => Iso; cut: [number, number] } {
  const hi = isometric({ x, y: y + yBot(BREAK.upper) * k, scale: k });
  const lo = isometric({ x, y: y + (BREAK.gap + yTop(BREAK.lower)) * k, scale: k });
  return { hi, lo, of: (s) => (s.y0 < yBot(BREAK.upper) ? lo : hi), cut: [yBot(BREAK.upper), yTop(BREAK.lower)] };
}
