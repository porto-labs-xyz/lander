// Each finish settles at full size and at 4× so the visitor can stop at either view.
export function finishFrame(progress, count) {
  const position = Math.min(1, Math.max(0, progress)) * count
  const index = Math.min(count - 1, Math.floor(position))
  const phase = position - index
  const ramp = Math.max(0, Math.min(1, (.80 - phase) / .65))
  const eased = ramp * ramp * (3 - 2 * ramp)
  return { index, scale: 1 + 3 * eased }
}

export function mountHardwareReveal(root = document) {
  const runway = root.querySelector('[data-finish-gallery]')
  if (!runway) return () => {}
  const doc = runway.ownerDocument
  const view = doc.defaultView
  const stage = runway.querySelector('.finish-stage')
  const viewerWrap = runway.querySelector('.finish-viewer-wrap')
  const viewer = runway.querySelector('.finish-viewer')
  const camera = runway.querySelector('.finish-camera')
  const caption = runway.querySelector('[data-finish-name]')
  const zoomButton = runway.querySelector('.finish-zoom')
  const slides = [...runway.querySelectorAll('[data-finish-slide]')]
  const swatches = [...runway.querySelectorAll('[data-finish]')]
  const header = root.querySelector('.site-header')
  const dock = root.querySelector('.mobile-dock')
  const motion = view.matchMedia('(prefers-reduced-motion: reduce)')
  const events = new AbortController()
  const on = (target, type, listener, options = {}) =>
    target.addEventListener(type, listener, { ...options, signal: events.signal })
  let index = -1, scale = 1, frame = 0, start = 0, travel = 0
  let disposed = false
  zoomButton.hidden = false
  runway.style.setProperty('--finish-count', String(slides.length))

  function show(nextIndex, nextScale) {
    if (nextIndex !== index) {
      if (index !== -1) {
        slides[index].hidden = true
        swatches[index].removeAttribute('aria-current')
      }
      index = nextIndex
      slides[index].hidden = false
      swatches[index].setAttribute('aria-current', 'true')
      caption.textContent = swatches[index].getAttribute('aria-label')
    }
    const image = slides[index].querySelector('img')
    image.loading = 'eager'
    if (nextScale > 1.01 && image.dataset.detail && image.getAttribute('src') !== image.dataset.detail) {
      image.setAttribute('src', image.dataset.detail)
    }
    scale = nextScale
    camera.style.transform = 'scale(' + scale.toFixed(4) + ')'
    const zoomed = scale > 2.5
    zoomButton.setAttribute('aria-pressed', String(zoomed))
    zoomButton.setAttribute('aria-label', zoomed ? 'Return to full view' : 'Zoom to 4×')
  }

  function paint() {
    frame = 0
    if (!travel) return
    const state = finishFrame((view.scrollY - start) / travel, slides.length)
    if (state.index !== index || state.scale !== scale) show(state.index, state.scale)
  }

  function schedule() {
    if (travel && !frame) frame = view.requestAnimationFrame(paint)
  }

  function measure() {
    if (disposed) return
    const headerHeight = header?.offsetHeight || 0
    const available = view.innerHeight - headerHeight - (dock?.offsetHeight || 0)
    runway.style.setProperty('--finish-top', headerHeight + 'px')
    runway.style.setProperty('--finish-height', Math.max(0, available) + 'px')
    // If the whole opening cannot fit, pin only the photo. The surrounding
    // headline and copy then scroll naturally, including on magnified screens.
    runway.classList.remove('finish-compact')
    runway.classList.toggle('finish-scroll', !motion.matches)
    const compact = !motion.matches && stage.offsetHeight > available + 2
    runway.classList.toggle('finish-compact', compact)
    const track = compact ? viewerWrap : runway
    const pinned = compact ? viewer : stage
    travel = motion.matches ? 0 : track.offsetHeight - pinned.offsetHeight
    start = track.getBoundingClientRect().top + view.scrollY - headerHeight
    if (travel) paint()
    else show(Math.max(0, index), 1)
  }

  function goTo(nextIndex, zoomed) {
    if (!travel) {
      show(nextIndex, zoomed ? 4 : 1)
      return
    }
    const phase = zoomed ? .06 : .90
    const progress = (nextIndex + phase) / slides.length
    view.scrollTo({ top: start + travel * progress, behavior: 'instant' })
    paint()
  }

  swatches.forEach((swatch, i) => on(swatch, 'click', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button > 0) return
    event.preventDefault()
    goTo(i, false)
  }))
  on(zoomButton, 'click', () => goTo(index, scale <= 2.5))
  on(view, 'scroll', schedule, { passive: true })
  on(view, 'resize', measure)
  on(view, 'pageshow', measure)
  on(motion, 'change', measure)
  let observer
  if (view.ResizeObserver) {
    observer = new view.ResizeObserver(measure)
    observer.observe(doc.documentElement)
    observer.observe(stage)
    if (header) observer.observe(header)
    if (dock) observer.observe(dock)
  }
  show(0, 1)
  measure()
  doc.fonts?.ready.then(measure)
  return () => {
    disposed = true
    events.abort()
    observer?.disconnect()
    view.cancelAnimationFrame(frame)
  }
}
