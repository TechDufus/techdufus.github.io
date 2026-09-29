/**
 * Drawing kit · projection helpers (paper space ↔ model space).
 *
 * Two coordinate systems, as in CAD:
 *   paper space  the SVG viewBox. On the standard sheets 3 paper units = 1 mm of printed paper
 *                (A3 = 1260 × 891, see sheet.ts), so text sizes and pen weights are chosen in
 *                paper units and stay the same on every view.
 *   model space  millimetres of the real object. x = width (left → right), y = height (up),
 *                z = depth (front → back), matching `Mm` in src/data/lab/types.ts.
 *
 * Every view is placed on the paper with one projection helper. Its `scale` is paper units per
 * model millimetre, so a view at 1:5 on a standard sheet has scale = atScale(1, 5) = 0.6.
 *
 *   const front = ortho({ x: 80, y: 400, scale: atScale(1, 2), flipY: true });
 *   front.pt(482.6, 88.9)          // → [x, y] paper point of the top-right corner
 *   front.len(44.45)               // → 66.675 paper units (1U at 1:2)
 *   <g transform={front.matrix}>…drawn in mm…</g>   // reuse an mm drawing in this view
 *
 *   const iso = isometric({ x: 300, y: 600, scale: atScale(1, 5), view: 'front-right' });
 *   const b = iso.box({ x: 0, y: 0, z: 0, w: 482.6, h: 88.9, d: 700 });
 *   <path d={b.top}/> <path d={b.front}/> <path d={b.side}/> <path class="ln-obj" d={b.edges}/>
 *   <g transform={iso.faceMatrix('front', [0, 88.9, 0])}>…front elevation drawn in mm, v down…</g>
 *
 * Paths are plain strings (`d` attributes) rounded to 0.01 paper units. Nothing here touches
 * the DOM, so it runs at build time in Astro frontmatter.
 */

/** One rack unit, EIA-310: 1.75 in. */
export const U_MM = 44.45;
/** Overall width of a 19 in rack panel, ears included. */
export const RACK_19_MM = 482.6;
/** Paper units per printed millimetre on the standard sheets (see sheet.ts). */
export const PU_PER_MM = 3;

export type Pt = [number, number];
export type Pt3 = [number, number, number];

/** Paper coordinates are written to 0.1 unit (0.03 printed mm): plenty, and ~12% fewer bytes. */
const r2 = (n: number): number => Math.round(n * 10) / 10 || 0;
const num = (n: number): string => String(r2(n));
/** Matrix scale/skew terms keep 4 decimals: a rounded 0.433 would misplace a 480 mm face by 1%. */
const m4 = (n: number): string => String(Math.round(n * 1e4) / 1e4 || 0);

/** Paper units per model mm for a drawing scale n:d on a standard sheet (1:5 → 0.6). */
export const atScale = (n: number, d = 1): number => (PU_PER_MM * n) / d;

/** "1:5", "2:1", "1:2.5" for a view scale in paper units per model mm. */
export function fmtScale(scale: number): string {
  const ratio = scale / PU_PER_MM;
  const clean = (n: number): string => String(Math.round(n * 100) / 100);
  return ratio >= 1 ? `${clean(ratio)}:1` : `1:${clean(1 / ratio)}`;
}

/** "482.6", "700", "44.45": millimetres, trimmed, no unit (drawings state UNITS mm once). */
export function fmtMm(mm: number, digits = 2): string {
  return String(Number(mm.toFixed(digits)));
}

/** "2U", "1.5U". */
export const fmtU = (units: number): string => `${Number(units.toFixed(2))}U`;

/** "19 in" style inch readout for secondary (bracketed) dimensions: 482.6 → "[19.00]". */
export const fmtIn = (mm: number, digits = 2): string => `[${(mm / 25.4).toFixed(digits)}]`;

/** Rack units → mm (2 → 88.9). */
export const uToMm = (units: number): number => units * U_MM;

/** SVG `matrix(a,b,c,d,e,f)`: maps (u, v) → (a·u + c·v + e, b·u + d·v + f). */
export const matrix = (m: readonly number[]): string => `matrix(${m.map((v, i) => (i < 4 ? m4(v) : num(v))).join(',')})`;

/* ------------------------------------------------------------------ path helpers */

/** "M x y L …" through points; `close` appends Z. */
export function poly(points: readonly Pt[], close = false): string {
  return points.map(([x, y], i) => `${i ? 'L' : 'M'}${num(x)} ${num(y)}`).join('') + (close ? 'Z' : '');
}

