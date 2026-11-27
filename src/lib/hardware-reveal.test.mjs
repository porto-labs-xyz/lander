import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { mountHardwareReveal } from './hardware-reveal.mjs'
import { deviceSourceWidth } from './finish-images.mjs'
import { withFinishViewer } from '../content/finish-viewer.mjs'

const finishOrder = ['charcoal', 'pebble-grey', 'baby-pink', 'eucalyptus', 'powder-blue']

function renderPage(name) {
  const { body, path } = JSON.parse(readFileSync(new URL(`../content/${name}.json`, import.meta.url)))
  return withFinishViewer(body, path)
}

function sectionsOf(page) {
  return [...page.matchAll(/<section\b[^>]*>[\s\S]*?<\/section>/g)].map(match => match[0])
}

test('the finish gallery chooses a detail source for the projected size and screen density', () => {
  assert.equal(deviceSourceWidth(550, 2), 1600)
  assert.equal(deviceSourceWidth(941, 3), 3200)
  assert.equal(deviceSourceWidth(1920, 2), 6400)
  assert.equal(deviceSourceWidth(2022, 2), 6400)
  assert.equal(deviceSourceWidth(2592, 3), 6400)
})

test('the software opening keeps the pilot ahead of hardware and labels the prototype', () => {
  const body = renderPage('index')
  const hero = sectionsOf(body)[0]
  assert.match(hero, /One place to make an ad/)
  assert.match(hero, /No Kiln hardware required/)
  assert.match(hero, /Prototype visual/)
  assert.doesNotMatch(hero, /finishes\/|hero-device/)
  assert.ok(body.indexOf('Request a pilot') < body.indexOf('id="hardware"'))
})

test('the original charcoal front with its dark grille is preserved at every published size', () => {
  const originals = {
    'charcoal-3840.webp': '8c1feb9e299a4d605ed557523c226b17f8c8faa513d9204e656e024281c0f232',
    'charcoal-960.webp': '95b8beee02ed9c644487d5cb3da5b1da46280349070e0248945170850b7291c0',
    'charcoal-device-1600.webp': 'c962d70ced9c6b4f63b08f5bdb2459ed3c4d291c3884c197d7706a04a264e409',
    'charcoal-device-3200.webp': 'ce0a9d4d66ca22d552bab778aa3a761f5a749ca4bfc58481d684183127b9629a',
    'charcoal-device-6400.webp': '9b0b7d6ebfcda3c0b2722e3174d33b3098509ed6e2e6579df84dd4860da13ac9',
    'charcoal-device-800.webp': '5784c17663735cabde6615f6fc26d6bb1c0bab5adea7c31980fc7ff874d24dcc',
  }
  for (const [name, hash] of Object.entries(originals)) {
    const file = new URL('../../static/assets/kiln/finishes/' + name, import.meta.url)
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), hash, name)
  }
})

test('the static gallery exposes all five full-resolution images and starts with one preview', () => {
  const body = renderPage('one')
  const finishes = [...body.matchAll(/data-finish-slide="([^"]+)"( hidden)?>/g)]
  assert.deepEqual(finishes.map(match => match[1]), finishOrder)
  assert.deepEqual(finishes.map(match => Boolean(match[2])), [false, true, true, true, true])
  const swatches = [...body.matchAll(/data-finish="([^"]+)"[^>]*>/g)]
  assert.deepEqual(swatches.map(match => match[1]), finishOrder)
  assert.deepEqual(swatches.filter(match => match[0].includes('aria-current="true"')).map(match => match[1]), ['charcoal'])
  assert.equal((body.match(/class="finish-lens" aria-hidden="true"/g) || []).length, 1)
  assert.ok(body.includes('data-finish-name>Deep charcoal</span>'))
  assert.ok(body.includes('<h2 class="finish-title" id="finishes-title">Five finishes.</h2>'))
  assert.ok(!body.includes('Choose your<br>capacity.'))
  for (const [, name] of finishes) {
    assert.ok(body.includes('href="/assets/kiln/finishes/' + name + '-device-6400.webp"'))
    assert.ok(body.includes('src="/assets/kiln/finishes/' + name + '-device-800.webp"'))
  }
})

