import { formatUnits } from 'viem'

const groupInt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0, useGrouping: true })

/** 5000000000n, 6 -> "5,000"; 1250500000n, 6 -> "1,250.5" */
export function formatAmount(raw: bigint, decimals: number, maxFraction = 2): string {
  const s = formatUnits(raw, decimals)
  const [int, frac = ''] = s.split('.')
  const fracTrim = frac.slice(0, maxFraction).replace(/0+$/, '')
  return groupInt.format(BigInt(int)) + (fracTrim ? `.${fracTrim}` : '')
}

/** 840 -> "8.4%", 1205 -> "12.05%", 9400 -> "94%" */
export function formatBps(bps: number): string {
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

/** wei -> "0.0000091 ETH" — up to 8 places, trailing zeros trimmed */
export function formatFee(wei: bigint, symbol = 'ETH'): string {
  const n = Number(formatUnits(wei, 18))
  const str = n > 0 && n < 0.00000001 ? '<0.00000001' : n.toFixed(8).replace(/0+$/, '').replace(/\.$/, '')
  return `${str} ${symbol}`
}

/** ms -> "9:41" / "0:07" */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Long opaque identifiers, shown without wrapping the layout: "MS5kLm1v…1a2b3c4" */
export function shortId(id: string, head = 8, tail = 6): string {
  return id.length <= head + tail + 1 ? id : `${id.slice(0, head)}…${id.slice(-tail)}`
}

/** ms epoch -> "17:42 UTC" — the instant a route was issued, in one glanceable token. */
export function formatIssuedAt(ms: number): string {
  const d = new Date(ms)
  const hh = d.getUTCHours().toString().padStart(2, '0')
  const mm = d.getUTCMinutes().toString().padStart(2, '0')
  return `${hh}:${mm} UTC`
}
