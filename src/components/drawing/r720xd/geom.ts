/**
 * R720xd geometry for Sheet 02 (TD-LAB-02) and anything else that draws the server.
 *
 * Model space, millimetres, the kit's axes: x = width from the LEFT EDGE OF THE RACK EARS as
 * seen from the front (0 … 482.4), y = height from the chassis bottom, z = depth from the rack
 * flange towards the rear (the front ears sit at z −18 … 0).
 *
 * Sizes come from server.dims, panel features from server.panels (the zones the cabinet sheet traced
 * for the R720xd) and the internals from server.internal (schematic fractions, not to scale). All of
 * it is the frozen 2026-09-28 snapshot in src/data/lab/snapshots/.
 *
 * The path builders return compact `d` strings (relative moves, 0.1 mm) in model mm, so one
 * drawing can be placed in any view with a transform (see ServerDefs.astro):
 *   frontPanel()  face-local u → (from the left ear), v ↓ (from the top)
 *   rearPanel()   as seen from behind: u → from the left of the body, v ↓
 *   planPaths()   top view, cover off: u = model x, v = −z (rear up, front ears at v 0 … 18)
 */
import { server } from '../../../data/lab/snapshots/server-2026-09-28';
import type { CableN, Drive, PanelZone, PoolId } from '../../../data/lab/snapshots/types-2026-09-28';
import { join, type Pt } from '../../../lib/drawing/projection';

/* ------------------------------------------------------------------ sizes (mm) */
const { body, earsWidth, earDepth, bezelDepth, toPsuHandles, overallDepth } = server.dims;
export const W = body.w; // 444.0 body width
export const H = body.h; // 87.3
export const D = body.d; // 684.0 flange → rear wall
export const WE = earsWidth; // 482.4 over the ears
export const EAR = (WE - W) / 2; // 19.2 each side
export const EAR_D = earDepth; // 18 in front of the flange
export const BEZEL = bezelDepth; // 32 with the bezel
export const HANDLES = toPsuHandles; // 723 flange → PSU handles
export const OVERALL = overallDepth; // 755 bezel → handles

/* ------------------------------------------------------------------ compact paths */
/** 0.1 mm precision, no trailing zeros, no "-0". */
export const n = (v: number): string => String(Math.round(v * 10) / 10 || 0);
/** Rectangle, relative form. */
export const R = (x: number, y: number, w: number, h: number): string => `M${n(x)} ${n(y)}h${n(w)}v${n(h)}h${n(-w)}z`;
/** Polyline through points (absolute). */
export const P = (pts: readonly (readonly [number, number])[], close = false): string =>
  'M' + pts.map(([x, y]) => `${n(x)} ${n(y)}`).join('L') + (close ? 'z' : '');
/** Circle as a path. */
export const O = (cx: number, cy: number, r: number): string =>
  `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(r)} 0 1 0 ${n(-2 * r)} 0`;
/** Horizontal line from (x, y), length w. */
export const Hl = (x: number, y: number, w: number): string => `M${n(x)} ${n(y)}h${n(w)}`;
/** Vertical line from (x, y), length h. */
export const Vl = (x: number, y: number, h: number): string => `M${n(x)} ${n(y)}v${n(h)}`;
/** Scale factors to 4 places (n() would round 0.75 to 0.8). */
export const k4 = (v: number): string => String(Math.round(v * 1e4) / 1e4);
/** `matrix(s,0,0,s,x,y)`: a face drawn in mm, placed at (x, y) at scale s. */
export const place = (s: number, x: number, y: number): string => `matrix(${k4(s)},0,0,${k4(s)},${n(x)},${n(y)})`;

/**
 * Compact front-right isometric box (the kit's isometric() projection): faces and edges as
 * relative paths at 1 paper unit (paired deltas round identically, so shapes still close),
 * about half the bytes of iso.box(). (x0, y0) is the paper point of model (0, 0, 0); s is paper
 * units per mm.
 */
