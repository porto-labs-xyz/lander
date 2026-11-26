const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
const FOCUS = { x: .60, y: .135 };
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
 const fullImage = device.querySelector('img');
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
 let frame = 0, fitFrame = 0, start = 0, distance = 1;
 let ax = 0, ay = 0, targetX = 0, targetY = 0, logoX = 0, logoY = 0, logoScale = 1;
 let active = false, arrived = false, armed = false, zooming;
 let dance;
 let imageX = 0, imageY = 0, imageWidth = 0;
 let lastWidth = 0, lastHeight = 0, lastProgress = -1;

 function animateSpark() {
  if (document.hidden || preference.matches || !spark) return;
  dance?.cancel();
  dance = spark.animate(DANCE, { duration: 1000, easing: 'cubic-bezier(.35,0,.3,1)' });
 }
 function resetImage() {
  fullImage.style.width = ''; fullImage.style.transform = '';
  fullImage.style.willChange = ''; zooming = false;
 }
 function paint() {
  frame = 0;
  if (!active) return;
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
  const scale = Math.exp(Math.log(initialScale) * (1 - move));
  const focusX = targetX * (1 - move) + ax * move;
  const focusY = targetY * (1 - move) + ay * move;
  if (scale > 1) {
   if (!zooming) {
    fullImage.style.width = imageWidth * initialScale + 'px';
    fullImage.style.willChange = 'transform';
    zooming = true;
   }
   const x = focusX + (imageX - ax) * scale - imageX;
   const y = focusY + (imageY - ay) * scale - imageY;
   fullImage.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale / initialScale})`;
  } else if (zooming) {
   resetImage();
  }
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
   if (armed) animateSpark();
  }
 }
 const schedulePaint = () => { if (active && !frame) frame = requestAnimationFrame(paint); };
 function fit() {
  fitFrame = 0;
  if(disposed)return;
  const width = window.innerWidth, height = window.innerHeight;
  // Mobile browser chrome can resize during a swipe. Keep its runway stable.
  if (active && width === lastWidth && Math.abs(height - lastHeight) < 120) { schedulePaint(); return; }
  lastWidth = width; lastHeight = height;
  runway.classList.remove('intro-active'); active = false;
  header.classList.remove('intro-header-active');
  resetImage();
  [device, title, bottom, caption, brand, ...controls].forEach(el => { el.style.transform = ''; el.style.opacity = ''; el.style.visibility = ''; });
  header.style.removeProperty('--intro-header-line');
  bottom.inert = false;
  controls.forEach(control => { control.inert = false; });
  if (preference.matches || document.body.classList.contains('review-mode')) return;
  const headerHeight = header.offsetHeight;
  const dockHeight = !dock || getComputedStyle(dock).display === 'none' ? 0 : dock.offsetHeight;
  const available = height - headerHeight - dockHeight;
  // At very small landscape heights leave all content accessible in normal flow.
  if (available < 370) return;
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
   runway.classList.remove('intro-active'); return;
  }
  active = true;
  start = runway.getBoundingClientRect().top + window.scrollY - headerHeight;
  const r = device.getBoundingClientRect();
  const crop = fullImage.getBoundingClientRect();
  imageX = crop.left - h.left; imageY = crop.top - h.top; imageWidth = crop.width;
  // Follow the leather attachment and the front shoulder into the headline frame.
  ax = r.left - h.left + r.width * FOCUS.x;
  ay = r.top - h.top + r.height * FOCUS.y;
  targetX = h.width * (width <= 760 ? .72 : .56);
  targetY = h.height * (width <= 760 ? .40 : .55);
  const b = brand.getBoundingClientRect();
  logoX = width / 2 - (b.left + b.width / 2);
  logoY = headerHeight + available * .055 - (b.top + b.height / 2);
  logoScale = width <= 760 ? 1.95 : 2.45;
  header.classList.add('intro-header-active');
  lastProgress = -1; paint();
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
 on(window,'scroll', schedulePaint, { passive: true });
 on(window,'resize', () => scheduleFit(), { passive: true });
 on(preference,'change', () => { dance?.cancel(); scheduleFit(true); });
 fit(); document.fonts.ready.then(() => scheduleFit(true));
 return ()=>{disposed=true;active=false;events.abort();cancelAnimationFrame(frame);cancelAnimationFrame(fitFrame);dance?.cancel();resetImage();};
}
