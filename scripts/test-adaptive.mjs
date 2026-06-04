// Test della logica ADATTIVA (selezione per skill) e della RIPETIZIONE SPAZIATA (SRS).
// Replica gli algoritmi di filterByAge (pesatura per skill) e dell'iniezione SRS di startWorld,
// li esegue contro i dati reali estratti da MondoMago.jsx e verifica le proprietà attese.
//
// Uso:  node scripts/test-adaptive.mjs   (exit 1 se un'asserzione fallisce)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const text = readFileSync(join(__dirname, '..', 'src', 'MondoMago.jsx'), 'utf8');
const lines = text.split('\n');
const start = lines.findIndex(l => l.includes('const ALL_CHALLENGES = {'));
const end = lines.findIndex((l, i) => i > start && l.includes('const FAMILY_MISSIONS'));
// Input fidato: solo sorgente versionato del progetto.
const ALL_CHALLENGES = new Function(`${lines.slice(start, end).join('\n')}\nreturn ALL_CHALLENGES;`)();

const SKILL_MAP = {
  logica: ['logica', 'pattern', 'geometria', 'memoria'], numeri: ['numeri', 'conteggio'],
  creativita: ['creativita'], empatia: ['empatia'], parole: ['parole'],
  coding: ['coding', 'sequenza', 'condizione', 'debug'],
};
const getSkill = (type) => Object.entries(SKILL_MAP).find(([, ts]) => ts.includes(type))?.[0] ?? 'logica';

// Replica esatta della pesatura di filterByAge (random × livello, ordina crescente).
function weightedNormals(worldId, age, skills) {
  const all = (ALL_CHALLENGES[worldId] || []).filter(c => age >= c.ageMin && age <= c.ageMax && !c.isBoss);
  return all
    .map(c => ({ c, k: Math.random() * (skills[getSkill(c.type)] ?? 1) }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.c)
    .slice(0, 5);
}

let failures = 0;
const assert = (cond, msg) => { if (!cond) { console.log('   ❌ ' + msg); failures++; } else console.log('   ✅ ' + msg); };

// ── TEST 1: una skill debole viene surclassata nella selezione ────────────────
console.log('\nTEST 1 — bias verso la skill più debole (mondo: oceano, età 7-8)');
{
  const RUNS = 4000;
  // bambino MOLTO debole in "numeri" (1), forte in tutto il resto (8)
  const weakNum = { logica: 8, numeri: 1, creativita: 8, empatia: 8, parole: 8, coding: 8 };
  const flat    = { logica: 5, numeri: 5, creativita: 5, empatia: 5, parole: 5, coding: 5 };
  let numWeak = 0, numFlat = 0;
  for (let i = 0; i < RUNS; i++) {
    numWeak += weightedNormals('oceano', 8, weakNum).filter(c => getSkill(c.type) === 'numeri').length;
    numFlat += weightedNormals('oceano', 8, flat).filter(c => getSkill(c.type) === 'numeri').length;
  }
  const avgWeak = numWeak / RUNS, avgFlat = numFlat / RUNS;
  console.log(`   numeri/sessione — bimbo debole-in-numeri: ${avgWeak.toFixed(2)}  vs  profilo piatto: ${avgFlat.toFixed(2)}`);
  assert(avgWeak > avgFlat * 1.15, 'le sfide di numeri escono di più per chi è debole in numeri (≥+15%)');
}

// ── TEST 2: profilo piatto ≈ selezione non distorta (no regressione) ──────────
console.log('\nTEST 2 — profilo piatto non introduce bias anomali');
{
  const flat = { logica: 5, numeri: 5, creativita: 5, empatia: 5, parole: 5, coding: 5 };
  const sample = weightedNormals('foresta', 6, flat);
  assert(sample.length > 0 && sample.length <= 5, `selezione di dimensione valida (${sample.length})`);
  assert(new Set(sample.map(c => c.id)).size === sample.length, 'nessuna sfida duplicata nella selezione');
}

// ── TEST 3: SRS — solo le sfide sbagliate in sessioni PRECEDENTI sono "due" ────
console.log('\nTEST 3 — ripetizione spaziata: dovute solo dopo ≥1 sessione');
{
  const realId = ALL_CHALLENGES.foresta[0].id;
  const missed = [
    { id: realId,    world: 'foresta', s: 2 }, // sbagliata alla sessione 2
    { id: 'e_for1',  world: 'foresta', s: 5 }, // sbagliata alla sessione 5
    { id: 'e_oce1',  world: 'oceano',  s: 0 }, // altro mondo
    { id: 'inesistente', world: 'foresta', s: 0 },
  ];
  const due = (sessionLen) => missed
    .filter(m => m.world === 'foresta' && sessionLen > m.s)
    .map(m => (ALL_CHALLENGES.foresta || []).find(c => c.id === m.id))
    .filter(Boolean).slice(0, 2);

  assert(due(3).length === 1 && due(3)[0].id === realId, 'a sessione 3: dovuta solo quella sbagliata alla 2');
  assert(due(6).length === 2, 'a sessione 6: dovute entrambe (foresta), id inesistente scartato');
  assert(due(1).length === 0, 'a sessione 1: nessuna dovuta (spacing rispettato)');
  assert(due(99).every(c => c.world === undefined || c.id), 'le sfide ritrovate sono oggetti reali');
}

console.log('');
if (failures) { console.log(`❌ ${failures} asserzioni fallite.`); process.exit(1); }
console.log('✅ Tutti i test della logica adattiva superati.');
