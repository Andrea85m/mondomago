import { chromium } from 'playwright';

const BASE  = 'https://andrea85m.github.io/mondomago/';
const SS    = (n) => `/tmp/mm-verify-screenshots/${n}.png`;

const RICH  = JSON.stringify([{
  id:'t1', childName:'Teo', childAge:6, companion:'onde', totalStars:999,
  skills:{numeri:5,parole:5,logica:5,natura:5,coding:5}, items:[], streak:5,
  missionsDone:8, dailyCompletedDate:null, lastDate:null, achievements:[],
  dailyCount:0, equippedCosmetic:null, sessionLog:[],
  schoolMode:false, schoolCode:'', schoolAssigned:false,
  coins:500, ownedCosmetics:[]
}]);

async function mkCtx(browser) {
  return browser.newContext({ viewport:{width:390,height:844}, locale:'it-IT' });
}

async function injectAndReload(page, profile) {
  await page.goto(BASE, { waitUntil:'domcontentloaded', timeout:20000 });
  await page.evaluate((p) => {
    localStorage.setItem('mondomago_consent','1');
    localStorage.setItem('mondomago_profiles_v1', p);
  }, profile);
  await page.reload({ waitUntil:'networkidle', timeout:30000 });
  await page.waitForTimeout(2500);
}

// Click "next" in a challenge loop, answer randomly when needed
async function advanceChallenge(page, steps=18) {
  for (let i=0; i<steps; i++) {
    // try any multiple-choice buttons (not topbar buttons)
    const opts = page.locator('button[style*="border-radius"]').filter({ hasNotText:/⏸|🔊|←/ });
    const n = await opts.count();
    if (n>0) { await opts.nth(0).click({ timeout:1500 }).catch(()=>{}); await page.waitForTimeout(700); }
    // "Continua" or arrow after answer
    const cont = page.locator('button').filter({ hasText:/continua|avanti|→|prossimo/i }).first();
    if (await cont.isVisible({ timeout:500 }).catch(()=>false)) {
      await cont.click().catch(()=>{}); await page.waitForTimeout(600);
    }
  }
}

// click first visible world card with matching name
async function clickWorld(page, name) {
  const card = page.locator(`text=${name}`).first();
  await card.waitFor({ state:'visible', timeout:8000 });
  await card.click();
  await page.waitForTimeout(1800);
  // click start button if present
  const start = page.locator('button').filter({ hasText:/inizia|gioca|vai/i }).first();
  if (await start.isVisible({ timeout:2000 }).catch(()=>false)) {
    await start.click(); await page.waitForTimeout(1000);
  }
}

async function hasFormat(page, sig) {
  const html = await page.content();
  return sig.some(s => html.toLowerCase().includes(s.toLowerCase()));
}

