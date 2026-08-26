'use client'

/**
 * One RAF loop. Tempus owns requestAnimationFrame; Lenis, GSAP and R3F subscribe to it
 * in a fixed order: scroll -> tweens/ScrollTrigger -> render.
 *
 * Site surface only. Nothing under /tx or /components/sign may import this file
 * (enforced by the ESLint boundary rule).
 */
import Tempus from 'tempus'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CustomEase } from 'gsap/CustomEase'

export { gsap, ScrollTrigger, Tempus }

/** The two curves from tokens.css, registered as GSAP eases. */
export const EASE = { out: 'mx-out', io: 'mx-io' } as const

export const ORDER = {
  scroll: -10,
  tweens: 0,
  render: 10,
} as const

let registered = false
/** Idempotent. Registers plugins + eases and hands GSAP's ticker to Tempus. */
export function ensureGsap() {
  if (registered) return
  registered = true
  gsap.registerPlugin(ScrollTrigger, CustomEase)
  CustomEase.create(EASE.out, '0.16, 1, 0.3, 1')
  CustomEase.create(EASE.io, '0.65, 0, 0.35, 1')
  // GSAP stops driving its own ticker; Tempus feeds it.
  gsap.ticker.lagSmoothing(0)
  gsap.ticker.remove(gsap.updateRoot)
  Tempus.add(({ time }) => gsap.updateRoot(time / 1000), { order: ORDER.tweens, label: 'gsap' })
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export type MotionRuntime = {
  lenis: Lenis | null
  destroy: () => void
}

/**
 * Boot the site motion runtime. Returns a no-op runtime under reduced motion:
 * no Lenis, no ScrollTriggers, native scroll — the page is a static document.
 */
export function createMotionRuntime(): MotionRuntime {
  if (prefersReducedMotion()) {
    return { lenis: null, destroy: () => {} }
  }

  ensureGsap()

  const lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    wheelMultiplier: 1,
    smoothWheel: true,
  })
  const unsubLenis = Tempus.add(({ time }) => lenis.raf(time), { order: ORDER.scroll, label: 'lenis' })
  lenis.on('scroll', ScrollTrigger.update)
  document.documentElement.classList.add('lenis-on')

  return {
    lenis,
    destroy: () => {
      unsubLenis?.()
      lenis.off('scroll', ScrollTrigger.update)
      lenis.destroy()
      document.documentElement.classList.remove('lenis-on')
    },
  }
}

/** Subscribe a render callback (R3F `advance`) to the shared loop. */
export function onRender(cb: (time: number, deltaTime: number) => void, label = 'render') {
  return Tempus.add(({ time, deltaTime }) => cb(time, deltaTime), { order: ORDER.render, label })
}
