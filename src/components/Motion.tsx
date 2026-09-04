import { createContext, useContext, useEffect, useState } from 'react'
import type { ElementType, ReactNode } from 'react'
import {
  LazyMotion,
  m,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'motion/react'
import type { HTMLMotionProps, Transition, Variants } from 'motion/react'

/**
 * Loads the animation feature set for every `m.*` component in the app.
 *
 * `m` + LazyMotion rather than plain `motion.*`: the full `motion` component
 * drags the whole feature set into the entry chunk. The features are passed as a
 * function returning a dynamic import — passing the imported object directly
 * still bundles it eagerly, which measured as no saving at all. `strict` makes an
 * accidental `motion.*` import throw at runtime rather than silently undoing it.
 *
 * `domAnimation` covers animations, exit (AnimatePresence) and the
 * tap/hover/focus gestures. It leaves out drag and layout projection, which
 * nothing here needs and which would mean the much larger `domMax`.
 */
const loadFeatures = () => import('./motionFeatures').then((mod) => mod.default)

export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      {children}
    </LazyMotion>
  )
}

/* ============================================================
   Section reveal
   ============================================================ */

/** 0.75rem — the same distance the CSS-only reveal travelled. */
const REVEAL_SHIFT = 12

const revealVariants: Variants = {
  hidden: { opacity: 0, y: REVEAL_SHIFT },
  shown: { opacity: 1, y: 0 },
}

/**
 * A spring on y, a plain tween on opacity. A spring overshoots its target,
 * which reads as life on movement and as a flicker on a fade — so the two
 * values get their own curves instead of sharing one.
 */
const revealTransition: Transition = {
  // 0.42s and this curve are --dur-reveal and --ease-enter from tokens.css,
  // restated here because a MotionValue cannot read a CSS custom property.
  opacity: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
  y: { type: 'spring', stiffness: 320, damping: 30, mass: 0.7 },
}

/**
 * `once` so a reveal never replays on scroll-back, and a -10% bottom margin so
 * the run starts just after an element's edge appears rather than exactly on it.
 * No `amount` threshold: a section taller than the viewport can never expose a
 * given percentage of itself, which would leave it hidden forever on a phone.
 */
const VIEWPORT = { once: true, margin: '0px 0px -10% 0px' } as const

/** Seconds between siblings in a RevealGroup. */
const STAGGER_STEP = 0.07

/**
 * True inside a RevealGroup. A grouped Reveal must not declare its own
 * `initial`/`whileInView`: Framer only propagates a parent's variant state to
 * children that have left theirs undeclared.
 */
const GroupedContext = createContext(false)

type RevealTag = 'div' | 'li' | 'p' | 'section' | 'figure' | 'ul' | 'ol'

type RevealProps = {
  children: ReactNode
  as?: RevealTag
  className?: string
}

/**
 * Fades and lifts its content into view once.
 *
 * No per-item delay prop: ordering within a list is RevealGroup's job, and a
 * hand-passed index only ever duplicated it less well.
 */
export function Reveal({ children, as = 'div', className }: RevealProps) {
  const reduced = useReducedMotion()
  const grouped = useContext(GroupedContext)

  if (reduced) {
    const Plain = as as ElementType
    return <Plain className={className}>{children}</Plain>
  }

  // Every tag in RevealTag is a plain block element, so div's prop types fit
  // them all — the cast just avoids indexing `m` with a union, which TypeScript
  // resolves to a union of components that JSX will not accept.
  const Tag = m[as] as typeof m.div

  if (grouped) {
    return (
      <Tag className={className} variants={revealVariants} transition={revealTransition}>
        {children}
      </Tag>
    )
  }

  return (
    <Tag
      className={className}
      variants={revealVariants}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      transition={revealTransition}
    >
      {children}
    </Tag>
  )
}

type RevealGroupProps = {
  children: ReactNode
  className?: string
  /** `ol` where the group is a genuine list, so the semantics survive. */
  as?: 'div' | 'ol' | 'ul'
}

/**
 * Reveals its Reveal children one after another.
 *
 * Replaces per-child delay classes, which had to be enumerated in CSS and so
 * stopped at the third item — a fourth card in a grid landed with no delay at
 * all. Orchestration has no such ceiling, and it starts counting from when the
 * group enters view rather than from each child's own edge, so a row of cards
 * moves as one gesture instead of three unrelated ones.
 */
