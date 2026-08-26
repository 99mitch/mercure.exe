import type { Metadata, Viewport } from 'next'
import './globals.css'
import { departure, interTight, plexMono } from './fonts'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'mercure.exe', template: '%s — mercure.exe' },
  description: 'The messenger runs onchain. Yield routes on Robinhood Chain you can read in one sentence.',
  openGraph: {
    type: 'website',
    siteName: 'mercure.exe',
    title: 'mercure.exe',
    description: 'The messenger runs onchain. Yield routes on Robinhood Chain you can read in one sentence.',
    url: siteUrl,
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'mercure.exe — the messenger runs onchain.' }],
  },
  twitter: { card: 'summary_large_image', title: 'mercure.exe', description: 'The messenger runs onchain.', images: ['/api/og'] },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
}

/* Runs before first paint. Marks the document as motion-capable only when JS is on and the
   user hasn't asked for reduced motion. Everything gated on it degrades to a static page. */
const motionGate = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.setAttribute('data-motion','')}catch(e){}`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${departure.variable} ${interTight.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
