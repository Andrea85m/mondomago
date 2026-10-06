#!/usr/bin/env python3
"""
Versione in alta definizione delle immagini 3D usate dal Puzzle.

Le immagini 3D delle emoji sono di circa 220 px: bastano per un'icona, non per
un animale grande quanto lo schermo e tagliato a pezzi. Qui si ingrandiscono 4×
con Real-ESRGAN (modello x4plus-anime, adatto alle figure pulite in stile 3D
cartoon) e si salvano a 640 px in public/img/3d/emoji-hd/.

    python3 scripts/emoji-hd.py --esrgan /percorso/realesrgan-ncnn-vulkan

Real-ESRGAN ncnn-vulkan (licenza BSD-3): github.com/xinntao/Real-ESRGAN/releases
Senza --esrgan rigenera solo src/data/emojiHd.js dai file già presenti.
"""

import argparse
import re
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
EMOJI = ROOT / "public" / "img" / "3d" / "emoji"
HD = ROOT / "public" / "img" / "3d" / "emoji-hd"
LISTA = ROOT / "src" / "data" / "emojiHd.js"

# soggetti del Puzzle (TEMI in PuzzleMagico.jsx) + animali del Puzzle degli animali
EXTRA = ["🐔", "🐺", "🐻", "🐕", "🐘", "🦆", "🦉", "🐸", "🐴", "🐱", "🐮", "🦁"]


def codici() -> set[str]:
    mappa = dict(re.findall(r'"([^"]+)":"([0-9a-f-]+)"', (ROOT / "src/data/grafica3d.js").read_text()))
    src = (ROOT / "src/PuzzleMagico.jsx").read_text()
    emoji = [e for e, _ in re.findall(r'\["([^"]+)",\s*"([^"]+)"\]', src)] + EXTRA
    return {mappa.get(e) or mappa.get(e.replace("️", "")) for e in emoji} - {None}


def ingrandisci(esrgan: Path, cod: set[str]):
    with tempfile.TemporaryDirectory() as t:
        tin, tout = Path(t, "in"), Path(t, "out")
        tin.mkdir(); tout.mkdir()
        for c in cod:
            Image.open(EMOJI / f"{c}.webp").convert("RGBA").save(tin / f"{c}.png")
        subprocess.run([str(esrgan), "-i", str(tin), "-o", str(tout), "-n", "realesrgan-x4plus-anime", "-f", "png"],
                       cwd=esrgan.parent, check=True, capture_output=True)
        HD.mkdir(parents=True, exist_ok=True)
        for f in tout.glob("*.png"):
            im = Image.open(f).convert("RGBA")
            im = im.crop(im.getbbox())
            im.thumbnail((640, 640), Image.LANCZOS)
            im.save(HD / f"{f.stem}.webp", "WEBP", quality=82, method=4)


def scrivi_lista():
    cod = sorted(p.stem for p in HD.glob("*.webp"))
    LISTA.write_text(
        "// Generato da scripts/emoji-hd.py: le immagini 3D che hanno la versione HD.\n"
        f"export const EMOJI_HD = new Set({cod!r});\n".replace("'", '"'))
    print(f"{len(cod)} immagini HD · {sum(p.stat().st_size for p in HD.glob('*.webp')) / 1e6:.1f} MB")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--esrgan", type=Path)
    a = ap.parse_args()
    if a.esrgan:
        ingrandisci(a.esrgan, codici())
    scrivi_lista()
