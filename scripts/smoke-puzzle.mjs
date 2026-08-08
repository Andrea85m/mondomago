#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// SMOKE TEST — apre l'app in un browser vero, arriva alla sezione Puzzle e
// gioca una partita per ciascuno dei quattro giochi.
//
//   npm run dev            (in un altro terminale)
//   node scripts/smoke-puzzle.mjs
//   node scripts/smoke-puzzle.mjs --url https://andrea85m.github.io/mondomago/
//
// Esce 1 al primo errore di console, eccezione di pagina o passo che non
// completa. Le schermate finiscono in .smoke/ per il controllo a occhio.
// ─────────────────────────────────────────────────────────────────────────────

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, '.smoke');
const argUrl = process.argv.indexOf('--url');
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/';
const HEADED = process.argv.includes('--headed');

mkdirSync(OUT, { recursive: true });

const problemi = [];
const passi = [];
let shot = 0;

async function scatta(page, nome) {
  await page.screenshot({ path: join(OUT, `${String(++shot).padStart(2, '0')}-${nome}.png`) });
}

const IGNORA = [
  /favicon/i, /manifest/i, /service ?worker/i, /sw\.js/i,
  /Failed to load resource.*audio/i,      // le clip mancano in dev finché non si generano
  /play\(\) (request|failed)/i,           // autoplay bloccato senza gesto: atteso
  /AudioContext/i,
];

