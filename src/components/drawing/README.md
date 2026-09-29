# Drawing kit

Gold-ink engineering drawings for the lab pages and posts. Everything is built at compile time in
Astro; the browser only gets SVG, a little CSS and one small script.

| Piece | Path |
| --- | --- |
| Sheet furniture, parts, lettering | `src/components/drawing/*.astro` |
| Figure tier (posts, small ideas) | `src/components/drawing/figure/*.astro` |
| Layout maths (build time only) | `src/lib/drawing/{sheet,projection,figure}.ts` |
| Styles | `src/styles/drawing.css` (via `Sheet`), `src/styles/figure.css` (via `Figure`) |
| Behaviour | `src/scripts/drawing.ts` (bundled once by `Sheet`) |

## Sheets or figures?

- **A sheet** is a whole engineering drawing: an A3 frame with zone markers, views, dimensions,
  a revision table, a title block and a stamp. Use it for a thing worth a page, like the cabinet,
  the server or the stack. It's hand-drawn with the projection helpers, `View`, `Part`, `Dim`
  and friends.
- **A figure** is one idea in a post: a flow, a stack, a before/after, a hand-off or some bars.
  Pass plain data to a primitive and it lays itself out twice, once for the ~680px prose column
  and once for a phone, 360 units wide and reflowed vertically. Figures sit in the text column
  (or break out of it), carry a one-line caption, and can have a FIG title strip.

