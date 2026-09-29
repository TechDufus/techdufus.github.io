// Build-time data for the scripted site guide (src/scripts/guide.ts fetches it on first open).
// Every answer is written from real site content. Mini-markup: [label](href) links, blank line = paragraph.
import { business, featuredProject, featuredReposAsOf, labSpec, siteMetadata } from '../data/site';
import { getPostMetas, postStats } from '../lib/content';
import { getFeaturedRepos } from '../lib/github';

type Answer = { text: string; cards: string[] };

const SLUG = {
  talos: 'building-a-talos-kubernetes-homelab-on-proxmox-with-terraform',
  tailscale: 'i-deleted-my-cloudflare-tunnels-tailscale-operator-homelab-k8s',
  omc: 'oh-my-claude-batteries-included-enhancements-for-claude-code',
  aijob: 'ai-already-took-my-job',
  obsidian: 'deploying-obsidian-sync-for-my-ai-agents',
  zfs: 'from-hardware-raid-to-zfs'
};

export async function GET() {
  const [metas, featured] = await Promise.all([getPostMetas(), getFeaturedRepos()]);
  const stats = postStats(metas);
  const slugs = new Set(metas.map((p) => p.slug));
  const cards = (...list: (string | undefined)[]) => list.filter((s): s is string => !!s && slugs.has(s));
  const mail = `[${siteMetadata.email}](mailto:${siteMetadata.email})`;
  const asOf = new Date(`${featuredReposAsOf}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  // Live counts come from the GitHub API at build time; offline builds fall back to the dated snapshot in site.ts.
  const starsLine = (r?: { stars: number; live: boolean }) =>
    r?.stars ? ` It had ${r.stars} stars on GitHub ${r.live ? 'when this site was last built' : `as of ${asOf}`}.` : '';
  const omc = featured.find((r) => r.name === 'oh-my-claude');
  const omcUrl = omc?.url ?? 'https://github.com/TechDufus/oh-my-claude';
  const kanbanUrl = featured.find((r) => r.name === 'openkanban')?.url ?? 'https://github.com/TechDufus/openkanban';

  const answers: Record<string, Answer> = {
    homelab: {
      text:
        `One Dell PowerEdge R720xd (40 threads, 256GB ECC) running Proxmox, which hosts a 3-node Talos Kubernetes cluster. ArgoCD does the GitOps, and everything is declared in [home.io](${labSpec.gitops.href}) with Terraform + Ansible.\n\n` +
        `On top of that: ${labSpec.servicesCount} services, including Immich, dashboards, self-hosted runners and an observability stack. UniFi UDM Pro + U7 AP for the network, a UNAS Pro 8 for storage. Since Feb 2026, access runs through the Tailscale Operator instead of Cloudflare Tunnels.\n\n` +
        `${labSpec.gitops.motto} Status as of ${labSpec.lastRevised}: ${labSpec.status.toLowerCase()}. The full tour is on the [lab page](/lab/), and the long version is in the [setup doc](${labSpec.setupHref}).`,
      cards: cards(SLUG.talos, SLUG.tailscale)
    },
    omc: {
      text:
        `[oh-my-claude](${omcUrl}) is a Claude Code plugin I built after hitting the same friction over and over. Opinionated defaults, still fully hackable.\n\n` +
        `The point is simple: I open a session and get to work instead of rebuilding my environment every time.${starsLine(omc)}`,
      cards: cards(SLUG.omc)
    },
    start: {
      text:
        `Depends why you're here.\n\n` +
        `For what I'm thinking about now, start with the latest post. For the homelab, the Talos build is the best way in. For how I work with AI, read “AI Already Took My Job”.\n\n` +
        `Or browse [all ${stats.count} posts](/blog/), going back to ${stats.first.getFullYear()}.`,
      cards: cards(metas[0]?.slug, SLUG.talos, SLUG.aijob).filter((s, i, a) => a.indexOf(s) === i)
    },
    agents: {
      text:
        `With my name on the result. When work gets big, I split it into phases: gather context, implement, then verify.\n\n` +
        `AI helps with speed, but I still own the final decision and the release. I prefer git-first, reproducible workflows because they are easier to review and easier to recover. Same pattern in my public tooling ([oh-my-claude](${omcUrl}), [openkanban](${kanbanUrl})) and in my homelab GitOps flow.`,
      cards: cards(SLUG.aijob, SLUG.omc, SLUG.obsidian)
    },
    building: {
      text:
        `[${featuredProject.name}](${featuredProject.href}), mostly. It's an AI Bible-study tool, opening soon. It answers in plain words and shows you the passages, so you can read them for yourself.\n\n` +
        `The rest is open source: ${featured.map((r) => `[${r.name}](${r.url})`).join(', ')}. Everything, plus the old PowerShell, is on the [projects page](/projects/).`,
      cards: []
    },
    rack: {
      text:
        `A 42U cabinet. Top to bottom: a Raspberry Pi 4 on a shelf, a 24-port patch panel, the UDM Pro, the UNAS Pro 8 and the R720xd.\n\n` +
        `I drew it from the vendor specs. [Sheet 01 · The cabinet](/lab/rack/) has every box at its U position, the links and the airflow, and [Sheet 02 · The server](/lab/r720xd/) opens up the R720xd. The U positions are a best guess until I measure, so both sheets are stamped preliminary.`,
      cards: cards(SLUG.zfs)
    },
    hire: {
      text: business.enabled
        ? `I take on work through ${business.companyName}. The [services](/#services) section has the details, and the best way to reach me is ${mail}.`
        : `The best way to reach me is ${mail}.`,
      cards: []
    }
  };

  // Free-text questions that name a featured repo get its real summary (oh-my-claude has its own answer).
  for (const r of featured) {
    if (r.name === 'oh-my-claude') continue;
    answers[`repo:${r.name}`] = {
      text: `[${r.name}](${r.url}): ${r.summary}\n\n${r.why}${starsLine(r)}`,
      cards: []
    };
  }

  const body = {
    posts: metas.map((p) => ({
      slug: p.slug,
      href: p.href,
      title: p.title,
      description: p.description,
      date: p.date.toISOString().slice(0, 10),
      tags: p.tags.filter((t) => t !== 'blog'),
      minutes: p.minutes
    })),
    repos: featured.map((r) => ({ name: r.name, url: r.url, stars: r.stars })),
    lab: {
      status: labSpec.status,
      lastRevised: labSpec.lastRevised,
      servicesCount: labSpec.servicesCount,
      gitops: { repo: labSpec.gitops.repo, href: labSpec.gitops.href, motto: labSpec.gitops.motto }
    },
    prompts: [
      { q: "What's running in your homelab?", a: 'homelab' },
      { q: 'What is oh-my-claude?', a: 'omc' },
      { q: 'Where should I start reading?', a: 'start' },
      { q: 'How do you work with AI agents?', a: 'agents' },
      { q: 'What are you building?', a: 'building' },
      { q: business.enabled ? 'Can I hire you?' : 'How do I reach you?', a: 'hire' }
    ],
    answers
  };

  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json' } });
}
