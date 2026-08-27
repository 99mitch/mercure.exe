import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { Typewriter } from './Typewriter'
import { BlobStill } from './BlobStill'
import { Magnetic } from './Magnetic'
import { BlobLayer } from './BlobLayer'
import { HeroCopy } from './HeroCopy'

/**
 * The one orchestrated moment: wordmark types in, blob resolves from black.
 * Everything after this section is quiet.
 */
export function Hero() {
  return (
    <section data-blob-pose="hero" className="relative z-10 min-h-dvh overflow-hidden px-5 pt-28 pb-16 sm:px-8 lg:px-12" aria-labelledby="hero-title">
      {/* z-far: 0.15× scroll. Never contains text. */}
      <BlobLayer>
        <div className="relative aspect-square w-[min(78vw,24rem)] md:w-[min(46vw,46rem)]">
          <BlobStill className="h-full w-full object-contain" />
        </div>
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
              <Magnetic><Button href="#markets" tone="limeFill" size="lg">See the markets</Button></Magnetic>
              <Magnetic><Button href="#how" tone="quiet" size="lg">How it works</Button></Magnetic>
            </div>
          </HeroCopy>
        </div>
      </div>
      <p className="pointer-events-none absolute bottom-8 right-5 hidden items-center gap-3 text-label text-grey-40 sm:right-8 md:flex lg:right-12" aria-hidden="true">
        Scroll <span className="block h-px w-10 bg-lime-deep" />
      </p>
    </section>
  )
}
