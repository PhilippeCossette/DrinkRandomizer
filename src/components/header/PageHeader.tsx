import logo from '#/assets/images/logo.png'

type Props = {
  depression?: boolean // La Grande Dépression is on: different title
}

// Top of the page: logo + title
export default function PageHeader({ depression = false }: Props) {
  return (
    <header className="flex min-w-0 items-center gap-4">
      <img
        src={logo}
        alt="Deux 22"
        className="h-[3.6rem] w-auto shrink-0 object-contain"
      />
      <div className="min-w-0">
        <h1 className="text-[min(2.4rem,8vw)] leading-tight font-semibold tracking-tight text-ink">
          {depression ? 'La Grande Dépression' : 'Crash boursier'}
        </h1>
        <p className="text-body text-ink-soft">
          {depression
            ? 'Crash total : tout le menu est en solde.'
            : 'Les prix chutent en direct. Profitez-en.'}
        </p>
      </div>
    </header>
  )
}
