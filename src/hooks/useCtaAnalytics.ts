import { useEffect } from 'react'
import { track } from '../lib/firebase'

/**
 * Where on the page a CTA lives, keyed by the element it sits inside. The value
 * is what shows up in GA4, so it is written for whoever reads the report rather
 * than for whoever wrote the markup.
 *
 * Order is significant — first match wins, so anything nested comes before its
 * container. The phone drawer is inside the header, and reporting its CTA as
 * "header" would merge the desktop button with the one behind the menu.
 */
const PLACEMENTS: [selector: string, name: string][] = [
  ['.stickycta', 'sticky_bar'],
  ['.header__drawer', 'mobile_menu'],
  ['.header', 'header'],
  ['.hero', 'hero'],
  ['.offer', 'offer_panel'],
  ['.footer', 'footer'],
  ['.skip-link', 'skip_link'],
]

function placementOf(link: Element): string {
  for (const [selector, name] of PLACEMENTS) {
    if (link.closest(selector)) return name
  }
  return 'other'
}

/**
 * Tracks every click on a link pointing at the pilot request form.
 *
 * One delegated listener on the document rather than an onClick on each button:
 * there are five of these CTAs across the header, hero, offer panel, footer and
 * phone bar, and threading a handler through each — plus every one added later —
 * is how half of them end up untracked. The trade-off is that placement is read
 * from the DOM here instead of being passed in, which is why PLACEMENTS above has
 * to be kept in step with the class names it names.
 *
 * `capture: true` so the event is recorded even if something downstream stops
 * propagation, and the listener never calls preventDefault — the jump to the form
 * must work exactly as it did before analytics existed.
 */
export function useCtaAnalytics() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest('a[href="#pilot-request"]')
      if (!link) return

      track('cta_click', {
        placement: placementOf(link),
        // The visible label, which is what distinguishes "Plan my free pilot"
        // from "Request my free pilot" in the report.
        link_text: (link.textContent ?? '').trim().slice(0, 100),
      })
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [])
}
