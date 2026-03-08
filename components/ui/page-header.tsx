import { type ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode  // right-side slot
  className?: string
  below?: ReactNode      // full-width slot below the title row (e.g. progress bar)
}

export function PageHeader({ title, subtitle, children, className, below }: PageHeaderProps) {
  return (
    <header className={cn('px-14 pt-11 pb-7 border-b border-paper-3 bg-paper', className)}>
      <div className="flex items-center justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-display text-4xl font-bold text-ink leading-tight tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 font-mono text-2xs tracking-widest uppercase text-fog">
              {subtitle}
            </p>
          )}
        </div>
        {children && (
          <div className="flex-shrink-0 flex items-center gap-3">
            {children}
          </div>
        )}
      </div>
      {below && <div className="mt-5">{below}</div>}
    </header>
  )
}