export function isoBox(x0: number, y0: number, s: number, b: { x: number; y: number; z: number; w: number; h: number; d: number }) {
  const c = Math.cos(Math.PI / 6) * s, h2 = s / 2, n = (v: number) => String(Math.round(v) || 0);
  const px = x0 + (b.x + b.z) * c, py = y0 + (b.x - b.z) * h2 - b.y * s; // front-bottom-left
  const w = `${n(b.w * c)} ${n(b.w * h2)}`, wn = `${n(-b.w * c)} ${n(-b.w * h2)}`;
  const d = `${n(b.d * c)} ${n(-b.d * h2)}`, dn = `${n(-b.d * c)} ${n(b.d * h2)}`;
  const up = n(-b.h * s), down = n(b.h * s);
  const at = (dx: number, dy: number) => `M${n(px + dx)} ${n(py + dy)}`;
  return {
    top: `${at(0, -b.h * s)}l${w}l${d}l${wn}z`,
    front: `${at(0, 0)}l${w}l0 ${up}l${wn}z`,
    side: `${at(b.w * c, b.w * h2)}l${d}l0 ${up}l${dn}z`,
    edges: `${at(0, 0)}l${w}l${d}l0 ${up}l${wn}l${dn}zm0 ${up}l${w}l0 ${down}m0 ${up}l${d}`,
  };
}

/* ------------------------------------------------------------------ panels (rack.ts zones) */
const zoneMap = (zones: PanelZone[]): Record<string, PanelZone> => Object.fromEntries(zones.map((z) => [z.id, z]));
const frontZones = zoneMap(server.panels.front.zones);
const rearZones = zoneMap(server.panels.rear.zones);

/** A front zone in face mm (u from the left ear edge, v from the top). */
const fz = (id: string) => {
  const z = frontZones[id];
  return { x: z.x0 * WE, y: z.y0 * H, w: (z.x1 - z.x0) * WE, h: (z.y1 - z.y0) * H };
};
/** A rear zone in face mm (seen from behind; u from the left edge of the body). */
export const rz = (id: string) => {
  const z = rearZones[id];
  return { x: z.x0 * W, y: z.y0 * H, w: (z.x1 - z.x0) * W, h: (z.y1 - z.y0) * H };
};

/* ------------------------------------------------------------------ front bays */
const BAYS = fz('bays');
export const BAY_N = server.bays.front; // 24
export const BAY_P = BAYS.w / BAY_N; // ≈ 18.5 mm pitch
export const BAY_Y0 = BAYS.y;
export const BAY_H = BAYS.h;
/** Left edge (face mm) of front bay i (0 = far left, as Dell numbers them). */
export const bayX = (i: number): number => BAYS.x + i * BAY_P;
/** A front bay's carrier opening in face mm. */
export const bayRect = (i: number): string => R(bayX(i) + 0.5, BAY_Y0, BAY_P - 1, BAY_H);

/** Front panel, face-local mm. Groups so a view can pen them differently. */
export function frontPanel() {
  const ears = join(Vl(EAR, 0, H), Vl(WE - EAR, 0, H));
  const pw = fz('power'), nmi = fz('nmi'), sid = fz('sysid'), dg = fz('diag'), tag = fz('tag'), vga = fz('vga'), usb = fz('usb');
  const diag = Array.from({ length: 6 }, (_, i) => R(dg.x + 1 + (i % 3) * 4.6, dg.y + 1 + Math.floor(i / 3) * 5.2, 3, 3)).join('');
  const ctrl = join(
    O(pw.x + pw.w / 2, pw.y + pw.h / 2, pw.w / 2.3),
    O(nmi.x + nmi.w / 2, nmi.y + nmi.h / 2, 1.3),
    O(sid.x + sid.w / 2, sid.y + sid.h / 2, sid.w / 2),
    diag,
    `M${n(vga.x)} ${n(vga.y)}h${n(vga.w)}l${n(-1.6)} ${n(vga.h)}h${n(-(vga.w - 3.2))}z`,
    R(usb.x, usb.y, usb.w, usb.h),
    R(tag.x, tag.y, tag.w, tag.h),
  );
  const latches = join(R(2.2, 50, EAR - 4.4, 33), R(WE - EAR + 2.2, 50, EAR - 4.4, 33));
  let bays = '', detail = '';
  for (let i = 0; i < BAY_N; i++) {
    const x = bayX(i) + 0.5, w = BAY_P - 1;
    bays += R(x, BAY_Y0, w, BAY_H);
    // handle, then the release latch above it (relative moves keep this short: 24 of them)
    detail += R(x + 2.4, BAY_Y0 + 14, w - 4.8, BAY_H - 20) + `m2 -7.5h${n(w - 8.8)}`;
  }
  return { outline: R(0, 0, WE, H), ears, ctrl, latches, bays, detail };
}

