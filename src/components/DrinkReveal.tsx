import type { Drink } from '#/schema/drinks'
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type Variants,
} from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'

const formatPrice = (value: number) => `$${value.toFixed(2)}`

// Timing (seconds after the card appears)
const GRID_DELAY = 0.1
const CHART_DELAY = 0.5
const CHART_DURATION = 1.6
const PRICE_DELAY = 0.9
const COUNT_DURATION = 1.4
const STRIKE_DELAY = 1.0
const CHIP_DELAY = PRICE_DELAY + COUNT_DURATION - 0.2

// Palette
const PANEL = '#121419'
const STAGE = '#0B0D11'
const RED = '#EF4444'

const ease = [0.22, 1, 0.36, 1] as const
const drawEase = [0.65, 0, 0.35, 1] as const // smooth in-out for the line

// Chart in a 400x300 box (same 4:3 ratio as the image area)
const VIEW_W = 400
const VIEW_H = 300
const GRID = [60, 120, 180, 240]
const POINTS: [number, number][] = [
  [0, 78],
  [44, 70],
  [84, 92],
  [124, 82],
  [164, 128],
  [202, 116],
  [240, 176],
  [276, 166],
  [314, 226],
]
const START = POINTS[0]!
const TIP = POINTS[POINTS.length - 1]!

// Label pills on the right edge
const PILL_W = 54
const PILL_H = 20
const PILL_X = VIEW_W - PILL_W - 6

// Smooth curve through the points (Catmull-Rom → Bézier)
function smoothPath(pts: [number, number][]) {
  let d = `M${pts[0]![0]} ${pts[0]![1]}`
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]!
    const p1 = pts[i]!
    const p2 = pts[i + 1]!
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) / 6
    const c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6
    const c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0]} ${p2[1]}`
  }
  return d
}

const LINE = smoothPath(POINTS)
const AREA = `${LINE} L${TIP[0]} ${VIEW_H} L${START[0]} ${VIEW_H} Z`

const container: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease,
      when: 'beforeChildren',
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: 'easeIn' },
  },
}

const item: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
}

const image: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease },
  },
}

function AnimatedPrice({ from, to }: { from: number; to: number }) {
  const value = useMotionValue(from)
  const display = useTransform(value, formatPrice)

  useEffect(() => {
    const controls = animate(value, to, {
      duration: COUNT_DURATION,
      ease: [0.16, 1, 0.3, 1],
      delay: PRICE_DELAY,
    })
    return () => controls.stop()
  }, [to, value])

  return <motion.span>{display}</motion.span>
}

function PricePill({
  y,
  label,
  color,
  textColor,
}: {
  y: number
  label: string
  color: string
  textColor: string
}) {
  return (
    <g>
      <rect
        x={PILL_X}
        y={y - PILL_H / 2}
        width={PILL_W}
        height={PILL_H}
        rx={4}
        fill={color}
      />
      <text
        x={PILL_X + PILL_W / 2}
        y={y + 4.5}
        textAnchor="middle"
        fontFamily="ui-monospace, monospace"
        fontSize={12}
        fontWeight={700}
        fill={textColor}
      >
        {label}
      </text>
    </g>
  )
}

function CrashChart({
  from,
  to,
  still,
}: {
  from: number
  to: number
  still: boolean
}) {
  const id = useId().replace(/:/g, '')
  const measureRef = useRef<SVGPathElement>(null)
  const [done, setDone] = useState(false)

  // one progress value drives the line, the cursor dot and the area reveal
  const progress = useMotionValue(0)
  const dotX = useMotionValue(START[0])
  const dotY = useMotionValue(START[1])
  const revealWidth = useTransform(dotX, (x) => Math.max(0, x))

  useEffect(() => {
    const path = measureRef.current!
    const length = path.getTotalLength()

    const unsubscribe = progress.on('change', (p) => {
      const point = path.getPointAtLength(p * length)
      dotX.set(point.x)
      dotY.set(point.y)
    })

    const controls = animate(progress, 1, {
      delay: still ? 0 : CHART_DELAY,
      duration: still ? 0 : CHART_DURATION,
      ease: drawEase,
      onComplete: () => setDone(true),
    })

    return () => {
      unsubscribe()
      controls.stop()
    }
  }, [])

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
    >
      <defs>
        <linearGradient id={`${id}-area`} x1={0} x2={0} y1={0} y2={1}>
          <stop offset="0%" stopColor={RED} stopOpacity={0.22} />
          <stop offset="100%" stopColor={RED} stopOpacity={0} />
        </linearGradient>
        <clipPath id={`${id}-reveal`}>
          <motion.rect x={0} y={0} height={VIEW_H} width={revealWidth} />
        </clipPath>
      </defs>

      {/* invisible copy of the line, used to find the dot's position */}
      <path ref={measureRef} d={LINE} fill="none" stroke="none" />

      {/* grid draws in from the left */}
      {GRID.map((y, i) => (
        <motion.line
          key={y}
          x1={0}
          x2={VIEW_W}
          y1={y}
          y2={y}
          stroke="white"
          strokeOpacity={0.06}
          strokeWidth={1}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: GRID_DELAY + i * 0.08, duration: 0.6, ease }}
        />
      ))}

      {/* regular price level */}
      <motion.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: CHART_DELAY - 0.2, duration: 0.5, ease }}
      >
        <line
          x1={0}
          x2={PILL_X - 4}
          y1={START[1]}
          y2={START[1]}
          stroke="white"
          strokeOpacity={0.18}
          strokeWidth={1}
          strokeDasharray="3 5"
        />
        <PricePill
          y={START[1]}
          label={formatPrice(from)}
          color="rgba(255,255,255,0.12)"
          textColor="rgba(255,255,255,0.7)"
        />
      </motion.g>

      {/* area + line, revealed up to the cursor */}
      <path
        d={AREA}
        fill={`url(#${id}-area)`}
        clipPath={`url(#${id}-reveal)`}
      />
      <motion.path
        d={LINE}
        fill="none"
        stroke={RED}
        strokeWidth={3.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ pathLength: progress }}
      />

      {/* crash price level, once the line lands */}
      {done && (
        <g>
          <motion.line
            x1={TIP[0]}
            x2={PILL_X - 4}
            y1={TIP[1]}
            y2={TIP[1]}
            stroke={RED}
            strokeOpacity={0.6}
            strokeWidth={1}
            strokeDasharray="3 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, ease }}
          />
          <motion.g
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease }}
          >
            <PricePill
              y={TIP[1]}
              label={formatPrice(to)}
              color={RED}
              textColor="#fff"
            />
          </motion.g>
        </g>
      )}

      {/* soft ping at the tip */}
      {done && !still && (
        <motion.circle
          cx={TIP[0]}
          cy={TIP[1]}
          fill={RED}
          initial={{ r: 5, opacity: 0.35 }}
          animate={{ r: [5, 16], opacity: [0.35, 0] }}
          transition={{ duration: 2, ease: 'easeOut', repeat: Infinity }}
        />
      )}

      {/* cursor dot rides the line */}
      <motion.circle
        cx={dotX}
        cy={dotY}
        r={5}
        fill={RED}
        stroke={STAGE}
        strokeWidth={2.5}
      />
    </svg>
  )
}

