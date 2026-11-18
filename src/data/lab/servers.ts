/**
 * Sheet 02 · The servers: the four machines in the cabinet that run things, side by side. The
 * R730 and the R730-2 are the two Proxmox hosts, the Mac mini does macOS CI, and the Raspberry Pi
 * is the control node.
 *
 * Almost nothing is stated here for the first time. Where each box sits comes from ./rack.ts, the
 * R730's insides from ./server.ts, the R730-2's from ./r730-2.ts, and what runs on the two hosts
 * from ./stack.ts (a VM is on the R730 unless it says `on: 'r730-2'`). Only the facts no other
 * file holds are written out below. The two Dells have sheets of their own (`sheet`).
 */
import { device, nas, uLabel } from './rack';
import { r7302, r7302Derived } from './r730-2';
import { derived, server } from './server';
import { stack } from './stack';
import type { Card, CardLines, DeviceId } from './types';

export type MachineId = Extract<DeviceId, 'r730' | 'r730-2' | 'mini' | 'rpi-4b'>;

export type Machine = {
  /** The cabinet device it is (./rack.ts). */
  id: MachineId;
  name: string;
  short: string;
  /** What it's for, in a few words. */
  job: string;
  /** "U13–14", or the shelf it stands on. */
  where: string;
  cpu: string;
  cores: number;
  threads: number;
  memoryGB: number;
  /** Left off when it isn't recorded. */
  storage?: string;
  /** Raw capacity of its drives as labelled, decimal GB; left off when it isn't recorded. */
  storageGB?: number;
  os: string;
  /** What runs on it. */
  runs: string[];
  /** One or two lines for the card, after the numbers. */
  notes: string[];
  /** A sheet of its own: its number ("02A") and where it is. */
  sheet?: { no: string; href: string };
};

const words = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];

const where = (id: MachineId): string => {
  const p = device(id).placement;
  if (p.kind === 'rack') return uLabel(p.u);
  if (p.kind === 'shelf') return device(p.shelf).name;
  return p.where;
};

const item = (id: string) => {
  const it = stack.flatMap((l) => l.groups.flatMap((g) => g.items)).find((i) => i.id === id);
  if (!it) throw new Error(`servers.ts: no stack item ${id}`);
  return it;
};
const proxmox = `${item('proxmox').name} ${item('proxmox').version}`;

/** The running VMs on a Proxmox host, as the stack lists them ("3 Talos nodes", "GitHub runner"). */
const vmsOn = (host: 'r730' | 'r730-2'): string[] =>
  (stack.find((l) => l.id === 'vms')?.groups ?? [])
    .flatMap((g) => g.items)
    .filter((i) => i.status === 'running' && (i.on ?? 'r730') === host)
    .map((i) => (i.count ? `${i.count} ${i.name}` : i.name));

const base = (id: MachineId) => {
  const d = device(id);
  return { id, name: d.name, short: d.short, where: where(id) };
};

const cpu = server.cpus[0];

export const machines: Machine[] = [
  {
    ...base('r730'),
    job: 'The main Proxmox host',
    cpu: `${server.cpus.length} × ${cpu.model.replace('Intel ', '')}`,
    cores: server.cpus.reduce((n, c) => n + c.cores, 0),
    threads: server.threads,
    memoryGB: server.memory.gb,
    storage: `${words[derived.drives][0].toUpperCase()}${words[derived.drives].slice(1)} drives in ${words[server.pools.length]} ZFS pools`,
    storageGB: derived.rawGB,
    os: proxmox,
    runs: vmsOn('r730'),
    notes: [],
    sheet: { no: '02A', href: '/lab/r730/' }
  },
  {
    ...base('r730-2'),
    job: 'The second Proxmox host',
    cpu: `${r7302.cpus.length} × ${r7302.cpus[0].model.replace('Intel ', '')}`,
    cores: r7302.cores,
    threads: r7302.threads,
    memoryGB: r7302.memory.gb,
    storage: `${words[r7302Derived.drives][0].toUpperCase()}${words[r7302Derived.drives].slice(1)} SSDs in ${words[r7302.pools.length]} ZFS mirrors`,
    storageGB: r7302Derived.rawGB,
    os: proxmox,
    runs: vmsOn('r730-2'),
    notes: ['Clustered with the R730.'],
    sheet: { no: '02B', href: '/lab/r730-2/' }
  },
  {
    ...base('mini'),
    job: 'macOS CI',
    cpu: 'Apple M1',
    cores: 8,
    threads: 8,
    memoryGB: 16,
    storage: '1 TB SSD',
    storageGB: 1000,
    os: 'macOS',
    runs: ['macOS CI jobs, each in a throwaway macOS VM'],
    notes: []
  },
  {
    ...base('rpi-4b'),
    job: 'The control node',
    cpu: 'Broadcom BCM2711',
    cores: 4,
    threads: 4,
    memoryGB: 8,
    os: 'Raspberry Pi OS',
    runs: ['The tie-breaker for the two Proxmox hosts'],
    notes: ['Ansible configures it too.']
  }
];

/** "64 threads" where the CPU has more threads than cores, else "8 cores". */
export const cpuCount = (m: Machine): string => (m.threads > m.cores ? `${m.threads} threads` : `${m.cores} cores`);

/** A machine's card on Sheet 02: the numbers, then what runs on it. */
export const machineCard = (m: Machine): Card => ({
  title: m.name,
  kind: `${m.job} · ${m.where}`,
  lines: [
    `${m.cpu}: ${cpuCount(m)}, ${m.memoryGB} GB RAM.`,
    `${m.storage ? `${m.storage}. ` : ''}${m.os}.`,
    `Runs: ${m.runs.join(', ')}.`,
    ...m.notes
  ].slice(0, 4) as CardLines
});

/**
 * What the sheet and the pages print about the lab as a whole: the four machines' cores, threads
 * and memory, and every disk as labelled (the four machines' and the NAS's data drives; its cache
 * drives and the spare on the bottom shelf aren't counted).
 */
export const totals = {
  machines: machines.length,
  cores: machines.reduce((n, m) => n + m.cores, 0),
  threads: machines.reduce((n, m) => n + m.threads, 0),
  memoryGB: machines.reduce((n, m) => n + m.memoryGB, 0),
  storageGB: machines.reduce((n, m) => n + (m.storageGB ?? 0), 0) + nas.drives * nas.driveGB
};
