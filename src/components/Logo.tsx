/**
 * The Collaba.in logo lockup: a two-node mark (one business, one creator, joined
 * by a connection) followed by the lowercase wordmark.
 *
 * Unlike the Icons.tsx set this does not inherit currentColor — the two nodes
 * carry fixed brand colours, which is the whole point of the mark. `tone` swaps
 * the ink node for white so the lockup survives the dark footer.
 */
type Tone = 'ink' | 'inverse'

type LogoMarkProps = {
  size?: number
  tone?: Tone
  className?: string
}

export function LogoMark({ size = 26, tone = 'ink', className }: LogoMarkProps) {
  const structural = tone === 'inverse' ? '#FFFFFF' : 'var(--ink-900)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      focusable={false}
      className={className}
    >
      {/* A rounded step, not a lazy S: short drop out of the first node, a long
          flat run, then a short drop into the second. Geometry and the 1.55
          stroke are measured off the reference lockup — the stroke is ~0.2x the
          node diameter, and going heavier is what made the earlier version read
          as a blob. Drawn before the nodes so its caps tuck underneath. */}
      <path
        d="M6.15 8V10.55Q6.15 12.25 7.85 12.25H17.42Q19.26 12.25 19.26 14.09V16.3"
        stroke={structural}
        strokeWidth="1.55"
        strokeLinecap="round"
      />
      <circle cx="4.5" cy="5.4" r="3.8" fill={structural} />
      <circle cx="19.8" cy="18.9" r="3.45" fill="var(--coral-400)" />
    </svg>
  )
}

type WordmarkProps = {
  href?: string
  tone?: Tone
  size?: number
  /** Omit on a second instance of the lockup so screen readers hear it once. */
  label?: string
}

export function Wordmark({ href = '#top', tone = 'ink', size, label = 'Collaba.in home' }: WordmarkProps) {
  return (
    <a className="wordmark" href={href} aria-label={label}>
      <LogoMark tone={tone} size={size} />
      <span aria-hidden="true">
        collaba<span className="wordmark__dot">.in</span>
      </span>
    </a>
  )
}
