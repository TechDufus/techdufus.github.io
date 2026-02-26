const NAV_SELECTOR = '[data-scroll-chrome="site-nav"]'
const MAX_SCROLL_PX = 220

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

export const initScrollChrome = (root: ParentNode = document) => {
  const nav = root.querySelector<HTMLElement>(NAV_SELECTOR)
  if (!(nav instanceof HTMLElement) || nav.dataset.scrollChromeBound === 'true') {
    return
  }

  nav.dataset.scrollChromeBound = 'true'

  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  let frameId = 0

  const setDepth = (depth: number) => {
    nav.style.setProperty('--wow-nav-depth', depth.toFixed(3))
  }

  const sync = () => {
    frameId = 0
    if (reducedMotionQuery.matches) {
      setDepth(0)
      return
    }

    const depth = clamp01(window.scrollY / MAX_SCROLL_PX)
    setDepth(depth)
  }

  const scheduleSync = () => {
    if (frameId !== 0) {
      return
    }
    frameId = window.requestAnimationFrame(sync)
  }

  reducedMotionQuery.addEventListener('change', scheduleSync)
  window.addEventListener('scroll', scheduleSync, { passive: true })
  window.addEventListener('resize', scheduleSync, { passive: true })

  window.addEventListener(
    'pagehide',
    () => {
      if (frameId !== 0) {
        window.cancelAnimationFrame(frameId)
      }
      reducedMotionQuery.removeEventListener('change', scheduleSync)
    },
    { once: true }
  )

  scheduleSync()
}
