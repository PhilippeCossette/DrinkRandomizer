// The case-opening reel: spins, ticks on every card, lands on the winner.

import { animate, motion, useMotionValue, useMotionValueEvent } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { easeInOut, spinEase } from '#/lib/easing'
import { playSelect, playTick } from '#/lib/sounds'
import type { Drink } from '#/schema/drinks'
import CenterMarker from './CenterMarker'
import ReelCard from './ReelCard'
import SpinHeader from './SpinHeader'
import { buildReel } from './buildReel'
import {
  ITEM_WIDTH_REM,
  RESULT_HOLD,
  SPIN_DELAY,
  SPIN_DURATION,
  WINNER_INDEX,
} from './constants'

type Props = {
  drinks: Drink[]
  winner: Drink
  start: boolean
  onDone: () => void
}

export default function SpinDrinks({ drinks, winner, start, onDone }: Props) {
  const [items] = useState(() => buildReel(drinks, winner))
  const [landed, setLanded] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)

  // card width in px, from the root font size (so the reel scales like the rest)
  const [itemWidth] = useState(
    () => ITEM_WIDTH_REM * parseFloat(getComputedStyle(document.documentElement).fontSize),
  )

  const visible = start && !leaving

  // spin sound: tick each time a new card reaches the center marker
  const centerRef = useRef(0)
  const cardAtMarker = useRef(-1)
  useMotionValueEvent(x, 'change', (v) => {
    const index = Math.floor((centerRef.current - v) / itemWidth)
    if (index !== cardAtMarker.current) {
      if (cardAtMarker.current !== -1) playTick()
      cardAtMarker.current = index
    }
  })

  useEffect(() => {
    if (!start) return

    const center = containerRef.current!.offsetWidth / 2
    centerRef.current = center
    // stop somewhere inside the winning card, not always dead center
    const jitter = (Math.random() - 0.5) * itemWidth * 0.7
    const winnerCenter = WINNER_INDEX * itemWidth + itemWidth / 2
    const target = -(winnerCenter + jitter - center)

    let cancelled = false
    let leaveTimeout: ReturnType<typeof setTimeout>

    const controls = animate(x, target, {
      duration: SPIN_DURATION,
      delay: SPIN_DELAY,
      ease: spinEase,
    })

    controls.then(() => {
      if (cancelled) return
      setLanded(true)
      playSelect()
      leaveTimeout = setTimeout(() => setLeaving(true), RESULT_HOLD * 1000)
    })

    return () => {
      cancelled = true
      controls.stop()
      clearTimeout(leaveTimeout)
    }
  }, [start])

  return (
    <div className="flex h-[44rem] flex-col items-center justify-center gap-10">
      <SpinHeader visible={visible} landed={landed} winnerName={winner.name} />

      {/* reel */}
      <motion.div
        ref={containerRef}
        initial={{ y: '200%' }}
        animate={{ y: visible ? 0 : '200%' }}
        transition={{
          duration: 0.6,
          ease: easeInOut,
          delay: visible ? 0.15 : 0,
        }}
        onAnimationComplete={() => {
          if (leaving) onDone()
        }}
        className="relative h-[31rem] w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <CenterMarker />

        <motion.div style={{ x }} className="flex h-full py-4">
          {items.map((d, i) => (
            <ReelCard
              key={i}
              width={itemWidth}
              drink={d}
              landed={landed}
              isWinner={i === WINNER_INDEX}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
