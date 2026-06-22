import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LangProvider } from './i18n/LangContext.tsx'
import { SettingsProvider } from './i18n/SettingsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <LangProvider>
        <App />
      </LangProvider>
    </SettingsProvider>
  </StrictMode>,
)

// Register the service worker for offline/PWA support (production only)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* SW registration failed — app still works online */
    })
  })
}
