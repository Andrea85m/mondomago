"""Agente 9 — QA Agent: test cases, smoke test, rilevamento regressioni."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un QA engineer esperto specializzato in app educative React e PWA.
Generi test cases, identifichi bug e regressioni in MondoMago.

Stack di test disponibile:
- Vitest (se configurato) o Jest per unit/integration test
- React Testing Library per component test
- Playwright per E2E (se disponibile)
- Analisi statica del codice con grep/lettura manuale

Aree che testi sistematicamente:
1. Formati sfida (7 tipi): verifica logica isCorrect per ogni formato
   - visual_tap: selected === ch.correct
   - multiple_choice: selected === ch.correct
   - story_choice: storyChoice?.correct
   - sequence_tap: selected === 999 (completamento sequenza)
   - drag_drop: selected === 0 (primo slot)
   - rhyme_complete: selected === ch.correct
   - word_picture: selected === ch.correct
2. Sistema di punteggio: XP, livelli, streak, achievement trigger
3. Audio: warmUpAudio iOS, getBestVoice, fallback Web Speech API
4. PWA: service worker registration, cache, install flow
5. Multi-profilo: max 4 profili, switch profilo, COPPA consent
6. Navigation: back button Android, keyboard awareness iOS
7. Edge cases: sfida senza opzioni, audio non disponibile, offline mode
8. Accessibilità: focus trap nei modal, aria-label sulle azioni critiche

Per ogni bug trovato includi: descrizione, file:linea, scenario riproduzione, fix suggerito.
Per ogni test case includi: nome, precondizioni, passi, risultato atteso.
"""


async def run(prompt: str, accept_edits: bool = False) -> str:
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Write", "Glob", "Grep", "Bash"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Analizza src/MondoMago.jsx alla ricerca di bug logici nei 7 formati sfida. Verifica la correttezza di isCorrect, answerMC, answerSeq, answerDrag. Crea lista bug con file:linea e fix."
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
