import React, { useState } from 'react'

const mission = 'We help artists and record labels earn more from streaming by letting them own the network that delivers their music, so they earn from distribution, not just plays.'
const contact = 'mailto:richard@melkonian.xyz'

function OwnershipDiagram() {
  return (
    <figure className="ownership-figure">
      <svg viewBox="0 0 560 350" role="img" aria-labelledby="ownership-title ownership-description">
        <title id="ownership-title">One party. Two revenue lines.</title>
        <desc id="ownership-description">Artist and distributor overlap at Porto. Artists can earn as rights holders and as network operators.</desc>
        <defs>
          <pattern id="ownership-hatch" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
            <line x1="0" y1="0" x2="0" y2="12" stroke="#c1b49b" strokeWidth="1" opacity=".45" />
          </pattern>
        </defs>
        <circle cx="215" cy="168" r="142" fill="#bf53452b" stroke="#ee6251" strokeWidth="2" />
        <circle cx="345" cy="168" r="142" fill="#d7c6a91a" stroke="#d7c6a9" strokeWidth="2" />
        <circle cx="215" cy="168" r="142" fill="url(#ownership-hatch)" />
        <circle cx="345" cy="168" r="142" fill="url(#ownership-hatch)" />
        <text x="162" y="158">ARTIST</text>
        <text x="397" y="158">DISTRIBUTOR</text>
        <text x="280" y="206" className="venn-centre">PORTO</text>
      </svg>
      <figcaption>One party. Two revenue lines.</figcaption>
    </figure>
  )
}

