export const siteMetadata = {
  siteName: '{ TechDufus }',
  title: 'TechDufus',
  description:
    'Platform engineering notes from a guy who lives in tmux. Real incidents, homelab rebuilds, and agent workflow experiments.',
  url: 'https://techdufus.com',
  author: 'TechDufus',
  email: 'hey@techdufus.com',
  location: 'United States',
  role: 'Platform Engineer / Agentic Engineer',
  xHandle: '@TechDufus',
  media: {
    faviconIco: '/favicon.ico',
    favicon16: '/favicon-16x16.png',
    favicon32: '/favicon-32x32.png',
    appleTouchIcon: '/apple-touch-icon.png',
    manifestPath: '/site.webmanifest',
    themeColor: '#0a1122',
    defaultSocialImage: '/img/social-default.jpg',
    defaultSocialImageAlt: 'TechDufus homelab desk with terminal-first AI and Kubernetes workflows',
    defaultSocialImageWidth: 1200,
    defaultSocialImageHeight: 630
  }
};

export type Service = {
  index: string;
  title: string;
  who: string;
  items: string[];
  price: string;
  priceUnit: string;
  ctaLabel: string;
  ctaHref: string;
  draft: boolean;
};

export type Tier = {
  tier: string;
  name: string;
  who: string;
  amount: string;
  period: string;
  items: string[];
  ctaLabel: string;
  ctaHref: string;
  featured: boolean;
  badge?: string;
  draft: boolean;
};

export type Faq = {
  question: string;
  /** Paragraphs of trusted HTML. Placeholder copy is wrapped in `<span class="ph">`. */
  answer: string[];
  draft: boolean;
};

/** Values rendered as `.ph` placeholders in the mockup: `[Bracketed copy]` and the `$—` price stubs. */
export const isPlaceholder = (value: string): boolean => /^\[.*\]$/s.test(value) || /^\$[-—]$/.test(value);

const businessCompanyName = '[Company] LLC';
const businessAppName = '[App name]';
const businessEmail = 'hey@techdufus.com';
const ph = (value: string) => `<span class="ph">${value}</span>`;

