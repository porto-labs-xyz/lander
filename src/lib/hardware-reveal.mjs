// A single viewport-triggered camera move. Only transforms and opacity animate.
// No idle frame loop, scroll interception, controls, autoplay workaround or late audio.
const DURATION = 3800;
const LIGHT_CUE = 2500;
// Two brief, irregular red → blue → yellow bursts, confined to the status light.
const FLICKER = [
  ['red', [[0, 70], [280, 45]]],
  ['blue', [[90, 55], [345, 50]]],
  ['yellow', [[165, 75], [415, 95]]],
];

export function mountHardwareReveal(root = document) {
  const section = root.querySelector('[data-hardware-reveal]');
  if (!section) return () => {};
  const doc = section.ownerDocument;
  const view = doc.defaultView;
  const media = view.matchMedia('(prefers-reduced-motion: reduce)');
  const camera = section.querySelector('.reveal-camera');
  const closed = section.querySelector('.reveal-closed');
  const lines = [...section.querySelectorAll('.reveal-line')];
  if (!view.IntersectionObserver || !camera?.animate || media.matches) return () => {};

  let ready = false, started = false, complete = false, disposed = false, visible = false;
  let loading, audio, soundLoading, soundBuffer, soundAbort, animations = [], cueTimer = 0, cued = false, soundNodes = [];
  const events = new AbortController();
  const on = (target, type, fn, options = {}) => target.addEventListener(type, fn, { ...options, signal: events.signal });

  function stopSound() {
    view.clearTimeout(cueTimer);
    cueTimer = 0;
    soundNodes.forEach(node => { try { node.stop?.(); } catch {} node.disconnect(); });
    soundNodes = [];
  }
  function prepareSound() {
    if (!audio || soundLoading || complete || disposed || cued) return;
    const context = audio;
    soundAbort = new AbortController();
    soundLoading = view.fetch('/assets/little-tilt.mp3', { signal: soundAbort.signal })
      .then(response => { if (!response.ok) throw new Error('Chime unavailable'); return response.arrayBuffer(); })
      .then(bytes => context.decodeAudioData(bytes))
      .then(buffer => { if (!disposed && !complete && !cued) soundBuffer = buffer; })
      .catch(() => {});
  }
  function unlockSound(event) {
    // Only real input can unlock sound. Scrolling without activation stays silent.
    if (!event.isTrusted || complete || disposed || media.matches || doc.hidden) return;
    if (event.type === 'keydown' && (event.repeat || event.ctrlKey || event.metaKey || event.altKey)) return;
    const Audio = view.AudioContext || view.webkitAudioContext;
    if (!Audio) return;
    try {
      audio ||= new Audio();
      if (audio.state !== 'running') audio.resume().catch(() => {});
      if (ready || loading) prepareSound();
    } catch { /* The visual sequence is independent of audio availability. */ }
  }
  function sound() {
    cued = true;
    if (!visible || doc.hidden || media.matches || audio?.state !== 'running') return;
    if (!soundBuffer) return;
    const source = audio.createBufferSource(), gain = audio.createGain();
    const now = audio.currentTime;
    source.buffer = soundBuffer;
    gain.gain.setValueAtTime(.65, now);
    gain.gain.setValueAtTime(.65, now + .48);
    gain.gain.linearRampToValueAtTime(0, now + .78);
    source.connect(gain); gain.connect(audio.destination);
    source.onended = () => { source.disconnect(); gain.disconnect(); };
    // Keep Little Tilt's opening signature; fade the tail instead of cutting it.
    source.start(now, 0, .8);
    soundNodes.push(source, gain);
  }

  function scheduleCue() {
    view.clearTimeout(cueTimer);
    if (cued) return;
    const remaining = LIGHT_CUE - (Number(animations[0]?.currentTime) || 0);
    if (remaining < 0) { cued = true; return; }
    cueTimer = view.setTimeout(sound, remaining);
  }
  function finish() {
    complete = true;
    stopSound();
    soundAbort?.abort();
    soundBuffer = undefined;
    animations.forEach(animation => animation.cancel());
    animations = [];
    section.classList.remove('reveal-ready', 'reveal-running');
    section.classList.add('reveal-complete');
    loader.disconnect(); observer.disconnect();
    if (audio) { audio.close().catch(() => {}); audio = undefined; }
  }
  function run() {
    if (!ready || started || disposed || media.matches || !visible || doc.hidden) return;
    started = true;
    section.classList.add('reveal-running');
    const animate = (element, frames) => {
      const animation = element.animate(frames, { duration: DURATION, fill: 'both', easing: 'linear' });
      animations.push(animation);
      return animation;
    };
    const master = animate(camera, [
      { transform: 'var(--reveal-from)', offset: 0 },
      { transform: 'var(--reveal-from)', offset: .015, easing: 'cubic-bezier(.42,0,.22,1)' },
      { transform: 'var(--reveal-land)', offset: 2300 / DURATION, easing: 'cubic-bezier(.2,0,.25,1)' },
      { transform: 'var(--reveal-to)', offset: LIGHT_CUE / DURATION },
      { transform: 'var(--reveal-to)', offset: 1 },
    ]);
    FLICKER.forEach(([colour, bursts]) => {
      const light = section.querySelector('.reveal-light-' + colour);
      if (!light) return;
      const frames = [{ opacity: 0, offset: 0 }];
      bursts.forEach(([delay, length]) => {
        const start = LIGHT_CUE + delay;
        frames.push(
          { opacity: 0, offset: start / DURATION },
          { opacity: 1, offset: (start + 8) / DURATION },
          { opacity: 1, offset: (start + length - 14) / DURATION },
          { opacity: 0, offset: (start + length) / DURATION },
        );
      });
      animate(light, [...frames, { opacity: 0, offset: 1 }]);
    });
    lines.forEach((line, index) => animate(line, [
      { opacity: 0, transform: 'translate3d(0,24px,0)', offset: 0 },
      { opacity: 0, transform: 'translate3d(0,24px,0)', offset: (2520 + index * 90) / DURATION, easing: 'cubic-bezier(.16,1,.3,1)' },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: (3250 + index * 90) / DURATION },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 1 },
    ]));
    master.onfinish = finish;
    scheduleCue();
  }
  async function prepare() {
    if (loading || disposed || complete || media.matches) return loading;
    loading = (async () => {
      try {
        // Keep the static frame and copy visible until the single image is ready.
        await closed.decode();
        if (disposed || complete || media.matches) return;
        ready = true;
        prepareSound();
        section.classList.add('reveal-ready');
        run();
      } catch { /* A failed decode leaves the static frame and copy intact. */ }
    })();
    return loading;
  }
  function updatePlayback() {
    if (complete || disposed) return;
    if (!visible || doc.hidden) {
      animations.forEach(animation => animation.pause());
      stopSound();
      return;
    }
    if (!started) { run(); return; }
    animations.forEach(animation => animation.play());
    scheduleCue();
  }
  const loader = new view.IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { prepare(); loader.disconnect(); }
  }, { rootMargin: '600px 0px' });
  const observer = new view.IntersectionObserver(entries => {
    const entry = entries[entries.length - 1];
    visible = entry.isIntersecting && entry.intersectionRatio >= .35;
    if (visible) prepare();
    updatePlayback();
  }, { threshold: [0, .35] });
  loader.observe(section); observer.observe(section);
  on(doc, 'pointerdown', unlockSound, { passive: true });
  on(doc, 'keydown', unlockSound);
  on(doc, 'visibilitychange', updatePlayback);
  on(media, 'change', () => { if (media.matches) finish(); });
  return () => { disposed = true; events.abort(); finish(); section.classList.remove('reveal-complete'); };
}
