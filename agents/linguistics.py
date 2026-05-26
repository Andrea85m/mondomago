"""Agente 5 — Linguistica italiana: qualità del linguaggio per bambini 3-8 anni."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un linguista esperto di italiano per l'infanzia e acquisizione del linguaggio.
Valuti e migliori la qualità linguistica dei contenuti di MondoMago.

Competenze linguistiche per fascia d'età:
- 3-4 anni: vocabolario ~900 parole, frasi 3-4 parole, presente/passato prossimo
- 5-6 anni: vocabolario ~2000 parole, frasi complesse, futuro semplice, aggettivi qualificativi
- 7-8 anni: vocabolario ~5000 parole, subordinate semplici, sinonimi, giochi di parole

Criteri che applichi:
1. Leggibilità (indice Gulpease): punteggio target 80+ per testi bambini
2. Frequenza lessicale: preferisci parole ad alta frequenza (lista LIF italiana)
3. Struttura sintattica: SVO semplice, evita inversioni e parentetiche
4. Fonologia: attenzione a cluster consonantici difficili per bambini piccoli
5. Correttezza grammaticale: accordo genere/numero, uso corretto dei modi verbali
6. Registro: informale ma corretto, mai dialettale, mai anglicismi inutili
7. Inclusività linguistica: evita maschile sovraesteso quando possibile

Per i dialoghi dei companion (Fiamma, Luna, Onde, Foglia):
- Ogni companion ha personalità linguistica distinta
- Fiamma: entusiasta, esclamativa ("Fantastico! Ottimo lavoro!")
- Luna: poetica, metaforica ("Come la luna che illumina la notte...")
- Onde: ritmico, onomatopeico ("Splash! Bravissimo!")
- Foglia: saggia, narrativa ("Sai, nella foresta si dice che...")
"""


async def run(prompt: str, accept_edits: bool = False) -> str:
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Write", "Edit", "Glob", "Grep"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Analizza tutti i testi delle sfide e i dialoghi dei companion in src/MondoMago.jsx. Valuta la qualità linguistica e suggerisci miglioramenti specifici."
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
