// Trading-style chart behind the drink: the line drops from the regular
// price to the sale price, with price labels and a dot riding the line.

import { IconArrowDownRight } from '@tabler/icons-react'
import {
  animate,
  motion,
  useMotionValue,
  useTransform,
} from 'motion/react'
import { useEffect, useId, useMemo, useRef, useState  } from 'react'
import type {ReactNode} from 'react';
import { drawEase, ease } from '#/lib/easing'
import { formatPrice } from '#/lib/format'
import PricePill from './PricePill'
import {
  AREA,
  CHART_DELAY,
  CHART_DURATION,
  GRID_DELAY,
  LINE,
  START,
  TIP,
  VIEW_H,
  VIEW_W,
} from './constants'

type Props = {
  from: number
  to: number
  still: boolean
  children?: ReactNode // drawn between the chart lines and the labels (the drink)
}

// viewBox units -> % of the chart, for the HTML labels on top
const pctX = (x: number) => (x / VIEW_W) * 100
const pctY = (y: number) => (y / VIEW_H) * 100

// Round prices between the top and bottom of the chart, with their height.
// The regular price sits at START and the crash price at TIP; the rest is linear.
function priceTicks(from: number, to: number) {
  const yAt = (price: number) =>
    START[1] + ((price - from) * (TIP[1] - START[1])) / (to - from || 1)
  const top = from + ((20 - START[1]) * (to - from)) / (TIP[1] - START[1])
  const bottom = from + ((VIEW_H - 20 - START[1]) * (to - from)) / (TIP[1] - START[1])

  // pick the step that gives 3 to 6 lines
  const step =
    [0.25, 0.5, 1, 2, 5].find((s) => (top - bottom) / s <= 6) ?? 5

  const ticks: { price: number; y: number }[] = []
  for (let p = Math.ceil(Math.max(0, bottom) / step) * step; p <= top; p += step) {
    ticks.push({ price: p, y: yAt(p) })
  }
  // skip lines that sit on the regular or crash price (their pills already say it)
  return ticks.filter(
    ({ y }) => Math.abs(y - START[1]) > 14 && Math.abs(y - TIP[1]) > 14,
  )
}

// The lines are SVG stretched to the stage (so they fill any shape).
// Every text, pill and the dot are HTML on top, so they keep the app's sizes.
export default function CrashChart({ from, to, still, children }: Props) {
  const id = useId().replace(/:/g, '')
  const measureRef = useRef<SVGPathElement>(null)
  const [done, setDone] = useState(false)

  // one progress value drives the reveal and the cursor dot
  const progress = useMotionValue(0)
  const dotX = useMotionValue(START[0])
  const dotY = useMotionValue(START[1])
  const revealWidth = useTransform(dotX, (x) => Math.max(0, x))
  const dotLeft = useTransform(dotX, (x) => `${pctX(x)}%`)
  const dotTop = useTransform(dotY, (y) => `${pctY(y)}%`)

  // price axis: round prices ($0.50, $1...) placed at their height on the chart
  const ticks = useMemo(() => priceTicks(from, to), [from, to])

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
    <>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={`${id}-area`} x1={0} x2={0} y1={0} y2={1}>
            <stop offset="0%" className="[stop-color:var(--danger)] [stop-opacity:0.18]" />
            <stop offset="100%" className="[stop-color:var(--danger)] [stop-opacity:0]" />
          </linearGradient>
          <clipPath id={`${id}-reveal`}>
            <motion.rect x={0} y={0} height={VIEW_H} width={revealWidth} />
          </clipPath>
        </defs>

        {/* invisible copy of the line, used to find the dot's position */}
        <path ref={measureRef} d={LINE} fill="none" stroke="none" />

        {/* grid */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: GRID_DELAY, duration: 0.8, ease }}
        >
          {ticks.map(({ price, y }) => (
            <line
              key={price}
              x1={0}
              x2={VIEW_W}
              y1={y}
              y2={y}
              className="stroke-line"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.g>

        {/* regular price level */}
        <motion.line
          x1={0}
          x2={VIEW_W}
          y1={START[1]}
          y2={START[1]}
          className="stroke-ink-faint/60"
          strokeWidth={1}
          strokeDasharray="4 6"
          vectorEffect="non-scaling-stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: CHART_DELAY - 0.2, duration: 0.5, ease }}
        />

        {/* area + line, revealed up to the cursor */}
        <g clipPath={`url(#${id}-reveal)`}>
          <path d={AREA} fill={`url(#${id}-area)`} />
          <path
            d={LINE}
            fill="none"
            className="stroke-danger"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {/* crash price level, once the line lands */}
        {done && (
          <motion.line
            x1={TIP[0]}
            x2={VIEW_W}
            y1={TIP[1]}
            y2={TIP[1]}
            className="stroke-danger/60"
            strokeWidth={1}
            strokeDasharray="4 6"
            vectorEffect="non-scaling-stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, ease }}
          />
        )}
      </svg>

      {/* price axis on the left */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: GRID_DELAY + 0.2, duration: 0.8, ease }}
      >
        {ticks.map(({ price, y }) => (
          <span
            key={price}
            className="absolute left-[min(1rem,3vw)] -translate-y-[calc(100%+0.3em)] text-label tabular-nums text-ink-faint"
            style={{ top: `${pctY(y)}%` }}
          >
            {formatPrice(price)}
          </span>
        ))}
      </motion.div>

      {/* the drink */}
      {children}

      {/* cursor dot rides the line */}
      <motion.span
        className="pointer-events-none absolute h-[0.8rem] w-[0.8rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-danger ring-[0.25rem] ring-sunken"
        style={{ left: dotLeft, top: dotTop }}
      >
        {done && !still && (
          <motion.span
            className="absolute inset-0 rounded-full bg-danger"
            animate={{ scale: [1, 3.2], opacity: [0.5, 0] }}
            transition={{ duration: 2, ease: 'easeOut', repeat: Infinity }}
          />
        )}
      </motion.span>

      {/* price labels on the right edge */}
      <motion.div
        className="pointer-events-none absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: CHART_DELAY - 0.2, duration: 0.5, ease }}
      >
        <PricePill y={pctY(START[1])} tone="neutral">
          {formatPrice(from)}
        </PricePill>
      </motion.div>

      {done && (
        <motion.div
          className="pointer-events-none absolute inset-0"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease }}
        >
          <PricePill y={pctY(TIP[1])} tone="crash" icon={IconArrowDownRight}>
            {formatPrice(to)}
          </PricePill>
        </motion.div>
      )}
    </>
  )
}
