#!/usr/bin/env python3
"""
Registra la voce di MondoMago.

Una sola voce neurale italiana su TUTTO ciò che l'app dice ad alta voce.
Il punto non è "avere il TTS": ce l'aveva già. Il punto è che prima 155 consegne
su 362 non avevano un file, e l'app ripiegava su `speechSynthesis` — cioè sulla
voce di sistema del telefono, diversa su ogni Android e su ogni iPhone, e in
mezzo a una frase il timbro cambiava. Qui si copre tutto, così quella riserva
non entra mai in campo.

    pip3 install edge-tts
    python3 scripts/gen-tts.py              # solo i file mancanti
    python3 scripts/gen-tts.py --force      # rigenera tutto (cambio voce/prosodia)
    python3 scripts/gen-tts.py --dry-run    # elenca cosa registrerebbe

Uscite:  public/audio/tts_*.mp3  +  src/ttsMap.json
Serve ffmpeg per la normalizzazione (senza, il file resta grezzo e lo dice).
"""

import argparse
import asyncio
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "lib"))
from tts_text import to_speech, tts_key, file_name, NAME_TOKEN  # noqa: E402

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts non trovato. Esegui: pip3 install edge-tts")

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "src" / "MondoMago.jsx"
AUDIO_DIR = ROOT / "public" / "audio"
MAP_OUT = ROOT / "src" / "ttsMap.json"

# ── Voce ─────────────────────────────────────────────────────────────────────
# Isabella è la voce già usata dall'app: cambiarla vorrebbe dire ricominciare
# da capo l'identità sonora del gioco. Le alternative italiane su Edge sono
# ElsaNeural (femminile, più piatta), DiegoNeural e GiuseppeMultilingualNeural
# (maschili). Per confrontarle: python3 scripts/gen-tts.py --demo
VOICE = "it-IT-IsabellaNeural"
RATE = "-10%"      # un filo sotto il naturale: i bambini di 3-8 anni seguono meglio
PITCH = "+0Hz"     # niente pitch shift: sul neurale introduce artefatti metallici
CONCURRENCY = 6

# ── Normalizzazione audio ────────────────────────────────────────────────────
# Senza questo alcune battute arrivavano più forti di altre e il genitore
# doveva star dietro al volume. -16 LUFS è lo standard per il parlato mobile.
LOUDNORM = "loudnorm=I=-16:TP=-1.5:LRA=11"
TRIM = ("silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB:"
        "detection=peak,areverse,"
        "silenceremove=start_periods=1:start_duration=0.02:start_threshold=-45dB:"
        "detection=peak,areverse")

DEMO_PHRASE = ("Bravo! Sei un vero mago. Adesso proviamo insieme: "
               "quante mele vedi? Tocca la risposta giusta!")


# ═══════════════════════════════════════════════════════════════════════════
# Raccolta delle stringhe parlate
# ═══════════════════════════════════════════════════════════════════════════
def _unescape(s: str) -> str:
    return s.replace("\\n", "\n").replace('\\"', '"').replace("\\'", "'").replace("\\`", "`")


