// Regular price with a red line that draws itself through it.

import { motion } from 'motion/react'
import { ease } from '#/lib/easing'
import { formatPrice } from '#/lib/format'

type Props = {
  value: number
  delay?: number
  className?: string // text size, defaults to text-heading
}

// Regular price, struck through by a red line that draws itself
export default function OldPrice({ value, delay = 0, className = 'text-heading' }: Props) {
  return (
    <span
      className={`relative font-medium leading-none tabular-nums text-ink-faint ${className}`}
    >
      {formatPrice(value)}
      <motion.span
        className="absolute inset-x-[-0.08em] top-[calc(50%-0.03em)] h-[0.07em] origin-left rounded-full bg-danger"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay, duration: 0.5, ease }}
      />
    </span>
  )
}
