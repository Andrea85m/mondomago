---
name: add-challenge
description: Aggiunge nuove sfide a MondoMago con struttura corretta, TTS e bilanciamento età
---

# Skill: add-challenge

Sei un esperto del codebase MondoMago. Il tuo compito è aggiungere nuove sfide al gioco rispettando rigorosamente i pattern esistenti.

## Contesto progetto
- App: React+Vite PWA · sfide in `src/data/sfide.js` · mondi e compagni in `src/data/mondi.js` · logica e schermate in `src/MondoMago.jsx`
- Audio TTS: `public/audio/tts_*.mp3`, manifest in `src/ttsMap.json`
- Script generazione: `scripts/gen-tts.py` (edge-tts, voce Isabella Neural it-IT)
- Build: `npm run build` nella root del progetto

## 7 Mondi esistenti
| ID | Nome | Colore |
|----|------|--------|
| foresta | Foresta Magica | #4CAF50 |
| cielo | Cielo Stellato | #2196F3 |
| oceano | Oceano Profondo | #00BCD4 |
| montagna | Montagna Incantata | #FF9800 |
| giungla | Giungla Misteriosa | #8BC34A |
| vulcano | Vulcano Ardente | #F44336 |
| biblioteca | Biblioteca Arcana | #9C27B0 |

## 7 Formati sfida
| tipo | descrizione |
|------|-------------|
| `visual_tap` | tocca l'immagine corretta (usa emoji come imgs[]) |
| `multiple_choice` | 4 opzioni testo |
| `story_choice` | storia con 3 scelte narrative |
| `sequence_tap` | tocca in ordine (ordine nascosto) |
| `drag_drop` | trascina risposta nel target |
| `rhyme_complete` | completa la rima |
| `word_picture` | abbina parola a immagine (wp* prefix) |

## Struttura sfida (oggetto JS)
```js
{
  id: "xx_yyy_NNN",       // es: f_mc1, v_vt3, wp13
  type: "multiple_choice", // uno dei 7 formati
  ageMin: 4,              // 3, 4, 5, 6, 7 — RISPETTA questa scala
  ageMax: 8,
  stars: 2,               // 1=facile, 2=medio, 3=difficile
  prompt: "Quale animale è...",
  options: ["A","B","C","D"],  // per multiple_choice
  answer: "A",
  imgs: ["🦁","🐘","🐬","🦊"],  // per visual_tap
  hint: "Pensa a...",     // opzionale
  tts: ["tts_xxx.mp3"],   // array di file audio necessari
}
```

## Convenzioni ID
- Foresta: `f_*`, Cielo: `c_*`, Oceano: `o_*`, Montagna: `m_*`
- Giungla: `g_*`, Vulcano: `v_*` o `va_*`/`vb_*`, Biblioteca: `ba_*`
- word_picture: `wp01`–`wpNN`
- Numerare in sequenza dopo l'ultimo ID esistente nel mondo

## Convenzioni TTS
- Ogni stringa che il bambino deve sentire ha un file `tts_XXX.mp3`
- Formato chiave in ttsMap.json: `"testo italiano": "tts_NNN.mp3"`
- Per aggiungere TTS: aggiungere entries in `src/ttsMap.json`, poi rigenerare con `python scripts/gen-tts.py`

## Processo da seguire

1. **Leggi** le sfide esistenti nel mondo target (cerca `id: "f_"` o simili in src/data/sfide.js)
2. **Identifica** l'ultimo numero usato per continuare la sequenza
3. **Verifica** il bilanciamento ageMin/ageMax nel mondo (non sovraccaricare una fascia)
4. **Scrivi** le nuove sfide rispettando il formato
5. **Elenca** tutti i testi nuovi che richiedono TTS
6. **Aggiorna** `src/ttsMap.json` con le nuove entries
7. **Indica** all'utente di rigenerare i TTS con `python scripts/gen-tts.py`
8. **Build** con `npm run build` e verifica che non ci siano errori

## Output atteso
Mostra sempre:
- Sfide aggiunte (con ID e formato)
- Distribuzione ageMin nel mondo aggiornata
- Nuovi TTS da generare (lista testi)
- Comando per rigenerare audio
