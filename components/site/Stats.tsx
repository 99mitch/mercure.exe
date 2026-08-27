import { getStats, ROUTE_TTL_MS } from '@/lib/routes'
import { formatBps } from '@/lib/format'
import { ROBINHOOD_CHAIN_ID } from '@/lib/chain'
import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

/** The numbers the site is allowed to quote. Every one is a fact about the engine or the chain. */
export function Stats() {
  const s = getStats()
  const items: [string, string][] = [
    ['Avg net APY', formatBps(s.avgNetApyBps)],
    ['Open markets', `${s.openMarkets}/${s.totalMarkets}`],
    ['Chain', String(ROBINHOOD_CHAIN_ID)],
    ['Route window', `${ROUTE_TTL_MS / 60000} min`],
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
