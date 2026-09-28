// Background alerts and ticker settings.

export const BLIP_OPACITY = 0.75 // max opacity of an alert
export const DOWN_CHANCE = 0.8 // 80% of alerts are drops

// Three alerts, out of sync, so there's usually one on screen
export const BLIPS = [
  { delay: 1, duration: 9 },
  { delay: 4, duration: 11 },
  { delay: 7, duration: 10 },
]

// SVG coordinate space for the grid (scaled to cover the screen)
export const GRID_W = 1000
export const GRID_H = 600

// Ticker tape
export const TAPE_MIN_ITEMS = 20 // enough to be wider than any screen
export const TAPE_SECONDS_PER_ITEM = 2.5 // speed: lower is faster
