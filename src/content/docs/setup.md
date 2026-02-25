---
title: Setup
description: My current workstation + homelab setup, in one place.
---
<h2 id="setup-overview">Setup Overview</h2>

This is my single source of truth for what I run every day. I keep it practical and update it when I actually change something.

- Workstation automation lives in [`dotfiles`](https://github.com/techdufus/dotfiles).
- Homelab infrastructure lives in [`home.io`](https://github.com/techdufus/home.io).
- Goal: fast workflow, repeatable rebuilds, and less guesswork when things break.

<h2 id="setup-hardware">Hardware</h2>

### Computers

#### Sherlock (primary desktop)

Sherlock is my main desk machine. Custom build, dual-boot Windows 11 + Linux.

![](/img/setup/setup-sherlock-desktop.jpg)

| Component | Item |
| -- | -- |
| CPU | [AMD Ryzen 9 5950X 16-core](https://a.co/d/4pwKHpI) |
| GPU | [AORUS GeForce RTX 3080 MASTER 10G](https://www.gigabyte.com/Graphics-Card/GV-N3080AORUS-M-10GD-rev-30#kf) |
| RAM | [G.SKILL Trident Z Neo 64GB](https://a.co/d/iHfLS4z) |
| Motherboard | [ASUS ROG Crosshair VIII Dark Hero](https://a.co/d/hjINQ4h) |
| Cooler | [ASUS ROG Ryujin 240 AIO](https://a.co/d/fmJkpsk) |
| Case | [Lian Li O11D Mini](https://a.co/d/fEGMYYr) |
| Fans | [Lian Li UNI Fan SL 120](https://a.co/d/5ZA5JIP) |
| Storage | [Samsung 980 PRO NVMe (1TB + 500GB)](https://a.co/d/6b3r6GJ) |
| PSU | [Cooler Master V850 SFX Gold](https://a.co/d/7YxFnKy) |

#### MacBooks

- [M3 MacBook Pro (14-inch, Nov 2023)](https://support.apple.com/en-us/117735)
- [Intel MacBook Pro (Retina, 15-inch, Mid 2015)](https://support.apple.com/en-us/111955)

### Displays

I currently run mostly on a single ultrawide for focus.

- [Samsung 49in CRG9](https://www.samsung.com/us/computing/monitors/gaming/49-crg9-dual-qhd-curved-qled-gaming-monitor-lc49rg90ssnxza/) (primary)
- Viotek 27in curved
- [HP P224 21.5in](https://support.hp.com/us-en/product/product-specs/hp-p224-21.5-inch-monitor/26575345)

### Peripherals

- **Keyboard**: [ZSA Moonlander](https://www.zsa.io/moonlander), custom Dvorak layout ([ORYX config](https://configure.zsa.io/moonlander/layouts/j6X5Z/latest/0)).
- **Mouse**: Logitech MX Master 3.
- **Microphone**: [Rode NT-USB+](https://rode.com/en-us/microphones/usb/nt-usb-plus).
- **Webcams**: [Logitech C925E](https://www.logitech.com/en-us/products/webcams/c925e-business-webcam.960-001075.html) + [Logitech C922](https://www.logitech.com/en-us/products/webcams/c922-pro-stream-webcam.html).
- **Headphones**: [Sony WH-1000XM5](https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-b).
- **Speakers**: [Creative T100](https://us.creative.com/p/speakers/creative-t100).

<h2 id="setup-software">Software Workflow</h2>

### Terminal-first session flow

I spend most of my time in terminal sessions:

- **Terminal**: [Ghostty](https://ghostty.org/)
- **Session manager**: [sesh](https://github.com/joshmedeski/sesh)
- **Multiplexer**: tmux (+ resurrect/continuum)

I usually hit `<prefix>-o`, fuzzy-find where I need to be, and let sesh attach/create the session.

![sesh picker showing fzf interface with keybind hints and session list](/img/setup/tmux-sesh-picker.png)

For tmux navigation I use `Ctrl+hjkl` (via vim-tmux-navigator), and I sync panes when I need to run parallel commands.

![tmux status bar showing session name, directory, window tabs, Claude status, and online indicator](/img/setup/tmux-statusline-information.png)

### Editor + shell stack

- **Editor**: [Neovim](https://neovim.io/) with LSP, Treesitter, Telescope.
- **Shell**: zsh + powerlevel10k + custom functions for git/k8s/remote edit workflows.
- **Infra tools**: Terraform, Terragrunt, Helm, kubectl, cloud CLIs.

### Window management

I use a cell-based layout with summon keys, not traditional manual tiling.

![Cell-based window layout showing 5 predefined screen regions](/img/setup/window-management-cell-layout-1-5.png)

On Linux this runs through AwesomeWM automation; on macOS through Hammerspoon. Same mental model across both.

### Agent workflow tooling

- **Claude Code** with custom hooks and status integration in tmux.
- **[oh-my-claude](https://github.com/TechDufus/oh-my-claude)** for sane defaults and repeatable workflows.
- **[openkanban](https://github.com/TechDufus/openkanban)** for tracking parallel agent sessions.
- **MCP servers** for browser checks/docs/context plumbing.

<h2 id="setup-homelab">Homelab</h2>

My homelab is built for repeatability, not hand-tuned snowflakes.

![](/img/setup/setup-homelab-cabinet-open.jpg)

### Hardware at a glance

| Component | Specs |
|-----------|-------|
| Compute | Dell PowerEdge R720xd (40 threads, 256GB ECC RAM) |
| Network | UniFi UDM Pro + U7 AP |
| Storage | UNAS Pro 8 |
| Edge | Raspberry Pi 4B (8GB) |

### Architecture

- Proxmox VE hosts a 3-node Talos Kubernetes cluster.
- GitOps via ArgoCD.
- Traefik ingress + HA Cloudflare tunnels.
- MetalLB, Pi-hole DNS, local + NFS-backed storage patterns.

### Workloads + rebuild path

I run 25+ services including Immich, dashboards, self-hosted runners, and an observability stack.

Everything is declarative through [`home.io`](https://github.com/techdufus/home.io) using Terraform + Ansible + ArgoCD. If I lose a node, I rebuild from git.

<h2 id="setup-wiring">Wiring Diagram</h2>

Quick map of the desk wiring path:

```text
[Moonlander Keyboard] --USB--> [USB Switch]
[C925 Webcam]        --USB--> [USB Switch]
[MX Master 3]        --USB--> [USB Switch]
[Rode NT-USB+]       --USB--> [USB Switch]

[USB Switch] ==USB==> [HP Dock]
[USB Switch] ==USB==> [Sherlock PC]

[CRG9] --HDMI--> [Sherlock PC]
[CRG9] --HDMI--> [HP Dock]
[HP Dock] --TB--> [MacBook Pro]
```