export const business: {
  enabled: boolean;
  companyName: string;
  appName: string;
  appHref: '/app/';
  waitlistHref: string;
  services: Service[];
  pricing: Tier[];
  faq: Faq[];
  legal: { termsHref: string; privacyHref: string };
} = {
  enabled: false,
  companyName: businessCompanyName,
  appName: businessAppName,
  appHref: '/app/',
  waitlistHref: `mailto:${businessEmail}?subject=Waitlist`,
  services: [
    {
      index: '01',
      title: 'Platform engineering advisory',
      who: 'teams running Kubernetes who want a second set of eyes on GitOps, RBAC and delivery guardrails.',
      items: [
        'Review of cluster, ArgoCD and Terraform/Terragrunt setup',
        'RBAC and multi-team guardrails that scale',
        'Written findings with a prioritised runbook'
      ],
      price: '$-',
      priceUnit: '[per engagement]',
      ctaLabel: 'Book an intro call',
      ctaHref: `mailto:${businessEmail}?subject=${encodeURIComponent('Intro call: platform engineering advisory')}`,
      draft: true
    },
    {
      index: '02',
      title: 'Kubernetes & homelab build-outs',
      who: 'people who want a reproducible cluster they can rebuild from git, not a snowflake.',
      items: [
        'Proxmox + Talos cluster declared in Terraform',
        'ArgoCD GitOps with your first services',
        'Handover docs so you can rebuild without me'
      ],
      price: '$-',
      priceUnit: '[per build]',
      ctaLabel: 'Book an intro call',
      ctaHref: `mailto:${businessEmail}?subject=${encodeURIComponent('Intro call: Kubernetes build-out')}`,
      draft: true
    },
    {
      index: '03',
      title: 'Agentic workflow setup',
      who: 'engineers adopting AI coding agents who want the speed without giving up ownership.',
      items: [
        'Claude Code / Codex setup with sane defaults',
        'A phased flow: gather context, implement, verify',
        'Review and rollback rails for risky changes'
      ],
      price: '$-',
      priceUnit: '[per team]',
      ctaLabel: 'Book an intro call',
      ctaHref: `mailto:${businessEmail}?subject=${encodeURIComponent('Intro call: agentic workflow setup')}`,
      draft: true
    }
  ],
  pricing: [
    {
      tier: 'Tier 01',
      name: '[Tier name]',
      who: '[Who this tier is for]',
      amount: '$—',
      period: '[period]',
      items: ["[What's included]", '[Usage limit]', '[Support level]'],
      ctaLabel: 'Join the waitlist',
      ctaHref: '#waitlist',
      featured: false,
      draft: true
    },
    {
      tier: 'Tier 02',
      name: '[Tier name]',
      who: '[Who this tier is for]',
      amount: '$—',
      period: '[period]',
      items: ['[Everything in Tier 01, plus]', "[What's included]", '[Usage limit]', '[Support level]'],
      ctaLabel: 'Join the waitlist',
      ctaHref: '#waitlist',
      featured: true,
      badge: '[Recommended?]',
      draft: true
    },
    {
      tier: 'Tier 03',
      name: '[Tier name]',
      who: '[Who this tier is for]',
      amount: '$—',
      period: '[period]',
      items: ['[Everything in Tier 02, plus]', "[What's included]", '[Support level]'],
      ctaLabel: 'Talk to me',
      ctaHref: `mailto:${businessEmail}?subject=${encodeURIComponent(`${businessAppName} pricing`)}`,
      featured: false,
      draft: true
    }
  ],
  faq: [
    {
      question: "Who's behind it?",
      answer: [
        "Me. I'm Matthew, better known as <a href=\"/\">TechDufus</a>: a platform engineer who builds Kubernetes platforms for high-security environments and writes about what actually worked.",
        `${ph(businessAppName)} is being built and sold under ${ph(businessCompanyName)}.`
      ],
      draft: false
    },
    {
      question: 'Can I try it before it launches?',
      answer: [
        "Yes, a demo of it. The <a href=\"#demo\">assistant above</a> and the one in the corner of every page run on this site's real posts and repos. It's scripted and keyword-matched, not the finished product, and it tells you when it doesn't know."
      ],
      draft: false
    },
    {
      question: '[When does it launch?]',
      answer: [ph('[Launch timing, or "when it\'s ready" plus the waitlist.]')],
      draft: true
    },
    {
      question: '[What happens to my data?]',
      answer: [ph('[Where data lives, who can see it, and how to delete it. Link the Privacy page.]')],
      draft: true
    },
    {
      question: '[How does billing work?]',
      answer: [ph('[Trial, billing period, cancellation. Link the Terms.]')],
      draft: true
    },
    {
      question: '[Can I use it for my team?]',
      answer: [ph('[Seats, roles, and what changes for teams.]')],
      draft: true
    }
  ],
  legal: {
    termsHref: '#',
    privacyHref: '#'
  }
};

/** Section copy around the business data (mockup `index.html#services`, `app.html#pricing`/`#faq`). Only rendered when `business.enabled`. */
export const businessCopy = {
  services: {
    eyebrow: 'Services',
    title: 'The work I already do, <em>for your team</em>.',
    lede: `Paid services are launching under ${ph(businessCompanyName)}. These three slots are drafts: scope and pricing aren't final, so treat them as a conversation starter.`,
    stepsTitle: 'How engagements work',
    steps: [
      {
        title: 'Intro call',
        detail: "Email me what you're working on. We find thirty minutes and figure out if I'm the right person."
      },
      {
        title: 'Scope in writing',
        detail: "A short plan: what's in, what's out, and how we'll both know it's done."
      },
      {
        title: 'Build, verify, hand over',
        detail: 'The work lives in git, goes through review, and ships with a runbook you keep.'
      }
    ]
  },
  pricing: {
    title: 'What it <em>costs</em>.',
    lede: "Prices aren't set yet. These cards show the shape, not the numbers. When the numbers exist, they'll be right here.",
    foot: `All prices in USD once set · billed by ${ph(businessCompanyName)}`
  },
  faq: {
    title: 'Fair <em>questions</em>.',
    lede: "Two are answered. The rest are marked draft until there's a real answer to give.",
    mailLabel: 'Not here? Ask me directly.'
  }
};

/** `business: true` items render only when `business.enabled`. */
export type NavItem = { label: string; href: string; business?: boolean };

