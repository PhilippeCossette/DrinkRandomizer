// Main countdown card (colors change with the time left).

import { motion, useReducedMotion } from 'motion/react'
import CardTitle from '#/components/ui/CardTitle'
import { TIMER_TOTAL_MINUTES } from '#/lib/config'
import { pad } from '#/lib/format'
import Digit from './Digit'
import StateTag from './StateTag'
import { getTimerState } from './timerState'

type Props = {
  minutes: number
  seconds: number
}

// Big countdown. The digits change color with the time left:
// green, then orange (last 40%), then red (last 20%).
export default function TimerDisplay({ minutes, seconds }: Props) {
  const reduceMotion = useReducedMotion() ?? false

  const totalSeconds = TIMER_TOTAL_MINUTES * 60
  const remainingSeconds = minutes * 60 + seconds
  const ratio = Math.max(0, remainingSeconds / totalSeconds) // 1 = just started, 0 = done
  const state = getTimerState(remainingSeconds, ratio)
  const done = remainingSeconds <= 0

  const [m1, m2] = pad(minutes)
  const [s1, s2] = pad(seconds)

  return (
    <div className="flex w-full flex-col gap-4 rounded-tile border border-line bg-surface-raised p-tile shadow-card lg:h-full lg:min-h-0">
      {/* top row: title + state */}
      <div className="flex items-center justify-between gap-4">
        <CardTitle>Prochain crash dans</CardTitle>
        <StateTag state={state} />
      </div>

      {/* digits: fill the rest of the card (width and height) */}
      <div className="@container grid min-h-0 flex-1 place-items-center lg:[container-type:size]">
        <div
          className={`flex items-center font-digital text-[28cqw] leading-none tabular-nums transition-colors duration-700 lg:text-[min(28cqw,82cqh)] ${state.text}`}
          aria-label={`${minutes} minutes ${seconds} secondes`}
        >
          <Digit value={m1} />
          <Digit value={m2} />
          <motion.span
            className="mt-[-0.1em] px-[0.04em]"
            animate={reduceMotion || done ? { opacity: 1 } : { opacity: [1, 0.25, 1] }}
            transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}
          >
            :
          </motion.span>
          <Digit value={s1} />
          <Digit value={s2} />
        </div>
      </div>
    </div>
  )
}
