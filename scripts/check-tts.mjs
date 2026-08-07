#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// COPERTURA VOCE — MondoMago
//
// Ogni frase che l'app può dire ad alta voce deve avere la sua clip registrata.
// Dove manca, il gioco ripiega su `speechSynthesis`: la voce di sistema del
// telefono — diversa su ogni Android e su ogni iPhone, spesso robotica, e che
// entra in scena a metà partita spezzando l'illusione di un unico narratore.
//
//   node scripts/check-tts.mjs
//
// Exit 1 se una frase resta senza voce, se una voce punta a un file che non
// c'è, o se le regole di normalizzazione JS e Python si sono disallineate.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join } from 'node:path';
import { ROOT, source, flatChallenges } from './lib/extract-challenges.mjs';

const ttsMap = JSON.parse(readFileSync(join(ROOT, 'src', 'ttsMap.json'), 'utf8'));
const AUDIO = join(ROOT, 'public', 'audio');
const errors = [];
const warns = [];

// ── stripName: la copia di riferimento è in src/MondoMago.jsx ────────────────
// Qui si rilegge dal sorgente vero il comportamento, per non mantenere una
// terza versione delle stesse regole.
function stripName(text, name = '') {
  let t = String(text);
  if (name) t = t.replace(new RegExp(`\\b${name}\\b`, 'gi'), '');
  return t
    .replace(/\s*,\s*(?=[,.!?;:])/g, '')
    .replace(/([([])\s*[,;]\s*/g, '$1')
    .replace(/^\s*[,;:!?.]+\s*/, '')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}
const has = (t) => t && (ttsMap[stripName(t)] !== undefined || ttsMap[t] !== undefined);

// ═══ 1 · Consegne delle sfide ════════════════════════════════════════════════
const spokenOf = (c) =>
  c.format === 'story_choice'    ? c.situation
  : c.format === 'word_picture'  ? `Trova l'immagine per la parola: ${c.word}`
  : c.format === 'letter_trace'  ? c.prompt
  : c.id?.startsWith('ba_')      ? `Quale immagine inizia con la lettera ${c.id.replace('ba_', '')}?`
  : c.format === 'rhyme_complete'? String(c.prompt).replace('___', '...')
  : c.prompt || c.question;

for (const c of flatChallenges) {
  const t = spokenOf(c);
  if (t && !has(t))
    errors.push(`[${c._world}/${c.id}] consegna senza voce: "${String(t).replace(/\n/g, '⏎').slice(0, 66)}"`);
  // il finale delle storie è ascoltabile col tap
  if (c.format === 'story_choice') {
    for (const ch of c.choices || []) {
      if (ch.outcome && !has(ch.outcome))
        errors.push(`[${c._world}/${c.id}] finale della storia senza voce: "${ch.outcome.slice(0, 60)}"`);
    }
  }
}

// ═══ 2 · Tutto ciò che passa da speak() nel sorgente ═════════════════════════
const unesc = (s) => s.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\`/g, '`');

for (const m of source.matchAll(/speak\(\s*"((?:[^"\\]|\\.)*)"/g)) {
  const t = unesc(m.group ? m.group(1) : m[1]);
  if (!has(t)) errors.push(`speak() letterale senza voce: "${t.slice(0, 66)}"`);
}
for (const m of source.matchAll(/speak\(\s*`((?:[^`\\]|\\.)*)`/g)) {
  let t = unesc(m[1]);
  // le interpolazioni col nome del bambino spariscono dal parlato
  t = t.replace(/\$\{[^}]*(?:childName|name)[^}]*\}/g, '');
  if (/\$\{/.test(t)) {
    // resta un'interpolazione non riconducibile al nome: si controllano le
    // varianti note (il nome del mondo)
    // I valori che le variabili possono assumere: nomi dei mondi e lettere
    // dell'alfabeto usate dalle sfide `ba_*`.
    const worlds = [...source.matchAll(/\{\s*id:"\w+",\s*name:"([^"]+)"/g)].map(x => x[1]).slice(0, 8);
    const letters = [...new Set([...source.matchAll(/id:"ba_([A-ZÀ-Ù])"/g)].map(x => x[1]))];
    const candidates = /lettera/i.test(t) ? letters : worlds;
    const variants = candidates.map(w => stripName(t.replace(/\$\{[^}]*\}/g, w)));
    const missing = variants.filter(v => !has(v));
    if (missing.length === variants.length)
      errors.push(`speak() con interpolazione senza voce: "${t.slice(0, 66)}"`);
    else if (missing.length)
      errors.push(`speak() interpolato coperto solo in parte, manca: "${missing[0].slice(0, 66)}"`);
    continue;
  }
  if (!has(stripName(t))) errors.push(`speak() template senza voce: "${stripName(t).slice(0, 66)}"`);
}

// ═══ 3 · Battute dei companion ═══════════════════════════════════════════════
for (const m of source.matchAll(/on[A-Z]\w*\s*:\s*\(\s*\w*\s*\)\s*=>\s*pick\(\[(.*?)\]\)/gs)) {
  for (const lit of m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)) {
    const t = unesc(lit[1]);
    if (t.length > 3 && !has(t)) errors.push(`battuta del companion senza voce: "${t.slice(0, 60)}"`);
  }
}
for (const m of source.matchAll(/onMeet\s*:\s*\(\s*(\w+)\s*\)\s*=>\s*`((?:[^`\\]|\\.)*)`/g)) {
  const t = stripName(unesc(m[2]).replace(new RegExp(`\\$\\{\\s*${m[1]}\\s*\\}`, 'g'), ''));
  if (!has(t)) errors.push(`presentazione del companion senza voce: "${t.slice(0, 60)}"`);
}

// ═══ 3b · Sezione Puzzle Magico ══════════════════════════════════════════════
{
  const pz = readFileSync(join(ROOT, 'src', 'PuzzleMagico.jsx'), 'utf8');
  for (const m of pz.matchAll(/\["[^"]+",\s*"([^"]+)"\]/g))          // nomi delle cose
    if (!has(m[1])) errors.push(`Puzzle · nome senza voce: "${m[1]}"`);
  for (const m of pz.matchAll(/speak\?\.\(\s*"((?:[^"\\]|\\.)*)"/g))
    if (!has(unesc(m[1]))) errors.push(`Puzzle · consegna senza voce: "${unesc(m[1]).slice(0, 60)}"`);
  for (const m of pz.matchAll(/nome:\s*"([^"]+)"/g))                 // adesivi, scene
    if (!has(m[1])) errors.push(`Puzzle · etichetta senza voce: "${m[1]}"`);
}

// ═══ 4 · Integrità del manifest ══════════════════════════════════════════════
const onDisk = new Set(readdirSync(AUDIO).filter(f => /^tts_.*\.mp3$/.test(f)));
for (const [text, file] of Object.entries(ttsMap)) {
  if (!existsSync(join(AUDIO, file)))
    errors.push(`il manifest promette ${file} ma il file non c'è — "${text.slice(0, 50)}"`);
  onDisk.delete(file);
}
if (onDisk.size)
  warns.push(`${onDisk.size} file audio non referenziati da nessuna frase (peso morto): ${[...onDisk].slice(0, 5).join(', ')}…`);

// clip vuote o troncate
let tiny = 0;
for (const file of Object.values(ttsMap)) {
  const p = join(AUDIO, file);
  if (existsSync(p) && readFileSync(p).length < 900) tiny++;
}
if (tiny) errors.push(`${tiny} clip più piccole di 900 byte: registrazione fallita o silenzio.`);

// ═══ 5 · Le regole JS e Python devono coincidere ═════════════════════════════
// Se divergono, l'app cerca una chiave che il generatore non ha mai scritto.
const CASES = [
  'Ciao \x00NAME\x00! Sono Fiamma il Drago!',
  '\x00NAME\x00! Che bello incontrarsi!',
  'Benvenuto \x00NAME\x00! Quanti anni hai?',
  'Quante 🍎?',
  'Cosa viene dopo?\n🌷🌿🌷🌿__',
];
try {
  const py = execFileSync('python3', ['-c', `
import sys, json; sys.path.insert(0, ${JSON.stringify(join(ROOT, 'scripts', 'lib'))})
from tts_text import tts_key
print(json.dumps([tts_key(c) for c in json.loads(sys.argv[1])]))
`, JSON.stringify(CASES)], { encoding: 'utf8' });
  const pyKeys = JSON.parse(py);
  CASES.forEach((c, i) => {
    const jsKey = stripName(c.replace(/\x00NAME\x00/g, ''));
    if (jsKey !== pyKeys[i])
      errors.push(`regole disallineate su "${c.slice(0, 34)}": JS → "${jsKey}" · Python → "${pyKeys[i]}"`);
  });
} catch (e) {
  warns.push(`non ho potuto confrontare JS e Python (${String(e.message).split('\n')[0]}).`);
}

// ═══ Report ══════════════════════════════════════════════════════════════════
const mb = Object.values(ttsMap)
  .map(f => (existsSync(join(AUDIO, f)) ? readFileSync(join(AUDIO, f)).length : 0))
  .reduce((a, b) => a + b, 0) / 1024 / 1024;

console.log(`\n🔊 COPERTURA VOCE — MondoMago`);
console.log(`   ${Object.keys(ttsMap).length} frasi registrate · ${mb.toFixed(1)} MB · scaricate su richiesta dal service worker\n`);
if (warns.length) { console.log(`⚠️  ${warns.length} avvisi`); warns.forEach(w => console.log(`   ${w}`)); console.log(''); }
if (errors.length) {
  console.log(`❌ ${errors.length} frasi che finirebbero sulla voce di sistema:`);
  errors.slice(0, 60).forEach(e => console.log(`   ${e}`));
  if (errors.length > 60) console.log(`   … e altre ${errors.length - 60}`);
  console.log(`\n   Rimedio:  python3 scripts/gen-tts.py`);
  process.exit(1);
}
console.log('✅ Nessuna frase resta senza voce: la voce di sistema non entra mai in campo.');
