// Error screen: shown when something breaks, reloads the page by itself.

import { IconWifiOff } from '@tabler/icons-react'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { cardClass } from '#/components/ui/Card'

const RELOAD_AFTER = 5 // seconds

// Shown when something breaks (e.g. the server restarted or the Wi-Fi dropped
// and a file couldn't load). On the bar screen nobody is there to refresh,
// so it reloads the page by itself after a few seconds.
export default function AppError({ error }: ErrorComponentProps) {
  const [left, setLeft] = useState(RELOAD_AFTER)

  useEffect(() => {
    console.error(error)
    const id = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) window.location.reload()
        return s - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [error])

  return (
    <div className="grid min-h-dvh place-items-center bg-page p-6">
      <div className={`${cardClass} flex max-w-md flex-col items-center gap-3 p-8 text-center`}>
        <span className="grid h-14 w-14 place-items-center rounded-full bg-warning-soft text-warning">
          <IconWifiOff size="1.6rem" />
        </span>
        <p className="text-subheading font-semibold text-ink">Reconnexion…</p>
        <p className="text-body text-ink-soft">
          La connexion a été perdue. Rechargement dans {Math.max(left, 0)} s.
        </p>
      </div>
    </div>
  )
}
