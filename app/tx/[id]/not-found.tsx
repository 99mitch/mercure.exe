import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Wordmark'

export default function TxNotFound() {
  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10">
        <Wordmark className="text-[1.125rem]" cursor={false} />
      </header>
      <h1 className="text-[1.375rem] leading-[1.35] text-grey-10 measure">
        This link does not describe a route.
      </h1>
      <p className="mt-6 text-body text-grey-10/80 measure">
        A route link carries the whole route inside it, so it only fails to open for two reasons: it was copied
        incompletely, or it names a market that is no longer open. Check the link end to end, then ask for a new one
        from wherever it came from.
      </p>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button href="/" tone="neutral" size="lg" block>Back to mercure.exe</Button>
      </div>
    </main>
  )
}
