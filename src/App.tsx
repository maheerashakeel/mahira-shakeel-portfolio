import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useEffect } from 'react'

import { About } from './components/About'
import { Apps } from './components/Apps'
import { Backdrop } from './components/Backdrop'
import { Buddy } from './components/Buddy'
import { Contact } from './components/Contact'
import { Hero } from './components/Hero'
import { Intro } from './components/Intro'
import { Nav } from './components/Nav'
import { Work } from './components/Work'
import { setFlow, setWorld } from './lib/ambient'
import { appProjects, webProjects } from './lib/content'

gsap.registerPlugin(ScrollTrigger)

export default function App() {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const lenis = reduce ? null : new Lenis({ lerp: 0.12, smoothWheel: true })
    const tick = (time: number) => lenis?.raf(time * 1000)
    if (lenis) {
      lenis.on('scroll', ScrollTrigger.update)
      lenis.on('scroll', (l: Lenis) => {
        setFlow(l.velocity)
        document.documentElement.classList.toggle('scrolling-down', l.direction === 1 && l.scroll > 120)
      })
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)
    }

    const onAnchor = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]')
      if (!a) return
      const target = document.querySelector<HTMLElement>(a.getAttribute('href') ?? '')
      if (!target) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(target, { duration: 1.4 })
      else target.scrollIntoView()
    }
    document.addEventListener('click', onAnchor)

    // the last two scenes carry the world forward, the same way the projects do
    const segment = (trigger: string, from: number, to: number) =>
      ScrollTrigger.create({
        trigger,
        start: 'top bottom',
        end: 'top top',
        scrub: true,
        onUpdate: self => setWorld(from + (to - from) * self.progress),
      })
    let world = webProjects.length
    const segments = [...(appProjects.length ? ['.apps'] : []), '.about', '.contact'].map(section => segment(section, world, ++world))
    void document.fonts?.ready.then(() => ScrollTrigger.refresh())

    return () => {
      segments.forEach(s => s.kill())
      document.removeEventListener('click', onAnchor)
      gsap.ticker.remove(tick)
      lenis?.destroy()
    }
  }, [])

  return (
    <>
      <Backdrop />
      <Intro />
      <Nav />
      <main>
        <Hero />
        <Work />
        <Apps />
        <About />
        <Contact />
      </main>
      <Buddy />
    </>
  )
}
