// Page background (faint grid + floating alerts) and the ticker at the bottom.

import { useReducedMotion } from 'motion/react'
import type { Drink } from '#/schema/drinks'
import Blip from './Blip'
import MarketGrid from './MarketGrid'
import Ticker from './Ticker'
import { BLIPS } from './constants'

type Props = {
  drinks: Drink[]
  current: Drink
}

export default function LiveBackground({ drinks, current }: Props) {
  const reduceMotion = useReducedMotion() ?? false

  return (
    <>
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-page">
        <MarketGrid />

        {/* occasional market alerts, in the gaps around the cards */}
        {!reduceMotion && BLIPS.map((b, i) => <Blip key={i} drinks={drinks} {...b} />)}
      </div>

      <Ticker drinks={drinks} current={current} still={reduceMotion} />
    </>
  )
}
