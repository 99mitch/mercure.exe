import { cn } from './cn'

/** Uppercase mono label. Secondary text colour by default. */
export function Label({ className, children, as: Tag = 'span' }: { className?: string; children: React.ReactNode; as?: 'span' | 'dt' | 'th' | 'p' | 'h3' }) {
  return <Tag className={cn('text-label text-grey-40', className)}>{children}</Tag>
}
