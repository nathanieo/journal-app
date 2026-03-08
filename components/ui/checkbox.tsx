'use client'
import { cn } from '@/lib/utils'

interface CheckboxProps {
  checked: boolean
  onChange?: () => void
  className?: string
  size?: 'sm' | 'md'
}

export function Checkbox({ checked, onChange, className, size = 'md' }: CheckboxProps) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onChange?.()}
      className={cn(
        // Base
        'relative flex-shrink-0 flex items-center justify-center',
        'border rounded-sm cursor-pointer select-none',
        'transition-all duration-150 ease-spring',
        // Focus ring
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1',
        // Hover
        'hover:scale-105',
        // Checked vs unchecked
        checked
          ? 'bg-ink border-ink animate-check-pop'
          : 'bg-pure-white border-smoke hover:border-ink',
        // Sizes
        size === 'sm' ? 'w-4 h-4' : 'w-[22px] h-[22px]',
        className
      )}
    >
      {checked && (
        <svg
          viewBox="0 0 12 9"
          fill="none"
          className={cn('stroke-white stroke-2', size === 'sm' ? 'w-2.5 h-2' : 'w-3 h-2.5')}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M1 4.5L4.5 8L11 1" />
        </svg>
      )}
    </div>
  )
}
