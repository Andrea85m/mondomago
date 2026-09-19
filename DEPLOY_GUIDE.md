# MondoMago — Guida al deploy e alla pubblicazione

> Aggiornata il 2026-09-19. Il deploy di tutti i giorni è il passo 1; i passi
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

L'app Android è il sito dentro Chrome (Trusted Web Activity): ogni `npm run deploy`
aggiorna anche l'app, senza passare da Play. Si ricarica su Play solo se cambiano
nome, icona, indirizzo o permessi.

### Strumenti (una volta sola, già fatto sul Mac di Emilio il 2026-09-19)

```bash
npm install -g @bubblewrap/cli          # 1.25: targetSdk 36
# JDK 17 in ~/.bubblewrap/jdk, Android SDK in ~/.bubblewrap/android_sdk
bubblewrap doctor                       # deve dire "valid"
```

⚠️ In `~/.bubblewrap/android_sdk/platforms/` deve esserci **una sola** cartella
`android-36`. Con un doppione (`android-36-2`) Gradle fallisce con *Failed to find
target with hash string 'android-36'*, e il messaggio non lo dice.

### La chiave di firma — ⚠️ non si perde

`../mondomago-android-segreti/` (fuori dal repo, mai su git):
`upload-keystore.jks` + `password.env`. È la **chiave di caricamento**: con Play App
Signing la firma finale la mette Google. Va copiata in **due posti** (es. chiavetta +
gestore password). Se si perde, si chiede il reset al supporto Play (giorni di attesa).

Impronta SHA-256 della chiave di caricamento:
`12:18:70:F5:FB:0B:F8:62:CA:09:6D:91:30:68:60:5A:53:4B:49:4A:D6:D2:F2:C3:F9:C9:48:0D:8F:D6:EA:84`

### Generare APK e AAB

```bash
node scripts/android-twa.mjs                 # android/ per l'indirizzo attuale
node scripts/android-twa.mjs --versione 2    # dal secondo caricamento su Play in poi
cd android
set -a; . ../../mondomago-android-segreti/password.env; set +a
BUBBLEWRAP_KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD BUBBLEWRAP_KEY_PASSWORD=$KEY_PASSWORD \
  bubblewrap build --skipPwaValidation
```

Escono `app-release-bundle.aab` (**questo va su Play**) e `app-release-signed.apk`
(da installare a mano su un telefono per provarlo). L'indirizzo lo decide
`public/CNAME`: se c'è, l'app punta al dominio; se no, a `andrea85m.github.io/mondomago/`.

### assetlinks.json — deve stare alla radice del dominio

Android lo cerca **sempre** in `https://<dominio>/.well-known/assetlinks.json`. Sotto
`/mondomago/` non lo trova, e l'app mostra la barra degli indirizzi di Chrome in alto.
`public/.well-known/assetlinks.json` ha già l'impronta della chiave di caricamento; dopo
il primo caricamento su Play va **aggiunta** quella di *Play Console → Test e rilascio →
Configurazione → Integrità dell'app → Firma dell'app* (Play firma con la sua chiave).

### Passare al dominio proprio

1. Comprare il dominio (es. `mondomago.it`) e nel suo DNS creare:
   `A` @ → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   e `CNAME` www → `andrea85m.github.io`.
2. `echo mondomago.it > public/CNAME` → `npm run deploy`. Base, manifest e service worker
   passano alla radice da soli (`vite.config.js`).
3. Repo GitHub → Settings → Pages → Custom domain = `mondomago.it`, poi **Enforce HTTPS**
   (serve che il DNS sia propagato: da qualche minuto a qualche ora).
4. Verifica: `curl -I https://mondomago.it/` → 200 e
   `curl https://mondomago.it/.well-known/assetlinks.json` → il JSON con l'impronta.
5. `node scripts/android-twa.mjs` e build come sopra: l'app ora punta al dominio.
6. Aggiornare l'indirizzo della privacy in `STORE_LISTING.md` e `lighthouse:live` in `package.json`.

⚠️ **Il dominio è un'origine nuova**: i progressi salvati su `andrea85m.github.io` non lo
seguono. Chi gioca già dal browser riparte da zero (GitHub reindirizza il vecchio indirizzo
al nuovo). Meglio farlo **prima** di mandare l'app ai tester.

## 5. Google Play Console — passo per passo

Account **personale** → prima della produzione serve un **test chiuso con almeno 12 tester
che restano iscritti per 14 giorni di fila**. Il conto parte quando il dodicesimo accetta.

