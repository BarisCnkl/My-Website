import { useState, useEffect, useRef } from 'react'
import { useLang, deepMerge } from '../i18n/LangContext'
import { translations } from '../i18n/translations'
import styles from './AdminApp.module.css'

const PW_KEY_LEGACY = 'portfolio_admin_pw'   // plain-text key — migration only
const PW_HASH_KEY = 'portfolio_admin_pw_hash'
const IMG_KEY = 'portfolio_profile_img'
const SKILLS_KEY = 'portfolio_skills'
const TOOLS_KEY = 'portfolio_tools'
const VISITS_KEY = 'portfolio_visits'

async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

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
const CATEGORIES = ['Sprog', 'Data', 'Web', 'Framework', 'Metode', 'Infra']

const SECTIONS = [
  { id: 'stats', label: '📊 Statistik' },
  { id: 'hero', label: '🖼 Hero' },
  { id: 'about', label: '👤 Om mig' },
  { id: 'skills', label: '💻 Kompetencer' },
  { id: 'experience', label: '💼 Erfaring' },
  { id: 'projects', label: '📁 Projekter' },
  { id: 'contact', label: '📩 Kontakt' },
  { id: 'settings', label: '⚙ Indstillinger' },
]

const LANGS = [
  { code: 'da', label: '🇩🇰 Dansk' },
  { code: 'en', label: '🇬🇧 English' },
  { code: 'tr', label: '🇹🇷 Türkçe' },
]

// ── Reusable primitives ──────────────────────────────────────────

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <input className={styles.input} type={type} value={value || ''} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function TextArea({ label, value, onChange, rows = 3 }) {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      <textarea className={styles.textarea} value={value || ''} onChange={e => onChange(e.target.value)} rows={rows} />
    </div>
  )
}

function ArrayField({ label, items, onChange }) {
  return (
    <div className={styles.arrayField}>
      <label className={styles.label}>{label}</label>
      {items.map((item, i) => (
        <div key={i} className={styles.arrayItem}>
          <input className={styles.input} value={item} onChange={e => onChange(items.map((x, j) => j === i ? e.target.value : x))} />
          <button className={styles.removeBtn} onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
      <button className={styles.addBtn} onClick={() => onChange([...items, ''])}>+ Tilføj</button>
    </div>
  )
}

// ── Section editors ──────────────────────────────────────────────

function HeroEditor({ lang, data, saveSection }) {
  const [form, setForm] = useState({ ...data })
  const [imgPreview, setImgPreview] = useState(() => localStorage.getItem(IMG_KEY) || '')
  const imgRef = useRef()

  useEffect(() => setForm({ ...data }), [lang])

  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      localStorage.setItem(IMG_KEY, ev.target.result)
      setImgPreview(ev.target.result)
      window.dispatchEvent(new Event('portfolio-img-updated'))
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className={styles.editor}>
      <h2>Hero ({lang.toUpperCase()})</h2>

      <div className={styles.field}>
        <label className={styles.label}>Profilbillede</label>
        <div className={styles.imgSection}>
          {imgPreview && <div className={styles.imgPreviewWrap}><img src={imgPreview} alt="Preview" /></div>}
          <input type="file" accept="image/*" ref={imgRef} onChange={handleImage} style={{ display: 'none' }} />
          <button className={styles.uploadBtn} onClick={() => imgRef.current.click()}>
            {imgPreview ? 'Skift billede' : 'Upload billede'}
          </button>
          {imgPreview && (
            <button className={styles.removeBtn} onClick={() => {
              localStorage.removeItem(IMG_KEY)
              setImgPreview('')
              window.dispatchEvent(new Event('portfolio-img-updated'))
            }}>Fjern</button>
          )}
        </div>
      </div>

      <Field label="Typewriter tekst" value={form.greeting} onChange={set('greeting')} />
      <TextArea label="Tagline" value={form.tagline} onChange={set('tagline')} rows={2} />
      <Field label="Tagline (fremhævet del)" value={form.taglineSpan} onChange={set('taglineSpan')} />
      <Field label="Knap 1 tekst" value={form.cta1} onChange={set('cta1')} />
      <Field label="Knap 2 tekst" value={form.cta2} onChange={set('cta2')} />

      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'hero', form)}>Gem</button>
    </div>
  )
}