export function RevealGroup({ children, className, as = 'div' }: RevealGroupProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    const Plain = as as ElementType
    return <Plain className={className}>{children}</Plain>
  }

  const Tag = m[as] as typeof m.div

  return (
    <GroupedContext.Provider value={true}>
      <Tag
        className={className}
        initial="hidden"
        whileInView="shown"
        viewport={VIEWPORT}
        // staggerChildren lives on the target variant's own transition, which is
        // where Framer looks for orchestration — not on the `transition` prop.
        variants={{ hidden: {}, shown: { transition: { staggerChildren: STAGGER_STEP } } }}
      >
        {children}
      </Tag>
    </GroupedContext.Provider>
  )
}

/* ============================================================
   Section handoff
   ============================================================ */

/**
 * Where a section rests while it is *not* the one being read: dimmed, a shade
 * smaller, and offset along the direction of travel.
 *
 * Mild on purpose. At 0.55 the outgoing copy is still legible, so the page still
 * reads as one document rather than a slideshow, and 2% of scale over 24px is
 * about the most that registers as depth instead of as the layout shifting under
 * the reader. Raising these is the one knob to turn if the effect wants to be
 * more theatrical.
 */
const SCENE_DIM = 0.55
const SCENE_SCALE = 0.98
const SCENE_SHIFT = 24

const clamp01 = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value)

type SectionSceneProps = {
  children: ReactNode
  className?: string
  /**
   * Set false where a section has to sit at full strength once it has been read.
   * Two cases call for it:
   *
   * - The last section on the page. Its exit is measured against its own bottom
   *   edge reaching the top of the viewport, and there is not a full half-screen
   *   of footer below it to scroll — so its exit progress freezes part-way and
   *   the section would rest permanently dimmed at the end of the document.
   * - Anything holding controls. Dimming and shifting a form while someone is
   *   working through it is a usability bug wearing an effect's clothes.
   */
  fadeOut?: boolean
}

/**
 * Hands the reader from one section to the next: content rises and sharpens as
 * its section takes the middle of the screen, then sinks and dims as the next
 * one arrives. Bound straight to scroll position, with no spring — a spring would
 * let the content lag behind the finger, which reads as the page slipping.
 *
 * Takes the place of a section's `.container` rather than wrapping the
 * `<section>`, which is not a stylistic preference: sections carry full-bleed
 * backgrounds and `border-block`, so transforming one shrinks its background
 * away from its neighbour's and opens a stripe of bare page between the two —
 * most visible where the two sections have different backgrounds. Moving the
 * inner container animates the content and leaves all the chrome where it was.
 *
 * Pass the container's own classes through `className`; this renders one element,
 * so it does not add a level to the DOM.
 */
