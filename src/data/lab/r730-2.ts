/**
 * Sheet 02B · The R730-2, as built: the second Dell PowerEdge R730, which took the R430's place
 * in the Proxmox cluster on 2026-11-12. Eight front bays, four drives in two ZFS mirrors, a PERC
 * H730 Mini in HBA mode, and an RTX 3060 in for testing.
 *
 * The box, its panels and where it sits come from ./rack.ts. It is the R730's chassis
 * (./server.ts) with the 8-bay backplane: the bays sit where the 16-bay front has bays 0–7, and
 * a blank covers the rest. Inside the chassis only what Dell's owner's manual shows is listed,
 * front to back, as ./server.ts does. The PSU wattage isn't recorded, so none is given.
 */
import { device, links } from './rack';
import type { Card, Cpu, Mm, PanelLayout } from './types';

export type R7302DriveId = 'p210-a' | 'p210-b' | 'mx500-a' | 'mx500-b';
export type R7302PoolId = 'rpool' | 'data';

export type R7302Drive = {
  id: R7302DriveId;
  maker: string;
  model: string;
  interface: 'SATA';
  /** Labelled capacity, decimal GB. */
  sizeGB: number;
  /** Front bay, 0–7, left to right. */
  bay: number;
  pool: R7302PoolId;
  card: Card;
};

export type R7302Pool = {
  id: R7302PoolId;
  layout: 'mirror';
  copies: number;
  /** Bays of its drives, in order. */
  bays: number[];
  holds: string;
  card: Card;
};

/** A front bay, by its chassis number (0–7, left to right). */
export type R7302Bay = { n: number; drive?: R7302DriveId };

/** A part inside the chassis, front to back. */
export type R7302Part = { id: string; label: string; count: number; of?: number; card: Card };

/** The front zone that holds the eight carriers (rack.ts). */
export const BAY_ZONE = 'bays-0-7';
const FRONT_BAYS = 8;

const cpuCard = (socket: Cpu['socket']): Card => ({
  title: 'Intel Xeon E5-2680 v3',
  kind: socket,
  lines: ['12 cores, 24 threads.', 'One of two: 48 threads between them.']
});

const cpus: [Cpu, Cpu] = [
  { socket: 'CPU1', model: 'Intel Xeon E5-2680 v3', cores: 12, threads: 24, card: cpuCard('CPU1') },
  { socket: 'CPU2', model: 'Intel Xeon E5-2680 v3', cores: 12, threads: 24, card: cpuCard('CPU2') }
];

/** What is fitted, biggest first: the R430's 2 × 16 GB and the server's own 2 × 8 GB. */
const sticks = [
  { gb: 16, count: 2 },
  { gb: 8, count: 2 }
];
const memoryGB = sticks.reduce((sum, s) => sum + s.gb * s.count, 0);
const fitted = sticks.reduce((sum, s) => sum + s.count, 0);
const SOCKETS = 24;

const p210 = (id: R7302DriveId, bay: number): R7302Drive => ({
  id,
  maker: 'Patriot',
  model: 'P210 256GB',
  interface: 'SATA',
  sizeGB: 256,
  bay,
  pool: 'rpool',
  card: {
    title: 'Patriot P210 256 GB',
    kind: `Bay ${bay} · SATA SSD`,
    lines: ['256 GB, half of rpool’s mirror.', 'Proxmox boots from it.']
  }
});

const mx500 = (id: R7302DriveId, bay: number): R7302Drive => ({
  id,
  maker: 'Crucial',
  model: 'CT500MX500SSD1',
  interface: 'SATA',
  sizeGB: 500,
  bay,
  pool: 'data',
  card: {
    title: 'Crucial MX500 500 GB',
    kind: `Bay ${bay} · SATA SSD`,
    lines: ['500 GB, half of data’s mirror.', 'A spare in the R730, then the R430’s, now here.']
  }
});

const drives: R7302Drive[] = [p210('p210-a', 0), p210('p210-b', 1), mx500('mx500-a', 2), mx500('mx500-b', 3)];

