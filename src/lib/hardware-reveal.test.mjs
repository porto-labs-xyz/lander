import test from 'node:test'
import assert from 'node:assert/strict'
import { mountHardwareReveal } from './hardware-reveal.mjs'

function fixture({ reduced = false, imageFailure = false } = {}) {
  const observers = [], animations = [], timers = new Map(), contexts = [], oscillators = []
  const target = () => ({ handlers: {}, addEventListener(type, fn, options) {
    this.handlers[type] = fn
    options?.signal?.addEventListener('abort', () => delete this.handlers[type])
  } })
  const preference = Object.assign(target(), { matches: reduced })
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() {}
    disconnect() { this.disconnected = true }
    enter(ratio) { if (!this.disconnected) this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]) }
  }
  const parameter = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} })
  class Audio {
    constructor() { this.state = 'suspended'; this.currentTime = 0; contexts.push(this) }
    resume() { this.state = 'running'; return Promise.resolve() }
    close() { this.state = 'closed'; return Promise.resolve() }
    createOscillator() {
      const node = { frequency: parameter(), connect() {}, disconnect() {}, start() { node.started = true }, stop() { node.stopped = true } }
      oscillators.push(node); return node
    }
    createGain() { return { gain: parameter(), connect() {}, disconnect() {} } }
  }
  let timerId = 0
  const view = { IntersectionObserver: Observer, AudioContext: Audio, matchMedia: () => preference,
    setTimeout(fn) { timers.set(++timerId, fn); return timerId }, clearTimeout(id) { timers.delete(id) } }
  const doc = Object.assign(target(), { defaultView: view, hidden: false })
  const classes = new Set()
  function element() {
    return { animate() {
      const animation = { currentTime: 0, playState: 'running', pause() { this.playState = 'paused' }, play() { this.playState = 'running' }, cancel() { this.playState = 'idle' } }
      animations.push(animation); return animation
    }, decode: () => imageFailure ? Promise.reject(new Error('offline')) : Promise.resolve(), dataset: { revealSrc: '/open.webp' } }
  }
  const elements = Object.fromEntries(['camera', 'closed', 'glow'].map(name => [`.reveal-${name}`, element()]))
  const section = { ownerDocument: doc, classList: { add(...names) { names.forEach(n => classes.add(n)) }, remove(...names) { names.forEach(n => classes.delete(n)) } },
    querySelector: selector => elements[selector], querySelectorAll: () => [element(), element()] }
  const root = { querySelector: () => section }
  const cleanup = mountHardwareReveal(root)
  return { cleanup, observers, animations, contexts, oscillators, doc, preference, classes, elements,
    async enter(ratio = .7) { observers[0]?.enter(ratio); observers[1]?.enter(ratio); await new Promise(resolve => setImmediate(resolve)) },
    fireCue() { const fns = [...timers.values()]; timers.clear(); fns.forEach(fn => fn()) } }
}

test('reveal runs once, pauses outside the viewport, and releases animations at completion', async () => {
  const f = fixture()
  await f.enter()
  assert.ok(f.animations.length > 0)
  const count = f.animations.length
  f.observers[1].enter(0)
  assert.ok(f.animations.every(a => a.playState === 'paused'))
  f.observers[1].enter(.7)
  assert.ok(f.animations.every(a => a.playState === 'running'))
  f.animations[0].onfinish()
  assert.ok(f.classes.has('reveal-complete'))
  assert.ok(!f.classes.has('reveal-ready'))
  await f.enter()
  assert.equal(f.animations.length, count)
  assert.ok(f.animations.every(a => a.playState === 'idle'))
  f.cleanup()
})

test('reduced motion and failed image loads retain the static final image and copy', async () => {
  for (const options of [{ reduced: true }, { imageFailure: true }]) {
    const f = fixture(options)
    await f.enter()
    assert.equal(f.animations.length, 0)
    assert.equal(f.contexts.length, 0)
    assert.ok(!f.classes.has('reveal-ready'))
    f.cleanup()
  }
})

test('sound needs trusted activation and never plays late after a silent reveal', async () => {
  const f = fixture()
  f.doc.handlers.pointerdown({ isTrusted: false, type: 'pointerdown' })
  assert.equal(f.contexts.length, 0)
  await f.enter()
  f.fireCue()
  assert.equal(f.oscillators.length, 0)
  f.doc.handlers.pointerdown({ isTrusted: true, type: 'pointerdown' })
  f.observers[1].enter(0); f.observers[1].enter(.7); f.fireCue()
  assert.equal(f.oscillators.length, 0)
  f.cleanup()
})

test('backgrounding stops the cue and unmount closes its audio resources', async () => {
  const f = fixture()
  f.doc.handlers.pointerdown({ isTrusted: true, type: 'pointerdown' })
  await f.enter()
  f.doc.hidden = true; f.doc.handlers.visibilitychange(); f.fireCue()
  assert.equal(f.oscillators.length, 0)
  f.doc.hidden = false; f.doc.handlers.visibilitychange(); f.fireCue()
  assert.ok(f.oscillators.every(n => n.started))
  assert.equal(f.oscillators.length, 2)
  f.cleanup()
  assert.ok(f.oscillators.every(n => n.stopped))
  assert.equal(f.contexts[0].state, 'closed')
  assert.equal(f.doc.handlers.pointerdown, undefined)
})