If a post needs a picture that isn't a flow, stack, comparison, lanes or bars, draw it inside
`<Figure>` by hand (see [Hand-drawn figures](#hand-drawn-figures)) rather than building a new
sheet.

## Figures in an MDX post

```mdx
import FlowFigure from '../../components/drawing/figure/FlowFigure.astro';
import StackFigure from '../../components/drawing/figure/StackFigure.astro';
import CompareFigure from '../../components/drawing/figure/CompareFigure.astro';
import LanesFigure from '../../components/drawing/figure/LanesFigure.astro';
import BarsFigure from '../../components/drawing/figure/BarsFigure.astro';
```

Bigger data can be an `export const pathNodes = […]` in the MDX itself, or a `.ts` file next to
the post that's imported the same way. Types (`FlowNode`, `StackLayer`, …) come from
`src/lib/drawing/figure.ts`.

### Props every primitive takes (`FigureBase`)

| Prop | Type | Default | What it does |
| --- | --- | --- | --- |
| `id` | `string` | required | Unique on the page. Prefixes SVG defs and ids. |
| `title` | `string` | required | Figure title: the SVG's accessible name, and the strip title when `fig` is set. |
| `caption` | `string` | none | One short line under the figure, in voice. |
| `fig` | `number \| string` | none | FIG title strip: `3` → "FIG 3", or a full number such as `"TD-LAB-02 · FIG 3"`. Omit it for no strip. |
| `breakout` | `boolean` | `false` | Lays out 920 wide and breaks into the right margin of the post layout. |
| `hint` | `boolean \| string` | on when any node has a `card` | The "Hover or tap anything numbered." cue beside the caption. |
| `desc` | `string` | generated from the data | The SVG `<desc>`. Write one when the generated sentence isn't good enough. |
| `scale`, `rev`, `date` | `string` | `"NTS"`, `"A"`, none | Strip fields. |
| `bp` | `number` | 0.8 × wide width | Figure width in px below which the narrow layout is used. |

### Nodes (`FigNode`)

```ts
{ id: string; label: string; sub?: string; tone?: Tone; card?: { title: string; kind?: string; lines: string[] }; n?: number | string }
```

- `label`: short, in caps lettering; it wraps to the box.
- `sub`: a smaller second line.
- `card`: makes the node clickable. It gets a numbered balloon (1, 2, 3… in data order,
  unless `n` is set), a name tag on hover and focus, and a card on click, Enter or Space.

### FlowFigure: boxes and arrows

Columns come from the edges (the longest path from the sources), or from a node's `col`. Wide runs
left to right; narrow runs top to bottom. Edge labels should be short (≤ ~8 characters).

```mdx
<FlowFigure id="fig-path" title="The storage path" fig={1}
  caption="Same disks, fewer opinions."
  nodes={[
    { id: 'disks', label: 'Six disks', sub: 'SATA + SAS' },
    { id: 'hba', label: 'HBA330', sub: 'pass-through', tone: 'new',
      card: { title: 'Dell HBA330', kind: 'Controller', lines: ['Hands the disks to Linux as they are.'] } },
    { id: 'perc', label: 'PERC H710P', tone: 'removed', col: 1 },
    { id: 'zfs', label: 'ZFS', sub: 'three pools' },
    { id: 'backup', label: 'Offsite backup', tone: 'planned' },
  ]}
  edges={[
    { from: 'disks', to: 'hba', label: 'SAS', particles: true },
    { from: 'disks', to: 'perc', tone: 'removed' },
    { from: 'hba', to: 'zfs', particles: 2 },
    { from: 'zfs', to: 'backup', tone: 'planned' },
  ]} />
```

- `nodes`: `(FigNode & { col?: number })[]`
- `edges`: `{ from; to; label?; tone?; particles?: boolean | 1–4 }[]`. Particles are dots
  travelling the edge. Planned edges never get them.

### StackFigure: layers, bottom up

`layers[0]` is the bottom. Wide: bands with the name on the left and the tool (what builds the
layer) on the right. Narrow: full-width bands with the name and tool on top and items two to a
row.

```mdx
<StackFigure id="fig-stack" title="The stack" caption="Three layers. The top one is mostly plans."
  layers={[
    { label: 'Bootstrap', sub: 'metal and hypervisor', tool: 'Ansible',
      items: [{ id: 'pve', label: 'Proxmox VE 9.2' }, { id: 'pi', label: 'Raspberry Pi 4', sub: 'control node' }] },
    { label: 'Virtual machines', tool: 'OpenTofu',
      items: [{ id: 'talos', label: 'Talos cluster', sub: '3 VMs' }, { id: 'robomp', label: 'robomp', tone: 'planned' }] },
    { label: 'Kubernetes', tool: 'Flux',
      items: [{ id: 'cilium', label: 'Cilium 1.20' }, { id: 'apps', label: 'Apps', sub: 'not decided', tone: 'planned' }] },
  ]} />
```

- `layers`: `{ label; sub?; tool?; tone?; items: FigNode[] }[]`. A `tone: 'planned'` layer draws
  its band as a phantom.

### CompareFigure: before / after

Two or three rows, each a short left-to-right flow. Nodes line up by position so the rows read
against each other. Narrow turns the rows into side-by-side columns flowing down.

```mdx
<CompareFigure id="fig-swap" title="The swap" caption="Same disks. Fewer layers between them and ZFS."
  stamp={{ text: 'AS BUILT', tone: 'ok' }}
  rows={[
    { label: 'Before', note: 'hardware RAID', nodes: [
      { id: 'd7', label: 'Seven disks' }, { id: 'perc', label: 'PERC H710P', tone: 'removed' }, { id: 'pve8', label: 'Proxmox 8.4' } ] },
    { label: 'After', note: '2026-09-28', nodes: [
      { id: 'd6', label: 'Six disks', tone: 'keep' }, { id: 'hba', label: 'HBA330', tone: 'new' }, { id: 'pve9', label: 'Proxmox 9.2' } ] },
  ]} />
```

- `rows`: `{ label; note?; nodes: FigNode[]; stamp?: string | { text; sub?; tone?: 'warn' | 'ok' | 'wip' } }[]`
- `stamp`: shorthand for a stamp on the last row.

### LanesFigure: who does what, in order

Lanes × steps. Each step takes the next column unless it sets `col` (the same `col` means the
same time). When the lane changes between one step and the next, that's a **hand-off**: a heavier
pale-gold line, a diamond where it crosses into the new lane, and the step's `handoff` text. Wide
lanes are rows; narrow lanes are columns.

```mdx
<LanesFigure id="fig-lanes" title="Me and the agent" caption="Hands on the left, SSH on the right."
  lanes={[{ id: 'me', label: 'Me', sub: 'hands' }, { id: 'agent', label: 'Agent', sub: 'over SSH' }]}
  steps={[
    { id: 's1', lane: 'agent', label: 'Shut down', sub: 'on my go' },
    { id: 's2', lane: 'me', label: 'Swap the card' },
    { id: 's3', lane: 'me', label: 'Install Proxmox' },
    { id: 's4', lane: 'agent', label: 'Build pools', handoff: '“Proxmox is up”' },
  ]} />
```

- `lanes`: `{ id; label; sub?; tone? }[]`
- `steps`: `(FigNode & { lane: string; col?: number; handoff?: string })[]`, in order. Six
  steps is about the most the 680 column holds; use `breakout` for more.

### BarsFigure: to scale

Horizontal bars from zero, with an optional hatched band (a limit or target range). Bars grow in
with the plot. Wide puts the names in a left column; narrow puts each name above its bar.

```mdx
<BarsFigure id="fig-sizes" title="Mirror members, to scale" caption="Two fit, one doesn't."
  unit="GiB" max={300} scale="TO SCALE"
  band={{ from: 238, to: 261.8, label: 'installer +10%' }}
  bars={[
    { id: 'g1', label: 'Gigastone #1', value: 238, display: '≈ 238 GiB' },
    { id: 'g2', label: 'Gigastone #2', value: 238, display: '≈ 238 GiB' },
    { id: 'sas', label: 'ST300MP0004', sub: '15k SAS', value: 279, display: '≈ 279 GiB' },
  ]} />
```

- `bars`: `(FigNode & { value: number; display?: string })[]`. `display` replaces the printed
  value.
- `unit` (appended to values and the axis end), `max` (axis end), `tick` (axis step; default is
  a round step, six at most), `band`: `{ from; to; label? }`.

### Hand-drawn figures

`Figure` is the same frame without a layout engine. Draw in paper units (1 unit = 1px at the
680 column), put wide-only lines in `.fg-w`, narrow-only ones in `.fg-n`, and move shared blocks
with `at()`:

```astro
---
import Figure from '../components/drawing/figure/Figure.astro';
import PartCard from '../components/drawing/PartCard.astro';
import Node from '../components/drawing/figure/Node.astro';
import { at, boxes, rc } from '../lib/drawing/figure';
const [a] = boxes([{ id: 'nas', label: 'UNAS Pro 8', card: { title: 'UNAS Pro 8', lines: ['NFS over 10 GbE.'] } }], 140);
---
<Figure id="fig-x" title="…" desc="…" caption="…" size={[680, 200]} narrow={[360, 320]} interactive hint>
  <g class="fg-w"><path class="ln-med" d="M40 100H300" pathLength="1" /></g>
  <g class="fg-n"><path class="ln-med" d="M180 40V140" pathLength="1" /></g>
  <Node box={a} wp={[300, 70]} np={[110, 140]} />
  <text {...at([40, 90], [190, 60], 'txt-note')}>10 GbE</text>
  <Fragment slot="cards"><PartCard id="nas" title="UNAS Pro 8" lines={['NFS over 10 GbE.']} /></Fragment>
</Figure>
```

`Figure` props: `id`, `title`, `desc` (required here), `caption`, `size: [w, h]`,
`narrow?: [w, h]`, `bp`, `breakout`, `fig`, `hint`, `interactive`, `scale`, `rev`, `date`,
`defs?: ('hatch' | 'hatch-x' | 'rough')[]` (a `Stamp` needs `'rough'`), and `grid` (default
true). Slots: default (SVG) and `cards`.

Helpers in `src/lib/drawing/figure.ts`: `at(wide, narrow?, class?, style?)` (a narrow point may
carry a scale as a third value), `boxes(nodes, w)`, `rc` (rectangle path), `pl` (polyline),
`head(x, y, 'r' | 'l' | 'd' | 'u')` (arrowhead), `wrap`, `wLabel` and `wNote` (lettering widths),
`Pen` (merges paths per class), and the layout functions `flowLayout`, `stackLayout`,
`compareLayout`, `lanesLayout` and `barsLayout`.

## Tones and conventions

| Tone | Looks like | Means |
| --- | --- | --- |
| `default` | gold ink | the drawing's normal ink |
| `new` | green (`.sem-new`) | added, or what the change brings in |
| `removed` | red (`.sem-removed`) | taken out |
| `keep` | neutral ink (`.fg-keep`) | unchanged, carried across; recedes so the change reads |
| `planned` | dashed phantom, muted lettering (`.fg-planned`) | not built yet |

- **Phantom = planned.** Anything not running today is dashed and muted, never solid.
- **Numbered = clickable.** Every clickable part has a numbered balloon, and nothing without a
  number is clickable. Figures number clickable nodes for you; on sheets, give each `Part` a
  `Balloon part={id}`.
- **Cards via templates.** A clickable thing's words live in a `<PartCard>` (a
  `<template data-card={id}>`), never in the SVG. 1–4 short lines: what it is. No telemetry,
  firmware, serials or dates of measurement.
- **Stamps.** `tone: 'warn'` (red, default) is for "PRELIMINARY", `'ok'` (green) for "AS BUILT",
  and `'wip'` (amber) for "IN PROGRESS".
- **Copy** is the owner's voice: short, plain, first person, a little funny, never salesy.
  Captions are one line.

## Clickable parts and cards

- `Part` (sheets) and card nodes (figures) render `g.part[data-part][role=button][tabindex=0]
  [aria-pressed][aria-label]`. The `aria-label` doubles as the hover name tag, so keep it to the
  thing's short name.
- **Hover** (fine pointers) or **keyboard focus** lights the part (`.is-lit`, a gold highlight),
  lights its balloons (`.is-hot`) and shows a `.dwg-tag` with the label. Nothing else reacts to
  hover.
- **Click, Enter or Space** on a part, or a **click on its balloon**, toggles it (one per
  drawing) and dispatches a bubbling `dwg:select` event with detail
  `{ dwg: string, id: string, selected: boolean }` (the drawing id, the part id, on or off).
- If a `<template data-card={id}>` exists (looked up in that drawing first, then the document),
  the page's one card `#dwg-card` (`div.dwg-card[role=dialog]`) opens with the template's
  content and the balloon number. It's a popover beside the part (`data-side` r/l/b/t, with a
  gold leader) on fine pointers and wide screens, and a bottom sheet (`.is-sheet`) on coarse
  pointers or ≤ 640px. Focus moves into it. The close button, Esc, a click outside, or tabbing
  past its ends closes it, deselects the part (`dwg:select` with `selected: false`) and puts
  focus back on the part. Parts with a card get `aria-haspopup="dialog"` and `aria-expanded`.
