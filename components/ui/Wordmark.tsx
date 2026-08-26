import { cn } from './cn'

/**
 * Text wordmark in the display face. The rendered `mercure.exe_` asset is the source of
 * truth; when it lands, swap this for the SVG rather than tuning the font to match.
 */
export function Wordmark({ className, cursor = true }: { className?: string; cursor?: boolean }) {
  return (
    <span className={cn('font-display whitespace-nowrap', className)} translate="no">
      mercure.exe{cursor ? <span aria-hidden="true">_</span> : null}
    </span>
  )
}
