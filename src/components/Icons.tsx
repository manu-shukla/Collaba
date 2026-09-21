/**
 * Rounded outline icon set — 1.75px stroke, per collaba.theme.json iconography.
 * All icons are decorative; labels always accompany them in the markup.
 */
type IconProps = {
  size?: number
  className?: string
}

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none' as const,
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  focusable: false as const,
})

export const IconNodes = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="5" cy="12" r="2.5" />
    <circle cx="18" cy="6" r="2.5" />
    <circle cx="18" cy="18" r="2.5" />
    <path d="M7.2 10.8 15.8 7.2M7.2 13.2l8.6 3.6" />
  </svg>
)

export const IconTarget = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <circle cx="12" cy="12" r="4.5" />
    <circle cx="12" cy="12" r="1" />
  </svg>
)

export const IconEye = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </svg>
)

export const IconChart = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16v-4M13 16V8M18 16v-6" />
  </svg>
)

export const IconCheck = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m4.5 12.5 4.5 4.5 10.5-10.5" />
  </svg>
)

export const IconCheckCircle = ({ size = 28, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8 12.2 2.6 2.6L16 9.4" />
  </svg>
)

export const IconArrowRight = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4.5 12h15" />
    <path d="m13.5 6 6 6-6 6" />
  </svg>
)

export const IconPlus = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconAlert = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5v5.5M12 16.3v.2" />
  </svg>
)

export const IconClock = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
)

export const IconChat = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4.5 20l1.3-4.4A7.5 7.5 0 1 1 20 12Z" />
  </svg>
)

export const IconShield = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3.5l7 2.5v5.5c0 4-3 7.2-7 9-4-1.8-7-5-7-9V6l7-2.5Z" />
  </svg>
)

/** Shield with a tick inside — "verified", where plain IconShield reads as "protected". */
export const IconShieldCheck = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3.5l7 2.5v5.5c0 4-3 7.2-7 9-4-1.8-7-5-7-9V6l7-2.5Z" />
    <path d="m9 11.8 2.2 2.2L15.2 10" />
  </svg>
)

/**
 * Rupee, for the budget card. Drawn as strokes rather than set as a "₹" text
 * glyph so it inherits the 1.75px weight of the set instead of the body font's.
 */
export const IconRupee = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M7.5 4.5h9M7.5 8.5h9" />
    <path d="M13.5 4.5c0 2.7-2 4.9-4.7 4.9" />
    <path d="M7.5 12.5h3.2l4.8 7" />
  </svg>
)

export const IconBolt = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M13.5 3 6 13.5h4.5L10 21l7.5-10.5H13L13.5 3Z" />
  </svg>
)

export const IconStore = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 9.5V19h16V9.5" />
    <path d="M3 9.5 5 5h14l2 4.5Z" />
    <path d="M10 19v-4.5h4V19" />
  </svg>
)

/** Filled rather than outlined — the one exception in this set, so it reads at 14px. */
export const IconHeart = ({ size = 14, className }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable={false}
    className={className}
  >
    <path d="M12 20.7C8.6 18.3 3 14.6 3 9.9A4.9 4.9 0 0 1 12 7.2a4.9 4.9 0 0 1 9 2.7c0 4.7-5.6 8.4-9 11.5Z" />
  </svg>
)

export const IconMenu = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const IconClose = ({ size = 22, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconSpark = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 4.5 13.6 9 18 10.5 13.6 12 12 16.5 10.4 12 6 10.5 10.4 9Z" />
    <path d="M18.5 16.5 19 18l1.5.5-1.5.5-.5 1.5-.5-1.5L16.5 19l1.5-.5Z" />
  </svg>
)

/**
 * Category glyphs for the hero reel showcase (see ReelShowcase.tsx).
 *
 * Drawn at the same 1.75px stroke as the rest of the set even though they are
 * rendered very large and semi-transparent there — a heavier weight for that one
 * use would have made them a second icon system to maintain, and at 40% opacity
 * on a tinted poster the thin stroke reads fine.
 */

export const IconCoffee = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
    <path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M6 4.5v1.5M10 3.5v2.5M14 4.5v1.5" />
  </svg>
)

export const IconSkincare = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 3.5h4v3h-4z" />
    <path d="M7.5 6.5h7A2.5 2.5 0 0 1 17 9v9a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 7 18V9a2.5 2.5 0 0 1 .5-2.5Z" />
    <path d="M7 12.5h10" />
  </svg>
)

export const IconDumbbell = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M3 9.5v5M6 7.5v9M18 7.5v9M21 9.5v5" />
    <path d="M6 12h12" />
  </svg>
)

export const IconHome = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
    <path d="M9.5 20v-5.5h5V20" />
  </svg>
)

export const IconShirt = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M9 4 5 6.5 3.5 11l3 1V20h11v-8l3-1L19 6.5 15 4" />
    <path d="M9 4a3 3 0 0 0 6 0" />
  </svg>
)

/** Outline paper-plane, matching the platform-native "send" affordance. */
export const IconShare = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M21 3 10.5 13.5" />
    <path d="M21 3l-7 18-3.5-7.5L3 10 21 3Z" />
  </svg>
)

/* The creator flow: making something, being matched, agreeing a deal. The play
   triangle is filled because at 26px a 1.75px outline triangle inside a circle
   reads as noise rather than as a play button. */
export const IconPlayCircle = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10.4 9.2l5 2.8-5 2.8V9.2Z" fill="currentColor" stroke="none" />
  </svg>
)

export const IconUsers = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="9" cy="8.5" r="3.25" />
    <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.9a3.25 3.25 0 0 1 0 5.2" />
    <path d="M17.5 14.6a5.5 5.5 0 0 1 3 4.9" />
  </svg>
)

/**
 * An agreed brief: a page with a tick on it.
 *
 * The design showed a handshake here. Two clasped hands need a dozen curves to
 * read as hands at all, and at the 26px this is drawn at the first attempt came out
 * an unreadable squiggle — where a page with a tick is unambiguous at any size and
 * says the same thing, which is that the terms are settled.
 */
export const IconDealSigned = ({ size = 20, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 3.25h8L18.75 8v12.75H6V3.25Z" />
    <path d="M13.75 3.5V8.25h4.75" />
    <path d="m9 14.25 2 2 4-4.5" />
  </svg>
)
