'use client'

import { useEffect, useState } from 'react'
import { useAccount, useSendTransaction, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { ConnectButton } from './ConnectButton'
import { formatCountdown } from '@/lib/format'
import { txUrl } from '@/lib/chain'
import type { RouteTx } from '@/lib/routes'

type Props = {
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
export function ApproveFlow({ tx, expiresAt, initialRemainingMs }: Props) {
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

  // Once a transaction is in flight the countdown stops mattering — the chain has it.
  if (expired && !hash) {
    return (
      <section aria-live="polite" className="space-y-4">
        <p className="text-body text-grey-10 measure">
          This route has expired. Prices and fees may have changed since it was issued, so it can no longer be signed.
          Ask for a new link from wherever this one came from.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href="/" tone="neutral" size="lg" block>
            Back to mercure.exe
          </Button>
        </div>
      </section>
    )
  }

  if (receipt.isSuccess && hash) {
    return (
      <section aria-live="polite" className="space-y-4">
        <p className="text-body text-grey-10 measure">Confirmed. The transaction is included on Robinhood Chain.</p>
        <TxHash hash={hash} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href="/" tone="neutral" size="lg" block>Done</Button>
        </div>
      </section>
    )
  }

  if (receipt.isError && hash) {
    return (
      <section aria-live="polite" className="space-y-4">
        <p role="alert" className="text-body text-grey-10 measure">
          <span aria-hidden="true" className="text-lime">— </span>
          The transaction was sent but did not succeed on chain. Nothing was deposited. The hash below has the reason.
        </p>
        <TxHash hash={hash} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button href="/" tone="neutral" size="lg" block>Back to mercure.exe</Button>
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

      {hash ? <TxHash hash={hash} /> : null}

      <p className="text-mono text-grey-40" aria-live="off">
        {hash ? (
          'Sent. The countdown no longer applies.'
        ) : (
          <>
            Expires in <span className="text-grey-10 tabular-nums">{formatCountdown(remaining)}</span>
          </>
        )}
      </p>
    </section>
  )
}

/** The hash, in full, selectable, and linked to the explorer. */
function TxHash({ hash }: { hash: string }) {
  return (
    <div>
      <Label as="p" className="mb-1">Transaction hash</Label>
      <a
        href={txUrl(hash)}
        target="_blank"
        rel="noreferrer noopener"
        className="link-line text-mono text-grey-10 break-all hover:text-lime"
      >
        {hash}
      </a>
    </div>
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
