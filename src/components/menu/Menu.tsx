// Staff menu in the top-right corner (pause/play, skip, mute, Grande Dépression).

import {
  IconPlayerTrackNextFilled,
  IconTrendingDown,
  IconVolume,
  IconVolumeOff,
} from '@tabler/icons-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import IconButton from '#/components/ui/IconButton'
import { isMuted, setMuted } from '#/lib/sounds'
import DepressionPopover from './DepressionPopover'
import PlayPauseIcon from './PlayPauseIcon'
import SkipPopover from './SkipPopover'

interface MenuProps {
  pause: () => void
  resume: () => void
  isRunning: boolean
  nextDrink: () => void
  nextShot: () => void
  busy: boolean // an alert is playing, skipping and launching are disabled
  pauseDisabled: boolean // a La Grande Dépression scene is playing: no pausing mid-scene
  depressionActive: boolean // La Grande Dépression is running
  toggleDepression: () => void // launch it, or stop it early
}

type Popover = 'skip' | 'depression' | null

// Staff controls in the top-right corner: pause/play, skip, mute, Grande Dépression.
// They slide down when the corner is hovered with a mouse, and are always
// visible on phones and tablets (they can't hover).
export default function Menu({
  pause,
  resume,
  isRunning,
  nextDrink,
  nextShot,
  busy,
  pauseDisabled,
  depressionActive,
  toggleDepression,
}: MenuProps) {
  const [open, setOpen] = useState<Popover>(null)
  const [muted, setMutedState] = useState(isMuted)
  const [touch] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none)').matches,
  )
  const skipRef = useRef<HTMLDivElement>(null)
  const depressionRef = useRef<HTMLDivElement>(null)

  // close the popover when clicking anywhere else
  useEffect(() => {
    if (!open) return
    const ref = open === 'skip' ? skipRef : depressionRef
    function onPointerDown(e: PointerEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(null)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function choose(action: () => void) {
    action()
    setOpen(null)
  }

  function toggle(popover: Exclude<Popover, null>) {
    setOpen((o) => (o === popover ? null : popover))
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
      onHoverEnd={() => setOpen(null)}
      // invisible hover zone in the corner; the buttons slide down into it
      className="fixed top-0 right-0 z-40 flex h-[6rem] w-[20rem] max-w-full justify-end p-bento"
    >
      <motion.div
        variants={{
          hidden: { y: '-200%', opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="flex h-fit items-center gap-2 rounded-full border border-line bg-surface p-[0.3rem] shadow-float"
      >
        <IconButton
          variant="solid"
          label={isRunning ? 'Pause' : 'Reprendre'}
          onClick={isRunning ? pause : resume}
          disabled={pauseDisabled}
        >
          <PlayPauseIcon isRunning={isRunning} />
        </IconButton>

        {/* skipping makes no sense while everything is on sale */}
        {!depressionActive && (
          <div ref={skipRef} className="relative">
            <IconButton
              label="Passer"
              active={open === 'skip'}
              onClick={() => toggle('skip')}
              ariaProps={{
                'aria-haspopup': 'menu',
                'aria-expanded': open === 'skip',
              }}
            >
              <IconPlayerTrackNextFilled size="1.2rem" />
            </IconButton>

            <AnimatePresence>
              {open === 'skip' && (
                <SkipPopover
                  busy={busy}
                  onNextDrink={() => choose(nextDrink)}
                  onNextShot={() => choose(nextShot)}
                />
              )}
            </AnimatePresence>
          </div>
        )}

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

        {/* La Grande Dépression: red button, filled while the event is running */}
        <div ref={depressionRef} className="relative">
          <IconButton
            label="La Grande Dépression"
            variant={depressionActive ? 'danger' : 'outline'}
            active={open === 'depression'}
            onClick={() => toggle('depression')}
            ariaProps={{
              'aria-haspopup': 'dialog',
              'aria-expanded': open === 'depression',
              'aria-pressed': depressionActive,
            }}
          >
            <IconTrendingDown
              size="1.25rem"
              stroke={2.25}
              className={depressionActive ? undefined : 'text-danger'}
            />
          </IconButton>

          <AnimatePresence>
            {open === 'depression' && (
              <DepressionPopover
                active={depressionActive}
                busy={busy}
                onConfirm={() => choose(toggleDepression)}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
