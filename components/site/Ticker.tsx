import { describeRoute, listOfferedRoutes } from '@/lib/routes'
import { Marquee } from './Marquee'

/**
 * What the engine offers right now, in its own words — one sentence per open market, produced
 * by the same `describeRoute` the signing page reads. Runs the width of the page under the hero.
 */
export function Ticker() {
  const sentences = listOfferedRoutes().map(describeRoute)
  return (
    <div className="relative z-10 border-y border-lime-deep bg-black/70 backdrop-blur-[2px]" aria-label="Routes the engine offers">
      <Marquee className="py-3" speed={36}>
        {sentences.map((s, i) => (
          <span key={i} className="text-mono text-grey-10 pr-16">
            <span className="text-lime pr-4" aria-hidden="true">→</span>
            {s}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