test('the Kiln One product page shows the colour gallery immediately before the hardware renders', () => {
  const sections = sectionsOf(renderPage('one'))
  const gallery = sections.findIndex(section => section.includes('data-finish-gallery'))
  assert.notEqual(gallery, -1)
  assert.deepEqual([...sections[gallery].matchAll(/data-finish="([^"]+)"/g)].map(match => match[1]), finishOrder)
  assert.match(sections[gallery], /data-finish-slide="charcoal">/)
  assert.ok(sections[gallery + 1].includes('id="inside-one"'))
  assert.ok(sections[gallery + 1].includes('one-interior-charcoal-cutout.webp'))
  assert.ok(sections[gallery + 2].includes('id="kiln-rear"'))
  const rear = sections[gallery + 2]
  assert.match(rear, /<a href="\/assets\/kiln\/finishes\/rear-charcoal.webp"/)
  assert.match(rear, /<img src="\/assets\/kiln\/finishes\/rear-charcoal.webp"/)
  const choices = [...rear.matchAll(/<button[^>]+data-rear-finish="([^"]+)"[^>]+>/g)]
  assert.deepEqual(choices.map(choice => choice[1]), finishOrder)
  assert.deepEqual(choices.filter(choice => choice[0].includes('aria-pressed="true"')).map(choice => choice[1]), ['charcoal'])
  assert.ok(rear.includes('Kiln Rear as a front panel, for fast switching, aesthetic stays.'))
  assert.ok(sections[gallery + 3].includes('id="configurations-title"'))
})

test('the homepage keeps a single hardware teaser while One preserves both engineering sections', () => {
  const home = sectionsOf(renderPage('index'))
  const product = sectionsOf(renderPage('one'))
  const teaser = home.find(section => section.includes('id="hardware"'))
  assert.match(teaser, /href="\/products\/one\/"/)
  assert.doesNotMatch(teaser, /data-finish-gallery|£/)
  for (const id of ['inside-one', 'kiln-rear']) {
    assert.equal(home.filter(section => section.includes(`id="${id}"`)).length, 0)
    assert.equal(product.filter(section => section.includes(`id="${id}"`)).length, 1)
  }
})

function mountGallery(withRear = false, initialFront = withRear ? 0 : 2) {
  class Element extends EventTarget {
    attributes = new Map()
    style = {
      setProperty(name, value) { this[name] = value },
      removeProperty(name) { delete this[name] },
    }
    setAttribute(name, value) { this.attributes.set(name, value) }
    removeAttribute(name) { this.attributes.delete(name) }
    getAttribute(name) { return this.attributes.get(name) }
    hasAttribute(name) { return this.attributes.has(name) }
    toggleAttribute(name, enabled) {
      if (enabled) this.setAttribute(name, '')
      else this.removeAttribute(name)
    }
  }
  class Observer { observe() {} disconnect() {} }
  const view = Object.assign(new EventTarget(), {
    devicePixelRatio: 2,
    matchMedia: () => Object.assign(new EventTarget(), { matches: true }),
    ResizeObserver: Observer, IntersectionObserver: Observer,
  })
  const pending = []
  view.Image = class {
    decode() { return new Promise(resolve => pending.push(resolve)) }
  }
  const photo = new Element(), button = new Element(), caption = new Element()
  const lens = Object.assign(new Element(), { offsetWidth: 160, offsetHeight: 160 })
  photo.setPointerCapture = id => { photo.capturedPointer = id }
  photo.hasPointerCapture = id => photo.capturedPointer === id
  photo.getBoundingClientRect = () => ({ left: 10, top: 20, width: 600, height: 450 })
  const swatches = finishOrder.map((name, i) => {
    const swatch = new Element()
    swatch.setAttribute('aria-label', name)
    if (i === initialFront) swatch.setAttribute('aria-current', 'true')
    return swatch
  })
  const slides = finishOrder.map((name, i) => {
    const img = Object.assign(new Element(), {
      dataset: { render: name }, currentSrc: name + '-800.webp', complete: true, naturalWidth: 800, offsetWidth: 400,
      getBoundingClientRect: () => ({ left: 150, top: 48, width: 400, height: 360 }),
    })
    return { hidden: i !== initialFront, querySelector: () => img }
  })
  const gallery = {
    ownerDocument: { defaultView: view },
    querySelector: key => ({ '.finish-window': photo, '.finish-lens': lens, '.finish-zoom': button, '[data-finish-name]': caption })[key],
    querySelectorAll: key => key === '[data-finish]' ? swatches : slides,
  }
  const rearSwatches = finishOrder.map(name => Object.assign(new Element(), {
    dataset: { src: `rear-${name}.webp`, alt: `Rear view in ${name}` },
  }))
  rearSwatches.forEach((swatch, i) => swatch.setAttribute('aria-pressed', String(i === 0)))
  const rearImage = new Element(), rearName = new Element(), rearControls = new Element()
  const rearLink = Object.assign(new Element(), { querySelector: () => rearImage })
  const rear = {
    querySelector: key => ({ a: rearLink, '[data-rear-finish-name]': rearName, '.rear-finish-controls': rearControls })[key],
    querySelectorAll: () => rearSwatches,
  }
  const cleanup = mountHardwareReveal({
    querySelector: key => key === '[data-finish-gallery]' ? gallery : withRear ? rear : null,
  })
  const pointer = (type, pointerType = 'mouse') => photo.dispatchEvent(Object.assign(new Event(type), {
    pointerType, clientX: 310, clientY: 245,
  }))
  const lensVisible = () => photo.hasAttribute('data-lens-visible')
  function load(index) {
    const image = slides[index].querySelector()
    image.currentSrc = image.src
    image.naturalWidth = 3200
    image.dispatchEvent(new Event('load'))
  }
  return { view, photo, lens, button, caption, swatches, slides, pending, pointer, lensVisible, load, cleanup,
    rearSwatches, rearLink, rearImage, rearName, rearControls }
}

test('front and rear swatches select the same finish, update full-size artwork and dismiss the lens', () => {
  const g = mountGallery(true)
  assert.equal(g.rearControls.hidden, false)
  function assertSelection(index) {
    const finish = finishOrder[index]
    assert.equal(g.caption.textContent, finish)
    assert.equal(g.rearName.textContent, finish)
    assert.equal(g.rearLink.href, `rear-${finish}.webp`)
    assert.equal(g.rearImage.src, g.rearLink.href)
    assert.equal(g.rearImage.alt, `Rear view in ${finish}`)
    assert.deepEqual(g.rearSwatches.map(s => s.getAttribute('aria-pressed') === 'true'), finishOrder.map((_, i) => i === index))
    assert.deepEqual(g.swatches.map(s => s.getAttribute('aria-current') === 'true'), finishOrder.map((_, i) => i === index))
    assert.deepEqual(g.slides.map(s => !s.hidden), finishOrder.map((_, i) => i === index))
  }
  for (const controls of [g.rearSwatches, g.swatches]) {
    controls.forEach((swatch, index) => {
      g.button.dispatchEvent(new Event('click'))
      swatch.dispatchEvent(new Event('click'))
      assertSelection(index)
      assert.equal(g.button.getAttribute('aria-pressed'), 'false')
    })
  }
  g.cleanup()
  g.rearSwatches[0].dispatchEvent(new Event('click'))
  assertSelection(4)
})

test('the first homepage selection synchronizes the baby pink front and charcoal rear from either picker', () => {
  for (const control of ['swatches', 'rearSwatches']) {
    for (const index of [0, 2, 3]) {
      const g = mountGallery(true, 2)
      g[control][index].dispatchEvent(new Event('click'))
      const selected = finishOrder.map((_, i) => i === index)
      assert.deepEqual(g.swatches.map(swatch => swatch.hasAttribute('aria-current')), selected)
      assert.deepEqual(g.rearSwatches.map(swatch => swatch.getAttribute('aria-pressed') === 'true'), selected)
      assert.deepEqual(g.slides.map(slide => !slide.hidden), selected)
      assert.equal(g.rearLink.href, `rear-${finishOrder[index]}.webp`)
      g.cleanup()
    }
  }
})

test('the circular lens samples the material at the pointer at 4× and dismisses on leave or Escape', async () => {
  const g = mountGallery()
  g.pointer('pointerenter')
  assert.equal(g.pending.length, 0)
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), false)
  g.pending.shift()()
  await Promise.resolve()
  assert.equal(g.slides[2].querySelector().src, 'baby-pink-3200.webp')
  g.load(2)
  assert.equal(g.lensVisible(), true)
  assert.equal(g.lens.style.backgroundImage, 'url("baby-pink-3200.webp")')
  assert.equal(g.lens.style.transform, 'translate3d(220px,145px,0)')
  assert.equal(g.lens.style.backgroundSize, '1600px 1440px')
  assert.equal(g.lens.style.backgroundPosition, '-560px -708px')
  g.view.dispatchEvent(Object.assign(new Event('keydown'), { key: 'Escape' }))
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), false)
  g.pointer('pointerleave')
  g.pointer('pointermove')
  assert.equal(g.lensVisible(), true)
  g.pointer('click')
  assert.equal(g.lensVisible(), true)
  g.pointer('pointerleave')
  assert.equal(g.lensVisible(), false)
  g.cleanup()
})

