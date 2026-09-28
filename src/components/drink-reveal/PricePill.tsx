// Small price label pinned to the right edge of the chart.

import type { ComponentType, ReactNode } from 'react'

type Props = {
  y: number // position in the chart, 0-100 (% of the height)
  tone: 'crash' | 'neutral'
  icon?: ComponentType<{ size?: string | number; stroke?: number }>
  children: ReactNode
}

const TONES = {
  crash: 'bg-danger text-white',
  neutral: 'bg-surface text-ink ring-1 ring-inset ring-line shadow-card',
}

// Price label pinned to the right edge of the chart, like a trading platform
export default function PricePill({ y, tone, icon: Icon, children }: Props) {
  return (
    <span
      className={`absolute right-[min(1rem,3vw)] flex -translate-y-1/2 items-center gap-[0.3em] rounded-[0.6em] px-[0.6em] py-[0.3em] text-chip font-medium leading-none tabular-nums ${TONES[tone]}`}
      style={{ top: `${y}%` }}
    >
      {Icon && <Icon size="1em" stroke={2.5} />}
      {children}
    </span>
  )
}
