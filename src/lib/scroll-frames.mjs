// The outline follows scroll position; scrolling back naturally unwinds the line.
// Geometry is cached on layout changes, with at most one paint per scroll frame.
export function mountScrollFrames(root = document) {
  const doc = root.ownerDocument || root, view = doc.defaultView;
  const hosts = [...root.querySelectorAll('.hero-box,.privacy-inside,.pilot-title>span,.about-hero h1>span,.reservation-heading h2>span,.hardware-intro h1>span,.product-page-stage')];
  if (!hosts.length || !view.ResizeObserver) return () => {};
  const preference = view.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController(), ns = 'http://www.w3.org/2000/svg';
  let frames = [], tick = 0, dirty = true, disposed = false;
  const clamp = n => Math.max(0, Math.min(1, n));
  const on = (target, name, callback) => target.addEventListener(name, callback, { passive: true, signal: events.signal });
  function clear() {
    frames.forEach(({ host, svg }) => { host.classList.remove('scroll-frame'); host.style.removeProperty('--frame-width'); host.style.removeProperty('--frame-color'); svg.remove(); });
    frames = [];
  }
  function setup() {
    clear();
    if (preference.matches || disposed) return;
    frames = hosts.map(host => {
      const svg = doc.createElementNS(ns, 'svg'), rect = doc.createElementNS(ns, 'path');
      svg.setAttribute('class', 'scroll-frame-line');
      svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
      rect.setAttribute('fill', 'none'); rect.setAttribute('pathLength', '1');
      rect.setAttribute('stroke-dasharray', '1 1'); rect.setAttribute('stroke-dashoffset', '1');
      rect.setAttribute('vector-effect', 'non-scaling-stroke');
      rect.setAttribute('stroke-linejoin', 'miter'); rect.setAttribute('stroke-linecap', 'butt');
      svg.append(rect); host.append(svg);
      // Read the original border before hiding it; the border still reserves space.
      host.style.setProperty('--frame-color', view.getComputedStyle(host).borderTopColor);
      host.classList.add('scroll-frame');
      return { host, svg, rect, progress: -1, start: 0, distance: 1 };
    });
    invalidate();
  }
  function measure() {
    const height = view.innerHeight, scroll = view.scrollY;
    frames.forEach(item => {
      const { host, svg, rect } = item, box = host.getBoundingClientRect();
      const border = parseFloat(view.getComputedStyle(host).borderTopWidth) || 5;
      host.style.setProperty('--frame-width', border + 'px');
      svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
      // Keep the dash seam on a straight edge, away from all four corners.
      // A centred stroke shares one closed path, so inner/outer edges meet exactly.
      const inset = border / 2, right = Math.max(inset, box.width - inset), bottom = Math.max(inset, box.height - inset);
      rect.setAttribute('d', `M ${box.width / 2} ${inset} H ${right} V ${bottom} H ${inset} V ${inset} Z`);
      rect.setAttribute('stroke-width', border);
      const runway = host.classList.contains('hero-box') && host.closest('.intro-active');
      if (runway) {
        const style = view.getComputedStyle(runway);
        const distance = parseFloat(style.getPropertyValue('--intro-distance')) || height;
        const header = parseFloat(style.getPropertyValue('--intro-header')) || 0;
        item.start = runway.getBoundingClientRect().top + scroll - header + distance * .38;
        item.distance = distance * .57;
      } else {
        item.start = box.top + scroll - height * .9;
        item.distance = height * .45 + Math.min(box.height, height * .45) * .25;
      }
    });
    dirty = false;
  }
  function paint() {
    tick = 0;
    if (disposed || doc.hidden || preference.matches) return;
    if (dirty) measure();
    const scroll = view.scrollY;
    frames.forEach(item => {
      const progress = clamp((scroll - item.start) / item.distance);
      if (Math.abs(progress - item.progress) < .0001) return;
      // A completed outline is genuinely solid: no residual dash cap or seam.
      if (progress >= 1) item.rect.removeAttribute('stroke-dasharray');
      else item.rect.setAttribute('stroke-dasharray', '1 1');
      item.rect.setAttribute('stroke-dashoffset', String(1 - progress));
      item.progress = progress;
    });
  }
  function schedule() { if (!tick && !disposed && !doc.hidden) tick = view.requestAnimationFrame(paint); }
  function invalidate() { dirty = true; schedule(); }
  const observer = new view.ResizeObserver(invalidate);
  hosts.forEach(host => observer.observe(host));
  observer.observe(root.querySelector('main') || doc.documentElement);
  on(view, 'scroll', schedule); on(view, 'resize', invalidate);
  on(doc, 'visibilitychange', schedule); on(preference, 'change', setup);
  doc.fonts?.ready.then(() => { if (!disposed) invalidate(); });
  setup();
  return () => { disposed = true; events.abort(); observer.disconnect(); view.cancelAnimationFrame(tick); clear(); };
}
