import test from 'node:test'
import assert from 'node:assert/strict'
import { mountProductGallery } from './kiln-gallery.mjs'

function fixture(t, reduced = false) {
  const previous = globalThis.ResizeObserver
  let observer
  globalThis.ResizeObserver = class {
    constructor(callback) { this.callback = callback; observer = this }
    observe() {}
    disconnect() { this.disconnected = true }
  }
  t.after(() => { globalThis.ResizeObserver = previous })
  const gallery = new EventTarget()
  Object.assign(gallery, { clientWidth: 393, scrollLeft: 0, scrollTo(options) { this.lastScroll = options; this.scrollLeft = options.left } })
  const selected = []
  const preference = { matches: reduced }
  const controller = mountProductGallery(gallery, key => selected.push(key), preference)
  t.after(() => controller.destroy())
  return { gallery, selected, preference, controller, observer }
}

test('a native swipe settles to the nearest product and can return to One', t => {
  const { gallery, selected } = fixture(t)
  gallery.scrollLeft = 380
  gallery.dispatchEvent(new Event('scrollend'))
  gallery.dispatchEvent(new Event('scrollend'))
  assert.deepEqual(selected, ['atelier'])
  gallery.scrollLeft = 14
  gallery.dispatchEvent(new Event('scrollend'))
  assert.deepEqual(selected, ['atelier', 'one'])
})

test('tab navigation, resized viewports and reduced motion keep the selected product aligned', t => {
  const { gallery, selected, preference, controller, observer } = fixture(t)
  controller.goTo('atelier')
  assert.deepEqual(gallery.lastScroll, { left: 393, behavior: 'smooth' })
  gallery.clientWidth = 750
  observer.callback()
  assert.deepEqual(gallery.lastScroll, { left: 750, behavior: 'auto' })
  preference.matches = true
  controller.goTo('one')
  assert.deepEqual(gallery.lastScroll, { left: 0, behavior: 'auto' })
  gallery.dispatchEvent(new Event('scrollend'))
  assert.deepEqual(selected, [])
})

test('browsers without scrollend synchronize when native scrolling settles', async t => {
  const { gallery, selected } = fixture(t)
  gallery.scrollLeft = 393
  gallery.dispatchEvent(new Event('scroll'))
  await new Promise(resolve => setTimeout(resolve, 170))
  assert.deepEqual(selected, ['atelier'])
})

test('unmount cancels pending scroll work and disconnects observers', async t => {
  const { gallery, selected, controller, observer } = fixture(t)
  gallery.scrollLeft = 393
  gallery.dispatchEvent(new Event('scroll'))
  controller.destroy()
  gallery.dispatchEvent(new Event('scrollend'))
  await new Promise(resolve => setTimeout(resolve, 170))
  assert.deepEqual(selected, [])
  assert.equal(observer.disconnected, true)
})
