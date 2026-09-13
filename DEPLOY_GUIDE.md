# MondoMago — Guida al deploy e alla pubblicazione

> Aggiornata il 2026-09-13. Il deploy di tutti i giorni è il passo 1; i passi
> 4-6 servono solo per pubblicare l'app su Google Play.

## 1. Pubblicare il sito (GitHub Pages)

```bash
git checkout master && git pull origin master
npm run deploy
```

`npm run deploy` fa, in ordine:

1. `npm run verifica` — lint, audit di esercizi e voce, build. Se qualcosa fallisce **si ferma e non pubblica**.
2. build con base `/mondomago/`;
3. `gh-pages -d dist --dotfiles --nojekyll` — push sul branch `gh-pages`.

I due flag non sono decorativi: senza `--dotfiles` la cartella `.well-known/`
non arriva sul branch, e senza `--nojekyll` GitHub Pages la nasconderebbe comunque.

Prima di pubblicare, con `npm run dev` acceso in un altro terminale:

```bash
npm run smoke     # l'app in un browser vero, dall'onboarding ai puzzle
npm run a11y      # accessibilità su tutte le schermate principali
```

Gli stessi controlli girano da soli su GitHub a ogni push e a ogni Pull Request
(`.github/workflows/ci.yml`).

URL live: https://andrea85m.github.io/mondomago/

## 2. Icone

Tutte le icone escono da un solo disegno, il Sigillo di Stelle:

```bash
node scripts/gen-icons.mjs
```

Genera `favicon.svg`, `icon-192.png`, `icon-512.png`, `icon-maskable-512.png`
(Android adattiva, contenuto nell'80% centrale) e `apple-touch-icon.png` (iOS, 180×180).
Per cambiare il simbolo si modifica lo script, non i PNG.

## 3. Screenshot per lo store e per l'installazione Android

```bash
npm run dev                          # in un altro terminale
node scripts/gen-screenshots.mjs
```

Apre l'app vera con un profilo dimostrativo e scatta a 1080×1920 in
`public/screenshots/`: mappa, abilità, introduzione di un mondo, sfida, puzzle,
vittoria, più la feature graphic 1024×500. La casualità è fissata, quindi due
esecuzioni danno le stesse immagini. Vanno rigenerati dopo ogni cambio grafico
visibile.

## 4. App Android (TWA con Bubblewrap)

```bash
npm install -g @bubblewrap/cli
mkdir mondomago-twa && cd mondomago-twa
bubblewrap init --manifest https://andrea85m.github.io/mondomago/manifest.json
#   Application ID: com.mondomago.app · App name: MondoMago
bubblewrap build          # → app-release-bundle.aab
```

### assetlinks.json — ⚠️ va sul dominio, non nella sottocartella

Android verifica il collegamento app ↔ sito leggendo **sempre**
`https://<dominio>/.well-known/assetlinks.json`, cioè dalla radice del dominio.
Il nostro sito vive in `/mondomago/`, quindi il file che sta in
`public/.well-known/` finisce su `andrea85m.github.io/mondomago/.well-known/`,
dove Android **non lo cerca**. Due strade:

- **Repo `Andrea85m.github.io`** (gratis): un secondo repository che pubblica solo
  `.well-known/assetlinks.json` alla radice di `andrea85m.github.io`.
- **Dominio proprio** (es. `mondomago.it`) puntato su GitHub Pages: il sito passa
  alla radice e il file in `public/.well-known/` basta così. In questo caso va
  tolto `base: '/mondomago/'` da `vite.config.js` e aggiornati i percorsi del manifest.

L'impronta da incollare al posto di `SOSTITUISCI_CON_SHA256_DEL_TUO_KEYSTORE`:

```bash
keytool -list -v -keystore android.keystore -alias android
```

Se l'app firma con **Play App Signing** (il default), l'impronta giusta è quella
della chiave di firma dell'app in *Play Console → Configurazione → Integrità dell'app*,
non quella del keystore locale. Si possono mettere entrambe nell'array.

Senza il file verificato l'app funziona lo stesso, ma mostra la barra degli
indirizzi di Chrome in alto.

## 5. Google Play Console

1. https://play.google.com/console → Crea app → MondoMago
2. Scheda dello store: testi da `STORE_LISTING.md`
3. Privacy policy: `https://andrea85m.github.io/mondomago/privacy-policy.html`
4. Target e contenuti: app rivolta a bambini sotto i 13 anni → programma *Famiglie*
5. Questionario IARC: tutte le domande su violenza/sesso/sostanze → No (atteso PEGI 3)
6. Screenshot e feature graphic da `public/screenshots/`
7. Carica `app-release-bundle.aab` → test interno → test chiuso → produzione

## 6. iPhone e iPad

Nessun App Store necessario: da Safari, *Condividi → Aggiungi alla schermata Home*.
L'icona è `apple-touch-icon.png`.

---

## Checklist prima del lancio su Play

- [ ] `npm run verifica`, `npm run smoke`, `npm run a11y` verdi
- [ ] Screenshot rigenerati dall'ultima versione
- [ ] `assetlinks.json` raggiungibile alla radice del dominio, con l'impronta giusta
- [ ] AAB firmato e caricato
- [ ] Scheda store e questionario IARC completi
- [ ] Provata su un Android vero e su un iPhone vero

## Checklist sui dispositivi veri

**Android (Chrome)**
- [ ] Installazione come app dalla barra degli indirizzi
- [ ] Wi-Fi spento: l'app si apre e si gioca
- [ ] La voce parte su tutti i tipi di sfida
- [ ] Tracciamento delle lettere col dito
- [ ] Tasto indietro: chiede conferma dentro una sfida, non chiude l'app
- [ ] Pressione lunga sull'icona → "Sfida del Giorno" apre la sfida

**iPhone / iPad (Safari)**
- [ ] Aggiunta alla schermata Home, si apre senza barre del browser
- [ ] L'audio parte dopo il primo tocco
- [ ] Trascinamento dei pezzi del puzzle
- [ ] Notch e barra in basso non coprono i bottoni

**Tablet (768px e oltre)**
- [ ] Layout che non si rompe, card non troppo larghe