export function SectionScene({ children, className, fadeOut = true }: SectionSceneProps) {
  const reduced = useReducedMotion()

  // A callback ref rather than useRef, because *when* the node arrives is not
  // ours to predict: LazyMotion resolves the feature bundle with a dynamic
  // import, so on the first commit `m.div` has not attached a ref yet and an
  // effect reading `ref.current` finds null and silently does nothing. As state,
  // the node re-runs the effect whenever it does land.
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  // Set directly, never chained through useTransform. A derived value recomputes
  // on Motion's own frame loop, so setting its parent from the rAF below raced
  // that loop: `y` (bound straight to a value) kept up while the derived opacity
  // and scale sat a frame behind, and with no further scroll to tick the loop
  // they stayed behind — leaving sections at full opacity but shifted 24px.
  // Owning all three means one write path and no ordering to get wrong.
  //
  // The initial values are the settled state, which is also the fail-safe
  // direction: if the measurement never runs, sections stay fully legible rather
  // than stuck dim.
  const opacity = useMotionValue(1)
  const scale = useMotionValue(1)
  const y = useMotionValue(0)

  useEffect(() => {
    if (!node || reduced) return

    let queued = 0

    // Measured here rather than with useScroll({ target }), which reports 0 until
    // the first real scroll event: on load every scene read as "not yet entered"
    // and painted dimmed, and the hero — already in view — stayed that way until
    // the reader moved. The arithmetic is shorter than working around that, and
    // it is right on the first frame.
    const measure = () => {
      queued = 0
      const { top, bottom } = node.getBoundingClientRect()
      const view = window.innerHeight
      // Half a viewport of travel at each end, whatever the section's own height,
      // so a long section is not still fading while a screenful of its text is in
      // view. The two ranges cannot overlap: `entered` completes when the top edge
      // reaches the middle of the screen and `left` only starts once the bottom
      // edge gets there, leaving a settled window as long as the section itself.
      const half = view / 2
      const entered = clamp01((view - top) / half)
      const left = fadeOut ? clamp01((half - bottom) / half) : 0
      const focus = Math.min(entered, 1 - left)

      opacity.set(SCENE_DIM + (1 - SCENE_DIM) * focus)
      scale.set(SCENE_SCALE + (1 - SCENE_SCALE) * focus)
      // Not a function of `focus`: the two ends travel in opposite directions and
      // a single 0..1 ramp cannot say which end it is at. Content waiting below
      // starts low and rises; content on its way out keeps going up and leaves.
      y.set((1 - entered) * SCENE_SHIFT - left * SCENE_SHIFT)
    }

    // Coalesced to one read per frame: a scroll event can fire several times
    // between paints, and re-measuring for each is work nobody sees.
    const schedule = () => {
      if (!queued) queued = requestAnimationFrame(measure)
    }

    // Fires once on observe, which is the initial measurement, and again on any
    // reflow afterwards. Both targets are needed: the section itself catches it
    // growing (an FAQ answer opening), and the document catches this section being
    // *moved* by something above it changing height. The second case is not
    // hypothetical — the webfont swapping in after first paint reflows the page,
    // and watching only the element left every below-the-fold section holding the
    // position it was measured at before the swap.
    const observer = new ResizeObserver(schedule)
    observer.observe(node)
    observer.observe(document.documentElement)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      if (queued) cancelAnimationFrame(queued)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [fadeOut, node, opacity, reduced, scale, y])

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div className={className} ref={setNode} style={{ opacity, scale, y }}>
      {children}
    </m.div>
  )
}

/* ============================================================
   Scroll-linked chrome
   ============================================================ */

/**
 * Reading-position bar for the sticky header.
 *
 * Driven by actual scroll offset rather than a triggered animation, then pushed
 * through a spring: bound directly, the bar tracks every jitter of a flick on a
 * phone, and the page has enough length that a reader benefits from knowing how
 * much of it is left.
 */
export function ScrollProgress() {
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 190, damping: 28, restDelta: 0.001 })

  if (reduced) return null

  return <m.div className="header__progress" style={{ scaleX }} aria-hidden="true" />
}

/* ============================================================
   Press feedback
   ============================================================ */

const TAP = { scale: 0.97, y: 0 } as const
const HOVER = { y: -1 } as const

/**
 * True when the pointer can actually hover, mirroring the `(hover: hover)` gate
 * the stylesheet uses.
 *
 * Framer's `whileHover` listens on pointerenter, which mobile browsers do fire
 * on tap — so without this the hover state latches on after a finger lifts,
 * which is the exact behaviour the CSS gating exists to prevent.
 */
function useHoverCapable() {
  const [capable, setCapable] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(hover: hover)')
    const onChange = () => setCapable(query.matches)
    onChange()
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  return capable
}

/**
 * Interaction states for a `.btn`, driven by Framer rather than CSS.
 *
 * The hover lift is declared here even though the stylesheet already has one,
 * because Framer writes `transform` inline: after the first press it emits
 * `transform: none`, which outranks `:hover { transform: translateY(-1px) }` in
 * the stylesheet and would silently kill the lift from then on. Owning both
 * states in one system removes the conflict instead of racing it. The CSS rule
 * still serves every `.btn` that is not a motion component.
 *
 * The press dip is the part phones actually need — the CSS hover states are
 * gated behind `(hover: hover)`, so touch gets no acknowledgement otherwise.
 */
function useTapProps() {
  const reduced = useReducedMotion()
  const hoverable = useHoverCapable()

  if (reduced) return {}
  return { whileTap: TAP, whileHover: hoverable ? HOVER : undefined }
}

/**
 * An anchor that lifts on hover and dips while pressed.
 *
 * Typed with HTMLMotionProps rather than ComponentProps: React's DOM
 * `onAnimationStart` takes an AnimationEvent while Framer's takes a variant
 * definition, and the two signatures are not compatible.
 */
export function TapLink(props: HTMLMotionProps<'a'>) {
  return <m.a {...props} {...useTapProps()} />
}

/** Button counterpart to TapLink. */
export function TapButton(props: HTMLMotionProps<'button'>) {
  return <m.button {...props} {...useTapProps()} />
}
