/**
 * Sheet 01 · The cabinet. Everything in (and near) the 42U cabinet, from vendor documents,
 * the owner's notes and read-only measurements taken 2026-09-25 to 2026-09-28.
 *
 * Research notes, conflicts and the reasoning behind every assumed value live in the
 * hardware dossier that accompanied this file; the short version is in each fact's `note`.
 * Nothing here names an address, hostname, VLAN, serial number or management firmware version.
 */
import type { Cabinet, Device, Fact, Link, Source } from './types';

export const sources = {
  'dell-r720-tg': {
    title: 'Dell PowerEdge R720 and R720xd Technical Guide',
    publisher: 'Dell',
    href: 'https://dl.dell.com/manuals/all-products/esuprt_ser_stor_net/esuprt_poweredge/poweredge-r720_reference-guide_en-us.pdf',
    where: 'p.28 Table 11 (chassis options); p.50–51 Table 28 (iDRAC7 Express vs Enterprise); p.56 Fig 18 (dimensions) and Table 30 (weight); p.58 Table 32 (PSUs); p.59 rail table'
  },
  'dell-r720-om': {
    title: 'Dell PowerEdge R720 and R720xd Owner’s Manual',
    publisher: 'Dell',
    href: 'https://dl.dell.com/topicspdf/poweredge-r720_owners-manual_en-us.pdf',
    where: 'p.10 Fig 4 (front, 2.5″ R720xd); p.15 (drive LEDs); p.16–17 Fig 8 (back panel); p.64 Table 3 (PCIe); p.106 Fig 69 (x24 backplane cabling); p.108 Fig 71 (rear flex bays); p.129–130 Fig 78 (system board)'
  },
  'dell-hba330-ug': {
    title: 'Dell Host Bus Adapter User’s Guide: HBA330 and External 12 Gbps SAS HBA',
    publisher: 'Dell',
    href: 'https://dl.dell.com/content/manual62755947-dell-host-bus-adapter-user-s-guide-hba330-and-external-12-gbps-sas-hba.pdf',
    where: 'p.5–7 (overview, Fig 2, Table 1 specifications); LED note; Linux driver section (mpt3sas)'
  },
  'dell-hba330-fw': {
    title: 'Dell HBA330 Adapter firmware version 16.17.01.00, A08 (driver ID NKNVC)',
    publisher: 'Dell',
    href: 'https://www.dell.com/support/home/en-us/drivers/driversdetails?driverid=nknvc',
    where: 'Version, release date and the Compatible Systems list (no R720 or R720xd)'
  },
  'dell-perc-h710p-ug': {
    title: 'Dell PowerEdge RAID Controller (PERC) H310, H710, H710P, and H810 User’s Guide',
    publisher: 'Dell',
    href: 'https://dl.dell.com/manuals/common/rc_h310_h710_h710p_h810_ug_en-us.pdf',
    where: 'p.8–9 Overview and Table 1 (hardware configurations)'
  },
  'intel-e5-2690v2': {
    title: 'Intel Xeon Processor E5-2690 v2 (25M Cache, 3.00 GHz) specifications',
    publisher: 'Intel',
    href: 'https://www.intel.com/content/www/us/en/products/sku/75279/intel-xeon-processor-e52690-v2-25m-cache-3-00-ghz/specifications.html'
  },
  'broadcom-9300-8i-ug': {
    title: 'LSI SAS 9300-8i PCI Express to 12Gb/s SAS Host Bus Adapter User Guide',
    publisher: 'Broadcom (LSI)',
    href: 'https://docs.broadcom.com/doc/12354877',
    where: 'Features list; board layout (EC1 x8 edge connector, J1 SFF-8643)'
  },
  'broadcom-9300-pb': {
    title: 'SAS 9300 12Gb/s SAS Host Bus Adapter Family Product Brief',
    publisher: 'Broadcom (Avago)',
    href: 'https://docs.broadcom.com/doc/12352000',
    where: 'Specification table (SAS9300-8i: SAS 3008, SFF-8643 ×2, x8 PCIe 3.0)'
  },
  'ui-udm-pro': {
    title: 'UniFi Dream Machine Pro: Tech Specs',
    publisher: 'Ubiquiti',
    href: 'https://techspecs.ui.com/unifi/cloud-gateways/udm-pro',
    where: 'Specifications and the labelled front/rear product image'
  },
  'ui-udm-pro-qsg': {
    title: 'UDM-Pro Quick Start Guide',
    publisher: 'Ubiquiti',
    href: 'https://dl-origin.ubnt.com/qsg/UDM-Pro/UDM-Pro_EN.html',
    where: 'Hardware Overview table (ports 1–11) and Specifications'
  },
  'ui-unas-pro-8': {
    title: 'UniFi UNAS Pro 8: Tech Specs',
    publisher: 'Ubiquiti',
    href: 'https://techspecs.ui.com/unifi/integrations/unas-pro-8',
    where: 'Specifications and the labelled front/rear product image'
  },
  'ui-u7-pro': {
    title: 'UniFi U7 Pro: Tech Specs',
    publisher: 'Ubiquiti',
    href: 'https://techspecs.ui.com/unifi/wifi/u7-pro',
    where: 'Specifications and the labelled product images'
  },
  'ui-flex-mini': {
    title: 'UniFi Flex Mini: Tech Specs',
    publisher: 'Ubiquiti',
    href: 'https://techspecs.ui.com/unifi/switching/usw-flex-mini',
    where: 'Specifications and the labelled product image'
  },
  'rpi4-brief': {
    title: 'Raspberry Pi 4 Model B product brief',
    publisher: 'Raspberry Pi Ltd',
    href: 'https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-product-brief.pdf',
    where: 'p.2 Specification; p.5 Physical specification'
  },
  'rpi4-mech': {
    title: 'Raspberry Pi 4 Model B mechanical drawing',
    publisher: 'Raspberry Pi Ltd',
    href: 'https://datasheets.raspberrypi.com/rpi4/raspberry-pi-4-mechanical-drawing.pdf'
  },
  'rpi4-product': {
    title: 'Raspberry Pi 4 Model B product page (labelled board image)',
    publisher: 'Raspberry Pi Ltd',
    href: 'https://www.raspberrypi.com/products/raspberry-pi-4-model-b/'
  },
  'crucial-mx500': {
    title: 'Crucial MX500 SSD product flyer (archived copy)',
    publisher: 'Micron (Crucial)',
    href: 'https://web.archive.org/web/20251205191004/https://content.crucial.com/content/dam/crucial/ssd-products/mx500/flyer/crucial-mx500-ssd-productflyer-en.pdf',
    archiveOf: 'https://content.crucial.com/content/dam/crucial/ssd-products/mx500/flyer/crucial-mx500-ssd-productflyer-en.pdf'
  },
  'seagate-ep15k-v4': {
    title: 'Seagate Enterprise Performance 15K HDD data sheet (DS1797.1, July 2013)',
    publisher: 'Seagate',
    href: 'https://www.seagate.com/www-content/product-content/savvio-fam/enterprise-performance-15k-hdd/savvio-15k-4/en-us/enterprise-performance-15k-hdd-ds1797-1-1307us.pdf'
  },
  'seagate-savvio-15k3': {
    title: 'Seagate Savvio 15K.3 data sheet (DS1732.5, January 2012)',
    publisher: 'Seagate',
    href: 'https://www.seagate.com/www-content/product-content/savvio-fam/enterprise-performance-15k-hdd/savvio-15k-3/en-us/docs/savvio-15k-3-data-sheet-ds1732-5-1201us.pdf'
  },
  'apc-ar3100': {
    title: 'APC NetShelter SX AR3100 (42U, 600 × 1070 mm) product data sheet',
    publisher: 'Schneider Electric (APC)',
    href: 'https://www.apc.com/us/en/product/download-pdf/AR3100?filename=APC_NetShelter-SX-Enclosures_AR3100.pdf'
  }
} satisfies Record<string, Source>;

