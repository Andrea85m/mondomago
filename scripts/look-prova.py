#!/usr/bin/env python3
"""
Anteprima del look: ogni compagno, in ogni posa, con gli accessori addosso.

    python3 scripts/look-prova.py                 # tutti → .look/
    python3 scripts/look-prova.py luna            # un compagno solo
    python3 scripts/look-prova.py --oggetti hat_crown,acc_glasses

Usa la stessa geometria di src/data/look.js (posaOggetto) e gli stessi dati di
src/data/look.json: se cambi una, cambia l'altra. Serve a regolare i punti di
aggancio guardando il risultato vero invece di indovinare i numeri.
"""

import json
import math
import sys
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
LOOK = json.loads((ROOT / "src/data/look.json").read_text())
OUT = ROOT / ".look"
IMG = {"fiamma": "fiamma", "luna": "luna", "onde": "onde", "foglia": "volpe", "pixel": "pixel"}
POSE = ["base", "festa", "incoraggia"]
N = 420

COMBO_DEFAULT = [
    ["hat_crown", "acc_glasses"],
    ["hat_wizard", "acc_bow"],
    ["hat_party", "acc_moon"],
    ["hat_star", "acc_rainbow", "acc_lightning"],
    ["aura_fire"], ["aura_ice"], ["aura_gold"], ["aura_legend"],
]


def posa_oggetto(oid, cid, posa):
    o = LOOK["oggetti"][oid]
    a = LOOK["compagni"][cid].get(posa) or LOOK["compagni"][cid]["base"]
    xl, yl, xr, yr = a["occhi"]
    incl = math.degrees(math.atan2(yr - yl, xr - xl))
    tx, ty, lt = a["testa"]
    s = o["slot"]
    if s == "testa":
        w = lt * o["larg"]; h = w * o["ar"]
        return tx - w / 2, ty - o["appoggio"] * h, w, incl + o.get("rot", 0), False
    if s == "viso":
        d = math.hypot(xr - xl, yr - yl); w = d / o["lenti"]; h = w * o["ar"]
        cx, cy = (xl + xr) / 2, (yl + yr) / 2
        return cx - w / 2, cy - o["lentiY"] * h, w, incl, False
    if s == "fiocco":
        fx, fy, r = a["fiocco"]; w = o["larg"]; h = w * o["ar"]
        return fx - w / 2, fy - h / 2, w, r, False
    if s == "spalla" or (s == "aura" and o.get("suSpalla")):
        sx, sy = a["spalla"]; w = o["larg"]; h = w * o["ar"]
        return sx - w / 2, sy - h / 2, w, 0, False
    if s == "sfondo":
        w = o["larg"]; h = w * o["ar"]; base = (yl + yr) / 2 + o["sottoOcchi"]
        return tx - w / 2, base - h, w, 0, True
    if s == "aura":
        w = o["larg"]; h = w * o["ar"]
        if o.get("vicinoTesta"):
            cx, cy = tx + o["vicinoTesta"][0], ty + o["vicinoTesta"][1]
            return cx - w / 2, cy - h / 2, w, 0, False
        cx, cy = o["centro"]
        return cx - w / 2, cy - h / 2, w, 0, True
    raise ValueError(s)


def compagno(cid, posa):
    f = ROOT / (f"public/characters/{IMG[cid]}_cutout.png" if posa == "base" else f"public/img/3d/pose/{cid}_{posa}.webp")
    im = Image.open(f).convert("RGBA"); k = N / max(im.size)
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    t = Image.new("RGBA", (N, N), (0, 0, 0, 0)); t.alpha_composite(im, ((N - im.width) // 2, (N - im.height) // 2))
    return t


def incolla(tela, oid, cid, posa, pad):
    x, y, w, rot, _ = posa_oggetto(oid, cid, posa)
    o = LOOK["oggetti"][oid]
    im = Image.open(ROOT / f"public/img/3d/premi/{o['img']}.webp").convert("RGBA")
    W = max(1, round(w * N)); H = max(1, round(W * o["ar"]))
    im = im.resize((W, H), Image.LANCZOS)
    cx, cy = pad + (x * N) + W / 2, pad + (y * N) + H / 2
    if rot:
        im = im.rotate(-rot, resample=Image.BICUBIC, expand=True)   # CSS ruota in senso orario
    tela.alpha_composite(im, (round(cx - im.width / 2), round(cy - im.height / 2)))


def scena(cid, posa, combo, punti=False):
    pad = N // 5
    tela = Image.new("RGBA", (N + 2 * pad, N + 2 * pad), (58, 34, 144, 255))
    dietro = [o for o in combo if posa_oggetto(o, cid, posa)[4]]
    davanti = [o for o in combo if o not in dietro]
    for o in dietro: incolla(tela, o, cid, posa, pad)
    tela.alpha_composite(compagno(cid, posa), (pad, pad))
    for o in davanti: incolla(tela, o, cid, posa, pad)
    if punti:
        a = LOOK["compagni"][cid].get(posa) or LOOK["compagni"][cid]["base"]
        d = ImageDraw.Draw(tela)
        def p(x, y, c):
            X, Y = pad + x * N, pad + y * N; d.ellipse([X - 4, Y - 4, X + 4, Y + 4], outline=c, width=2)
        xl, yl, xr, yr = a["occhi"]; p(xl, yl, "red"); p(xr, yr, "red")
        p(a["testa"][0], a["testa"][1], "lime"); p(*a["fiocco"][:2], "magenta"); p(*a["spalla"], "cyan")
    return tela


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    comp = args or list(IMG)
    combo = COMBO_DEFAULT
    if "--oggetti" in sys.argv:
        combo = [sys.argv[sys.argv.index("--oggetti") + 1].split(",")]
        comp = [a for a in comp if a in IMG] or list(IMG)
    OUT.mkdir(exist_ok=True)
    for cid in comp:
        righe = [[scena(cid, posa, [], punti=True) for posa in POSE]]
        righe += [[scena(cid, posa, c) for posa in POSE] for c in combo]
        cw, ch = righe[0][0].size
        foglio = Image.new("RGB", (cw * len(POSE), ch * len(righe)))
        for r, riga in enumerate(righe):
            for c, im in enumerate(riga):
                foglio.paste(im.convert("RGB"), (c * cw, r * ch))
        foglio.thumbnail((1500, 99999))
        dest = OUT / f"{cid}.png"; foglio.save(dest); print(dest)


if __name__ == "__main__":
    main()
