/**
 * Sheet 02 · The server, as built: the Dell PowerEdge R730 that replaced the R720xd (2026-10-02).
 * Sixteen front bays, ten drives, a PERC H730P Mini in HBA mode.
 *
 * The R720xd as it was on 2026-09-28 is frozen in ./snapshots/ for the post and the archive sheet;
 * nothing here reads it.
 *
 * Inside the chassis only what Dell's manuals state is listed, front to back, with no coordinates.
 */
import { device } from './rack';
import type { Bay, Card, Cpu, DriveId, InternalPart, Server } from './types';

/** "256 GB" or "1 TB". */
export const gbLabel = (gb: number): string => (gb >= 1000 ? `${gb / 1000} TB` : `${gb} GB`);

const FRONT_BAYS = 16;

const cpuCard = (socket: Cpu['socket']): Card => ({
  title: 'Intel Xeon E5-2683 v4',
  kind: socket,
  lines: ['16 cores, 32 threads.', 'One of two: 64 threads between them.']
});

const cpus: [Cpu, Cpu] = [
  { socket: 'CPU1', model: 'Intel Xeon E5-2683 v4', cores: 16, threads: 32, card: cpuCard('CPU1') },
  { socket: 'CPU2', model: 'Intel Xeon E5-2683 v4', cores: 16, threads: 32, card: cpuCard('CPU2') }
];

const controller: Server['controller'] = {
  id: 'perc-h730p-mini',
  name: 'Dell PERC H730P Mini',
  mode: 'HBA mode',
  card: {
    title: 'Dell PERC H730P Mini',
    kind: 'Storage controller',
    lines: [
      'A RAID card that does HBA mode itself.',
      'Every disk reaches ZFS and SMART as it is, with no RAID in between.',
      'No extra card and no surgery this time.'
    ]
  }
};

const fansCard: Card = {
  title: '6 fans',
  kind: 'Cooling',
  lines: ['One row of fans between the drives and the CPUs.']
};

const psusCard: Card = {
  title: '2 power supplies',
  kind: 'Power',
  lines: ['1100 W each.', 'Redundant: either one can run the server.']
};

const nicsCard: Card = {
  title: '4 × 10 GbE',
  kind: 'Network · Intel X540',
  lines: ['NIC 1 goes to the gateway’s port 3, at 1 GbE.', 'The other three have nothing plugged in.']
};

const memoryCard: Card = {
  title: '512 GB RAM',
  kind: 'Memory',
  lines: ['16 × 32 GB of DDR4-2400.', 'Three Talos nodes at 24 GiB each, and plenty of room left.']
};

const s3520Lines = (what: string): Card['lines'] => ['1.6 TB, with power-loss protection.', what];

