---
---
## Homelab

My homelab is a production-grade infrastructure running in a 42U enclosed server rack. Everything is deployed via GitOps - no manual configuration, no snowflakes.

![](/img/setup/setup-homelab-cabinet-open.jpg)

## Hardware

| Component | Specs |
|-----------|-------|
| **Compute** | Dell PowerEdge R720xd (40 threads, 256GB ECC RAM) |
| **Network** | UniFi UDM Pro + U7 WiFi AP |
| **Storage** | UNAS Pro 8 (8-bay NAS) |
| **Edge** | Raspberry Pi 4B (8GB) |

## Architecture

The heart of my homelab is a **3-node Talos Kubernetes cluster** running on Proxmox VE. I chose Talos for its immutable, API-driven design - no SSH, no package managers, just declarative configuration.

**Stack Overview:**
- **Hypervisor**: Proxmox VE
- **Kubernetes**: Talos Linux
- **GitOps**: ArgoCD deploys everything from git
- **Ingress**: Traefik + Cloudflare Tunnels (HA with 2 replicas)
- **Networking**: MetalLB for load balancing, Pi-hole for DNS
- **Storage**: CloudNativePG operator, local-path provisioner, NFS

## What's Running

I run **25+ production services** including:
- **Immich** - Self-hosted Google Photos replacement
- **Homepage/Dashy** - Dashboard for all services
- **Self-hosted GitHub Actions runners** - CI/CD on my own hardware
- **Full observability stack** - Prometheus, Grafana, AlertManager

## Infrastructure as Code

The entire homelab is defined in my [home.io repository](https://github.com/techdufus/home.io):
- **Terraform** provisions Proxmox VMs
- **Ansible** bootstraps the base OS
- **ArgoCD** deploys all Kubernetes workloads

If my rack catches fire, I can rebuild the entire infrastructure from git.

---

*Want to see the actual configs? Everything is public at [github.com/TechDufus/home.io](https://github.com/techdufus/home.io).*
