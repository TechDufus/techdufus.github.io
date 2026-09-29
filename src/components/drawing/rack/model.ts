/**
 * Sheet 01 · The cabinet: model-space geometry (mm) derived from src/data/hardware/rack.ts, and
 * the panel path generators that turn each device's `panels` zones into line work.
 *
 * Model axes follow the kit: x = width (0 = left edge of the 19″ panel frame, as seen from the
 * front), y = height (0 = bottom of U1), z = depth (0 = the front rail's mounting plane, + to the
 * back). Panel drawings are face-local (u right, v down, mm) with the origin at the top-left of
 * the 482.6 mm frame, so one drawing fits every view: ortho for elevations, faceMatrix for iso.
 *
 * Cabinet placement values not in the data (rail set-back, door leaf thickness) are marked
 * ASSUMED here and on the sheet.
 */
import { cabinet, derived, devices, links, offSheet, sources } from '../../../data/hardware/rack';
import type { Device, PanelZone } from '../../../data/hardware/types';
import { RACK_19_MM, U_MM } from '../../../lib/drawing/projection';

const r1 = (n: number): string => String(Math.round(n * 10) / 10);
/** Compact rect path in face-local mm. */
export const rr = (x: number, y: number, w: number, h: number): string => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
const hl = (x: number, y: number, w: number): string => `M${r1(x)} ${r1(y)}h${r1(w)}`;
const vl = (x: number, y: number, h: number): string => `M${r1(x)} ${r1(y)}v${r1(h)}`;
const ci = (cx: number, cy: number, r: number): string =>
  `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`;

/* ------------------------------------------------------------------ cabinet */

const outer = cabinet.outer.value;
const railSpan = cabinet.railSpan?.value ?? 750;
/** ASSUMED: rails centred front to back in the enclosure. */
const setBack = (outer.d - railSpan) / 2;
export const CAB = {
  w: outer.w,
  h: outer.h,
  d: outer.d,
  x0: -(outer.w - RACK_19_MM) / 2,
  x1: RACK_19_MM + (outer.w - RACK_19_MM) / 2,
  /** floor (bottom of the plinth) and roof, relative to the bottom of U1 */
  y0: -(cabinet.u1FloorMm?.value ?? 70),
  y1: outer.h - (cabinet.u1FloorMm?.value ?? 70),
  /** outer front (door face) and rear */
  z0: -setBack,
  z1: railSpan + setBack,
  railSpan,
  setBack,
  units: cabinet.heightU,
  railTop: cabinet.heightU * U_MM,
  /** ASSUMED sheet thickness for door and panels, for drawing only */
  skin: 20,
};

/* ------------------------------------------------------------------ devices */

export type Slot = {
  dev: Device;
  n: number;
  /** bottom of the device in model y */
  y0: number;
  /** nominal slot height (U × 44.45) or the body height for shelf items */
  hU: number;
  /** body box */
  body: { x: number; y: number; z: number; w: number; h: number; d: number };
  /** front plate / ears box (full frame width for 19″ faces), if any */
  plate?: { x: number; w: number; z: number; t: number; h: number };
  ears?: { w: number; t: number };
  /** z of the face that carries the front panel drawing, and model y of its top edge */
  faceZ: number;
  faceTop: number;
  /** x offset of the panel drawing's origin (for faces narrower than the frame) */
  faceX: number;
  faceW: number;
  faceH: number;
  /** travel when selected, mm (out of the front); lift for the Pi */
  travel: number;
  lift?: number;
};

const byId = new Map(devices.map((d) => [d.id, d]));
export const dev = (id: string): Device => {
  const d = byId.get(id);
  if (!d) throw new Error(`rack model: unknown device ${id}`);
  return d;
};

/** Balloon numbers, top of the cabinet to the bottom, then the devices kept elsewhere. */
export const ORDER = ['rpi-4b', 'shelf', 'patch-panel', 'udm-pro', 'unas-pro-8', 'r720xd', 'u7-pro', 'flex-mini'] as const;
export const balloonOf = (id: string): number => ORDER.indexOf(id as (typeof ORDER)[number]) + 1;

