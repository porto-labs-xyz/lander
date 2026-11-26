import { deviceSourceWidth } from './finish-images.mjs'

export function mountHardwareReveal(root = document) {
  const gallery = root.querySelector('[data-finish-gallery]')
  if (!gallery) return () => {}
  const view = gallery.ownerDocument.defaultView
  const photo = gallery.querySelector('.finish-window')
  const caption = gallery.querySelector('[data-finish-name]')
  const button = gallery.querySelector('.finish-zoom')
  const slides = [...gallery.querySelectorAll('[data-finish-slide]')]
  const swatches = [...gallery.querySelectorAll('[data-finish]')]
  const hover = view.matchMedia('(any-hover: hover)')
  const events = new AbortController()
  const on = (target, type, callback) => target.addEventListener(type, callback, { signal: events.signal })
  const pending = new WeakMap()
  let selected = slides.findIndex(slide => !slide.hidden)
  let mode = 'wide'
  let near = false
  let dismissHover = false

  function displayZoom() {
    const image = slides[selected].querySelector('img')
    const sharp = image.complete && image.naturalWidth >= deviceSourceWidth(image.offsetWidth, view.devicePixelRatio)
    photo.toggleAttribute('data-zoomed', mode !== 'wide' && sharp)
  }

  function prepareImage() {
    displayZoom()
    if (!near && mode === 'wide') return
    const image = slides[selected].querySelector('img')
    // The layout width is the 4× footprint. CSS scales it down for the wide shot.
    const width = image.offsetWidth * (mode !== 'wide' || hover.matches ? 1 : .25)
    const tier = deviceSourceWidth(width, view.devicePixelRatio)
    if (tier <= Math.max(800, image.naturalWidth, pending.get(image) || 0)) return
    const detail = new view.Image()
    detail.src = image.dataset.render + '-' + tier + '.webp'
    pending.set(image, tier)
    // Keep the wide shot visible until the chosen finish has sharp pixels.
    detail.decode().then(() => {
      if (!events.signal.aborted && pending.get(image) === tier) image.src = detail.src
    }).catch(() => {
      if (pending.get(image) === tier) pending.delete(image)
    })
  }

  function setMode(next) {
    mode = next
    button.setAttribute('aria-pressed', String(mode !== 'wide'))
    button.setAttribute('aria-label', mode === 'wide' ? 'Zoom to 4×' : 'Return to full view')
    prepareImage()
  }

  swatches.forEach((swatch, index) => on(swatch, 'click', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button > 0) return
    event.preventDefault()
    slides[selected].hidden = true
    swatches[selected].removeAttribute('aria-current')
    selected = index
    slides[selected].hidden = false
    swatch.setAttribute('aria-current', 'true')
    caption.textContent = swatch.getAttribute('aria-label')
    setMode('wide')
  }))

  function magnify(event) {
    if (event.pointerType !== 'mouse' || dismissHover) return
    const rect = photo.getBoundingClientRect()
    photo.style.setProperty('--focus-x', (100 * (event.clientX - rect.left) / rect.width) + '%')
    photo.style.setProperty('--focus-y', (100 * (event.clientY - rect.top) / rect.height) + '%')
    if (mode !== 'hover') setMode('hover')
  }
  function leave(event) {
    if (event.pointerType !== 'mouse') return
    dismissHover = false
    if (mode === 'hover') setMode('wide')
  }
  // A stationary cursor can enter the photo as the page scrolls underneath.
  // Start the close-up when the visitor actually moves over the photograph.
  on(photo, 'pointermove', magnify)
  on(photo, 'pointerleave', leave)
  on(photo, 'pointercancel', leave)
  on(button, 'click', () => {
    photo.style.removeProperty('--focus-x')
    photo.style.removeProperty('--focus-y')
    setMode(mode === 'wide' ? 'manual' : 'wide')
  })
  on(view, 'keydown', event => {
    if (event.key !== 'Escape' || mode === 'wide') return
    dismissHover = mode === 'hover'
    setMode('wide')
  })
  slides.forEach(slide => on(slide.querySelector('img'), 'load', displayZoom))
  const visibility = new view.IntersectionObserver(([entry]) => {
    near = entry.isIntersecting
    if (near) prepareImage()
  }, { rootMargin: '160px' })
  visibility.observe(photo)
  const resize = new view.ResizeObserver(prepareImage)
  resize.observe(photo)
  on(hover, 'change', prepareImage)
  button.hidden = false
  return () => {
    events.abort()
    visibility.disconnect()
    resize.disconnect()
  }
}
