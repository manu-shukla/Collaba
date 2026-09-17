/**
 * Animated platform card wrapper — refined, on-brand motion effects.
 *
 * Each card gets:
 * - A rotating conic-gradient border glow in the platform's brand palette
 * - A diagonal shimmer highlight that sweeps across the card surface
 * - Tiny geometric dot particles (not emojis) that float gently upward
 * - A soft pulse on the platform icon mark
 *
 * Everything is CSS-keyframe-driven for GPU-composited 60fps on mobile.
 * `prefers-reduced-motion: reduce` hides all motion.
 */
import { useReducedMotion } from 'motion/react'

/* ------------------------------------------------------------------ */
/*  Per-platform configuration                                         */
/* ------------------------------------------------------------------ */

type PlatformConfig = {
  id: string
  /** Gradient colours for the animated border glow */
  glowColors: [string, string, string]
  /** Accent colour for floating dots */
  dotColor: string
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'instagram',
    glowColors: ['#FEDA75', '#D62976', '#4F5BD5'],
    dotColor: '#D62976',
  },
  {
    id: 'youtube',
    glowColors: ['#FF0000', '#FF6B6B', '#CC0000'],
    dotColor: '#FF0000',
  },
  {
    id: 'facebook',
    glowColors: ['#1877F2', '#42A5F5', '#0D47A1'],
    dotColor: '#1877F2',
  },
]

/* ------------------------------------------------------------------ */
/*  Dot positions — deterministic, no randomness                       */
/* ------------------------------------------------------------------ */

/** Each dot gets a fixed position, size, and animation timing */
type Dot = {
  x: string   // CSS left %
  size: number // px
  delay: number // seconds
  duration: number // seconds
}

const DOT_SETS: Record<string, Dot[]> = {
  instagram: [
    { x: '12%', size: 4, delay: 0, duration: 7 },
    { x: '35%', size: 3, delay: 2, duration: 9 },
    { x: '65%', size: 5, delay: 4, duration: 8 },
    { x: '85%', size: 3, delay: 1, duration: 10 },
    { x: '50%', size: 4, delay: 5, duration: 7.5 },
  ],
  youtube: [
    { x: '18%', size: 3, delay: 1, duration: 8 },
    { x: '42%', size: 5, delay: 3, duration: 9 },
    { x: '70%', size: 4, delay: 0, duration: 7.5 },
    { x: '88%', size: 3, delay: 2.5, duration: 10 },
    { x: '55%', size: 4, delay: 4.5, duration: 8.5 },
  ],
  facebook: [
    { x: '15%', size: 5, delay: 2, duration: 9 },
    { x: '38%', size: 3, delay: 0, duration: 7 },
    { x: '60%', size: 4, delay: 3.5, duration: 8.5 },
    { x: '82%', size: 3, delay: 1.5, duration: 10 },
    { x: '48%', size: 4, delay: 5, duration: 7.5 },
  ],
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type Props = {
  platformId: string
  children: React.ReactNode
  className?: string
}

export function PlatformCardAnimated({ platformId, children, className = '' }: Props) {
  const reduced = useReducedMotion()
  const config = PLATFORM_CONFIGS.find((p) => p.id === platformId)

  if (!config || reduced) {
    return <div className={className}>{children}</div>
  }

  const [c1, c2, c3] = config.glowColors
  const dots = DOT_SETS[platformId] ?? []

  return (
    <div
      className={`anim-card ${className}`}
      style={
        {
          '--glow-1': c1,
          '--glow-2': c2,
          '--glow-3': c3,
          '--dot-color': config.dotColor,
        } as React.CSSProperties
      }
    >
      {/* Rotating gradient border glow */}
      <div className="anim-card__glow" aria-hidden="true" />

      {/* Diagonal shimmer sweep */}
      <div className="anim-card__shimmer" aria-hidden="true" />

      {/* Floating dots — tiny circles, not emojis */}
      {dots.map((dot, i) => (
        <span
          key={i}
          className="anim-card__dot"
          aria-hidden="true"
          style={
            {
              '--dot-x': dot.x,
              '--dot-size': `${dot.size}px`,
              '--dot-delay': `${dot.delay}s`,
              '--dot-duration': `${dot.duration}s`,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Card content */}
      <div className="anim-card__body">{children}</div>
    </div>
  )
}
