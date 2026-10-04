#!/usr/bin/env python3
"""
Prepara foto e versi del Puzzle degli animali.

    python3 scripts/prepara-animali.py scelte.json

scelte.json (una voce per animale):
    {
      "leone": {
        "foto": "/percorso/leone_foto1.jpg",
        "centro": [0.5, 0.45],        # punto da tenere al centro del ritaglio (frazioni)
        "zoom": 1.0,                  # >1 stringe sull'animale
        "verso": "/percorso/leone_verso1.ogg",
        "inizio": 0.0,                # secondo da cui parte il verso
        "durata": 3.0,                # al massimo 4 s
        "crediti": { "autore": "...", "licenza": "CC0", "pagina": "https://commons..." , "verso_autore": "...", "verso_licenza": "...", "verso_pagina": "..." }
      }
    }

Uscite:
    public/img/animali/<id>.webp        1200×720 (5:3, come il tabellone del puzzle)
    public/img/animali/<id>-mini.webp   320×320, per la griglia e l'album
    public/audio/versi/<id>.mp3         mono, -16 LUFS come la voce, dissolvenza finale
    public/img/animali/CREDITI.md       autore, licenza e pagina di ogni file
"""

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "public" / "img" / "animali"
VERSI = ROOT / "public" / "audio" / "versi"


def ritaglia(src: Path, centro, zoom, rapporto, lato_w):
    im = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    W, H = im.size
    # il ritaglio più grande con quel rapporto, poi stretto dello zoom
    if W / H > rapporto:
        ch = H / zoom; cw = ch * rapporto
    else:
        cw = W / zoom; ch = cw / rapporto
    cx, cy = centro[0] * W, centro[1] * H
    x0 = min(max(0, cx - cw / 2), W - cw)
    y0 = min(max(0, cy - ch / 2), H - ch)
    out = im.crop((round(x0), round(y0), round(x0 + cw), round(y0 + ch)))
    return out.resize((lato_w, round(lato_w / rapporto)), Image.LANCZOS)


def verso(src: Path, dest: Path, inizio: float, durata: float):
    durata = min(durata, 4.0)
    fade = min(0.4, durata / 4)
    af = (f"atrim=start={inizio}:duration={durata},asetpts=PTS-STARTPTS,"
          "silenceremove=start_periods=1:start_threshold=-45dB:detection=peak,"
          f"afade=t=out:st={max(0, durata - fade)}:d={fade},"
          "loudnorm=I=-16:TP=-1.5:LRA=11")
    r = subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", af,
                        "-ac", "1", "-ar", "44100", "-b:a", "64k", str(dest)], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(r.stderr[:300])


def main():
    scelte = json.loads(Path(sys.argv[1]).read_text())
    IMG.mkdir(parents=True, exist_ok=True)
    VERSI.mkdir(parents=True, exist_ok=True)
    righe = ["# Crediti — Puzzle degli animali", "",
             "Solo opere in pubblico dominio o CC0: nessun obbligo di attribuzione, ma",
             "le citiamo lo stesso. Rigenerare con `scripts/prepara-animali.py`.", "",
             "| Animale | Foto | Licenza | Verso | Licenza |", "|---|---|---|---|---|"]
    for aid, s in scelte.items():
        foto = ritaglia(Path(s["foto"]), s.get("centro", [0.5, 0.5]), s.get("zoom", 1.0), 5 / 3, 1200)
        foto.save(IMG / f"{aid}.webp", "WEBP", quality=80, method=6)
        mini = ritaglia(Path(s["foto"]), s.get("centro_mini", s.get("centro", [0.5, 0.5])), s.get("zoom_mini", s.get("zoom", 1.0) * 1.3), 1, 320)
        mini.save(IMG / f"{aid}-mini.webp", "WEBP", quality=78, method=6)
        verso(Path(s["verso"]), VERSI / f"{aid}.mp3", s.get("inizio", 0.0), s.get("durata", 3.0))
        c = s["crediti"]
        righe.append(f"| {aid} | [{c['autore']}]({c['pagina']}) | {c['licenza']} | "
                     f"[{c['verso_autore']}]({c['verso_pagina']}) | {c['verso_licenza']} |")
        kb = sum(f.stat().st_size for f in [IMG / f"{aid}.webp", IMG / f"{aid}-mini.webp", VERSI / f"{aid}.mp3"]) // 1024
        print(f"  {aid:9} {kb} KB")
    (IMG / "CREDITI.md").write_text("\n".join(righe) + "\n", encoding="utf-8")
    print(f"Crediti: {(IMG / 'CREDITI.md').relative_to(ROOT)}")


if __name__ == "__main__":
    main()
