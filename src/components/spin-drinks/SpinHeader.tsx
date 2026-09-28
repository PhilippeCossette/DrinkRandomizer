// Title above the reel; the subtitle names the winner when it lands.

import { IconArrowDownRight, IconAlertTriangle } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import Badge from '#/components/ui/Badge'
import { ease } from '#/lib/easing'

type Props = {
  visible: boolean
  landed: boolean
  winnerName: string
}

export default function SpinHeader({ visible, landed, winnerName }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease }}
      className="flex flex-col items-center gap-4 text-center"
    >
      <Badge tone="danger" icon={IconAlertTriangle}>
        Alerte marché
      </Badge>
      <h2 className="text-[min(var(--text-display),14vw)] leading-none font-semibold tracking-tight text-ink">
        Crash boursier
      </h2>

      {/* subtitle swaps when the reel lands */}
      <div className="h-[1.5em] text-subheading">
        <AnimatePresence mode="wait">
          <motion.p
            key={landed ? 'result' : 'waiting'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease }}
            className="px-4 text-subheading text-ink-soft"
          >
            {landed ? (
              <>
                <span className="font-semibold text-ink">{winnerName}</span>{' '}
                s'effondre{' '}
                <IconArrowDownRight className="inline-block h-[1em] w-[1em] align-[-0.12em] text-danger" stroke={2.5} />
              </>
            ) : (
              'Une boisson est en chute libre… laquelle?'
            )}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
