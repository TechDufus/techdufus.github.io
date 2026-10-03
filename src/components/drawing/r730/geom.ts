/**
 * R730 geometry for Sheet 02 (TD-LAB-02) and anything else that draws the server.
 *
 * Model space, millimetres, the kit's axes: x = width from the LEFT EDGE OF THE RACK EARS as
 * seen from the front (0 … 482.4), y = height from the chassis bottom, z = depth from the rack
 * flange towards the rear (the front ears sit at z −18 … 0).
 *
 * Sizes come from server.dims, the front and rear faces from server.panels (the zones the cabinet
 * sheet traces for the R730). Inside the chassis Dell publishes parts and their front-to-back order
 * but no coordinates (server.internal), so the plan below is SCHEMATIC: the standard two-socket
 * arrangement (fans, shroud, two CPUs with a bank of DIMM sockets either side of each, the PERC
 * mini ahead of the DIMMs, the riser cage and PSUs at the rear wall). Only the rear row follows
 * the rear panel's fractions, mirrored into plan.
 *
 * The path builders return compact `d` strings (relative moves, 0.1 mm) in model mm, so one
 * drawing can be placed in any view with a transform (see R730Defs.astro):
 *   frontPanel()  face-local u → (from the left ear), v ↓ (from the top)
 *   rearPanel()   as seen from behind: u → from the left of the body, v ↓
 *   planPaths()   top view, cover off: u = model x, v = −z (rear up, front ears at v 0 … 18)
 */
import { server } from '../../../data/lab/server';
import type { Drive, PanelZone, PoolId } from '../../../data/lab/types';
import { join } from '../../../lib/drawing/projection';
import { monoWidth } from '../../../lib/drawing/sheet';

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
  const c = Math.cos(Math.PI / 6) * s, h2 = s / 2, r = (v: number) => String(Math.round(v) || 0);
  const px = x0 + (b.x + b.z) * c, py = y0 + (b.x - b.z) * h2 - b.y * s; // front-bottom-left
  const w = `${r(b.w * c)} ${r(b.w * h2)}`, wn = `${r(-b.w * c)} ${r(-b.w * h2)}`;
  const d = `${r(b.d * c)} ${r(-b.d * h2)}`, dn = `${r(-b.d * c)} ${r(b.d * h2)}`;
  const up = r(-b.h * s), down = r(b.h * s);
  const at = (dx: number, dy: number) => `M${r(px + dx)} ${r(py + dy)}`;
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

/** A rectangle in face mm. */
export type Rect = { x: number; y: number; w: number; h: number };

/** A front zone in face mm (u from the left ear edge, v from the top). */
const fz = (id: string): Rect => {
  const z = frontZones[id];
  if (!z) throw new Error(`r730 geom: no front zone ${id}`);
  return { x: z.x0 * WE, y: z.y0 * H, w: (z.x1 - z.x0) * WE, h: (z.y1 - z.y0) * H };
};
/** A rear zone in face mm (seen from behind; u from the left edge of the body). */
export const rz = (id: string): Rect => {
  const z = rearZones[id];
  if (!z) throw new Error(`r730 geom: no rear zone ${id}`);
  return { x: z.x0 * W, y: z.y0 * H, w: (z.x1 - z.x0) * W, h: (z.y1 - z.y0) * H };
};

/* ------------------------------------------------------------------ front bays */
/** The carrier groups on the face (bays 0–7, a seam, bays 8–15), left to right. */
const bayZones = server.panels.front.zones
  .filter((z) => z.kind === 'bay')
  .sort((a, b) => a.x0 - b.x0)
  .map((z) => ({ ...fz(z.id), cells: z.cells ?? 1 }));
