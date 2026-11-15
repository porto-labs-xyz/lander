// Grille geometry is the only ornament; tilted squares stay in the UI.
// Native timelines hold the transforms; scroll only seeks the active playhead.
const ROW_PACES = [[0, 400, 0, 15], [100, 620, 18, 30], [140, 360, 12, 15], [220, 470, 25, 40], [285, 410, 25, 30]];
const clamp = value => Math.min(1, Math.max(0, value));
const vary = spread => Math.round((Math.random() * 2 - 1) * spread);

function keyframes(kind, row, index, speed) {
  const travel = Number(row.dataset.travel) || 720;
  const side = index % 2 ? 1 : -1;
  const poses = kind === 'opposed'
    ? [`translateX(${side * travel}px)`, `translateX(${-side * 12}px)`, `translateX(${side * 3}px)`]
    : kind === 'diagonal'
      ? [`translate(${travel}px,-200px)`, 'translate(-12px,4px)', 'translate(3px,-1px)']
      : [`translateY(${side * 130}%)`, `translateY(${-side * 10}px)`, `translateY(${side * 3}px)`];
  return [
    { transform: poses[0], offset: 0, easing: speed < 1 ? 'cubic-bezier(.42,0,.58,1)' : 'cubic-bezier(.18,.8,.2,1)' },
    { transform: poses[1], offset: .68, easing: 'cubic-bezier(.4,0,.6,1)' },
    { transform: poses[2], offset: .86, easing: 'ease-out' },
    { transform: 'translate(0,0)', offset: 1 }
  ];
}

