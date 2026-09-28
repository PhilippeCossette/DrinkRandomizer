// Red "↘ -38%" badge, computed from the regular and sale prices.

import { IconArrowDownRight } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { ease } from '#/lib/easing'
import { getDiscountPercent } from '#/lib/pricing'
import Badge from './Badge'

type Props = {
  regularPrice: number
  salePrice: number
  delay?: number
  className?: string
}

// "↘ -38%" badge, same everywhere
export default function DiscountChip({ regularPrice, salePrice, delay = 0, className }: Props) {
  const discount = getDiscountPercent(regularPrice, salePrice)

  return (
    <motion.span
      className="inline-flex"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease }}
    >
      <Badge tone="danger" icon={IconArrowDownRight} className={className}>
        -{discount}%
      </Badge>
    </motion.span>
  )
}
