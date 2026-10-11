#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// LA RISPOSTA GIUSTA NON STA SEMPRE ALLO STESSO POSTO — Emilio (11 Ott 2026):
// "spesso è sempre la prima". Usa il motore vero (filterByAge, getDailyChallenges)
// e conta, formato per formato, in che posizione finisce la risposta giusta.
// Esce 1 se una posizione esce più del doppio o meno della metà del previsto, o se
// una sequenza o un abbinamento arrivano già risolti.
// ─────────────────────────────────────────────────────────────────────────────
import { engine, WORLD_IDS } from './lib/extract-challenges.mjs';

const { filterByAge, getDailyChallenges } = engine;
const conta = {};   // formato → numero di risposte → posizione → volte
let giaRisolte = 0, errori = 0;
const segna = (c) => {
  let n, pos;
  if (c.format === 'story_choice') { n = c.choices.length; pos = c.choices.findIndex(x => x.correct); }
  else if (c.format === 'debug_find' || c.format === 'if_else_tap') return;
  else if (Array.isArray(c.options) && typeof c.correct === 'number') { n = c.options.length; pos = c.correct; }
  else if (c.correctOrder) { if (c.correctOrder.every((v, k) => v === k)) giaRisolte++; return; }
  else if (c.correctMapping) { if (c.correctMapping.every((v, k) => v === k)) giaRisolte++; return; }
  else return;
  const k = `${c.format} (${n})`; conta[k] = conta[k] || Array(n).fill(0); conta[k][pos]++;
};
for (let i = 0; i < 400; i++) for (const w of WORLD_IDS) for (const eta of [4, 6, 8]) {
  for (const c of filterByAge(w, eta, null, {}, i % 2 === 0)) segna(c);
  if (w === 'foresta') for (const c of getDailyChallenges(eta, 'p' + i)) segna(c);
}
for (const [k, v] of Object.entries(conta)) {
  const tot = v.reduce((a, b) => a + b, 0), atteso = tot / v.length;
  const male = tot >= 200 && v.some(x => x > atteso * 2 || x < atteso / 2);
  if (male) errori++;
  console.log(`${male ? '✗' : '✓'} ${k.padEnd(22)} ${v.map(x => `${Math.round(x / tot * 100)}%`.padStart(5)).join('')}   (${tot})`);
}
console.log(`${giaRisolte ? '✗' : '✓'} sequenze e abbinamenti già risolti: ${giaRisolte}`);
process.exit(errori || giaRisolte ? 1 : 0);
