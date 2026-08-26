'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { prefersReducedMotion } from '@/lib/motion'
import { BlobStill } from './BlobStill'

const Blob = dynamic(() => import('./Blob').then((m) => m.Blob), { ssr: false })

/**
 * Desktop with a fine pointer and no reduced-motion preference: WebGL over the still.
 * Everything else: the still. The still is always in the DOM so first paint is complete.
 */
export function BlobSwitch({ className }: { className?: string }) {
  const [webgl, setWebgl] = useState(false)
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    const mq = window.matchMedia('(min-width: 768px) and (pointer: fine)')
    const check = () => setWebgl(mq.matches && supportsWebGL())
    check()
    mq.addEventListener('change', check)
    return () => mq.removeEventListener('change', check)
  }, [])

  return (
    <div className={className} data-blob>
      <BlobStill className={live ? 'invisible' : undefined} />
      {webgl ? (
        <div className="absolute inset-0">
          <Blob onReady={() => setLive(true)} />
        </div>
      ) : null}
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
