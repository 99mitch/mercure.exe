import { getStats } from '@/lib/routes'
import { formatBps } from '@/lib/format'
import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

const usd = (n: number) => (n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : `$${Math.round(n / 1e3)}k`)

/** The numbers the site is allowed to be proud of. Every one comes from the engine's stats. */
export function Stats() {
  const s = getStats()
  const items: [string, string][] = [
    ['Routed', usd(s.routedUsd)],
    ['Routes signed', s.routesSigned.toLocaleString('en-US')],
    ['Avg net APY', formatBps(s.avgNetApyBps)],
    ['Open markets', String(s.openMarkets)],
  ]
  return (
    <section data-blob-pose="stats" className="relative z-10 px-5 py-20 sm:px-8 lg:px-12 lg:py-28" aria-label="Protocol figures">
      <Reveal className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4">
        {items.map(([k, v]) => (
          <div key={k} data-reveal className="border-t border-lime-deep pt-5">
            <Label as="p">{k}</Label>
            <p className="mt-3 font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-none tracking-[-0.02em] text-lime">{v}</p>
          </div>
        ))}
      </Reveal>
    </section>
  )
}
