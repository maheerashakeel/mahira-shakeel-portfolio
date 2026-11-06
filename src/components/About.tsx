import { useContent } from '../lib/content'

export function About() {
  const { about, jobs, skills } = useContent()
  return (
    <section className="about" id="about">
      <div className="about__me">
        <h2 data-say={about.headingSay} data-mood="proud">
          {about.heading}
        </h2>
        <p data-spot data-say={about.noteSay} data-mood="playful">
          {about.note}
        </p>
      </div>

      <ol className="jobs">
        {jobs.map(t => (
          <li key={t.id} data-say={t.say} data-mood="listening">
            <span>{t.date}</span>
            <strong>{t.title}</strong>
            <span>{t.role}</span>
          </li>
        ))}
      </ol>

      <div className="tools">
        {skills.map(s => (
          <div key={s.id} data-say={s.say} data-mood="thinking">
            <h3>{s.title}</h3>
            <ul className="stack">
              {s.items
                .split(',')
                .map(item => item.trim())
                .filter(Boolean)
                .map(item => (
                  <li key={item}>{item}</li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
