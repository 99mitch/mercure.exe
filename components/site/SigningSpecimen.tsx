import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

/**
 * Talks about the signing page without importing it. The blob calms and shrinks into the
 * specimen card while this is in view — the metaphor for what happens on /tx.
 */
export function SigningSpecimen() {
  return (
    <section id="sign" data-blob-pose="sign" className="relative z-10 border-t border-lime-deep px-5 py-24 sm:px-8 lg:px-12 lg:py-36" aria-labelledby="sign-title">
      <div className="grid gap-16 lg:grid-cols-2">
        <Reveal>
          <Label as="p" className="mb-6"><span data-reveal>The signing page</span></Label>
          <h2 id="sign-title" className="font-display text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-grey-10 max-w-[12ch]" data-reveal>
            Boring on purpose.
          </h2>
          <p className="mt-8 text-body text-grey-10/80 measure" data-reveal>
            Nobody wants a parallax animation while they approve a transaction with their money. So the page you sign on has none: no motion, one sentence, the numbers in monospace, the address in full, one button that says what the wallet will say.
          </p>
          <p className="mt-4 text-body text-grey-10/80 measure" data-reveal>
            Cancel weighs the same as Approve. Expired means expired. Nothing you see was computed anywhere but the routing engine.
          </p>
          <p className="mt-8 text-body text-grey-10/80 measure" data-reveal>
            You reach it by link. A route link carries the route inside it — the market, the amount, the moment it was
            issued — so it opens the same page for you as for whoever sent it, and it stops working ten minutes later.
          </p>
        </Reveal>

        <Reveal className="relative border border-lime-deep bg-grey-90 p-6 sm:p-8 lg:mt-24">
          <Label as="p" className="mb-4"><span data-reveal>Specimen</span></Label>
          <p className="text-[1.375rem] leading-[1.35] text-grey-10" data-reveal>
            Deposit 5,000 USDG into Morpho USDG/wETH. Current net APY 8.4%.
          </p>
          <dl className="mt-8 grid grid-cols-[8rem_1fr] gap-y-3 text-mono" data-reveal>
            <dt className="text-grey-40">AMOUNT</dt><dd className="text-grey-10">5,000 USDG</dd>
            <dt className="text-grey-40">NET APY</dt><dd className="text-grey-10">8.4%</dd>
            <dt className="text-grey-40">EST. FEE</dt><dd className="text-grey-10">0.0000091 ETH</dd>
            <dt className="text-grey-40">CHAIN</dt><dd className="text-grey-10">4663</dd>
          </dl>
          <div className="mt-8 grid grid-cols-2 gap-3" data-reveal aria-hidden="true">
            <span className="inline-flex min-h-12 items-center justify-center border border-lime rounded-[2px] text-lime">Approve in wallet</span>
            <span className="inline-flex min-h-12 items-center justify-center border border-grey-10 rounded-[2px] text-grey-10">Cancel</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
