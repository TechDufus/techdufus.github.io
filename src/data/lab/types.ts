/**
 * Types for the lab data behind the "Drawn to spec" sheets and the /lab page.
 *
 * Plain values only: every number is simply what the drawing uses. Anything a reader can click
 * carries a `card`, the few short lines its pop-up shows.
 *
 * Coordinates follow the drawing kit: x = width (left → right as seen from the front),
 * y = height (up), z = depth (front → back), all in millimetres.
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

/** Solid on the drawings when running; a dashed phantom when planned. */
export type Status = 'running' | 'planned';

/** x = width, y = height, z = depth (front → back), millimetres. */
export type Mm = { w: number; h: number; d: number };

export type PortGroup = {
  group: string;
  count: number;
  kind: string;
  speed?: string;
  face: 'front' | 'rear';
};

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
  /** A `bay` zone's carrier count (drawn evenly across the zone); one when omitted. */
  cells?: number;
};

export type PanelLayout = {
  /** What the fractions are relative to, e.g. "Body face 442.4 × 43.7 mm". */
  frame: string;
  zones: PanelZone[];
};

export type Panels = { front?: PanelLayout; rear?: PanelLayout };

/* ---------------------------------------------------------------------------------------------
 * Sheet 01 · The cabinet
 * ------------------------------------------------------------------------------------------ */

/** How the /lab list groups the gear; `shelf` covers the shelves and the spares on them. */
export type Role = 'compute' | 'network' | 'storage' | 'edge' | 'shelf';

/** The roles the /lab list shows, in order. */
export type ListedRole = Exclude<Role, 'shelf'>;

/** Rack units, counted from the top of the cabinet (U1 is the top). `top` ≤ `bottom`. */
export type URange = { top: number; bottom: number };

export type ShelfId = 'top-shelf' | 'bottom-shelf';

export type DeviceId =
  | ShelfId
  | 'rpi-4b'
  | 'ont'
  | 'poe-injector'
  | 'unas-pro-8'
  | 'udm-pro'
  | 'r730'
  | 'u7-pro'
  | 'spare-drive'
  | 'patch-cables';

/** Where a device sits. */
export type Placement =
  /** On the rails. */
  | { kind: 'rack'; u: URange }
  /** Standing on a shelf; `x` is mm from the shelf's left edge to the item's left side, seen from the front. */
  | { kind: 'shelf'; shelf: ShelfId; x: number }
  /** Outside the cabinet, off the sheet. */
  | { kind: 'elsewhere'; where: string };

export type Device = {
  id: DeviceId;
  /** Full name, e.g. "UniFi Dream Machine Pro". */
  name: string;
  /** Label-length name, e.g. "UDM Pro". */
  short: string;
  /** Omitted for generic items whose make isn't known. */
  maker?: string;
  model: string;
  role: Role;
  placement: Placement;
  /** Body without ears or bezel. For a disc, w and d are the diameter. */
  body: Mm;
  /** Overall width including rack ears. */
  earsWidth?: number;
  ports?: PortGroup[];
  panels?: Panels;
  card: Card;
  sheetHref?: string;
};

/** A device that sits on the rails. */
export type RackDevice = Device & { placement: Extract<Placement, { kind: 'rack' }> };

/** A device that stands on a shelf. */
export type ShelfDevice = Device & { placement: Extract<Placement, { kind: 'shelf' }> };

/** Link ends that aren't devices on these sheets. */
export type OffSheetId = 'isp';

export type Endpoint = {
  device: DeviceId | OffSheetId;
  /** Omitted when the port isn't recorded. */
  port?: string;
};

export type Link = {
  id: string;
  from: Endpoint;
  to: Endpoint;
  speed?: string;
  medium: 'copper' | 'fiber' | 'sfp+' | 'poe';
  /** One end is off the cabinet sheet (the ISP, or a device kept elsewhere). */
  offSheet?: true;
};

export type Door = { kind: 'glass-door'; hinge: 'left' | 'right' };

export type RearPanel = { kind: 'perforated-panel'; pattern: 'hex' };

export type Cabinet = {
  heightU: number;
  /** One rack unit, mm (EIA-310). */
  uMm: number;
  rackWidthIn: number;
  /** U1 is at the top, as the cabinet's own rail labels count. */
  numbering: 'top-down';
  /** Nominal outer size. */
  outer: Mm;
  /** Front-to-rear rail distance, mm. */
  railSpan: number;
  /** Floor to the bottom of the rails (the bottom of U42), mm. */
  railFloorMm: number;
  front: Door;
  rear: RearPanel;
  card: Card;
};

