const finishes = [
  { id: 'charcoal', name: 'Deep charcoal', colour: '#3d3b38' },
  { id: 'pebble-grey', name: 'Pebble grey', colour: '#a79e91' },
  { id: 'baby-pink', name: 'Baby pink', colour: '#e5b4bd' },
  { id: 'eucalyptus', name: 'Eucalyptus', colour: '#a6ba9e' },
  { id: 'powder-blue', name: 'Powder blue', colour: '#a7c2d5' },
]
const initialFinish = finishes.find(finish => finish.id === 'baby-pink')
const asset = id => `/assets/kiln/finishes/${id}-device`

const slides = finishes.map(finish => `
  <div class="finish-slide" data-finish-slide="${finish.id}"${finish === initialFinish ? '' : ' hidden'}>
    <img src="${asset(finish.id)}-800.webp" data-render="${asset(finish.id)}" width="800" height="960" alt="Kiln One in ${finish.name.toLowerCase()}, with a brown leather handle and a vented front panel." decoding="async" loading="lazy">
  </div>`).join('')

const swatches = finishes.map(finish => `
  <a class="finish-swatch" data-finish="${finish.id}" style="--swatch:${finish.colour}" href="${asset(finish.id)}-6400.webp" aria-label="${finish.name}" title="${finish.name}"${finish === initialFinish ? ' aria-current="true"' : ''}>
    <span aria-hidden="true"></span>
  </a>`).join('')

const viewer = `<figure class="finish-viewer" aria-label="Kiln One finish gallery">
  <div class="finish-window">${slides}<span class="finish-lens" aria-hidden="true"></span></div>
  <figcaption class="finish-controls">
    <div class="finish-caption"><span>Kiln One</span><span data-finish-name>${initialFinish.name}</span></div>
    <div class="finish-swatches" role="group" aria-label="Choose a finish">${swatches}</div>
    <button type="button" class="finish-zoom" aria-label="Show 4× magnifier" aria-pressed="false" hidden>4×</button>
  </figcaption>
</figure>`

export function withFinishViewer(body) {
  return body.replace('<!-- finish viewer -->', viewer)
}
