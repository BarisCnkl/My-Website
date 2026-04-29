import styles from './About.module.css'
import { useLang } from '../i18n/LangContext'

export default function About() {
  const { t } = useLang()
  const a = t.about

  return (
    <section id="about" className={styles.section}>
      <div className="section section-content">
        <p className="section-label" data-reveal="">{a.label}</p>
        <h2 className="section-title" data-reveal="" data-delay="100">{a.title}<span>?</span></h2>

        <div className={styles.grid} data-reveal="" data-delay="220">
          <div className={styles.text}>
            <p>{a.p1}</p>
            <p>{a.p2}</p>
            <p>{a.p3}</p>

            <div className={styles.details}>
              <div className={styles.detail}>
                <span className={styles.icon}>📍</span>
                <span>{a.location}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.icon}>🎂</span>
                <span>{a.age}</span>
              </div>
              <div className={styles.detail}>
                <span className={styles.icon}>✉️</span>
                <a href="mailto:Bariscankul2003@hotmail.com">Bariscankul2003@hotmail.com</a>
              </div>
            </div>
          </div>

          <div className={styles.cards}>
            <div className={styles.card}>
              <h3>{a.langCardTitle}</h3>
              <ul>
                <li><span>Dansk</span><span className={styles.level}>{a.native}</span></li>
                <li><span>Türkçe</span><span className={styles.level}>{a.native}</span></li>
                <li><span>English</span><span className={styles.level}>{a.fluent}</span></li>
              </ul>
            </div>
            <div className={styles.card}>
              <h3>{a.personalCardTitle}</h3>
              <div className={styles.tags}>
                {a.traits.map(trait => (
                  <span key={trait} className={styles.tag}>{trait}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
