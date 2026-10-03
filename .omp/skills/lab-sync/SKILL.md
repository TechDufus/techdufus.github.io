---
name: lab-sync
description: "Sync the site's lab section (the three Drawn to spec sheets, /lab, the home lab summary, the site guide's lab answer and the lab changelog) with the private homelab repo in ../homelab. Use when the owner says the homelab changed, asks to sync, refresh or update the lab page or the stack, when a milestone landed (a new VM, platform component, app, drive, pool or cabinet device), or before publishing a lab post."
---

# lab-sync

The homelab repo (`../homelab`, private) is the truth; the site's lab data is a curated, public
picture of it. A sync reads what changed in the homelab since the last sync, edits the typed data
in `src/data/lab/` and the copy in `labSpec`, and lets every drawing and page follow. Read the
homelab; never write to it.

## Scope and invariants

- Paths below are relative to the site repo root; the homelab is `../homelab`. Work from its
  committed `HEAD` only. Untracked or modified files there (`git -C ../homelab status --short`)
  are drafts: don't sync them, and don't `pull` or `fetch` unless the owner asks.
- Only the lab section changes. Don't touch post prose, `src/content/**`, the frozen R720xd archive
  (`src/data/lab/snapshots/`, `src/components/drawing/{r720xd,post}/`, `src/pages/lab/r720xd*`),
  the desk (`labSpec.workstation`) or anything outside the files named here.
- Never publish anything from "Privacy" below. When in doubt, leave it off. This skill, the site
  repo and its commits are public too: never paste a private value into them, not even as an
  example or a regex (the privacy scan reads the private names from the homelab at run time).
- Never invent. If the repo doesn't say it, it isn't on the site. No estimates as facts (a planned
  VM's estimated size stays off until it's built).
