#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// CONTROLLO DISPOSITIVI — la stessa partita su telefoni, tablet e computer.
//
//   npm run dev        (oppure --url https://magistella.com/app/)
//   node scripts/controllo-dispositivi.mjs
//
// Per ogni dispositivo (Chrome = Android e PC, WebKit = iPhone, iPad, Safari su
// Mac) apre le schermate principali e misura:
//   · niente scorrimento orizzontale
//   · nei giochi del puzzle, tabellone e vaschetta interamente nello schermo
//   · bottoni toccabili di almeno 40×40 px
//   · nessun errore JavaScript
// Le schermate finiscono in .dispositivi/<dispositivo>/. Esce 1 se qualcosa non va.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium, webkit } from 'playwright';
import { mkdirSync } from 'node:fs';

const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/app/';
const solo = process.argv.indexOf('--solo') > -1 ? process.argv[process.argv.indexOf('--solo') + 1] : null;

const DISPOSITIVI = [
  { nome: 'android-pixel7', motore: chromium, viewport: { width: 412, height: 915 }, dpr: 2.6, mobile: true },
  { nome: 'android-piccolo', motore: chromium, viewport: { width: 360, height: 740 }, dpr: 3, mobile: true },
  { nome: 'iphone-se', motore: webkit, viewport: { width: 375, height: 667 }, dpr: 2, mobile: true },
  { nome: 'iphone-14', motore: webkit, viewport: { width: 390, height: 844 }, dpr: 3, mobile: true },
  { nome: 'ipad', motore: webkit, viewport: { width: 820, height: 1180 }, dpr: 2, mobile: true },
  { nome: 'mac-safari', motore: webkit, viewport: { width: 1440, height: 900 }, dpr: 2, mobile: false },
  { nome: 'pc-chrome', motore: chromium, viewport: { width: 1440, height: 900 }, dpr: 1, mobile: false },
  { nome: 'portatile-chrome', motore: chromium, viewport: { width: 1280, height: 720 }, dpr: 1, mobile: false },
].filter(d => !solo || d.nome === solo);

const problemi = [];

async function misura(page, disp, schermata, { gioco = false } = {}) {
  const m = await page.evaluate((gioco) => {
    const vw = window.innerWidth, vh = window.innerHeight;
    const r = { scrollOrizz: document.documentElement.scrollWidth > vw + 2 };
    if (gioco) {
      const svg = document.querySelector('svg[data-sagomato]');
      if (!svg) r.errore = 'tabellone assente';
      else { const b = svg.getBoundingClientRect(); r.fondo = Math.round(b.bottom); r.vh = vh; r.larghezza = Math.round(b.width); }
    }
    // bottoni visibili troppo piccoli (escluse le voci della barra, che sono grandi per costruzione)
    r.piccoli = [...document.querySelectorAll('button, [role="button"]')].filter(el => {
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height || b.bottom < 0 || b.top > vh) return false;
      if (el.closest('svg')) return false;                    // pezzi del puzzle: si trascinano
      return b.width < 40 || b.height < 40;
    }).map(el => (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 30)).slice(0, 5);
    return r;
  }, gioco);
  const pref = `[${disp.nome}] ${schermata}`;
  if (m.scrollOrizz) problemi.push(`${pref}: la pagina scorre in orizzontale`);
  if (m.errore) problemi.push(`${pref}: ${m.errore}`);
  if (gioco && m.fondo > m.vh + 1) problemi.push(`${pref}: il gioco esce dallo schermo (fondo ${m.fondo}px, schermo ${m.vh}px)`);
  if (m.piccoli?.length) problemi.push(`${pref}: bottoni sotto 40px → ${m.piccoli.join(' · ')}`);
  await page.screenshot({ path: `.dispositivi/${disp.nome}/${schermata}.png` });
  return m;
}

async function onboarding(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Ciao, genitore', { timeout: 20000 });
  await page.getByText(/Confermo di essere un adulto/i).click();
  await page.getByRole('button', { name: /Inizia/i }).click(); await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) {
    if (await page.locator('input[placeholder*="nome" i]').count()) break;
    const a = page.getByRole('button', { name: /Avanti|Salta|Iniziamo|Vai|Continua/i }).first();
    if (!(await a.count())) break;
    await a.click(); await page.waitForTimeout(350);
  }
  await page.fill('input[placeholder*="nome" i]', 'Sofia');
  await page.getByRole('button', { name: 'Avanti' }).click();
  await page.getByRole('button', { name: /5 – 6/ }).click(); await page.waitForTimeout(350);
  await page.locator('button').filter({ hasText: /Fiamma|Luna|Onde|Foglia|Pixel/ }).first().click(); await page.waitForTimeout(400);
  const a = page.getByRole('button', { name: /Andiamo|Avanti|Iniziamo|Vai/i }).first();
  if (await a.count()) await a.click();
  await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
}

