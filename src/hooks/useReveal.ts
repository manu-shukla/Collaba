import { useEffect, useState } from 'react'

/**
 * True once the page has scrolled past `offset` px — used for the sticky header
 * and the phone CTA bar.
 *
 * Section reveals used to live here too; they are now Framer Motion's
 * `whileInView`, which handles the observer, the once-only latch and the
 * reduced-motion preference itself. See src/components/Motion.tsx.
 */
export function useScrolledPast(offset = 80) {
  const [past, setPast] = useState(false)

  useEffect(() => {
    // Coalesced into one read per frame. A bare scroll handler fires far more
    // often than that during a flick on a phone, and each call read scrollY —
    // forcing layout — then set state on the same value over and over.
    let frame = 0

    const read = () => {
      frame = 0
      setPast(window.scrollY > offset)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [offset])

  return past
}
