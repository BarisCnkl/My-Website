import styles from './Projects.module.css'
import { useLang } from '../i18n/LangContext'

function ExternalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
      <polyline points="15 3 21 3 21 9"/>
      <line x1="10" y1="14" x2="21" y2="3"/>
    </svg>
  )
}

export default function Projects() {
  const { t } = useLang()
  const p = t.projects

  return (
    <section id="projects" className={styles.section}>
      <p className="section-label" data-reveal="">{p.label}</p>
      <h2 className="section-title" data-reveal="" data-delay="100">{p.title}<span>.</span></h2>

      <h3 className={styles.groupTitle} data-reveal="" data-delay="200">{p.groupAcademic}</h3>
      <div className={styles.academicGrid}>
        {p.academic.map((proj, i) => (
          <div key={i} className={styles.academicCard} data-reveal="" data-delay={i * 100}>
            <div className={styles.acNum}>0{i + 1}</div>
            <h4 className={styles.acTitle}>{proj.title}</h4>
            <p className={styles.acSub}>{proj.subtitle}</p>
            <p className={styles.acDesc}>{proj.desc}</p>
            <div className={styles.tech}>
              {proj.tech.map(tech => <span key={tech} className={styles.techTag}>{tech}</span>)}
            </div>
          </div>
        ))}
      </div>

      <h3 className={styles.groupTitle} data-reveal="">{p.groupGithub}</h3>
      <div className={styles.githubGrid}>
        {p.github.map((proj, i) => (
          <a key={i} href={proj.url} target="_blank" rel="noreferrer" className={styles.ghCard} data-reveal="" data-delay={i * 80}>
            <div className={styles.ghTop}>
              <span className={styles.ghTitle}>{proj.title}</span>
              <ExternalIcon />
            </div>
            <p className={styles.ghDesc}>{proj.desc}</p>
            <div className={styles.tech}>
              {proj.tech.map(tech => <span key={tech} className={styles.techTag}>{tech}</span>)}
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
