"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

// Import modular translation files
import arCommon from "@/locales/ar/common.json"
import arHome from "@/locales/ar/home.json"
import arProduct from "@/locales/ar/product.json"
import arProfile from "@/locales/ar/profile.json"
import arSeller from "@/locales/ar/seller.json"
import arAdmin from "@/locales/ar/admin.json"
import arBuyer from "@/locales/ar/buyer.json"
import arOrders from "@/locales/ar/orders.json"
import arPrivacy from "@/locales/ar/privacy.json"
import arTerms from "@/locales/ar/terms.json"
import arFaq from "@/locales/ar/faq.json"
import arHelp from "@/locales/ar/help.json"
import arFooter from "@/locales/ar/footer.json"
import arHeader from "@/locales/ar/header.json"

import enCommon from "@/locales/en/common.json"
import enHome from "@/locales/en/home.json"
import enProduct from "@/locales/en/product.json"
import enProfile from "@/locales/en/profile.json"
import enSeller from "@/locales/en/seller.json"
import enAdmin from "@/locales/en/admin.json"
import enBuyer from "@/locales/en/buyer.json"
import enOrders from "@/locales/en/orders.json"
import enPrivacy from "@/locales/en/privacy.json"
import enTerms from "@/locales/en/terms.json"
import enFaq from "@/locales/en/faq.json"
import enHelp from "@/locales/en/help.json"
import enFooter from "@/locales/en/footer.json"
import enHeader from "@/locales/en/header.json"

// Combine modular translations

type Language = "ar" | "en"

interface LocaleContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: "rtl" | "ltr"
}

// Create a default context value
const defaultLocaleContext: LocaleContextType = {
  language: "ar",
  setLanguage: () => { },
  t: (key) => key,
  dir: "rtl",
};


const LocaleContext = createContext<LocaleContextType>(defaultLocaleContext)

// Combine modular translations
const arTranslations = {
  common: arCommon,
  home: arHome,
  product: arProduct,
  profile: arProfile,
  seller: arSeller,
  admin: arAdmin,
  buyer: arBuyer,
  orders: arOrders,
  privacy: arPrivacy,
  terms: arTerms,
  faq: arFaq,
  help: arHelp,
  footer: arFooter,
  header: arHeader
}

const enTranslations = {
  common: enCommon,
  home: enHome,
  product: enProduct,
  profile: enProfile,
  seller: enSeller,
  admin: enAdmin,
  buyer: enBuyer,
  orders: enOrders,
  privacy: enPrivacy,
  terms: enTerms,
  faq: enFaq,
  help: enHelp,
  footer: enFooter,
  header: enHeader
}

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

    const translationSet = translations[language] as Record<string, any>

    // Handle nested keys (e.g., "common.backToHome")
    if (key.includes('.')) {
      const parts = key.split('.')

      // Try to find in modular structure first
      let current: Record<string, unknown> | string | null = translationSet
      for (let i = 0; i < parts.length; i++) {
        if (current && typeof current === 'object' && current !== null && parts[i] in current) {
          current = (current as Record<string, unknown>)[parts[i]] as Record<string, unknown> | string | null
        } else {
          current = null
          break
        }
      }

      if (current && typeof current === 'string') {
        let translation = current

        if (params) {
          Object.entries(params).forEach(([paramKey, value]: [string, string | number]) => {
            translation = translation.replace(`{${paramKey}}`, String(value))
          })
        }

        return translation
      }
    }

    // Fallback to flat structure for legacy keys
    let translation = translationSet[key] as string || key

    if (params) {
      Object.entries(params).forEach(([paramKey, value]: [string, string | number]) => {
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
