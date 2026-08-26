import * as React from 'react'
import Link from 'next/link'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

/**
 * Shared button. Works on both surfaces, so: no motion library, no transitions beyond
 * a color change. `tone` is the only place lime enters — use it once per screen on /tx.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 select-none',
    'font-sans font-medium text-[1rem] leading-none tracking-[-0.005em]',
    'border rounded-[2px] min-h-12 px-5',
    'transition-colors duration-[var(--dur-fast)] ease-[var(--ease-out)]',
    'disabled:cursor-not-allowed disabled:opacity-50',
  ],
  {
    variants: {
      tone: {
        lime: 'border-lime text-lime hover:bg-lime hover:text-black active:bg-lime-mid active:border-lime-mid',
        limeFill: 'border-lime bg-lime text-black hover:bg-lime-mid hover:border-lime-mid',
        neutral: 'border-grey-10 text-grey-10 hover:bg-grey-10 hover:text-black',
        quiet: 'border-grey-70 text-grey-10 hover:border-grey-40',
      },
      size: {
        md: 'min-h-12 px-5',
        lg: 'min-h-14 px-7 text-[1.0625rem]',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { tone: 'neutral', size: 'md', block: false },
  },
)

type Variants = VariantProps<typeof buttonVariants>

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & Variants & { href?: undefined }
type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & Variants & { href: string }

export function Button(props: ButtonProps | LinkProps) {
  const { tone, size, block, className, ...rest } = props
  const classes = cn(buttonVariants({ tone, size, block }), className)
  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...a } = rest as LinkProps
    return <Link href={href} className={classes} {...a} />
  }
  const b = rest as ButtonProps
  return <button type={b.type ?? 'button'} className={classes} {...b} />
}
