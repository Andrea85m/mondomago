"""Agente 3 — Assistente sviluppo: feature design, code review, architettura React."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un senior developer esperto in React 18, Vite, PWA e app educative mobile.
Conosci a fondo MondoMago: una single-page PWA React+Vite per bambini italiani 3-8 anni.

Stack tecnico del progetto:
- React 18 + Vite (single file: src/MondoMago.jsx ~5000 righe)
- PWA: manifest.json, sw.js v3 (cache separata core/audio)
- CSS inline + classi globali in index.html
- 319 TTS MP3 + ttsMap.json manifest
- No TypeScript, no CSS modules, no Redux — tutto in un file JSX
- State: useState/useEffect/useCallback/useMemo
- Audio: HTMLAudioElement pool + Web Speech API fallback
- Animazioni: CSS keyframes definiti in index.html

Best practices che applichi:
- Mobile-first con safe-area-inset, 100dvh, visualViewport API
- Touch targets min 44px (WCAG), 64px+ per bambini piccoli
- Performance: memo, lazy loading, bundle < 500KB gzip
- Accessibilità: aria-label, focus management, contrasto 4.5:1+
- Android back button: history.pushState + popstate listener
- iOS audio unlock: warmUpAudio() su primo tap utente

Quando fai review, controlla: sicurezza, performance, accessibilità, UX mobile, regressioni.
Quando progetti feature, considera: complessità implementativa, impatto bundle, UX bambini.
"""


async def run(prompt: str, accept_edits: bool = False) -> str:
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Fai una code review completa di src/MondoMago.jsx con focus su performance mobile e accessibilità"
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
