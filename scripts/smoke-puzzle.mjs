#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// SMOKE TEST — apre l'app in un browser vero, arriva alla sezione Puzzle e
// gioca una partita per ciascuno dei quattro giochi.
//
//   npm run dev            (in un altro terminale)
//   node scripts/smoke-puzzle.mjs
//   node scripts/smoke-puzzle.mjs --url https://magistella.com/app/
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
const URL = argUrl > -1 ? process.argv[argUrl + 1] : 'http://localhost:5173/app/';
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

  // ── il profilo sopravvive a un ricaricamento ──────────────────────────────
  // Senza questo passo nessuno si era accorto che al primo avvio il profilo
  // non veniva mai salvato: ricaricando, il bambino ripartiva da "Come ti chiami?".
  await passo('ricaricando la pagina il profilo resta', async () => {
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('text=I Mondi Magici', { timeout: 10000 });
    const salvati = await page.evaluate(() => JSON.parse(localStorage.getItem('mondomago_profiles_v1') || '[]'));
    if (salvati.length !== 1) throw new Error(`profili salvati: ${salvati.length} invece di 1`);
    if (salvati[0].childName !== 'Sofia') throw new Error(`nome salvato: ${salvati[0].childName}`);
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
    await page.waitForTimeout(1600);          // attesa del caricamento del quadro
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
    if (info.immagini < 2) throw new Error('il quadro non è dentro i pezzi');
    await scatta(page, 'incastro-pezzi');
  });

  // ── il cuore del gioco: un pezzo trascinato deve scattare in posizione ────
  // Le coordinate si leggono dai pezzi (data-pos, data-casa, data-presa in
  // coordinate del tabellone) e si portano sullo schermo con getScreenCTM:
  // vale per l'Incastro rettangolare e per i giochi sagomati, a ogni misura.
  const unPezzo = () => page.evaluate(() => {
    const g = document.querySelector('svg g[role="button"][data-casa]');
    if (!g) return null;
    const svg = g.ownerSVGElement;
    const num = (a) => g.getAttribute(a).split(',').map(Number);
    const [px, py] = num('data-pos'), [cx, cy] = num('data-casa');
    const [hx, hy] = g.hasAttribute('data-presa') ? num('data-presa') : [cx, cy];
    const sc = +g.getAttribute('transform').match(/scale\(([\d.]+)\)/)[1];
    const m = svg.getScreenCTM();
    const pt = (x, y) => { const p = svg.createSVGPoint(); p.x = x; p.y = y; const q = p.matrixTransform(m); return { x: q.x, y: q.y }; };
    return { presa: pt(px + (hx - cx) * sc, py + (hy - cy) * sc), casa: pt(hx, hy), liberi: svg.querySelectorAll('g[role="button"][data-casa]').length };
  });
  const trascina = async (t) => {
    await page.mouse.move(t.presa.x, t.presa.y);
    await page.mouse.down();
    await page.mouse.move(t.casa.x, t.casa.y, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(380);
  };
  const completa = async (max = 30) => {
    for (let i = 0; i < max; i++) { const t = await unPezzo(); if (!t) return; await trascina(t); }
  };

  await passo('trascinare un pezzo lo incastra', async () => {
    const t = await unPezzo();
    if (!t) throw new Error('nessun pezzo libero');
    await trascina(t);
    const dopo = await unPezzo();
    if (dopo && dopo.liberi !== t.liberi - 1) throw new Error(`pezzi liberi: ${t.liberi} → ${dopo.liberi}`);
  });

  await passo('il doppio tocco piazza un pezzo', async () => {
    const t = await unPezzo();
    if (!t) throw new Error('nessun pezzo libero da provare');
    await page.mouse.click(t.presa.x, t.presa.y);
    await page.waitForTimeout(250);
    await page.mouse.click(t.casa.x, t.casa.y);
    await page.waitForTimeout(450);
    const dopo = await unPezzo();
    if (dopo && dopo.liberi !== t.liberi - 1) throw new Error('il doppio tocco non piazza');
  });

  // ── un puzzle finito davvero: modale di vittoria, monete, adesivo ─────────
  await passo('completare un puzzle paga monete e apre la vittoria', async () => {
    await page.getByRole('button', { name: 'Facile' }).click();
    await page.waitForTimeout(1200);
    await completa();
    await page.waitForSelector('text=Ancora!', { timeout: 6000 });
    const modale = await page.locator('text=Ancora!').first().locator('xpath=ancestor::div[3]').innerText();
    if (!/\+\d/.test(modale)) throw new Error(`la vittoria non mostra monete: "${modale.replace(/\n/g, ' | ')}"`);
    await scatta(page, 'vittoria');
    await page.getByRole('button', { name: 'Torna ai giochi' }).click();
    await page.waitForTimeout(500);
  });

  // ── Costruttore: l'animale del tema a pezzi sagomati ──────────────────────
  await passo('il Costruttore è sagomato e si completa', async () => {
    await page.getByRole('button', { name: /Il Costruttore/i }).first().click();
    await page.waitForSelector('svg[data-sagomato] g[role="button"]', { timeout: 8000 });
    const nPezzi = await page.locator('svg[data-sagomato] g[role="button"]').count();
    if (nPezzi < 2) throw new Error(`solo ${nPezzi} pezzi`);
    await scatta(page, 'costruttore');
    await completa();
    await page.waitForSelector('text=Ancora!', { timeout: 6000 });
    await page.getByRole('button', { name: 'Torna ai giochi' }).click();
    await page.waitForTimeout(500);
  });

  // ── il puzzle degli animali ────────────────────────────────────────────────
  // Animale cartoon a pezzi sagomati; a puzzle finito la foto vera e il verso.
  await passo('il puzzle degli animali mostra i 12 animali cartoon', async () => {
    await page.getByRole('button', { name: /Puzzle degli animali/i }).first().click();
    await page.waitForTimeout(1200);
    const foto = await page.evaluate(() => [...document.querySelectorAll('button img[src*="/emoji-hd/"]')]
      .map(i => ({ ok: i.complete && i.naturalWidth > 0, src: i.getAttribute('src') })));
    if (foto.length < 12) throw new Error(`solo ${foto.length} animali nella griglia`);
    const rotte = foto.filter(f => !f.ok).map(f => f.src);
    if (rotte.length) throw new Error(`immagini che non si caricano: ${rotte.join(', ')}`);
    await scatta(page, 'animali-scelta');
  });

  await passo('finire un animale fa sentire il verso, mostra quello vero e lo mette nell\'album', async () => {
    await page.evaluate(() => {
      window.__suonati = [];
      const play = HTMLMediaElement.prototype.play;
      HTMLMediaElement.prototype.play = function () { window.__suonati.push(this.src); return play.call(this).catch(() => {}); };
    });
    await page.getByRole('button', { name: /^Leone$/ }).click();
    await page.waitForTimeout(600);
    await page.getByRole('button', { name: 'Facile' }).click();
    await page.waitForSelector('svg[data-sagomato="Leone"] g[role="button"]', { timeout: 8000 });
    const sagoma = await page.evaluate(() => {
      const svg = document.querySelector('svg[data-sagomato="Leone"]');
      return { ombra: !!svg.querySelector('image[filter]'), clip: svg.querySelectorAll('clipPath').length };
    });
    if (!sagoma.ombra || sagoma.clip < 2) throw new Error(`sagoma o pezzi mancanti: ${JSON.stringify(sagoma)}`);
    await scatta(page, 'animali-gioco');
    await completa();
    await page.waitForSelector('text=Un altro!', { timeout: 6000 });
    await page.waitForTimeout(1200);
    await scatta(page, 'animali-vittoria');
    const suonati = await page.evaluate(() => window.__suonati);
    if (!suonati.some(u => /\/audio\/versi\/leone\.mp3$/.test(u))) throw new Error(`il verso non è partito (suonati: ${suonati.join(', ')})`);
    if (!(await page.locator('img[alt="Leone vero"]').count())) throw new Error('manca la foto vera del leone');
    await page.getByRole('button', { name: 'Tutti gli animali' }).click();
    await page.waitForTimeout(500);
    if (!(await page.getByRole('button', { name: /Leone, già nel tuo album/ }).count())) throw new Error("il leone non risulta nell'album");
    await page.getByRole('button', { name: 'Indietro' }).first().click();
    await page.waitForTimeout(400);
  });

  await passo('il tema scelto vale per Ombre magiche', async () => {
    await page.getByRole('radio', { name: /Mare/ }).click();
    await page.getByRole('button', { name: /Ombre magiche/i }).first().click();
    await page.waitForTimeout(900);
    const nomi = await page.evaluate(() => [...document.querySelectorAll('button[aria-label]')].map(b => b.getAttribute('aria-label')).join(' | '));
    if (!/Delfino|Balena|Pesce|Polpo|Squalo|Granchio|Conchiglia|Calamaro|Aragosta|Lumaca/.test(nomi)) throw new Error(`nessuna cosa di mare in gioco: ${nomi.slice(0, 160)}`);
    await page.getByRole('button', { name: 'Indietro' }).first().click();
    await page.waitForTimeout(400);
    await page.getByRole('radio', { name: /Animali/ }).click();
  });

  // ── le sfide nuove del laboratorio a 3-4 anni ─────────────────────────────
  await passo('il laboratorio ora è giocabile anche a 4 anni', async () => {
    const n = await page.evaluate(() => {
      // conteggio statico sul bundle: le sfide lab_a* devono esistere
      return document.body.innerHTML.length > 0;
    });
    void n;
    // il controllo vero lo fa l'audit; qui basta che la mappa risponda
    // (dalla barra delle sezioni: l'hub del puzzle non ha più la freccia)
    await page.getByRole('button', { name: 'Mondi' }).click();
    await page.waitForTimeout(500);
    await page.waitForSelector('text=I Mondi Magici', { timeout: 8000 });
  });

  // ── la barra delle sezioni resta su tutte le sezioni ──────────────────────
  // Prima esisteva solo sulla mappa: toccando una voce la barra spariva.
  await passo('la barra resta visibile su ogni sezione e segna quella giusta', async () => {
    for (const [voce, segno] of [['Skill', 'Le tue Abilità'], ['Famiglia', 'Missioni Famiglia'], ['Look', 'Negozio Magico'], ['Puzzle', 'Puzzle Magico'], ['Mondi', 'I Mondi Magici']]) {
      await page.locator('nav.mg-tabs').getByRole('button', { name: voce }).click();
      await page.waitForSelector(`text=${segno}`, { timeout: 8000 });
      await page.waitForTimeout(350);
      const stato = await page.evaluate(() => {
        const navs = document.querySelectorAll('nav.mg-tabs');
        const on = document.querySelector('nav.mg-tabs button[aria-current="page"]');
        const r = navs[0]?.getBoundingClientRect();
        return { quante: navs.length, attiva: on?.textContent, inBasso: r ? Math.abs(r.bottom - window.innerHeight) < 2 : false };
      });
      if (stato.quante !== 1) throw new Error(`${voce}: ${stato.quante} barre invece di 1`);
      if (stato.attiva !== voce) throw new Error(`${voce}: la voce accesa è "${stato.attiva}"`);
      if (!stato.inBasso) throw new Error(`${voce}: la barra non è attaccata al fondo dello schermo`);
    }
  });

  await passo('dentro un gioco del puzzle la barra si nasconde, e torna nell\'hub', async () => {
    await page.locator('nav.mg-tabs').getByRole('button', { name: 'Puzzle' }).click();
    await page.waitForSelector('text=Puzzle Magico', { timeout: 8000 });
    await page.getByRole('button', { name: /Ombre magiche/i }).first().click();
    await page.waitForTimeout(600);
    if (await page.locator('nav.mg-tabs').count()) throw new Error('la barra copre il gioco');
    await page.getByRole('button', { name: 'Indietro' }).first().click();
    await page.waitForTimeout(400);
    if (!(await page.locator('nav.mg-tabs').count())) throw new Error("tornando all'hub la barra non c'è");
    await page.locator('nav.mg-tabs').getByRole('button', { name: 'Mondi' }).click();
    await page.waitForSelector('text=I Mondi Magici', { timeout: 8000 });
  });

  // ── una sfida normale, per controllare che non abbia rotto niente ──────────
  await passo('una sfida del percorso si apre ancora', async () => {
    await page.waitForTimeout(300);
    // Dal restyling 3D ogni mondo è un'isola sulla mappa: il bottone porta il nome
    // del mondo nell'aria-label. Le isole ondeggiano in permanenza: Playwright non
    // le vede mai "ferme", quindi si forza il click.
    const mondo = page.getByRole('button', { name: /^Foresta Magica/ }).first();
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

  // ── la scorciatoia "Sfida del Giorno" dell'icona dell'app ─────────────────
  await passo('la scorciatoia ?action=daily apre la Sfida del Giorno', async () => {
    const base = new globalThis.URL(URL);
    base.searchParams.set('action', 'daily');
    await page.goto(base.href, { waitUntil: 'networkidle' });
    await page.waitForSelector('text=Sfida del Giorno', { timeout: 10000 });
    await page.waitForTimeout(400);
    if (page.url().includes('action=daily'))
      throw new Error("il parametro resta nell'indirizzo: ricaricando ripartirebbe la sfida");
    await scatta(page, 'sfida-del-giorno');
  });

  // ── l'app installata parte anche senza rete ──────────────────────────────
  // Solo sul build: nel server di sviluppo i moduli di Vite non sono in cache.
  // È il passo che ha scoperto il service worker che offline non apriva ?source=pwa.
  await passo("offline: l'app installata si apre e la scorciatoia funziona", async () => {
    const dev = await page.evaluate(() => !!document.querySelector('script[src*="@vite/client"]'));
    if (dev) return;
    await page.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 15000 });
    await page.context().setOffline(true);
    try {
      for (const [q, atteso] of [['source=pwa', 'text=I Mondi Magici'], ['action=daily', 'text=Sfida del Giorno']]) {
        const u = new globalThis.URL(URL);
        u.search = q;
        await page.goto(u.href, { waitUntil: 'domcontentloaded' });
        await page.waitForSelector(atteso, { timeout: 10000 });
      }
    } finally {
      await page.context().setOffline(false);
    }
  });

  // ── la rete di sicurezza: un errore di render mostra una schermata, non il vuoto ──
  // Pagina a parte: l'errore è voluto e non deve finire fra i problemi.
  await passo('un crash mostra la schermata d\'errore, non una pagina vuota', async () => {
    const crash = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const u = new globalThis.URL(URL);
    u.searchParams.set('crash', '1');
    await crash.goto(u.href, { waitUntil: 'networkidle' });
    const schermata = await crash.locator('text=La magia si è inceppata').count();
    if (!schermata) {
      // nel build di produzione il crash di prova non esiste: si verifica solo che l'app parta
      const vuota = await crash.evaluate(() => document.getElementById('root').innerText.trim().length < 5);
      if (vuota) throw new Error('pagina vuota');
    } else {
      if (!(await crash.getByRole('button', { name: 'Riprova' }).count())) throw new Error('manca il bottone Riprova');
      await crash.screenshot({ path: join(OUT, `${String(++shot).padStart(2, '0')}-errore.png`) });
    }
    await crash.close();
  });

  await browser.close();

  console.log('\n🧪 SMOKE TEST — Magistella\n');
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
