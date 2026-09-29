// Popover under the "Grande Dépression" button: a confirmation before
// launching (it only happens once a night) or stopping the event early.

import { IconAlertTriangle, IconTrendingDown } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { DEPRESSION_MINUTES } from '#/lib/config'
import { ease } from '#/lib/easing'

type Props = {
  active: boolean // the event is running
  busy: boolean // an alert is playing, can't launch right now
  onConfirm: () => void
}

export default function DepressionPopover({ active, busy, onConfirm }: Props) {
  return (
    <motion.div
      role="dialog"
      aria-label="La Grande Dépression"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease }}
      className="absolute right-0 top-full mt-3 flex w-[18rem] origin-top-right flex-col gap-3 rounded-[1.1rem] border border-line bg-surface p-4 shadow-float"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-[2.3rem] w-[2.3rem] shrink-0 place-items-center rounded-[0.7rem] bg-danger-soft text-danger">
          <IconTrendingDown size="1.3rem" stroke={2.25} />
        </span>
        <span className="text-body font-semibold text-ink">
          La Grande Dépression
        </span>
      </div>

      <p className="text-label text-ink-soft">
        {active
          ? 'Tout le menu est en crash. Arrêter maintenant relance les tours normaux.'
          : `Tous les verres et shooters en crash pendant ${DEPRESSION_MINUTES} min. Les minuteries en cours sont annulées.`}
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={onConfirm}
        className={`flex items-center justify-center gap-2 rounded-[0.8rem] px-3 py-[0.65rem] text-body font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
          active
            ? 'border border-line bg-sunken text-ink hover:bg-neutral-soft'
            : 'bg-danger text-white hover:brightness-110'
        }`}
      >
        {!active && <IconAlertTriangle size="1.1rem" stroke={2.25} />}
        {busy ? 'Alerte en cours…' : active ? 'Arrêter' : 'Lancer le crash'}
      </button>
    </motion.div>
  )
}
