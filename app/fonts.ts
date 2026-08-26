import localFont from 'next/font/local'

/** Display — pixel-grid mono for the wordmark. OFL, see fonts/LICENSE-DepartureMono.txt */
export const departure = localFont({
  src: './fonts/DepartureMono-Regular.woff2',
  variable: '--font-departure',
  weight: '400',
  display: 'swap',
  preload: true,
})

/** Body / UI — Inter Tight (Latin subset), 300/400/500 */
export const interTight = localFont({
  src: [
    { path: './fonts/inter-tight-latin-300-normal.woff2', weight: '300', style: 'normal' },
    { path: './fonts/inter-tight-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/inter-tight-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-inter-tight',
  display: 'swap',
  preload: true,
})

/** Data / labels — IBM Plex Mono (Latin subset), 400/500 */
export const plexMono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-500-normal.woff2', weight: '500', style: 'normal' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
  preload: true,
})
