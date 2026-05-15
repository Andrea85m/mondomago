# MondoMago — Deploy Guide

## Step 1: Host the app (required before Play Store)

The app must be served from HTTPS. Options:

### Option A — GitHub Pages (free, recommended to start)
```bash
# 1. Build
npm run build

# 2. Push dist/ to gh-pages branch
npx gh-pages -d dist

# 3. In GitHub repo Settings → Pages → Source: gh-pages branch
# URL: https://[utente].github.io/mondomago/
```

### Option B — Netlify (free tier)
1. Drag & drop `dist/` folder to netlify.com/drop
2. Get a URL like `https://mondomago.netlify.app`

### Option C — VPS / dominio proprio
```bash
npm run build
rsync -av dist/ user@server:/var/www/mondomago/
```

---

## Step 2: Apple Touch Icon (iOS homescreen)

Create `public/apple-touch-icon.png` at 180×180 pixels.

**Quickest way** — resize the existing icon:
```bash
# Requires imagemagick
convert public/icon-512.png -resize 180x180 public/apple-touch-icon.png
```
Or open `public/icon-512.png` in any image editor, resize to 180×180, save as `apple-touch-icon.png`.

---

## Step 3: Screenshots for Play Store

Take 6-8 screenshots at 1080×1920 using Chrome DevTools:
1. Open `npm run dev` (or production URL)
2. Chrome DevTools (F12) → Toggle Device Toolbar → Dimensions: 1080×1920
3. Navigate to each screen and screenshot (Ctrl+Shift+P → "Capture screenshot")

Save to `public/screenshots/`:
- `screen-map.png` — mappa mondi
- `screen-challenge.png` — sfida in corso
- `screen-reward.png` — schermata ricompensa

---

## Step 4: Android TWA with Bubblewrap

```bash
# Install Bubblewrap
npm install -g @bubblewrap/cli

# Init TWA project (run from a new folder)
mkdir mondomago-twa && cd mondomago-twa
bubblewrap init --manifest https://[tuo-url]/manifest.json

# Follow prompts:
# - Application ID: com.mondomago.app
# - App name: MondoMago
# - Signing key: create new keystore

# Build APK / AAB
bubblewrap build

# Output: app-release-bundle.aab (upload to Play Store)
```

### Get SHA-256 fingerprint for assetlinks.json
```bash
keytool -list -v -keystore android.keystore -alias android -storepass [password]
# Copy the SHA-256 value and paste it in:
# public/.well-known/assetlinks.json → sha256_cert_fingerprints
```

Then redeploy so `https://[tuo-url]/.well-known/assetlinks.json` is accessible.

---

## Step 5: Google Play Console

1. Vai su https://play.google.com/console
2. Create new app → MondoMago
3. Fill store listing:
   - Copy/paste from `STORE_LISTING.md`
   - Privacy Policy URL: `https://[tuo-url]/privacy-policy.html`
4. Content rating → IARC questionnaire:
   - All violence/sexual/substance questions: NO
   - Directed at children under 13: YES
   → Risultato atteso: PEGI 3
5. Upload screenshots + feature graphic
6. Upload `app-release-bundle.aab`
7. Internal testing → Closed testing → Production

---

## Step 6: iOS (PWA install — no App Store needed)

iOS users can add MondoMago to homescreen from Safari:
- Share → "Aggiungi alla schermata Home"
- Requires `apple-touch-icon.png` (Step 2) for proper icon

For App Store submission: requires Xcode + Apple Developer Account ($99/year).
Recommended: ship Android first, then evaluate iOS.

---

## Pre-launch checklist

- [ ] App hosted on HTTPS
- [ ] `apple-touch-icon.png` created (180×180)
- [ ] 6+ screenshots ready
- [ ] Feature graphic 1024×500 ready
- [ ] `privacy-policy.html` publicly accessible
- [ ] `.well-known/assetlinks.json` deployed with correct SHA-256
- [ ] Bubblewrap AAB built and signed
- [ ] Play Console store listing complete
- [ ] IARC rating completed (PEGI 3)
- [ ] Tested on real Android device
- [ ] Tested on iOS Safari (PWA install)

---

## Real device testing checklist

### Android Chrome
- [ ] Install as PWA (omit bar → "Aggiungi a schermata Home")
- [ ] Offline mode: disable wifi → app still works
- [ ] Audio TTS plays on all challenge types
- [ ] Touch targets comfortable (44px+)
- [ ] Letter tracing works with finger
- [ ] Companion animations smooth (60fps)
- [ ] Back button shows exit confirm, doesn't close app

### iOS Safari
- [ ] Add to homescreen works
- [ ] Standalone mode (no browser chrome)
- [ ] Audio plays after first tap (iOS autoplay policy)
- [ ] Drag-drop works (iOS cursor:pointer)
- [ ] Safe area padding correct (iPhone notch)

### Tablet (768px+)
- [ ] Layout doesn't break on wide screens
- [ ] Cards not too wide
