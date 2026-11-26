import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { finishFrame, mountHardwareReveal } from './hardware-reveal.mjs'
import { deviceSourceWidth } from './finish-images.mjs'

const finishOrder = ['charcoal', 'pebble-grey', 'baby-pink', 'eucalyptus', 'powder-blue']

test('the opening chooses a detail source for the projected size and screen density', () => {
  assert.equal(deviceSourceWidth(550, 2), 1600)
  assert.equal(deviceSourceWidth(941, 3), 3200)
  assert.equal(deviceSourceWidth(1920, 2), 6400)
  assert.equal(deviceSourceWidth(2022, 2), 6400)
  assert.equal(deviceSourceWidth(2592, 3), 6400)
})

test('all five finishes open at 4× and pull back to full view before the next', () => {
  const count = finishOrder.length
  for (let index = 0; index < count; index++) {
    let previous = 4
    for (let step = 0; step < 100; step++) {
      const { scale } = finishFrame((index + step / 100) / count, count)
      assert.ok(scale <= previous)
      previous = scale
    }
    for (const [phase, scale] of [[0, 4], [.15, 4], [.82, 1], [.99, 1]]) {
      assert.deepEqual(finishFrame((index + phase) / count, count), { index, scale })
    }
  }
  assert.deepEqual(finishFrame(-3, count), { index: 0, scale: 4 })
  assert.deepEqual(finishFrame(2, count), { index: count - 1, scale: 1 })
})

test('the static gallery exposes all five full-resolution images and starts with one preview', () => {
  const { body } = JSON.parse(readFileSync(new URL('../content/index.json', import.meta.url)))
  const intro = body.slice(body.indexOf('<div class="intro-runway">'), body.indexOf('id="local"'))
  assert.ok(intro.includes('class="hero-box"'))
  assert.equal((intro.match(/<figure class="hero-device"><img/g) || []).length, 1)
  assert.ok(!intro.includes('charcoal-macro'))
  assert.ok(intro.includes('data-render="/assets/kiln/finishes/charcoal-device"'))
  assert.ok(intro.includes('src="/assets/kiln/finishes/charcoal-device-800.webp"'))
  assert.ok(!intro.includes('data-finish-gallery'))
  assert.ok(body.indexOf('id="hardware"') < body.indexOf('data-finish-gallery'))
  const finishes = [...body.matchAll(/data-finish-slide="([^"]+)"( hidden)?>/g)]
  assert.deepEqual(finishes.map(match => match[1]), finishOrder)
  assert.deepEqual(finishes.map(match => Boolean(match[2])), [false, true, true, true, true])
  const swatches = [...body.matchAll(/data-finish="([^"]+)"[^>]*>/g)]
  assert.deepEqual(swatches.map(match => match[1]), finishOrder)
  assert.deepEqual(swatches.filter(match => match[0].includes('aria-current="true"')).map(match => match[1]), ['charcoal'])
  for (const [, name] of finishes) {
    assert.ok(body.includes('href="/assets/kiln/finishes/' + name + '-device-6400.webp"'))
    assert.ok(body.includes('src="/assets/kiln/finishes/' + name + '-device-800.webp"'))
  }
})

test('reduced-motion visitors can switch finishes and zoom without scrolling, even after resize', () => {
  class Node extends EventTarget {
    attributes = new Map()
    dataset = {}
    style = { setProperty(key, value) { this[key] = value } }
    setAttribute(key, value) { this.attributes.set(key, value) }
    getAttribute(key) { return this.attributes.get(key) }
    removeAttribute(key) { this.attributes.delete(key) }
  }
  const swatches = ['Deep charcoal', 'Pebble grey', 'Baby pink', 'Eucalyptus', 'Powder blue'].map(label => {
    const swatch = new Node()
    swatch.setAttribute('aria-label', label)
    return swatch
  })
  const slides = swatches.map((_, i) => {
    const slide = new Node(), img = new Node()
    img.setAttribute('src', 'preview-' + i)
    img.dataset.render = 'device-' + i
    img.offsetWidth = 2200
    Object.defineProperty(img, 'src', { set(url) { this.setAttribute('src', url) } })
    slide.querySelector = () => img
    slide.hidden = i !== 0
    return slide
  })
  const motion = Object.assign(new EventTarget(), { matches: true })
  const view = Object.assign(new EventTarget(), {
    innerHeight: 800, scrollY: 0, matchMedia: () => motion, cancelAnimationFrame() {},
  })
  const children = {
    '.finish-stage': { offsetHeight: 600 }, '.finish-camera': new Node(),
    '.finish-viewer': { getBoundingClientRect: () => ({ top: 100, bottom: 500 }) },
    '[data-finish-name]': new Node(), '.finish-zoom': new Node(),
  }
  const runway = Object.assign(new Node(), {
    ownerDocument: { defaultView: view }, classList: { remove() {}, toggle() {} },
    getBoundingClientRect: () => ({ top: 0 }),
    querySelector: key => children[key],
    querySelectorAll: key => key === '[data-finish]' ? swatches : slides,
  })
  const cleanup = mountHardwareReveal({ querySelector: key => key === '[data-finish-gallery]' ? runway : null })
  swatches[3].dispatchEvent(new Event('click'))
  assert.equal(children['[data-finish-name]'].textContent, 'Eucalyptus')
  assert.deepEqual(slides.map(slide => slide.hidden), [true, true, true, false, true])
  assert.equal(swatches[3].getAttribute('aria-current'), 'true')
  children['.finish-zoom'].dispatchEvent(new Event('click'))
  assert.equal(slides[3].querySelector().getAttribute('src'), 'device-3-3200.webp')
  assert.equal(children['.finish-camera'].style['--finish-scale'], '4.0000')
  assert.equal(slides[0].querySelector().getAttribute('src'), 'preview-0')
  view.dispatchEvent(new Event('resize'))
  assert.equal(children['.finish-camera'].style['--finish-scale'], '1.0000')
  cleanup()
  swatches[0].dispatchEvent(new Event('click'))
  assert.equal(children['[data-finish-name]'].textContent, 'Eucalyptus')
})
