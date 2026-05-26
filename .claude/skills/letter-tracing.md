---
name: letter-tracing
description: Implementa il componente letter tracing SVG per bambini 3-4 anni in MondoMago
---

# Skill: letter-tracing

Sei un esperto di UX per bambini piccoli e SVG animations. Implementa il letter tracing per MondoMago, priorità massima per fascia 3-4 anni.

## Contesto progetto
- App: `src/MondoMago.jsx` (React+Vite, ~4600+ righe)
- Target: bambini 3-4 anni, sfide con `ageMin: 3` e tipo `letter_trace` (nuovo formato da aggiungere)
- youngBg (light mode): attivo per età ≤ 5 — usarlo per questo componente
- Font: Fredoka One (già installato via @fontsource)

## Specifiche tecniche letter tracing

### Approccio consigliato
- SVG path per ogni lettera maiuscola (A-Z) e alcune minuscole
- `stroke-dasharray` + `stroke-dashoffset` animazione CSS per "guida" tratto
- Touch/mouse events per tracciare il percorso del bambino
- Confronto path: tolleranza generosa (±30px) per bambini piccoli
- Feedback visivo immediato: verde ✓ per tratto corretto, blu pallido per guida

### Struttura sfida letter_trace
```js
{
  id: "lt_A", // lt_ prefix
  type: "letter_trace",
  ageMin: 3,
  ageMax: 5,
  stars: 1,
  letter: "A",        // lettera da tracciare
  uppercase: true,
  word: "Arancia",    // parola associata
  wordEmoji: "🍊",
  prompt: "Traccia la lettera A come in Arancia!",
  tts: ["tts_trace_A.mp3"]
}
```

### Componente LetterTracer
Props: `{ letter, onComplete, youngBg }`

Comportamento:
- Mostra lettera in grande come guida grigia trasparente
- Punto di partenza evidenziato (cerchio verde pulsante)
- Frecce direzionali sui tratti principali
- Traccia dell'utente sovrapposta in blu/viola
- Al completamento: animazione stelle + feedback companion
- Bottone "Riprova" visibile
- NO timer — bambini piccoli hanno bisogno di tempo

### Integrazione in MondoMago
1. Aggiungere `letter_trace` all'array dei tipi gestiti nel render delle sfide
2. Aggiungere il check `isLetterTrace = challenge.type === 'letter_trace'`
3. Renderizzare `<LetterTracer>` quando `isLetterTrace`
4. Gestire `next()` al completamento (stessa logica degli altri formati)
5. Aggiungere sfide `lt_*` nel mondo Biblioteca (ageMin 3-4) o nuovo sotto-mondo

### Lettere prioritarie (iniziare con queste)
A, M, O, I, E (vocali + M facile), poi: L, T, S, C, R

### Considerazioni UX bambini 3-4 anni
- Stroke minimo 8px (dita piccole, imprecise)
- Tolleranza ±40px dal path ideale
- Feedback sonoro immediato (usa speak())
- No penalità per errori — solo incoraggiamento
- Animazione guida lenta (2s per tratto)
- Colori vivaci su sfondo chiaro (youngBg sempre attivo)

## Processo da seguire
1. Mostra design del componente (ASCII mockup) per approvazione
2. Implementa SVG paths per le 5 vocali + M
3. Integra in MondoMago.jsx
4. Aggiunge 6 sfide lt_* nel mondo Biblioteca
5. Test su Chrome DevTools → iPhone 14 Pro touch
6. `npm run build` — verifica zero errori
