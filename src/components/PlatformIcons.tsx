/**
 * Platform marks for Instagram, YouTube, and Facebook.
 *
 * Deliberately separate from Icons.tsx: that set is a 1.75px rounded-outline
 * system, while these are recognisable brand shapes and must keep their own
 * geometry to be read at a glance. `tone="brand"` uses each platform's own
 * colours; `tone="mono"` inherits currentColor for use on tinted surfaces.
 *
 * The marks are illustrative only — see the trademark note in the footer.
 */
import { useId } from 'react'

export type PlatformTone = 'brand' | 'mono'

type MarkProps = {
  size?: number
  tone?: PlatformTone
  className?: string
}

const frame = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false as const,
})

export const IconInstagram = ({ size = 20, tone = 'brand', className }: MarkProps) => {
  const gradientId = useId()
  const paint = tone === 'brand' ? `url(#${gradientId})` : 'currentColor'

  return (
    <svg {...frame(size)} className={className} fill="none">
      {tone === 'brand' && (
        <defs>
          {/* Bottom-left to top-right, mirroring the official mark's sweep. */}
          <linearGradient id={gradientId} x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FEDA75" />
            <stop offset="0.28" stopColor="#FA7E1E" />
            <stop offset="0.58" stopColor="#D62976" />
            <stop offset="0.8" stopColor="#962FBF" />
            <stop offset="1" stopColor="#4F5BD5" />
          </linearGradient>
        </defs>
      )}
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="5.25"
        stroke={paint}
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="4.1" stroke={paint} strokeWidth="2" />
      <circle cx="17.35" cy="6.65" r="1.35" fill={paint} />
    </svg>
  )
}

export const IconYouTube = ({ size = 20, tone = 'brand', className }: MarkProps) => (
  <svg {...frame(size)} className={className} fill="none">
    {/* The play triangle is a notch in the body path, so brand mode needs a light plate behind it. */}
    {tone === 'brand' && <rect x="2" y="4.5" width="20" height="15" rx="4" fill="#FFFFFF" />}
    <path
      fill={tone === 'brand' ? '#FF0000' : 'currentColor'}
      d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z"
    />
  </svg>
)

export const IconFacebook = ({ size = 20, tone = 'brand', className }: MarkProps) => (
  <svg {...frame(size)} className={className} fill="none">
    {/* Same reasoning as YouTube: the "f" is cut out of the disc. */}
    {tone === 'brand' && <circle cx="12" cy="12" r="11.5" fill="#FFFFFF" />}
    <path
      fill={tone === 'brand' ? '#1877F2' : 'currentColor'}
      d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103.512.06.99.135 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"
    />
  </svg>
)

/** Single source of truth for platform copy — mirrors design/collaba.theme.json. */
export const PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    label: 'Instagram creators',
    Icon: IconInstagram,
    formats: ['Reels', 'Stories', 'posts'],
    strength: 'Fast-moving discovery and everyday product moments, strong for lifestyle and local audiences.',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    label: 'YouTube creators',
    Icon: IconYouTube,
    formats: ['videos', 'Shorts', 'reviews', 'explainers', 'integrations'],
    strength: 'Longer attention and considered purchases, where a review or explainer does the convincing.',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    label: 'Facebook creators',
    Icon: IconFacebook,
    formats: ['videos', 'posts', 'community-led local discovery'],
    strength: 'Community and neighbourhood reach, useful when the buyer is nearby rather than nationwide.',
  },
] as const
