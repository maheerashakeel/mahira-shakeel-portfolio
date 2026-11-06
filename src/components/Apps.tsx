import { useEffect, useRef, useState } from 'react'

import type { Project } from '../data/content'
import { pauseWorld } from '../lib/ambient'
import { appProjects } from '../lib/content'

function Arrow({ flip }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

// All mobile apps sit together in one row. Each shows a picture and a line of text,
// and clicking one opens its real demo. Nothing plays until someone asks for it.
export function Apps() {
  const row = useRef<HTMLUListElement>(null)
  const dialog = useRef<HTMLDialogElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [open, setOpen] = useState<Project | null>(null)
  const [overflow, setOverflow] = useState(false)

  useEffect(() => {
    const el = row.current
    if (!el) return
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 4)
    check()
    const watch = new ResizeObserver(check)
    watch.observe(el)
    return () => watch.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    pauseWorld(true)
    dialog.current?.showModal()
    void video.current?.play().catch(() => {})
  }, [open])

  const close = () => {
    pauseWorld(false)
    video.current?.pause()
    dialog.current?.close()
    setOpen(null)
  }

  const slide = (direction: number) => {
    const el = row.current
    el?.scrollBy({ left: direction * el.clientWidth * 0.7, behavior: 'smooth' })
  }

  if (!appProjects.length) return null

  return (
    <section className="apps" id="apps" aria-label="Mobile apps">
      <div className="apps__head">
        <h2>Mobile apps</h2>
        {overflow ? (
          <div className="apps__arrows">
            <button type="button" onClick={() => slide(-1)} aria-label="Previous apps">
              <Arrow flip />
            </button>
            <button type="button" onClick={() => slide(1)} aria-label="Next apps">
              <Arrow />
            </button>
          </div>
        ) : null}
      </div>

      <ul className="apps__row" ref={row}>
        {appProjects.map(p => (
          <li key={p.id}>
            <button type="button" className="app" onClick={() => setOpen(p)} aria-label={`Watch the ${p.title} demo`}>
              <span className="app__screen">
                <img src={p.shot} alt="" loading="lazy" decoding="async" />
                <span className="app__play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                </span>
              </span>
              <strong>{p.title}</strong>
              <span className="app__line">{p.tagline ?? p.summary}</span>
            </button>
          </li>
        ))}
      </ul>

      <dialog className="demo" ref={dialog} onClose={close} onClick={e => e.target === dialog.current && close()} data-lenis-prevent>
        {open ? (
          <div className="demo__inner">
            <div className="monitor monitor--phone demo__phone">
              {open.video ? (
                <video ref={video} src={open.video} poster={open.shot} muted loop playsInline controls={false} aria-label={`${open.title} demo`} />
              ) : (
                <img src={open.shot} alt={`${open.title} screenshot`} />
              )}
            </div>
            <div className="demo__text">
              <h3>{open.title}</h3>
              <p>{open.summary}</p>
              <p className="credit">{open.credit}</p>
              <ul className="stack">
                {open.stack.map(s => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              {open.url ? (
                <a className="go" href={open.url} target="_blank" rel="noreferrer">
                  {open.linkLabel ?? `Visit ${open.title}`}
                </a>
              ) : null}
            </div>
            <button type="button" className="demo__close" onClick={close} aria-label="Close demo">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ) : null}
      </dialog>
    </section>
  )
}
