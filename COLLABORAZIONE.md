# 🤝 Guida alla collaborazione — MondoMago

Come lavorare in due sullo stesso progetto senza pestarsi i piedi.

> **Aggiornata il 2026-09-13.** `src/MondoMago.jsx` non è più un file unico da 7.700 righe:
> sfide, mondi e animazioni stanno in file propri (vedi §3). Il confine fra le zone resta
> quello di agosto, ma adesso buona parte coincide con file diversi, quindi i conflitti git
> sono molti meno. Da questa versione lint, audit, smoke test e accessibilità girano da soli
> su GitHub a ogni push (§6).

---

## Divisione del lavoro

| Persona | Ambito | Dove |
|---------|--------|------|
| **Andrea** | **Contenuti + logica di gioco**: sfide, mondi, motore adattivo, SRS, stato — **+ la schermata `map`** | `src/data/sfide.js`, il corpo logico di `MondoMago()`, il blocco `map` |
| **Amico** | **Grafica + Audio**: look, animazioni, schermate, icone, scene, suoni | file grafici separati **+ le zone 🎨 dentro `MondoMago.jsx`** (mappa esclusa) |

---

## 0. Setup iniziale (una volta sola)

```bash
git clone https://github.com/Andrea85m/mondomago.git
cd mondomago
npm install                        # node_modules non è nel repo
npx playwright install chromium    # il browser per smoke test e accessibilità
npm run dev                        # http://localhost:5173
```

Il branch di lavoro è **`master`** (è anche il default del repo).
⚠️ Il branch **`gh-pages` NON si tocca mai a mano**: contiene il build compilato che serve
il sito live, viene riscritto da `npm run deploy`.

---

## 1. Workflow: un branch per ogni lavoro

**Mai lavorare direttamente su `master`.**

```bash
git checkout master && git pull origin master   # 1. parti da master aggiornato
git checkout -b feature/grafica-schermata-skill # 2. branch nuovo
git add -A && git commit -m "Skill: card a Sigillo"  # 3. commit piccoli
git push -u origin feature/grafica-schermata-skill   # 4. push
# 5. apri la Pull Request su GitHub: i controlli partono da soli
```

**Nomi branch:** `feature/grafica-...` · `feature/audio-...` · `feature/mondo-<nome>-...` · `fix/<cosa>`

---

## 2. Le 4 regole d'oro anti-conflitto

1. **Pull prima di iniziare**: `git pull origin master` ogni volta che ricominci.
2. **PR piccole e frequenti**: meglio 3 PR da 50 righe che 1 da 500.
3. **Una zona a testa**: se ti serve toccare una zona dell'altro o una 🔴 condivisa, **avvisatevi prima**.
4. **Riallinea spesso**: se la PR resta aperta più di un giorno, `git merge master` sul tuo branch.

---

## 3. 🗺️ Mappa dei file e delle zone

### I file

| File | Cosa contiene | Owner |
|------|---------------|-------|
| `src/data/sfide.js` | `ALL_CHALLENGES` — 368 sfide, 8 mondi | 🟢 **Andrea** |
| `src/data/mondi.js` | `COMPANIONS` (con le battute), `STORY_ARCS`, `WORLDS`, `SIGILLO_FRAGMENTS`, `SIGILLO_STORY`, `SKILLS`, `SKILL_MAP` | 🔴 **condivisa** |
| `src/MondoMago.jsx` (~5.500 righe) | il componente `MondoMago()`: stato, logica, tutte le schermate | zone miste, vedi sotto |
| `src/AnimationStyles.jsx` | tutte le `@keyframes` e il CSS globale | 🎨 **Amico** |
| `src/sigillo.js` | token del design system (colori, font) + calcolo del contrasto WCAG | 🎨 **Amico** |
| `src/PuzzleMagico.jsx` | la sezione Puzzle, quattro giochi | 🎨 **Amico** |
| `src/icons.jsx`, `src/WorldScene.jsx`, `src/SvgAssets.jsx` | glyph, scene dei mondi, illustrazioni delle sfide | 🎨 **Amico** |
| `src/ErrorBoundary.jsx` | la schermata "Ops! La magia si è inceppata" | ⚪ raro |
| `src/util.js` | `pick()` e altri aiuti condivisi | ⚪ raro |

