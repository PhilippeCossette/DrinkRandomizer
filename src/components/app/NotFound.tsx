import { Link } from '@tanstack/react-router'
import { cardClass } from '#/components/ui/Card'

// Any unknown URL
export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center bg-page p-6">
      <div className={`${cardClass} flex max-w-md flex-col items-center gap-3 p-8 text-center`}>
        <span className="text-display font-bold tracking-tight text-ink">404</span>
        <p className="text-subheading font-semibold text-ink">Page introuvable</p>
        <Link
          to="/"
          className="mt-2 rounded-full bg-accent px-6 py-3 text-body font-medium text-accent-ink transition-transform hover:scale-[1.03]"
        >
          Retour à l'écran
        </Link>
      </div>
    </div>
  )
}
