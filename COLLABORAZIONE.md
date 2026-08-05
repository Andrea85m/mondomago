# 🤝 Guida alla collaborazione — MondoMago

Come lavorare in due sullo stesso progetto senza pestarsi i piedi.

> **Aggiornata il 2026-08-05.** La versione precedente (giugno) diceva che "la grafica vive
> in file separati, quindi git non genera conflitti". **Non è più vero**: da luglio tutto il
> design system *"Sigillo di Stelle"* è **dentro `src/MondoMago.jsx`**. Le regole qui sotto
> sostituiscono quelle vecchie.

---

## Divisione del lavoro

| Persona | Ambito | Dove |
|---------|--------|------|
| **Andrea** | **Contenuti + logica di gioco**: sfide, mondi, motore adattivo, SRS, stato | `ALL_CHALLENGES` e il corpo logico di `MondoMago()` |
| **Amico** | **Grafica + Audio**: look, animazioni, schermate, icone, scene, suoni | file grafici separati **+ le zone 🎨 dentro `MondoMago.jsx`** |

⚠️ **La differenza rispetto a prima:** il confine non è più "file diversi" ma **zone di righe
diverse dentro lo stesso file**. Leggi la §3 prima di scrivere una riga.

---

## 0. Setup iniziale (una volta sola)

```bash
git clone https://github.com/Andrea85m/mondomago.git
cd mondomago
npm install          # node_modules non è nel repo
npm run dev          # http://localhost:5173
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
# 5. apri la Pull Request su GitHub
```

**Nomi branch:** `feature/grafica-...` · `feature/audio-...` · `feature/mondo-<nome>-...` · `fix/<cosa>`

---

## 2. Le 4 regole d'oro anti-conflitto

1. **Pull prima di iniziare**: `git pull origin master` ogni volta che ricominci.
2. **PR piccole e frequenti**: meglio 3 PR da 50 righe che 1 da 500.
3. **Una zona a testa**: se ti serve toccare una zona dell'altro o una 🔴 condivisa, **avvisatevi prima**.
4. **Riallinea spesso**: se la PR resta aperta più di un giorno, `git merge master` sul tuo branch.

---

## 3. 🗺️ Mappa delle zone di `src/MondoMago.jsx` (7528 righe)

Le righe sono indicative e **si spostano** a ogni modifica: orientati sui **nomi**, non sui numeri.

| Zona | Righe ~ | Owner | Note |
|------|---------|-------|------|
| `import` | 1–6 | ⚪ raro | Coordinarsi solo se si aggiunge un modulo |
| `AnimationStyles()` — tutte le `@keyframes` + CSS globale | 20–464 | 🎨 **Amico** | Cuore delle animazioni |
| `SigilloSky()` — backdrop notte incantata, parallax | 475–566 | 🎨 **Amico** | |
| `NavMap/NavBrain/NavFamily/NavSparkle` — icone tab-bar | 569–578 | 🎨 **Amico** | |
| `WORLD_COSTUMES`, `COMPANION_IMG` | 579–590 | 🔴 **condivisa** | `COMPANION_IMG` mappa `foglia→volpe`: **non rinominare** |
| `CompanionAvatar()` | 592–673 | 🎨 **Amico** | Vedi avvertenza sotto |
| `COMPANIONS`, `WORLDS`, `SKILLS`, `SKILL_MAP` | 676–1024 | 🔴 **condivisa** | Config: nomi, colori-mondo, testi companion |
| `ALL_CHALLENGES` — 362 sfide, 8 mondi | 1025–3219 | 🟢 **Andrea** | Blocchi per mondo: mondi diversi = zero conflitti |
| Token `FF_*` / `SG_*` / `P_*` — palette e font | 3221–3238 | 🎨 **Amico** | Design tokens del "Sigillo di Stelle" |
| Corpo di `MondoMago()`: state, `useEffect`, handler, `triggerOK`/`triggerBAD`, motore adattivo | 3240–4371 | 🟢 **Andrea** | Logica di gioco |
| **Blocchi di render `if (screen === "...") return (...)`** — TUTTE le schermate | **4372–7528** | 🎨 **Amico** | Il grosso del lavoro grafico |

### Le schermate (zona 🎨, tutte contigue da 4372 in poi)

`consent` 4372 · `profile_select` 4399 · `onboarding` 4434 · `name` 4528 · `age` 4561 ·
`companion` 4598 · `companion_welcome` 4630 · **`map` 4667** · `coplay_intro` 5147 ·
`world_intro` 5178 · `fulmine` 5208 · **`challenge` 5326** · `world_end` 6281 ·
`session_stats` 6413 · `story_book` 6474 · `skills` 6564 · `family` 6604 · `cosmetics` 6643 ·
`school` 6730 · `profile` 6811 · `parent` 6886

### ⚠️ Regole per chi lavora nelle zone 🎨 dentro `MondoMago.jsx`

