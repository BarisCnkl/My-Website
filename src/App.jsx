import { useEffect, lazy, Suspense } from 'react'
import './App.css'
import { LangProvider } from './i18n/LangContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Skills from './components/Skills'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Contact from './components/Contact'

const AdminApp = lazy(() => import('./admin/AdminApp'))

const isAdmin = window.location.pathname.replace(/\/$/, '').endsWith('/admin')

const VISITS_KEY = 'portfolio_visits'

function recordVisit() {
  if (sessionStorage.getItem('visit_recorded')) return
  const visits = JSON.parse(localStorage.getItem(VISITS_KEY) || '[]')
  const now = Date.now()
  const d = new Date(now)
  visits.unshift({
    id: now,
    date: `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`,
    time: `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`,
    ts: now,
    ua: navigator.userAgent,
    ref: document.referrer || 'Direkte',
  })
  if (visits.length > 1000) visits.length = 1000
  localStorage.setItem(VISITS_KEY, JSON.stringify(visits))
  sessionStorage.setItem('visit_recorded', '1')
}

export default function App() {
  useEffect(() => {
    if (isAdmin) return
    recordVisit()
    const els = document.querySelectorAll('[data-reveal]')
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transitionDelay = `${entry.target.dataset.delay ?? 0}ms`
            entry.target.classList.add('in-view')
          } else {
            entry.target.style.transitionDelay = '0ms'
            entry.target.classList.remove('in-view')
          }
        })
      },
      { threshold: 0.1 }
    )
    els.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  if (isAdmin) {
    return (
      <LangProvider>
        <Suspense fallback={null}>
          <AdminApp />
        </Suspense>
      </LangProvider>
    )
  }

  return (
    <LangProvider>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Skills />
        <Experience />
        <Projects />
        <Contact />
      </main>
    </LangProvider>
  )
}
