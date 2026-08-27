import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Satori (next/og) reads these at runtime; make sure they are traced into the server bundle.
  outputFileTracingIncludes: { '/api/og': ['./assets/og/**/*'] },
  webpack: (config) => {
    // Optional deps pulled in by WalletConnect that are never used in the browser.
    config.externals.push('pino-pretty', 'lokijs', 'encoding')
    // @wagmi/connectors (via the AppKit adapter) reaches the Base Account connector, whose Node
    // entry imports the Coinbase CDP SDK for its payments feature — with optional x402 peers we
    // never install. Same for the Tempo wallet's optional `accounts` peer, and for the MetaMask
    // SDK connector's `@metamask/connect-evm` (an optional peer: the extension is reached through
    // `injected()`, and mobile through WalletConnect). Stub them out of the bundle; connecting a
    // wallet does not touch any of them.
    config.resolve.alias = {
      ...config.resolve.alias,
      '@coinbase/cdp-sdk': false,
      accounts$: false,
      '@metamask/connect-evm': false,
    }
    return config
  },
}

export default nextConfig