export const primaryNavigation: NavItem[] = [
  { label: 'Writing', href: '/blog/' },
  { label: 'Lab', href: '/lab/' },
  { label: business.appName, href: business.appHref, business: true },
  { label: 'Services', href: '/#services', business: true },
  { label: 'About', href: '/about/' }
];

export const primaryCta: { label: 'Get in touch'; href: '/contact/' } = {
  label: 'Get in touch',
  href: '/contact/'
};

export const footerNavigation: { site: NavItem[] } = {
  site: [
    { label: 'Home', href: '/' },
    { label: 'Writing', href: '/blog/' },
    { label: 'Lab', href: '/lab/' },
    { label: business.appName, href: business.appHref, business: true },
    { label: 'Services', href: '/#services', business: true },
    { label: 'About', href: '/about/' },
    { label: 'Setup', href: '/docs/setup/' },
    { label: 'Career', href: '/docs/career/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Support', href: '/support/' }
  ]
};

/** Filters out business-only items while `business.enabled` is false. */
export const visibleNav = (items: NavItem[]): NavItem[] =>
  items.filter((item) => !item.business || business.enabled);

export const docsNavigation = [
  { label: 'Setup', href: '/docs/setup' },
  { label: 'Career', href: '/docs/career' }
];

export const socialLinks = [
  { label: 'GitHub', href: 'https://github.com/TechDufus' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/techdufus' },
  { label: 'X', href: 'https://x.com/TechDufus' },
  { label: 'YouTube', href: 'https://www.youtube.com/@techdufus' },
  { label: 'Discord', href: 'https://discord.gg/5M4hjfyRBj' },
  { label: 'Email', href: 'mailto:hey@techdufus.com' }
];

export const supportLinks = [
  {
    label: 'Buy Me a Coffee',
    href: 'https://buymeacoffee.com/techdufus',
    details: 'One-time or monthly support for writing and tooling.',
    lane: '/coffee'
  },
  {
    label: 'GitHub Sponsors',
    href: 'https://github.com/sponsors/techdufus',
    details: 'Monthly support while I publish open source and platform notes.',
    lane: '/sponsors'
  }
];

export const homeCopy = {
  eyebrow: 'Hello from the command line',
  headline: 'I break things, fix them, and write down what actually worked.',
  metaDescription:
    'TechDufus writes about platform engineering, homelab rebuilds, and agent workflows that hold up in the real world.',
  description:
    'This is my digital garden for incident fallout, homelab experiments, setup docs, and AI workflow lessons that survived real use.',
  highlights: [
    'Postmortems without the victory-lap fluff',
    'Setup docs I keep updating whenever I break my own stack',
    'Agent workflows with explicit ownership, review, and rollback'
  ]
};

export const aboutCopy = {
  intro:
    "I'm Matthew, but most people online know me as TechDufus. I started in PowerShell, then moved into Kubernetes platform work, and now I spend a lot of time sharpening agentic workflows.",
  body: [
    'When I found PowerShell, I got bit by the automation bug and realized I could make a career out of being lazy in the best way: automate it once and stop doing it by hand. <a href="https://github.com/matthewjdegarmo/AdminToolkit" target="_blank" rel="noopener noreferrer" class="font-medium text-signal underline decoration-signal/60 underline-offset-2 hover:text-electric">AdminToolkit</a> and <a href="https://github.com/matthewjdegarmo/HelpDesk" target="_blank" rel="noopener noreferrer" class="font-medium text-signal underline decoration-signal/60 underline-offset-2 hover:text-electric">HelpDesk</a> were two of the first tools I built for day-to-day work.',
    'That push toward automation pulled me into the DevOps world, which came with a whole new toolchain and a whole new set of problems to solve across Terraform, GitOps, and Kubernetes.',
    'As a DevOps engineer, I realized one of my biggest gaps was empathy for the developer workflows I was shaping. I was blessed to step into a full-stack role where we owned the entire microservices stack end to end: app code, tests, CI/CD, container registry, cloud Kubernetes, security controls, firewalls, backups, and VPN.',
    'As I grew, that pulled me into platform engineering, where I do not just own CI/CD, I own the platform it deploys to. That means large Kubernetes clusters, RBAC at scale, and high-security air-gapped environments, while pushing AI at the edge of what agentic engineering can do.',
    'This site is where I keep notes while details are fresh: what broke, what held, and what I would change next round.'
  ]
};

export const aboutNow = {
  timeframe: 'Updated February 26, 2026',
  primaryFocus:
    'Right now I split my cycles between AI inference and GPU workload operations in Kubernetes, plus pushing Codex and agentic workflows until the rough edges show up.',
  activeTracks: [
    {
      title: 'Pushing Agentic Limits',
      detail:
        'I keep pushing agentic engineering to the edge to ship high-quality outcomes.'
    },
    {
      title: 'Homelab Proving Ground',
      detail:
        'I test limits in my homelab because I like learning, tinkering, and figuring things out as I go.'
    },
    {
      title: 'Build Notes In Public',
      detail:
        'If something breaks, I write the runbook before I forget.'
    },
    {
      title: 'AI Infra Feedback Loops',
      detail:
        'I am researching safer AI-assisted infrastructure workflows with pre-commit risk checks and stronger delivery guardrails.'
    }
  ]
};

export const aboutHowIOperate = {
  intro:
    'How I keep speed without losing control.',
  items: [
    {
      title: 'Reproducible By Default',
      detail:
        'I treat environments as code. If I can hand Terraform a fresh Proxmox box and rebuild the stack, I trust it.'
    },
    {
      title: 'Automate Early',
      detail:
        'If I cannot automate something from the start, I usually do not keep investing in it. One-off steps drift fast.'
    },
    {
      title: 'Fast Feedback, Guardrails On',
      detail:
        'I move fast with short loops, but risky changes still go through review rails, rollback planning, and verification.'
    },
    {
      title: 'No Tribal-Knowledge Ops',
      detail:
        "Any change that only lives in someone's memory is high risk. I prefer scripted workflows and written runbooks that survive handoffs."
    }
  ]
};

/** GitHub values as of Sep 25, 2026 (design/pro-data.js), used when the build can't reach the API. */
export type RepoFallback = {
  description: string | null;
  language: string | null;
  license: string | null;
  stars: number;
  forks: number;
  pushedAt: string | null;
  topics: string[];
};

export type FeaturedRepo = {
  name: string;
  url: string;
  tag: string;
  status: string;
  starsFallback: string;
  summary: string;
  whyItMatters: string;
  fallback?: RepoFallback;
};

export const featuredReposAsOf = '2026-09-25';

export const featuredRepos: FeaturedRepo[] = [
  {
    name: 'openkanban',
    url: 'https://github.com/TechDufus/openkanban',
    tag: 'Terminal UI',
    status: 'Active',
    starsFallback: '39+',
    summary:
      'Terminal-native Kanban for tracking parallel agent tasks without leaving tmux.',
    whyItMatters:
      'This keeps multi-agent work from turning into tab chaos and missing context.',
    fallback: {
      description: 'TUI kanban board for orchestrating AI coding agents',
      language: 'Go',
      license: 'AGPL-3.0',
      stars: 146,
      forks: 15,
      pushedAt: '2026-06-12',
      topics: []
    }
  },
  {
    name: 'oh-my-claude',
    url: 'https://github.com/TechDufus/oh-my-claude',
    tag: 'Agent Workflow',
    status: 'Active',
    starsFallback: '81+',
    summary:
      'I built this after hitting the same Claude Code friction over and over. Opinionated defaults, still fully hackable.',
    whyItMatters:
      'I open a session and get to work instead of rebuilding my environment every time.',
    fallback: {
      description: 'Add ultrawork to any prompt for maximum parallel execution',
      language: 'Python',
      license: 'MIT',
      stars: 175,
      forks: 9,
      pushedAt: '2026-07-13',
      topics: ['ai', 'automation', 'claude', 'claude-code', 'plugin', 'productivity']
    }
  },
  {
    name: 'dotfiles',
    url: 'https://github.com/TechDufus/dotfiles',
    tag: 'Workstation',
    status: 'Maintained',
    starsFallback: '391+',
    summary:
      'My terminal-first environment: tmux, Neovim, shell tooling, and scripts that keep my daily workflow fast.',
    whyItMatters:
      'This is the setup that powers almost everything I build.',
    fallback: {
      description: 'Fully automated development environment for TechDufus using ansible.',
      language: 'Shell',
      license: 'Apache-2.0',
      stars: 413,
      forks: 64,
      pushedAt: '2026-09-26',
      topics: ['ansible', 'archlinux', 'bash', 'dotfiles', 'neovim', 'ubuntu']
    }
  },
  {
    name: 'home.io',
    url: 'https://github.com/TechDufus/home.io',
    tag: 'Homelab IaC',
    status: 'Active',
    starsFallback: '35+',
    summary:
      'Homelab infrastructure-as-code with Terraform + GitOps patterns for repeatable rebuilds and low-drama operations.',
    whyItMatters:
      'I test ideas here first so production gets a cleaner version.',
    fallback: {
      description: 'Home automation.',
      language: 'Shell',
      license: 'MIT',
      stars: 38,
      forks: 5,
      pushedAt: '2026-02-20',
      topics: []
    }
  }
];

export const homeRepoLinks = [
  { name: 'oh-my-claude', url: 'https://github.com/TechDufus/oh-my-claude' },
  { name: 'openkanban', url: 'https://github.com/TechDufus/openkanban' },
  { name: 'dotfiles', url: 'https://github.com/TechDufus/dotfiles' }
];

export const homeProofPoints = [
  {
    label: 'Production Scale',
    value: '200-node AKS + 100TB+ data platform',
    note: 'Published architecture at Raft Data Platform.',
    sourceLabel: 'Read the Raft write-up',
    sourceHref:
      'https://teamraft.com/resources/insights/secure-low-latency-queries-at-scale-with-raft-data-platform-rdp/'
  },
  {
    label: 'Secure Delivery',
    value: 'High-security + air-gapped platform operations',
    note: 'GitOps and compliance in high-stakes environments.',
    sourceLabel: 'Related Fox coverage (Starsage AI test)',
    sourceHref:
      'https://www.foxnews.com/politics/fighter-pilots-take-directions-from-ai-pentagons-groundbreaking-test'
  },
  {
    label: 'Agentic Work',
    value: 'Multi-agent workflows with human ownership',
    note: 'Fast iteration with explicit review and rollback.'
  }
];

export const externalReferences = [
  {
    title: 'Secure Low-Latency Queries at Scale with Raft Data Platform',
    href: 'https://teamraft.com/resources/insights/secure-low-latency-queries-at-scale-with-raft-data-platform-rdp/'
  },
  {
    title: "Fighter pilots take directions from AI in Pentagon's groundbreaking test",
    href: 'https://www.foxnews.com/politics/fighter-pilots-take-directions-from-ai-pentagons-groundbreaking-test'
  }
];

export const homeOperatingStyle = [
  'If I repeat something twice, I script it on the third pass.',
  'I like workflows that still make sense when I am tired.',
  'AI helps me move faster, but I still own every risky change.'
];

export const careerHighlights = [
  {
    title: 'Current lane',
    body: 'Senior DevSecOps Engineer at Raft. Shipping secure platform capabilities across high-security environments.'
  },
  {
    title: 'Platform depth',
    body: 'Kubernetes across OpenShift, AKS, EKS, GKE, RKE2, plus local Kind/k3s for fast validation before bigger rollouts.'
  },
  {
    title: 'Delivery style',
    body: 'GitOps-first delivery with ArgoCD, Terraform/Terragrunt automation, and review rails that keep ownership clear.'
  },
  {
    title: 'Where it started',
    body: 'PowerShell roots: AdminToolkit, HelpDesk, and a lot of script-driven cleanup in regulated environments.'
  }
];

export const profileSpotlight = {
  photo: '/img/profile/techdufus.webp',
  photoAlt: 'Portrait of TechDufus',
  photoWidth: 1122,
  photoHeight: 1122,
  nickname: 'You can call me Dufus.',
  handle: '@TechDufus',
  status: 'Status: probably fighting DNS somewhere.',
  introTitle: "Hello, I'm TechDufus.",
  intro:
    'I build platform systems, tinker in my homelab, and share what actually worked.'
};

export type TrustItem = { value: string; label: string; href?: string; accent?: string };

/** Replaces `{token}` placeholders in copy (e.g. heroCopy.trust) with values computed at build time. */
export const fillCopy = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));

