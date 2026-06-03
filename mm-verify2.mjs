import { chromium } from 'playwright';

const BASE = 'https://andrea85m.github.io/mondomago/';
const SS   = (n) => `/tmp/mm-verify-screenshots/${n}.png`;

const RICH = JSON.stringify([{
  id:'t1', childName:'Teo', childAge:6, companion:'foglia', totalStars:999,
  skills:{numeri:5,parole:5,logica:5,natura:5,coding:5}, items:[], streak:5,
  missionsDone:8, dailyCompletedDate:null, lastDate:null, achievements:[],
  dailyCount:0, equippedCosmetic:null, sessionLog:[],
  schoolMode:false, schoolCode:'', schoolAssigned:false,
  coins:500, ownedCosmetics:[]
}]);

async function run() {
  const browser = await chromium.launch({ args:['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport:{width:390,height:844}, locale:'it-IT' });
  const page = await ctx.newPage();
  const notFound = [];
  page.on('response', r => { if (r.status()===404) notFound.push(r.url()); });

  // ── Companion name verification ───────────────────────────────────────────────
  // Use companion:'foglia' so the companion displayed in the header is the one with id foglia
  // The header shows the companion NAME (should be "Volpe" now)
  await page.goto(BASE, { waitUntil:'domcontentloaded', timeout:20000 });
  await page.evaluate((p) => {
    localStorage.setItem('mondomago_consent','1');
    localStorage.setItem('mondomago_profiles_v1', p);
  }, RICH);
  await page.reload({ waitUntil:'networkidle', timeout:30000 });
  await page.waitForTimeout(3000);

  // Check map header for companion name
  const mapHtml = await page.content();
  const hasVolpe = mapHtml.includes('Volpe');
  const hasFoglia = mapHtml.includes('>Foglia<') || mapHtml.includes('name="Foglia"');
  console.log('=== Companion name su mappa ===');
  console.log('  "Volpe" nel DOM mappa:', hasVolpe ? '✅' : '❌');
  console.log('  "Foglia" come label visible:', hasFoglia ? '❌ TROVATO' : '✅ assente');
  await page.screenshot({ path: SS('10-map-companion-name') });

  // ── Navigate to world via scroll + click on actual circle ─────────────────────
  // Scroll down to world cards section
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(800);
  await page.screenshot({ path: SS('11-map-scrolled') });

  // Try clicking world cards by looking for the actual world emoji circles
  // The map renders world cards, each having a "Mondi" tab visible
  // Let's click on the first world card using position-based approach
  const allDivs = await page.locator('div').all();
  let worldClicked = false;
  for (const div of allDivs) {
    try {
      const text = await div.innerText();
      const box = await div.boundingBox();
      if (!box) continue;
      if (box.width > 60 && box.width < 120 && box.height > 60 && box.height < 120) {
        if (/foresta|🌲|castello|oceano/i.test(text) && text.length < 30) {
          await div.click({ timeout:2000 });
          worldClicked = true;
          break;
        }
      }
    } catch {}
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: SS('12-world-entry') });
  console.log('\n=== Entrato nel mondo:', worldClicked, '===');

  // ── color_zones specific test — inject directly into a world with cz challenge ─
  // We navigate to foresta which has cz01 (arcobaleno)
  // Use profile with foresta as first world
  await page.evaluate((p) => {
    localStorage.setItem('mondomago_profiles_v1', p);
  }, RICH);
  await page.goto(BASE, { waitUntil:'networkidle', timeout:25000 });
  await page.waitForTimeout(2000);

  // Scroll to world section and find foresta card
  await page.keyboard.press('End');
  await page.waitForTimeout(500);
  await page.screenshot({ path: SS('13-map-bottom') });

  // Try finding color_zones by advancing through many challenges
  // Click through challenges in foresta
  let czFound = false;
  for (let w = 0; w < 3; w++) {
    const worldNames = ['Foresta','Vulcano','Biblioteca'];
    const wn = worldNames[w];
    const wCard = page.locator(`text=${wn}`).first();
    if (await wCard.isVisible({ timeout:3000 }).catch(()=>false)) {
      await wCard.click();
      await page.waitForTimeout(2000);
      const startB = page.locator('button').filter({ hasText:/inizia|gioca/i }).first();
      if (await startB.isVisible({ timeout:2000 }).catch(()=>false)) {
        await startB.click(); await page.waitForTimeout(1000);
      }
      for (let i=0; i<30; i++) {
        const html = await page.content();
        if (/colora le zone|zone colorate|color-zone|svg.*circle|palette.*color/i.test(html)) {
          czFound = true; break;
        }
        // click any answer
        const btns = page.locator('button').filter({ hasNotText:/⏸|🔊|←|mappa/i });
        const n = await btns.count();
        if (n>0) { await btns.nth(0).click({ timeout:1500 }).catch(()=>{}); await page.waitForTimeout(600); }
        const cont = page.locator('button').filter({ hasText:/continua/i }).first();
        if (await cont.isVisible({ timeout:500 }).catch(()=>false)) { await cont.click(); await page.waitForTimeout(500); }
      }
      if (czFound) break;
      // Back to map
      const back = page.locator('button').filter({ hasText:/mappa|←/i }).first();
      if (await back.isVisible({ timeout:2000 }).catch(()=>false)) {
        await back.click(); await page.waitForTimeout(1500);
      } else {
        await page.goto(BASE, { waitUntil:'networkidle', timeout:20000 });
        await page.evaluate((p) => localStorage.setItem('mondomago_profiles_v1', p), RICH);
        await page.reload({ waitUntil:'networkidle', timeout:20000 });
        await page.waitForTimeout(2000);
      }
    }
  }
  await page.screenshot({ path: SS('14-color-zones-attempt') });
  console.log('\n=== color_zones ===');
  console.log('  Trovato via navigazione:', czFound ? '✅' : '⚠️ non incontrato');

  // ── 404 check ────────────────────────────────────────────────────────────────
  console.log('\n=== 404 Non trovati ===');
  const relevantErrors = notFound.filter(u => !u.includes('chrome-extension'));
  if (relevantErrors.length === 0) {
    console.log('  Nessun 404 rilevante ✅');
  } else {
    relevantErrors.forEach(u => console.log('  ❌', u.replace(BASE, '')));
  }

  await ctx.close();
  await browser.close();
  console.log('\nDone. Screenshot: /tmp/mm-verify-screenshots/');
}

run().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
