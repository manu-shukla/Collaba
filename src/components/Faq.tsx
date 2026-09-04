import { useState } from 'react'
import { Reveal, SectionScene } from './Motion'
import { IconPlus } from './Icons'

const faqs = [
  {
    id: 'whats-free',
    question: 'What exactly is free in the first pilot?',
    answer:
      'Matching, briefing, coordination, and your outcome summary are free for the first agreed pilot. Anything with a real cost attached — creator compensation, product samples, travel, or paid media — is confirmed with you in writing before the pilot starts, and nothing runs until you approve it.',
  },
  {
    id: 'which-platforms',
    question: 'Which platforms do you work with?',
    answer:
      'Instagram, YouTube, and Facebook. Within those we work across Reels, Stories and posts, YouTube videos, Shorts, reviews and integrations, and Facebook video and community-led local discovery. If your audience sits mainly on another platform, tell us in the form — we will say plainly whether we can help yet rather than take the request and improvise. We are an independent service and are not affiliated with any of these platforms.',
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
      'We read your request, check whether we can genuinely help, and reply personally within one business day. If it looks like a fit, we suggest a pilot direction and set up a short discovery call. If it is not a fit yet, we will tell you that plainly instead of stringing it along.',
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
          <h2 className="h2">Before you send the form</h2>
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
