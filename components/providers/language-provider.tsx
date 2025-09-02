"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { Language, languages } from '@/hooks/use-language'

interface LanguageContextType {
  currentLanguage: string
  languages: Language[]
  changeLanguage: (languageCode: string) => void
  getCurrentLanguage: () => Language
  t: (key: string) => string // Translation function placeholder
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState('en')

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem('app-language')
    if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    } else {
      // Detect browser language
      const browserLanguage = navigator.language.split('-')[0]
      const supportedLanguage = languages.find(lang => lang.code === browserLanguage)
      if (supportedLanguage) {
        setCurrentLanguage(browserLanguage)
      }
    }
  }, [])

  const changeLanguage = (languageCode: string) => {
    const language = languages.find(lang => lang.code === languageCode)
    if (language) {
      setCurrentLanguage(languageCode)
      localStorage.setItem('app-language', languageCode)
      
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: languageCode } 
      }))
    }
  }

  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }

  // Placeholder translation function - you can integrate with react-i18next or similar
  const t = (key: string): string => {
    // This is a simple placeholder - replace with actual translation logic
    const translations: Record<string, Record<string, string>> = {
      en: {
        'dashboard': 'Dashboard',
        'welcome': 'Welcome to your AppDashboard. Manage your services and content from here.',
        'quick_actions': 'Quick Actions',
        'recent_activity': 'Recent Activity',
        'analytics': 'Analytics',
      },
      es: {
        'dashboard': 'Panel de Control',
        'welcome': 'Bienvenido a tu Panel de Control. Gestiona tus servicios y contenido desde aquí.',
        'quick_actions': 'Acciones Rápidas',
        'recent_activity': 'Actividad Reciente',
        'analytics': 'Analíticas',
      },
      fr: {
        'dashboard': 'Tableau de Bord',
        'welcome': 'Bienvenue sur votre Tableau de Bord. Gérez vos services et contenu d\'ici.',
        'quick_actions': 'Actions Rapides',
        'recent_activity': 'Activité Récente',
        'analytics': 'Analyses',
      },
      // Add more languages as needed
    }

    return translations[currentLanguage]?.[key] || translations['en']?.[key] || key
  }

  const value = {
    currentLanguage,
    languages,
    changeLanguage,
    getCurrentLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguageContext() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider')
  }
  return context
}