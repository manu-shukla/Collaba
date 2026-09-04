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
