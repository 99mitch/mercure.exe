import { headers } from 'next/headers'
import { WalletProvider } from '@/components/sign/WalletProvider'

/**
 * Signing surface. No Lenis, no GSAP, no WebGL. The document scrolls natively.
 */
export default async function TxLayout({ children }: { children: React.ReactNode }) {
  const cookies = (await headers()).get('cookie')
  return (
    <div className="min-h-dvh bg-grey-90 text-grey-10">
      <WalletProvider cookies={cookies}>{children}</WalletProvider>
    </div>
  )
}
