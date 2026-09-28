// Shooter card content when a shooter is on sale.

import { motion, useReducedMotion } from 'motion/react'
import type { Drink } from '#/schema/drinks'
import AnimatedPrice from '#/components/drink-reveal/AnimatedPrice'
import OldPrice from '#/components/ui/OldPrice'
import { isOnSale } from '#/lib/pricing'
import { imageUrl } from '#/lib/images'

type Props = {
  shot: Drink
}

// Current shot: image, name, sale price and regular price.
// Narrow card: image on top, info under it. Wider card: side by side.
// Sizes follow the card's own width (cqw), so it fits on a phone, a laptop or a TV.
export default function ShotActive({ shot }: Props) {
  const reduceMotion = useReducedMotion() ?? false
  const discounted = isOnSale(shot)

  return (
    <div className="@container h-full lg:[container-type:size]">
      <div className="flex h-full flex-col justify-center gap-4 p-[min(var(--spacing-tile),5cqw)] @lg:flex-row @lg:items-center @lg:gap-[min(var(--spacing-tile),4cqw)]">
        {/* image */}
        <div className="relative aspect-square w-[30cqw] max-w-40 shrink-0 overflow-hidden rounded-inner bg-sunken @lg:w-[28cqw] lg:@lg:w-[min(34cqw,calc(100cqh-3rem))] lg:@lg:max-w-none">
          <div className="absolute inset-0 p-[10%]">
            <motion.img
              src={imageUrl(shot.imgSrc)}
              alt={shot.name}
              className="h-full w-full object-contain drop-shadow-[0_8px_10px_rgba(0,0,0,0.25)]"
              animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
            />
          </div>
        </div>

        {/* info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
          <h3 className="truncate text-[min(var(--text-heading),8cqw)] leading-tight font-semibold tracking-tight text-ink">
            {shot.name}
          </h3>

          {/* wraps the old price under the new one when there isn't room */}
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 tabular-nums">
            <span className="text-[min(var(--text-price),14cqw)] leading-none font-bold tracking-tight text-accent">
              <AnimatedPrice
                from={shot.regularPrice}
                to={shot.salePrice}
                delay={0.6}
                duration={1.4}
              />
            </span>
            {discounted && (
              <OldPrice
                value={shot.regularPrice}
                delay={0.6}
                className="text-[min(var(--text-heading),7cqw)]"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
