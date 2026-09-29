/**
 * The words in "I Rebuilt My Homelab for an AI Operator"'s three figures (OldVsNew, WhoDidWhat,
 * TheNight), kept apart from the drawing code so the copy can be checked in one place. Labels are
 * the owner's, verbatim; the figures only lay them out.
 */

/* ------------------------------------------------ FIG 1 · Same server. Different operator. */

export const oldVsNew = {
  title: 'Same server. Different operator.',
  before: { head: 'BEFORE · home.io', sub: 'built for me' },
  now: { head: 'NOW · homelab', sub: 'built for an agent' },
  rows: [
    { layer: 'Disks', before: 'PERC RAID card, virtual disks', now: 'HBA330, every disk visible to ZFS' },
    { layer: 'Host', before: 'Proxmox set up by hand, behind RAID', now: 'Proxmox on ZFS, set up by Ansible' },
    { layer: 'VMs', before: 'Terraform, local state (lost)', now: 'OpenTofu, encrypted state in R2' },
    { layer: 'Kubernetes', before: 'Ubuntu + k3s', now: 'Talos ×3: no SSH, one API' },
    { layer: 'Deploys', before: 'Argo CD and its UI', now: 'Flux: Git is the interface' },
    { layer: 'Secrets', before: 'A bootstrap script reading 1Password', now: '1Password service account: agents see names, not values' },
    { layer: 'Storage', before: 'Longhorn: 3 replicas, 1 SSD', now: 'ZFS mirrors + Proxmox CSI' },
    { layer: 'Watching', before: 'Nothing', now: 'VictoriaMetrics, VictoriaLogs, Grafana' },
    { layer: 'Agent docs', before: 'Per-folder CLAUDE.md files that rotted', now: 'One AGENTS.md, skills, ADRs' },
  ],
};

/* ------------------------------------------------------------------ FIG 3 · Who did what */

export type Who = 'me' | 'agent';

export const whoDidWhat = {
  title: 'Who did what',
  lanes: [
    { id: 'me' as Who, label: 'Me', sub: 'the hands' },
    { id: 'agent' as Who, label: 'The agent', sub: 'the operator' },
  ],
  stages: [
    {
      stage: 'Plan',
      me: ['Asked the question', 'Pushed back on Talos', 'Made the calls: private repo, no CI'],
      agent: ['Audited the old lab', 'Wrote the plan and the ADRs', 'Argued for Talos, Flux, OpenTofu'],
    },
    {
      stage: 'Hardware',
      me: ['Pulled the RAID card', 'Fitted the HBA330 and cables', 'Ran the installer'],
      agent: ['Researched the chassis', 'Drew the runbook, step by step', 'Wrote and checked the USB stick'],
    },
    {
      stage: 'Bare metal',
      me: ['Created three API tokens', 'Clicked a few 1Password approvals'],
      agent: ['Built out the ZFS pools', 'Built the credential broker', 'Put state in R2, encrypted', 'Built three Talos nodes'],
    },
    {
      stage: 'Platform',
      me: ['Said “You own the cluster”', 'Picked single DNS records, not a wildcard'],
      agent: ['Flux, Connect, External Secrets', 'Gateway, certificates, Headlamp', 'Metrics and logs', 'Retired the plan'],
    },
    {
      stage: 'Since',
      me: ['Swap the failing SSD'],
      agent: ['Caught the failing SSD', 'Wrote the by-path rule', 'Filed the issue'],
    },
  ],
};

/* ----------------------------------------------------------- FIG 2 · Bare metal to monitoring */

/** One moment of the night; `quote` events are the owner's words, drawn as speech. */
export type Moment = { time: string; event: string; who: Who; quote?: boolean };

export const theNight = {
  title: 'Bare metal to monitoring',
  foot: 'About 14 hours from “server off” to monitoring, with a night in the middle.',
  gap: 'a night in the middle',
  /** Before the gap, then after it. */
  parts: [
    [
      { time: '9:44 PM', event: 'shutting down VMs and server. just FYI.', who: 'me', quote: true },
      { time: '11:00 PM', event: 'Proxmox is up!', who: 'me', quote: true },
      { time: '1:11 AM', event: 'Credential broker on the Pi', who: 'agent' },
      { time: '1:22 AM', event: 'OpenTofu state in R2, encrypted', who: 'agent' },
      { time: '1:30 AM', event: 'Host config and API tokens', who: 'agent' },
      { time: '1:45 AM', event: 'Three Talos nodes with Cilium', who: 'agent' },
    ],
    [
      { time: '8:47 AM', event: 'A kubeconfig script, for the human', who: 'agent' },
      { time: '9:12 AM', event: 'Flux, 1Password Connect, External Secrets', who: 'agent' },
      { time: '10:00 AM', event: 'Gateway API, certificates, Headlamp', who: 'agent' },
      { time: '11:11 AM', event: 'it works! I love it!', who: 'me', quote: true },
      { time: '11:27 AM', event: 'The plan retired into docs and issues', who: 'agent' },
      { time: '11:49 AM', event: 'Metrics, logs and dashboards', who: 'agent' },
    ],
  ] as Moment[][],
};
