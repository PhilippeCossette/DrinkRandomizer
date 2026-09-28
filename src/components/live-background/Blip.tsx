// One small floating "Mojito ↘ 3.2%" market alert in the page background.

import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useState } from 'react'
import type { Drink } from '#/schema/drinks'
import { BLIP_OPACITY } from './constants'
import { makeBlip } from './makeBlip'

type Props = {
  drinks: Drink[]
  delay: number
  duration: number
}

// Small "Mojito ↘ 3.2%" alert that fades in, holds, then moves somewhere else
export default function Blip({ drinks, delay, duration }: Props) {
  const [blip, setBlip] = useState(() => makeBlip(drinks))
  const [cycle, setCycle] = useState(0)

  const dot = blip.up ? 'bg-success' : 'bg-danger'
  const text = blip.up ? 'text-success' : 'text-danger'
  const start = cycle === 0 ? delay : 0 // stagger only the first run

  return (
    <motion.div
      key={cycle}
      className="absolute flex items-center gap-2.5"
      style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
      initial={{ opacity: 0, y: 8 }}
      // fade in, hold, fade out, then stay hidden for a while
      animate={{
        opacity: [0, BLIP_OPACITY, BLIP_OPACITY, 0, 0],
        y: [8, 0, -4, -8, -8],
      }}
      transition={{
        duration,
        times: [0, 0.08, 0.5, 0.6, 1],
        ease: 'easeInOut',
        delay: start,
      }}
      onAnimationComplete={() => {
        setBlip(makeBlip(drinks))
        setCycle((c) => c + 1)
      }}
    >
      {/* dot with a soft ping */}
      <span className="relative flex h-2 w-2">
        <motion.span
          className={`absolute inset-0 rounded-full ${dot}`}
          animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity }}
        />
        <span className={`relative h-2 w-2 rounded-full ${dot}`} />
      </span>

      {/* label */}
      <span className="flex items-center gap-2 whitespace-nowrap rounded-[0.6em] border border-line bg-surface px-[0.6em] py-[0.35em] text-label shadow-card">
        <span className="font-medium text-ink-soft">{blip.name}</span>
        <span className={`flex items-center gap-0.5 font-semibold ${text}`}>
          {blip.up ? (
            <IconArrowUpRight size="1.1em" stroke={2.5} />
          ) : (
            <IconArrowDownRight size="1.1em" stroke={2.5} />
          )}
          {blip.change.toFixed(1)}%
        </span>
      </span>
    </motion.div>
  )
}