- No provenance or citation clutter, no layer toggles, no CAD readouts, no link to the homelab
  repo (it's private; the site says "one git repo, private for now").
- Owner decisions on what stays off the site, whatever the homelab says: external-dns, tenants and
  the apps they bring, whose code the runner builds, and anything about who or what else runs on the cluster.
  The owner doesn't want internals shared: keep cards short and generic, and a commit that is only
  about those is *none*.
- Commit locally when verified; ask the owner before pushing or deploying.

## The lab section: data and who follows it

| Data | What it holds | Follows it automatically |
|---|---|---|
| `src/data/lab/stack.ts` | Sheet 03: three layers → groups → items, each `running` or `planned`, with a `card`. Line 1 is the sync marker. | Sheet 03 (`src/components/drawing/stack/*` via `model.ts`) on `/lab/stack/`; the stack excerpt on `/lab/`; the `/lab/` hero (Talos count and version); the `/lab/stack/` "Layer by layer" list and counts; the home lab stack line and hardware notes (`src/pages/index.astro`); the guide's `homelab` answer (`src/pages/guide.json.ts`); the stack thumb on `/lab/` (`rack/SheetThumb.astro`) |
| `src/data/lab/rack.ts` | Sheet 01: the cabinet, devices (top-down U), shelves, links, the `/lab/` role list | Sheet 01 on `/lab/rack/` and its lazy views `/lab/rack/views/`; the cabinet excerpt and `derived.uUsed` on `/lab/`; the home "Hardware readout" (`devicesByRole`, branded devices only); the cabinet thumb |
| `src/data/lab/server.ts` | Sheet 02: the R730 as built (16 front bays, drives, pools, the PERC H730P Mini in HBA mode, risers, NICs, internal parts) | Sheet 02 on `/lab/r730/` and its lazy views `/lab/r730/views/`; the kit excerpt `r730/R730Excerpt.astro` (not placed on any page; `/lab/` is at its HTML budget); pools, threads, memory, controller and drive count on Sheet 03; the `/lab/` hero; the home readout; the guide; the server thumb |
| `src/data/lab/snapshots/` | The R720xd as built on 2026-09-28, **frozen** (its own `server-…` and `types-…`) | Nothing live: only the post `src/content/blog/from-hardware-raid-to-zfs.mdx` (its figures in `src/components/drawing/post/{fig.ts,BayMap,Pools,TwoCables,SheetLink}.astro`, the MDX's own `import { server }`, the post's `path` thumb) and the archive `/lab/r720xd/` (+ `/lab/r720xd/views/`, `src/components/drawing/r720xd/`). Never edit it |
| `src/data/lab/types.ts` | Unions and shapes (`DeviceId`, `DriveId`, `PoolId`, `CardLines`, `Status`) | type-checks all of the above |
| `labSpec` in `src/data/site.ts` | `lastRevised`/`lastRevisedIso`, `status`, `lede`, `drawings` (sheet cards, notes, `state`), `changelog` | `/lab/` (hero badge, Drawn to spec, changelog); home lab section (`labSpec.changelog[0]`, status); guide (`lastRevised`, status); `/docs/` and `/docs/setup/` ("Revised …") |

Hand-written copy that does **not** follow the data. Re-read it after every sync and fix what's
no longer true:

- `src/pages/index.astro`: the lab `SectionHead` lede ("One server, three Talos nodes, all of it
  in git. Mid-rebuild.") and "· the rest is next".
- `src/pages/guide.json.ts`: the `homelab` answer's sentences (Cilium, Flux, Ansible, the Pi,
  UDM Pro, UNAS).
- `src/pages/lab.astro`: the stack section lede ("The top floor is still going up."), the page
  `description`.
- `src/pages/lab/stack.astro`: hero lede and page `description`.
- `src/pages/lab/r730.astro`: the page `description`.
- `labSpec.lede`, `labSpec.drawings.lede`, `labSpec.drawings.sheets[].note` and `.state`.
- The sheet `desc` props (the SVG's text description): Sheet 01 in
  `src/components/drawing/rack/CabinetSheet.astro` (lists every device and U), Sheet 02 in
  `src/pages/lab/r730.astro` (its drive and pool counts), Sheet 03 in
  `src/components/drawing/stack/StackSheet.astro` (the Talos node and standalone VM counts, "an
  apps storey of running apps").
- `server.ts` cards that mention the stack: `memory.card` ("three Talos nodes at 24 GiB each"),
  the `fast` drives' cards ("the Talos nodes included").
- The `stack.ts` header comment ("`status` is as of YYYY-MM-DD").

## Source map: which homelab file answers which site field

| Homelab (committed) | Site field |
|---|---|
| `infra/tofu/talos.tf` `locals` (`talos_version`, `kubernetes_version`, `nodes`) and `proxmox_virtual_environment_vm.talos` (`cpu.cores`, `memory.dedicated` MiB ÷ 1024, `disk.size` GB, `datastore_id` → pool) | `talos-nodes`: `version`, `count`, `vm`, the card's size and "Talos X.Y, running Kubernetes X.Y" line |
| `talos/schematic.yaml` | the Talos card's Image Factory line (extension names only) |
| other `infra/tofu/*.tf` VM resources (general-purpose VMs are open work in `docs/architecture.md` "Not built") | `standalone` group items (`ci-runner`, `robomp` and any later VM): status, size |
| `kubernetes/flux/platform.yaml` (one Flux `Kustomization` per component) + `kubernetes/platform/<x>/` (HelmRelease/OCIRepository/manifests) | `platform` items: running, `version` |
| `kubernetes/flux/*.yaml` Kustomizations with `path: ./kubernetes/apps/<app>` + `kubernetes/apps/<app>/` | the `apps` group |
| `hosts/proxmox/playbook.yml` task names | the `host-config` card (snapshots, SMART, ZFS events, ntfy, node exporter) and any new plant-room item in the `host` group |
| the Pi's playbook (`hosts/*/playbook.yml`, the folder named after the Pi) | the `rpi` item: "the control node", configured by Ansible. Nothing more about what the Pi runs |
| `inventory/hardware/*.yml` | `server.ts`: drives (maker, model, size, bay, pool), pools (layout, bays), controller name. Never serials, WWNs, device paths, PCI addresses, firmware or host names |
| `docs/architecture.md`, "the system as built": Hardware, Proxmox host, Cluster (its versions table and component list), rpi-control | what runs (cross-check with the wiring above) and the versions |
| `docs/architecture.md` "Not built" (open work, one GitHub issue each) | the planned items |
| `docs/adr/*.md` (indexed in `docs/adr/README.md`) | why something is in or out; an ADR that replaces a choice makes the old item gone |
| `PLAN.md`: retired in homelab `da1179d` (2026-09-29). For commits before that, read it with `git -C ../homelab show <commit>:PLAN.md` (§2 decisions, §4.x "Built YYYY-MM-DD" markers, §6 phases) | the same answers, for older history |
| `Taskfile.yaml` verbs | how a layer is built (the layer `tool` strings: `Ansible`, `OpenTofu`, `Helm, then Flux`) |
| `mise.toml` | cross-check only: `talosctl`/`kubectl` should match the tofu `talos_version`/`kubernetes_version`. The site prints no CLI versions |
| `git -C ../homelab log` | changelog dates and what changed |
| `docs/architecture.md` Proxmox host ("Proxmox VE 9.2"), the inventory header | `proxmox.version` |

One site item per thing a reader would recognise. A Kustomization that only supports another one
folds into that item's card; a new capability that isn't part of an existing item gets its own.
Today's folds:

| Site item | Homelab pieces |
|---|---|
| `flux` | `flux-operator`, `flux-instance.yaml` |
| `external-secrets` | `external-secrets`, `onepassword-connect`, `secret-store` |
| `metrics-server` | `metrics-server` (incl. the kubelet serving-cert approver) |
| `cilium` | `cilium`, `gateway-api-crds`, `gateway` (Cilium's Gateway API serves it) |
| `cert-manager` | `cert-manager`, `cert-manager-issuers` |

If a new piece doesn't fit this table and the right call isn't obvious, ask the owner once, then
add the answer here.

## Status rules

- **running**: in the committed repo *and* wired (a tofu resource, a Flux Kustomization whose path
  holds a HelmRelease or manifests, or a playbook task) *and* `docs/architecture.md` describes it
  as built (before `da1179d`: a PLAN "Built" marker). Wired but not described as built: leave it
  `planned` and mention it in the report.
- **planned**: listed under "Not built" in `docs/architecture.md` (before `da1179d`: only in
  PLAN's target architecture), not wired yet.
- **gone**: removed from the repo, replaced by an ADR, or in neither the as-built sections nor
  "Not built": delete the item, don't keep it dashed. If it's something the owner chose to show
  (robomp, say), ask before deleting it.
- **Never invent.** If the repo doesn't say, leave it off. When the docs, the ADRs and the wiring
  disagree, leave the item off and ask.
- **Known problems** (a failing disk, a flaky NIC) aren't published: no health or telemetry on the
  site. A disk that actually gets replaced is a hardware change.
- **Versions are major.minor** of the app itself: an image tag (`metrics-server:v0.9.0` → `0.9`),
  a chart that versions with its app (`cilium` 1.20.2 → `1.20`, cert-manager `v1.21.2` →
  `1.21`), or an explicit comment (`0.5.10 # app v0.20.0` → `0.20`). A chart version that isn't
  the app's: leave `version` off. Keep each existing item's choice (Flux, External Secrets and
  Proxmox CSI carry no version); planned items never carry one. A running item's version also goes
  in its card title (`Cilium 1.20`).

## Sync procedure

1. **Read the marker.** Line 1 of `src/data/lab/stack.ts`:
   `// Synced from homelab @ <short hash> (<YYYY-MM-DD>)`.
2. **List the delta.**

   ```sh
   git -C ../homelab log --reverse --date=short --format='%h %ad %s' <marker>..HEAD
   git -C ../homelab log --stat --format='--- %h %s' <marker>..HEAD
   git -C ../homelab diff <marker>..HEAD -- docs/architecture.md docs/adr kubernetes/flux infra/tofu hosts inventory talos mise.toml Taskfile.yaml
   ```

   Nothing listed: the site is current; stop. `kubernetes/platform/` and `kubernetes/apps/` are
   left out of the diff on purpose (vendored CRDs run to thousands of lines): take the new or
   changed files there from the `--stat` list and read them at `HEAD`.
3. **Classify each commit** as one of:
   - *stack*: a component, app or VM appeared, went running, changed major.minor, or went away;
   - *hardware*: a drive, bay, pool, controller or cabinet device changed;
   - *milestone*: `docs/architecture.md` gained something as built, or a "Not built" line went
     away because it's done (before `da1179d`: PLAN gained a "Built YYYY-MM-DD" marker);
   - *none*: fixes, config tweaks, doc rewording, skills, scripts, secrets plumbing, DNS records,
     network addressing, anything private. Most commits are *none*. If every commit is *none*, only move
     the marker (step 9) and commit it as `chore(lab): homelab <short hash>, nothing to sync`.
4. **Check each candidate** against the source map and the status rules, reading the file at
   `HEAD` (not the diff alone). Write down the site change and the commit that justifies it.
5. **Edit the data** with the recipes below. Hardware change to drives, pools or bays: edit the
   live `server.ts`; never the frozen snapshots ("The frozen R720xd archive").
6. **Re-read the hand-written copy** listed above and fix what's no longer true.
7. **Revisions and changelog**: bump a sheet's REV if its drawing changed materially; add a
   changelog entry per milestone; bump `lastRevised` if the month changed.
8. **Privacy scan** the diff, then **verify** (both below).
9. **Update the marker** to the homelab commit the data now reflects, dated with that commit's
   date (`git -C ../homelab log -1 --date=short --format='%h %ad' <hash>`). Usually `HEAD`; if you
   deliberately left a later commit out (unbuilt, awaiting the owner), use the last commit you
   fully reflect and say so in the report.
10. **Finish** (below).

## Editing the data

### Cards (every clickable thing)

`card: { title, kind?, lines }` with 1–4 short lines. `lines` is the `CardLines` tuple in
`types.ts`, so a fifth line fails `npm run check`. What it is, in the owner's voice; no
telemetry, dates of measurement, firmware or serials. For planned things the drawing appends
" · planned" to `kind` itself (`kindOf` in `stack/model.ts`): don't write it.

### Flip or add a platform item (`stack.ts`, layer `kubernetes`, group `platform`)

```ts
// planned → running: set status, add the version (and put it in the title)
{
  id: 'cert-manager',
  name: 'cert-manager',
  what: 'Certificates',
  status: 'running',
  version: '1.21',
  card: { title: 'cert-manager 1.21', kind: 'Certificates', lines: ['Issues and renews certificates.'] }
},
```

- New item: add it where it reads naturally; ids are kebab-case and unique across the whole
  stack (no load-time check; they become part and card ids, and must not start with `c-`, which
  the cluster plan uses). Balloon numbers are derived (layer order, running before planned inside
  each group, an empty group's card in that group's place), so every number after it shifts:
  expected. Never hard-code a number.
- `name` is the fixture lettering: it must fit two lines of 14 characters, or the drawing falls
  back to `card.title` (the observability item's long name draws as "Observability"). In the
  `/lab/` excerpt a `name` over 22 characters is replaced by the title too.
- `what` is one short phrase; it's the line on `/lab/stack/` and, for `udm-pro`, `unas` and
  `rpi`, the home readout's notes.
- Gone: delete the item. Don't delete `cilium` or `proxmox-csi`: the drawings draw them by id
  (see gotchas).

### Add an app (group `apps`)

```ts
// an item of the `apps` group; `version` is the app's own major.minor
{
  id: 'gatus',
  name: 'Gatus',
  what: 'Status page and uptime checks',
  status: 'running',
  version: '5.37',
  card: { title: 'Gatus 5.37', kind: 'Status page', lines: ['Checks that everything answers.'] }
},
```

- The group already holds four apps (Headlamp, Homepage, Gatus, Zot). They draw as one row of
  fixtures on Sheet 03's top storey; a fifth starts a second row, which is too many (see the
  limits below).
- The group's `card` ("Nothing decided yet…") only exists while the group is empty. The check at
  the bottom of `stack.ts` throws if an empty group has no card, so put it back if the last app
  ever goes.
- Keep Sheet 03's `desc` ("an apps storey of running apps") and the `/lab/` excerpt in step.

### Add or flip a standalone VM (group `standalone`, e.g. `robomp`)

```ts
{
  id: 'robomp',
  name: 'robomp',
  what: 'The oh-my-pi GitHub bot',
  status: 'running',
  vm: { vcpu: 4, ramGiB: 8, diskGB: 100, pool: 'fast' }, // illustrative: copy the built tofu resource
  card: { title: 'robomp', kind: 'Standalone VM', lines: ['The oh-my-pi GitHub bot, in its own VM.', '4 vCPU, 8 GiB RAM, 100 GB on fast.'] }
}
```

Running needs its tofu resource and `docs/architecture.md` describing it; sizes come from the
resource, never an estimate. The pavilion letters the name over lines of 9 characters and `what`
over lines of 12: keep both short (`ci-runner` is the running example, `robomp` the planned
one). It draws as a pavilion beside the cluster on the VM floor; see the capacity limit below.

### Change the Talos node count or size (`talos-nodes`)

Set `count` and `vm` from `infra/tofu/talos.tf` (`nodes` map size; `cores`;
`memory.dedicated / 1024`; `disk.size`; the datastore's pool), and `version` from
`talos_version`. Then update the card title (`Talos nodes ×3`) and its first two lines, the
home lede in `src/pages/index.astro`, Sheet 03's `desc`, and `server.ts` `memory.card`. The
section, plan, dimensions, hero, guide and excerpt follow. Check the limits below first.

### Hardware (`server.ts`, `rack.ts`, `types.ts`)

`server.ts` is the R730 as built. Never edit `src/data/lab/snapshots/` (the frozen R720xd, see
"The frozen R720xd archive"). The chassis geometry (`dims`, `panels`, `internal`) comes from Dell's
manuals and is never guessed; `internal` lists only parts the manuals state, in order, with no
coordinates.

- **Drives**: add the id to `DriveId` in `types.ts`; add a `drives` entry (`bay` 0–15: the R730
  has front bays only and no rear ones; card `kind` like `Bay 5 · SATA SSD`). `pool` is the pool
  it belongs to and is omitted for a spare in no pool; `role: 'spare'` marks a spare: with a
  `pool` it is that pool's hot spare (the `fast` spare in bay 0), without one it just sits in the
  server (the two wiped spares in bays 8 and 9; card `kind` ends in ` · spare`). Bays are derived
  (`bays.front` is 16; the empty ones draw as empty carriers). `server.ts` throws at load when a
  drive is outside 0–15 or two share a bay, when a drive has neither a `pool` nor `role: 'spare'`,
  when a pool's `bays` aren't its data drives' bays in order or its `spares` aren't its hot
  spares' bays, and when the front panel's bay zones in `rack.ts` don't add up to 16 carriers.
  Update the pool's `usableGiB` and card from the inventory and the pools table in
  `docs/architecture.md`.
- **Pools**: a new pool needs the id in `PoolId`, a `.pool-<id>` colour in
  `src/styles/drawing.css`, the `LineKey` union in `src/components/drawing/LineKey.astro`, and the
  legend in `src/pages/lab/r730.astro`. The stack's footings size themselves from `usableGiB`.
  (`POOL_CLASS` in `post/fig.ts` belongs to the frozen post: leave it.)
- **Controller, CPUs, memory, NICs**: edit the matching block. The controller is the PERC H730P
  Mini in HBA mode (`controller.mode`); there is no `before`, `removed`, `swapDate` or cable
  data any more: the R720xd's swap lives only in the frozen snapshot and in Sheet 02's history tab.
- **Cabinet devices** (`rack.ts`): add the id to `DeviceId`; add the device to `devices` in
  top-to-bottom order. Rails count from the top: `at(8, 9)` is U8–9, `at(10)` is U10, and
  `top ≤ bottom`. Load-time checks in `rack.ts` throw on: a duplicate id; a racked device whose
  `card.kind` doesn't end with its U label (`'NAS · U8–9'`, en dash); overlapping U ranges; a
  non-shelf device missing from `listed` (the `/lab/` role groups). Shelf items use
  `{ kind: 'shelf', shelf, x }` (mm from the shelf's left edge; nothing checks overlaps). Give
  `maker` only to branded gear: the home readout lists devices with a `maker`. `links` are
  documented links only.

## The frozen R720xd archive

`from-hardware-raid-to-zfs.mdx` shows the R720xd "as built 2026-09-28", and the archived
`/lab/r720xd/` sheet draws it. The R720xd left the lab on 2026-10-02, so both are frozen: they
read only `src/data/lab/snapshots/{server,types}-2026-09-28.ts`, a literal copy of the old
`server.ts` and its types (with its own copy of the panels, reading nothing live). **They must
never change.** That covers the snapshots, `src/components/drawing/r720xd/*`,
`src/components/drawing/post/*`, `src/pages/lab/r720xd*` and the post (prose, figures and FIG
strips). The archive sheet is stamped `SUPERSEDED` ("2026-10-02 · BY THE R730"), stays REV B, is
off the `/lab/` sheet index, and is reachable from the post, the changelog's 2026-09-28 entry and
a link on Sheet 02.

Live data (`server.ts`, `types.ts`, `rack.ts`) can't reach it, but shared code can (`rack/`,
`drawing.css`, the kit components). After touching any of that, prove the post is unchanged:

1. Before: `npm run build`, then `cp dist/blog/from-hardware-raid-to-zfs/index.html /tmp/post-before.html`.
2. After: `npm run build` again and
   `cmp /tmp/post-before.html dist/blog/from-hardware-raid-to-zfs/index.html`: no output means
   identical.

## Drawing limits and gotchas

**Sheet 03** (`src/components/drawing/stack/`):

- Layer 1 is drawn by hand from fixed ids: `r730`, `zfs`, `proxmox`, `rpi`, `udm-pro`, `unas`
  (`SectionView.astro`). Renaming one breaks the build (`thing()` throws); a new item in the
  `metal`, `control` or `network` groups gets a number and a card but no drawing. Only the
  `host` group grows: each item other than `proxmox` is a 112-wide plant room at the right of the
  Proxmox storey (two-line names of 11 characters).
- `ClusterView.astro` and `StackSheet.astro` also draw `proxmox`, `cilium`, `zfs` and
  `proxmox-csi` by id, and the group ids `cluster`, `standalone`, `platform`, `apps` are fixed.
  The cluster group's first item is the Talos item and must have `count` and `vm`.
- **The VM floor** runs from x 268 to 932: the tower takes `count × 136`, then each standalone VM
  is a 112-wide pavilion with an 8 gap (`PW`, `PG` in `SectionView.astro`). With 3 nodes it holds
  **two** standalone VMs (the GitHub runner and robomp today); a third throws "too many
  standalone VMs for the VM floor". 2 nodes → 3 VMs, 4 nodes → none.
- **The cluster plan** fits **3 nodes** (200-wide rooms, 50 apart, inside an 800-wide host). A
  fourth overflows the host outline: redraw `ClusterView.astro` first. VM disks are drawn to
  scale on `fast`; above about 110 GB per disk they crowd out the CSI volumes drawn between
  disks 1 and 2.
- **The platform and apps grids** are 4 columns (`COLS = 4`), 50 units per row, growing upward.
  The roof sits at y = 276 − 50 × platform rows while the apps slot is empty, or 300 − 50 ×
  (platform rows + app rows) once there's an app. Keep the roof's y at 75 or more (the view
  starts at y 40 and the width dimension sits 22 above the roof): today 11 platform fixtures fill
  3 rows (one free slot, so a 12th still fits) and the 4 apps fill one row, which puts the roof at
  100: **one more row of either kind (a 13th platform item or a 5th app) is too many**. Nothing
  throws when it overflows: look at the sheet, and redraw `SectionView.astro` (more columns, or a
  lower VM floor) before adding it.
- Particles: ≤ 8 per instance, ≤ 12 per drawing (README). The section uses 8 and the plan 5.

**Sheet 01** (`src/components/drawing/rack/`):

- `model.ts` draws faces by id: `frontPanel`/`rearPanel` switch on the device id; the default
  branch assumes a UDM/UNAS-style body with separate rack brackets. The R730 is special-cased:
  `slotOf` stands its ears and drive carriers (the `plate`) 18 mm proud of the rack flange with
  the body behind and a 320 mm slide for the exploded views; `frontPanel` draws it from its
  front `zones` (the `kind: 'bay'` zones draw as carrier cells, and `server.ts` throws unless
  they add up to 16); `FRONT_TO_BACK` lists `unas-pro-8` and `r730`, the only devices with
  airflow drawn. The R730 sits at U13–14, where the R720xd was; the R720xd is a powered-off
  spare off the cabinet, so it isn't drawn. Balloons follow the `/lab/` list order, then shelves.
- `SheetThumb.astro` draws the cabinet thumb from a fixed id list (it draws `r730` from its
  front zones, and the server thumb too); `FrontView`, `RearView`, `SideView`, `IsoView`,
  `IsoStack` and `CabinetExcerpt` use ids like `poe-injector`, `patch-cables`, `spare-drive`,
  `r730`. A new device usually needs a look at each.
- The OFF SHEET box holds one device (the U7 Pro) and its note is hard-coded ("CEILING OR WALL ·
  POE"); a second `elsewhere` device draws on top of it.
- Front, side and rear views are lazy: built into `/lab/rack/views/` and fetched after load, so
  their cards must stay in `CabinetSheet.astro`'s `cards` slot (they do: one per device).

**Sheet 02 · the R730** (`src/components/drawing/r730/`, data `server.ts`; page
`src/pages/lab/r730.astro`, lazy views `src/pages/lab/r730/views.astro`):

- `geom.ts` holds the geometry (built from `server.dims` and `server.panels`), the balloon order
  (`NUM`) and the `STAMP`; `page.ts` loads the lazy views; `R730Defs.astro`, `R730Cards.astro`
  (the cards: they must stay on the page so the lazy views' parts are clickable) and `Key.astro`
  (the legend) are page furniture.
- Tabs: Orthographic, Exploded and "R720xd → R730" (`HistoryView.astro`, the swap). The views are
  `BayStrip`, `OrthoViews`, `PlanView`, `ExplodedView` and `HistoryView`; `Bit.astro` is the
  shared bit lettering. Read the page before adding a drive or a pool: nothing checks that the
  drawn bays and pools tree still fit.
- `R730Excerpt.astro` is a kit excerpt (`id?` `'r730-bays'`, `caption?`, `fig?`, `breakout?`),
  not placed on any page: `/lab/` has no room left in its HTML budget.
- The page links to the archived R720xd sheet; keep that link.

**Sheet 02 (archived R720xd, frozen)** (`src/components/drawing/r720xd/`, reads only `src/data/lab/snapshots/`):

- `geom.ts` assumes exactly one rear drive, in bay 24 (`rearDrive`); bay 25 is the removed
  drive's bay in the before view. A drive in bay 25, or none in 24, needs `geom.ts`,
  `OrthoViews`, `PlanView`, `ExplodedView` and `BeforeAfter` work.
- Detail B shows bays 0–7 only; the pools tree is laid out for three pools. Balloon order is
  `NUM` in `geom.ts`. `driveShort` letters Crucial drives "MX500", others "MAKER SIZE".
- Exploded and Before / After are lazy (`/lab/r720xd/views/`); their cards come from
  `ServerCards.astro` on the page.

**Budgets** (`npm run check:perf`, after a build): drawing pages (`/lab/`, `/lab/rack/`,
`/lab/r730/`, `/lab/r720xd/`, `/lab/stack/`, the R720xd post) HTML ≤ 80 KB raw / 20 KB gzip; lazy
partials (`/lab/rack/views/`, `/lab/r730/views/`, `/lab/r720xd/views/`) ≤ 96 / 18; every page CSS
≤ 90 / 24, JS ≤ 64 / 24. More fixtures and apps grow `/lab/stack/` and `/lab/`.

## Revisions and stamps

| Sheet | Revision table, REV, date | Stamp |
|---|---|---|
| 01 · The cabinet | `src/components/drawing/rack/CabinetSheet.astro` (`rev`, `date`, `revisions`) | same file: `AS BUILT`, tone `ok` |
| 02 · The server | `src/pages/lab/r730.astro` (`rev`, `date`, `revisions`: A and B are the R720xd's history, C is "Redrawn for the R730") | `STAMP` in `src/components/drawing/r730/geom.ts`: `AS BUILT`, sub "R730 · 2026-10-02", tone `ok` |
| 02 · The server (R720xd archive, frozen) | `src/pages/lab/r720xd.astro` (stays REV B) | `STAMP` in `src/components/drawing/r720xd/geom.ts`: `SUPERSEDED`, sub "2026-10-02 · BY THE R730", tone `warn` |
| 03 · The stack | `src/components/drawing/stack/StackSheet.astro` (`rev`, `date`, `revisions`) | same file: `IN PROGRESS`, tone `wip` |

- Material drawing change (something drawn appears, disappears, moves, changes size or count, or
  goes dashed ↔ solid) → a new REV: next letter, the sync date, a short description ("Headlamp,
  cert-manager"), appended to `revisions` (oldest first), with `rev` and `date` set to match. Card
  wording alone isn't a revision.
- Fold the change into the latest REV (no new letter) only when that REV is dated today and isn't
  published yet: `git cat-file -e origin/main:<sheet file>` fails, or `git show
  origin/main:<sheet file>` doesn't carry that REV. Otherwise add a letter.
- Sheet 03 stays `IN PROGRESS` (and `labSpec.drawings.sheets[2].state` stays `'In progress'`)
  until nothing in `stack.ts` is planned; then it becomes `AS BUILT` / `'As built'` with its own
  REV.
- Post figures carry their own FIG strips: leave them.

## Changelog and copy

- One `labSpec.changelog` entry per milestone, **newest first** (index 0 is "latest" on `/lab/`
  and the home page shows it):
  `{ date: 'YYYY-MM-DD', title, href?, note?, cta? }`. The date is the milestone's: the date of
  the homelab commit that built it (for older history, PLAN's "Built" date). `href` is a post, or
  the sheet that shows it (`/lab/stack/`); `cta` is the link text and defaults to "Read the post",
  so set it for sheets ("See the stack"). Titles: "A → B" for a swap, or "X, Y" (the part after
  the last ", " is highlighted on `/lab/`).
- Not every sync is a milestone. Version bumps and fixes get no entry.
- `lastRevised` / `lastRevisedIso` are month-grained (`'Oct 2026'`, `'2026-10'`) and are literal
  types in `labSpec`'s type annotation: change the annotation and the value together.
- Notes and card lines are the owner's voice: short, plain, first person, a little funny, never
  salesy. Quote every new line in the report.

## Privacy

Never publish: IP addresses, subnets, VLAN IDs, VIPs, VMIDs, MACs, hostnames and DNS names
(including anything under the home domain), serial numbers and WWNs, device paths, bucket names,
1Password vault, item or account names and `op://` refs, tokens and other credentials, SSH keys,
firmware versions, security design (how secrets flow and who holds them, agent autonomy levels,
state encryption), the homelab repo's URL, and anything about location. Fine: product models,
counts, sizes, pool names, tool names and major.minor versions.

Off the site by owner decision, even though they aren't private values: external-dns, tenants and
their apps, and whose code the runner builds. Known problems (a disk with errors, a boot alarm) aren't
published either.

Scan the diff before committing (from the site root; exits 1 on hits, review each one):

```sh
python3 - <<'PY'
import os, pathlib, re, subprocess, sys
hl = pathlib.Path(os.environ.get('HOMELAB', '../homelab'))
run = lambda *a: subprocess.run(a, capture_output=True, text=True, check=True).stdout
added, f = [], '?'
for l in run('git', 'diff', 'HEAD', '-U0', '--no-color', '--', 'src', 'public').splitlines():
    if l.startswith('+++ '): f = l[6:]
    elif l.startswith('+'): added.append((f, l[1:]))
for u in run('git', 'ls-files', '--others', '--exclude-standard', '--', 'src', 'public').split():
    added += [(u, l) for l in pathlib.Path(u).read_text(errors='ignore').splitlines()]
# Private names and values, read from the homelab at scan time (so this file names none of them).
read = lambda *globs: '\n'.join(p.read_text(errors='ignore') for g in globs for p in hl.glob(g) if p.is_file())
inv, every = read('inventory/**/*.yml', 'infra/tofu/*.tf', 'hosts/*/*.yml'), read('**/*.env', '**/*.tf', 'scripts/*', 'hosts/**/*')
ids = set(re.findall(r'(?:serial|by_id|by_path|pci|firmware|option_rom|host|mac|ip)\s*[:=]\s*"?([^\s"#,}]{6,})', inv))
ids |= set(re.findall(r'^\s+([\w-]+):\s*\n\s+ansible_host:', inv, re.M))            # inventory host names
ids |= set(re.findall(r'^\s*([\w-]+)\s*=\s*\{\s*vmid', inv, re.M))                   # VM names
ids |= set(re.findall(r'\bbucket\s*[=:]?\s*"?([a-z0-9][\w.-]{5,})', every))          # buckets
names = {n for n in ids if re.search(r'[\d_:.-]', n) and not re.match(r'(?:each|local|var)\.', n)}
refs = re.findall(r'op://([^/\s\'"`]+)/([^/\n\'"`]+)/', every)                      # 1Password vaults and items
vaults = {v for v, _ in refs} | {v for vs in re.findall(r'ALLOWED_VAULTS=\(([^)]*)\)', every) for v in vs.split()}
vaults -= {'Vault', '*'}
docs = read('*.md', 'docs/**/*.md', '.omp/**/*.md', 'kubernetes/**/*.yaml')
names |= vaults | {i for _, i in refs} | set(re.findall(r'(?:service account|token|server)\s+`([^`]+)`', docs))
for v in vaults: names |= {i.strip() for i in re.findall(re.escape(v) + r'/([^/`\'"\n|)]{3,}?)(?=[`\'"\n|)])', docs)}
names = {n for n in names if len(n) >= 3 and re.search(r'[A-Za-z0-9]', n) and not re.search(r'[<>…]|^(?:Vault|Item)$', n)}
domains = {h.split('.', 1)[1] for h in names if re.fullmatch(r'[a-z][\w-]*(?:\.[\w-]+){2,}', h)}
private = [re.compile(r'(?<![\w-])' + re.escape(n) + r'(?![\w-])') for n in names]
private += [re.compile(r'\b(?:[\w-]+\.)*' + re.escape(d) + r'\b', re.I) for d in domains]
rules = {
    'IP/subnet': r'\b(?:\d{1,3}\.){3}\d{1,3}(?:/\d{1,2})?\b',
    'MAC': r'\b(?:[0-9a-f]{2}:){5}[0-9a-f]{2}\b',
    'WWN/hex id': r'\b0x[0-9a-f]{8,}\b|\bwwn-',
    'VLAN': r'\bvlan\s*\d+',
    'VMID': r'\bvm_?id\b|\bvm\s*\d{3,4}\b',
    '1Password': r'op://|\bvault\b|service account|connect server',
    'security design': r'\bautonomy\b|\bL[0-3]\b|state encryption|passphrase|\bR2\b|deploy key|\btoken\b|\bcredential',
    'bucket': r'\bbucket\b',
    'firmware': r'\bfirmware\b|\bBIOS\b',
    'private repo': r'github\.com/[\w-]+/homelab\b|/homelab\.git\b',
}
hits = [(w, n, l) for w, l in added for n, rx in rules.items() if re.search(rx, l, re.I)]
hits += [(w, 'homelab name', l) for w, l in added if any(p.search(l) for p in private)]
for w, n, l in hits:
    print(f'{n:16} {w:40} {l.strip()[:110]}')
print(f'{len(hits)} hit(s) in {len(added)} added line(s), {len(names)} private names checked' + ('' if hits else ': clean'))
sys.exit(1 if hits else 0)
PY
```

Known harmless words already on the site: "The firmware says R720" (the machine's name, not a
version). Anything else that hits: rewrite it or leave it off.

## Verify

```sh
export PATH="$HOME/.nvm/versions/node/v24.21.0/bin:$PATH"
npm run check        # types: card line counts, unions, the literal lastRevised
npm run build        # also runs the load-time checks in rack.ts, server.ts, stack.ts and the drawings
npm run check:perf   # budgets, after the build
npm run check:images
```

Then serve the build (`npx astro preview --host 127.0.0.1 --port <free port>`) and open `/`,
`/lab/`, `/lab/stack/`, `/lab/rack/` and `/lab/r730/` at 1440 and 390 wide:

- Every changed part is there, solid or dashed as intended, with the right balloon.
- Click (and Enter on) a numbered part on each sheet and on the `/lab/` excerpts: the card
  opens with the new lines; Esc closes it.
- On `/lab/rack/` and `/lab/r730/`, open the lazy tabs (Front, Side, Rear; Exploded,
  R720xd → R730).
- Zero console errors; at 390 the page doesn't scroll sideways
  (`document.documentElement.scrollWidth <= innerWidth`; the sheets pan inside their frame, that's
  fine). The home stack line wraps without overflow as it grows (a hyphenated name such as
  cert-manager may break at its hyphen at 390; that's the browser, not a bug).
- Take screenshots with `prefers-reduced-motion: reduce` emulated: otherwise the sheets and
  excerpts plot in as they scroll into view, and an early shot shows an empty frame.
- The post and the archive (`/lab/r720xd/`, its views): unchanged (the freeze check), whenever
  shared drawing code, `rack.ts` or the styles changed.

Stop the preview server when done.

## Finish

1. Commit locally, one conventional commit:
   `feat(lab): sync with homelab <short hash>` (body: the items changed). Stage only the lab files
   you edited.
2. Don't push or deploy. Ask the owner.
3. Report: each site change with the homelab commit or file behind it; every new line of copy,
   quoted; what you left off and why (private, not built, ambiguous); the new marker; the checks
   you ran and what you looked at.

## Don'ts

- No provenance, sources, citations, "last measured" dates or "still open" lists on the drawings.
- No layer toggles, cursor readouts or status bars.
- Don't edit post prose or anything the frozen R720xd archive reads, and don't let a shared change
  silently rewrite the post.
- Don't put external-dns, tenants or tenant apps on the lab pages, in lab data, drawings or the guide.
- Don't link or quote the homelab repo on any rendered page: no URL, path or hash. The only
  traces are the source-comment marker in `stack.ts` and the commit subject, both a short hash.
- Don't write to `../homelab`.
