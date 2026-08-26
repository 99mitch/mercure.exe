'use client'

import { useEffect, useState } from 'react'
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { ConnectButton } from './ConnectButton'
import { formatCountdown } from '@/lib/format'
import type { RouteTx } from '@/lib/routes'

type Props = {
  routeId: string
  tx: RouteTx
  expiresAt: number
  /** Server-computed; keeps the first paint honest when JS is off. */
  initialRemainingMs: number
}

/**
 * Steps 5 and 6: one button, and the expiry, understated.
 * No motion. State changes swap text, nothing fades.
 * Cancel and Approve carry the same visual weight; lime appears on Approve only.
 */
export function ApproveFlow({ routeId, tx, expiresAt, initialRemainingMs }: Props) {
  const [remaining, setRemaining] = useState(initialRemainingMs)
  const expired = remaining <= 0

  useEffect(() => {
    const tick = () => setRemaining(expiresAt - Date.now())
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [expiresAt])

  const { isConnected, chainId } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const { sendTransactionAsync, data: hash, error: sendError, isPending, reset } = useSendTransaction()
  const receipt = useWaitForTransactionReceipt({ hash })

  const [localError, setLocalError] = useState<string | null>(null)
  const error = localError ?? describeError(sendError)

  async function onApprove() {
    setLocalError(null)
    reset()
    try {
      if (chainId !== tx.chainId) {
        await switchChainAsync({ chainId: tx.chainId })
      }
      await sendTransactionAsync({
        to: tx.to,
        data: tx.data,
        value: BigInt(tx.value),
        gas: BigInt(tx.gas),
        chainId: tx.chainId,
      })
    } catch (e) {
      setLocalError(describeError(e))
    }
  }

  if (expired) {
    return (
      <section aria-live="polite" className="space-y-4">
        <p className="text-body text-grey-10 measure">
          This route has expired. Prices and fees may have changed, so it needs to be run again before it can be signed.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href={`/tx/${routeId}`} tone="lime" size="lg" block>
            Re-run route
          </Button>
          <Button href="/" tone="neutral" size="lg" block>
            Cancel
          </Button>
        </div>
      </section>
    )
  }

  if (receipt.isSuccess && hash) {
    return (
      <section aria-live="polite" className="space-y-4">
        <p className="text-body text-grey-10 measure">Confirmed. The transaction is included on Robinhood Chain.</p>
        <div>
          <Label as="p" className="mb-2">Transaction hash</Label>
          <p className="text-mono text-grey-10 break-all select-all">{hash}</p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href="/" tone="neutral" size="lg" block>Done</Button>
        </div>
      </section>
    )
  }

  const busy = isPending || (Boolean(hash) && receipt.isLoading)
  const label = isPending ? 'Waiting for wallet…' : hash ? 'Confirming…' : 'Approve in wallet'

  return (
    <section className="space-y-4">
      {error ? (
        <p role="alert" className="text-body text-grey-10 measure">
          <span aria-hidden="true" className="text-lime">— </span>
          {error}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {isConnected ? (
          <Button onClick={onApprove} tone={error ? 'neutral' : 'lime'} size="lg" block disabled={busy} aria-busy={busy}>
            {error && !busy ? 'Try again' : label}
          </Button>
        ) : (
          <ConnectButton tone={error ? 'neutral' : 'lime'} onError={(m) => setLocalError(m)} />
        )}
        <Button href="/" tone="neutral" size="lg" block>
          Cancel
        </Button>
      </div>

      {hash && !receipt.isSuccess ? (
        <div>
          <Label as="p" className="mb-1">Transaction hash</Label>
          <p className="text-mono text-grey-10 break-all select-all">{hash}</p>
        </div>
      ) : null}

      <p className="text-mono text-grey-40" aria-live="off">
        Expires in <span className="text-grey-10 tabular-nums">{formatCountdown(remaining)}</span>
      </p>
    </section>
  )
}

function describeError(e: unknown): string | null {
  if (!e) return null
  const msg = e instanceof Error ? e.message : String(e)
  if (/rejected|denied|cancel/i.test(msg)) return 'The wallet declined the request. Nothing was sent.'
  if (/insufficient funds/i.test(msg)) return 'Not enough ETH on Robinhood Chain to pay the network fee.'
  if (/chain|network/i.test(msg) && /switch|unsupported|unrecognized/i.test(msg)) return 'The wallet could not switch to Robinhood Chain (4663). Add the network and try again.'
  if (/no.*(provider|connector)|not found/i.test(msg)) return 'No wallet was found in this browser.'
  return `The request failed. ${msg.split('\n')[0].slice(0, 160)}`
}