1. **Crea app**: nome `MondoMago: giochi educativi`, lingua predefinita Italiano, **App**
   (non gioco), **Senza costi**. Le dichiarazioni sulle norme: sì.
2. **Configura l'app** (la dashboard le elenca), risposte già pronte in `STORE_LISTING.md`:
   - Privacy policy → l'URL della privacy (§ Link di `STORE_LISTING.md`)
   - Accesso all'app → *Tutte le funzionalità sono disponibili senza restrizioni*, più la nota
     sul PIN (§ Accesso all'app)
   - Annunci → **No** · ID pubblicità → **No** (l'app non lo usa)
   - Classificazione dei contenuti → questionario IARC, categoria *Tutte le altre app*, tutto No
   - Pubblico di destinazione → **5 anni e meno** e **6-8 anni**; attrae i bambini: sì
   - App di notizie: No · Tracciamento dei contatti COVID: No · App governative: No ·
     Funzionalità finanziarie: nessuna · App per la salute: nessuna
   - Sicurezza dei dati → **Nessun dato raccolto né condiviso**
   - Categoria **Istruzione**, email di contatto, tag
   - Scheda dello store: titolo, descrizioni, icona 512, feature graphic, screenshot
3. **Test interno** (subito, senza revisione lunga): crea release → carica
   `app-release-bundle.aab` → accetta **Play App Signing** → aggiungi i tester interni
   (fino a 100 email). Serve a provarlo sui vostri telefoni dal Play Store vero.
4. Copia l'impronta SHA-256 di *Integrità dell'app → Firma dell'app* in
   `public/.well-known/assetlinks.json` (accanto a quella che c'è) → `npm run deploy`.
   Da qui la barra di Chrome sparisce anche nell'app scaricata da Play.
5. **Test chiuso**: crea traccia → stessa release → elenco tester = un Gruppo Google o
   una lista di email (almeno 12, meglio 15-20: se uno esce il conteggio si ferma) →
   invia per la revisione. Ai tester si manda il link di adesione della traccia.
6. Dopo 14 giorni con 12+ tester: **Richiedi l'accesso alla produzione** (domande su come
   è andato il test) → revisione, di solito qualche giorno per le app per bambini.

Dal secondo caricamento: `--versione 2`, `3`, … (Play rifiuta un numero già usato).

## 6. iPhone e iPad

Nessun App Store necessario: da Safari, *Condividi → Aggiungi alla schermata Home*.
L'icona è `apple-touch-icon.png`.

---


## Checklist prima del lancio su Play — stato al 2026-09-19

**Pronto e verificato**
- [x] Controlli verdi: lint, audit, smoke (avvio offline compreso), accessibilità 0 violazioni, CI GitHub
- [x] Chrome la considera installabile, manifest senza errori, service worker attivo
- [x] Lighthouse mobile sul sito live: Performance 90-93 · Accessibilità 100 · Best Practices 100
- [x] Icona 512, feature graphic 1024×500 e 6 screenshot 1080×1920 senza trasparenza
- [x] Privacy policy pubblica e raggiungibile dall'app (consenso e PIN genitori)
- [x] Nessun annuncio, nessun acquisto, nessuna chiamata di rete nel codice → Data safety "No"
- [x] *Ricomincia da capo* spostato nell'area genitori, dietro PIN (19 set)
- [x] Su tablet il contenuto sta in una colonna di 600px, sfondo a tutto schermo (19 set)
- [x] Chiave di caricamento creata, fuori dal repo; impronta in `assetlinks.json`
- [x] AAB e APK firmati: `com.mondomago.app`, versione 1.0.0 (1), targetSdk 36, solo permesso notifiche
- [x] Build pronta per il dominio proprio: basta `public/CNAME` (§4)

**Da fare — serve un account o un acquisto**
- [ ] Copia della chiave di firma in due posti
- [ ] Dominio comprato e collegato (§4 "Passare al dominio proprio"), poi AAB rigenerato
- [ ] Play Console: scheda, contenuti, Data safety (§5 punto 2)
- [ ] Nome sviluppatore pubblico ed email di contatto verificata dall'account Play
- [ ] Test interno → impronta di Play App Signing in `assetlinks.json` → deploy
- [ ] 12+ tester nel test chiuso per 14 giorni, poi richiesta di produzione
- [ ] Prova su almeno un Android vero, anche vecchio o tablet economico


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
