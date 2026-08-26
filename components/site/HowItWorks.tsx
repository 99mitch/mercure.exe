import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'

const STEPS = [
  {
    n: '01',
    title: 'Route',
    body: 'The engine reads every open market on Robinhood Chain and picks a route by net APY after fees. Not gross. Not projected. Net, now.',
  },
  {
    n: '02',
    title: 'Describe',
    body: 'Every route compiles to one plain sentence. If a route cannot be described in a sentence a person understands on first read, the protocol does not offer it.',
  },
  {
    n: '03',
    title: 'Sign',
    body: 'You read the sentence, check the numbers, approve in your wallet. Nothing moves that you did not read. The signing page never animates.',
  },
]

/** The three steps. The blob's droplets detach and sit above each column while this is in view. */
export function HowItWorks() {
  return (
    <section id="how" data-blob-pose="how" className="relative z-10 border-t border-lime-deep px-5 py-24 sm:px-8 lg:px-12 lg:py-36" aria-labelledby="how-title">
      <Reveal>
        <Label as="p" className="mb-6"><span data-reveal>How it works</span></Label>
        <h2 id="how-title" className="text-h2 text-grey-10 max-w-[28ch]" data-reveal>
          One sentence, or it doesn&rsquo;t ship.
        </h2>
      </Reveal>

      <Reveal as="ol" className="mt-24 grid gap-14 md:grid-cols-3 md:gap-8">
        {STEPS.map((s) => (
          <li key={s.n} data-reveal className="border-t border-lime-deep pt-8">
            <p className="font-display text-[clamp(4rem,9vw,8rem)] leading-[0.85] text-lime" aria-hidden="true">{s.n}</p>
            <h3 className="mt-8 text-[1.375rem] text-grey-10">
              <span className="sr-only">{s.n} </span>{s.title}
            </h3>
            <p className="mt-4 text-body text-grey-10/80 max-w-[38ch]">{s.body}</p>
          </li>
        ))}
      </Reveal>
    </section>
  )
}
