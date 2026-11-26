import React from 'react'
import { Link } from 'gatsby'

export default function HardwareRedirect() {
  return <main><Link to="/hardware/">Explore Kiln hardware</Link></main>
}

export function Head() {
  return <>
    <title>Kiln hardware</title>
    <meta name="robots" content="noindex, follow" />
    <meta httpEquiv="refresh" content="0;url=/hardware/" />
    <link rel="canonical" href="https://www.portolabs.xyz/hardware/" />
  </>
}