### Le zone dentro `src/MondoMago.jsx`

I numeri di riga cambiano a ogni commit: orientati sui **nomi** (cercali con ⌘F).

| Zona (in ordine nel file) | Owner | Note |
|------|-------|------|
| `import`, `MONETIZATION_ENABLED`, `TASTIERA` | ⚪ raro | `TASTIERA` rende usabili da tastiera i `div` cliccabili |
| `InstallBanner`, `triggerConfetti`, `CorrectBurst`, `SigilloSky`, `WorldAmbient`, `CompanionOrbit` | 🎨 **Amico** | |
| `NavMap/NavBrain/NavFamily/NavPuzzle/NavSparkle` — icone tab-bar | 🎨 **Amico** | |
| `COMPANION_IMG`, `CompanionAvatar()` | 🔴 condivisa / 🎨 | `COMPANION_IMG` mappa `foglia→volpe`: **non rinominare** |
| `FAMILY_MISSIONS`, `getSkill`, `SKILL_TIPS`, motore (`_rnd` … `getDailyChallenges`) | 🟢 **Andrea** | l'audit valuta questo codice vero: i nomi `function _rnd(min, max)` e `function initSkills()` non vanno cambiati |
| Voce e suoni (`speak`, `SFX`, musica, canzoni) | 🎨 **Amico** | |
| `PLAYER_LEVELS`, `COSMETICS`, `ACHIEVEMENTS`, salvataggi | 🟢 **Andrea** | |
| `LETTER_DATA`, `LetterTracer` | 🟢 / 🎨 | |
| Corpo di `MondoMago()`: state, `useEffect`, handler, `triggerOK`/`triggerBAD` | 🟢 **Andrea** | |
| Render — onboarding (`consent` … `companion_welcome`) | 🎨 **Amico** | |
| **Render — `map` + tab-bar** | 🟢 **Andrea** | ⚠️ **eccezione: la mappa se la tiene Andrea** |
| Render — tutte le altre schermate | 🎨 **Amico** | il grosso del lavoro grafico |

### ⚠️ La mappa è di Andrea (deciso il 2026-08-05)

La schermata `map` è l'unica eccezione allo split grafico: **la tiene Andrea**, l'Amico non
la tocca. Contiene: Sigillo di progresso · particelle e banner stagionali · saluto ora-del-giorno ·
stats row · card streak · barra XP + badge rango · Sfida del Giorno · Sfida Fulmine · **tab-bar** ·
percorso con i nodi dei mondi · card dei mondi con `WorldScene`.

**Punto di contatto:** le icone della tab-bar (`NavMap` …) sono dell'Amico ma vengono
*renderizzate* dentro la mappa. Ridisegnarle è libero e non genera conflitto: **avvisare** Andrea.

### ⚠️ Regole per chi lavora nelle zone 🎨 dentro `MondoMago.jsx`

- **Cambia come appare, non cosa fa.** Nei blocchi di render puoi toccare `style`, classi,
  markup, icone, animazioni. **Non** rinominare variabili di stato, handler (`onClick={...}`)
  o chiavi del profilo: quelli sono la zona di Andrea.
- **Serve un nuovo pezzo di stato?** Chiedi ad Andrea invece di aggiungerlo da solo.
- **`CompanionAvatar`**: `mood` / `talking` / `anim` sono pilotate dalla logica. Puoi cambiare
  *come* si esprimono, non i nomi dei valori (`idle/happy/excited/sad/celebrating/thinking`).
- I companion sono **PNG claymation senza faccia controllabile**: la vita si dà col **movimento**.
- **Un `div` cliccabile** vuole `role="button"`, un nome (`aria-label` o testo) e `{...TASTIERA}`.
  `npm run a11y` lo controlla.

---

## 4. File 100% grafica/audio (nessun conflitto possibile)

🎨 **Grafica**
- `src/AnimationStyles.jsx` — `@keyframes` e CSS globale
- `src/icons.jsx` — glyph custom + `WorldIcon`/`Icon`/`SkillIcon`/`RankIcon`. Linguaggio:
  *"silhouette pergamena + 1 accento colore"*.
