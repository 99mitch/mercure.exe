'use client'

import { useEffect, useRef } from 'react'
import { createBlobScene } from './blob/scene'

/** Mounts the WebGL blob into a canvas. Desktop only — BlobSwitch decides. */
export function Blob({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    try {
      return createBlobScene(canvas, () => readyRef.current?.())
    } catch (e) {
      console.warn('[blob] WebGL init failed, keeping the still.', e)
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
