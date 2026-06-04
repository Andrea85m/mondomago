# 📊 Report — Espansione sfide adattive & analisi competitor (giugno 2026)

Branch: `feature/sfide-adattive-all-worlds`

## 1. Cosa è stato fatto

### 1a. +48 nuove sfide su tutti gli 8 mondi (314 → 362)
Espansione mirata sui buchi reali emersi dalla gap-analysis (vedi `scripts/validate-challenges.mjs`):

| Buco individuato | Intervento |
|---|---|
| **Fascia 7-8 sotto-servita** (3-6 sfide/mondo) | +3-4 sfide 7-8 per mondo: moltiplicazione/divisione, sottrazione a 2 step, sillogismi, ordinamento, sinonimi/contrari, comprensione del testo |
| **Creatività debolissima** (1-4/mondo) | +1 sfida creatività per mondo (mescolanza dei colori: rosso+giallo=arancione, ecc.) |
| **Empatia sottile** (2-6/mondo) | +1 dilemma SEL `story_choice` per mondo (aiutare un cerbiatto, liberare una tartaruga dalla plastica, consolare un amico spaventato…) |
| **Laboratorio mono-skill** (solo coding) | aggiunte numeri, creatività ed empatia in chiave robot/Pixel |

Distribuzione 7-8 dopo l'intervento (≈ raddoppiata ovunque):
`foresta 4→8 · castello 3→7 · oceano 3→7 · mercato 3→7 · galassia 3→7 · vulcano 6→10 · biblioteca 6→10 · laboratorio 9→11`

### 1b. Motore di selezione ADATTIVO per competenza (non solo età)
Prima: `filterByAge` filtrava **solo per età** e mescolava a caso. Le skill venivano tracciate ma **ignorate** nella scelta delle sfide.

Ora (`filterByAge(worldId, age, skills)`):
- **Bias verso la skill più debole** — le sfide della competenza con mastery più basso hanno più probabilità di uscire (random × livello). Un bimbo debole in *numeri* riceve ~2× sfide di numeri (misurato: **2.98 vs 1.50** a sessione). Retrocompatibile: senza `skills` → comportamento originale.

### 1c. Ripetizione spaziata (SRS) — il differenziatore
- Le sfide **sbagliate** vengono registrate (`triggerBAD` → `noteMiss`) e **riproposte in una sessione successiva** (spacing ≥ 1 sessione), poi rimosse quando superate (`triggerOK` → `clearMiss`).
- Stato `missed` persistito per profilo. Implementato con **2 soli punti di cattura** (i choke point universali `triggerBAD`/`triggerOK`) per minimizzare il rischio.

## 2. Test eseguiti (tutti verdi)

| Test | Strumento | Esito |
|---|---|---|
| Integrità dati (id unici, indici `correct` in range, campi obbligatori, coerenza età) | `node scripts/validate-challenges.mjs` | ✅ 362 sfide valide |
| Bias adattivo per skill + spacing SRS | `node scripts/test-adaptive.mjs` | ✅ 6/6 asserzioni |
| Compilazione produzione | `npm run build` | ✅ build pulita (634 KB) |
| Runtime (boot → mappa → mondo → risposte) | Playwright headless | ✅ nessun errore runtime |

> Nota: `npm run lint` è rotto a monte (manca `eslint.config.js`, richiesto da ESLint 9). Non causato da queste modifiche — da sistemare a parte.

## 3. Confronto con i competitor (sintesi della ricerca)

**Insight chiave:** *nessun leader 0-8 implementa una vera adattività per padronanza (mastery).* Khan Academy Kids e Lingokids fanno "sbagli → rinforzo / indovini → avanzi"; ABCmouse la pubblicizza ma le recensioni la dicono lineare. Spaced repetition sui contenuti sbagliati **non la spedisce nessuno** in questa fascia. → È esattamente lo spazio in cui MondoMago può superarli, e ora **ci siamo dentro**.

