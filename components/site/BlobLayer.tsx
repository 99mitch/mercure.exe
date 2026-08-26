'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { Parallax, Z } from './Parallax'

/** Positions the blob in the hero and fades it in as part of the load sequence. */
export function BlobLayer({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), 600)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-x-0 top-24 bottom-0 -z-10 flex items-start justify-center md:inset-0 md:items-center md:justify-end md:pr-[3vw]">
      <Parallax speed={Z.far} anchor="top">
        <div data-ready={ready ? '' : undefined} className="js-fade">
          {children}
        </div>
      </Parallax>
    </div>
  )
}
