import { defineChain } from 'viem'

/**
 * Robinhood Chain — single source of truth for chain id 4663.
 * Everything that needs the chain (wagmi config, AppKit, tx construction, OG images)
 * imports from here. Do not redefine it anywhere else.
 */
export const ROBINHOOD_CHAIN_ID = 4663 as const

const rpcUrl =
  process.env.NEXT_PUBLIC_RH_RPC_URL || 'https://rpc.chain.robinhood.com'

export const robinhoodChain = defineChain({
  id: ROBINHOOD_CHAIN_ID,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: [rpcUrl] },
  },
  blockExplorers: {
    default: { name: 'Robinhood Chain Explorer', url: 'https://explorer.chain.robinhood.com' },
  },
  testnet: false,
})

export type RobinhoodChain = typeof robinhoodChain
