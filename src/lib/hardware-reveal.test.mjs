import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { mountHardwareReveal } from './hardware-reveal.mjs'
import { deviceSourceWidth } from './finish-images.mjs'
import { withFinishViewer } from '../content/finish-viewer.mjs'

const finishOrder = ['charcoal', 'pebble-grey', 'baby-pink', 'eucalyptus', 'powder-blue']

test('the finish gallery chooses a detail source for the projected size and screen density', () => {
  assert.equal(deviceSourceWidth(550, 2), 1600)
  assert.equal(deviceSourceWidth(941, 3), 3200)
  assert.equal(deviceSourceWidth(1920, 2), 6400)
  assert.equal(deviceSourceWidth(2022, 2), 6400)
  assert.equal(deviceSourceWidth(2592, 3), 6400)
})

test('the opening uses the full charcoal master as its only device image', () => {
  const { body } = JSON.parse(readFileSync(new URL('../content/index.json', import.meta.url)))
  const intro = body.slice(body.indexOf('<div class="intro-runway">'), body.indexOf('id="local"'))
  assert.ok(intro.includes('class="hero-box"'))
  const [, device] = intro.match(/<figure class="hero-device">([\s\S]*?)<\/figure>/)
  assert.equal((device.match(/<img\b/g) || []).length, 1)
  assert.match(device, /src="\/assets\/kiln\/finishes\/charcoal-device-6400\.webp"/)
  assert.doesNotMatch(device, /srcset=|data-render=|<source\b/)
  assert.ok(!intro.includes('data-finish-gallery'))
})

test('the static gallery exposes all five full-resolution images and starts with one preview', () => {
  const body = withFinishViewer(JSON.parse(readFileSync(new URL('../content/index.json', import.meta.url))).body)
  assert.ok(body.indexOf('id="hardware"') < body.indexOf('data-finish-gallery'))
  const finishes = [...body.matchAll(/data-finish-slide="([^"]+)"( hidden)?>/g)]
  assert.deepEqual(finishes.map(match => match[1]), finishOrder)
  assert.deepEqual(finishes.map(match => Boolean(match[2])), [true, true, false, true, true])
  const swatches = [...body.matchAll(/data-finish="([^"]+)"[^>]*>/g)]
  assert.deepEqual(swatches.map(match => match[1]), finishOrder)
  assert.deepEqual(swatches.filter(match => match[0].includes('aria-current="true"')).map(match => match[1]), ['baby-pink'])
  assert.equal((body.match(/class="finish-lens" aria-hidden="true"/g) || []).length, 1)
  assert.ok(body.includes('data-finish-name>Baby pink</span>'))
  assert.ok(body.includes('<h2 class="finish-title" id="hardware-title">Kiln.</h2>'))
  assert.ok(!body.includes('Choose your<br>capacity.'))
  for (const [, name] of finishes) {
    assert.ok(body.includes('href="/assets/kiln/finishes/' + name + '-device-6400.webp"'))
    assert.ok(body.includes('src="/assets/kiln/finishes/' + name + '-device-800.webp"'))
  }
})

