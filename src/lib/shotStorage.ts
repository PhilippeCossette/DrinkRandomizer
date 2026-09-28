// Saves/loads the shooter round in localStorage (survives a refresh).

import type { Drink } from '#/schema/drinks'

const STORAGE_KEY = 'shotTimer' // localStorage key

type SavedShotState = {
  shotName: string | null // null = no shot this round
  expiresAt: number // ms, when the round ends (if running)
  pausedRemainingMs: number | null // ms left when paused, null when running
}

// Saves the current round (errors are logged, never thrown: the screen keeps running)
export function saveShotRotation(state: SavedShotState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save shot rotation state:', error)
  }
}

// Reads the saved round. Returns null when there's nothing usable
// (nothing saved, the shot was removed from shots.json, or the round already ended).
export function loadShotRotation(shots: Drink[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const saved = JSON.parse(raw) as SavedShotState
    const shot =
      saved.shotName === null
        ? null
        : shots.find((s) => s.name === saved.shotName)

    // saved shot no longer exists in shots.json
    if (shot === undefined) return null

    const pausedRemainingMs = saved.pausedRemainingMs ?? null
    // a running round that already ended is useless; a paused one is still valid
    if (pausedRemainingMs === null && saved.expiresAt <= Date.now()) return null

    return {
      shot,
      expiresAt: saved.expiresAt,
      pausedRemainingMs,
    }
  } catch (error) {
    console.error('Failed to load shot rotation state:', error)
    return null
  }
}
