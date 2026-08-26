import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'

export function Nav() {
  return (
    <nav className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-6 sm:px-8 lg:px-12" aria-label="Primary">
      <Link href="/" className="text-lime no-underline">
        <Wordmark className="text-[1.125rem]" />
      </Link>
      <div className="flex items-center gap-6 text-mono">
        <a href="#markets" className="text-grey-10 hover:text-lime transition-colors">Markets</a>
        <Link href="/tx/demo" className="text-lime hover:text-highlight transition-colors">Open a route →</Link>
      </div>
    </nav>
  )
}
