import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

/**
 * Talks about the signing page without importing it. The two surfaces stay separate;
 * this is a typographic specimen of the sentence, not the component.
 */
export function SigningSpecimen() {
  return (
    <section className="px-5 py-28 sm:px-8 lg:px-12 lg:py-40" aria-labelledby="sign-title">
      <div className="grid gap-16 lg:grid-cols-2">
        <Reveal>
          <Label as="p" className="mb-6"><span data-reveal>The signing page</span></Label>
          <h2 id="sign-title" className="text-h2 text-grey-10 max-w-[24ch]" data-reveal>
            Boring on purpose.
          </h2>
          <p className="mt-8 text-body text-grey-10/80 measure" data-reveal>
            Nobody wants a parallax animation while they approve a transaction with their money. So the page you sign on has none: no motion, one sentence, the numbers in monospace, the address in full, one button that says what the wallet will say.
          </p>
          <p className="mt-4 text-body text-grey-10/80 measure" data-reveal>
            Cancel weighs the same as Approve. Expired means expired. Nothing you see was computed anywhere but the routing engine.
          </p>
          <div className="mt-10" data-reveal>
            <Button href="/tx/demo" tone="lime" size="lg">See the page</Button>
          </div>
        </Reveal>

        <Reveal className="border border-lime-deep p-6 sm:p-8">
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
        </Reveal>
      </div>
    </section>
  )
}
