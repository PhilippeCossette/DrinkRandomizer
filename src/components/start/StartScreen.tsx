// Home screen: always the first thing shown when the app loads.
// If a session is saved in the browser, staff can resume it or start a new one
// (with a confirmation, so a misclick can't wipe a game in progress).

import {
  IconAlertTriangle,
  IconClockHour4,
  IconPlayerPlayFilled,
  IconPlus,
  IconTrendingDown,
} from '@tabler/icons-react'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import logo from '#/assets/images/logo.png'
import Badge from '#/components/ui/Badge'
import Button from '#/components/ui/Button'
import { cardClass } from '#/components/ui/Card'
import { START_COUNTDOWN_MINUTES } from '#/lib/config'
import { ease } from '#/lib/easing'
import { pad } from '#/lib/format'
import { loadSession } from '#/lib/gameSession'
import type { SessionInfo } from '#/lib/gameSession'

type Props = {
  onResume: () => void
  onNewSession: () => void
}

// mm:ss (or h:mm:ss) from milliseconds
function formatLeft(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// One line describing the saved session ("Verre en crash : Paloma · 12:34")
function describe(session: SessionInfo, now: number) {
  if (session.status === 'countdown') {
    return {
      icon: IconClockHour4,
      text: `Décompte d'ouverture en cours · début dans ${formatLeft(session.startsAt - now)}`,
    }
  }
  if (session.status !== 'playing') return null
  if (session.depression) {
    return { icon: IconTrendingDown, text: 'La Grande Dépression en cours' }
  }
  if (!session.drinkName) {
    return {
      icon: IconClockHour4,
      text: 'Le premier verre va être tiré au sort',
    }
  }
  const time =
    session.drinkPausedMs !== null
      ? `en pause (${formatLeft(session.drinkPausedMs)})`
      : session.drinkEndsAt !== null && session.drinkEndsAt > now
        ? `prochain crash dans ${formatLeft(session.drinkEndsAt - now)}`
        : 'prochain crash imminent'
  return {
    icon: IconTrendingDown,
    text: `Verre en crash : ${session.drinkName} · ${time}`,
  }
}

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export default function StartScreen({ onResume, onNewSession }: Props) {
  const [session] = useState(loadSession) // read once when the screen opens
  const [now, setNow] = useState(() => Date.now())
  const [confirming, setConfirming] = useState(false) // "Nouvelle session" asked once
  const hasSession = session.status !== 'none'
  const line = describe(session, now)

  // refresh the time left once per second
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // the confirmation goes away by itself after a few seconds
  useEffect(() => {
    if (!confirming) return
    const id = setTimeout(() => setConfirming(false), 5000)
    return () => clearTimeout(id)
  }, [confirming])

  function handleNewSession() {
    if (hasSession && !confirming) {
      setConfirming(true) // first click: ask
      return
    }
    onNewSession()
  }

  return (
    <motion.main
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: 0.09, delayChildren: 0.1 }}
      className="relative z-0 flex min-h-[calc(100dvh-var(--spacing-tape))] flex-col items-center justify-center gap-[clamp(1.5rem,4vh,3rem)] px-bento py-[clamp(1.5rem,6vh,4rem)] text-center"
    >
      {/* logo + title */}
      <motion.div
        variants={item}
        transition={{ duration: 0.6, ease }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src={logo}
          alt="Deux 22"
          className="h-[clamp(5rem,14vh,9rem)] w-auto object-contain"
        />
        <h1 className="text-[min(var(--text-display),14vw)] leading-[0.95] font-bold tracking-tight text-ink">
          Crash boursier
        </h1>
        <p className="text-subheading text-ink-soft">
          Les prix chutent en direct. Profitez-en.
        </p>
      </motion.div>

      {/* session card */}
      <motion.section
        variants={item}
        transition={{ duration: 0.6, ease }}
        className={`${cardClass} flex w-full max-w-[34rem] flex-col gap-5 p-tile text-left`}
      >
        {hasSession && line ? (
          <div className="flex flex-col gap-3">
            <Badge tone="success" className="self-start">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-success/70 motion-reduce:animate-none" />
                <span className="relative h-2 w-2 rounded-full bg-success" />
              </span>
              Session en cours
            </Badge>
            <p className="flex items-start gap-2 text-body text-ink-soft">
              <line.icon
                size="1.2em"
                stroke={2}
                className="mt-[0.1em] shrink-0"
              />
              <span>{line.text}</span>
            </p>
          </div>
        ) : (
          <p className="text-body text-ink-soft">
            Aucune session en cours. Une nouvelle session commence par un
            décompte de {START_COUNTDOWN_MINUTES} min, puis le premier verre et
            le premier shooter sont tirés au sort.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {hasSession && (
            <Button icon={IconPlayerPlayFilled} onClick={onResume} autoFocus>
              Reprendre la session
            </Button>
          )}

          <Button
            variant={confirming ? 'danger' : hasSession ? 'outline' : 'solid'}
            icon={confirming ? IconAlertTriangle : IconPlus}
            onClick={handleNewSession}
            autoFocus={!hasSession}
          >
            {confirming ? 'Confirmer : effacer la session' : 'Nouvelle session'}
          </Button>

          {confirming && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-label text-ink-soft"
            >
              La session en cours sera perdue. Cliquez encore pour confirmer.
            </motion.p>
          )}
        </div>
      </motion.section>
    </motion.main>
  )
}
