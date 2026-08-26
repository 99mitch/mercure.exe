'use client'

import { useState, type ReactNode } from 'react'
import { WagmiProvider, cookieToInitialState } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter, wagmiConfig, networks, reownProjectId, hasAppKit } from '@/lib/wagmi'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

if (hasAppKit && typeof window !== 'undefined') {
  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId: reownProjectId,
    metadata: {
      name: 'mercure.exe',
      description: 'The messenger runs onchain.',
      url: siteUrl,
      icons: [`${siteUrl}/icon.svg`],
    },
    features: { analytics: false, email: false, socials: false, swaps: false, onramp: false },
    themeMode: 'dark',
    themeVariables: {
      '--w3m-accent': '#E2FF00',
      '--w3m-color-mix': '#000000',
      '--w3m-color-mix-strength': 40,
      '--w3m-border-radius-master': '1px',
      '--w3m-font-family': 'var(--font-inter-tight), system-ui, sans-serif',
    },
  })
}

export function WalletProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const [queryClient] = useState(() => new QueryClient())
  const initialState = cookieToInitialState(wagmiConfig, cookies)
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}
