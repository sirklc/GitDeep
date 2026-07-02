import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom'
import './index.css'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { detectLang, LocaleProvider, type Lang } from './i18n'

function LocalizedApp() {
  const { lang } = useParams()
  if (lang !== 'en' && lang !== 'tr') return <Navigate to={`/${detectLang()}`} replace />
  return (
    <LocaleProvider lang={lang as Lang}>
      <App />
    </LocaleProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/:lang/*" element={<LocalizedApp />} />
          <Route path="*" element={<Navigate to={`/${detectLang()}`} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
