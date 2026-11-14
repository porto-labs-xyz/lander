// A single viewport-triggered assembly. All moving layers use transforms/opacity.
// No idle frame loop, scroll interception, controls, autoplay workaround or late audio.
const DURATION = 5000;
const SEAT = 2700;

export function mountHardwareReveal(root = document) {
  const section = root.querySelector('[data-hardware-reveal]');
  if (!section) return () => {};
  const doc = section.ownerDocument;
  const view = doc.defaultView;
  const media = view.matchMedia('(prefers-reduced-motion: reduce)');
  const camera = section.querySelector('.reveal-camera');
  const open = section.querySelector('.reveal-open');
  const closed = section.querySelector('.reveal-closed');
  const shell = section.querySelector('.reveal-shell');
  const glow = section.querySelector('.reveal-glow');
  const lines = [...section.querySelectorAll('.reveal-line')];
  if (!view.IntersectionObserver || !camera?.animate || media.matches) return () => {};

  let ready = false, started = false, complete = false, disposed = false, visible = false;
  let loading, audio, animations = [], cueTimer = 0, cued = false, soundNodes = [];
  const events = new AbortController();
  const on = (target, type, fn, options = {}) => target.addEventListener(type, fn, { ...options, signal: events.signal });

  function stopSound() {
    view.clearTimeout(cueTimer);
    cueTimer = 0;
    soundNodes.forEach(node => { try { node.stop?.(); } catch {} node.disconnect(); });
    soundNodes = [];
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
    } catch { /* The visual sequence is independent of audio availability. */ }
  }
  function sound() {
    cued = true;
    if (!visible || doc.hidden || media.matches || audio?.state !== 'running') return;
    // An original, quiet two-part cue: a low seating pulse and a soft glass overtone.
    const now = audio.currentTime;
    [[92, 0, .32, .045], [660, .045, .7, .024], [990, .075, .48, .009]].forEach(([frequency, delay, length, level]) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, now + delay);
      if (frequency === 92) oscillator.frequency.exponentialRampToValueAtTime(46, now + .25);
      gain.gain.setValueAtTime(0, now + delay);
      gain.gain.linearRampToValueAtTime(level, now + delay + .018);
      gain.gain.exponentialRampToValueAtTime(.0001, now + delay + length);
      oscillator.connect(gain); gain.connect(audio.destination);
      oscillator.start(now + delay); oscillator.stop(now + delay + length + .04);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      soundNodes.push(oscillator, gain);
    });
  }
  function scheduleCue() {
    view.clearTimeout(cueTimer);
    if (cued) return;
    const remaining = SEAT - (Number(animations[0]?.currentTime) || 0);
    if (remaining < 0) { cued = true; return; }
    cueTimer = view.setTimeout(sound, remaining);
  }
  function finish() {
    complete = true;
    stopSound();
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
      { transform: 'scale(.965)', offset: 0 },
      { transform: 'scale(1)', offset: 1, easing: 'ease-out' },
    ]);
    animate(shell, [
      { opacity: 0, transform: 'translate3d(1.5%,-22%,0)', offset: 0 },
      { opacity: 0, transform: 'translate3d(1.5%,-22%,0)', offset: .16 },
      { opacity: 1, transform: 'translate3d(1.1%,-17%,0)', offset: .25, easing: 'cubic-bezier(.22,.8,.2,1)' },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: .54 },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 1 },
    ]);
    animate(closed, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: .52 }, { opacity: 1, offset: .62 }, { opacity: 1, offset: 1 }]);
    animate(open, [{ opacity: 1, offset: 0 }, { opacity: 1, offset: .56 }, { opacity: 0, offset: .64 }, { opacity: 0, offset: 1 }]);
    animate(glow, [{ opacity: 0, offset: 0 }, { opacity: 0, offset: .51 }, { opacity: .45, offset: .57 }, { opacity: 0, offset: .76 }, { opacity: 0, offset: 1 }]);
    lines.forEach((line, index) => animate(line, [
      { opacity: 0, transform: 'translate3d(0,24px,0)', offset: 0 },
      { opacity: 0, transform: 'translate3d(0,24px,0)', offset: .55 + index * .045, easing: 'cubic-bezier(.16,1,.3,1)' },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: .78 + index * .045 },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 1 },
    ]));
    master.onfinish = finish;
    scheduleCue();
  }
  async function prepare() {
    if (loading || disposed || complete || media.matches) return loading;
    loading = (async () => {
      try {
        open.src = open.dataset.revealSrc;
        // Keep the finished image/copy visible until all layers can render.
        await Promise.all([open, closed].map(image => image.decode()));
        if (disposed || complete || media.matches) return;
        ready = true;
        section.classList.add('reveal-ready');
        run();
      } catch { /* Failed images leave the static case-on version and copy intact. */ }
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
