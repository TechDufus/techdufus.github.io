/**
 * Sheet 03 · The stack: build-time model for the drawings in this folder. Everything the sheet
 * shows comes from src/data/lab/stack.ts (what runs where, running or planned, cards) and
 * src/data/lab/server.ts (pools, threads, memory). Flip an item's `status` in the data and the
 * drawing follows: running is solid ink, planned is a dashed phantom.
 *
 * Numbering: every clickable thing gets a balloon number in layer order, running before planned
 * within a group (the way the drawing places them), then an empty group's own card, so the
 * section, the plan, the excerpt and the page's list all agree.
 */
import { stack } from '../../../data/lab/stack';
import { server } from '../../../data/lab/server';
import type { Card, PoolId, StackGroup, StackItem, StackLayer, Status } from '../../../data/lab/types';

export const DWG = 'lab03';

export type Thing = {
  id: string;
  /** Short name: the hover tag and the accessible name (with ", planned" when it is). */
  name: string;
  status: Status;
  card: Card;
  n: number;
  item?: StackItem;
  group: StackGroup;
  layer: StackLayer;
};

const things: Thing[] = [];
for (const layer of stack) {
  for (const group of layer.groups) {
    if (group.items.length === 0 && group.card) {
      things.push({ id: group.id, name: group.card.title, status: 'planned', card: group.card, n: 0, group, layer });
    }
    const rank = (s: Status) => (s === 'planned' ? 1 : 0);
    for (const item of [...group.items].sort((a, b) => rank(a.status) - rank(b.status))) {
      things.push({ id: item.id, name: item.card.title, status: item.status, card: item.card, n: 0, item, group, layer });
    }
  }
}
things.forEach((t, i) => (t.n = i + 1));

/** Every clickable thing, in balloon order. */
export const allThings = (): readonly Thing[] => things;
/** A group's things, in balloon order. */
export const groupThings = (groupId: string): Thing[] => things.filter((t) => t.group.id === groupId && t.item);

/** The thing with this data id; throws so a renamed id fails the build instead of the drawing. */
export function thing(id: string): Thing {
  const t = things.find((x) => x.id === id);
  if (!t) throw new Error(`stack drawing: no item or slot "${id}" in src/data/lab/stack.ts`);
  return t;
}

export const layer = (id: StackLayer['id']): StackLayer => {
  const l = stack.find((x) => x.id === id);
  if (!l) throw new Error(`stack drawing: no layer "${id}"`);
  return l;
};
export const group = (id: string): StackGroup => {
  for (const l of stack) for (const g of l.groups) if (g.id === id) return g;
  throw new Error(`stack drawing: no group "${id}"`);
};

export const planned = (t: { status: Status }): boolean => t.status === 'planned';
/** Accessible name / hover tag. */
export const tagOf = (t: Thing): string => (planned(t) ? `${t.name}, planned` : t.name);
/** Card kind line, with the status for planned things (the data keeps status out of `kind`). */
export const kindOf = (t: Thing): string =>
  planned(t) ? (t.card.kind ? `${t.card.kind} · planned` : 'Planned') : (t.card.kind ?? '');
/** The drawing's lettering of a tool: "Helm, then Flux" → "HELM → FLUX". */
export const toolText = (tool: string): string => tool.replace(/,\s*then\s+/gi, ' → ');

/** Pools (for the footings and the plan), threads and memory, from the server data. */
export const pools = server.pools;
export const pool = (id: PoolId) => {
  const p = server.pools.find((x) => x.id === id);
  if (!p) throw new Error(`stack drawing: no pool "${id}"`);
  return p;
};
export const threads = server.threads;
export const memoryGB = server.memory.gb;
export const cpuCount = server.cpus.length;
export const cpuModel = server.cpus[0].model.replace(/^Intel\s+/, '');
export const controllerName = server.controller.card.title.replace(/^Dell\s+/, '');
export const driveCount = server.drives.length;

/** The cluster's one API endpoint: drawn on the plan, not an item in the data. */
export const API_ID = 'c-api';
export const apiCard: Card = {
  title: 'Kubernetes API',
  kind: 'One endpoint',
  lines: ['One address for the whole cluster, shared by every node.', 'One node answers at a time. If it goes down, another takes over.'],
};

/** The Talos cluster item: count and VM size drive the rooms, the plan and the dimensions. */
export const clusterGroup = group('cluster');
export const talos = (() => {
  const t = clusterGroup.items[0];
  if (!t?.vm || !t.count) throw new Error('stack drawing: the cluster item needs `count` and `vm`');
  return t as StackItem & { vm: NonNullable<StackItem['vm']>; count: number };
})();

/**
 * Fixture lettering: the item's name, wrapped to `max` characters (breaking long words at
 * hyphens and CamelCase); falls back to the card title when the name needs more than two lines.
 */
export function fixtureLines(t: Thing, max: number): string[] {
  // Pieces carry how they join the previous one: a space between words, nothing inside a word.
  const pieces = (s: string): { t: string; sp: boolean }[] =>
    s.split(/\s+/).flatMap((w) =>
      (w.length <= max ? [w] : w.replace(/-/g, '-\u0000').replace(/([a-z])([A-Z])/g, '$1\u0000$2').split('\u0000'))
        .map((t, i) => ({ t, sp: i === 0 })),
    );
  const pack = (s: string): string[] => {
    const out: string[] = [];
    let cur = '';
    for (const p of pieces(s)) {
      const join = cur ? cur + (p.sp ? ' ' : '') + p.t : p.t;
      if (join.length <= max) cur = join;
      else {
        if (cur) out.push(cur);
        cur = p.t;
      }
    }
    if (cur) out.push(cur);
    return out;
  };
  const byName = pack(t.item?.name ?? t.name);
  return byName.length <= 2 ? byName : pack(t.card.title);
}
