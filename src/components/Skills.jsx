import { useState, useEffect } from 'react'
import styles from './Skills.module.css'
import { useLang } from '../i18n/LangContext'

const SKILLS_KEY = 'portfolio_skills'
const TOOLS_KEY = 'portfolio_tools'

const defaultSkills = [
  { name: 'Java', level: 80, category: 'Sprog' },
  { name: 'C#', level: 85, category: 'Sprog' },
  { name: 'JavaScript', level: 70, category: 'Sprog' },
  { name: 'SQL', level: 75, category: 'Data' },
  { name: 'HTML & CSS', level: 80, category: 'Web' },
  { name: '.NET', level: 75, category: 'Framework' },
  { name: 'Excel', level: 70, category: 'Data' },
  { name: 'DevOps', level: 60, category: 'Infra' },
  { name: 'Scrum', level: 80, category: 'Metode' },
  { name: 'IoT', level: 65, category: 'Infra' },
  { name: 'Python', level: 40, category: 'Sprog' },
  { name: 'Assembly', level: 35, category: 'Sprog' },
]

const defaultTools = ['Git', 'Visual Studio', 'VS Code', 'Power Apps', 'UML', 'Azure', 'Blazor', 'Jupyter']

const readSkills = () => { try { return JSON.parse(localStorage.getItem(SKILLS_KEY)) || defaultSkills } catch { return defaultSkills } }
const readTools = () => { try { return JSON.parse(localStorage.getItem(TOOLS_KEY)) || defaultTools } catch { return defaultTools } }

export default function Skills() {
  const { t } = useLang()
  const s = t.skills
  const [skills, setSkills] = useState(readSkills)
  const [tools, setTools] = useState(readTools)

  useEffect(() => {
    const handler = () => { setSkills(readSkills()); setTools(readTools()) }
    window.addEventListener('portfolio-skills-updated', handler)
    return () => window.removeEventListener('portfolio-skills-updated', handler)
  }, [])

  return (
    <section id="skills" className={styles.section}>
      <p className="section-label" data-reveal="">{s.label}</p>
      <h2 className="section-title" data-reveal="" data-delay="100">{s.title}<span>.</span></h2>

      <div className={styles.grid} data-reveal="" data-delay="220">
        {skills.map(sk => (
          <div key={sk.name} className={styles.skill}>
            <div className={styles.skillHeader}>
              <span className={styles.skillName}>{sk.name}</span>
              <span className={styles.skillCat}>{s.categories[sk.category] || sk.category}</span>
            </div>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ '--w': `${sk.level}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className={styles.toolsWrap} data-reveal="" data-delay="120">
        <p className={styles.toolsLabel}>{s.toolsLabel}</p>
        <div className={styles.tools}>
          {tools.map(tool => (
            <span key={tool} className={styles.tool}>{tool}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
