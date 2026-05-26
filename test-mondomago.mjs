import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://andrea85m.github.io/mondomago/';
const OUT = '/tmp/mondomago-screenshots';
mkdirSync(OUT, { recursive: true });

const results = [];
let screenshotIdx = 0;

async function shot(page, name) {
  const path = `${OUT}/${String(++screenshotIdx).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  📸 ${path}`);
  return path;
}

async function log(msg, ok = true) {
  const status = ok ? '✅' : '❌';
  console.log(`${status} ${msg}`);
  results.push({ ok, msg });
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 }, // iPhone 14 Pro
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    locale: 'it-IT'
  });
  const page = await ctx.newPage();

  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

  // ── TEST 1: Caricamento iniziale ─────────────────────────────────────────
  console.log('\n─── TEST 1: Caricamento pagina ───');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  const title = await page.title();
  await log(`Titolo pagina: "${title}"`, title.length > 0);
  await shot(page, 'caricamento');

  // ── TEST 2: Splash screen / COPPA ────────────────────────────────────────
  console.log('\n─── TEST 2: Splash / COPPA ───');
  // Check for any visible text or button
  const bodyText = await page.textContent('body');
  const hasItalianText = /mondo|mago|bambino|gioca|inizia|sì|no/i.test(bodyText);
  await log(`Testo italiano presente`, hasItalianText);
  await shot(page, 'splash-coppa');

  // ── TEST 3: COPPA consent ─────────────────────────────────────────────────
  console.log('\n─── TEST 3: Accetta COPPA ───');
  // Find checkbox or button for consent
  const checkbox = page.locator('input[type="checkbox"]').first();
  const hasCheckbox = await checkbox.isVisible().catch(() => false);
  if (hasCheckbox) {
    await checkbox.click();
    await log('Checkbox COPPA cliccato');
    await shot(page, 'coppa-checked');
    // Find confirm button
    const btn = page.locator('button').filter({ hasText: /inizia|confirm|sì|accetto/i }).first();
    const hasBtnConfirm = await btn.isVisible().catch(() => false);
    if (hasBtnConfirm) {
      await btn.click();
      await page.waitForTimeout(1000);
      await log('Pulsante COPPA confermato');
    }
  } else {
    await log('Nessuna checkbox COPPA visibile (già accettata o flow diverso)', true);
  }

  // ── TEST 4: Schermata profilo / nome ─────────────────────────────────────
  console.log('\n─── TEST 4: Profilo utente ───');
  await page.waitForTimeout(1500);
  await shot(page, 'dopo-coppa');
  const inputNome = page.locator('input[type="text"], input[placeholder]').first();
  const hasInput = await inputNome.isVisible().catch(() => false);
  if (hasInput) {
    await inputNome.fill('Luca');
    await log('Nome profilo inserito: Luca');
    await shot(page, 'nome-inserito');
    // Click next/confirm
    const btnNext = page.locator('button').filter({ hasText: /avanti|crea|ok|inizia|gioca/i }).first();
    const hasBtnNext = await btnNext.isVisible().catch(() => false);
    if (hasBtnNext) {
      await btnNext.click();
      await page.waitForTimeout(1000);
      await log('Profilo confermato');
    }
  } else {
    await log('Nessun campo nome visibile (profilo già esistente o altro step)', true);
  }

  // ── TEST 5: Selezione età ─────────────────────────────────────────────────
  console.log('\n─── TEST 5: Selezione età ───');
  await page.waitForTimeout(1000);
  await shot(page, 'selezione-eta');
  const etaButtons = page.locator('button').filter({ hasText: /[3-9]|anni/i });
  const etaCount = await etaButtons.count();
  if (etaCount > 0) {
    await etaButtons.first().click();
    await page.waitForTimeout(500);
    await log(`Età selezionata (${etaCount} opzioni)`);
    await shot(page, 'eta-selezionata');
  } else {
    await log('Nessun bottone età (step saltato o diverso)', true);
  }

  // ── TEST 6: Mappa mondi ───────────────────────────────────────────────────
  console.log('\n─── TEST 6: Mappa mondi ───');
  await page.waitForTimeout(2000);
  await shot(page, 'mappa-mondi');
  // Check for world cards or navigation
  const worldText = await page.textContent('body');
  const hasWorlds = /foresta|vulcano|oceano|cielo|biblioteca|giardino|castello|laboratorio/i.test(worldText);
  await log(`Mondi visibili nella mappa`, hasWorlds);

  // ── TEST 7: Tab navigazione ────────────────────────────────────────────────
  console.log('\n─── TEST 7: Tab navigazione ───');
  const tabs = page.locator('[role="tab"], nav button, .tab-btn').filter({ hasNotText: '' });
  const tabCount = await tabs.count();
  await log(`Tab navigazione: ${tabCount} trovate`, tabCount >= 2);
  if (tabCount > 1) {
    await tabs.nth(1).click().catch(() => {});
    await page.waitForTimeout(800);
    await shot(page, 'tab2');
    await tabs.first().click().catch(() => {});
    await page.waitForTimeout(500);
  }

  // ── TEST 8: Primo mondo cliccabile ────────────────────────────────────────
  console.log('\n─── TEST 8: Entra nel primo mondo ───');
  await shot(page, 'mappa-pre-click');
  // Try clicking on any world card
  const worldCard = page.locator('button, div[role="button"]').filter({ hasText: /foresta|vulcano|sfida|gioca/i }).first();
  const hasWorldCard = await worldCard.isVisible().catch(() => false);
  if (hasWorldCard) {
    await worldCard.click();
    await page.waitForTimeout(1500);
    await shot(page, 'mondo-entrato');
    await log('Entrato nel primo mondo');
  } else {
    await log('Card mondo non trovata con testo specifico — provo click generico', true);
    // Try clicking first large button in map area
    const anyCard = page.locator('button').nth(2);
    await anyCard.click().catch(() => {});
    await page.waitForTimeout(1500);
    await shot(page, 'click-generico');
  }

  // ── TEST 9: Schermata sfida ───────────────────────────────────────────────
  console.log('\n─── TEST 9: Schermata sfida ───');
  await page.waitForTimeout(1000);
  await shot(page, 'schermata-sfida');
  const sfidaText = await page.textContent('body');
  const hasSfida = /quale|trova|scegli|tocca|completa|ordina|trascina/i.test(sfidaText);
  await log(`Testo sfida presente`, hasSfida);

  // ── TEST 10: Risposta a una sfida ──────────────────────────────────────────
  console.log('\n─── TEST 10: Risposta sfida ───');
  const answerBtns = page.locator('button').filter({ hasNotText: /←|esci|back|menu|casa/i });
  const answerCount = await answerBtns.count();
  if (answerCount > 0) {
    // Click first answer
    const firstAnswer = answerBtns.first();
    const isVis = await firstAnswer.isVisible().catch(() => false);
    if (isVis) {
      await firstAnswer.click();
      await page.waitForTimeout(1500);
      await shot(page, 'feedback-risposta');
      await log('Risposta data, feedback mostrato');
    }
  } else {
    await log('Nessun bottone risposta trovato', false);
  }

  // ── TEST 11: Errori console ───────────────────────────────────────────────
  console.log('\n─── TEST 11: Errori console ───');
  const criticalErrors = errors.filter(e =>
    !e.includes('favicon') &&
    !e.includes('sw.js') &&
    !e.includes('SKIP_WAITING') &&
    !e.includes('install') &&
    !e.includes('ResizeObserver')
  );
  await log(`Errori console critici: ${criticalErrors.length}`, criticalErrors.length === 0);
  if (criticalErrors.length > 0) {
    criticalErrors.slice(0, 5).forEach(e => console.log(`  ⚠️  ${e.substring(0, 120)}`));
  }

  // ── RIEPILOGO ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('RIEPILOGO TEST');
  console.log('═══════════════════════════════════════');
  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;
  console.log(`✅ Passati: ${passed}/${results.length}`);
  console.log(`❌ Falliti: ${failed}/${results.length}`);
  if (failed > 0) {
    console.log('\nTest falliti:');
    results.filter(r => !r.ok).forEach(r => console.log(`  ❌ ${r.msg}`));
  }
  console.log(`\n📁 Screenshot salvati in: ${OUT}`);

  await browser.close();
  process.exit(failed > 0 ? 1 : 0);
})();
