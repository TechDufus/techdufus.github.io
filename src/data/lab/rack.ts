/**
 * Sheet 01 · The cabinet, as surveyed: a 42U enclosure whose rails count from the top (U1 is the
 * top), what sits in it, and the documented links between the boxes.
 *
 * Panel zones are traced from each maker's product images. The ONT and the PoE injector are the
 * ISP's and a generic box: their shapes are drawn from the owner's photo.
 */
import type {
  Cabinet,
  Device,
  DeviceId,
  Link,
  ListedRole,
  OffSheetId,
  PanelLayout,
  RackDevice,
  Role,
  ShelfDevice,
  ShelfId,
  URange,
  USpan
} from './types';

/** 1U, EIA-310, mm. */
const U = 44.45;

/** "U10" or "U8–9". */
export const uLabel = ({ top, bottom }: URange): string => (top === bottom ? `U${top}` : `U${top}–${bottom}`);

/** Height of a U range in rack units. */
export const uHeight = ({ top, bottom }: URange): number => bottom - top + 1;

const at = (top: number, bottom = top): { kind: 'rack'; u: URange } => ({ kind: 'rack', u: { top, bottom } });

export const cabinet: Cabinet = {
  heightU: 42,
  uMm: U,
  rackWidthIn: 19,
  numbering: 'top-down',
  outer: { w: 600, h: 1991, d: 1070 },
  railSpan: 750,
  railFloorMm: 70,
  front: { kind: 'glass-door', hinge: 'left' },
  rear: { kind: 'perforated-panel', pattern: 'hex' },
  card: {
    title: 'The cabinet',
    kind: '42U enclosure',
    lines: ['42U, and the rails count from the top: U1 is up there.', 'Glass door at the front, a hex-perforated panel at the back.']
  }
};

/** Shelf face: 2U brackets at each end and the vented tray along the bottom. */
const shelfPanel = (frame: string): PanelLayout => ({
  frame,
  zones: [
    { id: 'ear-l', label: 'Bracket', kind: 'ear', x0: 0, x1: 0.04, y0: 0, y1: 1 },
    { id: 'tray', label: 'Vented tray', kind: 'vent', x0: 0.04, x1: 0.96, y0: 0.84, y1: 1 },
    { id: 'ear-r', label: 'Bracket', kind: 'ear', x0: 0.96, x1: 1, y0: 0, y1: 1 }
  ]
});

