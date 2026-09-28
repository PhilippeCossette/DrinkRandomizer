import { IconArrowDownRight } from '@tabler/icons-react'
import { formatPercent } from '#/lib/format'
import type { TransitionData } from './makeTransitionData'

// Enough items to be wider than any screen, so the end never shows
const MIN_ITEMS = 40

// Ticker tape on the transition screen. LayerTransition slides .tape-track by
// TAPE_TRAVEL; the track is much longer than screen + travel, so the end never shows.
export default function TransitionTape({ tape }: { tape: TransitionData['tape'] }) {
  const repeat = Math.max(1, Math.ceil(MIN_ITEMS / tape.length))
  const group = Array.from({ length: repeat }, () => tape).flat()

  return (
    <div
      className="tape hud absolute inset-x-0 bottom-0 flex h-tape items-center overflow-hidden border-t border-line bg-surface"
      style={{ opacity: 0 }}
    >
      <div className="tape-track flex w-max gap-10 whitespace-nowrap text-body">
        {group.map(({ ticker, change }, i) => (
          <span key={i} className="flex gap-2">
            <span className="font-medium text-ink-soft">{ticker}</span>
            <span className="flex items-center gap-1 tabular-nums text-danger">
              <IconArrowDownRight size="1em" stroke={2.5} />
              {formatPercent(change)}
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
