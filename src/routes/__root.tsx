// Root HTML page: <head> (title, CSS, icon) and <body> (theme class, devtools).
// Also auto-reloads the page once when a new deploy makes old JS chunks disappear
// (e.g. the bar TV still has the previous version open).

import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import '../styles.css'
import logo from '../assets/images/logo.png'

import type { QueryClient } from '@tanstack/react-query'
import type { ErrorComponentProps } from '@tanstack/react-router'

interface MyRouterContext {
  queryClient: QueryClient
}

// After a deploy, the old hashed files (ex: routes-GKXMqeqn.js) no longer exist.
// A page that was already open then fails to load them. Reloading gets the new version.
const CHUNK_ERROR =
  /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk .* failed/i

const RELOAD_KEY = 'chunk-reload-at'

// Reload at most once every 10 seconds, so a real broken build doesn't loop forever.
function reloadForNewVersion() {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0)
    if (Date.now() - last < 10_000) return false
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage blocked: still reload once
  }
  window.location.reload()
  return true
}

// Runs before React: catches Vite's preload errors early.
const reloadScript = `
window.addEventListener('vite:preloadError', function (e) {
  try {
    var last = Number(sessionStorage.getItem('${RELOAD_KEY}') || 0);
    if (Date.now() - last < 10000) return;
    sessionStorage.setItem('${RELOAD_KEY}', String(Date.now()));
  } catch (_) {}
  e.preventDefault();
  window.location.reload();
});
`

function RootError({ error }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error)
  const isChunkError = CHUNK_ERROR.test(message)

  if (isChunkError && typeof window !== 'undefined') {
    const reloading = reloadForNewVersion()
    if (reloading) {
      return (
        <div className="flex min-h-screen items-center justify-center text-2xl">
          Mise à jour…
        </div>
      )
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-xl">
      <p>Une erreur est survenue.</p>
      <button
        className="rounded border px-4 py-2"
        onClick={() => window.location.reload()}
      >
        Recharger
      </button>
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Crash boursier',
      },
    ],
    links: [
      // fonts: Roboto is bundled in styles.css (no Google Fonts request)
      // tab icon (without it the browser asks for /favicon.ico, which doesn't exist)
      { rel: 'icon', type: 'image/png', href: logo },
    ],
  }),
  errorComponent: RootError,
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: reloadScript }} />
        <HeadContent />
      </head>
      {/* suppressHydrationWarning: browser extensions (e.g. ColorZilla) add attributes to <body>.
          Dark theme: add the class "dark" to <body> (see styles.css). */}
      <body
        className="dark bg-page text-ink antialiased"
        suppressHydrationWarning
      >
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
