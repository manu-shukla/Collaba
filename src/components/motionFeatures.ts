import { domAnimation } from 'motion/react'

/**
 * Exists purely to give Vite a module boundary to split on.
 *
 * `LazyMotion features={domAnimation}` with a static import defeats the point —
 * the feature set ends up in the entry chunk anyway. Handing LazyMotion a
 * function that dynamic-imports this file is what actually moves it into a
 * separate chunk, fetched once the page has painted.
 */
export default domAnimation
