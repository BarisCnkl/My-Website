import styles from './Experience.module.css'
import { useLang } from '../i18n/LangContext'

export default function Experience() {
  const { t } = useLang()
  const e = t.experience

  return (
    <section id="experience" className={styles.section}>
      <p className="section-label" data-reveal="">{e.label}</p>
      <h2 className="section-title" data-reveal="" data-delay="100">{e.title}<span>.</span></h2>

      <div className={styles.timeline}>
        {e.items.map((item, i) => (
          <div key={i} className={styles.item} data-reveal="" data-delay={i * 180}>
            <div className={styles.dot} />
            <div className={styles.card}>
              <div className={styles.header}>
                <div>
                  <h3 className={styles.title}>{item.title}</h3>
                  <p className={styles.company}>
                    {item.company} <span>• {item.type}</span>
                  </p>
                </div>
                <span className={styles.period}>{item.period}</span>
              </div>
              <ul className={styles.bullets}>
                {item.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
              <div className={styles.tech}>
                {item.tech.map(tech => (
                  <span key={tech} className={styles.techTag}>{tech}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
