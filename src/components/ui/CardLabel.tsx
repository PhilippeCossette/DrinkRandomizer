import type { ReactNode } from 'react'

// Small secondary text ("Fin dans", "Prochain tirage"...)
export default function CardLabel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <span className={`text-label text-ink-soft ${className}`}>{children}</span>
}
