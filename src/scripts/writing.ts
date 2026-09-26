/**
 * /blog/ filters (mockup design/pro-studio/blog.html). The page server-renders every post row,
 * so without JS it is the full archive. This script filters those rows in place:
 *   search   every word must appear in the title, description or tags; matches get <mark>
 *   tags     one tag at a time via the chips (filter bar or a row's own tag chips)
 *   URL      ?q=&tag= round-trips (typing replaces history, tag clicks push; Back restores)
 *   empty    "Nothing matches" with suggestions and an "Ask the site guide" button
 * Counts are announced through a polite live region. "/" focuses the search box.
 */

const doc = document;
const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = doc) => root.querySelector<T>(sel);
const $$ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = doc) => [...root.querySelectorAll<T>(sel)];

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

type Paint = { el: HTMLElement; text: string };
type Row = { el: HTMLElement; tags: string[]; hay: string; paint: Paint[]; chips: HTMLElement[] };
type Year = { el: HTMLElement; total: number; rows: Row[]; count: HTMLElement | null; gap: HTMLElement | null; link: HTMLElement | null };

const page = $('.pg-writing');
if (page) init(page);

function init(page: HTMLElement): void {
  const input = $<HTMLInputElement>('#q', page);
  const searchBox = $('.search', page);
  const tagsEl = $('.tags', page);
  const rest = $('.tags__rest', page);
  const more = $('.tags__more', page);
  const summary = $('.summary__text', page);
  const live = $('[aria-live]', page);
  const latest = $('.latest', page);
  const empty = $('.empty', page);
  const ask = empty && $('[data-guide-open]', empty);
  const top = $('#archive-top', page);
  if (!input || !tagsEl || !summary || !empty) return;

  const baseTitle = doc.title;
  const topChips = $$('[data-tag]', tagsEl);

  // Each row is a .post-list > div wrapper around PostRow. Its tags are the row's own tag
  // buttons plus data-t, which lists only the tags past the buttons shown (see blog/index.astro).
  const years: Year[] = $$('.year', page).map((el) => {
    const rows = $$('.post-list > div', el).map((row): Row => {
      const chips = $$('.post-row__tags [data-tag]', row);
      const tags = [...chips.map((c) => c.dataset.tag || ''), ...(row.dataset.t || '').split(/\s+/)].filter(Boolean);
      const paint = [$('.post-row__title a', row), $('.post-row__desc', row), ...chips]
        .filter((x): x is HTMLElement => !!x)
        .map((x) => ({ el: x, text: x.textContent || '' }));
      const hay = `${paint[0]?.text ?? ''} ${paint[1]?.text ?? ''} ${tags.join(' ')}`.toLowerCase();
      return { el: row, tags, hay, paint, chips };
    });
    return {
      el,
      total: rows.length,
      rows,
      count: $('.year__count', el),
      gap: $('.year__gap', el),
      link: $(`.summary__years a[href="#${el.id}"]`, page)
    };
  });
  const total = years.reduce((n, y) => n + y.total, 0);

  /* ---------- state + URL ---------- */
  const state = { q: '', tag: '' };
  let showRest = false;

  function readURL(): void {
    const u = new URLSearchParams(location.search);
    state.q = (u.get('q') || '').trim().slice(0, 80);
    state.tag = (u.get('tag') || '').trim().toLowerCase().slice(0, 40);
  }
  function writeURL(push: boolean): void {
    const u = new URLSearchParams(location.search);
    u.delete('q');
    u.delete('tag');
    if (state.q) u.set('q', state.q);
    if (state.tag) u.set('tag', state.tag);
    const qs = u.toString();
    const url = location.pathname + (qs ? `?${qs}` : '');
    if (url === location.pathname + location.search) return;
    history[push ? 'pushState' : 'replaceState'](null, '', url);
  }
  const syncInput = () => {
    if (input.value !== state.q) input.value = state.q;
    searchBox?.classList.toggle('has-value', !!input.value);
  };

  /* ---------- highlight ---------- */
  // Longest term first so overlapping terms highlight the longer match.
  function hl(text: string, ts: string[]): string {
    if (!ts.length) return esc(text);
    const alternation = ts
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .sort((a, b) => b.length - a.length)
      .join('|');
    const re = new RegExp(`(${alternation})`, 'gi');
    return text.split(re).map((part, i) => (i % 2 ? `<mark>${esc(part)}</mark>` : esc(part))).join('');
  }
  const marked = new WeakSet<HTMLElement>();
  function paint(p: Paint, ts: string[]): void {
    if (!ts.length) {
      if (marked.has(p.el)) {
        p.el.textContent = p.text;
        marked.delete(p.el);
      }
      return;
    }
    p.el.innerHTML = hl(p.text, ts);
    marked.add(p.el);
  }

  /* ---------- tag chips ---------- */
  function renderTags(): void {
    const active = state.tag;
    if (active && rest?.querySelector(`[data-tag="${CSS.escape(active)}"]`)) showRest = true;
    topChips.forEach((c) => c.setAttribute('aria-pressed', String((c.dataset.tag || '') === active)));
    if (rest) rest.hidden = !showRest;
    if (more) {
      more.setAttribute('aria-expanded', String(showRest));
      more.textContent = showRest ? 'Fewer tags' : `+${rest?.children.length ?? 0} more`;
    }
    // keep the active chip visible inside the horizontally scrolling rail (mobile)
    const on = active ? tagsEl!.querySelector<HTMLElement>('[aria-pressed="true"]') : null;
    if (on && tagsEl!.scrollWidth > tagsEl!.clientWidth) {
      tagsEl!.scrollLeft = Math.max(0, on.getBoundingClientRect().left - tagsEl!.getBoundingClientRect().left + tagsEl!.scrollLeft - 24);
    } else if (!active) tagsEl!.scrollLeft = 0;
  }

  /* ---------- render ---------- */
  function render(announce: boolean): void {
    const ts = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    const filtering = !!(state.q || state.tag);
    let n = 0;
    let groupsShown = 0;

    for (const y of years) {
      let shown = 0;
      let last: Row | null = null;
      for (const r of y.rows) {
        const hit = (!state.tag || r.tags.includes(state.tag)) && ts.every((t) => r.hay.includes(t));
        r.el.hidden = !hit;
        r.el.removeAttribute('data-last');
        if (hit) {
          shown++;
          last = r;
        }
        r.paint.forEach((p) => paint(p, hit ? ts : []));
        r.chips.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.tag === state.tag)));
      }
      if (last && filtering) last.el.setAttribute('data-last', '');
      n += shown;
      if (shown) groupsShown++;
      y.el.hidden = !shown;
      if (y.link) y.link.hidden = !shown;
      if (y.gap) y.gap.hidden = filtering;
      if (y.count) y.count.innerHTML = filtering ? `<b>${shown}</b> of ${y.total}` : `<b>${y.total}</b> ${y.total === 1 ? 'post' : 'posts'}`;
    }

    if (latest) latest.hidden = filtering;
    empty!.hidden = n > 0;
    if (!n) renderEmpty();

    if (!filtering) {
      summary!.innerHTML = `Showing all <strong>${total}</strong> posts, newest first.`;
    } else {
      const bits: string[] = [];
      if (state.tag) bits.push(`tagged <em>${esc(state.tag)}</em>`);
      if (state.q) bits.push(`matching <em>“${esc(state.q)}”</em>`);
      summary!.innerHTML = `<strong>${n}</strong> of ${total} posts ${bits.join(' and ')}.<button class="summary__clear" type="button" data-clear-all>Clear</button>`;
    }
    const yearsNav = $('.summary__years', page);
    if (yearsNav) yearsNav.hidden = groupsShown < 2;

    const shownLabel = `${n} post${n === 1 ? '' : 's'}`;
    doc.title = filtering ? `${shownLabel} · ${baseTitle}` : baseTitle;
    if (announce && live) {
      const msg = n ? `${shownLabel} shown` : 'No posts match';
      live.textContent = '';
      window.setTimeout(() => (live.textContent = msg), 60);
    }
  }

  function renderEmpty(): void {
    const title = $('.empty__title', empty!);
    const hint = $('.muted', empty!);
    const tryEl = $('.empty__try .chips', empty!);
    if (title) {
      title.innerHTML = state.q
        ? `Nothing here matches <em>“${esc(state.q)}”</em>${state.tag ? ` in <em>${esc(state.tag)}</em>` : ''}.`
        : `No posts are tagged <em>${esc(state.tag)}</em>.`;
    }
    if (hint) {
      hint.textContent =
        state.q && state.tag
          ? 'Try a broader word, or drop the tag.'
          : state.q
            ? "Try a broader word. If I haven't written about it yet, the site guide will say so instead of guessing."
            : "That tag isn't used on any post.";
    }
    if (tryEl) {
      tryEl.innerHTML = ['kubernetes', 'homelab', 'claude-code', 'powershell']
        .filter((t) => t !== state.tag)
        .slice(0, 3)
        .map((t) => `<button class="chip" type="button" data-try="${t}">${t}</button>`)
        .join('');
    }
    ask?.setAttribute('data-guide-open', state.q ? `Have you written about ${state.q}?` : 'Where should I start reading?');
  }

  /* ---------- wiring ---------- */
  function setTag(tag: string, push: boolean): void {
    state.tag = state.tag === tag ? '' : tag;
    writeURL(push);
    renderTags();
    render(true);
  }
  function clearQ(): void {
    input!.value = '';
    state.q = '';
    searchBox?.classList.remove('has-value');
    writeURL(false);
    render(true);
    input!.focus();
  }
  function clearAll(): void {
    state.q = '';
    state.tag = '';
    syncInput();
    writeURL(true);
    renderTags();
    render(true);
    input!.focus({ preventScroll: true });
  }

  let typing = 0;
  input.addEventListener('input', () => {
    searchBox?.classList.toggle('has-value', !!input.value);
    window.clearTimeout(typing);
    typing = window.setTimeout(() => {
      state.q = input.value.trim().slice(0, 80);
      writeURL(false);
      render(true);
    }, 120);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && input.value) {
      e.preventDefault();
      clearQ();
    }
  });
  $('.filters', page)?.addEventListener('submit', (e) => {
    e.preventDefault();
    window.clearTimeout(typing);
    state.q = input.value.trim().slice(0, 80);
    writeURL(false);
    render(true);
    if (window.matchMedia('(max-width: 640px)').matches) input.blur();
  });
  $('.search__clear', page)?.addEventListener('click', clearQ);

  page.addEventListener('click', (e) => {
    const target = e.target as Element;
    const tagBtn = target.closest<HTMLElement>('[data-tag]');
    if (tagBtn) {
      e.preventDefault();
      const inRow = !!tagBtn.closest('.post-row');
      setTag(tagBtn.dataset.tag || '', true);
      if (inRow && top) {
        const y = top.getBoundingClientRect().top;
        if (y < 0 || y > window.innerHeight) top.scrollIntoView({ behavior: motion.matches ? 'auto' : 'smooth', block: 'start' });
      }
      return;
    }
    if (target.closest('.tags__more')) {
      showRest = !showRest;
      renderTags();
      return;
    }
    const tryBtn = target.closest<HTMLElement>('[data-try]');
    if (tryBtn) {
      state.q = '';
      syncInput();
      state.tag = '';
      setTag(tryBtn.dataset.try || '', true);
      return;
    }
    if (target.closest('[data-clear-all]')) clearAll();
  });

  // "/" focuses search (unless typing somewhere already)
  doc.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target as Element | null;
    if (t?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
    e.preventDefault();
    input.focus();
    input.select();
  });

  window.addEventListener('popstate', () => {
    const before = `${state.q}\u0000${state.tag}`;
    readURL();
    if (`${state.q}\u0000${state.tag}` === before) return; // hash jumps (#y2021) change nothing
    syncInput();
    renderTags();
    render(true);
  });

  /* ---------- cadence chart: grow the bars once visible ---------- */
  const cadence = $('.cadence', page);
  if (cadence) {
    if ('IntersectionObserver' in window && !motion.matches) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((en) => en.isIntersecting)) {
            cadence.classList.add('is-in');
            io.disconnect();
          }
        },
        { threshold: 0.4 }
      );
      io.observe(cadence);
    } else cadence.classList.add('is-in');
  }

  /* ---------- boot ---------- */
  readURL();
  syncInput();
  renderTags();
  if (state.q || state.tag) render(false);
}
