'use client'

import { createElement, useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion, EASE, ensureGsap } from '@/lib/motion'

type Props = {
  children: ReactNode
  as?: 'div' | 'section' | 'ol' | 'ul' | 'header' | 'figure'
  className?: string
  /** Extra delay in seconds for the first child. */
  delay?: number
}

/**
 * Reveal-on-enter. Children marked `data-reveal` stagger at 60ms; without marks the
 * wrapper itself reveals. Fires once at 20% viewport entry, never replays.
 * Text gets reveals; it never gets parallax.
 */
export function Reveal({ children, as: Tag = 'div', className, delay = 0 }: Props) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    ensureGsap()
    const marked = el.querySelectorAll<HTMLElement>('[data-reveal]')
    const targets = marked.length ? Array.from(marked) : [el]

    const ctx = gsap.context(() => {
      gsap.set(targets, { opacity: 0, y: 18 })
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () =>
          gsap.to(targets, { opacity: 1, y: 0, duration: 0.52, ease: EASE.out, stagger: 0.06, delay, overwrite: true }),
      })
    })
    return () => ctx.revert()
  }, [delay])

  return createElement(Tag, { ref, className }, children)
}
