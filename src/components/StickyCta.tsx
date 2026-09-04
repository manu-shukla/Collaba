import { useEffect, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useScrolledPast } from '../hooks/useReveal'
import { TapLink } from './Motion'

/**
 * Phone-only bottom CTA bar. The header has no room for a call to action next to
 * the wordmark and the menu button, so the action lives here instead — revealed
 * once the hero's own button has scrolled away, and hidden again while the form
 * itself is on screen so it never covers the submit button.
 *
 * CSS hides this from 48rem up, where the header CTA takes over.
 */
export function StickyCta() {
  // Roughly one phone viewport: past this the hero's own CTA is off screen.
  const pastHero = useScrolledPast(520)
  const [formInView, setFormInView] = useState(false)
  const reduced = useReducedMotion()

  useEffect(() => {
    const form = document.getElementById('pilot-request')
    if (!form || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setFormInView(entry.isIntersecting),
      // The footer sits right below the form; keep the bar away until the whole
      // section has passed rather than flickering at its edges.
      { threshold: 0 },
    )

    observer.observe(form)
    return () => observer.disconnect()
  }, [])

  const shown = pastHero && !formInView

  return (
    // Unmounted while hidden rather than translated off screen, which removes the
    // need to juggle aria-hidden and tabIndex on a control the user cannot see —
    // and lets it slide back out instead of vanishing.
    <AnimatePresence>
      {shown && (
        <m.div
          className="stickycta"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={
            reduced
              ? { duration: 0 }
              : { type: 'spring', stiffness: 320, damping: 32, mass: 0.7 }
          }
        >
          <TapLink className="btn btn--primary btn--block" href="#pilot-request">
            Plan my free pilot
          </TapLink>
        </m.div>
      )}
    </AnimatePresence>
  )
}
