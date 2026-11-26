import { deviceSourceWidth } from './finish-images.mjs'

const magnification = 4
const clamp = (value, max) => Math.max(0, Math.min(value, max))

export function mountHardwareReveal(root = document) {
  const gallery = root.querySelector('[data-finish-gallery]')
  if (!gallery) return () => {}
  const view = gallery.ownerDocument.defaultView
  const photo = gallery.querySelector('.finish-window')
  const lens = gallery.querySelector('.finish-lens')
  const caption = gallery.querySelector('[data-finish-name]')
  const button = gallery.querySelector('.finish-zoom')
  const slides = [...gallery.querySelectorAll('[data-finish-slide]')]
  const swatches = [...gallery.querySelectorAll('[data-finish]')]
  const rear = root.querySelector('[data-rear-gallery]')
  const rearSwatches = rear ? [...rear.querySelectorAll('[data-rear-finish]')] : []
  const rearLink = rear?.querySelector('a')
  const rearImage = rearLink?.querySelector('img')
  const rearName = rear?.querySelector('[data-rear-finish-name]')
  const hover = view.matchMedia('(any-hover: hover)')
  const events = new AbortController()
  const on = (target, type, callback, options) =>
    target.addEventListener(type, callback, { ...options, signal: events.signal })
  const pending = new WeakMap()
  let selected = slides.findIndex(slide => !slide.hidden)
  let mode = 'off', near = false, dismissHover = false
  let touchTap = false
  let pointerX = 0, pointerY = 0
  let manualX = .5, manualY = .23

  function placeLens() {
    const frame = photo.getBoundingClientRect()
    const x = mode === 'hover' ? pointerX - frame.left : manualX * frame.width
    const y = mode === 'hover' ? pointerY - frame.top : manualY * frame.height
    const left = clamp(x - lens.offsetWidth / 2, frame.width - lens.offsetWidth)
    const top = clamp(y - lens.offsetHeight / 2, frame.height - lens.offsetHeight)
    const image = slides[selected].querySelector('img').getBoundingClientRect()
    // At the pointer, both images show exactly the same material point, even
    // when the circle is held inside an edge of the photograph.
    const sampleX = x - left - (frame.left + x - image.left) * magnification
    const sampleY = y - top - (frame.top + y - image.top) * magnification
    lens.style.transform = `translate3d(${left}px,${top}px,0)`
    lens.style.backgroundSize = `${image.width * magnification}px ${image.height * magnification}px`
    lens.style.backgroundPosition = `${sampleX}px ${sampleY}px`
  }

  function displayLens() {
    const image = slides[selected].querySelector('img')
    const tier = deviceSourceWidth(image.offsetWidth * magnification, view.devicePixelRatio)
    const visible = mode !== 'off' && image.complete && image.naturalWidth >= tier
    if (visible) {
      lens.style.backgroundImage = `url("${image.currentSrc}")`
      placeLens()
    }
    photo.toggleAttribute('data-lens-visible', visible)
  }

  function prepareImage() {
    displayLens()
    if (!near && mode === 'off') return
    const image = slides[selected].querySelector('img')
    const scale = mode !== 'off' || hover.matches ? magnification : 1
    const tier = deviceSourceWidth(image.offsetWidth * scale, view.devicePixelRatio)
    if (tier <= Math.max(800, image.naturalWidth, pending.get(image) || 0)) return
    const detail = new view.Image()
    detail.src = image.dataset.render + '-' + tier + '.webp'
    pending.set(image, tier)
    detail.decode().then(() => {
      if (!events.signal.aborted && pending.get(image) === tier) image.src = detail.src
    }).catch(() => {
      if (pending.get(image) === tier) pending.delete(image)
    })
  }

  function setMode(next) {
    mode = next
    photo.toggleAttribute('data-touch-magnifier', mode === 'manual')
    button.setAttribute('aria-pressed', String(mode !== 'off'))
    button.setAttribute('aria-label', mode === 'off' ? 'Show 4× magnifier' : 'Hide magnifier')
    prepareImage()
  }

  function selectFinish(index) {
    slides[selected].hidden = true
    swatches[selected].removeAttribute('aria-current')
    rearSwatches[selected]?.setAttribute('aria-pressed', 'false')
    selected = index
    slides[selected].hidden = false
    const swatch = swatches[index]
    swatch.setAttribute('aria-current', 'true')
    const name = swatch.getAttribute('aria-label')
    caption.textContent = name
    if (rear) {
      const choice = rearSwatches[index]
      choice.setAttribute('aria-pressed', 'true')
      rearLink.href = choice.dataset.src
      rearImage.alt = choice.dataset.alt
      rearImage.src = choice.dataset.src
      rearName.textContent = name
    }
    setMode('off')
  }

  swatches.forEach((swatch, index) => on(swatch, 'click', event => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.button > 0) return
    event.preventDefault()
    selectFinish(index)
  }))
  rearSwatches.forEach((swatch, index) => on(swatch, 'click', () => selectFinish(index)))
  if (rear) rear.querySelector('.rear-finish-controls').hidden = false

  function sampleTouch(event) {
    const frame = photo.getBoundingClientRect()
    manualX = clamp((event.clientX - frame.left) / frame.width, 1)
    manualY = clamp((event.clientY - frame.top) / frame.height, 1)
    placeLens()
  }

  on(photo, 'pointerdown', event => {
    // Safari can report a finger tap's compatibility click as a mouse click.
    touchTap = event.pointerType !== 'mouse'
    if (event.pointerType === 'mouse' || mode !== 'manual') return
    photo.setPointerCapture(event.pointerId)
    sampleTouch(event)
  })
  on(photo, 'pointermove', event => {
    if (event.pointerType !== 'mouse') {
      if (mode === 'manual' && photo.hasPointerCapture(event.pointerId)) sampleTouch(event)
      return
    }
    if (event.pointerType !== 'mouse' || dismissHover) return
    pointerX = event.clientX
    pointerY = event.clientY
    if (mode !== 'hover') setMode('hover')
    else if (photo.hasAttribute('data-lens-visible')) placeLens()
  })
  function leave(event) {
    if (event.pointerType !== 'mouse') return
    dismissHover = false
    if (mode === 'hover') setMode('off')
  }
  on(photo, 'pointerleave', leave)
  on(photo, 'pointercancel', leave)
  on(view, 'scroll', () => {
    if (mode !== 'hover') return
    const frame = photo.getBoundingClientRect()
    if (pointerX < frame.left || pointerX >= frame.right || pointerY < frame.top || pointerY >= frame.bottom) setMode('off')
    else placeLens()
  }, { passive: true })

  on(button, 'click', () => {
    manualX = .5
    manualY = .23
    setMode(mode === 'off' ? 'manual' : 'off')
  })
  on(photo, 'click', event => {
    if (mode === 'off' && (touchTap || event.pointerType !== 'mouse')) setMode('manual')
    if (mode === 'manual') sampleTouch(event)
  })
  on(button, 'keydown', event => {
    if (mode !== 'manual') return
    const step = { ArrowLeft: [-.05, 0], ArrowRight: [.05, 0], ArrowUp: [0, -.05], ArrowDown: [0, .05] }[event.key]
    if (!step) return
    event.preventDefault()
    manualX = clamp(manualX + step[0], 1)
    manualY = clamp(manualY + step[1], 1)
    placeLens()
  })
  on(view, 'keydown', event => {
    if (event.key !== 'Escape' || mode === 'off') return
    dismissHover = mode === 'hover'
    setMode('off')
  })
  slides.forEach(slide => on(slide.querySelector('img'), 'load', displayLens))
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
    photo.removeAttribute('data-touch-magnifier')
    events.abort()
    visibility.disconnect()
    resize.disconnect()
  }
}
