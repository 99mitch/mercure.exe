import {
  ACESFilmicToneMapping,
  Color,
  DoubleSide,
  Group,
  HalfFloatType,
  IcosahedronGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PMREMGenerator,
  PerspectiveCamera,
  PlaneGeometry,
  RingGeometry,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
  type Texture,
} from 'three'
import { easing } from 'maath'
import { onRender, prefersReducedMotion } from '@/lib/motion'
import { BLUR_FRAG, BRIGHT_FRAG, COMPOSITE_FRAG, DISPLACE, FULLSCREEN_VERT, NORMAL_VERTEX, SIMPLEX } from './shaders'
import { DROPLET_SLOTS, blobCurrent, blobTarget } from './pose'

const LIME = '#A8D000'
const LIME_MID = '#8DB000'
const LIME_DEEP = '#203000'
const HIGHLIGHT = '#F0F8A0'

const FOV = 32
const CAM_Z = 5.4
const BASE_SCALE = 0.78 // hero body ≈ 55% of the viewport height (max lobe radius ≈ 1.28)

/**
 * The blob, in raw three with named imports so the bundle only carries what it uses.
 *
 * - Body: icosahedron + simplex vertex displacement, normals rebuilt in the shader.
 * - Droplets: four small spheres that orbit the body or detach to section slots (`spread`).
 * - Metal comes from a lime-tinted studio environment (PMREM of emissive panels), not colour.
 * - Bloom is a bright-pass on HDR energy above 1.15 — specular hotspots only.
 * - Pose (position / scale / spread / calm) is damped toward `blobTarget`, which the scroll
 *   director writes. No own RAF: `onRender` subscribes to the shared Tempus loop.
 */
