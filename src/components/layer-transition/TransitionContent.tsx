// What's written on the alert panel (title, big %, index cards, chart, tape).

import { IconAlertTriangle, IconArrowDownRight } from '@tabler/icons-react'
import { motion  } from 'motion/react'
import type {MotionValue} from 'motion/react';
import Badge from '#/components/ui/Badge'
import { formatPercent } from '#/lib/format'
import CrashArrowChart from './CrashArrowChart'
import TransitionTape from './TransitionTape'
import type { TransitionData } from './makeTransitionData'

type Props = {
  title: string
  data: TransitionData
  figureText: MotionValue<string>
}

// Everything on the top panel; slides out with it.
// Class names (.label, .figure, .stat, .hud...) are targets for LayerTransition.
export default function TransitionContent({ title, data, figureText }: Props) {
  return (
    <div className="content absolute inset-0 flex items-center justify-center will-change-transform">
      <div className="flex flex-col items-center gap-8 px-6">
        {/* header */}
        <div className="flex flex-col items-center gap-3">
          <div className="label hud" style={{ opacity: 0 }}>
            <Badge tone="danger" icon={IconAlertTriangle}>
              Alerte marché
            </Badge>
          </div>
          <h2
            className="title hud text-center text-heading font-semibold tracking-tight text-ink"
            style={{ opacity: 0 }}
          >
            {title}
          </h2>
          <motion.div
            className="figure hud text-display font-bold tracking-tight tabular-nums text-danger"
            style={{ opacity: 0 }}
          >
            {figureText}
          </motion.div>
        </div>

        {/* index row: small stat cards */}
        <div className="flex flex-wrap justify-center gap-3">
          {data.indices.map(({ name, change }) => (
            <div
              key={name}
              className="stat hud flex min-w-[8.5rem] flex-col gap-1 rounded-inner border border-line bg-surface px-4 py-3 shadow-card"
              style={{ opacity: 0 }}
            >
              <span className="text-label text-ink-soft">{name}</span>
              <span className="flex items-center gap-1 text-subheading font-semibold tabular-nums text-danger">
                <IconArrowDownRight size="0.9em" stroke={2.5} />
                {formatPercent(change)}
              </span>
            </div>
          ))}
        </div>

        <CrashArrowChart />
      </div>

      <TransitionTape tape={data.tape} />
    </div>
  )
}
