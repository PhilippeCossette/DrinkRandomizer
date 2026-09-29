// "La Grande Dépression": the one-time event where every drink and shot is on
// sale. This hook owns its countdown, pause/resume and saving; the page decides
// what happens around it (pausing the normal rounds, the intro and outro scenes,
// restarting the normal rounds).

import { useEffect, useRef, useState } from 'react'
import { useTimer } from 'react-timer-hook'
import {
  clearDepression,
  loadDepression,
  saveDepression,
} from '#/lib/depressionStorage'

type Callbacks = {
  onTimeUp: () => void // the countdown reached zero (the page plays the outro, then calls end)
  onEndedWhileClosed: () => void // it ended while the page was closed: just go back to normal
}

// durationSec: length of the event
export function useDepression(
  durationSec: number,
  { onTimeUp, onEndedWhileClosed }: Callbacks,
) {
  const [initial] = useState(loadDepression)
  const startsActive = initial.status === 'active'
  const startsPaused = startsActive && initial.pausedRemainingMs !== null

  const [active, setActive] = useState(startsActive)
  const activeRef = useRef(startsActive)

  // refs: always hold the latest values, even inside the timer's callback
  const endsAtRef = useRef(
    !startsActive
      ? Date.now() + durationSec * 1000
      : initial.pausedRemainingMs !== null
        ? Date.now() + initial.pausedRemainingMs
        : initial.endsAt,
  )
  const remainingRef = useRef<number | null>(
    startsPaused ? initial.pausedRemainingMs : null,
  )
  // latest callbacks (the timer keeps the one it was created with)
  const callbacksRef = useRef({ onTimeUp, onEndedWhileClosed })
  useEffect(() => {
    callbacksRef.current = { onTimeUp, onEndedWhileClosed }
  })

  const { minutes, seconds, isRunning, pause, restart } = useTimer({
    expiryTimestamp: new Date(endsAtRef.current),
    autoStart: startsActive && !startsPaused,
    onExpire: () => {
      if (activeRef.current) callbacksRef.current.onTimeUp()
    },
  })

  // The event ended while the page was closed: clean up and go back to normal
  useEffect(() => {
    if (initial.status === 'ended') {
      clearDepression()
      callbacksRef.current.onEndedWhileClosed()
    }
  }, [initial.status])

  function persist() {
    saveDepression({
      endsAt: endsAtRef.current,
      pausedRemainingMs: remainingRef.current,
    })
  }

  // Starts the event now, for the full duration
  function start() {
    if (activeRef.current) return
    endsAtRef.current = Date.now() + durationSec * 1000
    remainingRef.current = null
    activeRef.current = true
    setActive(true)
    persist()
    restart(new Date(endsAtRef.current))
  }

  // Ends the event right away (the page calls it once the outro covers the screen)
  function end() {
    if (!activeRef.current) return
    activeRef.current = false
    remainingRef.current = null
    setActive(false)
    pause()
    clearDepression()
  }

  // The outro has started (time up, or stopped early): freeze the countdown and
  // save the event as over, so a refresh during the outro doesn't bring it back.
  // end() then closes it for good once the outro covers the screen.
  function markEnding() {
    if (!activeRef.current) return
    pause()
    endsAtRef.current = Date.now()
    remainingRef.current = null
    persist()
  }

  // Pause: remember how much time was left
  function pauseTimer() {
    if (!activeRef.current || remainingRef.current !== null) return
    remainingRef.current = Math.max(0, endsAtRef.current - Date.now())
    pause()
    persist()
  }

  // Resume: the event ends "now + the time that was left"
  function resumeTimer() {
    if (!activeRef.current || remainingRef.current === null) return
    endsAtRef.current = Date.now() + remainingRef.current
    remainingRef.current = null
    persist()
    restart(new Date(endsAtRef.current))
  }

  return {
    active,
    minutes,
    seconds,
    isRunning,
    start,
    end,
    markEnding,
    pause: pauseTimer,
    resume: resumeTimer,
  }
}
