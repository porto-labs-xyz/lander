// Keep native touch momentum; give buttons and mouse releases one animation owner.
export function mountProductCarousel(root = document) {
  const carousel = root.querySelector('.product-carousel')
  if (!carousel) return () => {}
  const doc = carousel.ownerDocument, view = doc.defaultView
  const slides = [...carousel.querySelectorAll('[data-product-slide]')]
  if (!slides.length) return () => {}
  const hardware = root.querySelector('#hardware')
  const tabs = [...root.querySelectorAll('[data-product][role=tab]')]
  const previous = root.querySelector('.carousel-prev'), next = root.querySelector('.carousel-next')
  const count = root.querySelector('.carousel-count')
  const events = new AbortController()
  const on = (target, type, fn, options = {}) => target?.addEventListener(type, fn, { ...options, signal: events.signal })
  const motion = view.matchMedia('(prefers-reduced-motion:reduce)')
  let offsets = [], width = 0, index = -1, destination = null
  let animation = 0, scrollFrame = 0, idle = 0, drag = null, touching = false
  const clampIndex = value => Math.max(0, Math.min(slides.length - 1, value))
  const measure = () => {
    const origin = carousel.getBoundingClientRect()
    width = origin.width
    const max = Math.max(0, carousel.scrollWidth - carousel.clientWidth)
    offsets = slides.map(slide => Math.max(0, Math.min(max,
      slide.getBoundingClientRect().left - origin.left + carousel.scrollLeft)))
  }
  const nearest = () => offsets.reduce((best, offset, i) =>
    Math.abs(offset - carousel.scrollLeft) < Math.abs(offsets[best] - carousel.scrollLeft) ? i : best, 0)
  const select = value => {
    const selected = clampIndex(value)
    if (index === selected) return
    index = selected
    const key = slides[index].dataset.productSlide
    if (hardware) hardware.dataset.product = key
    tabs.forEach(tab => {
      const active = tab.dataset.product === key
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1
    })
    slides.forEach((slide, i) => { slide.inert = i !== index; slide.setAttribute('aria-hidden', String(i !== index)) })
    if (count) count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`
    if (previous) previous.disabled = index === 0
    if (next) next.disabled = index === slides.length - 1
  }
  const cancel = () => {
    view.cancelAnimationFrame(animation); animation = 0
    view.clearTimeout(idle); destination = null
    carousel.classList.remove('is-settling')
  }
  const land = target => {
    carousel.scrollTo({ left: offsets[target], behavior: 'instant' })
    select(target); destination = null; animation = 0
    carousel.classList.remove('is-settling')
  }
  const choose = (value, instant = false) => {
    cancel()
    const target = clampIndex(value), start = carousel.scrollLeft, distance = offsets[target] - start
    destination = target
    carousel.classList.add('is-settling')
    if (instant || motion.matches || Math.abs(distance) < .75) { land(target); return }
    // A gentle acceleration and a soft landing, with no overshoot or second snap.
    const duration = 300 + 180 * Math.min(1, Math.abs(distance) / Math.max(1, width))
    let began
    const tick = time => {
      began ??= time
      const progress = Math.min(1, (time - began) / duration)
      const ease = progress * progress * (3 - 2 * progress)
      carousel.scrollTo({ left: start + distance * ease, behavior: 'instant' })
      if (progress < 1) animation = view.requestAnimationFrame(tick)
      else land(target)
    }
    animation = view.requestAnimationFrame(tick)
  }
  const settle = () => {
    view.clearTimeout(idle)
    if (touching || drag || destination !== null) return
    const target = nearest()
    select(target)
    // Native snap usually lands exactly. Correct a residual offset only after momentum ends.
    if (Math.abs(carousel.scrollLeft - offsets[target]) > .75) choose(target)
  }
  const queueSettle = () => { view.clearTimeout(idle); idle = view.setTimeout(settle, 180) }
  on(carousel, 'scroll', () => {
    if (!scrollFrame) scrollFrame = view.requestAnimationFrame(() => { scrollFrame = 0; select(nearest()) })
    if (destination === null) queueSettle()
  }, { passive: true })
  on(carousel, 'scrollend', settle, { passive: true })
  tabs.forEach((tab, i) => on(tab, 'click', () => choose(i)))
  on(previous, 'click', () => choose((destination ?? index) - 1))
  on(next, 'click', () => choose((destination ?? index) + 1))
  on(carousel, 'wheel', cancel, { passive: true })
  on(carousel, 'touchstart', () => { touching = true; cancel() }, { passive: true })
  const endTouch = () => { touching = false; queueSettle() }
  on(carousel, 'touchend', endTouch, { passive: true })
  on(carousel, 'touchcancel', endTouch, { passive: true })
  on(carousel, 'pointerdown', event => {
    cancel()
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a,button')) return
    drag = { x: event.clientX, y: event.clientY, left: carousel.scrollLeft, active: false }
  })
  on(carousel, 'pointermove', event => {
    if (!drag) return
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y
    if (!drag.active && Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) { drag = null; return }
    if (!drag.active && Math.abs(dx) > 8) {
      drag.active = true; carousel.setPointerCapture(event.pointerId); carousel.classList.add('is-dragging')
    }
    if (drag.active) { carousel.scrollLeft = drag.left - dx; event.preventDefault() }
  })
  const release = () => {
    if (!drag) return
    const active = drag.active; drag = null
    // Start the controlled settle before restoring native snap.
    if (active) choose(nearest())
    carousel.classList.remove('is-dragging')
  }
  on(doc, 'pointerup', release); on(carousel, 'pointercancel', release); on(carousel, 'lostpointercapture', release)
  on(carousel, 'dragstart', event => event.preventDefault())
  const resize = new view.ResizeObserver(() => {
    if (carousel.getBoundingClientRect().width === width) return
    const target = destination ?? index
    cancel(); measure(); choose(target, true)
  })
  on(motion, 'change', () => { if (motion.matches) choose(destination ?? nearest(), true) })
  on(doc, 'visibilitychange', () => { if (doc.hidden) choose(destination ?? nearest(), true) })
  measure(); select(nearest()); resize.observe(carousel)
  return () => {
    events.abort(); resize.disconnect(); cancel(); view.cancelAnimationFrame(scrollFrame)
    carousel.classList.remove('is-dragging')
  }
}
