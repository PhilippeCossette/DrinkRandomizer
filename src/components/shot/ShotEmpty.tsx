import { motion, useReducedMotion } from 'motion/react'
import { SHOT_CHANCE } from '#/lib/config'
import { ease } from '#/lib/easing'
import { SHOT_PLACEHOLDER } from '#/lib/images'
import DrawPips from '#/components/shot/DrawPips'

// A calm, almost flat market line (viewBox 0 0 100 40)
const FLAT_LINE =
  'M0 24 C8 22 12 26 20 24 S32 21 40 23 S52 26 60 23 S72 21 80 24 S92 25 100 23'

// No shot this round: "the market is calm, waiting for the next draw".
// Same layout as ShotActive: stacked when narrow, side by side when wider.
export default function ShotEmpty() {
  const reduceMotion = useReducedMotion() ?? false
  const odds = Math.round(1 / SHOT_CHANCE)
  const pips = Math.min(odds, 10) // one little glass per chance

  return (
    <div className="@container h-full lg:[container-type:size]">
      <div className="flex h-full flex-col justify-center gap-4 p-[min(var(--spacing-tile),5cqw)] @lg:flex-row @lg:items-center @lg:gap-[min(var(--spacing-tile),4cqw)]">
        {/* visual: shot image with radar pulses over a calm market line */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease }}
          className="relative grid aspect-square w-[30cqw] max-w-40 shrink-0 place-items-center overflow-hidden rounded-inner bg-sunken @lg:w-[28cqw] lg:@lg:w-[min(34cqw,calc(100cqh-3rem))] lg:@lg:max-w-none"
        >
          {/* calm market line, redrawn in a loop */}
          <svg
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
            className="absolute inset-x-0 bottom-[12%] h-[30%] w-full text-ink-faint"
            aria-hidden
          >
            <motion.path
              d={FLAT_LINE}
              fill="none"
              stroke="currentColor"
              strokeWidth={0.8}
              strokeLinecap="round"
              initial={{ pathLength: reduceMotion ? 1 : 0, opacity: 0.6 }}
              animate={
                reduceMotion
                  ? undefined
                  : { pathLength: [0, 1, 1], opacity: [0.6, 0.6, 0] }
              }
              transition={{
                duration: 4,
                times: [0, 0.75, 1],
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 0.4,
              }}
            />
          </svg>

          {/* radar pulses: two rings with Tailwind animate-ping, the second one offset */}
          {['[animation-delay:0s]', '[animation-delay:1.3s]'].map((delay) => (
            <span
              key={delay}
              className={`absolute h-[46%] w-[46%] animate-ping rounded-full border-2 border-ink-faint/60 [animation-duration:2.6s] motion-reduce:hidden ${delay}`}
            />
          ))}

          {/* the shot, floating gently */}
          <motion.span
            className="relative flex justify-center"
            animate={
              reduceMotion
                ? undefined
                : { y: [0, -4, 0], rotate: [0, -3, 0, 3, 0] }
            }
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
          >
            <img
              src={SHOT_PLACEHOLDER}
              alt="A shot glass"
              className="h-[40%] w-[40%]"
            />
          </motion.span>
        </motion.div>

        {/* info */}
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-3">
          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease }}
            className="text-[min(var(--text-heading),8cqw)] leading-tight font-semibold tracking-tight text-ink"
          >
            Aucun shooter
          </motion.h3>

          {/* odds: one glass per chance, with a fake draw picking one in a loop */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5, ease }}
            className="flex flex-col gap-2"
          >
            <DrawPips count={pips} />
            <p className="text-body text-ink-soft">
              <span className="font-medium text-ink">1 chance sur {odds}</span>{' '}
              au prochain tirage
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
