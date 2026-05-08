import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { App } from './App'
import { TranslationProvider } from './contexts/TranslationContext'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TranslationProvider>
      <AuthProvider>
        <LocationProvider>
          <App />
        </LocationProvider>
      </AuthProvider>
    </TranslationProvider>
  </StrictMode>,
)
