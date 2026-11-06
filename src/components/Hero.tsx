import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'

import { useContent } from '../lib/content'
import { onIntroDone } from '../lib/intro'

gsap.registerPlugin(ScrollTrigger)

const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Karachi', hour: '2-digit', minute: '2-digit' })

export function Hero() {
  const { hero, links } = useContent()
  const root = useRef<HTMLElement>(null)
  const [time, setTime] = useState(() => clock.format(new Date()))

  useEffect(() => {
    const t = window.setInterval(() => setTime(clock.format(new Date())), 20000)
    return () => window.clearInterval(t)
  }, [])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    let off: (() => void) | undefined
    const ctx = gsap.context(() => {
      // hidden until the intro hands over, so nothing flashes first
      gsap.set('.hero__me', { opacity: 0, y: 36, scale: 1.04 })
      gsap.set('.hero__rise', { opacity: 0, y: 22 })
      off = onIntroDone(() => {
        gsap.to('.hero__me', { opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'expo.out', delay: 0.2 })
        gsap.to('.hero__rise', { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09, delay: 0.45 })
      })

      // leaving: the words lift away first, then she drifts off more slowly
      const leave = { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.fromTo('.hero__text', { y: 0, opacity: 1 }, { y: -90, opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...leave, end: '55% top' } })
      gsap.fromTo('.hero__foot', { opacity: 1 }, { opacity: 0, ease: 'none', immediateRender: false, scrollTrigger: { ...leave, end: '25% top' } })
      gsap.fromTo('.hero__depth', { y: 0 }, { y: -60, ease: 'none', immediateRender: false, scrollTrigger: leave })
    }, root)
    return () => {
      off?.()
      ctx.revert()
    }
  }, [])

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero__depth">
        <img className="hero__me" src={hero.photo} alt="Mahira Shakeel, standing outdoors at night under string lights" width={1000} height={1250} decoding="async" fetchPriority="high" />
      </div>

      <div className="hero__text">
        <h1 className="hero__rise">{hero.greeting}</h1>
        <p className="hero__rise">{hero.summary}</p>
        <div className="hero__links hero__rise">
          <a className="go" href="#work" data-spot data-say={hero.ctaSay} data-mood="excited">
            {hero.cta}
          </a>
          {links.cv ? (
            <a className="go" href={links.cv} target="_blank" rel="noreferrer">
              {hero.cvLabel}
            </a>
          ) : null}
        </div>
      </div>

      <div className="hero__foot hero__rise">
        <span>
          {hero.city} {time}
        </span>
        <span>{hero.status}</span>
      </div>
    </section>
  )
}
