// Native horizontal scrolling keeps touch momentum, pinch zoom and vertical page scrolling.
export function mountProductGallery(gallery, onSelect, preference) {
  if (!gallery) return { goTo() {}, destroy() {} };
  const keys = ['one', 'atelier'];
  let current = 'one', timer, width = gallery.clientWidth;
  const announce = () => {
    clearTimeout(timer);
    if (!gallery.clientWidth) return;
    const index = Math.max(0, Math.min(1, Math.round(gallery.scrollLeft / gallery.clientWidth)));
    const next = keys[index];
    if (next !== current) { current = next; onSelect(next); }
  };
  const scroll = () => { clearTimeout(timer); timer = setTimeout(announce, 140); };
  const goTo = (key, animate = true) => {
    if (!keys.includes(key)) return;
    current = key;
    gallery.scrollTo({ left: keys.indexOf(key) * gallery.clientWidth, behavior: animate && !preference.matches ? 'smooth' : 'auto' });
  };
  gallery.addEventListener('scroll', scroll, { passive: true });
  gallery.addEventListener('scrollend', announce);
  const resize = new ResizeObserver(() => {
    if (gallery.clientWidth !== width) { width = gallery.clientWidth; goTo(current, false); }
  });
  resize.observe(gallery);
  return {
    goTo,
    destroy() {
      clearTimeout(timer);
      resize.disconnect();
      gallery.removeEventListener('scroll', scroll);
      gallery.removeEventListener('scrollend', announce);
    },
  };
}
