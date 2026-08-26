import { FlatCompat } from '@eslint/eslintrc'
import boundaries from 'eslint-plugin-boundaries'

const compat = new FlatCompat({ baseDirectory: import.meta.dirname })

// Libraries that belong to the site surface only. Nothing under /tx, /components/sign
// or /components/ui may import them — see CLAUDE-app.md §1 and §9.
const MOTION_LIBS = [
  'gsap', 'gsap/**', 'lenis', 'lenis/**', 'tempus', 'tempus/**', 'motion', 'motion/**',
  'three', 'three/**', '@react-three/**', 'postprocessing', 'maath', 'maath/**',
]

const el = (type) => ({ element: { type } })
const els = (types) => ({ element: { types: { anyOf: types } } })
const motionRuntime = { file: { categories: 'motion-runtime' } }
const motionLibs = { module: { origin: 'external', source: MOTION_LIBS } }

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/elements': [
        { type: 'ui', pattern: 'components/ui/**' },
        { type: 'site', pattern: 'components/site/**' },
        { type: 'sign', pattern: 'components/sign/**' },
        { type: 'app-site', pattern: 'app/(site)/**' },
        { type: 'app-tx', pattern: 'app/tx/**' },
        { type: 'lib', pattern: 'lib/**' },
        { type: 'app', pattern: 'app/**' },
      ],
      'boundaries/files': [{ category: 'motion-runtime', pattern: 'lib/motion.ts' }],
      // No import resolver is configured for bare specifiers; treat unresolved packages as external.
      'boundaries/flag-as-external': { inNodeModules: true, unresolvableAlias: true },
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'allow',
          checkAllOrigins: true,
          policies: [
            // Shared primitives may not know about either surface, nor about the motion runtime.
            { from: el('ui'), disallow: { to: els(['site', 'sign', 'app-site', 'app-tx']) } },
            // The signing surface never imports the site surface.
            { from: els(['sign', 'app-tx']), disallow: { to: els(['site', 'app-site']) } },
            // The site never reaches into the signing components.
            { from: els(['site', 'app-site']), disallow: { to: els(['sign', 'app-tx']) } },
            // No motion runtime and no GSAP / Lenis / three / motion anywhere near the signing page or shared UI.
            { from: els(['ui', 'sign', 'app-tx']), disallow: { to: motionRuntime } },
            { from: els(['ui', 'sign', 'app-tx']), disallow: { to: motionLibs } },
          ],
        },
      ],
    },
  },
]

export default config