function AboutEditor({ lang, data, saveSection }) {
  const [form, setForm] = useState({ ...data })
  useEffect(() => setForm({ ...data }), [lang])
  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className={styles.editor}>
      <h2>Om mig ({lang.toUpperCase()})</h2>
      <Field label="Label" value={form.label} onChange={set('label')} />
      <Field label="Overskrift" value={form.title} onChange={set('title')} />
      <TextArea label="Afsnit 1" value={form.p1} onChange={set('p1')} rows={4} />
      <TextArea label="Afsnit 2" value={form.p2} onChange={set('p2')} rows={4} />
      <TextArea label="Afsnit 3" value={form.p3} onChange={set('p3')} rows={4} />
      <hr className={styles.divider} />
      <Field label="Placering" value={form.location} onChange={set('location')} />
      <Field label="Fødselsdato / alder" value={form.age} onChange={set('age')} />
      <hr className={styles.divider} />
      <Field label="Sprog-kort titel" value={form.langCardTitle} onChange={set('langCardTitle')} />
      <Field label="Modersmål tekst" value={form.native} onChange={set('native')} />
      <Field label="Flydende tekst" value={form.fluent} onChange={set('fluent')} />
      <hr className={styles.divider} />
      <Field label="Personlighed-kort titel" value={form.personalCardTitle} onChange={set('personalCardTitle')} />
      <ArrayField label="Personlige egenskaber" items={form.traits || []} onChange={v => setForm(f => ({ ...f, traits: v }))} />
      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'about', form)}>Gem</button>
    </div>
  )
}

