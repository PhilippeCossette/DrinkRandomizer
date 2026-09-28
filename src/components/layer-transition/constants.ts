// Crash alert: panel colors, timeline (seconds) and fake market data.

export type TransitionPhase = 'idle' | 'cover' | 'reveal'

// Panels, bottom to top (the last one carries the content when sliding out)
export const LAYERS = ['bg-red-900', 'bg-red-600', 'bg-page']

// Arrow reveal: hidden = clipped from the right, shown = no clip
export const CLIP_HIDDEN = 'inset(0% 100% 0% 0%)'
export const CLIP_SHOWN = 'inset(0% 0% 0% 0%)'

// Timeline (seconds from the start of reveal)
export const LABEL_DURATION = 0.7
export const FIGURE_START = 0.45
export const FIGURE_DURATION = 0.9
export const COUNT_DURATION = 2.0 // number keeps counting down while the chart draws
export const GRID_START = 0.4
export const STATS_START = 0.8
export const DRAW_START = 1.1
export const DRAW_DURATION = 1.4
export const DRAW_END = DRAW_START + DRAW_DURATION
const HOLD = 1.0 // time to read before sliding out
export const SLIDE_START = DRAW_END + HOLD
export const SLIDE_DURATION = 0.9

export const CHART_POINTS =
  '10,40 70,30 110,50 150,35 190,60 220,55 260,140 290,130 326,184'

export const TICKERS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'TSLA',
  'AMZN',
  'META',
  'GOOGL',
  'JPM',
  'NFLX',
  'AMD',
]

// How far the transition's ticker tape scrolls while it's on screen
export const TAPE_TRAVEL = '-40rem'
