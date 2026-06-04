# 🤝 Guida alla collaborazione — MondoMago

Questo file spiega **come lavorare in due sullo stesso progetto senza pestarsi i piedi**.
L'app è quasi tutta in un unico file grande (`src/MondoMago.jsx`, ~6900 righe), quindi
serve un minimo di disciplina per evitare conflitti git.

---

## Divisione del lavoro (chi fa cosa)

| Persona | Ambito | File principali |
|---------|--------|-----------------|
| **Andrea** | **Contenuti**: mondi, sfide, testi, logica di gioco | `src/MondoMago.jsx` |
| **Amico** | **Grafica + Audio** | `src/SvgAssets.jsx`, `src/WorldScene.jsx`, `src/App.css`, `src/index.css`, `public/audio/`, `public/*.svg/png`, `public/screenshots/`, `src/ttsMap.json`, `scripts/gen-*` |

Questo split è quasi perfetto per lavorare in parallelo: la grafica e l'audio vivono
in **file separati** da `MondoMago.jsx`, quindi git non genera conflitti.

⚠️ **Unico punto di contatto:** quando un cambio grafico/audio richiede di aggiornare
un *riferimento* dentro `MondoMago.jsx` (il file dei contenuti). Casi tipici:
- `CompanionAvatar` (~riga 480) — se si ridisegnano gli avatar dei companion
- logica audio/TTS (`startSongAt`, `speakBrowser`, chiamate a `ttsMap.json`) — se si **rinomina** un file audio o si aggiunge una voce nuova

In questi casi: **avvisarsi prima** e mettersi d'accordo su chi tocca quella riga.

---

## 0. Setup iniziale (una volta sola, per chi clona)

```bash
git clone https://github.com/Andrea85m/mondomago.git
cd mondomago
npm install          # rigenera node_modules (non è nel repo)
npm run dev          # avvia in locale su http://localhost:5173
```

---

## 1. Il workflow: un branch per ogni lavoro

**Mai lavorare direttamente su `master`.** Ogni feature/fix vive su un suo branch
e arriva su `master` tramite Pull Request.

```bash
# 1. parti SEMPRE da master aggiornato
git checkout master
git pull origin master

# 2. crea il tuo branch
git checkout -b feature/mondo-oceano-sfide

# 3. lavora, fai commit piccoli e frequenti
git add -A
git commit -m "Oceano: 3 nuove sfide drag_drop"

# 4. pubblica il branch
git push -u origin feature/mondo-oceano-sfide

# 5. apri la Pull Request su GitHub e fatela revisionare dall'altro
```

### Nomi dei branch (convenzione)
- `feature/mondo-<nome>-...` → contenuti di un mondo (es. `feature/mondo-galassia`)
- `feature/grafica-...`      → lavoro grafico (es. `feature/grafica-companion`)
- `feature/audio-...`        → lavoro audio (es. `feature/audio-canzoni`)
- `fix/<cosa>`               → correzione bug (es. `fix/audio-ios`)

---

## 2. Le 4 regole d'oro anti-conflitto

1. **Pull prima di iniziare**: `git pull origin master` ogni volta che ricominci.
2. **PR piccole e frequenti**: meglio 3 PR da 50 righe che 1 da 500. Meno divergenza = meno conflitti.
3. **Un mondo a testa**: se entrambi serve toccare lo *stesso* mondo o le *zone condivise* (vedi §3), **avvisatevi prima** (messaggio/chat).
4. **Allinea il tuo branch spesso**: se la tua PR resta aperta più di un giorno, riallineala:
   ```bash
   git checkout master && git pull
   git checkout il-tuo-branch
   git merge master      # risolvi eventuali conflitti finché sono piccoli
   ```

---

## 3. Mappa di `MondoMago.jsx` — territorio CONTENUTI (Andrea)

Questo file è il dominio dei contenuti. L'Amico lo tocca solo nei punti di contatto (vedi §0).
È diviso così (le righe sono indicative, possono spostarsi):

| Zona | Righe ~ | Note |
|------|---------|------|
| `CompanionAvatar`, `COMPANIONS`, `WORLDS`, `SKILLS`, `SKILL_MAP`, `WORLD_COSTUMES` | 470–880 | 🔴 **Punto di contatto col grafico** (avatar). Coordinarsi prima di toccarla. |
| `ALL_CHALLENGES.<mondo> = [...]` | 880–1730+ | 🟢 Contenuti, dominio Andrea. Mondi diversi = blocchi diversi. |
| Componente `App` + logica di render/gioco/audio | 1800+ | 🟡 Logica di gioco + chiamate audio/TTS (punto di contatto con l'audio). |

---

## 4. Dominio GRAFICA + AUDIO (Amico) — file separati, niente conflitti

🎨 **Grafica**
- `src/SvgAssets.jsx` — tutti gli asset SVG
- `src/WorldScene.jsx` — scene dei mondi
- `src/App.css`, `src/index.css` — stili
- `public/favicon.svg`, `public/icons.svg`, `public/icon-192.png`, `public/icon-512.png`, `public/apple-touch-icon.png`
- `public/screenshots/`
- `scripts/gen-screenshots.mjs`

🔊 **Audio**
- `public/audio/` — canzoni (`song_*.mp3`) e voci TTS (`tts_*.mp3`)
- `src/ttsMap.json` — manifest TTS (aggiungere voci **in fondo** per evitare conflitti)
- `scripts/gen-songs-musical.py`, `gen-songs.py`, `gen-tts.py`, `suno-prompts.md`

**Regola pratica:** ridisegnare SVG, sostituire/migliorare audio e ritoccare CSS sono
operazioni libere (file separati). Serve coordinarsi **solo** se si *rinomina* un asset/file
audio o si aggiunge un companion/scena/voce nuovi → va aggiornato il riferimento in `MondoMago.jsx`.

---

## 5. Deploy — lo fa UNA persona sola

`npm run deploy` pubblica su GitHub Pages. Per evitare di sovrascrivere lavoro:
- **Si deploya solo da `master` aggiornato**, dopo aver mergiato le PR.
- **Una sola persona alla volta** lancia `npm run deploy`.
- Se cambiate la versione cache in `public/sw.js` (`CACHE_CORE`), è una modifica
  **condivisa**: mettetevi d'accordo su chi bumpa la versione.

---

## 6. Se nasce un conflitto (succede, niente panico)

```bash
git merge master            # git ti dice quali file sono in conflitto
# apri il file: cerca i marcatori <<<<<<<  =======  >>>>>>>
# tieni la versione giusta (spesso ENTRAMBE le modifiche), togli i marcatori
git add <file-risolto>
git commit                  # completa il merge
```

In caso di dubbio su una sfida: **due sfide diverse si tengono entrambe**, non si sceglie.

---

## Checklist rapida prima di ogni sessione
- [ ] `git checkout master && git pull origin master`
- [ ] `git checkout -b feature/...` (branch nuovo)
- [ ] So su quale mondo/area lavoro e l'altro lo sa
- [ ] Commit piccoli, push, PR
