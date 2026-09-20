#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// SCREENSHOT DELLO STORE E DEL MANIFEST — fotografati dall'app vera.
//
//   npm run dev                                   (in un altro terminale)
//   node scripts/gen-screenshots.mjs
//   node scripts/gen-screenshots.mjs --url http://localhost:4173/
//
// Prima questi file erano mockup disegnati a mano con la palette di giugno:
// all'installazione Android mostravano un'app che non esisteva più. Ora si
// apre il gioco con un profilo dimostrativo e si scatta, a 1080×1920.
// La casualità è fissata (Math.random con seme), quindi due esecuzioni danno
// le stesse immagini.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'public', 'screenshots');
const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/';

// Tutti i mondi aperti: stelle appena sopra la soglia dell'ultimo.
const source = readFileSync(join(ROOT, 'src', 'data', 'mondi.js'), 'utf8');
const sogliaMax = Math.max(...[...source.matchAll(/starsNeeded:\s*(\d+)/g)].map(m => +m[1]));

const oggi = new Date();
const giorno = (n) => { const d = new Date(oggi); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10); };
const PROFILO = {
  id: 'demo-store', childName: 'Sofia', childAge: 6, companion: 'luna',
  totalStars: sogliaMax + 14, coins: 36, streak: 5, lastDate: giorno(0), dailyCount: 3,
  skills: { logica: 5, numeri: 6, creativita: 4, empatia: 5, parole: 4, coding: 3 },
  items: [], missionsDone: [], dailyCompletedDate: '', achievements: [], equippedCosmetic: {},
  missed: [], schoolMode: false, schoolCode: '', schoolAssigned: [], ownedCosmetics: [],
  sessionLog: [1, 2, 3, 5, 6].map((n, i) => ({
    date: giorno(n), stars: 8 + i * 2, world: ['foresta', 'castello', 'oceano', 'mercato', 'galassia'][i],
    correct: 7 + (i % 3), total: 10, minutes: 9 + i,
  })),
};

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true,
  });
  await ctx.addInitScript(({ profilo }) => {
    // seme fisso: stessa sfida, stessi pezzi, stesse particelle a ogni esecuzione
    let s = 20260913;
    Math.random = () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    if (!localStorage.getItem('mondomago_profiles_v1')) {
      localStorage.setItem('mondomago_consent', '1');
      localStorage.setItem('mondomago_tutorial', '1');
      localStorage.setItem('mondomago_install_dismissed', '1');
      localStorage.setItem('mondomago_tts', '0');
      localStorage.setItem('mondomago_profiles_v1', JSON.stringify([profilo]));
    }
  }, { profilo: PROFILO });

  const page = await ctx.newPage();
  const scatta = async (nome, attesa = 1400) => {
    await page.waitForTimeout(attesa);
    await page.screenshot({ path: join(OUT, `${nome}.png`) });
    console.log(`  ✓ ${nome}.png`);
  };
  const allaMappa = async () => {
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=I Mondi Magici', { timeout: 15000 });
  };

  await allaMappa();
  // si aspetta che sparisca il toast dei traguardi appena sbloccati
  await scatta('screen-map', 5200);

  await page.getByRole('button', { name: 'Skill', exact: true }).first().click();
  await scatta('screen-skills');

  await allaMappa();
  const lab = page.locator('button').filter({ hasText: /Laboratorio/ }).filter({ hasText: /sfide/ }).first();
  await lab.evaluate(el => el.scrollIntoView({ block: 'center' }));
  await lab.click({ force: true });
  await scatta('screen-world-intro', 1800);
  const parti = page.getByRole('button', { name: /Inizia la Missione|Iniziamo|Comincia|Partiamo|Avanti/i }).first();
  if (await parti.count()) await parti.click();
  await scatta('screen-challenge', 2000);

  await allaMappa();
  await page.getByRole('button', { name: 'Puzzle', exact: true }).first().click();
  await page.waitForSelector('text=Puzzle Magico');
  await page.getByRole('button', { name: /Puzzle a incastro/i }).first().click();
  await page.getByRole('button', { name: 'Facile' }).click();
  await scatta('screen-puzzle', 1800);

  // si finisce il puzzle trascinando ogni pezzo a casa (vedi smoke-puzzle.mjs)
  for (let i = 0; i < 6; i++) {
    const t = await page.evaluate(() => {
      const s = document.querySelector('svg[viewBox^="0 0 360"]');
      const g = s && [...s.querySelectorAll('g[role="button"]')][0];
      if (!g) return null;
      const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/);
      const [tx, ty, sc] = [+m[1], +m[2], +m[3]];
      const [, r, c] = g.getAttribute('aria-label').match(/Pezzo (\d+)-(\d+)/).map(Number);
      const sb = s.getBoundingClientRect(); const k = sb.width / 360;
      const cw = 180, ch = Math.round(360 * 240 / 400) / 2;
      const cx = (c - 1 + 0.5) * cw, cy = (r - 1 + 0.5) * ch;
      return { presa: { x: sb.x + (tx + cx * sc) * k, y: sb.y + (ty + cy * sc) * k }, casa: { x: sb.x + cx * k, y: sb.y + cy * k } };
    });
    if (!t) break;
    await page.mouse.move(t.presa.x, t.presa.y);
    await page.mouse.down();
    await page.mouse.move(t.casa.x, t.casa.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(400);
  }
  await page.waitForSelector('text=Ancora!', { timeout: 8000 });
  await scatta('screen-reward', 1600);

  await feature(browser);
  await browser.close();
}

