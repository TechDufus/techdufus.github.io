/**
 * The R720xd as built on 2026-09-28, frozen for the post and the archived sheet.
 *
 * Sheet 02 · The server, as built: the Dell PowerEdge R720xd after the PERC H710P Mini → HBA330
 * swap on 2026-09-28, with the old controller and the pulled drive kept for the before/after views.
 *
 * A copy of server.ts and the R720xd's cabinet panels as they stood then. It imports nothing live
 * (its types are ./types-2026-09-28.ts), so the live lab data can move on to other hardware
 * without touching the post or /lab/r720xd/.
 *
 * The internal layout is schematic: fractions of the chassis interior, not to scale.
 */
import type { Bay, Cable, Card, Cpu, DriveId, InternalPart, Server } from './types-2026-09-28';

/** Where the cabinet's Sheet 02 card pointed when this was frozen. */
export const sheetHref = '/lab/r720xd/';

/** "256 GB" or "1 TB". */
export const gbLabel = (gb: number): string => (gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`);

const SWAP_DATE = '2026-09-28';
const FRONT_BAYS = 24;
const REAR_BAYS = 2;

const cpuCard = (socket: Cpu['socket']): Card => ({
  title: 'Intel Xeon E5-2690 v2',
  kind: socket,
  lines: ['10 cores, 20 threads.', 'One of two: 40 threads between them.']
});

const cpus: [Cpu, Cpu] = [
  { socket: 'CPU1', model: 'Intel Xeon E5-2690 v2', cores: 10, threads: 20, card: cpuCard('CPU1') },
  { socket: 'CPU2', model: 'Intel Xeon E5-2690 v2', cores: 10, threads: 20, card: cpuCard('CPU2') }
];

const hba330: Server['controller']['now'] = {
  id: 'hba330',
  name: 'Dell HBA330 Adapter',
  chip: 'LSI SAS3008',
  mode: 'pass-through',
  date: SWAP_DATE,
  card: {
    title: 'Dell HBA330',
    kind: 'Storage controller · now',
    lines: [
      'LSI SAS3008 in pass-through: ZFS sees every disk.',
      `In riser 1 since ${SWAP_DATE}.`,
      'UEFI boot worked, and the fans didn’t even notice.'
    ]
  }
};

const perc: Server['controller']['before'] = {
  id: 'perc-h710p-mini',
  name: 'PERC H710P Mini',
  chip: 'LSI SAS2208',
  mode: 'hardware RAID',
  date: SWAP_DATE,
  card: {
    title: 'PERC H710P Mini',
    kind: 'Storage controller · before',
    lines: ['Hardware RAID: the OS saw virtual disks, not drives.', `Came out ${SWAP_DATE}, with its cable.`]
  }
};

const fansCard: Card = {
  title: '6 fans',
  kind: 'Cooling',
  lines: ['One fan wall between the drives and the CPUs.', 'Still at baseline after the swap.']
};

const psusCard: Card = {
  title: '2 power supplies',
  kind: 'Power',
  lines: ['Redundant: either one can run the server.']
};

const gigastoneLines = (twinBay: number): Card['lines'] => [
  '256 GB, one of rpool’s three copies.',
  'Holds Proxmox and the ISOs.',
  `Shares a serial number with its twin in bay ${twinBay}.`
];

const drives: Server['drives'] = [
  {
    id: 'gigastone-1',
    maker: 'Gigastone',
    model: '256 GB SATA SSD',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 256,
    bay: 0,
    pool: 'rpool',
    card: { title: 'Gigastone 256 GB SSD', kind: 'Bay 0 · SATA SSD', lines: gigastoneLines(1) }
  },
  {
    id: 'gigastone-2',
    maker: 'Gigastone',
    model: '256 GB SATA SSD',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 256,
    bay: 1,
    pool: 'rpool',
    card: { title: 'Gigastone 256 GB SSD', kind: 'Bay 1 · SATA SSD', lines: gigastoneLines(0) }
  },
  {
    id: 'mx500-500-1',
    maker: 'Crucial',
    model: 'CT500MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 500,
    bay: 2,
    pool: 'fast',
    card: {
      title: 'Crucial MX500 500 GB',
      kind: 'Bay 2 · SATA SSD',
      lines: ['500 GB, one half of the fast mirror.', 'VM disks, the Talos nodes included.']
    }
  },
  {
    id: 'mx500-500-2',
    maker: 'Crucial',
    model: 'CT500MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 500,
    bay: 3,
    pool: 'fast',
    card: {
      title: 'Crucial MX500 500 GB',
      kind: 'Bay 3 · SATA SSD',
      lines: ['500 GB, the other half of the fast mirror.', 'VM disks, the Talos nodes included.']
    }
  },
  {
    id: 'mx500-1tb',
    maker: 'Crucial',
    model: 'CT1000MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1000,
    bay: 4,
    pool: 'bulk',
    card: {
      title: 'Crucial MX500 1 TB',
      kind: 'Bay 4 · SATA SSD',
      lines: ['1 TB, all of bulk.', 'Scratch and sandboxes. One disk, on purpose.']
    }
  },
  {
    id: 'st300mp0004',
    maker: 'Seagate',
    model: 'ST300MP0004',
    kind: 'hdd',
    interface: 'SAS',
    sizeGB: 300,
    bay: 24,
    pool: 'rpool',
    card: {
      title: 'Seagate ST300MP0004',
      kind: 'Rear bay 24 · 15k SAS',
      lines: ['300 GB, spinning at 15,000 rpm.', 'rpool’s third copy. It can boot the server too.']
    }
  }
];

const removed: Server['removed'] = {
  id: 'st9300653ss',
  maker: 'Seagate',
  model: 'ST9300653SS',
  kind: 'hdd',
  interface: 'SAS',
  sizeGB: 300,
  bay: 25,
  card: {
    title: 'Seagate ST9300653SS',
    kind: 'Rear bay 25 · removed',
    lines: ['300 GB 15k SAS, half of the old RAID boot pair.', 'It was failing. Pulled in the swap, not replaced.']
  }
};

const driveInBay = new Map<number, DriveId>(drives.map((d) => [d.bay, d.id]));

const bays: Bay[] = Array.from({ length: FRONT_BAYS + REAR_BAYS }, (_, n): Bay => {
  const bay: Bay = { n, face: n < FRONT_BAYS ? 'front' : 'rear' };
  const drive = driveInBay.get(n);
  if (drive) bay.drive = drive;
  if (n === removed.bay) bay.before = removed.id;
  return bay;
});

const cables: Cable[] = [
  {
    n: 1,
    name: 'Mini-PERC SAS cable',
    from: 'System board J_SASX8',
    to: 'Backplane SAS A and SAS B',
    state: 'removed',
    card: {
      title: 'Mini-PERC SAS cable',
      kind: 'Cable 1 · removed',
      lines: ['From the board’s J_SASX8 to backplane SAS A and SAS B.', 'It belonged to the RAID card, so it left with it.']
    }
  },
  {
    n: 2,
    name: 'SFF-8643 → SFF-8087 cable',
    from: 'HBA330',
    to: 'Backplane SAS A',
    state: 'new',
    card: { title: 'SFF-8643 → SFF-8087', kind: 'Cable 2 · new', lines: ['HBA330 to backplane SAS A.'] }
  },
  {
    n: 3,
    name: 'SFF-8643 → SFF-8087 cable',
    from: 'HBA330',
    to: 'Backplane SAS B',
    state: 'new',
    card: { title: 'SFF-8643 → SFF-8087', kind: 'Cable 3 · new', lines: ['HBA330 to backplane SAS B.'] }
  },
  {
    n: 4,
    name: 'Flex-bay SAS cable',
    from: 'Backplane SAS A1',
    to: 'Rear flex backplane',
    state: 'keep',
    card: {
      title: 'Flex-bay SAS cable',
      kind: 'Cable 4 · untouched',
      lines: ['Backplane SAS A1 to the rear flex bays.', 'The backplane’s expander feeds all 26 bays from two cables.']
    }
  },
  {
    n: 5,
    name: 'Power and signal cables',
    from: 'System board',
    to: 'Backplanes',
    state: 'keep',
    card: {
      title: 'Power and signal cables',
      kind: 'Cable 5 · untouched',
      lines: ['Backplane power, sideband, control panel and front I/O.']
    }
  }
];

const parts: InternalPart[] = [
  {
    id: 'backplane',
    label: '24-bay backplane · SAS expander',
    x: [0.017, 0.983],
    z: [0.054, 0.074],
    state: 'keep',
    card: { title: '24-bay backplane', kind: 'Backplane', lines: ['Its SAS expander feeds all 24 front bays and the 2 rear ones.'] }
  },
  { id: 'sas-b', label: 'SAS B', x: [0.433, 0.5], z: [0.074, 0.088], state: 'keep' },
  { id: 'sas-a', label: 'SAS A', x: [0.567, 0.633], z: [0.074, 0.088], state: 'keep' },
  { id: 'sas-a1', label: 'SAS A1', x: [0.717, 0.783], z: [0.074, 0.088], state: 'keep' },
  { id: 'fans', label: 'Fan wall (6 fans)', x: [0.12, 0.9], z: [0.171, 0.204], state: 'keep', card: fansCard },
  { id: 'retention', label: 'Cable retention bracket', x: [0.007, 0.023], z: [0.247, 0.467], state: 'keep' },
  { id: 'shroud', label: 'Cooling shroud', x: [0.14, 0.88], z: [0.258, 0.584], state: 'keep' },
  { id: 'cpu2', label: 'CPU2', x: [0.257, 0.377], z: [0.382, 0.463], state: 'keep', card: cpus[1].card },
  { id: 'cpu1', label: 'CPU1', x: [0.64, 0.76], z: [0.382, 0.463], state: 'keep', card: cpus[0].card },
  { id: 'perc', label: 'PERC H710P Mini', x: [0.157, 0.507], z: [0.625, 0.706], state: 'removed', card: perc.card },
  { id: 'j-sasx8', label: 'J_SASX8', x: [0.107, 0.15], z: [0.661, 0.679], state: 'keep' },
  { id: 'j-storage', label: 'J_STORAGE', x: [0.177, 0.487], z: [0.661, 0.679], state: 'keep' },
  {
    id: 'riser-1',
    label: 'Riser 1',
    x: [0.02, 0.33],
    z: [0.735, 0.989],
    state: 'keep',
    card: { title: 'Riser 1', kind: 'PCIe · low profile', lines: ['Three low-profile slots. The HBA330 lives here.'] }
  },
  { id: 'hba330', label: 'HBA330', x: [0.08, 0.303], z: [0.793, 0.96], state: 'new', card: hba330.card },
  { id: 'hba-port-1', label: 'SFF-8643 port', x: [0.107, 0.16], z: [0.778, 0.793], state: 'new' },
  { id: 'hba-port-2', label: 'SFF-8643 port', x: [0.2, 0.253], z: [0.778, 0.793], state: 'new' },
  { id: 'riser-2', label: 'Riser 2', x: [0.347, 0.55], z: [0.735, 0.989], state: 'keep' },
  { id: 'riser-3', label: 'Riser 3', x: [0.567, 0.683], z: [0.735, 0.989], state: 'keep' },
  { id: 'flex-backplane', label: 'Rear flex backplane', x: [0.703, 0.98], z: [0.721, 0.735], state: 'keep' },
  { id: 'flex-sas-a1', label: 'SAS A1 (flex input)', x: [0.813, 0.88], z: [0.708, 0.721], state: 'keep' },
  { id: 'psu-1', label: 'PSU1', x: [0.703, 0.838], z: [0.766, 0.989], state: 'keep', card: psusCard },
  { id: 'psu-2', label: 'PSU2', x: [0.845, 0.98], z: [0.766, 0.989], state: 'keep', card: psusCard }
];

/** The R720xd's front and rear zones, as the cabinet sheet traced them. */
const panels: Server['panels'] = {
  front: {
    frame: 'Overall face 482.4 mm including rack ears: body (444.0 mm) spans 0.04 → 0.96. Height 87.3 mm.',
    zones: [
      { id: 'ear-l', label: 'Left control panel', kind: 'ear', x0: 0, x1: 0.04, y0: 0, y1: 1 },
      { id: 'power', label: 'Power button', kind: 'button', x0: 0.006, x1: 0.026, y0: 0.12, y1: 0.23 },
      { id: 'nmi', label: 'NMI button', kind: 'button', x0: 0.026, x1: 0.034, y0: 0.2, y1: 0.25 },
      { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.012, x1: 0.024, y0: 0.29, y1: 0.33 },
      { id: 'diag', label: 'Diagnostic indicators', kind: 'led', x0: 0.006, x1: 0.034, y0: 0.36, y1: 0.49 },
      { id: 'tag', label: 'Information tag', kind: 'label', x0: 0.13, x1: 0.2, y0: 0.01, y1: 0.05 },
      { id: 'bays', label: 'Bays 0–23', kind: 'bay', x0: 0.04, x1: 0.96, y0: 0.06, y1: 0.97 },
      { id: 'ear-r', label: 'Right I/O panel', kind: 'ear', x0: 0.96, x1: 1, y0: 0, y1: 1 },
      { id: 'vga', label: 'VGA', kind: 'port', x0: 0.968, x1: 0.99, y0: 0.1, y1: 0.32 },
      { id: 'usb', label: 'USB 2.0', kind: 'port', x0: 0.966, x1: 0.992, y0: 0.44, y1: 0.51 }
    ]
  },
  rear: {
    frame: 'Rear face as seen from behind, body width 444.0 mm, height 87.3 mm.',
    zones: [
      { id: 'slot-1', label: 'Slot 1', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.09, y1: 0.25 },
      { id: 'slot-2', label: 'Slot 2', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.31, y1: 0.48 },
      { id: 'slot-3', label: 'Slot 3', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.55, y1: 0.71 },
      { id: 'slot-4', label: 'Slot 4', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.09, y1: 0.25 },
      { id: 'slot-5', label: 'Slot 5', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.31, y1: 0.47 },
      { id: 'handle', label: 'Handle', kind: 'vent', x0: 0.271, x1: 0.537, y0: 0.58, y1: 0.67 },
      { id: 'slot-6', label: 'Slot 6', kind: 'slot', x0: 0.549, x1: 0.751, y0: 0.09, y1: 0.235 },
      { id: 'vflash', label: 'vFlash slot', kind: 'slot', x0: 0.808, x1: 0.873, y0: 0.12, y1: 0.19 },
      { id: 'rear-bay-24', label: 'Rear bay 24', kind: 'bay', x0: 0.556, x1: 0.72, y0: 0.28, y1: 0.47 },
      { id: 'rear-bay-25', label: 'Rear bay 25', kind: 'bay', x0: 0.73, x1: 0.888, y0: 0.28, y1: 0.47 },
      { id: 'psu-1', label: 'PSU 1', kind: 'psu', x0: 0.556, x1: 0.746, y0: 0.51, y1: 0.95 },
      { id: 'psu-2', label: 'PSU 2', kind: 'psu', x0: 0.751, x1: 0.941, y0: 0.51, y1: 0.95 },
      { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.063, x1: 0.083, y0: 0.76, y1: 0.87 },
      { id: 'sysid-conn', label: 'System ID connector', kind: 'port', x0: 0.085, x1: 0.102, y0: 0.76, y1: 0.87 },
      { id: 'idrac', label: 'iDRAC port', kind: 'port', x0: 0.109, x1: 0.144, y0: 0.74, y1: 0.9 },
      { id: 'serial', label: 'Serial', kind: 'port', x0: 0.166, x1: 0.205, y0: 0.76, y1: 0.88 },
      { id: 'vga', label: 'VGA', kind: 'port', x0: 0.234, x1: 0.278, y0: 0.76, y1: 0.88 },
      { id: 'usb', label: 'USB 2.0 ×2', kind: 'port', x0: 0.298, x1: 0.327, y0: 0.74, y1: 0.97 },
      { id: 'nic-1', label: 'NIC 1', kind: 'port', x0: 0.34, x1: 0.376, y0: 0.74, y1: 0.89 },
      { id: 'nic-2', label: 'NIC 2', kind: 'port', x0: 0.388, x1: 0.425, y0: 0.74, y1: 0.89 },
      { id: 'nic-3', label: 'NIC 3', kind: 'port', x0: 0.437, x1: 0.474, y0: 0.74, y1: 0.89 },
      { id: 'nic-4', label: 'NIC 4', kind: 'port', x0: 0.483, x1: 0.519, y0: 0.74, y1: 0.89 }
    ]
  }
};

export const server: Server = {
  id: 'r720xd',
  identity: {
    name: 'Dell PowerEdge R720xd',
    firmwareSays: 'PowerEdge R720',
    card: {
      title: 'Dell PowerEdge R720xd',
      kind: 'The server',
      lines: ['The firmware says it’s an R720.', 'The 24 + 2 drive bays say it’s an xd.']
    }
  },
  cpus,
  threads: cpus[0].threads + cpus[1].threads,
  memory: {
    gb: 128,
    card: {
      title: '128 GB RAM',
      kind: 'Memory',
      lines: ['128 GB of ECC DDR3.', 'Enough for three Talos nodes at 24 GiB each, with room left over.']
    }
  },
  controller: { now: hba330, before: perc },
  swapDate: SWAP_DATE,
  bays: {
    front: FRONT_BAYS,
    rear: REAR_BAYS,
    list: bays,
    emptyCard: { title: 'Empty bay', kind: '2.5″ bay', lines: ['Nothing in it yet.'] }
  },
  drives,
  removed,
  pools: [
    {
      id: 'rpool',
      layout: 'mirror',
      copies: 3,
      bays: [0, 1, 24],
      usableGiB: 220,
      holds: 'Boot and ISOs',
      card: {
        title: 'rpool',
        kind: 'Boot · 3-way mirror',
        lines: ['Bays 0, 1 and 24, about 220 GiB.', 'Proxmox itself and the ISOs.', 'Every member can boot the server.']
      }
    },
    {
      id: 'fast',
      layout: 'mirror',
      copies: 2,
      bays: [2, 3],
      usableGiB: 450,
      holds: 'VM disks',
      card: {
        title: 'fast',
        kind: 'VM disks · mirror',
        lines: ['Bays 2 and 3, about 450 GiB.', 'Where the VMs live.']
      }
    },
    {
      id: 'bulk',
      layout: 'single',
      copies: 1,
      bays: [4],
      usableGiB: 930,
      holds: 'Scratch and sandboxes',
      card: {
        title: 'bulk',
        kind: 'Scratch · single disk',
        lines: ['Bay 4, about 930 GiB.', 'Scratch and sandboxes: losing it costs nothing.']
      }
    }
  ],
  cables,
  risers: [
    { n: 1, slots: 3, height: 'low profile', holds: 'HBA330' },
    { n: 2, slots: 2, height: 'full height' },
    { n: 3, slots: 1, height: 'full height' }
  ],
  nics: {
    ports: 4,
    speed: '1 GbE',
    cabled: 1,
    card: { title: '4 × 1 GbE', kind: 'Network', lines: ['NIC 1 goes to the gateway’s port 3.', 'The other three are free.'] }
  },
  psus: { count: 2, card: psusCard },
  fans: { count: 6, card: fansCard },
  dims: {
    body: { w: 444.0, h: 87.3, d: 684.0 },
    earsWidth: 482.4,
    bezelDepth: 32.0,
    earDepth: 18.0,
    toPsuHandles: 723.0,
    overallDepth: 32.0 + 723.0
  },
  panels,
  internal: {
    parts,
    routes: [
      {
        cable: 1,
        paths: [
          [[0.128, 0.661], [0.128, 0.631], [0.097, 0.629], [0.097, 0.157], [0.427, 0.157]],
          [[0.427, 0.157], [0.48, 0.157], [0.48, 0.088]],
          [[0.427, 0.157], [0.613, 0.157], [0.613, 0.088]]
        ]
      },
      { cable: 2, paths: [[[0.227, 0.778], [0.227, 0.719], [0.073, 0.719], [0.073, 0.144], [0.6, 0.144], [0.6, 0.088]]] },
      { cable: 3, paths: [[[0.133, 0.778], [0.133, 0.739], [0.053, 0.739], [0.053, 0.13], [0.467, 0.13], [0.467, 0.088]]] },
      { cable: 4, paths: [[[0.847, 0.708], [0.847, 0.69], [0.95, 0.69], [0.95, 0.135], [0.75, 0.135], [0.75, 0.088]]] },
      { cable: 5, paths: [[[0.833, 0.074], [0.833, 0.112]]] }
    ]
  }
};

/** Shown in the "before" view: everything but what the swap added. */
export const inBefore = (state: InternalPart['state']): boolean => state !== 'new';

/** Shown in the "now" view: everything but what the swap removed. */
export const inNow = (state: InternalPart['state']): boolean => state !== 'removed';

/** The drive in a bay now, if any. */
export const driveAt = (bay: number): Server['drives'][number] | undefined => server.drives.find((d) => d.bay === bay);

/* Each pool's bays are exactly the bays of its drives. */
for (const p of server.pools) {
  const members = drives.filter((d) => d.pool === p.id).map((d) => d.bay).join();
  if (members !== p.bays.join()) throw new Error(`server.ts: ${p.id} bays ${p.bays.join()} ≠ its drives' bays ${members}`);
}

/** Counts a drawing or the /lab hero might print. */
export const derived = {
  drives: drives.length,
  baysFree: FRONT_BAYS + REAR_BAYS - drives.length,
  /** Labelled capacities, decimal GB. */
  rawGB: drives.reduce((sum, d) => sum + d.sizeGB, 0),
  /** Sum of the pools' approximate usable sizes. */
  usableGiB: server.pools.reduce((sum, p) => sum + p.usableGiB, 0)
};
