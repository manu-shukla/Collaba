import { useEffect, useId, useRef, useState } from 'react'
import { AnimatePresence, m, useReducedMotion } from 'motion/react'
import { useScrolledPast } from '../hooks/useReveal'
import { IconClose, IconMenu } from './Icons'
import { Wordmark } from './Logo'
import { ScrollProgress, TapLink } from './Motion'

/** Shared with the footer so the two link lists cannot drift apart. */
export const navLinks = [
  { href: '#platforms', label: 'Platforms' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#why-collaba', label: 'Why Collaba' },
  // '#free-pilot' removed alongside the hidden OfferPanel — it would be a dead anchor.
]

/** Matches the 48rem breakpoint where the inline nav replaces the drawer. */
const NAV_QUERY = '(min-width: 48rem)'

export function Header() {
  const stuck = useScrolledPast(80)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const reduced = useReducedMotion()

  // Close on Escape and hold focus on the toggle so keyboard users are not
  // stranded inside a panel that has just been hidden.
  useEffect(() => {
    if (!menuOpen) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        toggleRef.current?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [menuOpen])

  // The drawer scrolls the page behind it on iOS otherwise.
  useEffect(() => {
    if (!menuOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [menuOpen])

  // CSS hides the drawer above 48rem, so drop the state too — otherwise it
  // reappears already-open when the viewport shrinks back.
  useEffect(() => {
    const query = window.matchMedia(NAV_QUERY)
    const onChange = () => {
      if (query.matches) setMenuOpen(false)
    }
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return (
    <header className={`header${stuck ? ' header--stuck' : ''}${menuOpen ? ' header--open' : ''}`}>
      <div className="container header__inner">
        <Wordmark />

        <nav className="header__nav" aria-label="Sections">
          {navLinks.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          {/* Hidden on phones: a wordmark, a full-sentence CTA and a menu button
              do not fit in 288px. The sticky StickyCta bar carries the action
              there instead. */}
          <a className="btn btn--primary btn--sm header__cta" href="#pilot-request">
            Plan my free pilot
          </a>

          <button
            type="button"
            className="header__burger"
            aria-expanded={menuOpen}
            aria-controls={menuId}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((open) => !open)}
            ref={toggleRef}
          >
            {menuOpen ? <IconClose size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Unmounted rather than CSS-hidden when closed, which keeps it out of the
          tab order and the accessibility tree for free, and lets the panel
          animate on the way out as well as in. CSS hides it from 48rem up, where
          the inline .header__nav takes over. */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.div
            className="header__drawer"
            id={menuId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={
              reduced
                ? { duration: 0 }
                : {
                    height: { type: 'spring', stiffness: 400, damping: 34, mass: 0.6 },
                    // Fades faster than it opens so the links are legible before
                    // the panel has finished settling.
                    opacity: { duration: 0.16 },
                  }
            }
          >
            <nav className="header__drawerNav" aria-label="Sections">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
              <TapLink
                className="btn btn--primary btn--block"
                href="#pilot-request"
                onClick={() => setMenuOpen(false)}
              >
                Plan my free pilot
              </TapLink>
            </nav>
          </m.div>
        )}
      </AnimatePresence>

      <ScrollProgress />
    </header>
  )
}
