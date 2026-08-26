import { Wordmark } from '@/components/ui/Wordmark'
import { ROBINHOOD_CHAIN_ID } from '@/lib/chain'

export function Footer() {
  return (
    <footer className="border-t border-lime-deep px-5 py-10 sm:px-8 lg:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <Wordmark className="text-[1.5rem] text-lime" />
          <p className="mt-3 text-body text-grey-10/80">The messenger runs onchain.</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-mono">
          <dt className="text-grey-40">CHAIN</dt><dd className="text-grey-10">Robinhood Chain · {ROBINHOOD_CHAIN_ID}</dd>
          <dt className="text-grey-40">ROUTES</dt><dd className="text-grey-10">Morpho</dd>
          <dt className="text-grey-40">STATUS</dt><dd className="text-grey-10">Preview</dd>
        </dl>
      </div>
    </footer>
  )
}
