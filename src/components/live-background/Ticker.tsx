// Ticker at the bottom: scrolls every drink and its price, the crashed one in red.

import { IconArrowDownRight } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { formatPrice } from '#/lib/format'
import { getDiscountPercent } from '#/lib/pricing'
import type { Drink } from '#/schema/drinks'
import { TAPE_MIN_ITEMS, TAPE_SECONDS_PER_ITEM } from './constants'

type Props = {
  drinks: Drink[]
  current: Drink
  still: boolean
  allCrashed?: boolean // La Grande Dépression: every item shows its sale price
}

// Stock-exchange tape scrolling all drinks and their prices
export default function Ticker({
  drinks,
  current,
  still,
  allCrashed = false,
}: Props) {
  const repeat = Math.max(1, Math.ceil(TAPE_MIN_ITEMS / drinks.length))
  const group = Array.from({ length: repeat }, () => drinks).flat()

  const renderGroup = (copy: number) => (
    <div className="flex shrink-0 items-center" aria-hidden={copy === 1}>
      {group.map((d, i) => {
        const crashed = allCrashed || d.name === current.name
        return (
          <span
            key={`${copy}-${i}`}
            className="flex items-center gap-[0.6em] pr-[2.5em]"
          >
            <span className="font-medium text-ink-soft">{d.name}</span>
            {crashed ? (
              <span className="flex items-center gap-[0.3em] rounded-[0.5em] bg-danger-soft px-[0.5em] py-[0.2em] font-medium text-danger">
                <IconArrowDownRight size="1em" stroke={2.5} />
                {formatPrice(d.salePrice)}
                <span className="opacity-80">
                  -{getDiscountPercent(d.regularPrice, d.salePrice)}%
                </span>
              </span>
            ) : (
              <span className="text-ink">{formatPrice(d.regularPrice)}</span>
            )}
          </span>
        )
      })}
    </div>
  )

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 flex h-tape items-center overflow-hidden border-t border-line bg-surface">
      <motion.div
        // new key when the list changes (La Grande Dépression adds the shots),
        // so the scroll restarts at the right speed instead of jumping
        key={group.length}
        className="flex w-max whitespace-nowrap text-body tabular-nums"
        animate={still ? undefined : { x: ['0%', '-50%'] }}
        transition={{
          duration: group.length * TAPE_SECONDS_PER_ITEM,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {renderGroup(0)}
        {renderGroup(1)}
      </motion.div>
    </div>
  )
}
