import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Il sito ha due porte d'ingresso:
//   /      → la landing (index.html), statica, è quella che si condivide
//   /app/  → il gioco (app/index.html), ed è lo scope della PWA e del TWA Android
// Il service worker sta in public/app/sw.js, quindi servito da /app/sw.js: registrandolo
// con percorso relativo prende come scope /app/ e non tocca la landing.
//
// Con un dominio proprio (file public/CNAME) il sito sta alla radice; senza, finisce
// sotto andrea85m.github.io/mondomago/. Basta aggiungere o togliere CNAME.
const DOMINIO_PROPRIO = existsSync('public/CNAME')
const BASE = process.env.GITHUB_PAGES && !DOMINIO_PROPRIO ? '/mondomago/' : '/'

// public/app/manifest.json è scritto per il dominio proprio: percorsi che partono da "/".
// Nel caso di ripiego su github.io vanno preceduti dalla base, altrimenti la PWA cerca
// icone e scope alla radice del dominio di GitHub invece che dentro /mondomago/.
function manifestSullaBase() {
  let outDir
  return {
    name: 'manifest-sulla-base',
    apply: 'build',
    configResolved(c) { outDir = c.build.outDir },
    writeBundle() {
      const f = join(outDir, 'app', 'manifest.json')
      if (BASE === '/' || !existsSync(f)) return
      writeFileSync(f, readFileSync(f, 'utf8').replaceAll('"/', `"${BASE}`))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), manifestSullaBase()],
  base: BASE,
  build: {
    rollupOptions: {
      // Due pagine: la landing alla radice e il gioco sotto /app/. Vite conserva la
      // struttura delle cartelle, quindi escono dist/index.html e dist/app/index.html.
      input: {
        landing: 'index.html',
        app: 'app/index.html',
      },
      // Split stable third-party code (React, canvas-confetti) into its own chunk.
      // Its content — and therefore its hashed filename — stays identical across
      // app-only redeploys, so returning PWA users (stale-while-revalidate SW)
      // skip re-downloading ~140 KB of vendor code every time the app changes.
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