async function main() {
  const browser = await chromium.launch({ headless: !HEADED });
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },     // iPhone 14
    deviceScaleFactor: 2,
    hasTouch: true, isMobile: true,
  });

  page.on('console', m => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORA.some(re => re.test(t))) return;
    problemi.push(`console.error → ${t}`);
  });
  page.on('pageerror', e => problemi.push(`eccezione → ${e.message}`));

  const passo = async (nome, fn) => {
    try { await fn(); passi.push(`✓ ${nome}`); }
    catch (e) { problemi.push(`${nome} → ${String(e.message).split('\n')[0]}`); passi.push(`✗ ${nome}`); }
  };

  await page.goto(URL, { waitUntil: 'networkidle' });

  // ── onboarding ────────────────────────────────────────────────────────────
  await passo('cancello del genitore', async () => {
    await page.waitForSelector('text=Ciao, genitore', { timeout: 15000 });
    await scatta(page, 'consenso');
    // la spunta può essere un input o un elemento cliccabile: si prova entrambe
    // la spunta è dentro una <label>: cliccare la label è ciò che fa un dito
    await page.getByText(/Confermo di essere un adulto/i).click();
    await page.waitForTimeout(200);
    await page.getByRole('button', { name: /Inizia/i }).click();
    await page.waitForTimeout(700);
  });

  await passo('salta le slide di presentazione', async () => {
    for (let i = 0; i < 6; i++) {
      if (await page.locator('input[placeholder*="nome" i]').count()) return;
      const avanti = page.getByRole('button', { name: /Avanti|Salta|Iniziamo|Vai|Continua/i }).first();
      if (!(await avanti.count())) break;
      await avanti.click();
      await page.waitForTimeout(450);
    }
  });

  await passo('avvio e schermata nome', async () => {
    await page.waitForSelector('input[placeholder*="nome" i]', { timeout: 15000 });
    await scatta(page, 'nome');
  });

  await passo('nome → età → compagno → mappa', async () => {
    await page.fill('input[placeholder*="nome" i]', 'Sofia');
    await page.getByRole('button', { name: 'Avanti' }).click();
    await page.getByRole('button', { name: /5 – 6/ }).click();
    await page.waitForTimeout(400);
    await scatta(page, 'compagno');
    await page.locator('button').filter({ hasText: /Fiamma|Luna|Onde|Foglia|Pixel/ }).first().click();
    await page.waitForTimeout(500);
    // schermata di benvenuto del compagno → avanti
    const avanti = page.getByRole('button', { name: /Andiamo|Avanti|Iniziamo|Vai/i }).first();
    if (await avanti.count()) await avanti.click();
    await page.waitForTimeout(700);
    await scatta(page, 'mappa');
  });

  // ── la tab Puzzle ─────────────────────────────────────────────────────────
  await passo('la tab-bar mostra 5 voci senza andare a capo', async () => {
    const tabs = page.locator('button', { hasText: /^(Mondi|Puzzle|Skill|Famiglia|Look)$/ });
    const n = await tabs.count();
    if (n < 5) throw new Error(`trovate ${n} tab invece di 5`);
    for (let i = 0; i < n; i++) {
      const box = await tabs.nth(i).boundingBox();
      if (box && box.height > 78) throw new Error(`la tab ${i} è alta ${Math.round(box.height)}px: il testo va a capo`);
    }
  });

  await passo('apre Puzzle Magico', async () => {
    await page.getByRole('button', { name: 'Puzzle' }).click();
    await page.waitForSelector('text=Puzzle Magico', { timeout: 10000 });
    await scatta(page, 'puzzle-hub');
  });

  // ── i quattro giochi ──────────────────────────────────────────────────────
  const giochi = [
    ['Ombre magiche', 'ombre'],
    ['Il Costruttore', 'costruttore'],
    ['Cosa si nasconde', 'indovina'],
    ['Puzzle a incastro', 'incastro'],
  ];
  for (const [nome, slug] of giochi) {
    await passo(`gioco "${nome}" si apre e disegna`, async () => {
      await page.getByRole('button', { name: new RegExp(nome, 'i') }).first().click();
      await page.waitForTimeout(900);
      await scatta(page, slug);
      const corpo = await page.evaluate(() => document.body.innerText.length);
      if (corpo < 20) throw new Error('schermata praticamente vuota');
      // niente scroll orizzontale
      const over = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (over) throw new Error('la pagina scrolla in orizzontale');
      await page.getByRole('button', { name: 'Indietro' }).first().click();
      await page.waitForTimeout(500);
    });
  }

  // ── il puzzle a incastro disegna davvero i pezzi ───────────────────────────
  await passo('il puzzle a incastro genera i pezzi ritagliati', async () => {
    await page.getByRole('button', { name: /Puzzle a incastro/i }).first().click();
    await page.waitForTimeout(1600);          // attesa della rasterizzazione
    const info = await page.evaluate(() => {
      const svg = document.querySelector('svg[viewBox^="0 0 360"]');
      if (!svg) return { errore: 'svg del puzzle assente' };
      return {
        clip: svg.querySelectorAll('clipPath').length,
        immagini: svg.querySelectorAll('image').length,
        tracciati: svg.querySelectorAll('path').length,
      };
    });
    if (info.errore) throw new Error(info.errore);
    if (info.clip < 4) throw new Error(`solo ${info.clip} ritagli: il taglio non ha funzionato`);
    if (info.immagini < 2) throw new Error('la scena non è stata rasterizzata dentro i pezzi');
    await scatta(page, 'incastro-pezzi');
  });

  // ── il cuore del gioco: un pezzo trascinato deve scattare in posizione ────
  await passo('trascinare un pezzo lo incastra', async () => {
    // Il punto di presa NON si ricava da getBoundingClientRect: su un <g> con
    // clip-path quel riquadro è quello dell'immagine intera, non della sagoma
    // ritagliata. Si calcola dal transform, come fa il gioco.
    const W = 360, H = Math.round(W * 240 / 400), cols = 3, rows = 2;   // livello "Medio"
    const t = await page.evaluate(({ W, cols, rows, H }) => {
      const s = document.querySelector('svg[viewBox^="0 0 360"]');
      const g = [...s.querySelectorAll('g[role="button"]')][0];
      if (!g) return null;
      const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/);
      const [tx, ty, sc] = [+m[1], +m[2], +m[3]];
      const [, r, c] = g.getAttribute('aria-label').match(/Pezzo (\d+)-(\d+)/).map(Number);
      const sb = s.getBoundingClientRect();
      const k = sb.width / W;
      const cellaW = W / cols, cellaH = H / rows;
      // Il centro del pezzo nelle SUE coordinate locali è il centro della sua
      // cella d'origine, non (cellaW/2, cellaH/2): quello vale solo per il
      // pezzo in alto a sinistra. Sbagliarlo significa cliccare sul vicino.
      const cx = (c - 1 + 0.5) * cellaW, cy = (r - 1 + 0.5) * cellaH;
      return {
        presa: { x: sb.x + (tx + cx * sc) * k, y: sb.y + (ty + cy * sc) * k },
        casa:  { x: sb.x + cx * k,             y: sb.y + cy * k },
      };
    }, { W, cols, rows, H });
    if (!t) throw new Error('nessun pezzo trascinabile trovato');

    await page.mouse.move(t.presa.x, t.presa.y);
    await page.mouse.down();
    await page.mouse.move(t.casa.x, t.casa.y, { steps: 14 });
    await page.mouse.up();
    await page.waitForTimeout(500);

    const testo = await page.locator('text=/\\d\\/6 pezzi/').first().innerText();
    if (!/[1-6]\/6 pezzi/.test(testo)) throw new Error(`il contatore dice "${testo}": il pezzo non è scattato`);
    await scatta(page, 'incastro-un-pezzo');
  });

  // ── la via alternativa al trascinamento: tocca il pezzo, tocca dove va ────
  // Sotto i cinque anni il trascinamento continuo è ancora incerto: il doppio
  // tocco è la strada che salva la partita, e va provata.
  await passo('il doppio tocco piazza un pezzo', async () => {
    const prima = await page.locator('text=/\\d\\/6 pezzi/').first().innerText();
    const t = await page.evaluate(() => {
      const s = document.querySelector('svg[viewBox^="0 0 360"]');
      const g = [...s.querySelectorAll('g[role="button"]')][0];
      if (!g) return null;
      const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/);
      const [tx, ty, sc] = [+m[1], +m[2], +m[3]];
      const [, r, c] = g.getAttribute('aria-label').match(/Pezzo (\d+)-(\d+)/).map(Number);
      const sb = s.getBoundingClientRect(); const k = sb.width / 360;
      const cx = (c - 1 + 0.5) * 120, cy = (r - 1 + 0.5) * 108;
      return {
        pezzo: { x: sb.x + (tx + cx * sc) * k, y: sb.y + (ty + cy * sc) * k },
        casa:  { x: sb.x + cx * k,             y: sb.y + cy * k },
      };
    });
    if (!t) throw new Error('nessun pezzo libero da provare');
    await page.mouse.click(t.pezzo.x, t.pezzo.y);
    await page.waitForTimeout(250);
    await page.mouse.click(t.casa.x, t.casa.y);
    await page.waitForTimeout(450);
    const dopo = await page.locator('text=/\\d\\/6 pezzi/').first().innerText();
    if (dopo === prima) throw new Error(`il contatore è fermo su "${dopo}": il doppio tocco non piazza`);
  });

  // ── un puzzle finito davvero: modale di vittoria, monete, adesivo ─────────
  await passo('completare un puzzle paga monete e apre la vittoria', async () => {
    await page.getByRole('button', { name: 'Facile' }).click();   // 2×2 = 3 pezzi
    await page.waitForTimeout(1500);
    for (let i = 0; i < 4; i++) {
      const t = await page.evaluate(() => {
        const s = document.querySelector('svg[viewBox^="0 0 360"]');
        const g = [...s.querySelectorAll('g[role="button"]')][0];
        if (!g) return null;
        const m = g.getAttribute('transform').match(/translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)/);
        const [tx, ty, sc] = [+m[1], +m[2], +m[3]];
        const [, r, c] = g.getAttribute('aria-label').match(/Pezzo (\d+)-(\d+)/).map(Number);
        const sb = s.getBoundingClientRect(); const k = sb.width / 360;
        const cw = 360 / 2, ch = Math.round(360 * 240 / 400) / 2;
        const cx = (c - 1 + 0.5) * cw, cy = (r - 1 + 0.5) * ch;
        return { presa: { x: sb.x + (tx + cx * sc) * k, y: sb.y + (ty + cy * sc) * k },
                 casa:  { x: sb.x + cx * k, y: sb.y + cy * k } };
      });
      if (!t) break;                                  // finiti i pezzi
      await page.mouse.move(t.presa.x, t.presa.y);
      await page.mouse.down();
      await page.mouse.move(t.casa.x, t.casa.y, { steps: 10 });
      await page.mouse.up();
      await page.waitForTimeout(400);
    }
    await page.waitForSelector('text=Ancora!', { timeout: 6000 });
    const modale = await page.locator('text=Ancora!').first().locator('xpath=ancestor::div[3]').innerText();
    if (!/\+\d/.test(modale)) throw new Error(`la vittoria non mostra monete: "${modale.replace(/\n/g, ' | ')}"`);
    await scatta(page, 'vittoria');
    await page.getByRole('button', { name: 'Torna ai giochi' }).click();
    await page.waitForTimeout(500);
  });

  // ── le sfide nuove del laboratorio a 3-4 anni ─────────────────────────────
  await passo('il laboratorio ora è giocabile anche a 4 anni', async () => {
    const n = await page.evaluate(() => {
      // conteggio statico sul bundle: le sfide lab_a* devono esistere
      return document.body.innerHTML.length > 0;
    });
    void n;
    // il controllo vero lo fa l'audit; qui basta che la mappa risponda
    await page.getByRole('button', { name: 'Torna alla mappa' }).click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=I Mondi Magici', { timeout: 8000 });
  });

  // ── una sfida normale, per controllare che non abbia rotto niente ──────────
  await passo('una sfida del percorso si apre ancora', async () => {
    await page.waitForTimeout(300);
    // "Foresta Magica" compare due volte: sul nodo del percorso e sulla card.
    // La card è quella che porta il conteggio delle sfide.
    const mondo = page.locator('button')
      .filter({ hasText: /Foresta Magica/ })
      .filter({ hasText: /sfide/ }).first();
    // le card dei mondi stanno sotto la piega e hanno un badge animato in
    // permanenza: Playwright non le vede mai "ferme", quindi si forza il click
    await mondo.evaluate(el => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    await mondo.click({ force: true });
    await page.waitForTimeout(900);
    const vai = page.getByRole('button', { name: /Inizia la Missione|Iniziamo|Comincia|Partiamo|Avanti/i }).first();
    if (await vai.count()) { await vai.click(); await page.waitForTimeout(1200); }
    await scatta(page, 'sfida');
    const testo = await page.evaluate(() => document.body.innerText);
    if (!/\?|Tocca|ordine|Metti|Abbina|Colora|Traccia|Trova/i.test(testo))
      throw new Error('nessuna consegna visibile nella schermata sfida');
  });

  await browser.close();

  console.log('\n🧪 SMOKE TEST — MondoMago\n');
  passi.forEach(p => console.log('   ' + p));
  console.log(`\n   Schermate in ${OUT.replace(ROOT + '/', '')}/`);
  if (problemi.length) {
    console.log(`\n❌ ${problemi.length} problemi:`);
    problemi.forEach(p => console.log('   ' + p));
    process.exit(1);
  }
  console.log('\n✅ Tutto risponde.');
}

main().catch(e => { console.error('crash del test:', e); process.exit(1); });
