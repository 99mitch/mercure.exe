import { describeRoute, getRoute } from '@/lib/routes'
import { formatAmount, formatBps, formatFee } from '@/lib/format'
import { SentencePin, type SentenceItem } from './SentencePin'

const IDS = ['demo', 'demo-withdraw', 'demo-wbtc']

/** Server half: real routes -> items. */
export async function Sentence() {
  const routes = await Promise.all(IDS.map((id) => getRoute(id)))
  const items: SentenceItem[] = routes.flatMap((r) =>
    r
      ? [{
          id: r.id,
          sentence: describeRoute(r),
          rows: [
            ['Amount', `${formatAmount(r.amount, r.asset.decimals)} ${r.asset.symbol}`],
            ['Net APY', formatBps(r.netApyBps)],
            ['Est. fee', formatFee(r.fee.wei)],
          ],
        }]
      : [],
  )
  return (
    <section data-blob-pose="sentence" className="relative z-10 border-t border-lime-deep px-5 py-24 sm:px-8 lg:px-12 lg:py-32" aria-label="The sentence">
      <SentencePin items={items} />
    </section>
  )
}
