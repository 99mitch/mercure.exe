/* eslint-disable @next/next/no-img-element */

/**
 * The pre-rendered blob. This is the default everywhere; WebGL replaces it on desktop only.
 * public/blob-still.webp is the master render (1000px, webp).
 */
export function BlobStill({ className, priority = true }: { className?: string; priority?: boolean }) {
  return (
    <img
      src="/blob-still.webp"
      alt=""
      width={1000}
      height={1000}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      draggable={false}
    />
  )
}
