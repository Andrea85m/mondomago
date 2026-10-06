#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLO SFIDE NUOVE — prima di aggiungere un blocco di sfide a sfide.js
//
//   node scripts/controlla-sfide-nuove.mjs percorso/mondo.json [mondo]
//
// Il file è un array JSON di sfide nel formato di sfide.js. Controlla:
//   · campi obbligatori per formato, valori nei limiti, id unici (anche contro
//     le sfide già nel gioco)
//   · una sola risposta giusta, opzioni diverse fra loro
//   · per i 3-4 anni: domanda corta e risposte solo immagini (non sanno leggere)
//   · italiano: niente "Quale è", niente forme al maschile rivolte al bambino
//   · immagini 3D: avvisa se un'emoji non ha l'immagine 3D del gioco
//   · copertura: quante sfide per ogni età
// Exit 1 se c'è almeno un ERRORE.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { ALL_CHALLENGES } from './lib/extract-challenges.mjs';

const [, , file, mondo] = process.argv;
if (!file) { console.error('uso: node scripts/controlla-sfide-nuove.mjs file.json [mondo]'); process.exit(2); }
const sfide = JSON.parse(readFileSync(file, 'utf8'));
const EMOJI_3D = new Set([...readFileSync(new URL('../src/data/grafica3d.js', import.meta.url), 'utf8').matchAll(/"([^"]+)":"[0-9a-f-]+"/g)].map(m => m[1]));

const FORMATI = new Set(['visual_tap', 'multiple_choice', 'sequence_tap', 'story_choice', 'rhyme_complete']);
const TIPI = new Set(['logica', 'pattern', 'geometria', 'memoria', 'numeri', 'conteggio', 'creativita', 'empatia', 'parole', 'coding', 'sequenza', 'condizione', 'debug']);
const esistenti = new Set(Object.values(ALL_CHALLENGES).flat().map(c => c.id));
const errori = [], avvisi = [];
const visti = new Set();

const seg = (t) => [...new Intl.Segmenter().segment(String(t))].map(s => s.segment);
const emojiDi = (t) => seg(t).filter(g => /\p{Extended_Pictographic}/u.test(g));
const haLettere = (t) => /[a-zA-ZÀ-ÿ]/.test(String(t));
const GENERE = /\b(bravo|bravissimo|brava|bravissima|sei stato|sei stata|benvenuto|benvenuta|bentornato|bentornata|sei pronto|sei pronta|campione|campionessa)\b/i;

for (const c of sfide) {
  const id = c.id || '(senza id)';
  const e = (m) => errori.push(`[${id}] ${m}`), a = (m) => avvisi.push(`[${id}] ${m}`);
  if (!c.id || !/^[a-z0-9_]+$/.test(c.id)) e('id mancante o con caratteri non ammessi (solo a-z 0-9 _)');
  if (visti.has(c.id)) e('id duplicato nel file'); visti.add(c.id);
  if (esistenti.has(c.id)) e('id già usato da una sfida del gioco');
  if (!FORMATI.has(c.format)) e(`formato "${c.format}" non ammesso`);
  if (!TIPI.has(c.type)) e(`type "${c.type}" non ammesso`);
  if (!Number.isInteger(c.ageMin) || !Number.isInteger(c.ageMax) || c.ageMin < 3 || c.ageMax > 8 || c.ageMin > c.ageMax) e(`età non valide ${c.ageMin}-${c.ageMax}`);
  if (!c.emoji) e('manca emoji (il personaggio/oggetto della sfida)');
  const testo = c.format === 'story_choice' ? c.situation : c.prompt;
  if (!testo) e('manca il testo (prompt / situation)');
  const tutto = JSON.stringify(c);
  if (/Quale è/.test(tutto)) e('"Quale è" → si scrive "Qual è"');
  if (GENERE.test(tutto)) e('forma al maschile/femminile rivolta al bambino: usa una forma neutra');
  if (/[^\S\n]{2,}/.test(testo || '')) a('spazi doppi nel testo');
  const piccoli = c.ageMax <= 4;
  if (testo && !c.isBoss && piccoli && testo.replace(/\n/g, ' ').length > 45) e(`per 3-4 anni la domanda deve essere corta (${testo.length} caratteri > 45)`);
  if (testo && testo.length > 170) e(`testo troppo lungo (${testo.length} > 170)`);

  if (['visual_tap', 'multiple_choice', 'rhyme_complete'].includes(c.format)) {
    if (!Array.isArray(c.options) || c.options.length < 3 || c.options.length > 4) e('servono 3-4 options');
    else {
      if (new Set(c.options.map(o => String(o).trim().toLowerCase())).size !== c.options.length) e('opzioni ripetute');
      if (!Number.isInteger(c.correct) || c.correct < 0 || c.correct >= c.options.length) e(`correct fuori range`);
      if (c.format === 'visual_tap' && c.options.some(haLettere)) e('visual_tap: le opzioni sono solo immagini/numeri (per chi non legge)');
      if (piccoli && c.options.some(o => haLettere(o))) e('3-4 anni: niente parole nelle opzioni');
    }
  }
  if (c.format === 'rhyme_complete' && !/___\s*$/.test(c.prompt || '')) e('rhyme_complete: il prompt finisce con ___');
  if (c.format === 'sequence_tap') {
    if (!Array.isArray(c.items) || c.items.length < 3 || c.items.length > 5) e('sequence_tap: 3-5 items');
    const ok = Array.isArray(c.correctOrder) && c.correctOrder.length === c.items?.length &&
      [...c.correctOrder].sort((x, y) => x - y).every((v, i) => v === i);
    if (!ok) e('sequence_tap: correctOrder deve essere una permutazione degli indici di items');
  }
  if (c.format === 'story_choice') {
    if (!Array.isArray(c.choices) || c.choices.length < 2 || c.choices.length > 3) e('story_choice: 2-3 choices');
    else {
      if (c.choices.filter(x => x.correct === true).length !== 1) e('story_choice: esattamente una scelta correct:true');
      if (c.choices.some(x => !x.text || !x.outcome)) e('story_choice: ogni scelta ha text e outcome');
    }
  }
  // immagini 3D: un'emoji senza immagine 3D resta un'emoji piatta, stonata
  for (const em of new Set([...emojiDi(c.visual || ''), ...emojiDi(c.emoji || ''), ...(c.options || []).flatMap(o => emojiDi(o))])) {
    if (!EMOJI_3D.has(em) && !EMOJI_3D.has(em.replace(/️/g, ''))) a(`emoji senza immagine 3D: ${em}`);
  }
}

// copertura per età
const perEta = {};
for (let k = 3; k <= 8; k++) perEta[k] = sfide.filter(c => c.ageMin <= k && c.ageMax >= k).length;
const boss = sfide.filter(c => c.isBoss).length;

console.log(`${file}${mondo ? ` (${mondo})` : ''}: ${sfide.length} sfide · boss ${boss}`);
console.log('per età:', Object.entries(perEta).map(([k, v]) => `${k}a=${v}`).join('  '));
console.log('formati:', JSON.stringify(sfide.reduce((o, c) => (o[c.format] = (o[c.format] || 0) + 1, o), {})));
if (avvisi.length) console.log(`\n${avvisi.length} avvisi:\n  ` + avvisi.slice(0, 40).join('\n  '));
if (errori.length) { console.error(`\n✗ ${errori.length} ERRORI:\n  ` + errori.join('\n  ')); process.exit(1); }
console.log('\n✅ Nessun errore.');
