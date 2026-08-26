import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Typewriter } from './Typewriter'
import { BlobSwitch } from './BlobSwitch'
import { BlobLayer } from './BlobLayer'
import { HeroCopy } from './HeroCopy'

/**
 * The one orchestrated moment: wordmark types in, blob resolves from black.
 * Everything after this section is quiet.
 */
export function Hero() {
  return (
    <section className="relative isolate min-h-dvh overflow-hidden px-5 pt-28 pb-16 sm:px-8 lg:px-12" aria-labelledby="hero-title">
      {/* z-far: 0.15× scroll. Never contains text. */}
      <BlobLayer>
        <BlobSwitch className="relative aspect-square w-[min(78vw,24rem)] md:w-[min(46vw,46rem)] [&_img]:h-full [&_img]:w-full [&_img]:object-contain" />
      </BlobLayer>

      {/* z-near: type. Never parallaxed. */}
      <div className="relative z-10 flex min-h-[calc(100dvh-11rem)] flex-col justify-end">
        <Label as="p" className="mb-5 text-lime">Robinhood Chain · 4663</Label>
        <h1 id="hero-title" className="text-display text-lime">
          <Typewriter text="mercure.exe" className="js-typed" />
        </h1>

        <div className="mt-10 grid max-w-[44rem] gap-6">
          <HeroCopy>
            <p className="text-[1.25rem] leading-[1.4] text-grey-10 measure">
              The messenger runs onchain. Yield routes on Robinhood Chain you can read in one sentence and approve in one tap.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href="/tx/demo" tone="limeFill" size="lg">Open a route</Button>
              <Button href="#how" tone="quiet" size="lg">How it works</Button>
            </div>
          </HeroCopy>
        </div>
      </div>
    </section>
  )
}
