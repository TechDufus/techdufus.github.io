// Site guide: a scripted chat over real site content (not a live AI).
// Answers load lazily from /guide.json (built by src/pages/guide.json.ts) the first time a panel mounts.
// Scripted prompts map to prewritten answers; free text is a transparent keyword match over posts.
// API: window.SiteGuide.open(question?), window.SiteGuide.mount(el, { inline }), plus
// [data-guide-open="question"] click hooks and [data-guide-inline="seed?"] auto-mounts.

type Post = { slug: string; href: string; title: string; description: string; date: string; tags: string[]; minutes: number };
type GuideData = {
  posts: Post[];
  repos: { name: string }[];
  prompts: { q: string; a: string }[];
  answers: Record<string, { text: string; cards: string[] }>;
};
type Reply = { text: string; cards: Post[]; note: string };
type MountOptions = { inline?: boolean; dock?: boolean; seed?: string | null };
type Chat = { el: HTMLElement; ask: (q: string) => void; reset: () => void; focus: () => void };

declare global {
  interface Window {
    SiteGuide: { open: (question?: string) => void; mount: (el: HTMLElement, opts?: MountOptions) => Chat };
  }
}

const doc = document;
const launcher = doc.querySelector<HTMLButtonElement>('[data-guide-launcher]');
const AVATAR = launcher?.dataset.avatar || '/img/profile/techdufus.webp';
const EMAIL = launcher?.dataset.email || 'hey@techdufus.com';
const SEEN = 'techdufus.guide.seen';
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
// Executor form on purpose: Promise.withResolvers needs Safari 17.4+, and this ships to every page.
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const ESC: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
const svg = (vb: string, d: string, w: number) =>
  `<svg viewBox="${vb}" aria-hidden="true" focusable="false"><path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- data (fetched once, on first mount) ---------- */
let data: GuideData | undefined;
let loading: Promise<GuideData> | undefined;
function load(): Promise<GuideData> {
  return (loading ||= fetch('/guide.json')
    .then((r) => {
      if (!r.ok) throw new Error(`guide.json ${r.status}`);
      return r.json() as Promise<GuideData>;
    })
    .then((d) => (data = d))
    .catch((e) => {
      loading = undefined; // allow a retry on the next question
      throw e;
    }));
}

/* ---------- engine ---------- */
const STOP = new Set(
  'a an and are about any anything can could did do does done for from get got have how i im in is it its just me my of on or please show so tell that the there this to up us want was what whats when where which who why will with write written you your yours ya hey hi hello know like'.split(' ')
);
const ALIAS: Record<string, string> = { k8s: 'kubernetes', kube: 'kubernetes', ps: 'powershell', pwsh: 'powershell', golang: 'go', llm: 'ai', agentic: 'agents', agent: 'agents', tf: 'terraform', lab: 'homelab', 'home-lab': 'homelab' };

function intentOf(q: string, d: GuideData): string | undefined {
  const prompt = d.prompts.find((p) => p.q === q);
  if (prompt) return prompt.a;
  const s = q.toLowerCase();
  if (/\b(hire|hiring|consult\w*|contract\w*|freelance|services?|rates?|pricing|price|availab\w*|work with you|engagement|contact|reach you|get in touch|email)\b/.test(s)) return 'hire';
  if (/oh[\s-]?my[\s-]?claude/.test(s)) return 'omc';
  const repo = d.repos.find((r) => s.includes(r.name.toLowerCase()) && d.answers[`repo:${r.name}`]);
  if (repo) return `repo:${repo.name}`;
  if (/\b(homelab|home lab|lab)\b/.test(s) && /\b(run|running|hardware|stack|server|what'?s in|inside)\b/.test(s)) return 'homelab';
  if (/\b(start|begin|first|recommend\w*|best post)\b/.test(s) && /\b(read|reading|post|posts|blog)\b/.test(s)) return 'start';
  if (/\bhow\b/.test(s) && /\b(ai|agents?|agentic|claude|codex)\b/.test(s) && /\b(work|use|workflow)\b/.test(s)) return 'agents';
}

function search(q: string, posts: Post[]) {
  const terms = [
    ...new Set(
      q.toLowerCase().replace(/[^a-z0-9+#.\- ]/g, ' ').split(/\s+/)
        .map((t) => t.replace(/^[.\-]+|[.\-]+$/g, ''))
        .filter((t) => t && !STOP.has(t) && (t.length > 2 || t === 'ai' || t === 'go'))
        .map((t) => ALIAS[t] || t)
    )
  ];
  const hits = posts
    .map((p) => {
      let score = 0;
      const matched = new Set<string>();
      for (const t of terms) {
        const stem = t.length > 4 ? t.replace(/s$/, '') : t;
        const re = new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
        if (p.tags.some((g) => (g = g.toLowerCase()) === t || g.startsWith(stem))) { score += 4; matched.add(t); }
        if (re.test(p.title)) { score += 3; matched.add(t); }
        if (re.test(p.description)) { score += 1; matched.add(t); }
      }
      return { p, score, matched };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.matched.size - a.matched.size || b.score - a.score || b.p.date.localeCompare(a.p.date))
    .slice(0, 3);
  return { terms, hits };
}

function reply(q: string, d: GuideData): Reply {
  const a = d.answers[intentOf(q, d) ?? ''];
  if (a) {
    const cards = a.cards.map((s) => d.posts.find((p) => p.slug === s)).filter((p): p is Post => !!p);
    return { text: a.text, cards, note: 'Scripted answer, written from techdufus.com' };
  }
  const { terms, hits } = search(q, d.posts);
  if (hits.length) {
    const used = [...new Set(hits.flatMap((h) => [...h.matched]))];
    return {
      text: "Here's what I've written about that:",
      cards: hits.map((h) => h.p),
      note: `Keyword match on ${used.map((t) => `“${t}”`).join(', ')} across ${d.posts.length} post titles, tags and descriptions`
    };
  }
  return {
    text: `I don't have a post on ${terms.length ? `“${terms.slice(0, 3).join(' ')}”` : 'that'} yet, and I'd rather not guess. Try one of the suggestions below, or ask me directly at [${EMAIL}](mailto:${EMAIL}).`,
    cards: [],
    note: `No keyword match across ${d.posts.length} posts`
  };
}

// Mini-markup → tokens: [label](href) links, words/whitespace, blank line = new paragraph.
type Token = { v: string; href?: string } | null;
function tokenize(text: string): Token[] {
  const out: Token[] = [];
  text.split(/\n\n+/).forEach((para, i) => {
    if (i) out.push(null);
    for (const m of para.matchAll(/\[([^\]]+)\]\(([^)]+)\)|[^[\s]+|\s+|\[/g)) out.push(m[1] ? { v: m[1], href: m[2] } : { v: m[0] });
  });
  return out;
}

/* ---------- panel ---------- */
let uid = 0;

function mount(el: HTMLElement, opts: MountOptions = {}): Chat {
  const id = `guide-${++uid}`;
  el.classList.add('chat');
  el.classList.toggle('chat--inline', !!opts.inline);
  el.classList.toggle('chat--dock', !!opts.dock);
  if (!opts.dock) {
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Site guide (scripted)');
  }
  el.innerHTML = `<div class="chat__head">