/** Rear panel as seen from behind, face-local mm (u from the left of the body). */
export function rearPanel() {
  const slot = (id: string) => {
    const s = rz(id);
    return R(s.x, s.y, s.w, s.h) + Vl(s.x + 5, s.y + 1.2, s.h - 2.4) + O(s.x + 2.6, s.y + s.h / 2, 1);
  };
  const slots = ['slot-1', 'slot-2', 'slot-3', 'slot-4', 'slot-5', 'slot-6'].map(slot).join('');
  const vf = rz('vflash'), hd = rz('handle');
  const bay = (id: string) => {
    const b = rz(id);
    return R(b.x, b.y, b.w, b.h) + O(b.x + 5, b.y + b.h / 2, 2.4);
  };
  const psu = (id: string) => {
    const p = rz(id);
    const cy = p.y + p.h / 2, fr = Math.min(p.h / 2 - 4, 14);
    return (
      R(p.x, p.y, p.w, p.h) +
      R(p.x + 6, cy - 6, 13, 12) + // AC inlet
      O(p.x + p.w - fr - 7, cy, fr) + Hl(p.x + p.w - 2 * fr - 7, cy, 2 * fr) + Vl(p.x + p.w - fr - 7, cy - fr, 2 * fr)
    );
  };
  const trap = (id: string) => {
    const p = rz(id);
    return `M${n(p.x)} ${n(p.y)}h${n(p.w)}l${n(-2)} ${n(p.h)}h${n(-(p.w - 4))}z`;
  };
  const sid = rz('sysid'), sc = rz('sysid-conn'), usb = rz('usb');
  const io = join(
    O(sid.x + sid.w / 2, sid.y + sid.h / 2, sid.w / 2),
    R(sc.x, sc.y, sc.w, sc.h),
    rj('idrac'),
    trap('serial'),
    trap('vga'),
    R(usb.x, usb.y, usb.w, usb.h / 2 - 0.8) + R(usb.x, usb.y + usb.h / 2 + 0.8, usb.w, usb.h / 2 - 0.8),
  );
  return {
    outline: R(0, 0, W, H),
    slots: join(slots, R(vf.x, vf.y, vf.w, vf.h), R(hd.x, hd.y, hd.w, hd.h)),
    bays: bay('rear-bay-24') + bay('rear-bay-25'),
    psus: psu('psu-1') + psu('psu-2'),
    io,
  };
}
/** An RJ45 jack on the rear face (NICs, iDRAC). */
export const rj = (id: string): string => {
  const p = rz(id);
  return R(p.x, p.y, p.w, p.h) + R(p.x + p.w / 2 - 2.5, p.y + p.h - 2.6, 5, 2.6);
};
/** The drive carrier inside a rear bay opening (face mm, seen from behind). */
export const rearCarrier = (bay: 24 | 25): string => {
  const b = rz(`rear-bay-${bay}`);
  return R(b.x + 10, b.y + 2.5, b.w - 12.5, b.h - 5);
};

