import type { ReactNode } from 'react'

// Title at the top of a card ("Prochain crash", "Verre en crash"...)
export default function CardTitle({
  children,
  className = 'text-ink',
}: {
  children: ReactNode
  className?: string // color, defaults to text-ink
}) {
  return (
    <h2 className={`text-card-title font-medium leading-tight tracking-tight ${className}`}>
      {children}
    </h2>
  )
}
