/**
 * Sheet 01 · The cabinet: model-space geometry (mm) derived from src/data/lab/rack.ts, and the
 * panel path generators that turn each device's `panels` zones into line work.
 *
 * Model axes follow the kit: x = width (0 = left edge of the 19″ panel frame, as seen from the
 * front), y = height (0 = the bottom of the rails, i.e. the bottom of U42, since this cabinet
 * counts its units from the top), z = depth (0 = the front rail's mounting plane, + to the back).
 * Panel drawings are face-local (u right, v down, mm) with the origin at the top-left of the
 * 482.6 mm frame, so one drawing fits every view: ortho for elevations, faceMatrix for iso.
 */
import { cabinet, derived, device, devices, devicesByRole, links, offSheet, uLabel, uMap } from '../../../data/lab/rack';
import type { Device, DeviceId, PanelZone, URange } from '../../../data/lab/types';
import { RACK_19_MM, U_MM, join, matrix, type Ortho } from '../../../lib/drawing/projection';

const r1 = (n: number): string => String(Math.round(n * 10) / 10);
/** Compact rect path in face-local mm. */
export const rr = (x: number, y: number, w: number, h: number): string => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}Z`;
const ci = (cx: number, cy: number, r: number): string =>
  `M${r1(cx - r)} ${r1(cy)}a${r1(r)} ${r1(r)} 0 1 0 ${r1(2 * r)} 0a${r1(r)} ${r1(r)} 0 1 0 ${r1(-2 * r)} 0`;
/** Axis-aligned ellipse path (face-local or paper). */
export const el = (cx: number, cy: number, rx: number, ry: number): string =>
  `M${r1(cx - rx)} ${r1(cy)}a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(2 * rx)} 0a${r1(rx)} ${r1(ry)} 0 1 0 ${r1(-2 * rx)} 0`;

/* ------------------------------------------------------------------ cabinet */

const N = cabinet.heightU;
/** Model y of the bottom / top edge of rack unit `u` (U1 is the top). */
export const yBot = (u: number): number => (N - u) * U_MM;
export const yTop = (u: number): number => (N - u + 1) * U_MM;
/** Model y span of a U range: [bottom, top]. */
export const ySpan = (r: URange): [number, number] => [yBot(r.bottom), yTop(r.top)];

const { outer, railSpan } = cabinet;
/** Rails centred front to back in the enclosure (a drawing choice; the survey didn't measure it). */
const setBack = (outer.d - railSpan) / 2;
export const CAB = {
  w: outer.w,
  h: outer.h,
  d: outer.d,
  x0: -(outer.w - RACK_19_MM) / 2,
  x1: RACK_19_MM + (outer.w - RACK_19_MM) / 2,
  /** floor and roof, relative to the bottom of the rails */
  y0: -cabinet.railFloorMm,
  y1: outer.h - cabinet.railFloorMm,
  /** outer front (door face) and rear */
  z0: -setBack,
  z1: railSpan + setBack,
  railSpan,
  setBack,
  units: N,
  railTop: N * U_MM,
  /** sheet-metal thickness of the door and panels, for drawing only */
  skin: 20,
};

/** EIA-310 rail flange width, and the hole centres across a 19″ panel (465.1 mm apart, centred). */
export const RAIL_W = 15.875;
export const HOLES = [(RACK_19_MM - 465.1) / 2, (RACK_19_MM + 465.1) / 2];

/** Devices that pull air front to back (both have fans behind front intakes); airflow is drawn for these only. */
export const FRONT_TO_BACK: DeviceId[] = ['unas-pro-8', 'r720xd'];

/* ------------------------------------------------------------------ devices */

type Box3 = { x: number; y: number; z: number; w: number; h: number; d: number };
export type Slot = {
  dev: Device;
  n: number;
  /** bottom of the slot in model y */
  y0: number;
  /** slot height (U × 44.45), or the body height for things standing on a shelf */
  hU: number;
  body: Box3;
  /** front plate (the R720xd's ears and carriers), if any */
  plate?: { x: number; w: number; z: number; t: number; h: number };
  /** separate 3 mm rack brackets (UDM Pro, UNAS Pro 8, shelves), each `w` wide */
  ears?: { w: number; t: number };
  /** z of the face carrying the front panel drawing, and model y of its top edge */
  faceZ: number;
  faceTop: number;
  faceX: number;
  faceW: number;
  faceH: number;
  /** travel out of the front when selected, mm; `lift` for things standing on a shelf */
  travel: number;
  lift?: number;
  /** the shelf a thing stands on */
  on?: DeviceId;
};

/** Balloon numbers: the /lab list order (Compute, Network, Storage, Edge), then the shelves and spares. */
const listed = devicesByRole();
export const ORDER: DeviceId[] = [
  ...listed.flatMap((g) => g.devices.map((d) => d.id)),
  ...devices.filter((d) => d.role === 'shelf').map((d) => d.id),
];
export const balloonOf = (id: DeviceId): number => ORDER.indexOf(id) + 1;
/** Things on a shelf stand this far back from the front rail. */
const ON_SHELF_Z = 24;

function slotOf(d: Device): Slot {
  const n = balloonOf(d.id);
  const b = d.body;
  if (d.placement.kind === 'shelf') {
    const sh = slotOf(device(d.placement.shelf));
    const y = sh.body.y + sh.body.h;
    return {
      dev: d, n, y0: y, hU: b.h, on: sh.dev.id,
      body: { x: d.placement.x, y, z: ON_SHELF_Z, w: b.w, h: b.h, d: b.d },
      faceZ: ON_SHELF_Z, faceTop: y + b.h, faceX: d.placement.x, faceW: b.w, faceH: b.h, travel: 0, lift: 40,
    };
  }
  if (d.placement.kind !== 'rack') throw new Error(`rack model: ${d.id} is not in the cabinet`);
  const [y0, y1] = ySpan(d.placement.u);
  const hU = y1 - y0;
  const cx = (RACK_19_MM - b.w) / 2;
  if (d.id === 'r720xd') {
    // Ears + drive carriers stand 18 mm proud of the rack flange (Dell Za); the body sits behind.
    return {
      dev: d, n, y0, hU,
      body: { x: cx, y: y0 + 0.8, z: 0, w: b.w, h: b.h, d: b.d },
      plate: { x: 0.1, w: d.earsWidth ?? 482.4, z: -18, t: 18, h: b.h },
      faceZ: -18, faceTop: y0 + 0.8 + b.h, faceX: 0.1, faceW: d.earsWidth ?? 482.4, faceH: b.h, travel: 320,
    };
  }
  if (d.role === 'shelf') {
    // Cantilever shelf: a bracket at each end of the 2U face, and the vented tray between them.
    const zones = d.panels?.front?.zones ?? [];
    const ear = (zones.find((q) => q.id === 'ear-l')?.x1 ?? 0.04) * RACK_19_MM;
    const tray = zones.find((q) => q.id === 'tray');
    return {
      dev: d, n, y0, hU,
      body: { x: ear, y: y0 + 0.4, z: -3, w: RACK_19_MM - 2 * ear, h: (tray ? tray.y1 - tray.y0 : 0.16) * b.h, d: b.d + 3 },
      ears: { w: ear, t: 3 },
      faceZ: -3, faceTop: y0 + hU - 0.4, faceX: 0, faceW: RACK_19_MM, faceH: hU - 0.8, travel: 0,
    };
  }
  // UDM Pro, UNAS Pro 8: the body face is flush with 3 mm rack brackets.
  return {
    dev: d, n, y0, hU,
    body: { x: cx, y: y0 + (hU - b.h) / 2, z: -3, w: b.w, h: b.h, d: b.d },
    ears: { w: cx, t: 3 },
    faceZ: -3, faceTop: y0 + (hU + b.h) / 2, faceX: cx, faceW: b.w, faceH: b.h, travel: d.id === 'unas-pro-8' ? 300 : 170,
  };
}

/** Everything in the cabinet, bottom to top, each shelf before what stands on it (the iso painter's order). */
export const slots: Slot[] = devices
  .filter((d) => d.placement.kind !== 'elsewhere')
  .map(slotOf)
  .sort((a, b) => a.y0 - b.y0 || a.body.x - b.body.x);
export const slotOf$ = (id: DeviceId): Slot => {
  const s = slots.find((x) => x.dev.id === id);
  if (!s) throw new Error(`rack model: ${id} is not in the cabinet`);
  return s;
};
/** Off the sheet: the U7 Pro. */
export const elsewhere = devices.filter((d) => d.placement.kind === 'elsewhere');

/** U text for the schedule: "U13–14"; a thing on a shelf gets the shelf's; "Off sheet" otherwise. */
export function uText(d: Device): string {
  const p = d.placement;
  if (p.kind === 'rack') return uLabel(p.u);
  if (p.kind === 'shelf') {
    const s = device(p.shelf).placement;
    return s.kind === 'rack' ? uLabel(s.u) : '';
  }
  return 'Off sheet';
}

/** Empty runs of rack units, top to bottom, with their model y span. */
export const free = uMap
  .filter((s) => !s.device)
  .map((s) => {
    const [y0, y1] = ySpan(s.u);
    return { ...s.u, n: s.u.bottom - s.u.top + 1, y0, y1 };
  });

/** The transform that puts a front panel symbol (#{dwg}-pf-{id}) on its face in an elevation. */
export const placeFront = (v: Ortho, sl: Slot): string => {
  const [x, y] = v.pt(0, sl.faceTop);
  return matrix([v.scale, 0, 0, v.scale, x, y]);
};
/** A slot's front outline in an elevation (face, ears or shelf tray), for the fill behind its panel. */
export const faceRect = (v: Ortho, sl: Slot): string => {
  if (sl.plate) return v.rect(sl.plate.x, sl.faceTop - sl.plate.h, sl.plate.w, sl.plate.h);
  if (sl.dev.id === 'patch-cables') return '';
  const ears = sl.ears ? join(v.rect(0, sl.y0 + 0.4, sl.ears.w, sl.hU - 0.8), v.rect(RACK_19_MM - sl.ears.w, sl.y0 + 0.4, sl.ears.w, sl.hU - 0.8)) : '';
  if (sl.dev.role === 'shelf' && !sl.on) return join(ears, v.rect(sl.body.x, sl.body.y, sl.body.w, sl.body.h));
  return join(v.rect(sl.faceX, sl.faceTop - sl.faceH, sl.faceW, sl.faceH), ears);
};

export { cabinet, derived, device, devices, devicesByRole, links, offSheet, uLabel };

/** The sheet's id (defs, tabs, parts); shared by the page, the lazy views and ./rack.ts. */
export { DWG } from './dwg';

/* ------------------------------------------------------------------ panel line work */

/** Line work of one face, in face-local mm (origin top-left of the 482.6 frame). */
export type Panel = { obj: string; med: string; thin: string; hid?: string };

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
/** Coil of patch cable seen side-on: flat loops stacked on the shelf, plugs trailing off the front. */
function coilSide(x: number, w: number, h: number): string {
  const loops = [0, 1, 2, 3].map((i) => el(x + w / 2 + (i % 2 ? 3 : -2), h - 4 - i * ((h - 8) / 3), w / 2 - 3 - (i % 2) * 4, 3.4));
  return loops.join('') + rr(x + w * 0.62, h - 9, 7, 5) + rr(x + w * 0.74, h - 5, 7, 5);
}

/** Draw zones laid out as fractions of a face `w` × `h` placed at (ox, 0) in the frame. `lite` drops
 *  the finest texture (carrier detail, perforations, vent lines; frontPanel: ear slots) for small, byte-tight drawings. */
function zonesPanel(d: Device, face: 'front' | 'rear', ox: number, w: number, h: number, lite = false): Panel {
  const obj: string[] = [], med: string[] = [], thin: string[] = [];
  for (const z of d.panels?.[face]?.zones ?? []) {
    drawZone(d.id, z, ox + z.x0 * w, z.y0 * h, (z.x1 - z.x0) * w, (z.y1 - z.y0) * h, obj, med, thin, lite);
  }
  return { obj: obj.join(''), med: med.join(''), thin: thin.join('') };
}

function drawZone(id: string, z: PanelZone, x: number, y: number, w: number, h: number, obj: string[], med: string[], thin: string[], lite: boolean): void {
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
    if (!lite) for (let i = 0; i < 24; i++) thin.push(`M${r1(x + i * cw + cw / 2 - r)} ${r1(y + h * 0.1)}${detail}`);
    return;
  }
  if (key === 'udm-pro:lan-top' || key === 'udm-pro:lan-bottom') {
    const pw = w / 4;
    med.push(jacks(x + 0.4, y, pw - 0.8, h, pw, 4));
    return;
  }
  if (key === 'r720xd:diag') {
    const cw = w / 3, chh = h / 2;
    for (let i = 0; i < 6; i++) thin.push(rr(x + (i % 3) * cw + 0.3, y + Math.floor(i / 3) * chh + 0.3, cw - 0.6, chh - 0.6));
    return;
  }
  if (key === 'ont:leds') {
    // the row of status lights along the top
    for (let i = 0; i < 5; i++) thin.push(ci(x + (w * (i + 0.5)) / 5, y + h / 2, 1.2));
    return;
  }
  if (key === 'ont:vents') {
    // staggered rows of short slots, as in the photo
    const rows = lite ? 3 : 6, cols = lite ? 10 : 14, sw = w / cols;
    for (let j = 0; j < rows; j++) {
      const off = j % 2 ? sw / 2 : 0;
      const n = j % 2 ? cols - 1 : cols;
      thin.push(`M${r1(x + off + sw * 0.2)} ${r1(y + ((j + 0.5) * h) / rows)}` + Array.from({ length: n }, (_, i) => `${i ? `m${r1(sw * 0.4)} 0` : ''}h${r1(sw * 0.6)}`).join(''));
    }
    return;
  }
  if (z.kind === 'vent' && id.endsWith('shelf')) {
    // the tray's front lip: a line of hex perforations
    obj.push(rr(x, y, w, h));
    if (lite) return;
    const n = Math.floor(w / 14);
    thin.push(Array.from({ length: n }, (_, i) => rr(x + 5 + i * 14, y + h * 0.3, 6, h * 0.4)).join(''));
    return;
  }
  switch (z.kind) {
    case 'bay':
      obj.push(rr(x, y, w, h));
      // tray handle / latch and a few vent lines
      thin.push(rr(x + w * 0.06, y + h * 0.66, w * 0.5, h * 0.2));
      if (!lite) thin.push(`M${r1(x + w * 0.62)} ${r1(y + h * 0.2)}` + Array.from({ length: 5 }, (_, k) => `${k ? `m${r1(-w * 0.3)} ${r1(h * 0.14)}` : ''}h${r1(w * 0.3)}`).join(''));
      return;
    case 'port':
      if (/sfp/i.test(z.id)) med.push(rr(x, y, w, h), rr(x + w * 0.18, y + h * 0.25, w * 0.64, h * 0.5));
      else if (/usb|vga|serial|rps|ac|power/i.test(z.id)) med.push(rr(x, y, w, h), rr(x + w * 0.2, y + h * 0.28, w * 0.6, h * 0.44));
      else med.push(RJ(x, y, w, h));
      return;
    case 'display':
      med.push(rr(x, y, w, h));
      thin.push(rr(x + w * 0.14, y + h * 0.14, w * 0.72, h * 0.72));
      return;
    case 'vent':
      if (z.id === 'handle') med.push(rr(x, y, w, h));
      else thin.push(rr(x, y, w, h));
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
      if (/bay/i.test(z.label)) return void thin.push(rr(x + w * 0.1, y + h * 0.2, w * 0.8, h * 0.6));
      // AC inlet on the left, fan grille on the right
      thin.push(rr(x + w * 0.08, y + h * 0.25, w * 0.22, h * 0.5), ci(x + w * 0.66, y + h / 2, Math.min(w * 0.22, h * 0.38)));
      return;
    }
    case 'slot':
      med.push(rr(x, y, w, h));
      for (let k = 1; k < 6; k++) thin.push(`M${r1(x + (w * k) / 6)} ${r1(y + h * 0.25)}v${r1(h * 0.5)}`);
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

/** Mounting slots (two per U) in rack ears at xs, for a face `h` tall whose top is at y0. */
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

/** Front panel line work, face-local (v down from the top of the face); `lite` as zonesPanel. */
export function frontPanel(s: Slot, lite = false): Panel {
  const d = s.dev;
  const units = Math.round(s.hU / U_MM);
  switch (d.id) {
    case 'r720xd': {
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH, lite);
      return { ...p, obj: rr(s.faceX, 0, s.faceW, s.faceH) + p.obj };
    }
    case 'top-shelf':
    case 'bottom-shelf': {
      // brackets and the tray lip; items on the shelf are drawn on their own
      const p = zonesPanel(d, 'front', 0, RACK_19_MM, s.faceH, lite);
      return { ...p, med: p.med + (lite ? '' : slotsAt(HOLES, s.faceH, 0, units)) };
    }
    case 'spare-drive': {
      // the open box, and the caddy's front (handle and latch) standing just above its lip
      const { faceX: x, faceW: w, faceH: h } = s;
      return { obj: rr(x, 0, w, h), med: rr(x + 8, 1.5, w - 16, 5.5), thin: `M${r1(x)} 4.5h${r1(w)}` + rr(x + 12, 2.6, 16, 3.2) };
    }
    case 'patch-cables':
      return { obj: '', med: coilSide(s.faceX, s.faceW, s.faceH), thin: '' };
    case 'rpi-4b':
    case 'ont':
    case 'poe-injector': {
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH, lite);
      return { ...p, obj: rr(s.faceX, 0, s.faceW, s.faceH) + p.obj };
    }
    default: {
      // UDM Pro / UNAS Pro 8: body face + separate rack brackets
      const p = zonesPanel(d, 'front', s.faceX, s.faceW, s.faceH, lite);
      const top = (s.hU - s.faceH) / 2;
      const ears = rr(0, -top, s.faceX, s.hU - 0.8) + rr(RACK_19_MM - s.faceX, -top, s.faceX, s.hU - 0.8);
      return {
        obj: rr(s.faceX, 0, s.faceW, s.faceH) + p.obj,
        med: ears + p.med + (lite ? '' : slotsAt(HOLES, s.hU - 0.8, -top, units)),
        thin: p.thin,
      };
    }
  }
}

/** Rear panel line work as seen from behind, face-local with v down from `faceTop`. */
export function rearPanel(s: Slot): Panel {
  const d = s.dev;
  // From behind, a body at x..x+w (front coords) sits at 482.6 − x − w.
  const ox = RACK_19_MM - s.body.x - s.body.w;
  const top = s.faceTop - (s.body.y + s.body.h);
  switch (d.id) {
    case 'top-shelf':
    case 'bottom-shelf':
      return { obj: rr(ox, top, s.body.w, s.body.h), med: rr(0, 0, s.ears!.w, s.faceH) + rr(RACK_19_MM - s.ears!.w, 0, s.ears!.w, s.faceH), thin: '' };
    case 'patch-cables':
      return { obj: '', med: coilSide(ox, s.body.w, s.body.h), thin: '' };
    case 'rpi-4b':
      // the USB-C power inlet on the far side
      return { obj: rr(ox, 0, s.body.w, s.body.h), med: '', thin: rr(ox + s.body.w * 0.55, s.body.h - 7, 9, 3.4) };
    case 'ont':
    case 'poe-injector':
    case 'spare-drive':
      return { obj: rr(ox, 0, s.body.w, s.body.h), med: '', thin: '' };
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
