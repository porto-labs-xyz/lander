import test from 'node:test';
import assert from 'node:assert/strict';
import { mountSlotRhythm } from './slot-rhythm.mjs';

function fixture(t, { reduced = false, supported = true, top = 2000, height = 1000, pageHeight = 8000 } = {}) {
  const names = ['window', 'document', 'requestAnimationFrame', 'cancelAnimationFrame', 'MutationObserver', 'ResizeObserver'];
  const previous = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const counts = { measures: 0, heightReads: 0, queries: 0, writes: 0, created: 0 };
  const animations = [], frames = new Map(), observers = [];
  let nextFrame = 0;
  const preference = new EventTarget(); preference.matches = reduced;
  const win = new EventTarget(); win.scrollY = 0; win.innerHeight = 1000;
  win.matchMedia = () => preference;
  win.Element = { prototype: { animate: supported } };
  const doc = new EventTarget(); doc.hidden = false;
  doc.documentElement = { get scrollHeight() { counts.heightReads++; return pageHeight; } };
  const rows = Array.from({ length: 5 }, () => ({
    dataset: {},
    querySelectorAll: () => Array.from({ length: 3 }, () => ({
      animate(keyframes, timing) {
        counts.created++;
        const animation = {
          keyframes, timing, playState: 'running', time: null,
          finished: new Promise(() => {}),
          effect: { updateTiming(value) { animation.timing = value; } },
          pause() { this.playState = 'paused'; },
          play() { this.playState = 'running'; },
          cancel() { this.playState = 'idle'; },
          get currentTime() { return this.time; },
          set currentTime(value) { counts.writes++; this.time = value; }
        };
        animations.push(animation);
        return animation;
      }
    }))
  }));
  const scene = { id: 'art', dataset: { rhythm: 'opposed' }, top, height,
    querySelectorAll: () => rows,
    getBoundingClientRect() { counts.measures++; return { top: this.top - win.scrollY, bottom: this.top + this.height - win.scrollY }; }
  };
  const button = { hidden: false, dataset: { nudge: 'art' }, closest: () => button };
  const dialog = { open: false }, section = {};
  const root = new EventTarget();
  root.querySelectorAll = selector => {
    counts.queries++;
    return ({ '[data-rhythm]': [scene], '[data-nudge]': [button], dialog: [dialog], 'section,footer': [section] })[selector];
  };
  class Observer {
    constructor(callback) { this.callback = callback; this.nodes = new Set(); observers.push(this); }
    observe(node) { this.nodes.add(node); }
    disconnect() { this.nodes.clear(); }
  }
  win.ResizeObserver = Observer;
  Object.assign(globalThis, { window: win, document: doc, ResizeObserver: Observer, MutationObserver: Observer,
    requestAnimationFrame: callback => { frames.set(++nextFrame, callback); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id)
  });
  const flush = () => { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback()); };
  let destroy;
  t.after(() => { destroy?.(); Object.assign(globalThis, previous); });
  const mount = () => { destroy = mountSlotRhythm(root); flush(); return destroy; };
  const scroll = position => { win.scrollY = position; win.dispatchEvent(new Event('scroll')); flush(); };
  return { win, doc, root, scene, button, dialog, preference, counts, animations, observers, frames, flush, mount, scroll,
    nudge() { const event = new Event('click'); Object.defineProperty(event, 'target', { value: button }); root.dispatchEvent(event); }
  };
}

test('ordinary scroll batches one frame, with no DOM queries or layout reads after measurement', t => {
  const f = fixture(t); f.mount();
  const baseline = { ...f.counts };
  for (let i = 0; i < 20; i++) f.win.dispatchEvent(new Event('scroll'));
  assert.equal(f.frames.size, 1);
  f.flush();
  for (let i = 1; i <= 60; i++) f.scroll(i * 10);
  assert.deepEqual(f.counts, baseline);
  assert.equal(f.frames.size, 0, 'no idle animation loop');
});

test('scroll holds, reverses, and leaves settled/offscreen timelines untouched', t => {
  const f = fixture(t); f.mount(); f.scroll(1001);
  assert.equal(f.animations[0].currentTime, 0, '26% viewport lead-in');
  f.scroll(1500);
  const midpoint = f.animations[0].currentTime;
  const writes = f.counts.writes;
  f.scroll(1500);
  assert.equal(f.counts.writes, writes, 'stationary scroll holds without writes');
  f.scroll(1450);
  assert.ok(f.animations[0].currentTime < midpoint);
  f.scroll(2500);
  const settledWrites = f.counts.writes;
  f.scroll(2600); f.scroll(3100); f.scroll(3500);
  assert.equal(f.counts.writes, settledWrites);
});

