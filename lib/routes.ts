import type { Address, Hex } from 'viem'
import { encodeFunctionData, parseAbi, parseUnits } from 'viem'
import { ROBINHOOD_CHAIN_ID } from './chain'
import { formatAmount, formatBps } from './format'

/**
 * Routing engine.
 *
 * The signing page renders ONLY what comes back from `getRoute()`; it computes nothing on
 * its own. Routes are not stored: a route id *is* the route. `encodeRouteId` packs the
 * intent (kind, market, amount, issue time) into a url-safe token, `getRoute` unpacks it and
 * rebuilds the transaction. Whoever mints the link — this site or the system upstream of it —
 * needs no shared database, and a link carries its own 10-minute expiry.
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
  /** Amount used when the site quotes this market as an example sentence. */
  exampleAmount: string
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
    exampleAmount: '5000',
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
    exampleAmount: '25000',
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
    exampleAmount: '5000',
  },
]

export const ROUTE_TTL_MS = 10 * 60 * 1000
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

/* ------------------------------------------------------------------ route ids */

/** A route, before it has an id. Everything needed to rebuild it lives here. */
export type RouteIntent = {
  kind: RouteKind
  marketKey: string
  /** Decimal string in the loan asset's units, e.g. "1250.5". */
  amount: string
  /** ms epoch. Defaults to now; the 10-minute window runs from this instant. */
  issuedAt?: number
}

const ID_VERSION = 1

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string | null {
  if (!/^[A-Za-z0-9_-]+$/.test(s)) return null
  try {
    const b64 = s.replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
    return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)))
  } catch {
    return null
  }
}

/**
 * FNV-1a over the payload. This catches a truncated or mistyped link — it is NOT a
 * signature, and route ids are not secrets. Nothing here authorises anything: the id only
 * describes a transaction the wallet shows in full before it is signed.
 */
function checksum(s: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(36).padStart(7, '0').slice(-7)
}

/** Mint the id for a route. `/tx/${encodeRouteId(intent)}` is a complete, shareable link. */
export function encodeRouteId(intent: RouteIntent): string {
  const issuedAt = intent.issuedAt ?? Date.now()
  const body = [ID_VERSION, intent.kind === 'deposit' ? 'd' : 'w', intent.marketKey, intent.amount, Math.floor(issuedAt / 1000).toString(36)].join('|')
  return `${toBase64Url(body)}.${checksum(body)}`
}

type DecodedIntent = Required<RouteIntent>

function decodeRouteId(id: string): DecodedIntent | null {
  const at = id.lastIndexOf('.')
  if (at <= 0) return null
  const body = fromBase64Url(id.slice(0, at))
  if (!body || checksum(body) !== id.slice(at + 1)) return null

  const [version, k, marketKey, amount, ts] = body.split('|')
  if (Number(version) !== ID_VERSION) return null
  if (k !== 'd' && k !== 'w') return null
  if (!marketKey || !amount || !ts) return null
  if (!/^\d+(\.\d+)?$/.test(amount)) return null

  const issuedAt = parseInt(ts, 36) * 1000
  if (!Number.isFinite(issuedAt) || issuedAt <= 0) return null

  return { kind: k === 'd' ? 'deposit' : 'withdraw', marketKey, amount, issuedAt }
}

/* ------------------------------------------------------------------ the engine */

export function listMarkets(): Market[] {
  return MARKETS
}

export function getMarket(key: string): Market | undefined {
  return MARKETS.find((m) => m.key === key)
}

/** Build a route from an intent. Returns null when the engine would not offer it. */
export function buildRoute(intent: RouteIntent): Route | null {
  const market = getMarket(intent.marketKey)
  if (!market || market.status !== 'open') return null

  let amount: bigint
  try {
    amount = parseUnits(intent.amount, market.loanAsset.decimals)
  } catch {
    return null
  }
  if (amount <= 0n) return null

  const issuedAt = intent.issuedAt ?? Date.now()
  const tx = buildTx(intent.kind, market, amount)

  return {
    id: encodeRouteId({ ...intent, issuedAt }),
    kind: intent.kind,
    chainId: ROBINHOOD_CHAIN_ID,
    amount,
    asset: market.loanAsset,
    protocol: market.protocol,
    market: market.pair,
    marketId: market.id,
    netApyBps: market.netApyBps,
    fee: { wei: tx.gas * L2_GAS_PRICE_WEI, symbol: 'ETH' },
    risks: risksFor(intent.kind, market),
    createdAt: issuedAt,
    expiresAt: issuedAt + ROUTE_TTL_MS,
    tx,
  }
}

/** Resolve a route id. Returns null when the id is malformed or names no open market. */
export async function getRoute(id: string): Promise<Route | null> {
  const intent = decodeRouteId(id)
  if (!intent) return null
  const route = buildRoute(intent)
  // `buildRoute` re-mints the id from the intent; keep the one the visitor arrived on.
  return route ? { ...route, id } : null
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

/** Figures the site quotes. Every one is read off the open markets — nothing is estimated. */
export type Stats = { avgNetApyBps: number; openMarkets: number; totalMarkets: number }
export function getStats(): Stats {
  const open = MARKETS.filter((m) => m.status === 'open')
  return {
    avgNetApyBps: Math.round(open.reduce((a, m) => a + m.netApyBps, 0) / open.length),
    openMarkets: open.length,
    totalMarkets: MARKETS.length,
  }
}

/**
 * One route per open market, at that market's example amount — the sentences the site quotes.
 * They run through the same `buildRoute`/`describeRoute` as a real link, so the site can never
 * show a sentence the engine would not produce.
 */
export function listOfferedRoutes(): Route[] {
  return MARKETS.filter((m) => m.status === 'open').flatMap((m) => {
    const deposit = buildRoute({ kind: 'deposit', marketKey: m.key, amount: m.exampleAmount })
    return deposit ? [deposit] : []
  })
}