const yOf = (d: Device): number => ((d.u?.value ?? 1) - 1) * U_MM;
const PI_X = 300;
const PI_Z = 24;

function slotOf(d: Device): Slot {
  const n = balloonOf(d.id);
  const b = d.body.value;
  const y0 = yOf(d);
  const hU = (d.heightU ?? 0) * U_MM;
  const cx = (RACK_19_MM - b.w) / 2;
  switch (d.id) {
    case 'r720xd':
      // Ears + drive carriers stand 18 mm proud of the rack flange (Dell Za); body behind it.
      return {
        dev: d, n, y0, hU,
        body: { x: cx, y: y0 + 0.8, z: 0, w: b.w, h: b.h, d: b.d },
        plate: { x: 0.1, w: 482.4, z: -18, t: 18, h: b.h },
        faceZ: -18, faceTop: y0 + 0.8 + b.h, faceX: 0.1, faceW: 482.4, faceH: b.h, travel: 320,
      };
    case 'patch-panel':
      return {
        dev: d, n, y0, hU,
        body: { x: 24, y: y0 + 4, z: 0, w: RACK_19_MM - 48, h: hU - 8.8, d: b.d },
        plate: { x: 0, w: RACK_19_MM, z: -2.5, t: 2.5, h: hU - 0.8 },
        faceZ: -2.5, faceTop: y0 + hU - 0.4, faceX: 0, faceW: RACK_19_MM, faceH: hU - 0.8, travel: 90,
      };
    case 'shelf':
      return {
        dev: d, n, y0, hU,
        body: { x: 16, y: y0 + 0.4, z: 0, w: RACK_19_MM - 32, h: hU - 0.8, d: b.d },
        plate: { x: 0, w: RACK_19_MM, z: -3, t: 3, h: hU - 0.8 },
        faceZ: -3, faceTop: y0 + hU - 0.4, faceX: 0, faceW: RACK_19_MM, faceH: hU - 0.8, travel: 160,
      };
    case 'rpi-4b':
      // Stands on the shelf (top of U24), port end to the front; board 56 wide × 85 deep.
      return {
        dev: d, n, y0, hU: b.h,
        body: { x: PI_X, y: y0, z: PI_Z, w: 56, h: b.h, d: 85 },
        faceZ: PI_Z, faceTop: y0 + b.h, faceX: PI_X, faceW: 56, faceH: b.h, travel: 0, lift: 46,
      };
    default:
      // UDM Pro, UNAS Pro 8: body face flush with 3 mm rack brackets.
      return {
        dev: d, n, y0, hU,
        body: { x: cx, y: y0 + (hU - b.h) / 2, z: -3, w: b.w, h: b.h, d: b.d },
        ears: { w: cx, t: 3 },
        faceZ: -3, faceTop: y0 + (hU + b.h) / 2, faceX: cx, faceW: b.w, faceH: b.h, travel: d.id === 'unas-pro-8' ? 300 : 170,
      };
  }
}

/** Every device in the cabinet, bottom to top (the iso painter's order). */
export const slots: Slot[] = devices
  .filter((d) => d.location === 'cabinet')
  .map(slotOf)
  .sort((a, b) => a.y0 - b.y0 || a.n - b.n);
export const slotOf$ = (id: string): Slot => {
  const s = slots.find((x) => x.dev.id === id);
  if (!s) throw new Error(`rack model: ${id} is not in the cabinet`);
  return s;
};
export const racked = slots.filter((s) => s.dev.mount === 'rack');
export const elsewhere = ORDER.slice(6).map(dev);

/** U range text: "U18–19", "U24", "ON U24 SHELF" */
export function uText(d: Device): string {
  const u = d.u?.value;
  if (u === undefined) return '—';
  if (d.mount === 'shelf') return `U${u} (on shelf)`;
  const h = d.heightU ?? 1;
  return h > 1 ? `U${u}–${u + h - 1}` : `U${u}`;
}

