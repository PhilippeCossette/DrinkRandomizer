// The bar screen. Always opens on the home screen; from there:
//   Nouvelle session    -> opening countdown -> game (first drink + shooter drawn at zero)
//   Reprendre la session -> back where it was (countdown, or the game)
// The game itself (rounds, alerts, reel, La Grande Dépression) is components/game/Game.tsx.

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import drinks from '@/data/drinks.json'
import shots from '@/data/shots.json'
import Game from '#/components/game/Game'
import LiveBackground from '#/components/live-background/LiveBackground'
import CountdownScreen from '#/components/start/CountdownScreen'
import StartScreen from '#/components/start/StartScreen'
import { START_COUNTDOWN_MINUTES } from '#/lib/config'
import {
  hasSavedGame,
  loadSession,
  skipCountdown,
  startNewSession,
} from '#/lib/gameSession'
import { preloadImages } from '#/lib/images'
import { unlockSounds } from '#/lib/sounds'

export const Route = createFileRoute('/')({ ssr: false, component: Home })

type Screen = 'home' | 'countdown' | 'game'

function Home() {
  const [screen, setScreen] = useState<Screen>('home')
  const [startsAt, setStartsAt] = useState(0) // end of the opening countdown (ms)
  // the game is starting with the first draw: the countdown stays on top
  // (showing 00:00) until the first crash alert's panels cover the screen
  const [firstDraw, setFirstDraw] = useState(false)
  const [countdownOnTop, setCountdownOnTop] = useState(false)

  // Browsers only allow sound after a first click on the page
  // (the home screen buttons count, so sounds work as soon as the game starts)
  useEffect(() => unlockSounds(), [])

  // Decode every drink and shot image while the home screen / countdown is up
  // (they're big files; see lib/images.ts)
  useEffect(() => {
    preloadImages([...drinks, ...shots].map((d) => d.imgSrc))
  }, [])

  // The countdown is over (or staff pressed "Lancer maintenant"): mount the
  // game, which draws the first drink
  function startGame() {
    skipCountdown() // saved as over, so a refresh doesn't show it again
    setFirstDraw(true)
    setCountdownOnTop(true)
    setScreen('game')
  }

  function handleNewSession() {
    setStartsAt(startNewSession(START_COUNTDOWN_MINUTES * 60))
    setScreen('countdown')
  }

  function handleResume() {
    const session = loadSession()
    if (session.status === 'countdown') {
      setStartsAt(session.startsAt)
      setScreen('countdown')
    } else if (!hasSavedGame()) {
      // the countdown ended while the app was closed: draw the first drink now
      setStartsAt(Date.now())
      startGame()
    } else {
      setFirstDraw(false)
      setScreen('game')
    }
  }

  return (
    <>
      {screen === 'home' && (
        <div className="relative isolate min-h-dvh overflow-x-hidden">
          <LiveBackground drinks={drinks} />
          <StartScreen
            onResume={handleResume}
            onNewSession={handleNewSession}
          />
        </div>
      )}

      {screen === 'game' && (
        <Game
          firstDraw={firstDraw}
          onFirstCover={() => setCountdownOnTop(false)}
        />
      )}

      {(screen === 'countdown' || countdownOnTop) && (
        <CountdownScreen
          startsAt={startsAt}
          locked={screen === 'game'}
          onDone={() => {
            if (screen === 'countdown') startGame()
          }}
          onBack={() => setScreen('home')}
        />
      )}
    </>
  )
}
