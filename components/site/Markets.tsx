import { listMarkets } from '@/lib/routes'
import { formatBps } from '@/lib/format'
import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

/** Live markets. Every number here came from the routing engine — the same source /tx reads. */
export function Markets() {
  const markets = listMarkets()
  return (
    <section id="markets" data-blob-pose="markets" className="relative z-10 border-t border-lime-deep px-5 py-24 sm:px-8 lg:px-12 lg:py-36" aria-labelledby="markets-title">
      <Reveal className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <div>
          <Label as="p" className="mb-6"><span data-reveal>Markets</span></Label>
          <h2 id="markets-title" className="text-h2 text-grey-10 max-w-[18ch]" data-reveal>
            Net APY after fees. The number you keep.
          </h2>
          <p className="mt-6 text-body text-grey-10/80 max-w-[38ch]" data-reveal>
            Gross APY is a marketing number. Utilization tells you whether you can leave. Both are here, neither is rounded up.
          </p>
        </div>
        <div className="overflow-x-auto" data-reveal>
          <table className="w-full min-w-[36rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-lime-deep">
                <Label as="th" className="py-3 pr-6 font-normal">Protocol</Label>
                <Label as="th" className="py-3 pr-6 font-normal">Market</Label>
                <Label as="th" className="py-3 pr-6 font-normal text-right">Net APY</Label>
                <Label as="th" className="py-3 pr-6 font-normal text-right">Utilization</Label>
                <Label as="th" className="py-3 font-normal text-right">Status</Label>
              </tr>
            </thead>
            <tbody>
              {markets.map((m) => {
                const open = m.status === 'open'
                return (
                  <tr key={m.key} className="group border-b border-lime-deep transition-colors duration-[var(--dur-fast)] hover:bg-lime-deep/40">
                    <td className="py-5 pr-6 pl-2 text-body text-grey-10">{m.protocol}</td>
                    <td className="py-5 pr-6 text-mono text-grey-10">{m.pair}</td>
                    <td className="py-5 pr-6 text-mono text-right text-lime">{open ? formatBps(m.netApyBps) : '—'}</td>
                    <td className="py-5 pr-6 text-mono text-right text-grey-10">{open ? formatBps(m.utilizationBps) : '—'}</td>
                    <td className="py-5 pr-2 text-mono text-right">
                      <span className={open ? 'text-lime' : 'text-grey-40'}>{open ? 'Open' : 'Paused'}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Reveal>
    </section>
  )
}
