import { Label } from '@/components/ui/Label'
import { Reveal } from './Reveal'
import { Parallax, Z } from './Parallax'

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

export function HowItWorks() {
  return (
    <section id="how" className="relative overflow-hidden px-5 py-28 sm:px-8 lg:px-12 lg:py-40" aria-labelledby="how-title">
      {/* z-mid imagery: a lime-deep frame that drifts at 0.55× */}
      <Parallax speed={Z.mid} className="pointer-events-none absolute right-[-10vw] top-1/2 -z-10 h-[60vh] w-[60vw] -translate-y-1/2 border border-lime-deep">
        <div className="h-full w-full" />
      </Parallax>

      <Reveal>
        <Label as="p" className="mb-6" >
          <span data-reveal>How it works</span>
        </Label>
        <h2 id="how-title" className="text-h2 text-grey-10 max-w-[28ch]" data-reveal>
          One sentence, or it doesn&rsquo;t ship.
        </h2>
      </Reveal>

      <Reveal as="ol" className="mt-20 grid gap-12 md:grid-cols-3 md:gap-8">
        {STEPS.map((s) => (
          <li key={s.n} data-reveal className="border-t border-lime-deep pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-mono text-lime">{s.n}</span>
              <h3 className="text-[1.25rem] text-grey-10">{s.title}</h3>
            </div>
            <p className="mt-6 text-body text-grey-10/80 max-w-[38ch]">{s.body}</p>
          </li>
        ))}
      </Reveal>
    </section>
  )
}