- `<PartCard id title kind? lines? />` renders the template (`.dwg-card__k` kind line,
  `.dwg-card__t` title, `.dwg-card__l` list, then the default slot). Put it in a Sheet's or
  Figure's `cards` slot, or anywhere on the page (ids must be unique on the page).
- `<Hint />` (or `hint` on Sheet or Figure) is the one quiet cue, "Hover or tap anything
  numbered." It's hidden without JS, since nothing is clickable then.
- Under reduced motion there are no card or tag transitions, the plot is done at once, there are
  no particles, and bars don't grow.

## Sheet API essentials

```astro
<Sheet id="lab03" dwgNo="TD-LAB-03" title="The stack" sheet={[3, 3]} rev="A" date="2026-09-29"
       desc="…one or two sentences…" interactive hint checked="TD"
       revisions={[{ rev: 'A', date: '2026-09-29', desc: 'First issue' }]}
       stamp={{ text: 'IN PROGRESS', tone: 'wip' }}>
  <Fragment slot="toolbar"><ViewTabs dwg="lab03" active="iso" views={[…]} /></Fragment>
  …SVG in paper units: View, Part, Balloon, Dim, Leader, Particles…
  <Fragment slot="cards">…PartCard…</Fragment>
  <Fragment slot="legend"><LineKey items={[…]} /></Fragment>
</Sheet>
```

