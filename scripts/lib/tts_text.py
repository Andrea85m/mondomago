#!/usr/bin/env python3
"""
Come si trasforma il testo dell'app in testo da leggere ad alta voce.

Vive in un modulo suo perché lo usano sia gen-tts.py (che registra gli MP3) sia
check-tts.py (che verifica la copertura). Se le due regole divergono, la app
chiede una voce con una chiave e il generatore ne ha registrata un'altra: il
bambino sente la voce di sistema.

La regola gemella in JavaScript sta in `ttsKey()` dentro src/MondoMago.jsx.
Le due devono restare allineate — c'è un test: `node scripts/check-tts.mjs`.
"""

import hashlib
import re
import unicodedata

# ── Simboli che vanno detti, non saltati ─────────────────────────────────────
# Senza questa tabella "3 × 4 = ?" diventava "3 4 ?" e la voce diceva "tre quattro".
SYMBOL_WORDS = [
    # "= ?" non è "uguale a?" ma la domanda vera: quanto fa.
    (r"\s*=\s*\?", " quanto fa?"),
    (r"\s*×\s*", " per "),
    (r"\s*÷\s*", " diviso "),
    (r"(?<=\d)\s*[-−]\s*(?=\d)", " meno "),
    (r"(?<=\d)\s*\+\s*(?=\d)", " più "),
    (r"\s*>=\s*", " maggiore o uguale a "),
    (r"\s*<=\s*", " minore o uguale a "),
    (r"\s*>\s*", " maggiore di "),
    (r"\s*<\s*", " minore di "),
    (r"\s*=\s*", " uguale a "),
    (r"(?<=\d)\s*%", " per cento"),
    (r"(?<=\d)\s*€", " euro"),
    (r"€\s*(?=\d)", "euro "),
    (r"(?<=\d)\s*°\s*C\b", " gradi"),
    (r"(?<=\d)\s*°", " gradi"),
    (r"\bkm/h\b", " chilometri all'ora"),
    (r"\bkm\b", " chilometri"),
    (r"_{2,}", "\x01"),   # segnaposto: i puntini di sospensione si rimettono alla fine
]

# ── Emoji-numero ─────────────────────────────────────────────────────────────
DIGIT_EMOJI = {
    "0️⃣": "zero", "1️⃣": "uno", "2️⃣": "due", "3️⃣": "tre", "4️⃣": "quattro",
    "5️⃣": "cinque", "6️⃣": "sei", "7️⃣": "sette", "8️⃣": "otto", "9️⃣": "nove",
    "🔟": "dieci",
}

# ── Emoji usate come SOSTANTIVO dentro la domanda ────────────────────────────
# Solo dopo "Quante/Quanti": lì l'emoji è il nome della cosa da contare e
# toglierla svuota la domanda ("Quante 🍎?" → "Quante?"). Altrove l'emoji è
# decorativa (il sostantivo c'è già scritto) e va tolta.
COUNT_NOUNS = {
    "🍎": "mele", "🍊": "arance", "🍋": "limoni", "🍇": "chicchi d'uva",
    "🍓": "fragole", "🍌": "banane", "⭐": "stelle", "🌟": "stelle",
    "✨": "stelline", "🌙": "lune", "🚀": "razzi", "🪐": "pianeti",
    "🐟": "pesci", "🐠": "pesci", "🐡": "pesci palla", "🐬": "delfini",
    "🦋": "farfalle", "🐝": "api", "🐦": "uccellini", "🦉": "gufi",
    "🐻": "orsi", "🦊": "volpi", "🐰": "coniglietti", "🐇": "coniglietti",
    "🌲": "alberi", "🌸": "fiori", "🌷": "tulipani", "🍄": "funghi",
    "🍂": "foglie", "🌿": "foglioline", "🔥": "fiamme", "🌋": "vulcani",
    "📚": "libri", "🏰": "castelli", "👑": "corone", "💎": "diamanti",
    "🪨": "sassi", "🧊": "cubetti di ghiaccio", "💧": "gocce", "🌊": "onde",
    "🐙": "polpi", "🦀": "granchi", "🐢": "tartarughe", "🐘": "elefanti",
}

