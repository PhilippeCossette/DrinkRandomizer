// Shooter rounds: every SHOT_ROUND_MINUTES a draw happens, with a SHOT_CHANCE
// chance of a shooter going on sale. Saved like the drinks, so a refresh resumes.

import type { Drink } from '#/schema/drinks'
import { useRef, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import { SHOT_CHANCE } from '#/lib/config'
import { pickRandomDrink } from '#/lib/drinkPicker'
import { loadShotRotation, saveShotRotation } from '#/lib/shotStorage'

type ShotRound = { shot: Drink | null }
type PendingShot = { shot: Drink }

// Random shooter, never the same one twice in a row
function pickShot(shots: Drink[], previousShot?: string): PendingShot {
  return { shot: pickRandomDrink(shots, previousShot) }
}

// Saves and returns a new round starting now
function saveNewRound(round: ShotRound, durationSec: number) {
  const expiresAt = Date.now() + durationSec * 1000
  saveShotRotation({
    shotName: round.shot?.name ?? null,
    expiresAt,
    pausedRemainingMs: null,
  })
  return expiresAt
}

// First load: roll once (no alert, the page just shows the result)
function startFirstRound(shots: Drink[], durationSec: number) {
  const round: ShotRound =
    Math.random() < SHOT_CHANCE ? pickShot(shots) : { shot: null }
  const expiresAt = saveNewRound(round, durationSec)
  return { ...round, expiresAt, pausedRemainingMs: null as number | null }
}

// shots: the list from shots.json · durationSec: time between two draws
export function useShotRotation(shots: Drink[], durationSec: number) {
  // resume the saved round after a refresh, or roll the first one
  const [initial] = useState(
    () => loadShotRotation(shots) ?? startFirstRound(shots, durationSec),
  )
  const startsPaused = initial.pausedRemainingMs !== null

  const [current, setCurrent] = useState<ShotRound>({ shot: initial.shot })
  const [round, setRound] = useState(0)

  // a picked shot waiting for its alert to finish
  const [pending, setPending] = useState<PendingShot | null>(null)
  const pendingRef = useRef<PendingShot | null>(null)

  const currentRef = useRef<ShotRound>(current)
  const lastShotRef = useRef(initial.shot?.name) // avoid the same shot twice in a row
  const expiresAtRef = useRef(
    startsPaused ? Date.now() + initial.pausedRemainingMs! : initial.expiresAt,
  )
  const remainingRef = useRef<number | null>(initial.pausedRemainingMs)

  const { minutes, seconds, pause, restart } = useTimer({
    expiryTimestamp: new Date(expiresAtRef.current),
    autoStart: !startsPaused,
    // the timer stops itself right after onExpire, so act on the next tick
    onExpire: () => {
      setTimeout(drawRound, 0)
    },
  })

  // Saves the round as it is right now (after a pause or resume)
  function persist() {
    saveShotRotation({
      shotName: currentRef.current.shot?.name ?? null,
      expiresAt: expiresAtRef.current,
      pausedRemainingMs: remainingRef.current,
    })
  }

  // Applies a round and restarts the countdown
  function commit(next: ShotRound) {
    const expiresAt = saveNewRound(next, durationSec)
    if (next.shot) lastShotRef.current = next.shot.name
    currentRef.current = next
    expiresAtRef.current = expiresAt
    remainingRef.current = null

    setCurrent(next)
    setRound((r) => r + 1)
    restart(new Date(expiresAt))
  }

  // End of a round: SHOT_CHANCE to pick a shooter
  function drawRound() {
    if (pendingRef.current) return
    if (Math.random() < SHOT_CHANCE) {
      const next = pickShot(shots, lastShotRef.current)
      pendingRef.current = next
      setPending(next) // the page plays the alert, then calls finishShot
    } else {
      commit({ shot: null }) // nothing picked: no alert, a new round starts
    }
  }

  // Menu "Prochain shooter": ends the current round now and draws again,
  // with the same SHOT_CHANCE as the automatic draw
  function skipShot() {
    if (pendingRef.current) return
    pause()
    drawRound()
  }

  // Called by the page once the alert is done
  function finishShot() {
    const next = pendingRef.current
    if (!next) return
    pendingRef.current = null
    setPending(null)
    commit(next)
  }

  // Pause: remember how much time was left (not while an alert is playing)
  function pauseTimer() {
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

  return {
    shot: current.shot,
    round,
    minutes,
    seconds,
    pending,
    pause: pauseTimer,
    resume: resumeTimer,
    skipShot,
    finishShot,
  }
}
