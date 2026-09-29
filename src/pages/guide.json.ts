// Build-time data for the scripted site guide (src/scripts/guide.ts fetches it on first open).
// Every answer is written from real site content. Mini-markup: [label](href) links, blank line = paragraph.
import { business, featuredProject, featuredReposAsOf, labSpec, siteMetadata } from '../data/site';
import { server } from '../data/lab/server';
import { stackItems } from '../data/lab/stack';
import { getPostMetas, postStats } from '../lib/content';
import { getFeaturedRepos } from '../lib/github';

type Answer = { text: string; cards: string[] };

const SLUG = {
  talos: 'building-a-talos-kubernetes-homelab-on-proxmox-with-terraform',
  omc: 'oh-my-claude-batteries-included-enhancements-for-claude-code',
  aijob: 'ai-already-took-my-job',
  zfs: 'from-hardware-raid-to-zfs',
  operator: 'i-rebuilt-my-homelab-for-an-ai-operator'
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
  // The lab, from the drawings' data (src/data/lab/) and labSpec.
  const items = stackItems();
  const pve = items.find((i) => i.id === 'proxmox');
  const talos = items.find((i) => i.id === 'talos-nodes');
  const running = items.filter((i) => i.status === 'running').length;
  const sheet = (thumb: string) => {
    const s = labSpec.drawings.sheets.find((x) => x.thumb === thumb);
    return s ? `[Sheet ${s.no.slice(-2)} · ${s.title}](${s.href})` : '';
  };

  const answers: Record<string, Answer> = {
    homelab: {
      text:
        `One Dell PowerEdge R720xd (${server.threads} threads, ${server.memory.gb} GB) running Proxmox VE ${pve?.version ?? ''} on ZFS. OpenTofu puts ${talos?.count ?? 3} Talos VMs on it, and those are the Kubernetes cluster. Cilium runs its network, and Flux runs everything else from git.\n\n` +
        `Ansible configures the host, and a Raspberry Pi 4 on the top shelf is the control node. A UDM Pro runs the network and a UNAS Pro 8 holds the storage. All of it is declared in one git repo, private for now, and it's built for an AI agent to run, not me: [here's why](/blog/${SLUG.operator}/).\n\n` +
        `As of ${labSpec.lastRevised} it's ${labSpec.status.toLowerCase()}: ${running} things running, the rest still on paper. The [lab page](/lab/) has the drawings, and ${sheet('stack')} shows what runs where.`,
      cards: cards(SLUG.operator, SLUG.zfs, SLUG.talos)
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
        `For what I'm thinking about now, start with the latest post. For the homelab, start with how I rebuilt it for an AI operator. For how I work with AI, read “AI Already Took My Job”.\n\n` +
        `Or browse [all ${stats.count} posts](/blog/), going back to ${stats.first.getFullYear()}.`,
      cards: cards(metas[0]?.slug, SLUG.operator, SLUG.aijob).filter((s, i, a) => a.indexOf(s) === i)
    },
    agents: {
      text:
        `With my name on the result. When work gets big, I split it into phases: gather context, implement, then verify.\n\n` +
        `AI helps with speed, but I still own the final decision and the release. I prefer git-first, reproducible workflows because they are easier to review and easier to recover. Same pattern in my public tooling ([oh-my-claude](${omcUrl}), [openkanban](${kanbanUrl})) and in my homelab, where [an agent does the operating](/blog/${SLUG.operator}/) and I make the calls.`,
      cards: cards(SLUG.operator, SLUG.aijob, SLUG.omc)
    },
    building: {
      text:
        `[${featuredProject.name}](${featuredProject.href}), mostly. It's an AI Bible-study tool, opening soon. It answers in plain words and shows you the passages, so you can read them for yourself.\n\n` +
        `The rest is open source: ${featured.map((r) => `[${r.name}](${r.url})`).join(', ')}. Everything, plus the old PowerShell, is on the [projects page](/projects/).`,
      cards: []
    },
    rack: {
      text:
        `A 42U cabinet, and its rails count from the top. Up there is a shelf with the Raspberry Pi 4, the fiber ONT and the PoE injector that powers the U7 Pro. Under it: the UNAS Pro 8, the UDM Pro, then the R720xd. A shelf of spares sits at the very bottom, and the rest is air.\n\n` +
        `It's all drawn to spec. ${sheet('cabinet')} has every box where it sits, ${sheet('server')} opens up the R720xd, and ${sheet('stack')} shows what runs on it. The first two are stamped as built.`,
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
    lab: { status: labSpec.status, lastRevised: labSpec.lastRevised },
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
