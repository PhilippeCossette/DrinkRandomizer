// Length of one drink round, in minutes
export const TIMER_TOTAL_MINUTES = 25

// Shots: a draw happens every SHOT_ROUND_MINUTES,
// and each draw has a SHOT_CHANCE chance of picking a shot
export const SHOT_ROUND_MINUTES = 15
export const SHOT_CHANCE = 1 / 3

// "La Grande Dépression": every drink and shot on sale at once.
// Started from the staff menu. How long it lasts, in minutes
// (its own setting: change it without touching the drink rounds).
export const DEPRESSION_MINUTES = 15

// Sounds (see lib/sounds.ts)
export const SOUNDS_ENABLED = true as boolean // false = no sound at all
export const SOUND_VOLUME = 0.8 // 0 to 1
export const SOUNDS: Record<
  'alert' | 'spin' | 'select' | 'depression',
  boolean
> = {
  alert: true, // siren when a drink or shot crashes
  spin: true, // tick each time a card passes the marker
  select: true, // chime when the reel stops on the winner
  depression: true, // La Grande Dépression: crash sound at the start, recovery sound at the end
}
