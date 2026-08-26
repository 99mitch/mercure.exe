/* eslint-disable @next/next/no-img-element */

/**
 * The pre-rendered blob. This is the default everywhere; WebGL replaces it on desktop only.
 * public/blob-still.svg is a placeholder until the rendered still from the master assets lands.
 */
export function BlobStill({ className, priority = true }: { className?: string; priority?: boolean }) {
  return (
    <img
      src="/blob-still.svg"
      alt=""
      width={800}
      height={800}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      draggable={false}
    />
  )
}
