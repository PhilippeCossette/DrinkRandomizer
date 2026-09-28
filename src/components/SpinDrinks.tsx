import { animate, AnimatePresence, motion, useMotionValue } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import type { Drink } from '#/schema/drinks'

const ITEM_WIDTH = 350 // px, each card including its padding
const REEL_LENGTH = 50 // total cards in the strip
const WINNER_INDEX = 42 // where the winner sits; leaves cards visible after it
const SPIN_DURATION = 6 // seconds
const SPIN_DELAY = 0.8 // wait for the header + reel to land
const RESULT_HOLD = 2.5 // seconds to show the result before leaving

// Palette (same as the drink card)
const PANEL = '#121419'
const STAGE = '#0B0D11'
const RED = '#EF4444'

const ease = [0.22, 1, 0.36, 1] as const
const easeInOut = [0.76, 0, 0.24, 1] as const

const formatPrice = (value: number) => `$${value.toFixed(2)}`

// faint chart grid behind each drink
const stageGrid = {
  backgroundColor: STAGE,
  backgroundImage:
    'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
  backgroundSize: '32px 32px',
}

function buildReel(drinks: Drink[], winner: Drink) {
  return Array.from({ length: REEL_LENGTH }, (_, i) =>
    i === WINNER_INDEX
      ? winner
      : drinks[Math.floor(Math.random() * drinks.length)]!,
  )
}

function ReelCard({
  drink,
  landed,
  isWinner,
}: {
  drink: Drink
  landed: boolean
  isWinner: boolean
}) {
  const highlighted = landed && isWinner

  return (
    <div style={{ width: ITEM_WIDTH }} className="h-full shrink-0 px-2">
      <motion.div
        animate={
          landed
            ? isWinner
              ? { scale: 1.04, opacity: 1 }
              : { scale: 0.96, opacity: 0.3 }
            : { scale: 1, opacity: 1 }
        }
        transition={{ duration: 0.6, ease }}
        className={`relative flex h-full flex-col overflow-hidden rounded-[1.25rem] border-2 transition-colors duration-500 ${
          highlighted ? 'border-main-yellow' : 'border-white/10'
        }`}
        style={{ backgroundColor: PANEL }}
      >
        {/* section 1: image on the chart grid */}
        <div
          className="relative min-h-0 flex-1 overflow-hidden border-b border-white/10"
          style={stageGrid}
        >
          {/* pinned to the stage, so the image can fill it without overflowing */}
          <div className="absolute inset-0 p-[8%]">
            <img
              src={drink.imgSrc}
              alt={drink.name}
              className="h-full w-full object-contain"
              style={{ filter: 'drop-shadow(0 12px 18px rgba(0,0,0,0.6))' }}
            />
          </div>

          {highlighted && (
            <motion.span
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease }}
              className="absolute left-3 top-3 rounded-full px-2.5 py-0.5 font-condensed text-base font-semibold text-white"
              style={{ backgroundColor: RED }}
            >
              ▼ Crash
            </motion.span>
          )}
        </div>

        {/* section 2: name + regular price */}
        <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
          <span className="truncate text-xl font-semibold tracking-tight text-white">
            {drink.name}
          </span>
          <span className="shrink-0 font-condensed text-2xl font-semibold tabular-nums text-zinc-300">
            {formatPrice(drink.regularPrice)}
          </span>
        </div>
      </motion.div>
    </div>
  )
}

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

  const visible = start && !leaving

  useEffect(() => {
    if (!start) return

    const center = containerRef.current!.offsetWidth / 2
    // stop somewhere inside the winning card, not always dead center
    const jitter = (Math.random() - 0.5) * ITEM_WIDTH * 0.7
    const winnerCenter = WINNER_INDEX * ITEM_WIDTH + ITEM_WIDTH / 2
    const target = -(winnerCenter + jitter - center)

    let cancelled = false
    let leaveTimeout: ReturnType<typeof setTimeout>

    const controls = animate(x, target, {
      duration: SPIN_DURATION,
      delay: SPIN_DELAY,
      ease: [0.12, 0.8, 0.2, 1], // fast start, very long slow-down
    })

    controls.then(() => {
      if (cancelled) return
      setLanded(true)
      leaveTimeout = setTimeout(() => setLeaving(true), RESULT_HOLD * 1000)
    })

    return () => {
      cancelled = true
      controls.stop()
      clearTimeout(leaveTimeout)
    }
  }, [start])

  return (
    <div className="flex h-150 flex-col items-center justify-center gap-12">
      {/* header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
        transition={{ duration: 0.6, ease }}
        className="flex flex-col items-center gap-4 text-center"
      >
        <span
          className="rounded-full px-3 py-1 font-condensed text-lg font-semibold text-white"
          style={{ backgroundColor: RED }}
        >
          ▼ Alerte marché
        </span>
        <h2 className="text-5xl font-semibold tracking-tight text-white md:text-7xl">
          Crash boursier
        </h2>

        {/* subtitle swaps when the reel lands */}
        <div className="h-9">
          <AnimatePresence mode="wait">
            <motion.p
              key={landed ? 'result' : 'waiting'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease }}
              className="text-xl text-zinc-400 md:text-2xl"
            >
              {landed ? (
                <>
                  <span className="font-semibold text-main-yellow">
                    {winner.name}
                  </span>{' '}
                  s'effondre <span style={{ color: RED }}>▼</span>
                </>
              ) : (
                'Une boisson est en chute libre… laquelle?'
              )}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>

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
        className="relative h-100 w-full overflow-hidden"
        style={{
          maskImage:
            'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
        }}
      >
        {/* center marker */}
        <div className="pointer-events-none absolute inset-y-0 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center">
          <div className="h-3 w-4 bg-main-yellow [clip-path:polygon(0_0,100%_0,50%_100%)]" />
          <div className="w-0.75 flex-1 bg-main-yellow" />
          <div className="h-3 w-4 bg-main-yellow [clip-path:polygon(50%_0,100%_100%,0_100%)]" />
        </div>

        <motion.div style={{ x }} className="flex h-full py-4">
          {items.map((d, i) => (
            <ReelCard
              key={i}
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
