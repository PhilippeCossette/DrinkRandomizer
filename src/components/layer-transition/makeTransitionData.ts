import { rand } from '#/lib/random'
import { TICKERS } from './constants'

// Random market data, regenerated for every transition
export function makeTransitionData() {
  return {
    figure: -rand(8, 35),
    indices: [
      { name: 'S&P 500', change: -rand(3, 12) },
      { name: 'NASDAQ', change: -rand(4, 15) },
      { name: 'DOW', change: -rand(2, 10) },
    ],
    tape: TICKERS.map((ticker) => ({ ticker, change: -rand(1, 20) })),
  }
}

export type TransitionData = ReturnType<typeof makeTransitionData>