/* ------------------------------------------------------------------ internals (plan) */
const IN = server.internal;
/** Data fractions (front at the top, left = server's right) → model x, z mm. */
export const mx = (fx: number): number => EAR + (1 - fx) * W;
export const mz = (fzr: number): number => fzr * D;
export type Box2 = { x: number; z: number; w: number; d: number };
/** An internal part as a model-mm footprint (x from the left ear edge, z from the flange). */
export function part(id: string): Box2 {
  const p = IN.parts.find((q) => q.id === id);
  if (!p) throw new Error(`no internal part ${id}`);
  const x0 = mx(p.x[1]), x1 = mx(p.x[0]);
  return { x: x0, z: mz(p.z[0]), w: x1 - x0, d: mz(p.z[1]) - mz(p.z[0]) };
}
/** Plan rect (u = x, v = −z) for a footprint. */
export const PR = (b: Box2): string => R(b.x, -b.z - b.d, b.w, b.d);

/**
 * The two rear flex bays in plan: they sit over the PSUs, bay 24 over PSU 1 and bay 25 over
 * PSU 2 (the same pairing the rear face shows): a 2.5″ carrier's length in from the rear wall.
 */
export function rearBay(bay: 24 | 25): Box2 {
  const psu = part(bay === 24 ? 'psu-1' : 'psu-2');
  return { x: psu.x + 3, z: D - 128, w: psu.w - 6, d: 124 };
}

/** DIMM banks: six slots each side of each CPU, sticks running front → back (with the airflow). */
export function dimmBanks(): Box2[] {
  const out: Box2[] = [];
  const pitch = 8.2, stick = 5.2, len = 133, gap = 4;
  const bankW = 5 * pitch + stick;
  for (const id of ['cpu1', 'cpu2']) {
    const c = part(id);
    const z = c.z + c.d / 2 - len / 2;
    for (const x0 of [c.x - gap - bankW, c.x + c.w + gap]) {
      for (let i = 0; i < 6; i++) out.push({ x: x0 + i * pitch, z, w: stick, d: len });
    }
  }
  return out;
}

export const FANS = server.fans.count; // 6

/** The plan (cover off), model mm with v = −z. Groups by pen. Neither controller is in it. */
export function planPaths() {
  const bp = part('backplane'), fans = part('fans'), shroud = part('shroud'), ret = part('retention');
  const cpus = ['cpu1', 'cpu2'].map(part);
  const psus = ['psu-1', 'psu-2'].map(part);
  const fw = fans.w / FANS;
  return {
    /** chassis walls and the front plate (ears + control panels) */
    shell: join(R(EAR, -D, W, D), R(0, 0, WE, EAR_D)),
    /** the 24 carriers seen from above, between the front plate and the backplane */
    cage: Array.from({ length: BAY_N - 1 }, (_, i) => Vl(bayX(i + 1), 0, -bp.z)).join(''),
    board: join(PR(bp), ...['sas-b', 'sas-a', 'sas-a1', 'flex-backplane', 'flex-sas-a1', 'j-storage', 'j-sasx8'].map((id) => PR(part(id)))),
    fans: join(PR(fans), ...Array.from({ length: FANS - 1 }, (_, i) => Vl(fans.x + (i + 1) * fw, -fans.z, -fans.d)), ...Array.from({ length: FANS }, (_, i) => O(fans.x + (i + 0.5) * fw, -fans.z - fans.d / 2, 3))),
    cpus: join(...cpus.map(PR)),
    fins: cpus.map((c) => Array.from({ length: 7 }, (_, i) => Vl(c.x + ((i + 1) * c.w) / 8, -c.z - c.d + 2, c.d - 4)).join('')).join(''),
    dimms: dimmBanks().map(PR).join(''),
    risers: join(...['riser-1', 'riser-2', 'riser-3'].map((id) => PR(part(id)))),
    // bodies to the rear wall, then the handle loop out to HANDLES
    psus: join(...psus.map(PR), ...psus.map((b) => `M${n(b.x + 10)} ${n(-D)}v${n(-(HANDLES - D))}h${n(b.w - 20)}v${n(HANDLES - D)}`)),
    /** the rear flex cage over the PSUs */
    flex: join(PR(rearBay(24)), PR(rearBay(25))),
    retention: PR(ret),
    shroud: PR(shroud),
    /** centre lines through the sockets */
    ctr: join(...cpus.map((c) => Hl(c.x - 8, -c.z - c.d / 2, c.w + 16) + Vl(c.x + c.w / 2, -c.z + 8, -c.d - 16))),
  };
}

