import { createContext, useContext, useState, useCallback } from 'react'
import { translations } from './translations'

const LangContext = createContext()

export function deepMerge(base, override) {
  if (!override || typeof override !== 'object') return base
  const result = { ...base }
  for (const key of Object.keys(override)) {
    if (Array.isArray(override[key])) {
      result[key] = override[key]
    } else if (typeof override[key] === 'object' && override[key] !== null && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key] || {}, override[key])
    } else {
      result[key] = override[key]
    }
  }
  return result
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'da')
  const [overrides, setOverrides] = useState(() => {
    try { return JSON.parse(localStorage.getItem('portfolio_overrides') || '{}') }
    catch { return {} }
  })

  const switchLang = (l) => {
    setLang(l)
    localStorage.setItem('lang', l)
  }

  const saveOverrides = useCallback((newOverrides) => {
    setOverrides(newOverrides)
    localStorage.setItem('portfolio_overrides', JSON.stringify(newOverrides))
  }, [])

  const t = deepMerge(translations[lang], overrides[lang] || {})

  return (
    <LangContext.Provider value={{ lang, setLang: switchLang, t, overrides, saveOverrides }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
