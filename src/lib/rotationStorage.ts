// Saves/loads the drink round in localStorage (survives a refresh).

import type { Drink } from '#/schema/drinks'
import { pickRandomDrink } from './drinkPicker'

const STORAGE_KEY = 'drinkTimer' // localStorage key

type SavedState = {
  drinkName: string
  expiresAt: number // ms, when the round ends (if running)
  pausedRemainingMs: number | null // ms left when paused, null when running
}

// Saves the current round (errors are logged, never thrown: the screen keeps running)
export function saveRotation(state: SavedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save drink rotation state:', error)
  }
}

// Reads the saved round. Returns null when there's nothing usable
// (nothing saved, the drink was removed from drinks.json, or the round already ended).
export function loadRotation(drinkList: Drink[]) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const saved = JSON.parse(raw) as SavedState
    const drink = drinkList.find((d) => d.name === saved.drinkName)
    if (!drink) return null

    const pausedRemainingMs = saved.pausedRemainingMs ?? null
    // a running round that already ended is useless; a paused one is still valid
    if (pausedRemainingMs === null && saved.expiresAt <= Date.now()) return null

    return {
      drink,
      expiresAt: saved.expiresAt,
      pausedRemainingMs,
    }
  } catch (error) {
    console.error('Failed to load drink rotation state:', error)
    return null
  }
}

// Picks a new drink, saves it and returns the new round
export function startNewRotation(
  drinks: Drink[],
  durationSec: number,
  previousDrink?: string,
) {
  const drink = pickRandomDrink(drinks, previousDrink)
  const expiresAt = Date.now() + durationSec * 1000
  saveRotation({
    drinkName: drink.name,
    expiresAt,
    pausedRemainingMs: null,
  })
  return { drink, expiresAt, pausedRemainingMs: null as number | null }
}