/** Cable routes in model mm ([x, z] points), per cable. */
export function routes(): Record<CableN, [number, number][][]> {
  const out = {} as Record<CableN, [number, number][][]>;
  for (const r of IN.routes) out[r.cable] = r.paths.map((path) => path.map(([x, z]): [number, number] => [mx(x), mz(z)]));
  return out;
}

/**
 * A plan placed on paper at scale s: (x, y) is the paper point of model (x 0, z 0), the left
 * ear at the rack flange. rot = false: rear up, front down (the top view). rot = true: turned
 * 90°, front at the left, the server's left side at the top (the storage path reads left to
 * right).
 */
export function planAt(x: number, y: number, s: number, rot = false) {
  const pt = (mx: number, mz: number): Pt => (rot ? [x + s * mz, y + s * mx] : [x + s * mx, y - s * mz]);
  return {
    pt,
    /** transform for drawings in plan mm (u = x, v = −z) */
    m: rot ? `matrix(0,${k4(s)},${k4(-s)},0,${n(x)},${n(y)})` : place(s, x, y),
    /** a model polyline on paper */
    line: (pts: [number, number][]) => P(pts.map(([a, b]) => pt(a, b))),
    /** a footprint as a paper rectangle (any rotation) */
    box: (b: Box2): string => {
      const [x0, y0] = pt(b.x, b.z), [x1, y1] = pt(b.x + b.w, b.z + b.d);
      return R(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    },
    /** centre of a footprint on paper */
    mid: (b: Box2): Pt => pt(b.x + b.w / 2, b.z + b.d / 2),
  };
}

/* ------------------------------------------------------------------ drives & pools */
export const pools = server.pools;
export const POOL_IDS: PoolId[] = pools.map((p) => p.id);
/** Front drives, bay order. */
export const frontDrives: Drive[] = server.drives.filter((d) => d.bay < BAY_N).sort((a, b) => a.bay - b.bay);
export const rearDrive = server.drives.find((d) => d.bay === 24)!;
/** Lettering on a carrier: "GIGASTONE 256 GB", "MX500 1 TB", "ST300MP0004". */
export const driveShort = (d: { maker: string; model: string; sizeGB: number; interface: string }): string =>
  d.interface === 'SAS' ? d.model : `${d.maker === 'Crucial' ? 'MX500' : d.maker} ${d.sizeGB >= 1000 ? `${d.sizeGB / 1000} TB` : `${d.sizeGB} GB`}`.toUpperCase();

/** Sheet 02's stamp: the sheet is a superseded archive since the R730 took the slot. Each view sets it down where it has room (Stamp.astro). */
export const STAMP = { text: 'SUPERSEDED', sub: '2026-10-02 · BY THE R730', tone: 'warn' as const };

/* ------------------------------------------------------------------ balloon numbers */
/**
 * One numbering for the whole sheet: a part keeps its number in every view it appears in, and
 * the card shows it. Drives by bay, then the pools, then what the swap added, then the machine,
 * then what the swap took out.
 */
export const NUM: Record<string, number> = Object.fromEntries(
  [
    ...frontDrives.map((d) => d.id), rearDrive.id,
    ...POOL_IDS,
    'hba330', 'cable-2', 'cable-3', 'nics',
    'server', 'cpu1', 'cpu2', 'memory', 'fans', 'backplane', 'riser-1', 'psus',
    'perc', 'cable-1', 'cable-4', server.removed.id,
  ].map((id, i) => [id, i + 1]),
);