- `src/WorldScene.jsx` — 8 scene-mondo SVG animate (`SCENE_MAP`)
- `src/SvgAssets.jsx` — asset SVG delle sfide (formato `visual_tap`)
- `src/sigillo.js` — token del design system. `etichettaLeggibile(colore)` restituisce
  sfondo e testo di un'etichetta piena con contrasto ≥ 4.5:1
- `src/PuzzleMagico.jsx` — la sezione Puzzle. Riceve `età`, `speak`, `sfx`, `onExit` come prop.
- `public/favicon.svg`, `public/icon-*.png`, `public/apple-touch-icon.png` —
  **si rigenerano** con `node scripts/gen-icons.mjs`, non si ritoccano a mano
- `public/characters/*_cutout.*` — i 5 companion claymation
- `public/screenshots/` — **si rigenerano** con `node scripts/gen-screenshots.mjs` (app vera, non mockup)

🔊 **Audio**
- `public/audio/` — `song_*.mp3`, `tts_*.mp3`
- `src/ttsMap.json` — manifest TTS (lo scrive `npm run voce`)
- `scripts/gen-songs-musical.py`, `gen-songs.py`, `gen-tts.py`, `suno-prompts.md`

Serve coordinarsi **solo** se si *rinomina* un asset → va aggiornato il riferimento nel codice.

---

## 4-bis. 🔔 Cose entrate nella zona di Andrea — da sapere

### Agosto 2026

| Dove | Cosa | Perché |
|---|---|---|
| `ALL_CHALLENGES` | `correct:` corretto su **fb02 o04 o06 m04 m06 g04 g06** | La risposta segnata giusta non era quella della sequenza. 4 di queste sono boss. |
| `ALL_CHALLENGES` | **fb10 · ob10 · lab26** ritoccate | Due rime che non rimavano e un "bug" che era la manovra corretta. |
| `ALL_CHALLENGES` | **o12 m12 g12 gb12 v12 b08** riscritte | Divisione e numeri oltre il 20 in fascia 5-6. |
| `ALL_CHALLENGES` | **mb01 · gb01**: 6 elementi da contare → 5 | A 3-4 anni si conta con sicurezza fino a 5. |
| `ALL_CHALLENGES` | **ps06 ps07** da 3×3 a 2×2; **ps08 ps09** ristrette a 7-8 | Il 3×3 è il puzzle del 15: richiede una strategia, non pazienza. |
| `ALL_CHALLENGES` | **6 sfide nuove `lab_a1…lab_a6`** per la fascia 3-4 | Il Laboratorio a 4 anni aveva 5 sfide in tutto. |
| `genMathChallenge` | ramo divisione | `72 ÷ 8 = ?` dava per giusto 72. |
| schermata `map` | tab-bar da 4 a 5 voci (arriva **Puzzle**) e pool della Sfida Fulmine | A 7-8 anni la Fulmine partiva con zero domande. |
| stato `coins` | `onMonete` dalla sezione Puzzle | Vedi §4-ter: monete sì, stelle no. |

### Settembre 2026

