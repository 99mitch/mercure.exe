'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { prefersReducedMotion } from '@/lib/motion'

/**
 * Hero sub-copy and CTAs: a component-level entrance (motion's job, not GSAP's).
 * Plays after the wordmark finishes typing. Under reduced motion or with JS off the
 * `.js-fade` gate never hides anything and `play` never fires, so the markup is identical
 * on server and client — no render-time branching, no hydration mismatch.
 */
export function HeroCopy({ children, playAfterMs = 1500 }: { children: ReactNode[]; playAfterMs?: number }) {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const t = window.setTimeout(() => setPlay(true), playAfterMs)
    return () => window.clearTimeout(t)
  }, [playAfterMs])

  return (
    <>
      {children.map((child, i) => (
        <motion.div
          key={i}
          className="js-fade"
          data-ready={play ? '' : undefined}
          initial={false}
          animate={play ? { y: 0 } : undefined}
          style={play ? undefined : { y: 0 }}
          transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
        >
          {child}
        </motion.div>
      ))}
    </>
  )
}
