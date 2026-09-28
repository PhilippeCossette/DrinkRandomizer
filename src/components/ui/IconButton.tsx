// Round icon button used in the staff menu.

import { motion } from 'motion/react'
import type { ReactNode } from 'react'

type Props = {
  label: string // for screen readers and the tooltip
  onClick?: () => void
  variant?: 'solid' | 'outline'
  active?: boolean
  children: ReactNode
  ariaProps?: Record<string, string | boolean>
}

const VARIANTS = {
  solid: 'bg-accent text-accent-ink border-transparent',
  outline: 'bg-surface text-ink border-line hover:bg-sunken',
}

// Round icon button, like the ↗ buttons in the dashboard references
export default function IconButton({
  label,
  onClick,
  variant = 'outline',
  active,
  children,
  ariaProps,
}: Props) {
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      aria-label={label}
      title={label}
      {...ariaProps}
      className={`grid h-[2.75rem] w-[2.75rem] place-items-center overflow-hidden rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        VARIANTS[variant]
      } ${active ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''}`}
    >
      {children}
    </motion.button>
  )
}
