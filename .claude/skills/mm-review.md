---
name: mm-review
description: Code review specializzato per MondoMago — pattern comuni, bug noti, performance, accessibilità bambini
---

# Skill: mm-review

Sei un senior reviewer con conoscenza profonda di MondoMago. Esegui una code review mirata al contesto specifico di questa app.

## Contesto progetto
- App: `src/MondoMago.jsx` (React+Vite, ~4600+ righe, single-file)
- Target: bambini 3-8 anni → accessibilità e robustezza critiche
- Companions: Fiamma🐉, Luna🦄, Onde🐬, Foglia🦊
- Bug noti risolti in Fase J (non segnalare come nuovi)

## Checklist review MondoMago

### Bug pattern già visti (alta priorità se riappaiono)
- **Stale closure**: funzioni che catturano `currentIndex` o `profile` senza ref → verificare uso di `useRef` per `next()`
- **Double-call guard**: `advancingRef` deve bloccare chiamate doppie a `next()`
- **Infinite loop `_opts()`**: generatore sfide con guard 200 iterazioni
- **iOS Safari drag**: cursor pointer su elementi draggable
- **Timezone streak**: usare `parseDateLocal()` non `new Date(str)`
- **XSS nel report HTML**: `escapeHtml()` su tutti i `childName`

### Performance
- `useMemo` per `unlockedWorlds` con dep `[totalStars]` — verificare presenza
- `CompanionAvatar` blink: `clearTimeout` nel cleanup di `useEffect`
- Audio preload: verificare che TTS non blocchi il render
- Bundle size target: <500KB gzip

### Accessibilità bambini
- Bottoni touch: altezza minima 44px (verificare padding)
- `aria-label` su tutti i bottoni icon-only (🔊, ←)
- Font Fredoka One applicato a prompt sfide e feedback
- youngBg attivo per ageMin ≤ 5 su tutti gli schermi (non solo challenge)

### Struttura dati
- Sfide: `id` unico, `ageMin` ≤ `ageMax`, `stars` 1-3
- TTS: ogni file in `tts[]` deve esistere in `ttsMap.json`
- Profili: max 4 (bottone nascosto se `allProfiles.length >= 4`)
- Achievement: 14 totali — non duplicare ID

### PWA / offline
- SW v4: verifica `updatefound` banner in `index.html`
- `manifest.json`: shortcuts, icons 192+512, display standalone
- Font @fontsource: offline (no Google Fonts CDN)

### Sicurezza / privacy
- COPPA: consenso adulto prima di "Inizia" (checkbox)
- PIN reset: 2-step con conferma
- Report HTML: `escapeHtml()` attivo
- No dati trasmessi a server (tutto localStorage)

## Processo da seguire
1. Leggi le sezioni di codice modificate (non tutta l'app)
2. Applica la checklist sopra alle aree modificate
3. Segnala solo problemi reali con: file:riga, severità (critico/alto/medio/basso), fix suggerito
4. Non segnalare pattern che erano già presenti e non modificati
5. Concludi con: ✅ OK / ⚠️ problemi trovati (N)

## Severità
- **Critico**: crash, loop infinito, perdita dati, XSS
- **Alto**: bug funzionale visibile all'utente
- **Medio**: degraded UX, accessibilità, performance
- **Basso**: style, naming, ottimizzazione minore
