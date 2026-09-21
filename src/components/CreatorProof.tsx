import { SectionScene } from './Motion'

/**
 * The strip under the hero: the kinds of business a creator would be collaborating
 * with.
 *
 * The design this was built from put a row of real company wordmarks here —
 * zomato, Swiggy, mamaearth, cult.fit, zepto, The Good Bowl — under the words
 * "Trusted by growing businesses". Two problems with shipping that, both of them
 * the reason this renders categories instead:
 *
 * 1. It is a claim about business relationships. design/product-design.md §4.2
 *    rules out fake testimonials and invented social proof, and a visitor reads a
 *    logo wall as "these companies are customers" — the strongest claim on the
 *    page, and the one most likely to be checked.
 * 2. Those are other companies' trademarks. Using a mark to imply endorsement needs
 *    their written permission; the footer already carries a disclaimer for the three
 *    platform marks the site does use, which is the level of care this needs too.
 *
 * To put real logos here once they are yours to use: replace CATEGORIES with the
 * brands, swap each <li>'s text for an <img> of the mark, and change the label to
 * "Trusted by". The strip's layout does not care which it is holding.
 */
const CATEGORIES = [
  'cafés & restaurants',
  'skincare & beauty',
  'fitness studios',
  'home & decor',
  'local fashion',
] as const

export function CreatorProof() {
  return (
    <section className="strip" aria-label="The kinds of business Collaba works with">
      <SectionScene className="container strip__inner">
        <p className="strip__label">Brands we match creators with</p>
        <ul className="strip__list">
          {CATEGORIES.map((item) => (
            <li key={item}>{item}</li>
          ))}
          {/* Part of the list so it wraps with it, but quieter and without the
              separator dot in front — it closes the list rather than being another
              item in it. */}
          <li className="strip__more">and many more</li>
        </ul>
      </SectionScene>
    </section>
  )
}
