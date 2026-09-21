import { useEffect } from 'react'
import { track } from '../lib/firebase'

type Placement = [selector: string, name: string]

/**
 * Where on the home page a CTA lives, keyed by the element it sits inside. The
 * value is what shows up in GA4, so it is written for whoever reads the report
 * rather than for whoever wrote the markup.
 *
 * Order is significant — first match wins, so anything nested comes before its
 * container. The phone drawer is inside the header, and reporting its CTA as
 * "header" would merge the desktop button with the one behind the menu.
 */
const HOME_PLACEMENTS: Placement[] = [
  ['.stickycta', 'sticky_bar'],
  ['.header__drawer', 'mobile_menu'],
  ['.header', 'header'],
  ['.hero', 'hero'],
  ['.offer', 'offer_panel'],
  ['.creatorband', 'creator_band'],
  ['.footer', 'footer'],
  ['.skip-link', 'skip_link'],
]

/** The creators page's own regions. No header CTA and no sticky bar there. */
export const CREATOR_PLACEMENTS: Placement[] = [
  ['.hero', 'hero'],
  ['.footer', 'footer'],
  ['.skip-link', 'skip_link'],
]

type Options = {
  /** The href these CTAs point at. One page, one conversion target. */
  href?: string
  placements?: Placement[]
  /**
   * Which funnel the click belongs to. Both pages emit `cta_click`, and without
   * this the business and creator funnels are one undifferentiated count in GA4 —
   * `placement: "hero"` means two different buttons depending on the page.
   */
  funnel?: string
}

function placementOf(link: Element, placements: Placement[]): string {
  for (const [selector, name] of placements) {
    if (link.closest(selector)) return name
  }
  return 'other'
}

/**
 * Tracks every click on a link pointing at this page's conversion target.
 *
 * One delegated listener on the document rather than an onClick on each button:
 * there are five of these CTAs across the header, hero, offer panel, footer and
 * phone bar, and threading a handler through each — plus every one added later —
 * is how half of them end up untracked. The trade-off is that placement is read
 * from the DOM here instead of being passed in, which is why the placement tables
 * above have to be kept in step with the class names they name.
 *
 * `capture: true` so the event is recorded even if something downstream stops
 * propagation, and the listener never calls preventDefault — the jump to the form
 * must work exactly as it did before analytics existed.
 */
export function useCtaAnalytics({
  href = '#pilot-request',
  placements = HOME_PLACEMENTS,
  funnel = 'business',
}: Options = {}) {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return

      const link = target.closest(`a[href="${href}"]`)
      if (!link) return

      track('cta_click', {
        funnel,
        placement: placementOf(link, placements),
        // The visible label, which is what distinguishes "Plan my free pilot"
        // from "Request my free pilot" in the report.
        link_text: (link.textContent ?? '').trim().slice(0, 100),
      })
    }

    document.addEventListener('click', onClick, { capture: true })
    return () => document.removeEventListener('click', onClick, { capture: true })
  }, [href, placements, funnel])
}
