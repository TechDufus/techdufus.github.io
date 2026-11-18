/**
 * R730-2 geometry for Sheet 02B (TD-LAB-02B).
 *
 * The R730-2 is the R730's chassis with the 8-bay backplane (Dell's dimensions are the same), so
 * the plan reuses Sheet 02A's schematic board (../r730/geom.ts: backplane, fans, shroud, CPUs,
 * DIMM banks, PERC, NDC, risers, PSUs) and changes only what this machine changes: eight carriers
 * in the cage, riser 3 absent, and a GPU on riser 2.
 *
 * Model space, millimetres, the kit's axes: x = width from the LEFT EDGE OF THE RACK EARS as seen
 * from the front (0 … 482.4), y = height from the chassis bottom, z = depth from the rack flange
 * to the rear wall (0 … 684).
 *
 * The front and rear faces are the cabinet's panel line work (../rack/model.ts), so a zone traced
 * in rack.ts shows on every sheet. Dell publishes no board coordinates, so the inside is
 * schematic and nothing in the plan is dimensioned. What the R730 sheet doesn't settle is left
 * out: which physical sockets hold the four sticks (all 24 sockets are drawn, the fitted ones are
 * only lettered), and where riser 3 would be. The GPU is a schematic footprint on riser 2: its
 * length isn't known.
 */
import { RACK_19_MM, join } from '../../../lib/drawing/projection';
import { D, EAR, EAR_D, FANS, H, HANDLES, Hl, O, PR, R, Vl, W, WE, dimmBanks as boardBanks, dimmSockets, n, part as boardPart, type Box2 } from '../r730/geom';
import { frontPanel, rearPanel, slotOf$ } from '../rack/model';
import { BAY_ZONE, r7302, type R7302Drive } from '../../../data/lab/r730-2';

export { D, EAR, EAR_D, H, W, WE };

/* ------------------------------------------------------------------ sizes (mm) */
{
  const { body, earsWidth } = r7302.dims;
  if (body.w !== W || body.h !== H || body.d !== D || earsWidth !== WE) {
    throw new Error('r730-2 geom: the R730-2 is no longer the R730 chassis (r730/geom.ts sizes differ)');
  }
  if (FANS !== r7302.fans.count) throw new Error('r730-2 geom: the plan draws the R730 fan row and the data has another count');
}
const slot = slotOf$('r730-2');

/* ------------------------------------------------------------------ faces (rack.ts zones) */
/** Front panel line work, face-local mm (u from the left ear's edge, v down from the top). */
export const FRONT = frontPanel(slot);
/** Rear panel line work seen from behind; its body starts `REAR_OX` in from the frame's left. */
export const REAR = rearPanel(slot);
export const REAR_OX = RACK_19_MM - slot.body.x - slot.body.w;

export type Rect = { x: number; y: number; w: number; h: number };
const zone = (face: 'front' | 'rear', id: string, w: number): Rect => {
  const z = r7302.panels[face].zones.find((q) => q.id === id);
  if (!z) throw new Error(`r730-2 geom: no ${face} zone ${id}`);
  return { x: z.x0 * w, y: z.y0 * H, w: (z.x1 - z.x0) * w, h: (z.y1 - z.y0) * H };
};
/** A front zone in face mm (u from the left ear's edge). */
export const fz = (id: string): Rect => zone('front', id, WE);
/** A rear zone in face mm, seen from behind (u from the left edge of the body). */
export const rz = (id: string): Rect => zone('rear', id, W);

/* ------------------------------------------------------------------ bays & drives */
export const bays = r7302.bays.list;
const cage = fz(BAY_ZONE);
const PITCH = cage.w / r7302.bays.front;
/** A bay's carrier opening on the front face: cell `bay` of the zone, left to right (0–7). */
export const bayRect = (bay: number): Rect => {
  if (!bays.some((b) => b.n === bay)) throw new Error(`r730-2 geom: no bay ${bay}`);
  return { x: cage.x + bay * PITCH, y: cage.y, w: PITCH, h: cage.h };
};
export const drives: R7302Drive[] = [...r7302.drives].sort((a, b) => a.bay - b.bay);
/** Lettering on a carrier: "MX500 500 GB", "P210 256 GB". */
export const driveShort = (d: R7302Drive): string => `${d.maker === 'Crucial' ? 'MX500' : d.model.split(' ')[0]} ${d.sizeGB} GB`;
export const pools = r7302.pools;