/** Rectangle path in paper units (w/h may be negative). */
export const rect = (x: number, y: number, w: number, h: number): string =>
  poly([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], true);

/** Straight segment. */
export const seg = (a: Pt, b: Pt): string => poly([a, b]);

/** Circle as a path (so it can carry pathLength and be plotted like any line). */
export const circle = (cx: number, cy: number, r: number): string =>
  `M${num(cx - r)} ${num(cy)}a${num(r)} ${num(r)} 0 1 0 ${num(2 * r)} 0a${num(r)} ${num(r)} 0 1 0 ${num(-2 * r)} 0`;

/** Several sub-paths joined into one `d`. */
export const join = (...d: (string | false | null | undefined)[]): string => d.filter(Boolean).join('');

/* ------------------------------------------------------------------ orthographic */

export type OrthoOptions = {
  /** Paper position of the model origin. */
  x: number;
  y: number;
  /** Paper units per model mm (use atScale()). */
  scale: number;
  /** true: model y points up (elevations, racks: y = height); false (default): y points down like SVG. */
  flipY?: boolean;
};

export type Ortho = {
  /** Model (x, y) mm → paper point. */
  pt: (x: number, y: number) => Pt;
  /** Model mm → paper units. */
  len: (mm: number) => number;
  /** Model rect (x, y = the corner nearest the origin, w, h in mm) → paper path. */
  rect: (x: number, y: number, w: number, h: number) => string;
  /** Model points → paper path. */
  poly: (points: readonly Pt[], close?: boolean) => string;
  scale: number;
  /** SVG transform mapping this view's model mm onto the paper (for drawings made in mm). */
  matrix: string;
};

/** An orthographic view (front, side, rear, plan…) at one scale. */
export function ortho({ x, y, scale, flipY = false }: OrthoOptions): Ortho {
  const sy = flipY ? -scale : scale;
  const pt = (mx: number, my: number): Pt => [r2(x + mx * scale), r2(y + my * sy)];
  const toPaper = (points: readonly Pt[], close = false): string => poly(points.map(([a, b]) => pt(a, b)), close);
  return {
    pt,
    len: (mm) => r2(mm * scale),
    rect: (mx, my, w, h) => toPaper([[mx, my], [mx + w, my], [mx + w, my + h], [mx, my + h]], true),
    poly: toPaper,
    scale,
    matrix: matrix([scale, 0, 0, sy, x, y]),
  };
}

/* ------------------------------------------------------------------ isometric */

export type IsoView = 'front-left' | 'front-right';
export type IsoFace = 'front' | 'top' | 'left' | 'right' | 'rear';
export type IsoBoxInput = { x: number; y: number; z: number; w: number; h: number; d: number };
export type IsoBox = {
  /** Visible faces as closed paths (fill them; stroke with .ln-obj for a solid look). */
  top: string;
  front: string;
  /** The visible side: the right side in 'front-right', the left side in 'front-left'. */
  side: string;
  /** Visible edges: silhouette plus the three edges meeting at the near top corner. */
  edges: string;
  /** Silhouette only. */
  outline: string;
  /** The three edges meeting at the hidden far-bottom corner (draw with .ln-hid). */
  hidden: string;
  /** Paper point of each named corner, e.g. c.ftl = front-top-left. */
  c: Record<'fbl' | 'fbr' | 'ftl' | 'ftr' | 'bbl' | 'bbr' | 'btl' | 'btr', Pt>;
};
export type Iso = {
  /** Model (x, y, z) mm → paper point. */
  pt: (x: number, y: number, z: number) => Pt;
  /** Model points → paper path. */
  poly: (points: readonly Pt3[], close?: boolean) => string;
  box: (b: IsoBoxInput) => IsoBox;
  /**
   * SVG transform that maps a face-local 2D drawing onto a face plane through `origin` (model mm).
   * Face-local axes (mm): u to the right and v DOWN as you look straight at that face, so an
   * orthographic drawing made with ortho({ x: 0, y: 0, scale: 1 }) drops straight in:
   *   front  u = +x, v = −y   origin = front top-left corner        [x, y + h, z]
   *   top    u = +x, v = −z   origin = back top-left (plan, front at the bottom) [x, y + h, z + d]
   *   right  u = +z, v = −y   origin = front top-right corner       [x + w, y + h, z]
   *   left   u = −z, v = −y   origin = back top-left corner         [x, y + h, z + d]
   *   rear   u = −x, v = −y   origin = back top-right corner        [x + w, y + h, z + d]
   */
  faceMatrix: (face: IsoFace, origin: Pt3) => string;
  /** Paper vector for 1 model mm along each axis. */
  axes: { x: Pt; y: Pt; z: Pt };
  /** Paper translation for moving `mm` along the depth axis (−mm = out of the front, on rails). */
  slide: (mm: number) => Pt;
  scale: number;
};

