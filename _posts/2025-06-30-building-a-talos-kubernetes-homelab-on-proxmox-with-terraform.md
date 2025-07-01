---
layout: post
section-type: post
title: 'Building a Talos Kubernetes Homelab with Terraform on Proxmox'
category: tech
tags: ['homelab', 'talos', 'kubernetes', 'terraform', 'proxmox', 'devops']
---

# Trying to automate Talos Linux deployment with Terraform

So I heard about Talos Linux from the interwebs and figured I'd give it a shot in my homelab. Something about an immutable OS just for Kubernetes? Sure, why not.

My goal: get a Talos cluster running on Proxmox using only Terraform. No manual clicking around, I'm too lazy. Should be simple enough, just like my neovim config. (which I use btw)

## What Even Is Talos Linux?

[Talos Linux](https://www.talos.dev/) is basically a stripped-down Linux that only runs Kubernetes. The weird parts:

- [No SSH access](https://www.talos.dev/v1.10/introduction/what-is-talos/#design-principles) (takes some getting used to in a homelab where you want to control everything)
- [Read-only filesystem](https://www.talos.dev/v1.10/introduction/what-is-talos/#immutable)
- Everything happens through [APIs](https://www.talos.dev/v1.10/learn-more/talosctl/)
- More secure because there's less to attack

The basic idea: less stuff = less problems. Makes sense, I guess. (Unless it's Neovim)

## My Setup

Running this on a Proxmox server in my basement. Nothing fancy:

- 1 control plane node (4 CPU, 8GB RAM)
- 2 worker nodes (4 CPU, 12GB RAM each)
- Static IPs because DHCP in my homelab is... flaky

Terraform for everything because clicking through UIs gets old.

## The Terraform Approach I Settled On

After trying a bunch of different approaches (and failing), here's what worked:

- Proxmox provider for creating VMs
- [Talos provider](https://registry.terraform.io/providers/siderolabs/talos/latest/docs) for configuring the cluster
- OnePassword provider for secrets (I use 1Password for everything)
- Local provider for saving kubeconfig files

Not saying this is the best way. Just what finally worked.

## The Version Gotcha That Cost Me Hours

This one burned me: Talos changed their image types between versions. Version 1.7.x has "nocloud" images that work with cloud-init. Version 1.8.0+? They switched to ["metal" images](https://www.talos.dev/v1.10/advanced/metal-network-configuration/) that don't.

Why does this matter? If you want static IPs through Terraform, you need [cloud-init support](https://www.talos.dev/v1.7/talos-guides/install/cloud-platforms/). Without it, you're stuck doing manual network config. So much for automation.

Sticking with 1.7.6:

```hcl
variable "talos_version" {
  description = "Talos Linux version to use"
  type        = string
  default     = "1.7.6"  # Latest 1.7.x for nocloud support
}
```
*[View in repo](https://github.com/TechDufus/home.io/blob/main/terraform/proxmox/modules/talos-template/variables.tf#L21-L25)*

There's probably a better way with newer versions. Haven't found it.

## The Template Approach

I split my Terraform into modules. The template module creates a reusable VM template:

```hcl
module "talos_template" {
  source = "../../modules/talos-template"

  template_vm_id  = 9200
  talos_version   = "1.7.6"
  proxmox_node    = "proxmox"
  vm_storage_pool = "local-lvm"  # Adjust for your Proxmox storage
}
```
*[View template module](https://github.com/TechDufus/home.io/tree/main/terraform/proxmox/modules/talos-template)*

The node module clones from the template:

```hcl
module "control_plane" {
  source = "../../modules/talos-node"

  template_vm_id = module.talos_template.template_id
  node_name      = "homelab-cp"
  node_role      = "controlplane"
  vm_id          = 200

  # Static IP configuration
  ip_address  = "10.0.20.10"
  subnet_mask = 24
  gateway     = "10.0.20.1"

  # Required Talos configuration
  cluster_name        = var.cluster_name
  talos_client_config = talos_machine_secrets.cluster.client_configuration
  machine_config      = data.talos_machine_configuration.control_plane.machine_configuration
}
```
*[View node module](https://github.com/TechDufus/home.io/tree/main/terraform/proxmox/modules/talos-node)*

Works reliably enough.

## The File Upload Problem

The Talos images are 1.2GB compressed. Uploading through the Proxmox API? Timeouts. Failures. Pain.

I ended up using SSH and rsync:

```bash
# Download and decompress locally
curl -fsSL "https://github.com/siderolabs/talos/releases/download/v${var.talos_version}/nocloud-amd64.raw.xz" \
  -o "/tmp/talos-${var.talos_version}-nocloud-amd64.raw.xz"
xz -d "/tmp/talos-${var.talos_version}-nocloud-amd64.raw.xz"

# Upload via rsync with progress
rsync -avz --progress "/tmp/talos-${var.talos_version}-nocloud-amd64.raw" \
  root@${var.proxmox_node}:/tmp/
```
*[View full upload logic](https://github.com/TechDufus/home.io/blob/main/terraform/proxmox/modules/talos-template/main.tf#L58-L127)*

Not pretty but it works.

## Getting kubectl and talosctl Working

Got the Terraform to automatically configure [kubectl](https://kubernetes.io/docs/reference/kubectl/) and [talosctl](https://www.talos.dev/v1.10/learn-more/talosctl/). It merges the new cluster config with my existing kubeconfig:

```hcl
resource "null_resource" "kubeconfig_merge" {
  provisioner "local-exec" {
    command = <<-EOT
      # Backup existing config (learned this one the hard way)
      cp ~/.kube/config ~/.kube/config.backup.$(date +%Y%m%d_%H%M%S)

      # Merge configs
      KUBECONFIG="$HOME/.kube/config:${path.root}/kubeconfig" \
        kubectl config view --flatten > /tmp/kubeconfig.merged

      # Validate merge worked, then replace
      if kubectl --kubeconfig=/tmp/kubeconfig.merged config get-contexts | grep -q "${var.cluster_name}"; then
        mv /tmp/kubeconfig.merged ~/.kube/config
      fi
    EOT
  }
}
```
*[View full kubeconfig merge logic](https://github.com/TechDufus/home.io/blob/main/terraform/proxmox/environments/dev/main.tf#L295-L388)*

That backup step? Added after I nuked my kubeconfig. Don't skip it.

## What's Running on It Now

Got a pretty full stack running now:

- **[MetalLB](https://metallb.universe.tf/)** for load balancer services (bare metal needs help with LoadBalancer types)
- **[Prometheus](https://prometheus.io/)** and **[Grafana](https://grafana.com/)** for monitoring (because you can't manage what you can't see)
- **[cert-manager](https://cert-manager.io/)** for SSL certificates (Let's Encrypt automation)
- **[Istio](https://istio.io/)** service mesh (probably overkill but it's cool)
- **[CloudNativePG](https://cloudnative-pg.io/)** for PostgreSQL (way better than managing databases manually)
- **[Local Path Provisioner](https://github.com/rancher/local-path-provisioner)** for storage (just local volumes but it works)

Turns out once you get the base cluster working, adding stuff with Helm is pretty straightforward.

## Performance Tweaks I Found

Made a few tweaks based on random blog posts. Not sure if they help, but they don't hurt:

```hcl
# CPU type for better container performance (supposedly)
cpu_type = "x86-64-v2-AES"

# Disable memory ballooning
balloon = 0
```
*[View performance configs](https://github.com/TechDufus/home.io/blob/main/terraform/proxmox/modules/talos-template/main.tf#L112-L116)*

The memory ballooning thing: Proxmox tries to be clever about memory but it can mess with Kubernetes.

## Things That Take Getting Used To

Talos does things differently than traditional Linux:

- No SSH access feels wrong at first. Yeah, security, but debugging requires learning new approaches
- [Certificate stuff](https://www.talos.dev/v1.10/learn-more/talosctl/#endpoints-and-nodes) just... happens automatically. Nice but takes trust
- Immutable filesystem is cool in theory but changes how you think about troubleshooting

## What I'd Do Differently

Next time:

- Start with one node to understand Talos first
- Actually read the docs before diving in
- Maybe try [k3s](https://k3s.io/) first since it's simpler
- Set up monitoring from the start

## Is This Overkill for a Homelab?

Absolutely. Could do most of this with [k3s](https://k3s.io/) or [Docker Compose](https://docs.docker.com/compose/). But where's the fun in that?

## Wrapping Up

Getting Talos running with Terraform was more work than expected. Version issues, file upload problems, and Talos complexity made this a multi-weekend project.

But it works! Can tear down and rebuild with [`terraform apply`](https://developer.hashicorp.com/terraform/cli/commands/apply). Not perfect, probably better ways to do it, but it's mine.

If you try something similar:
- Start simple
- Talos [1.7.x vs 1.8.x](https://www.talos.dev/v1.8/introduction/changelog-1.8/) matters for cloud-init
- Back up your kubeconfig
- Expect frustration

## Helpful Resources

Docs that actually helped:

- [Talos Linux Documentation](https://www.talos.dev/docs/) - Pretty good once you get the basics
- [Proxmox Provider Docs](https://registry.terraform.io/providers/bpg/proxmox/latest/docs) - Essential
- [Talos Provider Docs](https://registry.terraform.io/providers/siderolabs/talos/latest/docs) - Sparse but necessary
- [Complete Terraform Code](https://github.com/TechDufus/home.io/tree/main/terraform/proxmox) - The full working implementation

If you build something similar, let me know what worked. Still figuring this out.

