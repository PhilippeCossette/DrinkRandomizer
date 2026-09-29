// Full-screen scenes for La Grande Dépression. The page drives them with
// `phase`, exactly like LayerTransition, and picks the scene with `variant`:
//
// intro: the panels slide up like the normal alert, then a giant crash line,
//   the title slamming in word by word with a screen shake, the market %
//   falling to −89.2%, and every drink and shot dropping in.
// outro: the event is over. Red then green panels, a recovery line climbing,
//   "Le marché se relève" rising into place, the % climbing back.
//
// Both end with everything sliding away to reveal the page underneath.

import {
  stagger,
  useAnimate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'
import type { AnimationSequence } from 'motion/react'
import { useEffect, useRef } from 'react'
import {
  CLIP_HIDDEN,
  CLIP_SHOWN,
} from '#/components/layer-transition/constants'
import type { TransitionPhase } from '#/components/layer-transition/constants'
import { drawEase, easeInOut, easeOut } from '#/lib/easing'
import { formatPercent } from '#/lib/format'
import type { Drink } from '#/schema/drinks'
import DepressionContent from './DepressionContent'
import DepressionOutroContent from './DepressionOutroContent'
import {
  BOARD_LEAD,
  COVER_DURATION,
  COVER_STAGGER,
  INDEX_DURATION,
  INDEX_FIGURE,
  INDEX_START,
  ITEMS_START,
  LAYERS,
  LINE_DURATION,
  LINE_START,
  OUTRO_INDEX_DURATION,
  OUTRO_INDEX_FIGURE,
  OUTRO_INDEX_START,
  OUTRO_LAYERS,
  OUTRO_SLIDE_START,
  OUTRO_SUB_START,
  OUTRO_WORD_1,
  OUTRO_WORD_2,
  REDUCED_SLIDE_START,
  RISE,
  SLAM,
  SLIDE_DURATION,
  SLIDE_START,
  SUB_START,
  WORD_1,
  WORD_2,
} from './constants'

export type DepressionScene = 'intro' | 'outro'

type Props = {
  phase: TransitionPhase
  variant: DepressionScene
  items: Drink[]
  onComplete: (phase: string) => void
  // intro only: called BOARD_LEAD seconds before the panels slide away, so the
  // page can mount the event page behind them (see constants.ts)
  onPrepare?: () => void
}

// Screen shake keyframes (px), strongest at the start then settling
const shake = (power: number) => ({
  x: [0, -power, power * 0.8, -power * 0.5, power * 0.3, 0],
  y: [0, power * 0.6, -power * 0.5, power * 0.3, -power * 0.15, 0],
})

export default function DepressionTransition({
  phase,
  variant,
  items,
  onComplete,
  onPrepare,
}: Props) {
  const [scope, animate] = useAnimate()
  const reduceMotion = useReducedMotion()

  const indexValue = useMotionValue(0)
  const indexText = useTransform(indexValue, (v) => formatPercent(v, 1))
  // outro counter: red while still negative, green once the market is back up
  const indexColor = useTransform(indexValue, (v): string =>
    v < 0 ? 'rgb(239 68 68)' : 'rgb(52 211 153)',
  )
  const outro = variant === 'outro'

  // latest callback, read when its timeout fires (not the one from the first render)
  const onPrepareRef = useRef(onPrepare)
  useEffect(() => {
    onPrepareRef.current = onPrepare
  })

  useEffect(() => {
    let cancelled = false
    let controls: ReturnType<typeof animate> | undefined
    let prepareTimer: ReturnType<typeof setTimeout> | undefined

    // instant reset, so every run starts clean (only the current scene is on the page)
    const reset: AnimationSequence = outro
      ? [
          ['.o-content', { y: '0%' }, { duration: 0 }],
          [
            '.o-glow, .o-badge, .o-word-1, .o-word-2, .o-index, .o-sub',
            { opacity: 0 },
            { duration: 0, at: 0 },
          ],
          [
            '.o-line',
            { opacity: 0, clipPath: CLIP_HIDDEN },
            { duration: 0, at: 0 },
          ],
        ]
      : [
          ['.d-content', { y: '0%' }, { duration: 0 }],
          [
            '.d-vignette, .d-badge, .d-word-1, .d-word-2, .d-index, .d-sub, .d-item',
            { opacity: 0 },
            { duration: 0, at: 0 },
          ],
          [
            '.d-line',
            { opacity: 0, clipPath: CLIP_HIDDEN },
            { duration: 0, at: 0 },
          ],
          ['.d-shake', { x: 0, y: 0 }, { duration: 0, at: 0 }],
        ]
    // the counter starts where the scene begins: 0 before the crash, −89.2% after it
    const indexStart = outro ? INDEX_FIGURE : 0

    if (phase === 'idle') {
      indexValue.set(indexStart)
      controls = animate([
        ['.d-layer', { y: '100%' }, { duration: 0 }],
        ...reset,
      ])
    }

    // same slide-up as the normal alert, slower and spaced out so it reads as a slide
    if (phase === 'cover') {
      indexValue.set(indexStart)
      controls = animate([
        ...reset,
        [
          '.d-layer',
          { y: ['100%', '0%'] },
          {
            duration: COVER_DURATION,
            ease: drawEase,
            delay: stagger(COVER_STAGGER),
            at: 0,
          },
        ],
      ])
    }

    if (phase === 'reveal' && outro) {
      const slideStart = reduceMotion ? REDUCED_SLIDE_START : OUTRO_SLIDE_START

      const scene: AnimationSequence = reduceMotion
        ? [
            // calm version: fades only
            [
              '.o-glow, .o-badge, .o-word-1, .o-word-2, .o-index, .o-sub',
              { opacity: 1 },
              { duration: 0.6 },
            ],
            [
              '.o-line',
              { opacity: 1, clipPath: CLIP_SHOWN },
              { duration: 0, at: 0 },
            ],
            [indexValue, OUTRO_INDEX_FIGURE, { duration: 0, at: 0 }],
          ]
        : [
            // green light slowly rising from the bottom
            [
              '.o-glow',
              { opacity: [0, 1], y: ['30%', '0%'] },
              { duration: 2, ease: easeOut, at: 0 },
            ],
            // recovery line, climbing left to right
            ['.o-line', { opacity: 1 }, { duration: 0, at: LINE_START }],
            [
              '.o-line',
              { clipPath: [CLIP_HIDDEN, CLIP_SHOWN] },
              { duration: LINE_DURATION, ease: easeOut, at: LINE_START },
            ],
            [
              '.o-badge',
              { opacity: [0, 1], y: [12, 0] },
              { duration: 0.5, ease: easeOut, at: 0.05 },
            ],

            // title: each word rises into place from below, with a small overshoot
            [
              '.o-word-1',
              { opacity: [0, 1], y: [80, -6, 0] },
              { duration: RISE, ease: easeOut, at: OUTRO_WORD_1 },
            ],
            [
              '.o-word-2',
              { opacity: [0, 1], y: [120, -10, 0], scale: [0.9, 1.04, 1] },
              { duration: RISE + 0.1, ease: easeOut, at: OUTRO_WORD_2 },
            ],

            // the % climbing back from −89.2%, turning green past zero
            [
              '.o-index',
              { opacity: [0, 1], y: [16, 0] },
              { duration: 0.5, ease: easeOut, at: OUTRO_INDEX_START },
            ],
            [
              indexValue,
              OUTRO_INDEX_FIGURE,
              {
                duration: OUTRO_INDEX_DURATION,
                ease: easeInOut,
                at: OUTRO_INDEX_START,
              },
            ],

            [
              '.o-sub',
              { opacity: [0, 1], y: [12, 0] },
              { duration: 0.5, ease: easeOut, at: OUTRO_SUB_START },
            ],
          ]

      controls = animate([
        ...scene,
        // content rides down with the top panel, then the other panels follow,
        // same pace and spacing as the slide-up
        [
          '.o-content',
          { y: '100%' },
          { duration: SLIDE_DURATION, ease: drawEase, at: slideStart },
        ],
        [
          '.d-layer',
          { y: '100%' },
          {
            duration: SLIDE_DURATION,
            ease: drawEase,
            delay: stagger(COVER_STAGGER, { from: 'last' }),
            at: slideStart,
          },
        ],
      ])
    }

    if (phase === 'reveal' && !outro) {
      const slideStart = reduceMotion ? REDUCED_SLIDE_START : SLIDE_START
      // tell the page to mount the event page behind the panels (see BOARD_LEAD)
      prepareTimer = setTimeout(
        () => onPrepareRef.current?.(),
        Math.max(0, slideStart - BOARD_LEAD) * 1000,
      )

      const intro: AnimationSequence = reduceMotion
        ? [
            // calm version: fades only, no shake
            [
              '.d-badge, .d-word-1, .d-word-2, .d-index, .d-sub, .d-item',
              { opacity: 1 },
              { duration: 0.6 },
            ],
            [
              '.d-line',
              { opacity: 1, clipPath: CLIP_SHOWN },
              { duration: 0, at: 0 },
            ],
            [indexValue, INDEX_FIGURE, { duration: 0, at: 0 }],
          ]
        : [
            // red glow breathing from the edges for the whole scene
            [
              '.d-vignette',
              { opacity: [0, 1, 0.5, 1, 0.6, 1] },
              { duration: SLIDE_START, ease: 'easeInOut', at: 0 },
            ],
            // giant crash line, slow at first then plunging
            ['.d-line', { opacity: 1 }, { duration: 0, at: LINE_START }],
            [
              '.d-line',
              { clipPath: [CLIP_HIDDEN, CLIP_SHOWN] },
              {
                duration: LINE_DURATION,
                ease: [0.55, 0, 0.95, 0.35],
                at: LINE_START,
              },
            ],
            [
              '.d-badge',
              { opacity: [0, 1], y: [-12, 0] },
              { duration: 0.5, ease: easeOut, at: 0.05 },
            ],

            // title: each word lands from huge (scale + fade only: cheap to draw on any TV), then the screen shakes
            [
              '.d-word-1',
              {
                opacity: [0, 1],
                scale: [2.6, 1],
              },
              { duration: SLAM, ease: [0.5, 0, 0.9, 0.5], at: WORD_1 },
            ],
            ['.d-shake', shake(10), { duration: 0.4, at: WORD_1 + SLAM }],
            [
              '.d-word-2',
              {
                opacity: [0, 1],
                scale: [3, 1],
              },
              { duration: SLAM, ease: [0.5, 0, 0.9, 0.5], at: WORD_2 },
            ],
            ['.d-shake', shake(18), { duration: 0.5, at: WORD_2 + SLAM }],

            // the % falling to −89.2%
            [
              '.d-index',
              { opacity: [0, 1], y: [16, 0] },
              { duration: 0.5, ease: easeOut, at: INDEX_START },
            ],
            [
              indexValue,
              INDEX_FIGURE,
              { duration: INDEX_DURATION, ease: easeOut, at: INDEX_START },
            ],

            [
              '.d-sub',
              { opacity: [0, 1], y: [12, 0] },
              { duration: 0.5, ease: easeOut, at: SUB_START },
            ],

            // every drink and shot drops from above and bounces into place
            [
              '.d-item',
              { opacity: [0, 1], y: [-60, 0] },
              {
                type: 'spring',
                stiffness: 420,
                damping: 18,
                delay: stagger(0.07),
                at: ITEMS_START,
              },
            ],
          ]

      controls = animate([
        ...intro,
        // content rides down with the top panel, then the other panels follow,
        // same pace and spacing as the slide-up
        [
          '.d-content',
          { y: '100%' },
          { duration: SLIDE_DURATION, ease: drawEase, at: slideStart },
        ],
        [
          '.d-layer',
          { y: '100%' },
          {
            duration: SLIDE_DURATION,
            ease: drawEase,
            delay: stagger(COVER_STAGGER, { from: 'last' }),
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
      clearTimeout(prepareTimer)
    }
  }, [phase])

  return (
    <div
      ref={scope}
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {/* the same 3 panels for both scenes, only their colors change (new panels
          would lose their position and jump instead of sliding) */}
      {(outro ? OUTRO_LAYERS : LAYERS).map((color, i) => (
        <div
          key={i}
          className={`d-layer absolute inset-0 will-change-transform ${color}`}
          style={{ transform: 'translateY(100%)' }}
        />
      ))}

      {outro ? (
        <DepressionOutroContent indexText={indexText} indexColor={indexColor} />
      ) : (
        <DepressionContent items={items} indexText={indexText} />
      )}
    </div>
  )
}
