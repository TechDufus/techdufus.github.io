---
title: Headless Obsidian Sync on Linux (No GUI Required)
description: >-
  Obsidian Sync is great — but it assumes you're sitting at a computer with a
  screen.
pubDate: '2026-02-13'
tags:
  - obsidian
  - linux
  - homelab
category: tech
---
Obsidian Sync is great — but it assumes you're sitting at a computer with a screen. What if you want your vault synced on a headless Linux server? Maybe an AI agent needs access, maybe you want a centralized backup, or maybe you just want your notes available on a machine with no monitor.

Here's how to run Obsidian with native Sync on a headless Linux VM.

## The Problem

Obsidian is an Electron app. There's no headless mode, no CLI-only sync, no daemon option. It **needs** a display to run. On a server with no monitor, it just crashes.

## The Solution

Give it a fake display. The full stack:

```
Xvfb (virtual framebuffer) → Openbox (window manager) → Obsidian
```

- **Xvfb** creates a virtual screen in memory — no physical monitor needed
- **Openbox** is a minimal window manager — Electron apps need one to render properly
- **Obsidian** runs normally, thinking it has a real display

For the initial Sync login, we temporarily add **x11vnc** so you can VNC in and authenticate. After that, VNC gets disabled and Obsidian syncs quietly in the background forever.

## Prerequisites

- A Linux VM (Ubuntu/Debian — tested on Ubuntu 24.04)
- Obsidian `.deb` from [obsidian.md](https://obsidian.md){:target="_blank"}
- An Obsidian Sync subscription

## Step 1: Install Dependencies

```bash
sudo apt update
sudo apt install -y xvfb openbox x11vnc
```

Then install Obsidian:

```bash
# Check https://github.com/obsidianmd/obsidian-releases/releases for latest version
wget https://github.com/obsidianmd/obsidian-releases/releases/download/v1.8.9/obsidian_1.8.9_amd64.deb
sudo dpkg -i obsidian_1.8.9_amd64.deb
sudo apt install -f  # fix any missing deps
```

## Step 2: Create systemd User Services

We'll use four systemd user services so everything starts automatically and restarts on failure. Create these files in `~/.config/systemd/user/`:

### obsidian-xvfb.service

```ini
[Unit]
Description=Xvfb virtual display for Obsidian

[Service]
ExecStart=/usr/bin/Xvfb :5 -screen 0 1280x720x24
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

### obsidian-openbox.service

```ini
[Unit]
Description=Openbox session for Obsidian
After=obsidian-xvfb.service

[Service]
Environment="DISPLAY=:5"
ExecStart=/usr/bin/openbox-session
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

### obsidian.service

```ini
[Unit]
Description=Obsidian (headless)
After=obsidian-openbox.service

[Service]
Environment="DISPLAY=:5"
ExecStart=/usr/bin/obsidian --no-sandbox
Restart=always
RestartSec=10

[Install]
WantedBy=default.target
```

### obsidian-vnc.service

```ini
[Unit]
Description=VNC server for Obsidian (temporary)
After=obsidian-openbox.service

[Service]
ExecStart=/usr/bin/x11vnc -rfbport 5900 -display :5 -rfbauth %h/.vnc/passwd -forever -shared
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

## Step 3: Set Up VNC Password

```bash
mkdir -p ~/.vnc
x11vnc -storepasswd ~/.vnc/passwd
```

## Step 4: Enable Lingering & Start Services

User services need `linger` enabled to survive logouts:

```bash
sudo loginctl enable-linger $USER
```

Now start everything:

```bash
systemctl --user daemon-reload
systemctl --user enable --now obsidian-xvfb obsidian-openbox obsidian obsidian-vnc
```

## Step 5: VNC In & Sign Into Sync

Connect to your server on port 5900 with any VNC client (RealVNC, TigerVNC Viewer, etc.):

```
your-server-ip:5900
```

You'll see Obsidian running in a basic window manager. Sign into your Obsidian account, enable Sync, select your vault, and let it download.

## Step 6: Disable VNC

Once Sync is connected and your vault has downloaded, you don't need VNC anymore:

```bash
systemctl --user stop obsidian-vnc
systemctl --user disable obsidian-vnc
```

Obsidian keeps running and syncing — it doesn't care that nobody's watching.

## Verify It's Working

Check the services:

```bash
systemctl --user status obsidian
```

Check your vault files are syncing:

```bash
ls ~/YourVault/
```

Make a change on another device — it should appear on the server within seconds.

## Why Not Just Use Git?

You could sync a vault with git, but:

- Obsidian Sync handles conflict resolution natively
- Plugin settings, themes, and workspace sync too
- It's real-time, not commit-based
- No merge conflicts on binary attachments

If you're already paying for Sync, this lets you extend it to any Linux machine.

## Resource Usage

Minimal. On my Ubuntu 24.04 VM:

- **Xvfb:** ~15 MB RAM
- **Openbox:** ~5 MB RAM
- **Obsidian:** ~200-300 MB RAM (varies with vault size and plugins)

No GPU needed. No real rendering happening — just enough to keep Electron happy.

## Wrapping Up

This is admittedly a hack — Obsidian wasn't designed to run headless. But it works reliably. My instance has been running for days without intervention, syncing changes in real-time across all my devices including this headless server.

The key insight: Electron apps don't need a *real* display, just a *convincing* one. Xvfb + Openbox is exactly enough to satisfy that requirement with minimal overhead.

If Obsidian ever ships a proper headless sync daemon, this becomes unnecessary. Until then — virtual framebuffers to the rescue.
