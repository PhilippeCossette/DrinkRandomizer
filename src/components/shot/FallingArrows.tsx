// Subtle red "price going down" arrows falling behind the shooter image.
// Each arrow drops straight down and fades out, then starts again, offset in
// time so the background always has a little movement.

import { motion, useReducedMotion } from 'motion/react'

// Solid down arrow: a wide triangle head on a thick shaft, with softly rounded
// corners (the round stroke does the rounding). Drawn on a 512x512 grid;
// the viewBox crops the empty sides so it is 7:8.
function DownArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="32 0 448 512" className={className}>
      <polygon
        points="160,8 352,8 352,288 472,288 256,504 40,288 160,288"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth={16}
        strokeLinejoin="round"
      />
    </svg>
  )
}

// left/top: start position (% of the box), size: height (% of the box), delay: seconds
const ARROWS = [
  { left: 8, top: 4, size: 26, delay: 0 },
  { left: 70, top: 0, size: 20, delay: 1.1 },
  { left: 16, top: 50, size: 16, delay: 2.2 },
  { left: 74, top: 44, size: 24, delay: 0.6 },
  { left: 44, top: 20, size: 14, delay: 1.7 },
]

const DURATION = 3.2 // seconds for one arrow to fall and fade

export default function FallingArrows() {
  const reduceMotion = useReducedMotion() ?? false
  if (reduceMotion) return null // decoration only: skip it when motion is reduced

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {ARROWS.map((arrow, i) => (
        <motion.span
          key={i}
          className="absolute text-danger"
          style={{
            left: `${arrow.left}%`,
            top: `${arrow.top}%`,
            height: `${arrow.size}%`,
            aspectRatio: '7 / 8', // same proportions as the arrow
          }}
          initial={{ opacity: 0, y: '0%' }}
          animate={{ opacity: [0, 0.35, 0], y: ['0%', '90%'] }}
          transition={{
            duration: DURATION,
            delay: arrow.delay,
            ease: 'easeIn',
            repeat: Infinity,
            repeatDelay: 0.4,
            opacity: {
              duration: DURATION,
              delay: arrow.delay,
              times: [0, 0.3, 1],
              repeat: Infinity,
              repeatDelay: 0.4,
            },
          }}
        >
          <DownArrow className="h-full w-full" />
        </motion.span>
      ))}
    </div>
  )
}