export type SourceKey = keyof typeof sources;

/** 1U, EIA-310. */
const U = 44.45;

export const cabinet: Cabinet = {
  heightU: 42,
  uMm: U,
  rackWidthIn: 19,
  outer: {
    value: { w: 600, h: 1991, d: 1070 },
    prov: 'assumed',
    note: 'Make unknown. Nominal 42U enclosed cabinet, using the published size of a common one (APC NetShelter SX AR3100). Owner says 42U; nothing else is surveyed.'
  },
  reference: {
    value: 'APC NetShelter SX AR3100: 1991 H × 600 W × 1070 D mm, 42U, 19″',
    prov: 'vendor',
    source: 'apc-ar3100',
    note: 'A stand-in, not the owner’s cabinet.'
  },
  railSpan: {
    value: 750,
    prov: 'assumed',
    note: 'Front-to-rear rail distance. Chosen inside both the R720xd sliding-rail range (676–868 mm, square holes; Dell Technical Guide p.59) and the UNAS Pro 8 rail range (600–1066 mm).'
  },
  u1FloorMm: {
    value: 70,
    prov: 'assumed',
    note: 'Bottom of U1 above the floor (casters and plinth). With 42 × 44.45 mm = 1866.9 mm of rails in a 1991 mm cabinet, about 124 mm is left for base and roof.'
  },
  doors: {
    value: 'Glass front door with perforated strips down both sides, hinged on the left as seen from the front; rear door not seen.',
    prov: 'inferred',
    note: 'From the Nov 2024 photo, which may show an older, smaller cabinet.'
  },
  notes: [
    'U POSITIONS NOT SURVEYED — VERIFY IN FIELD. The top-to-bottom order (shelf, patch panel, UDM Pro, R720xd) follows the Nov 2024 photo; the UNAS Pro 8 is placed by reasoning, not by sight.',
    'Cabinet make and size unknown; outer dimensions are a nominal 42U enclosure.',
    'Gear sits at working height: the R720xd’s bottom edge about 0.83 m above the floor, the shelf about 1.14 m.',
    'The heaviest unit (R720xd) is lowest, the 2U UNAS Pro 8 sits between it and the gateway so the 10 GbE SFP+ run stays short.',
    'The shelf and the patch panel were seen in Nov 2024; whether they are still there is unknown.'
  ]
};

