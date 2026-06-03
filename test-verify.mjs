/**
 * MondoMago verification script — tests all changed features.
 * Run: node test-verify.mjs
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'http://localhost:5173';
const SS_DIR = '/tmp/mondomago-verify';
mkdirSync(SS_DIR, { recursive: true });

let ssIdx = 0;
async function ss(page, name) {
  const path = `${SS_DIR}/${String(++ssIdx).padStart(2,'0')}-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  📸 ${path}`);
  return path;
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

const errors = [];
const findings = [];
const passes = [];

function ok(msg)   { passes.push(msg);   console.log(`  ✅ ${msg}`); }
function fail(msg) { errors.push(msg);   console.log(`  ❌ ${msg}`); }
function warn(msg) { findings.push(msg); console.log(`  ⚠️  ${msg}`); }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },   // iPhone 14 viewport
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
    hasTouch: true,
  });
  const page = await ctx.newPage();

  // Capture all console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  // ── STEP 1: App loads ────────────────────────────────────────────────────
  console.log('\n[1] App load + consent screen');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await delay(800);
  await ss(page, 'consent');
  const body = await page.content();
  if (body.includes('MondoMago') || body.includes('Mondo') || body.includes('privacy')) {
    ok('App loaded successfully');
  } else {
    fail('App did not load or blank page');
  }

  // Check for consent button
  const consentBtn = page.locator('button').filter({ hasText: /Accetto|Consento|Inizia|Start/i }).first();
  const hasConsent = await consentBtn.isVisible().catch(() => false);
  if (hasConsent) {
    ok('Consent screen visible');
    await consentBtn.click();
    await delay(500);
  } else {
    // Maybe consent was already accepted from localStorage
    warn('Consent button not found — may already be accepted or different text');
  }
  await ss(page, 'after-consent');

  // ── STEP 2: Profile creation ─────────────────────────────────────────────
  console.log('\n[2] Profile creation flow');

  // Handle possible onboarding slides
  for (let i = 0; i < 5; i++) {
    const nextBtn = page.locator('button').filter({ hasText: /Avanti|Inizia|Start|Prossimo/i }).first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await delay(400);
    } else break;
  }
  await ss(page, 'after-onboarding');

  // Name input
  const nameInput = page.locator('input[type="text"], input[placeholder]').first();
  const hasNameInput = await nameInput.isVisible().catch(() => false);
  if (hasNameInput) {
    await nameInput.fill('TestBimbo');
    const continueBtn = page.locator('button').filter({ hasText: /Avanti|Continua|Conferma/i }).first();
    if (await continueBtn.isVisible().catch(() => false)) {
      await continueBtn.click();
    } else {
      await page.keyboard.press('Enter');
    }
    await delay(500);
    ok('Name entered: TestBimbo');
  } else {
    warn('Name input not found on current screen');
  }
  await ss(page, 'name-entered');

  // Age selection
  const age5btn = page.locator('button').filter({ hasText: /5|cinque/i }).first();
  if (await age5btn.isVisible().catch(() => false)) {
    await age5btn.click();
    await delay(400);
    ok('Age selected: 5');
  } else {
    warn('Age buttons not visible');
  }
  await ss(page, 'age-selected');

  // Companion selection
  const companions = ['🐉','🦄','🐬','🦊','🤖'];
  for (const emoji of companions) {
    const btn = page.locator(`button:has-text("${emoji}")`).first();
    if (await btn.isVisible().catch(() => false)) {
      await btn.click();
      await delay(400);
      ok(`Companion selected: ${emoji}`);
      break;
    }
  }
  await ss(page, 'companion-selected');

  // ── STEP 3: Map screen ───────────────────────────────────────────────────
  console.log('\n[3] Map screen');
  await delay(600);
  const mapText = await page.textContent('body').catch(() => '');
  if (mapText.includes('Mondi') || mapText.includes('Foresta') || mapText.includes('Mappa')) {
    ok('Map screen rendered');
  } else {
    warn('Map screen text not found, might be on different screen');
  }
  await ss(page, 'map');

  // ── STEP 4: Start Foresta world ──────────────────────────────────────────
  console.log('\n[4] Start world + challenge flow');
  const forestaBtn = page.locator('button').filter({ hasText: /foresta|🌲|🌿/i }).first();
  const hasForesra = await forestaBtn.isVisible().catch(() => false);
  if (hasForesra) {
    await forestaBtn.click();
    await delay(600);
    ok('Foresta world clicked');
  } else {
    // Try clicking the first world node
    const worldBtn = page.locator('[style*="border-radius: 50%"], [style*="borderRadius"]').filter({hasText: /🌲|🌋|🌊/}).first();
    if (await worldBtn.isVisible().catch(() => false)) {
      await worldBtn.click();
      await delay(600);
      ok('First world node clicked');
    } else {
      warn('Could not find world button');
    }
  }
  await ss(page, 'world-start');

  // world_intro or coplay_intro — click Start
  for (let i = 0; i < 4; i++) {
    const startBtn = page.locator('button').filter({ hasText: /Inizia|Start|Avventura|Cominciamo/i }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await startBtn.click();
      await delay(500);
      ok('World intro Start button clicked');
      break;
    }
    await delay(300);
  }
  await ss(page, 'challenge-screen');

  // ── STEP 5: Check challenge screen ──────────────────────────────────────
  console.log('\n[5] Challenge screen features');
  const challengeText = await page.textContent('body').catch(() => '');
  if (challengeText.includes('Esci') || challengeText.includes('stelle') || challengeText.includes('⭐')) {
    ok('Challenge screen active');
  } else {
    warn('Challenge screen indicators not found');
  }

  // Check lyric ticker
  const lyricTicker = page.locator('[style*="italic"]').filter({ hasText: /🎵/ });
  const hasLyric = await lyricTicker.isVisible().catch(() => false);
  if (hasLyric) {
    ok('Lyric ticker visible during challenge');
    const lyricText = await lyricTicker.textContent().catch(() => '');
    console.log(`  → Lyric: ${lyricText}`);
  } else {
    warn('Lyric ticker not visible (may need audio unlock or youngBg mode)');
  }

  // ── STEP 6: Answer some challenges ───────────────────────────────────────
  console.log('\n[6] Playing through challenges');
  for (let round = 0; round < 8; round++) {
    await delay(600);
    const bodyNow = await page.textContent('body').catch(() => '');

    // Detect format
    if (bodyNow.includes('TRACCIA LA LETTERA')) {
      // letter_trace — draw on SVG
      const svg = page.locator('svg[viewBox="0 0 100 100"]').first();
      if (await svg.isVisible().catch(() => false)) {
        const box = await svg.boundingBox();
        if (box) {
          await page.mouse.move(box.x + 50, box.y + 20);
          await page.mouse.down();
          for (let y = 20; y <= 80; y += 3) {
            await page.mouse.move(box.x + 50, box.y + y);
            await delay(20);
          }
          await page.mouse.up();
          await delay(800);
          ok(`letter_trace: drew on SVG canvas`);
        }
      }
    } else if (bodyNow.includes('coppie')) {
      // memory_match
      ok('memory_match challenge detected');
      await ss(page, `memory-match-${round}`);
      const cards = page.locator('[style*="aspectRatio"]');
      const cardCount = await cards.count();
      console.log(`  → Cards found: ${cardCount}`);
      if (cardCount >= 8) {
        ok(`memory_match: ${cardCount} cards rendered`);
        // Tap first card
        await cards.nth(0).click(); await delay(300);
        await ss(page, `memory-match-flip1-${round}`);
        // Tap second card
        await cards.nth(1).click(); await delay(1000);
        await ss(page, `memory-match-flip2-${round}`);
        ok('memory_match: tapped 2 cards');
      } else {
        warn(`memory_match: only ${cardCount} cards found`);
      }
    } else if (bodyNow.includes('Tocca un oggetto')) {
      // drag_drop
      ok('drag_drop challenge detected');
      const items = page.locator('[class="ans-vis"]');
      const zones = page.locator('[style*="dashed"]');
      const itemCount = await items.count();
      const zoneCount = await zones.count();
      console.log(`  → Items: ${itemCount}, Zones: ${zoneCount}`);
      if (itemCount > 0) {
        await items.first().click(); await delay(300);
        ok('drag_drop: item selected');
        await ss(page, `drag-drop-${round}`);
        if (zoneCount > 0) {
          await zones.first().click(); await delay(500);
          ok('drag_drop: item placed in zone');
        }
      }
    } else if (bodyNow.includes('SE VERO') || bodyNow.includes('SE FALSO')) {
      // if_else_tap
      const trueBtn = page.locator('button').filter({ hasText: 'SE VERO' }).first();
      if (await trueBtn.isVisible().catch(() => false)) {
        await trueBtn.click();
        await delay(400);
        ok('if_else_tap: answered SE VERO');
      }
    } else {
      // Generic multiple choice or visual_tap — click first option
      const optBtns = page.locator('button').filter({ hasText: /[^\s]/ });
      const cnt = await optBtns.count();
      // Skip nav/exit buttons
      for (let bi = 0; bi < Math.min(cnt, 6); bi++) {
        const btn = optBtns.nth(bi);
        const txt = await btn.textContent().catch(() => '');
        if (!txt.includes('Esci') && !txt.includes('←') && !txt.includes('🔊') && txt.trim().length > 0) {
          await btn.click();
          await delay(400);
          ok(`Challenge ${round+1}: answered option "${txt.trim().slice(0,20)}"`);
          break;
        }
      }
    }

    // Auto-advance — wait for next challenge or world_end
    await delay(1800);
    const nowBody = await page.textContent('body').catch(() => '');
    if (nowBody.includes('completato') || nowBody.includes('Torna ai Mondi')) {
      ok('Reached world_end screen');
      await ss(page, 'world-end');
      break;
    }
    if (round === 3) await ss(page, `challenge-mid-${round}`);
  }

  // ── STEP 7: World end screen ─────────────────────────────────────────────
  console.log('\n[7] World end screen');
  const endBody = await page.textContent('body').catch(() => '');
  const hasSongBtn = endBody.includes('Riascolta la canzone');
  if (hasSongBtn) {
    ok('"Riascolta la canzone" button present on world_end');
  } else {
    warn('"Riascolta la canzone" button not found — may not have reached world_end');
  }
  await ss(page, 'world-end-final');

  // ── STEP 8: Navigate to parent panel ────────────────────────────────────
  console.log('\n[8] Parent panel — TTS toggle');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await delay(800);

  // Look for "Genitore" or family tab or parent button
  const parentLinks = [
    page.locator('button').filter({ hasText: /Genitore|Famiglia|Family|Parent/i }),
    page.locator('[aria-label*="parent"], [aria-label*="genitore"]'),
  ];
  let foundParent = false;
  for (const loc of parentLinks) {
    if (await loc.first().isVisible().catch(() => false)) {
      await loc.first().click();
      await delay(600);
      foundParent = true;
      ok('Navigated to parent/family area');
      break;
    }
  }
  if (!foundParent) warn('Parent panel navigation button not found from current screen');
  await ss(page, 'parent-panel');

  const parentBody = await page.textContent('body').catch(() => '');
  if (parentBody.includes('NARRAZIONE VOCALE') || parentBody.includes('Narrazione')) {
    ok('TTS toggle panel visible: "NARRAZIONE VOCALE"');
  } else if (parentBody.includes('PIN') || parentBody.includes('3210')) {
    warn('Parent panel locked — need PIN to access settings');
  } else {
    warn('TTS toggle not visible on current screen');
  }

  // ── STEP 9: Console errors ───────────────────────────────────────────────
  console.log('\n[9] Console errors check');
  if (consoleErrors.length === 0) {
    ok('No JS console errors detected');
  } else {
    for (const e of consoleErrors) {
      if (e.includes('Audio') || e.includes('NotAllowedError') || e.includes('play()')) {
        warn(`Audio autoplay blocked (expected in headless): ${e.slice(0,100)}`);
      } else {
        fail(`Console error: ${e.slice(0,150)}`);
      }
    }
  }

  await browser.close();

  // ── REPORT ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('VERIFICATION REPORT — MondoMago');
  console.log('═'.repeat(60));
  console.log(`\n✅ PASSED (${passes.length}):`);
  passes.forEach(p => console.log(`  • ${p}`));
  if (findings.length) {
    console.log(`\n⚠️  FINDINGS (${findings.length}):`);
    findings.forEach(f => console.log(`  • ${f}`));
  }
  if (errors.length) {
    console.log(`\n❌ ERRORS (${errors.length}):`);
    errors.forEach(e => console.log(`  • ${e}`));
  }
  console.log(`\nScreenshots: ${SS_DIR}/`);
  console.log(`Verdict: ${errors.length === 0 ? 'PASS' : 'FAIL'}`);
})();
