/**
 * The blob's pose is a tiny mutable store shared between the scroll director (writes the
 * target) and the scene (damps toward it every frame). NDC-ish units: x/y in [-1, 1] of the
 * viewport, scale relative to the hero size, spread 0 = droplets orbit the body, 1 = droplets
 * detach to their section slots, calm 1 = the surface stops moving.
 */
export type BlobPose = { x: number; y: number; scale: number; spread: number; calm: number; rot: number }

export const HERO_POSE: BlobPose = { x: 0.5, y: 0.06, scale: 1, spread: 0.3, calm: 0, rot: 0 }

/** Per-section poses, in page order. Sections opt in with `data-blob-pose="<key>"`. */
export const POSES: Record<string, BlobPose> = {
  hero: HERO_POSE,
  // Content is left-aligned and wide, so the body keeps to corners and margins; only the
  // droplets are allowed to sit among the type.
  stats: { x: 0.86, y: -0.62, scale: 0.55, spread: 0.85, calm: 0, rot: 0.7 },
  how: { x: 0.92, y: 0.7, scale: 0.42, spread: 1, calm: 0, rot: 1.3 },
  sentence: { x: 0.62, y: 0.05, scale: 0.8, spread: 0.15, calm: 0.2, rot: 1.9 },
  markets: { x: -0.92, y: -0.72, scale: 0.7, spread: 0.55, calm: 0, rot: 2.5 },
  manifesto: { x: 0.96, y: -0.85, scale: 0.8, spread: 0.7, calm: 0, rot: 3.0 },
  sign: { x: 0.8, y: 0.64, scale: 0.28, spread: 0, calm: 1, rot: 3.5 },
  footer: { x: 0.1, y: -1.6, scale: 0.6, spread: 0, calm: 1, rot: 3.8 },
}

/** Where detached droplets go (NDC), used when spread -> 1. One per "How it works" column. */
export const DROPLET_SLOTS: [number, number][] = [
  [-0.58, 0.22],
  [0.02, 0.26],
  [0.6, 0.2],
  [0.84, -0.55],
]

export const blobTarget: BlobPose = { ...HERO_POSE }
export const blobCurrent: BlobPose = { ...HERO_POSE }

// Dev aid: inspect the pose from the console (`__blobPose.target`, `__blobPose.current`).
if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
  ;(window as unknown as { __blobPose: unknown }).__blobPose = { target: blobTarget, current: blobCurrent }
}
