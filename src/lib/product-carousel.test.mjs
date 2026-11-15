import test from 'node:test'
import assert from 'node:assert/strict'
import { mountProductCarousel } from './product-carousel.mjs'

function fixture({ width = 390.25, reduced = false } = {}) {
  const target = () => ({ handlers: {}, addEventListener(type, fn, options) {
    this.handlers[type] = fn
    options?.signal?.addEventListener('abort', () => delete this.handlers[type])
  } })
  const ticks = new Map(), timers = new Map(), observers = [], classes = new Set()
  const geometry = { width }, preference = Object.assign(target(), { matches: reduced })
  let id = 0
  const view = {
    matchMedia: () => preference,
    requestAnimationFrame(fn) { ticks.set(++id, fn); return id },
    cancelAnimationFrame: key => ticks.delete(key),
    setTimeout(fn) { timers.set(++id, fn); return id }, clearTimeout: key => timers.delete(key),
    ResizeObserver: class { constructor(fn) { this.callback = fn; observers.push(this) } observe() {} disconnect() { this.disconnected = true } },
  }
  const doc = Object.assign(target(), { defaultView: view, hidden: false })
  const keys = ['one', 'atelier', 'rack']
  const tabs = keys.map(key => Object.assign(target(), { dataset: { product: key }, attributes: {}, writes: 0,
    setAttribute(name, value) { this.attributes[name] = value; this.writes++ },
  }))
  const previous = target(), next = target(), count = {}, hardware = { dataset: {} }
  const carousel = Object.assign(target(), {
    ownerDocument: doc, scrollLeft: 0,
    getBoundingClientRect: () => ({ left: 0, width: geometry.width }),
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) },
    scrollTo({ left }) { this.scrollLeft = left }, setPointerCapture() {},
  })
  Object.defineProperties(carousel, {
    clientWidth: { get: () => Math.round(geometry.width) },
    scrollWidth: { get: () => Math.round(geometry.width * 3) },
  })
  const slides = keys.map((key, i) => ({ dataset: { productSlide: key }, attributes: {},
    getBoundingClientRect: () => ({ left: geometry.width * i - carousel.scrollLeft }),
    setAttribute(name, value) { this.attributes[name] = value },
  }))
  carousel.querySelectorAll = () => slides
  const root = {
    querySelector: selector => ({ '.product-carousel': carousel, '#hardware': hardware, '.carousel-prev': previous, '.carousel-next': next, '.carousel-count': count })[selector],
    querySelectorAll: () => tabs,
  }
  const cleanup = mountProductCarousel(root)
  const frame = time => { const callbacks = [...ticks.values()]; ticks.clear(); callbacks.forEach(fn => fn(time)) }
  const finish = () => { frame(0); frame(600) }
  const flushTimers = () => { const callbacks = [...timers.values()]; timers.clear(); callbacks.forEach(fn => fn()) }
  return { carousel, slides, tabs, previous, next, count, hardware, geometry, preference, doc, classes, observers, ticks, timers, frame, finish, flushTimers, cleanup }
}

test('Atelier and Rack settle flush using measured fractional slide positions', () => {
  const f = fixture()
  f.tabs[1].handlers.click(); f.finish()
  assert.equal(f.carousel.scrollLeft, 390.25)
  assert.equal(f.slides[1].getBoundingClientRect().left, 0)
  assert.equal(f.tabs[1].attributes['aria-selected'], 'true')
  assert.equal(f.count.textContent, '02 / 03')
  f.tabs[2].handlers.click(); f.finish()
  assert.equal(f.carousel.scrollLeft, 780.5)
  assert.equal(f.next.disabled, true)
  assert.equal(f.classes.has('is-settling'), false)
  f.cleanup()
})

test('motion accelerates and decelerates monotonically without overshoot', () => {
  const f = fixture({ width: 400 })
  f.tabs[1].handlers.click()
  f.frame(0); f.frame(120); const quarter = f.carousel.scrollLeft
  f.frame(240); const middle = f.carousel.scrollLeft
  f.frame(360); const threeQuarters = f.carousel.scrollLeft
  f.frame(480)
  assert.ok(quarter > 0 && quarter < 100)
  assert.equal(middle, 200)
  assert.ok(threeQuarters > 300 && threeQuarters < 400)
  assert.equal(f.carousel.scrollLeft, 400)
  f.cleanup()
})

test('rapid selections retarget from the current position and touch interrupts immediately', () => {
  const f = fixture()
  f.tabs[1].handlers.click(); f.frame(0); f.frame(120)
  const before = f.carousel.scrollLeft
  f.next.handlers.click(); f.frame(200)
  assert.equal(f.carousel.scrollLeft, before)
  f.frame(350)
  f.carousel.handlers.touchstart()
  const interrupted = f.carousel.scrollLeft
  f.frame(1000)
  assert.equal(f.carousel.scrollLeft, interrupted)
  assert.equal(f.classes.has('is-settling'), false)
  f.cleanup()
})

test('native touch movement stays in control until released, then residual offsets are corrected', () => {
  const f = fixture()
  f.carousel.handlers.touchstart(); f.carousel.scrollLeft = 370
  f.carousel.handlers.scroll(); f.flushTimers(); f.frame(0)
  assert.equal(f.carousel.scrollLeft, 370)
  assert.equal(f.classes.has('is-settling'), false)
  f.carousel.handlers.touchend(); f.flushTimers(); f.finish()
  assert.equal(f.carousel.scrollLeft, 390.25)
  f.cleanup()
})

test('mouse release keeps snapping disabled until the single settle finishes', () => {
  const f = fixture()
  f.carousel.handlers.pointerdown({ pointerType: 'mouse', button: 0, clientX: 350, clientY: 100, target: { closest: () => null } })
  f.carousel.handlers.pointermove({ clientX: 90, clientY: 102, pointerId: 1, preventDefault() {} })
  assert.equal(f.classes.has('is-dragging'), true)
  f.doc.handlers.pointerup()
  assert.equal(f.classes.has('is-dragging'), false)
  assert.equal(f.classes.has('is-settling'), true)
  f.finish()
  assert.equal(f.carousel.scrollLeft, 390.25)
  f.cleanup()
})

test('resize preserves the selected product and reduced motion lands instantly', () => {
  const f = fixture()
  f.tabs[1].handlers.click(); f.finish()
  f.geometry.width = 430.5; f.observers[0].callback()
  assert.equal(f.carousel.scrollLeft, 430.5)
  f.tabs[2].handlers.click(); f.frame(0)
  f.preference.matches = true; f.preference.handlers.change()
  assert.equal(f.carousel.scrollLeft, 861)
  assert.equal(f.classes.has('is-settling'), false)
  f.tabs[0].handlers.click()
  assert.equal(f.carousel.scrollLeft, 0)
  f.cleanup()
})

test('scrolling within one panel avoids repeated accessibility writes and teardown clears all work', () => {
  const f = fixture(), initialWrites = f.tabs[0].writes
  f.carousel.scrollLeft = 10; f.carousel.handlers.scroll(); f.frame(0)
  f.carousel.scrollLeft = 20; f.carousel.handlers.scroll(); f.frame(16)
  assert.equal(f.tabs[0].writes, initialWrites)
  f.tabs[1].handlers.click(); f.cleanup()
  assert.equal(f.ticks.size, 0)
  assert.equal(f.timers.size, 0)
  assert.ok(f.observers.every(observer => observer.disconnected))
  assert.equal(f.carousel.handlers.scroll, undefined)
})
