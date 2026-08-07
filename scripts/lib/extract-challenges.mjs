// Estrattore condiviso: legge i blocchi di dati puri da src/MondoMago.jsx e li
// valuta in isolamento. Usato da audit-esercizi.mjs e da validate-challenges.mjs.
//
// Perché non un `import`: MondoMago.jsx è JSX + React, non caricabile da node.
// I dati però sono letterali puri, quindi si estraggono per delimitatori nominali
// (non per numero di riga: i numeri si spostano a ogni commit).
//
// NB: l'input è ESCLUSIVAMENTE il sorgente versionato del progetto — non input
// esterno — quindi new Function() qui è sicuro.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(__dirname, '..', '..');
export const SRC_PATH = join(ROOT, 'src', 'MondoMago.jsx');

export const source = readFileSync(SRC_PATH, 'utf8');
const lines = source.split('\n');

/** Estrae il testo fra la riga che contiene `startsWith` e quella che contiene `endsWith`. */
export function sliceBlock(startsWith, endsWith) {
  const start = lines.findIndex(l => l.includes(startsWith));
  if (start < 0) throw new Error(`Blocco non trovato: ${startsWith}`);
  const end = lines.findIndex((l, i) => i > start && l.includes(endsWith));
  if (end < 0) throw new Error(`Fine blocco non trovata: ${endsWith}`);
  return lines.slice(start, end).join('\n');
}

function evalBlock(code, exportName) {
  try {
    return new Function(`${code}\nreturn ${exportName};`)();
  } catch (e) {
    throw new Error(`Il blocco ${exportName} non è valutabile: ${e.message}`);
  }
}

export const ALL_CHALLENGES = evalBlock(
  sliceBlock('const ALL_CHALLENGES = {', 'const FAMILY_MISSIONS'),
  'ALL_CHALLENGES',
);

// Motore di selezione reale (_rnd/_opts/genMathChallenge/filterByAge/getDailyChallenges):
// lo si valuta dal sorgente vero, così l'audit testa il codice di produzione e non una copia.
export const engine = (() => {
  const helpers = sliceBlock('function _rnd(min, max)', 'function initSkills()');
  const skillMapBlock = sliceBlock('const SKILL_MAP = {', 'const ALL_CHALLENGES = {');
  const code = `
    const ALL_CHALLENGES = ${JSON.stringify(ALL_CHALLENGES)};
    ${skillMapBlock}
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

export const { SKILL_MAP, getSkill } = engine;

/** Elenco piatto di tutte le sfide, con il mondo di appartenenza. */
export const flatChallenges = Object.entries(ALL_CHALLENGES)
  .flatMap(([world, list]) => list.map(c => ({ ...c, _world: world })));

/** Le uniche età che il bambino può davvero selezionare (schermata `age`). */
export const SELECTABLE_AGES = (() => {
  const m = source.match(/\[\s*\{label:"3\s*–\s*4",val:(\d+).*?\{label:"5\s*–\s*6",val:(\d+).*?\{label:"7\s*–\s*8",val:(\d+)/s);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : [4, 6, 8];
})();

export const WORLD_IDS = Object.keys(ALL_CHALLENGES);
