const CLOSE_DELAY_MS = 120;

const bindDocsMenu = (menu: HTMLDetailsElement) => {
  const summary = menu.querySelector('summary');
  if (!(summary instanceof HTMLElement) || menu.dataset.menuBound === 'true') {
    return;
  }

  menu.dataset.menuBound = 'true';
  let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined;

  const clearHoverClose = () => {
    if (hoverCloseTimer !== undefined) {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = undefined;
    }
  };

  const sync = () => summary.setAttribute('aria-expanded', menu.open ? 'true' : 'false');

  const closeMenu = (returnFocus = false) => {
    clearHoverClose();
    if (!menu.open) return;
    menu.open = false;
    sync();
    if (returnFocus) {
      summary.focus();
    }
  };

  const openMenu = () => {
    clearHoverClose();
    if (!menu.open) {
      menu.open = true;
    }
    sync();
  };

  const scheduleCloseMenu = () => {
    clearHoverClose();
    hoverCloseTimer = setTimeout(() => closeMenu(), CLOSE_DELAY_MS);
  };

  sync();
  menu.addEventListener('toggle', sync);

  menu.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch') {
      openMenu();
    }
  });

  menu.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'touch') {
      scheduleCloseMenu();
    }
  });

  document.addEventListener('pointerdown', (event) => {
    const target = event.target;
    if (menu.open && target instanceof Node && !menu.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener('focusin', (event) => {
    const target = event.target;
    if (menu.open && target instanceof Node && !menu.contains(target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu(true);
    }
  });

  summary.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' && menu.open) {
      event.preventDefault();
      const firstLink = menu.querySelector('a');
      if (firstLink instanceof HTMLElement) {
        firstLink.focus();
      }
    }
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => closeMenu());
  });

  window.addEventListener('pagehide', () => closeMenu());
  document.addEventListener('astro:before-preparation', () => closeMenu());
  document.addEventListener('astro:after-swap', () => closeMenu());
};

export const initDocsMenus = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLDetailsElement>('.docs-menu').forEach((menu) => {
    bindDocsMenu(menu);
  });
};