/** Contiguous free runs of U (1-based, inclusive). */
export function freeRuns(): { from: number; to: number }[] {
  const used = new Set<number>();
  for (const s of racked) for (let i = 0; i < (s.dev.heightU ?? 0); i++) used.add((s.dev.u?.value ?? 0) + i);
  const runs: { from: number; to: number }[] = [];
  for (let u = 1; u <= CAB.units; u++) {
    if (used.has(u)) continue;
    const last = runs.at(-1);
    if (last && last.to === u - 1) last.to = u;
    else runs.push({ from: u, to: u });
  }
  return runs;
}
export const stack = {
  from: Math.min(...racked.map((s) => s.dev.u?.value ?? 99)),
  to: Math.max(...racked.map((s) => (s.dev.u?.value ?? 0) + (s.dev.heightU ?? 1) - 1)),
};

export { cabinet, derived, devices, links, offSheet, sources };

/** The sheet's id (defs, tabs, parts); shared by the page, the lazy views and ./rack.ts. */
export { DWG } from './dwg';

/* ------------------------------------------------------------------ panel line work */

/** Line work of one face, in face-local mm (origin top-left of the 482.6 frame). */
export type Panel = { obj: string; med: string; thin: string; hid?: string };

/** EIA-310 hole centres across a 19″ panel: 465.1 mm apart, centred. */
export const HOLES = [(RACK_19_MM - 465.1) / 2, (RACK_19_MM + 465.1) / 2];

const RJ = (x: number, y: number, w: number, h: number): string =>
  // RJ45 jack: opening plus the latch notch on the lower edge
  rr(x, y, w, h) + `M${r1(x + w * 0.3)} ${r1(y + h)}v${r1(-h * 0.22)}h${r1(w * 0.4)}v${r1(h * 0.22)}`;
/** A row of n identical jacks at pitch p, the first absolute and the rest relative. */
function jacks(x: number, y: number, w: number, h: number, p: number, n: number): string {
  const one = `h${r1(w)}v${r1(h)}h${r1(-w)}Z` + `m${r1(w * 0.3)} ${r1(h)}v${r1(-h * 0.22)}h${r1(w * 0.4)}v${r1(h * 0.22)}`;
  // after the notch the pen sits at (x + 0.7w, y + h): step back to the next jack's corner
  const next = `m${r1(p - w * 0.7)} ${r1(-h)}`;
  return `M${r1(x)} ${r1(y)}${one}` + `${next}${one}`.repeat(n - 1);
}

/** Draw zones laid out as fractions of a face `w` × `h` placed at (ox, 0) in the frame. */
function zonesPanel(d: Device, face: 'front' | 'rear', ox: number, w: number, h: number): Panel {
  const zones = d.panels?.[face]?.zones ?? [];
  const obj: string[] = [], med: string[] = [], thin: string[] = [];
  const X = (f: number): number => ox + f * w;
  const Y = (f: number): number => f * h;
  for (const z of zones) {
    const x = X(z.x0), y = Y(z.y0), zw = (z.x1 - z.x0) * w, zh = (z.y1 - z.y0) * h;
    drawZone(d.id, z, x, y, zw, zh, obj, med, thin);
  }
  return { obj: obj.join(''), med: med.join(''), thin: thin.join('') };
}

