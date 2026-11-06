import { useRef, useState, type FormEvent } from 'react'

import type { Mood } from '../data/content'
import { buddySay } from '../lib/buddy'
import { useContent } from '../lib/content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

type Fields = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Fields, string>>

function validate(f: Fields): Errors {
  const e: Errors = {}
  if (f.name.trim().length < 2) e.name = 'Please add your name.'
  if (!EMAIL_RE.test(f.email.trim())) e.email = 'That email does not look right. Check the @ and the ending.'
  if (f.message.trim().length < 10) e.message = 'Please write a little more, at least 10 characters.'
  return e
}

const prompts: Record<keyof Fields, [string, Mood]> = {
  name: ['Hi! What should Mahira call you?', 'listening'],
  email: ['Your email, so she can reply.', 'listening'],
  message: ['A role, a project or a question. Anything works.', 'thinking'],
}

export function Contact() {
  const { contact, links } = useContent()
  const [f, setF] = useState<Fields>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [sent, setSent] = useState(false)
  const lastError = useRef(0)

  const set = (k: keyof Fields) => (ev: { target: { value: string } }) => {
    setF(prev => ({ ...prev, [k]: ev.target.value }))
    setSent(false)
    if (errors[k]) setErrors(prev => ({ ...prev, [k]: undefined }))
  }

  const onBlur = (k: keyof Fields) => () => {
    if (!f[k]) return
    const err = validate(f)[k]
    setErrors(prev => ({ ...prev, [k]: err }))
    if (err) lastError.current = Date.now()
    if (k === 'email') {
      if (err) buddySay('Hmm, that email looks off. Is the @ there?', 'confused')
      else buddySay('Perfect, that email looks right.', 'happy', 3500)
    }
    if (k === 'message' && err) buddySay('A bit more detail helps her reply faster.', 'curious', 5000)
    if (k === 'name' && err) buddySay('I need a real name so she knows who is writing.', 'shy', 5000)
  }

  const onFocus = (k: keyof Fields) => () => {
    if (Date.now() - lastError.current < 3500) return // let the error finish first
    buddySay(prompts[k][0], prompts[k][1], 4500)
  }

  const onSubmit = (ev: FormEvent) => {
    ev.preventDefault()
    const errs = validate(f)
    setErrors(errs)
    const firstBad = (['name', 'email', 'message'] as const).find(k => errs[k])
    if (firstBad) {
      lastError.current = Date.now()
      document.getElementById(`field-${firstBad}`)?.focus()
      buddySay(firstBad === 'email' ? 'Wait! Please fix the email first.' : 'Almost! One field still needs you.', 'surprised')
      return
    }
    const subject = encodeURIComponent(`Portfolio message from ${f.name.trim()}`)
    const body = encodeURIComponent(`${f.message.trim()}\n\n${f.name.trim()}\n${f.email.trim()}`)
    window.location.href = `mailto:${links.email}?subject=${subject}&body=${body}`
    setSent(true)
    buddySay('Your email app has the message ready. Press send there and it reaches her!', 'celebrate', 9000)
  }

  const field = (k: keyof Fields) => ({
    id: `field-${k}`,
    name: k,
    value: f[k],
    onChange: set(k),
    onFocus: onFocus(k),
    onBlur: onBlur(k),
    'aria-invalid': Boolean(errors[k]),
    'aria-describedby': errors[k] ? `err-${k}` : undefined,
  })

  return (
    <section className="contact" id="contact">
      <div className="contact__say">
        <h2>{contact.heading}</h2>
        <p>
          {contact.lead}{' '}
          <a href={`mailto:${links.email}`}>{links.email}</a>
        </p>
      </div>

      <form id="contact-form" className="form" onSubmit={onSubmit} noValidate>
        <label htmlFor="field-name">
          <span>{contact.nameLabel}</span>
          <input autoComplete="name" {...field('name')} />
          {errors.name ? <small id="err-name">{errors.name}</small> : null}
        </label>
        <label htmlFor="field-email">
          <span>{contact.emailLabel}</span>
          <input type="email" inputMode="email" autoComplete="email" {...field('email')} />
          {errors.email ? <small id="err-email">{errors.email}</small> : null}
        </label>
        <label htmlFor="field-message">
          <span>{contact.messageLabel}</span>
          <textarea rows={3} {...field('message')} />
          {errors.message ? <small id="err-message">{errors.message}</small> : null}
        </label>
        <div className="form__end">
          <button type="submit" className="go" data-spot>
            {contact.button}
          </button>
          <p aria-live="polite">{sent ? contact.sentNote : contact.note}</p>
        </div>
      </form>

      <footer className="foot">
        <span>
          © {new Date().getFullYear()} {contact.footer}
        </span>
        <span className="foot__links">
          <a href={links.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
          <a href={links.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
          {links.repo ? (
            <a href={links.repo} target="_blank" rel="noreferrer">
              Source code
            </a>
          ) : null}
        </span>
      </footer>
    </section>
  )
}
