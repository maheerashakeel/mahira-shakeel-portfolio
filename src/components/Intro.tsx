import gsap from 'gsap'
import { useEffect, useRef, useState } from 'react'

import { worldReady } from '../lib/ambient'
import { markIntroDone } from '../lib/intro'

const SEEN_KEY = 'ms-intro-seen'

// A short entrance: the name on black, then the night opens behind it. Once per visit.
export function Intro() {
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === '1'
    } catch {
      /* storage can be blocked, the intro simply plays */
    }
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (seen || reduce) {
      setGone(true)
      markIntroDone()
      return
    }
    let cancelled = false
    const ctx = gsap.context(() => {
      gsap.from('.intro__name span', { yPercent: 110, duration: 0.9, ease: 'power4.out', stagger: 0.08 })
      gsap.to('.intro__line i', { scaleX: 1, duration: 1.1, ease: 'power2.inOut' })
    }, root)
    const minimum = new Promise(res => setTimeout(res, 1250))
    const fallback = new Promise(res => setTimeout(res, 3000))
    void Promise.all([Promise.race([worldReady(), fallback]), minimum]).then(() => {
      if (cancelled || !root.current) return
      markIntroDone()
      gsap.to(root.current, {
        opacity: 0,
        duration: 0.9,
        ease: 'power2.inOut',
        onComplete: () => {
          try {
            sessionStorage.setItem(SEEN_KEY, '1')
          } catch {
            /* ignore */
          }
          setGone(true)
        },
      })
    })
    return () => {
      cancelled = true
      ctx.revert()
    }
  }, [])

  if (gone) return null
  return (
    <div className="intro" ref={root} aria-hidden="true">
      <p className="intro__name">
        <span>Mahira</span> <span>Shakeel</span>
      </p>
      <div className="intro__line">
        <i />
      </div>
    </div>
  )
}