function drawZone(id: string, z: PanelZone, x: number, y: number, w: number, h: number, obj: string[], med: string[], thin: string[]): void {
  const key = `${id}:${z.id}`;
  if (key === 'r720xd:bays') {
    // 24 carriers, bay 0 at the left: release button up top, vented handle below.
    // One carrier drawn in relative steps, repeated with a relative move: a sixth of the bytes.
    const cw = w / 24, r = cw * 0.18, hw = cw * 0.56, hh = h * 0.62, vw = cw * 0.4;
    const carrier = `h${r1(cw - 0.8)}v${r1(h)}h${r1(0.8 - cw)}Z`;
    const detail =
      `a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0` +
      `m${r1(cw * 0.22 - (cw / 2 - r))} ${r1(h * 0.16)}h${r1(hw)}v${r1(hh)}h${r1(-hw)}Z` +
      `m${r1(cw * 0.08)} ${r1(h * 0.16)}h${r1(vw)}m${r1(-vw)} ${r1(h * 0.2)}h${r1(vw)}`;
    med.push(`M${r1(x + 0.4)} ${r1(y)}${carrier}` + `m${r1(cw)} 0${carrier}`.repeat(23));
    for (let i = 0; i < 24; i++) thin.push(`M${r1(x + i * cw + cw / 2 - r)} ${r1(y + h * 0.1)}${detail}`);
    return;
  }
  if (key === 'udm-pro:lan-top' || key === 'udm-pro:lan-bottom') {
    const pw = w / 4;
    med.push(jacks(x + 0.4, y, pw - 0.8, h, pw, 4));
    return;
  }
  if (key === 'patch-panel:jacks') {
    // 24 jacks in four groups of six (group size assumed, per the data note)
    const gap = 6, pw = (w - 3 * gap) / 24;
    for (let g = 0; g < 4; g++) med.push(jacks(x + g * (6 * pw + gap) + 0.5, y, pw - 1, h, pw, 6));
    return;
  }
  if (key === 'r720xd:diag') {
    const cw = w / 3, chh = h / 2;
    for (let i = 0; i < 6; i++) thin.push(rr(x + (i % 3) * cw + 0.3, y + Math.floor(i / 3) * chh + 0.3, cw - 0.6, chh - 0.6));
    return;
  }
  switch (z.kind) {
    case 'bay':
      obj.push(rr(x, y, w, h));
      // tray handle / latch and a few vent lines
      thin.push(rr(x + w * 0.06, y + h * 0.66, w * 0.5, h * 0.2));
      thin.push(`M${r1(x + w * 0.62)} ${r1(y + h * 0.2)}` + Array.from({ length: 5 }, (_, k) => `${k ? `m${r1(-w * 0.3)} ${r1(h * 0.14)}` : ''}h${r1(w * 0.3)}`).join(''));
      return;
    case 'port':
      if (/sfp/i.test(z.id)) med.push(rr(x, y, w, h), rr(x + w * 0.18, y + h * 0.25, w * 0.64, h * 0.5));
      else if (/usb|vga|serial|rps|ac|usbc|power/i.test(z.id)) med.push(rr(x, y, w, h), rr(x + w * 0.2, y + h * 0.28, w * 0.6, h * 0.44));
      else med.push(RJ(x, y, w, h));
      return;
    case 'display':
      med.push(rr(x, y, w, h));
      thin.push(rr(x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.72));
      return;
    case 'vent':
      if (z.id === 'handle') { med.push(rr(x, y, w, h)); return; }
      thin.push(rr(x, y, w, h));
      return;
    case 'fan': {
      const r = Math.min(w, h) / 2, cx = x + w / 2, cy = y + h / 2;
      med.push(ci(cx, cy, r));
      thin.push(ci(cx, cy, r * 0.72), ci(cx, cy, r * 0.44), ci(cx, cy, r * 0.16));
      thin.push(`M${r1(cx - r)} ${r1(cy)}h${r1(2 * r)}M${r1(cx)} ${r1(cy - r)}v${r1(2 * r)}`);
      return;
    }
    case 'psu': {
      med.push(rr(x, y, w, h));
      if (/bay/.test(z.id)) { thin.push(rr(x + w * 0.1, y + h * 0.2, w * 0.8, h * 0.6)); return; }
      // AC inlet on the left, fan grille on the right
      thin.push(rr(x + w * 0.08, y + h * 0.25, w * 0.22, h * 0.5), ci(x + w * 0.66, y + h / 2, Math.min(w * 0.22, h * 0.38)));
      thin.push(hl(x + w * 0.04, y + h * 0.92, w * 0.5));
      return;
    }
    case 'slot':
      med.push(rr(x, y, w, h));
      for (let k = 1; k < 6; k++) thin.push(vl(x + (w * k) / 6, y + h * 0.25, h * 0.5));
      return;
    case 'button':
      thin.push(ci(x + w / 2, y + h / 2, Math.max(w, h) / 2));
      return;
    case 'led':
    case 'label':
      thin.push(rr(x, y, w, h));
      return;
    case 'ear':
      med.push(rr(x, y, w, h));
      return;
  }
}

