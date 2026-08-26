'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'

const Blob = dynamic(() => import('./Blob').then((m) => m.Blob), { ssr: false })

/**
 * The blob lives here for the whole site: one fixed canvas behind the content, choreographed
 * by scroll (see blob/director.ts). Desktop with a fine pointer only; everything else keeps the
 * still that the Hero always renders. `html[data-blob-live]` lets CSS hide that still.
 */
export function BlobStage() {
  const [webgl, setWebgl] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mq = window.matchMedia('(min-width: 768px) and (pointer: fine)')
    const check = () => setWebgl(mq.matches && supportsWebGL())
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  useEffect(() => {
    if (!webgl) document.documentElement.removeAttribute('data-blob-live')
  }, [webgl])

  if (!webgl) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-0 js-fade" data-ready="" aria-hidden="true">
      <Blob onReady={() => document.documentElement.setAttribute('data-blob-live', '')} />
    </div>
  )
}

function supportsWebGL() {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}
