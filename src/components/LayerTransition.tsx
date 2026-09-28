import {
  motion,
  stagger,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type AnimationSequence,
} from 'motion/react'
import { useEffect, useState } from 'react'

const layers = [
  { color: 'bg-red-600' },
  { color: 'bg-red-900' },
  { color: 'bg-zinc-950' }, // top panel, carries the content when sliding out
]
const ease = [0.76, 0, 0.24, 1] as const // panels
const easeOut = [0.16, 1, 0.3, 1] as const // text entrances
const crashEase = [0.55, 0, 0.95, 0.35] as const // slow start, then plunges

// Arrow reveal: hidden = clipped from the right, shown = no clip
const CLIP_HIDDEN = 'inset(0% 100% 0% 0%)'
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

// Timeline (seconds from the start of reveal)
const LABEL_DURATION = 0.7
const FIGURE_START = 0.25
const FIGURE_DURATION = 0.9
const COUNT_DURATION = 2.0 // number keeps counting down while the chart draws
const GRID_START = 0.4
const STATS_START = 0.8
const DRAW_START = 1.1
const DRAW_DURATION = 1.4
const DRAW_END = DRAW_START + DRAW_DURATION
const HOLD = 1.0 // time to read before sliding out
const SLIDE_START = DRAW_END + HOLD
const SLIDE_DURATION = 0.9

// Random market data, regenerated for every transition
const TICKERS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'TSLA',
  'AMZN',
  'META',
  'GOOGL',
  'JPM',
  'NFLX',
  'AMD',
]
const rand = (min: number, max: number) => min + Math.random() * (max - min)
const fmt = (v: number, digits = 2) =>
  `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(digits)}%`

function makeData() {
  return {
    figure: -rand(8, 35),
    indices: [
      { name: 'S&P 500', change: -rand(3, 12) },
      { name: 'NASDAQ', change: -rand(4, 15) },
      { name: 'DOW', change: -rand(2, 10) },
    ],
    tape: TICKERS.map((ticker) => ({ ticker, change: -rand(1, 20) })),
  }
}

const CHART_POINTS =
  '10,40 70,30 110,50 150,35 190,60 220,55 260,140 290,130 326,184'