test('the Kiln One product page shows the colour gallery immediately before the hardware renders', () => {
  const body = withFinishViewer(JSON.parse(readFileSync(new URL('../content/one.json', import.meta.url))).body)
  const sections = [...body.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(match => match[0])
  const gallery = sections.findIndex(section => section.includes('data-finish-gallery'))
  assert.notEqual(gallery, -1)
  assert.deepEqual([...sections[gallery].matchAll(/data-finish="([^"]+)"/g)].map(match => match[1]), finishOrder)
  assert.ok(sections[gallery + 1].includes('id="inside-one"'))
  assert.ok(sections[gallery + 1].includes('one-dual-blackwell.webp'))
  assert.ok(sections[gallery + 2].includes('id="kiln-rear"'))
  assert.ok(sections[gallery + 2].includes('one-rear-io.webp'))
  assert.ok(sections[gallery + 3].includes('id="configurations-title"'))
})

function mountGallery() {
  class Element extends EventTarget {
    attributes = new Map()
    style = {
      setProperty(name, value) { this[name] = value },
      removeProperty(name) { delete this[name] },
    }
    setAttribute(name, value) { this.attributes.set(name, value) }
    removeAttribute(name) { this.attributes.delete(name) }
    getAttribute(name) { return this.attributes.get(name) }
    hasAttribute(name) { return this.attributes.has(name) }
    toggleAttribute(name, enabled) {
      if (enabled) this.setAttribute(name, '')
      else this.removeAttribute(name)
    }
  }
  class Observer { observe() {} disconnect() {} }
  const view = Object.assign(new EventTarget(), {
    devicePixelRatio: 2,
    matchMedia: () => Object.assign(new EventTarget(), { matches: true }),
    ResizeObserver: Observer, IntersectionObserver: Observer,
  })
  const pending = []
  view.Image = class {
    decode() { return new Promise(resolve => pending.push(resolve)) }
  }
  const photo = new Element(), button = new Element(), caption = new Element()
  const lens = Object.assign(new Element(), { offsetWidth: 160, offsetHeight: 160 })
  photo.setPointerCapture = id => { photo.capturedPointer = id }
  photo.hasPointerCapture = id => photo.capturedPointer === id
  photo.getBoundingClientRect = () => ({ left: 10, top: 20, width: 600, height: 450 })
  const swatches = finishOrder.map(name => {
    const swatch = new Element()
    swatch.setAttribute('aria-label', name)
    return swatch
  })
  const slides = finishOrder.map((name, i) => {
    const img = Object.assign(new Element(), {
      dataset: { render: name }, complete: true, naturalWidth: 800, offsetWidth: 400,
      getBoundingClientRect: () => ({ left: 150, top: 48, width: 400, height: 360 }),
    })
    return { hidden: i !== 2, querySelector: () => img }
  })
  const gallery = {
    ownerDocument: { defaultView: view },
    querySelector: key => ({ '.finish-window': photo, '.finish-lens': lens, '.finish-zoom': button, '[data-finish-name]': caption })[key],
    querySelectorAll: key => key === '[data-finish]' ? swatches : slides,
  }
  const cleanup = mountHardwareReveal({ querySelector: () => gallery })
  const pointer = (type, pointerType = 'mouse') => photo.dispatchEvent(Object.assign(new Event(type), {
    pointerType, clientX: 310, clientY: 245,
  }))
  const lensVisible = () => photo.hasAttribute('data-lens-visible')
  function load(index) {
    const image = slides[index].querySelector()
    image.currentSrc = image.src
    image.naturalWidth = 3200
    image.dispatchEvent(new Event('load'))
  }
  return { view, photo, lens, button, caption, swatches, slides, pending, pointer, lensVisible, load, cleanup }
}

test('the circular lens samples the material at the pointer at 4× and dismisses on leave or Escape', async () => {
  const g = mountGallery()
  g.pointer('pointerenter')
  assert.equal(g.pending.length, 0)
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), false)
  g.pending.shift()()
  await Promise.resolve()
  assert.equal(g.slides[2].querySelector().src, 'baby-pink-3200.webp')
  g.load(2)
  assert.equal(g.lensVisible(), true)
  assert.equal(g.lens.style.backgroundImage, 'url("baby-pink-3200.webp")')
  assert.equal(g.lens.style.transform, 'translate3d(220px,145px,0)')
  assert.equal(g.lens.style.backgroundSize, '1600px 1440px')
  assert.equal(g.lens.style.backgroundPosition, '-560px -708px')
  g.view.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }))
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), false)
  g.pointer('pointerleave')
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), true)
  g.pointer('click')
  assert.equal(g.lensVisible(), true)
  g.pointer('pointerleave')
  assert.equal(g.lensVisible(), false)
  g.cleanup()
})

test('swatches open wide, late loads stay hidden, and the lens follows the selected finish', async () => {
  const g = mountGallery()
  for (let i = 0; i < finishOrder.length; i++) {
    g.swatches[i].dispatchEvent(new Event('click'))
    assert.equal(g.caption.textContent, finishOrder[i])
    assert.deepEqual(g.slides.map(slide => !slide.hidden), finishOrder.map((_, j) => j === i))
    g.pointer('pointermove', 'touch')
    assert.equal(g.lensVisible(), false)
    g.button.dispatchEvent(new Event('click'))
    assert.equal(g.button.getAttribute('aria-pressed'), 'true')
    g.button.dispatchEvent(new Event('click'))
    g.pending.shift()()
    await Promise.resolve()
    g.load(i)
    assert.equal(g.lensVisible(), false)
    g.button.dispatchEvent(new Event('click'))
    assert.equal(g.lensVisible(), true)
    assert.equal(g.lens.style.backgroundImage, 'url("' + finishOrder[i] + '-3200.webp")')
  }
  g.cleanup()
  g.swatches[0].dispatchEvent(new Event('click'))
  assert.equal(g.caption.textContent, 'powder-blue')
})


test('touch opens the lens on a tap and drags only after magnification is enabled', () => {
  const g = mountGallery()
  g.pointer('pointermove', 'touch')
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), false)
  g.pointer('click', 'touch')
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), true)
  assert.equal(g.button.getAttribute('aria-pressed'), 'true')
  g.load(2)
  assert.equal(g.lensVisible(), true)
  g.photo.dispatchEvent(Object.assign(new Event('pointerdown'), {
    pointerType: 'touch', pointerId: 4, clientX: 310, clientY: 245,
  }))
  const before = g.lens.style.backgroundPosition
  g.photo.dispatchEvent(Object.assign(new Event('pointermove'), {
    pointerType: 'touch', pointerId: 4, clientX: 400, clientY: 300,
  }))
  assert.notEqual(g.lens.style.backgroundPosition, before)
  g.button.dispatchEvent(new Event('click'))
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), false)
  assert.equal(g.lensVisible(), false)
  g.cleanup()
})


test('Safari touch taps open the lens even when the compatibility click reports mouse', () => {
  const g = mountGallery()
  g.pointer('pointerdown', 'touch')
  g.pointer('pointerup', 'touch')
  g.pointer('click', 'mouse')
  g.load(2)
  assert.equal(g.lensVisible(), true)
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), true)
  g.cleanup()
})
