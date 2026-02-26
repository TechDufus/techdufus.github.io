const HALO_SELECTOR = '[data-pointer-halo="subtle"]'
const SIGNATURE_SELECTOR = '[data-signature="home-hero"]'
const SIGNATURE_SEEN_KEY = 'tdf_hero_signature_seen'
const SIGNATURE_DELAY_MS = 450
const SIGNATURE_DURATION_MS = 1720
const DESKTOP_POINTER_QUERY = '(hover: hover) and (pointer: fine) and (min-width: 960px)'
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

const trackedSurfaces = new Set<HTMLElement>()
let pointerWatchersBound = false

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

const setPointerOrigin = (surface: HTMLElement, xPercent: number, yPercent: number) => {
  surface.style.setProperty('--mx', `${xPercent}%`)
  surface.style.setProperty('--my', `${yPercent}%`)
}

const getImmediateHaloLayer = (surface: HTMLElement): HTMLElement | null => {
  for (const child of surface.children) {
    if (child instanceof HTMLElement && child.classList.contains('pointer-halo-layer')) {
      return child
    }
  }
  return null
}

const ensureHaloLayer = (surface: HTMLElement) => {
  const existingLayer = getImmediateHaloLayer(surface)
  if (existingLayer) {
    return existingLayer
  }

  const layer = document.createElement('span')
  layer.className = 'pointer-halo-layer'
  layer.setAttribute('aria-hidden', 'true')
  surface.insertBefore(layer, surface.firstChild)
  return layer
}

const syncPointerCapability = () => {
  const canTrackPointer =
    window.matchMedia(DESKTOP_POINTER_QUERY).matches && !window.matchMedia(REDUCED_MOTION_QUERY).matches

  trackedSurfaces.forEach((surface) => {
    surface.dataset.pointerReady = canTrackPointer ? 'true' : 'false'
    if (!canTrackPointer) {
      setPointerOrigin(surface, 50, 50)
    }
  })
}

const bindPointerCapabilityWatchers = () => {
  if (pointerWatchersBound) {
    return
  }

  pointerWatchersBound = true
  const desktopPointerQuery = window.matchMedia(DESKTOP_POINTER_QUERY)
  const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY)
  const handleCapabilityChange = () => syncPointerCapability()

  desktopPointerQuery.addEventListener('change', handleCapabilityChange)
  reducedMotionQuery.addEventListener('change', handleCapabilityChange)
  window.addEventListener('resize', handleCapabilityChange, { passive: true })

  window.addEventListener(
    'pagehide',
    () => {
      desktopPointerQuery.removeEventListener('change', handleCapabilityChange)
      reducedMotionQuery.removeEventListener('change', handleCapabilityChange)
      window.removeEventListener('resize', handleCapabilityChange)
      trackedSurfaces.clear()
      pointerWatchersBound = false
    },
    { once: true }
  )
}

const bindPointerHalo = (surface: HTMLElement) => {
  if (surface.dataset.pointerHaloBound === 'true') {
    return
  }

  surface.dataset.pointerHaloBound = 'true'
  trackedSurfaces.add(surface)
  setPointerOrigin(surface, 50, 50)
  ensureHaloLayer(surface)

  const updatePointer = (event: PointerEvent) => {
    if (surface.dataset.pointerReady !== 'true' || event.pointerType === 'touch') {
      return
    }

    const rect = surface.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) {
      return
    }
    const x = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100)
    const y = clamp(((event.clientY - rect.top) / rect.height) * 100, 0, 100)
    setPointerOrigin(surface, x, y)
  }

  const resetPointer = () => {
    setPointerOrigin(surface, 50, 50)
  }

  surface.addEventListener('pointerenter', updatePointer, { passive: true })
  surface.addEventListener('pointermove', updatePointer, { passive: true })
  surface.addEventListener('pointerleave', resetPointer, { passive: true })
}

const hasSeenHeroSignature = () => {
  try {
    return window.sessionStorage.getItem(SIGNATURE_SEEN_KEY) === '1'
  } catch {
    return false
  }
}

const markHeroSignatureSeen = () => {
  try {
    window.sessionStorage.setItem(SIGNATURE_SEEN_KEY, '1')
  } catch {
    // Ignore storage errors so visual behavior still works in restricted contexts.
  }
}

const initHeroSignature = (root: ParentNode = document) => {
  const hero = root.querySelector<HTMLElement>(SIGNATURE_SELECTOR)
  if (!(hero instanceof HTMLElement) || hero.dataset.signatureBound === 'true') {
    return
  }

  hero.dataset.signatureBound = 'true'

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches
  if (reducedMotion || coarsePointer) {
    hero.dataset.signaturePlay = 'done'
    return
  }

  if (hasSeenHeroSignature()) {
    hero.dataset.signaturePlay = 'done'
    return
  }

  window.setTimeout(() => {
    if (window.scrollY >= 60) {
      return
    }

    hero.dataset.signaturePlay = 'true'
    markHeroSignatureSeen()

    window.setTimeout(() => {
      hero.dataset.signaturePlay = 'done'
    }, SIGNATURE_DURATION_MS)
  }, SIGNATURE_DELAY_MS)
}

export const initPointerHalo = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>(HALO_SELECTOR).forEach((surface) => {
    bindPointerHalo(surface)
  })

  bindPointerCapabilityWatchers()
  syncPointerCapability()
  initHeroSignature(root)
}
