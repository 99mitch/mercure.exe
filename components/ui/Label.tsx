import { cn } from './cn'

/** Uppercase mono label. Secondary text colour by default. */
export function Label({
  className,
  children,
  as: Tag = 'span',
  title,
}: {
  className?: string
  children: React.ReactNode
  as?: 'span' | 'dt' | 'th' | 'p' | 'h3'
  /** Native tooltip — used where the visible text is truncated. */
  title?: string
}) {
  return (
    <Tag className={cn('text-label text-grey-40', className)} title={title}>
      {children}
    </Tag>
  )
}
