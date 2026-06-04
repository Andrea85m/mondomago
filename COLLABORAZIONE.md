# 🤝 Guida alla collaborazione — MondoMago

Questo file spiega **come lavorare in due sullo stesso progetto senza pestarsi i piedi**.
L'app è quasi tutta in un unico file grande (`src/MondoMago.jsx`, ~6900 righe), quindi
serve un minimo di disciplina per evitare conflitti git.

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
- `feature/mondo-<nome>-...` → lavoro su un mondo (es. `feature/mondo-galassia-boss`)
- `feature/<area>-...`       → feature trasversale (es. `feature/dashboard-genitori`)
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

## 3. Mappa del file — chi tocca cosa

`src/MondoMago.jsx` è diviso così (le righe sono indicative, possono spostarsi):

| Zona | Righe ~ | Rischio | Note |
|------|---------|---------|------|
| `CompanionAvatar`, `COMPANIONS`, `WORLDS`, `SKILLS`, `SKILL_MAP`, `WORLD_COSTUMES` | 470–880 | 🔴 **CONDIVISA** | Toccatela solo coordinandovi. Aggiungere un companion/mondo qui impatta entrambi. |
| `ALL_CHALLENGES.<mondo> = [...]` | 880–1730+ | 🟢 **Sicura per mondo** | Mondi diversi = blocchi diversi = niente conflitti. Lavorate qui in parallelo liberamente. |
| Componente `App` + logica di render/gioco | 1800+ | 🟡 **Media** | Se modificate lo stesso schermo, coordinatevi. |

**Regola pratica:** finché ognuno aggiunge/modifica sfide nel **proprio mondo**
(blocco `ALL_CHALLENGES.<mondo>`), git fonde tutto in automatico.

---

## 4. File a parte (più facili da dividersi)
- `src/SvgAssets.jsx` — asset SVG
- `src/WorldScene.jsx` — scene dei mondi
- `src/ttsMap.json` — manifest TTS (occhio: append in fondo per evitare conflitti)
- `public/audio/` — audio (binari: NON modificabili in parallelo, coordinatevi)

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
