"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import arTranslations from "@/locales/ar.json"
import enTranslations from "@/locales/en.json"

type Language = "ar" | "en"

interface LocaleContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: "rtl" | "ltr"
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

const translations = {
  ar: arTranslations,
  en: enTranslations,
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("ar")

  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language
    if (savedLang && (savedLang === "ar" || savedLang === "en")) {
      setLanguageState(savedLang)
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr"
  }, [language])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, params?: Record<string, string | number>): string => {
    let translation = (translations[language] as { [key: string]: string })[key] || key
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translation = translation.replace(`{${paramKey}}`, String(value))
      })
    }
    
    return translation
  }

  const dir = language === "ar" ? "rtl" : "ltr"

  return <LocaleContext.Provider value={{ language, setLanguage, t, dir }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider")
  }
  return context
}
