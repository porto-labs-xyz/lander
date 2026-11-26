const coFounders = [
  {
    name: 'Richard Melkonian',
    portrait: 'richard-melkonian',
    role: 'Co-founder & CEO',
    bio: 'Company and engineering. Engineer and filmmaker with experience at Movement Labs and Polymarket.',
  },
  {
    name: 'Richard Osho',
    alias: 'Peter Xan',
    portrait: 'richard-osho',
    role: 'Co-founder & CMO',
    bio: 'Brand and marketing. Experience at TBWA / Media Arts Lab, BBH and M&C Saatchi.',
  },
]

// The site stores editorial pages as trusted HTML. Expand the same profiles
// into both pages at render time so the portraits are also in the static HTML.
export function founderPortraits(showBios) {
  return coFounders.map(({ name, alias, portrait, role, bio }) => `
    <figure class="founder-profile">
      <img src="/images/${portrait}-480.webp"
        srcset="/images/${portrait}-480.webp 480w, /images/${portrait}-960.webp 960w"
        sizes="(max-width: 600px) calc(100vw - 48px), (max-width: 960px) 46vw, 32vw"
        alt="" width="960" height="960" loading="lazy" decoding="async">
      <figcaption>
        <h3>${name}${alias ? ` <small>(${alias})</small>` : ''}</h3>
        <p class="meta">${role}</p>
        ${showBios ? `<p class="founder-bio">${bio}</p>` : ''}
      </figcaption>
    </figure>`).join('')
}
