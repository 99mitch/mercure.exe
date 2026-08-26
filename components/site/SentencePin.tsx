'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap, ScrollTrigger, prefersReducedMotion, ensureGsap } from '@/lib/motion'
import { Label } from '@/components/ui/Label'

export type SentenceItem = { id: string; sentence: string; rows: [string, string][] }

/**
 * "The sentence", pinned. Scrolling through swaps the sentence between real routes from the
 * engine — the same text the signing page would show. Under reduced motion (or no JS) all
 * sentences are simply listed.
 */
export function SentencePin({ items }: { items: SentenceItem[] }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [pinned, setPinned] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    ensureGsap()
    setPinned(true)
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${items.length * 70}%`,
        pin: true,
        pinSpacing: true,
        scrub: true,
        onUpdate: (st) => setIndex(Math.min(items.length - 1, Math.floor(st.progress * items.length))),
      })
    })
    ScrollTrigger.refresh()
    return () => {
      ctx.revert()
      setPinned(false)
    }
  }, [items.length])

  const shown = pinned ? [items[index]] : items

  return (
    <div ref={ref} className={pinned ? 'flex min-h-dvh flex-col justify-center' : ''}>
      <Label as="p" className="mb-8"><span data-reveal>The sentence</span></Label>
      <div className="space-y-14">
        {shown.map((it) => (
          <div key={it.id}>
            <p className="font-display text-[clamp(1.75rem,4.2vw,3.75rem)] leading-[1.05] tracking-[-0.02em] text-grey-10 max-w-[20ch]">
              {it.sentence}
            </p>
            <dl className="mt-8 grid grid-cols-[7rem_1fr] gap-y-2 text-mono">
              {it.rows.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-grey-40 uppercase">{k}</dt>
                  <dd className="text-grey-10">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
      {pinned ? (
        <ol className="mt-12 flex gap-3" aria-hidden="true">
          {items.map((it, i) => (
            <li key={it.id} className={`h-px w-10 ${i === index ? 'bg-lime' : 'bg-lime-deep'}`} />
          ))}
        </ol>
      ) : null}
    </div>
  )
}
