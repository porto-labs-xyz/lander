// A single viewport-triggered camera move. Only transforms and opacity animate.
// No idle frame loop, scroll interception, controls, autoplay workaround or late audio.
const DURATION = 3800;
const LIGHT_CUE = 2500;
const CHIME_DURATION = 800;
// Measured from Little Tilt's first 800 ms: 5 ms RMS, Gaussian-smoothed
// (sigma 15 ms), sampled every 20 ms, with the same 480–780 ms audio fade.
// The quiet attack, note swells and small final lift replace on/off flashes.
const CHIME_ENVELOPE = [
  0, 0, .02, .127, .276, .319, .296, .274, .26, .246,
  .231, .223, .275, .459, .574, .577, .576, .536, .489, .463,
  .478, .476, .442, .411, .383, .331, .281, .24, .203, .168,
  .139, .115, .103, .131, .164, .14, .097, .06, .029, 0, 0,
];
const smoothStep = value => {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
};

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
  let loading, audio, soundLoading, soundBuffer, reverbBuffer, soundAbort, animations = [], cueTimer = 0, cued = false, soundNodes = [];
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
      .then(buffer => {
        if (disposed || complete || cued) return;
        soundBuffer = buffer;
        // Prepare a small, deterministic stereo room before the landing cue.
        // Its 360 ms tail fits inside the existing final hold.
        const length = Math.ceil(context.sampleRate * .36);
        reverbBuffer = context.createBuffer(2, length, context.sampleRate);
        for (let channel = 0; channel < 2; channel++) {
          const data = reverbBuffer.getChannelData(channel);
          let seed = 171 + channel * 97, softened = 0;
          for (let i = Math.ceil(context.sampleRate * .012); i < length; i++) {
            seed = (1664525 * seed + 1013904223) >>> 0;
            softened = softened * .6 + (seed / 2147483648 - 1) * .4;
            data[i] = softened * Math.exp(-7 * i / length) * (1 - i / length);
          }
        }
      })
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
    if (!visible || doc.hidden || media.matches || audio?.state !== 'running') return;
    if (!soundBuffer) return;
    const source = audio.createBufferSource(), gain = audio.createGain();
    const now = audio.currentTime;
    source.buffer = soundBuffer;
    gain.gain.setValueAtTime(.65, now);
    gain.gain.setValueAtTime(.65, now + .48);
    gain.gain.linearRampToValueAtTime(0, now + .78);
    source.connect(gain); gain.connect(audio.destination);
    soundNodes.push(source, gain);
    if (reverbBuffer) {
      // Filter only the ambience: keep the original notes clear and close.
      const tone = audio.createBiquadFilter();
      tone.type = 'lowpass'; tone.frequency.value = 3400; tone.Q.value = .7;
      gain.connect(tone);
      const room = audio.createConvolver(), roomLevel = audio.createGain();
      room.buffer = reverbBuffer; roomLevel.gain.value = .13;
      tone.connect(room); room.connect(roomLevel); roomLevel.connect(audio.destination);
      // Two quiet taps, without feedback or a repeating echo loop.
      const echo = audio.createDelay(.5), echoLevel = audio.createGain();
      const tail = audio.createDelay(.5), tailLevel = audio.createGain();
      echo.delayTime.value = .12; echoLevel.gain.value = .14;
      tail.delayTime.value = .12; tailLevel.gain.value = .04;
      tone.connect(echo); echo.connect(echoLevel); echoLevel.connect(audio.destination);
      echo.connect(tail); tail.connect(tailLevel); tailLevel.connect(audio.destination);
      soundNodes.push(tone, room, roomLevel, echo, echoLevel, tail, tailLevel);
    }
    // The source can end before its room/echo tails. Keep those connected until
    // the final hold ends; stopSound still silences everything immediately offscreen.
    source.onended = () => { source.disconnect(); };
    // Keep Little Tilt's opening signature; fade the tail instead of cutting it.
    source.start(now, 0, CHIME_DURATION / 1000);
  }

  function cue() {
    if (cued || complete || disposed || !visible || doc.hidden || media.matches) return;
    cued = true;
    // Start the light and sound together, so timer drift cannot separate them.
    // Note entrances at ~60, 240, 390 and 650 ms are already in the envelope.
    // Crossfade red → blue → yellow; the last note gently lifts the yellow tail.
    ['red', 'blue', 'yellow'].forEach((colour, index) => {
      const light = section.querySelector('.reveal-light-' + colour);
      if (!light) return;
      const frames = CHIME_ENVELOPE.map((level, sample) => {
        const ms = sample * 20;
        const blue = smoothStep((ms - 240) / 60);
        const yellow = smoothStep((ms - 390) / 60);
        const weight = [1 - blue, blue * (1 - yellow), yellow][index];
        return { opacity: level * weight, offset: ms / CHIME_DURATION };
      });
      animations.push(light.animate(frames, { duration: CHIME_DURATION, fill: 'both', easing: 'linear' }));
    });
    sound();
  }

  function scheduleCue() {
    view.clearTimeout(cueTimer);
    if (cued) return;
    const remaining = LIGHT_CUE - (Number(animations[0]?.currentTime) || 0);
    if (remaining < 0) { cued = true; return; }
    cueTimer = view.setTimeout(cue, remaining);
  }
  function finish() {
    complete = true;
    stopSound();
    soundAbort?.abort();
    soundBuffer = undefined;
    reverbBuffer = undefined;
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