async function apriGioco(page, nome) {
  await page.getByRole('button', { name: new RegExp(nome, 'i') }).first().click();
  await page.waitForTimeout(500);
  if (await page.getByText('Con cosa giochiamo?').count()) {
    await page.getByRole('button', { name: 'Animali', exact: true }).click();
    await page.waitForTimeout(800);
  }
}
async function tornaHub(page) {
  for (let i = 0; i < 3; i++) {
    if (await page.getByText('Cinque giochi per costruire').count()) return;
    await page.getByRole('button', { name: 'Indietro' }).first().click();
    await page.waitForTimeout(400);
  }
}

for (const disp of DISPOSITIVI) {
  mkdirSync(`.dispositivi/${disp.nome}`, { recursive: true });
  const browser = await disp.motore.launch();
  const ctx = await browser.newContext({ viewport: disp.viewport, deviceScaleFactor: disp.dpr, isMobile: disp.mobile && disp.motore === chromium, hasTouch: disp.mobile, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', e => problemi.push(`[${disp.nome}] errore JS: ${e.message}`));
  try {
    await onboarding(page);
    await page.waitForTimeout(700);
    await misura(page, disp, '1-mappa');
    await page.locator('nav.mg-tabs').getByRole('button', { name: 'Puzzle' }).click(); await page.waitForTimeout(900);
    await misura(page, disp, '2-puzzle-hub');
    await page.getByRole('button', { name: /Ombre magiche/i }).first().click(); await page.waitForTimeout(700);
    await misura(page, disp, '2b-scelta-tema');
    await page.getByRole('button', { name: 'Indietro' }).first().click(); await page.waitForTimeout(400);
    await page.getByRole('button', { name: /Puzzle degli animali/i }).first().click(); await page.waitForTimeout(800);
    await misura(page, disp, '3-animali-scelta');
    await page.getByRole('button', { name: /^Leone$/ }).click();
    await page.waitForSelector('svg[data-sagomato] g[role="button"]', { timeout: 10000 }); await page.waitForTimeout(500);
    await misura(page, disp, '4-animali-gioco', { gioco: true });
    for (const liv of ['Mago']) {
      await page.getByRole('button', { name: liv }).click(); await page.waitForTimeout(900);
      await misura(page, disp, `4b-animali-${liv.toLowerCase()}`, { gioco: true });
    }
    await page.getByRole('button', { name: 'Indietro' }).first().click(); await page.waitForTimeout(300);
    await page.getByRole('button', { name: 'Indietro' }).first().click(); await page.waitForTimeout(500);
    for (const [nome, slug] of [['Il Costruttore', '5-costruttore'], ['Puzzle a incastro', '6-incastro']]) {
      await apriGioco(page, nome);
      await page.waitForSelector('svg[data-sagomato] g[role="button"]', { timeout: 10000 }); await page.waitForTimeout(500);
      await misura(page, disp, slug, { gioco: true });
      await tornaHub(page);
    }
    for (const [nome, slug] of [['Cosa si nasconde', '7-indovina'], ['Ombre magiche', '8-ombre']]) {
      await apriGioco(page, nome); await page.waitForTimeout(400);
      await misura(page, disp, slug);
      await tornaHub(page);
    }
    await page.locator('nav.mg-tabs').getByRole('button', { name: 'Look' }).click(); await page.waitForTimeout(800);
    await misura(page, disp, '9-look');
    await page.locator('nav.mg-tabs').getByRole('button', { name: 'Mondi' }).click(); await page.waitForTimeout(700);
    await page.locator('.mg-isola:not(.chiusa) button').first().dispatchEvent('click'); await page.waitForTimeout(700);
    await page.getByRole('button', { name: /Inizia la Missione/i }).dispatchEvent('click'); await page.waitForTimeout(1200);
    const capito = page.getByRole('button', { name: /Capito/i });
    if (await capito.count()) await capito.click();
    await page.waitForTimeout(500);
    await misura(page, disp, '10-sfida');
    console.log(`✓ ${disp.nome}`);
  } catch (e) {
    problemi.push(`[${disp.nome}] il percorso si è interrotto: ${String(e.message).split('\n')[0]}`);
    await page.screenshot({ path: `.dispositivi/${disp.nome}/ERRORE.png` }).catch(() => {});
  }
  await browser.close();
}

if (problemi.length) { console.error('\n✗ ' + problemi.join('\n✗ ')); process.exit(1); }
console.log('\n✅ Tutti i dispositivi a posto. Schermate in .dispositivi/');
