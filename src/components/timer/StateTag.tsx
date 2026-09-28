import { AnimatePresence, motion } from 'motion/react'
import Badge from '#/components/ui/Badge'
import type { TimerState } from './timerState'

// "En cours" / "Dernière chance" badge with its icon
export default function StateTag({ state }: { state: TimerState }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={state.label}
        className="inline-flex"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 26 }}
      >
        <Badge tone={state.tone} icon={state.icon}>
          {state.label}
        </Badge>
      </motion.span>
    </AnimatePresence>
  )
}
