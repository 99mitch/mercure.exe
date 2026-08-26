'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion, ensureGsap } from '@/lib/motion'

export const Z = { far: 0.15, mid: 0.55, near: 1 } as const

type Props = {
  children: ReactNode
  /** Scroll rate. z-far 0.15 (blob/ambient), z-mid 0.55 (imagery). Type is 1.0 and never wrapped. */
  speed: number
  /** 'top' — the section starts at the top of the page (hero); 'enter' — it scrolls into view. */
  anchor?: 'top' | 'enter'
  className?: string
}

/**
 * Parallax is depth, not decoration. The layer moves at `speed` × scroll relative to its
 * nearest positioned ancestor (the section). Only non-text layers should ever be wrapped.
 */
export function Parallax({ children, speed, anchor = 'enter', className }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    const section = el?.parentElement
    if (!el || !section || prefersReducedMotion()) return
    ensureGsap()

    const ctx = gsap.context(() => {
      const k = 1 - speed
      if (anchor === 'top') {
        gsap.fromTo(
          el,
          { y: 0 },
          {
            y: () => section.offsetHeight * k,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          },
        )
      } else {
        const dist = () => (window.innerHeight + section.offsetHeight) * k
        gsap.fromTo(
          el,
          { y: () => -dist() / 2 },
          {
            y: () => dist() / 2,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
          },
        )
      }
    })
    ScrollTrigger.refresh()
    return () => ctx.revert()
  }, [speed, anchor])

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }} aria-hidden="true">
      {children}
    </div>
  )
}
