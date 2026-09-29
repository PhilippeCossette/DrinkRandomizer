// What's written on the La Grande Dépression intro panel.
// Class names (.d-badge, .d-word-1, .d-item...) are targets for DepressionTransition.

import { IconAlertTriangle, IconArrowDown } from '@tabler/icons-react'
import { motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import Badge from '#/components/ui/Badge'
import { formatPrice } from '#/lib/format'
import type { Drink } from '#/schema/drinks'
import { CLIP_HIDDEN } from '#/components/layer-transition/constants'
import { LINE_POINTS } from './constants'

type Props = {
  items: Drink[] // every drink and shot
  indexText: MotionValue<string> // market counter (%)
}

const hidden = { opacity: 0 } // everything starts invisible; the timeline shows it

export default function DepressionContent({ items, indexText }: Props) {
  return (
    <div className="d-content absolute inset-0 overflow-hidden will-change-transform">
      {/* red glow pulsing from the edges */}
      <div
        className="d-vignette absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(220_38_38/0.35)_100%)]"
        style={hidden}
      />

      {/* giant crash line behind everything (revealed left to right) */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        className="d-line absolute inset-0 h-full w-full"
        style={{ opacity: 0, clipPath: CLIP_HIDDEN }}
        aria-hidden
      >
        <polyline
          points={LINE_POINTS}
          fill="none"
          stroke="rgb(220 38 38 / 0.35)"
          strokeWidth={10}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* everything shakes together on the impacts */}
      <div className="d-shake relative flex will-change-transform h-full flex-col items-center justify-center gap-[3vh] px-6 text-center">
        <div className="d-badge" style={hidden}>
          <Badge tone="danger" icon={IconAlertTriangle} className="text-body">
            Crash historique · une seule fois ce soir
          </Badge>
        </div>

        {/* title: two words that slam in */}
        <h2 className="flex flex-col items-center font-black uppercase leading-[0.9] tracking-tight">
          <span
            className="d-word-1 block will-change-transform text-[min(6rem,11vw)] text-white"
            style={hidden}
          >
            La Grande
          </span>
          <span
            className="d-word-2 block will-change-transform text-[min(10rem,15vw)] text-red-500 [text-shadow:0_0_0.35em_rgb(239_68_68/0.55)]"
            style={hidden}
          >
            Dépression
          </span>
        </h2>

        {/* market counter: the % falling */}
        <div
          className="d-index flex items-baseline tabular-nums"
          style={hidden}
        >
          <span className="flex items-center text-[min(4rem,9vw)] font-bold leading-none text-red-500">
            <IconArrowDown size="0.8em" stroke={3} />
            <motion.span>{indexText}</motion.span>
          </span>
        </div>

        <p
          className="d-sub text-[min(1.9rem,5vw)] font-semibold text-white"
          style={hidden}
        >
          Tout le menu est en crash
        </p>

        {/* every drink and shot, falling in */}
        <div className="flex max-w-[70rem] flex-wrap justify-center gap-3">
          {items.map((item) => (
            <span
              key={item.name}
              className="d-item flex items-center gap-2 rounded-full border border-red-500/40 bg-red-950/70 px-4 py-2 text-body"
              style={hidden}
            >
              <span className="font-medium text-white">{item.name}</span>
              <span className="font-bold tabular-nums text-accent">
                {formatPrice(item.salePrice)}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
