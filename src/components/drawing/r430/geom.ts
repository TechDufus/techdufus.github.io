/**
 * R430 geometry for Sheet 02B (TD-LAB-02B).
 *
 * Model space, millimetres, the kit's axes: x = width from the LEFT EDGE OF THE RACK EARS as seen
 * from the front (0 … 482.4), y = height from the chassis bottom, z = depth from the rack flange
 * to the rear wall (0 … 642.3). Sizes are Dell's chassis dimensions (src/data/lab/rack.ts).
 *
 * The front and rear faces are the cabinet's panel line work (../rack/model.ts), so a zone
 * traced in rack.ts shows on every sheet. Inside the chassis is schematic: footprints traced as
 * fractions of the body from the "inside the system" figure in Dell's owner's manual
 * (redundant-PSU chassis), front to back. Dell publishes no coordinates for the board, and the
 * figure isn't to scale, so nothing in the plan is dimensioned. What the figure doesn't settle
 * for this machine is left out: the fans are one band (their count isn't recorded), and the
 * optional riser and the controller's seat on the board aren't drawn.
 */
import { RACK_19_MM } from '../../../lib/drawing/projection';
import { R, n, type Box2 } from '../r730/geom';
import { frontPanel, rearPanel, slotOf$ } from '../rack/model';
import { r430, type R430Drive } from '../../../data/lab/r430';

/* ------------------------------------------------------------------ sizes (mm) */
const { body, earsWidth } = r430.dims;
export const W = body.w; // 434.0 body width
export const H = body.h; // 42.8
export const D = body.d; // 642.3 flange → rear wall
export const WE = earsWidth; // 482.4 over the ears
export const EAR = (WE - W) / 2; // 24.2 each side
const slot = slotOf$('r430');
/** Ear front to the rack flange (Dell's Za). */
export const EAR_D = slot.plate?.t ?? 0;

/* ------------------------------------------------------------------ faces (rack.ts zones) */
/** Front panel line work, face-local mm (u from the left ear's edge, v down from the top). */
export const FRONT = frontPanel(slot);
/** Rear panel line work seen from behind; its body starts `REAR_OX` in from the frame's left. */
export const REAR = rearPanel(slot);
export const REAR_OX = RACK_19_MM - slot.body.x - slot.body.w;

export type Rect = { x: number; y: number; w: number; h: number };
const zone = (face: 'front' | 'rear', id: string, w: number): Rect => {
  const z = r430.panels[face].zones.find((q) => q.id === id);
  if (!z) throw new Error(`r430 geom: no ${face} zone ${id}`);
  return { x: z.x0 * w, y: z.y0 * H, w: (z.x1 - z.x0) * w, h: (z.y1 - z.y0) * H };
};
/** A front zone in face mm (u from the left ear's edge). */
export const fz = (id: string): Rect => zone('front', id, WE);
/** A rear zone in face mm, seen from behind (u from the left edge of the body). */
export const rz = (id: string): Rect => zone('rear', id, W);

/* ------------------------------------------------------------------ bays & drives */
export const bays = r430.bays.list;
/** A bay's carrier opening on the front face, by its chassis number. */
export const bayRect = (bay: number): Rect => {
  const b = bays.find((q) => q.n === bay);
  if (!b) throw new Error(`r430 geom: no bay ${bay}`);
  return fz(b.zone);
};
export const drives: R430Drive[] = [...r430.drives].sort((a, b) => a.bay - b.bay);
/** Lettering on a carrier: "MX500 500 GB". */
export const driveShort = (d: R430Drive): string => `MX500 ${d.sizeGB} GB`;

/* ------------------------------------------------------------------ internals (plan, schematic) */
/** A footprint from fractions of the body: across (0 = left wall, seen from the front) and front to back. */
const box = (x0: number, x1: number, z0: number, z1: number): Box2 => ({ x: EAR + x0 * W, z: z0 * D, w: (x1 - x0) * W, d: (z1 - z0) * D });
/** Plan rect (u = x, v = −z) for a footprint. */
const PR = (b: Box2): string => R(b.x, -b.z - b.d, b.w, b.d);
/** A rear-panel zone (seen from behind) as a plan footprint from depth z0 to the rear wall: the rear view's left is the plan's right. */
const rearRow = (id: string, z0: number): Box2 => {
  const q = rz(id);
  return { x: EAR + W - (q.x + q.w), z: z0 * D, w: q.w, d: (1 - z0) * D };
};