| Prop | Notes |
| --- | --- |
| `id`, `dwgNo`, `title`, `desc` | required; `id` unique on the page |
| `size` | `'A3'` (default, 1260 × 891), `'A4'`, or `{ w, h }` (frameless; `Figure` uses this) |
| `sheet`, `rev`, `date`, `drawn` (`"TD"`), `checked`, `project`, `scale`, `units` | title block |
| `revisions` | `{ rev, date, desc, by? }[]`, oldest first |
| `stamp` | `"TEXT"` or `{ text, sub?, x?, y?, tone?: 'warn' \| 'ok' \| 'wip' }` |
| `interactive` | set it when there are parts or tabs (the SVG becomes `role="group"`) |
| `hint` | `true` or a string: the cue at the right of the toolbar row |
| `titleBlock` | default `true` |
| `grid`, `panMin`, `defs` | drafting grid, pan threshold, which shared defs to emit |

Slots: default (SVG), `toolbar`, `cards`, `legend`, and `aside` (framed sheets only: HTML in the
right column between the revision table and the title block, such as a schedule; it drops under
the drawing on narrow sheets). Layout (`sheetLayout(size)`): `L.area` for views, `L.column` for
the furniture, `L.aside` for the aside. On figures narrower than 1080px the SVG pans sideways and
the furniture drops underneath.

