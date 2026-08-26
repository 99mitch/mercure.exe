import { Label } from '@/components/ui/Label'

/** Step 3: risk flags as plain text. No icons, no yellow triangles. */
export function RiskFlags({ risks }: { risks: string[] }) {
  if (risks.length === 0) return null
  return (
    <section aria-labelledby="risks-heading">
      <Label as="h3" className="mb-2">
        <span id="risks-heading">Before you sign</span>
      </Label>
      <ul className="measure space-y-2">
        {risks.map((r) => (
          <li key={r} className="text-body text-grey-10">
            {r}
          </li>
        ))}
      </ul>
    </section>
  )
}
