// What's written on the panel when La Grande Dépression ends: the market
// recovers. Class names (.o-badge, .o-word-1...) are targets for DepressionTransition.

import { IconArrowUp, IconTrendingUp } from '@tabler/icons-react'
import { motion } from 'motion/react'
import type { MotionValue } from 'motion/react'
import { CLIP_HIDDEN } from '#/components/layer-transition/constants'
import { RISE_POINTS } from './constants'

type Props = {
  indexText: MotionValue<string> // market counter (%)
  indexColor: MotionValue<string> // red while negative, green once it's back up
}

const hidden = { opacity: 0 } // everything starts invisible; the timeline shows it

export default function DepressionOutroContent({
  indexText,
  indexColor,
}: Props) {
  return (
    <div className="o-content absolute inset-0 overflow-hidden will-change-transform">
      {/* soft green light rising from the bottom */}
      <div
        className="o-glow absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgb(16_185_129/0.28),transparent_65%)]"
        style={hidden}
      />

      {/* big recovery line behind everything (revealed left to right) */}
      <svg
        viewBox="0 0 1000 600"
        preserveAspectRatio="none"
        className="o-line absolute inset-0 h-full w-full"
        style={{ opacity: 0, clipPath: CLIP_HIDDEN }}
        aria-hidden
      >
        <polyline
          points={RISE_POINTS}
          fill="none"
          stroke="rgb(16 185 129 / 0.35)"
          strokeWidth={10}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div className="relative flex h-full flex-col items-center justify-center gap-[3vh] px-6 text-center">
        <div
          className="o-badge inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-emerald-500/15 px-[0.7em] py-[0.35em] text-body font-medium text-emerald-400"
          style={hidden}
        >
          <IconTrendingUp size="1.1em" stroke={2} />
          Fin de La Grande Dépression
        </div>

        {/* title: two words that rise into place */}
        <h2 className="flex flex-col items-center font-black uppercase leading-[0.9] tracking-tight">
          <span
            className="o-word-1 block text-[min(6rem,11vw)] text-white will-change-transform"
            style={hidden}
          >
            Le marché
          </span>
          <span
            className="o-word-2 block text-[min(10rem,15vw)] text-emerald-400 will-change-transform [text-shadow:0_0_0.35em_rgb(16_185_129/0.5)]"
            style={hidden}
          >
            se relève
          </span>
        </h2>

        {/* market counter: the % climbing back */}
        <div
          className="o-index flex items-baseline tabular-nums"
          style={hidden}
        >
          <motion.span
            className="flex items-center text-[min(4rem,9vw)] font-bold leading-none"
            style={{ color: indexColor }}
          >
            <IconArrowUp size="0.8em" stroke={3} />
            <motion.span>{indexText}</motion.span>
          </motion.span>
        </div>

        <p
          className="o-sub text-[min(1.9rem,5vw)] font-semibold text-white"
          style={hidden}
        >
          Retour aux prix normaux
        </p>
      </div>
    </div>
  )
}
