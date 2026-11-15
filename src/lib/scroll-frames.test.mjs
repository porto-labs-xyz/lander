import test from 'node:test'
import assert from 'node:assert/strict'
import { mountScrollFrames } from './scroll-frames.mjs'

function fixture({ reduced = false, width = 320.5, height = 180.25, border = 7 } = {}) {
  const target = () => ({ handlers: {}, addEventListener(name, fn, options) {
    this.handlers[name] = fn
    options?.signal?.addEventListener('abort', () => delete this.handlers[name])
  } })
  const nodes = [], observers = [], ticks = new Map(), preference = Object.assign(target(), { matches: reduced })
  const classes = new Set(), properties = new Map()
  const box = { width, height, top: 100 }
  const host = {
    getBoundingClientRect: () => box,
    classList: { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) },
    style: { setProperty: (key, value) => properties.set(key, value), removeProperty: key => properties.delete(key) },
    append: node => nodes.push(node), closest: () => null,
  }
  let tickId = 0
  const view = Object.assign(target(), {
    innerHeight: 800, scrollY: 0,
    getComputedStyle: () => ({ borderTopColor: '#101112', borderTopWidth: String(border) }),
    matchMedia: () => preference,
    requestAnimationFrame(fn) { ticks.set(++tickId, fn); return tickId },
    cancelAnimationFrame: id => ticks.delete(id),
    ResizeObserver: class { constructor(fn) { this.callback = fn; observers.push(this) } observe() {} disconnect() { this.disconnected = true } },
  })
  const doc = Object.assign(target(), {
    defaultView: view, hidden: false,
    querySelectorAll: () => [host], querySelector: () => host,
    createElementNS(ns, name) { return {
      name, attributes: new Map(), children: [],
      setAttribute(key, value) { this.attributes.set(key, String(value)) },
      removeAttribute(key) { this.attributes.delete(key) },
      append(child) { this.children.push(child) }, remove() { this.removed = true },
    } },
  })
  const cleanup = mountScrollFrames(doc)
  const flush = () => { const callbacks = [...ticks.values()]; ticks.clear(); callbacks.forEach(fn => fn()) }
  const scrollTo = y => { view.scrollY = y; view.handlers.scroll(); flush() }
  flush()
  return { nodes, observers, view, box, classes, preference, cleanup, flush, scrollTo }
}

test('all corners use interior miter joins, and a completed frame is a solid closed path', () => {
  const f = fixture()
  const path = f.nodes[0].children[0]
  assert.equal(path.name, 'path')
  assert.equal(path.attributes.get('stroke-linejoin'), 'miter')
  assert.equal(path.attributes.get('d'), 'M 160.25 3.5 H 317 V 176.75 H 3.5 V 3.5 Z')
  f.scrollTo(1000)
  assert.equal(path.attributes.get('stroke-dashoffset'), '0')
  assert.equal(path.attributes.has('stroke-dasharray'), false)
  f.scrollTo(-550)
  assert.equal(path.attributes.get('stroke-dasharray'), '1 1')
  assert.ok(Number(path.attributes.get('stroke-dashoffset')) > 0)
  f.cleanup()
})

test('resizing keeps the same inset and flush corners with fractional dimensions', () => {
  const f = fixture()
  f.box.width = 425.75; f.box.height = 250.5
  f.observers[0].callback(); f.flush()
  const path = f.nodes[0].children[0]
  assert.equal(path.attributes.get('d'), 'M 212.875 3.5 H 422.25 V 247 H 3.5 V 3.5 Z')
  assert.equal(path.attributes.get('stroke-width'), '7')
  f.cleanup()
})

test('reduced motion restores the native border and cleanup removes the overlay', () => {
  const f = fixture()
  f.preference.matches = true; f.preference.handlers.change(); f.flush()
  assert.equal(f.classes.has('scroll-frame'), false)
  assert.ok(f.nodes.every(node => node.removed))
  f.cleanup()
  assert.ok(f.observers.every(observer => observer.disconnected))
})