// Feature graphic di Google Play: 1024×500, niente testo piccolo, niente bordi.
async function feature(browser) {
  const dataUri = (file, type) => `data:${type};base64,${readFileSync(file).toString('base64')}`;
  const font = dataUri(join(ROOT, 'node_modules/@fontsource/grandstander/files/grandstander-latin-800-normal.woff2'), 'font/woff2');
  const icona = dataUri(join(ROOT, 'public/icon-512.png'), 'image/png');
  const chars = readdirSync(join(ROOT, 'public/characters'))
    .filter(f => /_cutout\.webp$/.test(f)).sort()
    .map(f => dataUri(join(ROOT, 'public/characters', f), 'image/webp'));

  const page = await browser.newPage({ viewport: { width: 1024, height: 500 }, deviceScaleFactor: 1 });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: G; src: url(${font}) format('woff2'); font-weight: 800; }
    * { margin: 0; box-sizing: border-box; }
    body { width: 1024px; height: 500px; overflow: hidden; font-family: G, system-ui, sans-serif;
      background: radial-gradient(90% 120% at 22% 0%, #3B2475 0%, #1B1035 55%, #110824 100%); color: #F6ECD4; position: relative; }
    .stella { position: absolute; border-radius: 50%; background: #fff; }
    .testo { position: absolute; left: 64px; top: 84px; width: 440px; }
    .testo img { width: 108px; height: 108px; border-radius: 26px; box-shadow: 0 10px 40px rgba(0,0,0,.45); }
    h1 { font-size: 76px; line-height: 1; color: #FFC24B; margin: 26px 0 14px; letter-spacing: .5px; }
    p { font-size: 28px; line-height: 1.28; opacity: .9; }
    .compagni { position: absolute; right: 30px; bottom: 44px; display: flex; align-items: flex-end; }
    .compagni img { height: 124px; margin-left: -14px; filter: drop-shadow(0 10px 18px rgba(0,0,0,.45)); }
    .compagni img:nth-child(3) { height: 170px; }
    .compagni img:nth-child(2), .compagni img:nth-child(4) { height: 146px; }
    .anello { position: absolute; right: 118px; top: 58px; width: 300px; height: 300px; border-radius: 50%;
      border: 3px dashed rgba(255,194,75,.35); }
    .anello::after { content: ''; position: absolute; inset: 26px; border-radius: 50%; border: 2px solid rgba(109,224,198,.3); }
  </style></head><body>
    ${Array.from({ length: 60 }, (_, i) => {
      const x = (i * 73.13 + 11.7) % 100, y = (i * 47.37 + 23.1) % 100, sz = [1, 1, 2, 2, 3][i % 5];
      return `<div class="stella" style="left:${x}%;top:${y}%;width:${sz}px;height:${sz}px;opacity:${0.3 + (i % 4) * 0.15}"></div>`;
    }).join('')}
    <div class="anello"></div>
    <div class="testo"><img src="${icona}" alt=""><h1>Magistella</h1><p>Logica, numeri e parole<br>per bambini da 3 a 8 anni</p></div>
    <div class="compagni">${chars.map(c => `<img src="${c}" alt="">`).join('')}</div>
  </body></html>`);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, 'feature-graphic.png') });
  await page.close();
  console.log('  ✓ feature-graphic.png (1024×500)');
}

main().catch(e => { console.error('crash:', e); process.exit(1); });
