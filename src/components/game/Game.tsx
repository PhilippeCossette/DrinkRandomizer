// The game screen (one session in progress): main layout, and the order of
// events when something crashes (cover panels -> reveal -> reel spin -> new round).
// Also runs La Grande Dépression: every drink and shot on sale at once,
// launched from the staff menu (intro -> event page -> back to normal rounds).
// Mounted by routes/index.tsx once the home screen / opening countdown is done.

import drinks from '@/data/drinks.json'
import shots from '@/data/shots.json'
import { useDrinkRotation } from '#/hooks/useDrinkRotation'
import { useShotRotation } from '#/hooks/useShotRotation'
import { useDepression } from '#/hooks/useDepression'
import {
  DEPRESSION_MINUTES,
  SHOT_ROUND_MINUTES,
  TIMER_TOTAL_MINUTES,
} from '#/lib/config'
import TimerDisplay from '#/components/timer/TimerDisplay'
import ShotCard from '#/components/shot/ShotCard'
import Menu from '#/components/menu/Menu'
import PageHeader from '#/components/header/PageHeader'
import SpinDrinks from '#/components/spin-drinks/SpinDrinks'
import DrinkReveal from '#/components/drink-reveal/DrinkReveal'
import LayerTransition from '#/components/layer-transition/LayerTransition'
import type { TransitionPhase } from '#/components/layer-transition/constants'
import LiveBackground from '#/components/live-background/LiveBackground'
import DepressionBoard from '#/components/depression/DepressionBoard'
import DepressionTransition from '#/components/depression/DepressionTransition'
import type { DepressionScene } from '#/components/depression/DepressionTransition'
import {
  BOARD_ENTER_DELAY,
  COVER_TOTAL as DEPRESSION_COVER_TOTAL,
} from '#/components/depression/constants'
import { playAlert, playDepression, playRecovery } from '#/lib/sounds'
import { useEffect, useRef, useState } from 'react'

// Which crash alert is playing (only one at a time)
type Alert = 'drink' | 'shot' | null

const ALERT_TITLES = {
  drink: 'Un verre est en chute',
  shot: 'Un shooter est en chute',
}
const FIRST_DRINK_TITLE = 'Le premier verre est en chute' // right after the opening countdown

type Props = {
  // true right after the opening countdown: the first drink is drawn with the
  // crash alert + reel as soon as the game appears
  firstDraw?: boolean
  // called once, when that first alert's panels fully cover the screen
  // (the page then removes the countdown that was showing until now)
  onFirstCover?: () => void
}

