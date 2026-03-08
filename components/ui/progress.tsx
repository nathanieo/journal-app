'use client'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number          // 0–100
  className?: string
  trackClassName?: string
  fillClassName?: string
  thickness?: 'thin' | 'default' | 'thick'
  color?: 'default' | 'success' | 'dynamic'
  animated?: boolean
}

const thicknesses = {
  thin:    'h-px',
  default: 'h-1',
  thick:   'h-1.5',
}

// Returns a hex color based on completion % — used for SVG strokes, inline styles, and the Progress component itself
export function progressHex(value: number): string {
  if (value <= 0)   return '#f87171' // red-400
  if (value <= 20)  return '#f87171' // red-400
  if (value <= 60)  return '#fbbf24' // amber-400
  if (value < 100)  return '#84cc16' // lime-500
  return '#1a7a3a'                   // success green
}

// Kept for any consumers that still reference it
export function progressColor(value: number): string {
  if (value <= 0)   return 'bg-red-400'
  if (value <= 20)  return 'bg-red-400'
  if (value <= 60)  return 'bg-amber-400'
  if (value < 100)  return 'bg-lime-500'
  return 'bg-success'
}

export function Progress({
  value,
  className,
  trackClassName,
  fillClassName,
  thickness = 'default',
  color = 'default',
  animated = true,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))

  // Always use inline hex so Tailwind purging can never strip the color
  const fillHex =
    color === 'dynamic' ? progressHex(clamped) :
    color === 'success' ? '#1a7a3a' :
    clamped >= 100      ? '#1a7a3a' :   // default also greens out at 100%
    '#0a0a0a'

  return (
    <div
      className={cn('w-full overflow-hidden rounded-full bg-paper-3', thicknesses[thickness], trackClassName, className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          'h-full rounded-full',
          animated && 'transition-[width,background-color] duration-700 ease-smooth',
          fillClassName
        )}
        style={{ width: `${clamped}%`, backgroundColor: fillHex }}
      />
    </div>
  )
}