const drives: Server['drives'] = [
  {
    id: 's3520-0',
    maker: 'Intel',
    model: 'SSD DC S3520 1.6 TB',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1600,
    bay: 0,
    pool: 'fast',
    role: 'spare',
    card: {
      title: 'Intel SSD DC S3520 1.6 TB',
      kind: 'Bay 0 · SATA SSD · hot spare',
      lines: s3520Lines('fast’s hot spare: idle on purpose, ready to jump in.')
    }
  },
  {
    id: 's3520-1',
    maker: 'Intel',
    model: 'SSD DC S3520 1.6 TB',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1600,
    bay: 1,
    pool: 'fast',
    card: {
      title: 'Intel SSD DC S3520 1.6 TB',
      kind: 'Bay 1 · SATA SSD',
      lines: s3520Lines('One of fast’s three copies. VM disks, the Talos nodes included.')
    }
  },
  {
    id: 's3520-2',
    maker: 'Intel',
    model: 'SSD DC S3520 1.6 TB',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1600,
    bay: 2,
    pool: 'fast',
    card: {
      title: 'Intel SSD DC S3520 1.6 TB',
      kind: 'Bay 2 · SATA SSD',
      lines: s3520Lines('One of fast’s three copies. VM disks, the Talos nodes included.')
    }
  },
  {
    id: 's3520-3',
    maker: 'Intel',
    model: 'SSD DC S3520 1.6 TB',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1600,
    bay: 3,
    pool: 'fast',
    card: {
      title: 'Intel SSD DC S3520 1.6 TB',
      kind: 'Bay 3 · SATA SSD',
      lines: s3520Lines('One of fast’s three copies. VM disks, the Talos nodes included.')
    }
  },
  {
    id: 'p210',
    maker: 'Patriot',
    model: 'P210 256 GB SATA SSD',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 256,
    bay: 4,
    pool: 'rpool',
    card: {
      title: 'Patriot P210 256 GB SSD',
      kind: 'Bay 4 · SATA SSD',
      lines: ['256 GB, one of rpool’s three copies.', 'Holds Proxmox and the ISOs.']
    }
  },
  {
    id: 'gigastone',
    maker: 'Gigastone',
    model: '256 GB SATA SSD',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 256,
    bay: 5,
    pool: 'rpool',
    card: {
      title: 'Gigastone 256 GB SSD',
      kind: 'Bay 5 · SATA SSD',
      lines: ['256 GB, one of rpool’s three copies.', 'Holds Proxmox and the ISOs.']
    }
  },
  {
    id: 'st300mp0004',
    maker: 'Seagate',
    model: 'ST300MP0004',
    kind: 'hdd',
    interface: 'SAS',
    sizeGB: 300,
    bay: 6,
    pool: 'rpool',
    card: {
      title: 'Seagate ST300MP0004',
      kind: 'Bay 6 · 15k SAS',
      lines: ['300 GB, spinning at 15,000 rpm.', 'rpool’s third copy.']
    }
  },
  {
    id: 'mx500-1tb',
    maker: 'Crucial',
    model: 'CT1000MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 1000,
    bay: 7,
    pool: 'bulk',
    card: {
      title: 'Crucial MX500 1 TB',
      kind: 'Bay 7 · SATA SSD',
      lines: ['1 TB, all of bulk.', 'Scratch and sandboxes. One disk, on purpose.']
    }
  },
  {
    id: 'mx500-500-1',
    maker: 'Crucial',
    model: 'CT500MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 500,
    bay: 8,
    role: 'spare',
    card: {
      title: 'Crucial MX500 500 GB',
      kind: 'Bay 8 · SATA SSD · spare',
      lines: ['500 GB, wiped and waiting.', 'In no pool: a spare that lives in the server.']
    }
  },
  {
    id: 'mx500-500-2',
    maker: 'Crucial',
    model: 'CT500MX500SSD1',
    kind: 'ssd',
    interface: 'SATA',
    sizeGB: 500,
    bay: 9,
    role: 'spare',
    card: {
      title: 'Crucial MX500 500 GB',
      kind: 'Bay 9 · SATA SSD · spare',
      lines: ['500 GB, wiped and waiting.', 'In no pool either: the other spare.']
    }
  }
];

const driveInBay = new Map<number, DriveId>(drives.map((d) => [d.bay, d.id]));

const bays: Bay[] = Array.from({ length: FRONT_BAYS }, (_, n): Bay => {
  const drive = driveInBay.get(n);
  return drive ? { n, drive } : { n };
});

const panels = device('r730').panels;
if (!panels?.front || !panels.rear) throw new Error('server.ts: r730 panels missing from rack.ts');

const internal: InternalPart[] = [
  {
    id: 'backplane',
    label: '16-bay backplane · SAS expander',
    count: 1,
    card: { title: '16-bay backplane', kind: 'Backplane', lines: ['Its SAS expander feeds all 16 bays.'] }
  },
  { id: 'fans', label: 'Fans', count: 6, card: fansCard },
  { id: 'cpu1', label: 'CPU1', count: 1, card: cpus[0].card },
  { id: 'cpu2', label: 'CPU2', count: 1, card: cpus[1].card },
  {
    id: 'dimms',
    label: 'DIMM sockets',
    count: 16,
    of: 24,
    card: { title: '16 of 24 DIMM sockets', kind: 'Memory', lines: ['16 × 32 GB sticks fitted.', 'Eight sockets still empty.'] }
  },
  { id: 'perc', label: 'PERC H730P Mini', count: 1, card: controller.card },
  {
    id: 'riser-1',
    label: 'Riser 1',
    count: 1,
    card: { title: 'Riser 1', kind: 'PCIe · low profile', lines: ['Three low-profile slots.'] }
  },
  {
    id: 'riser-2',
    label: 'Riser 2',
    count: 1,
    card: { title: 'Riser 2', kind: 'PCIe · full height', lines: ['Two full-height slots.'] }
  },
  {
    id: 'riser-3',
    label: 'Riser 3',
    count: 1,
    card: { title: 'Riser 3', kind: 'PCIe · full height', lines: ['Two full-height slots.'] }
  },
  { id: 'ndc', label: 'Network daughter card', count: 1, card: nicsCard },
  { id: 'psus', label: 'PSUs', count: 2, card: psusCard }
];

