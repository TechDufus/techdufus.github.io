/**
 * Sheet 02 · The server. The Dell PowerEdge R720xd in depth, and the planned swap from the
 * PERC H710P Mini (hardware RAID) to a Dell HBA330 (pass-through) with ZFS on top.
 *
 * The swap has not happened yet: the HBA330 arrived 2026-09-28 and everything under "after"
 * is the plan. Measurements were read over SSH, IPMI and Redfish, 2026-09-25 to 2026-09-28.
 */
import { sources as allSources } from './rack';
import type { SourceKey } from './rack';
import type { Cpu, Fact, ServerDetail, Source } from './types';

const HOURS_PER_YEAR = 8766; // 365.25 × 24

const years = (hours: Fact<number>): Fact<number> => ({
  value: Math.round((hours.value / HOURS_PER_YEAR) * 10) / 10,
  prov: 'inferred',
  note: `${hours.value.toLocaleString('en-US')} power-on hours ÷ 8,766 h per year.`
});

const hours = {
  st300mp0004: {
    value: 55559,
    prov: 'measured',
    asOf: '2026-09-28',
    note: 'Later reading; it showed 55,486 h on 2026-09-25.'
  },
  st9300653ss: { value: 10248, prov: 'measured', asOf: '2026-09-25' },
  mx500_1tb: { value: 33200, prov: 'measured', asOf: '2026-09-25' },
  mx500_500a: { value: 34679, prov: 'measured', asOf: '2026-09-25' },
  mx500_500b: { value: 34997, prov: 'measured', asOf: '2026-09-25' },
  gigastoneA: { value: 33906, prov: 'measured', asOf: '2026-09-25' },
  gigastoneB: { value: 32420, prov: 'measured', asOf: '2026-09-25' }
} satisfies Record<string, Fact<number>>;

const HEALTH_DATE = '2026-09-27';
const HEALTH_NOTE = 'Health read 2026-09-27/28.';

