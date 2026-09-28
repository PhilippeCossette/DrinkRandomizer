import { GRID_H, GRID_W } from './constants'

// Very faint chart grid covering the whole page
export default function MarketGrid() {
  return (
    <svg
      viewBox={`0 0 ${GRID_W} ${GRID_H}`}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-60"
      aria-hidden
    >
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={`h${i}`}
          x1={0}
          x2={GRID_W}
          y1={i * 60}
          y2={i * 60}
          className="stroke-line"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={`v${i}`}
          x1={i * 100}
          x2={i * 100}
          y1={0}
          y2={GRID_H}
          className="stroke-line"
          strokeWidth={1}
          strokeDasharray="2 6"
        />
      ))}
    </svg>
  )
}
