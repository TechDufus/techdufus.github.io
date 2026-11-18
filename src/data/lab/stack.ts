// Synced from homelab @ a136d25 (2026-11-14)
/**
 * Sheet 03 · The stack: what runs where, in three layers. Bootstrap turns the metal into a
 * hypervisor, OpenTofu puts VMs on it, and the cluster runs the rest.
 *
 * `status` is as of 2026-11-14: running means it's in the repo and up; planned means it's in the
 * plan but not built yet. Versions are major.minor.
 */
import type { StackGroup, StackItem, StackLayer, Status } from './types';

export const stack: StackLayer[] = [
  {
    id: 'bootstrap',
    n: 1,
    title: 'Bootstrap',
    purpose: 'Metal to hypervisor: installed by hand, configured by Ansible.',
    tool: 'Ansible',
    groups: [
      {
        id: 'metal',
        title: 'Metal',
        items: [
          {
            id: 'r730',
            name: 'Dell R730',
            what: 'The main server: 64 threads, 512 GB',
            status: 'running',
            card: {
              title: 'Dell PowerEdge R730',
              kind: 'Metal',
              lines: ['64 threads, 512 GB RAM, eight drives.', 'Its RAID card runs in HBA mode, so every disk goes straight to ZFS.']
            }
          },
          {
            id: 'zfs',
            name: 'ZFS pools',
            what: 'rpool, fast and bulk',
            status: 'running',
            card: {
              title: 'ZFS pools',
              kind: 'Storage',
              lines: [
                'rpool: boot, a 3-way mirror.',
                'fast: VM disks, a 3-way mirror with a hot spare.',
                'bulk: scratch, one disk.',
                'The R730-2 has its own: rpool and data, 2-way mirrors.'
              ]
            }
          },
          {
            id: 'r730-2',
            name: 'Dell R730-2',
            what: 'The second server: 48 threads, 48 GB',
            status: 'running',
            card: {
              title: 'Dell PowerEdge R730-2',
              kind: 'Metal',
              lines: ['48 threads, 48 GB RAM, four drives in two ZFS mirrors.', 'Clustered with the R730. An RTX 3060 is in it, for testing.']
            }
          }
        ]
      },
      {
        id: 'host',
        title: 'Hypervisor',
        items: [
          {
            id: 'proxmox',
            name: 'Proxmox VE',
            what: 'The hypervisor: two hosts, one cluster',
            status: 'running',
            version: '9.2',
            card: {
              title: 'Proxmox VE 9.2',
              kind: 'Hypervisor',
              lines: [
                'Installed by hand, on ZFS.',
                'Ansible configures it after that.',
                'Two hosts, the R730 and the R730-2, in one cluster.',
                'The Pi is the tie-breaker between them.'
              ]
            }
          },
          {
            id: 'host-config',
            name: 'Host config',
            what: 'Snapshots, disk checks, alerts, metrics',
            status: 'running',
            card: {
              title: 'Host config',
              kind: 'Ansible playbook',
              lines: [
                'Hourly and daily ZFS snapshots of the VM pool.',
                'SMART self-tests and ZFS event alerts.',
                'Push alerts to my phone, through ntfy.',
                'Metrics exporters for the host and its hardware.'
              ]
            }
          }
        ]
      },
      {
        id: 'control',
        title: 'Control',
        items: [
          {
            id: 'rpi',
            name: 'Raspberry Pi 4',
            what: 'The control node',
            status: 'running',
            card: {
              title: 'Raspberry Pi 4',
              kind: 'Control node',
              lines: ['The control node, on the top shelf.', 'Configured by Ansible, like the hosts.', 'Also the tie-breaker for the two Proxmox hosts.']
            }
          }
        ]
      },
      {
        id: 'network',
        title: 'Network',
        items: [
          {
            id: 'udm-pro',
            name: 'UDM Pro',
            what: 'Gateway and firewall',
            status: 'running',
            card: {
              title: 'UniFi Dream Machine Pro',
              kind: 'Gateway',
              lines: ['Router and firewall. Everything else hangs off it.']
            }
          },
          {
            id: 'unas',
            name: 'UNAS Pro 8',
            what: 'NFS storage over 10 GbE',
            status: 'running',
            card: {
              title: 'UniFi UNAS Pro 8',
              kind: 'Network storage',
              lines: ['NFS storage, 10 GbE from the gateway.']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'vms',
    n: 2,
    title: 'Virtual machines',
    purpose: 'What runs on Proxmox: a cluster of VMs, and VMs on their own.',
    tool: 'OpenTofu',
    groups: [
      {
        id: 'cluster',
        title: 'Talos cluster',
        items: [
          {
            id: 'talos-nodes',
            name: 'Talos nodes',
            what: 'Control plane and workloads, all three',
            status: 'running',
            version: '1.14',
            count: 3,
            vm: { vcpu: 8, ramGiB: 24, diskGB: 64, pool: 'fast' },
            card: {
              title: 'Talos nodes ×3',
              kind: 'Kubernetes cluster',
              lines: [
                'Three VMs, each 8 vCPU, 24 GiB RAM and 64 GB on fast.',
                'Talos 1.14, running Kubernetes 1.37.',
                'All three are control plane, and all three run workloads.',
                'The OS image comes from Sidero’s Image Factory.'
              ]
            }
          }
        ]
      },
      {
        id: 'standalone',
        title: 'Standalone VMs',
        items: [
          {
            id: 'ci-runner',
            name: 'GitHub runner',
            what: 'Self-hosted CI runners',
            status: 'running',
            vm: { vcpu: 32, ramGiB: 64, diskGB: 200, pool: 'bulk' },
            card: {
              title: 'GitHub runner',
              kind: 'Standalone VM',
              lines: ['Self-hosted GitHub Actions runners, in their own VM.', '32 vCPU, 64 GiB RAM, 200 GB on bulk.']
            }
          },
          {
            id: 'omp-cloud',
            name: 'omp-cloud',
            what: 'Cloud agents for oh-my-pi',
            status: 'running',
            vm: { vcpu: 16, ramGiB: 48, diskGB: 300, pool: 'bulk' },
            card: {
              title: 'omp-cloud',
              kind: 'Standalone VM',
              lines: ['Runs omp-cloud: cloud agents for oh-my-pi.', 'Each agent is a microVM inside it.', '16 vCPU, 48 GiB RAM, 300 GB on bulk.']
            }
          },
          {
            id: 'robomp',
            name: 'robomp',
            what: 'The oh-my-pi GitHub bot',
            status: 'running',
            on: 'r730-2',
            card: {
              title: 'robomp',
              kind: 'Standalone VM',
              lines: [
                'The oh-my-pi GitHub bot, in its own VM.',
                'It triages issues on my personal projects and opens fix PRs.',
                '8 vCPU, 8 GiB RAM, 100 GB, on the R730-2.'
              ]
            }
          },
          {
            id: 'desktop',
            name: 'Omarchy desktop',
            what: 'My remote desktop',
            status: 'running',
            on: 'r730-2',
            card: {
              title: 'Omarchy desktop',
              kind: 'Standalone VM',
              lines: ['My Omarchy desktop, in a VM: my omp and Tern sessions live here.', '32 vCPU, 28 GiB RAM, 200 GB, on the R730-2.']
            }
          }
        ]
      }
    ]
  },
  {
    id: 'kubernetes',
    n: 3,
    title: 'Kubernetes',
    purpose: 'What runs in the cluster.',
    tool: 'Helm, then Flux',
    groups: [
      {
        id: 'platform',
        title: 'Platform',
        items: [
          {
            id: 'cilium',
            name: 'Cilium',
            what: 'Networking: CNI, kube-proxy replacement, Hubble',
            status: 'running',
            version: '1.20',
            card: {
              title: 'Cilium 1.20',
              kind: 'Networking',
              lines: [
                'The cluster’s network (CNI).',
                'Replaces kube-proxy.',
                'Hubble shows the traffic.',
                'Its Gateway API serves my apps over HTTPS.'
              ]
            }
          },
          {
            id: 'metrics-server',
            name: 'metrics-server',
            what: 'CPU and memory use, for kubectl top',
            status: 'running',
            version: '0.9',
            card: {
              title: 'metrics-server 0.9',
              kind: 'Metrics',
              lines: ['CPU and memory use per node and pod.', 'It’s what makes kubectl top work.']
            }
          },
          {
            id: 'flux',
            name: 'Flux',
            what: 'GitOps from the repo',
            status: 'running',
            card: {
              title: 'Flux',
              kind: 'GitOps',
              lines: ['Keeps the cluster in step with the repo.', 'Took over Cilium from Helm, and runs everything after it.']
            }
          },
          {
            id: 'cert-manager',
            name: 'cert-manager',
            what: 'Certificates',
            status: 'running',
            version: '1.21',
            card: {
              title: 'cert-manager 1.21',
              kind: 'Certificates',
              lines: ['Issues and renews certificates.', 'Let’s Encrypt ones, so my apps get real HTTPS.']
            }
          },
          {
            id: 'external-secrets',
            name: 'External Secrets',
            what: 'Secrets from 1Password',
            status: 'running',
            card: {
              title: 'External Secrets',
              kind: 'Secrets',
              lines: ['External Secrets with 1Password Connect.', 'Apps get their secrets from 1Password.']
            }
          },
          {
            id: 'proxmox-csi',
            name: 'Proxmox CSI',
            what: 'Block storage on fast and bulk',
            status: 'running',
            card: {
              title: 'Proxmox CSI',
              kind: 'Block storage',
              lines: ['Volumes carved out of the fast pool by default, bulk on request.', 'Attached to whichever node runs the pod.']
            }
          },
          {
            id: 'observability',
            name: 'VictoriaMetrics + VictoriaLogs + Grafana',
            what: 'Metrics, logs and dashboards',
            status: 'running',
            card: {
              title: 'Observability',
              kind: 'Metrics and logs',
              lines: [
                'VictoriaMetrics for metrics, VictoriaLogs for logs.',
                'Grafana for looking at both.',
                'The alert rules run, and they page my phone through ntfy.'
              ]
            }
          },
          {
            id: 'nfs-csi',
            name: 'NFS CSI',
            what: 'Shared storage on the UNAS',
            status: 'running',
            version: '4.13',
            card: {
              title: 'NFS CSI 4.13',
              kind: 'Shared storage',
              lines: ['Volumes carved out of the UNAS, over NFS.', 'For big or shared files. Everything else stays on fast.']
            }
          },
          {
            id: 'cloudnative-pg',
            name: 'CloudNativePG',
            what: 'Postgres',
            status: 'running',
            version: '1.30',
            card: {
              title: 'CloudNativePG 1.30',
              kind: 'Databases',
              lines: ['Postgres, for the apps that want one.', 'Its backups land in RustFS.']
            }
          },
          {
            id: 'rustfs',
            name: 'RustFS',
            what: 'S3 storage in the cluster',
            status: 'running',
            version: '1.0',
            card: {
              title: 'RustFS 1.0',
              kind: 'Object storage',
              lines: ['S3-compatible storage inside the cluster.', 'Database backups land here.']
            }
          },
          {
            id: 'policies',
            name: 'Admission policies',
            what: 'Guardrails',
            status: 'running',
            card: {
              title: 'Admission policies',
              kind: 'Guardrails',
              lines: ['Built-in Kubernetes rules that turn risky changes away.']
            }
          }
        ]
      },
      {
        id: 'apps',
        title: 'Apps',
        items: [
          {
            id: 'headlamp',
            name: 'Headlamp',
            what: 'A web UI for the cluster',
            status: 'running',
            card: {
              title: 'Headlamp',
              kind: 'Cluster UI',
              lines: ['A web UI for the cluster.', 'The first app in, mostly so I can click instead of type.']
            }
          },
          {
            id: 'homepage',
            name: 'Homepage',
            what: 'A start page for the lab',
            status: 'running',
            version: '2.4',
            card: { title: 'Homepage 2.4', kind: 'Dashboard', lines: ['A start page for the lab.', 'Everything I run, one click away.'] }
          },
          {
            id: 'gatus',
            name: 'Gatus',
            what: 'Status page and uptime checks',
            status: 'running',
            version: '5.37',
            card: {
              title: 'Gatus 5.37',
              kind: 'Status page',
              lines: ['Checks that everything answers.', 'Pages my phone when something doesn’t.']
            }
          },
          {
            id: 'zot',
            name: 'Zot',
            what: 'A private container registry',
            status: 'running',
            version: '2.1',
            card: { title: 'Zot 2.1', kind: 'Registry', lines: ['A private container registry.', 'Container images stay in the lab.'] }
          },
          {
            id: 'dash',
            name: 'Dash',
            what: 'Mission control for the lab',
            status: 'running',
            version: '0.17',
            card: {
              title: 'Dash 0.17',
              kind: 'Mission control',
              lines: ['Mission control for the lab, on one screen.', 'My own open-source project, running here.']
            }
          },
          {
            id: 'plex',
            name: 'Plex',
            what: 'Media server',
            status: 'running',
            version: '1.43',
            card: {
              title: 'Plex 1.43',
              kind: 'Media server',
              lines: ['Movies and TV, streamed from the UNAS.', 'No GPU here, so every transcode is software.']
            }
          },
          {
            id: 'seerr',
            name: 'Seerr',
            what: 'Requests for Plex',
            status: 'running',
            version: '3.5',
            card: { title: 'Seerr 3.5', kind: 'Requests', lines: ['Where requests for Plex get made.'] }
          },
          {
            id: 'arr',
            name: 'Radarr, Sonarr',
            what: 'Movies, TV and indexers',
            status: 'running',
            card: {
              title: 'Radarr, Sonarr',
              kind: 'Media automation',
              lines: ['Radarr and Sonarr fill the library.', 'Prowlarr keeps their indexers in sync.']
            }
          }
        ]
      }
    ]
  }
];

/* An empty group is a planned slot, so it needs its own card to stay clickable. */
for (const layer of stack) {
  for (const g of layer.groups) {
    if (g.items.length === 0 && !g.card) throw new Error(`stack.ts: empty group ${g.id} needs a card`);
  }
}

/** Running if anything in it runs; an empty slot is planned. */
export const groupStatus = (group: StackGroup): Status =>
  group.items.some((i) => i.status === 'running') ? 'running' : 'planned';

/** Every item, in layer order. */
export const stackItems = (): StackItem[] => stack.flatMap((l) => l.groups.flatMap((g) => g.items));

/** How many items are running and how many are planned (a counted item, like the 3 nodes, is one). */
export const stackCounts = (): Record<Status, number> => {
  const counts: Record<Status, number> = { running: 0, planned: 0 };
  for (const i of stackItems()) counts[i.status] += 1;
  return counts;
};
