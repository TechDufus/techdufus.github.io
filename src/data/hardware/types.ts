/**
 * Shared types for the hardware data behind the "Drawn to spec" sheets.
 *
 * Every fact carries its provenance, so the drawings can say how each number is known:
 * - measured: read from the machine (with `asOf`)
 * - vendor:   a manufacturer document (with `source`, a key into a `sources` record)
 * - owner:    stated by TechDufus
 * - inferred: reasoned from other facts (the `note` says how)
 * - assumed:  a placeholder until surveyed
 *
 * Coordinates follow the drawing kit: x = width (left → right as seen from the front),
 * y = height (up), z = depth (front → back), all in millimetres.
 */

export type Provenance = 'measured' | 'vendor' | 'owner' | 'inferred' | 'assumed';

export type Source = {
  title: string;
  publisher: string;
  href: string;
  /** Pages, figures or tables the facts come from. */
  where?: string;
  /** Set when the publisher's own copy was unreachable and an archived copy was used. */
  archiveOf?: string;
};

export type Fact<T = string> = {
  value: T;
  prov: Provenance;
  /** Key into the `sources` record of the file that holds the fact. Required for `vendor`. */
  source?: string;
  /** ISO date (YYYY-MM-DD) of a measurement or statement. */
  asOf?: string;
  note?: string;
};

/** x = width, y = height, z = depth (front → back), millimetres. */
export type Mm = { w: number; h: number; d: number };

export type Airflow = 'front-to-back' | 'back-to-front' | 'side-to-side' | 'passive' | 'unknown';

export type PortGroup = {
  group: string;
  count: number;
  kind: string;
  speed?: string;
  face: 'front' | 'rear';
};

/**
 * One feature on a panel, positioned as a fraction of the body's face, as seen by someone
 * looking at that face: x0/x1 from the left edge (0) to the right edge (1), y0/y1 from the top
 * edge (0) to the bottom edge (1). Traced from vendor imagery, so treat positions as approximate.
 */
export type PanelZone = {
  id: string;
  label: string;
  kind: 'bay' | 'port' | 'button' | 'led' | 'display' | 'slot' | 'psu' | 'fan' | 'vent' | 'label' | 'ear';
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  note?: string;
};

export type PanelLayout = {
  /** What the fractions are relative to, e.g. "body width 444.0 mm; ears drawn separately". */
  frame: string;
  zones: PanelZone[];
  prov: Provenance;
  source?: string;
  note?: string;
};

export type Device = {
  id: string;
  name: string;
  short: string;
  maker: string;
  model: string;
  role: string;
  category: 'compute' | 'network' | 'storage' | 'edge' | 'passive';
  location: 'cabinet' | 'elsewhere';
  /** How it is held: rack rails/ears, sitting on the cabinet shelf, on a desk, on a ceiling/wall mount. */
  mount?: 'rack' | 'shelf' | 'desk' | 'ceiling-or-wall';
  /** Lowest rack unit occupied, 1 = bottom. */
  u?: Fact<number>;
  heightU?: number;
  /** Chassis body without ears or bezel. */
  body: Fact<Mm>;
  /** Overall width including rack ears. */
  earsWidth?: Fact<number>;
  /** kg */
  mass?: Fact<number>;
  /** W, vendor maximum / nameplate. */
  maxPower?: Fact<number>;
  airflow?: Fact<Airflow>;
  specs: { label: string; fact: Fact }[];
  ports?: PortGroup[];
  /** Plain-language panel layout, left → right as seen, from vendor imagery. */
  faces?: { front?: string; rear?: string };
  /** The same layout as positioned zones, for drawing. */
  panels?: { front?: PanelLayout; rear?: PanelLayout };
  /** Whether it was seen in the Nov 2024 cabinet photo. */
  seenInPhoto?: Fact<boolean>;
  sheetHref?: string;
};

export type Endpoint = { device: string; port: string };

export type Link = {
  from: Endpoint;
  to: Endpoint;
  speed: string;
  medium?: string;
  prov: Provenance;
  source?: string;
  asOf?: string;
  note?: string;
};

export type Cabinet = {
  heightU: number;
  uMm: number;
  rackWidthIn: number;
  outer: Fact<Mm>;
  railSpan?: Fact<number>;
  doors: Fact<string>;
  notes: string[];
  /** Height of the bottom of U1 above the floor (plinth, casters), mm. */
  u1FloorMm?: Fact<number>;
  /** A real product whose published dimensions stand in for the unknown cabinet. */
  reference?: Fact<string>;
};

