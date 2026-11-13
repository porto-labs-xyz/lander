import React from 'react'
import KilnPage from '../components/KilnPage'
import HomeContent from '../components/HomeContent'
import Seo from '../components/Seo'

export default function IndexPage() {
  return <KilnPage page="home"><HomeContent /></KilnPage>
}

export const Head = () => <Seo title={"Kiln \u2014 Private AI. Local production."} description={"Private AI for agencies. Run local models on your own Kiln hardware, with creative projects and sensitive client work kept within your studio’s systems."} path="/" hero={true} />