- **Cambia come appare, non cosa fa.** Nei blocchi di render puoi toccare `style`, classi,
  markup, icone, animazioni. **Non** rinominare variabili di stato, handler (`onClick={...}`)
  o chiavi del profilo: quelli sono la zona di Andrea.
- **Serve un nuovo pezzo di stato** (es. una variabile per una nuova animazione)? **Chiedi ad
  Andrea** invece di aggiungerlo da solo: sta nelle sue righe e genera conflitto.
- **`CompanionAvatar`**: le prop `mood` / `talking` / `anim` sono **pilotate dalla logica**
  (`triggerOK`, `triggerBAD`, level-up, timer idle). Puoi cambiare *come* si esprimono, non i
  nomi dei valori (`idle/happy/excited/sad/celebrating/thinking`).
- I companion sono **PNG claymation senza faccia controllabile** (la SVG-face fu rimossa di
  proposito): la vita si dà col **movimento**, non riaprendo la faccia.

---

## 4. File 100% grafica/audio (nessun conflitto possibile)

🎨 **Grafica**
- `src/icons.jsx` — **33 glyph custom + `WorldIcon`/`Icon`/`SkillIcon`/`RankIcon`**. Linguaggio:
  *"silhouette pergamena + 1 accento colore"*.
- `src/WorldScene.jsx` — 8 scene-mondo SVG animate (`SCENE_MAP`)
- `src/SvgAssets.jsx` — asset SVG delle sfide (usato dal formato `visual_tap`)
- `src/App.css`, `src/index.css`
- `public/favicon.svg`, `public/icons.svg`, `public/icon-*.png`, `public/apple-touch-icon.png`
- `public/characters/*_cutout.png` — i 5 companion claymation
- `public/screenshots/`, `scripts/gen-screenshots.mjs`

🔊 **Audio**
- `public/audio/` — `song_*.mp3`, `tts_*.mp3`
- `src/ttsMap.json` — manifest TTS (**aggiungere voci in fondo** per evitare conflitti)
- `scripts/gen-songs-musical.py`, `gen-songs.py`, `gen-tts.py`, `suno-prompts.md`

Ridisegnare SVG, ritoccare CSS, sostituire audio = **operazioni libere**.
Serve coordinarsi **solo** se si *rinomina* un asset → va aggiornato il riferimento in `MondoMago.jsx`.

---

## 5. 🚧 Trappole note (leggere prima di perderci un pomeriggio)

- **`.screen-enter` deve restare `backwards`, NON `both`** (righe 130, 285-286). Con `both` il
  fill-mode lascia un transform residuo che crea un *containing block* per i `position:fixed`
  → tutte le modali-celebrazione si centrano nel container-schermata invece che nel viewport
  (appaiono in fondo). Bug già corretto: **non tornare indietro.**
- **`Icon` è shadowato a riga 4953**: dentro `[[NavMap,"Mondi"],...].map(([Icon,label]) => ...)`
  il nome `Icon` copre quello importato. Non usare `<Icon name="..."/>` dentro quel `.map`.
- **Glyph su fondi chiari**: i glyph hanno silhouette `PARCH` hardcoded (pensata per fondi
  **scuri**). Su un CTA oro pieno renderebbero cream-su-oro = contrasto basso. Usa un glyph a
  fill unico scuro, oppure togli l'icona.
- **Emoji "tofu" (□) negli screenshot Linux headless** = falso allarme, sul telefono si vedono.
- **`npm run lint` è rotto a monte**: manca `eslint.config.js`. Problema pre-esistente, non è
  colpa tua — non perderci tempo.
- **Performance**: il sito live è a **Lighthouse 97 / 100 / 100**. Prima di una PR grossa lato
  grafica: `npm run lighthouse` (locale) e non far scendere il punteggio.
- **Smoke test Playwright** va lanciato **dalla cartella del progetto** (altrove non risolve
  `playwright`).

---

## 6. Deploy — lo fa UNA persona sola

```bash
gh auth setup-git     # una volta sola, serve a gh-pages
npm run deploy        # build + push su gh-pages
```

- Si deploya **solo da `master` aggiornato**, dopo aver mergiato le PR. Mai da un branch.
- **Una persona alla volta.** Non si "sceglie quale lavoro tenere": si mergiano entrambi.
- Il bundle è splittato in `index-*.js` (app) + `vendor-*.js` (React+confetti). L'hash di
  `vendor` **deve restare stabile** tra i deploy: cambia solo se si tocca React o le dipendenze.
  È ciò che fa risparmiare ~200KB a ogni aggiornamento agli utenti PWA.
- Se cambi `CACHE_CORE` in `public/sw.js`, è una modifica **condivisa**: accordatevi.
- **Se la build di GitHub Pages resta bloccata in "building"** (è già successo, >1h):
  ```bash
  git checkout gh-pages && git commit --allow-empty -m "force rebuild" \
    && git push origin gh-pages && git checkout master
  ```

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
- [ ] Commit piccoli → push → PR
