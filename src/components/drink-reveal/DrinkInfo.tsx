// Bottom of the drink card: % off, name, sale price and struck regular price.

import { motion } from 'motion/react'
import type { Drink } from '#/schema/drinks'
import DiscountChip from '#/components/ui/DiscountChip'
import OldPrice from '#/components/ui/OldPrice'
import { isOnSale } from '#/lib/pricing'
import AnimatedPrice from './AnimatedPrice'
import { CHIP_DELAY, STRIKE_DELAY } from './constants'
import { item } from './variants'

type Props = {
  drink: Drink
}

// Name, % off, then the sale price with the regular price struck next to it.
// Wide card (TV, laptop): name on the left, prices on the right, on one row.
// Narrow card (phone, small laptop): prices go under the name.
// Sizes follow the card's own width (cqw), so nothing overlaps.
export default function DrinkInfo({ drink }: Props) {
  const discounted = isOnSale(drink)

  return (
    <div className="@container shrink-0">
      <div className="flex flex-col gap-3 p-[min(var(--spacing-tile),5cqw)] @3xl:flex-row @3xl:items-end @3xl:justify-between @3xl:gap-tile">
        {/* % off + name */}
        <div className="flex min-w-0 flex-col items-start gap-3">
          {discounted && (
            <motion.div variants={item}>
              <DiscountChip
                regularPrice={drink.regularPrice}
                salePrice={drink.salePrice}
                delay={CHIP_DELAY}
              />
            </motion.div>
          )}
          <motion.h3
            variants={item}
            className="text-[min(3.4rem,10cqw)] leading-tight font-semibold tracking-tight text-ink @3xl:text-[min(3.4rem,4.5cqw)]"
          >
            {drink.name}
          </motion.h3>
        </div>

        {/* sale price + regular price struck next to it (wraps under it if needed) */}
        <motion.div
          variants={item}
          className="flex shrink-0 flex-wrap items-baseline gap-x-[min(1.25rem,3cqw)] gap-y-1 tabular-nums"
        >
          <span className="text-[min(var(--text-hero),22cqw)] leading-[0.85] font-bold tracking-tight text-accent @3xl:text-[min(var(--text-hero),14cqw)]">
            <AnimatedPrice from={drink.regularPrice} to={drink.salePrice} />
          </span>
          {discounted && (
            <OldPrice
              value={drink.regularPrice}
              delay={STRIKE_DELAY}
              className="text-[min(3.4rem,9cqw)] @3xl:text-[min(3.4rem,4.5cqw)]"
            />
          )}
        </motion.div>
      </div>
    </div>
  )
}
