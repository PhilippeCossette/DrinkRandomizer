// The page while La Grande Dépression is on: a banner with the countdown,
// then every drink and shot on sale in one grid.
// TV (lg+): fills the screen, nothing scrolls. Smaller screens: stacked, scrollable.

import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import Digit from '#/components/timer/Digit'
import { cardClass } from '#/components/ui/Card'
import { ease } from '#/lib/easing'
import { pad } from '#/lib/format'
import { getDiscountPercent } from '#/lib/pricing'
import type { Drink } from '#/schema/drinks'
import DepressionItem from './DepressionItem'

type Props = {
  drinks: Drink[]
  shots: Drink[]
  minutes: number
  seconds: number
  isRunning: boolean
  enterDelay?: number // seconds to wait before the cards appear (after the intro)
}

export default function DepressionBoard({
  drinks,
  shots,
  minutes,
  seconds,
  isRunning,
  enterDelay = 0,
}: Props) {
  const items = [
    ...drinks.map((item) => ({ item, kind: 'drink' as const })),
    ...shots.map((item) => ({ item, kind: 'shot' as const })),
  ]
  // on a TV: rows of `columns` cards (3 to 6 per row, so two rows for most menus)
  const columns = Math.min(6, Math.max(3, Math.ceil(items.length / 2)))
  const rows = Array.from(
    { length: Math.ceil(items.length / columns) },
    (_, r) =>
      items
        .slice(r * columns, r * columns + columns)
        .map((entry, i) => ({ ...entry, index: r * columns + i })),
  )
  const biggest = Math.max(
    ...items.map(({ item }) =>
      getDiscountPercent(item.regularPrice, item.salePrice),
    ),
  )
  const [m1, m2] = pad(minutes)
  const [s1, s2] = pad(seconds)

  return (
    <main className="flex flex-col gap-bento lg:grid lg:min-h-0 lg:grid-rows-[auto_minmax(0,1fr)]">
      {/* banner: what's happening + countdown */}
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: enterDelay, duration: 0.6, ease }}
        className={`${cardClass} relative flex flex-col gap-4 overflow-hidden border-danger/40 bg-surface-raised p-tile sm:flex-row sm:items-center sm:justify-between`}
      >
        {/* slow red sweep across the banner */}
        <div className="pointer-events-none absolute inset-0 animate-pulse bg-[linear-gradient(90deg,rgb(239_68_68/0.14),transparent_60%)] [animation-duration:3s] motion-reduce:animate-none" />

        <div className="relative flex min-w-0 flex-col gap-2">
          <span className="flex items-center gap-2 text-chip font-semibold tracking-wide text-danger uppercase">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-danger/70 motion-reduce:animate-none" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-danger" />
            </span>
            Mode spécial en cours
          </span>
          <h2 className="text-[min(var(--text-heading),9vw)] leading-tight font-bold tracking-tight text-ink">
            Tout le menu est en crash
          </h2>
          <p className="text-body text-ink-soft">
            {items.length} produits en chute · jusqu'à{' '}
            <span className="font-semibold text-danger">-{biggest}%</span> · une
            seule fois ce soir
          </p>
        </div>

        {/* countdown to the end of the event */}
        <div className="relative flex shrink-0 flex-col items-start gap-1 sm:items-end">
          <span className="text-label font-medium text-ink-soft uppercase">
            {isRunning ? 'Fin dans' : 'En pause'}
          </span>
          <div
            className="flex items-center font-digital text-[min(6rem,18vw)] leading-none text-danger tabular-nums"
            aria-label={`${minutes} minutes ${seconds} secondes`}
          >
            <Digit value={m1} />
            <Digit value={m2} />
            <span
              className={`mt-[-0.1em] px-[0.04em] ${isRunning ? 'animate-pulse [animation-duration:1s] motion-reduce:animate-none' : ''}`}
            >
              :
            </span>
            <Digit value={s1} />
            <Digit value={s2} />
          </div>
        </div>
      </motion.section>

      {/* every drink and shot. Phones/tablets: a simple 2-3 column grid.
          TV: two rows filling the screen, the second one centered if it's shorter.
          (the rows use `contents` on small screens, so the cards flow in the grid) */}
      <div className="grid grid-cols-2 gap-bento md:grid-cols-3 lg:flex lg:min-h-0 lg:flex-col">
        {rows.map((row, r) => (
          <div
            key={r}
            className="contents lg:flex lg:min-h-0 lg:flex-1 lg:justify-center lg:gap-bento"
          >
            {row.map(({ item, kind, index }) => (
              <div
                key={`${kind}-${item.name}`}
                className="flex min-w-0 lg:w-[calc((100%-(var(--cols)-1)*var(--spacing-bento))/var(--cols))] lg:shrink-0"
                style={{ '--cols': columns } as CSSProperties}
              >
                <DepressionItem
                  item={item}
                  kind={kind}
                  index={index}
                  baseDelay={enterDelay}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}
