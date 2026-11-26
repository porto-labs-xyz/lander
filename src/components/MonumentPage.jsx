import React, { useEffect, useRef } from 'react'
import { founderNames } from '../content/co-founders'
import { withFinishViewer } from '../content/finish-viewer.mjs'
import { mountMonument } from '../lib/monument.mjs'

// Trusted, versioned editorial markup. Never insert visitor-supplied HTML here.
export default function MonumentPage({ content }) {
  const root = useRef(null)
  useEffect(() => mountMonument(root.current), [content])
  const html = withFinishViewer(content.body).replace('<!-- founder names -->', founderNames)
  return <div ref={root} dangerouslySetInnerHTML={{ __html: html }} />
}