const pools: R7302Pool[] = [
  {
    id: 'rpool',
    layout: 'mirror',
    copies: 2,
    bays: [0, 1],
    holds: 'Proxmox itself',
    card: { title: 'rpool', kind: 'Boot · 2-way mirror', lines: ['Bays 0 and 1, the two Patriots.', 'Proxmox itself.'] }
  },
  {
    id: 'data',
    layout: 'mirror',
    copies: 2,
    bays: [2, 3],
    holds: 'The VMs on this host',
    card: {
      title: 'data',
      kind: 'VM disks · 2-way mirror',
      lines: ['Bays 2 and 3, the two MX500s.', 'Where this host’s VMs live.', 'No power-loss protection, so no databases on it.']
    }
  }
];

const dev = device('r730-2');
const panels = dev.panels;
if (!panels?.front || !panels.rear) throw new Error('r730-2.ts: r730-2 panels missing from rack.ts');
if (!dev.earsWidth) throw new Error('r730-2.ts: r730-2 earsWidth missing from rack.ts');

const controllerCard: Card = {
  title: 'Dell PERC H730 Mini',
  kind: 'Storage controller',
  lines: ['A RAID card, run in HBA mode.', 'All four disks reach ZFS as they are, with no RAID in between.']
};

/** The one cable: the documented link to the gateway in ./rack.ts. */
const uplink = links.find((l) => l.to.device === 'r730-2');
if (!uplink?.from.port || !uplink.to.port) throw new Error('r730-2.ts: no gateway link to the R730-2 in rack.ts');

const nicsCard: Card = {
  title: '4 × 1 GbE',
  kind: 'Network · Intel I350',
  lines: [`${uplink.to.port} goes to the gateway’s ${uplink.from.port.toLowerCase()}.`, 'The other three have nothing plugged in.']
};

const psusCard: Card = {
  title: '2 power supplies',
  kind: 'Power',
  lines: ['Redundant: either one can run the server.']
};

const fansCard: Card = {
  title: '6 fans',
  kind: 'Cooling',
  lines: ['One row of fans between the drives and the CPUs.']
};

const gpuCard: Card = {
  title: 'Gigabyte RTX 3060 12 GB',
  kind: 'GPU · slot 4',
  lines: ['In for testing: it passes whole to whichever VM asks for it.', 'Two slots wide, so riser 3 had to come out.', 'Second-hand, from a friend.']
};

