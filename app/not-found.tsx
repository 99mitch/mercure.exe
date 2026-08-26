import { Button } from '@/components/ui/Button'
import { Wordmark } from '@/components/ui/Wordmark'

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 py-16 sm:px-8">
      <Wordmark className="text-[1.125rem]" cursor={false} />
      <h1 className="mt-10 text-h2 text-grey-10 measure">Nothing here.</h1>
      <div className="mt-8">
        <Button href="/" tone="lime" size="lg">Back to the start</Button>
      </div>
    </main>
  )
}
