"""Agente 2 — Pipeline TTS: genera MP3 con edge-tts e aggiorna ttsMap.json."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions
from _shared import PROJECT_ROOT, stream_print, get_result

SYSTEM_PROMPT = """Sei un esperto di pipeline audio per app educative su Python.
Gestisci la generazione TTS di MondoMago usando edge-tts con la voce Isabella Neural italiana.

Struttura audio del progetto:
- Script di generazione: scripts/gen-tts.py
- MP3 output: public/audio/tts_*.mp3 (naming: tts_{hash_md5_del_testo}.mp3)
- Manifest: src/ttsMap.json (dict {testo: nomefile_mp3})
- Voce: it-IT-IsabellaNeural (voce femminile, tono per bambini)
- Rate: +10%, pitch: +5Hz per tono più vivace

Per generare nuovi TTS:
1. Identifica le stringhe nuove/mancanti in src/MondoMago.jsx
2. Per ogni stringa calcola md5 hex del testo (lowercase, strip)
3. Esegui: edge-tts --voice it-IT-IsabellaNeural --rate=+10% --pitch=+5Hz --text "testo" --write-media public/audio/tts_HASH.mp3
4. Aggiorna src/ttsMap.json aggiungendo la nuova entry
5. Verifica che il file MP3 sia stato creato correttamente

Usa sempre edge-tts versione >= 6.1.12. Se edge-tts non è nel PATH, cercalo nel venv.
"""


async def run(prompt: str, accept_edits: bool = True) -> str:  # True: genera file MP3 senza conferma
    permission = "acceptEdits" if accept_edits else "plan"
    result = ""
    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=SYSTEM_PROMPT,
            allowed_tools=["Read", "Write", "Bash", "Glob", "Grep"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result
    return result


if __name__ == "__main__":
    default = "Controlla src/ttsMap.json e src/MondoMago.jsx, identifica le stringhe parlate non ancora generate e crea i MP3 mancanti"
    asyncio.run(run(" ".join(sys.argv[1:]) if len(sys.argv) > 1 else default))
