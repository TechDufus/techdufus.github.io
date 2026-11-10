/**
 * Sheet 01 · the isometric stack as a broken view: the rails from U1 down to U15, a break, then
 * the last three units at the bottom (the bottom shelf and the U above it). Nothing lives between,
 * so the break keeps the drawing about the boxes. Two projections share one scale: `hi` for the
 * top of the cabinet, `lo` for the bottom, raised to sit a short gap under the break.
 */
import { U_MM, isometric, type Iso } from '../../../lib/drawing/projection';
import { CAB, yBot, yTop, type Slot } from './model';

/** The break: the upper run ends at the bottom of U15, the lower run starts two units above the bottom shelf's. */
export const BREAK = { upper: 15, lower: CAB.units - 2, gap: 1.3 * U_MM };

/**
 * (x, y): paper point of the upper run's bottom front-left corner (model x 0, the bottom of U15,
 * z 0). k: paper units per mm.
 */
export function isoStack(x: number, y: number, k: number): { hi: Iso; lo: Iso; of: (s: Slot) => Iso; cut: [number, number] } {
  const hi = isometric({ x, y: y + yBot(BREAK.upper) * k, scale: k });
  const lo = isometric({ x, y: y + (BREAK.gap + yTop(BREAK.lower)) * k, scale: k });
  return { hi, lo, of: (s) => (s.y0 < yBot(BREAK.upper) ? lo : hi), cut: [yBot(BREAK.upper), yTop(BREAK.lower)] };
}
