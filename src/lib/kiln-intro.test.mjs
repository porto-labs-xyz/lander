import test from 'node:test'
import assert from 'node:assert/strict'
import { mountKilnIntro } from './kiln-intro.mjs'

const flush = () => new Promise(resolve => setImmediate(resolve))
function fixture(t, { reduced = false, deferFetch = false, resumeFails = false } = {}) {
  const previous = { window: globalThis.window, document: globalThis.document, IntersectionObserver: globalThis.IntersectionObserver, fetch: globalThis.fetch }
  const preference = new EventTarget(); preference.matches = reduced
  const label = { textContent: '' }, status = { textContent: '' }, attributes = {}, animations = [], sounds = [], contexts = [], fetches = [], observers = []
  const button = new EventTarget(); button.hidden = true; button.dataset = { chime: '/little-tilt.mp3' }
  button.setAttribute = (name, value) => { attributes[name] = value }
  button.querySelector = () => label
  let bottom = 1200, resolveFetch
  const hero = { getBoundingClientRect: () => ({ bottom }) }, marker = {}
  const spark = { animate: (frames, options) => { const a = { frames, options, cancelled: false, cancel() { this.cancelled = true } }; animations.push(a); return a } }
  const nodes = { '.boot-hero': hero, '.hero-arrival-marker': marker, '.header-spark': spark, '.intro-sound': button, '#intro-sound-status': status }
  const root = { querySelector: selector => nodes[selector] }
  globalThis.document = new EventTarget(); document.hidden = false
  globalThis.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; observers.push(this) }
    observe() { this.connected = true }
    disconnect() { this.connected = false }
  }
  class AudioContext {
    constructor() { this.state = 'suspended'; this.currentTime = 4; this.destination = {}; contexts.push(this) }
    resume() { this.resumeCalls = (this.resumeCalls || 0) + 1; if (resumeFails) return Promise.reject(new Error('blocked')); this.state = 'running'; return Promise.resolve() }
    suspend() { this.state = 'suspended'; return Promise.resolve() }
    close() { this.state = 'closed'; return Promise.resolve() }
    decodeAudioData() { this.decodes = (this.decodes || 0) + 1; return Promise.resolve({ duration: 2.7 }) }
    createBufferSource() { const s = { connect() {}, disconnect() {}, start(at) { this.startAt = at }, stop(at) { this.stopAt = at } }; sounds.push(s); return s }
    createGain() { return { connect() {}, disconnect() {}, gain: { value: 0, cancelScheduledValues() {}, setTargetAtTime() {} } } }
  }
  globalThis.window = { innerHeight: 760, AudioContext, IntersectionObserver, matchMedia: () => preference, CSS: { supports: () => true } }
  globalThis.fetch = (url, options) => {
    fetches.push({ url, ...options });
    const response = { ok: true, arrayBuffer: () => Promise.resolve(new ArrayBuffer(4)) }
    return deferFetch ? new Promise(resolve => { resolveFetch = () => resolve(response) }) : Promise.resolve(response)
  }
  const destroy = mountKilnIntro(root)
  t.after(() => { destroy(); Object.assign(globalThis, previous) })
  return { button, label, status, attributes, animations, sounds, contexts, fetches, observers, preference, destroy,
    click: async () => { button.dispatchEvent(new Event('click')); await flush() },
    enter: () => observers.at(-1)?.callback([{ isIntersecting: true, boundingClientRect: { bottom: 200 } }]),
    arrive: () => observers.at(-1)?.callback([{ isIntersecting: false, boundingClientRect: { bottom: -1 } }]),
    resolveFetch: () => resolveFetch(), setBottom: value => { bottom = value },
  }
}

test('arrival dances once without fetching or starting sound before opt-in', t => {
  const f = fixture(t)
  assert.equal(f.button.hidden, false)
  f.enter(); f.arrive(); f.arrive()
  assert.equal(f.animations.length, 1)
  assert.equal(f.fetches.length, 0)
  assert.equal(f.contexts.length, 0)
  assert.equal(f.observers[0].connected, false)
})

test('opt-in prepares sound, then arrival schedules the chime and dance together', async t => {
  const f = fixture(t)
  f.enter(); await f.click()
  assert.equal(f.contexts[0].resumeCalls, 1)
  assert.equal(f.attributes['aria-pressed'], 'true')
  assert.equal(f.sounds.length, 0)
  f.arrive()
  assert.equal(f.sounds.length, 1)
  assert.equal(f.sounds[0].startAt, 4.035)
  assert.equal(f.animations[0].options.delay, 35)
  assert.equal(f.animations[0].options.duration, 1000)
  f.arrive(); assert.equal(f.sounds.length, 1)
  await f.click()
  assert.equal(f.attributes['aria-pressed'], 'false')
  assert.equal(f.sounds[0].stopAt, 4.035)
})

test('explicit opt-in after silent arrival replays both together', async t => {
  const f = fixture(t)
  f.enter(); f.arrive(); await f.click()
  assert.equal(f.animations.length, 2)
  assert.equal(f.sounds.length, 1)
  assert.equal(f.animations[0].cancelled, true)
})

test('unmount aborts loading and prevents late decode, audio and animation', async t => {
  const f = fixture(t, { deferFetch: true })
  f.enter(); await f.click(); f.destroy(); f.resolveFetch(); await flush()
  assert.equal(f.fetches[0].signal.aborted, true)
  assert.equal(f.contexts[0].state, 'closed')
  assert.equal(f.contexts[0].decodes, undefined)
  assert.equal(f.sounds.length, 0)
  f.arrive(); assert.equal(f.animations.length, 0)
})

test('reduced motion is static and backgrounding cancels an enabled cue', async t => {
  const f = fixture(t, { reduced: true })
  assert.equal(f.button.hidden, true)
  assert.equal(f.observers.length, 0)
  f.preference.matches = false; f.preference.dispatchEvent(new Event('change'))
  f.enter(); await f.click()
  document.hidden = true; document.dispatchEvent(new Event('visibilitychange'))
  f.arrive()
  assert.equal(f.sounds.length, 0)
  assert.equal(f.animations.length, 0)
  assert.equal(f.attributes['aria-pressed'], 'false')
})

test('restored deep links and fast scrolling past the intro stay silent', async t => {
  const f = fixture(t)
  f.setBottom(-100); f.arrive(); await f.click()
  assert.equal(f.animations.length, 0)
  assert.equal(f.sounds.length, 0)
})

test('a blocked audio context returns to a retryable off state', async t => {
  const f = fixture(t, { resumeFails: true })
  await f.click()
  assert.equal(f.label.textContent, 'Sound off')
  assert.equal(f.attributes['aria-pressed'], 'false')
  assert.match(f.status.textContent, /try again/)
  assert.equal(f.sounds.length, 0)
})
