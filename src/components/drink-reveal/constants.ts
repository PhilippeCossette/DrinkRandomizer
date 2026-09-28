// Drink card timing (seconds) and the chart's shape.

import { smoothPath  } from '#/lib/smoothPath'
import type {Point} from '#/lib/smoothPath';

// Timing (seconds after the card appears)
export const GRID_DELAY = 0.1
export const CHART_DELAY = 0.5
export const CHART_DURATION = 1.6
export const PRICE_DELAY = 1.3 // price line is fully visible here
export const COUNT_DURATION = 1.6 // regular price -> sale price
export const STRIKE_DELAY = PRICE_DELAY // strike the old price as the count starts
export const CHIP_DELAY = PRICE_DELAY + COUNT_DURATION - 0.2

// Chart in a 400x300 box (same 4:3 ratio as the image area)
export const VIEW_W = 400
export const VIEW_H = 300
const POINTS: Point[] = [
  [0, 78],
  [44, 70],
  [84, 92],
  [124, 82],
  [164, 128],
  [202, 116],
  [240, 176],
  [276, 166],
  [314, 226],
]
export const START = POINTS[0]
export const TIP = POINTS[POINTS.length - 1]

export const LINE = smoothPath(POINTS)
export const AREA = `${LINE} L${TIP[0]} ${VIEW_H} L${START[0]} ${VIEW_H} Z`