export const BAY_N = server.bays.front; // 16
export const BAY_Y0 = bayZones[0].y;
export const BAY_H = bayZones[0].h;
const bayGroup = (i: number) => {
  let from = 0;
  for (const z of bayZones) {
    if (i < from + z.cells) return { z, k: i - from };
    from += z.cells;
  }
  throw new Error(`r730 geom: no bay ${i}`);
};
/** Left edge (face mm) of front bay i (0 = far left, as Dell numbers them). */
export const bayX = (i: number): number => {
  const { z, k } = bayGroup(i);
  return z.x + (k * z.w) / z.cells;
};
/** Pitch of the group bay i belongs to (≈ 18 mm). */
export const bayP = (i: number): number => {
  const { z } = bayGroup(i);
  return z.w / z.cells;
};
/** A front bay's carrier opening in face mm. */
export const bayRect = (i: number): string => R(bayX(i) + 0.5, BAY_Y0, bayP(i) - 1, BAY_H);

/** Front panel, face-local mm. Groups so a view can pen them differently. */
export function frontPanel() {
  const earL = fz('ear-l'), earR = fz('ear-r');
  const ears = join(Vl(earL.x + earL.w, 0, H), Vl(earR.x, 0, H));
  const pw = fz('power'), sid = fz('sysid'), vga = fz('vga'), lcd = fz('lcd');
  const vf = fz('vflash'), usb1 = fz('usb-1'), usb2 = fz('usb-2'), opt = fz('optical'), seam = fz('seam');
  const buttons = ['lcd-prev', 'lcd-ok', 'lcd-next'].map((id) => {
    const b = fz(id);
    return R(b.x, b.y, b.w, b.h);
  }).join('');
  const circ = (z: Rect, k: number) => O(z.x + z.w / 2, z.y + z.h / 2, Math.min(z.w, z.h) / k);
  const ctrl = join(
    circ(pw, 2.3),
    Vl(pw.x + pw.w / 2, pw.y + pw.h / 2 - 2.6, 2.6),
    circ(sid, 2.1),
    `M${n(vga.x)} ${n(vga.y)}h${n(vga.w)}l${n(-2)} ${n(vga.h)}h${n(-(vga.w - 4))}z`,
    buttons,
    R(lcd.x, lcd.y, lcd.w, lcd.h),
    R(vf.x, vf.y, vf.w, vf.h),
    R(usb1.x, usb1.y, usb1.w, usb1.h),
    R(usb2.x, usb2.y, usb2.w, usb2.h),
    R(opt.x, opt.y, opt.w, opt.h),
  );
  // the LCD's screen, the USB tongues and the perforated blank where the optical drive would go
  const lcdIn = R(lcd.x + 2, lcd.y + 2.2, lcd.w - 4, lcd.h - 4.4);
  const tongues = [usb1, usb2].map((u) => Hl(u.x + 2, u.y + u.h / 2, u.w - 4)).join('');
  const perf = Array.from({ length: 6 }, (_, i) => Hl(opt.x + 3, opt.y + 4.5 + i * ((opt.h - 9) / 5), opt.w - 6)).join('');
  const seamPath = R(seam.x, seam.y, seam.w, seam.h);
  const latches = join(R(2.2, 50, earL.w - 4.4, 33), R(earR.x + 2.2, 50, earR.w - 4.4, 33));
  let bays = '', detail = '';
  for (let i = 0; i < BAY_N; i++) {
    const x = bayX(i) + 0.5, w = bayP(i) - 1;
    bays += R(x, BAY_Y0, w, BAY_H);
    // handle, then the release latch above it (relative moves keep this short: 16 of them)
    detail += R(x + 2.4, BAY_Y0 + 14, w - 4.8, BAY_H - 20) + `m2 -7.5h${n(w - 8.8)}`;
  }
  // the cluster in outline only: the LCD and the optical blank
  const lean = join(R(lcd.x, lcd.y, lcd.w, lcd.h), R(opt.x, opt.y, opt.w, opt.h));
  return { outline: R(0, 0, WE, H), ears, ctrl, lean, lcdIn, tongues, perf, seam: seamPath, latches, bays, detail };
}

/** An RJ45 jack on the rear face (NICs, iDRAC). */
export const rj = (id: string): string => {
  const p = rz(id);
  return R(p.x, p.y, p.w, p.h) + R(p.x + p.w / 2 - 2.5, p.y + p.h - 2.6, 5, 2.6);
};

