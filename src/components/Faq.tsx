import { useState } from 'react'
import { Reveal, SectionScene } from './Motion'
import { IconPlus } from './Icons'

const faqs = [

  {
    id: 'which-platforms',
    question: 'Which platforms do you work with?',
    answer:
      "Instagram, YouTube, and Facebook. Within those we work across Reels, Stories and posts, YouTube videos, Shorts, reviews and integrations, and Facebook video and community-led local discovery. You name it, and we are on all popular social media platforms.",
  },
  {
    id: 'choose-creators',
    question: 'How do you choose creators?',
    answer:
      'We start from your goal and audience, then look at category relevance, the audience a creator actually reaches, content quality, tone, location, and practical fit such as availability and format. Follower count is one input, never the deciding one, and a person reviews every recommendation before you see it.',
  },
  {
    id: 'need-brief',
    question: 'Do I need an influencer-marketing brief already?',
    answer:
      'No. Most businesses we talk to do not have one. If you can describe your product, your customer, and the outcome you want, we will shape the brief with you and you approve it before anything is sent to creators.',
  },
  {
    id: 'after-submit',
    question: 'What happens after I submit?',
    answer:
      'Once you submit the form, we will personally review your request and reach out to you for the next step!',
  },
]

export function Faq() {
  const [openId, setOpenId] = useState<string | null>(faqs[0].id)

  return (
    <section className="section section--surface" id="faq">
      {/* Last section on the page, and its answers expand and collapse — so no
          fade-out. See the note on SectionScene's `fadeOut`. */}
      <SectionScene className="container" fadeOut={false}>
        <Reveal className="section__head section__head--center">
          <h2 className="h2">Frequently asked questions</h2>
        </Reveal>

        <div className="faq">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id
            return (
              <Reveal key={faq.id}>
                <div className="faq__item" data-open={isOpen}>
                  <h3>
                    <button
                      type="button"
                      className="faq__trigger"
                      aria-expanded={isOpen}
                      aria-controls={`${faq.id}-panel`}
                      id={`${faq.id}-trigger`}
                      onClick={() => setOpenId(isOpen ? null : faq.id)}
                    >
                      {faq.question}
                      <IconPlus className="faq__icon" />
                    </button>
                  </h3>
                  <div className="faq__panelWrap">
                    <div
                      className="faq__panel"
                      id={`${faq.id}-panel`}
                      role="region"
                      aria-labelledby={`${faq.id}-trigger`}
                    >
                      <p>{faq.answer}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </SectionScene>
    </section>
  )
}
