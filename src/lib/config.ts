// Length of one drink round, in minutes
export const TIMER_TOTAL_MINUTES = 20

// Shots: a draw happens every SHOT_ROUND_MINUTES,
// and each draw has a SHOT_CHANCE chance of picking a shot
export const SHOT_ROUND_MINUTES = 15
export const SHOT_CHANCE = 1 / 5

// Sounds (see lib/sounds.ts)
export const SOUNDS_ENABLED = true as boolean // false = no sound at all
export const SOUND_VOLUME = 0.8 // 0 to 1
export const SOUNDS: Record<'alert' | 'spin' | 'select', boolean> = {
  alert: true, // siren when a drink or shot crashes
  spin: true, // tick each time a card passes the marker
  select: true, // chime when the reel stops on the winner
}
