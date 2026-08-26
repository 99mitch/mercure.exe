'use client'

import { useEffect, useRef, useState } from 'react'
import { Tempus, prefersReducedMotion } from '@/lib/motion'

type Props = {
  text: string
  /** characters per second */
  cps?: number
  /** ms before the first character */
  delay?: number
  className?: string
  cursor?: boolean
  onDone?: () => void
}

/**
 * Types `text` in on the shared Tempus loop. Server-renders the full string so the page is
 * complete without JS; the `.js-typed` gate hides it until the loop takes over.
 */
export function Typewriter({ text, cps = 22, delay = 200, className, cursor = true, onDone }: Props) {
  const [shown, setShown] = useState(text.length)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(true)
  const doneRef = useRef(onDone)
  doneRef.current = onDone

  useEffect(() => {
    if (prefersReducedMotion()) {
      setReady(true)
      return
    }
    setShown(0)
    setDone(false)
    setReady(true)
    let start: number | null = null
    let active = true
    const stop = () => {
      if (!active) return
      active = false
      unsub?.()
    }
    const unsub = Tempus.add(
      ({ time }) => {
        if (start === null) start = time
        const elapsed = time - start - delay
        const n = Math.min(text.length, Math.max(0, Math.floor((elapsed / 1000) * cps)))
        setShown((prev) => (prev === n ? prev : n))
        if (n >= text.length) {
          // Tempus reads the entry again after the callback returns; never remove mid-dispatch.
          queueMicrotask(stop)
          setDone(true)
          doneRef.current?.()
        }
      },
      { label: 'typewriter' },
    )
    return stop
  }, [text, cps, delay])

  return (
    <span className={className} data-ready={ready ? '' : undefined}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" translate="no">
        {text.slice(0, shown)}
        {cursor ? <span className={done ? 'cursor-blink' : undefined}>_</span> : null}
      </span>
    </span>
  )
}
