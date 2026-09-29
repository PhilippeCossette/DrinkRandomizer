// One card in the spinning reel (image, % off, name, sale price).

import { motion } from 'motion/react'
import DiscountChip from '#/components/ui/DiscountChip'
import { ease } from '#/lib/easing'
import { formatPrice } from '#/lib/format'
import { isOnSale } from '#/lib/pricing'
import type { Drink } from '#/schema/drinks'
import { useImageUrl } from '#/hooks/useImageUrl'

type Props = {
  width: number // px
  drink: Drink
  landed: boolean
  isWinner: boolean
}

export default function ReelCard({ width, drink, landed, isWinner }: Props) {
  const src = useImageUrl(drink.imgSrc) // stays the same while this card is shown
  const highlighted = landed && isWinner

  return (
    <div style={{ width }} className="h-full shrink-0 px-2">
      <motion.div
        animate={
          landed
            ? isWinner
              ? { scale: 1.04, opacity: 1 }
              : { scale: 0.96, opacity: 0.35 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.6, ease }}
        className={`relative flex h-full flex-col overflow-hidden rounded-tile border-2 bg-surface p-[0.6rem] shadow-card transition-[border-color,box-shadow] duration-500 ${
          highlighted
            ? 'border-accent shadow-[0_0_0_6px_var(--accent-soft)]'
            : 'border-line'
        }`}
      >
        {/* image panel */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded-inner bg-sunken">
          <div className="absolute inset-0 p-3">
            <img
              src={src}
              alt={drink.name}
              className="h-full w-full object-contain drop-shadow-[0_12px_16px_rgba(0,0,0,0.22)]"
            />
          </div>

          {/* % off, always visible */}
          {isOnSale(drink) && (
            <span className="absolute left-3 top-3 inline-flex">
              <DiscountChip
                regularPrice={drink.regularPrice}
                salePrice={drink.salePrice}
              />
            </span>
          )}
        </div>

        {/* name + sale price */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-[0.9rem] pt-4 pb-3">
          <span className="min-w-0 truncate text-subheading font-semibold tracking-tight text-ink">
            {drink.name}
          </span>
          <span className="shrink-0 text-subheading font-semibold tabular-nums text-success">
            {formatPrice(drink.salePrice)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}
