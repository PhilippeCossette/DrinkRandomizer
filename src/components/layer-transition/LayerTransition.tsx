// Full-screen crash alert: colored panels slide up, the alert plays,
// then everything slides away. The page drives it with `phase`.

import {
  stagger,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useTransform
  
} from 'motion/react'
import type {AnimationSequence} from 'motion/react';
import { useEffect, useState } from 'react'
import { crashEase, easeInOut, easeOut } from '#/lib/easing'
import { formatPercent } from '#/lib/format'
import TransitionContent from './TransitionContent'
import {
  CLIP_HIDDEN,
  CLIP_SHOWN,
  COUNT_DURATION,
  DRAW_DURATION,
  DRAW_END,
  DRAW_START,
  FIGURE_DURATION,
  FIGURE_START,
  GRID_START,
  LABEL_DURATION,
  LAYERS,
  SLIDE_DURATION,
  SLIDE_START,
  STATS_START,
  TAPE_TRAVEL
  
} from './constants'
import type {TransitionPhase} from './constants';
import { makeTransitionData } from './makeTransitionData'

type Props = {
  phase: TransitionPhase
  title: string // e.g. "Un verre est en chute"
  onComplete: (phase: string) => void
}

export default function LayerTransition({ phase, title, onComplete }: Props) {
  const [scope, animate] = useAnimate()
  const reduceMotion = useReducedMotion()
  const [data, setData] = useState(makeTransitionData)

  // counting number
  const figureValue = useMotionValue(0)
  const figureText = useTransform(figureValue, (v) => formatPercent(v, 1))

  useEffect(() => {
    let cancelled = false
    let controls: ReturnType<typeof animate> | undefined

    // instant reset of the content, so every transition starts clean
    const reset: AnimationSequence = [
      ['.content', { y: '0%' }, { duration: 0 }],
      ['.hud', { opacity: 0, y: 0 }, { duration: 0, at: 0 }],
      ['.tape-track', { x: '0rem' }, { duration: 0, at: 0 }],
      [
        '.arrow',
        { opacity: 0, y: 0, clipPath: CLIP_HIDDEN },
        { duration: 0, at: 0 },
      ],
    ]

    if (phase === 'idle') {
      figureValue.set(0)
      controls = animate([
        ['.layer', { y: '100%' }, { duration: 0 }],
        ...reset,
      ])
    }

    if (phase === 'cover') {
      figureValue.set(0)
      setData(makeTransitionData()) // new random numbers while the screen is covered
      controls = animate([
        ...reset,
        [
          '.layer',
          { y: '0%' },
          { duration: 0.7, ease: easeInOut, delay: stagger(0.08), at: 0 },
        ],
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
              '.title',
              { opacity: [0, 1], y: [20, 0] },
              { duration: FIGURE_DURATION, ease: easeOut, at: 0.1 },
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
            ['.chart-grid', { opacity: [0, 1] }, { duration: 0.8, at: GRID_START }],
            ['.tape', { opacity: [0, 1] }, { duration: 0.6, at: 0.3 }],
            [
              '.tape-track',
              { x: ['0rem', TAPE_TRAVEL] },
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
          { duration: SLIDE_DURATION, ease: easeInOut, at: slideStart },
        ],
        [
          '.layer',
          { y: '100%' },
          {
            duration: SLIDE_DURATION,
            ease: easeInOut,
            delay: stagger(0.1, { from: 'last' }),
            at: slideStart,
          },
        ],
      ])
    }

    controls?.then(() => {
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
      {LAYERS.map((color) => (
        <div
          key={color}
          className={`layer absolute inset-0 will-change-transform ${color}`}
          style={{ transform: 'translateY(100%)' }}
        />
      ))}

      <TransitionContent title={title} data={data} figureText={figureText} />
    </div>
  )
}
