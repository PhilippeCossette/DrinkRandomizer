// Popover under the skip button: next drink or next shooter.

import { IconBottle, IconGlass } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { SHOT_CHANCE } from '#/lib/config'
import { ease } from '#/lib/easing'

type Props = {
  busy: boolean // an alert is already playing
  onNextDrink: () => void
  onNextShot: () => void
}

// Small menu under the "next" button: skip the drink or the shot
export default function SkipPopover({ busy, onNextDrink, onNextShot }: Props) {
  const options = [
    { label: 'Prochain verre', hint: 'Lance le tirage', Icon: IconBottle, onClick: onNextDrink },
    {
      label: 'Prochain shooter',
      hint: `1 chance sur ${Math.round(1 / SHOT_CHANCE)}`,
      Icon: IconGlass,
      onClick: onNextShot,
    },
  ]

  return (
    <motion.div
      role="menu"
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.18, ease }}
      className="absolute right-0 top-full mt-3 w-[16rem] origin-top-right overflow-hidden rounded-[1.1rem] border border-line bg-surface p-[0.4rem] shadow-float"
    >
      {options.map(({ label, hint, Icon, onClick }) => (
        <button
          key={label}
          role="menuitem"
          disabled={busy}
          onClick={onClick}
          className="flex w-full items-center gap-3 rounded-[0.8rem] px-3 py-[0.6rem] text-left text-ink transition-colors hover:bg-sunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <span className="grid h-[2.3rem] w-[2.3rem] shrink-0 place-items-center rounded-[0.7rem] bg-accent-soft text-accent-strong">
            <Icon size="1.2rem" />
          </span>
          <span className="flex flex-col">
            <span className="text-body font-medium">{label}</span>
            <span className="text-label text-ink-soft">{busy ? 'Alerte en cours…' : hint}</span>
          </span>
        </button>
      ))}
    </motion.div>
  )
}
