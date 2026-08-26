import { twMerge } from 'tailwind-merge'
import { cx, type CxOptions } from 'class-variance-authority'

export function cn(...inputs: CxOptions) {
  return twMerge(cx(...inputs))
}
