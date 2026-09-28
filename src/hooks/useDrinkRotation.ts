// Drink rounds: which drink is on sale, the countdown, pause/resume, and
// the pick-then-spin flow. Everything is saved so a refresh resumes where it was.

import type { Drink } from '#/schema/drinks'
import { useRef, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import { pickRandomDrink } from '#/lib/drinkPicker'
import {
  loadRotation,
  saveRotation,
  startNewRotation,
} from '#/lib/rotationStorage'

type Pending = { drink: Drink } // drink picked, waiting for the reel to land on it

// drinks: the list from drinks.json · durationSec: length of one round
export function useDrinkRotation(drinks: Drink[], durationSec: number) {
  // resume the saved round after a refresh, or start a new one
  const [initial] = useState(
    () => loadRotation(drinks) ?? startNewRotation(drinks, durationSec),
  )
  const startsPaused = initial.pausedRemainingMs !== null

  const [pending, setPending] = useState<Pending | null>(null)
  const pendingRef = useRef<Pending | null>(null)

  const [drink, setDrink] = useState(initial.drink)
  const [round, setRound] = useState(0)

  // refs: always hold the latest values, even inside the timer's callback
  const drinkNameRef = useRef(initial.drink.name)
  const expiresAtRef = useRef(
    startsPaused ? Date.now() + initial.pausedRemainingMs! : initial.expiresAt,
  )
  const remainingRef = useRef<number | null>(initial.pausedRemainingMs)

  const { minutes, seconds, isRunning, pause, restart } = useTimer({
    expiryTimestamp: new Date(expiresAtRef.current),
    autoStart: !startsPaused, // stay stopped if we were paused before the refresh
    onExpire: () => nextDrink(),
  })

  // Saves the round as it is right now (after a pause or resume)
  function persist() {
    saveRotation({
      drinkName: drink.name,
      expiresAt: expiresAtRef.current,
      pausedRemainingMs: remainingRef.current,
    })
  }

  // Pause: remember how much time was left
  function pauseTimer() {
    // already paused, or the reel is spinning (the next round starts when it stops)
    if (remainingRef.current !== null || pendingRef.current) return
    remainingRef.current = Math.max(0, expiresAtRef.current - Date.now())
    pause()
    persist()
  }

  // Resume: the round ends "now + the time that was left"
  function resumeTimer() {
    if (remainingRef.current === null) return
    expiresAtRef.current = Date.now() + remainingRef.current
    remainingRef.current = null
    persist()
    restart(new Date(expiresAtRef.current))
  }

  // End of a round (or "next drink" in the menu): pick the winner first,
  // then the page plays the alert and spins the reel to it
  function nextDrink() {
    if (pendingRef.current) return // already spinning, ignore double clicks
    const picked = pickRandomDrink(drinks, drinkNameRef.current)
    pause()
    pendingRef.current = { drink: picked }
    setPending({ drink: picked }) // the page shows the reel
  }

  // Called by the page when the reel has landed: the new round starts now
  function finishSpin() {
    const next = pendingRef.current
    if (!next) return

    const expiresAt = Date.now() + durationSec * 1000
    saveRotation({
      drinkName: next.drink.name,
      expiresAt,
      pausedRemainingMs: null,
    })

    drinkNameRef.current = next.drink.name
    expiresAtRef.current = expiresAt
    remainingRef.current = null
    pendingRef.current = null

    setDrink(next.drink)
    setRound((r) => r + 1)
    setPending(null)
    restart(new Date(expiresAt))
  }

  return {
    drink,
    round,
    minutes,
    seconds,
    isRunning,
    pause: pauseTimer,
    resume: resumeTimer,
    nextDrink,
    finishSpin,
    pending,
  }
}
