import { Label } from '@/components/ui/Label'

export type NumberRow = { label: string; value: string; copyable?: boolean }

/** Step 2: the numbers, in mono, aligned. Every value here came from the routing engine. */
export function TxNumbers({ rows }: { rows: NumberRow[] }) {
  return (
    <dl className="border-t border-grey-70">
      {rows.map((r) => (
        <div key={r.label} className="grid grid-cols-[minmax(6rem,10rem)_1fr] gap-x-4 py-3 border-b border-grey-70">
          <Label as="dt" className="pt-[0.2em]">{r.label}</Label>
          <dd className="text-mono text-grey-10 text-right break-words select-all">{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}