export const heroCopy: {
  eyebrow: string;
  headline: string;
  accentWord: 'actually';
  lede: string;
  trust: TrustItem[];
  ctas: {
    primary: { label: string; href: string };
    /** Secondary CTA while business.enabled is false. */
    lab: { label: string; href: string };
    /** Secondary CTA while business.enabled is true. */
    waitlist: { label: string; href: string };
  };
} = {
  eyebrow: 'Hello from the command line',
  headline: 'I break things, fix them, and write down what actually worked.',
  accentWord: 'actually',
  lede: 'Platform engineer by day, homelab tinkerer by night. I build Kubernetes platforms for high-security environments, push agentic workflows until the rough edges show, and keep the notes here.',
  // Values in {braces} are computed by the page (post count, first year, live stars); fill them with fillCopy().
  trust: [
    { value: '{posts}', label: 'posts since {firstYear}' },
    { value: '{stars}', accent: '★', label: 'across {repos} repos' },
    {
      value: '200-node',
      label: 'AKS in production',
      href: 'https://teamraft.com/resources/insights/secure-low-latency-queries-at-scale-with-raft-data-platform-rdp/'
    }
  ],
  ctas: {
    primary: { label: 'Read the writing', href: '/blog/' },
    lab: { label: 'See the lab', href: '/lab/' },
    waitlist: { label: `${business.appName} · join the waitlist`, href: '/#app' }
  }
};