test('re-entry and replay reuse effects, with stable timings during a swipe', t => {
  const f = fixture(t); f.mount(); f.scroll(1500);
  const timings = f.animations.map(a => ({ ...a.timing }));
  f.scroll(1600); f.scroll(1500);
  assert.deepEqual(f.animations.map(a => a.timing), timings);
  assert.ok(timings[6].delay + timings[6].duration < timings[3].delay + timings[3].duration, 'third slot overtakes second');
  f.scroll(3500); f.scroll(2500); f.nudge();
  assert.equal(f.counts.created, 15);
  assert.ok(f.animations.every(a => a.playState === 'running'));
  f.scroll(2400);
  assert.ok(f.animations.every(a => a.playState === 'paused'), 'swipe interrupts manual replay');
});

test('blue/red retain the gentler curve and 60% scroll playback rate', t => {
  const f = fixture(t); f.scene.dataset.rhythm = 'diagonal'; f.mount(); f.scroll(1550);
  const duration = Math.max(...f.animations.map(a => a.timing.delay + a.timing.duration));
  assert.ok(Math.abs(f.animations[0].currentTime / duration - 290 / (580 / .6)) < 1e-10);
  assert.equal(f.animations[0].keyframes[0].easing, 'cubic-bezier(.42,0,.58,1)');
  assert.ok(f.animations[0].timing.duration >= 385 / .6);
});

test('layout reflow invalidates cached geometry and document-end clamping completes the last scene', t => {
  const f = fixture(t, { top: 1900, pageHeight: 3000 });
  f.scene.dataset.rhythm = 'vertical'; f.mount(); f.scroll(1800);
  f.scene.top += 100;
  f.observers.find(o => o.nodes.has(f.scene)).callback([]); f.flush();
  assert.equal(f.counts.measures, 2);
  f.scroll(2000);
  assert.equal(f.animations[0].currentTime, Math.max(...f.animations.map(a => a.timing.delay + a.timing.duration)));
});

test('dialog and visibility pause manual replay; reduced motion cancels it into static artwork', t => {
  const f = fixture(t); f.mount(); f.scroll(1500); f.nudge();
  f.dialog.open = true; f.observers.find(o => o.nodes.has(f.dialog)).callback([]); f.flush();
  assert.ok(f.animations.every(a => a.playState === 'paused'));
  f.dialog.open = false; f.observers.find(o => o.nodes.has(f.dialog)).callback([]); f.flush();
  assert.ok(f.animations.every(a => a.playState === 'running'));
  f.doc.hidden = true; f.doc.dispatchEvent(new Event('visibilitychange')); f.flush();
  assert.ok(f.animations.every(a => a.playState === 'paused'));
  f.preference.matches = true; f.preference.dispatchEvent(new Event('change')); f.flush();
  assert.ok(f.animations.every(a => a.playState === 'idle'));
  assert.equal(f.button.hidden, true);
});

test('initial reduced motion stays static, and React unmount removes observers, listeners and pending work', t => {
  const f = fixture(t, { reduced: true }); const destroy = f.mount(); f.scroll(1500);
  assert.equal(f.counts.created, 0);
  f.preference.matches = false; f.preference.dispatchEvent(new Event('change')); f.flush();
  assert.equal(f.counts.created, 15);
  f.win.dispatchEvent(new Event('resize'));
  destroy();
  const before = { ...f.counts };
  f.scroll(1700); f.nudge();
  assert.deepEqual(f.counts, before);
  assert.equal(f.frames.size, 0);
  assert.ok(f.observers.every(o => o.nodes.size === 0));
  assert.ok(f.animations.every(a => a.playState === 'idle'));
  assert.equal(f.button.hidden, false);
});

test('browsers without Web Animations keep static artwork and hide replay', t => {
  const f = fixture(t, { supported: false }); const destroy = f.mount();
  assert.equal(f.button.hidden, true);
  assert.equal(f.counts.created, 0);
  destroy();
  assert.equal(f.button.hidden, false);
});
