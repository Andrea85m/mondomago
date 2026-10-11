#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// NIENTE DOMANDE RIPETUTE — richiesta di Emilio (11 Ott 2026): tutte le domande
// diverse, nello stesso mondo e tra mondi diversi.
// Simula un bambino (4, 6 e 8 anni) che gioca tutti i mondi, Bronzo → Argento →
// Oro, 12 tappe ciascuno, con una Sfida del Giorno ogni 4 tappe, usando il motore
// vero (filterByAge, getDailyChallenges) estratto da Magistella.jsx.
// Esce 1 se una domanda (stessa firma: testo, figure e risposte) torna due volte.
// ─────────────────────────────────────────────────────────────────────────────
import { engine, WORLD_IDS } from './lib/extract-challenges.mjs';

const { filterByAge, getDailyChallenges, firmaDi, chiaveVisto } = engine;
const TAPPE = 12, BOSS = new Set([5, 11]);
let errori = 0;
for (const eta of [4, 6, 8]) {
  const visti = {}, viste = new Map();
  let sessione = 0, totale = 0, generate = 0, ripetute = 0;
  const gioca = (c, dove) => {
    totale++; if (c.id.startsWith('gen_')) generate++;
    const f = firmaDi(c);
    if (viste.has(f)) { ripetute++; if (ripetute <= 5) console.log(`   ✗ ${eta} anni · ${dove}: ${c.id} già vista in ${viste.get(f)}`); }
    viste.set(f, `${dove} (${c.id})`);
    visti[chiaveVisto(c)] = sessione;
  };
  for (let livello = 1; livello <= 3; livello++) for (const mondo of WORLD_IDS) for (let t = 0; t < TAPPE; t++) {
    sessione++;
    if (t % 4 === 0) for (const c of getDailyChallenges(eta, 'p', visti)) gioca(c, `Sfida del Giorno, livello ${livello}`);
    for (const c of filterByAge(mondo, Math.min(8, eta + livello - 1), null, visti, BOSS.has(t))) gioca(c, `${mondo} livello ${livello} tappa ${t + 1}`);
  }
  console.log(`${ripetute ? '✗' : '✓'} ${eta} anni: ${totale} domande, ${ripetute} ripetute, ${Math.round(generate / totale * 100)}% generate`);
  errori += ripetute;
}
process.exit(errori ? 1 : 0);
