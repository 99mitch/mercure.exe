import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Wordmark'

export default function TxNotFound() {
  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10">
        <Wordmark className="text-[1.125rem]" cursor={false} />
      </header>
      <h1 className="text-[1.375rem] leading-[1.35] text-grey-10 measure">
        There is no route with this id. It may have been discarded, or the link was copied incompletely.
      </h1>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button href="/" tone="neutral" size="lg" block>Back to mercure.exe</Button>
      </div>
    </main>
  )
}
