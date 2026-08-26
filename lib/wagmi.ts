import { cookieStorage, createStorage } from 'wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { robinhoodChain } from './chain'

export const reownProjectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ?? ''
export const hasAppKit = reownProjectId.length > 0

export const networks = [robinhoodChain] as [typeof robinhoodChain]

/**
 * Wagmi adapter for Reown AppKit. Created once per module instance; `ssr: true` + cookie
 * storage so the connection state survives the server render without a hydration mismatch.
 */
export const wagmiAdapter = new WagmiAdapter({
  projectId: hasAppKit ? reownProjectId : 'missing-project-id',
  networks,
  ssr: true,
  storage: createStorage({ storage: cookieStorage }),
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
