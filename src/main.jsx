import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/index.js'
import App from './App.jsx'

// Stale-chunk recovery: Vite fires this when a dynamically imported module fails
// to preload (typically after a new deploy invalidated the old chunk hashes).
// Reload once to pull the fresh asset map; the sessionStorage guard prevents loops.
window.addEventListener('vite:preloadError', () => {
  if (!sessionStorage.getItem('vf-chunk-reloaded')) {
    sessionStorage.setItem('vf-chunk-reloaded', '1')
    window.location.reload()
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
