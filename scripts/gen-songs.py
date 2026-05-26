#!/usr/bin/env python3
"""
Generate melodic pre-recorded audio for MondoMago songs.
Uses edge-tts SSML with prosody contour for a sung/melodic effect.
Voice: it-IT-ElsaNeural (more expressive than Isabella).
Output: public/audio/song_{world}_{line}.mp3  (64 files total)
"""

import asyncio
import html
import sys
from pathlib import Path

try:
    import edge_tts
except ImportError:
    sys.exit("edge-tts not found. Run: pip3 install edge-tts --break-system-packages")

AUDIO_DIR = Path("public/audio")
VOICE     = "it-IT-ElsaNeural"   # warm+expressive Italian female voice

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
}

# ── Per-world prosody: rate (% slower), pitch (% higher), contour arcs ────────
# Contour: (time%, +/-Nst) — pitch in semitones relative to baseline
# Even lines = "call" phrase → rising arc; odd lines = "response" → arch shape
WORLD_PROSODY = {
    "foresta": {
        "rate": "-28%", "pitch": "+8%",
        "even": "(0%,+2st)(25%,+5st)(55%,+7st)(80%,+5st)(100%,+2st)",
        "odd":  "(0%,+4st)(30%,+7st)(60%,+8st)(85%,+5st)(100%,+2st)",
    },
    "castello": {
        "rate": "-24%", "pitch": "+6%",
        "even": "(0%,+3st)(20%,+7st)(50%,+8st)(80%,+5st)(100%,+2st)",
        "odd":  "(0%,+5st)(25%,+8st)(60%,+9st)(85%,+5st)(100%,+2st)",
    },
    "oceano": {
        "rate": "-33%", "pitch": "+10%",
        "even": "(0%,+2st)(30%,+5st)(60%,+8st)(85%,+6st)(100%,+3st)",
        "odd":  "(0%,+4st)(35%,+7st)(65%,+9st)(88%,+5st)(100%,+2st)",
    },
    "mercato": {
        "rate": "-22%", "pitch": "+7%",
        "even": "(0%,+3st)(25%,+6st)(50%,+7st)(75%,+5st)(100%,+2st)",
        "odd":  "(0%,+4st)(28%,+7st)(55%,+8st)(80%,+5st)(100%,+2st)",
    },
    "galassia": {
        "rate": "-35%", "pitch": "+12%",
        "even": "(0%,+4st)(25%,+8st)(55%,+10st)(80%,+7st)(100%,+3st)",
        "odd":  "(0%,+6st)(30%,+9st)(60%,+11st)(85%,+7st)(100%,+3st)",
    },
    "vulcano": {
        "rate": "-25%", "pitch": "+5%",
        "even": "(0%,+1st)(20%,+5st)(50%,+7st)(78%,+4st)(100%,+1st)",
        "odd":  "(0%,+3st)(25%,+6st)(55%,+8st)(82%,+5st)(100%,+2st)",
    },
    "biblioteca": {
        "rate": "-30%", "pitch": "+9%",
        "even": "(0%,+3st)(30%,+6st)(60%,+8st)(84%,+5st)(100%,+2st)",
        "odd":  "(0%,+4st)(32%,+7st)(62%,+9st)(86%,+6st)(100%,+2st)",
    },
    "laboratorio": {
        "rate": "-22%", "pitch": "+6%",
        "even": "(0%,+2st)(25%,+5st)(52%,+7st)(78%,+4st)(100%,+1st)",
        "odd":  "(0%,+3st)(27%,+6st)(54%,+8st)(80%,+5st)(100%,+2st)",
    },
}

# ── SSML builder ──────────────────────────────────────────────────────────────
def make_ssml(text: str, rate: str, pitch: str, contour: str) -> str:
    safe = html.escape(text)
    return (
        "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='it-IT'>"
        f"<voice name='{VOICE}'>"
        f"<prosody rate='{rate}' pitch='{pitch}' contour='{contour}'>"
        f"{safe}"
        "</prosody></voice></speak>"
    )

# ── Generation ─────────────────────────────────────────────────────────────────
sem = None

async def gen_line(world: str, idx: int, text: str) -> None:
    fpath = AUDIO_DIR / f"song_{world}_{idx}.mp3"
    if fpath.exists():
        print(f"  skip  song_{world}_{idx}.mp3")
        return

    p = WORLD_PROSODY.get(world, {
        "rate": "-28%", "pitch": "+8%",
        "even": "(0%,+2st)(50%,+6st)(100%,+2st)",
        "odd":  "(0%,+4st)(50%,+8st)(100%,+2st)",
    })
    contour = p["even"] if idx % 2 == 0 else p["odd"]
    ssml = make_ssml(text, p["rate"], p["pitch"], contour)

    async with sem:
        try:
            comm = edge_tts.Communicate(ssml, VOICE)
            await comm.save(str(fpath))
            kB = fpath.stat().st_size // 1024
            print(f"  gen   song_{world}_{idx}.mp3  {kB}kB  {text[:38]!r}")
        except Exception as e:
            print(f"  ERROR song_{world}_{idx}.mp3: {e}")
            # Plain-text fallback (no contour, basic prosody via SSML)
            ssml_fb = (
                "<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='it-IT'>"
                f"<voice name='{VOICE}'><prosody rate='{p['rate']}' pitch='{p['pitch']}'>"
                f"{html.escape(text)}</prosody></voice></speak>"
            )
            try:
                comm = edge_tts.Communicate(ssml_fb, VOICE)
                await comm.save(str(fpath))
                print(f"  fallback song_{world}_{idx}.mp3")
            except Exception as e2:
                print(f"  FAIL  song_{world}_{idx}.mp3: {e2}")

async def main():
    global sem
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    sem = asyncio.Semaphore(4)  # 4 parallel requests

    tasks = [
        gen_line(world, idx, line)
        for world, lines in SONG_LINES.items()
        for idx, line in enumerate(lines)
    ]
    total = len(tasks)
    print(f"\nGenerating {total} melodic song files with {VOICE}…")
    print(f"Output: {AUDIO_DIR.resolve()}\n")
    await asyncio.gather(*tasks)

    generated = sum(1 for w, lines in SONG_LINES.items()
                    for i in range(len(lines))
                    if (AUDIO_DIR / f"song_{w}_{i}.mp3").exists())
    print(f"\n✅  {generated}/{total} song files ready in {AUDIO_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
