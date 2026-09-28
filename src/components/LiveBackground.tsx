import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import type { Drink } from '#/schema/drinks'

export const BG = '#14171d'
const GRID = 'rgba(255,246,233,0.05)'
const UP = '#22C55E'
const DOWN = '#EF4444'
const BLIP_OPACITY = 0.75 // max opacity of an alert
const DOWN_CHANCE = 0.8 // 80% of alerts are drops

// SVG coordinate space for the grid (scaled to cover the screen)
const W = 1000
const H = 600

// Ticker tape
const TAPE_MIN_ITEMS = 20 // enough to be wider than any screen
const TAPE_SECONDS_PER_ITEM = 2.5 // speed: lower is faster

const formatPrice = (value: number) => `$${value.toFixed(2)}`
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)]!

// A random alert on the left or right side (never the middle)
function makeBlip(drinks: Drink[]) {
  const left = Math.random() > 0.5
  return {
    up: Math.random() > DOWN_CHANCE,
    name: pick(drinks).name,
    change: rand(0.8, 9),
    x: left ? rand(4, 22) : rand(72, 88), // % of screen width
    y: rand(10, 80), // % of screen height
  }
}

function Blip({
  drinks,
  delay,
  duration,
}: {
  drinks: Drink[]
  delay: number
  duration: number
}) {
  const [blip, setBlip] = useState(() => makeBlip(drinks))
  const [cycle, setCycle] = useState(0)

  const color = blip.up ? UP : DOWN
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
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ scale: [1, 2.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.8, ease: 'easeOut', repeat: Infinity }}
        />
        <span
          className="relative h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>

      {/* label */}
      <span className="whitespace-nowrap rounded-md border border-white/10 bg-black/40 px-2 py-1 font-mono text-xs">
        <span className="uppercase text-zinc-300">{blip.name}</span>{' '}
        <span className="font-semibold" style={{ color }}>
          {blip.up ? '▲' : '▼'} {blip.change.toFixed(1)}%
        </span>
      </span>
    </motion.div>
  )
}

const BLIPS = [
  { delay: 1, duration: 9 },
  { delay: 4, duration: 11 },
  { delay: 7, duration: 10 },
]

function Ticker({
  drinks,
  current,
  price,
  still,
}: {
  drinks: Drink[]
  current: Drink
  price: number
  still: boolean
}) {
  const repeat = Math.max(1, Math.ceil(TAPE_MIN_ITEMS / drinks.length))
  const group = Array.from({ length: repeat }, () => drinks).flat()

  const renderGroup = (copy: number) => (
    <div className="flex shrink-0" aria-hidden={copy === 1}>
      {group.map((d, i) => {
        const crashed = d.name === current.name
        return (
          <span key={`${copy}-${i}`} className="flex items-center gap-2 pr-10">
            <span className="uppercase text-zinc-300">{d.name}</span>
            {crashed ? (
              <span className="font-semibold text-[#EF4444]">
                ▼ {formatPrice(price)}
              </span>
            ) : (
              <span className="text-zinc-500">{formatPrice(d.regularPrice)}</span>
            )}
          </span>
        )
      })}
    </div>
  )

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-10 overflow-hidden border-t border-white/10 py-2.5"
      style={{ backgroundColor: '#06080D' }}
    >
      <motion.div
        className="flex w-max whitespace-nowrap font-mono text-sm"
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

type Props = {
  drinks: Drink[]
  current: Drink
  price: number
}

export function LiveBackground({ drinks, current, price }: Props) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
        style={{ backgroundColor: BG }}
      >
        {/* faint chart grid */}
        <svg
          viewBox={`0 0 ${W} ${H}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
        >
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              x2={W}
              y1={i * 60}
              y2={i * 60}
              stroke={GRID}
              strokeWidth={1}
            />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * 100}
              x2={i * 100}
              y1={0}
              y2={H}
              stroke={GRID}
              strokeWidth={1}
              strokeDasharray="2 6"
            />
          ))}
        </svg>

        {/* occasional market alerts */}
        {!reduceMotion &&
          BLIPS.map((b, i) => <Blip key={i} drinks={drinks} {...b} />)}

        {/* vignette: darker edges keep focus in the middle */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          }}
        />
      </div>

      <Ticker
        drinks={drinks}
        current={current}
        price={price}
        still={reduceMotion}
      />
    </>
  )
}
