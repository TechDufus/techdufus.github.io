/**
 * Sheet 02B · The R430, as built: the Dell PowerEdge R430 that joined the R730 in one Proxmox
 * cluster on 2026-11-08. Eight front bays, two drives, a PERC H730 Mini in HBA mode.
 *
 * The box, its panels and where it sits come from ./rack.ts. Inside the chassis only what Dell's
 * owner's manual shows is listed, front to back (its "inside the system" figure for the
 * redundant-PSU chassis). The fan count isn't recorded, so no number is given for it.
 *
 * Bay numbers are the chassis's own, as the owner reads them off the front: 0 and 1 are the two
 * bays on the left, then the block of six counts down each column (2 4 6 over 3 5 7).
 */
import { device, links } from './rack';
import type { Card, Cpu, Mm, PanelLayout } from './types';

export type R430DriveId = 'mx500-a' | 'mx500-b';

export type R430Drive = {
  id: R430DriveId;
  maker: string;
  model: string;
  interface: 'SATA';
  /** Labelled capacity, decimal GB. */
  sizeGB: number;
  /** Front bay, 0–7. */
  bay: number;
  pool: 'rpool';
  card: Card;
};

/** A front bay: its chassis number and the rack.ts front zone that draws it. */
export type R430Bay = { n: number; zone: string; drive?: R430DriveId };

/** A part inside the chassis, front to back. `count` is left off when it isn't recorded. */
export type R430Part = { id: string; label: string; count?: number; of?: number; card: Card };

const cpuCard = (socket: Cpu['socket']): Card => ({
  title: 'Intel Xeon E5-2620 v3',
  kind: socket,
  lines: ['6 cores, 12 threads.', 'One of two: 24 threads between them.']
});

const cpus: [Cpu, Cpu] = [
  { socket: 'CPU1', model: 'Intel Xeon E5-2620 v3', cores: 6, threads: 12, card: cpuCard('CPU1') },
  { socket: 'CPU2', model: 'Intel Xeon E5-2620 v3', cores: 6, threads: 12, card: cpuCard('CPU2') }
];

/** What is fitted, biggest first: 2 × 16 GB and 2 × 8 GB. */
const sticks = [
  { gb: 16, count: 2 },
  { gb: 8, count: 2 }
];
const memoryGB = sticks.reduce((sum, s) => sum + s.gb * s.count, 0);
const fitted = sticks.reduce((sum, s) => sum + s.count, 0);
const SOCKETS = 12;

const mx500 = (id: R430DriveId, bay: number): R430Drive => ({
  id,
  maker: 'Crucial',
  model: 'CT500MX500SSD1',
  interface: 'SATA',
  sizeGB: 500,
  bay,
  pool: 'rpool',
  card: {
    title: 'Crucial MX500 500 GB',
    kind: `Bay ${bay} · SATA SSD`,
    lines: ['500 GB, half of rpool’s mirror.', 'It was a spare in the R730 until November.']
  }
});

const drives: R430Drive[] = [mx500('mx500-a', 0), mx500('mx500-b', 1)];

/** Chassis bay number → the front zone in rack.ts, in the order the chassis counts them. */
const BAY_ZONES = ['bay-a', 'bay-b', 'bay-c', 'bay-f', 'bay-d', 'bay-g', 'bay-e', 'bay-h'];

const dev = device('r430');
const panels = dev.panels;
if (!panels?.front || !panels.rear) throw new Error('r430.ts: r430 panels missing from rack.ts');
if (!dev.earsWidth) throw new Error('r430.ts: r430 earsWidth missing from rack.ts');

const controllerCard: Card = {
  title: 'Dell PERC H730 Mini',
  kind: 'Storage controller',
  lines: ['A RAID card, run in HBA mode.', 'Both disks reach ZFS as they are, with no RAID in between.']
};

/** The one cable: the documented link to the gateway in ./rack.ts. */
const uplink = links.find((l) => l.to.device === 'r430');
if (!uplink?.from.port || !uplink.to.port) throw new Error('r430.ts: no gateway link to the R430 in rack.ts');

const nicsCard: Card = {
  title: '4 × 1 GbE',
  kind: 'Network · Broadcom BCM5720',
  lines: [`${uplink.to.port} goes to the gateway’s ${uplink.from.port.toLowerCase()}.`, 'The other three have nothing plugged in.']
};

const psusCard: Card = {
  title: '2 power supplies',
  kind: 'Power',
  lines: ['550 W each.', 'Redundant: either one can run the server.']
};

