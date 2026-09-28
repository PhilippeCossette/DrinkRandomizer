import { IconAlertTriangle, IconClockPlay, IconClockX, IconFlame } from '@tabler/icons-react'
import type { BadgeTone } from '#/components/ui/Badge'

// The countdown's states: label, badge color, icon, and the digits' color
// (full class names, so Tailwind can find them)
const TIMER_STATES = {
  calm: { label: 'En cours', tone: 'success' as BadgeTone, icon: IconClockPlay, text: 'text-success' },
  hurry: { label: 'Dépêchez-vous', tone: 'warning' as BadgeTone, icon: IconAlertTriangle, text: 'text-warning' },
  urgent: { label: 'Dernière chance', tone: 'danger' as BadgeTone, icon: IconFlame, text: 'text-danger' },
  done: { label: 'Terminé', tone: 'danger' as BadgeTone, icon: IconClockX, text: 'text-danger' },
}

export type TimerState = (typeof TIMER_STATES)[keyof typeof TIMER_STATES]

export function getTimerState(remainingSeconds: number, ratio: number): TimerState {
  if (remainingSeconds <= 0) return TIMER_STATES.done
  if (ratio <= 0.2) return TIMER_STATES.urgent // last 20% (5 min out of 25)
  if (ratio <= 0.4) return TIMER_STATES.hurry // last 40% (10 min out of 25)
  return TIMER_STATES.calm
}
