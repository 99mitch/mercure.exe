'use client'

import { useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'motion/react'

/**
 * Magnetic wrapper: the child drifts a few pixels toward the cursor while it's near, springs
 * back when it leaves. Component-level motion, so this is motion's job. Off under reduced motion.
 */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 180, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 180, damping: 18, mass: 0.4 })

  function onMove(e: React.PointerEvent) {
    if (reduced || e.pointerType !== 'mouse') return
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  function onLeave() {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div ref={ref} className={className ?? 'inline-block'} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </motion.div>
  )
}