export default function Game({ firstDraw = false, onFirstCover }: Props) {
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
    startFresh,
    cancelPending,
  } = useDrinkRotation(drinks, TIMER_TOTAL_MINUTES * 60)

  const shotRotation = useShotRotation(shots, SHOT_ROUND_MINUTES * 60)

  // La Grande Dépression. When time is up the outro plays, then the night goes
  // back to normal with a fresh drink round and a fresh shooter round.
  const depression = useDepression(DEPRESSION_MINUTES * 60, {
    // queued: it starts as soon as no scene is playing (see the effect below)
    onTimeUp: () => setOutroQueued(true),
    // ended while the page was closed: nobody's watching, just restart quietly
    onEndedWhileClosed: () => {
      startFresh()
      shotRotation.reset()
    },
  })
  const [depressionPhase, setDepressionPhase] =
    useState<TransitionPhase>('idle')
  const [depressionScene, setDepressionScene] =
    useState<DepressionScene>('intro')
  // the event page waits behind the intro and only renders shortly before the
  // panels slide away (see BOARD_LEAD in components/depression/constants.ts)
  const [boardReady, setBoardReady] = useState(true)
  const [introPlayed, setIntroPlayed] = useState(false) // stays false after a refresh: no waiting
  const [outroQueued, setOutroQueued] = useState(false) // time is up, the outro starts when it can
  const frameRef = useRef(0) // pending requestAnimationFrame (cancelled on unmount)

  // the first drink of the session is being drawn (special alert title)
  const [drawingFirst, setDrawingFirst] = useState(firstDraw)

  const [alert, setAlert] = useState<Alert>(null)
  const [phase, setPhase] = useState<TransitionPhase>('idle')
  const [showReel, setShowReel] = useState(false)
  const [spinning, setSpinning] = useState(false)

  // New session: draw the first drink right away (the crash alert and the reel
  // play as usual). nextDrink ignores a second call, so StrictMode is fine.
  useEffect(() => {
    if (firstDraw) nextDrink()
  }, [])

  // Sound when a crash alert starts
  useEffect(() => {
    if (alert) playAlert(alert)
  }, [alert])

  // Time is up: play the outro as soon as no scene is playing
  useEffect(() => {
    if (!outroQueued || depressionPhase !== 'idle') return
    setOutroQueued(false)
    if (depression.active) startOutro()
  }, [outroQueued, depressionPhase, depression.active])

  // stop any pending frame callback if the page goes away (hot reload in dev)
  useEffect(() => () => cancelAnimationFrame(frameRef.current), [])

  // The whole page turns red while La Grande Dépression is on (see styles.css)
  useEffect(() => {
    document.body.classList.toggle('depression', depression.active)
  }, [depression.active])
  // ...and back to normal if the game screen goes away
  useEffect(() => () => document.body.classList.remove('depression'), [])

  // Start the next alert when nothing is playing.
  // Drinks go first if both happen at the same time.
  // Never during La Grande Dépression (everything is already on sale).
  useEffect(() => {
    if (alert !== null || depressionPhase !== 'idle' || depression.active)
      return
    if (pending) {
      setAlert('drink')
      setPhase('cover')
    } else if (shotRotation.pending) {
      setAlert('shot')
      setPhase('cover')
    }
  }, [alert, depressionPhase, depression.active, pending, shotRotation.pending])

  function handleTransitionDone(done: string) {
    if (done === 'cover') {
      if (drawingFirst) onFirstCover?.() // the countdown can go, the panels hide it
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
    setDrawingFirst(false)
  }

  // Menu button: launch La Grande Dépression (intro first), or stop it early (outro)
  function toggleDepression() {
    if (depressionPhase !== 'idle') return
    if (depression.active) {
      startOutro()
      return
    }
    setDepressionScene('intro')
    setDepressionPhase('cover')
    playDepression(DEPRESSION_COVER_TOTAL)
  }

  // The event is over (time up, or stopped): play the "market recovers" scene
  function startOutro() {
    if (depressionPhase !== 'idle') return
    depression.markEnding() // a refresh from here on goes straight back to normal
    setDepressionScene('outro')
    setDepressionPhase('cover')
    playRecovery(DEPRESSION_COVER_TOTAL)
  }

  function handleDepressionTransitionDone(done: string) {
    if (depressionScene === 'outro') {
      if (done === 'cover') {
        // screen is covered: close the event and start fresh drink and shooter
        // rounds now, so the new cards have settled before the panels slide away
        depression.end()
        startFresh()
        shotRotation.reset()
        revealNextFrame()
      }
      if (done === 'reveal') setDepressionPhase('idle')
      return
    }

    if (done === 'cover') {
      // screen is covered: freeze the normal rounds and switch to the event page.
      // A drink or shot that crashed during the slide-up is dropped (it would
      // otherwise play its alert over the event page).
      cancelPending()
      shotRotation.cancelPending()
      pause()
      shotRotation.pause()
      setBoardReady(false)
      setIntroPlayed(true)
      depression.start()
      revealNextFrame()
    }
    if (done === 'reveal') setDepressionPhase('idle')
  }

  // Starts a scene's reveal two frames from now, once the page underneath has
  // re-rendered behind the panels (so the reveal doesn't stutter at its start)
  function revealNextFrame() {
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = requestAnimationFrame(() =>
        setDepressionPhase('reveal'),
      )
    })
  }

  // the menu pauses/resumes the event, or the drinks and shots together
  // (the button is disabled while a Grande Dépression scene plays)
  function pauseAll() {
    if (depression.active) return depression.pause()
    pause()
    shotRotation.pause()
  }

  function resumeAll() {
    if (depression.active) return depression.resume()
    resume()
    shotRotation.resume()
  }

  return (
    <section
      // mobile: stacked and scrollable · lg+: full-screen bento, nothing scrolls
      className="relative isolate flex min-h-dvh w-full flex-col gap-bento overflow-x-hidden p-bento pb-[calc(var(--spacing-bento)+var(--spacing-tape))]
                 lg:grid lg:h-dvh lg:grid-rows-[auto_minmax(0,1fr)] lg:overflow-hidden"
    >
      <LiveBackground
        drinks={depression.active ? [...drinks, ...shots] : drinks}
        current={drink}
        allCrashed={depression.active}
      />

      <Menu
        pause={pauseAll}
        resume={resumeAll}
        isRunning={depression.active ? depression.isRunning : isRunning}
        nextDrink={nextDrink}
        nextShot={shotRotation.skipShot}
        busy={alert !== null || depressionPhase !== 'idle'}
        pauseDisabled={depressionPhase !== 'idle'}
        depressionActive={depression.active}
        toggleDepression={toggleDepression}
      />
      <PageHeader depression={depression.active} />

      {depression.active ? (
        boardReady && (
          <DepressionBoard
            drinks={drinks}
            shots={shots}
            minutes={depression.minutes}
            seconds={depression.seconds}
            isRunning={depression.isRunning}
            // after the intro: the cards cascade in as the last panel leaves
            enterDelay={introPlayed ? BOARD_ENTER_DELAY : 0}
          />
        )
      ) : showReel && pending ? (
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
        title={
          drawingFirst && alert === 'drink'
            ? FIRST_DRINK_TITLE
            : ALERT_TITLES[alert ?? 'drink']
        }
        onComplete={handleTransitionDone}
      />

      <DepressionTransition
        phase={depressionPhase}
        variant={depressionScene}
        items={[...drinks, ...shots]}
        onComplete={handleDepressionTransitionDone}
        onPrepare={() => setBoardReady(true)}
      />
    </section>
  )
}
