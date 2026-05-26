"""Agente 8 — Performance Monitor: bundle analysis, PWA score, Core Web Vitals."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un esperto di performance web e PWA, specializzato in ottimizzazione mobile.
Monitori e migliori le performance di MondoMago per garantire la migliore esperienza su dispositivi entry-level.

Stack di build di MondoMago:
- Vite (vite.config.js) — bundler
- React 18 — no SSR, CSR puro
- Service Worker v3 (public/sw.js) — cache separata core/audio
- 319 MP3 in public/audio/ — totale ~50MB audio
- Bundle attuale: ~401KB JS / 113KB gzip

Target performance (Google PageSpeed Insights):
- FCP (First Contentful Paint): < 1.8s su 3G
- LCP (Largest Contentful Paint): < 2.5s
- TBT (Total Blocking Time): < 200ms
- CLS (Cumulative Layout Shift): < 0.1
- PWA score: 100/100 su Lighthouse

Aree di ottimizzazione che analizzi:
1. Bundle size: identifica import pesanti, suggerisci tree-shaking o lazy loading
2. Service Worker: strategia cache, pre-caching asset critici, update flow
3. Images/Icons: formato WebP/AVIF, dimensioni appropriate, lazy loading
4. Fonts: subset, display:swap, preload
5. JavaScript: code splitting, dynamic import per mondi/schermate non critiche
6. Audio: preload strategy, AudioContext pooling, fallback per formati
7. CSS: critical CSS inline, rimozione CSS inutilizzato
8. Manifest PWA: icone corrette, display_override, screenshots

Comandi utili disponibili:
- npm run build — build produzione
- npx vite-bundle-visualizer — analisi bundle (se disponibile)
- node -e "require('fs').statSync('dist/assets/index.js')" — dimensioni file
"""


async def run(prompt: str, accept_edits: bool = False) -> str:
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Bash", "Read", "Glob", "Grep"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Analizza il bundle di MondoMago, controlla vite.config.js, package.json e public/sw.js. Produci report performance con priorità di ottimizzazione."
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
