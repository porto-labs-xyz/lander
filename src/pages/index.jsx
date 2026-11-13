import React from 'react'
import KilnPage from '../components/KilnPage'
import HomeContent from '../components/HomeContent'
import Seo from '../components/Seo'

export default function IndexPage() {
  return <KilnPage page="home"><HomeContent /></KilnPage>
}

export const Head = () => <Seo title={"Kiln \u2014 Private AI. Local production."} description={"Private AI. Local production. Meet Kiln One, Atelier and KilnOS: hardware and a shared workspace for creative teams."} path="/" hero={true} />