const IndexPage = () => {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return
    setStatus('sending')
    try {
      const response = await fetch('https://formspree.io/f/xjgepgbg', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!response.ok) throw new Error('Submission failed')
      setEmail('')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Porto home"><img className="brand-mark" src="/images/porto-mark-handdrawn.webp" width="64" height="64" alt="Porto" /></a>
        <nav aria-label="Main navigation">
          <a href="#how">The network</a>
          <a href="#litepaper">Litepaper</a>
          <a href="https://docs.portolabs.xyz/" target="_blank" rel="noopener noreferrer">Docs</a>
          <a href="#team">Team</a>
          <a className="nav-join" href="#join">Join Porto <span aria-hidden="true">↗</span></a>
        </nav>
      </header>

      <main id="main">
        <section className="hero section" id="home">
          <img className="scene hero-scene" src="/images/deck/arch-right.webp" alt="" fetchPriority="high" />
          <img className="hero-brand-mark" src="/images/porto-mark-handdrawn.webp" width="240" height="240" alt="" aria-hidden="true" />
          <div className="hero-content">
            <p className="eyebrow">Streaming infrastructure for artists and labels</p>
            <h1>Spotify takes 30%.<br /><span className="accent">You get pennies.</span></h1>
            <p className="hero-description">{mission}</p>
            <div className="actions">
              <a className="button button-primary" href="#join">Join the network <span aria-hidden="true">↗</span></a>
              <a className="text-link" href="#how">Explore the model <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-footer">
            <span>Independent music. Shared infrastructure.</span>
            <a href="https://altalab.ai" target="_blank" rel="noopener noreferrer">AltaLab <span className="muted">/ Autumn 2026 cohort</span> <span aria-hidden="true">↗</span></a>
          </div>
        </section>

        <section className="section moat-section" id="how">
          <img className="scene pillar-scene" src="/images/deck/pillar-centre.webp" alt="" loading="lazy" />
          <p className="eyebrow">01 / The inherited moat</p>
          <h2>Spotify’s USP isn’t playlists or UI.<br /><span className="moat-infrastructure"> It’s infrastructure.</span></h2>
          <div className="moat-layout">
            <div className="section-copy">
              <p>Platforms own the infrastructure that delivers music. Artists and labels bring the music and the audience, but do not share in the value of distribution.</p>
              <p>The assumption is that building this infrastructure is a massive undertaking. With AI-powered development and cheap access to extremely fast cloud computing, it no longer has to be.</p>
              <p className="bright moat-proof">Their custom CDN. We’ve rebuilt it. It works, and it’s performant.</p>
              <p className="accent closing-line">No more moats where none are needed.</p>
            </div>
            <OwnershipDiagram />
          </div>
        </section>

        <section className="section network-section" aria-labelledby="network-heading">
          <div className="section-topline"><p className="eyebrow">02 / The network</p><span className="small-note">London first</span></div>
          <h2 id="network-heading">Rebuild the delivery layer.<br /> Share the ownership.</h2>
          <div className="three-grid">
            <article className="panel step"><span className="step-number">01</span><h3>Run the network</h3><p>Artists, labels and operators run the nodes that cache and stream the catalogue. The people making the music can also deliver it.</p></article>
            <article className="panel step"><span className="step-number">02</span><h3>Account for every play</h3><p>Valid plays feed an auditable record. Listener revenue is allocated to the music each listener actually streams.</p></article>
            <article className="panel step"><span className="step-number">03</span><h3>Split the revenue</h3><p>Rights holders, network operators and the protocol receive their share automatically at settlement. Beta is designed around daily settlement.</p></article>
          </div>
          <p className="section-anchor">They’re not tenants anymore. <span>They’re landlords.</span></p>
        </section>

        <section className="section product-section" id="product">
          <div className="product-layout">
            <div>
              <p className="eyebrow">03 / The listening app</p>
              <h2>Familiar on the surface.<br /> Different at the foundations.</h2>
              <p className="section-intro">Porto’s product direction starts with a listening app. A familiar way to discover and play music, with the network and its economics made visible.</p>
              <div className="product-features">
                <div><span>01</span><h3>See the route</h3><p>The player is designed to show which node served the track.</p></div>
                <div><span>02</span><h3>Follow the value</h3><p>Playback and payout visibility bring the economics closer to the listening experience.</p></div>
                <div><span>03</span><h3>Own the delivery</h3><p>Artists and labels can operate the rails their fans listen through.</p></div>
              </div>
            </div>
            <figure className="player-study"><img src="/images/deck/player-responsive.svg" width="154" height="332" alt="Illustrative Porto listening-app design showing a serving node and payment visibility" loading="lazy" /><figcaption>Product direction. Illustrative interface.</figcaption></figure>
          </div>
          <p className="small-note product-note">App features are design targets. The geo-localised delivery network is built in the MVP.</p>
        </section>

        <section className="section litepaper-section" id="litepaper">
          <div className="litepaper-intro"><p className="eyebrow">04 / Litepaper</p><h2>The infrastructure behind a fairer stream.</h2><p>Porto replaces the delivery and settlement layer, so music’s infrastructure can be owned by the industry it’s supposed to serve.</p><p className="litepaper-price">A £5 listener contribution can fund the whole stream.</p><a className="text-link" href="https://docs.portolabs.xyz" target="_blank" rel="noopener noreferrer">Read the full documentation <span aria-hidden="true">↗</span></a></div>
          <div className="questions">
            <details open><summary>The problem Porto solves</summary><p>Platforms own the pipes that deliver music and take their margin for doing so. Rights holders receive statements months later, without a granular, verifiable record of the plays behind them. Porto changes the delivery layer itself, rather than wrapping a new payment system around the old one.</p></details>
            <details><summary>The network</summary><p>Node operators cache and serve licensed audio. Porto Chain records valid plays and runs the accounting needed to allocate the resulting revenue. It is a music-specific app-chain, designed for stream accounting and royalty settlement rather than general-purpose applications.</p></details>
            <details><summary>Valid plays and clear accounting</summary><p>Each play must meet the network’s validity requirements before it becomes a settlement record. This creates an auditable trail from a listener’s playback to the work it funded, instead of asking artists and rights holders to accept an opaque report.</p></details>
            <details><summary>Listener-centric settlement</summary><p>Listener revenue is allocated across the works that listener actually streamed, weighted by valid listening duration. Registered rights splits then determine the rights-holder allocation. Plays accrue during an epoch and settle automatically at its boundary. The Beta specification uses daily epochs.</p></details>
            <details open><summary>Roadmap</summary><div className="roadmap"><div><span className="roadmap-date">Q4 2026</span><h3>London testnet</h3><p>Prove the model with 1,000 listeners, 100 artists and 5 network operators.</p></div><div><span className="roadmap-date">Q1 2027</span><h3>Mainnet</h3><p>Production settlement and the first operator-owned delivery layer.</p></div><div><span className="roadmap-date">Q2 2027</span><h3>LA</h3></div><div><span className="roadmap-date">Q2 2027</span><h3>Cape Town</h3></div><div><span className="roadmap-date">Q3 2027</span><h3>Berlin</h3></div><div><span className="roadmap-date">Q3 2027</span><h3>Tokyo</h3></div><div><span className="roadmap-date">Q4 2027</span><h3>Lagos</h3></div><div><span className="roadmap-date">Q4 2027</span><h3>New York</h3><p>Global launch milestone by year end.</p></div></div></details>
            <details><summary>What exists and what comes next</summary><p>A local, geo-targeted content delivery network is built in the MVP. London is the starting point. The next milestone is a testnet with working streams and payouts, followed by expansion to more cities and mainnet. Opening the rails to other platforms is a roadmap ambition.</p></details>
          </div>
        </section>

        <section className="section team-section" id="team">
          <p className="eyebrow">05 / The team</p>
          <h2>Built by people from<br /> both sides of the problem.</h2>
          <div className="team-grid">
            <article className="team-member"><img src="/images/richard_headshot.jpg" alt="Richard Melkonian" loading="lazy" width="160" height="190" /><div><p className="eyebrow">Founder</p><h3>Richard Melkonian</h3><p>Second hire at Movement Labs, leading protocol work from testnet to mainnet. Previously Parity Technologies, Dapper Labs and Fuel Labs. Former CTO of Inflow Music. Musician and filmmaker.</p><a className="text-link" href="https://github.com/0xmovses" target="_blank" rel="noopener noreferrer">GitHub <span aria-hidden="true">↗</span></a></div></article>
            <article className="team-member"><img src="/images/peter-xan.jpg" alt="Peter Xan" loading="lazy" width="160" height="190" /><div><p className="eyebrow">Head of Growth &amp; A&amp;R</p><h3>Peter Xan</h3><p>Growth and strategy across MediaCom, M&amp;C Saatchi, TBWA\Media Arts Lab and BBH. Founder of Thinning Room, developing artists and creator communities. Independent recording artist.</p></div></article>
          </div>
          <a className="cohort" href="https://altalab.ai" target="_blank" rel="noopener noreferrer"><img src="/images/altalab-logo.png" alt="AltaLab" loading="lazy" /><span>Autumn 2026 cohort <span className="muted">/ The founder program of AltaIR Capital</span></span><span aria-hidden="true">↗</span></a>
        </section>

        <section className="section join-section" id="join">
          <p className="eyebrow">Build the network with us</p>
          <h2>The music is yours.<br /> The rails can be too.</h2>
          <p>Artists, labels, node operators and listeners.<br /> Get early access to Porto.</p>
          <form onSubmit={handleSubmit} className="join-form">
            <label htmlFor="join-email">Email address</label>
            <div className="form-row"><input id="join-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required value={email} onChange={(event) => setEmail(event.target.value)} disabled={status === 'sending'} /><button className="button button-primary" type="submit" disabled={status === 'sending'}>{status === 'sending' ? 'Joining…' : 'Join the waitlist'}<span aria-hidden="true">↗</span></button></div>
            <div className="form-status" role="status" aria-live="polite">{status === 'success' && 'You’re on the list. We’ll be in touch.'}{status === 'error' && <>We couldn’t send that. Please try again or <a href={contact}>email us</a>.</>}</div>
          </form>
          <p className="investor-contact">Interested in the round? <a className="text-link" href={`${contact}?subject=Porto%20pitch%20deck`}>Request the deck <span aria-hidden="true">↗</span></a></p>
        </section>
      </main>

      <footer className="site-footer"><a className="wordmark footer-brand" href="#home" aria-label="Porto home"><img className="brand-mark" src="/images/porto-mark-handdrawn.webp" width="80" height="80" alt="" /><span>PORTO</span></a><p>Music is the foundation.<br />Distribution ownership is the change.</p><div><a href="https://docs.portolabs.xyz" target="_blank" rel="noopener noreferrer">Docs ↗</a><a href="https://github.com/porto-labs-xyz/porto-core" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={contact}>Contact ↗</a></div><span className="copyright">© {new Date().getFullYear()} Porto Labs Ltd.<br />UK Registered Company</span></footer>
    </>
  )
}

export default IndexPage

export const Head = () => (
  <>
    <html lang="en" />
    <title>Porto | Artist-owned streaming infrastructure</title>
    <meta name="description" content={mission} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.portolabs.xyz/" />
    <meta property="og:title" content="Porto | Spotify takes 30%. You get pennies." />
    <meta property="og:description" content={mission} />
    <meta property="og:image" content="https://www.portolabs.xyz/images/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="Porto | Artist-owned streaming infrastructure" />
    <meta name="twitter:description" content={mission} />
    <meta name="twitter:image" content="https://www.portolabs.xyz/images/og-image.png" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;450;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </>
)