export const server: Server = {
  id: 'r730',
  identity: {
    name: 'Dell PowerEdge R730',
    card: {
      title: 'Dell PowerEdge R730',
      kind: 'The server',
      lines: ['Two Xeons, 512 GB of RAM and sixteen 2.5″ bays.', 'It took the R720xd’s slot in the rack.']
    }
  },
  cpus,
  threads: cpus[0].threads + cpus[1].threads,
  memory: { gb: 512, dimms: 16, dimmGB: 32, sockets: 24, card: memoryCard },
  controller,
  bays: {
    front: FRONT_BAYS,
    list: bays,
    emptyCard: { title: 'Empty bay', kind: '2.5″ bay', lines: ['Nothing in it yet.'] }
  },
  drives,
  pools: [
    {
      id: 'rpool',
      layout: 'mirror',
      copies: 3,
      bays: [4, 5, 6],
      spares: [],
      usableGiB: 220,
      holds: 'Boot and ISOs',
      card: {
        title: 'rpool',
        kind: 'Boot · 3-way mirror',
        lines: ['Bays 4, 5 and 6, about 220 GiB.', 'Proxmox itself and the ISOs.']
      }
    },
    {
      id: 'fast',
      layout: 'mirror',
      copies: 3,
      bays: [1, 2, 3],
      spares: [0],
      usableGiB: 1485,
      holds: 'VM disks and cluster volumes',
      card: {
        title: 'fast',
        kind: 'VM disks · 3-way mirror',
        lines: ['Bays 1, 2 and 3, about 1.45 TiB.', 'Bay 0 is the hot spare.', 'Where the VMs and the cluster’s volumes live.']
      }
    },
    {
      id: 'bulk',
      layout: 'single',
      copies: 1,
      bays: [7],
      spares: [],
      usableGiB: 930,
      holds: 'Scratch and sandboxes',
      card: {
        title: 'bulk',
        kind: 'Scratch · single disk',
        lines: ['Bay 7, about 930 GiB.', 'Scratch and sandboxes: losing it costs nothing.']
      }
    }
  ],
  risers: [
    { n: 1, slots: 3, height: 'low profile' },
    { n: 2, slots: 2, height: 'full height' },
    { n: 3, slots: 2, height: 'full height' }
  ],
  nics: { ports: 4, speed: '10 GbE', cabled: 1, card: nicsCard },
  psus: { count: 2, watts: 1100, card: psusCard },
  fans: { count: 6, card: fansCard },
  dims: {
    body: { w: 444.0, h: 87.3, d: 684.0 },
    earsWidth: 482.4,
    bezelDepth: 32.0,
    earDepth: 18.0,
    toPsuHandles: 723.0,
    overallDepth: 32.0 + 723.0
  },
  panels: { front: panels.front, rear: panels.rear },
  internal
};

/** The drive in a bay, if any. */
export const driveAt = (bay: number): Server['drives'][number] | undefined => server.drives.find((d) => d.bay === bay);

/* Load-time checks: every bay once and in range; a pool's `bays` are its data drives' bays in
 * order, its `spares` its hot spares'; a drive without a pool is a spare in no pool. */
{
  const seen = new Set<number>();
  for (const d of drives) {
    if (d.bay < 0 || d.bay >= FRONT_BAYS) throw new Error(`server.ts: ${d.id} is in bay ${d.bay}, outside 0–${FRONT_BAYS - 1}`);
    if (seen.has(d.bay)) throw new Error(`server.ts: two drives in bay ${d.bay}`);
    seen.add(d.bay);
    if (!d.pool && d.role !== 'spare') throw new Error(`server.ts: ${d.id} is in no pool and is not marked a spare`);
  }
  const carriers = panels.front.zones.filter((z) => z.kind === 'bay').reduce((sum, z) => sum + (z.cells ?? 1), 0);
  if (carriers !== FRONT_BAYS) throw new Error(`server.ts: rack.ts draws ${carriers} carriers, the server has ${FRONT_BAYS} bays`);
  for (const p of server.pools) {
    const members = drives.filter((d) => d.pool === p.id && d.role !== 'spare').map((d) => d.bay).join();
    if (members !== p.bays.join()) throw new Error(`server.ts: ${p.id} bays ${p.bays.join()} ≠ its drives' bays ${members}`);
    const spares = drives.filter((d) => d.pool === p.id && d.role === 'spare').map((d) => d.bay).join();
    if (spares !== p.spares.join()) throw new Error(`server.ts: ${p.id} spares ${p.spares.join()} ≠ its hot-spare bays ${spares}`);
  }
}

/** Counts a drawing or the /lab hero might print. */
export const derived = {
  drives: drives.length,
  baysFree: FRONT_BAYS - drives.length,
  /** Labelled capacities, decimal GB. */
  rawGB: drives.reduce((sum, d) => sum + d.sizeGB, 0),
  /** Sum of the pools' approximate usable sizes. */
  usableGiB: server.pools.reduce((sum, p) => sum + p.usableGiB, 0)
};