/* ------------------------------------------------------------------ internals (plan, schematic) */
const riser2 = boardPart('riser-2');
/** The GPU stands on riser 2, in the two slot positions its rear zone covers, and runs forward over the board. Schematic length. */
const GPU_LEN = 200;
const gpuBox: Box2 = { x: riser2.x, z: riser2.z - GPU_LEN, w: riser2.w, d: GPU_LEN + 8 };

/** An internal part (by its r7302.internal id) as a plan footprint: Sheet 02A's board, plus the GPU. */
export const part = (id: string): Box2 => (id === 'gpu' ? gpuBox : boardPart(id));

export const psuBoxes: Box2[] = ['psu-1', 'psu-2'].map(boardPart);
export const dimmBanks: Box2[] = boardBanks();
export const sockets = dimmSockets();
if (sockets.length !== r7302.memory.sockets) {
  throw new Error(`r730-2 geom: the plan draws ${sockets.length} sockets, the data says ${r7302.memory.sockets}`);
}

/** The plan (cover off), model mm with v = −z, grouped by pen. No lettering. */
export function planPaths() {
  const bp = part('backplane'), fans = part('fans'), shroud = part('shroud'), perc = part('perc'), ndc = part('ndc');
  const cpus = [part('cpu1'), part('cpu2')];
  const risers = [part('riser-1'), riser2];
  const fw = fans.w / FANS;
  // the carriers from above, between the front plate and the backplane: the cage's walls
  const walls = Array.from({ length: r7302.bays.front + 1 }, (_, i) => Vl(cage.x + i * PITCH, 0, -bp.z)).join('');
  // the part of the NDC that riser 2 covers
  const hx0 = Math.max(ndc.x, riser2.x), hx1 = Math.min(ndc.x + ndc.w, riser2.x + riser2.w);
  const hidden = hx1 > hx0 ? PR({ x: hx0, z: ndc.z, w: hx1 - hx0, d: ndc.d }) : '';
  return {
    /** chassis walls and the front plate (ears + control panels) */
    shell: join(R(EAR, -D, W, D), R(0, 0, WE, EAR_D)),
    cage: walls,
    board: join(PR(bp), PR(perc), Vl(perc.x + perc.w - 8, -perc.z, -perc.d), PR(ndc)),
    fans: join(PR(fans), ...Array.from({ length: FANS - 1 }, (_, i) => Vl(fans.x + (i + 1) * fw, -fans.z, -fans.d)), ...Array.from({ length: FANS }, (_, i) => O(fans.x + (i + 0.5) * fw, -fans.z - fans.d / 2, 15) + O(fans.x + (i + 0.5) * fw, -fans.z - fans.d / 2, 4.5))),
    cpus: join(...cpus.map(PR), ...cpus.map((c) => R(c.x + 8, -c.z - c.d + 8, c.w - 16, c.d - 16))),
    fins: cpus.map((c) => Array.from({ length: 7 }, (_, i) => Vl(c.x + ((i + 1) * c.w) / 8, -c.z - c.d + 2, c.d - 4)).join('')).join(''),
    sockets: sockets.map(PR).join(''),
    risers: join(...risers.map(PR), ...risers.map((b) => Hl(b.x + 2, -b.z - 6, b.w - 4))),
    riserFill: risers.map(PR).join(''),
    hidden,
    /** the card: drawn over riser 2 and what lies beneath it */
    gpu: PR(gpuBox),
    // bodies to the rear wall, then the handle loop out to HANDLES
    psus: join(...psuBoxes.map(PR), ...psuBoxes.map((b) => `M${n(b.x + 10)} ${n(-D)}v${n(-(HANDLES - D))}h${n(b.w - 20)}v${n(HANDLES - D)}`), ...psuBoxes.map((b) => O(b.x + b.w / 2, 24 - D, 11) + Hl(b.x + b.w / 2 - 11, 24 - D, 22) + Vl(b.x + b.w / 2, 13 - D, 22))),
    shroud: PR(shroud),
    /** centre lines through the sockets */
    ctr: join(...cpus.map((c) => Hl(c.x - 8, -c.z - c.d / 2, c.w + 16) + Vl(c.x + c.w / 2, -c.z + 8, -c.d - 16))),
  };
}

/* ------------------------------------------------------------------ balloon numbers */
/** One numbering for the sheet: drives by bay, the pools, the machine, then what is inside it. */
export const NUM: Record<string, number> = Object.fromEntries(
  [...drives.map((d) => d.id), ...pools.map((p) => p.id), 'server', ...r7302.internal.map((p) => p.id)].map((id, i) => [id, i + 1]),
);

/** Sheet 02B's stamp: as built since the R730-2 joined the cluster. */
export const STAMP = { text: 'AS BUILT', sub: 'R730-2 · 2026-11-12', tone: 'ok' as const };