_EMOJI_CLASS = (
    "\U0001F000-\U0001FAFF"
    "\U00002600-\U000027BF"
    "\U00002B00-\U00002BFF"
    "\U0001F1E6-\U0001F1FF"
    "\U00002190-\U000021FF"
    "️︎⃣‍⬅⬆⬇❤❗❓"
)
EMOJI_RE = re.compile(f"[{_EMOJI_CLASS}]+")
ANY_EMOJI = re.compile(f"[{_EMOJI_CLASS}]")

# ── Nome del bambino ─────────────────────────────────────────────────────────
# Il nome non si può pre-registrare. Invece di far intervenire la voce di
# sistema a metà frase (due timbri diversi nella stessa battuta), lo si toglie
# dal parlato: resta scritto sullo schermo.
NAME_TOKEN = "\x00NAME\x00"


def strip_name(text: str) -> str:
    """Toglie il segnaposto del nome e ricuce la punteggiatura."""
    t = text.replace(NAME_TOKEN, "")
    t = re.sub(r"\s*,\s*(?=[,.!?;:])", "", t)     # "Ciao , !" → "Ciao !"
    t = re.sub(r"([(\[])\s*[,;]\s*", r"\1", t)
    t = re.sub(r"^\s*[,;:!?.]+\s*", "", t)         # "! Che bello" → "Che bello"
    t = re.sub(r"\s+([,.!?;:])", r"\1", t)
    t = re.sub(r"\s{2,}", " ", t)
    return t.strip()


def to_speech(text: str) -> str:
    """Dal testo che sta a schermo al testo che la voce deve leggere."""
    t = str(text)
    t = t.replace("\\n", "\n")
    t = strip_name(t)

    # numeri-emoji prima di tutto: sono opzioni di risposta lette ad alta voce
    for emo, word in DIGIT_EMOJI.items():
        t = t.replace(emo, word)

    # "Quante 🍎?" → "Quante mele?"  (solo qui l'emoji è il sostantivo)
    def _count_noun(m):
        word = COUNT_NOUNS.get(m.group(2)) or COUNT_NOUNS.get(m.group(2).replace("️", ""))
        return f"{m.group(1)} {word}" if word else m.group(1)

    t = re.sub(rf"\b(Quant[ei])\s*([{_EMOJI_CLASS}]+)", _count_noun, t)

    # a capo → pausa. Se la riga finisce già con punteggiatura la si rispetta.
    t = re.sub(r"([.!?:;,])\s*\n\s*", r"\1 ", t)
    t = re.sub(r"\s*\n\s*", ", ", t)

    for pattern, repl in SYMBOL_WORDS:
        t = re.sub(pattern, repl, t)

    t = EMOJI_RE.sub(" ", t)

    # quel che resta di strano diventa spazio, ma si tengono accenti e apostrofi
    t = "".join(
        ch if (ch.isalnum() or ch in " .,!?:;'’\"-()àèéìòùÀÈÉÌÒÙ\x01" or unicodedata.category(ch).startswith("L"))
        else " "
        for ch in t
    )
    t = re.sub(r"\s+([,.!?;:])", r"\1", t)
    t = re.sub(r"([,.!?;:])\1+", r"\1", t)
    t = re.sub(r"\s{2,}", " ", t).strip()
    t = re.sub(r"^[,.;:!?\s]+", "", t)
    # via la punteggiatura rimasta orfana dove c'era solo un'emoji
    t = re.sub(r"[,;:]\s*$", "", t)
    t = re.sub(r"(?<=[?!])\s*\.\s*$", "", t)
    t = t.replace("\x01", "...")
    t = re.sub(r"\s+\.\.\.", "...", t)
    return t.strip()


def tts_key(text: str) -> str:
    """La chiave del manifest: il testo COSÌ COM'È a schermo, nome tolto."""
    return strip_name(str(text).replace("\\n", "\n"))


def file_name(key: str) -> str:
    return "tts_" + hashlib.md5(key.encode("utf-8")).hexdigest()[:8] + ".mp3"