export const r7302 = {
  id: 'r730-2' as const,
  identity: {
    name: dev.name,
    card: {
      title: dev.name,
      kind: 'The second server',
      lines: ['Two Xeons, 48 GB of RAM and eight 2.5″ bays.', 'The same chassis as the R730, right under it.']
    } satisfies Card
  },
  cpus,
  cores: cpus[0].cores + cpus[1].cores,
  threads: cpus[0].threads + cpus[1].threads,
  memory: {
    gb: memoryGB,
    sticks,
    dimms: fitted,
    sockets: SOCKETS,
    /** The sockets the four sticks are in, as Dell letters them: 16 GB in A1 and B1, 8 GB in A2 and B2. */
    fitted: ['A1', 'A2', 'B1', 'B2'],
    card: {
      title: `${memoryGB} GB RAM`,
      kind: 'Memory',
      lines: ['2 × 16 GB and 2 × 8 GB of DDR4.', 'The 16s came from the R430.', 'Four of 24 sockets filled.']
    } satisfies Card
  },
  controller: { name: 'Dell PERC H730 Mini', mode: 'HBA mode', card: controllerCard },
  bays: {
    front: FRONT_BAYS,
    zone: BAY_ZONE,
    list: Array.from({ length: FRONT_BAYS }, (_, n): R7302Bay => {
      const drive = drives.find((d) => d.bay === n)?.id;
      return drive ? { n, drive } : { n };
    }),
    emptyCard: { title: 'Empty bay', kind: '2.5″ bay', lines: ['Nothing in it yet.'] } satisfies Card
  },
  drives,
  pools,
  gpu: { slot: 4, zone: 'gpu', card: gpuCard },
  nics: { ports: 4, speed: '1 GbE', cabled: 1, uplink: { nic: uplink.to.port, port: uplink.from.port, speed: uplink.speed ?? '' }, card: nicsCard },
  psus: { count: 2, card: psusCard },
  fans: { count: 6, card: fansCard },
  dims: { body: dev.body satisfies Mm, earsWidth: dev.earsWidth },
  /** The same front and rear zones the cabinet sheet draws. */
  panels: { front: panels.front satisfies PanelLayout, rear: panels.rear satisfies PanelLayout },
  /** Inside the chassis, front to back. */
  internal: [
    {
      id: 'backplane',
      label: '8-bay backplane',
      count: 1,
      card: { title: '8-bay backplane', kind: 'Backplane', lines: ['Eight hot-swap 2.5″ bays plug into it.', 'No SAS expander: the R730’s 16-bay one has one.'] }
    },
    { id: 'fans', label: 'Fans', count: 6, card: fansCard },
    { id: 'cpu1', label: 'CPU1', count: 1, card: cpus[0].card },
    { id: 'cpu2', label: 'CPU2', count: 1, card: cpus[1].card },
    {
      id: 'dimms',
      label: 'DIMM sockets',
      count: fitted,
      of: SOCKETS,
      card: { title: `${fitted} of ${SOCKETS} DIMM sockets`, kind: 'Memory', lines: ['2 × 16 GB and 2 × 8 GB sticks fitted.', `${SOCKETS - fitted} sockets still empty.`] }
    },
    { id: 'perc', label: 'PERC H730 Mini', count: 1, card: controllerCard },
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
      card: { title: 'Riser 2', kind: 'PCIe · full height', lines: ['Two full-height slots: the GPU fills both.'] }
    },
    { id: 'gpu', label: 'RTX 3060', count: 1, card: gpuCard },
    { id: 'ndc', label: 'Network daughter card', count: 1, card: nicsCard },
    { id: 'psus', label: 'PSUs', count: 2, card: psusCard }
  ] satisfies R7302Part[]
};

/* Load-time checks: the bay zone exists and draws eight carriers; each drive sits in a bay of its
 * own; each pool's bays are its drives' bays, in order; the GPU's zone exists. */
{
  const zone = panels.front.zones.find((z) => z.id === BAY_ZONE);
  if (zone?.kind !== 'bay' || zone.cells !== FRONT_BAYS) throw new Error(`r730-2.ts: rack.ts must draw ${FRONT_BAYS} carriers in ${BAY_ZONE}`);
  const used = drives.map((d) => d.bay);
  if (new Set(used).size !== used.length || used.some((b) => b < 0 || b >= FRONT_BAYS)) throw new Error('r730-2.ts: a drive is out of range or shares a bay');
  for (const p of pools) {
    const mine = drives.filter((d) => d.pool === p.id).map((d) => d.bay);
    if (mine.join() !== p.bays.join()) throw new Error(`r730-2.ts: ${p.id} bays ${p.bays.join()} ≠ its drives' bays ${mine.join()}`);
  }
  if (r7302.memory.fitted.length !== fitted) throw new Error('r730-2.ts: fitted sockets and stick count differ');
  if (!panels.rear.zones.some((z) => z.id === r7302.gpu.zone)) throw new Error('r730-2.ts: rack.ts has no rear zone for the GPU');
}

/** The drive in a bay, if any. */
export const r7302DriveAt = (bay: number): R7302Drive | undefined => drives.find((d) => d.bay === bay);

/** Counts a drawing or a page might print. */
export const r7302Derived = {
  drives: drives.length,
  baysFree: FRONT_BAYS - drives.length,
  /** Labelled capacities, decimal GB. */
  rawGB: drives.reduce((sum, d) => sum + d.sizeGB, 0)
};
