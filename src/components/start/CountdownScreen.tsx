// Full-screen opening countdown, shown when a new session starts.
// Nothing is drawn yet: at zero, the first drink and the first shooter are
// picked (the page then mounts the game, whose crash alert slides up over this
// screen). Staff controls in the top-right corner, like in the game:
// start now, or go back to the home screen.

import {
  IconClockPlay,
  IconHome,
  IconPlayerTrackNextFilled,
} from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import drinks from '@/data/drinks.json'
import PageHeader from '#/components/header/PageHeader'
import LiveBackground from '#/components/live-background/LiveBackground'
import Digit from '#/components/timer/Digit'
import StateTag from '#/components/timer/StateTag'
import { getTimerState } from '#/components/timer/timerState'
import Badge from '#/components/ui/Badge'
import IconButton from '#/components/ui/IconButton'
import { START_COUNTDOWN_MINUTES } from '#/lib/config'
import { ease } from '#/lib/easing'
import { pad } from '#/lib/format'

type Props = {
  startsAt: number // ms, when the countdown reaches zero
  onDone: () => void // called once at zero (or "Lancer maintenant")
  onBack: () => void // staff: back to the home screen (the countdown keeps its time)
  locked: boolean // the game is starting underneath: show 00:00, no controls
}

export default function CountdownScreen({
  startsAt,
  onDone,
  onBack,
  locked,
}: Props) {
  const doneRef = useRef(false)
  const finish = () => {
    if (doneRef.current) return
    doneRef.current = true
    onDone()
  }

  const { hours, minutes, seconds, totalSeconds } = useTimer({
    expiryTimestamp: new Date(startsAt),
    onExpire: finish,
  })

  // already over when the screen opens (e.g. resumed after the countdown ended)
  useEffect(() => {
    if (startsAt <= Date.now()) finish()
  }, [])

  const remaining = locked ? 0 : totalSeconds
  const ratio = remaining / (START_COUNTDOWN_MINUTES * 60)
  const state = getTimerState(remaining, ratio)
  const showHours = !locked && hours > 0
  const totalMinutes = showHours ? minutes : hours * 60 + minutes
  const [m1, m2] = pad(locked ? 0 : totalMinutes)
  const [s1, s2] = pad(locked ? 0 : seconds)
  const finalSeconds = remaining > 0 && remaining <= 10 // last 10 s: digits pulse

  return (
    <section className="fixed inset-0 z-[45] flex flex-col gap-bento overflow-hidden p-bento pb-[calc(var(--spacing-bento)+var(--spacing-tape))]">
      <LiveBackground drinks={drinks} blips={false} />
      {!locked && <StaffControls onStart={finish} onBack={onBack} />}
      <PageHeader />

      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease }}
        className="flex min-h-0 flex-1 flex-col items-center justify-center gap-[clamp(1rem,3vh,2rem)] text-center"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Badge tone="neutral" icon={IconClockPlay}>
            Ouverture du marché
          </Badge>
          <StateTag state={state} />
        </div>

        <h2 className="text-[min(var(--text-heading),8vw)] leading-tight font-semibold tracking-tight text-ink">
          La session commence dans
        </h2>

        {/* digits: same font and colors as the main timer (green → orange → red) */}
        <motion.div
          key={finalSeconds ? remaining : 'steady'}
          initial={finalSeconds ? { scale: 1.06 } : false}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, ease }}
          className={`flex items-center font-digital text-[min(26vw,48vh)] leading-none tabular-nums transition-colors duration-700 ${state.text}`}
          aria-label={`${totalMinutes} minutes ${seconds} secondes`}
        >
          {showHours && (
            <>
              <Digit value={String(hours)} />
              <span className="mt-[-0.1em] px-[0.04em]">:</span>
            </>
          )}
          <Digit value={m1} />
          <Digit value={m2} />
          <span
            className={`mt-[-0.1em] px-[0.04em] ${remaining > 0 ? 'animate-pulse [animation-duration:1s] motion-reduce:animate-none' : ''}`}
          >
            :
          </span>
          <Digit value={s1} />
          <Digit value={s2} />
        </motion.div>

        <p className="max-w-[40rem] text-subheading text-ink-soft">
          À zéro, le premier verre et le premier shooter seront tirés au sort.
        </p>
      </motion.main>
    </section>
  )
}

// Hidden staff controls in the top-right corner (slide down on hover, always
// visible on touch screens), same as the game's menu
function StaffControls({
  onStart,
  onBack,
}: {
  onStart: () => void
  onBack: () => void
}) {
  const [touch] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches,
  )

  return (
    <motion.div
      initial="hidden"
      whileHover="visible"
      animate={touch ? 'visible' : 'hidden'}
      className="fixed top-0 right-0 z-[46] flex h-[6rem] w-[16rem] max-w-full justify-end p-bento"
    >
      <motion.div
        variants={{
          hidden: { y: '-200%', opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="flex h-fit items-center gap-2 rounded-full border border-line bg-surface p-[0.3rem] shadow-float"
      >
        <IconButton variant="solid" label="Lancer maintenant" onClick={onStart}>
          <IconPlayerTrackNextFilled size="1.2rem" />
        </IconButton>
        <IconButton label="Retour au menu" onClick={onBack}>
          <IconHome size="1.2rem" />
        </IconButton>
      </motion.div>
    </motion.div>
  )
}
