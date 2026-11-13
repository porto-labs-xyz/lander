import test from 'node:test'
import assert from 'node:assert/strict'
import { mountKilnMotion } from './kiln-motion.mjs'

function fixture(t, reduced = false) {
  const previous = { window: globalThis.window, document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver }
  const preference = new EventTarget()
  preference.matches = reduced
  const image = new EventTarget()
  image.complete = false
  function node(type) {
    const classes = new Set([type])
    return {
      classes,
      classList: { add: (...v) => v.forEach(x => classes.add(x)), remove: (...v) => v.forEach(x => classes.delete(x)), contains: v => classes.has(v) },
      matches: selector => classes.has(selector.slice(1)),
      querySelector: () => image,
    }
  }
  const copy = node('reveal'), product = node('boot-figure'), attributes = new Set(), observers = []
  const root = {
    querySelectorAll: () => [copy, product],
    toggleAttribute: (name, value) => value ? attributes.add(name) : attributes.delete(name),
    removeAttribute: name => attributes.delete(name),
  }
  globalThis.document = new EventTarget()
  document.hidden = false
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.nodes = new Set(); observers.push(this) }
    observe(node) { this.nodes.add(node) }
    unobserve(node) { this.nodes.delete(node) }
    disconnect() { this.nodes.clear() }
  }
  globalThis.window = { matchMedia: () => preference, IntersectionObserver }
  const destroy = mountKilnMotion(root)
  t.after(() => { destroy(); Object.assign(globalThis, previous) })
  const enter = target => observers.at(-1).callback([{ target, isIntersecting: true }])
  return { preference, image, copy, product, attributes, observers, enter, destroy }
}

test('reduced-motion starts static and can be changed without hiding content', t => {
  const f = fixture(t, true)
  assert.equal(f.observers.length, 0)
  assert.equal(f.copy.classes.has('motion-entered'), false)
  f.preference.matches = false
  f.preference.dispatchEvent(new Event('change'))
  f.enter(f.copy)
  assert.equal(f.copy.classes.has('motion-entered'), true)
  assert.equal(f.observers.at(-1).nodes.has(f.copy), false)
  f.preference.matches = true
  f.preference.dispatchEvent(new Event('change'))
  assert.equal(f.copy.classes.has('motion-entered'), false)
})

test('enabling reduced-motion cancels a pending image entrance', t => {
  const f = fixture(t)
  f.enter(f.product)
  f.preference.matches = true
  f.preference.dispatchEvent(new Event('change'))
  f.image.dispatchEvent(new Event('load'))
  assert.equal(f.product.classes.has('motion-entered'), false)
})

test('page visibility pauses motion and unmount ignores late image loads', t => {
  const f = fixture(t)
  f.enter(f.product)
  document.hidden = true
  document.dispatchEvent(new Event('visibilitychange'))
  assert.equal(f.attributes.has('data-motion-paused'), true)
  f.destroy()
  f.image.dispatchEvent(new Event('load'))
  assert.equal(f.attributes.size, 0)
  assert.equal(f.product.classes.has('motion-entered'), false)
  assert.equal(f.observers.at(-1).nodes.size, 0)
})
