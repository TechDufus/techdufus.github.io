/**
 * Sheet 03 · The stack: what runs where, in three layers. Bootstrap turns the metal into a
 * hypervisor, OpenTofu puts VMs on it, and the cluster runs the rest.
 *
 * `status` is as of 2026-09-29: running means it's in the repo and up; planned means it's in the
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
            id: 'r720xd',
            name: 'Dell R720xd',
            what: 'The one server: 40 threads, 128 GB',
            status: 'running',
            card: {
              title: 'Dell PowerEdge R720xd',
              kind: 'Metal',
              lines: ['40 threads, 128 GB RAM, six drives.', 'An HBA330 hands every disk straight to ZFS.']
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
              lines: ['rpool: boot, a 3-way mirror.', 'fast: VM disks, a mirror.', 'bulk: scratch, one disk.']
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
            what: 'The hypervisor, on ZFS',
            status: 'running',
            version: '9.2',
            card: {
              title: 'Proxmox VE 9.2',
              kind: 'Hypervisor',
              lines: ['Installed by hand, on ZFS.', 'Ansible configures it after that.']
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
                'A node metrics exporter.'
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
              lines: ['The control node, on the top shelf.', 'Configured by Ansible, like the host.']
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
            id: 'robomp',
            name: 'robomp',
            what: 'The oh-my-pi GitHub bot',
            status: 'planned',
            card: {
              title: 'robomp',
              kind: 'Standalone VM',
              lines: ['The oh-my-pi GitHub bot, in its own VM.', 'It will triage my personal projects and fix them through PRs.']
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
              lines: ['The cluster’s network (CNI).', 'Replaces kube-proxy.', 'Hubble shows the traffic.']
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
            status: 'planned',
            card: { title: 'cert-manager', kind: 'Certificates', lines: ['Issues and renews certificates.'] }
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
            id: 'nfs-csi',
            name: 'NFS CSI',
            what: 'Shared storage on the UNAS',
            status: 'planned',
            card: { title: 'NFS CSI', kind: 'Shared storage', lines: ['Volumes on the UNAS, over NFS.'] }
          },
          {
            id: 'volsync',
            name: 'VolSync',
            what: 'Backups',
            status: 'planned',
            card: { title: 'VolSync', kind: 'Backups', lines: ['Backs up the cluster’s volumes to the UNAS.'] }
          },
          {
            id: 'cloudnative-pg',
            name: 'CloudNativePG',
            what: 'Postgres',
            status: 'planned',
            card: { title: 'CloudNativePG', kind: 'Databases', lines: ['Postgres, for the apps that want one.'] }
          },
          {
            id: 'observability',
            name: 'VictoriaMetrics + VictoriaLogs + Grafana',
            what: 'Metrics, logs and dashboards',
            status: 'planned',
            card: {
              title: 'Observability',
              kind: 'Metrics and logs',
              lines: ['VictoriaMetrics for metrics, VictoriaLogs for logs.', 'Grafana for looking at both.']
            }
          },
          {
            id: 'policies',
            name: 'Admission policies',
            what: 'Guardrails',
            status: 'planned',
            card: {
              title: 'Admission policies',
              kind: 'Guardrails',
              lines: ['Built-in Kubernetes rules that say no to risky changes.']
            }
          }
        ]
      },
      {
        id: 'apps',
        title: 'Apps',
        items: [],
        card: {
          title: 'Apps',
          kind: 'Empty slot',
          lines: ['Nothing decided yet.', 'Adding one will mean adding a folder.']
        }
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
