// The drink card on the main screen. Re-plays its entrance for every new round.

import { IconTrendingDown } from '@tabler/icons-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Badge from '#/components/ui/Badge'
import { cardClass } from '#/components/ui/Card'
import CardTitle from '#/components/ui/CardTitle'
import type { Drink } from '#/schema/drinks'
import DrinkInfo from './DrinkInfo'
import DrinkStage from './DrinkStage'
import { container, item } from './variants'

type Props = {
  drink: Drink
  round: number
}

// The drink card: header, chart + image panel, then name and prices
export default function DrinkReveal({ drink, round }: Props) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={round}
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
        className={`${cardClass} flex w-full flex-col overflow-hidden lg:h-full lg:min-h-0`}
      >
        {/* header */}
        <motion.div
          variants={item}
          className="flex shrink-0 items-center justify-between gap-3 px-tile pt-tile pb-4"
        >
          <CardTitle>Verre en crash</CardTitle>
          <Badge tone="danger" icon={IconTrendingDown}>
            En chute
          </Badge>
        </motion.div>

        <DrinkStage drink={drink} still={reduceMotion} />
        <DrinkInfo drink={drink} />
      </motion.div>
    </AnimatePresence>
  )
}
