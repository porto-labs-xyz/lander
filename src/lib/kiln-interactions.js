import { mountKilnMotion } from './kiln-motion.mjs';
import { mountProductGallery } from './kiln-gallery.mjs';
import { bindInterestForm } from './interest-form.mjs'

export function mountKiln(container) {
const cleanups = [];
let disposed = false;
function on(target, type, listener, options) {
  target.addEventListener(type, listener, options);
  cleanups.push(() => target.removeEventListener(type, listener, options));
}

const $ = (selector, root = container) => root.querySelector(selector);
const $$ = (selector, root = container) => [...root.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
// Product information uses one considered view per device.
const products = {
  one: {
    name: 'One.', tagline: ['Your studio.', 'Your compute.'],
    description: 'A compact home for your local AI models and private projects. Work from familiar laptops, with the computing kept in your studio.',
    price: '£17,000', priceNote: 'Target hardware price',
    caption: 'Kiln One / Inside the workstation', interest: 'Kiln One'
  },
  atelier: {
    name: 'Atelier.', tagline: ['More capacity.', 'Same control.'],
    description: 'Rack-ready local compute for demanding agency work. Expand your model collection and creative capacity, with the same studio-controlled access.',
    price: 'Let’s talk', priceNote: 'Pricing to be confirmed',
    caption: 'Kiln Atelier / Inside the workstation', interest: 'Kiln Atelier'
  }
};
function chooseProduct(key) {
  const product = products[key];
  if (!product || !$('#product-info') || $('#hardware').dataset.product === key) return;
  $('#hardware').dataset.product = key;
  $('#product-name').textContent = product.name;
  const tagline = $('#product-tagline');
  tagline.replaceChildren(document.createTextNode(product.tagline[0]), document.createElement('br'), document.createTextNode(product.tagline[1]));
  $('#product-description').textContent = product.description;
  $('#product-price').textContent = product.price;
  $('#price-note').textContent = product.priceNote;
  $$('.hardware-slide').forEach(slide => slide.setAttribute('aria-hidden', String(slide.dataset.slide !== key)));
  $$('[data-position]').forEach(dot => dot.classList.toggle('is-current', dot.dataset.position === key));
  $('#product-announcement').textContent = product.name + ' ' + product.tagline.join(' ');
  const caption = product.caption.split(' / ');
  const model = document.createElement('span');
  model.className = 'caption-model'; model.textContent = caption[0] + ' / ';
  const detail = document.createElement('span'); detail.textContent = caption[1];
  $('#hardware-caption').replaceChildren(model, detail);
  $('#interest-product').value = product.interest;
  $('#product-info').setAttribute('aria-labelledby', 'choose-' + key);
  $$('button[data-product]').forEach(button => {
    const selected = button.dataset.product === key;
    button.setAttribute('aria-selected', String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  invalidateLayout();
}
const productGallery = mountProductGallery($('.hardware-slides'), chooseProduct, reducedMotion);
cleanups.push(() => productGallery.destroy());
cleanups.push(mountKilnMotion(container));
$$('button[data-product]').forEach(button => on(button, 'click', () => productGallery.goTo(button.dataset.product)));

const thoughts = {
  brief: {quote: '“Here’s the brief. Here’s what matters.”', note: 'Start with the client’s brief and references in a private studio project.'},
  explore: {quote: '“Try three directions. Keep our character.”', note: 'Generate directions and storyboards with models running on your Kiln.'},
  decide: {quote: '“Keep this. Change that.”', note: 'Keep drafts, feedback and decisions together. Refine locally, round after round.'}
};
$$('[data-thought]').forEach(button => on(button, 'click', () => {
  const key = button.dataset.thought, thought = thoughts[key];
  $('#thought-quote').textContent = thought.quote;
  $('#thought-note').textContent = thought.note;
  $('#thought-panel').setAttribute('aria-labelledby', 'thought-' + key);
  $$('[data-thought]').forEach(tab => {
    const selected = tab === button;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
}));
$$('[role="tablist"]').forEach(list => on(list, 'keydown', event => {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const tabs = $$('[role="tab"]', list), current = tabs.indexOf(document.activeElement);
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
  tabs[next].click(); tabs[next].focus();
}));

const menu = $('.menu-toggle'), mobileMenu = $('#mobile-nav'), header = $('.site-header');
function closeMenu() {
  mobileMenu.hidden = true;
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Open menu');
  header.classList.remove('menu-is-open');
  invalidateLayout();
}
on(menu, 'click', () => {
  const open = mobileMenu.hidden;
  mobileMenu.hidden = !open;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  header.classList.toggle('menu-is-open', open);
  if (open) { header.dataset.tone = 'ink'; header.style.setProperty('--header-bg', 'rgba(241,240,237,.98)'); header.style.setProperty('--square-accent', 'var(--red)'); header.classList.add('is-scrolled'); }
  else invalidateLayout();
});
$$('a,button', mobileMenu).forEach(item => on(item, 'click', closeMenu));
on(document, 'keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menu.focus(); } });

const dialogs = $$('dialog');
function openDialog(id) {
  closeMenu();
  const dialog = $(id);
  if (!dialog || dialog.open) return;
  if (id === '#interest-dialog') $('#form-status').hidden = true;
  document.body.classList.add('modal-open');
  dialog.showModal();
  if (id === '#specs-dialog') $('.comparison-scroll', dialog).scrollTop = 0;
}
for (const [selector, id] of [['.interest-open', '#interest-dialog'], ['.privacy-open', '#privacy-dialog'], ['.questions-open', '#questions-dialog'], ['.specs-open', '#specs-dialog']]) {
  $$(selector).forEach(button => on(button, 'click', () => {
    if (button.dataset.interest) $('#interest-product').value = button.dataset.interest;
    openDialog(id);
  }));
}
dialogs.forEach(dialog => {
  $$('.dialog-close,.dialog-done', dialog).forEach(button => on(button, 'click', () => dialog.close()));
  on(dialog, 'close', () => {
    if (!dialogs.some(item => item.open)) document.body.classList.remove('modal-open');
  });
  on(dialog, 'click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
});
cleanups.push(bindInterestForm($('#interest-form')));
if (container.dataset.page === 'about') $('#interest-product').value = 'The Kiln system';

// One mobile action follows the section; the page never takes over scrolling.
const dock = $('#mobile-action'), dockLabel = $('.dock-label', dock);
const sections = $$('section[data-tone],footer[data-tone]');
let frame = 0, dockTheme = '', dockAction = '', layoutDirty = true, ranges = [], headerHeight = 0, headerTheme = '';
function measureLayout() {
  const offset = window.scrollY;
  ranges = sections.map(node => {
    const rect = node.getBoundingClientRect();
    return {node, top:rect.top + offset, bottom:rect.bottom + offset};
  });
  headerHeight = header.offsetHeight;
  layoutDirty = false;
}
function updateFrame() {
  frame = 0;
  if (layoutDirty) measureLayout();
  const offset = window.scrollY, headerLine = offset + headerHeight + 1, contextLine = offset + window.innerHeight * .56;
  if (mobileMenu.hidden) {
    const section = (ranges.find(item => item.top <= headerLine && item.bottom > headerLine) || ranges[0])?.node;
    if (section) {
      const theme = [section.id, section.dataset.tone, section.dataset.product].join(':');
      if (theme !== headerTheme) {
        // Read the settled colour token, never an intermediate animated background.
        const style = getComputedStyle(section);
        const color = style.getPropertyValue('--field-color').trim() || style.backgroundColor;
        header.dataset.tone = section.dataset.tone;
        header.style.setProperty('--header-bg', color);
        header.style.setProperty('--square-accent', style.getPropertyValue('--square-accent').trim());
        headerTheme = theme;
      }
    }
    header.classList.toggle('is-scrolled', offset > 40);
  }
  const context = ranges.find(item => item.node.dataset.mobileCta && item.top <= contextLine && item.bottom > contextLine)?.node;
  const nextDockTheme = context ? [context.id, context.dataset.product].join(':') : 'default';
  if (nextDockTheme !== dockTheme) {
    dock.style.setProperty('--square-accent', context ? getComputedStyle(context).getPropertyValue('--square-accent').trim() : 'var(--blue)');
    dockTheme = nextDockTheme;
  }
  const label = context ? context.dataset.mobileCta : 'Register interest';
  const action = context ? context.dataset.mobileAction : 'interest';
  if (dockLabel.textContent !== label) dockLabel.textContent = label;
  if (action !== dockAction) {
    dockAction = action;
    if (action === 'interest') dock.setAttribute('aria-haspopup', 'dialog');
    else dock.removeAttribute('aria-haspopup');
  }
}
function scheduleFrame() { if (!disposed && !frame) frame = requestAnimationFrame(updateFrame); }
function invalidateLayout() { layoutDirty = true; headerTheme = ''; scheduleFrame(); }
on(window, 'scroll', scheduleFrame, {passive:true});
on(window, 'resize', () => { if (window.innerWidth > 760 && !mobileMenu.hidden) closeMenu(); invalidateLayout(); });
on(window, 'pageshow', invalidateLayout);
if ('ResizeObserver' in window) {
  const layoutObserver = new ResizeObserver(invalidateLayout);
  cleanups.push(() => layoutObserver.disconnect());
  sections.forEach(section => layoutObserver.observe(section));
}
document.fonts?.ready.then(invalidateLayout);
on(dock, 'click', () => {
  if (dockAction === 'hardware') {
    const hardware = $('#hardware');
    if (hardware) { hardware.scrollIntoView({behavior: scrollBehavior(), block: 'start'}); $('#choose-one').focus({preventScroll: true}); }
    else window.location.href = '/#hardware';
  } else openDialog('#interest-dialog');
});

on(reducedMotion, 'change', scheduleFrame);
updateFrame();

return () => {
  disposed = true;
  cleanups.forEach(cleanup => cleanup());
  cancelAnimationFrame(frame);
  document.body.classList.remove('modal-open');
};
}
