import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
// Self-hosted so the first paint does not wait on a third-party font request.
// Variable axis covers 200–800, which spans every weight the CSS asks for.
import '@fontsource-variable/manrope'
import './styles/global.css'
import { initAnalytics } from './lib/firebase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// After render, not before: this fetches the GA4 measurement bundle, and the page
// the visitor came to see should not be waiting behind it. Google Analytics sends
// its own page_view from here; the events in the app are the ones worth naming.
initAnalytics()
