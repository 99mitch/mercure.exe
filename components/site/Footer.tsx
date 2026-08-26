import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'
import { Label } from '@/components/ui/Label'
import { ROBINHOOD_CHAIN_ID } from '@/lib/chain'

const COLS: [string, [string, string][]][] = [
  ['Product', [['Open a route · soon', '#'], ['Markets', '#markets'], ['How it works', '#how']]],
  ['Protocol', [[`Robinhood Chain · ${ROBINHOOD_CHAIN_ID}`, '#'], ['Morpho markets', '#markets'], ['The signing page · soon', '#']]],
]

export function Footer() {
  return (
    <footer data-blob-pose="footer" className="relative z-10 border-t border-lime-deep bg-black px-5 pt-16 pb-10 sm:px-8 lg:px-12">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Wordmark className="text-[clamp(2rem,4vw,3rem)] text-lime" />
          <p className="mt-4 text-body text-grey-10/80 max-w-[28ch]">The messenger runs onchain.</p>
        </div>
        {COLS.map(([title, links]) => (
          <div key={title}>
            <Label as="p" className="mb-4">{title}</Label>
            <ul className="space-y-2 text-mono">
              {links.map(([label, href]) => (
                <li key={label}>
                  {href === '#' ? (
                    <span className={label.endsWith('soon') ? 'text-grey-40' : 'text-grey-10'}>{label}</span>
                  ) : (
                    <Link href={href} className="link-line text-grey-10 hover:text-lime">{label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-16 flex flex-col gap-2 border-t border-lime-deep pt-5 text-mono text-grey-40 md:flex-row md:justify-between">
        <span>© 2026 mercure.exe — preview</span>
        <span>Chain id <span className="text-grey-10">{ROBINHOOD_CHAIN_ID}</span> · routes are described or not offered</span>
      </div>
    </footer>
  )
}
