'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

export function NavAutoHide({ children }: { children: ReactNode }) {
  const [hidden, setHidden] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    let lastY = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      if (Math.abs(y - lastY) < 6) return
      setHidden(y > lastY && y > 120)
      lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-30 transition-[transform,background-color,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)]',
        hidden ? '-translate-y-full' : 'translate-y-0',
        scrolled ? 'border-b border-lime-deep bg-black/75 backdrop-blur-[6px]' : 'border-b border-transparent',
      ].join(' ')}
    >
      {children}
    </header>
  )
}
