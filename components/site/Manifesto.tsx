import { Reveal } from './Reveal'

const LINES = ['The messenger', 'runs onchain.']
const PRINCIPLES = [
  'One sentence per route, or no route.',
  'Net after fees. Never gross.',
  'The signing page never animates.',
  'Nothing you did not read moves.',
]

/** The loudest type on the site. Display face at display size, nothing else on screen. */
export function Manifesto() {
  return (
    <section data-blob-pose="manifesto" className="relative z-10 border-t border-lime-deep px-5 py-28 sm:px-8 lg:px-12 lg:py-44" aria-label="Manifesto">
      <Reveal as="div">
        <p className="text-display text-lime">
          {LINES.map((l) => (
            <span key={l} data-reveal className="block">{l}</span>
          ))}
        </p>
      </Reveal>
      <Reveal as="ul" className="mt-16 grid gap-x-8 gap-y-4 text-mono text-grey-10 md:grid-cols-2 lg:max-w-[60rem]">
        {PRINCIPLES.map((p, i) => (
          <li key={p} data-reveal className="flex gap-4 border-t border-lime-deep pt-3">
            <span className="text-lime">{String(i + 1).padStart(2, '0')}</span>
            <span>{p}</span>
          </li>
        ))}
      </Reveal>
    </section>
  )
}
