// Badge: soft tinted pill with an icon (same look everywhere in the app).

import type { ComponentType, ReactNode } from 'react'

export type BadgeTone = 'danger' | 'success' | 'warning' | 'neutral'

// Tinted background + colored text (full class names, so Tailwind can find them)
const TONES: Record<BadgeTone, string> = {
  danger: 'bg-danger-soft text-danger',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-neutral-soft text-neutral',
}

type Props = {
  tone?: BadgeTone
  icon?: ComponentType<{ size?: string | number; stroke?: number; className?: string }>
  children: ReactNode
  className?: string
}

// One badge style for the whole app: soft tinted pill, colored icon + text
export default function Badge({
  tone = 'neutral',
  icon: Icon,
  children,
  className = '',
}: Props) {
  const t = TONES[tone]
  return (
    <span
      className={`inline-flex items-center gap-[0.4em] whitespace-nowrap rounded-[0.6em] px-[0.7em] py-[0.35em] text-chip font-medium leading-none tabular-nums ${t} ${className}`}
    >
      {Icon && <Icon size="1.1em" stroke={2} className="shrink-0" />}
      {children}
    </span>
  )
}
