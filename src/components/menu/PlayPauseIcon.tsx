import { IconPlayerPauseFilled, IconPlayerPlayFilled } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'

// Swaps between the pause and play icons with a small slide
export default function PlayPauseIcon({ isRunning }: { isRunning: boolean }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        className="block"
        key={isRunning ? 'pause' : 'play'}
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {isRunning ? <IconPlayerPauseFilled size="1.2rem" /> : <IconPlayerPlayFilled size="1.2rem" />}
      </motion.span>
    </AnimatePresence>
  )
}
