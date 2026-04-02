"use client"
import { useEffect, useState, useCallback } from 'react'

export type AppLanguage = 'en' | 'hi'
const STORAGE_KEY = 'ns_lang'

export function useLanguage(): [AppLanguage, (lang: AppLanguage) => void, () => void] {
  const [language, setLanguageState] = useState<AppLanguage>('en')

  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? (localStorage.getItem(STORAGE_KEY) as AppLanguage | null) : null
      if (stored === 'en' || stored === 'hi') {
        setLanguageState(stored)
      }
    } catch {}
  }, [])

  const setLanguage = useCallback((lang: AppLanguage) => {
    setLanguageState(lang)
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, lang)
        window.dispatchEvent(new CustomEvent('lang:change', { detail: { lang } }))
      }
    } catch {}
  }, [])

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'hi' : 'en')
  }, [language, setLanguage])

  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent
      const lang = ce.detail?.lang as AppLanguage | undefined
      if (lang === 'en' || lang === 'hi') {
        setLanguageState(lang)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('lang:change', handler as EventListener)
      return () => window.removeEventListener('lang:change', handler as EventListener)
    }
  }, [])

  return [language, setLanguage, toggleLanguage]
}
