// Mobile keeps native touch scrolling. Desktop switches two composited image layers.
export function mountProductGallery(gallery, onSelect, preference, mobile = window.matchMedia('(max-width: 760px)')) {
  if (!gallery) return { goTo() {}, destroy() {} };
  const keys = ['one', 'atelier'];
  let current = 'one', frame = 0, width = gallery.clientWidth;
  const select = key => {
    if (key !== current) { current = key; onSelect(key); }
  };
  const announce = () => {
    frame = 0;
    if (!mobile.matches || !width) return;
    const index = Math.max(0, Math.min(1, Math.round(gallery.scrollLeft / width)));
    select(keys[index]);
  };
  const scroll = () => { if (mobile.matches && !frame) frame = requestAnimationFrame(announce); };
  const goTo = (key, animate = true) => {
    if (!keys.includes(key)) return;
    if (!mobile.matches) { select(key); return; }
    gallery.scrollTo({ left: keys.indexOf(key) * width, behavior: animate && !preference.matches ? 'smooth' : 'auto' });
    if (!animate || preference.matches) select(key);
  };
  const align = () => {
    width = gallery.clientWidth;
    gallery.scrollTo({ left: mobile.matches ? keys.indexOf(current) * width : 0, behavior: 'instant' });
  };
  gallery.addEventListener('scroll', scroll, { passive: true });
  mobile.addEventListener('change', align);
  const resize = new ResizeObserver(() => {
    if (gallery.clientWidth !== width) align();
  });
  resize.observe(gallery);
  // Decode both views before a visitor reaches the product switch.
  const warm = () => gallery.querySelectorAll('img').forEach(img => {
    img.loading = 'eager';
    img.decode?.().catch(() => {});
  });
  let preload;
  if ('IntersectionObserver' in window) {
    preload = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { warm(); preload.disconnect(); }
    }, { rootMargin: '600px 0px' });
    preload.observe(gallery);
  } else warm();
  return {
    goTo,
    destroy() {
      cancelAnimationFrame(frame);
      resize.disconnect();
      preload?.disconnect();
      gallery.removeEventListener('scroll', scroll);
      mobile.removeEventListener('change', align);
    },
  };
}
