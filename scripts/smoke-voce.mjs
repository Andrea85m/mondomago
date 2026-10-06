#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// SMOKE TEST DELLA VOCE — rete lenta + tocchi veloci, come un bambino vero.
//
//   npm run dev            (in un altro terminale)
//   node scripts/smoke-voce.mjs
//
// Ogni clip mp3 arriva con 1,2 s di ritardo (rete mobile). Nel frattempo il
// test tocca l'altoparlante due volte e poi una risposta. Prima del 2026-10-04
// questo faceva partire la voce robotica di sistema sopra la clip, con la frase
// VECCHIA, e due clip finivano per suonare insieme.
//
// Controlla:
//   1. la voce di sistema (speechSynthesis) non parte mai quando la clip esiste
//   2. non suonano mai due clip vocali nello stesso momento
//   3. un doppio tocco sull'altoparlante non fa ripartire la frase da capo
// Esce 1 se un controllo fallisce.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium, webkit } from 'playwright';

const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/app/';
const RITARDO_MS = 1200;

const problemi = [];
const ok = (cond, msg) => { if (!cond) problemi.push(msg); else console.log(`✓ ${msg}`); };

// Strumenta la pagina PRIMA che parta l'app: conta le voci di sistema e tiene
// il registro di quali clip tts_* stanno suonando in ogni momento.
const STRUMENTI = () => {
  window.__voce = { sistema: [], maxInsieme: 0, inOnda: new Set(), avvii: [] };
  const v = window.__voce;
  const origSpeak = window.speechSynthesis?.speak?.bind(window.speechSynthesis);
  if (window.speechSynthesis) window.speechSynthesis.speak = (u) => { v.sistema.push(u.text); return origSpeak?.(u); };
  const isVoce = (el) => /\/audio\/tts_/.test(el.currentSrc || el.src || '');
  document.addEventListener('playing', e => {
    const el = e.target; if (!isVoce(el)) return;
    v.inOnda.add(el); v.avvii.push(el.src.split('/').pop());
    v.maxInsieme = Math.max(v.maxInsieme, v.inOnda.size);
  }, true);
  const via = e => { if (isVoce(e.target)) v.inOnda.delete(e.target); };
  document.addEventListener('pause', via, true);
  document.addEventListener('ended', via, true);
  // anche gli Audio() mai inseriti nel DOM: gli eventi non risalgono il
  // documento, quindi si agganciano al momento della creazione
  const OrigAudio = window.Audio;
  window.Audio = function (src) {
    const a = new OrigAudio(src);
    a.addEventListener('playing', () => { if (!isVoce(a)) return; v.inOnda.add(a); v.avvii.push(a.src.split('/').pop()); v.maxInsieme = Math.max(v.maxInsieme, v.inOnda.size); });
    a.addEventListener('pause', () => v.inOnda.delete(a));
    a.addEventListener('ended', () => v.inOnda.delete(a));
    return a;
  };
  window.Audio.prototype = OrigAudio.prototype;
};

async function main() {
  // --webkit: il motore di Safari (iPhone, iPad, Mac), che blocca l'audio
  // avviato fuori da un tocco. Senza: Chrome vero.
  const browser = process.argv.includes('--webkit')
    ? await webkit.launch()
    : await chromium.launch({ channel: 'chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', e => problemi.push(`eccezione → ${e.message}`));
  await page.addInitScript(STRUMENTI);
  await page.route(/\/audio\/tts_.*\.mp3$/, async route => {
    await new Promise(r => setTimeout(r, RITARDO_MS));
    await route.continue();
  });

  await page.goto(URL, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('text=Ciao, genitore', { timeout: 20000 });
  await page.getByText(/Confermo di essere un adulto/i).click();
  await page.getByRole('button', { name: /Inizia/i }).click();
  await page.waitForTimeout(600);
  for (let i = 0; i < 6; i++) {
    if (await page.locator('input[placeholder*="nome" i]').count()) break;
    const avanti = page.getByRole('button', { name: /Avanti|Salta|Iniziamo|Vai|Continua/i }).first();
    if (!(await avanti.count())) break;
    await avanti.click(); await page.waitForTimeout(400);
  }
  await page.fill('input[placeholder*="nome" i]', 'Sofia');
  await page.getByRole('button', { name: 'Avanti' }).click();
  await page.getByRole('button', { name: /5 – 6/ }).click();
  await page.waitForTimeout(400);
  await page.locator('button').filter({ hasText: /Fiamma|Luna|Onde|Foglia|Pixel/ }).first().click();
  await page.waitForTimeout(500);
  const avanti = page.getByRole('button', { name: /Andiamo|Avanti|Iniziamo|Vai/i }).first();
  if (await avanti.count()) await avanti.click();
  await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });

  // primo mondo aperto → intro → sfida
  // la prima volta un riflettore guida il dito sull'isola: si tocca l'isola sotto
  await page.locator('.mg-isola:not(.chiusa) button').first().dispatchEvent('click');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /Inizia la Missione/i }).dispatchEvent('click', {}, { timeout: 10000 });
  await page.waitForSelector('[aria-label="Rileggi la domanda"]', { timeout: 10000 });
  // alla prima sfida compare la spiegazione "Come si gioca"
  const capito = page.getByRole('button', { name: /Capito/i });
  if (await capito.count()) await capito.click();

  // il bambino tocca subito l'altoparlante due volte, mentre la clip scarica
  const rileggi = page.getByRole('button', { name: 'Rileggi la domanda' });
  await page.waitForTimeout(150);
  await rileggi.click();
  await page.waitForTimeout(120);
  await rileggi.click();
  await page.waitForTimeout(RITARDO_MS + 900);
  const dopoDoppio = await page.evaluate(() => ({ avvii: [...window.__voce.avvii], inOnda: window.__voce.inOnda.size }));

  // e poi una risposta qualsiasi (le opzioni sono i bottoni grandi della sfida)
  const opzione = page.locator('button.mg-opt, button[data-opzione], .mm-schermo button').filter({ hasNotText: /Esci|Rileggi|pausa/i }).nth(3);
  if (await opzione.count()) await opzione.click().catch(() => {});
  await page.waitForTimeout(RITARDO_MS + 2500);

  const v = await page.evaluate(() => ({ sistema: window.__voce.sistema, max: window.__voce.maxInsieme, avvii: window.__voce.avvii }));
  console.log('clip avviate:', v.avvii.join(', ') || '(nessuna)');

  ok(v.sistema.length === 0, `la voce di sistema non parte mai (partita ${v.sistema.length} volte${v.sistema.length ? ': ' + v.sistema.join(' | ') : ''})`);
  ok(v.max <= 1, `mai due clip vocali insieme (massimo contemporanee: ${v.max})`);
  ok(dopoDoppio.avvii.length >= 1, `la domanda si sente nonostante la rete lenta (${dopoDoppio.avvii.length} avvii)`);
  const stessa = dopoDoppio.avvii.filter((x, i, a) => a.indexOf(x) !== i).length;
  ok(stessa === 0, `il doppio tocco non fa ripartire la frase da capo (ripartenze: ${stessa})`);

  await browser.close();
  if (problemi.length) { console.error('\n✗ ' + problemi.join('\n✗ ')); process.exit(1); }
  console.log('\nVoce OK');
}

main().catch(e => { console.error(e); process.exit(1); });
