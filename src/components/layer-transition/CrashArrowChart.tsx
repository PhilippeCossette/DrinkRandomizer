import { CHART_POINTS, CLIP_HIDDEN } from './constants'

// Chart grid + red crash line. Animated by LayerTransition through
// the .chart-grid and .arrow class names.
export default function CrashArrowChart() {
  return (
    <div className="relative w-[min(70vw,34rem)]">
      <svg
        viewBox="0 0 400 220"
        className="chart-grid hud absolute inset-0 h-full w-full"
        style={{ opacity: 0 }}
      >
        {[20, 70, 120, 170, 210].map((y) => (
          <line
            key={y}
            x1="0"
            x2="400"
            y1={y}
            y2={y}
            className="stroke-line"
            strokeDasharray="4 6"
          />
        ))}
      </svg>

      <div className="arrow relative" style={{ opacity: 0, clipPath: CLIP_HIDDEN }}>
        <svg viewBox="0 0 400 220" className="block h-auto w-full">
          {/* glow: wide faint line behind */}
          <polyline
            points={CHART_POINTS}
            fill="none"
            className="stroke-danger/20"
            strokeWidth={16}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={CHART_POINTS}
            fill="none"
            className="stroke-danger"
            strokeWidth={5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <g transform="translate(330 190) rotate(56)">
            <polygon points="12,0 -10,-12 -10,12" className="fill-danger" />
          </g>
        </svg>
      </div>
    </div>
  )
}