/** The risers, slot ids taken in order from the data (riser 1: slots 1–3, riser 2: 4–5, riser 3: 6–7). */
let nextSlot = 1;
export const RISERS = server.risers.map((r) => {
  const slots = Array.from({ length: r.slots }, (_, i) => `slot-${nextSlot + i}`);
  nextSlot += r.slots;
  const zs = slots.map(rz);
  const x0 = Math.min(...zs.map((z) => z.x)), x1 = Math.max(...zs.map((z) => z.x + z.w));
  return { id: `riser-${r.n}`, n: r.n, height: r.height, slots, x0, x1, y0: zs[0].y, y1: zs[zs.length - 1].y + zs[zs.length - 1].h };
});

/** Rear panel as seen from behind, face-local mm (u from the left of the body). */
export function rearPanel() {
  const slot = (id: string) => {
    const s = rz(id);
    return R(s.x, s.y, s.w, s.h) + Vl(s.x + 5, s.y + 1.2, s.h - 2.4) + O(s.x + 2.6, s.y + s.h / 2, 1);
  };
  const slots = RISERS.flatMap((r) => r.slots).map(slot).join('');
  const hd = rz('handle'), b2 = rz('blank-2'), b3 = rz('blank-3');
  const perf = (b: Rect, rows: number, from = 4) =>
    Array.from({ length: rows }, (_, i) => Hl(b.x + 3, b.y + from + i * 3.2, b.w - 6)).join('');
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
    slots: join(slots, R(b2.x, b2.y, b2.w, b2.h), R(hd.x, hd.y, hd.w, hd.h), R(b3.x, b3.y, b3.w, b3.h)),
    perf: join(perf(b2, 2, 2.2), perf(b3, 11, 3.5)),
    psus: psu('psu-1') + psu('psu-2'),
    io,
  };
}

/* ------------------------------------------------------------------ internals (plan, schematic) */
/** A footprint in model mm: x from the left ear edge, z from the flange. */
export type Box2 = { x: number; z: number; w: number; d: number };
/** Plan rect (u = x, v = −z) for a footprint. */
export const PR = (b: Box2): string => R(b.x, -b.z - b.d, b.w, b.d);
/** Rear-panel fraction (seen from behind) → plan x: the rear view's left is the plan's right. */
const planX = (x0: number, w: number): number => EAR + W - (x0 + w);

const TOP = {
  backplane: { z: 100, d: 8 },
  fans: { z: 118, d: 40 },
  shroud: { z: 168, d: 336 },
  perc: { z: 176, d: 66 },
  cpuZ: 303, cpuD: 54, cpuW: 60,
  dimmLen: 135,
  psuZ: 484,
  riserZ: 600,
  ndcZ: 612,
} as const;

/** The six-fan row across the body. */
const fanBox = (): Box2 => ({ x: EAR + 4, z: TOP.fans.z, w: W - 8, d: TOP.fans.d });
export const FANS = server.fans.count;

const bpBox = (): Box2 => ({ x: EAR, z: TOP.backplane.z, w: W, d: TOP.backplane.d });
const shroudBox = (): Box2 => ({ x: EAR + 6, z: TOP.shroud.z, w: W - 12, d: TOP.shroud.d });
const percBox = (): Box2 => ({ x: EAR + 8, z: TOP.perc.z, w: 92, d: TOP.perc.d });

/** Two CPUs with a bank of six DIMM sockets each side (bank, CPU, bank | bank, CPU, bank). */
const PITCH = 9.4, STICK = 6, BANK_GAP = 5, MID_GAP = 6;
const BANK_W = 5 * PITCH + STICK;
const cpuBoxes = (): [Box2, Box2] => {
  const total = 4 * BANK_W + 2 * TOP.cpuW + 4 * BANK_GAP + MID_GAP;
  const x0 = EAR + (W - total) / 2;
  const c1 = x0 + BANK_W + BANK_GAP;
  const c2 = c1 + TOP.cpuW + BANK_GAP + BANK_W + MID_GAP + BANK_W + BANK_GAP;
  const mk = (x: number): Box2 => ({ x, z: TOP.cpuZ, w: TOP.cpuW, d: TOP.cpuD });
  return [mk(c1), mk(c2)];
};

