// Estrattore condiviso: carica i dati del gioco e il motore di selezione dal
// sorgente vero e li valuta in isolamento. Usato da audit-esercizi.mjs e
// check-tts.mjs.
//
// Perché non un `import`: i file del gioco sono moduli del bundle (JSX, JSON,
// asset), non caricabili da node così come sono. I dati però sono letterali
// puri: si tolgono `import`/`export` e si valutano. Il motore si estrae da
// Magistella.jsx per delimitatori nominali (non per numero di riga: i numeri
// si spostano a ogni commit).
//
// NB: l'input è ESCLUSIVAMENTE il sorgente versionato del progetto — non input
// esterno — quindi new Function() qui è sicuro.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');

/** I file che contengono testo e logica del gioco. */
export const SRC_FILES = {
  app: 'src/Magistella.jsx',
  mondi: 'src/data/mondi.js',
  sfide: 'src/data/sfide.js',
};
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

/** Tutto il testo del gioco, per i controlli che cercano pattern (speak(), battute, formati). */
export const source = Object.values(SRC_FILES).map(read).join('\n');

const appLines = read(SRC_FILES.app).split('\n');

/** Estrae da Magistella.jsx il testo fra la riga che contiene `startsWith` e quella che contiene `endsWith`. */
export function sliceBlock(startsWith, endsWith) {
  const start = appLines.findIndex(l => l.includes(startsWith));
  if (start < 0) throw new Error(`Blocco non trovato: ${startsWith}`);
  const end = appLines.findIndex((l, i) => i > start && l.includes(endsWith));
  if (end < 0) throw new Error(`Fine blocco non trovata: ${endsWith}`);
  return appLines.slice(start, end).join('\n');
}

const pick = (a) => a[Math.floor(Math.random() * a.length)];

/** Valuta un modulo di dati puri e ne restituisce gli export richiesti. */
function loadModule(rel, names, scope = {}) {
  const code = read(rel).replace(/^import\s.*$/gm, '').replace(/^export\s+/gm, '');
  try {
    return new Function(...Object.keys(scope), `${code}\nreturn { ${names.join(', ')} };`)(...Object.values(scope));
  } catch (e) {
    throw new Error(`${rel} non è valutabile: ${e.message}`, { cause: e });
  }
}

export const { ALL_CHALLENGES } = loadModule(SRC_FILES.sfide, ['ALL_CHALLENGES']);
export const { SKILL_MAP } = loadModule(SRC_FILES.mondi, ['SKILL_MAP'], { pick });

// Motore di selezione reale (_rnd/_opts/genMathChallenge/filterByAge/getDailyChallenges):
// lo si valuta dal sorgente vero, così l'audit testa il codice di produzione e non una copia.
export const engine = (() => {
  const helpers = sliceBlock('function _rnd(min, max)', 'function initSkills()');
  const code = `
    const ALL_CHALLENGES = ${JSON.stringify(ALL_CHALLENGES)};
    const SKILL_MAP = ${JSON.stringify(SKILL_MAP)};
    function getSkill(type) {
      for (const k in SKILL_MAP) if (SKILL_MAP[k].includes(type)) return k;
      return 'logica';
    }
    function pick(a){ return a[Math.floor(Math.random()*a.length)]; }
    ${helpers}
    return { _rnd, _opts, genMathChallenge, filterByAge, getDailyChallenges, getSkill, SKILL_MAP };
  `;
  return new Function(code)();
})();

export const { getSkill } = engine;

/** Elenco piatto di tutte le sfide, con il mondo di appartenenza. */
export const flatChallenges = Object.entries(ALL_CHALLENGES)
  .flatMap(([world, list]) => list.map(c => ({ ...c, _world: world })));

/** Le uniche età che il bambino può davvero selezionare (schermata `age`). */
export const SELECTABLE_AGES = (() => {
  const m = source.match(/\[\s*\{label:"3\s*–\s*4",val:(\d+).*?\{label:"5\s*–\s*6",val:(\d+).*?\{label:"7\s*–\s*8",val:(\d+)/s);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [4, 6, 8];
})();

export const WORLD_IDS = Object.keys(ALL_CHALLENGES);
