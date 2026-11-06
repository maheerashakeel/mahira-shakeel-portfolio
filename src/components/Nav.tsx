import { useContent } from '../lib/content'

export function Nav() {
  const { nav, links } = useContent()
  const items = [
    [nav.work, '#work', nav.workSay],
    [nav.about, '#about', nav.aboutSay],
    [nav.contact, '#contact', nav.contactSay],
  ]
  return (
    <header className="nav">
      <a className="nav__name" href="#top">
        {nav.name}
      </a>
      <nav aria-label="Main">
        {items.map(([label, href, say]) => (
          <a key={href} href={href} data-say={say} data-mood="listening">
            {label}
          </a>
        ))}
      </nav>
      {links.linkedin ? (
        <a className="nav__out" href={links.linkedin} target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      ) : null}
    </header>
  )
}
