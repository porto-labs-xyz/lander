import React from 'react'
import KilnPage from '../components/KilnPage'
import HomeContent from '../components/HomeContent'
import Seo from '../components/Seo'

export default function IndexPage() {
  return <KilnPage page="home"><HomeContent /></KilnPage>
}

export const Head = () => <Seo title={"Kiln \u2014 Private AI. Local production."} description={"Local AI hardware and a shared workspace for creative teams. Built around private work, useful context and less wasted compute. Meet Kiln One, Atelier and KilnOS."} path="/" hero={true} />
