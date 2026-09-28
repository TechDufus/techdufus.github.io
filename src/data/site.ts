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
    faviconSvg: '/favicon.svg',
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
  { label: 'Projects', href: '/projects/' },
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
    { label: 'Projects', href: '/projects/' },
    { label: 'Lab', href: '/lab/' },
    { label: business.appName, href: business.appHref, business: true },
    { label: 'Services', href: '/#services', business: true },
    { label: 'About', href: '/about/' },
    { label: 'Setup', href: '/docs/setup/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Support', href: '/support/' }
  ]
};

/** Filters out business-only items while `business.enabled` is false. */
export const visibleNav = (items: NavItem[]): NavItem[] =>
  items.filter((item) => !item.business || business.enabled);

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
    details: 'One-time or monthly.'
  },
  {
    label: 'GitHub Sponsors',
    href: 'https://github.com/sponsors/techdufus',
    details: 'Monthly, through GitHub.'
  }
];

export const homeCopy = {
  headline: 'I break things, fix them, and write down what actually worked.',
  metaDescription:
    'TechDufus writes about platform engineering, homelab rebuilds, and agent workflows that hold up in the real world.'
};

export const aboutCopy = {
  intro:
    "I'm Matthew, but most people online know me as TechDufus. I started in PowerShell, worked my way through DevOps, full-stack and platform engineering, and now I build with AI and teach others to.",
  body: [
    'Nobody handed me a career path. Every time I ran out of new things to learn, I found the area I had the least exposure to and switched into it.'
  ]
};

export const aboutNow = {
  timeframe: 'Updated February 26, 2026',
  primaryFocus:
    'AI inference and GPU workloads on Kubernetes, and pushing Codex and Claude Code until the rough edges show.'
};