def collect(jsx: str) -> set[str]:
    found: set[str] = set()

    def add(s: str):
        s = _unescape(s).strip()
        if s and any(c.isalpha() for c in s):
            found.add(s)

    # 1 · Consegne delle sfide. `question` è il campo di quiz_cartoon /
    #     color_zones / puzzle_swap; il renderer ci fa il fallback.
    #     `outcome` è il finale delle storie di empatia: a 5-6 anni non lo si
    #     legge da soli, e senza voce quel momento passa in silenzio.
    #     Il testo dei bottoni-scelta NON si registra: leggere quattro opzioni
    #     di fila trasforma la sfida in un ascolto passivo.
    for field in ("prompt", "question", "situation", "intro_text", "outro", "outcome"):
        for m in re.finditer(rf'{field}\s*:\s*"((?:[^"\\]|\\.)*)"', jsx):
            add(m.group(1))
            # Le filastrocche arrivano a speak() col buco già sostituito da "...":
            # la clip va registrata su quella forma, non sul testo con gli underscore.
            if "___" in m.group(1):
                add(m.group(1).replace("___", "..."))

    # 2 · Battute dei companion: pick([...]) e onMeet con il nome
    for m in re.finditer(r"on[A-Z]\w*\s*:\s*\(\s*\w*\s*\)\s*=>\s*pick\(\[(.*?)\]\)", jsx, re.DOTALL):
        for lit in re.finditer(r'"((?:[^"\\]|\\.)*)"', m.group(1)):
            add(lit.group(1))
    for m in re.finditer(r"onMeet\s*:\s*\(\s*(\w+)\s*\)\s*=>\s*`((?:[^`\\]|\\.)*)`", jsx):
        var, tpl = m.group(1), m.group(2)
        add(re.sub(r"\$\{\s*" + var + r"\s*\}", NAME_TOKEN, tpl))

    # 3 · Tutto ciò che passa da speak(): letterali e template
    for m in re.finditer(r'speak\(\s*"((?:[^"\\]|\\.)*)"', jsx):
        add(m.group(1))
    for m in re.finditer(r"speak\(\s*`((?:[^`\\]|\\.)*)`", jsx):
        tpl = m.group(1)
        if re.search(r"\$\{[^}]*(childName|name)[^}]*\}", tpl):
            tpl = re.sub(r"\$\{[^}]*(?:childName|name)[^}]*\}", NAME_TOKEN, tpl)
        if "${" in tpl:
            continue          # interpolazioni non riconducibili al nome: le gestisce il §5
        add(tpl)

    # 4 · Titoli delle slide di onboarding: stanno in un array dentro la useEffect
    #     che li legge, quindi non sono argomenti letterali di speak().
    m = re.search(r"const titles = \[(.*?)\];", jsx, re.DOTALL)
    if m:
        for lit in re.finditer(r'"((?:[^"\\]|\\.)*)"', m.group(1)):
            add(lit.group(1))

    # 5 · Frasi composte a runtime, riscritte in forma fissa.
    #     Il numero di stelle mancanti resta scritto a schermo: leggerlo ad alta
    #     voce vorrebbe dire una banca di 140 clip di numeri per una riga sola.
    for m in re.finditer(r'\{\s*id:"(\w+)",\s*name:"([^"]+)"', jsx[jsx.find("const WORLDS = ["):jsx.find("const WORLDS = [") + 1400]):
        add(f"Questo mondo è ancora chiuso. Guadagna altre stelle per aprire {m.group(2)}!")

    # 6 · Consegne costruite dal formato (il testo non esiste come letterale)
    for m in re.finditer(r'word:"([A-ZÀ-Ù]+)"', jsx):
        add(f"Trova l'immagine per la parola: {m.group(1)}")
    for m in re.finditer(r'id:"ba_([A-ZÀ-Ù])"', jsx):
        add(f"Quale immagine inizia con la lettera {m.group(1)}?")
    for m in re.finditer(r'letter:"([A-ZÀ-Ù])",\s*word:"(\w+)"', jsx):
        add(f"Traccia la lettera {m.group(1)} come in {m.group(2)}!")

    # 7 · Righe fisse dell'interfaccia
    found.update({
        "Come ti chiami?",
        "Quanti anni hai?",
        "Scegli il tuo compagno magico!",
        "Tocca per ascoltare la domanda!",
        "Bravo! Hai finito le sfide di oggi!",
        "Ottimo lavoro! Ci vediamo domani!",
    })

    return found


# ═══════════════════════════════════════════════════════════════════════════
# Generazione
# ═══════════════════════════════════════════════════════════════════════════
HAS_FFMPEG = shutil.which("ffmpeg") is not None


