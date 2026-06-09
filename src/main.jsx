import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/fredoka-one/latin-400.css'
import '@fontsource/nunito/latin-400.css'
import '@fontsource/nunito/latin-600.css'
import '@fontsource/nunito/latin-700.css'
import '@fontsource/nunito/latin-800.css'
import '@fontsource/nunito/latin-900.css'
import '@fontsource/nunito/latin-ext-400.css'
import '@fontsource/nunito/latin-ext-600.css'
import '@fontsource/nunito/latin-ext-700.css'
import '@fontsource/nunito/latin-ext-800.css'
import '@fontsource/nunito/latin-ext-900.css'
// Accessibilità: font ad alta leggibilità per dislessia (attivabile dall'area genitori)
import '@fontsource/opendyslexic/latin-400.css'
import '@fontsource/opendyslexic/latin-700.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
