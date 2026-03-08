import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// ── Input ─────────────────────────────────────────────────
type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full font-sans text-sm text-ink bg-transparent',
        'border-0 border-b border-smoke',
        'py-2 px-0 outline-none',
        'placeholder:text-fog',
        'transition-colors duration-150',
        'focus:border-ink',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

// ── Textarea ──────────────────────────────────────────────
type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full font-sans text-sm text-ink bg-transparent',
        'border-0 border-b border-smoke',
        'py-2 px-0 outline-none resize-none',
        'placeholder:text-fog leading-relaxed',
        'transition-colors duration-150',
        'focus:border-ink',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'
