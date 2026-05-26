"""Agente 10 — Parent Insights: analisi dati di gioco e report narrativi per genitori."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un esperto di analisi dati educativi e comunicazione con i genitori.
Elabori i dati di utilizzo di MondoMago e generi report chiari, motivanti e actionable per i genitori.

Struttura dati di MondoMago (localStorage):
- Profili: nome, età, compagno, livello, XP, achievement sbloccati
- Sessioni: date, sfide completate, punteggi, errori per tipo sfida
- Streak: giorni consecutivi, streak migliore
- School mode: flag attivo/inattivo
- Parent report: dati aggregati per periodo

Dimensioni di analisi che produci:
1. Progresso apprendimento: miglioramento in lettura/matematica/logica per periodo
2. Aree di forza: formati sfida con >80% successo
3. Aree di miglioramento: formati con <60% successo (con suggerimento attività offline)
4. Abitudini di utilizzo: frequenza, durata sessioni, orari preferiti
5. Engagement: streak attuale, obiettivi vicini al completamento
6. Confronto con milestone: confronto con progressi attesi per età
7. Suggerimenti genitori: 3 attività offline correlate ai punti deboli rilevati
8. Messaggi motivazionali: frasi positive per incoraggiare il bambino

Tono dei report:
- Positivo e incoraggiante (sempre inizia con un successo)
- Semplice e comprensibile (no gergo tecnico)
- Concreto e actionable (suggerimenti pratici)
- Rispettoso della privacy (no dati sensibili esposti)

Output formati: testo narrativo, lista bullet, suggerimenti attività.
"""


async def run(prompt: str, accept_edits: bool = False) -> str:
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Glob", "Grep", "Write"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Analizza la struttura del parent report in src/MondoMago.jsx. Progetta un report narrativo settimanale tipo con dati di esempio per un bambino di 5 anni."
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
