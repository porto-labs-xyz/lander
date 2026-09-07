import React, { useState } from 'react'

const styles = {
  // Global
  page: {
    fontFamily: "'IBM Plex Mono', monospace",
    background: '#0a0a0a',
    color: '#f0f0f0',
    minHeight: '100vh',
  },

  // Nav
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 2rem',
    background: '#0a0a0a',
    borderBottom: '1px solid #888',
    zIndex: 100,
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    textDecoration: 'none',
    color: '#f0f0f0',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  },
  navLink: {
    color: '#888',
    textDecoration: 'none',
    fontSize: '0.875rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: "'IBM Plex Mono', monospace",
  },
  navGithub: {
    display: 'flex',
    alignItems: 'center',
    color: '#888',
  },

  // Sections
  section: {
    minHeight: 'auto',
    padding: '6rem 2rem 2rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  sectionScrollable: {
    padding: '4rem 2rem 2rem 2rem',
    maxWidth: '800px',
    margin: '0 auto',
  },
  // Home
  h1: {
    fontSize: 'clamp(2.5rem, 8vw, 5rem)',
    fontWeight: 700,
    lineHeight: 0.95,
    letterSpacing: '-0.03em',
    marginBottom: '2rem',
  },
  accent: {
    color: '#ff3b3b',
  },
  tagline: {
    fontSize: '1.25rem',
    color: '#888',
    maxWidth: '500px',
    lineHeight: 1.5,
  },
  navWaveform: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '3px',
    height: '16px',
    marginLeft: '0.75rem',
  },
  sectionMarker: {
    display: 'inline-block',
    width: '0.6em',
    height: '0.6em',
    background: '#f0f0f0',
    marginRight: '0.6em',
    verticalAlign: 'middle',
  },
  stats: {
    display: 'flex',
    gap: '4rem',
    marginTop: '4rem',
    paddingTop: '2rem',
    borderTop: '1px solid #888',
    flexWrap: 'wrap',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#ff3b3b',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginTop: '0.25rem',
  },

  // How It Works
  sectionTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '3rem',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  howGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '2rem',
  },
  howBlock: {
    border: '1px solid #888',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
  },
  howNumber: {
    fontSize: '3rem',
    fontWeight: 700,
    color: '#ff3b3b',
    lineHeight: 1,
    marginBottom: '1rem',
  },
  howTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  howDesc: {
    color: '#888',
    lineHeight: 1.6,
    fontSize: '0.9rem',
  },

  // Litepaper
  h2: {
    fontSize: '1.75rem',
    fontWeight: 700,
    margin: '3rem 0 1.5rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  h3: {
    fontSize: '1.25rem',
    fontWeight: 700,
    margin: '2rem 0 1rem 0',
    color: '#ff3b3b',
  },
  p: {
    color: '#888',
    lineHeight: 1.7,
    marginBottom: '1rem',
    fontSize: '0.95rem',
  },
  strong: {
    color: '#f0f0f0',
  },
  ul: {
    color: '#888',
    margin: '1rem 0 1rem 1.5rem',
    lineHeight: 1.7,
  },
  li: {
    marginBottom: '0.5rem',
  },
  highlight: {
    background: '#ff3b3b',
    color: '#0a0a0a',
    padding: '0.1em 0.3em',
    fontWeight: 600,
  },
  divider: {
    border: 'none',
    borderTop: '1px solid #888',
    margin: '3rem 0',
  },

  // Impact / Infographic
  impactIntro: {
    color: '#ccc',
    lineHeight: 1.7,
    fontSize: '1.05rem',
    maxWidth: '780px',
    marginBottom: '3rem',
  },
  barBlock: {
    marginBottom: '2.5rem',
  },
  barHeading: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: '0.6rem',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  barTitle: {
    fontSize: '0.95rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  barPercent: {
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#ff3b3b',
  },
  barTrack: {
    width: '100%',
    height: '2.5rem',
    border: '1px solid #888',
    background: 'transparent',
    position: 'relative',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    background: '#ff3b3b',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '0.75rem',
    color: '#0a0a0a',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  barCaption: {
    color: '#888',
    fontSize: '0.8rem',
    marginTop: '0.5rem',
    lineHeight: 1.5,
  },
  barTotalLabel: {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#888',
    fontWeight: 700,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  ukMusicGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1.5rem',
    margin: '2rem 0 1.5rem 0',
  },
  ukStatBlock: {
    border: '1px solid #888',
    padding: '1.5rem',
  },
  ukStatValue: {
    fontSize: '2rem',
    fontWeight: 700,
    color: '#ff3b3b',
    lineHeight: 1,
    marginBottom: '0.5rem',
  },
  ukStatLabel: {
    color: '#888',
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
  citation: {
    color: '#666',
    fontSize: '0.75rem',
    lineHeight: 1.7,
    marginTop: '2rem',
    borderTop: '1px solid #333',
    paddingTop: '1rem',
  },

  // Founder
  founderSection: {
    padding: '3rem 2rem',
    maxWidth: '900px',
    margin: '0 auto',
  },
  founderGrid: {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: '3rem',
    alignItems: 'start',
  },
  founderImage: {
    width: '280px',
    height: '280px',
    objectFit: 'cover',
    border: '1px solid #888',
  },
  founderContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  founderName: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
  },
  founderRole: {
    fontSize: '0.875rem',
    color: '#ff3b3b',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    marginBottom: '1.5rem',
  },
  founderBio: {
    color: '#888',
    lineHeight: 1.7,
    fontSize: '0.95rem',
  },
  founderBioP: {
    marginBottom: '1rem',
  },

  // Join
  joinContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  joinTitle: {
    fontSize: 'clamp(2rem, 6vw, 4rem)',
    fontWeight: 700,
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '-0.02em',
  },
  joinSubtitle: {
    color: '#888',
    fontSize: '1.1rem',
    marginBottom: '3rem',
    maxWidth: '400px',
  },
  form: {
    display: 'flex',
    gap: 0,
    width: '100%',
    maxWidth: '500px',
    flexWrap: 'wrap',
  },
  input: {
    flex: 1,
    minWidth: '200px',
    padding: '1rem 1.5rem',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '1rem',
    background: 'transparent',
    border: '1px solid #888',
    color: '#f0f0f0',
    outline: 'none',
  },
  button: {
    padding: '1rem 2rem',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '1rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    background: '#f0f0f0',
    color: '#0a0a0a',
    border: '1px solid #f0f0f0',
    cursor: 'pointer',
  },
  successMessage: {
    color: '#ff3b3b',
    fontSize: '1rem',
    marginTop: '1rem',
    height: '1.5rem',
  },
  roles: {
    display: 'flex',
    gap: '1rem',
    marginTop: '3rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  roleTag: {
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#888',
    padding: '0.5rem 1rem',
    border: '1px solid #888',
  },
}

const GithubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.35-3.87-1.35-.53-1.33-1.29-1.68-1.29-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.78 1.19 1.78 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.05 11.05 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.24 2.76.12 3.05.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.2.66.79.55A10.51 10.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
  </svg>
)

const NavWaveform = () => (
  <div style={styles.navWaveform}>
    {[60, 100, 40, 80].map((h, i) => (
      <span
        key={i}
        style={{
          width: '2px',
          height: `${h}%`,
          background: i === 1 ? '#f0f0f0' : '#ff3b3b',
        }}
      />
    ))}
  </div>
)

const IndexPage = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    await fetch('https://formspree.io/f/xjgepgbg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    setEmail('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div style={styles.page}>
      {/* Navigation */}
      <nav style={styles.nav}>
        <a href="#home" style={{ ...styles.logo, display: 'flex', alignItems: 'center' }} onClick={(e) => { e.preventDefault(); scrollTo('home') }}>
          PORTO
          <NavWaveform />
        </a>
        <div style={styles.navLinks}>
          <button style={styles.navLink} onClick={() => scrollTo('how')}>How It Works</button>
          <button style={styles.navLink} onClick={() => scrollTo('impact')}>Impact</button>
          <button style={styles.navLink} onClick={() => scrollTo('litepaper')}>Litepaper</button>
          <button style={styles.navLink} onClick={() => scrollTo('founder')}>Founder</button>
          <button style={styles.navLink} onClick={() => scrollTo('join')}>Join</button>
          <a
            href="https://github.com/porto-labs-xyz/porto-core"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.navGithub}
            aria-label="Porto on GitHub"
            title="Porto is open source — view on GitHub"
          >
            <GithubIcon />
          </a>
        </div>
      </nav>

      {/* Home Section */}

      <section id="home" style={styles.section}>
        <h1 style={styles.h1}>
          Spotify takes 30%.<br />
          <span style={styles.accent}>You get pennies.</span>
        </h1>
        <p style={styles.tagline}>
          Decentralized music streaming infrastructure — and the platform built on it. Artists, labels, and node operators run the network and own a piece of what it earns.
        </p>
        <div style={styles.stats}>
          <div style={styles.stat}>
            <span style={styles.statValue}>70%</span>
            <span style={styles.statLabel}>To rights holders</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>15%</span>
            <span style={styles.statLabel}>To node operators</span>
          </div>
          <div style={styles.stat}>
            <span style={styles.statValue}>15%</span>
            <span style={styles.statLabel}>To Porto</span>
          </div>
        </div>
        <p style={styles.barCaption}>Per dollar of listener revenue, split automatically on every stream. No 30% platform tax.</p>
      </section>

      {/* How It Works Section */}
      <section id="how" style={styles.section}>
        <h2 style={styles.sectionTitle}><span style={styles.sectionMarker} />How It Works</h2>
        <p style={styles.impactIntro}>
          Porto is rebuilt from the network up — and it owns the consumer platform on top of that network, not just the pipes underneath it.
        </p>
        <div style={styles.howGrid}>
          <div style={styles.howBlock}>
            <span style={styles.howNumber}>01</span>
            <h3 style={styles.howTitle}>Platform</h3>
            <p style={styles.howDesc}>Listening, catalogs, and artist profiles — Porto's own product, not a protocol listeners have to understand to use it.</p>
          </div>
          <div style={styles.howBlock}>
            <span style={styles.howNumber}>02</span>
            <h3 style={styles.howTitle}>Network</h3>
            <p style={styles.howDesc}>Labels, artists, and operators run the nodes that cache and stream the catalog. Every play is logged and auditable. No centralized CDN, no opaque accounting.</p>
          </div>
          <div style={styles.howBlock}>
            <span style={styles.howNumber}>03</span>
            <h3 style={styles.howTitle}>Economy</h3>
            <p style={styles.howDesc}>Every stream splits automatically — 70% to rights holders, 15% to node operators, 15% to Porto. Value flows to the people running the system, not a platform tax.</p>
          </div>
        </div>
        <p style={{ ...styles.impactIntro, marginTop: '2.5rem', marginBottom: 0 }}>
          This compounds: more artists mean more listeners, more listeners mean more streams to serve, more operators make the network denser. Porto owns the flagship platform today — and the same network is built for other platforms to plug into tomorrow.
        </p>
      </section>

      {/* Impact Section */}
      <section id="impact" style={styles.section}>
        <h2 style={styles.sectionTitle}><span style={styles.sectionMarker} />Giving Value Back to Creators</h2>
        <p style={styles.impactIntro}>
          The music industry runs on <span style={styles.highlight}>extraction</span> — value generated by artists, funnelled through intermediaries, with only a fraction finding its way back. Porto isn't a fintech wrapper on the same model. It's <strong style={styles.strong}>infrastructure reform</strong>: no third party sitting between creators and their money.
        </p>

        <p style={styles.impactIntro}>
          That extraction has never fallen evenly. Black British artists and the genres they built are estimated to have driven <strong style={styles.strong}>80% of the UK music industry's total economic contribution over the last 30 years</strong> — £24.5bn of a £30bn market — yet Black, Asian and ethnically diverse staff hold just <strong style={styles.strong}>22.1% of senior industry roles</strong>. (UK Music, "Black Music Means Business," 2026; UK Music Diversity Report, 2024)
        </p>
        <p style={styles.impactIntro}>
          <strong style={styles.strong}>Skepta</strong>, <strong style={styles.strong}>Stormzy</strong>, and <strong style={styles.strong}>Little Simz</strong> have all built Mercury Prize- and chart-topping careers through independent labels. The lesson isn't that artists should go independent — it's that whoever owns the distribution rails captures the value. Porto exists to put those rails in artists' hands by default.
        </p>

        <div style={styles.howGrid}>
          <div style={styles.howBlock}>
            <span style={styles.howNumber}>1st</span>
            <h3 style={styles.howTitle}>London Testnet</h3>
            <p style={styles.howDesc}>Porto is shipping locally — launching as a London testnet with the artist community it's built for, before expanding further.</p>
          </div>
          <div style={styles.howBlock}>
            <span style={styles.howNumber}>ArT</span>
            <h3 style={styles.howTitle}>ArtsTech, Not Just FinTech</h3>
            <p style={styles.howDesc}>Porto sits at the intersection of ArtsTech and infrastructure — aligned with Arts Council priorities around sustainable, artist-first cultural funding, not purely financial return.</p>
          </div>
        </div>

        <h3 style={{ ...styles.h3, marginTop: '4rem' }}>The Artist Economics Gap</h3>
        <p style={styles.p}>
          This is the outcome of artists' own creative labour — not a function of how much or how little they release. Per pound generated, the split looks like this:
        </p>

        <div style={styles.barBlock}>
          <div style={styles.barHeading}>
            <span style={styles.barTitle}>What the performer keeps for every £1 a UK stream generates</span>
            <span style={styles.barPercent}>8p of £1</span>
          </div>
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: '8%' }}>8p</div>
            <span style={styles.barTotalLabel}>£1.00 generated</span>
          </div>
          <p style={styles.barCaption}>
            A UK stream generates an average of £0.011, of which £0.008 is distributed to rights holders. Performers receive roughly 11% of that share — about £0.00088 per stream, or <strong style={styles.strong}>8p for every £1 generated</strong>. The rest goes to labels, publishers, and platforms. (Hesmondhalgh et al., "Music Creators' Earnings in the Digital Era," commissioned by the UK Intellectual Property Office, 2021)
          </p>
        </div>

        <p style={styles.p}>
          In 2021 a UK Parliamentary inquiry into music streaming concluded the market needs a <strong style={styles.strong}>"complete reset,"</strong> recommending streaming be licensed on the same 50/50 basis between labels and performers used in broadcast radio. That reset hasn't happened. Porto is built to be the infrastructure that makes it happen by default, not by regulation.
        </p>

        <h3 style={{ ...styles.h3, marginTop: '3rem' }}>UK Music: One of Britain's Biggest Cultural Exports</h3>
        <p style={styles.p}>
          This isn't a niche sector. UK music is a major, growing contributor to the national economy and one of the country's flagship cultural exports:
        </p>
        <div style={styles.ukMusicGrid}>
          <div style={styles.ukStatBlock}>
            <div style={styles.ukStatValue}>£8.0bn</div>
            <div style={styles.ukStatLabel}>Record contribution to UK GVA in 2024, up 5% year-on-year</div>
          </div>
          <div style={styles.ukStatBlock}>
            <div style={styles.ukStatValue}>£4.8bn</div>
            <div style={styles.ukStatLabel}>UK music export revenue in 2024, a new all-time high</div>
          </div>
          <div style={styles.ukStatBlock}>
            <div style={styles.ukStatValue}>220,000</div>
            <div style={styles.ukStatLabel}>Full-time equivalent jobs supported by UK music in 2024</div>
          </div>
          <div style={styles.ukStatBlock}>
            <div style={styles.ukStatValue}>£800.3m</div>
            <div style={styles.ukStatLabel}>UK recorded music exports in 2025 — highest since records began, BPI targeting £1bn by 2030</div>
          </div>
        </div>
        <p style={styles.p}>
          The money is there. The growth is real. Porto exists to answer one question: who actually gets paid — and right now, it isn't the people who made the music.
        </p>

        <p style={styles.citation}>
          Sources: UK Music, "This Is Music 2025"; UK Music, "Black Music Means Business" (2026); UK Music Diversity Report (2024); BPI recorded music export data (2025); Hesmondhalgh et al., "Music Creators' Earnings in the Digital Era," commissioned by the UK Intellectual Property Office (2021); DCMS Select Committee report "Economics of Music Streaming" (House of Commons, July 2021).
        </p>
      </section>

      {/* Litepaper Section */}
      <section id="litepaper" style={styles.sectionScrollable}>
        <h2 style={{ ...styles.sectionTitle, marginTop: '4rem' }}><span style={styles.sectionMarker} />Litepaper</h2>

        <h2 style={styles.h2}>The Problem</h2>
        <p style={styles.p}>Even artists with 1M+ monthly streams are struggling to survive.</p>
        <p style={styles.p}>
          In the CD/download era, that level of attention brought in <strong style={styles.strong}>$10K–$40K/month</strong>. Today on Spotify, it nets <strong style={styles.strong}>$500–$1,000</strong> to the artist after label, publisher, distributor, and platform cuts.
        </p>
        <p style={styles.p}>Streaming has scaled consumption. But centralized infrastructure has capped revenue.</p>
        <p style={styles.p}><strong style={styles.strong}>Labels, publishers, and artists don't own the distribution layer—platforms do.</strong></p>

        <h3 style={styles.h3}>Spotify's Real Moat</h3>
        <p style={styles.p}>Spotify's USP isn't playlists or UI. It's infrastructure.</p>
        <p style={styles.p}>
          They've built their own global edge compute CDN—a custom content delivery network optimized for fast audio streaming at scale. Unlike most consumer tech companies, Spotify doesn't rely on AWS or Cloudflare for edge delivery. They use a proprietary mesh of globally distributed cache nodes and compute infrastructure, designed in-house.
        </p>
        <p style={styles.p}>
          This gives Spotify total control over performance, cost, and data. That's what allows them to serve 500M+ users with near-instant playback, at low latency and high resilience.
        </p>
        <p style={styles.p}>
          <span style={styles.highlight}>But only Spotify benefits from it.</span> Artists, labels, and publishers don't see any upside. They plug in and get paid pennies.
        </p>

        <h3 style={styles.h3}>Why NFTs Didn't Solve It</h3>
        <p style={styles.p}>
          Crypto music projects focused on tying songs or royalties to NFTs. They reimagined ownership, but not delivery.
        </p>
        <p style={styles.p}>
          You can own the music—but if Spotify still delivers it, you don't own the value chain.
        </p>
        <p style={styles.p}><strong style={styles.strong}>The problem is infrastructure.</strong> Tokenizing without replacing distribution doesn't change payouts.</p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>The Solution</h2>
        <p style={styles.p}>Recreate Spotify's edge CDN model—but decentralized and music-industry owned.</p>
        <ul style={styles.ul}>
          <li style={styles.li}>Labels, artists, publishers, and curators run nodes that cache and stream content</li>
          <li style={styles.li}>Each stream pays out to the rights holder + node operator via micropayment splits</li>
          <li style={styles.li}>All activity is logged on-chain—auditable, real-time royalties</li>
          <li style={styles.li}>No centralized platform tax—value flows to participants</li>
        </ul>
        <p style={styles.p}>
          Once labels and artists see how much more they can earn—and realize they can own part of the network—they'll start distributing through it.
        </p>
        <p style={styles.p}><strong style={styles.strong}>They're not tenants anymore. They're landlords.</strong></p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Architecture</h2>
        <p style={styles.p}>
          Simple version: artist or label uploads → Porto's network streams it → plays are logged and settled automatically → money moves to rights holders and node operators. Everything below is how that actually works.
        </p>

        <h3 style={styles.h3}>Two Node Types, One Binary</h3>
        <p style={styles.p}>Porto runs on a single configurable node that can operate in three modes:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong style={styles.strong}>CDN Mode:</strong> Caches content, serves streams, submits attestations</li>
          <li style={styles.li}><strong style={styles.strong}>Validator Mode:</strong> Participates in consensus, executes the accounting VM</li>
          <li style={styles.li}><strong style={styles.strong}>Full Mode:</strong> Does both—the default for small operators</li>
        </ul>
        <p style={styles.p}>At launch, all nodes run full mode. As the network scales, operators can specialize.</p>

        <h3 style={styles.h3}>The Accounting VM</h3>
        <p style={styles.p}>Porto uses Move for on-chain logic—not as a dApp platform, but as a verified accounting VM. Three modules only:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong style={styles.strong}>Stream Accounting:</strong> Receives attestations, maintains canonical play counts</li>
          <li style={styles.li}><strong style={styles.strong}>Payout Splitter:</strong> Applies royalty splits, handles multiple rights holders per track</li>
          <li style={styles.li}><strong style={styles.strong}>Governance Parameters:</strong> Fee percentages, thresholds, upgrade authorization</li>
        </ul>
        <p style={styles.p}>Everything behind versioned upgrades. Minimal attack surface. Clear separation of concerns.</p>

        <h3 style={styles.h3}>Content Layer</h3>
        <p style={styles.p}>
          No IPFS. Simple origin storage (S3-style) with node-level caching. Artists upload to origin. Nodes pull and cache. Streams served from nearest node.
        </p>
        <p style={styles.p}>
          This is licensed music from opted-in artists, not permissionless file sharing. We don't need content-addressed complexity.
        </p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Token Model</h2>

        <h3 style={styles.h3}>The Split</h3>
        <p style={styles.p}>At $5/month per user:</p>
        <ul style={styles.ul}>
          <li style={styles.li}><strong style={styles.strong}>70%</strong> to rights holders (artists, labels, publishers)</li>
          <li style={styles.li}><strong style={styles.strong}>15%</strong> to node operators</li>
          <li style={styles.li}><strong style={styles.strong}>15%</strong> to protocol treasury</li>
        </ul>
        <p style={styles.p}>Payouts in the native token. Node operators earn both cash-equivalent rewards and token appreciation upside.</p>

        <h3 style={styles.h3}>Bootstrapping Economics</h3>
        <p style={styles.p}>
          Early node operators aren't running infrastructure for cash returns alone — they're earning a stake in a network that gets more valuable as more artists and listeners join it.
        </p>
        <p style={styles.p}>
          That's the same incentive that bootstraps any new infrastructure: show up early, do the work, hold equity in the outcome. Token rewards bridge the gap until streaming volume alone covers the cost of running a node.
        </p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>The Long Game</h2>
        <p style={styles.p}>We don't need every Spotify listener on day one. We need the artist's most engaged 1%.</p>
        <p style={styles.p}>
          An artist with 1M monthly Spotify listeners might bring 1% of their most dedicated fans to Porto. 10,000 superfans streaming at 10x the payout rate equals the same income—from 1% of the audience.
        </p>
        <p style={styles.p}>
          <strong style={styles.strong}>Artist brings fans. Fans become the network. The network attracts more artists.</strong> Scale that across thousands of artists, each bringing their most engaged listeners, and the catalog grows, the network effects compound, and at critical mass, casual listeners can use the platform too.
        </p>

        <h3 style={styles.h3}>The Catalyst Moments</h3>
        <ul style={styles.ul}>
          <li style={styles.li}>A mid-tier artist goes exclusive and it works—visible proof that the model pays</li>
          <li style={styles.li}>Spotify does something unpopular—price hikes, payout cuts, public fights with artists</li>
          <li style={styles.li}>A meaningful indie label comes on board—catalog depth overnight</li>
          <li style={styles.li}>Cultural moment—a viral story where Porto is the counterexample</li>
        </ul>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Transparency Dividend</h2>
        <p style={styles.p}>
          There are continual disputes between rights holders and royalty collection services (ASCAP, PRS, BMI) with several notable lawsuits. The on-chain ledger of streams provides a step toward transparency in royalty collection.
        </p>
        <p style={styles.p}>
          It's impossible to get rid of collection societies. But Porto provides a publicly verifiable, granular, and accurate record for them to get paid against.
        </p>
        <p style={styles.p}><strong style={styles.strong}>No more arguments about what got played.</strong></p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Beyond Porto: The Open Network</h2>
        <p style={styles.p}>
          The Porto app is the proof: it shows the model works and gives Porto the initial consumer and artist relationship. It is not the ceiling.
        </p>
        <p style={styles.p}>
          Once the network is running at scale, other platforms will be able to build on Porto's streaming and distribution layer directly — keeping their own brand, UX, and users, while settling on Porto's rails. This is roadmap, not shipped product, but it's the reason Porto isn't capped at the size of one app.
        </p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Roadmap</h2>

        <h3 style={styles.h3}>Phase 1: London Testnet</h3>
        <p style={styles.p}>5 nodes. 100 artists. Working streams and payouts on testnet. Proof the model works.</p>

        <h3 style={styles.h3}>Phase 2: Expand & Raise</h3>
        <p style={styles.p}>Pre-seed funding. 5-10 cities on testnet. 1,000+ artists. First indie label partnerships.</p>

        <h3 style={styles.h3}>Phase 3: Mainnet</h3>
        <p style={styles.p}>Token goes live. Multiple cities operational. Coordinated launch with artist ambassadors.</p>

        <h3 style={styles.h3}>Phase 4: Scale</h3>
        <p style={styles.p}>Series A. 20+ cities. Meaningful catalog. The network becomes undeniable.</p>

        <hr style={styles.divider} />

        <h2 style={styles.h2}>Why Now</h2>
        <ul style={styles.ul}>
          <li style={styles.li}>Spotify's infrastructure shows what's possible—but they don't share the upside</li>
          <li style={styles.li}>Artists, labels and publishers are ready to own more than just the content</li>
          <li style={styles.li}>Decentralized infrastructure now works at consumer scale—the networks and tooling exist to build this today</li>
          <li style={styles.li}>The market narrative is there, artist frustration with streaming is at an all-time high</li>
          <li style={styles.li}>No one owns the "Spotify of Web3"</li>
        </ul>
        <p style={styles.p}><strong style={styles.strong}>The infrastructure layer is up for grabs. Porto is taking it.</strong></p>
      </section>

      {/* Founder Section */}
      <section id="founder" style={styles.founderSection}>
        <div style={styles.founderGrid}>
          <img
            src="/images/richard_headshot.jpg"
            alt="Richard Melkonian"
            style={styles.founderImage}
          />
          <div style={styles.founderContent}>
            <h3 style={styles.founderName}>Richard Melkonian</h3>
            <p style={{ ...styles.founderRole, marginBottom: '0.25rem' }}>Role: Founder</p>
            <p style={{ ...styles.founderRole, fontWeight: 300, opacity: 0.8, marginBottom: '1.5rem' }}>
              GitHub: <a href="https://github.com/0xmovses" target="_blank" rel="noopener noreferrer" style={{ color: '#ff3b3b', textDecoration: 'none' }}>0xmovses</a>
            </p>
            <div style={styles.founderBio}>
              <p style={styles.founderBioP}>
                Distributed systems engineering, financial infrastructure, and a career on the artist side of streaming — Porto sits at the exact intersection of what I've spent my career doing.
              </p>
              <p style={styles.founderBioP}>
                I was the second hire at Movement Labs, where I helped design and architect their M2 rollup and led the protocol team through testnet to mainnet — my designs and implementation facilitated over 1 million transactions per day. I designed and implemented their Atomic Bridge Protocol from RFC through to production, and built the USDCx Bridge.
              </p>
              <p style={styles.founderBioP}>
                Before that, I worked at Parity Technologies on the polkadot-sdk — rebuilding parachain integration systems, XCM messaging, and FRAME pallet code that powers Substrate blockchains. At Dapper Labs, I designed and was the main contributor for CAST, an on-chain governance tool for the Flow blockchain. I've also built indexer infrastructure at Fuel Labs.
              </p>
              <p style={styles.founderBioP}>
                As CTO of Inflow Music, I architected core DeFi contracts, built the frontend and backend, and led a team of 15 developers. We raised $1.5M and launched on Flow. That experience showed me first-hand how broken music economics are — even when you build the tech right.
              </p>
              <p style={styles.founderBioP}>
                Alongside this, I've maintained an independent creative practice in music and film. I've released records, composed for screen, and directed feature work — experiencing first-hand how digital distribution reshaped the economics of creative work.
              </p>
              <p style={styles.founderBioP}>
                I've lived the streaming economy from both sides — I know what it takes to build the infrastructure, and what it feels like to generate attention at scale and watch the revenue evaporate through layers of intermediaries. Porto is that overlap: rebuilding streaming from the network layer up, so the people creating and curating culture can also own the system that distributes it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="join" style={styles.section}>
        <div style={styles.joinContent}>
          <h2 style={styles.joinTitle}>Join the Network</h2>
          <p style={styles.joinSubtitle}>
            Artists. Node operators. Believers. Get early access to Porto.
          </p>
          <form style={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Join Waitlist
            </button>
          </form>
          <p style={styles.successMessage}>
            {submitted ? "You're on the list. We'll be in touch." : ''}
          </p>
          <div style={styles.roles}>
            <span style={styles.roleTag}>Artists</span>
            <span style={styles.roleTag}>Labels</span>
            <span style={styles.roleTag}>Node Operators</span>
            <span style={styles.roleTag}>Investors</span>
          </div>
        </div>
      </section>

      {/* Deck Request */}
      <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
        <p style={{ color: '#888', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
          Request a Deck
        </p>
        <a href="mailto:hello@portolabs.xyz" style={{ color: '#ff3b3b', textDecoration: 'none', marginBottom: '3rem', display: 'inline-block' }}>
          hello@portolabs.xyz
        </a>
        <div style={{ marginTop: '3rem' }}>
          <img src="/images/porto-icon-glitch.svg" alt="Porto" style={{ width: '400px' }} />
        </div>
      </div>

    </div>
  )
}

export default IndexPage

export const Head = () => (
  <>
    <title>Porto — Decentralized Streaming Infrastructure</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600;700&display=swap" rel="stylesheet" />
    <style>{`
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html { scroll-behavior: smooth; }
      body { 
        font-family: 'IBM Plex Mono', monospace;
        background: #0a0a0a;
      }
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        opacity: 0.03;
        pointer-events: none;
        z-index: 1000;
      }
      @media (max-width: 768px) {
        nav { padding: 1rem !important; }
        nav > div { gap: 0.75rem !important; }
        nav button { font-size: 0.7rem !important; }
        #founder > div { 
          grid-template-columns: 1fr !important;
          text-align: center;
        }
        #founder img {
          margin: 0 auto;
        }
      }
    `}</style>
  </>
)