test('swatches open wide, late loads stay hidden, and the lens follows the selected finish', async () => {
  const g = mountGallery()
  for (let i = 0; i < finishOrder.length; i++) {
    g.swatches[i].dispatchEvent(new Event('click'))
    assert.equal(g.caption.textContent, finishOrder[i])
    assert.deepEqual(g.slides.map(slide => !slide.hidden), finishOrder.map((_, j) => j === i))
    g.pointer('pointermove', 'touch')
    assert.equal(g.lensVisible(), false)
    g.button.dispatchEvent(new Event('click'))
    assert.equal(g.button.getAttribute('aria-pressed'), 'true')
    g.button.dispatchEvent(new Event('click'))
    g.pending.shift()()
    await Promise.resolve()
    g.load(i)
    assert.equal(g.lensVisible(), false)
    g.button.dispatchEvent(new Event('click'))
    assert.equal(g.lensVisible(), true)
    assert.equal(g.lens.style.backgroundImage, 'url("' + finishOrder[i] + '-3200.webp")')
  }
  g.cleanup()
  g.swatches[0].dispatchEvent(new Event('click'))
  assert.equal(g.caption.textContent, 'powder-blue')
})


test('a first touch magnifies the preview, tracks the finger and sharpens in place', async () => {
  const g = mountGallery()
  g.photo.dispatchEvent(Object.assign(new Event('pointerdown'), {
    pointerType: 'touch', pointerId: 4, clientX: 310, clientY: 245,
  }))
  assert.equal(g.lensVisible(), true)
  assert.equal(g.lens.style.backgroundImage, 'url("baby-pink-800.webp")')
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), false)
  assert.equal(g.button.getAttribute('aria-pressed'), 'true')
  const before = g.lens.style.backgroundPosition
  g.photo.dispatchEvent(Object.assign(new Event('pointermove'), {
    pointerType: 'touch', pointerId: 4, clientX: 400, clientY: 300,
  }))
  assert.notEqual(g.lens.style.backgroundPosition, before)
  const position = g.lens.style.backgroundPosition
  g.pending.shift()()
  await Promise.resolve()
  g.load(2)
  assert.equal(g.lens.style.backgroundImage, 'url("baby-pink-3200.webp")')
  assert.equal(g.lens.style.backgroundPosition, position)
  g.photo.dispatchEvent(Object.assign(new Event('pointerup'), {
    pointerType: 'touch', pointerId: 4, clientX: 400, clientY: 300,
  }))
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), false)
  assert.equal(g.lensVisible(), false)
  g.cleanup()
})

test('a vertical scroll can cancel the initial touch without leaving the gallery in zoom mode', () => {
  const g = mountGallery()
  g.pointer('pointerdown', 'touch')
  assert.equal(g.lensVisible(), true)
  g.pointer('pointercancel', 'touch')
  assert.equal(g.lensVisible(), false)
  assert.equal(g.button.getAttribute('aria-pressed'), 'false')
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), false)
  g.cleanup()
})


test('Safari touch taps open the lens even when the compatibility click reports mouse', () => {
  const g = mountGallery()
  g.pointer('pointerdown', 'touch')
  g.pointer('pointerup', 'touch')
  g.pointer('click', 'mouse')
  assert.equal(g.lensVisible(), true)
  assert.equal(g.photo.hasAttribute('data-touch-magnifier'), true)
  g.button.dispatchEvent(new Event('click'))
  assert.equal(g.lensVisible(), false)
  g.cleanup()
})
