'use client'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'ghost' | 'outline' | 'danger' | 'success'
type Size    = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const base =
  'inline-flex items-center justify-center gap-2 font-mono tracking-widest uppercase ' +
  'transition-all duration-150 cursor-pointer select-none disabled:opacity-40 disabled:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper'

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2 active:scale-[0.98] rounded-sm',
  ghost:   'bg-transparent text-ink border border-smoke hover:border-ink hover:bg-ink hover:text-paper rounded-sm',
  outline: 'bg-transparent text-ash border border-paper-3 hover:border-smoke hover:text-ink rounded-sm',
  danger:  'bg-transparent text-red-700 border border-red-200 hover:bg-red-50 hover:border-red-400 rounded-sm',
  success: 'bg-success text-white hover:opacity-90 rounded-sm',
}

const sizes: Record<Size, string> = {
  sm:   'text-2xs px-3 py-1.5 h-7',
  md:   'text-2xs px-5 py-2 h-9',
  lg:   'text-xs px-7 py-2.5 h-11',
  icon: 'text-xs w-9 h-9',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
      ) : children}
    </button>
  )
)
Button.displayName = 'Button'
