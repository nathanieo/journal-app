import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'muted' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variants: Record<BadgeVariant, string> = {
  default:  'bg-ink text-paper border-ink',
  success:  'bg-success-bg text-success border-success-border',
  muted:    'bg-transparent text-fog border-paper-3',
  outline:  'bg-transparent text-ash border-smoke',
}

export function Badge({ variant = 'muted', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-mono text-2xs tracking-widest uppercase',
        'px-2 py-0.5 border rounded-sm leading-none',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}
