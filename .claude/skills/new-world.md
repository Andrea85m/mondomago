---
name: new-world
description: Progetta e implementa un nuovo mondo completo in MondoMago (sfide, sblocco, bilanciamento, TTS)
---

# Skill: new-world

Sei un designer di contenuti educativi e sviluppatore MondoMago. Progetta e implementa nuovi mondi bilanciati per bambini italiani 3-8 anni.

## Contesto progetto
- App: `src/MondoMago.jsx` (React+Vite single-file)
- 7 mondi esistenti, ogni mondo ha: id, name, icon, color, description, requiredStars, challenges[]
- Companions: Fiamma🐉, Luna🦄, Onde🐬, Foglia🦊 (assegnati per mondo)
- Il mondo 8 pianificato: "Logica & Codice" (Pixel robot 🤖)

## Struttura mondo (oggetto JS)
```js
{
  id: "nome_mondo",
  name: "Nome Visibile",
  icon: "🎯",           // emoji rappresentativa
  color: "#RRGGBB",     // colore tema HEX
  description: "Breve descrizione avventura",
  requiredStars: 0,     // stelle necessarie per sbloccare (0 = sempre aperto)
  companion: "fiamma",  // fiamma|luna|onde|foglia (o nuovo)
  challenges: [/* array sfide */]
}
```

## Bilanciamento per mondo
- **Minimo**: 12 sfide per mondo
- **Distribuzione età consigliata**: 3 sfide ageMin:3, 4 sfide ageMin:4-5, 3 sfide ageMin:6, 2 sfide ageMin:7
- **Distribuzione difficoltà**: 4 sfide stars:1, 5 sfide stars:2, 3 sfide stars:3
- **Varietà formati**: usare almeno 4 formati diversi tra i 7 disponibili
- **Progressione**: sfide più facili prima (ordine per ageMin+stars)

## Processo da seguire

### Fase 1 — Design (mostrare all'utente prima di implementare)
1. Proponi tema, id, nome, colore, icona, companion
2. Elenca 12-15 sfide con: id, tipo, ageMin, stars, prompt (testo breve), risposta
3. Mostra distribuzione età e difficoltà in tabella
4. Attendi approvazione dell'utente

### Fase 2 — Implementazione
1. Leggi la struttura worlds[] in MondoMago.jsx (cerca `const worlds = [`)
2. Trova l'ultimo mondo e aggiungi dopo
3. Scrivi le sfide complete con tutti i campi
4. Aggiorna `src/ttsMap.json` con tutti i nuovi testi TTS
5. Verifica che `requiredStars` sia coerente con la progressione
6. `npm run build` — verifica zero errori

### Fase 3 — Checklist post-implementazione
- [ ] ID unici (nessun duplicato)
- [ ] tts[] referenzia solo file presenti in ttsMap.json
- [ ] ageMin/ageMax sensati per difficoltà
- [ ] Almeno 4 formati sfida usati
- [ ] Companion assegnato
- [ ] requiredStars bilanciato con la curva di difficoltà del gioco
- [ ] Build pulita

## Nota sul Mondo 8 — Logica & Codice
Tema: pensiero computazionale, sequenze, pattern, debug semplice.
Companion pianificato: Pixel 🤖 (da aggiungere come 5° companion).
Formati prioritari: sequence_tap (sequenze algoritmo), drag_drop (blocchi codice), multiple_choice (debug).
Target: ageMin 5-8, gap di mercato italiano.
