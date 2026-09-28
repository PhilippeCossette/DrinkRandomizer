// Shooter card footer: label, progress bar and countdown.

import { SHOT_ROUND_MINUTES } from '#/lib/config'
import { pad } from '#/lib/format'
import CardLabel from '#/components/ui/CardLabel'

type Props = {
  label: string
  minutes: number
  seconds: number
  barClassName: string // e.g. "bg-danger"
}

// Footer of the shot card: label, progress bar and countdown.
// Plain text digits (no rolling animation) so it stays light and nothing gets clipped.
export default function ShotTimer({ label, minutes, seconds, barClassName }: Props) {
  const ratio = Math.max(0, Math.min(1, (minutes * 60 + seconds) / (SHOT_ROUND_MINUTES * 60)))

  return (
    <div className="flex shrink-0 items-center gap-4 border-t border-line px-tile py-[0.9rem]">
      <CardLabel className="shrink-0">{label}</CardLabel>

      <div className="h-[0.35rem] flex-1 overflow-hidden rounded-full bg-neutral-soft">
        {/* CSS transition: runs on the GPU, no per-frame JavaScript */}
        <div
          className={`h-full origin-left rounded-full transition-transform duration-1000 ease-linear ${barClassName}`}
          style={{ transform: `scaleX(${ratio})` }}
        />
      </div>

      <span
        className="shrink-0 font-digital text-subheading leading-none tabular-nums text-ink"
        aria-label={`${minutes} minutes ${seconds} secondes`}
      >
        {pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  )
}
