import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Dove vive il sito pubblicato. Con un dominio proprio (file public/CNAME) l'app sta
// alla radice; senza, su andrea85m.github.io/mondomago/. Basta aggiungere o togliere
// CNAME: base, manifest e service worker seguono da soli.
const DOMINIO_PROPRIO = existsSync('public/CNAME')
const BASE = process.env.GITHUB_PAGES && !DOMINIO_PROPRIO ? '/mondomago/' : '/'

// public/manifest.json è scritto per /mondomago/: nel build i percorsi diventano quelli
// della base vera. Il file in public/ è copiato così com'è, quindi lo si riscrive dopo.
function manifestSullaBase() {
  let outDir
  return {
    name: 'manifest-sulla-base',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir },
    writeBundle() {
      const f = join(outDir, 'manifest.json')
      if (BASE === '/mondomago/' || !existsSync(f)) return
      writeFileSync(f, readFileSync(f, 'utf8').replaceAll('"/mondomago/', `"${BASE}`))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), manifestSullaBase()],
  base: BASE,
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