<span class="chat__avatar"><img src="${esc(AVATAR)}" alt="" width="34" height="34" loading="lazy" decoding="async"></span>
<div class="chat__titles"><p class="chat__title" id="${id}-title">Site guide · scripted</p><p class="chat__sub">answers from techdufus.com</p></div>
<button class="icon-btn" type="button" data-guide-reset aria-label="Start over" title="Start over">${svg('0 0 16 16', 'M3 8a5 5 0 1 0 1.6-3.7M3 2.5v2.8h2.8', 1.4)}</button>
${opts.dock ? `<button class="icon-btn" type="button" data-guide-close aria-label="Close site guide">${svg('0 0 16 16', 'M4 4l8 8M12 4l-8 8', 1.5)}</button>` : ''}
</div>
<div class="chat__log" role="log" aria-live="off" aria-label="Conversation" tabindex="0"></div>
<div class="sr-only" aria-live="polite" aria-atomic="true"></div>
<div class="chat__prompts-wrap" hidden><div class="chat__prompts" role="group" aria-label="Suggested questions"></div></div>
<form class="chat__form" autocomplete="off">
<label class="sr-only" for="${id}-input">Ask a question</label>
<input class="chat__input" id="${id}-input" name="q" type="text" maxlength="200" placeholder="Ask about posts, the lab, or my work…" enterkeyhint="send">
<button class="chat__send" type="submit" aria-label="Send">${svg('0 0 16 16', 'M8 13V3M3.5 7.5L8 3l4.5 4.5', 1.7)}</button>
</form>
<p class="chat__foot">Scripted answers from techdufus.com, not a live AI.</p>`;

  const $ = <T extends Element = HTMLElement>(sel: string) => el.querySelector(sel) as T;
  const log = $('.chat__log');
  const live = $('[aria-atomic]');
  const barWrap = $('.chat__prompts-wrap');
  const bar = $('.chat__prompts');
  const input = $<HTMLInputElement>('.chat__input');
  const send = $('.chat__send');
  let asked = new Set<string>();
  let busy = false;
  let queue: string[] = [];
  let runId = 0;

  const toBottom = (force?: boolean) => {
    if (force || log.scrollHeight - log.scrollTop - log.clientHeight < 80) log.scrollTop = log.scrollHeight;
  };
  const promptButtons = (list: { q: string }[]) =>
    list.map(({ q }) => `<button class="chat__prompt" type="button" data-q="${esc(q)}">${esc(q)}</button>`).join('');
  function renderBar() {
    const left = (data?.prompts ?? []).filter((p) => !asked.has(p.q));
    bar.innerHTML = promptButtons(left);
    barWrap.hidden = !asked.size || !left.length;
  }
  function setBusy(b: boolean) {
    busy = b;
    send.setAttribute('aria-disabled', String(b));
  }

  function greet() {
    const my = runId;
    log.innerHTML = `<div class="chat__msg chat__msg--bot"><div class="chat__bubble"><p>Hi. I'm a scripted guide to techdufus.com, not a live AI. I only answer from what's on this site: the posts, the lab and my repos.</p><p>Pick a question, or type your own.</p></div>