/** Ticker topics: things I actually write about. */
export const topics: string[] = [
  'Kubernetes',
  'Homelab rebuilds',
  'Agent workflows',
  'GitOps',
  'Talos',
  'Claude Code',
  'Terraform',
  'Tailscale',
  'Incident notes',
  'PowerShell',
  'Obsidian',
  'Go'
];

export type LabSpecRow = { k: string; v: string; href?: string; note?: string };

export type LabPhoto = { src: string; alt: string; width: number; height: number; caption?: string };

/**
 * The /lab/ page. Every fact comes from src/content/docs/setup.md, plus the
 * Tailscale Operator (Feb 2026) and Talos (Jun 2025) posts for the changelog.
 */
export const labSpec: {
  lastRevised: 'Feb 2026';
  lastRevisedIso: string;
  status: 'Rebuild in progress';
  headline: string;
  lede: string;
  setupHref: string;
  hardware: { role: string; name: string; spec?: string; href?: string }[];
  stack: { layer: string; name: string; note: string }[];
  services: { name: string; note?: string }[];
  servicesCount: '25+';
  changelog: {
    date: string;
    title: string;
    href?: string;
    note?: string;
    before?: string[];
    after?: string[];
  }[];
  workstation: {
    host: string;
    role: string;
    specs: LabSpecRow[];
    keyboard: { name: string; layout: string; href: string; configHref: string; note: string };
    terminalStack: string[];
    photos: LabPhoto[];
    display: string;
    peripherals: LabSpecRow[];
    laptops: { name: string; detail?: string; href: string }[];
    tools: LabSpecRow[];
    windowing: string;
    agents: LabSpecRow[];
    screenshots: LabPhoto[];
  };
  gitops: {
    repo: 'TechDufus/home.io';
    href: string;
    tools: string[];
    motto: 'If I lose a node, I rebuild from git.';
    rebuildPath: string[];
  };
} = {
  lastRevised: 'Feb 2026',
  lastRevisedIso: '2026-02',
  status: 'Rebuild in progress',
  headline: 'The <em>lab</em>, in full.',
  lede: 'My single source of truth for what I run every day. I keep it practical and update it when I actually change something. The goal: fast workflow, repeatable rebuilds, and less guesswork when things break.',
  setupHref: '/docs/setup/',
  hardware: [
    { role: 'Compute', name: 'Dell PowerEdge R720xd', spec: '40 threads · 256GB ECC RAM' },
    { role: 'Network', name: 'UniFi UDM Pro + U7 AP' },
    { role: 'Storage', name: 'UNAS Pro 8' },
    { role: 'Edge', name: 'Raspberry Pi 4B', spec: '8GB' }
  ],
  stack: [
    { layer: 'Access', name: 'Tailscale Operator', note: 'Services exposed to the tailnet, declared in git' },
    { layer: 'Services', name: 'Immich · dashboards · runners', note: 'Self-hosted runners and an observability stack' },
    { layer: 'GitOps', name: 'ArgoCD', note: 'Reconciles the cluster from home.io' },
    { layer: 'Cluster', name: 'Talos Kubernetes', note: '3 nodes, immutable OS' },
    { layer: 'Hypervisor', name: 'Proxmox VE', note: 'Provisioned with Terraform + Ansible' },
    { layer: 'Metal', name: 'R720xd · UNAS Pro 8 · UniFi', note: 'Plus a Raspberry Pi 4B at the edge' }
  ],
  services: [
    { name: 'Immich', note: 'Self-hosted photo and video library, private to my tailnet.' },
    { name: 'Dashboards', note: 'Also private to the tailnet. Nothing here is public unless I say so.' },
    { name: 'Self-hosted runners', note: 'Runners on my own hardware, declared like every other workload.' },
    { name: 'Observability stack', note: "So when something breaks, I'm reading data instead of guessing." }
  ],
  servicesCount: '25+',
  changelog: [
    {
      date: '2026-02-20',
      title: 'Cloudflare Tunnels → Tailscale Operator',
      href: '/blog/i-deleted-my-cloudflare-tunnels-tailscale-operator-homelab-k8s/',
      note: 'I replaced Cloudflare Tunnels with the Tailscale Kubernetes Operator and went from dashboard-heavy setup to GitOps-native service exposure.',
      before: [
        'Manual tunnel configuration per service',
        'GitHub OAuth + email filtering for access',
        'Every new service: 15+ minutes of clicking'
      ],
      after: [
        'One LoadBalancer Service manifest per service',
        'User-based ACLs through Tailscale',
        'Every new service: one YAML file, push to git, done'
      ]
    },
    {
      date: '2025-06-30',
      title: 'Talos Kubernetes on Proxmox, with Terraform',
      href: '/blog/building-a-talos-kubernetes-homelab-on-proxmox-with-terraform/',
      note: 'An immutable, Kubernetes-only OS on the Proxmox host, provisioned end to end with Terraform. The cluster layer on this page.'
    }
  ],
  workstation: {
    host: 'Sherlock',
    role: 'primary desktop · custom build · Ubuntu Linux',
    specs: [
      { k: 'CPU', v: 'AMD Ryzen 9 5950X', note: '16-core', href: 'https://a.co/d/4pwKHpI' },
      {
        k: 'GPU',
        v: 'AORUS GeForce RTX 3080 MASTER',
        note: '10G',
        href: 'https://www.gigabyte.com/Graphics-Card/GV-N3080AORUS-M-10GD-rev-30#kf'
      },
      { k: 'RAM', v: 'G.SKILL Trident Z Neo', note: '64GB', href: 'https://a.co/d/iHfLS4z' },
      { k: 'Board', v: 'ASUS ROG Crosshair VIII Dark Hero', href: 'https://a.co/d/hjINQ4h' },
      { k: 'Cooler', v: 'ASUS ROG Ryujin 240 AIO', href: 'https://a.co/d/fmJkpsk' },
      { k: 'Case', v: 'Lian Li O11D Mini', href: 'https://a.co/d/fEGMYYr' },
      { k: 'Fans', v: 'Lian Li UNI Fan SL 120', href: 'https://a.co/d/5ZA5JIP' },
      { k: 'Storage', v: 'Samsung 980 PRO NVMe', note: '1TB + 500GB', href: 'https://a.co/d/6b3r6GJ' },
      { k: 'PSU', v: 'Cooler Master V850 SFX Gold', href: 'https://a.co/d/7YxFnKy' }
    ],
    keyboard: {
      name: 'ZSA Moonlander',
      layout: 'Dvorak',
      href: 'https://www.zsa.io/moonlander',
      configHref: 'https://configure.zsa.io/moonlander/layouts/j6X5Z/latest/0',
      note: "Split, columnar, and on a layout most people can't type on. The full layout is public if you want to steal it."
    },
    terminalStack: ['Ghostty', 'sesh', 'tmux', 'Neovim'],
    photos: [
      {
        src: '/img/setup/setup-sherlock-desktop.jpg',
        alt: "Sherlock's desk: a wide monitor full of terminal and editor panes, a RØDE microphone on a boom arm, and the ZSA Moonlander split keyboard with a Logitech mouse between the halves.",
        width: 2400,
        height: 1639,
        caption: 'Sherlock at the desk · Moonlander front and centre'
      }
    ],
    display: 'A single 4K 60Hz monitor',
    peripherals: [
      { k: 'Mouse', v: 'Logitech MX Master 3' },
      { k: 'Mic', v: 'Rode NT-USB+', href: 'https://rode.com/en-us/microphones/usb/nt-usb-plus' },
      {
        k: 'Webcams',
        v: 'Logitech C925E',
        href: 'https://www.logitech.com/en-us/products/webcams/c925e-business-webcam.960-001075.html'
      },
      {
        k: 'Webcams',
        v: 'Logitech C922',
        href: 'https://www.logitech.com/en-us/products/webcams/c922-pro-stream-webcam.html'
      },
      {
        k: 'Headphones',
        v: 'Sony WH-1000XM5',
        href: 'https://electronics.sony.com/audio/headphones/headband/p/wh1000xm5-b'
      },
      { k: 'Speakers', v: 'Creative T100', href: 'https://us.creative.com/p/speakers/creative-t100' }
    ],
    laptops: [
      { name: 'M3 MacBook Pro', detail: '14-inch, Nov 2023', href: 'https://support.apple.com/en-us/117735' },
      { name: 'Intel MacBook Pro', detail: 'Retina, 15-inch, Mid 2015', href: 'https://support.apple.com/en-us/111955' },
      { name: 'HP mt46 Mobile Thin Client', href: 'https://www.productindetail.com/pn/hp-mobile-thin-client-mt46' }
    ],
    tools: [
      { k: 'Terminal', v: 'Ghostty', href: 'https://ghostty.org/' },
      { k: 'Session manager', v: 'sesh', href: 'https://github.com/joshmedeski/sesh' },
      { k: 'Multiplexer', v: 'tmux', note: 'resurrect + continuum' },
      { k: 'Editor', v: 'Neovim', note: 'LSP, Treesitter, Telescope', href: 'https://neovim.io/' },
      { k: 'Shell', v: 'zsh + powerlevel10k', note: 'custom functions for git/k8s/remote edit workflows' },
      { k: 'Infra', v: 'Terraform, Terragrunt, Helm, kubectl, cloud CLIs' }
    ],
    windowing:
      'A cell-based layout with summon keys, not traditional manual tiling. AwesomeWM on Linux, Hammerspoon on macOS. Same mental model across both.',
    agents: [
      { k: 'Codex', v: 'Codex' },
      { k: 'Claude Code', v: 'Claude Code', note: 'custom hooks and status integration in tmux' },
      {
        k: 'oh-my-claude',
        v: 'oh-my-claude',
        note: 'sane defaults and repeatable workflows',
        href: 'https://github.com/TechDufus/oh-my-claude'
      },
      {
        k: 'openkanban',
        v: 'openkanban',
        note: 'tracking parallel agent sessions',
        href: 'https://github.com/TechDufus/openkanban'
      },
      { k: 'MCP servers', v: 'MCP servers', note: 'browser checks, docs, context plumbing' }
    ],
    screenshots: [
      {
        src: '/img/setup/tmux-sesh-picker.png',
        alt: 'sesh picker: an fzf interface with keybind hints and a list of sessions',
        width: 937,
        height: 241,
        caption: '<prefix>-o · the sesh picker'
      },
      {
        src: '/img/setup/tmux-statusline-information.png',
        alt: 'tmux status bar showing session name, directory, window tabs, Claude status, and an online indicator',
        width: 1431,
        height: 83,
        caption: 'tmux status line · session, directory, windows, Claude status'
      },
      {
        src: '/img/setup/window-management-cell-layout-1-5.png',
        alt: 'Cell-based window layout showing five predefined screen regions',
        width: 724,
        height: 572,
        caption: 'Cells 1-5, with summon keys · AwesomeWM on Linux, Hammerspoon on macOS'
      }
    ]
  },
  gitops: {
    repo: 'TechDufus/home.io',
    href: 'https://github.com/TechDufus/home.io',
    tools: ['Terraform', 'Ansible', 'ArgoCD'],
    motto: 'If I lose a node, I rebuild from git.',
    rebuildPath: ['home.io', 'Terraform + Ansible', 'ArgoCD', 'back']
  }
};
