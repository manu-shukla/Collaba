import { navLinks } from './Header'
import { IconHeart } from './Icons'
import { Wordmark } from './Logo'

export type FooterLink = {
  href: string
  label: string
  /**
   * `'business'` paints the link in the business side's indigo instead of the
   * footer's muted grey.
   *
   * For the one link that leaves the page it is on, where the colour is doing the
   * signposting: on the creators page every other link stays on the creator side, and
   * that page's theme has turned its own link colour coral. Declared here rather than
   * inferred from the href — "leaves this page" is something the caller knows and this
   * component cannot see.
   */
  tone?: 'business'
}

/**
 * The home page's footer nav: its own section anchors, then the page's CTA.
 *
 * A default rather than something every caller passes, because the home page is
 * the footer's usual home and repeating this list at the call site is how the two
 * drift apart.
 */
const HOME_LINKS: FooterLink[] = [...navLinks, { href: '#pilot-request', label: 'Plan my free pilot' }]

type FooterProps = {
  /**
   * The footer nav, for pages whose reader is not the home page's reader.
   *
   * Passed rather than derived, because the default set is a list of business
   * destinations — the platform sections, and "Plan my free pilot". On the creators
   * page those were both dead anchors *and* the wrong invitation: a creator who has
   * read to the bottom was being offered a campaign to buy. Whoever renders the
   * footer knows who is reading it; this component does not.
   */
  links?: FooterLink[]
}

export function Footer({ links = HOME_LINKS }: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__top">
          <div>
            {/* Second instance of the lockup on the page, so it is labelled as a
                plain "back to top" rather than repeating the brand name. */}
            <Wordmark tone="inverse" label="Back to top" />
            <p className="footer__tagline">
              Relevant influencer collaborations for growing businesses — matched, coordinated, and
              reviewed by people, across Instagram, YouTube, and Facebook.
            </p>
          </div>

          {/* Fills the second column of .footer__top, and gives phone users a way
              back up the page without scrolling to the header. */}
          <nav className="footer__links" aria-label="Footer">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={link.tone === 'business' ? 'footer__link--business' : undefined}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="footer__legal">
          Instagram, YouTube, and Facebook are trademarks of their respective owners. Collaba.in is
          an independent service and is not affiliated with, sponsored by, or endorsed by any of
          them.
        </p>

        <div className="footer__bottom">
          <p>© {new Date().getFullYear()} Collaba.in. All rights reserved.</p>
          <p className="footer__made">
            Made with <IconHeart className="footer__heart" />
            <span className="visually-hidden">love</span> for brands and creators.
          </p>
        </div>
      </div>
    </footer>
  )
}
