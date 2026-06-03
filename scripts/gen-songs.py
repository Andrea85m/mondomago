#!/usr/bin/env python3
"""
Generate pre-recorded audio for MondoMago songs.
Uses edge-tts Communicate with native rate/pitch params — NO raw SSML.

Age-differentiated voices:
  • 3-5yr worlds (foresta, oceano, giardino): slow rate, bright pitch → very clear for toddlers
  • 5-6yr worlds (castello, mercato, biblioteca): medium pace, warm tone
  • 6-8yr worlds (galassia, vulcano, laboratorio): natural pace, dynamic delivery

Usage:
  python3 scripts/gen-songs.py           # skip existing files
  python3 scripts/gen-songs.py --force   # regenerate all files
"""

import asyncio
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts not found. Run: pip3 install edge-tts --break-system-packages")

AUDIO_DIR = Path("public/audio")
FORCE     = "--force" in sys.argv

# Primary voice — warm, clear Italian female narrator
VOICE_PRIMARY  = "it-IT-ElsaNeural"
# Secondary voice — slightly different timbre for young worlds
VOICE_BRIGHT   = "it-IT-IsabellaNeural"
# Dynamic male voice for dramatic/older worlds
VOICE_DYNAMIC  = "it-IT-DiegoNeural"

# ── Song lyrics (must match WORLD_SONGS in MondoMago.jsx) ────────────────────
SONG_LINES = {
    "foresta": [
        "Nella foresta magica canto,",
        "tra gli alberi verdi e il cielo incantato!",
        "Lo scoiattolo salta, l'uccello vola via,",
        "quante cose belle nella foresta mia!",
        "Uno, due, tre, quattro animali,",
        "volano le farfalle con le ali speciali!",
        "Nella foresta magica canto,",
        "la natura è bella — ho imparato tanto!",
    ],
    "castello": [
        "C'è un castello nel mezzo del cielo,",
        "con torri di pietra e un lungo mantello!",
        "Il cavaliere coraggioso parte,",
        "con il suo scudo e le sue arti!",
        "Uno, due, tre passi nel castello,",
        "ogni stanza nasconde qualcosa di bello!",
        "Sii coraggioso come il cavalier snello,",
        "e il castello diventerà il posto più bello!",
    ],
    "oceano": [
        "Nell'oceano profondo e blu,",
        "nuotano i pesci in su e in giù!",
        "Il polpo danza, il granchio cammina,",
        "la stella marina splende e scintilla!",
        "Uno, due, tre bolle nell'acqua,",
        "l'oceano è bello ogni mattina!",
        "Nuota con me nelle acque del blu,",
        "l'oceano ci aspetta, andiamo su!",
    ],
    "mercato": [
        "Al mercato colorato e bello,",
        "compro la frutta nel mio cestello!",
        "Rosse le mele, gialle le banane,",
        "arancio l'arancia, verdi le castagne!",
        "Uno, due, tre frutti nel cesto,",
        "conta con me — fai presto, fai presto!",
        "Al mercato colorato e bello,",
        "porta a casa tutto il cestello!",
    ],
    "galassia": [
        "Volo tra le stelle nel cielo blu,",
        "pianeti lontani e la luna lassù!",
        "La luna brilla, il sole scalda,",
        "nello spazio infinito che mi sbalorda!",
        "Uno, due, tre, quattro, cinque stelle,",
        "scintillano su nel cielo belle!",
        "Astronauta anch'io nel cielo blu,",
        "le stelle mi aspettano, ci volo su!",
    ],
    "vulcano": [
        "Il vulcano brontola e fa boom,",
        "la lava scende con il suo profumo!",
        "Il drago dorme nella montagna,",
        "si sveglia solo con la mattina!",
        "Uno, due, tre, il vulcano conta,",
        "ogni sfida vinta è una vetta che monta!",
        "Sei coraggioso come il drago vero,",
        "il vulcano magico è il tuo sentiero!",
    ],
    "biblioteca": [
        "In biblioteca tante parole,",
        "le lettere danzano come le viole!",
        "La A di aiuto, la B di bambino,",
        "la C di ciao e la D di destino!",
        "Leggo una pagina, poi un'altra ancora,",
        "in biblioteca il tempo vola!",
        "Le lettere magiche mi insegnano tanto,",
        "leggere è bello — è il mio canto!",
    ],
    "laboratorio": [
        "Nel laboratorio di Pixel il robot,",
        "il codice corre su ogni spot!",
        "Prima fai questo, poi fai quello,",
        "il programma funziona — è tutto bello!",
        "Uno, due, tre comandi in fila,",
        "Pixel danza a meraviglia!",
        "Nel laboratorio sei un campione,",
        "programmare è la tua missione!",
    ],
    "giardino": [
        "Nel giardino magico canto,",
        "tra i fiori colorati e il sole tanto!",
        "La farfalla vola, l'ape ronza via,",
        "quante cose belle nella natura mia!",
        "Uno, due, tre fiori sbocciati,",
        "ogni petalo rosa nei prati incantati!",
        "Nel giardino magico canto,",
        "la natura è bella — ho imparato tanto!",
    ],
}

