// Staff menu in the top-right corner (pause/play, skip, mute).

import { IconPlayerTrackNextFilled, IconVolume, IconVolumeOff } from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import IconButton from '#/components/ui/IconButton'
import { isMuted, setMuted } from '#/lib/sounds'
import PlayPauseIcon from './PlayPauseIcon'
import SkipPopover from './SkipPopover'

interface MenuProps {
  pause: () => void
  resume: () => void
  isRunning: boolean
  nextDrink: () => void
  nextShot: () => void
  busy: boolean // an alert is playing, skipping is disabled
}

// Staff controls in the top-right corner: pause/play, skip, mute.
// They slide down when the corner is hovered with a mouse, and are always
// visible on phones and tablets (they can't hover).
export default function Menu({ pause, resume, isRunning, nextDrink, nextShot, busy }: MenuProps) {
  const [open, setOpen] = useState(false) // skip popover
  const [muted, setMutedState] = useState(isMuted)
  const [touch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches,
  )
  const skipRef = useRef<HTMLDivElement>(null)

  // close the popover when clicking anywhere else
  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (!skipRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(action: () => void) {
    action()
    setOpen(false)
  }

  function toggleMute() {
    setMuted(!muted)
    setMutedState(!muted)
  }

  return (
    <motion.div
      initial="hidden"
      whileHover="visible"
      animate={open || touch ? 'visible' : 'hidden'}
      onHoverEnd={() => setOpen(false)}
      // invisible hover zone in the corner; the buttons slide down into it
      className="fixed top-0 right-0 z-40 flex h-[6rem] w-[16rem] max-w-full justify-end p-bento"
    >
      <motion.div
        variants={{ hidden: { y: '-200%', opacity: 0 }, visible: { y: 0, opacity: 1 } }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="flex h-fit items-center gap-2 rounded-full border border-line bg-surface p-[0.3rem] shadow-float"
      >
        <IconButton
          variant="solid"
          label={isRunning ? 'Pause' : 'Reprendre'}
          onClick={isRunning ? pause : resume}
        >
          <PlayPauseIcon isRunning={isRunning} />
        </IconButton>

        <div ref={skipRef} className="relative">
          <IconButton
            label="Passer"
            active={open}
            onClick={() => setOpen((o) => !o)}
            ariaProps={{ 'aria-haspopup': 'menu', 'aria-expanded': open }}
          >
            <IconPlayerTrackNextFilled size="1.2rem" />
          </IconButton>

          <AnimatePresence>
            {open && (
              <SkipPopover
                busy={busy}
                onNextDrink={() => choose(nextDrink)}
                onNextShot={() => choose(nextShot)}
              />
            )}
          </AnimatePresence>
        </div>

        <IconButton
          label={muted ? 'Activer le son' : 'Couper le son'}
          onClick={toggleMute}
          ariaProps={{ 'aria-pressed': muted }}
        >
          {muted ? (
            <IconVolumeOff size="1.2rem" className="text-danger" />
          ) : (
            <IconVolume size="1.2rem" />
          )}
        </IconButton>
      </motion.div>
    </motion.div>
  )
}