/** How far back the drive cage reaches, as a fraction of the depth: up to the backplane. */
const CAGE = 0.27;
const DIMM_Z: [number, number] = [0.434, 0.69];
const DIMM_Z2: [number, number] = [0.705, 0.945];
/** The four banks of sockets, in Dell's lettering, left to right. */
const BANKS: { box: Box2; sockets: string[] }[] = [
  { box: box(0.52, 0.613, ...DIMM_Z), sockets: ['A3', 'A7', 'A4', 'A8'] },
  { box: box(0.826, 0.917, ...DIMM_Z), sockets: ['A1', 'A5', 'A2', 'A6'] },
  { box: box(0.705, 0.751, ...DIMM_Z2), sockets: ['B1', 'B2'] },
  { box: box(0.949, 0.995, ...DIMM_Z2), sockets: ['B3', 'B4'] },
];

const PARTS: Record<string, Box2> = {
  backplane: box(0.01, 0.99, 0.275, 0.29),
  fans: box(0.02, 0.98, 0.305, 0.405),
  cpu1: box(0.64, 0.815, 0.469, 0.664),
  cpu2: box(0.77, 0.935, 0.705, 0.883),
  dimms: BANKS[1].box,
};
/** An internal part (by its r430.internal id) as a plan footprint. */
export const part = (id: string): Box2 => {
  const b = PARTS[id];
  if (!b) throw new Error(`r430 geom: no plan footprint for ${id}`);
  return b;
};
export const psuBoxes: Box2[] = ['psu-1', 'psu-2'].map((id) => rearRow(id, 0.595));
export const dimmBanks: Box2[] = BANKS.map((b) => b.box);

/** Every DIMM socket; `fitted` from r430.memory.fitted. */
export const sockets = BANKS.flatMap(({ box: b, sockets: names }) => {
  const pitch = b.w / names.length;
  return names.map((name, i) => ({ name, fitted: r430.memory.fitted.includes(name), x: b.x + i * pitch + pitch * 0.2, z: b.z, w: pitch * 0.6, d: b.d }));
});
{
  const drawn = sockets.filter((q) => q.fitted).length;
  if (sockets.length !== r430.memory.sockets || drawn !== r430.memory.dimms) {
    throw new Error(`r430 geom: the plan draws ${sockets.length} sockets and ${drawn} sticks, the data says ${r430.memory.sockets} and ${r430.memory.dimms}`);
  }
}

/** The plan (cover off), model mm with v = −z, grouped by pen. No lettering. */
export function planPaths() {
  const board = box(0.27, 0.995, 0.43, 0.995), pib = box(0.02, 0.25, 0.42, 0.58);
  // the carriers from above: the left pair's and the block's three columns, back to the cage's rear
  const cols = ['bay-a', 'bay-b', 'bay-c', 'bay-d', 'bay-e'].map((id) => {
    const q = fz(id);
    return R(q.x, -CAGE * D, q.w, CAGE * D + EAR_D);
  });
  const fin = (b: Box2): string => Array.from({ length: 7 }, (_, i) => `M${n(b.x + 6)} ${n(-b.z - b.d + ((i + 1) * b.d) / 8)}h${n(b.w - 12)}`).join('');
  const psuHandles = psuBoxes.map((p) => R(p.x + p.w * 0.25, -D - 9, p.w * 0.5, 9)).join('');
  return {
    shell: R(EAR, -D, W, D) + R(0, 0, EAR, EAR_D) + R(WE - EAR, 0, EAR, EAR_D) + R(EAR, 0, W, EAR_D),
    cpus: PR(PARTS.cpu1) + PR(PARTS.cpu2),
    board: PR(board) + PR(pib) + PR(PARTS.fans) + PR(PARTS.backplane),
    psus: psuBoxes.map(PR).join('') + psuHandles,
    cage: cols.join(''),
    fins: fin(PARTS.cpu1) + fin(PARTS.cpu2),
    sockets: sockets.map(PR).join(''),
    sticks: sockets.filter((q) => q.fitted).map(PR).join(''),
  };
}

/* ------------------------------------------------------------------ balloon numbers */
/** One numbering for the sheet: drives by bay, the pool, the machine, then what is inside it. */
export const NUM: Record<string, number> = Object.fromEntries(
  [...drives.map((d) => d.id), r430.pool.id, 'server', ...r430.internal.map((p) => p.id)].map((id, i) => [id, i + 1]),
);

/** Sheet 02B's stamp: as built since the R430 joined the cluster. */
export const STAMP = { text: 'AS BUILT', sub: 'R430 · 2026-11-08', tone: 'ok' as const };
