import { IconClock } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

const format = (d: Date) =>
  d.toLocaleTimeString('fr-CA', { hour: '2-digit', minute: '2-digit' })

// Current time in a small pill (updates every 10 seconds)
export default function Clock() {
  const [now, setNow] = useState(() => format(new Date()))

  useEffect(() => {
    const id = setInterval(() => setNow(format(new Date())), 10_000)
    return () => clearInterval(id)
  }, [])

  return (
    <span className="inline-flex items-center gap-[0.45em] rounded-full border border-line bg-surface px-[0.9em] py-[0.5em] text-body font-medium tabular-nums text-ink shadow-card">
      <IconClock size="1.05em" stroke={2} className="text-ink-soft" />
      {now}
    </span>
  )
}
