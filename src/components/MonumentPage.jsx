import { hardwareDestination } from '../lib/legacy-hardware-links.mjs'
import React, { useEffect, useRef } from 'react'
import { teamSection } from '../content/co-founders'
import { withFinishViewer } from '../content/finish-viewer.mjs'
import { mountMonument } from '../lib/monument.mjs'

// Trusted, versioned editorial markup. Never insert visitor-supplied HTML here.
export default function MonumentPage({ content }) {
  const root = useRef(null)
  useEffect(() => mountMonument(root.current), [content])
  useEffect(() => {
    const redirect = () => {
      const destination = hardwareDestination(content.path, window.location.hash)
      if (destination) window.location.replace(destination)
    }
    redirect()
    window.addEventListener('hashchange', redirect)
    return () => window.removeEventListener('hashchange', redirect)
  }, [content.path])
  const html = withFinishViewer(content.body, content.path).replace('<!-- team section -->', teamSection)
  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
}
