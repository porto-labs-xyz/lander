// Native CSS timelines handle scroll photography. This observer only introduces
// chapter content once, so there is no JavaScript animation loop while scrolling.
export function mountKilnMotion(root) {
  const host = root === document ? document.documentElement : root;
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  const nodes = [...root.querySelectorAll('.boot-figure,.crucible,.studio-mark,.about-seal,.name-mark img,.reveal')];
  let observer;
  let disposed = false;
  const pendingLoads = new Map();
  const play = node => {
    if (!disposed && !preference.matches) node.classList.add('motion-entered');
    observer?.unobserve(node);
  };
  nodes.forEach(node => {
    node.classList.add(node.matches('.reveal') ? 'motion-copy' : node.matches('.boot-figure') ? 'motion-product' : 'motion-mark');
  });
  const clearLoads = () => {
    pendingLoads.forEach((loaded, img) => img.removeEventListener('load', loaded));
    pendingLoads.clear();
  };
  const pause = () => host.toggleAttribute('data-motion-paused', document.hidden);
  const configure = () => {
    observer?.disconnect();
    clearLoads();
    if (preference.matches || !('IntersectionObserver' in window)) {
      nodes.forEach(node => node.classList.remove('motion-entered'));
      return;
    }
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (disposed || !entry.isIntersecting) return;
        const node = entry.target;
        const img = node.matches('.motion-copy') ? null : node.matches('img') ? node : node.querySelector('img');
        if (img && !img.complete) {
          const loaded = () => { pendingLoads.delete(img); play(node); };
          img.addEventListener('load', loaded, { once: true });
          pendingLoads.set(img, loaded);
          observer.unobserve(node);
        } else play(node);
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    nodes.filter(node => !node.classList.contains('motion-entered')).forEach(node => observer.observe(node));
  };
  preference.addEventListener('change', configure);
  document.addEventListener('visibilitychange', pause);
  configure();
  pause();
  return () => {
    disposed = true;
    observer?.disconnect();
    clearLoads();
    preference.removeEventListener('change', configure);
    document.removeEventListener('visibilitychange', pause);
    host.removeAttribute('data-motion-paused');
    nodes.forEach(node => node.classList.remove('motion-entered', 'motion-product', 'motion-mark', 'motion-copy'));
  };
}
