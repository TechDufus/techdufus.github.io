const normalize = (value: string) => value.trim().toLowerCase();

export const initBlogFilters = (root: ParentNode = document) => {
  const searchInput = root.querySelector('#blog-search');
  const countLabel = root.querySelector('#blog-count-label');
  const emptyState = root.querySelector('#blog-empty-state');
  const postCards = Array.from(root.querySelectorAll('.blog-post-card'));
  const categoryButtons = Array.from(root.querySelectorAll('.filter-chip'));

  if (postCards.length === 0 || categoryButtons.length === 0) return;

  const listRoot = root.querySelector('#blog-post-list');
  if (listRoot instanceof HTMLElement && listRoot.dataset.filterBound === 'true') {
    return;
  }

  if (listRoot instanceof HTMLElement) {
    listRoot.dataset.filterBound = 'true';
  }

  let activeCategory = 'all';

  const applyFilters = () => {
    const query = searchInput instanceof HTMLInputElement ? normalize(searchInput.value) : '';
    let visible = 0;

    postCards.forEach((card) => {
      if (!(card instanceof HTMLElement)) return;
      const category = card.dataset.category ?? '';
      const haystack = normalize(
        `${card.dataset.title ?? ''} ${card.dataset.description ?? ''} ${card.dataset.tags ?? ''}`
      );

      const matchesCategory = activeCategory === 'all' || category === activeCategory;
      const matchesQuery = query.length === 0 || haystack.includes(query);
      const isVisible = matchesCategory && matchesQuery;

      card.hidden = !isVisible;
      if (isVisible) visible += 1;
    });

    if (countLabel instanceof HTMLElement) {
      countLabel.textContent = `${visible} shown`;
    }

    if (emptyState instanceof HTMLElement) {
      emptyState.hidden = visible > 0;
    }
  };

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', applyFilters);
  }

  categoryButtons.forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener('click', () => {
      activeCategory = button.dataset.category ?? 'all';
      categoryButtons.forEach((node) => node.classList.remove('filter-chip-active'));
      button.classList.add('filter-chip-active');
      applyFilters();
    });
  });

  applyFilters();
};
