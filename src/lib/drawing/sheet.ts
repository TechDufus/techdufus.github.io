/**
 * Drawing kit · sheet layouts (paper units; 3 units = 1 printed mm, see projection.ts).
 *
 *   const L = sheetLayout('A3');
 *   L.area        // where views go: inside the frame, left of the furniture column
 *   L.column      // the right-hand column (revision table, aside, title block)
 *   zoneOf(L, 400, 300)   // → "C3"
 *
 * 'A3' (1260 × 891) and 'A4' (891 × 630) are landscape ISO sheets with a frame, zone markers
 * (numbers across, letters down, ISO 5457 style), a revision table top-right, an optional aside
 * and a title block bottom-right. `{ w, h }` is a frameless figure: the whole viewBox is area.
 */

export type Box = { x: number; y: number; w: number; h: number };
export type SheetSize = 'A3' | 'A4' | { w: number; h: number };
export type SheetLayout = {
  w: number;
  h: number;
  framed: boolean;
  /** Outer border (thin) and drawing frame (heavy). */
  border: Box;
  frame: Box;
  /** Zone counts across (numbers) and down (letters). */
  cols: number;
  rows: number;
  /** Free drawing area for views. */
  area: Box;
  /** Right column: revision table on top, the aside, title block at the bottom. */
  column: Box;
  titleBlock: Box;
  revTable: Box;
  aside: Box;
};

const SIZES = {
  A3: { w: 1260, h: 891, cols: 8, rows: 6, col: 384, tb: 156 },
  A4: { w: 891, h: 630, cols: 6, rows: 4, col: 312, tb: 144 },
} as const;

/** Outer border inset and zone band width, paper units. */
const BORDER = 15;
const BAND = 24;

export function sheetLayout(size: SheetSize): SheetLayout {
  if (typeof size === 'object') {
    const all: Box = { x: 0, y: 0, w: size.w, h: size.h };
    const none: Box = { x: size.w, y: size.h, w: 0, h: 0 };
    return { w: size.w, h: size.h, framed: false, border: all, frame: all, cols: 0, rows: 0, area: all, column: none, titleBlock: none, revTable: none, aside: none };
  }
  const s = SIZES[size];
  const border: Box = { x: BORDER, y: BORDER, w: s.w - 2 * BORDER, h: s.h - 2 * BORDER };
  const inset = BORDER + BAND;
  const frame: Box = { x: inset, y: inset, w: s.w - 2 * inset, h: s.h - 2 * inset };
  const colX = frame.x + frame.w - s.col;
  const column: Box = { x: colX, y: frame.y, w: s.col, h: frame.h };
  const titleBlock: Box = { x: colX, y: frame.y + frame.h - s.tb, w: s.col, h: s.tb };
  // The revision table grows with its rows; Sheet.astro measures it, this is the default slot.
  const revTable: Box = { x: colX, y: frame.y, w: s.col, h: 84 };
  const aside: Box = { x: colX + 18, y: revTable.y + revTable.h + 24, w: s.col - 18, h: titleBlock.y - revTable.y - revTable.h - 48 };
  const area: Box = { x: frame.x, y: frame.y, w: frame.w - s.col, h: frame.h };
  return { w: s.w, h: s.h, framed: true, border, frame, cols: s.cols, rows: s.rows, area, column, titleBlock, revTable, aside };
}

/** Zone reference ("C4") for a paper point on a framed sheet; '' outside the frame. */
export function zoneOf(L: SheetLayout, x: number, y: number): string {
  const { frame: f, cols, rows } = L;
  if (!L.framed || x < f.x || y < f.y || x > f.x + f.w || y > f.y + f.h) return '';
  const col = Math.min(cols - 1, Math.floor(((x - f.x) / f.w) * cols));
  const row = Math.min(rows - 1, Math.floor(((y - f.y) / f.h) * rows));
  return `${String.fromCharCode(65 + row)}${col + 1}`;
}

/**
 * Width of a run of IBM Plex Mono in paper units (every glyph advances 0.6 em), so labels and
 * stamps can be laid out at build time without measuring the DOM. `tracking` is letter-spacing
 * in em.
 */
export function monoWidth(text: string, size: number, tracking = 0): number {
  const n = [...text].length;
  return n ? n * size * (0.6 + tracking) - size * tracking : 0;
}

/**
 * Swatch recipe for LineKey, so a swatch is drawn with the real line class.
 *   line types  'obj' 'med' 'hid' 'ctr' 'phantom' 'cut' 'dim' 'cons' 'thin' 'flow' 'net' 'hatch'
 *   semantics   'air-cold' 'air-hot' (flow dashes) · 'net-10g' 'net-1g' (link) ·
 *               'pool-rpool' 'pool-fast' 'pool-bulk' 'sem-new' 'sem-removed' 'sem-power' 'sem-keep'
 * Returns the group class (semantic colour, or '') and the line class for the swatch <path>
 * (`hatch: true` → draw a small <rect class="hatch ln-obj"> instead).
 */
export function lineSwatch(line: string): { group: string; cls: string; hatch: boolean } {
  if (line === 'hatch') return { group: '', cls: 'hatch ln-obj', hatch: true };
  if (line.startsWith('air-')) return { group: line, cls: 'ln-flow', hatch: false };
  if (line.startsWith('net-')) return { group: line, cls: 'ln-net', hatch: false };
  if (line.startsWith('pool-') || line.startsWith('sem-')) return { group: line, cls: 'ln-obj', hatch: false };
  return { group: '', cls: `ln-${line}`, hatch: false };
}
