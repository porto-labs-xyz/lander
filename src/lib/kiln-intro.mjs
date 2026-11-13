// Native timelines move the logo. One observer detects its arrival; Web Audio
// and the square's one-shot animation share a scheduled start after opt-in.
const DANCE = [
  { offset: 0, transform: 'translateY(0) rotate(0) scale(1)' },
  { offset: .06, transform: 'translateY(22%) rotate(-8deg) scale(1.03,.94)' },
  { offset: .25, transform: 'translateY(-65%) rotate(18deg) scale(.95,1.05)' },
  { offset: .39, transform: 'translateY(-48%) rotate(-23deg) scale(1)' },
  { offset: .55, transform: 'translateY(-18%) rotate(10deg) scale(1)' },
  { offset: .66, transform: 'translateY(5%) rotate(-6deg) scale(1.04,.96)' },
  { offset: .84, transform: 'translateY(-7%) rotate(3deg) scale(1)' },
  { offset: 1, transform: 'translateY(0) rotate(0) scale(1)' },
];

export function mountKilnIntro(root) {
  const hero = root.querySelector?.('.boot-hero');
  const marker = root.querySelector?.('.hero-arrival-marker');
  const spark = root.querySelector?.('.header-spark');
  const button = root.querySelector?.('.intro-sound');
  if (!hero || !marker || !spark || !button) return () => {};
  const label = button.querySelector('.sound-state');
  const status = root.querySelector('#intro-sound-status');
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const Audio = window.AudioContext || window.webkitAudioContext;
  const supported = window.CSS?.supports('animation-timeline: view()') && window.CSS?.supports('timeline-scope: --kiln-intro');
  let observer, context, buffer, request, source, gain, dance;
  let disposed = false, enabled = false, loading = false, armed = false, arrived = false, generation = 0;
  const visible = () => !document.hidden && hero.getBoundingClientRect().bottom > window.innerHeight * .75;
  const update = () => {
    button.hidden = !Audio || preference.matches || !supported;
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Turn intro sound off' : 'Turn intro sound on');
    label.textContent = loading ? 'Loading sound' : enabled ? 'Sound on' : 'Sound off';
  };
  const stopSound = () => {
    if (source) {
      // A brief gain ramp avoids clicks when muting during a note.
      gain.gain.cancelScheduledValues(context.currentTime);
      gain.gain.setTargetAtTime(0, context.currentTime, .006);
      source.stop(context.currentTime + .035);
      source = null;
    }
  };
  const cue = () => {
    if (disposed || preference.matches || !visible()) return;
    stopSound();
    const audible = enabled && buffer && context?.state === 'running';
    const delay = audible ? .035 : 0;
    if (audible) {
      const node = context.createBufferSource();
      const volume = context.createGain();
      node.buffer = buffer;
      volume.gain.value = .75;
      node.connect(volume); volume.connect(context.destination);
      source = node; gain = volume;
      node.onended = () => { node.disconnect(); volume.disconnect(); if (source === node) source = null; };
      node.start(context.currentTime + delay);
    }
    dance?.cancel();
    dance = spark.animate?.(DANCE, { duration: 1000, delay: delay * 1000, easing: 'cubic-bezier(.35,0,.3,1)', fill: 'none' });
  };
  const disable = () => {
    enabled = false; loading = false; generation++;
    request?.abort(); request = null;
    stopSound(); update();
  };
  const toggle = async () => {
    if (enabled) { disable(); status.textContent = 'Intro sound off.'; return; }
    const attempt = ++generation;
    enabled = true; loading = !buffer; update();
    try {
      // Must run directly in the click handler, before the first await (iOS).
      context ||= new Audio();
      const resumed = context.resume().then(() => true, () => false);
      if (!buffer) {
        request = new AbortController();
        const response = await fetch(button.dataset.chime, { signal: request.signal });
        if (!response.ok) throw new Error('Chime unavailable');
        const bytes = await response.arrayBuffer();
        if (disposed || attempt !== generation) return;
        const decoded = await context.decodeAudioData(bytes);
        if (disposed || attempt !== generation) return;
        buffer = decoded;
      }
      const didResume = await resumed;
      if (disposed || attempt !== generation) return;
      if (!didResume || context.state !== 'running') throw new Error('Sound needs a tap');
      loading = false; request = null; update();
      status.textContent = arrived ? 'Little Tilt enabled.' : 'Sound on. Scroll to hear Little Tilt when the logo arrives.';
      if (arrived) cue(); // Explicit late opt-in replays the paired moment.
    } catch (error) {
      if (disposed || attempt !== generation) return;
      disable(); status.textContent = 'Sound could not start. Tap Sound off to try again.';
    }
  };
  const observe = () => {
    observer?.disconnect();
    if (preference.matches || !supported || !('IntersectionObserver' in window)) {
      disable(); dance?.cancel(); return;
    }
    update();
    if (arrived) return;
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (disposed || preference.matches || arrived) continue;
        if (entry.isIntersecting) { armed = true; continue; }
        if (entry.boundingClientRect.bottom > 0) continue;
        arrived = true; observer.disconnect();
        // A restored scroll position or deep link must never play a surprise cue.
        if (armed) cue();
      }
    }, { threshold: 0 });
    observer.observe(marker);
  };
  const onVisibility = () => {
    if (!document.hidden) return;
    disable(); dance?.cancel();
    context?.suspend().catch(() => {});
  };
  button.addEventListener('click', toggle);
  preference.addEventListener('change', observe);
  document.addEventListener('visibilitychange', onVisibility);
  observe(); update();
  return () => {
    disposed = true; disable(); observer?.disconnect(); dance?.cancel();
    button.hidden = true;
    button.removeEventListener('click', toggle);
    preference.removeEventListener('change', observe);
    document.removeEventListener('visibilitychange', onVisibility);
    context?.close().catch(() => {});
  };
}