async function run() {
  const browser = await chromium.launch({ args:['--no-sandbox'] });
  const errors  = [];
  const log     = (msg) => console.log(msg);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1+2: CONSENT + INSTALL BANNER (fresh session, no localStorage)
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 1. Schermata consenso ===');
  const ctxA = await mkCtx(browser);
  const pgA  = await ctxA.newPage();
  pgA.on('console', m => { if (m.type()==='error') errors.push('[consent] '+m.text()); });
  pgA.on('pageerror', e => errors.push('[consent PAGE] '+e.message));
  await pgA.goto(BASE, { waitUntil:'networkidle', timeout:30000 });
  await pgA.waitForTimeout(2000);
  await pgA.screenshot({ path:SS('01-consent') });

  const inizia  = await pgA.locator('button:has-text("Inizia")').isVisible().catch(()=>false);
  const cb      = await pgA.locator('input[type=checkbox]').isVisible().catch(()=>false);
  const aria    = await pgA.locator('input[type=checkbox]').getAttribute('aria-label').catch(()=>null);
  const banner1 = await pgA.locator('.install-banner').isVisible().catch(()=>false);
  log(`  Pulsante "Inizia" visibile: ${inizia}`);
  log(`  Checkbox visibile: ${cb}`);
  log(`  aria-label: "${aria}"`);
  log(`  InstallBanner presente (deve FALSE): ${banner1}`);
  await ctxA.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // 3: COMPANION SCREEN — "Volpe" vs "Foglia"
  //    Approach: consent=1 + NO profiles → app naviga name→age→companion
  //    Bypass onboarding slides iniettando direttamente lo screen state
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 3. Schermata companion — "Volpe" vs "Foglia" ===');
  const ctxB = await mkCtx(browser);
  const pgB  = await ctxB.newPage();
  pgB.on('console', m => { if (m.type()==='error') errors.push('[companion] '+m.text()); });
  pgB.on('pageerror', e => errors.push('[companion PAGE] '+e.message));

  // Inject consent+name+age so we land on companion screen
  // The app navigates: if consent+profiles missing → consent, if consent+no profiles → name
  // We force: consent=1, no profiles, but we also set a partial profile marker so app
  // goes straight to companion
  await pgB.goto(BASE, { waitUntil:'domcontentloaded', timeout:20000 });
  await pgB.evaluate(() => {
    localStorage.setItem('mondomago_consent','1');
    // Store a partial draft that would put us at companion screen
    sessionStorage.setItem('mm_pending_name', 'Teo');
    sessionStorage.setItem('mm_pending_age',  '6');
  });
  await pgB.reload({ waitUntil:'networkidle', timeout:30000 });
  await pgB.waitForTimeout(2000);

  // If we're on name screen, fill it
  const nameInp = pgB.locator('input[type=text]').first();
  if (await nameInp.isVisible({ timeout:3000 }).catch(()=>false)) {
    await nameInp.fill('Teo');
    const nb = pgB.locator('button').filter({ hasText:/avanti|continua/i }).first();
    // Force click (button may be enabled now that field is filled)
    await nb.click({ force:true, timeout:5000 }).catch(()=>{});
    await pgB.waitForTimeout(1000);
  }

  // Age screen
  const ageOpts = pgB.locator('button').filter({ hasText:/5-6|6 anni|6|anni/i });
  if (await ageOpts.first().isVisible({ timeout:3000 }).catch(()=>false)) {
    await ageOpts.first().click(); await pgB.waitForTimeout(800);
  }

  // Now should be on companion or onboarding; check content
  await pgB.screenshot({ path:SS('03-companion') });
  const html3   = await pgB.content();
  const volpe   = html3.includes('Volpe');
  const foglia  = html3.includes('>Foglia<') || html3.includes('"Foglia"') || html3.includes('>Foglia ');
  const banner3 = await pgB.locator('.install-banner').isVisible().catch(()=>false);
  log(`  "Volpe" nel DOM (deve TRUE):  ${volpe}`);
  log(`  "Foglia" come nome (deve FALSE): ${foglia}`);
  log(`  Banner durante companion (deve FALSE): ${banner3}`);
  await ctxB.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // 4: MAPPA MONDI
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 4. Mappa mondi ===');
  const ctxC = await mkCtx(browser);
  const pgC  = await ctxC.newPage();
  pgC.on('console', m => { if (m.type()==='error') errors.push('[map] '+m.text()); });
  pgC.on('pageerror', e => errors.push('[map PAGE] '+e.message));
  await injectAndReload(pgC, RICH);
  await pgC.screenshot({ path:SS('04-map') });

  const worlds = ['Foresta','Castello','Oceano','Mercato','Galassia','Vulcano','Biblioteca','Laboratorio'];
  for (const w of worlds) {
    const v = await pgC.locator(`text=${w}`).first().isVisible({ timeout:2000 }).catch(()=>false);
    log(`  ${w}: ${v ? '✅':'❌'}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 5a: quiz_cartoon (best found in Galassia/Biblioteca world)
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 5a. quiz_cartoon ===');
  await clickWorld(pgC, 'Galassia');
  await advanceChallenge(pgC, 25);
  await pgC.screenshot({ path:SS('05a-quiz-cartoon') });
  const qcFound = await hasFormat(pgC, ['cartoon-reveal','cartoonReveal','emoji-blur','filter:blur']);
  log(`  quiz_cartoon rilevato: ${qcFound ? '✅' : '⚠️ non ancora incontrato in 25 passi'}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5b: color_zones (Foresta, Oceano, Mercato)
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 5b. color_zones ===');
  await injectAndReload(pgC, RICH);
  await clickWorld(pgC, 'Oceano');
  await advanceChallenge(pgC, 25);
  await pgC.screenshot({ path:SS('05b-color-zones') });
  const czFound = await hasFormat(pgC, ['colorZone','color-zone','zone-svelte','target-color','colora le zone']);
  log(`  color_zones rilevato: ${czFound ? '✅' : '⚠️ non ancora incontrato in 25 passi'}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // 5c: puzzle_swap (Foresta, Oceano, Mercato)
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== 5c. puzzle_swap ===');
  await injectAndReload(pgC, RICH);
  await clickWorld(pgC, 'Foresta');
  await advanceChallenge(pgC, 25);
  await pgC.screenshot({ path:SS('05c-puzzle-swap') });
  const psFound = await hasFormat(pgC, ['mosse','tile-swap','puzzle-grid','buco','tileSwap','swapPuzzle']);
  log(`  puzzle_swap rilevato: ${psFound ? '✅' : '⚠️ non ancora incontrato in 25 passi'}`);

  // ─────────────────────────────────────────────────────────────────────────────
  // Deep scan: check page source for format-specific markers
  // ─────────────────────────────────────────────────────────────────────────────
  // Also check via the built JS for the challenge definitions
  log('\n=== Controllo sorgente JS per conferma formati ===');
  const jsResp = await pgC.evaluate(async () => {
    const res = await fetch('/mondomago/assets/' +
      [...document.querySelectorAll('script[src]')]
        .map(s => s.src.split('/').pop())
        .find(n => n.startsWith('index') && n.endsWith('.js')) || '');
    return res.ok ? res.text() : 'NOT FOUND';
  });
  const jsSrc = typeof jsResp === 'string' ? jsResp : '';
  log(`  quiz_cartoon in sorgente JS: ${jsSrc.includes('quiz_cartoon') ? '✅' : '❌'}`);
  log(`  color_zones in sorgente JS:  ${jsSrc.includes('color_zones')  ? '✅' : '❌'}`);
  log(`  puzzle_swap in sorgente JS:  ${jsSrc.includes('puzzle_swap')  ? '✅' : '❌'}`);
  log(`  "Volpe" in sorgente JS:      ${jsSrc.includes('"Volpe"')      ? '✅' : '❌'}`);
  log(`  "Foglia" come name in JS:    ${jsSrc.includes('name:"Foglia"') || jsSrc.includes("name:'Foglia'") ? '❌ TROVATO' : '✅ assente'}`);

  // SW version check
  log('\n=== SW versione ===');
  const swResp = await pgC.evaluate(async () => {
    const r = await fetch('/mondomago/sw.js');
    return r.ok ? r.text() : '';
  });
  const cacheCore = swResp.match(/mondomago-core-v(\d+)/)?.[0] || 'non trovato';
  const cacheAudio = swResp.match(/mondomago-audio-v(\d+)/)?.[0] || 'non trovato';
  log(`  CACHE_CORE:  ${cacheCore}  (deve v9)`);
  log(`  CACHE_AUDIO: ${cacheAudio} (deve v8)`);

  // manifest screenshot check
  log('\n=== manifest.json ===');
  const mfResp = await pgC.evaluate(async () => {
    const r = await fetch('/mondomago/manifest.json');
    return r.ok ? r.text() : '';
  });
  const ssPath = mfResp.match(/"src":\s*"([^"]*screen-challenge[^"]*)"/)?.[1] || 'non trovato';
  log(`  Screenshot challenge path: ${ssPath}`);
  log(`  Contiene "screen-challenge-visual": ${ssPath.includes('screen-challenge-visual') ? '✅' : '❌'}`);

  await ctxC.close();

  // ─────────────────────────────────────────────────────────────────────────────
  // ERRORS
  // ─────────────────────────────────────────────────────────────────────────────
  log('\n=== Errori console ===');
  log(errors.length ? errors.join('\n') : '  Nessun errore ✅');

  await browser.close();
  log('\nScreenshot salvati in /tmp/mm-verify-screenshots/');
}

run().catch(e => { console.error('FATAL:', e.message, e.stack?.split('\n')[1]); process.exit(1); });