export const r430 = {
  id: 'r430' as const,
  identity: {
    name: dev.name,
    card: {
      title: dev.name,
      kind: 'The second server',
      lines: ['Two Xeons, 48 GB of RAM and eight 2.5″ bays.', 'One unit tall, right above the R730.']
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
    /** The sockets the four sticks are in, as Dell letters them. */
    fitted: ['A1', 'A2', 'B1', 'B2'],
    card: {
      title: `${memoryGB} GB RAM`,
      kind: 'Memory',
      lines: ['2 × 16 GB and 2 × 8 GB of DDR4.', 'Four of twelve sockets filled.']
    } satisfies Card
  },
  controller: { name: 'Dell PERC H730 Mini', mode: 'HBA mode', card: controllerCard },
  bays: {
    front: BAY_ZONES.length,
    list: BAY_ZONES.map((zone, n): R430Bay => {
      const drive = drives.find((d) => d.bay === n)?.id;
      return drive ? { n, zone, drive } : { n, zone };
    })
  },
  drives,
  pool: {
    id: 'rpool' as const,
    layout: 'mirror' as const,
    copies: 2,
    bays: [0, 1],
    holds: 'Proxmox and the VMs on this host',
    card: {
      title: 'rpool',
      kind: 'ZFS pool · 2-way mirror',
      lines: ['Both SSDs, mirrored.', 'Holds Proxmox and the VMs on this host.']
    } satisfies Card
  },
  nics: { ports: 4, speed: '1 GbE', cabled: 1, uplink: { nic: uplink.to.port, port: uplink.from.port, speed: uplink.speed ?? '' }, card: nicsCard },
  psus: { count: 2, watts: 550, card: psusCard },
  dims: { body: dev.body satisfies Mm, earsWidth: dev.earsWidth },
  /** The same front and rear zones the cabinet sheet draws. */
  panels: { front: panels.front satisfies PanelLayout, rear: panels.rear satisfies PanelLayout },
  /** Inside the chassis, front to back. */
  internal: [
    {
      id: 'backplane',
      label: '8-bay backplane',
      count: 1,
      card: { title: '8-bay backplane', kind: 'Backplane', lines: ['Eight hot-swap 2.5″ bays plug into it.'] }
    },
    { id: 'fans', label: 'Fans', card: { title: 'Fans', kind: 'Cooling', lines: ['One row of fans between the drives and the CPUs.'] } },
    { id: 'cpu1', label: 'CPU1', count: 1, card: cpus[0].card },
    { id: 'cpu2', label: 'CPU2', count: 1, card: cpus[1].card },
    {
      id: 'dimms',
      label: 'DIMM sockets',
      count: fitted,
      of: SOCKETS,
      card: { title: `${fitted} of ${SOCKETS} DIMM sockets`, kind: 'Memory', lines: ['2 × 16 GB and 2 × 8 GB sticks fitted.', 'Eight sockets still empty.'] }
    },
    { id: 'perc', label: 'PERC H730 Mini', count: 1, card: controllerCard },
    { id: 'nics', label: 'Onboard NICs', count: 4, card: nicsCard },
    { id: 'psus', label: 'PSUs', count: 2, card: psusCard }
  ] satisfies R430Part[]
};

/* Load-time checks: every bay zone exists and is a bay; each drive sits in a bay of its own; the
 * pool's bays are its drives' bays. */
{
  const bayZones = new Set(panels.front.zones.filter((z) => z.kind === 'bay').map((z) => z.id));
  for (const z of BAY_ZONES) if (!bayZones.has(z)) throw new Error(`r430.ts: rack.ts has no front bay zone ${z}`);
  if (bayZones.size !== BAY_ZONES.length) throw new Error(`r430.ts: rack.ts draws ${bayZones.size} bays, the R430 has ${BAY_ZONES.length}`);
  const used = drives.map((d) => d.bay);
  if (new Set(used).size !== used.length || used.some((b) => b < 0 || b >= BAY_ZONES.length)) throw new Error('r430.ts: a drive is out of range or shares a bay');
  if (used.join() !== r430.pool.bays.join()) throw new Error(`r430.ts: rpool bays ${r430.pool.bays.join()} ≠ its drives' bays ${used.join()}`);
  if (r430.memory.fitted.length !== fitted) throw new Error('r430.ts: fitted sockets and stick count differ');
}

/** The drive in a bay, if any. */
export const r430DriveAt = (bay: number): R430Drive | undefined => drives.find((d) => d.bay === bay);

/** Counts a drawing or a page might print. */
export const r430Derived = {
  drives: drives.length,
  baysFree: BAY_ZONES.length - drives.length
};
