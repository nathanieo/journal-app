import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'bg-pure-white border border-paper-3 rounded-sm shadow-card',
        hover && 'transition-all duration-200 hover:shadow-card-hover hover:border-smoke cursor-pointer',
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-7 pt-6 pb-2', className)} {...props} />
)
CardHeader.displayName = 'CardHeader'

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-7 pb-7', className)} {...props} />
)
CardContent.displayName = 'CardContent'

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <div
    className={cn(
      'font-mono text-2xs tracking-widest uppercase text-fog',
      className
    )}
    {...props}
  />
)
CardTitle.displayName = 'CardTitle'