const COS30 = Math.cos(Math.PI / 6);

/**
 * True isometric (30°) projection. `view` names the corner you stand at:
 *   front-right  you see the front and the right side; depth runs up to the right
 *   front-left   you see the front and the left side; depth runs up to the left
 * Model origin (0, 0, 0) is the front-bottom-left corner of whatever you draw; (x, y) is its
 * paper position.
 */
export function isometric({ x, y, scale, view = 'front-right' }: { x: number; y: number; scale: number; view?: IsoView }): Iso {
  const right = view === 'front-right';
  const ex: Pt = right ? [COS30 * scale, 0.5 * scale] : [COS30 * scale, -0.5 * scale];
  const ey: Pt = [0, -scale];
  const ez: Pt = right ? [COS30 * scale, -0.5 * scale] : [-COS30 * scale, -0.5 * scale];
  const pt = (mx: number, my: number, mz: number): Pt => [
    r2(x + mx * ex[0] + my * ey[0] + mz * ez[0]),
    r2(y + mx * ex[1] + my * ey[1] + mz * ez[1]),
  ];
  const toPaper = (points: readonly Pt3[], close = false): string => poly(points.map((p) => pt(...p)), close);

  const box = ({ x: bx, y: by, z: bz, w, h, d }: IsoBoxInput): IsoBox => {
    const X0 = bx, X1 = bx + w, Y0 = by, Y1 = by + h, Z0 = bz, Z1 = bz + d;
    const c = {
      fbl: pt(X0, Y0, Z0), fbr: pt(X1, Y0, Z0), ftl: pt(X0, Y1, Z0), ftr: pt(X1, Y1, Z0),
      bbl: pt(X0, Y0, Z1), bbr: pt(X1, Y0, Z1), btl: pt(X0, Y1, Z1), btr: pt(X1, Y1, Z1),
    };
    const front = poly([c.fbl, c.fbr, c.ftr, c.ftl], true);
    const top = poly([c.ftl, c.ftr, c.btr, c.btl], true);
    const side = right ? poly([c.fbr, c.bbr, c.btr, c.ftr], true) : poly([c.fbl, c.bbl, c.btl, c.ftl], true);
    const outline = right
      ? poly([c.fbl, c.fbr, c.bbr, c.btr, c.btl, c.ftl], true)
      : poly([c.fbr, c.fbl, c.bbl, c.btl, c.btr, c.ftr], true);
    const edges = outline + (right ? poly([c.ftl, c.ftr, c.fbr]) + poly([c.ftr, c.btr]) : poly([c.ftr, c.ftl, c.fbl]) + poly([c.ftl, c.btl]));
    const far = right ? c.bbl : c.bbr;
    const hidden = right
      ? poly([c.fbl, far, c.bbr]) + poly([far, c.btl])
      : poly([c.fbr, far, c.bbl]) + poly([far, c.btr]);
    return { top, front, side, edges, outline, hidden, c };
  };

  const faceMatrix = (face: IsoFace, [ox, oy, oz]: Pt3): string => {
    const neg = (p: Pt): Pt => [-p[0], -p[1]];
    // [u axis, v axis] as paper vectors per mm, for v pointing down on that face.
    const axesOf: Record<IsoFace, [Pt, Pt]> = {
      front: [ex, neg(ey)],
      top: [ex, neg(ez)],
      right: [ez, neg(ey)],
      left: [neg(ez), neg(ey)],
      rear: [neg(ex), neg(ey)],
    };
    const [u, v] = axesOf[face];
    const [e, f] = pt(ox, oy, oz);
    return matrix([u[0], u[1], v[0], v[1], e, f]);
  };

  return {
    pt,
    poly: toPaper,
    box,
    faceMatrix,
    axes: { x: ex, y: ey, z: ez },
    slide: (mm) => [r2(mm * ez[0]), r2(mm * ez[1])],
    scale,
  };
}