export function mountSlotRhythm(root = document) {
  const scenes = [...root.querySelectorAll('[data-rhythm]')];
  if (!scenes.length) return () => {};
  const buttons = [...root.querySelectorAll('[data-nudge]')];
  const originalHidden = buttons.map(button => button.hidden);
  const restoreButtons = () => buttons.forEach((button, index) => { button.hidden = originalHidden[index]; });
  if (!window.Element.prototype.animate) {
    buttons.forEach(button => { button.hidden = true; });
    return restoreButtons;
  }
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const dialogs = [...root.querySelectorAll('dialog')];
  const states = scenes.map(scene => {
    const speed = scene.dataset.rhythm === 'opposed' ? 1 : .6;
    return {
      scene, speed, animations: [], duration: 0, inside: false, direction: 1,
      manual: false, generation: 0, time: null, top: 0, bottom: 0,
      rows: [...scene.querySelectorAll('.slot-row')].map((row, index) => ({
        layers: [...row.querySelectorAll('.slot-layer')],
        frames: keyframes(scene.dataset.rhythm, row, index, speed)
      }))
    };
  });
  let frame = 0, disposed = false, layoutDirty = true, viewport = 0, maxScroll = 0;
  let lastScroll = window.scrollY, direction = 1, dialogOpen = dialogs.some(dialog => dialog.open);
  const blocked = () => preference.matches || document.hidden || dialogOpen;
  const clear = state => {
    state.animations.forEach(animation => { animation.finished.catch(() => {}); animation.cancel(); });
    state.animations = [];
    state.manual = false;
    state.inside = false;
    state.time = null;
    state.generation++;
  };
  const prepare = state => {
    state.manual = false;
    state.generation++;
    state.time = null;
    state.duration = 0;
    let cursor = 0;
    // Pick paces only on entry/replay. Reversing a swipe keeps the same timings.
    // Reuse effects across entries rather than allocating 12–15 new ones each time.
    state.rows.forEach((row, index) => {
      const [start, duration, startSpread, durationSpread] = ROW_PACES[index % ROW_PACES.length];
      const rowDelay = Math.max(0, start + vary(startSpread)) / state.speed;
      const rowDuration = (duration + vary(durationSpread)) / state.speed;
      row.layers.forEach((layer, layerIndex) => {
        const delay = rowDelay + layerIndex * 32 / state.speed;
        const timing = { duration: rowDuration, delay, easing: 'linear', fill: 'both' };
        let animation = state.animations[cursor++];
        if (animation) animation.effect.updateTiming(timing);
        else {
          animation = layer.animate(row.frames, timing);
          animation.finished.catch(() => {});
          state.animations.push(animation);
        }
        animation.pause();
        animation.currentTime = 0;
        state.duration = Math.max(state.duration, delay + rowDuration);
      });
    });
  };
  const scrub = (state, progress) => {
    const time = progress * state.duration;
    if (state.time === time && !state.manual) return;
    if (state.manual) state.generation++;
    state.manual = false;
    state.animations.forEach(animation => {
      if (animation.playState !== 'paused') animation.pause();
      animation.currentTime = time;
    });
    state.time = time;
  };
  const measure = scroll => {
    viewport = window.innerHeight;
    maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport);
    // Read all geometry before changing any animation state.
    states.forEach(state => {
      const rect = state.scene.getBoundingClientRect();
      state.top = rect.top + scroll;
      state.bottom = rect.bottom + scroll;
    });
    layoutDirty = false;
  };
  const update = () => {
    frame = 0;
    if (disposed) return;
    const scroll = window.scrollY;
    const moved = Math.abs(scroll - lastScroll) > .5;
    if (moved) direction = scroll > lastScroll ? 1 : -1;
    lastScroll = scroll;
    if (blocked()) {
      states.forEach(state => state.animations.forEach(animation => {
        if (animation.playState === 'running') animation.pause();
      }));
      return;
    }
    if (layoutDirty || viewport !== window.innerHeight) measure(scroll);
    for (const state of states) {
      const top = state.top - scroll, bottom = state.bottom - scroll;
      if (bottom <= 0 || top >= viewport) {
        state.inside = false;
        if (state.animations.length) scrub(state, (state.direction === 1 ? bottom <= 0 : top >= viewport) ? 1 : 0);
        continue;
      }
      if (!state.inside) {
        state.direction = direction;
        prepare(state);
        state.inside = true;
      }
      if (state.manual && !moved) {
        state.animations.forEach(animation => { if (animation.playState === 'paused') animation.play(); });
        continue;
      }
      const fromBelow = state.direction === 1;
      const travelled = fromBelow ? viewport * .74 - top : bottom - viewport * .26;
      const available = fromBelow ? maxScroll - (state.top - viewport * .74) : state.bottom - viewport * .26;
      // Keep the 26% lead-in and 60% blue/red speed. Clamp at document edges
      // so the closing scene can settle even on a short viewport/page.
      const distance = Math.max(1, Math.min(viewport * .58 / state.speed, available));
      scrub(state, clamp(travelled / distance));
    }
  };
  const schedule = () => { if (!disposed && !frame) frame = requestAnimationFrame(update); };
  const invalidate = () => { layoutDirty = true; schedule(); };
  const configure = () => {
    buttons.forEach(button => { button.hidden = preference.matches; });
    if (preference.matches) states.forEach(clear);
    invalidate();
  };
  const onDialog = () => { dialogOpen = dialogs.some(dialog => dialog.open); invalidate(); };
  const onNudge = event => {
    const button = event.target.closest?.('[data-nudge]');
    if (!buttons.includes(button) || blocked()) return;
    const state = states.find(item => item.scene.id === button.dataset.nudge);
    if (!state?.inside) return;
    prepare(state);
    state.manual = true;
    const generation = state.generation;
    state.animations.forEach(animation => animation.play());
    Promise.all(state.animations.map(animation => animation.finished)).then(() => {
      if (!disposed && state.generation === generation) {
        state.manual = false;
        state.time = null;
      }
    }).catch(() => {});
  };
  root.addEventListener('click', onNudge);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', invalidate);
  window.addEventListener('pageshow', invalidate);
  window.addEventListener('load', invalidate);
  document.addEventListener('visibilitychange', schedule);
  preference.addEventListener('change', configure);
  const dialogObserver = new MutationObserver(onDialog);
  dialogs.forEach(dialog => dialogObserver.observe(dialog, { attributes: true, attributeFilter: ['open'] }));
  const layoutObserver = 'ResizeObserver' in window ? new ResizeObserver(invalidate) : null;
  // Section heights catch upstream reflow even when the artwork itself is unchanged.
  const layoutNodes = new Set([root === document ? document.body : root, ...scenes, ...root.querySelectorAll('section,footer')]);
  layoutNodes.forEach(node => { if (node) layoutObserver?.observe(node); });
  document.fonts?.ready.then(invalidate);
  configure();
  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    states.forEach(clear);
    dialogObserver.disconnect();
    layoutObserver?.disconnect();
    root.removeEventListener('click', onNudge);
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', invalidate);
    window.removeEventListener('pageshow', invalidate);
    window.removeEventListener('load', invalidate);
    document.removeEventListener('visibilitychange', schedule);
    preference.removeEventListener('change', configure);
    restoreButtons();
  };
}
