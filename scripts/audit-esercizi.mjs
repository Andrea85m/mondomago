#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// AUDIT ESERCIZI — MondoMago
//
// Verifica che ogni sfida sia CORRETTA e APPROPRIATA per la fascia d'età a cui
// viene servita, per ogni mondo, ogni formato, ogni livello e ogni modalità di
// gioco (percorso mondo · Sfida del Giorno · Sfida Fulmine · sfide procedurali).
//
// Non è un doppione di validate-challenges.mjs (che fa i controlli di integrità
// dei dati): qui si SIMULA il motore di produzione — filterByAge, getDailyChallenges,
// genMathChallenge — e si controlla ciò che il bambino vede davvero.
//
//   node scripts/audit-esercizi.mjs            report leggibile
//   node scripts/audit-esercizi.mjs --json     output machine-readable
//   node scripts/audit-esercizi.mjs --quiet    solo ERRORI e AVVISI
//
// Exit 1 se c'è almeno un ERRORE (blocca la CI / il deploy).
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ALL_CHALLENGES, flatChallenges, engine, SELECTABLE_AGES, WORLD_IDS,
  source, ROOT, sliceBlock,
} from './lib/extract-challenges.mjs';

const { filterByAge, getDailyChallenges, genMathChallenge, getSkill, SKILL_MAP } = engine;
const ARGS = new Set(process.argv.slice(2));
const JSON_OUT = ARGS.has('--json');
const QUIET = ARGS.has('--quiet');

const errors = [];   // rompe il gioco o insegna una cosa sbagliata
const warns = [];    // funziona ma è fuori fascia / a rischio
const notes = [];    // osservazioni, nessuna azione obbligatoria
const E = (code, msg) => errors.push({ code, msg });
const W = (code, msg) => warns.push({ code, msg });
const N = (code, msg) => notes.push({ code, msg });

// ── Risorse collegate ────────────────────────────────────────────────────────
const ttsMap = JSON.parse(readFileSync(join(ROOT, 'src', 'ttsMap.json'), 'utf8'));
const svgSrc = readFileSync(join(ROOT, 'src', 'SvgAssets.jsx'), 'utf8');
const ASSET_KEYS = new Set(
  [...svgSrc.slice(svgSrc.indexOf('export const ASSET_MAP'))
      .matchAll(/"([^"]+)"\s*:\s*[A-Z]/g)].map(m => m[1]),
);
const LETTERS_TRACEABLE = new Set(
  [...sliceBlock('const LETTER_DATA = {', 'function LetterTracer')
      .matchAll(/^\s{2}([A-ZÀ-Ù])\s*:\s*\{/gm)].map(m => m[1]),
);
// Formati che il renderer della schermata `challenge` sa disegnare.
const RENDERED_FORMATS = new Set(
  [...source.matchAll(/ch\.format\s*===\s*"([a-z_]+)"/g)].map(m => m[1]),
);

// ── Utility linguistiche ─────────────────────────────────────────────────────
const EMOJI_RE = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{200D}\u{1F1E6}-\u{1F1FF}\u{2190}-\u{21FF}\u{2B05}\u{2B06}\u{2B07}]/u;
const isEmojiOnly = (s) => {
  const t = String(s).replace(/\s/g, '');
  if (!t) return false;
  return ![...t].some(ch => /[a-zA-Z0-9À-ÿ]/.test(ch) && !/\u{FE0F}|\u{20E3}/u.test(ch))
      || /^[0-9]\u{FE0F}?\u{20E3}$/u.test(t); // 1️⃣ 2️⃣ …
};
const stripEmoji = (s) => String(s).replace(
  /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu, ' ');
const wordCount = (s) => stripEmoji(s).split(/[\s\n]+/).filter(w => /[a-zA-ZÀ-ÿ]/.test(w)).length;

/** Fascia reale in cui la sfida può essere servita, viste le età selezionabili. */
const servedAges = (c) => SELECTABLE_AGES.filter(a => a >= c.ageMin && a <= c.ageMax);

