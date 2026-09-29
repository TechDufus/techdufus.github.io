/**
 * Drawing kit · figure tier: shared types, lettering metrics and the layout maths behind the
 * figure primitives in src/components/drawing/figure/ (Flow, Stack, Compare, Lanes, Bars).
 *
 * Every primitive lays itself out twice from the same data: a wide layout (the ~680px prose
 * column, or 920 with `breakout`) and a narrow one (a phone, 360 paper units wide). Blocks that
 * exist in both are drawn once and placed with `at(wide, narrow)`: the wide spot is the SVG
 * transform attribute, the narrow one a CSS variable that Figure.astro applies (.is-narrow .fg-m).
 * Lines that differ go in `.fg-w` (wide only) and `.fg-n` (narrow only) groups.
 *
 * Paper units are CSS px at the column width, so 12-unit lettering reads at 12px.
 */
import { monoWidth } from './sheet';

export type P = [number, number];

/** Semantic tone: default gold ink · new (green) · removed (red) · keep (neutral: unchanged) ·
 *  planned (dashed phantom: not built yet). */
export type Tone = 'default' | 'new' | 'removed' | 'keep' | 'planned';

/** What a clickable node's card says (the same shape as the data's `card`). */
export type Card = { title: string; kind?: string; lines: string[] };

/** A box in a figure. `card` makes it clickable: a numbered balloon, a name tag, the card. */
export type FigNode = {
  id: string;
  label: string;
  /** Small second line(s) in note lettering. */
  sub?: string;
  tone?: Tone;
  card?: Card;
  /** Balloon number (default: clickable nodes count 1, 2, 3… in reading order). */
  n?: number | string;
};

export const WIDE = 680;
export const BREAKOUT = 920;
export const NARROW = 360;

/** Tone → class on the node/edge group (kit semantic classes, plus figure.css for the rest). */
export const TONE: Record<Tone, string> = { default: '', new: 'sem-new', removed: 'sem-removed', keep: 'fg-keep', planned: 'fg-planned' };
export const toneOf = (t?: Tone): string => TONE[t ?? 'default'];

/** Props every primitive passes through to Figure.astro. */
export type FigureBase = {
  /** Unique on the page (defs, ids). */
  id: string;
  /** Figure title: the SVG <title>, and the FIG strip's title when `fig` is set. */
  title: string;
  /** The SVG <desc>; primitives write one from their data when omitted. */
  desc?: string;
  /** One short line under the figure, in voice. */
  caption?: string;
  /** FIG title strip under the drawing: 3 → "FIG 3", or a full drawing number string. */
  fig?: number | string;
  /** Wider than the prose column (920 wide layout; see Figure.astro). */
  breakout?: boolean;
  /** The cue beside the caption (default: on when any node is clickable). */
  hint?: boolean | string;
  /** FIG strip fields (defaults "NTS", "A", none). */
  scale?: string;
  rev?: string;
  date?: string;
  /** Figure width in px below which the narrow layout is used (default 0.8 × wide width). */
  bp?: number;
};

/** Plain-text list for a <desc>: "a, b and c". */
export const list = (xs: string[]): string => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
/** Node name for a <desc>, with its state. */
export const say = (n: FigNode): string =>
  `${n.label}${n.sub ? ` (${n.sub})` : ''}${n.tone && n.tone !== 'default' ? ` [${n.tone === 'keep' ? 'unchanged' : n.tone}]` : ''}`;

