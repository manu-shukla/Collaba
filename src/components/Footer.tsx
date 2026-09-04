import { navLinks } from './Header'
import { IconHeart } from './Icons'
import { Wordmark } from './Logo'

export function Footer() {
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
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
            <a href="#pilot-request">Plan my free pilot</a>
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