export function createBlobScene(canvas: HTMLCanvasElement, onReady?: () => void) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping

  const scene = new Scene()
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 30)
  camera.position.set(0, 0, CAM_Z)
  const halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * CAM_Z
  let halfW = halfH

  scene.environment = studioEnvironment(renderer)

  // --- shared displaced-metal material
  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.06 }, uFreq: { value: 1.1 } }
  // The splat: four lobes, slowly turning. Directions are rebuilt every frame from these bases.
  const LOBES = [
    { base: new Vector3(-0.72, 0.6, 0.2), amp: 0.62, k: 5.5 },
    { base: new Vector3(0.9, 0.3, -0.1), amp: 0.58, k: 6.0 },
    { base: new Vector3(0.12, -0.9, 0.35), amp: 0.66, k: 5.0 },
    { base: new Vector3(-0.3, -0.2, -0.92), amp: 0.4, k: 4.5 },
  ].map((l) => ({ ...l, base: l.base.normalize() }))
  const lobeDir = { value: LOBES.map(() => new Vector3()) }
  const lobeParam = { value: LOBES.map((l) => new Vector2(l.amp, l.k)) }
  const noLobes = { value: LOBES.map(() => new Vector2(0, 1)) }
  const makeMaterial = (amp: number, base: number, lobed: boolean) => {
    const m = new MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.12, envMapIntensity: 1.5 })
    const own = { uAmp: { value: amp } }
    m.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uFreq = uniforms.uFreq
      shader.uniforms.uAmp = own.uAmp
      shader.uniforms.uBase = { value: base }
      shader.uniforms.uLobeDir = lobeDir
      shader.uniforms.uLobeParam = lobed ? lobeParam : noLobes
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${SIMPLEX}\n${DISPLACE}`)
        .replace('#include <beginnormal_vertex>', NORMAL_VERTEX)
        .replace('#include <begin_vertex>', 'vec3 transformed = displacedPos;')
    }
    return { material: m, amp: own.uAmp }
  }

  // --- body
  const body = makeMaterial(uniforms.uAmp.value, 0.62, true)
  const mesh = new Mesh(new IcosahedronGeometry(1, 96), body.material)
  const group = new Group()
  group.add(mesh)
  scene.add(group)

  // --- droplets (orbit offsets in body-radius units, like the master render)
  const dropletMat = makeMaterial(0.04, 1, false)
  const dropletGeo = new SphereGeometry(1, 48, 32)
  const ORBIT: { offset: Vector3; radius: number }[] = [
    { offset: new Vector3(0.95, 1.15, 0.2), radius: 0.19 },
    { offset: new Vector3(1.45, 0.85, -0.1), radius: 0.1 },
    { offset: new Vector3(1.35, -0.25, 0.3), radius: 0.16 },
    { offset: new Vector3(-1.4, -0.35, 0.1), radius: 0.12 },
  ]
  const droplets = ORBIT.map(({ radius }) => {
    const d = new Mesh(dropletGeo, dropletMat.material)
    d.scale.setScalar(radius)
    scene.add(d)
    return d
  })
  const tmp = new Vector3()

  // --- post: HDR scene -> bright -> blur -> composite
  const sceneRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: true })
  const brightRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter })
  const blurRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter })
  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quadGeo = new PlaneGeometry(2, 2)
  const bright = new ShaderMaterial({ vertexShader: FULLSCREEN_VERT, fragmentShader: BRIGHT_FRAG, uniforms: { tScene: { value: sceneRT.texture }, uThreshold: { value: 1.15 }, uKnee: { value: 0.2 } }, depthTest: false, depthWrite: false })
  const blur = new ShaderMaterial({ vertexShader: FULLSCREEN_VERT, fragmentShader: BLUR_FRAG, uniforms: { tInput: { value: null as Texture | null }, uDir: { value: new Vector2() } }, depthTest: false, depthWrite: false })
  const composite = new ShaderMaterial({ vertexShader: FULLSCREEN_VERT, fragmentShader: COMPOSITE_FRAG, uniforms: { tScene: { value: sceneRT.texture }, tBloom: { value: brightRT.texture }, uIntensity: { value: 0.4 } }, depthTest: false, depthWrite: false, transparent: true, toneMapped: false })
  const quad = new Mesh(quadGeo, bright)
  const quadScene = new Scene()
  quadScene.add(quad)

  // --- size
  function resize() {
    const parent = canvas.parentElement ?? canvas
    const w = Math.max(1, parent.clientWidth)
    const h = Math.max(1, parent.clientHeight)
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    halfW = halfH * camera.aspect
    const pr = renderer.getPixelRatio()
    sceneRT.setSize(Math.floor(w * pr), Math.floor(h * pr))
    const qw = Math.max(1, Math.floor((w * pr) / 4))
    const qh = Math.max(1, Math.floor((h * pr) / 4))
    brightRT.setSize(qw, qh)
    blurRT.setSize(qw, qh)
  }
  resize()
  const ro = new ResizeObserver(resize)
  ro.observe(canvas.parentElement ?? canvas)

  // --- pointer: lean toward the cursor, heavy damping. Viscous, never tight.
  const pointer = { x: 0, y: 0 }
  const lean = new Vector3()
  const onMove = (e: PointerEvent) => {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1
  }
  window.addEventListener('pointermove', onMove, { passive: true })

  // --- visibility: don't render in a hidden tab
  let visible = document.visibilityState === 'visible'
  const onVis = () => (visible = document.visibilityState === 'visible')
  document.addEventListener('visibilitychange', onVis)

  const idle = !prefersReducedMotion()
  let last: number | null = null
  let readyFired = false
  const pos = new Vector3()
  const smooth = (v: number) => v * v * (3 - 2 * v)

  function frame(time: number) {
    if (!visible) return
    const dt = last === null ? 1 / 60 : Math.min((time - last) / 1000, 1 / 30)
    last = time

    // pose: damp toward the director's target
    easing.damp(blobCurrent, 'x', blobTarget.x, 0.55, dt)
    easing.damp(blobCurrent, 'y', blobTarget.y, 0.55, dt)
    easing.damp(blobCurrent, 'scale', blobTarget.scale, 0.6, dt)
    easing.damp(blobCurrent, 'spread', blobTarget.spread, 0.7, dt)
    easing.damp(blobCurrent, 'calm', blobTarget.calm, 0.6, dt)
    easing.damp(blobCurrent, 'rot', blobTarget.rot, 0.8, dt)
    const calm = blobCurrent.calm

    uniforms.uTime.value += dt * (1 - 0.9 * calm)
    body.amp.value = 0.06 * (1 - 0.85 * calm)
    // lobes drift: slow precession + a breathing amplitude, both frozen by `calm`
    const tl = uniforms.uTime.value
    LOBES.forEach((l, i) => {
      lobeDir.value[i].copy(l.base).applyAxisAngle(UP, tl * 0.07 + Math.sin(tl * 0.11 + i) * 0.25)
      lobeParam.value[i].set(l.amp * (1 + 0.12 * Math.sin(tl * 0.23 + i * 1.9)), l.k)
    })

    pos.set(blobCurrent.x * halfW, blobCurrent.y * halfH, 0)
    group.position.copy(pos)
    const s = BASE_SCALE * blobCurrent.scale
    mesh.scale.setScalar(s)

    easing.damp3(lean, [pointer.x * 0.45, pointer.y * 0.3, 0], 0.4, dt)
    group.rotation.y = lean.x + blobCurrent.rot
    group.rotation.x = lean.y
    if (idle) mesh.rotation.y += dt * 0.06 * (1 - calm)

    // droplets: orbit the body, or detach to their slots
    const k = smooth(Math.min(1, Math.max(0, blobCurrent.spread)))
    const t = uniforms.uTime.value
    droplets.forEach((d, i) => {
      const o = ORBIT[i]
      tmp.copy(o.offset).multiplyScalar(s).applyAxisAngle(UP, t * 0.15 + i).add(pos)
      const slot = DROPLET_SLOTS[i]
      const sx = slot[0] * halfW + Math.sin(t * 0.5 + i * 1.7) * 0.08
      const sy = slot[1] * halfH + Math.cos(t * 0.4 + i * 1.3) * 0.08
      d.position.set(tmp.x + (sx - tmp.x) * k, tmp.y + (sy - tmp.y) * k, tmp.z * (1 - k))
      const rs = o.radius * BASE_SCALE * (blobCurrent.scale * (1 - k) + 0.85 * k)
      d.scale.setScalar(rs)
      d.rotation.y = t * 0.2 + i
    })

    // 1. HDR scene
    renderer.setRenderTarget(sceneRT)
    renderer.clear()
    renderer.render(scene, camera)
    // 2. bright pass (quarter res)
    quad.material = bright
    renderer.setRenderTarget(brightRT)
    renderer.render(quadScene, quadCam)
    // 3. blur H -> blurRT, V -> brightRT
    quad.material = blur
    blur.uniforms.tInput.value = brightRT.texture
    blur.uniforms.uDir.value.set(1 / brightRT.width, 0)
    renderer.setRenderTarget(blurRT)
    renderer.render(quadScene, quadCam)
    blur.uniforms.tInput.value = blurRT.texture
    blur.uniforms.uDir.value.set(0, 1 / brightRT.height)
    renderer.setRenderTarget(brightRT)
    renderer.render(quadScene, quadCam)
    // 4. composite to screen
    quad.material = composite
    renderer.setRenderTarget(null)
    renderer.render(quadScene, quadCam)

    if (!readyFired) {
      readyFired = true
      onReady?.()
    }
  }

  const unsubscribe = onRender(frame, 'blob')

  return function dispose() {
    unsubscribe?.()
    ro.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    mesh.geometry.dispose()
    dropletGeo.dispose()
    body.material.dispose()
    dropletMat.material.dispose()
    quadGeo.dispose()
    bright.dispose()
    blur.dispose()
    composite.dispose()
    sceneRT.dispose()
    brightRT.dispose()
    blurRT.dispose()
    scene.environment?.dispose()
    renderer.dispose()
  }
}

const UP = new Vector3(0, 1, 0)

/**
 * A lime-tinted studio: emissive panels around the origin, prefiltered into an env map.
 * Intensities above 1 are what give the metal its hot specular lines (and the bloom something to catch).
 */
function studioEnvironment(renderer: WebGLRenderer): Texture {
  const env = new Scene()
  env.background = new Color(0x000000)

  const panel = (geo: PlaneGeometry | RingGeometry, color: string, intensity: number, pos: [number, number, number], rot?: [number, number, number]) => {
    const m = new Mesh(geo, new MeshBasicMaterial({ color: new Color(color).multiplyScalar(intensity), side: DoubleSide }))
    m.position.set(...pos)
    if (rot) m.rotation.set(...rot)
    else m.lookAt(0, 0, 0)
    env.add(m)
    return m
  }

  panel(new PlaneGeometry(24, 24), LIME_MID, 0.55, [0, 0, -9]) // ambient wrap behind: nothing reflects pure black
  panel(new PlaneGeometry(24, 24), LIME_DEEP, 1.6, [0, 0, 9]) // front fill, seen in the centre of the form
  panel(new PlaneGeometry(24, 24), LIME_DEEP, 1.2, [-9, 0, 0]) // side wraps
  panel(new PlaneGeometry(24, 24), LIME_DEEP, 1.2, [9, 0, 0])
  panel(new PlaneGeometry(24, 24), LIME_MID, 0.5, [0, 9, 0], [Math.PI / 2, 0, 0]) // top wrap
  panel(new RingGeometry(3.6, 5.2, 64), HIGHLIGHT, 2.6, [0, 0.5, -6]) // backlight ring: the crisp chrome rim
  panel(new PlaneGeometry(10, 4), LIME, 2.2, [0, 4, -2]) // key, above and behind — the one hot line
  panel(new RingGeometry(1.5, 2.6, 48), HIGHLIGHT, 1.6, [-5, 1, 3]) // ring fill, front-left
  panel(new PlaneGeometry(2, 6), LIME_MID, 1.2, [5, -1, 2]) // mid kicker, right
  panel(new PlaneGeometry(14, 14), LIME_DEEP, 0.6, [0, -5, 0], [Math.PI / 2, 0, 0]) // deep floor

  const pmrem = new PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()
  const texture = pmrem.fromScene(env, 0.04).texture
  pmrem.dispose()
  env.traverse((o) => {
    if (o instanceof Mesh) {
      o.geometry.dispose()
      ;(o.material as MeshBasicMaterial).dispose()
    }
  })
  return texture
}
