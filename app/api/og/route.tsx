import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { NextRequest } from 'next/server'
import { describeRoute, getRoute } from '@/lib/routes'
import { formatAmount, formatBps, formatFee } from '@/lib/format'

export const runtime = 'nodejs'

const LIME = '#A8D000'
const BLACK = '#000000'
const GREY_40 = '#6E6E6E'
const GREY_10 = '#E8E8E8'

let assetCache: Promise<{ display: ArrayBuffer; sans: ArrayBuffer; mono: ArrayBuffer; blob: string }> | null = null
function assets() {
  assetCache ??= (async () => {
    const dir = path.join(process.cwd(), 'assets', 'og')
    const [display, sans, mono, blob] = await Promise.all([
      readFile(path.join(dir, 'DepartureMono-Regular.otf')),
      readFile(path.join(dir, 'inter-tight-latin-400-normal.woff')),
      readFile(path.join(dir, 'ibm-plex-mono-latin-400-normal.woff')),
      readFile(path.join(dir, 'blob.png')),
    ])
    const toAB = (b: Buffer) => b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
    return { display: toAB(display), sans: toAB(sans), mono: toAB(mono), blob: `data:image/png;base64,${blob.toString('base64')}` }
  })()
  return assetCache
}

/**
 * Satori-rendered OG images. `/api/og` for the site, `/api/og?tx=<id>` for a route,
 * `/api/og?title=…` for an article.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const txId = searchParams.get('tx')
  const title = searchParams.get('title')
  const f = await assets()

  let headline = 'The messenger runs onchain.'
  let rows: [string, string][] = [['Chain', 'Robinhood Chain · 4663']]

  if (txId) {
    const route = await getRoute(txId)
    if (route) {
      headline = describeRoute(route)
      rows = [
        ['Amount', `${formatAmount(route.amount, route.asset.decimals)} ${route.asset.symbol}`],
        ['Market', `${route.protocol} ${route.market}`],
        ['Net APY', formatBps(route.netApyBps)],
        ['Est. fee', formatFee(route.fee.wei)],
      ]
    } else {
      headline = 'Route not found.'
      rows = []
    }
  } else if (title) {
    headline = title.slice(0, 120)
    rows = []
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: BLACK,
          color: GREY_10,
          padding: 72,
          fontFamily: 'Inter Tight',
          position: 'relative',
        }}
      >
        {/* the master render, bleeding off the right edge like the hero */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={f.blob}
          alt=""
          width={640}
          height={640}
          style={txId ? { position: 'absolute', right: -110, top: 30, width: 540, height: 540 } : { position: 'absolute', right: -90, top: -20, width: 640, height: 640 }}
        />
        <div style={{ display: 'flex', fontFamily: 'Departure Mono', fontSize: 40, color: LIME, letterSpacing: -1 }}>
          mercure.exe_
        </div>
        <div style={{ display: 'flex', fontSize: txId ? 46 : 64, lineHeight: 1.08, letterSpacing: -1.5, maxWidth: txId ? 620 : 720 }}>
          {headline}
        </div>
        <div style={{ display: 'flex', gap: 48, fontFamily: 'IBM Plex Mono', fontSize: 22 }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', color: GREY_40, textTransform: 'uppercase', letterSpacing: 2, fontSize: 16 }}>{k}</div>
              <div style={{ display: 'flex' }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Departure Mono', data: f.display, weight: 400, style: 'normal' },
        { name: 'Inter Tight', data: f.sans, weight: 400, style: 'normal' },
        { name: 'IBM Plex Mono', data: f.mono, weight: 400, style: 'normal' },
      ],
      headers: { 'Cache-Control': txId ? 'public, max-age=60' : 'public, max-age=86400, s-maxage=86400' },
    },
  )
}
