import test from 'node:test'
import assert from 'node:assert/strict'
import { mountArrival } from './monument-arrival.mjs'

test('the homepage spark animates without audio on load, first interaction or return', t => {
  const elements = new Map()
  function querySelector(selector) {
    if (selector === '.mobile-dock') return null
    if (!elements.has(selector)) {
      elements.set(selector, Object.assign(new EventTarget(), {
        querySelector,
        classList: { add() {}, remove() {}, contains: () => false },
        style: { setProperty() {}, removeProperty() {} },
        getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 640, height: 640, width: 800 }),
        offsetHeight: 0, clientHeight: 640, scrollHeight: 640,
        focus() {},
      }))
    }
    return elements.get(selector)
  }
  const animate = t.mock.fn(() => ({ cancel() {} }))
  querySelector('.header-spark').animate = animate
  const connectAudio = t.mock.fn()
  const fetch = t.mock.fn(async () => ({ ok: false }))
  const view = Object.assign(new EventTarget(), {
    innerWidth: 1200, innerHeight: 800, scrollY: 0,
    scrollTo({ top }) { this.scrollY = top },
    AudioContext: class {
      constructor() { connectAudio(); this.state = 'running' }
      close() { return Promise.resolve() }
    },
  })
  const globals = {
    window: view,
    document: Object.assign(new EventTarget(), {
      querySelector, body: querySelector('body'), fonts: { ready: Promise.resolve() },
    }),
    matchMedia: () => Object.assign(new EventTarget(), { matches: false }),
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    fetch,
  }
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key)
    Object.defineProperty(globalThis, key, { value, configurable: true, writable: true })
    t.after(() => {
      if (original) Object.defineProperty(globalThis, key, original)
      else delete globalThis[key]
    })
  }

  for (let visit = 1; visit <= 2; visit++) {
    view.scrollY = 0
    const unmount = mountArrival()
    try {
      for (const type of ['pointerdown', 'pointerup', 'touchend', 'keydown']) {
        view.dispatchEvent(new Event(type))
      }
      querySelector('.intro-skip').dispatchEvent(new Event('click'))
      assert.equal(animate.mock.callCount(), visit)
      assert.equal(connectAudio.mock.callCount(), 0)
      assert.equal(fetch.mock.callCount(), 0)
    } finally {
      unmount()
    }
  }
})