| Dove | Cosa | Perché |
|---|---|---|
| salvataggio automatico del profilo | se manca `activeProfileId` lo assegna e salva | **Bug grave**: al primo avvio, e dopo "Ricomincia da capo", il profilo non veniva **mai** salvato. Ricaricando, il bambino ripartiva da "Come ti chiami?". Verificato anche sul sito live. Lo smoke test ora ricarica la pagina apposta. |
| nuovo `useEffect` "scorciatoia Sfida del Giorno" | legge `?action=daily` e avvia `startDaily()` | La scorciatoia del manifest (pressione lunga sull'icona) apriva l'app senza fare niente. |
| notifica giornaliera | icona con `import.meta.env.BASE_URL` | `/icon-192.png` su GitHub Pages dava 404. |
| stato iniziale | PIN, limite di tempo, orario promemoria, tutorial e stagione letti con `useState(() => …)` | Prima un effetto li leggeva dopo il primo render e scriveva i valori di default nel localStorage per un istante. |
| `nextRef.current = next` | ora in `useLayoutEffect` | Scrivere una ref durante il render è vietato da React 19; il comportamento è identico. |
| consiglio ai genitori | uno al giorno invece che estratto a ogni render | Il testo cambiava sotto le dita mentre il genitore toccava le impostazioni. |
| tab Famiglia | etichette e bottone con contrasto ≥ 4.5:1 | Testo bianco su ambra a 2.1:1: illeggibile per chi vede poco. |
| titoli delle schermate | `h2` → `h1` (aspetto identico) | Il lettore di schermo non trovava il titolo della pagina. |
| `eslint-disable` con motivo | una trentina, ognuno col perché dopo `--` | Pattern voluti (reset di stato, casualità una volta per sfida): React Compiler non è in uso. |
| `public/sw.js` — navigazioni | la shell dell'app si serve dalla cache anche con `?source=pwa` / `?action=daily` | **Bug grave**: offline, l'app installata non si apriva (cercava `'/'`, che sotto `/mondomago/` è la radice del dominio). Trovato sul sito live; lo smoke ora lo prova sul build. |
| schermata di consenso e PIN genitori | link all'informativa privacy | Richiesto da Google Play per le app per bambini, in posti che il bambino non tocca. |
| `vite.config.js` | sfide e mondi in un chunk `dati` | Il chunk principale scende da 543 a 444 KB. Con l'aggiornamento di sicurezza di Vite l'hash di `vendor` è cambiato una volta. |
| `ALL_CHALLENGES`, `WORLDS`, … | spostati in `src/data/` **senza cambiare una virgola** | Verificato: HTML identico carattere per carattere su 8 schermate, stesse 697 frasi registrate, stesso audit. |

`npm run audit` rimette in piedi i controlli sugli esercizi: **exit 1** se una risposta torna
sbagliata, se una fascia d'età resta senza sfide, o se una frase perde la voce registrata.

---

## 4-ter. 🧩 La sezione Puzzle

Quattro giochi in `src/PuzzleMagico.jsx`, sulla falsariga di *Puzzle Kids — Jigsaw
Puzzles* di RV AppStudios: **Ombre** (sagome) · **Costruttore** (tessere) ·
**Indovina** (si scopre poco alla volta) · **Incastro** (puzzle vero con le linguette).

- Le immagini sono le 8 scene di `WorldScene.jsx` e le illustrazioni di
  `SvgAssets.jsx`: **zero asset nuovi**.
- Il file è caricato con `lazy()`: 9KB gzip che arrivano solo quando si apre la
  sezione, così il bundle di avvio non cambia. Se si rompe, un `ErrorBoundary`
  riporta alla mappa invece di spegnere tutta l'app.
- I progressi (adesivi) stanno in un `localStorage` suo — `mondomago_puzzle_v1` —
  e non toccano il profilo del bambino.

### Le ricompense: monete sì, stelle no

Un puzzle vinto paga **monete** (1 Facile → 4 Mago, tetto 20 al giorno) e **non**
stelle:

- Le **stelle** aprono i mondi e fanno salire di grado. Se le desse anche il puzzle,
  un bambino potrebbe arrivare al Laboratorio senza aver mai risolto una sfida, e il
  motore adattivo — che si tara su *come* risponde — resterebbe al buio.
- Le **monete** comprano solo cosmetici: nessun cancello, nessuna scorciatoia.

È la stessa separazione che Duolingo tiene fra XP e gemme. Il **tetto giornaliero**
esiste perché senza, il puzzle diventa una macchinetta da monete.

---

## 5. 🚧 Trappole note (leggere prima di perderci un pomeriggio)

- **`.screen-enter` deve restare `backwards`, NON `both`** (in `AnimationStyles.jsx`). Con
  `both` il fill-mode lascia un transform residuo che crea un *containing block* per i
  `position:fixed` → le modali-celebrazione si centrano nel container invece che nel viewport.
- **Non rimettere `!activeProfileId` nella guardia del salvataggio automatico**: è il bug
  che per mesi ha fatto perdere i progressi al primo avvio.
- **Service worker, navigazioni**: mai `cache.match('/')`. Sotto GitHub Pages `'/'` è la radice
  del dominio, non l'app. La shell si cerca con `self.registration.scope` e `ignoreSearch`.
- **`Icon` è shadowato nella tab-bar**: dentro `[[NavMap,"Mondi"],...].map(([Icon,label]) => ...)`
  il nome `Icon` copre quello importato. Non usare `<Icon name="..."/>` dentro quel `.map`.
- **Glyph su fondi chiari**: i glyph hanno silhouette `PARCH` pensata per fondi **scuri**.
  Su un CTA oro pieno usa un glyph a fill unico scuro, oppure togli l'icona.
- **Emoji "tofu" (□) negli screenshot Linux headless** = falso allarme, sul telefono si vedono.
- **`npm run lint` è severo** (`--max-warnings 0`). Se un pattern è voluto, si scrive
  `// eslint-disable-next-line <regola> -- il motivo`: senza motivo non passa la revisione.
- **I dati in `src/data/` li leggono anche gli script** (audit, voce): restano letterali puri,
  con `import` su una riga sola e niente JSX.
- **Gli id dentro gli SVG devono essere unici per istanza.** `url(#bg)` risolve sul primo
  elemento con quell'id in *tutto il documento*. Se aggiungi un gradiente o una `clipPath`,
  usa `useId()`.
- **`getBoundingClientRect()` su un `<g>` con `clip-path` restituisce il riquadro
  NON ritagliato.** Il centro di un pezzo di puzzle va calcolato dal `transform`.
- **Niente `playbackRate` sulle clip vocali**: la voce diventa metallica. La cadenza si decide
  in registrazione (`RATE` in `scripts/gen-tts.py`).
- **Performance**: prima di una PR grossa lato grafica, `npm run lighthouse` (con
  `npm run preview` acceso). Su macOS la varianza è alta: **3 misure e si guarda la mediana**.
  Il dato che non mente è la dimensione dei chunk in `dist/assets/`.

---

## 6. Controlli e deploy

### Prima di ogni PR

```bash
npm run verifica   # lint + audit esercizi e voce + build
npm run smoke      # con npm run dev acceso: l'app in un browser vero
npm run a11y       # con npm run dev acceso: accessibilità WCAG 2.1 AA
```

Su GitHub gli stessi controlli partono da soli a ogni push e a ogni PR
(`.github/workflows/ci.yml`). Una PR rossa non si mergia.

### Deploy — lo fa UNA persona sola

```bash
npm run deploy     # verifica → build → push su gh-pages
```

- Si deploya **solo da `master` aggiornato**, dopo aver mergiato le PR. Mai da un branch.
- Se `verifica` fallisce, il deploy **non parte**.
- Il bundle è splittato in `index-*.js` (app) + `vendor-*.js` (React+confetti). L'hash di
  `vendor` **deve restare stabile** tra i deploy: cambia solo se si tocca React o le dipendenze.
  È ciò che fa risparmiare ~200KB a ogni aggiornamento agli utenti PWA.
- Se cambi `CACHE_CORE` in `public/sw.js`, è una modifica **condivisa**: accordatevi.
- **Se la build di GitHub Pages resta bloccata in "building"** (è già successo, >1h):
  ```bash
  git checkout gh-pages && git commit --allow-empty -m "force rebuild" \
    && git push origin gh-pages && git checkout master
  ```

Pubblicazione su Google Play, icone e screenshot: **`DEPLOY_GUIDE.md`**.

---

## 7. Se nasce un conflitto (niente panico)

```bash
git merge master     # git dice quali file sono in conflitto
# cerca i marcatori <<<<<<<  =======  >>>>>>>
# tieni la versione giusta (spesso ENTRAMBE), togli i marcatori
git add <file-risolto>
git commit
```

In caso di dubbio su una sfida: **due sfide diverse si tengono entrambe**, non si sceglie.

---

## ✅ Checklist prima di ogni sessione

- [ ] `git checkout master && git pull origin master`
- [ ] `git checkout -b feature/...`
- [ ] So in quale **zona** lavoro (§3) e l'altro lo sa
- [ ] Commit piccoli → `npm run verifica` → push → PR verde
