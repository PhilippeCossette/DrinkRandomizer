import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const pad = (n: number) => String(n).padStart(2, '0')

const TIMER_TOTAL_MINUTES = 25

// Palette (matches the background charts)
const PANEL = '#121419'

const STATES = {
  calm: { color: '#22C55E', label: 'En cours' },
  hurry: { color: '#F59E0B', label: 'Dépêchez-vous' },
  urgent: { color: '#EF4444', label: 'Dernière chance' },
  done: { color: '#EF4444', label: 'Terminé' },
}

function getState(remainingSeconds: number, ratio: number) {
  if (remainingSeconds <= 0) return STATES.done
  if (ratio <= 0.2) return STATES.urgent // last 20% (5 min out of 25)
  if (ratio <= 0.4) return STATES.hurry // last 40% (10 min out of 25)
  return STATES.calm
}

function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-block h-[1em] w-[0.62em] overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.span
          key={value}
          className="absolute inset-0 grid place-items-center"
          initial={{ y: '-100%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export default function TimerDisplay({
  minutes,
  seconds,
}: {
  minutes: number
  seconds: number
}) {
  const reduceMotion = useReducedMotion() ?? false

  const totalSeconds = TIMER_TOTAL_MINUTES * 60
  const remainingSeconds = minutes * 60 + seconds
  const ratio = Math.max(0, remainingSeconds / totalSeconds) // 1 = just started, 0 = done
  const state = getState(remainingSeconds, ratio)
  const lastMinute = remainingSeconds > 0 && remainingSeconds <= 60
  const done = remainingSeconds <= 0

  const [m1, m2] = pad(minutes)
  const [s1, s2] = pad(seconds)

  return (
    <motion.div
      // width from the screen, never from content (no size jumps)
      className="@container w-[calc(100vw-3rem)] max-w-xl rounded-2xl border border-white/10 p-5
                 sm:p-7 lg:w-[min(36rem,42vw)]"
      style={{ backgroundColor: PANEL }}
      animate={{ boxShadow: `4px 4px 0 0 ${state.color}` }}
      transition={{ duration: 0.6 }}
    >
      {/* top row: label + state tag */}
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[11px] uppercase tracking-widest text-zinc-500 sm:text-xs">
          Prochain crash dans
        </span>

        <div className="relative h-7">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={state.label}
              className="flex h-7 items-center gap-2 rounded-md border px-2.5 font-mono text-xs font-semibold sm:text-sm"
              style={{
                color: state.color,
                borderColor: `${state.color}66`,
                backgroundColor: `${state.color}1A`,
              }}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 26 }}
            >
              {/* live dot */}
              <span className="relative flex h-2 w-2">
                {!reduceMotion && !done && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: state.color }}
                    animate={{ scale: [1, 2.4], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.6,
                      ease: 'easeOut',
                      repeat: Infinity,
                    }}
                  />
                )}
                <span
                  className="relative h-2 w-2 rounded-full"
                  style={{ backgroundColor: state.color }}
                />
              </span>
              {state.label}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* digits: sized from the panel's width */}
      <motion.div
        className="my-4 flex items-center justify-center font-digital text-[30cqw] leading-none tabular-nums sm:my-6"
        animate={{
          color: state.color,
          scale: lastMinute && !reduceMotion ? [1, 1.025, 1] : 1,
        }}
        transition={{
          color: { duration: 0.6 },
          scale: lastMinute
            ? { duration: 1, ease: 'easeInOut', repeat: Infinity }
            : { duration: 0.3 },
        }}
      >
        <Digit value={m1!} />
        <Digit value={m2!} />
        <motion.span
          className="mt-[-0.1em] px-[0.04em]"
          animate={
            reduceMotion || done ? { opacity: 1 } : { opacity: [1, 0.3, 1] }
          }
          transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity }}
        >
          :
        </motion.span>
        <Digit value={s1!} />
        <Digit value={s2!} />
      </motion.div>

      {/* progress bar */}
    </motion.div>
  )
}