# ── Per-world voice config ────────────────────────────────────────────────────
# Age groups:
#   young  (3-5yr): rate=-42..-48%, pitch=+22..+30Hz — very slow, bright
#   mid    (5-6yr): rate=-28..-36%, pitch=+12..+20Hz — clear, warm
#   older  (6-8yr): rate=-18..-26%, pitch=+6..+14Hz  — natural, dynamic
WORLD_VOICE = {
    # 3-5yr worlds — slowest, brightest
    "foresta":     {"voice": VOICE_BRIGHT,  "rate": "-42%", "pitch": "+26Hz"},
    "oceano":      {"voice": VOICE_BRIGHT,  "rate": "-46%", "pitch": "+30Hz"},
    "giardino":    {"voice": VOICE_BRIGHT,  "rate": "-44%", "pitch": "+28Hz"},
    # 5-6yr worlds — medium pace, warm
    "castello":    {"voice": VOICE_PRIMARY, "rate": "-32%", "pitch": "+16Hz"},
    "mercato":     {"voice": VOICE_PRIMARY, "rate": "-28%", "pitch": "+18Hz"},
    "biblioteca":  {"voice": VOICE_PRIMARY, "rate": "-36%", "pitch": "+20Hz"},
    # 6-8yr worlds — natural pace, more dynamic
    "galassia":    {"voice": VOICE_PRIMARY, "rate": "-24%", "pitch": "+14Hz"},
    "vulcano":     {"voice": VOICE_PRIMARY, "rate": "-22%", "pitch": "+8Hz"},
    "laboratorio": {"voice": VOICE_PRIMARY, "rate": "-18%", "pitch": "+6Hz"},
}

# ── Generation ────────────────────────────────────────────────────────────────
sem = None

async def gen_line(world: str, idx: int, text: str) -> None:
    fpath = AUDIO_DIR / f"song_{world}_{idx}.mp3"
    if fpath.exists() and not FORCE:
        print(f"  skip  song_{world}_{idx}.mp3")
        return

    cfg = WORLD_VOICE.get(world, {"voice": VOICE_PRIMARY, "rate": "-35%", "pitch": "+15Hz"})

    async with sem:
        try:
            comm = edge_tts.Communicate(text, cfg["voice"], rate=cfg["rate"], pitch=cfg["pitch"])
            await comm.save(str(fpath))
            kB = fpath.stat().st_size // 1024
            print(f"  gen   song_{world}_{idx}.mp3  {kB}kB  [{cfg['voice'].split('-')[2][:5]}] {text[:42]!r}")
        except Exception as e:
            # fallback to primary voice on failure
            if cfg["voice"] != VOICE_PRIMARY:
                try:
                    comm = edge_tts.Communicate(text, VOICE_PRIMARY, rate=cfg["rate"], pitch=cfg["pitch"])
                    await comm.save(str(fpath))
                    kB = fpath.stat().st_size // 1024
                    print(f"  fallback song_{world}_{idx}.mp3  {kB}kB")
                    return
                except Exception:
                    pass
            print(f"  FAIL  song_{world}_{idx}.mp3: {e}")

async def main():
    global sem
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(4)

    tasks = [
        gen_line(world, idx, line)
        for world, lines in SONG_LINES.items()
        for idx, line in enumerate(lines)
    ]
    total = len(tasks)
    mode = "FORCE regenerate" if FORCE else "skip existing"
    print(f"\nGenerating {total} song files ({mode})…")
    print(f"Voices: young={VOICE_BRIGHT}, mid+older={VOICE_PRIMARY}")
    print(f"Output: {AUDIO_DIR.resolve()}\n")
    await asyncio.gather(*tasks)

    generated = sum(1 for w, lines in SONG_LINES.items()
                    for i in range(len(lines))
                    if (AUDIO_DIR / f"song_{w}_{i}.mp3").exists())
    print(f"\n✅  {generated}/{total} song files ready in {AUDIO_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
