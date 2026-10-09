#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// SMOKE "VOCE E POPUP" — il feedback di Andrea del 7 Ott 2026: finita una
// sfida, la voce di quella dopo partiva con un popup ancora aperto.
// Qui un bambino a 34 stelle risponde giusto, sale di livello (popup "Nuovo
// livello", resta finché non lo si tocca) e si controlla che:
//   1. mentre il popup è aperto la domanda NON cambia e nessuna consegna parte;
//   2. chiuso il popup, la domanda dopo arriva e la sua voce parte.
//
//   npm run dev            (in un altro terminale)
//   node scripts/smoke-popup.mjs
// Esce 1 se una delle due condizioni salta.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const INDIRIZZO = process.argv[2] || 'http://localhost:5173/app/';
const MAPPA = JSON.parse(readFileSync(new URL('../src/ttsMap.json', import.meta.url)));
const TESTO = Object.fromEntries(Object.entries(MAPPA).map(([t, f]) => [f, t]));
const RISPOSTA_SEMPLICE = new Set(['multiple_choice', 'visual_tap', 'word_picture', 'rhyme_complete', 'quiz_cartoon']);

const browser = await chromium.launch();
let ok = false, motivo = 'nessuna sfida a risposta semplice dopo 8 tentativi';
for (let tentativo = 0; tentativo < 8 && !ok; tentativo++) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    if (sessionStorage.getItem('seme')) return;
    sessionStorage.setItem('seme', '1');
    localStorage.setItem('mondomago_consent', '1');
    localStorage.setItem('mondomago_tutorial', '1');
    localStorage.setItem('mondomago_profiles_v1', JSON.stringify([{ id: 'p1', childName: 'Test', childAge: 6, companion: 'luna',
      totalStars: 34, coins: 0, items: [], achievements: ['first_star', 'combo3', 'explorer'], streak: 1,
      lastDate: new Date().toISOString().slice(0, 10), sessionLog: [], percorso: { foresta: { tappa: 1, livello: 1 } } }]));
    // registro delle clip vocali fatte partire, con l'ora
    window.__voci = [];
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () {
      const f = (this.src || '').split('/').pop();
      if (f.startsWith('tts_')) window.__voci.push([performance.now(), f]);
      return play.call(this).catch(() => {});
    };
  });
  const page = await ctx.newPage();
  await page.goto(INDIRIZZO);
  await page.waitForTimeout(1200);
  await page.mouse.click(5, 5);                       // primo gesto: sblocca l'audio
  await page.getByRole('button', { name: /^Gioca:/ }).click({ force: true });
  await page.waitForTimeout(1500);
  const ch = await page.evaluate(() => window.__mmSfida);
  if (!ch || !RISPOSTA_SEMPLICE.has(ch.format) || !Array.isArray(ch.options)) { await ctx.close(); continue; }
  const giusta = ch.options[ch.correct];
  const idPrima = ch.id;
  await page.getByRole('button', { name: String(giusta), exact: false }).first().click({ force: true });
  const tRisposta = await page.evaluate(() => performance.now());
  // il popup del livello deve comparire
  await page.getByText('Nuovo livello', { exact: false }).first().waitFor({ timeout: 4000 });
  await page.waitForTimeout(3500);                     // ben oltre gli 1,55 s del vecchio avanzamento
  const durante = await page.evaluate(() => window.__mmSfida?.id);
  const vociDurante = (await page.evaluate(() => window.__voci)).filter(([t]) => t > tRisposta).map(([, f]) => TESTO[f] || f);
  if (durante !== idPrima) { motivo = `la domanda è cambiata con il popup aperto (voci: ${vociDurante.join(' | ')})`; await ctx.close(); break; }
  const consegneDurante = vociDurante.filter(t => t === (ch.prompt || ch.question));
  // chiudo il popup
  const tChiuso = await page.evaluate(() => performance.now());
  await page.getByText('Nuovo livello', { exact: false }).first().click({ force: true });
  await page.waitForFunction(id => window.__mmSfida && window.__mmSfida.id !== id, idPrima, { timeout: 4000 });
  const dopo = await page.evaluate(() => window.__mmSfida);
  await page.waitForTimeout(1500);
  const voci = await page.evaluate(() => window.__voci);
  const consegnaDopo = (dopo.prompt || dopo.question || dopo.situation || '').split('\n')[0];
  const partita = voci.find(([t, f]) => t > tChiuso && (TESTO[f] || '').startsWith(consegnaDopo.slice(0, 12)));
  console.log('voci con il popup aperto:', vociDurante.join(' | ') || '(nessuna)');
  console.log('domanda dopo:', consegnaDopo, '→ voce', partita ? `partita ${Math.round(partita[0] - tChiuso)} ms dopo la chiusura` : 'NON partita');
  ok = consegneDurante.length === 0 && (!!partita || !TESTO[MAPPA[consegnaDopo]]);
  if (!ok) motivo = partita ? 'consegna letta con il popup aperto' : 'la voce della domanda dopo non è partita';
  await ctx.close();
}
await browser.close();
console.log(ok ? '✓ la sfida aspetta il popup, poi legge la domanda' : `✗ ${motivo}`);
process.exit(ok ? 0 : 1);
