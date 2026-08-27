import Link from 'next/link'
import { Wordmark } from '@/components/ui/Wordmark'
import { NavAutoHide } from './NavAutoHide'

/** Fixed, hides on scroll down, returns on scroll up. Static (always visible) without JS. */
export function Nav() {
  return (
    <NavAutoHide>
      <nav className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12" aria-label="Primary">
        <Link href="/" className="text-lime no-underline">
          <Wordmark className="text-[1.125rem]" />
        </Link>
        <div className="flex items-center gap-7 text-mono">
          <a href="#how" className="link-line text-grey-10 hover:text-lime">How it works</a>
          <a href="#markets" className="link-line text-grey-10 hover:text-lime">Markets</a>
          <a href="#sign" className="link-line text-grey-10 hover:text-lime">Signing</a>
        </div>
      </nav>
    </NavAutoHide>
  )
}
