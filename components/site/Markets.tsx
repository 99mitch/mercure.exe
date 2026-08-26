import Link from 'next/link'
import { listMarkets } from '@/lib/routes'
import { formatBps } from '@/lib/format'
import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

const ROUTE_FOR_MARKET: Record<string, string> = {
  'morpho-usdg-weth': 'demo',
  'morpho-usdg-wbtc': 'demo-wbtc',
}

/** Live markets. Every number here came from the routing engine — the same source /tx reads. */
export function Markets() {
  const markets = listMarkets()
  return (
    <section id="markets" className="px-5 py-28 sm:px-8 lg:px-12 lg:py-40" aria-labelledby="markets-title">
      <Reveal>
        <Label as="p" className="mb-6"><span data-reveal>Markets</span></Label>
        <h2 id="markets-title" className="text-h2 text-grey-10 max-w-[28ch]" data-reveal>
          Net APY after fees. The number you keep.
        </h2>
      </Reveal>

      <Reveal className="mt-16 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-lime-deep">
              <Label as="th" className="py-3 pr-6 font-normal">Protocol</Label>
              <Label as="th" className="py-3 pr-6 font-normal">Market</Label>
              <Label as="th" className="py-3 pr-6 font-normal text-right">Net APY</Label>
              <Label as="th" className="py-3 pr-6 font-normal text-right">Utilization</Label>
              <Label as="th" className="py-3 font-normal text-right">Route</Label>
            </tr>
          </thead>
          <tbody>
            {markets.map((m) => {
              const open = m.status === 'open'
              const routeId = ROUTE_FOR_MARKET[m.key]
              return (
                <tr key={m.key} data-reveal className="border-b border-lime-deep">
                  <td className="py-5 pr-6 text-body text-grey-10">{m.protocol}</td>
                  <td className="py-5 pr-6 text-mono text-grey-10">{m.pair}</td>
                  <td className="py-5 pr-6 text-mono text-right text-lime">{open ? formatBps(m.netApyBps) : '—'}</td>
                  <td className="py-5 pr-6 text-mono text-right text-grey-10">{open ? formatBps(m.utilizationBps) : '—'}</td>
                  <td className="py-5 text-mono text-right">
                    {open && routeId ? (
                      <Link href={`/tx/${routeId}`} className="text-grey-10 hover:text-lime transition-colors">Deposit →</Link>
                    ) : (
                      <span className="text-grey-40">Paused</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Reveal>
    </section>
  )
}