export function LayerTransition({
  phase,
  onComplete,
}: {
  phase: 'idle' | 'cover' | 'reveal'
  onComplete: (phase: string) => void
}) {
  const [scope, animate] = useAnimate()
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState(makeData)

  // counting number
  const figureValue = useMotionValue(0)
  const figureText = useTransform(figureValue, (v) => fmt(v, 1))

  useEffect(() => {
    let cancelled = false
    let controls: ReturnType<typeof animate>

    if (phase === 'idle') {
      figureValue.set(0)
      controls = animate([
        ['.layer', { y: '100%' }, { duration: 0 }],
        ['.content', { y: '0%' }, { duration: 0, at: 0 }],
        ['.hud', { opacity: 0, y: 0 }, { duration: 0, at: 0 }],
        ['.tape-track', { x: '0%' }, { duration: 0, at: 0 }],
        [
          '.arrow',
          { opacity: 0, y: 0, clipPath: CLIP_HIDDEN },
          { duration: 0, at: 0 },
        ],
      ])
    }

    if (phase === 'cover') {
      setData(makeData()) // new random numbers while the screen is covered
      controls = animate([
        ['.layer', { y: '0%' }, { duration: 0.7, ease, delay: stagger(0.08) }],
      ])
    }

    if (phase === 'reveal') {
      const slideStart = reduceMotion ? 2.5 : SLIDE_START

      const intro: AnimationSequence = reduceMotion
        ? [
            // calm version: fades only, no scrolling
            ['.hud', { opacity: 1 }, { duration: 0.5 }],
            [figureValue, data.figure, { duration: 1, at: 0 }],
            ['.arrow', { opacity: 1, clipPath: CLIP_SHOWN }, { duration: 0.8 }],
          ]
        : [
            // header
            [
              '.label',
              { opacity: [0, 1], y: [10, 0] },
              { duration: LABEL_DURATION, ease: easeOut },
            ],
            [
              '.figure',
              { opacity: [0, 1], y: [-40, 0] },
              { duration: FIGURE_DURATION, ease: easeOut, at: FIGURE_START },
            ],
            [
              figureValue,
              data.figure,
              { duration: COUNT_DURATION, ease: easeOut, at: FIGURE_START },
            ],

            // index row, one by one
            [
              '.stat',
              { opacity: [0, 1], y: [10, 0] },
              {
                duration: 0.6,
                ease: easeOut,
                delay: stagger(0.12),
                at: STATS_START,
              },
            ],

            // grid + ticker tape (scrolls until the panels are gone)
            ['.grid', { opacity: [0, 1] }, { duration: 0.8, at: GRID_START }],
            ['.tape', { opacity: [0, 1] }, { duration: 0.6, at: 0.3 }],
            [
              '.tape-track',
              { x: ['0%', '-50%'] },
              { duration: SLIDE_START + SLIDE_DURATION, ease: 'linear', at: 0 },
            ],

            // crash: draws left to right, speeding up as it falls
            ['.arrow', { opacity: 1 }, { duration: 0, at: DRAW_START }],
            [
              '.arrow',
              { clipPath: [CLIP_HIDDEN, CLIP_SHOWN] },
              { duration: DRAW_DURATION, ease: crashEase, at: DRAW_START },
            ],
            [
              '.arrow',
              { y: [0, 10, 0] },
              { duration: 0.35, ease: 'easeOut', at: DRAW_END },
            ],
          ]

      controls = animate([
        ...intro,
        // content rides down with the top panel, the others follow
        [
          '.content',
          { y: '100%' },
          { duration: SLIDE_DURATION, ease, at: slideStart },
        ],
        [
          '.layer',
          { y: '100%' },
          {
            duration: SLIDE_DURATION,
            ease,
            delay: stagger(0.1, { from: 'last' }),
            at: slideStart,
          },
        ],
      ])
    }

    controls!.then(() => {
      if (!cancelled) onComplete(phase)
    })

    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [phase])

  return (
    <div
      ref={scope}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {layers.map(({ color }) => (
        <div
          key={color}
          className={`layer absolute inset-0 will-change-transform ${color}`}
          style={{ transform: 'translateY(100%)' }}
        />
      ))}

      {/* everything on the top panel; slides out with it */}
      <div className="content absolute inset-0 flex items-center justify-center will-change-transform">
        <div className="flex flex-col items-center gap-8 px-6">
          {/* header */}
          <div className="flex flex-col items-center gap-3">
            <div
              className="label hud flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-red-500"
              style={{ opacity: 0 }}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              Market Alert
            </div>
            <motion.div
              className="figure hud font-mono text-6xl font-semibold tabular-nums tracking-tight text-white md:text-8xl"
              style={{ opacity: 0 }}
            >
              {figureText}
            </motion.div>
          </div>

          {/* index row */}
          <div className="flex gap-8 font-mono md:gap-12">
            {data.indices.map(({ name, change }) => (
              <div
                key={name}
                className="stat hud flex flex-col items-center gap-1"
                style={{ opacity: 0 }}
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  {name}
                </span>
                <span className="text-sm tabular-nums text-red-500">
                  {fmt(change)}
                </span>
              </div>
            ))}
          </div>

          {/* chart */}
          <div className="relative w-[min(70vw,520px)]">
            <svg
              viewBox="0 0 400 220"
              className="grid hud absolute inset-0 h-full w-full"
              style={{ opacity: 0 }}
            >
              {[20, 70, 120, 170, 210].map((y) => (
                <line
                  key={y}
                  x1="0"
                  x2="400"
                  y1={y}
                  y2={y}
                  stroke="white"
                  strokeOpacity={0.08}
                  strokeDasharray="4 6"
                />
              ))}
            </svg>

            <div
              className="arrow relative"
              style={{ opacity: 0, clipPath: CLIP_HIDDEN }}
            >
              <svg viewBox="0 0 400 220" className="block h-auto w-full">
                {/* glow: wide faint line behind */}
                <polyline
                  points={CHART_POINTS}
                  fill="none"
                  stroke="#ef4444"
                  strokeOpacity={0.2}
                  strokeWidth={16}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <polyline
                  points={CHART_POINTS}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth={5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <g transform="translate(330 190) rotate(56)">
                  <polygon points="12,0 -10,-12 -10,12" fill="#ef4444" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* ticker tape */}
        <div
          className="tape hud absolute inset-x-0 bottom-0 overflow-hidden border-t border-white/10 py-3"
          style={{ opacity: 0 }}
        >
          <div className="tape-track flex w-max gap-10 whitespace-nowrap font-mono text-xs">
            {[...data.tape, ...data.tape].map(({ ticker, change }, i) => (
              <span key={i} className="flex gap-2">
                <span className="text-zinc-400">{ticker}</span>
                <span className="tabular-nums text-red-500">
                  ▼ {fmt(change)}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
