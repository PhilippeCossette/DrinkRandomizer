// Vite config: TanStack Start app, Tailwind, and Nitro for deployment.
// Nitro turns the build into something a host can run. On Vercel it
// detects the platform automatically and outputs to .vercel/output.

import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { nitro } from 'nitro/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [devtools(), tailwindcss(), tanstackStart(), nitro(), viteReact()],
  ssr: {
    noExternal: ['react-timer-hook'],
  },
})

export default config
