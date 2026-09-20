#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// APP ANDROID (TWA) — genera il progetto Android in android/ dal manifest del sito.
//
//   node scripts/android-twa.mjs                  # host da public/CNAME, altrimenti github.io
//   node scripts/android-twa.mjs --versione 2     # ogni caricamento su Play vuole un numero nuovo
//   cd android && bubblewrap build --skipPwaValidation
//
// Il sito deve essere già online all'indirizzo scelto: le icone si scaricano da lì.
// La chiave di firma NON sta nel repo: ../mondomago-android-segreti/ (vedi DEPLOY_GUIDE §4).
// ─────────────────────────────────────────────────────────────────────────────

import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'android');
const SEGRETI = join(ROOT, '..', 'mondomago-android-segreti');

// @bubblewrap/core arriva con la CLI globale (npm i -g @bubblewrap/cli)
const globale = execSync('npm root -g').toString().trim();
const require = createRequire(join(globale, '@bubblewrap', 'cli', 'package.json'));
const { TwaManifest, TwaGenerator, ConsoleLog } = require('@bubblewrap/core');

const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined; };
const cname = join(ROOT, 'public', 'CNAME');
const host = arg('--host') || (existsSync(cname) ? readFileSync(cname, 'utf8').trim() : 'andrea85m.github.io');
const base = host.endsWith('.github.io') ? '/mondomago/' : '/';

// Il numero di versione non torna mai indietro: si parte da quello già in android/
const vecchio = join(OUT, 'twa-manifest.json');
const precedente = existsSync(vecchio) ? JSON.parse(readFileSync(vecchio, 'utf8')) : null;
const versione = Number(arg('--versione') || precedente?.appVersionCode || 1);

const webManifestUrl = new URL(`https://${host}${base}manifest.json`);
const webManifest = JSON.parse(readFileSync(join(ROOT, 'public', 'manifest.json'), 'utf8')
  .replaceAll('"/mondomago/', `"${base}`));

const twa = TwaManifest.fromWebManifestJson(webManifestUrl, webManifest);
Object.assign(twa, {
  packageId: 'com.magistella.app',
  name: 'Magistella',
  launcherName: 'Magistella',
  appVersionCode: versione,
  appVersionName: `1.0.${versione - 1}`,
  enableNotifications: true,        // promemoria giornaliero dall'area genitori
  fallbackType: 'customtabs',
  orientation: 'portrait',
  // percorso relativo ad android/: nel twa-manifest.json del repo non finiscono percorsi del Mac
  signingKey: { path: '../../mondomago-android-segreti/upload-keystore.jks', alias: 'mondomago' },
});

if (!existsSync(join(SEGRETI, 'upload-keystore.jks'))) {
  console.error(`✗ Manca la chiave di firma in ${SEGRETI}: senza quella stessa chiave Play rifiuta gli aggiornamenti.`);
  process.exit(1);
}

// Si rigenera da zero: tutto quello che serve sta in twa-manifest.json
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
await new TwaGenerator().createTwaProject(OUT, twa, new ConsoleLog('android'));
await twa.saveToFile(join(OUT, 'twa-manifest.json'));
// Senza questo file `bubblewrap build` chiede se rigenerare, e si blocca fuori da un terminale
const { computeChecksum } = require('@bubblewrap/cli/dist/lib/cmds/shared.js');
writeFileSync(join(OUT, 'manifest-checksum.txt'), computeChecksum(readFileSync(join(OUT, 'twa-manifest.json'))));

console.log(`\n✓ android/ per https://${host}${base} · versione ${twa.appVersionName} (${versione})`);
console.log('  Firma e build: cd android && bubblewrap build --skipPwaValidation');
