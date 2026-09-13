import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_PAGES ? '/mondomago/' : '/',
  build: {
    // Split stable third-party code (React, canvas-confetti) into its own chunk.
    // Its content — and therefore its hashed filename — stays identical across
    // app-only redeploys, so returning PWA users (stale-while-revalidate SW)
    // skip re-downloading ~140 KB of vendor code every time the app changes.
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor'
          // Sfide e mondi: dati puri che cambiano meno spesso del codice. In un chunk
          // loro il principale scende sotto i 500 KB e resta in cache fra un deploy e l'altro.
          if (id.includes('/src/data/')) return 'dati'
        },
      },
    },
  },
})
