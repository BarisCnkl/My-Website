import { useState, useEffect, useRef } from 'react'
import styles from './Navbar.module.css'
import { useLang } from '../i18n/LangContext'

const langs = [
  { code: 'da', img: 'https://flagcdn.com/w40/dk.png', label: 'Dansk' },
  { code: 'en', img: 'https://flagcdn.com/w40/gb.png', label: 'English' },
  { code: 'tr', img: 'https://flagcdn.com/w40/tr.png', label: 'Türkçe' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { lang, setLang, t } = useLang()
  const langRef = useRef(null)

  const links = [
    { label: t.nav.about, href: '#about' },
    { label: t.nav.skills, href: '#skills' },
    { label: t.nav.experience, href: '#experience' },
    { label: t.nav.projects, href: '#projects' },
    { label: t.nav.contact, href: '#contact' },
  ]

  const current = langs.find(l => l.code === lang)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.logo}>
        BarisC<span></span>
      </a>

      <div className={styles.right}>
        <ul className={`${styles.links} ${menuOpen ? styles.mobileOpen : ''}`}>
          <li className={styles.closeItem}>
            <button className={styles.closeBtn} onClick={() => setMenuOpen(false)} aria-label="Luk menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="22" height="22">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </li>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a>
            </li>
          ))}
          <li>
            <a
              href="https://www.linkedin.com/in/baris-cankul-832a7120b/"
              target="_blank"
              rel="noreferrer"
              className={styles.ghBtn}
            >
              LinkedIn
            </a>
          </li>
        </ul>

        <div className={styles.langPicker} ref={langRef}>
          <button
            className={styles.langToggle}
            onClick={() => setLangOpen(o => !o)}
            aria-label="Select language"
          >
            <img src={current.img} alt={current.label} className={styles.langFlag} />
            <svg
              className={`${styles.langChevron} ${langOpen ? styles.langChevronOpen : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
              width="12" height="12"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {langOpen && (
            <div className={styles.langDropdown}>
              {langs.map(l => (
                <button
                  key={l.code}
                  className={`${styles.langOption} ${lang === l.code ? styles.langOptionActive : ''}`}
                  onClick={() => { setLang(l.code); setLangOpen(false) }}
                >
                  <img src={l.img} alt={l.label} className={styles.langFlag} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={styles.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span className={menuOpen ? styles.open : ''} />
          <span className={menuOpen ? styles.open : ''} />
          <span className={menuOpen ? styles.open : ''} />
        </button>
      </div>
    </nav>
  )
}
