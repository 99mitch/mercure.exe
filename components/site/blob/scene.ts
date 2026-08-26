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
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer,
  type Texture,
} from 'three'
import { easing } from 'maath'
import { onRender, prefersReducedMotion } from '@/lib/motion'
import { BLUR_FRAG, BRIGHT_FRAG, COMPOSITE_FRAG, DISPLACE, FULLSCREEN_VERT, NORMAL_VERTEX, SIMPLEX } from './shaders'

const LIME = '#E2FF00'
const LIME_MID = '#ABD204'
const LIME_DEEP = '#2F4300'
const HIGHLIGHT = '#F0FDA0'

/**
 * The blob, in raw three with named imports so the bundle only carries what it uses.
 *
 * - Icosahedron + simplex vertex displacement, normals rebuilt in the shader.
 * - Metal comes from a lime-tinted studio environment (PMREM of emissive panels), not colour.
 * - Bloom is a bright-pass on HDR energy above 1.0 — specular hotspots only — blurred at
 *   quarter resolution and composited with ACES. No general-purpose post stack.
 * - No own RAF: `onRender` subscribes to the shared Tempus loop.
 */
export function createBlobScene(canvas: HTMLCanvasElement, onReady?: () => void) {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.setClearColor(0x000000, 0)
  renderer.toneMapping = ACESFilmicToneMapping

  const scene = new Scene()
  const camera = new PerspectiveCamera(32, 1, 0.1, 20)
  camera.position.set(0, 0, 5.4)

  scene.environment = studioEnvironment(renderer)

  // --- blob
  const uniforms = { uTime: { value: 0 }, uAmp: { value: 0.14 }, uFreq: { value: 0.9 } }
  const material = new MeshStandardMaterial({ color: 0xffffff, metalness: 1, roughness: 0.14, envMapIntensity: 1.5 })
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${SIMPLEX}\n${DISPLACE}`)
      .replace('#include <beginnormal_vertex>', NORMAL_VERTEX)
      .replace('#include <begin_vertex>', 'vec3 transformed = displacedPos;')
  }
  const mesh = new Mesh(new IcosahedronGeometry(1, 80), material)
  mesh.scale.setScalar(1.2)
  const group = new Group()
  group.add(mesh)
  scene.add(group)

  // --- post: HDR scene -> bright -> blur -> composite
  const sceneRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: true })
  const brightRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter })
  const blurRT = new WebGLRenderTarget(1, 1, { type: HalfFloatType, depthBuffer: false, minFilter: LinearFilter, magFilter: LinearFilter })

  const quadCam = new OrthographicCamera(-1, 1, 1, -1, 0, 1)
  const quadGeo = new PlaneGeometry(2, 2)
  const bright = new ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: BRIGHT_FRAG,
    uniforms: { tScene: { value: sceneRT.texture }, uThreshold: { value: 1.15 }, uKnee: { value: 0.2 } },
    depthTest: false,
    depthWrite: false,
  })
  const blur = new ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: BLUR_FRAG,
    uniforms: { tInput: { value: null as Texture | null }, uDir: { value: new Vector2() } },
    depthTest: false,
    depthWrite: false,
  })
  const composite = new ShaderMaterial({
    vertexShader: FULLSCREEN_VERT,
    fragmentShader: COMPOSITE_FRAG,
    uniforms: { tScene: { value: sceneRT.texture }, tBloom: { value: brightRT.texture }, uIntensity: { value: 0.4 } },
    depthTest: false,
    depthWrite: false,
    transparent: true,
    toneMapped: false,
  })
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

  // --- visibility: don't render off-screen or in a hidden tab
  let visible = true
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 })
  io.observe(canvas)
  const onVis = () => (visible = document.visibilityState === 'visible')
  document.addEventListener('visibilitychange', onVis)

  const idle = !prefersReducedMotion()
  let last: number | null = null
  let readyFired = false

  function frame(time: number) {
    if (!visible) return
    const dt = last === null ? 1 / 60 : Math.min((time - last) / 1000, 1 / 30)
    last = time

    uniforms.uTime.value += dt
    easing.damp3(lean, [pointer.x * 0.45, pointer.y * 0.3, 0], 0.4, dt)
    group.rotation.y = lean.x
    group.rotation.x = lean.y
    if (idle) mesh.rotation.y += dt * 0.06

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
    io.disconnect()
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('pointermove', onMove)
    mesh.geometry.dispose()
    material.dispose()
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
