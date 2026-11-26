import React from 'react'

export default function Seo({ title, description, path, hero = false }) {
  const url = `https://www.portolabs.xyz${path}`
  const image = 'https://letskiln.xyz/images/kiln-social-20261118-v2.png'
  return <>
    <html lang="en" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="robots" content="index, follow" />
    <meta name="theme-color" content="#f6f6f2" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <link rel="canonical" href={url} />
    <link rel="icon" href="/assets/kiln/kiln-crucible-ink.svg" type="image/svg+xml" />
    <link rel="preload" href="/assets/fonts/ABCMonumentGrotesk-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    {hero && <>
      <link rel="preload" as="image" href="/assets/kiln/finishes/pebble-grey-3840.webp" media="(prefers-reduced-motion: no-preference)" />
      <link rel="preload" as="image" href="/assets/kiln/finishes/pebble-grey-960.webp" media="(prefers-reduced-motion: reduce)" />
    </>}
    <meta property="og:type" content="website" />
    <meta property="og:url" content={url} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:site_name" content="Kiln by Porto Labs" />
    <meta property="og:locale" content="en_GB" />
    <meta property="og:image" content={image} />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Kiln. Your imagination. A space of its own." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={image} />
  </>
}
