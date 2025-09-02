"use client"

import { useState, useEffect, useCallback } from "react"

export interface Language {
  code: string
  name: string
  flag: string
}

export const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
]

/**
 * Hook for managing language selection and internationalization
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState('en')
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated immediately
    setIsHydrated(true)
    
    // Defer all client-side operations
    const initLanguage = () => {
      try {
        const savedLanguage = localStorage.getItem('app-language')
        if (savedLanguage && languages.find(lang => lang.code === savedLanguage)) {
          setCurrentLanguage(savedLanguage)
          return
        }
        
        const browserLanguage = navigator.language.split('-')[0]
        const supportedLanguage = languages.find(lang => lang.code === browserLanguage)
        if (supportedLanguage) {
          setCurrentLanguage(browserLanguage)
        }
      } catch (error) {
        console.warn('Language detection failed:', error)
      }
    }

    // Use requestAnimationFrame to defer to next frame
    requestAnimationFrame(initLanguage)
  }, [])

  const changeLanguage = useCallback((languageCode: string) => {
    if (!isHydrated) return // Prevent calls before hydration
    
    const language = languages.find(lang => lang.code === languageCode)
    if (language) {
      setCurrentLanguage(languageCode)
      try {
        localStorage.setItem('app-language', languageCode)
        window.dispatchEvent(new CustomEvent('languageChanged', { 
          detail: { language: languageCode } 
        }))
      } catch (error) {
        console.warn('Failed to save language preference:', error)
      }
    }
  }, [isHydrated])

  const getCurrentLanguage = useCallback(() => {
    return languages.find(lang => lang.code === currentLanguage) || languages[0]
  }, [currentLanguage])

  return {
    currentLanguage,
    languages,
    changeLanguage,
    getCurrentLanguage,
    isHydrated
  }
}