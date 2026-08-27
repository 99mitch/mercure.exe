import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { describeRoute, getRoute, isExpired, toRouteTx } from '@/lib/routes'
import { addressUrl } from '@/lib/chain'
import { formatAmount, formatBps, formatFee, formatIssuedAt, shortId } from '@/lib/format'
import { Wordmark } from '@/components/ui/Wordmark'
import { Label } from '@/components/ui/Label'
import { TxSentence } from '@/components/sign/TxSentence'
import { TxNumbers, type NumberRow } from '@/components/sign/TxNumbers'
import { RiskFlags } from '@/components/sign/RiskFlags'
import { SignerAddress } from '@/components/sign/SignerAddress'
import { ApproveFlow } from '@/components/sign/ApproveFlow'

// Expiry is wall-clock; never cache this page.
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const route = await getRoute(id)
  // Route links are private and short-lived: never let one into an index.
  if (!route) return { title: 'Route not found', robots: { index: false, follow: false } }
  const sentence = describeRoute(route)
  return {
    title: sentence,
    description: 'Review and approve in your wallet.',
    robots: { index: false, follow: false },
    openGraph: { title: sentence, images: [`/api/og?tx=${encodeURIComponent(id)}`] },
  }
}

export default async function TxPage({ params }: Params) {
  const { id } = await params
  const route = await getRoute(id)
  if (!route) notFound()

  const now = Date.now()
  const expired = isExpired(route, now)
  const sentence = describeRoute(route)

  const rows: NumberRow[] = [
    { label: 'Amount', value: `${formatAmount(route.amount, route.asset.decimals)} ${route.asset.symbol}` },
    { label: 'Protocol', value: route.protocol },
    { label: 'Market', value: route.market },
    { label: 'Net APY', value: formatBps(route.netApyBps) },
    { label: 'Est. fee', value: formatFee(route.fee.wei, route.fee.symbol) },
    { label: 'Chain', value: `Robinhood Chain · ${route.chainId}` },
    { label: 'Issued', value: formatIssuedAt(route.createdAt) },
  ]

  return (
    <main className="mx-auto w-full max-w-[40rem] px-5 py-8 sm:px-8 sm:py-12">
      <header className="mb-10 flex items-baseline justify-between gap-4">
        <Link href="/" className="text-grey-10 no-underline">
          <Wordmark className="text-[1.125rem]" cursor={false} />
        </Link>
        <Label title={route.id}>Route {shortId(route.id)}</Label>
      </header>

      <div className="space-y-8">
        <TxSentence sentence={expired ? `${sentence} This route has expired.` : sentence} />

        <TxNumbers rows={rows} />

        <RiskFlags risks={route.risks} />

        <SignerAddress />

        <ApproveFlow
          tx={toRouteTx(route)}
          expiresAt={route.expiresAt}
          initialRemainingMs={expired ? 0 : route.expiresAt - now}
        />
      </div>

      <footer className="mt-16 border-t border-grey-70 pt-4">
        <p className="text-mono text-grey-40">
          Contract{' '}
          <a
            href={addressUrl(route.tx.to)}
            target="_blank"
            rel="noreferrer noopener"
            className="link-line text-grey-10 break-all hover:text-lime"
          >
            {route.tx.to}
          </a>
        </p>
      </footer>
    </main>
  )
}
