#!/usr/bin/env python3
"""
Generate pre-recorded Italian neural TTS audio files for MondoMago.
Uses Microsoft Edge Neural TTS (it-IT-IsabellaNeural) — free, no API key.

Run from project root:  python3 scripts/gen-tts.py
Output: public/audio/tts_*.mp3   +   src/ttsMap.json
"""

import asyncio
import hashlib
import json
import os
import re
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts not found. Run: pip3 install edge-tts --break-system-packages")

# ── Config ────────────────────────────────────────────────────────────────────
VOICE        = "it-IT-IsabellaNeural"
RATE         = "-12%"            # slightly slower than default — better for kids
AUDIO_DIR    = Path("public/audio")
MAP_OUT      = Path("src/ttsMap.json")
SOURCE       = Path("src/MondoMago.jsx")
CONCURRENCY  = 5                 # parallel requests to Edge TTS API

# ── Fixed UI strings (not extractable via regex) ──────────────────────────────
FIXED_STRINGS = [
    "Come ti chiami?",
    "Quanti anni hai?",
    "Ogni giorno ti aspettano 3 sfide speciali scelte per te! Completale tutte per guadagnare 3 stelle bonus. Pronto?",
    # Companion screen greeting (uses childName at runtime, but base form needed)
    "Scegli il tuo compagno magico!",
    # Alphabet letter TTS (one per lettera)
    "Quale immagine inizia con la lettera A?",
    "Quale immagine inizia con la lettera B?",
    "Quale immagine inizia con la lettera C?",
    "Quale immagine inizia con la lettera E?",
    "Quale immagine inizia con la lettera F?",
    "Quale immagine inizia con la lettera G?",
    "Quale immagine inizia con la lettera L?",
    "Quale immagine inizia con la lettera M?",
    "Quale immagine inizia con la lettera P?",
    "Quale immagine inizia con la lettera R?",
    "Quale immagine inizia con la lettera S?",
    "Quale immagine inizia con la lettera T?",
    # Word-picture autoText
    "Trova l'immagine per la parola: ALBERO",
    "Trova l'immagine per la parola: FARFALLA",
    "Trova l'immagine per la parola: CORONA",
    "Trova l'immagine per la parola: DRAGO",
    "Trova l'immagine per la parola: POLPO",
    "Trova l'immagine per la parola: BALENA",
    "Trova l'immagine per la parola: PIANETA",
    "Trova l'immagine per la parola: MELA",
    "Trova l'immagine per la parola: FUOCO",
    "Trova l'immagine per la parola: ROCCIA",
    "Trova l'immagine per la parola: LIBRO",
    "Trova l'immagine per la parola: MATITA",
]

# ── Emoji / symbol cleaner for TTS input ─────────────────────────────────────
EMOJI_RE = re.compile(
    "[\U0001F300-\U0001F9FF"
    "\U00002600-\U000027BF"
    "\U0001FA00-\U0001FA6F"
    "\U0001FA70-\U0001FAFF"
    "\U00002702-\U000027B0"
    "\U0000200D"
    "️"
    "]+", flags=re.UNICODE
)

def clean_for_tts(text: str) -> str:
    """Strip emoji and fix formatting so TTS reads naturally."""
    text = text.replace("\\n", "\n").replace("\n", ". ")
    text = EMOJI_RE.sub(" ", text)
    # Remove number emoji like 1️⃣ → handled above
    text = re.sub(r"[^\w\s.,!?:;'\"àèéìòùÀÈÉÌÒÙ-]", " ", text)
    text = re.sub(r"\s{2,}", " ", text).strip()
    return text

def file_key(text: str) -> str:
    return "tts_" + hashlib.md5(text.encode("utf-8")).hexdigest()[:8] + ".mp3"

# ── Extract strings from JSX ──────────────────────────────────────────────────
def extract_strings(jsx: str) -> set[str]:
    found = set()

    # Double-quoted challenge prompts, situations, and world intro texts
    for pattern in [
        r'prompt:"((?:[^"\\]|\\.)*)"',
        r'situation:"((?:[^"\\]|\\.)*)"',
        r'intro_text:\s*"((?:[^"\\]|\\.)*)"',
        r'outro:\s*"((?:[^"\\]|\\.)*)"',
    ]:
        for m in re.finditer(pattern, jsx):
            raw = m.group(1).replace("\\n", "\n").replace('\\"', '"')
            if raw.strip():
                found.add(raw)

    # Double-quoted companion messages (all static after refactor)
    for pattern in [
        r'onCorrect.*?pick\(\[(.*?)\]\)',
        r'onWrong.*?pick\(\[(.*?)\]\)',
        r'onStreak.*?pick\(\[(.*?)\]\)',
        r'onReturn.*?pick\(\[(.*?)\]\)',
        r'onWorldStart.*?pick\(\[(.*?)\]\)',
        r'onWorld.*?pick\(\[(.*?)\]\)',
    ]:
        for block in re.finditer(pattern, jsx, re.DOTALL):
            for m in re.finditer(r'"((?:[^"\\]|\\.)*)"', block.group(1)):
                raw = m.group(1).replace('\\"', '"')
                if raw.strip() and len(raw) > 5:
                    found.add(raw)

    return found

# ── Audio generation ──────────────────────────────────────────────────────────
sem = None  # set in main()

async def generate_one(text: str, filepath: Path) -> bool:
    """Generate one MP3. Returns True if newly generated, False if skipped."""
    if filepath.exists():
        return False
    tts_text = clean_for_tts(text)
    if not tts_text:
        return False
    async with sem:
        try:
            comm = edge_tts.Communicate(tts_text, VOICE, rate=RATE)
            await comm.save(str(filepath))
            return True
        except Exception as e:
            print(f"  ERROR: {e} for: {text[:50]!r}")
            return False

async def main():
    global sem
    sem = asyncio.Semaphore(CONCURRENCY)

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    # Collect strings
    jsx = SOURCE.read_text(encoding="utf-8")
    strings = extract_strings(jsx) | set(FIXED_STRINGS)
    print(f"Found {len(strings)} unique TTS strings")

    # Build manifest (text → filename) — include pre-existing entries
    manifest: dict[str, str] = {}
    if MAP_OUT.exists():
        manifest = json.loads(MAP_OUT.read_text(encoding="utf-8"))

    # Generate audio concurrently
    tasks = []
    for text in sorted(strings):
        key = file_key(text)
        manifest[text] = key
        tasks.append(generate_one(text, AUDIO_DIR / key))

    results = await asyncio.gather(*tasks)
    new_count = sum(1 for r in results if r)

    # Write manifest
    MAP_OUT.write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    total = len([f for f in AUDIO_DIR.iterdir() if f.suffix == ".mp3"])
    print(f"Generated {new_count} new files  |  {total} total in {AUDIO_DIR}")
    print(f"Manifest written to {MAP_OUT}  ({len(manifest)} entries)")

if __name__ == "__main__":
    asyncio.run(main())
