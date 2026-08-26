import type { Address, Hex } from 'viem'
import { encodeFunctionData, parseAbi, parseUnits } from 'viem'
import { ROBINHOOD_CHAIN_ID } from './chain'
import { formatAmount, formatBps } from './format'

/**
 * Routing engine — mock.
 *
 * This module stands in for the routing service. The signing page renders ONLY what
 * comes back from `getRoute()`; it computes nothing on its own. When the real engine
 * lands, replace the bodies of `getRoute` / `listMarkets` and keep the types.
 */

export type Asset = { symbol: string; address: Address; decimals: number }

export type Market = {
  key: string
  protocol: 'Morpho'
  pair: string // "USDG/wETH"
  id: Hex
  loanAsset: Asset
  netApyBps: number
  utilizationBps: number
  status: 'open' | 'paused'
}

export type RouteKind = 'deposit' | 'withdraw'

export type Route = {
  id: string
  kind: RouteKind
  chainId: typeof ROBINHOOD_CHAIN_ID
  amount: bigint
  asset: Asset
  protocol: Market['protocol']
  market: string
  marketId: Hex
  netApyBps: number
  fee: { wei: bigint; symbol: 'ETH' }
  risks: string[]
  createdAt: number
  expiresAt: number
  tx: { to: Address; data: Hex; value: bigint; gas: bigint }
}

const USDG: Asset = {
  symbol: 'USDG',
  address: '0xe343167631d89B6Ffc58B88d6b7fB0228795491D',
  decimals: 6,
}

const MORPHO: Address = '0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb'

const MARKETS: Market[] = [
  {
    key: 'morpho-usdg-weth',
    protocol: 'Morpho',
    pair: 'USDG/wETH',
    id: '0x8f46cd82c4c44a090c3d72bd7a84baf4e69ee50331d5deae514f86fe062b0748',
    loanAsset: USDG,
    netApyBps: 840,
    utilizationBps: 9400,
    status: 'open',
  },
  {
    key: 'morpho-usdg-wbtc',
    protocol: 'Morpho',
    pair: 'USDG/wBTC',
    id: '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49',
    loanAsset: USDG,
    netApyBps: 712,
    utilizationBps: 8100,
    status: 'open',
  },
  {
    key: 'morpho-usdg-hood',
    protocol: 'Morpho',
    pair: 'USDG/HOOD',
    id: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    loanAsset: USDG,
    netApyBps: 0,
    utilizationBps: 0,
    status: 'paused',
  },
]

const ROUTE_TTL_MS = 10 * 60 * 1000
const L2_GAS_PRICE_WEI = 50_000_000n // 0.05 gwei

const morphoAbi = parseAbi([
  'function supply((address loanToken,address collateralToken,address oracle,address irm,uint256 lltv) marketParams,uint256 assets,uint256 shares,address onBehalf,bytes data)',
  'function withdraw((address loanToken,address collateralToken,address oracle,address irm,uint256 lltv) marketParams,uint256 assets,uint256 shares,address onBehalf,address receiver)',
])

const ZERO: Address = '0x0000000000000000000000000000000000000000'

function buildTx(kind: RouteKind, market: Market, amount: bigint) {
  const params = { loanToken: market.loanAsset.address, collateralToken: ZERO, oracle: ZERO, irm: ZERO, lltv: 0n }
  const data =
    kind === 'deposit'
      ? encodeFunctionData({ abi: morphoAbi, functionName: 'supply', args: [params, amount, 0n, ZERO, '0x'] })
      : encodeFunctionData({ abi: morphoAbi, functionName: 'withdraw', args: [params, amount, 0n, ZERO, ZERO] })
  const gas = kind === 'deposit' ? 182_000n : 164_000n
  return { to: MORPHO, data, value: 0n, gas }
}

function risksFor(kind: RouteKind, market: Market): string[] {
  const risks: string[] = []
  if (kind === 'withdraw' && market.utilizationBps >= 9000) {
    risks.push(
      `This market is ${formatBps(market.utilizationBps)} utilized. Withdrawals may be delayed until borrowers repay.`,
    )
  }
  if (kind === 'deposit' && market.netApyBps < 100) {
    risks.push('Net APY on this market is under 1%. The fee may exceed your first month of yield.')
  }
  return risks
}

type Seed = { kind: RouteKind; marketKey: string; amount: string; expired?: boolean }

const SEEDS: Record<string, Seed> = {
  demo: { kind: 'deposit', marketKey: 'morpho-usdg-weth', amount: '5000' },
  'demo-withdraw': { kind: 'withdraw', marketKey: 'morpho-usdg-weth', amount: '1250.5' },
  'demo-wbtc': { kind: 'deposit', marketKey: 'morpho-usdg-wbtc', amount: '25000' },
  expired: { kind: 'deposit', marketKey: 'morpho-usdg-weth', amount: '5000', expired: true },
}

export function listMarkets(): Market[] {
  return MARKETS
}

export function getMarket(key: string): Market | undefined {
  return MARKETS.find((m) => m.key === key)
}

/** Resolve a route id. Returns null when the engine has no such route. */
export async function getRoute(id: string): Promise<Route | null> {
  const seed = SEEDS[id]
  if (!seed) return null
  const market = getMarket(seed.marketKey)
  if (!market || market.status !== 'open') return null

  const amount = parseUnits(seed.amount, market.loanAsset.decimals)
  const tx = buildTx(seed.kind, market, amount)
  const now = Date.now()
  const createdAt = seed.expired ? now - ROUTE_TTL_MS - 60_000 : now

  return {
    id,
    kind: seed.kind,
    chainId: ROBINHOOD_CHAIN_ID,
    amount,
    asset: market.loanAsset,
    protocol: market.protocol,
    market: market.pair,
    marketId: market.id,
    netApyBps: market.netApyBps,
    fee: { wei: tx.gas * L2_GAS_PRICE_WEI, symbol: 'ETH' },
    risks: risksFor(seed.kind, market),
    createdAt,
    expiresAt: createdAt + ROUTE_TTL_MS,
    tx,
  }
}

/**
 * The one sentence. If a route cannot be described here, the protocol does not offer it.
 * e.g. "Deposit 5,000 USDG into Morpho USDG/wETH. Current net APY 8.4%."
 */
export function describeRoute(route: Route): string {
  const verb = route.kind === 'deposit' ? 'Deposit' : 'Withdraw'
  const prep = route.kind === 'deposit' ? 'into' : 'from'
  const amount = formatAmount(route.amount, route.asset.decimals)
  return `${verb} ${amount} ${route.asset.symbol} ${prep} ${route.protocol} ${route.market}. Current net APY ${formatBps(route.netApyBps)}.`
}

export function isExpired(route: Route, now = Date.now()): boolean {
  return now >= route.expiresAt
}

/** Serializable subset for client components (bigint -> string). */
export type RouteTx = { to: Address; data: Hex; value: string; gas: string; chainId: number }
export function toRouteTx(route: Route): RouteTx {
  return {
    to: route.tx.to,
    data: route.tx.data,
    value: route.tx.value.toString(),
    gas: route.tx.gas.toString(),
    chainId: route.chainId,
  }
}