/* ---------------------------------------------------------------------------------------------
 * Sheet 02: the server in depth
 * ------------------------------------------------------------------------------------------ */

export type Who = 'you' | 'agent' | 'both';

export type PoolId = 'rpool' | 'fast' | 'bulk';

export type Spec = { label: string; fact: Fact };

export type Cpu = {
  socket: 'CPU1' | 'CPU2';
  model: Fact;
  specs: Spec[];
};

export type Drive = {
  id: string;
  label: string;
  maker: string;
  model: string;
  kind: 'ssd' | 'hdd';
  /** What happens to it in the swap. */
  fate: 'keep' | 'remove';
  pool: PoolId | null;
  /** Bay it sits in today, if known. */
  bay: Fact<number | null>;
  /** Suggested bay after the swap. */
  suggestedBay?: Fact<number>;
  osSize: Fact;
  vendor: Spec[];
  health: Fact;
  hours?: Fact<number>;
  hoursYears?: Fact<number>;
  remapped?: Fact<number>;
  unrecoverable?: Fact<number>;
  lifeLeftPct?: Fact<number>;
  notes?: string[];
};

export type Pool = {
  id: PoolId;
  role: string;
  layout: Fact;
  members: string[];
  usable: Fact;
  holds: Fact;
  why: string[];
};

export type Controller = {
  id: string;
  name: string;
  state: 'before' | 'after';
  status: Fact;
  specs: Spec[];
};

export type Cable = {
  n: 1 | 2 | 3 | 4 | 5;
  name: string;
  from: string;
  to: string;
  action: 'remove' | 'new' | 'keep';
  note?: string;
};

export type PcieSlot = {
  riser: 1 | 2 | 3;
  slot: number;
  cpu: 'CPU1' | 'CPU2';
  height: 'low profile' | 'full height';
  length: 'half' | 'full';
  link: 'x8' | 'x16';
  slotWidth: 'x16';
  /** What sits in it today, and what is planned. */
  today: string;
  plan?: string;
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
  state?: 'removed' | 'new' | 'keep';
  note?: string;
};

export type CableRoute = {
  cable: Cable['n'];
  /** Polyline(s) in the same fractions as InternalPart, [x, z] points. */
  paths: [number, number][][];
};

export type Stage = {
  n: number;
  title: string;
  who: Who;
  summary: string;
  refs?: string;
};

export type Unknown = { id: string; question: string; howToResolve?: string };

export type ServerDetail = {
  id: string;
  identity: {
    name: string;
    firmwareSays: Fact;
    isXd: Fact;
    howToTell: string[];
  };
  cpus: Cpu[];
  threads: Fact<number>;
  memory: {
    ownerStated: Fact;
    usable: Fact;
    usedAt: Fact;
    resolved: false;
    explanations: string[];
    slots: Fact<number>;
    maxSupported: Fact;
  };
  bays: {
    front: Fact<number>;
    rear: Fact<number>;
    numbering: Fact;
    rearNumbering: Fact;
    rearSideUnknown: string;
    carrierLeds: Fact;
  };
  drives: Drive[];
  pools: Pool[];
  controllers: { before: Controller; after: Controller };
  cables: Cable[];
  pcie: { slots: PcieSlot[]; note: Fact };
  nics: { ports: Fact<number>; model: Fact; cabled: Fact; sharedWithIdrac: Fact };
  idrac: { edition: Fact; firmware: Fact; nicMode: Fact; lacks: Fact; health: Fact };
  fans: { count: Fact<number>; rpm: Fact<[number, number]>; baselineNote: string; hotPlug: Fact };
  temperatures: { exhaustC: Fact<number>; cpuC: Fact<[number, number]>; inlet: Fact<number | null>; note: string };
  psus: { count: Fact<number>; redundant: Fact<boolean>; wattage: Fact<number | null>; options: Fact };
  dims: {
    body: Fact<Mm>;
    earsWidth: Fact<number>;
    bezelDepth: Fact<number>;
    earDepth: Fact<number>;
    toPsuHandles: Fact<number>;
    overallDepth: Fact<number>;
    mass: Fact<{ max: number; empty: number }>;
  };
  internal: {
    view: string;
    description: string[];
    parts: InternalPart[];
    routes: CableRoute[];
    prov: Provenance;
    source?: string;
    note: string;
  };
  stages: Stage[];
  unknowns: Unknown[];
  derived: Record<string, Fact<number> | Fact>;
  sources: Record<string, Source>;
};
