import test from 'node:test'
import assert from 'node:assert/strict'
import { mountProductGallery } from './kiln-gallery.mjs'

function fixture(t, { reduced = false, mobileView = true } = {}) {
  const names = ['window', 'ResizeObserver', 'requestAnimationFrame', 'cancelAnimationFrame']
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]))
  let observer, nextFrame = 0
  const frames = new Map()
  globalThis.window = {}
  globalThis.requestAnimationFrame = callback => { frames.set(++nextFrame, callback); return nextFrame }
  globalThis.cancelAnimationFrame = id => frames.delete(id)
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observer = this }
    observe() {}
    disconnect() { this.disconnected = true }
  }
  const images = [{ loading: 'lazy', decode: async () => {} }, { loading: 'lazy', decode: async () => {} }]
  const gallery = new EventTarget()
  Object.assign(gallery, {
    clientWidth: 393, scrollLeft: 0,
    scrollTo(options) { this.lastScroll = options; if (options.behavior !== 'smooth') this.scrollLeft = options.left },
    querySelectorAll() { return images },
  })
  const selected = [], preference = { matches: reduced }
  const mobile = new EventTarget()
  mobile.matches = mobileView
  const controller = mountProductGallery(gallery, key => selected.push(key), preference, mobile)
  const flush = () => { const callbacks = [...frames.values()]; frames.clear(); callbacks.forEach(callback => callback()) }
  t.after(() => { controller.destroy(); for (const name of names) globalThis[name] = previous[name] })
  return { gallery, selected, preference, mobile, controller, observer, frames, flush, images }
}

test('desktop tabs switch immediately without scrolling and rapid changes keep the latest choice', t => {
  const { gallery, selected, controller } = fixture(t, { mobileView: false })
  controller.goTo('atelier')
  controller.goTo('one')
  controller.goTo('atelier')
  controller.goTo('atelier')
  controller.goTo('invalid')
  assert.deepEqual(selected, ['atelier', 'one', 'atelier'])
  assert.equal(gallery.lastScroll, undefined)
})

test('native mobile swipes synchronize at the midpoint in one animation frame', t => {
  const { gallery, selected, frames, flush } = fixture(t)
  gallery.scrollLeft = 190
  gallery.dispatchEvent(new Event('scroll'))
  flush()
  assert.deepEqual(selected, [])
  gallery.scrollLeft = 220
  gallery.dispatchEvent(new Event('scroll'))
  gallery.dispatchEvent(new Event('scroll'))
  assert.equal(frames.size, 1)
  flush()
  assert.deepEqual(selected, ['atelier'])
  gallery.scrollLeft = 5
  gallery.dispatchEvent(new Event('scroll'))
  flush()
  assert.deepEqual(selected, ['atelier', 'one'])
})

test('mobile tabs respect reduced motion and resize keeps the selected slide aligned', t => {
  const { gallery, selected, preference, controller, observer, flush } = fixture(t)
  controller.goTo('atelier')
  assert.deepEqual(gallery.lastScroll, { left: 393, behavior: 'smooth' })
  assert.deepEqual(selected, [])
  gallery.scrollLeft = 393
  gallery.dispatchEvent(new Event('scroll'))
  flush()
  gallery.clientWidth = 750
  observer.callback()
  assert.deepEqual(gallery.lastScroll, { left: 750, behavior: 'instant' })
  preference.matches = true
  controller.goTo('one')
  assert.deepEqual(gallery.lastScroll, { left: 0, behavior: 'auto' })
  assert.deepEqual(selected, ['atelier', 'one'])
})

test('changing between desktop and mobile retains the product and warms both images', t => {
  const { gallery, mobile, controller, images } = fixture(t, { mobileView: false })
  controller.goTo('atelier')
  mobile.matches = true
  mobile.dispatchEvent(new Event('change'))
  assert.equal(gallery.scrollLeft, 393)
  mobile.matches = false
  mobile.dispatchEvent(new Event('change'))
  assert.equal(gallery.scrollLeft, 0)
  assert.ok(images.every(img => img.loading === 'eager'))
})

test('unmount cancels pending work and disconnects listeners and observers', t => {
  const { gallery, selected, controller, observer, frames, flush } = fixture(t)
  gallery.scrollLeft = 393
  gallery.dispatchEvent(new Event('scroll'))
  controller.destroy()
  assert.equal(frames.size, 0)
  gallery.dispatchEvent(new Event('scroll'))
  flush()
  assert.deepEqual(selected, [])
  assert.equal(observer.disconnected, true)
})
