import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE  = 'http://localhost:5173';
const CHROME = '/mnt/c/Program Files/Google/Chrome/Application/chrome.exe';
const SS     = '/tmp/mm-verify-ss';
mkdirSync(SS, { recursive: true });

let n = 0;
const ss   = async (page, tag) => { const p = `${SS}/${String(++n).padStart(2,'0')}-${tag}.png`; await page.screenshot({ path: p }); return p; };
const wait = ms => new Promise(r => setTimeout(r, ms));

const OK = [], WARN = [], ERR = [];
const ok   = m => { OK.push(m);   console.log('  ✅', m); };
const warn = m => { WARN.push(m); console.log('  ⚠️ ', m); };
const fail = m => { ERR.push(m);  console.log('  ❌', m); };

(async () => {
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--mute-audio']
  });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    locale: 'it-IT',
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const consoleErrs = [];
  page.on('console', m => { if (m.type()==='error') consoleErrs.push(m.text()); });
  page.on('pageerror', e => consoleErrs.push(e.message));

  // ── 1. LOAD ─────────────────────────────────────────────────────────────
  console.log('\n[1] Load app');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 15000 });
  await wait(600);
  await ss(page, '01-load');
  const html = await page.content();
  if (html.includes('MondoMago') || html.includes('mondo')) ok('App caricata');
  else fail('App non caricata');

  // ── 2. CONSENT ──────────────────────────────────────────────────────────
  console.log('\n[2] Consent + setup');
  // Accept consent
  const consentBtn = page.locator('button').filter({ hasText: /Accetto|Capito|privacy|Inizia/i }).first();
  if (await consentBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await consentBtn.click(); await wait(400);
    ok('Consenso accettato');
  } else warn('Bottone consenso non trovato (già accettato?)');

  // Onboarding slides
  for (let i = 0; i < 4; i++) {
    const btn = page.locator('button').filter({ hasText: /Avanti|Prossimo|Continua|Inizia/i }).first();
    if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.click(); await wait(400);
    } else break;
  }
  await ss(page, '02-after-consent');

  // ── 3. PROFILO ──────────────────────────────────────────────────────────
  console.log('\n[3] Profilo');
  // Dismiss profile_select if present
  const newProfileBtn = page.locator('button').filter({ hasText: /Nuovo|Aggiungi|nuovo profilo/i }).first();
  if (await newProfileBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await newProfileBtn.click(); await wait(400);
    ok('Nuovo profilo avviato');
  }
  // Name
  const nameInput = page.locator('input').first();
  if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
    await nameInput.fill('Luigi');
    await page.keyboard.press('Enter');
    await wait(500);
    ok('Nome: Luigi');
  } else warn('Input nome non trovato');
  await ss(page, '03-name');

  // Age
  for (const age of ['5', '6', '4']) {
    const btn = page.locator('button').filter({ hasText: new RegExp(`^${age}$|${age} anni`) }).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await btn.click(); await wait(400);
      ok(`Età: ${age}`);
      break;
    }
  }
  await ss(page, '04-age');

  // Companion
  for (const c of ['🐉 Fiamma','🦄 Luna','🐬 Onde','🦊 Foglia','🤖 Pixel']) {
    const btn = page.locator('button').filter({ hasText: c.split(' ')[0] }).first();
    if (await btn.isVisible({ timeout: 800 }).catch(() => false)) {
      await btn.click(); await wait(500);
      ok(`Companion: ${c}`);
      break;
    }
  }
  await ss(page, '05-companion');

  // ── 4. MAPPA ────────────────────────────────────────────────────────────
  console.log('\n[4] Mappa');
  await wait(600);
  const bodyMap = await page.textContent('body').catch(() => '');
  if (bodyMap.includes('Mondi') || bodyMap.includes('Foresta') || bodyMap.includes('Vulcano')) {
    ok('Mappa visibile');
  } else warn('Testo mappa non trovato');
  await ss(page, '06-map');

  // ── 5. AVVIA MONDO FORESTA ───────────────────────────────────────────────
  console.log('\n[5] Avvio Foresta');
  // Click on the first circular world button
  const worldCircle = page.locator('button[style*="border-radius: 50%"], button[style*="borderRadius: 50%"]').first();
  if (await worldCircle.isVisible({ timeout: 2000 }).catch(() => false)) {
    await worldCircle.click(); await wait(600);
    ok('World circle cliccato');
  } else {
    // fallback: find by emoji
    const wbtn = page.locator('button').filter({ hasText: '🌲' }).first();
    if (await wbtn.isVisible({ timeout: 1000 }).catch(() => false)) {
      await wbtn.click(); await wait(600);
      ok('Foresta 🌲 cliccato (fallback)');
    } else warn('Pulsante mondo non trovato');
  }
  await ss(page, '07-world-click');

  // world_intro — click Start/Avventura
  for (let i = 0; i < 4; i++) {
    const btn = page.locator('button').filter({ hasText: /Inizia|Start|Avventura|Cominciamo|Pronti/i }).first();
    if (await btn.isVisible({ timeout: 1200 }).catch(() => false)) {
      await btn.click(); await wait(600);
      ok('Bottone Start mondo cliccato');
      break;
    }
    await wait(400);
  }
  await ss(page, '08-world-intro-or-challenge');

  // ── 6. CHALLENGE SCREEN ─────────────────────────────────────────────────
  console.log('\n[6] Challenge screen');
  await wait(800);
  const bodyC = await page.textContent('body').catch(() => '');
  if (bodyC.includes('Esci') && (bodyC.includes('⭐') || bodyC.includes('stelle'))) {
    ok('Challenge screen attivo');
  } else warn(`Schermata non identificata: ${bodyC.slice(0,100)}`);
  await ss(page, '09-challenge');

  // Lyric ticker check
  const allText = await page.locator('body').innerHTML().catch(() => '');
  if (allText.includes('🎵')) ok('Lyric ticker 🎵 presente');
  else warn('Lyric ticker non visibile (atteso solo in dark mode dopo avvio canzone)');

  // ── 7. PLAY THROUGH 8 CHALLENGES ────────────────────────────────────────
  console.log('\n[7] Gioco through challenges');
  let memMatchFound = false, dragDropFound = false, letterTraceFound = false;

  for (let round = 0; round < 10; round++) {
    await wait(700);
    const body = await page.textContent('body').catch(() => '');

    if (body.includes('Torna ai Mondi') || body.includes('completato')) {
      ok('World end raggiunto!'); break;
    }
    if (body.includes('Sfida Fulmine') || body.includes('Sfida del Giorno')) {
      warn('Atterrato su mappa invece di sfida'); break;
    }

    // Detect format
    if (body.includes('coppie') && body.includes('Tocca due carte')) {
      memMatchFound = true;
      ok(`round ${round+1}: memory_match rilevato`);
      await ss(page, `10-memory-match-${round}`);
      const cardSelector = '[style*="aspectRatio"]';
      const cardCount = await page.locator(cardSelector).count();
      console.log(`    → ${cardCount} carte`);
      if (cardCount >= 8) {
        ok(`memory_match: ${cardCount} carte renderizzate ✓`);
        // Tap first two cards
        await page.locator(cardSelector).nth(0).click(); await wait(350);
        await ss(page, `10b-mm-flip1-${round}`);
        await page.locator(cardSelector).nth(1).click(); await wait(1200);
        await ss(page, `10c-mm-flip2-${round}`);
        // Try a few more taps to progress
        for (let c = 0; c < 8 && !memMatchFound; c++) {
          for (let i = 0; i < cardCount; i++) {
            const txt = await page.locator(cardSelector).nth(i).textContent().catch(() => '');
            if (txt.includes('?') || txt.includes('⭐')) {
              await page.locator(cardSelector).nth(i).click(); await wait(280);
              break;
            }
          }
        }
      } else fail(`memory_match: solo ${cardCount} carte (attese ≥8)`);

    } else if (body.includes('TRACCIA LA LETTERA')) {
      letterTraceFound = true;
      ok(`round ${round+1}: letter_trace rilevato`);
      await ss(page, `11-letter-trace-${round}`);
      const svg = page.locator('svg[viewBox="0 0 100 100"]').first();
      if (await svg.isVisible({ timeout: 1000 }).catch(() => false)) {
        const box = await svg.boundingBox();
        if (box) {
          // Draw a path across the letter
          await page.mouse.move(box.x + box.width*0.5, box.y + box.height*0.15);
          await page.mouse.down();
          for (let step = 0; step <= 20; step++) {
            const y = box.y + box.height * (0.15 + step * 0.035);
            await page.mouse.move(box.x + box.width*0.5, y); await wait(15);
          }
          await page.mouse.up();
          await wait(800);
          ok('letter_trace: tratto disegnato su canvas SVG');
          await ss(page, `11b-letter-trace-drawn-${round}`);
        }
      } else fail('letter_trace: SVG non trovato');

    } else if (body.includes('Tocca un oggetto')) {
      dragDropFound = true;
      ok(`round ${round+1}: drag_drop rilevato`);
      await ss(page, `12-drag-drop-${round}`);
      const item = page.locator('.ans-vis').first();
      if (await item.isVisible({ timeout: 1000 }).catch(() => false)) {
        await item.click(); await wait(350);
        ok('drag_drop: oggetto selezionato');
        const zone = page.locator('[style*="dashed"]').first();
        if (await zone.isVisible({ timeout: 800 }).catch(() => false)) {
          await zone.click(); await wait(500);
          ok('drag_drop: oggetto posizionato nella zona');
        }
      } else warn('drag_drop: .ans-vis non trovato');

    } else {
      // Generic: click first available answer button
      const btns = page.locator('button');
      const cnt = await btns.count();
      let clicked = false;
      for (let bi = 0; bi < cnt; bi++) {
        const btn = btns.nth(bi);
        const txt = await btn.textContent().catch(() => '');
        const vis = await btn.isVisible().catch(() => false);
        if (vis && txt.trim() && !['Esci','←','🔊','⌫'].some(x => txt.includes(x))) {
          await btn.click(); await wait(400);
          ok(`round ${round+1}: risposta generica selezionata "${txt.trim().slice(0,25)}"`);
          clicked = true;
          break;
        }
      }
      if (!clicked) warn(`round ${round+1}: nessun bottone risposta trovato`);
    }
    await wait(1600); // auto-advance
  }

  if (!memMatchFound) warn('memory_match NON incontrato nel flusso test (casuale per age)');
  if (!dragDropFound) warn('drag_drop NON incontrato nel flusso test');
  if (!letterTraceFound) warn('letter_trace NON incontrato nel flusso test');

  await ss(page, '13-post-challenges');

  // ── 8. WORLD END ────────────────────────────────────────────────────────
  console.log('\n[8] World end screen');
  const endBody = await page.textContent('body').catch(() => '');
  if (endBody.includes('completato') || endBody.includes('Torna ai Mondi')) {
    ok('World end screen raggiunto');
    if (endBody.includes('Riascolta la canzone')) ok('"Riascolta la canzone" button presente ✓');
    else warn('"Riascolta la canzone" non trovato in world_end');
    await ss(page, '14-world-end');
  } else {
    warn('World end non raggiunto nel test');
  }

  // ── 9. PARENT PANEL ─────────────────────────────────────────────────────
  console.log('\n[9] Parent panel - TTS toggle');
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 10000 });
  await wait(600);

  // Navigate to parent
  const tabs = page.locator('button').filter({ hasText: /Famiglia|Family|Genitore/i });
  if (await tabs.first().isVisible({ timeout: 1500 }).catch(() => false)) {
    await tabs.first().click(); await wait(500);
    ok('Tab Famiglia cliccata');
  } else {
    // Try bottom nav
    const familyNav = page.locator('[aria-label*="amiglia"], [title*="amiglia"]').first();
    if (await familyNav.isVisible({ timeout: 800 }).catch(() => false)) {
      await familyNav.click(); await wait(500);
    } else warn('Navigazione famiglia non trovata');
  }
  await ss(page, '15-family-or-parent');

  // Open parent area
  const parentBtn = page.locator('button').filter({ hasText: /Genitore|Parent|Area adult/i }).first();
  if (await parentBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
    await parentBtn.click(); await wait(500);
    ok('Area Genitore aperta');
  }

  const parentBody = await page.textContent('body').catch(() => '');
  if (parentBody.includes('NARRAZIONE VOCALE')) {
    ok('TTS toggle "NARRAZIONE VOCALE" presente nel pannello genitore ✓');
    await ss(page, '16-parent-tts-toggle');
  } else if (parentBody.includes('PIN')) {
    warn('Pannello genitore bloccato da PIN — TTS toggle non verificabile senza PIN');
    await ss(page, '16-parent-locked');
    // Check if page has NARRAZIONE somewhere after unlock 
  } else {
    warn('Pannello genitore non trovato o TTS toggle assente');
  }

  // ── 10. CONSOLE ERRORS ──────────────────────────────────────────────────
  console.log('\n[10] Console errors');
  const realErrors = consoleErrs.filter(e =>
    !e.includes('Audio') && !e.includes('NotAllowedError') && !e.includes('play()') &&
    !e.includes('autoplay') && !e.includes('user gesture') && !e.includes('SW')
  );
  if (realErrors.length === 0) ok('Nessun errore JS rilevante');
  else realErrors.forEach(e => fail(`Console error: ${e.slice(0,120)}`));
  if (consoleErrs.some(e => e.includes('Audio') || e.includes('NotAllowedError'))) {
    warn('Audio autoplay bloccato dal browser headless (normale, non è un bug)');
  }

  await browser.close();

  // ── REPORT FINALE ────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(58));
  console.log('VERIFICATION REPORT — MondoMago');
  console.log('═'.repeat(58));
  console.log(`\n✅  PASSED  (${OK.length}): ${OK.join(' | ')}`);
  if (WARN.length) console.log(`\n⚠️   WARN   (${WARN.length}): ${WARN.join(' | ')}`);
  if (ERR.length)  console.log(`\n❌  ERRORS  (${ERR.length}): ${ERR.join(' | ')}`);
  console.log(`\nScreenshots: ${SS}/`);
  console.log(`\n🏁 Verdict: ${ERR.length === 0 ? 'PASS' : 'FAIL'}`);
})();