/** All DIMM sockets (24), CPU1's first; `fitted` follows the population rule (the first two of each three-socket channel). */
export type Socket = Box2 & { fitted: boolean };
export function dimmSockets(): Socket[] {
  const { sockets, dimms } = server.memory;
  const perChannel = sockets / 8; // 4 channels per CPU, 2 CPUs
  const fit = dimms / 8;
  if (!Number.isInteger(perChannel) || !Number.isInteger(fit)) throw new Error('r730 geom: DIMM population does not divide into channels');
  const per = sockets / 4; // sockets per bank
  const out: Socket[] = [];
  for (const c of cpuBoxes()) {
    const z = c.z + c.d / 2 - TOP.dimmLen / 2;
    for (const x0 of [c.x - BANK_GAP - BANK_W, c.x + c.w + BANK_GAP]) {
      for (let i = 0; i < per; i++) out.push({ x: x0 + i * PITCH, z, w: STICK, d: TOP.dimmLen, fitted: i % perChannel < fit });
    }
  }
  return out;
}

/** The four banks of six sockets (CPU1's two, then CPU2's) as footprints. */
export function dimmBanks(): Box2[] {
  const s = dimmSockets();
  const per = s.length / 4;
  return Array.from({ length: 4 }, (_, i) => ({ x: s[i * per].x, z: s[i * per].z, w: BANK_W, d: TOP.dimmLen }));
}

/** The server.internal entry for a part id. */
export const internalPart = (id: string) => {
  const p = server.internal.find((q) => q.id === id);
  if (!p) throw new Error(`r730 geom: no internal part ${id}`);
  return p;
};
/** A part's short name for its hover tag and accessible name: its card's title, except the CPUs, which share one. */
export const partLabel = (id: string): string => (/^cpu\d$/.test(id) ? `CPU ${id.slice(3)}` : (internalPart(id).card?.title ?? id));

/** Rear row footprints: PSUs, risers and the NDC, mirrored from the rear panel's zones. */
const rearRow = (zone: { x: number; w: number }, z: number): Box2 => ({ x: planX(zone.x, zone.w), z, w: zone.w, d: D - z });
const psuBox = (n1: 1 | 2): Box2 => rearRow(rz(`psu-${n1}`), TOP.psuZ);
const riserBox = (n1: number): Box2 => {
  const r = RISERS.find((q) => q.n === n1)!;
  return rearRow({ x: r.x0, w: r.x1 - r.x0 }, TOP.riserZ);
};
const ndcBox = (): Box2 => {
  const ports = [1, 2, 3, 4].map((i) => rz(`nic-${i}`));
  const x0 = Math.min(...ports.map((p) => p.x)) - 5, x1 = Math.max(...ports.map((p) => p.x + p.w)) + 5;
  return rearRow({ x: x0, w: x1 - x0 }, TOP.ndcZ);
};

/** An internal part (by its server.internal id) as a plan footprint. */
export function part(id: string): Box2 {
  switch (id) {
    case 'backplane': return bpBox();
    case 'fans': return fanBox();
    case 'shroud': return shroudBox();
    case 'cpu1': return cpuBoxes()[0];
    case 'cpu2': return cpuBoxes()[1];
    case 'perc': return percBox();
    case 'ndc': return ndcBox();
    case 'psu-1': return psuBox(1);
    case 'psu-2': return psuBox(2);
    case 'riser-1': return riserBox(1);
    case 'riser-2': return riserBox(2);
    case 'riser-3': return riserBox(3);
    case 'dimms': {
      const s = dimmSockets();
      const x0 = Math.min(...s.map((q) => q.x)), x1 = Math.max(...s.map((q) => q.x + q.w));
      return { x: x0, z: s[0].z, w: x1 - x0, d: TOP.dimmLen };
    }
    default: throw new Error(`r730 geom: no plan footprint for ${id}`);
  }
}