/** In the order they sit, top to bottom; the U7 Pro (outside the cabinet) last. */
export const devices: Device[] = [
  {
    id: 'top-shelf',
    name: 'Top shelf',
    short: 'Top shelf',
    model: '2U vented cantilever shelf',
    role: 'shelf',
    placement: at(1, 2),
    body: { w: 482.6, h: 2 * U, d: 250 },
    earsWidth: 482.6,
    panels: { front: shelfPanel('Full 19″ face, 482.6 × 88.9 mm.') },
    card: {
      title: 'Top shelf',
      kind: 'Shelf · U1–2',
      lines: ['The small stuff: the Pi, the ONT and the PoE injector.']
    }
  },
  {
    id: 'rpi-4b',
    name: 'Raspberry Pi 4 Model B',
    short: 'Pi 4B',
    maker: 'Raspberry Pi',
    model: 'Raspberry Pi 4 Model B, 8 GB',
    role: 'edge',
    placement: { kind: 'shelf', shelf: 'top-shelf', x: 150 },
    body: { w: 62, h: 26, d: 92 },
    ports: [
      { group: 'Ethernet', count: 1, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'USB 3.0', count: 2, kind: 'USB-A', face: 'front' },
      { group: 'USB 2.0', count: 2, kind: 'USB-A', face: 'front' }
    ],
    panels: {
      front: {
        frame: 'Port end in its black case, 62 × 26 mm, as seen from the front of the cabinet.',
        zones: [
          { id: 'usb2', label: 'USB 2.0 ×2', kind: 'port', x0: 0.04, x1: 0.28, y0: 0.06, y1: 1 },
          { id: 'usb3', label: 'USB 3.0 ×2 (blue)', kind: 'port', x0: 0.36, x1: 0.6, y0: 0.06, y1: 1 },
          { id: 'eth', label: 'Gigabit Ethernet', kind: 'port', x0: 0.67, x1: 0.96, y0: 0.2, y1: 1 }
        ]
      }
    },
    card: {
      title: 'Raspberry Pi 4 Model B',
      kind: 'Control node · top shelf',
      lines: ['8 GB, in a black case.', 'The control node. Ansible configures it too.', 'Plugged into the gateway’s port 2.']
    }
  },
  {
    id: 'ont',
    name: 'Fiber ONT',
    short: 'ONT',
    model: 'ISP optical network terminal',
    role: 'network',
    placement: { kind: 'shelf', shelf: 'top-shelf', x: 216 },
    body: { w: 160, h: 45, d: 120 },
    panels: {
      front: {
        frame: 'Front face, 160 × 45 mm.',
        zones: [
          { id: 'leds', label: 'Status LEDs', kind: 'led', x0: 0.42, x1: 0.68, y0: 0.06, y1: 0.16 },
          { id: 'vents', label: 'Vents', kind: 'vent', x0: 0.04, x1: 0.96, y0: 0.26, y1: 0.92 }
        ]
      }
    },
    card: {
      title: 'Fiber ONT',
      kind: 'From the ISP · top shelf',
      lines: ['Optical network terminal: fiber in, Ethernet out.', 'Feeds the gateway’s WAN port.']
    }
  },
  {
    id: 'poe-injector',
    name: 'PoE injector',
    short: 'PoE injector',
    model: 'PoE injector',
    role: 'network',
    placement: { kind: 'shelf', shelf: 'top-shelf', x: 380 },
    body: { w: 60, h: 32, d: 110 },
    ports: [
      { group: 'LAN in', count: 1, kind: 'RJ45', face: 'front' },
      { group: 'PoE out', count: 1, kind: 'RJ45', face: 'front' }
    ],
    panels: {
      front: {
        frame: 'Port end, 60 × 32 mm.',
        zones: [
          { id: 'lan', label: 'LAN in', kind: 'port', x0: 0.12, x1: 0.46, y0: 0.34, y1: 0.86 },
          { id: 'poe', label: 'PoE out', kind: 'port', x0: 0.54, x1: 0.88, y0: 0.34, y1: 0.86 }
        ]
      }
    },
    card: {
      title: 'PoE injector',
      kind: 'Power over Ethernet · top shelf',
      lines: ['Powers the U7 Pro down its network cable.', 'Network in from the gateway, power and network out.']
    }
  },
  {
    id: 'unas-pro-8',
    name: 'UniFi UNAS Pro 8',
    short: 'UNAS Pro 8',
    maker: 'Ubiquiti',
    model: 'UNAS-Pro-8',
    role: 'storage',
    placement: at(8, 9),
    body: { w: 442.4, h: 87.4, d: 480 },
    earsWidth: 482.6,
    ports: [
      { group: '10 GbE (port 1)', count: 1, kind: 'RJ45', speed: '10 GbE', face: 'rear' },
      { group: 'SFP+ (ports 2–3)', count: 2, kind: 'SFP+', speed: '10 GbE', face: 'rear' },
      { group: 'Power', count: 2, kind: 'AC inlet (PSU modules)', face: 'rear' }
    ],
    panels: {
      front: {
        frame: 'Body face 442.4 × 87.4 mm.',
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
    card: {
      title: 'UniFi UNAS Pro 8',
      kind: 'NAS · U8–9',
      lines: ['Eight drive bays of shared storage.', 'Serves NFS to the lab.', '10 GbE to the gateway over SFP+.']
    }
  },
  {
    id: 'udm-pro',
    name: 'UniFi Dream Machine Pro',
    short: 'UDM Pro',
    maker: 'Ubiquiti',
    model: 'UDM-Pro',
    role: 'network',
    placement: at(10),
    body: { w: 442.4, h: 43.7, d: 285.6 },
    earsWidth: 482.6,
    ports: [
      { group: 'LAN (ports 1–8)', count: 8, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'WAN (port 9)', count: 1, kind: 'RJ45', speed: '1 GbE', face: 'front' },
      { group: 'WAN (port 10, SFP+)', count: 1, kind: 'SFP+', speed: '10 GbE', face: 'front' },
      { group: 'LAN (port 11, SFP+)', count: 1, kind: 'SFP+', speed: '10 GbE', face: 'front' },
      { group: 'Power', count: 1, kind: 'AC inlet', face: 'rear' },
      { group: 'Redundant power', count: 1, kind: 'DC input', face: 'rear' }
    ],
    panels: {
      front: {
        frame: 'Body face 442.4 × 43.7 mm, without rack brackets.',
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
        zones: [
          { id: 'rps', label: 'Redundant power input', kind: 'port', x0: 0.039, x1: 0.184, y0: 0.46, y1: 0.9 },
          { id: 'reg-label', label: 'Label', kind: 'label', x0: 0.72, x1: 0.81, y0: 0.4, y1: 0.73 },
          { id: 'ac', label: 'AC inlet', kind: 'port', x0: 0.855, x1: 0.927, y0: 0.29, y1: 0.85 }
        ]
      }
    },
    card: {
      title: 'UniFi Dream Machine Pro',
      kind: 'Gateway · U10',
      lines: [
        'Router and firewall. Everything else hangs off it.',
        'WAN on port 9, to the ONT.',
        'Port 2: the Pi. Port 3: the server.',
        'SFP+ port 11: the NAS, at 10 GbE.'
      ]
    }
  },
  {
    id: 'r720xd',
    name: 'Dell PowerEdge R720xd',
    short: 'R720xd',
    maker: 'Dell',
    model: 'PowerEdge R720xd (24 × 2.5″ + 2 rear)',
    role: 'compute',
    placement: at(13, 14),
    body: { w: 444.0, h: 87.3, d: 684.0 },
    earsWidth: 482.4,
    ports: [
      { group: 'VGA (front)', count: 1, kind: 'DB-15 VGA', face: 'front' },
      { group: 'USB (front)', count: 1, kind: 'USB-A', speed: 'USB 2.0', face: 'front' },
      { group: 'NIC ports 1–4', count: 4, kind: 'RJ45', speed: '1 GbE', face: 'rear' },
      { group: 'iDRAC port', count: 1, kind: 'RJ45', face: 'rear' },
      { group: 'Serial', count: 1, kind: 'DB-9', face: 'rear' },
      { group: 'VGA (rear)', count: 1, kind: 'DB-15 VGA', face: 'rear' },
      { group: 'USB (rear)', count: 2, kind: 'USB-A', speed: 'USB 2.0', face: 'rear' },
      { group: 'PSU inlets', count: 2, kind: 'AC inlet', face: 'rear' }
    ],
    panels: {
      front: {
        frame: 'Overall face 482.4 mm including rack ears: body (444.0 mm) spans 0.04 → 0.96. Height 87.3 mm.',
        zones: [
          { id: 'ear-l', label: 'Left control panel', kind: 'ear', x0: 0, x1: 0.04, y0: 0, y1: 1 },
          { id: 'power', label: 'Power button', kind: 'button', x0: 0.006, x1: 0.026, y0: 0.12, y1: 0.23 },
          { id: 'nmi', label: 'NMI button', kind: 'button', x0: 0.026, x1: 0.034, y0: 0.2, y1: 0.25 },
          { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.012, x1: 0.024, y0: 0.29, y1: 0.33 },
          { id: 'diag', label: 'Diagnostic indicators', kind: 'led', x0: 0.006, x1: 0.034, y0: 0.36, y1: 0.49 },
          { id: 'tag', label: 'Information tag', kind: 'label', x0: 0.13, x1: 0.2, y0: 0.01, y1: 0.05 },
          { id: 'bays', label: 'Bays 0–23', kind: 'bay', x0: 0.04, x1: 0.96, y0: 0.06, y1: 0.97 },
          { id: 'ear-r', label: 'Right I/O panel', kind: 'ear', x0: 0.96, x1: 1, y0: 0, y1: 1 },
          { id: 'vga', label: 'VGA', kind: 'port', x0: 0.968, x1: 0.99, y0: 0.1, y1: 0.32 },
          { id: 'usb', label: 'USB 2.0', kind: 'port', x0: 0.966, x1: 0.992, y0: 0.44, y1: 0.51 }
        ]
      },
      rear: {
        frame: 'Rear face as seen from behind, body width 444.0 mm, height 87.3 mm.',
        zones: [
          { id: 'slot-1', label: 'Slot 1', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.09, y1: 0.25 },
          { id: 'slot-2', label: 'Slot 2', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.31, y1: 0.48 },
          { id: 'slot-3', label: 'Slot 3', kind: 'slot', x0: 0.083, x1: 0.22, y0: 0.55, y1: 0.71 },
          { id: 'slot-4', label: 'Slot 4', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.09, y1: 0.25 },
          { id: 'slot-5', label: 'Slot 5', kind: 'slot', x0: 0.273, x1: 0.478, y0: 0.31, y1: 0.47 },
          { id: 'handle', label: 'Handle', kind: 'vent', x0: 0.271, x1: 0.537, y0: 0.58, y1: 0.67 },
          { id: 'slot-6', label: 'Slot 6', kind: 'slot', x0: 0.549, x1: 0.751, y0: 0.09, y1: 0.235 },
          { id: 'vflash', label: 'vFlash slot', kind: 'slot', x0: 0.808, x1: 0.873, y0: 0.12, y1: 0.19 },
          { id: 'rear-bay-24', label: 'Rear bay 24', kind: 'bay', x0: 0.556, x1: 0.72, y0: 0.28, y1: 0.47 },
          { id: 'rear-bay-25', label: 'Rear bay 25', kind: 'bay', x0: 0.73, x1: 0.888, y0: 0.28, y1: 0.47 },
          { id: 'psu-1', label: 'PSU 1', kind: 'psu', x0: 0.556, x1: 0.746, y0: 0.51, y1: 0.95 },
          { id: 'psu-2', label: 'PSU 2', kind: 'psu', x0: 0.751, x1: 0.941, y0: 0.51, y1: 0.95 },
          { id: 'sysid', label: 'System ID button', kind: 'button', x0: 0.063, x1: 0.083, y0: 0.76, y1: 0.87 },
          { id: 'sysid-conn', label: 'System ID connector', kind: 'port', x0: 0.085, x1: 0.102, y0: 0.76, y1: 0.87 },
          { id: 'idrac', label: 'iDRAC port', kind: 'port', x0: 0.109, x1: 0.144, y0: 0.74, y1: 0.9 },
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
    card: {
      title: 'Dell PowerEdge R720xd',
      kind: 'Server · U13–14',
      lines: [
        '2 × Xeon E5-2690 v2: 40 threads, 128 GB RAM.',
        'Proxmox VE 9.2 on ZFS, six drives behind an HBA330.',
        'The firmware says R720. The 26 bays say otherwise.'
      ]
    },
    sheetHref: '/lab/r720xd/'
  },
  {
    id: 'bottom-shelf',
    name: 'Bottom shelf',
    short: 'Bottom shelf',
    model: '2U vented cantilever shelf',
    role: 'shelf',
    placement: at(41, 42),
    body: { w: 482.6, h: 2 * U, d: 250 },
    earsWidth: 482.6,
    panels: { front: shelfPanel('Full 19″ face, 482.6 × 88.9 mm.') },
    card: {
      title: 'Bottom shelf',
      kind: 'Shelf · U41–42',
      lines: ['Storage for the storage: a spare drive and a bundle of patch cables.']
    }
  },
  {
    id: 'spare-drive',
    name: 'Spare 2.5″ drive',
    short: 'Spare drive',
    model: '2.5″ drive in a Dell caddy',
    role: 'shelf',
    placement: { kind: 'shelf', shelf: 'bottom-shelf', x: 100 },
    body: { w: 85, h: 16, d: 145 },
    card: {
      title: 'Spare drive',
      kind: 'Spare · bottom shelf',
      lines: ['A 2.5″ drive in a Dell caddy, in its box.']
    }
  },
  {
    id: 'patch-cables',
    name: 'Patch cables',
    short: 'Patch cables',
    model: 'Bundle of white patch cables',
    role: 'shelf',
    placement: { kind: 'shelf', shelf: 'bottom-shelf', x: 275 },
    body: { w: 110, h: 30, d: 160 },
    card: {
      title: 'Patch cables',
      kind: 'Spares · bottom shelf',
      lines: ['A bundle of white patch cables, waiting for a job.']
    }
  },
  {
    id: 'u7-pro',
    name: 'UniFi U7 Pro',
    short: 'U7 Pro',
    maker: 'Ubiquiti',
    model: 'U7-Pro',
    role: 'network',
    placement: { kind: 'elsewhere', where: 'On a ceiling or wall, outside the cabinet' },
    body: { w: 206, h: 46, d: 206 },
    ports: [{ group: 'Uplink', count: 1, kind: 'RJ45 (PoE+ in)', speed: '2.5 GbE', face: 'rear' }],
    card: {
      title: 'UniFi U7 Pro',
      kind: 'Access point · off-sheet',
      lines: ['The Wi-Fi 7 access point.', 'Lives outside the cabinet; the PoE injector powers it.']
    }
  }
];

/* Every id once; a racked device's card names its own U range. */
{
  const seen = new Set<DeviceId>();
  for (const d of devices) {
    if (seen.has(d.id)) throw new Error(`rack.ts: duplicate device id ${d.id}`);
    seen.add(d.id);
    if (d.placement.kind === 'rack' && !d.card.kind?.endsWith(uLabel(d.placement.u))) {
      throw new Error(`rack.ts: ${d.id} card kind should end with ${uLabel(d.placement.u)}`);
    }
  }
}

export const device = (id: DeviceId): Device => {
  const d = devices.find((x) => x.id === id);
  if (!d) throw new Error(`rack.ts: no device ${id}`);
  return d;
};

const isRack = (d: Device): d is RackDevice => d.placement.kind === 'rack';
const isShelf = (d: Device): d is ShelfDevice => d.placement.kind === 'shelf';

/** Everything on the rails, top to bottom. */
export const rackDevices: RackDevice[] = devices.filter(isRack).sort((a, b) => a.placement.u.top - b.placement.u.top);

/** What stands on a shelf, left to right. */
export const shelfItems = (shelf: ShelfId): ShelfDevice[] =>
  devices.filter(isShelf).filter((d) => d.placement.shelf === shelf).sort((a, b) => a.placement.x - b.placement.x);

/** Every U from 1 to 42, as runs: each racked device, and the empty space between them. */
export const uMap: USpan[] = (() => {
  const spans: USpan[] = [];
  let next = 1;
  for (const d of rackDevices) {
    const { top, bottom } = d.placement.u;
    if (top < next) throw new Error(`rack.ts: ${d.id} overlaps ${uLabel({ top, bottom })}`);
    if (top > next) spans.push({ u: { top: next, bottom: top - 1 } });
    spans.push({ u: { top, bottom }, device: d.id });
    next = bottom + 1;
  }
  if (next <= cabinet.heightU) spans.push({ u: { top: next, bottom: cabinet.heightU } });
  return spans;
})();

/** Documented links only. */
export const links: Link[] = [
  {
    id: 'gw-pi',
    from: { device: 'udm-pro', port: 'Port 2' },
    to: { device: 'rpi-4b', port: 'Ethernet' },
    speed: '1 GbE',
    medium: 'copper'
  },
  {
    id: 'gw-server',
    from: { device: 'udm-pro', port: 'Port 3' },
    to: { device: 'r720xd', port: 'NIC 1' },
    speed: '1 GbE',
    medium: 'copper'
  },
  {
    id: 'gw-nas',
    from: { device: 'udm-pro', port: 'Port 11 · SFP+ LAN' },
    to: { device: 'unas-pro-8', port: 'SFP+' },
    speed: '10 GbE',
    medium: 'sfp+'
  },
  {
    id: 'gw-ont',
    from: { device: 'udm-pro', port: 'Port 9 · WAN' },
    to: { device: 'ont', port: 'Ethernet' },
    speed: '1 GbE',
    medium: 'copper'
  },
  {
    id: 'ont-isp',
    from: { device: 'ont', port: 'Fiber' },
    to: { device: 'isp' },
    medium: 'fiber',
    offSheet: true
  },
  {
    id: 'gw-injector',
    from: { device: 'udm-pro' },
    to: { device: 'poe-injector', port: 'LAN in' },
    medium: 'copper'
  },
  {
    id: 'injector-ap',
    from: { device: 'poe-injector', port: 'PoE out' },
    to: { device: 'u7-pro', port: 'Uplink' },
    medium: 'poe',
    offSheet: true
  }
];

/** Link ends that aren't devices on these sheets. */
export const offSheet: Record<OffSheetId, string> = {
  isp: 'The internet provider'
};

export const roleLabels: Record<Role, string> = {
  compute: 'Compute',
  network: 'Network',
  storage: 'Storage',
  edge: 'Edge',
  shelf: 'Shelves'
};

/** The /lab list: which devices each role shows, in order. Shelves and spares stay off it. */
const listed: Record<ListedRole, DeviceId[]> = {
  compute: ['r720xd'],
  network: ['udm-pro', 'u7-pro', 'ont', 'poe-injector'],
  storage: ['unas-pro-8'],
  edge: ['rpi-4b']
};

for (const d of devices) {
  if (d.role !== 'shelf' && !listed[d.role].includes(d.id)) throw new Error(`rack.ts: ${d.id} missing from the /lab list`);
}

/** The devices grouped Compute / Network / Storage / Edge, for the /lab list. */
export const devicesByRole = (): { role: ListedRole; label: string; devices: Device[] }[] =>
  (Object.keys(listed) as ListedRole[]).map((role) => ({
    role,
    label: roleLabels[role],
    devices: listed[role].map(device)
  }));

const uUsed = rackDevices.reduce((sum, d) => sum + uHeight(d.placement.u), 0);

/** Counts a drawing or the /lab hero might print. The shelves count: 2U each. */
export const derived = {
  uUsed,
  uFree: cabinet.heightU - uUsed,
  /** 42 × 44.45 mm. */
  railLengthMm: Math.round(cabinet.heightU * U * 10) / 10
};
