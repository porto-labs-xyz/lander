const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const MACRO = { left: .375, top: .05, fraction: .4 };
const FOCUS = { x: .60, y: .135 };
const MATERIAL_WIDTHS = [1920, 3840, 7680];

export function materialSourceWidth(cssWidth, pixelRatio) {
 const pixels = Math.ceil(cssWidth * pixelRatio);
 return MATERIAL_WIDTHS.find(width => width >= pixels) ?? MATERIAL_WIDTHS[MATERIAL_WIDTHS.length - 1];
}

const DANCE = [
 { offset: 0, transform: 'translateY(0) rotate(0)' },
 { offset: .08, transform: 'translateY(20%) rotate(-8deg) scale(1.03,.94)' },
 { offset: .26, transform: 'translateY(-65%) rotate(18deg) scale(.95,1.05)' },
 { offset: .4, transform: 'translateY(-48%) rotate(-23deg)' },
 { offset: .56, transform: 'translateY(-18%) rotate(10deg)' },
 { offset: .68, transform: 'translateY(5%) rotate(-6deg)' },
 { offset: .85, transform: 'translateY(-7%) rotate(3deg)' },
 { offset: 1, transform: 'translateY(0) rotate(0)' },
];

// One frame per scroll event; no idle animation loop or wheel/touch interception.
// Transform measurements only change on layout resize, not on each scroll.
export function mountArrival() {
 const events=new AbortController();
 const on=(target,type,callback,options={})=>target?.addEventListener(type,callback,{...options,signal:events.signal});
 let disposed=false;
 const runway = document.querySelector('.intro-runway');
 if (!runway) return;
 const hero = runway.querySelector('.hero');
 const header = document.querySelector('.site-header');
 const device = hero.querySelector('.hero-device');
 const fullImage = device.querySelector('picture img');
 const title = hero.querySelector('.hero-title');
 const bottom = hero.querySelector('.hero-bottom');
 const caption = hero.querySelector('.intro-caption');
 const spark = header.querySelector('.header-spark');
 const brand = header.querySelector('.brand');
 const menu = header.querySelector('.menu-toggle');
 const headerCta = header.querySelector('.header-cta');
 const dock = document.querySelector('.mobile-dock');
 const controls = [menu, headerCta, dock].filter(Boolean);
 const preference = matchMedia('(prefers-reduced-motion:reduce)');
 const initialScale = 9;
 const pullbackEnd = .72;
 const Audio = window.AudioContext || window.webkitAudioContext;
 let frame = 0, fitFrame = 0, start = 0, distance = 1, baseWidth = 0, baseHeight = 0;
 let cx = 0, cy = 0, ax = 0, ay = 0, targetX = 0, targetY = 0, logoX = 0, logoY = 0, logoScale = 1;
 let active = false, arrived = false, armed = false, zooming;
 let context, buffer, source, dance, loading;
 let detail, detailReady = false, requestedWidth = 0, requiredWidth = 0;
 let lastPixelRatio = 0, productRasterScale = 1;
 let lastWidth = 0, lastHeight = 0, lastProgress = -1;

 function prepareSound() {
  if (!Audio || !active || arrived || document.hidden) return;
  try {
   context ||= new Audio();
   // Called synchronously on genuine taps/keys as well as mount. Browsers
   // may defer this until user activation; never queue a late arrival chime.
   if (context.state !== 'running') context.resume().catch(() => {});
   loading ||= fetch('/assets/little-tilt.mp3')
    .then(response => { if (!response.ok) throw new Error('Sound unavailable'); return response.arrayBuffer(); })
    .then(bytes => context.decodeAudioData(bytes))
    .then(decoded => { if(!disposed)buffer = decoded; })
    .catch(() => {});
  } catch { /* Audio is decorative; arrival remains usable without it. */ }
 }
 function stopSound() { if (source) { try { source.stop(); } catch {} source.disconnect(); source = null; } }
 function cue() {
  if (document.hidden || preference.matches || !spark) return;
  const audible = buffer && context?.state === 'running';
  if (audible) {
   stopSound();
   const node = context.createBufferSource(), gain = context.createGain();
   node.buffer = buffer; gain.gain.value = .65;
   node.connect(gain); gain.connect(context.destination); source = node;
   node.onended = () => { node.disconnect(); gain.disconnect(); if (source === node) source = null; };
   node.start(context.currentTime + .035);
  }
  dance?.cancel();
  dance = spark.animate(DANCE, { duration: 1000, delay: audible ? 35 : 0, easing: 'cubic-bezier(.35,0,.3,1)' });
 }
 function releaseDetail() {
  detail?.removeAttribute('src');
  detail?.remove();
  detail = null; detailReady = false; requestedWidth = 0;
 }
 function loadDetail() {
  if (!device.dataset.materialDetail || requestedWidth === requiredWidth || (detailReady && requestedWidth > requiredWidth)) return;
  if (!detail) {
   detail = new Image();
   detail.className = 'hero-material-detail';
   detail.alt = '';
   detail.setAttribute('aria-hidden', 'true');
   detail.decoding = 'async';
   detail.fetchPriority = 'high';
   hero.append(detail);
  }
  const image = detail, width = requiredWidth;
  requestedWidth = width;
  detailReady = false;
  image.hidden = true;
  image.src = `${device.dataset.materialDetail}-${width}.webp`;
  image.decode().then(() => {
   if (disposed || image !== detail || width !== requestedWidth) return;
   detailReady = true; lastProgress = -1; schedulePaint();
  }).catch(() => {});
 }
 // Give the registered photograph its own raster surface at its largest
 // display size. The compositor only scales it down during the pullback.
 function paintDetail(scale, focusX, focusY) {
  const opacity = smooth((scale - 2.25) / 2.25);
  if (opacity > 0) loadDetail();
  const ready = detailReady || (opacity === 0 && !requestedWidth);
  if (detail) {
   detail.hidden = opacity === 0 || !ready;
   detail.style.opacity = String(opacity);
   if (!detail.hidden) {
    const x = focusX + (MACRO.left - FOCUS.x) * baseWidth * scale;
    const y = focusY + (MACRO.top - FOCUS.y) * baseHeight * scale;
    detail.style.width = baseWidth * initialScale * MACRO.fraction + 'px';
    detail.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale / initialScale})`;
   }
  }
  return ready;
 }
 function paint() {
  frame = 0;
  if (!active) return;
  if ((window.devicePixelRatio || 1) !== lastPixelRatio) { scheduleFit(true); return; }
  const progress = clamp((window.scrollY - start) / distance);
  if (Math.abs(progress - lastProgress) < .0001) return;
  lastProgress = progress;
  const move = smooth((progress - .025) / (pullbackEnd - .025));
  const logo = smooth(progress / .68);
  // Keep the opening focused on the hardware; controls arrive with the hero.
  const controlsOpacity = smooth((progress - .68) / .18);
  controls.forEach(control => {
   control.style.opacity = String(controlsOpacity);
   control.style.visibility = controlsOpacity === 0 ? 'hidden' : 'visible';
   control.inert = controlsOpacity < .8;
  });
  // The outline draws during the pullback. The words appear once the
  // silhouette is in its final position, with both lines of type clear.
  const outline = smooth((progress - .38) / .46);
  const words = smooth((progress - pullbackEnd) / .15);
  const copy = smooth((progress - .76) / .18);
  // Interpolate apparent magnification, then follow a point on the top rim.
  // Keeping that point anchored prevents a sideways jump midway through zoom.
  let scale = Math.exp(Math.log(initialScale) * (1 - move));
  let focusX = targetX * (1 - move) + ax * move;
  let focusY = targetY * (1 - move) + ay * move;
  if (!paintDetail(scale, focusX, focusY)) {
   // A slow or unavailable detail photo leaves the unscaled product visible.
   scale = 1; focusX = ax; focusY = ay;
  }
  const x = focusX - cx - (ax - cx) * scale;
  const y = focusY - cy - (ay - cy) * scale;
  // The full-device plate has a finite source resolution. Its separate layer
  // can stop there even when the optical photograph needs more screen pixels.
  const inZoom = scale > 1;
  if (zooming !== inZoom) {
   zooming = inZoom;
   device.style.width = baseWidth * (inZoom ? productRasterScale : 1) + 'px';
   device.style.willChange = inZoom ? 'transform' : 'auto';
  }
  device.style.transform = inZoom ? `translate3d(${x + baseWidth * (scale - 1) / 2}px,${y + baseHeight * (1 - scale) / 2}px,0) scale(${scale / productRasterScale})` : 'none';
  brand.style.transform = `translate3d(${logoX * (1 - logo)}px,${logoY * (1 - logo)}px,0) scale(${1 + (logoScale - 1) * (1 - logo)})`;
  header.style.setProperty('--intro-header-line', String(logo * .25));
  title.style.opacity = String(outline);
  title.style.setProperty('--intro-word-opacity', String(words));
  title.style.transform = `translate3d(0,${12 * (1 - outline)}px,0)`;
  bottom.style.opacity = String(copy);
  bottom.inert = copy < .8;
  caption.style.opacity = String(1 - smooth(progress / .25));
  caption.style.visibility = progress > .28 ? 'hidden' : 'visible';
  if (progress < .2) armed = true;
  if (!arrived && progress >= .9) {
   arrived = true;
   if (armed) cue();
  }
 }
 const schedulePaint = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
 function fit() {
  fitFrame = 0;
  if(disposed)return;
  const width = window.innerWidth, height = window.innerHeight, pixelRatio = window.devicePixelRatio || 1;
  // Mobile browser chrome can resize during a swipe. Keep its runway stable.
  if (active && width === lastWidth && pixelRatio === lastPixelRatio && Math.abs(height - lastHeight) < 120) { schedulePaint(); return; }
  lastWidth = width; lastHeight = height; lastPixelRatio = pixelRatio;
  runway.classList.remove('intro-active'); active = false;
  header.classList.remove('intro-header-active');
  device.style.width = '';
  device.style.willChange = '';
  zooming = undefined;
  if (detail) detail.hidden = true;
  [device, title, bottom, caption, brand, ...controls].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
  header.style.removeProperty('--intro-header-line');
  bottom.inert = false;
  controls.forEach(control => { control.inert = false; });
  if (preference.matches || document.body.classList.contains('review-mode')) { releaseDetail(); return; }
  const headerHeight = header.offsetHeight;
  const dockHeight = !dock || getComputedStyle(dock).display === 'none' ? 0 : dock.offsetHeight;
  const available = height - headerHeight - dockHeight;
  // At very small landscape heights leave all content accessible in normal flow.
  if (available < 370) { releaseDetail(); return; }
  hero.style.setProperty('--intro-stage', available + 'px');
  runway.style.setProperty('--intro-stage', available + 'px');
  // Keep dock clearance inside the hero so the opening image fills the viewport.
  runway.style.setProperty('--intro-dock', dockHeight + 'px');
  runway.style.setProperty('--intro-header', headerHeight + 'px');
  distance = Math.round(height * 1.1);
  runway.style.setProperty('--intro-distance', distance + 'px');
  runway.classList.add('intro-active');
  const h = hero.getBoundingClientRect();
  // Centred content can extend above the hero or behind the mobile dock.
  if (hero.scrollHeight > hero.clientHeight + 2 ||
      title.getBoundingClientRect().top < h.top ||
      bottom.getBoundingClientRect().bottom > h.bottom - dockHeight) {
   runway.classList.remove('intro-active'); releaseDetail(); return;
  }
  active = true;
  start = runway.getBoundingClientRect().top + window.scrollY - headerHeight;
  const r = device.getBoundingClientRect();
  cx = r.left - h.left + r.width / 2; cy = r.top - h.top + r.height / 2;
  // Follow the leather attachment and the front shoulder into the headline frame.
  ax = r.left - h.left + r.width * FOCUS.x;
  ay = r.top - h.top + r.height * FOCUS.y;
  targetX = h.width * (width <= 760 ? .72 : .56);
  targetY = h.height * (width <= 760 ? .40 : .55);
  baseWidth = r.width; baseHeight = r.height;
  const sourceWidth = fullImage.naturalWidth || Number(fullImage.getAttribute('width'));
  productRasterScale = Math.max(1, Math.min(initialScale, sourceWidth / (baseWidth * pixelRatio)));
  requiredWidth = materialSourceWidth(baseWidth * initialScale * MACRO.fraction, pixelRatio);
  const b = brand.getBoundingClientRect();
  logoX = width / 2 - (b.left + b.width / 2);
  logoY = headerHeight + available * .055 - (b.top + b.height / 2);
  logoScale = width <= 760 ? 1.95 : 2.45;
  header.classList.add('intro-header-active');
  lastProgress = -1; paint(); prepareSound();
 }
 function scheduleFit(force = false) {
  if(disposed)return;
  if (force) lastWidth = 0;
  if (!fitFrame) fitFrame = requestAnimationFrame(fit);
 }
 function finish() {
  if (!active) return;
  window.scrollTo({ top: start + distance, behavior: 'instant' });
  paint(); hero.focus({ preventScroll: true });
 }
 on(hero.querySelector('.intro-skip'),'click', finish);
 on(document.querySelector('.skip'),'click', event => { if (active) { event.preventDefault(); finish(); } });
 ['pointerdown', 'pointerup', 'touchend', 'keydown'].forEach(type =>
  on(window,type, prepareSound, { passive: true }));
 on(window,'scroll', schedulePaint, { passive: true });
 on(window,'resize', () => scheduleFit(), { passive: true });
 // Moving a window between displays can change DPR without a layout resize.
 function watchPixelRatio() {
  const density = matchMedia(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
  on(density, 'change', () => { watchPixelRatio(); scheduleFit(true); }, { once: true });
 }
 watchPixelRatio();
 on(preference,'change', () => { dance?.cancel(); stopSound(); scheduleFit(true); });
 on(document,'visibilitychange', () => { if (document.hidden) { stopSound(); context?.suspend().catch(() => {}); } });
 fit(); document.fonts.ready.then(() => scheduleFit(true));
 on(fullImage,'load', () => scheduleFit(true), { once: true });
 return ()=>{disposed=true;active=false;events.abort();cancelAnimationFrame(frame);cancelAnimationFrame(fitFrame);dance?.cancel();stopSound();releaseDetail();context?.close().catch(()=>{});};
}