/** One run of rack units in the U map: a device, or empty space. */
export type USpan = { u: URange; device?: DeviceId };

/* ---------------------------------------------------------------------------------------------
 * Sheet 02 · The server, as built
 * ------------------------------------------------------------------------------------------ */

export type PoolId = 'rpool' | 'fast' | 'bulk';

export type DriveId =
  | 's3520-0'
  | 's3520-1'
  | 's3520-2'
  | 's3520-3'
  | 'p210'
  | 'gigastone'
  | 'st300mp0004'
  | 'mx500-1tb'
  | 'mx500-500-1'
  | 'mx500-500-2';

export type Cpu = {
  socket: 'CPU1' | 'CPU2';
  model: string;
  cores: number;
  threads: number;
  card: Card;
};

export type Controller = {
  id: 'perc-h730p-mini';
  name: string;
  /** The mini PERC sits on the board and needs no PCIe slot. */
  mode: 'HBA mode';
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
  /** Front bay, 0–15. */
  bay: number;
  /** The pool it belongs to; omitted for the spares that sit in no pool. */
  pool?: PoolId;
  /** `spare`: with a `pool` it is that pool's hot spare, without one it is simply on the shelf (in the server). */
  role?: 'spare';
  card: Card;
};

export type Pool = {
  id: PoolId;
  layout: 'mirror' | 'single';
  /** Mirror width: 3 for rpool and fast, 1 for bulk. */
  copies: number;
  /** Bays of the data drives, in order. */
  bays: number[];
  /** Bays of the hot spares (none for rpool and bulk). */
  spares: number[];
  /** Approximate usable size, GiB. */
  usableGiB: number;
  holds: string;
  card: Card;
};

export type Bay = {
  n: number;
  /** The drive in it; omitted when empty. */
  drive?: DriveId;
};

export type Riser = {
  n: 1 | 2 | 3;
  slots: number;
  height: 'low profile' | 'full height';
};

/**
 * A part inside the chassis, listed front to back. No coordinates: Dell's board layout isn't
 * published as numbers, so a drawing places these in bands by order.
 */
export type InternalPart = {
  id: string;
  label: string;
  /** How many of it are fitted. */
  count: number;
  /** How many it could take, when more than are fitted. */
  of?: number;
  card?: Card;
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
  id: 'r730';
  identity: { name: string; card: Card };
  cpus: [Cpu, Cpu];
  threads: number;
  memory: { gb: number; dimms: number; dimmGB: number; sockets: number; card: Card };
  controller: Controller;
  /** Front bays only: the R730 has no rear bays. */
  bays: { front: number; list: Bay[]; emptyCard: Card };
  drives: Drive[];
  pools: Pool[];
  risers: Riser[];
  nics: { ports: number; speed: string; cabled: number; card: Card };
  psus: { count: number; watts: number; card: Card };
  fans: { count: number; card: Card };
  dims: ServerDims;
  /** The same front and rear zones the cabinet sheet draws. */
  panels: { front: PanelLayout; rear: PanelLayout };
  /** Inside the chassis, front to back. */
  internal: InternalPart[];
};

/* ---------------------------------------------------------------------------------------------
 * Sheet 03 · The stack
 * ------------------------------------------------------------------------------------------ */

export type VmSize = { vcpu: number; ramGiB: number; diskGB: number; pool: PoolId };

export type StackItem = {
  id: string;
  name: string;
  /** One short phrase: what it does. */
  what: string;
  status: Status;
  /** major.minor only. */
  version?: string;
  /** How many identical copies, e.g. 3 Talos nodes. */
  count?: number;
  /** For VMs: the size of each one. */
  vm?: VmSize;
  card: Card;
};

export type StackGroup = {
  id: string;
  title: string;
  /** Empty for a planned slot with nothing decided yet. */
  items: StackItem[];
  /** The group's own card; required for an empty slot, so it can still be clicked. */
  card?: Card;
};

export type StackLayer = {
  id: 'bootstrap' | 'vms' | 'kubernetes';
  n: 1 | 2 | 3;
  title: string;
  /** One line: what this layer is. */
  purpose: string;
  /** The tool that builds it. */
  tool: string;
  groups: StackGroup[];
};