| App | Adattività | SEL | Coding | Prezzo | Note |
|---|---|---|---|---|---|
| **Khan Academy Kids** | Percorso livellato responsivo (la migliore "reale") | Forte (Harvard EASEL) | No | **Gratis** | Dashboard genitori debole |
| **Lingokids** | Età + performance | Forte | Sì | ~75 $/anno | App di *inglese* di fondo |
| **Duolingo ABC** | Solo età all'avvio | No | No | Gratis | Solo lettura inglese |
| **ABCmouse** | "Individualizzata" (recensita come lineare) | Scarsa | Sì | ~45 $/anno | 13.000 attività; problemi di billing |
| **Smart Tales** (🇮🇹) | Story-driven STEAM | Media | Sì | Abbonamento | **Competitor italiano #1 da monitorare** |
| **ScratchJr / Osmo** | Nessuna (creazione) | No | Sì | Gratis / Hardware | Riferimento per il coding kids |
| **MondoMago (oggi)** | **Età + skill + SRS** | **Forte (mondo empatia)** | **Sì (Laboratorio)** | **Gratis** | + Italiano-first, offline, PWA |

### Pro di MondoMago vs il mercato
- **Gratis, senza ads/IAP** — pareggia i temibili (Khan, Duolingo ABC, ScratchJr) e batte i pay (Lingokids, ABCmouse, Smart Tales).
- **Italiano-first** — tutti i leader internazionali sono inglese-first; l'unico vero rivale locale è Smart Tales.
- **Offline + PWA** — niente store, caricamento istantaneo, zero attrito d'installazione.
- **6 skill incl. creatività + empatia + coding** — ampiezza moderna; l'empatia (SEL) è un cuneo di marketing.
- **Adattività per skill + SRS** — ora **davanti** a Khan/Lingokids/ABCmouse sulla dimensione che il mercato non ha risolto.

### Contro / gap ancora aperti
- **Nessuna dashboard genitori con insight per skill** — standard atteso (Montessori, ABCmouse, Lingokids). *Alto valore, basso sforzo: i dati esistono già lato client.*
- **Loop di retention leggero** — mancano streak gentili/ricompense regolari per il companion (Duolingo docet, ma in versione soft per i piccoli).
- **Volume e credenziali** — i competitor hanno migliaia di attività e partnership di ricerca; non si vince su volume ma su **focus (IT-first + mastery + gratis)**.
- **Architettura mono-file** — regge ora, ma dashboard + multi-profilo la metteranno sotto stress: pianificare la modularizzazione.

## 4. Roadmap per superare i top player (impatto ÷ sforzo)

**Tier 1 — fare subito (alto impatto, basso/medio sforzo)**
1. ✅ *(fatto)* Adattività per skill + SRS — già davanti al campo.
2. **Dashboard genitori** locale: barre di padronanza per skill, attività recenti, "prossima sfida consigliata". Batte la dashboard di Khan; i dati ci sono già (`sessionLog`, `skills`, `missed`).
3. **Difficoltà dinamica intra-skill**: promuovere/retrocedere il livello in base agli ultimi risultati (oltre alla fascia d'età).

**Tier 2 — alto impatto, sforzo medio**
4. **Loop di retention gentile**: missione del giorno, ricompense collezionabili per il companion, streak mostrato ai *genitori* (mai punitivo per il bimbo).
5. **Approfondire il mondo Empatia (SEL)**: naming delle emozioni, scenari espliciti (modello Harvard EASEL) — cuneo vs Smart Tales (più STEAM).
6. **Coding come puzzle guidati** (Pixel): differenziarsi da ScratchJr essendo *strutturato e con mastery*.

**Tier 3 — strategico**
7. Polish "delight" per sfida (reazioni del companion, micro-animazioni — modello Endless Alphabet).
8. Visibilità della base pedagogica (allineamento Indicazioni Nazionali) per la fiducia dei genitori.
9. Modularizzazione del file + code-splitting per mondo (oggi bundle ~634 KB monolitico).

## 5. File toccati
- `src/MondoMago.jsx` — +48 sfide, `filterByAge` adattivo, SRS (`missed`/`noteMiss`/`clearMiss`), persistenza profilo.
- `scripts/validate-challenges.mjs` *(nuovo)* — validatore + gap analysis riutilizzabile.
- `scripts/test-adaptive.mjs` *(nuovo)* — test della logica adattiva e SRS.
- `docs/REPORT-espansione-adattiva-2026-06.md` *(questo file)*.
