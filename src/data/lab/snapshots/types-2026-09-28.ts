/**
 * The types the R720xd as built on 2026-09-28 is written in, frozen with it (see
 * ./server-2026-09-28.ts). A copy of the Sheet 02 shapes from ../types.ts as they were then, so
 * rewriting the live types for another machine never touches the post or the archived sheet.
 * Imports nothing.
 */

/* ---------------------------------------------------------------------------------------------
 * Shared
 * ------------------------------------------------------------------------------------------ */

/** One to four short lines. */
export type CardLines = [string] | [string, string] | [string, string, string] | [string, string, string, string];

/** What a clickable part's pop-up says: a title, an optional kind line, then 1–4 short lines. */
export type Card = {
  title: string;
  /** A short eyebrow: what sort of thing it is, e.g. "Gateway" or "Bay 4 · SATA SSD". */
  kind?: string;
  lines: CardLines;
};

/** x = width, y = height, z = depth (front → back), millimetres. */
export type Mm = { w: number; h: number; d: number };

/**
 * One feature on a panel, positioned as a fraction of the face, as seen by someone looking at
 * that face: x0/x1 from the left edge (0) to the right edge (1), y0/y1 from the top edge (0) to
 * the bottom edge (1).
 */
export type PanelZone = {
  id: string;
  label: string;
  kind: 'bay' | 'port' | 'button' | 'led' | 'display' | 'slot' | 'psu' | 'fan' | 'vent' | 'label' | 'ear';
  x0: number;
  x1: number;
  y0: number;
  y1: number;
};

export type PanelLayout = {
  /** What the fractions are relative to, e.g. "Body face 442.4 × 43.7 mm". */
  frame: string;
  zones: PanelZone[];
};

/* ---------------------------------------------------------------------------------------------
 * The server, as built
 * ------------------------------------------------------------------------------------------ */

export type PoolId = 'rpool' | 'fast' | 'bulk';

export type DriveId = 'gigastone-1' | 'gigastone-2' | 'mx500-500-1' | 'mx500-500-2' | 'mx500-1tb' | 'st300mp0004';

export type Cpu = {
  socket: 'CPU1' | 'CPU2';
  model: string;
  cores: number;
  threads: number;
  card: Card;
};

export type Controller = {
  id: 'hba330' | 'perc-h710p-mini';
  name: string;
  chip: string;
  mode: 'pass-through' | 'hardware RAID';
  /** ISO date it went in (the HBA330) or came out (the PERC). */
  date: string;
  card: Card;
};

export type Drive = {
  id: DriveId;
  maker: string;
  model: string;
  kind: 'ssd' | 'hdd';
  interface: 'SATA' | 'SAS';
  /** Labelled capacity, decimal GB (1 TB = 1000). */
  sizeGB: number;
  /** 0–23 front, 24–25 rear flex bays. */
  bay: number;
  pool: PoolId;
  card: Card;
};

/** A drive that has left the server; kept for the before/after views. */
export type RemovedDrive = {
  id: 'st9300653ss';
  maker: string;
  model: string;
  kind: 'hdd';
  interface: 'SAS';
  sizeGB: number;
  /** The bay it was pulled from. */
  bay: number;
  card: Card;
};

export type Pool = {
  id: PoolId;
  layout: 'mirror' | 'single';
  /** Mirror width: 3 for rpool, 2 for fast, 1 for bulk. */
  copies: number;
  bays: number[];
  /** Approximate usable size, GiB. */
  usableGiB: number;
  holds: string;
  card: Card;
};

export type Bay = {
  n: number;
  face: 'front' | 'rear';
  /** The drive in it now; omitted when empty. */
  drive?: DriveId;
  /** The drive it held before the swap, when that differs. */
  before?: 'st9300653ss';
};

export type CableN = 1 | 2 | 3 | 4 | 5;

export type Cable = {
  n: CableN;
  name: string;
  from: string;
  to: string;
  /** removed = before only; new = now only; keep = both. */
  state: 'removed' | 'new' | 'keep';
  card: Card;
};

export type Riser = {
  n: 1 | 2 | 3;
  slots: number;
  height: 'low profile' | 'full height';
  /** What sits in the riser now. */
  holds?: 'HBA330';
};

/**
 * A part in the top-down internal view. Fractions of the chassis interior: x from the left of the
 * drawing (0) to the right (1) with the front at the top, z from the front (0) to the rear (1).
 * Left in this view is the server's right side when standing at its front.
 */
export type InternalPart = {
  id: string;
  label: string;
  x: [number, number];
  z: [number, number];
  /** removed = before only; new = now only; keep = both. */
  state: 'removed' | 'new' | 'keep';
  card?: Card;
};

export type CableRoute = {
  cable: CableN;
  /** Polyline(s) in the same fractions as InternalPart, [x, z] points. */
  paths: [number, number][][];
};

export type ServerDims = {
  /** Body without ears: flange to rear wall. */
  body: Mm;
  earsWidth: number;
  /** Bezel front to the rack flange. */
  bezelDepth: number;
  /** Ear front to the rack flange. */
  earDepth: number;
  /** Rack flange to the PSU handles. */
  toPsuHandles: number;
  /** Bezel front to the PSU handles. */
  overallDepth: number;
};

export type Server = {
  id: 'r720xd';
  identity: {
    name: string;
    /** What the firmware calls it. */
    firmwareSays: string;
    card: Card;
  };
  cpus: [Cpu, Cpu];
  threads: number;
  memory: { gb: number; card: Card };
  controller: { now: Controller; before: Controller };
  /** ISO date of the PERC → HBA330 swap. */
  swapDate: string;
  bays: { front: number; rear: number; list: Bay[]; emptyCard: Card };
  drives: Drive[];
  removed: RemovedDrive;
  pools: Pool[];
  cables: Cable[];
  risers: Riser[];
  nics: { ports: number; speed: string; cabled: number; card: Card };
  psus: { count: number; card: Card };
  fans: { count: number; card: Card };
  dims: ServerDims;
  /** The same front and rear zones the cabinet sheet draws. */
  panels: { front: PanelLayout; rear: PanelLayout };
  internal: { parts: InternalPart[]; routes: CableRoute[] };
};
