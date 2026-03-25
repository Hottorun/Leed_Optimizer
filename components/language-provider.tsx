'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Language, TranslationKey } from '@/lib/translations'
import { translations } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: React.ReactNode
  initialLanguage?: Language
}

export function LanguageProvider({ children, initialLanguage = 'de' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  useEffect(() => {
    const stored = localStorage.getItem('language') as Language | null
    if (stored && (stored === 'de' || stored === 'en')) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }, [])

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || key
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