function SkillsEditor({ lang, data, saveSection }) {
  const [langForm, setLangForm] = useState({ ...data })
  const [skills, setSkills] = useState(() => { try { return JSON.parse(localStorage.getItem(SKILLS_KEY)) || defaultSkills } catch { return defaultSkills } })
  const [tools, setTools] = useState(() => { try { return JSON.parse(localStorage.getItem(TOOLS_KEY)) || defaultTools } catch { return defaultTools } })

  useEffect(() => setLangForm({ ...data }), [lang])

  const setLangField = key => val => setLangForm(f => ({ ...f, [key]: val }))

  const updateSkill = (i, field, val) => setSkills(prev => prev.map((s, j) => j === i ? { ...s, [field]: val } : s))

  const saveSkillsData = () => {
    localStorage.setItem(SKILLS_KEY, JSON.stringify(skills))
    localStorage.setItem(TOOLS_KEY, JSON.stringify(tools))
    window.dispatchEvent(new Event('portfolio-skills-updated'))
    alert('Kompetencer & værktøjer gemt!')
  }

  return (
    <div className={styles.editor}>
      <h2>Kompetencer ({lang.toUpperCase()})</h2>
      <Field label="Label" value={langForm.label} onChange={setLangField('label')} />
      <Field label="Overskrift" value={langForm.title} onChange={setLangField('title')} />
      <Field label="Værktøjer label" value={langForm.toolsLabel} onChange={setLangField('toolsLabel')} />
      <hr className={styles.divider} />
      <p className={styles.subHeading}>Kategori navne (dette sprog)</p>
      {Object.keys(langForm.categories || {}).map(cat => (
        <div key={cat} className={styles.arrayItem} style={{ marginBottom: 8 }}>
          <span style={{ color: '#888', fontSize: 13, minWidth: 90, paddingTop: 10 }}>{cat}:</span>
          <input
            className={styles.input}
            value={langForm.categories[cat]}
            onChange={e => setLangForm(f => ({ ...f, categories: { ...f.categories, [cat]: e.target.value } }))}
          />
        </div>
      ))}
      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'skills', langForm)}>Gem sprogtekster</button>

      <hr className={styles.divider} />
      <p className={styles.subHeading}>Kompetencer (gælder alle sprog)</p>

      {skills.map((skill, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>{skill.name || 'Ny kompetence'}</h3>
            <button className={styles.removeCardBtn} onClick={() => setSkills(s => s.filter((_, j) => j !== i))}>Slet</button>
          </div>
          <Field label="Navn" value={skill.name} onChange={v => updateSkill(i, 'name', v)} />
          <div className={styles.field}>
            <label className={styles.label}>Niveau: {skill.level}%</label>
            <div className={styles.rangeWrap}>
              <input type="range" min="0" max="100" value={skill.level} onChange={e => updateSkill(i, 'level', Number(e.target.value))} />
              <span className={styles.rangeVal}>{skill.level}%</span>
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Kategori</label>
            <select className={styles.select} value={skill.category} onChange={e => updateSkill(i, 'category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      ))}
      <button className={styles.addCardBtn} onClick={() => setSkills(s => [...s, { name: '', level: 50, category: 'Sprog' }])}>+ Tilføj kompetence</button>
      <ArrayField label="Værktøjer & teknologier" items={tools} onChange={setTools} />
      <button className={styles.saveBtn} onClick={saveSkillsData}>Gem kompetencer & værktøjer</button>
    </div>
  )
}

function ExperienceEditor({ lang, data, saveSection }) {
  const clone = d => ({ ...d, items: d.items.map(i => ({ ...i, bullets: [...i.bullets], tech: [...i.tech] })) })
  const [form, setForm] = useState(() => clone(data))
  useEffect(() => setForm(clone(data)), [lang])

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))

  const updateItem = (i, field, val) => setForm(f => {
    const items = [...f.items]; items[i] = { ...items[i], [field]: val }; return { ...f, items }
  })
  const updateBullet = (i, j, val) => setForm(f => {
    const items = [...f.items]; const bullets = [...items[i].bullets]; bullets[j] = val; items[i] = { ...items[i], bullets }; return { ...f, items }
  })
  const updateTech = (i, j, val) => setForm(f => {
    const items = [...f.items]; const tech = [...items[i].tech]; tech[j] = val; items[i] = { ...items[i], tech }; return { ...f, items }
  })
  const mutItem = (i, fn) => setForm(f => { const items = [...f.items]; items[i] = fn(items[i]); return { ...f, items } })

  return (
    <div className={styles.editor}>
      <h2>Erfaring ({lang.toUpperCase()})</h2>
      <Field label="Label" value={form.label} onChange={setField('label')} />
      <Field label="Overskrift" value={form.title} onChange={setField('title')} />
      <hr className={styles.divider} />

      {form.items.map((item, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>#{i + 1} {item.title || 'Ny erfaring'}</h3>
            <button className={styles.removeCardBtn} onClick={() => setForm(f => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}>Slet</button>
          </div>
          <Field label="Stilling" value={item.title} onChange={v => updateItem(i, 'title', v)} />
          <Field label="Virksomhed" value={item.company} onChange={v => updateItem(i, 'company', v)} />
          <Field label="Type (fx Fuldtid / Deltid)" value={item.type} onChange={v => updateItem(i, 'type', v)} />
          <Field label="Periode" value={item.period} onChange={v => updateItem(i, 'period', v)} />

          <div className={styles.arrayField}>
            <label className={styles.label}>Bullet points</label>
            {item.bullets.map((b, j) => (
              <div key={j} className={styles.arrayItem}>
                <textarea className={styles.textarea} value={b} onChange={e => updateBullet(i, j, e.target.value)} rows={2} style={{ minHeight: 56 }} />
                <button className={styles.removeBtn} onClick={() => mutItem(i, it => ({ ...it, bullets: it.bullets.filter((_, k) => k !== j) }))}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => mutItem(i, it => ({ ...it, bullets: [...it.bullets, ''] }))}>+ Tilføj punkt</button>
          </div>

          <div className={styles.arrayField}>
            <label className={styles.label}>Teknologier</label>
            {item.tech.map((t, j) => (
              <div key={j} className={styles.arrayItem}>
                <input className={styles.input} value={t} onChange={e => updateTech(i, j, e.target.value)} />
                <button className={styles.removeBtn} onClick={() => mutItem(i, it => ({ ...it, tech: it.tech.filter((_, k) => k !== j) }))}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => mutItem(i, it => ({ ...it, tech: [...it.tech, ''] }))}>+ Tilføj</button>
          </div>
        </div>
      ))}

      <button className={styles.addCardBtn} onClick={() => setForm(f => ({ ...f, items: [...f.items, { title: '', company: '', type: '', period: '', bullets: [''], tech: [''] }] }))}>
        + Tilføj erfaring
      </button>
      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'experience', form)}>Gem</button>
    </div>
  )
}

function ProjectsEditor({ lang, data, saveSection }) {
  const clone = d => ({
    ...d,
    academic: d.academic.map(p => ({ ...p, tech: [...p.tech] })),
    github: d.github.map(p => ({ ...p, tech: [...p.tech] })),
  })
  const [form, setForm] = useState(() => clone(data))
  useEffect(() => setForm(clone(data)), [lang])

  const setField = key => val => setForm(f => ({ ...f, [key]: val }))
  const mutAcademic = (i, fn) => setForm(f => { const a = [...f.academic]; a[i] = fn(a[i]); return { ...f, academic: a } })
  const mutGithub = (i, fn) => setForm(f => { const g = [...f.github]; g[i] = fn(g[i]); return { ...f, github: g } })

  return (
    <div className={styles.editor}>
      <h2>Projekter ({lang.toUpperCase()})</h2>
      <Field label="Label" value={form.label} onChange={setField('label')} />
      <Field label="Overskrift" value={form.title} onChange={setField('title')} />
      <Field label="Akademisk gruppe titel" value={form.groupAcademic} onChange={setField('groupAcademic')} />
      <Field label="GitHub gruppe titel" value={form.groupGithub} onChange={setField('groupGithub')} />

      <hr className={styles.divider} />
      <p className={styles.subHeading}>Akademiske projekter</p>

      {form.academic.map((p, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>#{i + 1} {p.title || 'Nyt projekt'}</h3>
            <button className={styles.removeCardBtn} onClick={() => setForm(f => ({ ...f, academic: f.academic.filter((_, j) => j !== i) }))}>Slet</button>
          </div>
          <Field label="Titel" value={p.title} onChange={v => mutAcademic(i, p => ({ ...p, title: v }))} />
          <Field label="Undertitel" value={p.subtitle} onChange={v => mutAcademic(i, p => ({ ...p, subtitle: v }))} />
          <TextArea label="Beskrivelse" value={p.desc} onChange={v => mutAcademic(i, p => ({ ...p, desc: v }))} rows={3} />
          <div className={styles.arrayField}>
            <label className={styles.label}>Teknologier</label>
            {p.tech.map((t, j) => (
              <div key={j} className={styles.arrayItem}>
                <input className={styles.input} value={t} onChange={e => mutAcademic(i, p => { const tech = [...p.tech]; tech[j] = e.target.value; return { ...p, tech } })} />
                <button className={styles.removeBtn} onClick={() => mutAcademic(i, p => ({ ...p, tech: p.tech.filter((_, k) => k !== j) }))}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => mutAcademic(i, p => ({ ...p, tech: [...p.tech, ''] }))}>+ Tilføj</button>
          </div>
        </div>
      ))}
      <button className={styles.addCardBtn} onClick={() => setForm(f => ({ ...f, academic: [...f.academic, { title: '', subtitle: '', desc: '', tech: [''] }] }))}>
        + Tilføj akademisk projekt
      </button>

      <hr className={styles.divider} />
      <p className={styles.subHeading}>GitHub projekter</p>

      {form.github.map((p, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardHeader}>
            <h3>#{i + 1} {p.title || 'Nyt projekt'}</h3>
            <button className={styles.removeCardBtn} onClick={() => setForm(f => ({ ...f, github: f.github.filter((_, j) => j !== i) }))}>Slet</button>
          </div>
          <Field label="Titel" value={p.title} onChange={v => mutGithub(i, p => ({ ...p, title: v }))} />
          <TextArea label="Beskrivelse" value={p.desc} onChange={v => mutGithub(i, p => ({ ...p, desc: v }))} rows={2} />
          <Field label="GitHub URL" value={p.url} onChange={v => mutGithub(i, p => ({ ...p, url: v }))} />
          <div className={styles.arrayField}>
            <label className={styles.label}>Teknologier</label>
            {p.tech.map((t, j) => (
              <div key={j} className={styles.arrayItem}>
                <input className={styles.input} value={t} onChange={e => mutGithub(i, p => { const tech = [...p.tech]; tech[j] = e.target.value; return { ...p, tech } })} />
                <button className={styles.removeBtn} onClick={() => mutGithub(i, p => ({ ...p, tech: p.tech.filter((_, k) => k !== j) }))}>✕</button>
              </div>
            ))}
            <button className={styles.addBtn} onClick={() => mutGithub(i, p => ({ ...p, tech: [...p.tech, ''] }))}>+ Tilføj</button>
          </div>
        </div>
      ))}
      <button className={styles.addCardBtn} onClick={() => setForm(f => ({ ...f, github: [...f.github, { title: '', desc: '', tech: [''], url: '' }] }))}>
        + Tilføj GitHub projekt
      </button>

      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'projects', form)}>Gem</button>
    </div>
  )
}

function ContactEditor({ lang, data, saveSection }) {
  const [form, setForm] = useState({ ...data })
  useEffect(() => setForm({ ...data }), [lang])
  const set = key => val => setForm(f => ({ ...f, [key]: val }))

  return (
    <div className={styles.editor}>
      <h2>Kontakt ({lang.toUpperCase()})</h2>
      <Field label="Label" value={form.label} onChange={set('label')} />
      <Field label="Overskrift" value={form.title} onChange={set('title')} />
      <TextArea label="Undertekst" value={form.sub} onChange={set('sub')} rows={3} />
      <Field label="Placering label" value={form.locationLabel} onChange={set('locationLabel')} />
      <Field label="Placering værdi" value={form.locationValue} onChange={set('locationValue')} />
      <Field label="Footer tekst" value={form.footer} onChange={set('footer')} />
      <button className={styles.saveBtn} onClick={() => saveSection(lang, 'contact', form)}>Gem</button>
    </div>
  )
}

function SettingsEditor({ showToast }) {
  const [cur, setCur] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState('')

  const changePw = async e => {
    e.preventDefault()
    const curHash = await sha256(cur)
    if (curHash !== localStorage.getItem(PW_HASH_KEY)) return setErr('Nuværende kode er forkert')
    if (next.length < 6) return setErr('Ny kode skal være mindst 6 tegn')
    if (next !== confirm) return setErr('Koderne matcher ikke')
    localStorage.setItem(PW_HASH_KEY, await sha256(next))
    setCur(''); setNext(''); setConfirm(''); setErr('')
    showToast('✓ Kode ændret!')
  }

  const resetAll = () => {
    if (!window.confirm('Er du sikker? Alle ændringer slettes og siden nulstilles til standard.')) return
    ;[SKILLS_KEY, TOOLS_KEY, IMG_KEY, VISITS_KEY, 'portfolio_overrides'].forEach(k => localStorage.removeItem(k))
    window.location.reload()
  }

  return (
    <div className={styles.editor}>
      <h2>Indstillinger</h2>
      <div className={styles.settingsSection}>
        <h3>Skift adgangskode</h3>
        <form onSubmit={changePw}>
          <Field label="Nuværende kode" value={cur} onChange={setCur} type="password" />
          <Field label="Ny kode (min. 6 tegn)" value={next} onChange={setNext} type="password" />
          <Field label="Bekræft ny kode" value={confirm} onChange={setConfirm} type="password" />
          {err && <p className={styles.error}>{err}</p>}
          <button type="submit" className={styles.saveBtn}>Skift kode</button>
        </form>
      </div>

      <div className={styles.dangerZone}>
        <h3>Farezone</h3>
        <p>Nulstil alle ændringer og gå tilbage til standard indholdet. Dette kan ikke fortrydes.</p>
        <button className={styles.dangerBtn} onClick={resetAll}>Nulstil alt indhold</button>
      </div>
    </div>
  )
}

// ── Visitor stats helpers ────────────────────────────────────────

function getBrowser(ua) {
  if (/Edg\//.test(ua)) return 'Edge'
  if (/OPR\//.test(ua)) return 'Opera'
  if (/Chrome\//.test(ua)) return 'Chrome'
  if (/Firefox\//.test(ua)) return 'Firefox'
  if (/Safari\//.test(ua)) return 'Safari'
  return 'Anden'
}

function getDevice(ua) {
  return /Mobi|Android|iPhone|iPad/i.test(ua) ? 'Mobil' : 'Desktop'
}

function getLast14Days() {
  const days = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(`${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`)
  }
  return days
}

function readVisits() {
  try { return JSON.parse(localStorage.getItem(VISITS_KEY) || '[]') } catch { return [] }
}

function StatsEditor({ showToast }) {
  const [visits, setVisits] = useState(readVisits)
  const days = getLast14Days()

  const countPerDay = days.map(day => ({
    day,
    count: visits.filter(v => v.date && v.date.startsWith(day)).length,
  }))
  const maxCount = Math.max(...countPerDay.map(d => d.count), 1)

  const clearStats = () => {
    if (!window.confirm('Er du sikker? Alle besøgsdata slettes permanent.')) return
    localStorage.removeItem(VISITS_KEY)
    setVisits([])
    showToast('✓ Statistik nulstillet')
  }

  const recent = visits.slice(0, 50)

  return (
    <div className={styles.editor}>
      <h2>Besøgsstatistik</h2>

      <div className={styles.statsCards}>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{visits.length}</span>
          <span className={styles.statLabel}>Totale besøg</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{countPerDay[countPerDay.length - 1].count}</span>
          <span className={styles.statLabel}>I dag</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statNum}>{visits.filter(v => getDevice(v.ua || '') === 'Mobil').length}</span>
          <span className={styles.statLabel}>Mobil besøg</span>
        </div>
      </div>

      <p className={styles.subHeading}>Besøg de seneste 14 dage</p>
      <div className={styles.barChart}>
        {countPerDay.map(({ day, count }) => (
          <div key={day} className={styles.barCol}>
            <span className={styles.barVal}>{count > 0 ? count : ''}</span>
            <div className={styles.barTrack}>
              <div className={styles.barFill} style={{ height: `${(count / maxCount) * 100}%` }} />
            </div>
            <span className={styles.barDay}>{day}</span>
          </div>
        ))}
      </div>

      <p className={styles.subHeading}>Seneste besøg</p>
      {recent.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Ingen besøg registreret endnu. Besøg forsiden for at starte optællingen.</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Dato</th>
                <th>Tid</th>
                <th>Browser</th>
                <th>Enhed</th>
                <th>Kilde</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(v => (
                <tr key={v.id}>
                  <td>{v.date}</td>
                  <td>{v.time}</td>
                  <td>{getBrowser(v.ua || '')}</td>
                  <td>{getDevice(v.ua || '')}</td>
                  <td className={styles.refCell} title={v.ref}>{v.ref}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className={styles.statsNote}>
        ⚠ Besøg gemmes kun i denne browser. For præcis statistik på tværs af alle besøgende anbefales Google Analytics.
      </p>

      <div className={styles.dangerZone} style={{ marginTop: 32 }}>
        <h3>Farezone</h3>
        <p>Slet alle besøgsdata permanent. Dette kan ikke fortrydes.</p>
        <button className={styles.dangerBtn} onClick={clearStats}>Ryd statistik</button>
      </div>
    </div>
  )
}

function SetupScreen({ onSetup }) {
  const [pw, setPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [err, setErr] = useState('')

  return (
    <div className={styles.loginWrap}>
      <form className={styles.loginBox} onSubmit={e => { e.preventDefault(); onSetup(pw, confirmPw, setErr) }}>
        <h1>Opret adgangskode</h1>
        <p>Første gang — vælg en adgangskode til admin panellet.</p>
        <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Ny adgangskode (min. 6 tegn)" autoFocus />
        <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Bekræft adgangskode" />
        {err && <p className={styles.error}>{err}</p>}
        <button type="submit">Opret kode</button>
      </form>
    </div>
  )
}

// ── Main AdminApp ────────────────────────────────────────────────

export default function AdminApp() {
  const [ready, setReady] = useState(false)
  const [hasPassword, setHasPassword] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [pwInput, setPwInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [section, setSection] = useState('stats')
  const [editLang, setEditLang] = useState('da')
  const [toast, setToast] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { overrides, saveOverrides } = useLang()

  useEffect(() => {
    async function init() {
      const legacy = localStorage.getItem(PW_KEY_LEGACY)
      if (legacy) {
        localStorage.setItem(PW_HASH_KEY, await sha256(legacy))
        localStorage.removeItem(PW_KEY_LEGACY)
      }
      setHasPassword(!!localStorage.getItem(PW_HASH_KEY))
      setReady(true)
    }
    init()
  }, [])

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  const login = async e => {
    e.preventDefault()
    const hash = await sha256(pwInput)
    if (hash === localStorage.getItem(PW_HASH_KEY)) { setAuthed(true); setLoginError('') }
    else setLoginError('Forkert adgangskode')
  }

  const setupPassword = async (pw, confirmPw, setErr) => {
    if (pw.length < 6) return setErr('Koden skal være mindst 6 tegn')
    if (pw !== confirmPw) return setErr('Koderne matcher ikke')
    localStorage.setItem(PW_HASH_KEY, await sha256(pw))
    setHasPassword(true)
  }

  const getMerged = lang => deepMerge(translations[lang], overrides[lang] || {})

  const saveSection = (lang, key, data) => {
    saveOverrides({ ...overrides, [lang]: { ...(overrides[lang] || {}), [key]: data } })
    showToast('✓ Gemt!')
  }

  if (!ready) return null

  if (!hasPassword) {
    return <SetupScreen onSetup={setupPassword} />
  }

  if (!authed) {
    return (
      <div className={styles.loginWrap}>
        <form className={styles.loginBox} onSubmit={login}>
          <h1>Admin Panel</h1>
          <p>Skriv din adgangskode for at fortsætte</p>
          <input type="password" value={pwInput} onChange={e => setPwInput(e.target.value)} placeholder="Adgangskode" autoFocus />
          {loginError && <p className={styles.error}>{loginError}</p>}
          <button type="submit">Log ind</button>
        </form>
      </div>
    )
  }

  const merged = getMerged(editLang)

  return (
    <div className={styles.admin}>
      {toast && <div className={styles.toast}>{toast}</div>}

      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarMobileOpen : ''}`}>
        <div className={styles.sidebarLogo}>
          ⚡ Admin Panel
          <button className={styles.sidebarCloseBtn} onClick={() => setSidebarOpen(false)} aria-label="Luk menu">✕</button>
        </div>
        <nav>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`${styles.navItem} ${section === s.id ? styles.navItemActive : ''}`}
              onClick={() => { setSection(s.id); setSidebarOpen(false) }}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <a href="/My-Website" className={styles.backBtn}>← Tilbage til siden</a>
      </aside>

      <main className={styles.main}>
        <button className={styles.mobileBurger} onClick={() => setSidebarOpen(true)} aria-label="Åbn menu">
          <span /><span /><span />
        </button>
        {section !== 'settings' && section !== 'stats' && (
          <div className={styles.langTabs}>
            {LANGS.map(l => (
              <button key={l.code} className={`${styles.langTab} ${editLang === l.code ? styles.langTabActive : ''}`} onClick={() => setEditLang(l.code)}>
                {l.label}
              </button>
            ))}
          </div>
        )}

        {section === 'hero'       && <HeroEditor       lang={editLang} data={merged.hero}       saveSection={saveSection} />}
        {section === 'about'      && <AboutEditor      lang={editLang} data={merged.about}      saveSection={saveSection} />}
        {section === 'skills'     && <SkillsEditor     lang={editLang} data={merged.skills}     saveSection={saveSection} />}
        {section === 'experience' && <ExperienceEditor lang={editLang} data={merged.experience} saveSection={saveSection} />}
        {section === 'projects'   && <ProjectsEditor   lang={editLang} data={merged.projects}   saveSection={saveSection} />}
        {section === 'contact'    && <ContactEditor    lang={editLang} data={merged.contact}    saveSection={saveSection} />}
        {section === 'stats'      && <StatsEditor      showToast={showToast} />}
        {section === 'settings'   && <SettingsEditor   showToast={showToast} />}
      </main>
    </div>
  )
}
