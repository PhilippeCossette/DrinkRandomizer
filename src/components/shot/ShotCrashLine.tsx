// Mini crash chart behind the shooter image. When a shooter is picked,
// a red line wobbles along then crashes down (drawn once, smoothly), and
// the dot at the bottom keeps a soft Tailwind `animate-ping`.
// Same idea as the big chart on the drink card, so the two cards match.

import { useId } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { smoothPath } from '#/lib/smoothPath'
import type { Point } from '#/lib/smoothPath'
import { drawEase } from '#/lib/easing'

// Drawn in a 100x100 box, stretched to fill the image box (the line keeps its
// thickness, and the dot stays round because it's HTML, not SVG).
// Calm market on the left, then the crash on the right.
const POINTS: Point[] = [
  [-2, 34],
  [12, 29],
  [24, 36],
  [36, 27],
  [48, 33],
  [60, 30],
  [70, 46],
  [80, 60],
  [90, 76],
]
const TIP = POINTS[POINTS.length - 1] // where the crash ends (the dot)
const LINE = smoothPath(POINTS)
const AREA = `${LINE} L${TIP[0]} 100 L${POINTS[0][0]} 100 Z` // filled zone under the line
const GRID = [25, 50, 75] // faint horizontal guide lines

const DELAY = 0.4 // wait for the card to appear first
const DRAW = 1.8 // seconds to draw the line

type Props = {
  pulse?: boolean // ping on the dot (off when many charts are on screen at once)
  animated?: boolean // draw the line in; false = already drawn (cheaper, for grids)
}

export default function ShotCrashLine({
  pulse = true,
  animated = true,
}: Props) {
  const id = useId().replace(/:/g, '')
  const reduceMotion = useReducedMotion() ?? false
  const still = reduceMotion || !animated
  const draw = {
    delay: still ? 0 : DELAY,
    duration: still ? 0 : DRAW,
    ease: drawEase,
  }

  return (
    <div
      className="pointer-events-none absolute inset-0 text-danger"
      aria-hidden
    >
      {/* stretched to the box: square in the shooter card, wider in other cards */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          {/* red fade under the line, strongest near the line */}
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity={0.22} />
            <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
          </linearGradient>
          {/* line and fill are revealed together, from left to right */}
          <clipPath id={`${id}-reveal`}>
            <motion.rect
              x={-4}
              y={-4}
              height={108}
              initial={{ width: still ? 108 : 0 }}
              animate={{ width: 108 }}
              transition={draw}
            />
          </clipPath>
        </defs>

        {/* faint grid */}
        {GRID.map((y) => (
          <line
            key={y}
            x1={0}
            x2={100}
            y1={y}
            y2={y}
            stroke="currentColor"
            strokeOpacity={0.12}
            strokeDasharray="2 3"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path
          d={AREA}
          fill={`url(#${id}-fill)`}
          clipPath={`url(#${id}-reveal)`}
        />

        {/* the line is revealed by the same clip as the fill (no dash tricks:
            those leave gaps when the chart is stretched to a wide card) */}
        <path
          d={LINE}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.7}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          clipPath={`url(#${id}-reveal)`}
        />
      </svg>

      {/* the dot where the crash ends: fades in when the line arrives, then pings */}
      <motion.span
        className="absolute aspect-square w-[clamp(0.45rem,6%,0.9rem)] -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${TIP[0]}%`, top: `${TIP[1]}%` }}
        initial={still ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: draw.delay + draw.duration - 0.1,
          duration: 0.4,
          ease: 'easeOut',
        }}
      >
        {pulse && (
          <span className="absolute inset-0 animate-ping rounded-full bg-danger/60 [animation-duration:1.6s] motion-reduce:animate-none" />
        )}
        <span className="absolute inset-0 rounded-full bg-danger" />
      </motion.span>
    </div>
  )
}
