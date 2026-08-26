'use client'

import { injected, useConnect } from 'wagmi'
import { useAppKit } from '@reown/appkit/react'
import { Button } from '@/components/ui/Button'
import { hasAppKit } from '@/lib/wagmi'

type Props = { tone: 'lime' | 'neutral'; onError: (message: string) => void }

/**
 * "Connect wallet" — same slot, same size as Approve. Which connector backs it is decided
 * once at module load (`hasAppKit`), so hooks stay unconditional inside each variant.
 */
export function ConnectButton(props: Props) {
  return hasAppKit ? <AppKitConnect {...props} /> : <InjectedConnect {...props} />
}

function AppKitConnect({ tone }: Props) {
  const { open } = useAppKit()
  return (
    <Button onClick={() => open({ view: 'Connect' })} tone={tone} size="lg" block>
      Connect wallet
    </Button>
  )
}

function InjectedConnect({ tone, onError }: Props) {
  const { connect, isPending } = useConnect()
  return (
    <Button
      onClick={() =>
        connect(
          { connector: injected() },
          { onError: (e) => onError(/not found|no provider/i.test(e.message) ? 'No wallet was found in this browser.' : e.message) },
        )
      }
      tone={tone}
      size="lg"
      block
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? 'Waiting for wallet…' : 'Connect wallet'}
    </Button>
  )
}