Other components (props are in each file's header): `View` (a view region, title, scale, tab
panel), `ViewTabs`, `Part`, `Balloon`, `Dim`, `Leader`, `Particles` (≤ 8 per instance, ≤ 12 per
drawing), `Stamp`, `LineKey`, `ScaleBar`, `URuler`, `DrawingDefs`, `Monogram`, `Hint` and
`PartCard`.

### Script contract (`drawing.ts`)

| Hook | Effect |
| --- | --- |
| `figure[data-dwg]` | wired on load; `initDrawings(root)` wires later ones (idempotent) |
| `[data-plot]` | `pending` → `run` (≥ 15% visible) → `done`; `--p:N` orders plot steps (0 frame … 7 stamp) |
| `[role=tab][data-view]` ↔ `[data-view-panel]` | tabs; ←/→/Home/End; the shown panel gets `data-active` and re-plots |
| `[data-part]`, `[data-balloon-for]` | selection, `.is-lit`, `.is-hot`, `.dwg-tag`, cards (above) |
| `dwg:select` | bubbling `CustomEvent<{ dwg, id, selected }>` |
| `.is-idle`, `html.dwg-paused` | particles pause off screen or in a hidden tab |
| `.dwg__view.is-pannable` / `.is-panned` | pan cue when the SVG overflows |

## The lab sheets

| Sheet | Page | Data | Excerpt (for `/lab` or a post) |
| --- | --- | --- | --- |
| TD-LAB-01 · The cabinet | `/lab/rack/` | `src/data/lab/rack.ts` | `rack/CabinetExcerpt.astro`: `id?` (`'lab-cab'`), `caption?`, `href?` |
| TD-LAB-02 · The server | `/lab/r720xd/` | `src/data/lab/server.ts` | `server/ServerExcerpt.astro`: `id?` (`'r720-bays'`), `caption?`, `fig?`, `breakout?` |
| TD-LAB-03 · The stack | `/lab/stack/` | `src/data/lab/stack.ts` | `stack/StackExcerpt.astro`: `id?` (`'sx'`), `caption?`, `href?` |

- Types are in `src/data/lab/types.ts`. Every clickable thing carries its own
  `card: { title, kind?, lines }`, so a sheet and its excerpt say the same thing.
- An excerpt's `id` prefixes its part and card ids, so an excerpt and the full sheet (or two
  excerpts) can share a page.
- `rack/SheetThumb.astro` (`kind: 'cabinet' | 'server' | 'stack' | 'path' | 'lanes'`) is the
  small decorative line drawing on the `/lab` "Drawn to spec" cards (`path` and `lanes` are the
  two posts' cards).
- `post/SheetLink.astro` (`sheet?: 'server' | 'stack'`, default `'server'`) is the card at the
  end of a post that links a sheet. The stack card reads its title, note and thumbnail from
  `labSpec` and `stack.ts`, and states no Rev: Sheet 03 is still going up.

## Budgets

- Per drawing page: HTML ≤ 80 KB raw / 20 KB gzip, CSS ≤ 90 / 24, JS ≤ 64 / 24.
- `drawing.css` ≤ ~24 KB raw and `drawing.ts` ≤ ~14 KB raw. `figure.css` loads only with
  `Figure`.
- Keep particles to ≤ 12 per drawing. Merge same-class paths (`Pen`), and write `pathLength="1"`
  only on solid lines that should be pen-plotted.

## Don'ts

- No provenance clutter: no marks, chips, legends, sources or "where the numbers come from".
- No CAD readouts: no cursor X/Y, no status bar.
- No toggles: no layer panels; every layer is on.
- No notes blocks, "still open" lists, telemetry panels, power/mass sums, firmware versions or
  measured dates.
- Nothing clickable without a number, and no hover effects on things that aren't clickable.
- Nothing private: no IPs, VLANs, hostnames, serials, WWNs, vault names or tokens.