export const devices: Device[] = [
  {
    id: 'shelf',
    name: 'Cantilever shelf',
    short: 'Shelf',
    maker: 'Unknown',
    model: 'Vented 1U cantilever shelf',
    role: 'Holds the small things: a power strip, small boxes and (assumed) the Raspberry Pi.',
    category: 'passive',
    location: 'cabinet',
    mount: 'rack',
    u: { value: 24, prov: 'assumed', note: 'Top of the stack, as in the Nov 2024 photo. Keep U25–U27 clear for what sits on it.' },
    heightU: 1,
    body: {
      value: { w: 482.6, h: 44.45, d: 250 },
      prov: 'assumed',
      note: 'Generic front-mount cantilever shelf: 19″ face (482.6 mm), 1U, depth guessed.'
    },
    earsWidth: { value: 482.6, prov: 'inferred', note: '19″ EIA-310 panel width.' },
    airflow: { value: 'passive', prov: 'inferred', note: 'Perforated tray, seen in the Nov 2024 photo.' },
    specs: [
      { label: 'Surface', fact: { value: 'Perforated (vented) steel tray', prov: 'inferred', note: 'Nov 2024 photo.' } },
      {
        label: 'Seen on it (Nov 2024)',
        fact: {
          value: 'A power strip, a small dark box, a small grey box with green LEDs, a jar',
          prov: 'inferred',
          note: 'What the boxes are is not known.'
        }
      }
    ],
    faces: {
      front: 'A thin front lip across the full 19″ width, flush with the rack ears; items on the tray rise above it. Nothing else on the face.'
    },
    seenInPhoto: { value: true, prov: 'inferred', note: 'Nov 2024 photo; present today unknown.' }
  },
  {
    id: 'rpi-4b',
    name: 'Raspberry Pi 4 Model B (8 GB)',
    short: 'Pi 4B',
    maker: 'Raspberry Pi Ltd',
    model: 'Raspberry Pi 4 Model B, 8 GB',
    role: 'The control node: runs agents and small jobs next to the server.',
    category: 'edge',
    location: 'cabinet',
    mount: 'shelf',
    u: {
      value: 25,
      prov: 'assumed',
      note: 'Sits on the shelf, so it occupies the space just above U24. Not rack-mounted; its place is not surveyed.'
    },
    body: {
      value: { w: 85, h: 17, d: 56 },
      prov: 'inferred',
      source: 'rpi4-mech',
      note: 'Board 85 × 56 mm (vendor drawing). Height = the USB stack (Z 16.0 mm on the drawing) plus the board, rounded; no vendor overall height. Bare board; a case, if any, is unknown.'
    },
    maxPower: {
      value: 15,
      prov: 'inferred',
      source: 'rpi4-brief',
      note: 'Rating of the minimum 5 V / 3 A supply the brief asks for, not a consumption figure.'
    },
    airflow: { value: 'passive', prov: 'inferred', note: 'No fan on the board; a case fan, if any, is unknown.' },
    specs: [
      { label: 'SoC', fact: { value: 'Broadcom BCM2711, quad-core Cortex-A72 (ARMv8) 64-bit @ 1.8 GHz', prov: 'vendor', source: 'rpi4-brief' } },
      { label: 'Memory', fact: { value: '8 GB LPDDR4', prov: 'owner', asOf: '2026-09-28', note: 'Model sizes 1–8 GB per the brief.' } },
      { label: 'Network', fact: { value: 'Gigabit Ethernet; 2.4/5 GHz 802.11ac Wi-Fi; Bluetooth 5.0', prov: 'vendor', source: 'rpi4-brief' } },
      { label: 'USB', fact: { value: '2 × USB 3.0, 2 × USB 2.0', prov: 'vendor', source: 'rpi4-brief' } },
      {
        label: 'Port order',
        fact: {
          value: 'From the GPIO-header side: Ethernet, 2 × USB 3.0 (blue), 2 × USB 2.0',
          prov: 'vendor',
          source: 'rpi4-product',
          note: 'Labelled board image.'
        }
      },
      { label: 'Power in', fact: { value: '5 V DC via USB-C, minimum 3 A', prov: 'vendor', source: 'rpi4-brief' } },
      { label: 'Storage', fact: { value: '128 GB microSD card', prov: 'measured', asOf: '2026-09-28' } },
      { label: 'OS', fact: { value: 'Raspberry Pi OS (Debian 13), 64-bit', prov: 'measured', asOf: '2026-09-28' } },
      { label: 'Operating temperature', fact: { value: '0–50 °C', prov: 'vendor', source: 'rpi4-brief' } }
    ],
    ports: [
      { group: 'Ethernet', count: 1, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'USB 3.0', count: 2, kind: 'USB-A', speed: '5 Gb/s', face: 'front' },
      { group: 'USB 2.0', count: 2, kind: 'USB-A', speed: '480 Mb/s', face: 'front' }
    ],
    faces: {
      front:
        'Port end (the 56 mm short edge), from the GPIO-header side: Gigabit Ethernet (centre 10.25 mm in, 13.5 mm tall), a stacked pair of blue USB 3.0 (centre 29 mm), a stacked pair of black USB 2.0 (centre 47 mm, 16 mm tall). Along the long edge to its left, from the far corner: USB-C power (11.2 mm from the end), micro-HDMI 0 (26 mm), micro-HDMI 1 (39.5 mm), 3.5 mm audio/composite (54 mm).',
      rear: 'The opposite short end is bare board; the microSD slot sits underneath it.'
    },
    panels: {
      front: {
        frame: 'Port end, 56 mm wide (x from the GPIO-header side), 17 mm tall above the shelf.',
        prov: 'vendor',
        source: 'rpi4-mech',
        note: 'Centres from the vendor drawing (45.75, 27 and 9 mm from the far edge); port widths approximate. Order confirmed on the labelled board image (rpi4-product).',
        zones: [
          { id: 'eth', label: 'Gigabit Ethernet', kind: 'port', x0: 0.04, x1: 0.33, y0: 0.2, y1: 1 },
          { id: 'usb3', label: 'USB 3.0 ×2 (blue)', kind: 'port', x0: 0.4, x1: 0.64, y0: 0.06, y1: 1 },
          { id: 'usb2', label: 'USB 2.0 ×2', kind: 'port', x0: 0.72, x1: 0.96, y0: 0.06, y1: 1 }
        ]
      }
    },
    seenInPhoto: {
      value: false,
      prov: 'inferred',
      note: 'Not identifiable in the Nov 2024 photo. The shelf position is an assumption.'
    }
  },
  {
    id: 'patch-panel',
    name: '24-port patch panel',
    short: 'Patch panel',
    maker: 'Unknown',
    model: '1U, 24-port RJ45',
    role: 'Terminates the building’s network runs so short patch leads can reach the gateway.',
    category: 'passive',
    location: 'cabinet',
    mount: 'rack',
    u: { value: 23, prov: 'assumed', note: 'Directly under the shelf, as in the Nov 2024 photo.' },
    heightU: 1,
    body: {
      value: { w: 482.6, h: 44.45, d: 40 },
      prov: 'assumed',
      note: 'Generic flat 1U panel; the face is the full 19″ width. Depth guessed.'
    },
    earsWidth: { value: 482.6, prov: 'inferred', note: '19″ EIA-310 panel width.' },
    airflow: { value: 'passive', prov: 'inferred' },
    specs: [
      { label: 'Ports', fact: { value: '24 × RJ45', prov: 'inferred', note: 'From the Nov 2024 photo; not recounted since. Which runs are live is not documented.' } },
      { label: 'Colour', fact: { value: 'Black, with white label strips', prov: 'inferred', note: 'Nov 2024 photo.' } }
    ],
    ports: [{ group: 'Jacks', count: 24, kind: 'RJ45', face: 'front' }],
    faces: {
      front: 'One row of 24 RJ45 jacks across the middle of a flat black 1U plate, in groups with white write-on label strips above them; mounting holes in the ears at each end.',
      rear: 'Termination side, not seen.'
    },
    panels: {
      front: {
        frame: 'Full 19″ face, 482.6 mm (ears included).',
        prov: 'assumed',
        note: 'Typical layout; group size and exact spacing not surveyed.',
        zones: [
          { id: 'ear-l', label: 'Ear', kind: 'ear', x0: 0, x1: 0.04, y0: 0, y1: 1 },
          { id: 'labels', label: 'Label strips', kind: 'label', x0: 0.07, x1: 0.93, y0: 0.12, y1: 0.28 },
          { id: 'jacks', label: '24 × RJ45', kind: 'port', x0: 0.07, x1: 0.93, y0: 0.34, y1: 0.8 },
          { id: 'ear-r', label: 'Ear', kind: 'ear', x0: 0.96, x1: 1, y0: 0, y1: 1 }
        ]
      }
    },
    seenInPhoto: { value: true, prov: 'inferred', note: 'Nov 2024 photo; present today unknown.' }
  },
  {
    id: 'udm-pro',
    name: 'UniFi Dream Machine Pro',
    short: 'UDM Pro',
    maker: 'Ubiquiti',
    model: 'UDM-Pro',
    role: 'Gateway, firewall and the house’s router; every other box hangs off it.',
    category: 'network',
    location: 'cabinet',
    mount: 'rack',
    u: { value: 22, prov: 'assumed', note: 'Under the patch panel, as in the Nov 2024 photo.' },
    heightU: 1,
    body: { value: { w: 442.4, h: 43.7, d: 285.6 }, prov: 'vendor', source: 'ui-udm-pro' },
    earsWidth: {
      value: 482.6,
      prov: 'inferred',
      note: 'Rack-mount brackets ship separately and screw to the sides; 19″ EIA-310 panel width assumed for the pair.'
    },
    mass: { value: 3.9, prov: 'vendor', source: 'ui-udm-pro-qsg', note: '3.99 kg with the rack brackets.' },
    maxPower: { value: 33, prov: 'vendor', source: 'ui-udm-pro' },
    airflow: {
      value: 'unknown',
      prov: 'inferred',
      note: 'Ubiquiti does not state an airflow direction. Vent slits run along the top edge of both the front and the rear; no fans are visible in the product images.'
    },
    specs: [
      { label: 'Processor', fact: { value: 'Quad-core Arm Cortex-A57 at 1.7 GHz', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'Memory', fact: { value: '4 GB', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'On-board storage', fact: { value: '16 GB', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'IDS/IPS throughput', fact: { value: '3.5 Gbps', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'Display', fact: { value: '1.3″ colour touchscreen', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'Drive bay', fact: { value: '1 × 3.5″/2.5″ HDD bay (for UniFi Protect)', prov: 'vendor', source: 'ui-udm-pro-qsg' } },
      { label: 'Power supply', fact: { value: 'Internal 50 W, 100–240 V AC', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'Heat dissipation', fact: { value: '112 BTU/hr', prov: 'vendor', source: 'ui-udm-pro' } },
      { label: 'Form factor', fact: { value: 'Rack mount, 1U', prov: 'vendor', source: 'ui-udm-pro' } }
    ],
    ports: [
      { group: 'LAN (ports 1–8)', count: 8, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'WAN (port 9)', count: 1, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'WAN (port 10, SFP+ 1)', count: 1, kind: 'SFP+', speed: '1/10 GbE', face: 'front' },
      { group: 'LAN (port 11, SFP+ 2)', count: 1, kind: 'SFP+', speed: '1/10 GbE', face: 'front' },
      { group: 'Power', count: 1, kind: 'AC inlet', face: 'rear' },
      { group: 'Redundant power (USP RPS)', count: 1, kind: 'DC input', face: 'rear' }
    ],
    faces: {
      front:
        'Silver 1U face. Far left (first ~6%): the square 1.3″ touchscreen, with the model name under it. Four long vent slits run along the top edge. Middle (about 42–66% across): a flat, near-full-height door for the 3.5″ drive bay. Right: a 2 × 4 block of RJ45 LAN ports (70–84%; ports 1, 3, 5, 7 on top, 2, 4, 6, 8 below), then RJ45 WAN port 9 sitting low on its own (87–92%), then two SFP+ cages stacked vertically (92–95%): port 10 (SFP+ WAN) on top, port 11 (SFP+ LAN) underneath. A reset pinhole sits at the bottom right corner.',
      rear: 'Plain silver back with vent slits along the top. Far left: the wide USP RPS DC connector (4–18% across) under a small label; the AC power inlet near the right end (86–93%); regulatory label left of it. No fans visible.'
    },
    panels: {
      front: {
        frame: 'Body face 442.4 × 43.7 mm, without rack brackets.',
        prov: 'inferred',
        source: 'ui-udm-pro',
        note: 'Traced from Ubiquiti’s labelled front image; port numbers from the Quick Start Guide.',
        zones: [
          { id: 'screen', label: '1.3″ touchscreen', kind: 'display', x0: 0.011, x1: 0.065, y0: 0.23, y1: 0.79 },
          { id: 'vent-1', label: 'Vent', kind: 'vent', x0: 0.083, x1: 0.251, y0: 0.05, y1: 0.1 },
          { id: 'vent-2', label: 'Vent', kind: 'vent', x0: 0.259, x1: 0.427, y0: 0.05, y1: 0.1 },
          { id: 'vent-3', label: 'Vent', kind: 'vent', x0: 0.434, x1: 0.603, y0: 0.05, y1: 0.1 },
          { id: 'vent-4', label: 'Vent', kind: 'vent', x0: 0.61, x1: 0.778, y0: 0.05, y1: 0.1 },
          { id: 'hdd', label: '3.5″ drive bay', kind: 'bay', x0: 0.421, x1: 0.664, y0: 0.18, y1: 0.85 },
          { id: 'lan-top', label: 'LAN 1 · 3 · 5 · 7', kind: 'port', x0: 0.697, x1: 0.843, y0: 0.19, y1: 0.48 },
          { id: 'lan-bottom', label: 'LAN 2 · 4 · 6 · 8', kind: 'port', x0: 0.697, x1: 0.843, y0: 0.52, y1: 0.81 },
          { id: 'wan-9', label: 'WAN 9 (RJ45)', kind: 'port', x0: 0.872, x1: 0.917, y0: 0.47, y1: 0.81 },
          { id: 'sfp-10', label: 'Port 10 · SFP+ WAN', kind: 'port', x0: 0.919, x1: 0.954, y0: 0.19, y1: 0.47 },
          { id: 'sfp-11', label: 'Port 11 · SFP+ LAN', kind: 'port', x0: 0.919, x1: 0.954, y0: 0.53, y1: 0.81 },
          { id: 'reset', label: 'Reset', kind: 'button', x0: 0.966, x1: 0.972, y0: 0.86, y1: 0.92 }
        ]
      },
      rear: {
        frame: 'Rear face as seen from behind, 442.4 × 43.7 mm.',
        prov: 'inferred',
        source: 'ui-udm-pro',
        zones: [
          { id: 'rps', label: 'USP RPS DC input', kind: 'port', x0: 0.039, x1: 0.184, y0: 0.46, y1: 0.9 },
          { id: 'reg-label', label: 'Label', kind: 'label', x0: 0.72, x1: 0.81, y0: 0.4, y1: 0.73 },
          { id: 'ac', label: 'AC inlet', kind: 'port', x0: 0.855, x1: 0.927, y0: 0.29, y1: 0.85 }
        ]
      }
    },
    seenInPhoto: { value: true, prov: 'inferred', note: 'Nov 2024 photo, below the patch panel.' }
  },
  {
    id: 'unas-pro-8',
    name: 'UniFi UNAS Pro 8',
    short: 'UNAS Pro 8',
    maker: 'Ubiquiti',
    model: 'UNAS-Pro-8',
    role: 'The NAS: shared files and the on-site backup target, on a 10 GbE link to the gateway.',
    category: 'storage',
    location: 'cabinet',
    mount: 'rack',
    u: {
      value: 20,
      prov: 'assumed',
      note: 'Not in the Nov 2024 photo. Placed between the UDM Pro and the R720xd: heavier gear lower, short SFP+ run to the gateway.'
    },
    heightU: 2,
    body: { value: { w: 442.4, h: 87.4, d: 480 }, prov: 'vendor', source: 'ui-unas-pro-8' },
    earsWidth: { value: 482.6, prov: 'inferred', note: 'Mounts in a 482.6 mm (19″) four-post rack per Ubiquiti’s rack image.' },
    mass: { value: 11.5, prov: 'vendor', source: 'ui-unas-pro-8', note: 'Without drives.' },
    maxPower: { value: 250, prov: 'vendor', source: 'ui-unas-pro-8', note: 'Includes a 225 W budget for drives.' },
    airflow: {
      value: 'front-to-back',
      prov: 'inferred',
      source: 'ui-unas-pro-8',
      note: 'Two large exhaust fans on the rear panel; Ubiquiti does not state the direction in words.'
    },
    specs: [
      { label: 'Drive bays', fact: { value: '8 × 2.5″/3.5″ HDD or SSD', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'Cache bays', fact: { value: '2 × M.2 NVMe', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'Processor', fact: { value: 'Quad-core Arm Cortex-A57 at 2.0 GHz', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'Memory', fact: { value: '16 GB', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'Power supplies', fact: { value: '2 × hot-swappable 550 W AC/DC modules (redundant)', prov: 'vendor', source: 'ui-unas-pro-8', note: 'Ubiquiti’s rear image shows the second bay with a blank; how many modules this unit has is not recorded.' } },
      { label: 'Rack depth supported', fact: { value: '600–1066 mm, square-hole four-post racks', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'File protocols', fact: { value: 'NFS, SMB', prov: 'vendor', source: 'ui-unas-pro-8' } },
      { label: 'Form factor', fact: { value: 'Rack mount, 2U', prov: 'vendor', source: 'ui-unas-pro-8' } }
    ],
    ports: [
      { group: '10 GbE (port 1)', count: 1, kind: 'RJ45', speed: '10G/5G/2.5G/1G/100M', face: 'rear' },
      { group: 'SFP+ (ports 2–3)', count: 2, kind: 'SFP+', speed: '10 GbE only', face: 'rear' },
      { group: 'Power', count: 2, kind: 'AC inlet (PSU modules)', face: 'rear' }
    ],
    faces: {
      front:
        'Silver 2U face almost entirely drive bays: two rows of four wide 3.5″ trays, each tray about a quarter of the width; top row bays 1–4, bottom row 5–8, left to right. A thin blue status LED bar at the top left corner with the model name under it, vent slits along the top and bottom edges, and a reset pinhole at the bottom right.',
      rear: 'Left quarter: the M.2 NVMe bay cover (upper half) above a row of three network ports at the bottom edge: the 10 GbE RJ45 (port 1) then two SFP+ cages (ports 2, 3). Centre: two large round exhaust fans side by side (25–58% across). Right: PSU 1 module (61–79%: small fan, AC inlet, green safety latch below) and the PSU 2 bay (79–97%), shown with a blank in Ubiquiti’s image.'
    },
    panels: {
      front: {
        frame: 'Body face 442.4 × 87.4 mm.',
        prov: 'inferred',
        source: 'ui-unas-pro-8',
        note: 'Traced from Ubiquiti’s labelled front image.',
        zones: [
          { id: 'status', label: 'Status LED', kind: 'led', x0: 0.011, x1: 0.063, y0: 0.02, y1: 0.05 },
          { id: 'bay-1', label: 'Bay 1', kind: 'bay', x0: 0.011, x1: 0.255, y0: 0.113, y1: 0.453 },
          { id: 'bay-2', label: 'Bay 2', kind: 'bay', x0: 0.259, x1: 0.5, y0: 0.113, y1: 0.453 },
          { id: 'bay-3', label: 'Bay 3', kind: 'bay', x0: 0.504, x1: 0.744, y0: 0.113, y1: 0.453 },
          { id: 'bay-4', label: 'Bay 4', kind: 'bay', x0: 0.747, x1: 0.989, y0: 0.113, y1: 0.453 },
          { id: 'bay-5', label: 'Bay 5', kind: 'bay', x0: 0.011, x1: 0.255, y0: 0.542, y1: 0.882 },
          { id: 'bay-6', label: 'Bay 6', kind: 'bay', x0: 0.259, x1: 0.5, y0: 0.542, y1: 0.882 },
          { id: 'bay-7', label: 'Bay 7', kind: 'bay', x0: 0.504, x1: 0.744, y0: 0.542, y1: 0.882 },
          { id: 'bay-8', label: 'Bay 8', kind: 'bay', x0: 0.747, x1: 0.989, y0: 0.542, y1: 0.882 },
          { id: 'reset', label: 'Reset', kind: 'button', x0: 0.962, x1: 0.97, y0: 0.93, y1: 0.97 }
        ]
      },
      rear: {
        frame: 'Rear face as seen from behind, 442.4 × 87.4 mm.',
        prov: 'inferred',
        source: 'ui-unas-pro-8',
        zones: [
          { id: 'm2', label: 'M.2 NVMe bays', kind: 'slot', x0: 0.04, x1: 0.217, y0: 0.17, y1: 0.49 },
          { id: 'rj45', label: '10 GbE RJ45 (port 1)', kind: 'port', x0: 0.037, x1: 0.075, y0: 0.75, y1: 0.89 },
          { id: 'sfp-2', label: 'SFP+ port 2', kind: 'port', x0: 0.082, x1: 0.115, y0: 0.77, y1: 0.9 },
          { id: 'sfp-3', label: 'SFP+ port 3', kind: 'port', x0: 0.123, x1: 0.156, y0: 0.77, y1: 0.9 },
          { id: 'fan-1', label: 'Fan', kind: 'fan', x0: 0.247, x1: 0.399, y0: 0.09, y1: 0.88 },
          { id: 'fan-2', label: 'Fan', kind: 'fan', x0: 0.422, x1: 0.576, y0: 0.09, y1: 0.88 },
          { id: 'psu-1', label: 'PSU 1', kind: 'psu', x0: 0.613, x1: 0.786, y0: 0.5, y1: 0.99 },
          { id: 'psu-2', label: 'PSU 2 bay', kind: 'psu', x0: 0.791, x1: 0.968, y0: 0.49, y1: 1 }
        ]
      }
    },
    seenInPhoto: { value: false, prov: 'inferred', note: 'Not in the Nov 2024 photo.' }
  },
  {
    id: 'r720xd',
    name: 'Dell PowerEdge R720xd',
    short: 'R720xd',
    maker: 'Dell',
    model: 'PowerEdge R720xd (24 × 2.5″ + 2 rear)',
    role: 'The compute server: Proxmox VE, its VMs and the Kubernetes cluster.',
    category: 'compute',
    location: 'cabinet',
    mount: 'rack',
    u: { value: 18, prov: 'assumed', note: 'Bottom of the stack, as in the Nov 2024 photo, at working height on sliding rails.' },
    heightU: 2,
    body: {
      value: { w: 444.0, h: 87.3, d: 684.0 },
      prov: 'vendor',
      source: 'dell-r720-tg',
      note: 'Depth from the rack flange to the rear wall (Zb). Ears/bezel add 18 mm (32 mm with bezel) in front; PSU handles reach 723 mm (Zc).'
    },
    earsWidth: { value: 482.4, prov: 'vendor', source: 'dell-r720-tg' },
    mass: {
      value: 29.5,
      prov: 'vendor',
      source: 'dell-r720-tg',
      note: 'Maximum configuration, 2.5″ R720xd chassis; the empty chassis is 11.7 kg.'
    },
    airflow: {
      value: 'front-to-back',
      prov: 'inferred',
      source: 'dell-r720-tg',
      note: 'Drives at the front, the fan wall behind the backplane, PSUs and exhaust at the rear. Dell’s thermal control reads an inlet (ambient) sensor and manages a maximum exhaust temperature; it does not state the direction in words.'
    },
    specs: [
      { label: 'CPUs', fact: { value: '2 × Intel Xeon E5-2690 v2 (10 cores / 20 threads each)', prov: 'measured', asOf: '2026-09-25' } },
      { label: 'Memory', fact: { value: '256 GB ECC (owner) · 125 GiB usable (measured) — unresolved', prov: 'inferred', note: 'See the server sheet: both values stand until the DIMMs are checked.' } },
      { label: 'Drive bays', fact: { value: '24 × 2.5″ front + 2 × 2.5″ rear', prov: 'owner', asOf: '2026-09-28', note: 'Counted by the owner; only the R720xd has this layout (Technical Guide p.28).' } },
      { label: 'Network', fact: { value: '4 × 1 GbE (Broadcom BCM5720)', prov: 'measured', asOf: '2026-09-25' } },
      { label: 'Management', fact: { value: 'iDRAC7 Express, on its final firmware, sharing NIC port 1', prov: 'measured', asOf: '2026-09-28' } },
      { label: 'Storage controller', fact: { value: 'PERC H710P Mini today; Dell HBA330 planned', prov: 'measured', asOf: '2026-09-28' } },
      { label: 'Power supplies', fact: { value: '2, redundant; wattage unknown', prov: 'measured', asOf: '2026-09-28' } },
      { label: 'PSU options', fact: { value: '495 W, 750 W or 1100 W AC; 1100 W DC', prov: 'vendor', source: 'dell-r720-tg' } }
    ],
    ports: [
      { group: 'VGA (front)', count: 1, kind: 'DB-15 VGA', face: 'front' },
      { group: 'USB (front)', count: 1, kind: 'USB-A', speed: 'USB 2.0', face: 'front' },
      { group: 'NIC ports 1–4', count: 4, kind: 'RJ45', speed: '1 GbE', face: 'rear' },
      { group: 'iDRAC dedicated port', count: 1, kind: 'RJ45', speed: '1 GbE (Enterprise licence only)', face: 'rear' },
      { group: 'Serial', count: 1, kind: 'DB-9', face: 'rear' },
      { group: 'VGA (rear)', count: 1, kind: 'DB-15 VGA', face: 'rear' },
      { group: 'USB (rear)', count: 2, kind: 'USB-A', speed: 'USB 2.0', face: 'rear' },
      { group: 'PSU inlets', count: 2, kind: 'AC inlet', face: 'rear' }
    ],
    faces: {
      front:
        'Black 2U face. Left rack ear (about 19 mm): power button near the top with the small NMI button just right of it, the system ID button below, then two rows of three diagnostic icons (indicators), and a pale latch tab filling the lower half. Between the ears: 24 vertical 2.5″ drive carriers in one row, each about 1/24 of the width (≈18 mm), numbered 0 at the far left to 23 at the far right on a strip along the top edge; each carrier has a round release button at the top and a vented handle below. A pull-out information tag sits in the top strip above bays 2–4. Right rack ear: a vertical VGA port near the top, one USB 2.0 port below it, and the pale latch tab in the lower half. An optional lockable Dell bezel covers the bays.',
      rear:
        'Seen from behind, left to right. Left strip: the riser 1 column (8–22% across): three stacked low-profile slots 1, 2, 3, top to bottom. Next, riser 2 (27–48%): full-height slots 4 above 5, lying horizontally, with a long handle bar under them. Right half, top: slot 6 (riser 3, 55–75%) along the top edge with the vFlash card slot at the far top right (81–87%). Under it the two 2.5″ rear flex bays side by side, one above each power supply. Bottom right: PSU 1 (56–75%) then PSU 2 (75–94%), each with its AC inlet on the left and a fan grille on the right. Bottom-left I/O row: system ID button, system ID connector, iDRAC port, serial, VGA, two stacked USB 2.0, then the four 1 GbE ports numbered 1–4 (34–52%).'
    },
    panels: {
      front: {
        frame: 'Overall face 482.4 mm including rack ears: body (444.0 mm) spans 0.04 → 0.96. Height 87.3 mm.',
        prov: 'inferred',
        source: 'dell-r720-om',
        note: 'Traced from Owner’s Manual Fig 4 (p.10). Carrier details simplified.',
        zones: [
          { id: 'ear-l', label: 'Left control panel', kind: 'ear', x0: 0, x1: 0.04, y0: 0, y1: 1 },
          { id: 'power', label: 'Power button', kind: 'button', x0: 0.006, x1: 0.026, y0: 0.12, y1: 0.23 },
          { id: 'nmi', label: 'NMI button', kind: 'button', x0: 0.026, x1: 0.034, y0: 0.2, y1: 0.25 },
          { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.012, x1: 0.024, y0: 0.29, y1: 0.33 },
          { id: 'diag', label: 'Diagnostic indicators', kind: 'led', x0: 0.006, x1: 0.034, y0: 0.36, y1: 0.49 },
          { id: 'tag', label: 'Information tag', kind: 'label', x0: 0.13, x1: 0.2, y0: 0.01, y1: 0.05 },
          { id: 'bays', label: 'Bays 0–23', kind: 'bay', x0: 0.04, x1: 0.96, y0: 0.06, y1: 0.97, note: '24 equal carriers, bay 0 at the left.' },
          { id: 'ear-r', label: 'Right I/O panel', kind: 'ear', x0: 0.96, x1: 1, y0: 0, y1: 1 },
          { id: 'vga', label: 'VGA', kind: 'port', x0: 0.968, x1: 0.99, y0: 0.1, y1: 0.32 },
          { id: 'usb', label: 'USB 2.0', kind: 'port', x0: 0.966, x1: 0.992, y0: 0.44, y1: 0.51 }
        ]
      },
      rear: {
        frame: 'Rear face as seen from behind, body width 444.0 mm, height 87.3 mm.',
        prov: 'inferred',
        source: 'dell-r720-om',
        note: 'Traced from Owner’s Manual Fig 8 (p.16). Which rear bay is 24 and which is 25 is not documented.',
        zones: [
          { id: 'slot-1', label: 'Slot 1', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.09, y1: 0.25 },
          { id: 'slot-2', label: 'Slot 2', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.31, y1: 0.48 },
          { id: 'slot-3', label: 'Slot 3', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.55, y1: 0.71 },
          { id: 'slot-4', label: 'Slot 4', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.09, y1: 0.25 },
          { id: 'slot-5', label: 'Slot 5', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.31, y1: 0.47 },
          { id: 'handle', label: 'Handle', kind: 'vent', x0: 0.271, x1: 0.537, y0: 0.58, y1: 0.67 },
          { id: 'slot-6', label: 'Slot 6', kind: 'slot', x0: 0.549, x1: 0.751, y0: 0.09, y1: 0.235 },
          { id: 'vflash', label: 'vFlash slot', kind: 'slot', x0: 0.808, x1: 0.873, y0: 0.12, y1: 0.19 },
          { id: 'rear-bay-l', label: 'Rear bay (24 or 25)', kind: 'bay', x0: 0.556, x1: 0.72, y0: 0.28, y1: 0.47 },
          { id: 'rear-bay-r', label: 'Rear bay (24 or 25)', kind: 'bay', x0: 0.73, x1: 0.888, y0: 0.28, y1: 0.47 },
          { id: 'psu-1', label: 'PSU 1', kind: 'psu', x0: 0.556, x1: 0.746, y0: 0.51, y1: 0.95 },
          { id: 'psu-2', label: 'PSU 2', kind: 'psu', x0: 0.751, x1: 0.941, y0: 0.51, y1: 0.95 },
          { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.063, x1: 0.083, y0: 0.76, y1: 0.87 },
          { id: 'sysid-conn', label: 'System ID connector', kind: 'port', x0: 0.085, x1: 0.102, y0: 0.76, y1: 0.87 },
          { id: 'idrac', label: 'iDRAC port (not used)', kind: 'port', x0: 0.109, x1: 0.144, y0: 0.74, y1: 0.9 },
          { id: 'serial', label: 'Serial', kind: 'port', x0: 0.166, x1: 0.205, y0: 0.76, y1: 0.88 },
          { id: 'vga', label: 'VGA', kind: 'port', x0: 0.234, x1: 0.278, y0: 0.76, y1: 0.88 },
          { id: 'usb', label: 'USB 2.0 ×2', kind: 'port', x0: 0.298, x1: 0.327, y0: 0.74, y1: 0.97 },
          { id: 'nic-1', label: 'NIC 1', kind: 'port', x0: 0.34, x1: 0.376, y0: 0.74, y1: 0.89 },
          { id: 'nic-2', label: 'NIC 2', kind: 'port', x0: 0.388, x1: 0.425, y0: 0.74, y1: 0.89 },
          { id: 'nic-3', label: 'NIC 3', kind: 'port', x0: 0.437, x1: 0.474, y0: 0.74, y1: 0.89 },
          { id: 'nic-4', label: 'NIC 4', kind: 'port', x0: 0.483, x1: 0.519, y0: 0.74, y1: 0.89 }
        ]
      }
    },
    seenInPhoto: { value: true, prov: 'inferred', note: 'Nov 2024 photo: on rails, pulled forward, with its bezel on.' },
    sheetHref: '/lab/r720xd/'
  },
  {
    id: 'u7-pro',
    name: 'UniFi U7 Pro',
    short: 'U7 Pro',
    maker: 'Ubiquiti',
    model: 'U7-Pro',
    role: 'Wi-Fi 7 access point.',
    category: 'network',
    location: 'elsewhere',
    mount: 'ceiling-or-wall',
    body: {
      value: { w: 206, h: 46, d: 206 },
      prov: 'vendor',
      source: 'ui-u7-pro',
      note: 'A disc, ⌀206 × 46 mm; w and d are the diameter.'
    },
    mass: { value: 0.68, prov: 'vendor', source: 'ui-u7-pro' },
    maxPower: { value: 21, prov: 'vendor', source: 'ui-u7-pro' },
    airflow: { value: 'passive', prov: 'inferred', note: 'Sealed disc, no fan listed.' },
    specs: [
      { label: 'Wi-Fi', fact: { value: 'Wi-Fi 7, 6 spatial streams, 2.4/5/6 GHz (2 × 2 each)', prov: 'vendor', source: 'ui-u7-pro' } },
      { label: 'Max data rate', fact: { value: '6 GHz 5.8 Gbps · 5 GHz 4.3 Gbps · 2.4 GHz 688 Mbps', prov: 'vendor', source: 'ui-u7-pro' } },
      { label: 'Coverage', fact: { value: '140 m² (1,500 ft²), 300+ clients', prov: 'vendor', source: 'ui-u7-pro' } },
      { label: 'Power', fact: { value: 'PoE+, 44–57 V DC', prov: 'vendor', source: 'ui-u7-pro' } }
    ],
    ports: [{ group: 'Uplink', count: 1, kind: 'RJ45 (PoE+ in)', speed: '2.5 GbE', face: 'rear' }],
    faces: {
      front: 'A plain white disc with the U logo at the centre inside a round status-LED ring (the ring is about 40% of the diameter).',
      rear: 'Mounting face: a recessed slot across the lower middle holding the 2.5 GbE PoE+ RJ45 port on the right and a reset pinhole on the left, inside the mount’s locking rim.'
    },
    seenInPhoto: { value: false, prov: 'inferred', note: 'Not in the cabinet.' }
  },
  {
    id: 'flex-mini',
    name: 'UniFi Flex Mini',
    short: 'Flex Mini',
    maker: 'Ubiquiti',
    model: 'USW-Flex-Mini',
    role: 'Five-port switch at the desk; the workstation plugs into it.',
    category: 'network',
    location: 'elsewhere',
    mount: 'desk',
    body: {
      value: { w: 107, h: 21, d: 70 },
      prov: 'vendor',
      source: 'ui-flex-mini',
      note: 'Spec table; the product image labels 107.2 × 70.2 × 21.2 mm.'
    },
    mass: { value: 0.15, prov: 'vendor', source: 'ui-flex-mini' },
    maxPower: { value: 2.5, prov: 'vendor', source: 'ui-flex-mini' },
    airflow: { value: 'passive', prov: 'inferred', note: 'Fanless plastic shell.' },
    specs: [
      { label: 'Switching capacity', fact: { value: '10 Gbps', prov: 'vendor', source: 'ui-flex-mini' } },
      { label: 'Power in', fact: { value: 'USB-C 5 V / 1 A, or PoE on port 1', prov: 'vendor', source: 'ui-flex-mini' } },
      { label: 'Form factor', fact: { value: 'Compact desktop', prov: 'vendor', source: 'ui-flex-mini' } }
    ],
    ports: [
      { group: 'Port 1 (PoE in)', count: 1, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'Ports 2–5', count: 4, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'Power', count: 1, kind: 'USB-C', face: 'rear' }
    ],
    faces: {
      front: 'White rounded box. From the left: a small power LED (about 9% in), port 1 marked PoE IN (12–27%), ports 2–5 in a row (28–88%), and a tiny printed link-LED legend at the right end.',
      rear: 'Plain white, with a single USB-C power socket in the centre under a small power icon.'
    },
    panels: {
      front: {
        frame: 'Port face, 107 × 21 mm.',
        prov: 'inferred',
        source: 'ui-flex-mini',
        zones: [
          { id: 'led', label: 'Power LED', kind: 'led', x0: 0.082, x1: 0.096, y0: 0.38, y1: 0.44 },
          { id: 'p1', label: 'Port 1 · PoE in', kind: 'port', x0: 0.118, x1: 0.273, y0: 0.06, y1: 0.7 },
          { id: 'p2', label: 'Port 2', kind: 'port', x0: 0.276, x1: 0.425, y0: 0.06, y1: 0.7 },
          { id: 'p3', label: 'Port 3', kind: 'port', x0: 0.425, x1: 0.575, y0: 0.06, y1: 0.7 },
          { id: 'p4', label: 'Port 4', kind: 'port', x0: 0.575, x1: 0.725, y0: 0.06, y1: 0.7 },
          { id: 'p5', label: 'Port 5', kind: 'port', x0: 0.725, x1: 0.876, y0: 0.06, y1: 0.7 },
          { id: 'legend', label: 'LED legend', kind: 'label', x0: 0.885, x1: 0.945, y0: 0.23, y1: 0.7 }
        ]
      },
      rear: {
        frame: 'Back face, 107 × 21 mm.',
        prov: 'inferred',
        source: 'ui-flex-mini',
        zones: [{ id: 'usbc', label: 'USB-C power', kind: 'port', x0: 0.455, x1: 0.54, y0: 0.57, y1: 0.73 }]
      }
    },
    seenInPhoto: { value: false, prov: 'inferred', note: 'At the desk, not in the cabinet.' }
  }
];

/**
 * Documented network links only. The U7 Pro's and the Flex Mini's uplinks are not documented
 * (which port, which switch), so they are left out rather than guessed.
 */
export const links: Link[] = [
  {
    from: { device: 'udm-pro', port: 'Port 2 (LAN, RJ45)' },
    to: { device: 'rpi-4b', port: 'Ethernet' },
    speed: '1 GbE',
    medium: 'Copper patch lead',
    prov: 'measured',
    asOf: '2026-09-28',
    note: 'Port assignment read from the gateway’s API. Link rate not recorded; both ends are gigabit. Cable type inferred.'
  },
  {
    from: { device: 'udm-pro', port: 'Port 3 (LAN, RJ45)' },
    to: { device: 'r720xd', port: 'NIC port 1' },
    speed: '1 GbE',
    medium: 'Copper patch lead',
    prov: 'measured',
    asOf: '2026-09-28',
    note: 'Negotiated at 1000 Mb/s. Carries the Proxmox host, its VMs and the iDRAC, which shares this port (shared LOM). NIC ports 2–4 are not cabled.'
  },
  {
    from: { device: 'udm-pro', port: 'Port 11 (SFP+ 2, LAN; lower SFP+ cage)' },
    to: { device: 'unas-pro-8', port: 'SFP+ (port 2 or 3)' },
    speed: '10 GbE',
    prov: 'measured',
    asOf: '2026-09-28',
    note: 'The plan calls it “SFP+ 2”: the UDM Pro’s second SFP+, port 11, the LAN one, which is the lower of the two stacked cages at the right of the front panel (port 10, the SFP+ WAN, is above it). Which UNAS SFP+ cage and whether it is a DAC or optics are not recorded.'
  },
  {
    from: { device: 'udm-pro', port: 'Port 9 (WAN, RJ45)' },
    to: { device: 'isp', port: 'ISP handoff (outside)' },
    speed: '1 GbE',
    prov: 'measured',
    asOf: '2026-09-28',
    note: 'Port 9 is the WAN per the gateway’s port list. 1 GbE is the port’s maximum; the internet plan’s speed is not recorded. The ISP end is off-sheet (see offSheet).'
  }
];

/** Link endpoints that are not devices on these sheets. */
export const offSheet: Record<string, string> = {
  isp: 'Internet service provider (outside the house)'
};

const inCabinet = devices.filter((d) => d.location === 'cabinet');
const racked = inCabinet.filter((d) => d.mount === 'rack');
const uUsed = racked.reduce((sum, d) => sum + (d.heightU ?? 0), 0);

const knownMaxW = inCabinet.reduce((sum, d) => sum + (d.maxPower?.value ?? 0), 0);
const r720PsuOptionsW = [495, 750, 1100] as const;

/** Derived values a drawing might label. All `inferred`; each note says how. */
export const derived = {
  uUsed: {
    value: uUsed,
    prov: 'inferred',
    note: 'Sum of the rack-mounted heights in the assumed layout (shelf 1, patch panel 1, UDM Pro 1, UNAS Pro 8 2, R720xd 2). The Pi sits on the shelf.'
  } satisfies Fact<number>,
  uFree: {
    value: cabinet.heightU - uUsed,
    prov: 'inferred',
    note: '42U minus the units used; about 3U above the shelf is best kept clear for what stands on it.'
  } satisfies Fact<number>,
  railLengthMm: {
    value: Math.round(cabinet.heightU * U * 10) / 10,
    prov: 'inferred',
    note: '42 × 44.45 mm.'
  } satisfies Fact<number>,
  stackTopMm: {
    value: Math.round((cabinet.u1FloorMm?.value ?? 0) + 24 * U),
    prov: 'inferred',
    note: 'Floor to the top of the shelf (U24) in the assumed layout.'
  } satisfies Fact<number>,
  stackBottomMm: {
    value: Math.round((cabinet.u1FloorMm?.value ?? 0) + 17 * U),
    prov: 'inferred',
    note: 'Floor to the bottom of the R720xd (U18) in the assumed layout.'
  } satisfies Fact<number>,
  nameplateKnownW: {
    value: knownMaxW,
    prov: 'inferred',
    note: 'Nameplate maximum, not measured: UDM Pro 33 W + UNAS Pro 8 250 W + the Pi’s 15 W supply rating. Excludes the R720xd, whose PSU wattage is unknown.'
  } satisfies Fact<number>,
  nameplateRangeW: {
    value: { min: knownMaxW + r720PsuOptionsW[0], max: knownMaxW + r720PsuOptionsW[2] },
    prov: 'inferred',
    note: 'Nameplate maximum, not measured: the known total plus one R720xd PSU rating (redundant pair, so one supply’s rating bounds the draw), for the smallest (495 W) and largest (1100 W) option Dell offers.'
  } satisfies Fact<{ min: number; max: number }>,
  rackedMassKg: {
    value: 29.5 + 11.5 + 3.9,
    prov: 'inferred',
    note: 'R720xd at Dell’s maximum-configuration weight + UNAS Pro 8 without drives + UDM Pro. Shelf, panel and the UNAS drives are not included.'
  } satisfies Fact<number>,
  r720xdOverallDepthMm: {
    value: 32 + 723,
    prov: 'inferred',
    note: 'Front of bezel to the PSU handles: 32 mm (Za with bezel) + 723 mm (Zc), Dell Technical Guide Fig 18.'
  } satisfies Fact<number>
};
