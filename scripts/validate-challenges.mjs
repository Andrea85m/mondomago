// Validatore + analizzatore delle sfide di MondoMago.
// Estrae il blocco dati ALL_CHALLENGES da src/MondoMago.jsx (oggetti puri, niente JSX),
// lo valuta in isolamento e produce: gap analysis (mondo × fascia età × skill) + controlli di integrità.
//
// Uso:  node scripts/validate-challenges.mjs
// Exit code 1 se trova errori bloccanti (id duplicati, indici fuori range, campi mancanti).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, '..', 'src', 'MondoMago.jsx');

const text = readFileSync(SRC, 'utf8');
const lines = text.split('\n');

// Trova i confini del blocco dati in modo robusto (non hardcodato sui numeri di riga).
const start = lines.findIndex(l => l.includes('const ALL_CHALLENGES = {'));
const endMarker = lines.findIndex((l, i) => i > start && l.includes('const FAMILY_MISSIONS'));
if (start < 0 || endMarker < 0) {
  console.error('❌ Impossibile trovare i confini di ALL_CHALLENGES nel sorgente.');
  process.exit(1);
}
const block = lines.slice(start, endMarker).join('\n');

// Valuta il blocco in un contesto isolato.
// NB: l'input è ESCLUSIVAMENTE il sorgente versionato del progetto (src/MondoMago.jsx),
// non input esterno/non fidato — quindi new Function() qui è sicuro. Non usare questo
// script per valutare contenuti provenienti da fonti non fidate.
let ALL_CHALLENGES;
try {
  ALL_CHALLENGES = new Function(`${block}\nreturn ALL_CHALLENGES;`)();
} catch (e) {
  console.error('❌ Il blocco ALL_CHALLENGES non è valutabile (errore di sintassi nei dati):');
  console.error(e.message);
  process.exit(1);
}

// SKILL_MAP replicato (dev tool indipendente).
const SKILL_MAP = {
  logica:     ['logica', 'pattern', 'geometria', 'memoria'],
  numeri:     ['numeri', 'conteggio'],
  creativita: ['creativita'],
  empatia:    ['empatia'],
  parole:     ['parole'],
  coding:     ['coding', 'sequenza', 'condizione', 'debug'],
};
const skillOf = (type) => Object.entries(SKILL_MAP).find(([, ts]) => ts.includes(type))?.[0] ?? `??(${type})`;
const ageBand = (c) => (c.ageMax <= 4 ? '3-4' : c.ageMin >= 7 ? '7-8' : c.ageMin >= 6 ? '6-8' : '5-6');

const worlds = Object.keys(ALL_CHALLENGES);
const errors = [];
const warnings = [];
const seenIds = new Map();
let total = 0;

// Formati che hanno options[] + correct (indice).
const INDEXED = new Set(['visual_tap', 'multiple_choice', 'rhyme_complete', 'quiz_cartoon', 'word_picture']);

for (const world of worlds) {
  for (const c of ALL_CHALLENGES[world]) {
    total++;
    // id univoco
    if (seenIds.has(c.id)) errors.push(`ID duplicato "${c.id}" (mondi: ${seenIds.get(c.id)} + ${world})`);
    else seenIds.set(c.id, world);
    // campi base
    for (const f of ['id', 'format', 'type', 'ageMin', 'ageMax']) {
      if (c[f] === undefined) errors.push(`[${world}/${c.id}] campo mancante: ${f}`);
    }
    // skill nota
    if (!SKILL_MAP[skillOf(c.type)]) warnings.push(`[${world}/${c.id}] type "${c.type}" non mappa a nessuna skill`);
    // range età coerente
    if (c.ageMin > c.ageMax) errors.push(`[${world}/${c.id}] ageMin>${c.ageMax} (ageMin:${c.ageMin})`);
    // indice corretto entro le opzioni
    if (INDEXED.has(c.format)) {
      if (!Array.isArray(c.options)) errors.push(`[${world}/${c.id}] formato ${c.format} senza options[]`);
      else if (typeof c.correct !== 'number' || c.correct < 0 || c.correct >= c.options.length)
        errors.push(`[${world}/${c.id}] correct=${c.correct} fuori range (options=${c.options?.length})`);
    }
    // sequence_tap / code_sequence
    if (c.format === 'sequence_tap' || c.format === 'code_sequence') {
      if (!Array.isArray(c.items) || !Array.isArray(c.correctOrder))
        errors.push(`[${world}/${c.id}] ${c.format} richiede items[] e correctOrder[]`);
      else if (c.items.length !== c.correctOrder.length)
        errors.push(`[${world}/${c.id}] items(${c.items.length}) ≠ correctOrder(${c.correctOrder.length})`);
    }
    // story_choice
    if (c.format === 'story_choice') {
      if (!Array.isArray(c.choices) || !c.choices.some(ch => ch.correct))
        errors.push(`[${world}/${c.id}] story_choice senza una scelta correct:true`);
    }
  }
}

// ── Gap analysis: mondo × fascia × skill ──────────────────────────────────────
const bands = ['3-4', '5-6', '6-8', '7-8'];
const skills = ['logica', 'numeri', 'creativita', 'empatia', 'parole', 'coding'];

console.log(`\n📊 MondoMago — analisi sfide  (totale: ${total})\n`);
console.log('Sfide per mondo:');
for (const w of worlds) console.log(`  ${w.padEnd(12)} ${ALL_CHALLENGES[w].length}`);

console.log('\nMatrice mondo × fascia età:');
console.log('  ' + 'mondo'.padEnd(12) + bands.map(b => b.padStart(6)).join('') + '   tot');
for (const w of worlds) {
  const row = bands.map(b => ALL_CHALLENGES[w].filter(c => ageBand(c) === b).length);
  console.log('  ' + w.padEnd(12) + row.map(n => String(n).padStart(6)).join('') + '   ' + String(ALL_CHALLENGES[w].length).padStart(4));
}

console.log('\nMatrice mondo × skill:');
console.log('  ' + 'mondo'.padEnd(12) + skills.map(s => s.slice(0, 5).padStart(7)).join(''));
for (const w of worlds) {
  const row = skills.map(s => ALL_CHALLENGES[w].filter(c => skillOf(c.type) === s).length);
  console.log('  ' + w.padEnd(12) + row.map(n => String(n).padStart(7)).join(''));
}

// ── Esito ─────────────────────────────────────────────────────────────────────
console.log('');
if (warnings.length) { console.log(`⚠️  ${warnings.length} avvisi:`); warnings.forEach(w => console.log('   ' + w)); }
if (errors.length) {
  console.log(`\n❌ ${errors.length} ERRORI:`);
  errors.forEach(e => console.log('   ' + e));
  process.exit(1);
}
console.log('✅ Nessun errore bloccante. Tutte le sfide sono valide.');
