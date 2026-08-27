import { describeRoute, listOfferedRoutes } from '@/lib/routes'
import { formatAmount, formatBps, formatFee } from '@/lib/format'
import { SentencePin, type SentenceItem } from './SentencePin'

/** Server half: one route per open market, described by the engine itself. */
export function Sentence() {
  const items: SentenceItem[] = listOfferedRoutes().map((r) => ({
    id: r.marketId,
    sentence: describeRoute(r),
    rows: [
      ['Amount', `${formatAmount(r.amount, r.asset.decimals)} ${r.asset.symbol}`],
      ['Net APY', formatBps(r.netApyBps)],
      ['Est. fee', formatFee(r.fee.wei)],
    ],
  }))
  return (
    <section data-blob-pose="sentence" className="relative z-10 border-t border-lime-deep px-5 py-24 sm:px-8 lg:px-12 lg:py-32" aria-label="The sentence">
      <SentencePin items={items} />
    </section>
  )
}