export const r720xd: ServerDetail = {
  id: 'r720xd',
  identity: {
    name: 'Dell PowerEdge R720xd',
    firmwareSays: {
      value: 'PowerEdge R720',
      prov: 'measured',
      asOf: '2026-09-25',
      note: 'What the firmware (DMI) and the iDRAC report.'
    },
    isXd: {
      value: 'R720xd: 24 × 2.5″ bays at the front and 2 × 2.5″ flex bays at the back',
      prov: 'inferred',
      source: 'dell-r720-tg',
      note: 'The owner counted 24 front and 2 rear bays (2026-09-28). Only the R720xd offers 24 + 2 (Technical Guide p.28, Table 11); the R720 tops out at 16. The six PCIe slots also match the R720xd risers.'
    },
    howToTell: [
      'A row of diagnostic indicators on the front left ear, and no LCD panel (the LCD is R720-only).',
      'One USB port on the front right ear.',
      'Two 2.5″ drive bays above the power supplies at the back.',
      'In F2 System BIOS there is no “SATA Settings” menu on an R720xd.'
    ]
  },
  cpus: (['CPU1', 'CPU2'] as const).map((socket): Cpu => ({
    socket,
    model: { value: 'Intel Xeon E5-2690 v2', prov: 'measured', asOf: '2026-09-25' },
    specs: [
      { label: 'Code name', fact: { value: 'Ivy Bridge EP, 22 nm', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'Cores / threads', fact: { value: '10 / 20', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'Base / turbo', fact: { value: '3.00 GHz / 3.60 GHz', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'Cache', fact: { value: '25 MB', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'TDP', fact: { value: '130 W', prov: 'vendor', source: 'intel-e5-2690v2' } },
      {
        label: 'Vector extensions',
        fact: {
          value: 'AVX only (no AVX2)',
          prov: 'vendor',
          source: 'intel-e5-2690v2',
          note: 'Intel lists “Intel AVX” as the only instruction-set extension, so software built for x86-64-v3 will not run.'
        }
      },
      { label: 'Memory', fact: { value: 'DDR3 up to 1866, 4 channels, up to 768 GB', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'PCIe', fact: { value: 'PCIe 3.0, 40 lanes', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'Socket', fact: { value: 'FCLGA2011', prov: 'vendor', source: 'intel-e5-2690v2' } },
      { label: 'Launched', fact: { value: 'Q3 2013 (discontinued)', prov: 'vendor', source: 'intel-e5-2690v2' } }
    ]
  })),
  threads: { value: 40, prov: 'measured', asOf: '2026-09-25', note: '2 sockets × 10 cores × 2 threads.' },
  memory: {
    ownerStated: {
      value: '256 GB ECC',
      prov: 'owner',
      note: 'From the owner’s setup notes (the site’s /docs/setup/ page).'
    },
    usable: { value: '125 GiB usable', prov: 'measured', asOf: '2026-09-27' },
    usedAt: { value: '56 GiB in use', prov: 'measured', asOf: '2026-09-27' },
    resolved: false,
    explanations: [
      'BIOS memory mirroring would halve usable memory: half of 256 GiB is 128 GiB, and 125 GiB usable is about that less firmware and kernel reservations.',
      'Or DIMMs are missing or disabled, and about 128 GB is actually fitted.',
      'Neither is confirmed; F2 System Setup → Memory Settings, or a look at the DIMM slots, would settle it.'
    ],
    slots: { value: 24, prov: 'vendor', source: 'dell-r720-tg', note: '12 per processor.' },
    maxSupported: { value: 'Up to 768 GB DDR3 (24 × 32 GB), up to 1866 MT/s', prov: 'vendor', source: 'dell-r720-tg' }
  },
  bays: {
    front: { value: 24, prov: 'owner', asOf: '2026-09-28', note: '2.5″ hot-plug bays, counted by the owner.' },
    rear: { value: 2, prov: 'owner', asOf: '2026-09-28', note: '2.5″ hot-plug “flex” bays, one above each PSU.' },
    numbering: {
      value: 'Front bays in one row, 0 at the far left to 23 at the far right',
      prov: 'vendor',
      source: 'dell-r720-om',
      note: 'Owner’s Manual p.10, Fig 4.'
    },
    rearNumbering: {
      value: 'Rear bays are 24 and 25',
      prov: 'measured',
      asOf: '2026-09-25',
      note: 'The iDRAC names the rear drives 0:1:24 (the good ST300MP0004) and 0:1:25 (the failing ST9300653SS).'
    },
    rearSideUnknown:
      'Dell does not document which rear bay is 24 and which is 25. Identify them by their LEDs and labels; a drawing that puts 24 on the left is not a claim.',
    carrierLeds: {
      value: 'Two LEDs per carrier: activity (green) and, on the right, status (green/amber). Steady green = online; blinks green, amber, off = predicted failure; blinks amber 4×/s = failed; off = safe to remove.',
      prov: 'vendor',
      source: 'dell-r720-om',
      note: 'Owner’s Manual p.15. Shown by a RAID controller; the HBA may not drive them.'
    }
  },
  drives: [
    {
      id: 'gigastone-1',
      label: 'Gigastone 256 GB SSD #1',
      maker: 'Gigastone',
      model: '256 GB SATA SSD',
      kind: 'ssd',
      fate: 'keep',
      pool: 'rpool',
      bay: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'In a front bay; which one is not recorded.' },
      suggestedBay: { value: 0, prov: 'assumed', note: 'Suggested tidy layout; ZFS finds disks by serial number, not by bay.' },
      osSize: { value: '~238 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        {
          label: 'Interface',
          fact: {
            value: 'SATA',
            prov: 'measured',
            asOf: HEALTH_DATE,
            note: 'No manufacturer datasheet found for this exact drive; its product line is not recorded.'
          }
        }
      ],
      health: { value: 'SMART passed; 6 remapped sectors', prov: 'measured', asOf: HEALTH_DATE, note: HEALTH_NOTE },
      hours: hours.gigastoneA,
      hoursYears: years(hours.gigastoneA),
      remapped: { value: 6, prov: 'measured', asOf: HEALTH_DATE },
      notes: [
        'The PERC holds both Gigastones in state “Foreign” and reset them in August 2026, which is why the iDRAC health reads Critical.',
        'SMART still passes with no pending sectors, so they are unreliable behind the RAID card rather than dead.'
      ]
    },
    {
      id: 'gigastone-2',
      label: 'Gigastone 256 GB SSD #2',
      maker: 'Gigastone',
      model: '256 GB SATA SSD',
      kind: 'ssd',
      fate: 'keep',
      pool: 'rpool',
      bay: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'In a front bay; which one is not recorded.' },
      suggestedBay: { value: 1, prov: 'assumed', note: 'Suggested tidy layout.' },
      osSize: { value: '~238 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        {
          label: 'Interface',
          fact: { value: 'SATA', prov: 'measured', asOf: HEALTH_DATE, note: 'No manufacturer datasheet found for this exact drive.' }
        }
      ],
      health: { value: 'SMART passed; 22 remapped sectors', prov: 'measured', asOf: HEALTH_DATE, note: HEALTH_NOTE },
      hours: hours.gigastoneB,
      hoursYears: years(hours.gigastoneB),
      remapped: { value: 22, prov: 'measured', asOf: HEALTH_DATE },
      notes: ['The PERC dropped this one as “not functioning correctly” in August 2026.']
    },
    {
      id: 'st300mp0004',
      label: 'Seagate ST300MP0004 (15k SAS)',
      maker: 'Seagate',
      model: 'ST300MP0004 (Enterprise Performance 15K v4)',
      kind: 'hdd',
      fate: 'keep',
      pool: 'rpool',
      bay: { value: 24, prov: 'measured', asOf: '2026-09-25', note: 'iDRAC slot 0:1:24; physical side unknown.' },
      suggestedBay: { value: 24, prov: 'assumed', note: 'Stays where it is.' },
      osSize: { value: '~279 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        { label: 'Capacity', fact: { value: '300 GB', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Interface', fact: { value: '6 Gb/s SAS', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Spindle', fact: { value: '15,000 rpm, 2.0 ms average latency', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Sustained transfer', fact: { value: '168–228 MB/s', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Cache', fact: { value: '128 MB', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Average operating power', fact: { value: '7.6 W', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'Form factor', fact: { value: '2.5″, 15 mm', prov: 'vendor', source: 'seagate-ep15k-v4' } },
        { label: 'AFR', fact: { value: '0.44%', prov: 'vendor', source: 'seagate-ep15k-v4' } }
      ],
      health: {
        value: 'OK: 0 grown defects, 0 unrecoverable errors',
        prov: 'measured',
        asOf: '2026-09-28',
        note: HEALTH_NOTE
      },
      hours: hours.st300mp0004,
      hoursYears: years(hours.st300mp0004),
      remapped: { value: 0, prov: 'measured', asOf: '2026-09-28' },
      unrecoverable: { value: 0, prov: 'measured', asOf: '2026-09-28' },
      notes: [
        'Joins rpool as its third copy after the install: the installer refuses mirror members more than 10% apart in size (~238 vs ~279 GiB).'
      ]
    },
    {
      id: 'mx500-500-1',
      label: 'Crucial MX500 500 GB #1',
      maker: 'Crucial',
      model: 'CT500MX500SSD1',
      kind: 'ssd',
      fate: 'keep',
      pool: 'fast',
      bay: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'In a front bay; which one is not recorded.' },
      suggestedBay: { value: 2, prov: 'assumed', note: 'Suggested tidy layout.' },
      osSize: { value: '~465.8 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        { label: 'Interface', fact: { value: 'SATA 6 Gb/s, 2.5″ 7 mm', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Sequential read / write', fact: { value: '560 / 510 MB/s', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Endurance', fact: { value: '180 TBW (98 GB/day for 5 years)', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'MTTF', fact: { value: '1.8 million hours', prov: 'vendor', source: 'crucial-mx500' } }
      ],
      health: { value: 'SMART passed; 64% life left', prov: 'measured', asOf: HEALTH_DATE, note: HEALTH_NOTE },
      hours: hours.mx500_500a,
      hoursYears: years(hours.mx500_500a),
      lifeLeftPct: { value: 64, prov: 'measured', asOf: HEALTH_DATE },
      notes: ['Holds every VM disk today.']
    },
    {
      id: 'mx500-500-2',
      label: 'Crucial MX500 500 GB #2',
      maker: 'Crucial',
      model: 'CT500MX500SSD1',
      kind: 'ssd',
      fate: 'keep',
      pool: 'fast',
      bay: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'In a front bay; which one is not recorded.' },
      suggestedBay: { value: 3, prov: 'assumed', note: 'Suggested tidy layout.' },
      osSize: { value: '~465.8 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        { label: 'Interface', fact: { value: 'SATA 6 Gb/s, 2.5″ 7 mm', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Sequential read / write', fact: { value: '560 / 510 MB/s', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Endurance', fact: { value: '180 TBW (98 GB/day for 5 years)', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'MTTF', fact: { value: '1.8 million hours', prov: 'vendor', source: 'crucial-mx500' } }
      ],
      health: { value: 'SMART passed; 90% life left', prov: 'measured', asOf: HEALTH_DATE, note: HEALTH_NOTE },
      hours: hours.mx500_500b,
      hoursYears: years(hours.mx500_500b),
      lifeLeftPct: { value: 90, prov: 'measured', asOf: HEALTH_DATE }
    },
    {
      id: 'mx500-1tb',
      label: 'Crucial MX500 1 TB',
      maker: 'Crucial',
      model: 'CT1000MX500SSD1',
      kind: 'ssd',
      fate: 'keep',
      pool: 'bulk',
      bay: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'In a front bay; which one is not recorded.' },
      suggestedBay: { value: 4, prov: 'assumed', note: 'Suggested tidy layout.' },
      osSize: { value: '~931.5 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        { label: 'Interface', fact: { value: 'SATA 6 Gb/s, 2.5″ 7 mm', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Sequential read / write', fact: { value: '560 / 510 MB/s', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'Endurance', fact: { value: '360 TBW (197 GB/day for 5 years)', prov: 'vendor', source: 'crucial-mx500' } },
        { label: 'MTTF', fact: { value: '1.8 million hours', prov: 'vendor', source: 'crucial-mx500' } }
      ],
      health: { value: 'SMART passed; 84% life left', prov: 'measured', asOf: HEALTH_DATE, note: HEALTH_NOTE },
      hours: hours.mx500_1tb,
      hoursYears: years(hours.mx500_1tb),
      lifeLeftPct: { value: 84, prov: 'measured', asOf: HEALTH_DATE }
    },
    {
      id: 'st9300653ss',
      label: 'Seagate ST9300653SS (15k SAS)',
      maker: 'Seagate',
      model: 'ST9300653SS (Savvio 15K.3)',
      kind: 'hdd',
      fate: 'remove',
      pool: null,
      bay: { value: 25, prov: 'measured', asOf: '2026-09-25', note: 'iDRAC slot 0:1:25; physical side unknown.' },
      osSize: { value: '~279 GiB', prov: 'measured', asOf: HEALTH_DATE },
      vendor: [
        { label: 'Capacity', fact: { value: '300 GB', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Interface', fact: { value: '6 Gb/s SAS', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Spindle', fact: { value: '15,000 rpm, 2.0 ms average latency', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Sustained transfer', fact: { value: '202–151 MB/s (outer to inner)', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Cache', fact: { value: '64 MB', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Average operating power', fact: { value: '7.92 W', prov: 'vendor', source: 'seagate-savvio-15k3' } },
        { label: 'Form factor', fact: { value: '2.5″, 15 mm', prov: 'vendor', source: 'seagate-savvio-15k3' } }
      ],
      health: {
        value: 'FAILING: its own health check reads “HARDWARE IMPENDING FAILURE”',
        prov: 'measured',
        asOf: HEALTH_DATE,
        note: 'The PERC also flags it as failure predicted.'
      },
      hours: hours.st9300653ss,
      hoursYears: years(hours.st9300653ss),
      remapped: { value: 16, prov: 'measured', asOf: HEALTH_DATE, note: 'Grown defects (remapped bad sectors).' },
      unrecoverable: { value: 20, prov: 'measured', asOf: HEALTH_DATE, note: 'Unrecoverable read errors.' },
      notes: ['Removed for good, not replaced. Half of today’s RAID1 boot pair.']
    }
  ],
  pools: [
    {
      id: 'rpool',
      role: 'boot',
      layout: {
        value: '3-way mirror: 2 × Gigastone 256 GB SSD + 1 × ST300MP0004 300 GB 15k SAS',
        prov: 'owner',
        asOf: '2026-09-28'
      },
      members: ['gigastone-1', 'gigastone-2', 'st300mp0004'],
      usable: {
        value: 'about 220 GiB',
        prov: 'inferred',
        note: 'Planned: the installer’s hdsize is set to 220 GiB so any SSD of 240 GB or more can replace a member.'
      },
      holds: { value: 'Proxmox itself, ISOs', prov: 'owner', asOf: '2026-09-28' },
      why: [
        'Three disks because the Gigastones were unreliable behind the old RAID card (6 and 22 remapped sectors; the card dropped one in August 2026). If both fail, the server still runs and boots from the SAS drive.',
        'The SAS drive joins after the install: the installer refuses a mirror whose disks differ in size by more than 10%.'
      ]
    },
    {
      id: 'fast',
      role: 'VM disks',
      layout: { value: 'mirror: 2 × Crucial MX500 500 GB', prov: 'owner', asOf: '2026-09-28' },
      members: ['mx500-500-1', 'mx500-500-2'],
      usable: { value: 'about 450 GiB', prov: 'inferred', note: 'Planned; a mirror gives the size of one member (~465.8 GiB) less ZFS overhead.' },
      holds: { value: 'VM disks: Talos/Kubernetes, databases', prov: 'owner', asOf: '2026-09-28' },
      why: [
        'A mirror keeps VM disks online through one drive failure.',
        'The MX500s lack full power-loss protection; an fsync test decides whether data-centre SSDs are needed later.'
      ]
    },
    {
      id: 'bulk',
      role: 'scratch',
      layout: { value: 'single: 1 × Crucial MX500 1 TB', prov: 'owner', asOf: '2026-09-28' },
      members: ['mx500-1tb'],
      usable: { value: 'about 930 GiB', prov: 'inferred', note: 'Planned; one ~931.5 GiB disk, no redundancy.' },
      holds: { value: 'scratch, sandboxes, backup staging', prov: 'owner', asOf: '2026-09-28' },
      why: ['Losing it costs nothing, so one disk is enough. A second 1 TB SSD later would make it a mirror.']
    }
  ],
  controllers: {
    before: {
      id: 'perc-h710p-mini',
      name: 'PERC H710P Mini',
      state: 'before',
      status: {
        value: 'Installed, in RAID mode, with its cache battery; comes out in the swap',
        prov: 'measured',
        asOf: '2026-09-25',
        note: 'The OS sees four PERC virtual disks, not the drives.'
      },
      specs: [
        { label: 'Form factor', fact: { value: 'Mini monolithic, in the system-board storage slot (J_STORAGE)', prov: 'vendor', source: 'dell-r720-om' } },
        { label: 'Controller', fact: { value: 'LSI 2208 (SAS2208) RAID-on-Chip, 8 ports', prov: 'vendor', source: 'dell-perc-h710p-ug' } },
        { label: 'Cache', fact: { value: '1 GB DDR3 1333 MHz, non-volatile', prov: 'vendor', source: 'dell-perc-h710p-ug' } },
        { label: 'Battery', fact: { value: 'Backup battery unit, on the card', prov: 'vendor', source: 'dell-perc-h710p-ug' } },
        { label: 'RAID levels', fact: { value: '0, 1, 5, 6, 10, 50, 60', prov: 'vendor', source: 'dell-perc-h710p-ug' } },
        { label: 'Drive link', fact: { value: 'SAS 2.0, up to 6 Gb/s', prov: 'vendor', source: 'dell-perc-h710p-ug' } },
        {
          label: 'Non-RAID (pass-through)',
          fact: { value: 'Not supported (only the H310 offers it in this family)', prov: 'vendor', source: 'dell-perc-h710p-ug' }
        },
        { label: 'Cabling', fact: { value: 'No ports on the card: its cable starts at system-board J_SASX8', prov: 'vendor', source: 'dell-r720-om' } },
        { label: 'Linux driver', fact: { value: 'megaraid_sas', prov: 'measured', asOf: '2026-09-25' } }
      ]
    },
    after: {
      id: 'hba330',
      name: 'Dell HBA330 Adapter',
      state: 'after',
      status: {
        value: 'Delivered 2026-09-28; not installed yet',
        prov: 'owner',
        asOf: '2026-09-28'
      },
      specs: [
        { label: 'Part number', fact: { value: 'J7TNV', prov: 'owner', asOf: '2026-09-26', note: 'The part ordered.' } },
        { label: 'Controller', fact: { value: 'LSI 3008 (SAS3008), 8 ports', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Mode', fact: { value: 'Non-RAID pass-through only: the OS sees every disk directly', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Cache / battery', fact: { value: 'None / none', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Drive link', fact: { value: '12 Gb/s SAS; 3 and 6 Gb/s SATA', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Host bus', fact: { value: 'PCIe 3.0 (Generation 3)', prov: 'vendor', source: 'dell-hba330-ug' } },
        {
          label: 'Lane width',
          fact: {
            value: 'x8',
            prov: 'inferred',
            source: 'broadcom-9300-8i-ug',
            note: 'Dell’s guide does not state it. The SAS3008 reference card (LSI 9300-8i) is an x8 PCIe 3.0 board, and Dell’s drawing of the HBA330 shows a short x8 edge connector.'
          }
        },
        {
          label: 'Connectors',
          fact: {
            value: '2 × internal SFF-8643 (Mini-SAS HD), on the card’s back edge',
            prov: 'inferred',
            source: 'broadcom-9300-pb',
            note: 'Dell’s drawing shows two stacked SAS connectors at the far end of the card but does not name the type. The SAS3008 reference card uses 2 × SFF-8643, and the owner’s new cables are SFF-8643 → SFF-8087.'
          }
        },
        { label: 'Queue depth', fact: { value: '9,548', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Boot support', fact: { value: 'Yes', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Brackets', fact: { value: 'Adapter comes in low-profile and full-height versions', prov: 'vendor', source: 'dell-hba330-ug', note: 'Which bracket this card has is not recorded yet.' } },
        { label: 'Port LEDs', fact: { value: 'None on the HBA330', prov: 'vendor', source: 'dell-hba330-ug' } },
        { label: 'Linux driver', fact: { value: 'mpt3sas', prov: 'vendor', source: 'dell-hba330-ug' } },
        {
          label: 'Latest Dell firmware',
          fact: {
            value: 'Package 16.17.01.00 A08 (core firmware 16.00.11.00)',
            prov: 'vendor',
            source: 'dell-hba330-fw',
            note: 'Release date 5 Mar 2024. What the delivered card runs is not known yet.'
          }
        },
        {
          label: 'R720xd support',
          fact: {
            value: 'Not on Dell’s list: the firmware’s Compatible Systems start at 13th-generation servers (R730xd and later)',
            prov: 'vendor',
            source: 'dell-hba330-fw',
            note: 'It uses the same SAS3008 chip and Linux driver as the widely used LSI 9300-8i; UEFI boot through it on this BIOS is unproven until the stage 7 check.'
          }
        },
        {
          label: 'Same chip as',
          fact: { value: 'LSI (Broadcom) SAS 9300-8i', prov: 'vendor', source: 'broadcom-9300-pb', note: 'SAS9300-8i: SAS 3008 Fusion-MPT 2.5.' }
        },
        {
          label: 'Cooling',
          fact: {
            value: 'Passive heat sink, no fan',
            prov: 'inferred',
            source: 'dell-hba330-ug',
            note: 'Dell’s Fig 2 shows a heat sink over most of the card.'
          }
        },
        {
          label: 'Slot',
          fact: {
            value: 'Slot 2 (riser 1) for a low-profile bracket; slot 4 or 5 (riser 2) for a full-height one',
            prov: 'vendor',
            source: 'dell-r720-om',
            note: 'Owner’s Manual p.64–65, Table 4: Dell’s first choice for a low-profile non-RAID card on the R720xd.'
          }
        }
      ]
    }
  },
  cables: [
    {
      n: 1,
      name: 'Old mini-PERC SAS cable (one wide end, two SFF-8087 legs)',
      from: 'System board J_SASX8',
      to: 'Backplane SAS A and SAS B',
      action: 'remove',
      note: 'The mini PERC has no cable ports; this cable belongs to the board connector, so it leaves with the card.'
    },
    { n: 2, name: 'New SFF-8643 → SFF-8087 cable, 1 m', from: 'HBA330, either port', to: 'Backplane SAS A', action: 'new' },
    { n: 3, name: 'New SFF-8643 → SFF-8087 cable, 1 m', from: 'HBA330, the other port', to: 'Backplane SAS B', action: 'new' },
    {
      n: 4,
      name: 'Flex-bay SAS cable',
      from: 'Backplane SAS A1',
      to: 'Rear flex backplane SAS A1',
      action: 'keep',
      note: 'Why only two new cables: the front backplane’s SAS expander feeds all 24 front bays and the 2 rear bays through the two uplinks.'
    },
    {
      n: 5,
      name: 'Backplane power (A, B, C), sideband/I²C, control panel, front I/O and USB cables',
      from: 'System board',
      to: 'Backplanes',
      action: 'keep'
    }
  ],
  pcie: {
    slots: [
      { riser: 1, slot: 1, cpu: 'CPU2', height: 'low profile', length: 'half', link: 'x8', slotWidth: 'x16', today: 'empty' },
      { riser: 1, slot: 2, cpu: 'CPU2', height: 'low profile', length: 'half', link: 'x8', slotWidth: 'x16', today: 'empty', plan: 'HBA330 (low-profile bracket)' },
      { riser: 1, slot: 3, cpu: 'CPU2', height: 'low profile', length: 'half', link: 'x8', slotWidth: 'x16', today: 'empty' },
      { riser: 2, slot: 4, cpu: 'CPU2', height: 'full height', length: 'full', link: 'x16', slotWidth: 'x16', today: 'empty', plan: 'HBA330 if full-height (first choice)' },
      { riser: 2, slot: 5, cpu: 'CPU1', height: 'full height', length: 'full', link: 'x8', slotWidth: 'x16', today: 'empty', plan: 'HBA330 if full-height (alternative)' },
      { riser: 3, slot: 6, cpu: 'CPU1', height: 'full height', length: 'full', link: 'x16', slotWidth: 'x16', today: 'empty' }
    ],
    note: {
      value: 'Six slots, all empty; both CPUs are fitted, so every slot works',
      prov: 'measured',
      asOf: '2026-09-25',
      source: 'dell-r720-om',
      note: 'Layout from Owner’s Manual p.64, Table 3 (R720xd uses the alternate riser 3 with one x16 slot); the list of six slots and their widths confirmed by dmidecode.'
    }
  },
  nics: {
    ports: { value: 4, prov: 'measured', asOf: '2026-09-25' },
    model: { value: 'Broadcom BCM5720, 4 × 1 GbE', prov: 'measured', asOf: '2026-09-25', note: 'One of Dell’s network daughter card options.' },
    cabled: { value: 'Port 1 only, to the gateway’s port 3 at 1000 Mb/s', prov: 'measured', asOf: '2026-09-28' },
    sharedWithIdrac: {
      value: 'The iDRAC shares NIC port 1 (shared LOM); its own dedicated port is unused',
      prov: 'measured',
      asOf: '2026-09-28'
    }
  },
  idrac: {
    edition: { value: 'iDRAC7 Express', prov: 'owner', asOf: '2026-09-28' },
    firmware: { value: 'On its final release; iDRAC7 gets no further updates', prov: 'measured', asOf: '2026-09-28' },
    nicMode: { value: 'Shared LOM on NIC port 1', prov: 'measured', asOf: '2026-09-28' },
    lacks: {
      value: 'No virtual console, no virtual media, no dedicated NIC',
      prov: 'vendor',
      source: 'dell-r720-tg',
      note: 'Enterprise-only features in Technical Guide Table 28.'
    },
    health: {
      value: 'Critical: the two Gigastones sit in PERC state “Foreign”; the failing SAS drive is a warning. CPUs, memory, both PSUs and fans are OK.',
      prov: 'measured',
      asOf: '2026-09-28'
    }
  },
  fans: {
    count: { value: 6, prov: 'measured', asOf: '2026-09-25', note: 'Dell lists six hot-swap fans in one removable assembly (Owner’s Manual Fig 27–28).' },
    rpm: {
      value: [4680, 4800],
      prov: 'measured',
      asOf: '2026-09-25',
      note: 'Taken with the PERC installed, during the 2026-09-25..28 survey; exact day not recorded.'
    },
    baselineNote:
      'After the swap the agent compares against this baseline. If the fans ramp for the non-Dell-certified card, Dell’s “third-party PCIe card cooling response” setting is the proposed fix.',
    hotPlug: { value: 'Hot-plug, redundant fans', prov: 'vendor', source: 'dell-r720-tg' }
  },
  temperatures: {
    exhaustC: { value: 31, prov: 'measured', asOf: '2026-09-25', note: 'With the PERC installed.' },
    cpuC: { value: [39, 41], prov: 'measured', asOf: '2026-09-25', note: 'Two CPU sensors, with the PERC installed.' },
    inlet: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'The inlet temperature sensor gives no reading.' },
    note: 'All taken with the PERC H710P installed; the inlet sensor gives no reading.'
  },
  psus: {
    count: { value: 2, prov: 'measured', asOf: '2026-09-28' },
    redundant: { value: true, prov: 'measured', asOf: '2026-09-28', note: 'The iDRAC reports both PSUs OK and redundant.' },
    wattage: { value: null, prov: 'measured', asOf: '2026-09-28', note: 'Not recorded. Read the label on the PSU handle, or the iDRAC.' },
    options: { value: '495 W, 750 W or 1100 W AC; 1100 W DC (hot-plug, redundant)', prov: 'vendor', source: 'dell-r720-tg' }
  },
  dims: {
    body: {
      value: { w: 444.0, h: 87.3, d: 684.0 },
      prov: 'vendor',
      source: 'dell-r720-tg',
      note: 'Fig 18: Xb × Y × Zb. Depth runs from the rack flange to the rear wall.'
    },
    earsWidth: { value: 482.4, prov: 'vendor', source: 'dell-r720-tg', note: 'Fig 18: Xa.' },
    bezelDepth: { value: 32.0, prov: 'vendor', source: 'dell-r720-tg', note: 'Fig 18: Za with bezel, in front of the rack flange.' },
    earDepth: { value: 18.0, prov: 'vendor', source: 'dell-r720-tg', note: 'Fig 18: Za without bezel.' },
    toPsuHandles: { value: 723.0, prov: 'vendor', source: 'dell-r720-tg', note: 'Fig 18: Zc, rack flange to the PSU handles.' },
    overallDepth: {
      value: 755.0,
      prov: 'inferred',
      source: 'dell-r720-tg',
      note: 'Bezel front to PSU handles: Za (32.0) + Zc (723.0).'
    },
    mass: {
      value: { max: 29.5, empty: 11.7 },
      prov: 'vendor',
      source: 'dell-r720-tg',
      note: 'Table 30, R720xd 2.5″ chassis.'
    }
  },
  internal: {
    view: 'Top-down, cover off, front at the top.',
    description: [
      'Front edge: the 24-bay backplane across the full width, with a SAS expander on it. Its SAS connectors face the fans; seen from above, left to right: SAS B, SAS A, then SAS A1 (towards the PSU side).',
      'Behind it, the fan wall: one removable assembly of six fans spanning nearly the whole width, locked by two blue levers.',
      'Along the left wall in this view (the server’s right side when you stand at its front; your left from behind): the cable retention bracket, where every SAS cable runs.',
      'Middle: the cooling shroud over both CPUs and the 24 DIMM slots. CPU2 sits left, CPU1 right in this view.',
      'Behind the shroud on the left: the PERC H710P Mini in its board slot J_STORAGE, with J_SASX8 (the mini PERC’s SAS connector) just outside it towards the left wall.',
      'Rear third, left to right: riser 1 (slots 1–3, low profile; the HBA330 goes in slot 2 with its two SFF-8643 ports facing forward), riser 2 (slots 4–5, full height), riser 3 (slot 6), then the rear flex backplane (its input SAS A1 faces forward) sitting over PSU1 and PSU2.',
      'Cable 4 runs from backplane SAS A1 up the right-hand wall to the rear flex backplane; cables 2 and 3 run from the HBA330 up the left wall through the retention bracket to SAS A and SAS B.'
    ],
    parts: [
      { id: 'backplane', label: '24-bay backplane · SAS expander', x: [0.017, 0.983], z: [0.054, 0.074], state: 'keep' },
      { id: 'sas-b', label: 'SAS B', x: [0.433, 0.5], z: [0.074, 0.088], state: 'keep' },
      { id: 'sas-a', label: 'SAS A', x: [0.567, 0.633], z: [0.074, 0.088], state: 'keep' },
      { id: 'sas-a1', label: 'SAS A1', x: [0.717, 0.783], z: [0.074, 0.088], state: 'keep' },
      { id: 'fans', label: 'Fan wall (6 fans)', x: [0.12, 0.9], z: [0.171, 0.204], state: 'keep' },
      { id: 'retention', label: 'Cable retention bracket', x: [0.007, 0.023], z: [0.247, 0.467], state: 'keep' },
      { id: 'shroud', label: 'Cooling shroud', x: [0.14, 0.88], z: [0.258, 0.584], state: 'keep' },
      { id: 'cpu2', label: 'CPU2', x: [0.257, 0.377], z: [0.382, 0.463], state: 'keep' },
      { id: 'cpu1', label: 'CPU1', x: [0.64, 0.76], z: [0.382, 0.463], state: 'keep' },
      { id: 'perc', label: 'PERC H710P Mini', x: [0.157, 0.507], z: [0.625, 0.706], state: 'removed' },
      { id: 'j-sasx8', label: 'J_SASX8', x: [0.107, 0.15], z: [0.661, 0.679], state: 'keep', note: 'Left empty after the swap.' },
      { id: 'j-storage', label: 'J_STORAGE', x: [0.177, 0.487], z: [0.661, 0.679], state: 'keep', note: 'Left empty after the swap.' },
      { id: 'riser-1', label: 'Riser 1 · slots 1–3', x: [0.02, 0.33], z: [0.735, 0.989], state: 'keep' },
      { id: 'hba330', label: 'HBA330 (slot 2)', x: [0.08, 0.303], z: [0.793, 0.96], state: 'new' },
      { id: 'hba-port-1', label: 'SFF-8643 port', x: [0.107, 0.16], z: [0.778, 0.793], state: 'new', note: 'Unlabelled by Dell; either port works.' },
      { id: 'hba-port-2', label: 'SFF-8643 port', x: [0.2, 0.253], z: [0.778, 0.793], state: 'new', note: 'Unlabelled by Dell; either port works.' },
      { id: 'riser-2', label: 'Riser 2 · slots 4–5', x: [0.347, 0.55], z: [0.735, 0.989], state: 'keep' },
      { id: 'riser-3', label: 'Riser 3 · slot 6', x: [0.567, 0.683], z: [0.735, 0.989], state: 'keep' },
      { id: 'flex-backplane', label: 'Rear flex backplane', x: [0.703, 0.98], z: [0.721, 0.735], state: 'keep' },
      { id: 'flex-sas-a1', label: 'SAS A1 (flex input)', x: [0.813, 0.88], z: [0.708, 0.721], state: 'keep' },
      { id: 'psu-1', label: 'PSU1', x: [0.703, 0.838], z: [0.766, 0.989], state: 'keep' },
      { id: 'psu-2', label: 'PSU2', x: [0.845, 0.98], z: [0.766, 0.989], state: 'keep' }
    ],
    routes: [
      {
        cable: 1,
        paths: [
          [[0.128, 0.661], [0.128, 0.631], [0.097, 0.629], [0.097, 0.157], [0.427, 0.157]],
          [[0.427, 0.157], [0.48, 0.157], [0.48, 0.088]],
          [[0.427, 0.157], [0.613, 0.157], [0.613, 0.088]]
        ]
      },
      { cable: 2, paths: [[[0.227, 0.778], [0.227, 0.719], [0.073, 0.719], [0.073, 0.144], [0.6, 0.144], [0.6, 0.088]]] },
      { cable: 3, paths: [[[0.133, 0.778], [0.133, 0.739], [0.053, 0.739], [0.053, 0.13], [0.467, 0.13], [0.467, 0.088]]] },
      { cable: 4, paths: [[[0.847, 0.708], [0.847, 0.69], [0.95, 0.69], [0.95, 0.135], [0.75, 0.135], [0.75, 0.088]]] },
      { cable: 5, paths: [[[0.833, 0.074], [0.833, 0.112]]] }
    ],
    prov: 'inferred',
    source: 'dell-r720-om',
    note: 'Schematic, not to scale. Positions derived from Owner’s Manual Fig 69 (p.106) and Fig 78 (p.129–130) via the swap runbook’s top-down drawing; approximate. Go by the labels printed on the backplane (SAS A, SAS B, SAS A1) and the board (J_SASX8), not by left and right.'
  },
  stages: [
    { n: 0, title: 'Before the day', who: 'both', summary: 'Check the card’s bracket height, pick the slot, write the installer USB stick (the agent can do it), make the root password, gather tools.' },
    { n: 1, title: 'Last look at the old system', who: 'you', summary: 'Accept that the old VMs are disposable, and tape the failing rear drive while the RAID card still lights its LEDs.' },
    { n: 2, title: 'Shut down', who: 'both', summary: 'The agent shuts the host down cleanly; you unplug both power cords and put on the wrist strap.' },
    { n: 3, title: 'Open it up and remove the RAID card', who: 'you', summary: 'Bezel, cover, shroud and riser 1 out; lift the PERC H710P Mini and remove its J_SASX8 cable (cable 1).', refs: 'Owner’s Manual p.36–40, 57, 59, 69, 80' },
    { n: 4, title: 'Install the HBA330 and its cables', who: 'you', summary: 'Seat the card (slot 2 for low profile), then run cables A and B from its two ports to backplane SAS A and SAS B.', refs: 'Owner’s Manual p.66–68, 72; HBA User’s Guide p.18–19' },
    { n: 5, title: 'Close up', who: 'you', summary: 'Riser, retention bracket, fans, card holder, shroud and cover back in, in reverse order.' },
    { n: 6, title: 'Drives', who: 'you', summary: 'Pull the failing drive from rear bay 25, and slide every drive except the two Gigastones out by 2–3 cm for the install.' },
    { n: 7, title: 'Power on and check the firmware setup', who: 'you', summary: 'Keep UEFI boot, make sure the HBA’s slot is enabled and its configuration utility shows up, then boot the USB stick.' },
    { n: 8, title: 'Install Proxmox VE 9.2', who: 'you', summary: 'ZFS RAID1 on the two Gigastones with hdsize 220, then set the network and let it reboot.' },
    { n: 9, title: 'First boot and hand-off', who: 'you', summary: 'Push the other drives back in, boot, install the SSH key and tell the agent “Proxmox is up”.' },
    { n: 10, title: 'What the agent does next', who: 'agent', summary: 'Checks firmware, updates, attaches the SAS drive to rpool, creates fast and bulk, burns everything in, checks the fans and records the bays.' }
  ],
  unknowns: [
    { id: 'rear-bays', question: 'Which rear bay is physically 24 and which is 25?', howToResolve: 'The LEDs and drive labels in stage 1; tape the failing one.' },
    { id: 'ram', question: 'Is it 256 GB with memory mirroring on, or about 128 GB fitted?', howToResolve: 'F2 System Setup → Memory Settings, or count the DIMMs.' },
    { id: 'psu-wattage', question: 'What wattage are the two PSUs?', howToResolve: 'The label on each PSU, or the iDRAC power inventory.' },
    { id: 'front-bays', question: 'Which front bays hold the five SSDs today?', howToResolve: 'Find them by label in stage 6; the agent records bay-to-serial after the install.' },
    { id: 'bracket', question: 'Is the HBA330 bracket low profile or full height?', howToResolve: 'Look at it in stage 0: low profile → slot 2, full height → slot 4 or 5.' },
    { id: 'uefi-boot', question: 'Does this card boot in UEFI on this BIOS?', howToResolve: 'Stage 7: “Dell HBA Configuration Utility” must appear under Device Settings.' },
    { id: 'hba-firmware', question: 'What firmware does the delivered card run?', howToResolve: 'Stage 7 in the configuration utility, or from Linux after the install.' },
    { id: 'gigastone-listing', question: 'Does the old RAID card’s odd listing of the Gigastones (no enclosure, state Foreign) mean anything?', howToResolve: 'Watch them closely in the stage 10 burn-in.' },
    { id: 'fan-response', question: 'Will the fans ramp for the non-Dell-listed card?', howToResolve: 'Compare against the 4680–4800 RPM baseline after first boot.' }
  ],
  derived: {
    rawCapacityGB: {
      value: 256 * 2 + 300 + 500 * 2 + 1000,
      prov: 'inferred',
      note: 'Sum of the six kept drives’ labelled capacities (GB, decimal) after the failing SAS drive leaves.'
    },
    usableGiB: {
      value: 220 + 450 + 930,
      prov: 'inferred',
      note: 'rpool ~220 + fast ~450 + bulk ~930 GiB, the planned usable sizes.'
    },
    drivesKept: { value: 6, prov: 'inferred', note: 'Seven drives today, one removed.' },
    baysFree: { value: 26 - 6, prov: 'inferred', note: '26 bays (24 front + 2 rear) minus the six kept drives.' },
    pcieLanes: { value: 80, prov: 'inferred', source: 'intel-e5-2690v2', note: '2 CPUs × 40 PCIe 3.0 lanes (Intel ARK).' },
    mostHoursYears: {
      value: years(hours.st300mp0004).value,
      prov: 'inferred',
      note: 'The ST300MP0004 at 55,559 power-on hours, the most of any drive; it stays, as rpool’s third copy.'
    }
  },
  sources: Object.fromEntries(
    (
      [
        'dell-r720-tg',
        'dell-r720-om',
        'dell-hba330-ug',
        'dell-hba330-fw',
        'dell-perc-h710p-ug',
        'intel-e5-2690v2',
        'broadcom-9300-8i-ug',
        'broadcom-9300-pb',
        'crucial-mx500',
        'seagate-ep15k-v4',
        'seagate-savvio-15k3'
      ] satisfies SourceKey[]
    ).map((k): [string, Source] => [k, allSources[k]])
  )
};
