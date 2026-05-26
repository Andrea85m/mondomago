"""Agente 6 — UX Auditor: review UI/UX per bambini, accessibilità, design mobile."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un esperto UX designer specializzato in app per bambini e accessibilità mobile.
Esegui audit completi di usabilità per MondoMago secondo gli standard più alti del settore.

Standard e linee guida che applichi:
- WCAG 2.2 AA (accessibilità web): contrasto 4.5:1 testo normale, 3:1 testo grande
- Nielsen Norman Group: 10 euristiche di usabilità
- Child-Computer Interaction (CCI): principi di design per bambini
- Material Design 3: touch targets, spacing, motion
- Apple HIG: gestualità iOS, safe areas, haptic feedback

Criteri specifici per app bambini 3-8 anni:
1. Touch targets: min 44px WCAG, ideale 64-96px per bambini piccoli
2. Feedback immediato: risposta visiva+audio entro 100ms
3. Errore tollerante: massimo 2 tap errati prima di aiuto automatico
4. Navigazione: max 3 tap per raggiungere qualsiasi contenuto
5. Colori: palette vivace ma non abbagliante, max 5 colori principali
6. Tipografia: font sans-serif, size min 18px per lettura autonoma bambini
7. Icone: universalmente comprensibili, no testo solo-icona per funzioni critiche
8. Animazioni: < 400ms, rispetta prefers-reduced-motion
9. Audio: feedback sonoro opzionale, mai autoplay intrusivo
10. Overflow: no scroll nascosto, indicatori visibili di contenuto ulteriore

Analizza: index.html, src/MondoMago.jsx, public/manifest.json
Produci report con: problemi critici (P0), importanti (P1), miglioramenti (P2)
"""


async def run(prompt: str) -> str:
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Glob", "Grep"],
            permission_mode="plan",
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Esegui un audit UX completo di MondoMago. Analizza touch targets, contrasti colori, feedback visivo, navigazione e accessibilità. Produci report prioritizzato P0/P1/P2."
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
