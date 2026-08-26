import { listRecentSentences } from '@/lib/routes'
import { Marquee } from './Marquee'

/** Live routes, straight from the engine, as sentences. Runs the width of the page under the hero. */
export async function Ticker() {
  const sentences = await listRecentSentences()
  return (
    <div className="relative z-10 border-y border-lime-deep bg-black/70 backdrop-blur-[2px]" aria-label="Recent routes">
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
