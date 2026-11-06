import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useRef, useState } from 'react'

import { setWorld } from '../lib/ambient'
import { webProjects as projects } from '../lib/content'

gsap.registerPlugin(ScrollTrigger)

// The projects share one pinned stage. Scrolling never moves down a list of boxes: the world behind
// changes to that product's own colours, and its real screen rises into focus in front of it.
export function Work() {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  // decode every screen up front, so none of them hitches the moment it first appears
  useEffect(() => {
    root.current?.querySelectorAll('img').forEach(img => void img.decode().catch(() => {}))
  }, [])

  useEffect(() => {
    if (!document.documentElement.classList.contains('pin')) return
    root.current?.querySelectorAll('video').forEach(v => {
      if (v.closest('.proj')?.classList.contains('is-active')) void v.play().catch(() => {})
      else v.pause()
    })
  }, [active])

  useEffect(() => {
    const mm = gsap.matchMedia()

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {
      const el = root.current
      if (!el) return
      const panels = gsap.utils.toArray<HTMLElement>('.proj', el)
      if (!panels.length) return
      document.documentElement.classList.add('pin')

      // arrive: the hero's night turns into the first product while its screen comes up
      const arrive = gsap.fromTo(
        panels[0].querySelector('.monitor'),
        { y: 140, scale: 0.9 },
        {
          y: 0,
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            onUpdate: self => setWorld(self.progress),
          },
        },
      )

      const state = { world: 1 }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: () => `+=${window.innerHeight * Math.max(0.6, (panels.length - 1) * 1.1)}`,
          pin: true,
          scrub: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          if (tl.progress() === 0) return
          setWorld(state.world)
          setActive(Math.min(panels.length - 1, Math.max(0, Math.round(state.world) - 1)))
        },
      })

      panels.forEach((panel, i) => {
        const screen = panel.querySelector('.monitor')
        const words = panel.querySelectorAll('.proj__text > *')
        if (i > 0) {
          gsap.set(panel, { autoAlpha: 0 })
          const prev = panels[i - 1]
          tl.to(prev.querySelectorAll('.proj__text > *'), { y: -26, opacity: 0, stagger: 0.03, duration: 0.5 }, `go${i}`)
            .to(prev.querySelector('.monitor'), { y: -110, scale: 0.96, opacity: 0, duration: 0.8 }, `go${i}`)
            .to(state, { world: i + 1, duration: 1 }, `go${i}`)
            .set(prev, { autoAlpha: 0 }, `go${i}+=0.8`)
            .set(panel, { autoAlpha: 1 }, `go${i}+=0.2`)
            .fromTo(screen, { y: 150, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.8 }, `go${i}+=0.3`)
            .fromTo(words, { y: 26, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5 }, `go${i}+=0.5`)
        }
        // it never freezes: the screen keeps easing upward while you read
        tl.to(screen, { y: -18, scale: 1.012, duration: 0.55 })
      })

      return () => {
        document.documentElement.classList.remove('pin')
        arrive.scrollTrigger?.kill()
        arrive.kill()
        tl.scrollTrigger?.kill()
        tl.kill()
        gsap.set(panels, { clearProps: 'all' })
      }
    })

    // phones and reduced motion: a plain column, the world follows whichever product is on screen
    mm.add('(max-width: 899px), (prefers-reduced-motion: reduce)', () => {
      const panels = gsap.utils.toArray<HTMLElement>('.proj', root.current)
      const triggers = panels.map((panel, i) =>
        ScrollTrigger.create({
          trigger: panel,
          start: 'top 65%',
          end: 'bottom 35%',
          onToggle: self => {
            if (self.isActive) setWorld(i + 1)
          },
        }),
      )
      const videos = new IntersectionObserver(entries => {
        entries.forEach(e => {
          const v = e.target as HTMLVideoElement
          if (e.isIntersecting) void v.play().catch(() => {})
          else v.pause()
        })
      })
      root.current?.querySelectorAll('video').forEach(v => videos.observe(v))
      return () => {
        videos.disconnect()
        triggers.forEach(t => t.kill())
      }
    })

    return () => mm.revert()
  }, [])

  return (
    <section className="work" id="work" ref={root} aria-label="Selected work">
      {projects.map((p, i) => (
        <article key={p.id} className={`proj${i === active ? ' is-active' : ''}`} data-say={p.say} data-mood={p.mood}>
          <div className="proj__text">
            <h2>{p.title}</h2>
            <p>{p.summary}</p>
            <p className="credit">{p.credit}</p>
            <ul className="stack">
              {p.stack.map(s => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            {p.url ? (
              <a className="go" href={p.url} target="_blank" rel="noreferrer" data-spot>
                {p.linkLabel ?? `Visit ${p.title}`}
              </a>
            ) : null}
          </div>
          <div className={`monitor${p.frame === 'phone' ? ' monitor--phone' : ''}`}>
            {p.video ? (
              <video src={p.video} poster={p.shot} muted loop playsInline preload="metadata" aria-label={`${p.title} demo`} />
            ) : (
              <img src={p.shot} alt={`${p.title} screenshot`} decoding="async" />
            )}
          </div>
        </article>
      ))}
      <p className="work__count" aria-hidden="true">
        {active + 1} of {projects.length}
      </p>
    </section>
  )
}