def normalize(path: Path) -> bool:
    """Pareggia il volume e toglie il silenzio in testa e in coda."""
    if not HAS_FFMPEG:
        return False
    tmp = path.with_suffix(".norm.mp3")
    r = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error", "-i", str(path),
         "-af", f"{TRIM},{LOUDNORM}", "-ac", "1", "-ar", "24000", "-b:a", "48k", str(tmp)],
        capture_output=True,
    )
    if r.returncode == 0 and tmp.exists() and tmp.stat().st_size > 400:
        tmp.replace(path)
        return True
    tmp.unlink(missing_ok=True)
    return False


async def render(text: str, path: Path, sem: asyncio.Semaphore, force: bool) -> str:
    if path.exists() and not force:
        return "skip"
    spoken = to_speech(text)
    if not spoken:
        return "empty"
    async with sem:
        for attempt in range(3):
            try:
                await edge_tts.Communicate(spoken, VOICE, rate=RATE, pitch=PITCH).save(str(path))
                break
            except Exception as e:                       # rete ballerina: si riprova
                if attempt == 2:
                    print(f"  ✗ {e}  ← {spoken[:60]!r}")
                    return "error"
                await asyncio.sleep(1.5 * (attempt + 1))
    normalize(path)
    return "new"


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="rigenera anche i file già presenti")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--demo", action="store_true", help="una frase con ognuna delle voci italiane")
    args = ap.parse_args()

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    if args.demo:
        out = ROOT / "public" / "audio" / "_demo"
        out.mkdir(exist_ok=True)
        for v in ["it-IT-IsabellaNeural", "it-IT-ElsaNeural",
                  "it-IT-DiegoNeural", "it-IT-GiuseppeMultilingualNeural"]:
            f = out / f"{v}.mp3"
            await edge_tts.Communicate(DEMO_PHRASE, v, rate=RATE).save(str(f))
            normalize(f)
            print(f"  {f}")
        print(f"\nAscoltale e scegli. La voce attiva è {VOICE} (costante VOICE in questo file).")
        return

    jsx = SOURCE.read_text(encoding="utf-8")
    texts = collect(jsx)

    # chiave = testo a schermo col nome tolto; più testi diversi possono
    # convergere sulla stessa chiave (es. saluti con nomi diversi)
    manifest: dict[str, str] = {}
    for t in texts:
        manifest[tts_key(t)] = file_name(tts_key(t))
    manifest = {k: v for k, v in sorted(manifest.items()) if k}

    print(f"Voce: {VOICE}  ·  rate {RATE}  ·  pitch {PITCH}")
    print(f"ffmpeg: {'sì — volume normalizzato a -16 LUFS' if HAS_FFMPEG else 'NO — audio non normalizzato'}")
    print(f"Stringhe parlate trovate: {len(manifest)}")

    if args.dry_run:
        for k in list(manifest)[:40]:
            print(f"  {k[:60]!r}\n      → {to_speech(k)[:80]}")
        print(f"  … e altre {max(0, len(manifest) - 40)}")
        return

    sem = asyncio.Semaphore(CONCURRENCY)
    results = await asyncio.gather(*[
        render(k, AUDIO_DIR / v, sem, args.force) for k, v in manifest.items()
    ])
    tally = {r: results.count(r) for r in set(results)}

    # via i file orfani: pesano nella cache del service worker per niente
    keep = set(manifest.values())
    orphans = [f for f in AUDIO_DIR.glob("tts_*.mp3") if f.name not in keep]
    for f in orphans:
        f.unlink()

    MAP_OUT.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    total_kb = sum(f.stat().st_size for f in AUDIO_DIR.glob("tts_*.mp3")) / 1024
    print(f"\nNuovi {tally.get('new', 0)} · già presenti {tally.get('skip', 0)} · "
          f"errori {tally.get('error', 0)} · orfani rimossi {len(orphans)}")
    print(f"{len(list(AUDIO_DIR.glob('tts_*.mp3')))} file · {total_kb / 1024:.1f} MB")
    print(f"Manifest: {MAP_OUT.relative_to(ROOT)}  ({len(manifest)} voci)")
    print("\nOra verifica la copertura:  node scripts/check-tts.mjs")


if __name__ == "__main__":
    asyncio.run(main())
