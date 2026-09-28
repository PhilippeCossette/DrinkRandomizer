import {
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
  IconPlayerTrackNextFilled,
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'

interface MenuProps {
  pause: () => void
  resume: () => void
  isRunning: boolean
  nextDrink: () => void
}

export default function Menu({
  pause,
  resume,
  isRunning,
  nextDrink,
}: MenuProps) {
  return (
    <motion.div
      initial="hidden"
      whileHover="visible"
      className="fixed top-0 right-0 w-80 h-20 "
    >
      <motion.div
        variants={{
          hidden: { y: '-100%' },
          visible: { y: 0 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="text-white  h-15 p-2 px-6 flex items-center justify-end gap-6"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="text-black px-4 py-2 bg-white rounded-md overflow-hidden"
          onClick={isRunning ? pause : resume}
        >
          <AnimatePresence mode="wait">
            {isRunning ? (
              <motion.span
                className="block"
                key="pause"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <IconPlayerPauseFilled />
              </motion.span>
            ) : (
              <motion.span
                className="block"
                key="play"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <IconPlayerPlayFilled />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className=" px-4 py-2 border border-white rounded-md overflow-hidden"
          onClick={nextDrink}
        >
          <IconPlayerTrackNextFilled />
        </motion.button>
      </motion.div>
    </motion.div>
  )
}
