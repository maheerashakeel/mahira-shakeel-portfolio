import { useEffect, useRef, useState } from 'react'

import { createAmbient, getWorld, getWorlds } from '../lib/ambient'

// The fixed world behind the page. Without WebGL it falls back to plain stacked images.
export function Backdrop() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [still, setStill] = useState(false)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!canvas.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const world = createAmbient(canvas.current, !reduce)
    if (!world) setStill(true)
    return () => world?.destroy()
  }, [])

  useEffect(() => {
    if (!still) return
    const onChange = () => setActive(Math.round(getWorld()))
    window.addEventListener('world:change', onChange)
    return () => window.removeEventListener('world:change', onChange)
  }, [still])

  return (
    <div className="backdrop" aria-hidden="true">
      <canvas ref={canvas} hidden={still} />
      {still
        ? getWorlds().map((w, i) => <img key={w} src={w} alt="" style={{ opacity: i === active ? 1 : 0 }} />)
        : null}
    </div>
  )
}
