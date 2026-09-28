import { pick } from '#/lib/random'
import type { Drink } from '#/schema/drinks'
import { REEL_LENGTH, WINNER_INDEX } from './constants'

// Random strip of drinks, with the winner at a fixed position
export function buildReel(drinks: Drink[], winner: Drink) {
  return Array.from({ length: REEL_LENGTH }, (_, i) =>
    i === WINNER_INDEX ? winner : pick(drinks),
  )
}