export const aboutHowIOperate = {
  items: [
    { title: 'Reproducible by default', detail: 'If Terraform can rebuild it from a fresh box, I trust it.' },
    { title: 'Automate early', detail: 'One-off steps drift fast.' },
    { title: 'Fast, with guardrails', detail: 'Risky changes still get review and a rollback plan.' },
    { title: 'Write it down', detail: "If it only lives in someone's head, it's a risk." }
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

export type FeaturedProject = {
  name: string;
  href: string;
  status: string;
  tagline: string;
  description: string;
  image: { src: string; alt: string; width: number; height: number };
  facts: { k: string; v: string }[];
};

/**
 * YahwAI, on /projects/ and the home Projects section. Tagline, description, image and facts
 * all come from yahwai.com itself (meta description, og:image, the "will and won't" list).
 */
export const featuredProject: FeaturedProject = {
  name: 'YahwAI',
  href: 'https://yahwai.com/',
  status: 'Opening soon',
  tagline: 'Search the Scriptures. Keep your eyes fixed on Jesus.',
  description:
    'An AI Bible-study tool for personal study and for preparing questions to bring to church or a small group. It answers in plain words and shows you the passages, so you can read them for yourself.',
  image: {
    src: '/img/projects/yahwai.webp',
    alt: 'The YahwAI share card: an open book with a gold flame, the name YahwAI, and the words "Search the Scriptures. Keep your eyes fixed on Jesus."',
    width: 1200,
    height: 630
  },
  facts: [
    { k: 'Shows', v: 'The passages behind a reply, from the Berean Standard Bible' },
    { k: "Won't", v: "Speak for God. Replies aren't Scripture." }
  ]
};

export type EarlierWork = {
  name: string;
  href: string;
  year: number;
  description: string;
  kind: string;
  post?: { label: string; href: string };
};

/** Older public work on /projects/. Descriptions come from each repo's README / Marketplace listing. */
export const earlierWork: EarlierWork[] = [
  {
    name: 'AdminToolkit',
    href: 'https://github.com/TechDufus/AdminToolkit',
    year: 2020,
    description: 'A PowerShell module of administration and utility functions for Windows admins.',
    kind: 'PowerShell Gallery'
  },
  {
    name: 'HelpDesk',
    href: 'https://github.com/TechDufus/HelpDesk',
    year: 2020,
    description: 'Active Directory and other admin-type utilities typical in a HelpDesk role.',
    kind: 'PowerShell Gallery'
  },
  {
    name: 'BlogQueue',
    href: 'https://github.com/marketplace/actions/blog-queue-workflow',
    year: 2021,
    description: 'A GitHub Action that publishes blog posts from a queue on a schedule.',
    kind: 'GitHub Action',
    post: { label: 'Read the post', href: '/blog/introducing-the-blogqueue-github-action/' }
  }
];

export const homeProofPoints = [
  {
    label: 'Production Scale',
    value: '200-node AKS + 100TB+ data platform',
    note: 'The architecture is written up publicly.',
    sourceLabel: 'Read the write-up',
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

export const homeOperatingStyle = ['If I repeat something twice, I script it on the third pass.'];

export const profileSpotlight = {
  photo: '/img/profile/techdufus.webp',
  nickname: 'You can call me Dufus.',
  status: 'Status: probably fighting DNS somewhere.'
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
  lede: 'Platform engineering notes from a guy who lives in tmux. Real incidents, homelab rebuilds, and AI agent experiments.',
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
  'Homelab',
  'AI agents',
  'GitOps',
  'Talos',
  'Terraform',
  'PowerShell',
  'Incident notes'
];

type LabSpecRow = { k: string; v: string; href?: string; note?: string };

type LabPhoto = { src: string; alt: string; width: number; height: number; caption?: string };

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
  services: { name: string; note: string }[];
  servicesCount: '25+';
  changelog: { date: string; title: string; href?: string; note?: string }[];
  workstation: {
    host: string;
    role: string;
    specs: LabSpecRow[];
    keyboard: { name: string; layout: string; configHref: string };
    terminalStack: string[];
    photo: LabPhoto;
  };
  gitops: {
    repo: 'TechDufus/home.io';
    href: string;
    tools: string[];
    motto: 'If I lose a node, I rebuild from git.';
  };
} = {
  lastRevised: 'Feb 2026',
  lastRevisedIso: '2026-02',
  status: 'Rebuild in progress',
  headline: 'The <em>lab</em>.',
  lede: "What's running at home right now. It's mid-rebuild, so expect this to change.",
  setupHref: '/docs/setup/',
  hardware: [
    { role: 'Compute', name: 'Dell PowerEdge R720xd', spec: '40 threads · 256GB ECC RAM' },
    { role: 'Network', name: 'UniFi UDM Pro + U7 AP' },
    { role: 'Storage', name: 'UNAS Pro 8' },
    { role: 'Edge', name: 'Raspberry Pi 4B', spec: '8GB' }
  ],
  services: [
    { name: 'Immich', note: 'Self-hosted photo and video library.' },
    { name: 'Dashboards', note: 'Lab dashboards, private to my tailnet.' },
    { name: 'Self-hosted runners', note: 'CI runners on my own hardware.' },
    { name: 'Observability stack', note: 'So I can see what broke before I start guessing.' }
  ],
  servicesCount: '25+',
  changelog: [
    {
      date: '2026-02-20',
      title: 'Cloudflare Tunnels → Tailscale Operator',
      href: '/blog/i-deleted-my-cloudflare-tunnels-tailscale-operator-homelab-k8s/',
      note: 'Swapped Cloudflare Tunnels for the Tailscale Kubernetes Operator, so a new service is one YAML file in git.'
    },
    {
      date: '2025-06-30',
      title: 'Talos Kubernetes on Proxmox, with Terraform',
      href: '/blog/building-a-talos-kubernetes-homelab-on-proxmox-with-terraform/',
      note: 'An immutable, Kubernetes-only OS on Proxmox, built end to end with Terraform.'
    }
  ],
  workstation: {
    host: 'Sherlock',
    role: 'custom build, Ubuntu',
    specs: [
      { k: 'CPU', v: 'Ryzen 9 5950X', href: 'https://a.co/d/4pwKHpI' },
      { k: 'GPU', v: 'RTX 3080', href: 'https://www.gigabyte.com/Graphics-Card/GV-N3080AORUS-M-10GD-rev-30#kf' },
      { k: 'RAM', v: '64GB', href: 'https://a.co/d/iHfLS4z' }
    ],
    keyboard: {
      name: 'ZSA Moonlander',
      layout: 'Dvorak',
      configHref: 'https://configure.zsa.io/moonlander/layouts/j6X5Z/latest/0'
    },
    terminalStack: ['Ghostty', 'sesh', 'tmux', 'Neovim'],
    photo: {
      src: '/img/setup/setup-sherlock-desktop.jpg',
      alt: "Sherlock's desk: a wide monitor full of terminal and editor panes, a RØDE microphone on a boom arm, and the ZSA Moonlander split keyboard with a Logitech mouse between the halves.",
      width: 2400,
      height: 1639,
      caption: 'Sherlock at the desk · Moonlander front and centre'
    }
  },
  gitops: {
    repo: 'TechDufus/home.io',
    href: 'https://github.com/TechDufus/home.io',
    tools: ['Terraform', 'Ansible', 'ArgoCD'],
    motto: 'If I lose a node, I rebuild from git.'
  }
};