/** The overlap of two footprints, or null. */
export function overlap(a: Box2, b: Box2): Box2 | null {
  const x0 = Math.max(a.x, b.x), x1 = Math.min(a.x + a.w, b.x + b.w), z0 = Math.max(a.z, b.z), z1 = Math.min(a.z + a.d, b.z + b.d);
  return x1 > x0 && z1 > z0 ? { x: x0, z: z0, w: x1 - x0, d: z1 - z0 } : null;
}

/** The part of PSU 1 that stays in the open (riser 3 sits over its rear end). */
export function psuOpen(n1: 1 | 2): Box2 {
  const p = psuBox(n1);
  const cover = n1 === 1 ? overlap(p, riserBox(3)) : null;
  return cover ? { ...p, d: cover.z - p.z } : p;
}

/** The plan (cover off), model mm with v = −z. Groups by pen. */
export function planPaths() {
  const bp = bpBox(), fans = fanBox(), shroud = shroudBox(), perc = percBox(), ndc = ndcBox();
  const cpus = cpuBoxes();
  const psus = ([1, 2] as const).map(psuBox);
  const risers = [1, 2, 3].map(riserBox);
  const fw = fans.w / FANS;
  const sockets = dimmSockets();
  const hidden = [overlap(psus[0], risers[2]), overlap(ndc, risers[1])].filter((b): b is Box2 => !!b);
  return {
    /** chassis walls and the front plate (ears + control panels) */
    shell: join(R(EAR, -D, W, D), R(0, 0, WE, EAR_D)),
    /** the 16 carriers seen from above, between the front plate and the backplane */
    cage: Array.from({ length: BAY_N - 1 }, (_, i) => Vl(bayX(i + 1), 0, -bp.z)).join('') + Vl(bayX(7) + bayP(7), 0, -bp.z),
    board: join(PR(bp), PR(perc), Vl(perc.x + perc.w - 8, -perc.z, -perc.d), PR(ndc)),
    fans: join(PR(fans), ...Array.from({ length: FANS - 1 }, (_, i) => Vl(fans.x + (i + 1) * fw, -fans.z, -fans.d)), ...Array.from({ length: FANS }, (_, i) => O(fans.x + (i + 0.5) * fw, -fans.z - fans.d / 2, 15) + O(fans.x + (i + 0.5) * fw, -fans.z - fans.d / 2, 4.5))),
    cpus: join(...cpus.map(PR), ...cpus.map((c) => R(c.x + 8, -c.z - c.d + 8, c.w - 16, c.d - 16))),
    fins: cpus.map((c) => Array.from({ length: 7 }, (_, i) => Vl(c.x + ((i + 1) * c.w) / 8, -c.z - c.d + 2, c.d - 4)).join('')).join(''),
    /** every socket as an outline; the fitted sticks sit inside them */
    sockets: sockets.map(PR).join(''),
    sticks: sockets.filter((s) => s.fitted).map((s) => R(s.x + 1, -s.z - s.d + 2, s.w - 2, s.d - 4)).join(''),
    risers: join(...risers.map(PR), ...risers.map((b) => Hl(b.x + 2, -b.z - 6, b.w - 4))),
    /** drawn in the plan before the risers, which hide what they cover */
    riserFill: risers.map(PR).join(''),
    hidden: hidden.map(PR).join(''),
    // bodies to the rear wall, then the handle loop out to HANDLES
    psus: join(...psus.map(PR), ...psus.map((b) => `M${n(b.x + 10)} ${n(-D)}v${n(-(HANDLES - D))}h${n(b.w - 20)}v${n(HANDLES - D)}`), ...psus.map((b) => O(b.x + b.w / 2, 24 - D, 11) + Hl(b.x + b.w / 2 - 11, 24 - D, 22) + Vl(b.x + b.w / 2, 13 - D, 22))),
    shroud: PR(shroud),
    /** centre lines through the sockets */
    ctr: join(...cpus.map((c) => Hl(c.x - 8, -c.z - c.d / 2, c.w + 16) + Vl(c.x + c.w / 2, -c.z + 8, -c.d - 16))),
  };
}

