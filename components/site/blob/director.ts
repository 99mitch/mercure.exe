import { gsap, ScrollTrigger, ensureGsap } from '@/lib/motion'
import { HERO_POSE, POSES, blobTarget, type BlobPose } from './pose'

/**
 * Scroll choreography. Every section marked `data-blob-pose` scrubs the shared target toward
 * its pose as it enters the viewport; the scene damps toward the target, so the blob never jumps.
 * Parallax is depth, not decoration: the blob is the z-far layer and this is how it moves.
 */
export function createBlobChoreography(): () => void {
  ensureGsap()
  const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-blob-pose]'))
  const ctx = gsap.context(() => {
    // Each tween interpolates from the previous section's pose (explicit `from`): scrubbed
    // `to` tweens would record their start values at the first refresh, i.e. the hero pose.
    let prev: BlobPose = HERO_POSE
    for (const el of sections) {
      const pose = POSES[el.dataset.blobPose ?? '']
      if (!pose) continue
      gsap.fromTo(blobTarget, { ...prev }, {
        ...pose,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          // the last section can't reach 25% of the viewport: run its scrub to the page end
          end: el.dataset.blobPose === 'footer' ? 'bottom bottom' : 'top 25%',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      prev = pose
    }
  })
  ScrollTrigger.refresh()
  return () => ctx.revert()
}