/** Number → compact SVG coordinate string. */
export const f = (v: number): string => String(Math.round(v * 100) / 100);
export const rc = (x: number, y: number, w: number, h: number): string => `M${f(x)} ${f(y)}h${f(w)}v${f(h)}h${f(-w)}Z`;
export const pl = (pts: P[]): string => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${f(x)} ${f(y)}`).join('');

/** Width of .txt-label (12, +.08em, caps) and .txt-note (10.5, +.06em) runs, paper units. */
export const wLabel = (t: string): number => monoWidth(t, 12, 0.08);
export const wNote = (t: string): number => monoWidth(t, 10.5, 0.06);
export const LABEL_CH = 12 * 0.68;
export const NOTE_CH = 10.5 * 0.66;

/** Greedy word wrap to at most `max` characters a line (a longer word keeps its own line). */
export function wrap(text: string, max: number): string[] {
  const out: string[] = [];
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const last = out.length - 1;
    if (last >= 0 && out[last].length + 1 + w.length <= max) out[last] += ` ${w}`;
    else out.push(w);
  }
  return out;
}

/**
 * Placement for a block that moves between layouts. `n` may carry a scale as a third value.
 * Spread onto a <g>/<text>: <g {...at([x, y], [nx, ny], 'sem-new')}>.
 */
export function at(w: P, n?: P | [number, number, number], cls = '', style = ''): { transform: string; style?: string; class?: string } {
  const c = [n ? 'fg-m' : '', cls].filter(Boolean).join(' ');
  const sc = n && n.length === 3 && n[2] !== 1 ? ` scale(${n[2]})` : '';
  const s = [n ? `--n:translate(${f(n[0])}px,${f(n[1])}px)${sc}` : '', style].filter(Boolean).join(';');
  return { transform: `translate(${f(w[0])} ${f(w[1])})`, style: s || undefined, class: c || undefined };
}

/** Collects path data per class, so each colour/line type is one <path> (small HTML). */
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

/* ---------------------------------------------------------------- boxes */

export type Line = { t: string; cls: 'txt-label' | 'txt-note'; y: number };
/** A node sized for a figure: every box in one figure shares w and h (rhythm). */
export type Box = FigNode & { w: number; h: number; lines: Line[]; tone: Tone; n?: string };

const PAD_X = 16;
const LH_LABEL = 15;
const LH_NOTE = 13.5;

/** Box width a set of labels wants on one line (clamped to [min, max]). */
export const wantW = (labels: string[], min = 92, max = 196): number =>
  Math.round(Math.min(max, Math.max(min, ...labels.map((l) => wLabel(l) + PAD_X + 8))));

/** Wrap every node's text to width `w` and give them one shared height (≥ minH). Clickable nodes
 *  get balloon numbers 1, 2, 3… in order (unless they set `n`); pass every box of a figure in one
 *  call so heights and numbers are shared. */
export function boxes(nodes: FigNode[], w: number, minH = 36): Box[] {
  const lab = Math.max(4, Math.floor((w - PAD_X) / LABEL_CH));
  const sub = Math.max(6, Math.floor((w - 12) / NOTE_CH));
  const wrapped = nodes.map((nd) => ({ nd, l: wrap(nd.label, lab), s: nd.sub ? wrap(nd.sub, sub) : [] }));
  const content = (l: string[], s: string[]): number => l.length * LH_LABEL + (s.length ? s.length * LH_NOTE + 2 : 0);
  const h = Math.max(minH, Math.ceil(Math.max(...wrapped.map(({ l, s }) => content(l, s))) + 20));
  let k = 0;
  return wrapped.map(({ nd, l, s }) => {
    const top = (h - content(l, s)) / 2;
    const lines: Line[] = [
      ...l.map((t, i): Line => ({ t, cls: 'txt-label', y: top + 11.5 + i * LH_LABEL })),
      ...s.map((t, i): Line => ({ t, cls: 'txt-note', y: top + l.length * LH_LABEL + 2 + 10 + i * LH_NOTE })),
    ];
    const n = nd.card ? String(nd.n ?? ++k) : undefined;
    return { ...nd, w, h, lines, tone: nd.tone ?? 'default', n };
  });
}

/** Split a flat list back into groups of the given sizes. */
export function split<T>(list: T[], sizes: number[]): T[][] {
  let i = 0;
  return sizes.map((s) => list.slice(i, (i += s)));
}

/* ---------------------------------------------------------------- arrows */

/** Filled arrowhead at (x, y) pointing along dir. */
export function head(x: number, y: number, dir: 'r' | 'l' | 'd' | 'u'): string {
  const L = 7.5, W = 3.2;
  const p: Record<typeof dir, string> = {
    r: `M${f(x)} ${f(y)}l${-L} ${-W}v${2 * W}Z`,
    l: `M${f(x)} ${f(y)}l${L} ${-W}v${2 * W}Z`,
    d: `M${f(x)} ${f(y)}l${-W} ${-L}h${2 * W}Z`,
    u: `M${f(x)} ${f(y)}l${-W} ${L}h${2 * W}Z`,
  };
  return p[dir];
}

/* ---------------------------------------------------------------- flow */

export type FlowNode = FigNode & { col?: number };
export type FlowEdge = { from: string; to: string; label?: string; tone?: Tone; particles?: boolean | number };
type Lay = { d: string; head: string; lab?: P };
export type FlowLayout = {
  size: P;
  narrow: P;
  boxes: (Box & { wp: P; np: P })[];
  edges: (FlowEdge & { w: Lay; n: Lay })[];
};

/** Columns by longest path from the sources (or `col`), left → right wide, top → bottom narrow. */
export function flowLayout(nodes: FlowNode[], edges: FlowEdge[], W = WIDE, NW = NARROW): FlowLayout {
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  for (const e of edges) if (!idx.has(e.from) || !idx.has(e.to)) throw new Error(`FlowFigure: edge ${e.from} → ${e.to} names an unknown node`);
  const rank = nodes.map((n) => n.col ?? 0);
  for (let pass = 0; pass < nodes.length; pass++) {
    let moved = false;
    for (const e of edges) {
      const a = idx.get(e.from)!, b = idx.get(e.to)!;
      if (nodes[b].col === undefined && rank[b] < rank[a] + 1 && a !== b) {
        rank[b] = rank[a] + 1;
        moved = true;
      }
    }
    if (!moved) break;
  }
  const ranks = [...new Set(rank)].sort((a, b) => a - b);
  const R = ranks.length;
  const groups = ranks.map((r) => nodes.map((_, i) => i).filter((i) => rank[i] === r));
  const col = nodes.map((_, i) => ranks.indexOf(rank[i]));
  const K = Math.max(...groups.map((g) => g.length));

  const MX = 16, NMX = 12, NG = 14, VG = 26, NGAP = 36;
  const gap = Math.max(44, ...edges.map((e) => (e.label ? wNote(e.label) + 24 : 0)));
  const wideMax = (W - 2 * MX - (R - 1) * gap) / R;
  const narrowMax = (NW - 2 * NMX - (K - 1) * NG) / K;
  const w = Math.floor(Math.min(wantW(nodes.map((n) => n.label)), wideMax, narrowMax));
  const bx = boxes(nodes, w);
  const h = bx[0].h;

  // wide: columns spread to the width (but not absurdly far apart), centred
  const pitch = R > 1 ? Math.min((W - 2 * MX - w) / (R - 1), w + Math.max(gap, 132)) : 0;
  const x0 = (W - (w + (R - 1) * pitch)) / 2;
  const gh = (k: number): number => k * h + (k - 1) * VG;
  const back = edges.some((e) => col[idx.get(e.to)!] < col[idx.get(e.from)!]);
  const top = 26;
  const Hc = gh(K);
  const H = Math.ceil(top + Hc + 26 + (back ? 22 : 0));
  // narrow: one row per column, nodes side by side, centred
  const NH = Math.ceil(24 + R * h + (R - 1) * NGAP + 24 + (back ? 22 : 0));

  const pos = nodes.map((_, i) => {
    const c = col[i], g = groups[c], k = g.indexOf(i);
    const wp: P = [x0 + c * pitch, top + (Hc - gh(g.length)) / 2 + k * (h + VG)];
    const rowW = g.length * w + (g.length - 1) * NG;
    const np: P = [(NW - rowW) / 2 + k * (w + NG), 24 + c * (h + NGAP)];
    return { wp, np };
  });
  const out = bx.map((b, i) => ({ ...b, ...pos[i] }));
  const botW = top + Hc + 14;

  const lay = edges.map((e) => {
    const a = idx.get(e.from)!, b = idx.get(e.to)!;
    const A = pos[a], B = pos[b];
    let wl: Lay, nl: Lay;
    if (col[b] > col[a]) {
      const x1 = A.wp[0] + w, y1 = A.wp[1] + h / 2, x2 = B.wp[0], y2 = B.wp[1] + h / 2;
      const xm = x1 + (pitch - w) / 2;
      wl = Math.abs(y1 - y2) < 0.5
        ? { d: pl([[x1, y1], [x2, y2]]), head: head(x2, y2, 'r'), lab: [(x1 + x2) / 2, y1] }
        : { d: pl([[x1, y1], [xm, y1], [xm, y2], [x2, y2]]), head: head(x2, y2, 'r'), lab: [xm, (y1 + y2) / 2] };
      const u1 = A.np[0] + w / 2, v1 = A.np[1] + h, u2 = B.np[0] + w / 2, v2 = B.np[1];
      const vm = v1 + NGAP / 2;
      nl = Math.abs(u1 - u2) < 0.5
        ? { d: pl([[u1, v1], [u2, v2]]), head: head(u2, v2, 'd'), lab: [u1, (v1 + v2) / 2] }
        : { d: pl([[u1, v1], [u1, vm], [u2, vm], [u2, v2]]), head: head(u2, v2, 'd'), lab: [(u1 + u2) / 2, vm] };
    } else if (col[b] === col[a]) {
      // same column: straight down (wide) / sideways (narrow)
      const down = B.wp[1] > A.wp[1];
      const cx = A.wp[0] + w / 2;
      const y1 = down ? A.wp[1] + h : A.wp[1], y2 = down ? B.wp[1] : B.wp[1] + h;
      wl = { d: pl([[cx, y1], [cx, y2]]), head: head(cx, y2, down ? 'd' : 'u'), lab: [cx, (y1 + y2) / 2] };
      const right = B.np[0] > A.np[0];
      const v = A.np[1] + h / 2;
      const u1 = right ? A.np[0] + w : A.np[0], u2 = right ? B.np[0] : B.np[0] + w;
      nl = { d: pl([[u1, v], [u2, v]]), head: head(u2, v, right ? 'r' : 'l'), lab: [(u1 + u2) / 2, v] };
    } else {
      // back edge: under everything, arriving from below
      const ax = A.wp[0] + w / 2, bxx = B.wp[0] + w / 2;
      wl = { d: pl([[ax, A.wp[1] + h], [ax, botW + 8], [bxx, botW + 8], [bxx, B.wp[1] + h]]), head: head(bxx, B.wp[1] + h, 'u'), lab: [(ax + bxx) / 2, botW + 8] };
      const au = A.np[0] + w, bu = B.np[0] + w, side = Math.min(NW - 6, Math.max(au, bu) + 10);
      nl = { d: pl([[au, A.np[1] + h / 2], [side, A.np[1] + h / 2], [side, B.np[1] + h / 2], [bu, B.np[1] + h / 2]]), head: head(bu, B.np[1] + h / 2, 'l'), lab: [side, (A.np[1] + B.np[1] + h) / 2] };
    }
    return { ...e, w: wl, n: nl };
  });
  return { size: [W, H], narrow: [NW, NH], boxes: out, edges: lay };
}

/* ---------------------------------------------------------------- stack */

export type StackLayer = {
  label: string;
  sub?: string;
  /** What builds/configures this layer ("Ansible"), lettered on the side. */
  tool?: string;
  tone?: Tone;
  items: FigNode[];
};
type Rect = [number, number, number, number];
export type StackLayout = {
  size: P;
  narrow: P;
  boxes: (Box & { wp: P; np: P })[];
  bands: { layer: StackLayer; index: string; w: Rect; n: Rect; head: { wp: P; np: P; lines: Line[] }; tool?: { wp: P; np: P; bracket: string } }[];
};

/** Layers bottom-up (layers[0] is the bottom). Wide: bands with the name on the left, items in
 *  rows, the tool on the right. Narrow: full-width bands, name on top, items two to a row. */
export function stackLayout(layers: StackLayer[], W = WIDE, NW = NARROW): StackLayout {
  const MX = 16, NMX = 12, BP = 12, G = 10, BG = 12, LW = 150;
  const hasTool = layers.some((l) => l.tool);
  const TW = hasTool ? Math.min(150, Math.max(84, ...layers.map((l) => (l.tool ? wLabel(l.tool) + 40 : 0)))) : 0;
  const bandW = W - 2 * MX - TW;
  const IA = bandW - LW - BP;
  const bandN = NW - 2 * NMX;
  const NIA = bandN - 2 * BP;
  const items = layers.flatMap((l) => l.items);
  const narrowMax = (NIA - G) / 2;
  const w0 = Math.min(wantW(items.map((i) => i.label), 92, 176), narrowMax, IA);
  const cw = Math.max(1, Math.floor((IA + G) / (w0 + G)));
  // grow the boxes to fill the wide rows (never past two-up on a phone)
  const w = Math.floor(Math.min(narrowMax, (IA - (cw - 1) * G) / cw, 190));
  const all = boxes(items, w, 34);
  const h = all[0]?.h ?? 34;
  const per = split(all, layers.map((l) => l.items.length));
  const cn = Math.max(1, Math.floor((NIA + G) / (w + G)));
  const gridH = (n: number, c: number): number => {
    const r = Math.ceil(n / c);
    return r ? r * h + (r - 1) * G : 0;
  };

  const heads = layers.map((l) => {
    const lab = wrap(l.label, Math.floor((LW - 20) / LABEL_CH));
    const sub = l.sub ? wrap(l.sub, Math.floor((LW - 20) / NOTE_CH)) : [];
    const lines: Line[] = [
      ...lab.map((t, i): Line => ({ t, cls: 'txt-label', y: 17 + i * 15 })),
      ...sub.map((t, i): Line => ({ t, cls: 'txt-note', y: 17 + lab.length * 15 + 2 + i * 13.5 })),
    ];
    return { lines, h: 17 + lab.length * 15 + sub.length * 13.5 };
  });

  const out: StackLayout['boxes'] = [];
  const bands: StackLayout['bands'] = [];
  let y = 20, ny = 16;
  for (let li = layers.length - 1; li >= 0; li--) {
    const l = layers[li], bx = per[li], hd = heads[li];
    const gw = gridH(bx.length, cw), gn = gridH(bx.length, cn);
    const bh = Math.max(gw + 2 * BP, hd.h - 2 + 2 * BP);
    const bhN = BP + hd.h - 2 + (gn ? BP + gn : 0) + BP;
    const top = y + (bh - gw) / 2;
    const rowN = Math.min(cn, bx.length) * (w + G) - G;
    bx.forEach((b, j) => {
      const wp: P = [MX + LW + (j % cw) * (w + G), top + Math.floor(j / cw) * (h + G)];
      const np: P = [NMX + (bandN - rowN) / 2 + (j % cn) * (w + G), ny + BP + hd.h - 2 + BP + Math.floor(j / cn) * (h + G)];
      out.push({ ...b, wp, np });
    });
    const bx0 = MX + bandW + 10;
    bands.push({
      layer: l,
      index: `L${li + 1}`,
      w: [MX, y, bandW, bh],
      n: [NMX, ny, bandN, bhN],
      head: { wp: [MX + BP, y + BP + 8], np: [NMX + BP, ny + BP + 8], lines: hd.lines },
      tool: l.tool
        ? { wp: [bx0 + 16, y + bh / 2 + 4], np: [NMX + bandN - BP, ny + BP + 8], bracket: `M${f(bx0)} ${f(y + 6)}h6v${f(bh - 12)}h-6M${f(bx0 + 6)} ${f(y + bh / 2)}h5` }
        : undefined,
    });
    y += bh + BG;
    ny += bhN + BG;
  }
  return { size: [W, Math.ceil(y - BG + 20)], narrow: [NW, Math.ceil(ny - BG + 16)], boxes: out, bands };
}

/* ---------------------------------------------------------------- compare */

export type StampSpec = string | { text: string; sub?: string; tone?: 'warn' | 'ok' | 'wip' };
export type CompareRow = { label: string; note?: string; nodes: FigNode[]; stamp?: StampSpec };
export type CompareLayout = {
  size: P;
  narrow: P;
  boxes: (Box & { wp: P; np: P })[];
  rows: { row: CompareRow; wp: P; np: P; stamp?: { wp: P; np: [number, number, number]; text: string; sub?: string; tone?: 'warn' | 'ok' | 'wip' } }[];
  arrows: { w: string; n: string; heads: { w: string; n: string } };
  rules: { w: string; n: string };
};

/** Rows of linear flows (before / after). Wide: rows stacked, nodes aligned by index. Narrow: the
 *  rows become columns side by side, flowing down. */
export function compareLayout(rows: CompareRow[], W = WIDE, NW = NARROW): CompareLayout {
  const MX = 16, NMX = 12, NCG = 16, TH = 36, NTOP = 58, NGAP = 30;
  const R = rows.length;
  const K = Math.max(...rows.map((r) => r.nodes.length));
  const colW = (NW - 2 * NMX - (R - 1) * NCG) / R;
  const w = Math.floor(Math.min(wantW(rows.flatMap((r) => r.nodes.map((n) => n.label))), (W - 2 * MX - (K - 1) * 40) / K, colW - 6));
  const all = boxes(rows.flatMap((r) => r.nodes), w);
  const h = all[0].h;
  const per = split(all, rows.map((r) => r.nodes.length));
  const pitch = K > 1 ? Math.min((W - 2 * MX - w) / (K - 1), w + 110) : 0;
  const rowH = TH + h + 40;
  const stamps = rows.some((r) => r.stamp);

  const out: CompareLayout['boxes'] = [];
  const aw: string[] = [], an: string[] = [], hw: string[] = [], hn: string[] = [];
  const meta = rows.map((row, r) => {
    const top = 18 + r * rowH;
    const cx = NMX + r * (colW + NCG);
    per[r].forEach((b, j) => {
      const wp: P = [MX + j * pitch, top + TH];
      const np: P = [cx + (colW - w) / 2, NTOP + j * (h + NGAP)];
      out.push({ ...b, wp, np });
      if (j) {
        const px = MX + (j - 1) * pitch + w, cy = top + TH + h / 2;
        aw.push(`M${f(px)} ${f(cy)}H${f(wp[0])}`);
        hw.push(head(wp[0], cy, 'r'));
        const ux = np[0] + w / 2;
        an.push(`M${f(ux)} ${f(np[1] - NGAP)}V${f(np[1])}`);
        hn.push(head(ux, np[1], 'd'));
      }
    });
    let stamp: CompareLayout['rows'][number]['stamp'];
    if (row.stamp) {
      const s = typeof row.stamp === 'string' ? { text: row.stamp } : row.stamp;
      const sw = Math.max(monoWidth(s.text, 24, 0.16), s.sub ? monoWidth(s.sub, 9.5, 0.22) : 0) + 36;
      const tw = Math.max(monoWidth(row.label.toUpperCase(), 13, 0.14), row.note ? wNote(row.note) : 0);
      const lastY = NTOP + (per[r].length - 1) * (h + NGAP) + h;
      const k = Math.min(1, (colW - 4) / sw);
      stamp = { ...s, wp: [MX + tw + 56 + sw / 2, top + 6], np: [cx + colW / 2, lastY + 40, Math.round(k * 100) / 100] };
    }
    return { row, wp: [MX, top + 13] as P, np: [cx, 22] as P, stamp };
  });
  const rules = {
    w: rows.slice(1).map((_, r) => `M${MX} ${f(18 + (r + 1) * rowH - 20)}H${W - MX}`).join(''),
    n: rows.slice(1).map((_, r) => `M${f(NMX + (r + 1) * (colW + NCG) - NCG / 2)} 14V${f(NTOP + K * (h + NGAP) - NGAP + (stamps ? 50 : 6))}`).join(''),
  };
  return {
    size: [W, Math.ceil(18 + R * rowH - 22)],
    narrow: [NW, Math.ceil(NTOP + K * (h + NGAP) - NGAP + (stamps ? 76 : 20))],
    boxes: out,
    rows: meta,
    arrows: { w: aw.join(''), n: an.join(''), heads: { w: hw.join(''), n: hn.join('') } },
    rules,
  };
}

/* ---------------------------------------------------------------- lanes */

export type Lane = { id: string; label: string; sub?: string; tone?: Tone };
export type LaneStep = FigNode & { lane: string; col?: number; handoff?: string };
export type LanesLayout = {
  size: P;
  narrow: P;
  boxes: (Box & { wp: P; np: P })[];
  lanes: { lane: Lane; wp: P; np: P }[];
  rules: { w: string; n: string };
  links: { w: string; n: string; heads: { w: string; n: string } };
  hands: { w: string; n: string; heads: { w: string; n: string }; dia: { w: string; n: string }; labels: { t: string; wp: P; np: P; end: boolean }[] };
};

const dia = (x: number, y: number): string => `M${f(x)} ${f(y - 5)}l5 5l-5 5l-5 -5Z`;

/** Swimlanes × steps. Wide: lanes are rows, steps run left → right. Narrow: lanes are columns,
 *  steps run down. A step on a different lane than the one before it is a hand-off: heavier gold
 *  line, a diamond where it crosses into the lane, and an optional label. */
export function lanesLayout(lanes: Lane[], steps: LaneStep[], W = WIDE, NW = NARROW): LanesLayout {
  const MX = 16, NMX = 12, NG = 10, NTOP = 60, NGAP = 34;
  const LW = Math.round(Math.min(120, Math.max(64, ...lanes.map((l) => Math.max(monoWidth(l.label.toUpperCase(), 13, 0.14), l.sub ? wNote(l.sub) : 0) + 18))));
  const li = new Map(lanes.map((l, i) => [l.id, i]));
  for (const s of steps) if (!li.has(s.lane)) throw new Error(`LanesFigure: step ${s.id} is on unknown lane ${s.lane}`);
  const cols: number[] = [];
  steps.forEach((s, i) => cols.push(s.col ?? (i ? cols[i - 1] + 1 : 0)));
  const C = Math.max(...cols) + 1;
  const nL = lanes.length;
  const pitch = (W - 2 * MX - LW) / C;
  const colW = (NW - 2 * NMX - (nL - 1) * NG) / nL;
  const w = Math.floor(Math.min(wantW(steps.map((s) => s.label), 80, 170), pitch - 14, colW - 10));
  const bx = boxes(steps, w);
  const h = bx[0].h;
  const LH = h + 40;
  const top = 14;
  const laneY = (i: number): number => top + i * LH;
  const out = bx.map((b, i) => {
    const l = li.get(steps[i].lane)!;
    const wp: P = [MX + LW + cols[i] * pitch + (pitch - w) / 2, laneY(l) + (LH - h) / 2];
    const np: P = [NMX + l * (colW + NG) + (colW - w) / 2, NTOP + cols[i] * (h + NGAP)];
    return { ...b, wp, np };
  });
  const lw: string[] = [], ln: string[] = [], lhw: string[] = [], lhn: string[] = [];
  const hw: string[] = [], hn: string[] = [], hhw: string[] = [], hhn: string[] = [], dw: string[] = [], dn: string[] = [];
  const labels: { t: string; wp: P; np: P; end: boolean }[] = [];
  for (let i = 1; i < steps.length; i++) {
    const A = out[i - 1], B = out[i];
    const la = li.get(steps[i - 1].lane)!, lb = li.get(steps[i].lane)!;
    if (la === lb) {
      if (cols[i] === cols[i - 1]) continue;
      const cy = A.wp[1] + h / 2;
      lw.push(`M${f(A.wp[0] + w)} ${f(cy)}H${f(B.wp[0])}`);
      lhw.push(head(B.wp[0], cy, 'r'));
      const cx = A.np[0] + w / 2;
      ln.push(`M${f(cx)} ${f(A.np[1] + h)}V${f(B.np[1])}`);
      lhn.push(head(cx, B.np[1], 'd'));
      continue;
    }
    // hand-off, wide: out of A's right side (or bottom/top when stacked), into B's top/bottom
    const down = lb > la;
    const bx2 = B.wp[0] + w / 2, by2 = down ? B.wp[1] : B.wp[1] + h;
    const edgeY = down ? laneY(lb) : laneY(lb + 1);
    if (cols[i] > cols[i - 1]) {
      const y1 = A.wp[1] + h / 2;
      hw.push(`M${f(A.wp[0] + w)} ${f(y1)}H${f(bx2)}V${f(by2)}`);
    } else {
      hw.push(`M${f(A.wp[0] + w / 2)} ${f(down ? A.wp[1] + h : A.wp[1])}V${f(by2)}`);
    }
    hhw.push(head(bx2, by2, down ? 'd' : 'u'));
    dw.push(dia(bx2, edgeY));
    // narrow: down out of A, across the lane boundary, down into B
    const ax = A.np[0] + w / 2, bxn = B.np[0] + w / 2;
    const vm = Math.min(A.np[1] + h + NGAP / 2, B.np[1] - 10);
    const right = lb > la;
    const edgeX = NMX + (right ? lb : lb + 1) * (colW + NG) - NG / 2;
    hn.push(cols[i] > cols[i - 1] ? `M${f(ax)} ${f(A.np[1] + h)}V${f(vm)}H${f(bxn)}V${f(B.np[1])}` : `M${f(right ? A.np[0] + w : A.np[0])} ${f(A.np[1] + h / 2)}H${f(right ? B.np[0] : B.np[0] + w)}`);
    hhn.push(cols[i] > cols[i - 1] ? head(bxn, B.np[1], 'd') : head(right ? B.np[0] : B.np[0] + w, B.np[1] + h / 2, right ? 'r' : 'l'));
    dn.push(cols[i] > cols[i - 1] ? dia(edgeX, vm) : dia(edgeX, A.np[1] + h / 2));
    // label: beside the vertical (wide); inside the new lane, just above the crossing (narrow)
    const ly = (cols[i] > cols[i - 1] ? vm : A.np[1] + h / 2) - 7;
    if (steps[i].handoff) labels.push({ t: steps[i].handoff!, wp: [bx2 + 10, edgeY + (down ? -6 : 14)], np: [edgeX + (right ? 9 : -9), ly], end: !right });
  }
  const NH = NTOP + C * (h + NGAP) - NGAP + 18;
  return {
    size: [W, Math.ceil(top + nL * LH + 12)],
    narrow: [NW, Math.ceil(NH)],
    boxes: out,
    lanes: lanes.map((lane, i) => ({ lane, wp: [MX, laneY(i) + LH / 2 - 4], np: [NMX + i * (colW + NG) + colW / 2, 24] })),
    rules: {
      w: Array.from({ length: nL + 1 }, (_, i) => `M${MX} ${f(laneY(i))}H${W - MX}`).join(''),
      n: Array.from({ length: nL - 1 }, (_, i) => `M${f(NMX + (i + 1) * (colW + NG) - NG / 2)} 12V${f(NH - 6)}`).join('') + `M${NMX} 46H${NW - NMX}`,
    },
    links: { w: lw.join(''), n: ln.join(''), heads: { w: lhw.join(''), n: lhn.join('') } },
    hands: { w: hw.join(''), n: hn.join(''), heads: { w: hhw.join(''), n: hhn.join('') }, dia: { w: dw.join(''), n: dn.join('') }, labels },
  };
}

/* ---------------------------------------------------------------- bars */

export type Bar = FigNode & { value: number; /** Printed value (default: value + unit). */ display?: string };
export type Band = { from: number; to: number; label?: string };
type BarGeo = { x0: number; s: number; y: number; bar: string; val: P; ball: P };
export type BarsLayout = {
  size: P;
  narrow: P;
  bars: (Bar & { box: Box; at: { wp: P; np: P }; geo: { w: BarGeo; n: BarGeo }; text: string })[];
  axis: { w: string; n: string; ticks: { v: number; w: number; n: number }[]; wy: number; ny: number };
  band?: { w: string; n: string; label?: { wp: P; np: P; t: string } };
};

/** Horizontal bars from zero. Wide: names in a left column. Narrow: the name above each bar. */
export function barsLayout(bars: Bar[], opts: { max?: number; unit?: string; tick?: number; band?: Band } = {}, W = WIDE, NW = NARROW): BarsLayout {
  const { unit = '', band } = opts;
  const MX = 16, NMX = 12, BH = 14;
  const max = opts.max ?? Math.max(...bars.map((b) => b.value), band?.to ?? 0);
  const nice = (v: number): number => {
    const p = 10 ** Math.floor(Math.log10(v));
    return [1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => v / m <= 6) ?? p * 10;
  };
  const tick = opts.tick ?? nice(max);
  const axisMax = Math.ceil(max / tick - 1e-9) * tick;
  const text = (b: Bar): string => b.display ?? `${b.value}${unit ? ` ${unit}` : ''}`;
  const clickable = bars.some((b) => b.card);
  const valW = Math.max(...bars.map((b) => monoWidth(text(b), 12, 0.04))) + 12 + (clickable ? 26 : 0);
  const LW = Math.min(220, Math.max(96, ...bars.map((b) => Math.max(wLabel(b.label), b.sub ? wNote(b.sub) : 0) + 20)));
  const subs = bars.some((b) => b.sub);
  const bx = boxes(bars, 100);
  const L = {
    w: { x0: MX + LW, x1: W - MX - valW, top: band?.label ? 40 : 22, pitch: subs ? 40 : 32 },
    n: { x0: NMX, x1: NW - NMX - valW, top: band?.label ? 38 : 18, pitch: subs ? 54 : 42 },
  };
  const geo = (k: 'w' | 'n', b: Bar, i: number): BarGeo => {
    const l = L[k];
    const s = (l.x1 - l.x0) / axisMax;
    const y = k === 'w' ? l.top + i * l.pitch + (l.pitch - BH) / 2 : l.top + i * l.pitch + (subs ? 30 : 18);
    const x1 = l.x0 + b.value * s;
    const vx = x1 + 8;
    return { x0: l.x0, s, y, bar: rc(l.x0, y, Math.max(1, b.value * s), BH), val: [vx, y + BH / 2 + 4], ball: [vx + monoWidth(text(b), 12, 0.04) + 16, y + BH / 2] };
  };
  const out = bars.map((b, i) => {
    const w = geo('w', b, i), n = geo('n', b, i);
    const lw: P = [MX, w.y + BH / 2 + (b.sub ? -3 : 4)];
    const ln: P = [NMX, L.n.top + i * L.n.pitch + 12];
    return { ...b, box: bx[i], at: { wp: lw, np: ln }, geo: { w, n }, text: text(b) };
  });
  const ay = (k: 'w' | 'n'): number => L[k].top + bars.length * L[k].pitch + 6;
  const ticks = Array.from({ length: Math.round(axisMax / tick) + 1 }, (_, i) => i * tick);
  const X = (k: 'w' | 'n', v: number): number => L[k].x0 + (v * (L[k].x1 - L[k].x0)) / axisMax;
  const axis = (k: 'w' | 'n'): string => `M${f(L[k].x0)} ${f(ay(k))}H${f(L[k].x1)}` + ticks.map((v) => `M${f(X(k, v))} ${f(ay(k))}v5`).join('');
  const bandPath = (k: 'w' | 'n'): string => (band ? rc(X(k, band.from), L[k].top - 8, X(k, band.to) - X(k, band.from), ay(k) - L[k].top + 8) : '');
  return {
    size: [W, Math.ceil(ay('w') + 30)],
    narrow: [NW, Math.ceil(ay('n') + 30)],
    bars: out,
    axis: { w: axis('w'), n: axis('n'), ticks: ticks.map((v) => ({ v, w: X('w', v), n: X('n', v) })), wy: ay('w'), ny: ay('n') },
    band: band
      ? { w: bandPath('w'), n: bandPath('n'), label: band.label ? { t: band.label, wp: [X('w', band.to), L.w.top - 16], np: [X('n', band.to), L.n.top - 16] } : undefined }
      : undefined,
  };
}
