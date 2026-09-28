// Chart + floating drink image, inside the drink card.

import { motion } from 'motion/react'
import type { Drink } from '#/schema/drinks'
import CrashChart from './CrashChart'
import { image } from './variants'
import { imageUrl } from '#/lib/images'

type Props = {
  drink: Drink
  still: boolean
}

// Chart + drink image, in a soft panel inside the card.
// Takes all the height the header and info don't use.
export default function DrinkStage({ drink, still }: Props) {
  return (
    <div className="relative mx-[min(1rem,3vw)] aspect-4/3 shrink-0 overflow-hidden rounded-inner bg-sunken lg:aspect-auto lg:min-h-0 lg:flex-1">
      <CrashChart from={drink.regularPrice} to={drink.salePrice} still={still}>
        {/* pinned to the chart area, so the image can fill it */}
        <motion.div variants={image} className="absolute inset-0">
          <motion.img
            src={imageUrl(drink.imgSrc)}
            alt={drink.name}
            className="h-full w-full object-contain drop-shadow-[0_18px_22px_rgba(0,0,0,0.22)]"
            animate={still ? undefined : { y: [0, -6, 0] }}
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
          />
        </motion.div>
      </CrashChart>
    </div>
  )
}
