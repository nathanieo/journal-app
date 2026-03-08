import { cn } from '@/lib/utils'

interface SeparatorProps {
  className?: string
  orientation?: 'horizontal' | 'vertical'
}

export function Separator({ className, orientation = 'horizontal' }: SeparatorProps) {
  return (
    <div
      role="separator"
      className={cn(
        'bg-paper-3',
        orientation === 'horizontal' ? 'w-full h-px my-6' : 'h-full w-px mx-3',
        className
      )}
    />
  )
}
