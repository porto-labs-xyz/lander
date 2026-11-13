import React from 'react'
import KilnPage from '../components/KilnPage'
import AboutContent from '../components/AboutContent'
import Seo from '../components/Seo'

export default function AboutPage() {
  return <KilnPage page="about"><AboutContent /></KilnPage>
}

export const Head = () => <Seo title={"About Kiln \u2014 Tools for independent minds."} description={"Meet the team building Kiln: local AI and a shared workspace for creative teams."} path="/about/" hero={false} />
