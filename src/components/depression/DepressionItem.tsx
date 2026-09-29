// One drink or shot on the La Grande Dépression page: image with a small
// crash chart behind it, name, sale price counting down, and the old price.
// Sizes follow the card itself (container queries), so it fits any grid cell.

import { motion } from 'motion/react'
import AnimatedPrice from '#/components/drink-reveal/AnimatedPrice'
import ShotCrashLine from '#/components/shot/ShotCrashLine'
import { cardClass } from '#/components/ui/Card'
import DiscountChip from '#/components/ui/DiscountChip'
import OldPrice from '#/components/ui/OldPrice'
import { ease } from '#/lib/easing'
import { useImageUrl } from '#/hooks/useImageUrl'
import { isOnSale } from '#/lib/pricing'
import type { Drink } from '#/schema/drinks'

type Props = {
  item: Drink
  kind: 'drink' | 'shot'
  index: number // position in the grid, for the staggered entrance
  baseDelay: number // seconds before the first card appears
}

export default function DepressionItem({
  item,
  kind,
  index,
  baseDelay,
}: Props) {
  const src = useImageUrl(item.imgSrc) // stays the same while this card is shown
  const delay = baseDelay + 0.15 + index * 0.08

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease }}
      className={`${cardClass} @container relative flex min-h-0 w-full flex-col overflow-hidden lg:[container-type:size]`}
    >
      {/* top corners: shooter tag + discount */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-[min(0.9rem,4cqw)]">
        {kind === 'shot' ? (
          <span className="rounded-[0.6em] bg-neutral-soft px-[0.7em] py-[0.35em] text-chip font-medium leading-none text-ink-soft">
            Shooter
          </span>
        ) : (
          <span />
        )}
        {isOnSale(item) && (
          <DiscountChip
            regularPrice={item.regularPrice}
            salePrice={item.salePrice}
            delay={delay + 0.4}
          />
        )}
      </div>

      {/* image with the crash line behind it */}
      <div className="relative m-[min(0.6rem,3cqw)] mb-0 aspect-[4/3] overflow-hidden rounded-inner bg-sunken lg:aspect-auto lg:min-h-0 lg:flex-1">
        <ShotCrashLine pulse={false} animated={false} />
        <img
          src={src}
          alt={item.name}
          className="absolute inset-0 m-auto h-[82%] w-[82%] object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.3)]"
        />
      </div>

      {/* name + prices */}
      <div className="flex flex-col gap-1 p-[min(var(--spacing-tile),5cqw)] pt-[min(0.8rem,3cqw)]">
        <h3 className="truncate text-[min(var(--text-subheading),9cqw)] leading-tight font-semibold tracking-tight text-ink">
          {item.name}
        </h3>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 tabular-nums">
          <span className="text-[min(3.4rem,17cqw)] leading-none font-bold tracking-tight text-accent">
            <AnimatedPrice
              from={item.regularPrice}
              to={item.salePrice}
              delay={delay + 0.3}
              duration={1.4}
            />
          </span>
          {isOnSale(item) && (
            <OldPrice
              value={item.regularPrice}
              delay={delay + 0.3}
              className="text-[min(var(--text-subheading),8cqw)]"
            />
          )}
        </div>
      </div>
    </motion.article>
  )
}