/** Front panel line work, face-local (v down from the top of the face). */
export function frontPanel(s: Slot): Panel {
  const d = s.dev;
  switch (d.id) {
    case 'r720xd': {
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH);
      return { ...p, obj: rr(s.faceX, 0, s.faceW, s.faceH) + p.obj };
    }
    case 'patch-panel': {
      const p = zonesPanel(d, 'front', 0, RACK_19_MM, s.faceH);
      return { obj: rr(0, 0, RACK_19_MM, s.faceH), med: p.med + slotsAt(HOLES, s.faceH), thin: p.thin };
    }
    case 'shelf': {
      // plain lip with two slotted ears; perforations are on the tray, not the face
      const perf: string[] = [];
      for (let i = 0; i < 13; i++) perf.push(rr(40 + i * 31, s.faceH * 0.42, 18, s.faceH * 0.18));
      return { obj: rr(0, 0, RACK_19_MM, s.faceH), med: slotsAt(HOLES, s.faceH), thin: perf.join('') };
    }
    case 'rpi-4b': {
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH);
      return { ...p, obj: rr(s.faceX, 0, s.faceW, s.faceH) };
    }
    default: {
      // UDM Pro / UNAS Pro 8: body face + separate rack brackets
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH);
      const top = (s.hU - s.faceH) / 2;
      const ears = rr(0, -top, s.faceX, s.hU - 0.8) + rr(RACK_19_MM - s.faceX, -top, s.faceX, s.hU - 0.8);
      return {
        obj: rr(s.faceX, 0, s.faceW, s.faceH) + p.obj,
        med: ears + p.med + slotsAt(HOLES, s.hU - 0.8, -top, d.heightU ?? 1),
        thin: p.thin,
      };
    }
  }
}

function slotsAt(xs: number[], h: number, y0 = 0, units = 1): string {
  const out: string[] = [];
  for (const x of xs) {
    for (let u = 0; u < units; u++) {
      for (const c of [6.35, 38.1]) {
        const cy = y0 + h - (u * U_MM + c) + 0.4;
        out.push(`M${r1(x - 3)} ${r1(cy - 3.2)}h6a3.2 3.2 0 0 1 0 6.4h-6a3.2 3.2 0 0 1 0-6.4Z`);
      }
    }
  }
  return out.join('');
}

/** Rear panel line work, as seen from behind (u right as you stand behind the cabinet). */
export function rearPanel(s: Slot): Panel {
  const d = s.dev;
  // From behind, a body at x..x+w (front coords) sits at 482.6 − x − w.
  const ox = RACK_19_MM - s.body.x - s.body.w;
  switch (d.id) {
    case 'patch-panel':
      return { obj: '', med: '', thin: '', hid: rr(ox, 0, s.body.w, s.body.h) };
    case 'shelf':
      return { obj: rr(ox, 0, s.body.w, s.body.h), med: '', thin: '' };
    case 'rpi-4b':
      return { obj: rr(ox, 0, s.body.w, s.body.h), med: '', thin: rr(ox + 20, s.body.h - 3, 15, 2) };
    default: {
      const p = zonesPanel(d, 'rear', ox, s.body.w, s.body.h);
      return { ...p, obj: rr(ox, 0, s.body.w, s.body.h) + p.obj };
    }
  }
}

/** Centre of a named zone on a face, in face-local mm (front: as seen from the front; rear: from behind). */
export function zoneCentre(s: Slot, face: 'front' | 'rear', zoneId: string): [number, number] {
  const z = s.dev.panels?.[face]?.zones.find((q) => q.id === zoneId);
  if (!z) throw new Error(`rack model: ${s.dev.id} has no ${face} zone ${zoneId}`);
  const ox = face === 'front' ? s.faceX : RACK_19_MM - s.body.x - s.body.w;
  const w = face === 'front' ? s.faceW : s.body.w;
  const h = face === 'front' ? s.faceH : s.body.h;
  return [ox + ((z.x0 + z.x1) / 2) * w, ((z.y0 + z.y1) / 2) * h];
}
