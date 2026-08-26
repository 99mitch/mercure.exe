'use client'

import { useEffect } from 'react'
import { createMotionRuntime, ScrollTrigger, prefersReducedMotion } from '@/lib/motion'

/**
 * Boots the site motion runtime (Tempus -> Lenis -> GSAP) once, for the whole site layout.
 * Renders nothing. Under reduced motion it is a no-op and the document scrolls natively.
 */
export function SmoothScroll() {
  useEffect(() => {
    const runtime = createMotionRuntime()
    if (prefersReducedMotion()) return runtime.destroy

    const refresh = () => ScrollTrigger.refresh()
    document.fonts?.ready.then(refresh)
    const t = window.setTimeout(refresh, 100)
    return () => {
      window.clearTimeout(t)
      runtime.destroy()
    }
  }, [])
  return null
}
