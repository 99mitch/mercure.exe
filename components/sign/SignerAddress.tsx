'use client'

import { useAccount } from 'wagmi'
import { Label } from '@/components/ui/Label'

/** Step 4: the address you're signing from. Full, monospace, selectable. */
export function SignerAddress() {
  const { address, status } = useAccount()
  return (
    <section aria-labelledby="signer-heading">
      <Label as="h3" className="mb-2">
        <span id="signer-heading">Signing from</span>
      </Label>
      {address ? (
        <p className="text-mono text-grey-10 break-all select-all" data-testid="signer-address">
          {address}
        </p>
      ) : (
        <p className="text-mono text-grey-40">
          {status === 'connecting' || status === 'reconnecting' ? 'Checking wallet…' : 'No wallet connected.'}
        </p>
      )}
    </section>
  )
}
