'use client'

import { useEffect, useRef } from 'react'
import { createBlobScene } from './blob/scene'
import { createBlobChoreography } from './blob/director'

/** Mounts the WebGL blob into a canvas and wires the scroll choreography. BlobStage decides when. */
export function Blob({ onReady }: { onReady?: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const readyRef = useRef(onReady)
  readyRef.current = onReady

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    let disposeScene: (() => void) | undefined
    let disposeChoreo: (() => void) | undefined
    try {
      disposeScene = createBlobScene(canvas, () => readyRef.current?.())
      disposeChoreo = createBlobChoreography()
    } catch (e) {
      console.warn('[blob] WebGL init failed, keeping the still.', e)
    }
    return () => {
      disposeChoreo?.()
      disposeScene?.()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }} />
}
