import gsap from 'gsap'
import { useCallback, useEffect, useRef, useState } from 'react'

import type { Mood } from '../data/content'
import { useContent } from '../lib/content'
import { onIntroDone } from '../lib/intro'

const SIZE = 62
const SIZE_SMALL = 50
const LEASH = 86 // how far it stays from the cursor, so it never covers what you are pointing at
const TOP_LIMIT = 74

type Spot = { x: number; y: number; scroll: number }
type BuddyMood = Mood | 'idle'
type Box = { l: number; t: number; r: number; b: number }

// how much of a box would sit on top of readable text
function textUnder(box: Box) {
  let area = 0
  document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main li, main a, main label, main button').forEach(el => {
    const panel = el.closest('.proj')
    if (panel && document.documentElement.classList.contains('pin') && !panel.classList.contains('is-active')) return
    const r = el.getBoundingClientRect()
    const w = Math.min(box.r, r.right) - Math.max(box.l, r.left)
    const h = Math.min(box.b, r.bottom) - Math.max(box.t, r.top)
    if (w > 0 && h > 0) area += w * h
  })
  return area
}

// A small warm creature that lives on the page. It follows the cursor at a short distance, gets
// dragged a little when the page scrolls, flies to wherever you click and explains that thing.
// All motion is written straight to transforms in one ticker: no layout, no React work per frame.
export function Buddy() {
  const { buddy } = useContent()
  const [message, setMessage] = useState<string | null>(null)
  const [leaving, setLeaving] = useState(false)
  const [mood, setMood] = useState<BuddyMood>('idle')
  const [ready, setReady] = useState(false)

  const root = useRef<HTMLDivElement>(null)
  const inner = useRef<HTMLDivElement>(null)
  const face = useRef<SVGGElement>(null)
  const antenna = useRef<SVGGElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const bubbleWidth = useRef(0)
  const bubbleHeight = useRef(0)
  const talking = useRef(false)
  const spot = useRef<Spot | null>(null)
  const timers = useRef<{ hide?: number; gone?: number; mood?: number }>({})

  const react = useCallback((next: BuddyMood) => {
    setMood(next)
    window.clearTimeout(timers.current.mood)
    timers.current.mood = window.setTimeout(() => setMood('idle'), 3800)
  }, [])

  const say = useCallback(
    (text: string, next: Mood, ms = 6500) => {
      window.clearTimeout(timers.current.hide)
      window.clearTimeout(timers.current.gone)
      setLeaving(false)
      setMessage(text)
      talking.current = true
      react(next)
      timers.current.hide = window.setTimeout(() => {
        setLeaving(true)
        talking.current = false
        spot.current = null
        timers.current.gone = window.setTimeout(() => setMessage(null), 220)
      }, ms)
    },
    [react],
  )

  // measure the bubble once per message, never per frame
  useEffect(() => {
    if (message && bubble.current) {
      bubbleWidth.current = bubble.current.offsetWidth
      bubbleHeight.current = bubble.current.offsetHeight
    }
  }, [message])

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const finePointer = window.matchMedia('(pointer: fine)').matches
    const size = () => (window.innerWidth < 700 ? SIZE_SMALL : SIZE)

    const pos = { x: window.innerWidth * 0.3, y: window.innerHeight * 0.7 }
    const vel = { x: 0, y: 0 }
    const cursor = { x: 0, y: 0, seen: false }
    const swing = { a: 0, v: 0 }
    let lastScroll = window.scrollY
    let frame = 0

    // on touch screens there is no cursor, so it rests beside whatever matters on this screen
    const restSpot = () => {
      const vh = window.innerHeight
      const s = size()
      let best: { x: number; y: number } | null = null
      let bestDistance = Infinity
      document.querySelectorAll<HTMLElement>('[data-spot]').forEach(el => {
        const panel = el.closest('.proj')
        if (panel && document.documentElement.classList.contains('pin') && !panel.classList.contains('is-active')) return
        const r = el.getBoundingClientRect()
        if (r.bottom < TOP_LIMIT || r.top > vh - 20) return
        const distance = Math.abs(r.top + r.height / 2 - vh * 0.55)
        if (distance < bestDistance) {
          bestDistance = distance
          best = { x: r.right + s * 0.9, y: r.top + r.height / 2 }
        }
      })
      return best ?? { x: window.innerWidth * 0.8, y: vh * 0.5 }
    }

    const target = () => {
      const s = size()
      const field = document.activeElement as HTMLElement | null
      if (field?.matches('.form input, .form textarea')) {
        const r = field.getBoundingClientRect()
        return { x: r.right + s * 0.85, y: r.top + Math.min(r.height / 2, 30) }
      }
      if (spot.current) return { x: spot.current.x, y: spot.current.y - (window.scrollY - spot.current.scroll) }
      if (cursor.seen && !reduce) {
        const dx = pos.x - cursor.x
        const dy = pos.y - cursor.y
        const d = Math.hypot(dx, dy) || 1
        return { x: cursor.x + (dx / d) * LEASH, y: cursor.y + (dy / d) * LEASH }
      }
      return restSpot()
    }

    const tick = (_t: number, delta: number) => {
      const el = root.current
      if (!el || document.hidden) return
      const f = Math.min(delta / 16.67, 2.5)
      const vw = window.innerWidth
      const vh = window.innerHeight
      const s = size()
      const half = s / 2 + 8
      const t = target()
      const tx = Math.min(vw - half, Math.max(half, t.x))
      const ty = Math.min(vh - half, Math.max(TOP_LIMIT + half, t.y))

      // scrolling drags it along with the page for a moment, then it catches up
      const scroll = window.scrollY
      const dragged = Math.max(-60, Math.min(60, scroll - lastScroll))
      lastScroll = scroll

      if (reduce) {
        pos.x = tx
        pos.y = ty
      } else {
        vel.x = (vel.x + (tx - pos.x) * 0.03 * f) * Math.pow(0.82, f)
        vel.y = (vel.y + (ty - pos.y) * 0.03 * f - dragged * 0.05) * Math.pow(0.82, f)
        pos.x += vel.x * f
        pos.y += vel.y * f
      }
      el.style.transform = `translate3d(${(pos.x - s / 2).toFixed(1)}px, ${(pos.y - s / 2).toFixed(1)}px, 0)`

      // it leans into the move and stretches a little
      const speed = Math.hypot(vel.x, vel.y)
      const stretch = Math.min(0.14, speed * 0.008)
      const ax = speed > 0.01 ? Math.abs(vel.x) / speed : 0
      const ay = speed > 0.01 ? Math.abs(vel.y) / speed : 0
      const lean = Math.max(-16, Math.min(16, vel.x * 1.5))
      if (inner.current) {
        inner.current.style.transform = `rotate(${lean.toFixed(1)}deg) scale(${(1 + stretch * (ax - ay)).toFixed(3)}, ${(1 + stretch * (ay - ax)).toFixed(3)})`
      }

      // the face looks at the cursor, the antenna swings behind the movement
      if (face.current) {
        const lx = cursor.seen ? cursor.x - pos.x : vel.x * 10
        const ly = cursor.seen ? cursor.y - pos.y : vel.y * 10
        const d = Math.hypot(lx, ly) || 1
        const reach = Math.min(1, d / 120)
        face.current.setAttribute('transform', `translate(${((lx / d) * 8 * reach).toFixed(2)} ${((ly / d) * 6 * reach).toFixed(2)})`)
      }
      if (antenna.current) {
        swing.v = (swing.v + (-vel.x * 2.6 - swing.a) * 0.09 * f) * Math.pow(0.86, f)
        swing.a += swing.v * f
        antenna.current.setAttribute('transform', `rotate(${Math.max(-34, Math.min(34, swing.a)).toFixed(1)} 50 34)`)
      }

      const b = bubble.current
      if (b && bubbleWidth.current) {
        const w = bubbleWidth.current
        const shift = Math.min(vw - 14 - w / 2, Math.max(14 + w / 2, pos.x)) - pos.x
        b.style.translate = `calc(-50% + ${shift.toFixed(1)}px) 0`
        b.style.setProperty('--dots', `${(-shift).toFixed(1)}px`)

        // every few frames, open on whichever side covers less text
        frame += 1
        if (frame % 20 === 1) {
          const h = bubbleHeight.current
          const l = pos.x + shift - w / 2
          const above = { l, r: l + w, t: pos.y - s / 2 - 30 - h, b: pos.y - s / 2 - 30 }
          const under = { l, r: l + w, t: pos.y + s / 2 + 26, b: pos.y + s / 2 + 26 + h }
          const below = b.dataset.below === 'true'
          const margin = below ? -500 : 500
          const useBelow = above.t < TOP_LIMIT || (under.b < vh - 8 && textUnder(under) + margin < textUnder(above))
          b.dataset.below = String(useBelow)
        }
      }
    }
    gsap.ticker.add(tick)

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || !finePointer) return
      cursor.x = e.clientX
      cursor.y = e.clientY
      cursor.seen = true
    }
    const onLeave = () => {
      cursor.seen = false
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)

    // blinks at random, like something alive
    let blink: number
    const nextBlink = () => {
      blink = window.setTimeout(() => {
        inner.current?.classList.add('is-blinking')
        window.setTimeout(() => inner.current?.classList.remove('is-blinking'), 130)
        nextBlink()
      }, 1800 + Math.random() * 3200)
    }
    nextBlink()

    return () => {
      gsap.ticker.remove(tick)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
      window.clearTimeout(blink)
    }
  }, [])

  useEffect(() => {
    let t: number | undefined
    const off = onIntroDone(() => {
      setReady(true)
      t = window.setTimeout(() => say(buddy.greeting, 'happy', 6000), 1400)
    })
    return () => {
      off()
      window.clearTimeout(t)
    }
  }, [say, buddy.greeting])

  // Click anywhere: fly there, and explain it if it has something to say
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null
      if (!el || el.closest('.buddy') || el.closest('form')) return
      const withSay = el.closest<HTMLElement>('[data-say]')
      if (!withSay) {
        react('curious')
        return
      }
      const s = window.innerWidth < 700 ? SIZE_SMALL : SIZE
      // land beside the click, on whichever side hides the least text
      const gap = s * 1.05
      const spots = [
        [e.clientX - gap, e.clientY],
        [e.clientX + gap, e.clientY],
        [e.clientX, e.clientY - gap],
        [e.clientX, e.clientY + gap],
      ].map(([x, y]) => ({ x, y, cost: textUnder({ l: x - s / 2, r: x + s / 2, t: y - s / 2, b: y + s / 2 }) }))
      const best = spots.sort((a, b) => a.cost - b.cost)[0]
      spot.current = { x: best.x, y: best.y, scroll: window.scrollY }
      say(withSay.dataset.say ?? '', (withSay.dataset.mood as Mood) || 'happy')
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [react, say])

  useEffect(() => {
    const onSay = (e: Event) => {
      const d = (e as CustomEvent<{ text: string; mood: Mood; ms?: number }>).detail
      say(d.text, d.mood, d.ms)
    }
    window.addEventListener('buddy:say', onSay)
    return () => window.removeEventListener('buddy:say', onSay)
  }, [say])

  return (
    <div className={`buddy${ready ? ' is-ready' : ''}`} ref={root}>
      {message ? (
        <div key={message} ref={bubble} className={`bubble${leaving ? ' is-leaving' : ''}`} role="status" aria-live="polite">
          {message}
        </div>
      ) : null}
      <button
        type="button"
        className="buddy__body"
        aria-label="Page guide. Click for a tip."
        onClick={() => say(buddy.tip, 'playful', 6000)}
      >
        <div className="buddy__inner" ref={inner}>
          <svg viewBox="0 0 100 112" data-mood={mood} aria-hidden="true">
            <defs>
              <radialGradient id="buddy-skin" cx="0.38" cy="0.3" r="0.8">
                <stop offset="0" stopColor="#ffeec6" />
                <stop offset="0.55" stopColor="#f6c86e" />
                <stop offset="1" stopColor="#dd963a" />
              </radialGradient>
            </defs>
            <g ref={antenna}>
              <path d="M50 34 Q49 20 57 12" fill="none" stroke="#e9ae55" strokeWidth="4" strokeLinecap="round" />
              <circle cx="58" cy="10" r="6.5" fill="#ffeec6" />
            </g>
            <ellipse className="arm arm--l" cx="14" cy="76" rx="6.5" ry="10.5" fill="#eeb65c" />
            <ellipse className="arm arm--r" cx="86" cy="76" rx="6.5" ry="10.5" fill="#eeb65c" />
            <circle cx="50" cy="70" r="38" fill="url(#buddy-skin)" />
            <g ref={face}>
              <ellipse cx="29" cy="80" rx="7.5" ry="4.8" fill="#f28f7f" opacity="0.72" />
              <ellipse cx="71" cy="80" rx="7.5" ry="4.8" fill="#f28f7f" opacity="0.72" />
              <g className="eyes eyes--open">
                <ellipse cx="37" cy="65" rx="6.8" ry="8" fill="#2b1b08" />
                <ellipse cx="63" cy="65" rx="6.8" ry="8" fill="#2b1b08" />
                <circle cx="39.6" cy="61.6" r="2.6" fill="#fff" />
                <circle cx="65.6" cy="61.6" r="2.6" fill="#fff" />
              </g>
              <g className="eyes eyes--glad" fill="none" stroke="#2b1b08" strokeWidth="3.6" strokeLinecap="round">
                <path d="M30 67 Q37 57 44 67" />
                <path d="M56 67 Q63 57 70 67" />
              </g>
              <g className="brows" fill="none" stroke="#2b1b08" strokeWidth="3" strokeLinecap="round">
                <path d="M30 53 L42 50" />
                <path d="M58 50 L70 55" />
              </g>
              <path className="mouth mouth--smile" d="M43 80 Q50 87 57 80" fill="none" stroke="#2b1b08" strokeWidth="3" strokeLinecap="round" />
              <path className="mouth mouth--open" d="M41 78 Q50 95 59 78 Z" fill="#7a2e1d" stroke="#2b1b08" strokeWidth="2.4" strokeLinejoin="round" />
              <ellipse className="mouth mouth--o" cx="50" cy="83" rx="4.2" ry="5.2" fill="#7a2e1d" stroke="#2b1b08" strokeWidth="2.2" />
              <path className="mouth mouth--sad" d="M43 85 Q50 78 57 85" fill="none" stroke="#2b1b08" strokeWidth="3" strokeLinecap="round" />
              <path className="mouth mouth--side" d="M44 84 Q52 85 58 79" fill="none" stroke="#2b1b08" strokeWidth="3" strokeLinecap="round" />
            </g>
          </svg>
        </div>
      </button>
    </div>
  )
}
