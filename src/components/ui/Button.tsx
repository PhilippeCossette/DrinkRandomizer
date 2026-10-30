// Large text button (home screen). Same look as the rest of the app:
// solid = logo yellow (main action), outline = surface + border, danger = red.

import { motion } from 'motion/react'
import type { ComponentType, ReactNode } from 'react'

type Props = {
  variant?: 'solid' | 'outline' | 'danger'
  icon?: ComponentType<{ size?: string | number; stroke?: number }>
  onClick?: () => void
  autoFocus?: boolean
  children: ReactNode
}

const VARIANTS = {
  solid: 'bg-accent text-accent-ink border-transparent hover:brightness-105',
  outline: 'bg-surface text-ink border-line hover:bg-sunken',
  danger: 'bg-danger text-white border-transparent hover:brightness-110',
}

export default function Button({
  variant = 'solid',
  icon: Icon,
  onClick,
  autoFocus,
  children,
}: Props) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      autoFocus={autoFocus}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex w-full items-center justify-center gap-3 rounded-[1rem] border px-6 py-[1.05rem] text-subheading font-semibold tracking-tight transition-[filter,background-color] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${VARIANTS[variant]}`}
    >
      {Icon && <Icon size="1.15em" stroke={2.25} />}
      {children}
    </motion.button>
  )
}
