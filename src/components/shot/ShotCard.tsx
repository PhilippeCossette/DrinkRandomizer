// The shooter card: header, active/empty content, and the countdown footer.

import { IconChartLine } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import Badge from '#/components/ui/Badge'
import { cardClass } from '#/components/ui/Card'
import CardTitle from '#/components/ui/CardTitle'
import DiscountChip from '#/components/ui/DiscountChip'
import { ease } from '#/lib/easing'
import { isOnSale } from '#/lib/pricing'
import type { Drink } from '#/schema/drinks'
import ShotActive from './ShotActive'
import ShotEmpty from './ShotEmpty'
import ShotTimer from './ShotTimer'

type Props = {
  shot: Drink | null
  round: number
  minutes: number
  seconds: number
}

export default function ShotCard({ shot, round, minutes, seconds }: Props) {
  const active = shot !== null
  const key = active ? `shot-${round}` : 'empty'

  return (
    <div className={`${cardClass} flex w-full flex-col overflow-hidden lg:h-full lg:min-h-0`}>
      {/* header: title + status */}
      <div className="flex shrink-0 items-center justify-between gap-3 px-tile pt-tile">
        <CardTitle>{active ? 'Shooter en crash' : 'Shooter'}</CardTitle>
        <AnimatePresence mode="wait">
          <motion.span
            key={key}
            className="inline-flex"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.3, ease }}
          >
            {active ? (
              isOnSale(shot) && (
                <DiscountChip
                  regularPrice={shot.regularPrice}
                  salePrice={shot.salePrice}
                  delay={1.8}
                />
              )
            ) : (
              <Badge tone="neutral" icon={IconChartLine}>
                Marché stable
              </Badge>
            )}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* body */}
      <div className="relative min-h-0 flex-1">
        {/* no initial={false} here: it would also freeze the looping animations inside the card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={key}
            className="h-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease }}
          >
            {active ? <ShotActive shot={shot} /> : <ShotEmpty />}
          </motion.div>
        </AnimatePresence>
      </div>

      <ShotTimer
        label={active ? 'Fin dans' : 'Prochain tirage'}
        minutes={minutes}
        seconds={seconds}
        barClassName={active ? 'bg-danger' : 'bg-ink-faint'}
      />
    </div>
  )
}
