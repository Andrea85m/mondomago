"""Agente 1 — Generatore di contenuti educativi per MondoMago."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un esperto creatore di contenuti educativi per bambini italiani dai 3 agli 8 anni,
specializzato nell'app MondoMago (React+Vite PWA).

Struttura dell'app che conosci a fondo:
- 7 mondi tematici, 200+ sfide, 4 companion (Fiamma🐉 Luna🦄 Onde🐬 Foglia🦊)
- 7 formati sfida: visual_tap, multiple_choice, story_choice, sequence_tap, drag_drop, rhyme_complete, word_picture
- Alphabet challenges con prefisso id `ba_*`
- File principale: src/MondoMago.jsx — tutte le sfide sono definite in WORLDS array

Regole per i nuovi contenuti:
- Vocabolario 3-5 anni: parole monosillabiche/bisillabiche comuni, frasi max 6 parole
- Vocabolario 6-8 anni: frasi complete, parole di uso scolastico base
- Tono: magico, incoraggiante, mai spaventoso
- Rispetta esattamente la struttura JSON degli oggetti challenge esistenti
- Gli ID sfida seguono lo schema: `{mondo}_{tipo}_{argomento}_{N}`
- Includi sempre: id, type, prompt, options/items, correct/answer, companion, points
- Per word_picture aggiungi campo `word` (italiano maiuscolo)
- Per rhyme_complete usa `___` nel prompt per il blank
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
    default = "Analizza le sfide esistenti nel mondo della foresta e crea 5 nuove sfide multiple_choice appropriate per bambini 5-6 anni"
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
