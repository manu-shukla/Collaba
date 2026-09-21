import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CreatorsApp from './CreatorsApp'
// Self-hosted so the first paint does not wait on a third-party font request.
import '@fontsource-variable/manrope'
import './styles/global.css'
import { initAnalytics } from './lib/firebase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CreatorsApp />
  </StrictMode>,
)

// After render, not before — see the note in main.tsx. Both entry points share one
// GA4 property, so the page_path in the automatic page_view is what separates
// creator traffic from business traffic in reporting.
initAnalytics()
