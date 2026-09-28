// Shared easing curves, so every animation feels like the same system
export const ease = [0.22, 1, 0.36, 1] as const // smooth ease-out
export const easeOut = [0.16, 1, 0.3, 1] as const // text entrances, counters
export const easeInOut = [0.76, 0, 0.24, 1] as const // panels, reel slide
export const drawEase = [0.65, 0, 0.35, 1] as const // chart line drawing
export const crashEase = [0.55, 0, 0.95, 0.35] as const // slow start, then plunges
export const spinEase = [0.12, 0.8, 0.2, 1] as const // reel: fast start, long slow-down
