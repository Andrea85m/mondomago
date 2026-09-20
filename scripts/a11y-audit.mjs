#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// ACCESSIBILITÀ — axe-core su tutte le schermate principali, in un browser vero.
//
//   npm run dev                (in un altro terminale)
//   npm run a11y
//   npm run a11y -- --url http://localhost:4173/
//
// Regole WCAG 2.1 A/AA + best practice. Esce 1 se trova violazioni "serious"
// o "critical": sono quelle che impediscono davvero l'uso a qualcuno
// (etichette mancanti, contrasto illeggibile, elementi irraggiungibili).
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import axe from 'axe-core';

const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/';
const VERBOSE = process.argv.includes('--verbose');

const risultati = [];

async function analizza(page, schermata) {
  await page.waitForTimeout(900);                     // animazioni d'ingresso
  await page.addScriptTag({ content: axe.source });
  const r = await page.evaluate(() => window.axe.run(document, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] },
    resultTypes: ['violations'],
  }));
  risultati.push({ schermata, violazioni: r.violations });
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true,
    reducedMotion: 'reduce',
  });

  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=Ciao, genitore', { timeout: 15000 });
  await analizza(page, 'consenso');

  await page.getByText(/Confermo di essere un adulto/i).click();
  await page.getByRole('button', { name: /Inizia/i }).click();
  await page.waitForTimeout(600);
  await analizza(page, 'presentazione');

  for (let i = 0; i < 6; i++) {
    if (await page.locator('input[placeholder*="nome" i]').count()) break;
    const avanti = page.getByRole('button', { name: /Avanti|Salta|Iniziamo|Vai|Continua/i }).first();
    if (!(await avanti.count())) break;
    await avanti.click();
    await page.waitForTimeout(400);
  }
  await page.waitForSelector('input[placeholder*="nome" i]');
  await analizza(page, 'nome');

  await page.fill('input[placeholder*="nome" i]', 'Sofia');
  await page.getByRole('button', { name: 'Avanti' }).click();
  await page.waitForTimeout(500);
  await analizza(page, 'età');

  await page.getByRole('button', { name: /5 – 6/ }).click();
  await page.waitForTimeout(500);
  await analizza(page, 'compagno');

  await page.locator('button').filter({ hasText: /Fiamma|Luna|Onde|Foglia|Pixel/ }).first().click();
  await page.waitForTimeout(600);
  await analizza(page, 'benvenuto del compagno');

  const via = page.getByRole('button', { name: /Andiamo|Avanti|Iniziamo|Vai/i }).first();
  if (await via.count()) await via.click();
  await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
  await analizza(page, 'mappa');

  // Ogni tab parte dalla mappa: ricaricando, il profilo salvato riporta lì.
  const allaMappa = async () => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
  };
  for (const tab of ['Skill', 'Famiglia', 'Look', 'Puzzle']) {
    await allaMappa();
    await page.getByRole('button', { name: tab, exact: true }).first().click();
    await page.waitForTimeout(700);
    await analizza(page, `tab ${tab}`);
  }

  await allaMappa();
  const mondo = page.locator('button').filter({ hasText: /Foresta Magica/ }).filter({ hasText: /sfide/ }).first();
  await mondo.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await mondo.click({ force: true });
  await page.waitForTimeout(900);
  await analizza(page, 'introduzione del mondo');

  const parti = page.getByRole('button', { name: /Inizia la Missione|Iniziamo|Comincia|Partiamo|Avanti/i }).first();
  if (await parti.count()) await parti.click();
  await page.waitForTimeout(1200);
  await analizza(page, 'sfida');

  await browser.close();

  // ── report ──────────────────────────────────────────────────────────────────
  const gravi = new Map();          // regola → { impatto, help, schermate, nodi }
  const lievi = new Map();
  for (const { schermata, violazioni } of risultati) {
    for (const v of violazioni) {
      const dest = ['serious', 'critical'].includes(v.impact) ? gravi : lievi;
      const e = dest.get(v.id) || { impatto: v.impact, help: v.help, schermate: new Set(), nodi: [] };
      e.schermate.add(schermata);
      e.nodi.push(...v.nodes.map(n => n.target.join(' ') + (n.failureSummary ? ` — ${n.failureSummary.split('\n')[1]?.trim()}` : '')));
      dest.set(v.id, e);
    }
  }

  console.log(`\n♿ ACCESSIBILITÀ — Magistella · ${risultati.length} schermate\n`);
  const stampa = (titolo, mappa) => {
    if (!mappa.size) return;
    console.log(titolo);
    for (const [id, e] of mappa) {
      console.log(`  ✗ ${id} [${e.impatto}] ${e.help}`);
      console.log(`    in: ${[...e.schermate].join(', ')} · ${e.nodi.length} elementi`);
      for (const n of (VERBOSE ? e.nodi : e.nodi.slice(0, 3))) console.log(`      ${n.slice(0, 170)}`);
    }
    console.log('');
  };
  stampa('GRAVI (bloccano la PR):', gravi);
  stampa('MINORI:', lievi);

  if (gravi.size) { console.log(`❌ ${gravi.size} regole gravi violate.`); process.exit(1); }
  console.log(lievi.size ? `✅ Nessuna violazione grave (${lievi.size} minori).` : '✅ Nessuna violazione.');
}

main().catch(e => { console.error('crash del test:', e); process.exit(1); });