// ═══════════════════════════════════════════════════════════════════════════
// 1 · RAGGIUNGIBILITÀ — contenuto che nessun bambino vedrà mai
// ═══════════════════════════════════════════════════════════════════════════
for (const c of flatChallenges) {
  if (servedAges(c).length === 0) {
    E('UNREACHABLE',
      `[${c._world}/${c.id}] età ${c.ageMin}-${c.ageMax}: nessuna età selezionabile ` +
      `(${SELECTABLE_AGES.join('/')}) ricade nel range → sfida MAI servita.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 · CONTRATTO DI FORMATO — campi richiesti dal renderer
// ═══════════════════════════════════════════════════════════════════════════
const CONTRACTS = {
  multiple_choice: ['prompt', 'options', 'correct'],
  visual_tap:      ['visual', 'prompt', 'options', 'correct'],
  rhyme_complete:  ['prompt', 'options', 'correct'],
  quiz_cartoon:    ['cartoonEmoji', 'options', 'correct'],
  word_picture:    ['word', 'options', 'correct'],
  story_choice:    ['situation', 'choices'],
  sequence_tap:    ['prompt', 'items', 'correctOrder'],
  code_sequence:   ['prompt', 'items', 'correctOrder'],
  drag_drop:       ['prompt', 'items', 'zones', 'correctMapping'],
  letter_trace:    ['letter', 'word'],
  if_else_tap:     ['condition', 'correct'],
  debug_find:      ['prompt', 'items', 'correct'],
  memory_match:    ['prompt', 'pairs'],
  color_zones:     ['zones', 'colors'],
  puzzle_swap:     ['emojis'],
};
// Il renderer disegna SOLO `ch.prompt` (o `ch.situation` per story_choice).
// Una consegna scritta in un campo che nessuno legge è testo morto: il bambino
// vede una card vuota e la voce non dice niente.
// Si ricava dal sorgente: se il renderer fa il fallback su `question`, anche quel campo conta.
const RENDERED_TEXT_FIELDS = ['prompt', 'situation',
  ...(/ch\.prompt\s*\|\|\s*ch\.question/.test(source) ? ['question'] : [])];
// Il puzzle scorrevole è risolvibile solo se il bambino vede l'immagine-modello.
const PUZZLE_SHOWS_TARGET = /DEVE VENIRE COS/.test(source);
// Formati con una card che si spiega da sola (la consegna è nel layout, non nel testo):
// letter_trace mostra "TRACCIA LA LETTERA" + la lettera; word_picture "TROVA L'IMMAGINE" + la parola.
const SELF_DESCRIBING = new Set(['letter_trace', 'word_picture']);
const INDEXED = new Set(['multiple_choice', 'visual_tap', 'rhyme_complete', 'quiz_cartoon', 'word_picture']);

for (const c of flatChallenges) {
  const tag = `[${c._world}/${c.id}]`;

  if (!RENDERED_FORMATS.has(c.format) && c.format !== 'sequence_tap') {
    E('NO_RENDERER', `${tag} formato "${c.format}" non ha un ramo di render nella schermata challenge.`);
  }
  const req = CONTRACTS[c.format];
  if (!req) { W('UNKNOWN_FORMAT', `${tag} formato "${c.format}" non ha un contratto noto in questo audit.`); continue; }
  for (const f of req) if (c[f] === undefined || c[f] === null) E('MISSING_FIELD', `${tag} ${c.format}: manca "${f}".`);

  // consegna scritta ma mai mostrata
  const shown = RENDERED_TEXT_FIELDS.find(f => c[f]);
  if (!shown) {
    const orphan = ['question', 'text', 'title', 'consegna'].find(f => c[f]);
    if (orphan)
      E('DEAD_TEXT', `${tag} ${c.format}: la consegna è nel campo "${orphan}" ("${String(c[orphan]).slice(0, 60)}"), ` +
        `ma il renderer legge solo ${RENDERED_TEXT_FIELDS.join('/')} → card vuota e nessuna voce.`);
    else if (!SELF_DESCRIBING.has(c.format))
      E('NO_INSTRUCTION', `${tag} ${c.format}: nessuna consegna visibile per il bambino.`);
  }

  // ── opzioni indicizzate ──
  if (INDEXED.has(c.format) && Array.isArray(c.options)) {
    if (c.options.length < 2) E('TOO_FEW_OPTIONS', `${tag} solo ${c.options.length} opzione/i.`);
    if (c.options.length > 4) W('TOO_MANY_OPTIONS', `${tag} ${c.options.length} opzioni: oltre 4 la griglia diventa illeggibile su mobile.`);
    if (typeof c.correct !== 'number' || c.correct < 0 || c.correct >= c.options.length)
      E('CORRECT_OOR', `${tag} correct=${c.correct} fuori da options[${c.options.length}].`);
    // distrattori duplicati = più di una risposta "giusta" cliccabile
    const seen = new Map();
    c.options.forEach((o, i) => {
      const k = String(o).replace(/[\u{FE0F}\u{200D}]/gu, '').trim();
      if (seen.has(k)) {
        const isRight = i === c.correct || seen.get(k) === c.correct;
        (isRight ? E : W)('DUP_OPTION',
          `${tag} opzione duplicata "${o}" (indici ${seen.get(k)} e ${i})` +
          (isRight ? ' — una delle due È la risposta giusta: la sfida è ambigua.' : '.'));
      } else seen.set(k, i);
    });
  }

  // ── sequenze ──
  if (c.format === 'sequence_tap' || c.format === 'code_sequence') {
    if (Array.isArray(c.items) && Array.isArray(c.correctOrder)) {
      if (c.items.length !== c.correctOrder.length)
        E('SEQ_LEN', `${tag} items(${c.items.length}) ≠ correctOrder(${c.correctOrder.length}).`);
      const sorted = [...c.correctOrder].sort((a, b) => a - b);
      const expected = c.items.map((_, i) => i);
      if (JSON.stringify(sorted) !== JSON.stringify(expected))
        E('SEQ_NOT_PERM', `${tag} correctOrder ${JSON.stringify(c.correctOrder)} non è una permutazione di 0..${c.items.length - 1}.`);
      // elementi identici → l'ordine è indistinguibile per il bambino
      const dup = c.items.filter((v, i) => c.items.indexOf(v) !== i);
      if (dup.length) E('SEQ_DUP_ITEMS', `${tag} items contiene doppioni ${JSON.stringify([...new Set(dup)])}: l'ordine corretto è ambiguo.`);
    }
  }

  // ── drag & drop ──
  if (c.format === 'drag_drop' && Array.isArray(c.items) && Array.isArray(c.zones) && Array.isArray(c.correctMapping)) {
    if (c.correctMapping.length !== c.items.length)
      E('DD_MAP_LEN', `${tag} correctMapping(${c.correctMapping.length}) ≠ items(${c.items.length}).`);
    for (const [i, z] of c.correctMapping.entries())
      if (!(Number.isInteger(z) && z >= 0 && z < c.zones.length))
        E('DD_ZONE_OOR', `${tag} correctMapping[${i}]=${z} fuori da zones[${c.zones.length}].`);
    if (new Set(c.correctMapping).size !== c.correctMapping.length)
      E('DD_NOT_BIJECTION', `${tag} due item mappati sulla stessa zona: il controllo di correttezza (una zona = un item) non potrà mai riuscire.`);
    if (c.items.length !== c.zones.length)
      E('DD_COUNT', `${tag} items(${c.items.length}) ≠ zones(${c.zones.length}): il gioco attende una zona per item.`);
  }

  // ── se/allora ──
  if (c.format === 'if_else_tap' && ![0, 1].includes(c.correct))
    E('IFELSE_CORRECT', `${tag} if_else_tap vuole correct 0 (SE VERO) o 1 (SE FALSO), trovato ${c.correct}.`);

  // ── trova il bug ──
  if (c.format === 'debug_find' && Array.isArray(c.items)) {
    if (!(Number.isInteger(c.correct) && c.correct >= 0 && c.correct < c.items.length))
      E('DEBUG_OOR', `${tag} correct=${c.correct} fuori da items[${c.items.length}].`);
  }

  // ── memory ──
  // Ogni coppia diventa 2 carte (a, b). Se lo stesso simbolo compare in due coppie
  // diverse, il bambino gira due carte identiche che il gioco dichiara "non uguali".
  if (c.format === 'memory_match' && Array.isArray(c.pairs)) {
    if (c.pairs.length < 2) E('MEM_PAIRS', `${tag} servono almeno 2 coppie.`);
    // a === b nella stessa coppia è il memory classico (due carte identiche): ok.
    // Il guasto è lo stesso simbolo in DUE coppie diverse.
    const owner = new Map();
    const clash = new Set();
    c.pairs.forEach((p, pi) => {
      const faces = p && typeof p === 'object' ? [...new Set([p.a, p.b])] : [p];
      for (const f of faces) {
        if (owner.has(f) && owner.get(f) !== pi) clash.add(f);
        else owner.set(f, pi);
      }
    });
    if (clash.size)
      E('MEM_DUP', `${tag} il simbolo ${JSON.stringify([...clash])} compare in più coppie: il bambino gira due carte identiche e il gioco le dichiara non abbinate.`);
    if (c.pairs.length > 6) W('MEM_TOO_MANY', `${tag} ${c.pairs.length} coppie (${c.pairs.length * 2} carte): oltre 12 carte la griglia esce dallo schermo.`);
  }

  // ── zone da colorare ──
  if (c.format === 'color_zones' && Array.isArray(c.zones)) {
    for (const z of c.zones) {
      if (!z.id) E('CZ_ID', `${tag} zona senza id.`);
      if (!z.targetColor) E('CZ_TARGET', `${tag} zona "${z.id}" senza targetColor.`);
      else if (Array.isArray(c.colors) && !c.colors.includes(z.targetColor))
        E('CZ_UNREACHABLE', `${tag} zona "${z.id}" chiede ${z.targetColor} ma la tavolozza non lo contiene → impossibile completare.`);
      if (!z.label) W('CZ_NO_LABEL', `${tag} zona "${z.id}" senza etichetta: senza consegna scritta il bambino non può sapere quale colore va lì.`);
    }
    if (new Set(c.zones.map(z => z.id)).size !== c.zones.length)
      E('CZ_DUP_ID', `${tag} id di zona duplicati.`);
  }

  // ── traccia la lettera ──
  if (c.format === 'letter_trace') {
    if (!LETTERS_TRACEABLE.has(c.letter))
      E('LT_NO_PATH', `${tag} lettera "${c.letter}" non è in LETTER_DATA → il tracciato non si disegna.`);
    if (c.word && !String(c.word).toUpperCase().startsWith(String(c.letter).toUpperCase()))
      E('LT_WORD', `${tag} la parola "${c.word}" non inizia con "${c.letter}".`);
  }

  // ── rima ──
  if (c.format === 'rhyme_complete' && c.prompt && !c.prompt.includes('___'))
    E('RHYME_BLANK', `${tag} rhyme_complete senza "___" da completare.`);

  // ── storia ──
  if (c.format === 'story_choice' && Array.isArray(c.choices)) {
    const good = c.choices.filter(ch => ch.correct);
    if (good.length === 0) E('STORY_NO_CORRECT', `${tag} nessuna scelta con correct:true.`);
    if (good.length > 1) E('STORY_MULTI_CORRECT', `${tag} ${good.length} scelte marcate corrette: il punteggio diventa arbitrario.`);
    if (c.choices.length < 2) E('STORY_ONE_CHOICE', `${tag} una sola scelta.`);
    c.choices.forEach((ch, i) => { if (!ch.text) E('STORY_NO_TEXT', `${tag} scelta ${i} senza testo.`); });
  }

  // ── sequenze ripetute: "Cosa viene dopo?" ──
  // La sequenza mostrata ha un periodo: l'elemento successivo è determinato.
  // Qui si ricalcola e si confronta con la chiave di risposta.
  if (c.visual && /cosa viene dopo/i.test(c.prompt || '')) {
    // la sequenza vera è quella scritta nel prompt dopo l'a-capo, se c'è, altrimenti `visual`
    const line = String(c.prompt).split('\n').find(l => /_{2,}$/.test(l.trim()));
    const raw = line ? line.replace(/_+$/, '') : String(c.visual);
    const seq = [...new Intl.Segmenter().segment(raw)]
      .map(s => s.segment)
      .filter(s => s.trim() && EMOJI_RE.test(s)); // via le parole della consegna, restano i simboli
    let period = 0;
    for (let p = 1; p <= Math.floor(seq.length / 2); p++) {
      if (seq.every((v, i) => v === seq[i % p])) { period = p; break; }
    }
    if (!period) {
      W('PATTERN_NO_PERIOD', `${tag} "${raw}" non ha un periodo riconoscibile: la risposta "successiva" è opinabile.`);
    } else {
      const expected = seq[seq.length % period];
      const given = c.options?.[c.correct];
      const norm = (s) => String(s).replace(/[\u{FE0F}\u{200D}]/gu, '').trim();
      if (given !== undefined && norm(given) !== norm(expected)) {
        const idx = (c.options || []).findIndex(o => norm(o) === norm(expected));
        E('PATTERN_ANSWER',
          `${tag} sequenza "${raw}" (periodo ${period}): il pezzo successivo è ${expected}, ` +
          `ma la risposta segnata giusta è ${given} (indice ${c.correct})` +
          (idx >= 0 ? ` — l'indice corretto sarebbe ${idx}.` : ` — ${expected} non è nemmeno fra le opzioni.`));
      }
    }
  }

  // ── puzzle scorrevole ──
  // La vittoria è "tessere nell'ordine 0..n-1, buco in fondo". Quell'ordine è
  // arbitrario: se il bambino non vede l'immagine-modello, non ha modo di saperlo.
  if (c.format === 'puzzle_swap') {
    const size = c.size || 2;
    if (Array.isArray(c.emojis) && c.emojis.length !== size * size - 1)
      E('PS_TILES', `${tag} ${c.emojis.length} tessere per una griglia ${size}×${size} (ne servono ${size * size - 1}).`);
    if (!PUZZLE_SHOWS_TARGET)
      E('PS_NO_TARGET', `${tag} puzzle scorrevole senza immagine-modello a schermo: l'ordine corretto (${(c.emojis || []).join('')}) è arbitrario e il bambino non può dedurlo → sfida non risolvibile se non per tentativi.`);
    if (size >= 3 && c.ageMax <= 8)
      W('PS_HARD', `${tag} griglia ${size}×${size} = puzzle del 15 con 8 tessere: resta impegnativo sotto i 9-10 anni anche col modello a vista.`);
  }

  // ── parola/immagine ──
  if (c.format === 'word_picture' && Array.isArray(c.options) && typeof c.correct === 'number') {
    const other = c.options.filter((_, i) => i !== c.correct);
    if (other.length === 0) E('WP_NO_DISTRACTOR', `${tag} nessun distrattore.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 · APPROPRIATEZZA PER ETÀ
//   Riferimenti: Indicazioni Nazionali (scuola dell'infanzia → primaria).
//   3-4 = pre-lettura, quantità entro 5 · 5-6 = lettura iniziale, entro 20
//   7-8 = 2ª/3ª primaria, tabelline e calcolo entro 100/1000.
// ═══════════════════════════════════════════════════════════════════════════
const BAND = (c) => (c.ageMax <= 4 ? '3-4' : c.ageMin >= 7 ? '7-8' : '5-6+');
const LIMITS = {
  '3-4':  { maxPromptWords: 8,  maxNumber: 10,  ops: [],                    needsReading: false },
  '5-6+': { maxPromptWords: 26, maxNumber: 100, ops: ['+', '−', '-'],       needsReading: true },
  '7-8':  { maxPromptWords: 55, maxNumber: 1000, ops: ['+', '−', '-', '×', '÷', 'x', ':'], needsReading: true },
};

for (const c of flatChallenges) {
  const tag = `[${c._world}/${c.id}]`;
  const band = BAND(c);
  const lim = LIMITS[band];
  const text = [c.prompt, c.situation, c.condition].filter(Boolean).join(' ');

  // 3.1 carico di lettura
  if (text) {
    const wc = wordCount(text);
    if (wc > lim.maxPromptWords)
      W('READING_LOAD', `${tag} ${band}: consegna di ${wc} parole (limite consigliato ${lim.maxPromptWords}) — "${text.replace(/\n/g, ' ').slice(0, 70)}…"`);
  }

  // 3.2 a 3-4 anni non si legge: le opzioni devono essere immagini
  if (band === '3-4' && Array.isArray(c.options)) {
    const textual = c.options.filter(o => !isEmojiOnly(o));
    if (textual.length)
      W('READS_TO_ANSWER', `${tag} 3-4 anni ma per rispondere bisogna leggere: ${JSON.stringify(textual)}.`);
  }
  if (band === '3-4' && c.format === 'story_choice')
    W('STORY_TOO_YOUNG', `${tag} story_choice a 3-4 anni: le scelte sono frasi scritte.`);

  // 3.3 operazioni scritte fuori fascia (solo calcolo vero: cifra-operatore-cifra)
  const hasMultDiv = /\d\s*[×÷x]\s*\d|\d+\s*:\s*\d/.test(c.prompt || '');
  if (band === '3-4' && /\d\s*[+\-−×÷]\s*\d/.test(c.prompt || ''))
    W('SYMBOLIC_MATH_TOO_YOUNG', `${tag} 3-4 anni con calcolo simbolico: "${String(c.prompt).replace(/\n/g, ' ')}".`);
  if (hasMultDiv && c.ageMax <= 6)
    W('MULT_TOO_YOUNG', `${tag} moltiplicazione/divisione scritta a ${c.ageMin}-${c.ageMax} anni (in Italia si introducono in 2ª primaria, ~7 anni): "${String(c.prompt).replace(/\n/g, ' ')}".`);

  // 3.4 ampiezza numerica
  // Gli anni (1980, 2016…) e le temperature non sono "quantità da calcolare": non contano.
  const numeric = stripEmoji(text).replace(/\b(1[89]|20)\d{2}\b/g, ' ').replace(/\d+\s*°/g, ' ');
  const nums = (numeric.match(/\d+/g) || []).map(Number);
  const big = nums.filter(n => n > lim.maxNumber);
  if (big.length) W('NUMBER_RANGE', `${tag} ${band}: numeri ${big.join(', ')} oltre il limite ${lim.maxNumber} della fascia.`);

  // 3.5 conteggio oltre la soglia percettiva dei piccoli
  if (band === '3-4' && c.type === 'conteggio' && c.visual) {
    const n = [...new Intl.Segmenter().segment(String(c.visual))].filter(s => s.segment.trim()).length;
    if (n > 5) W('COUNT_TOO_HIGH', `${tag} 3-4 anni: ${n} elementi da contare (a quest'età si conta con sicurezza fino a 5).`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 · SIMULAZIONE DEL MOTORE — quello che il bambino riceve davvero
// ═══════════════════════════════════════════════════════════════════════════
const RUNS = 3000;
const sessionStats = [];

for (const world of WORLD_IDS) {
  for (const age of SELECTABLE_AGES) {
    const pool = ALL_CHALLENGES[world].filter(c => age >= c.ageMin && age <= c.ageMax);
    const bosses = pool.filter(c => c.isBoss);
    const normals = pool.filter(c => !c.isBoss);
    const tag = `[${world} · ${age} anni]`;

    if (pool.length === 0) {
      E('EMPTY_POOL', `${tag} nessuna sfida disponibile: il mondo è ingiocabile a quest'età.`);
      continue;
    }
    if (bosses.length === 0)
      E('NO_BOSS', `${tag} nessuna sfida BOSS: il mondo finisce senza il guardiano.`);
    // filterByAge prende 4 normali + boss (o 5 senza boss) + 1 procedurale
    const needed = bosses.length ? 4 : 5;
    if (normals.length < needed)
      E('POOL_TOO_SMALL', `${tag} solo ${normals.length} sfide normali, ne servono ${needed} per una sessione completa.`);
    else if (normals.length < needed * 2)
      W('POOL_THIN', `${tag} solo ${normals.length} sfide normali: il bambino rivede quasi sempre le stesse.`);

    // Simulazione vera del motore
    const seenIds = new Set();
    let minLen = Infinity, maxLen = 0, bossMissing = 0, dupInSession = 0;
    for (let i = 0; i < RUNS; i++) {
      const skills = { logica: 1 + Math.random() * 9, numeri: 1 + Math.random() * 9, creativita: 1 + Math.random() * 9,
                       empatia: 1 + Math.random() * 9, parole: 1 + Math.random() * 9, coding: 1 + Math.random() * 9 };
      const s = filterByAge(world, age, i % 2 ? skills : null);
      minLen = Math.min(minLen, s.length); maxLen = Math.max(maxLen, s.length);
      if (bosses.length && !s.some(c => c.isBoss)) bossMissing++;
      const ids = s.map(c => c.id);
      if (new Set(ids).size !== ids.length) dupInSession++;
      ids.forEach(id => seenIds.add(id));
      for (const c of s) {
        if (!c || !c.format) { E('ENGINE_NULL', `${tag} filterByAge ha restituito una sfida vuota.`); break; }
        if (!(age >= c.ageMin && age <= c.ageMax))
          E('ENGINE_AGE_LEAK', `${tag} filterByAge ha servito ${c.id} (età ${c.ageMin}-${c.ageMax}) fuori fascia.`);
      }
    }
    if (dupInSession) E('SESSION_DUP', `${tag} ${dupInSession}/${RUNS} sessioni con la stessa sfida ripetuta.`);
    if (bossMissing) E('SESSION_NO_BOSS', `${tag} ${bossMissing}/${RUNS} sessioni senza boss.`);
    if (minLen < 5) W('SESSION_SHORT', `${tag} sessione minima di ${minLen} sfide (attese 6).`);

    // sfide mai estratte in 3000 sessioni → contenuto di fatto morto
    const never = normals.filter(c => !seenIds.has(c.id));
    if (never.length) W('NEVER_DRAWN', `${tag} mai estratte in ${RUNS} sessioni: ${never.map(c => c.id).join(', ')}.`);

    sessionStats.push({ world, age, pool: pool.length, normals: normals.length, bosses: bosses.length, minLen, maxLen });
  }
}

// ── Sfida del Giorno ──
for (const age of SELECTABLE_AGES) {
  const daily = getDailyChallenges(age, 'audit-profile');
  if (daily.length !== 3) E('DAILY_COUNT', `Sfida del Giorno a ${age} anni: ${daily.length} sfide invece di 3.`);
  for (const c of daily)
    if (!(age >= c.ageMin && age <= c.ageMax))
      E('DAILY_AGE_LEAK', `Sfida del Giorno a ${age} anni: servita ${c.id} (${c.ageMin}-${c.ageMax}).`);
  if (new Set(daily.map(c => c.id)).size !== daily.length)
    W('DAILY_DUP', `Sfida del Giorno a ${age} anni: sfide ripetute nello stesso giorno.`);
}

// ── Sfida Fulmine ──
// I formati ammessi si leggono dal sorgente (const RAPID = new Set([...])) così l'audit
// segue il codice invece di duplicarne una copia che invecchia.
const RAPID_FORMATS = (() => {
  const m = source.match(/const RAPID = new Set\(\[([^\]]*)\]\)/);
  return new Set(m ? [...m[1].matchAll(/"([a-z_]+)"/g)].map(x => x[1]) : ['visual_tap']);
})();
for (const age of SELECTABLE_AGES) {
  const pool = flatChallenges.filter(c =>
    RAPID_FORMATS.has(c.format) && Array.isArray(c.options) && c.options.length >= 2 &&
    c.ageMin <= age && c.ageMax >= age);
  if (pool.length === 0)
    E('FULMINE_EMPTY', `Sfida Fulmine a ${age} anni: pool vuoto, il gioco parte senza domande.`);
  else if (pool.length < 20)
    W('FULMINE_THIN', `Sfida Fulmine a ${age} anni: solo ${pool.length} domande per 60 secondi di gioco (si ripetono).`);
}

// ── Sfide procedurali di matematica ──
const PROC_RUNS = 20000;
for (const age of SELECTABLE_AGES) {
  const bad = { arith: 0, missing: 0, dup: 0, neg: 0, count: 0, range: 0, band: 0 };
  const examples = {};
  for (let i = 0; i < PROC_RUNS; i++) {
    const c = genMathChallenge(WORLD_IDS[i % WORLD_IDS.length], age);
    const opts = c.options.map(Number);
    // la fascia dichiarata deve contenere l'età per cui è stata generata
    if (!(age >= c.ageMin && age <= c.ageMax)) { bad.band++; examples.band ??= JSON.stringify(c); }
    if (c.options.length !== 4) { bad.count++; examples.count ??= JSON.stringify(c); }
    if (new Set(opts).size !== opts.length) { bad.dup++; examples.dup ??= JSON.stringify(c); }
    if (opts.some(v => v <= 0)) { bad.neg++; examples.neg ??= JSON.stringify(c); }
    // verifica aritmetica reale della consegna
    const m = c.prompt.match(/(\d+)\s*([+−×÷])\s*(\d+)/);
    if (m) {
      const [, a, op, b] = m;
      const truth = { '+': +a + +b, '−': a - b, '×': a * b, '÷': a / b }[op];
      if (opts[c.correct] !== truth) { bad.arith++; examples.arith ??= `${c.prompt} → dice ${opts[c.correct]}, giusto ${truth}`; }
      const lim = LIMITS[age <= 4 ? '3-4' : age <= 6 ? '5-6+' : '7-8'];
      if (Math.max(+a, +b, truth) > lim.maxNumber) { bad.range++; examples.range ??= c.prompt; }
    } else if (!/Quanti/.test(c.prompt)) {
      bad.missing++; examples.missing ??= c.prompt;
    }
  }
  const label = `Matematica procedurale a ${age} anni`;
  if (bad.band)    E('PROC_BAND',   `${label}: ${bad.band}/${PROC_RUNS} con fascia dichiarata sbagliata. Es: ${examples.band}`);
  if (bad.arith)   E('PROC_ARITH',  `${label}: ${bad.arith}/${PROC_RUNS} con risultato SBAGLIATO. Es: ${examples.arith}`);
  if (bad.dup)     E('PROC_DUP',    `${label}: ${bad.dup}/${PROC_RUNS} con opzioni duplicate. Es: ${examples.dup}`);
  if (bad.count)   E('PROC_COUNT',  `${label}: ${bad.count}/${PROC_RUNS} senza 4 opzioni. Es: ${examples.count}`);
  if (bad.neg)     E('PROC_NEG',    `${label}: ${bad.neg}/${PROC_RUNS} con opzioni ≤ 0. Es: ${examples.neg}`);
  if (bad.range)   W('PROC_RANGE',  `${label}: ${bad.range}/${PROC_RUNS} oltre l'ampiezza numerica della fascia. Es: ${examples.range}`);
  if (bad.missing) W('PROC_SHAPE',  `${label}: ${bad.missing}/${PROC_RUNS} con consegna non riconosciuta. Es: ${examples.missing}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 · RISORSE COLLEGATE — voce e disegni
// ═══════════════════════════════════════════════════════════════════════════
const spokenOf = (c) =>
  c.format === 'story_choice'   ? c.situation
  : c.format === 'word_picture' ? `Trova l'immagine per la parola: ${c.word}`
  : c.format === 'letter_trace' ? `Quale immagine inizia con la lettera ${c.letter}?`
  : c.format === 'rhyme_complete' ? String(c.prompt).replace('___', '...')
  : c.prompt || c.question;

let noTts = 0;
const noTtsExamples = [];
for (const c of flatChallenges) {
  const t = spokenOf(c);
  if (!t) continue;
  if (!ttsMap[t]) { noTts++; if (noTtsExamples.length < 8) noTtsExamples.push(`[${c._world}/${c.id}] "${String(t).replace(/\n/g, '⏎').slice(0, 60)}"`); }
}
if (noTts) W('TTS_MISSING',
  `${noTts}/${flatChallenges.length} consegne senza voce registrata → l'app ripiega sulla voce di sistema ` +
  `(diversa su ogni telefono, spesso robotica). Esempi:\n      ` + noTtsExamples.join('\n      '));

// disegni: quali emoji cadono nel fallback "emoji dentro un cerchio"
const emojiUsed = new Map();
for (const c of flatChallenges) {
  const pools = [c.options, c.items, c.pairs].filter(Array.isArray).flat();
  if (c.visual) pools.push(...[...new Intl.Segmenter().segment(String(c.visual))].map(s => s.segment));
  for (const raw of pools) {
    const s = String(raw).trim();
    if (!s || !EMOJI_RE.test(s) || !isEmojiOnly(s)) continue;
    if (!ASSET_KEYS.has(s) && !ASSET_KEYS.has(s.replace(/[\u{FE0F}\u{200D}]/gu, '')))
      emojiUsed.set(s, (emojiUsed.get(s) || 0) + 1);
  }
}
if (emojiUsed.size) {
  const top = [...emojiUsed.entries()].sort((a, b) => b[1] - a[1]);
  N('SVG_FALLBACK',
    `${emojiUsed.size} simboli senza disegno SVG dedicato (mostrati come emoji di sistema, ` +
    `quindi diversi su Android/iOS): ${top.slice(0, 25).map(([e, n]) => `${e}×${n}`).join(' ')}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// 6 · EQUILIBRIO DIDATTICO — le 6 competenze per fascia
// ═══════════════════════════════════════════════════════════════════════════
const SKILLS = Object.keys(SKILL_MAP);
const balance = {};
for (const age of SELECTABLE_AGES) {
  const pool = flatChallenges.filter(c => age >= c.ageMin && age <= c.ageMax);
  balance[age] = Object.fromEntries(SKILLS.map(s => [s, pool.filter(c => getSkill(c.type) === s).length]));
  for (const s of SKILLS) {
    if (balance[age][s] === 0)
      W('SKILL_GAP', `A ${age} anni la competenza "${s}" non ha NESSUNA sfida: la barra resta a zero per sempre.`);
    else if (balance[age][s] < 5)
      N('SKILL_THIN', `A ${age} anni "${s}" ha solo ${balance[age][s]} sfide.`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// REPORT
// ═══════════════════════════════════════════════════════════════════════════
if (JSON_OUT) {
  console.log(JSON.stringify({ errors, warns, notes, sessionStats, balance }, null, 2));
} else {
  const bar = (n, max, w = 22) => '█'.repeat(Math.round((n / Math.max(max, 1)) * w)).padEnd(w, '·');
  console.log(`\n🔎 AUDIT ESERCIZI — MondoMago`);
  console.log(`   ${flatChallenges.length} sfide · ${WORLD_IDS.length} mondi · età selezionabili ${SELECTABLE_AGES.join(' / ')}\n`);

  if (!QUIET) {
    console.log('── Sessione di gioco per mondo ed età ──────────────────────────────');
    console.log('   ' + 'mondo'.padEnd(12) + 'età'.padStart(4) + 'pool'.padStart(6) + 'normali'.padStart(9) + 'boss'.padStart(6) + '   sfide/sessione');
    for (const s of sessionStats)
      console.log('   ' + s.world.padEnd(12) + String(s.age).padStart(4) + String(s.pool).padStart(6) +
        String(s.normals).padStart(9) + String(s.bosses).padStart(6) + '   ' +
        (s.minLen === s.maxLen ? String(s.minLen) : `${s.minLen}–${s.maxLen}`));

    console.log('\n── Competenze coperte per età ──────────────────────────────────────');
    const max = Math.max(...Object.values(balance).flatMap(b => Object.values(b)));
    for (const age of SELECTABLE_AGES) {
      console.log(`   ${age} anni`);
      for (const s of SKILLS)
        console.log(`     ${s.padEnd(11)} ${String(balance[age][s]).padStart(3)}  ${bar(balance[age][s], max)}`);
    }
    console.log('');
  }

  const dump = (list, icon, title) => {
    if (!list.length) return;
    console.log(`${icon} ${title} (${list.length})`);
    const byCode = list.reduce((m, x) => ((m[x.code] ??= []).push(x.msg), m), {});
    for (const [code, msgs] of Object.entries(byCode)) {
      console.log(`  ┌ ${code} × ${msgs.length}`);
      for (const m of msgs) console.log(`  │ ${m}`);
    }
    console.log('');
  };
  dump(errors, '❌', 'ERRORI — la sfida è rotta o insegna una cosa sbagliata');
  dump(warns, '⚠️ ', 'AVVISI — funziona ma è fuori fascia o a rischio');
  if (!QUIET) dump(notes, 'ℹ️ ', 'NOTE');

  console.log(errors.length
    ? `❌ ${errors.length} errori, ${warns.length} avvisi.`
    : `✅ Nessun errore bloccante. ${warns.length} avvisi, ${notes.length} note.`);
}

process.exit(errors.length ? 1 : 0);
