import { createContext, useContext, type ReactNode } from 'react'
import { en, type Dict } from './en'
import { tr } from './tr'

export type Lang = 'en' | 'tr'

export const LANGS: Lang[] = ['en', 'tr']
export const DICTS: Record<Lang, Dict> = { en, tr }

export function detectLang(): Lang {
  const stored = localStorage.getItem('gitdeep_lang')
  if (stored === 'en' || stored === 'tr') return stored
  return navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en'
}

interface LocaleValue {
  lang: Lang
  t: Dict
}

const LocaleContext = createContext<LocaleValue>({ lang: 'en', t: en })

export function LocaleProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  localStorage.setItem('gitdeep_lang', lang)
  document.documentElement.lang = lang
  return <LocaleContext.Provider value={{ lang, t: DICTS[lang] }}>{children}</LocaleContext.Provider>
}

export function useLocale() {
  return useContext(LocaleContext)
}
