// ─────────────────────────────────────────────────────────────────────────────
// Scatti dell'app vera a 1080×1920 (360×640 a densità 3): servono per gli
// screenshot di Google Play e per controllare la grafica schermata per schermata.
//   npm run dev   (in un altro terminale)
//   node scripts/scatti.mjs [--url https://magistella.com/app/]
// Le immagini finiscono in .scatti/
// ─────────────────────────────────────────────────────────────────────────────
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.scatti');
const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/app/';
mkdirSync(OUT, { recursive: true });

const attendi = (p, ms) => p.waitForTimeout(ms);
async function scatta(page, nome) {
  await attendi(page, 900);
  await page.screenshot({ path: join(OUT, `${nome}.png`) });
  console.log('📸', nome);
}
async function clicca(page, re, opz = {}) {
  const b = page.getByRole('button', { name: re }).first();
  if (!(await b.count())) return false;
  await b.click({ force: true, ...opz }).catch(() => {});
  return true;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
await page.goto(URL, { waitUntil: 'networkidle' });

// onboarding (come nello smoke test)
await page.waitForSelector('text=Ciao, genitore', { timeout: 15000 });
await page.getByText(/Confermo di essere un adulto/i).click();
await clicca(page, /Inizia/i); await attendi(page, 700);
for (let i = 0; i < 6; i++) {
  if (await page.locator('input[placeholder*="nome" i]').count()) break;
  if (!(await clicca(page, /Avanti|Salta|Iniziamo|Vai|Continua/i))) break;
  await attendi(page, 450);
}
await page.fill('input[placeholder*="nome" i]', 'Sofia');
await clicca(page, /^Avanti$/);
await clicca(page, /5 – 6/); await attendi(page, 400);
await scatta(page, '02-compagno');
await page.locator('button').filter({ hasText: /Foglia/ }).first().click(); await attendi(page, 500);
await clicca(page, /Andiamo|Avanti|Iniziamo|Vai/i); await attendi(page, 900);
await scatta(page, '01-home');

// un mondo intero, rispondendo sempre alla prima opzione
await page.getByRole('button', { name: /^Foresta Magica/ }).first().click({ force: true });
await attendi(page, 900);
await scatta(page, '03-ingresso-mondo');
await clicca(page, /Inizia la Missione/i); await attendi(page, 1200);
await clicca(page, /Capito/i); await attendi(page, 600);
await scatta(page, '04-sfida');
// per arrivare alla ricompensa si usa la Sfida del Giorno: tre sfide e poi la festa
async function giocaFinoAllaFine(maxGiri) {
  for (let giro = 0; giro < maxGiri; giro++) {
    if (await page.getByText(/Mondo completato|Fantastico/i).count()) return true;
    const carte = page.getByRole('button', { name: /^\?$/ });
    if (await carte.count() >= 2) {
      // memory: si girano le carte a coppie finché non spariscono i "?"
      const n = await carte.count();
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const c = page.getByRole('button', { name: /^\?$/ });
        if (await c.count() < 2) break;
        await c.nth(0).click({ force: true }).catch(() => {});
        await attendi(page, 150);
        await c.nth(Math.min(j - i, (await c.count()) - 1)).click({ force: true }).catch(() => {});
        await attendi(page, 900);
      }
    }
    const t = page.locator('button.ans-btn, button.ans-vis, button[aria-label^="Risposta"]').first();
    if (await t.count()) { await t.click({ force: true }).catch(() => {}); await attendi(page, 900); }
    if (giro === 0 && !(await page.getByText(/Mondo completato/i).count())) await scatta(page, '05-risposta');
    await clicca(page, /Avanti|Continua|Prossima|Vai avanti|Continuiamo/i);
    await attendi(page, 900);
  }
  return !!(await page.getByText(/Mondo completato|Fantastico/i).count());
}
await page.goto(URL + '?schermata=fine', { waitUntil: 'networkidle' });
await attendi(page, 2200);
if (await page.getByText(/Mondo completato/i).count()) await scatta(page, '06-ricompensa');
await page.goto(URL + '?action=daily', { waitUntil: 'networkidle' });
await attendi(page, 1200);
await clicca(page, /Inizia la Missione|Iniziamo|Comincia|Partiamo/i); await attendi(page, 1000);
await clicca(page, /Capito/i); await attendi(page, 500);
const fatto = await giocaFinoAllaFine(30);


// torna alla mappa e fotografa le sezioni
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
await scatta(page, '07-home-dopo-un-mondo');
for (const [tab, nome] of [['Look', '08-negozio'], ['Skill', '09-abilita'], ['Puzzle', '10-puzzle'], ['Famiglia', '11-famiglia']]) {
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
  await page.locator('nav button', { hasText: tab }).first().click({ force: true });
  await scatta(page, nome);
}
await page.goto(URL, { waitUntil: 'networkidle' });
await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
await clicca(page, /Il Sigillo Magico/i);
await scatta(page, '12-sigillo');
await browser.close();
console.log('✅ scatti in .scatti/', fatto ? '' : '(la Sfida del Giorno giocata a caso non è arrivata alla fine: normale)');