/**
 * A plan placed on paper at scale s: (x, y) is the paper point of model (x 0, z 0), the left
 * ear at the rack flange (rear up, front down: the top view).
 */
export function planAt(x: number, y: number, s: number) {
  const pt = (mx: number, mz: number): [number, number] => [x + s * mx, y - s * mz];
  return {
    pt,
    /** transform for drawings in plan mm (u = x, v = −z) */
    m: place(s, x, y),
    /** a footprint as a paper rectangle */
    box: (b: Box2): string => {
      const [x0, y0] = pt(b.x, b.z), [x1, y1] = pt(b.x + b.w, b.z + b.d);
      return R(Math.min(x0, x1), Math.min(y0, y1), Math.abs(x1 - x0), Math.abs(y1 - y0));
    },
    /** centre of a footprint on paper */
    mid: (b: Box2): [number, number] => pt(b.x + b.w / 2, b.z + b.d / 2),
  };
}

/* ------------------------------------------------------------------ drives & pools */
export const pools = server.pools;
export const POOL_IDS: PoolId[] = pools.map((p) => p.id);
/** Front drives, bay order. */
export const frontDrives: Drive[] = [...server.drives].sort((a, b) => a.bay - b.bay);
/** A drive's pen: its pool's colour, or the neutral ink for a spare in no pool. */
export const driveClass = (d: Drive): string => (d.pool ? `pool-${d.pool}` : 'pool-none');
/** `hot`: the pool's hot spare. `idle`: a spare in no pool. */
export const spareKind = (d: Drive): 'hot' | 'idle' | undefined => (d.role === 'spare' ? (d.pool ? 'hot' : 'idle') : undefined);
/** The model's short name: "S3520", "MX500", "PATRIOT", "ST300MP0004". */
export const driveTag = (d: Drive): string =>
  d.interface === 'SAS' ? d.model : d.maker === 'Crucial' ? 'MX500' : (/\bS\d{4}\b/.exec(d.model)?.[0] ?? d.maker.toUpperCase());
/** Lettering on a carrier: "S3520 1.6 TB", "GIGASTONE 256 GB", "MX500 1 TB", "ST300MP0004". */
export const driveShort = (d: Drive): string =>
  d.interface === 'SAS' ? d.model : `${driveTag(d)} ${d.sizeGB >= 1000 ? `${d.sizeGB / 1000} TB` : `${d.sizeGB} GB`}`.toUpperCase();
/** The carrier's lettering with its spare status. */
export const driveLetter = (d: Drive): string => driveShort(d) + (d.role === 'spare' ? ' · SPARE' : '');
/** The longest lettering that fits `avail` paper units up a carrier (9-unit mono, .06 em tracking). */
export const fitLetter = (d: Drive, avail: number): string =>
  [driveLetter(d), driveShort(d)].find((t) => monoWidth(t, 9, 0.06) <= avail) ?? driveTag(d);

/** Sheet 02's stamp: as built since the R730 took the slot. Each view sets it down where it has room (Stamp.astro). */
export const STAMP = { text: 'AS BUILT', sub: 'R730 · 2026-10-02', tone: 'ok' as const };

/* ------------------------------------------------------------------ balloon numbers */
/**
 * One numbering for the whole sheet: a part keeps its number in every view it appears in, and
 * the card shows it. Drives by bay, then the pools, then the machine, then what is inside it,
 * front to back (the order of server.internal).
 */
export const NUM: Record<string, number> = Object.fromEntries(
  [...frontDrives.map((d) => d.id), ...POOL_IDS, 'server', ...server.internal.map((p) => p.id)].map((id, i) => [id, i + 1]),
);