// Section 1: chart + drink image
function DrinkStage({
  drink,
  price,
  still,
}: {
  drink: Drink
  price: number
  still: boolean
}) {
  return (
    <div
      className="relative aspect-4/3 overflow-hidden border-b border-white/10"
      style={{ backgroundColor: STAGE }}
    >
      <CrashChart from={drink.regularPrice} to={price} still={still} />

      {/* pinned to the chart area, so the image can fill it */}
      <motion.div variants={image} className="absolute inset-0 p-[6%]">
        <motion.img
          src={drink.imgSrc}
          alt={drink.name}
          className="h-full w-full object-contain"
          style={{ filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.6))' }}
          animate={still ? undefined : { y: [0, -6, 0] }}
          transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}

// Section 2: name + prices
function DrinkInfo({ drink, price }: { drink: Drink; price: number }) {
  const discounted = price < drink.regularPrice
  const discount = Math.round((1 - price / drink.regularPrice) * 100)

  return (
    <div className="p-[6cqw]">
      <motion.h2
        variants={item}
        className="text-[8cqw] font-semibold leading-tight tracking-tight text-white"
      >
        {drink.name}
      </motion.h2>

      <motion.div
        variants={item}
        className="mt-[3cqw] flex items-end justify-between gap-4"
      >
        {/* new price */}
        <span className="font-condensed text-[15cqw] font-bold leading-[0.85] tabular-nums text-main-yellow">
          <AnimatedPrice from={drink.regularPrice} to={price} />
        </span>

        {/* old price + discount */}
        {discounted && (
          <div className="mb-[1cqw] flex flex-col items-end gap-[1.5cqw]">
            <span className="relative font-condensed text-[8cqw] font-semibold leading-none tabular-nums text-zinc-300">
              {formatPrice(drink.regularPrice)}
              <motion.span
                className="absolute inset-x-[-0.1em] top-[calc(50%-0.04em)] h-[0.08em] origin-left rounded-full"
                style={{ backgroundColor: RED }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: STRIKE_DELAY, duration: 0.5, ease }}
              />
            </span>
            <motion.span
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: CHIP_DELAY, duration: 0.5, ease }}
              className="rounded-full px-[2.5cqw] py-[0.8cqw] font-condensed text-[4.5cqw] font-semibold tabular-nums text-white"
              style={{ backgroundColor: RED }}
            >
              ▼ {discount}%
            </motion.span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

type Props = {
  drink: Drink
  price: number
  round: number
}

export default function DrinkReveal({ drink, price, round }: Props) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={round}
        variants={container}
        initial="hidden"
        animate="show"
        exit="exit"
        // same width rules as the timer
        className="@container w-[calc(100vw-3rem)] max-w-[36rem] overflow-hidden rounded-[1.75rem] border border-white/10
                   lg:w-[min(36rem,42vw)]"
        style={{ backgroundColor: PANEL }}
      >
        <DrinkStage drink={drink} price={price} still={reduceMotion} />
        <DrinkInfo drink={drink} price={price} />
      </motion.div>
    </AnimatePresence>
  )
}
