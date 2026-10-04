#!/usr/bin/env python3
"""
Registra la voce di Magistella.

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
import base64
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
    edge_tts = None          # serve solo col motore "edge"

ROOT = Path(__file__).resolve().parent.parent
# Il testo parlato sta nel gioco e nei suoi dati (compagni, mondi, sfide)
SOURCES = [ROOT / "src" / "Magistella.jsx", ROOT / "src" / "data" / "mondi.js", ROOT / "src" / "data" / "sfide.js"]
SOURCE_PUZZLE = ROOT / "src" / "PuzzleMagico.jsx"
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

# ── Motore Google: Cloud Text-to-Speech, voci Chirp 3 HD ─────────────────────
# Perché: edge-tts usa il servizio "Leggi ad alta voce" di Edge in modo non
# ufficiale (Microsoft: l'uso commerciale senza Azure "could be a violation of
# our terms"), e un'app per bambini su Play non può poggiare su quello.
# Cloud TTS è un servizio ufficiale: "You can use the audio data files you create
# [...] to power your applications" (docs.cloud.google.com/text-to-speech/docs/basics).
# Chirp 3 HD: 1 milione di caratteri gratis al mese (tutte le frasi ≈ 34.000).
# NON Gemini API: i suoi termini vietano l'uso in app rivolte ai minori di 18 anni.
#
#   chiave in ~/.config/google-tts/api_key   (oppure env GOOGLE_TTS_API_KEY)
#   python3 scripts/gen-tts.py --motore google --demo          # campioni di ogni voce
#   python3 scripts/gen-tts.py --motore google --voce Leda --force
GOOGLE_VOCE = "Leda"        # da confermare dopo l'ascolto dei campioni (--demo)
GOOGLE_RITMO = 0.92         # come il -10% di Isabella: i bambini piccoli seguono meglio
GOOGLE_URL = "https://texttospeech.googleapis.com/v1"


def google_chiave() -> str:
    k = os.environ.get("GOOGLE_TTS_API_KEY", "").strip()
    f = Path.home() / ".config" / "google-tts" / "api_key"
    if not k and f.exists():
        k = f.read_text().strip()
    if not k:
        sys.exit("Chiave Google TTS assente: mettila in ~/.config/google-tts/api_key "
                 "(una riga, nessun altro testo) oppure in GOOGLE_TTS_API_KEY.")
    return k


def google_post(percorso: str, corpo: dict | None, chiave: str) -> dict:
    """curl invece di urllib: sul Mac di Emilio urllib inciampa nei certificati SSL.
    La chiave va in un header, mai nella riga di comando (resterebbe in `ps`)."""
    cmd = ["curl", "-s", "--max-time", "60", "-H", "Content-Type: application/json",
           "-H", "@-", f"{GOOGLE_URL}/{percorso}"]
    intestazione = f"X-Goog-Api-Key: {chiave}\n"
    if corpo is not None:
        cmd[1:1] = ["-X", "POST", "--data-binary", json.dumps(corpo)]
    r = subprocess.run(cmd, input=intestazione, capture_output=True, text=True)
    try:
        d = json.loads(r.stdout or "{}")
    except json.JSONDecodeError:
        d = {"error": {"message": (r.stdout or r.stderr)[:200]}}
    if "error" in d:
        raise RuntimeError(f"{d['error'].get('status', '')} {d['error'].get('message', '')[:160]}")
    return d


def google_voci(chiave: str) -> list[str]:
    d = google_post("voices?languageCode=it-IT", None, chiave)
    return sorted(v["name"] for v in d.get("voices", []) if "Chirp3-HD" in v["name"])


def google_sintesi(testo: str, voce: str, path: Path, chiave: str):
    d = google_post("text:synthesize", {
        "input": {"text": testo},
        "voice": {"languageCode": "it-IT", "name": f"it-IT-Chirp3-HD-{voce}"},
        "audioConfig": {"audioEncoding": "MP3", "speakingRate": GOOGLE_RITMO, "sampleRateHertz": 24000},
    }, chiave)
    path.write_bytes(base64.b64decode(d["audioContent"]))

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

    # 7 · Sezione Puzzle Magico: nomi delle cose, degli adesivi e consegne.
    #     Il bambino di 3-5 anni non legge le opzioni: le ascolta col tasto
    #     altoparlante, quindi ogni nome deve avere la sua clip.
    if SOURCE_PUZZLE.exists():
        pz = SOURCE_PUZZLE.read_text(encoding="utf-8")
        for m in re.finditer(r'\["[^"]+",\s*"([^"]+)"\]', pz):      # ["🐻", "Orso"]
            add(m.group(1))
        for m in re.finditer(r'nome:\s*"([^"]+)"', pz):             # adesivi, scene, livelli
            add(m.group(1))
        for m in re.finditer(r'speak\?\.\(\s*"((?:[^"\\]|\\.)*)"', pz):
            add(m.group(1))

    # 8 · Righe fisse dell'interfaccia
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


async def render(text: str, path: Path, sem: asyncio.Semaphore, force: bool, motore: dict) -> str:
    if path.exists() and not force:
        return "skip"
    spoken = to_speech(text)
    if not spoken:
        return "empty"
    async with sem:
        for attempt in range(3):
            try:
                if motore["nome"] == "google":
                    await asyncio.to_thread(google_sintesi, spoken, motore["voce"], path, motore["chiave"])
                else:
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
    ap.add_argument("--motore", choices=["edge", "google"], default="edge")
    ap.add_argument("--voce", default=GOOGLE_VOCE, help="voce Chirp 3 HD (solo --motore google), es. Leda")
    args = ap.parse_args()

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    motore = {"nome": args.motore, "voce": args.voce}
    if args.motore == "google":
        motore["chiave"] = google_chiave()
    elif edge_tts is None:
        sys.exit("edge-tts non trovato. Esegui: pip3 install edge-tts")

    if args.demo and args.motore == "google":
        out = ROOT / "public" / "audio" / "_demo"
        out.mkdir(exist_ok=True)
        try:
            voci = google_voci(motore["chiave"])
        except RuntimeError as e:
            sys.exit(f"Google TTS ha risposto: {e}\nControlla che nel progetto Google Cloud sia attiva "
                     "l'API Cloud Text-to-Speech e che la fatturazione sia collegata (resta gratis "
                     "fino a 1 milione di caratteri al mese).")
        print(f"Voci Chirp 3 HD italiane disponibili: {len(voci)}")
        for nome in voci:
            v = nome.split("-")[-1]
            f = out / f"google-{v}.mp3"
            google_sintesi(to_speech(DEMO_PHRASE), v, f, motore["chiave"])
            normalize(f)
            print(f"  {f.relative_to(ROOT)}")
        print("\nAscoltale e scegli: poi --voce <Nome> --force (o cambia GOOGLE_VOCE qui sopra).")
        return

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

    jsx = "\n".join(p.read_text(encoding="utf-8") for p in SOURCES)
    texts = collect(jsx)

    # chiave = testo a schermo col nome tolto; più testi diversi possono
    # convergere sulla stessa chiave (es. saluti con nomi diversi)
    manifest: dict[str, str] = {}
    for t in texts:
        manifest[tts_key(t)] = file_name(tts_key(t))
    manifest = {k: v for k, v in sorted(manifest.items()) if k}

    if args.motore == "google":
        print(f"Voce: Google Chirp 3 HD {args.voce}  ·  ritmo {GOOGLE_RITMO}")
    else:
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
        render(k, AUDIO_DIR / v, sem, args.force, motore) for k, v in manifest.items()
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
