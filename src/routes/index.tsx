// The bar screen: main layout, and the order of events when something crashes
// (cover panels -> reveal -> reel spin -> new round).

import { createFileRoute } from '@tanstack/react-router'
import drinks from '@/data/drinks.json'
import shots from '@/data/shots.json'
import { useDrinkRotation } from '#/hooks/useDrinkRotation'
import { useShotRotation } from '#/hooks/useShotRotation'
import { SHOT_ROUND_MINUTES, TIMER_TOTAL_MINUTES } from '#/lib/config'
import TimerDisplay from '#/components/timer/TimerDisplay'
import ShotCard from '#/components/shot/ShotCard'
import Menu from '#/components/menu/Menu'
import PageHeader from '#/components/header/PageHeader'
import SpinDrinks from '#/components/spin-drinks/SpinDrinks'
import DrinkReveal from '#/components/drink-reveal/DrinkReveal'
import LayerTransition from '#/components/layer-transition/LayerTransition'
import type { TransitionPhase } from '#/components/layer-transition/constants'
import LiveBackground from '#/components/live-background/LiveBackground'
import { playAlert, unlockSounds } from '#/lib/sounds'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/')({ ssr: false, component: Home })

// Which crash alert is playing (only one at a time)
type Alert = 'drink' | 'shot' | null

const ALERT_TITLES = {
  drink: 'Un verre est en chute',
  shot: 'Un shooter est en chute',
}

function Home() {
  const {
    drink,
    round,
    minutes,
    seconds,
    isRunning,
    pending,
    pause,
    resume,
    nextDrink,
    finishSpin,
  } = useDrinkRotation(drinks, TIMER_TOTAL_MINUTES * 60)

  const shotRotation = useShotRotation(shots, SHOT_ROUND_MINUTES * 60)

  const [alert, setAlert] = useState<Alert>(null)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [showReel, setShowReel] = useState(false)
  const [spinning, setSpinning] = useState(false)

  // Browsers only allow sound after a first click on the page
  useEffect(() => unlockSounds(), [])

  // Sound when a crash alert starts
  useEffect(() => {
    if (alert) playAlert(alert)
  }, [alert])

  // Start the next alert when nothing is playing.
  // Drinks go first if both happen at the same time.
  useEffect(() => {
    if (alert !== null) return
    if (pending) {
      setAlert('drink')
      setPhase('cover')
    } else if (shotRotation.pending) {
      setAlert('shot')
      setPhase('cover')
    }
  }, [alert, pending, shotRotation.pending])

  function handleTransitionDone(done: string) {
    if (done === 'cover') {
      if (alert === 'drink') setShowReel(true)
      setPhase('reveal')
    }

    if (done === 'reveal') {
      setPhase('idle')
      if (alert === 'drink') {
        setSpinning(true) // the reel ends the drink alert in handleSpinDone
      } else if (alert === 'shot') {
        shotRotation.finishShot() // the card updates as the panels slide away
        setAlert(null)
      }
    }
  }

  function handleSpinDone() {
    setShowReel(false)
    setSpinning(false)
    finishSpin()
    setAlert(null)
  }

  // the menu pauses/resumes drinks and shots together
  function pauseAll() {
    pause()
    shotRotation.pause()
  }

  function resumeAll() {
    resume()
    shotRotation.resume()
  }

  return (
    <section
      // mobile: stacked and scrollable · lg+: full-screen bento, nothing scrolls
      className="relative isolate flex min-h-dvh w-full flex-col gap-bento overflow-x-hidden p-bento pb-[calc(var(--spacing-bento)+var(--spacing-tape))]
                 lg:grid lg:h-dvh lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden"
    >
      <LiveBackground drinks={drinks} current={drink} />

      <Menu
        pause={pauseAll}
        resume={resumeAll}
        isRunning={isRunning}
        nextDrink={nextDrink}
        nextShot={shotRotation.skipShot}
        busy={alert !== null}
      />
      <PageHeader />

      {showReel && pending ? (
        <div className="grid min-h-0 min-w-0 flex-1 place-items-center">
          <div className="w-full min-w-0">
            <SpinDrinks
              drinks={drinks}
              winner={pending.drink}
              start={spinning}
              onDone={handleSpinDone}
            />
          </div>
        </div>
      ) : (
        // bento: timer + shot on the left, drink on the right
        <main className="flex flex-col gap-bento lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="flex flex-col gap-bento lg:grid lg:min-h-0 lg:grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <TimerDisplay minutes={minutes} seconds={seconds} />
            <ShotCard
              shot={shotRotation.shot}
              round={shotRotation.round}
              minutes={shotRotation.minutes}
              seconds={shotRotation.seconds}
            />
          </div>
          <DrinkReveal drink={drink} round={round} />
        </main>
      )}

      <LayerTransition
        phase={phase}
        title={ALERT_TITLES[alert ?? 'drink']}
        onComplete={handleTransitionDone}
      />
    </section>
  )
}
