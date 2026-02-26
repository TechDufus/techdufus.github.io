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
    themeColor: '#060b12',
    defaultSocialImage: '/img/background.jpg',
    defaultSocialImageAlt: 'TechDufus site preview',
    defaultSocialImageWidth: 1920,
    defaultSocialImageHeight: 1080
  }
};

export const primaryNavigation = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' }
];

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
    details: 'One-time or monthly coffee support to help cover tooling and writing time.',
    lane: '/coffee'
  },
  {
    label: 'GitHub Sponsors',
    href: 'https://github.com/sponsors/techdufus',
    details: 'Monthly support through GitHub while I ship open source and platform notes.',
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
    'I started with PowerShell because I was tired of repetitive clicks. AdminToolkit and HelpDesk were my early scratch-my-own-itch tools.',
    'That same mindset pulled me into Terraform, GitOps, and Kubernetes platform work.',
    'Most days are terminals, CI runs, and cluster cleanup. No rollback plan, no merge.',
    'This site is where I keep notes while details are fresh: what broke, what held, and what I would change next round.'
  ]
};

export const aboutNow = {
  timeframe: 'Updated February 24, 2026',
  primaryFocus:
    'Right now I am tightening agent handoffs so tasks stay owned and context does not disappear.',
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
    }
  ],
  notDoing: 'Demo-first workflows that look slick but do not survive real use.',
  learning: 'MCP patterns, cleaner repo automation, and better context handoffs.'
};

export const featuredRepos = [
  {
    name: 'openkanban',
    url: 'https://github.com/TechDufus/openkanban',
    tag: 'Terminal UI',
    status: 'Active',
    starsFallback: '39+',
    summary:
      'Terminal-native Kanban for tracking parallel agent tasks without leaving tmux.',
    whyItMatters:
      'This keeps multi-agent work from turning into tab chaos and missing context.'
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
      'I open a session and get to work instead of rebuilding my environment every time.'
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
      'This is the setup that powers almost everything I build.'
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
      'I test ideas here first so production gets a cleaner version.'
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
    value: 'IL5 / IL6 + air-gapped platform operations',
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
    body: 'Senior DevSecOps Engineer at Raft. Shipping secure platform capabilities across classified and unclassified environments with TS clearance.'
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
  photo: '/img/profile/solo-leveling-pfp.png',
  photoAlt: 'Stylized portrait illustration of TechDufus',
  photoWidth: 1024,
  photoHeight: 1024,
  nickname: 'You can call me Dufus.',
  handle: '@TechDufus',
  status: 'Status: probably fighting DNS somewhere.',
  introTitle: "Hello, I'm TechDufus.",
  intro:
    'I build platform systems, tinker in my homelab, and share what actually worked.'
};
