'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Tempus, prefersReducedMotion } from '@/lib/motion'

/** Endless horizontal scroll on the shared loop. Static (first copy only) under reduced motion. */
export function Marquee({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  const track = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = track.current
    if (!el || prefersReducedMotion()) return
    let x = 0
    let last: number | null = null
    const unsub = Tempus.add(
      ({ time }) => {
        const dt = last === null ? 0 : Math.min((time - last) / 1000, 0.05)
        last = time
        const half = el.scrollWidth / 2
        x = (x + speed * dt) % (half || 1)
        el.style.transform = `translate3d(${-x}px,0,0)`
      },
      { label: 'marquee' },
    )
    return () => unsub?.()
  }, [speed])
  return (
    <div className={className} style={{ overflow: 'hidden' }}>
      <div ref={track} className="flex w-max whitespace-nowrap will-change-transform">
        {children}
        <span aria-hidden="true" className="contents motion-reduce:hidden">{children}</span>
      </div>
    </div>
  )
}