<div class="chat__intro-prompts" role="group" aria-label="Suggested questions"><span class="chat__typing" role="img" aria-label="Loading suggestions"><i></i><i></i><i></i></span></div></div>`;
    load().then(
      (d) => {
        const intro = log.querySelector('.chat__intro-prompts');
        if (intro && my === runId) intro.innerHTML = promptButtons(d.prompts);
        renderBar();
      },
      () => log.querySelector('.chat__intro-prompts')?.remove()
    );
  }

  async function stream(bubble: Element, text: string, my: number) {
    const instant = reduced();
    const caret = doc.createElement('span');
    caret.className = 'chat__caret';
    caret.setAttribute('aria-hidden', 'true');
    let para = bubble.appendChild(doc.createElement('p'));
    if (!instant) para.append(caret);
    for (const tk of tokenize(text)) {
      if (my !== runId) return false;
      if (!tk) {
        para = bubble.appendChild(doc.createElement('p'));
        if (!instant) para.append(caret);
        continue;
      }
      let node: Node = doc.createTextNode(tk.v);
      if (tk.href) {
        const a = doc.createElement('a');
        a.textContent = tk.v;
        a.href = tk.href;
        if (/^https?:/.test(tk.href)) { a.target = '_blank'; a.rel = 'noopener'; }
        node = a;
      }
      if (instant) { para.append(node); continue; }
      para.insertBefore(node, caret);
      toBottom();
      if (/^\s+$/.test(tk.v)) continue;
      await wait(16 + Math.random() * 26 + (/[.!?:]$/.test(tk.v) ? 150 : /,$/.test(tk.v) ? 70 : 0));
    }
    caret.remove();
    return true;
  }

  async function run(q: string) {
    const my = ++runId;
    setBusy(true);
    asked.add(q);
    log.querySelector('.chat__intro-prompts')?.remove();
    renderBar();
    log.insertAdjacentHTML('beforeend', `<div class="chat__msg chat__msg--user"><div class="chat__bubble">${esc(q)}</div></div>`);
    const b = doc.createElement('div');
    b.className = 'chat__msg chat__msg--bot';
    b.setAttribute('aria-busy', 'true');
    b.innerHTML = '<div class="chat__bubble"><span class="chat__typing" role="img" aria-label="Thinking"><i></i><i></i><i></i></span></div>';
    log.append(b);
    toBottom(true);

    let a: Reply;
    try {
      a = reply(q, await load());
      renderBar();
    } catch {
      a = { text: `I couldn't load my answers just now. Try again in a moment, or email me at [${EMAIL}](mailto:${EMAIL}).`, cards: [], note: '' };
    }
    if (!reduced()) await wait(420 + Math.random() * 280);
    if (my !== runId) return;
    const bubble = b.firstElementChild!;
    bubble.innerHTML = '';
    if (!(await stream(bubble, a.text, my))) return;
    if (a.cards.length) {
      b.insertAdjacentHTML(
        'beforeend',
        `<div class="chat__cards">${a.cards
          .map(
            (p, i) => `<a class="chat__card" href="${esc(p.href)}" style="animation-delay:${i * 90}ms"><span class="chat__card-title">${esc(p.title)}</span><span class="chat__card-meta">${new Date(`${p.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })} · ${p.minutes} min</span><span class="chat__card-go" aria-hidden="true">→</span></a>`
          )
          .join('')}</div>`
      );
    }
    if (a.note) b.insertAdjacentHTML('beforeend', `<p class="chat__note">${esc(a.note)}</p>`);
    b.removeAttribute('aria-busy');
    toBottom(true);
    live.textContent =
      a.text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\n+/g, ' ') +
      (a.cards.length ? ` Links: ${a.cards.map((p) => p.title).join('; ')}.` : '');
    setBusy(false);
    const next = queue.shift();
    if (next) run(next);
  }

  function ask(q: string) {
    q = String(q || '').trim();
    if (!q) return;
    if (busy) queue.push(q);
    else run(q);
  }

  function reset() {
    runId++;
    queue = [];
    asked = new Set();
    setBusy(false);
    live.textContent = '';
    greet();
    renderBar();
  }

  el.addEventListener('click', (e) => {
    const t = e.target as Element;
    const p = t.closest<HTMLElement>('[data-q]');
    if (p) {
      ask(p.dataset.q!);
      // The clicked prompt is removed/re-rendered; keep focus (and Esc/Tab handling) inside the panel.
      if (!el.contains(doc.activeElement)) log.focus({ preventScroll: true });
    } else if (t.closest('[data-guide-reset]')) {
      reset();
      input.focus();
    }
  });
  $('.chat__form').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = input.value;
    if (busy && !q.trim()) return;
    input.value = '';
    ask(q);
  });

  greet();
  if (opts.seed) ask(opts.seed);
  return { el, ask, reset, focus: () => input.focus() };
}

/* ---------- launcher + dock ---------- */
let dock: HTMLElement | undefined;
let dockChat: Chat;
let lastFocus: HTMLElement | null = null;
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

function trapTab(e: KeyboardEvent, box: HTMLElement) {
  const items = [...box.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((n) => n.getClientRects().length > 0);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  const active = doc.activeElement;
  if (e.shiftKey && (active === first || !box.contains(active))) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
}

function markSeen() {
  launcher?.classList.add('is-collapsed');
  try { localStorage.setItem(SEEN, '1'); } catch { /* private mode */ }
}

function open(q?: string) {
  if (!dock) {
    dock = doc.createElement('div');
    dock.className = 'chat-dock';
    dock.setAttribute('role', 'dialog');
    dock.setAttribute('aria-modal', 'true');
    const inner = doc.createElement('div');
    dock.append(inner);
    doc.body.append(dock);
    dockChat = mount(inner, { dock: true });
    dock.setAttribute('aria-labelledby', inner.querySelector('.chat__title')!.id);
    dock.addEventListener('click', (e) => { if ((e.target as Element).closest('[data-guide-close]')) close(); });
    dock.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.stopPropagation(); close(); }
      else if (e.key === 'Tab') trapTab(e, dock!);
    });
  }
  const wasOpen = dock.classList.contains('is-open');
  if (!wasOpen) {
    const active = doc.activeElement as HTMLElement | null;
    lastFocus = active && active !== doc.body ? active : launcher;
    dock.classList.add('is-open');
    launcher?.setAttribute('aria-expanded', 'true');
    markSeen();
    if (matchMedia('(max-width: 560px)').matches) doc.body.style.overflow = 'hidden';
    requestAnimationFrame(() => requestAnimationFrame(() => dock!.classList.add('is-shown')));
  }
  setTimeout(() => dockChat.focus(), 40);
  if (q) setTimeout(() => dockChat.ask(q), wasOpen || reduced() ? 0 : 240);
}

function close() {
  if (!dock?.classList.contains('is-open')) return;
  dock.classList.remove('is-shown');
  launcher?.setAttribute('aria-expanded', 'false');
  doc.body.style.overflow = '';
  setTimeout(() => dock!.classList.remove('is-open'), reduced() ? 0 : 240);
  (lastFocus && doc.contains(lastFocus) ? lastFocus : launcher)?.focus();
}

/* ---------- boot ---------- */
if (launcher) {
  let seen = false;
  try { seen = localStorage.getItem(SEEN) === '1'; } catch { /* private mode */ }
  if (seen) launcher.classList.add('is-collapsed');
  else setTimeout(markSeen, 7000);
  launcher.hidden = false;
  launcher.addEventListener('click', () => open());
}
doc.addEventListener('click', (e) => {
  const t = (e.target as Element).closest?.('[data-guide-open]');
  if (!t) return;
  e.preventDefault();
  open(t.getAttribute('data-guide-open') || '');
});
doc.querySelectorAll<HTMLElement>('[data-guide-inline]').forEach((el) => mount(el, { inline: true, seed: el.dataset.guideInline || null }));

window.SiteGuide = { open, mount: (el, opts) => mount(el, { inline: true, ...opts }) };

export {};
