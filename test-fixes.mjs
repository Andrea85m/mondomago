/**
 * MondoMago — verifica fix bug 1 + bug 2
 * Gestisce correttamente il click "Avanti →" dopo ogni risposta
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';

const BASE = 'http://localhost:5174';
const SS   = '/tmp/mm-fix-test4';
mkdirSync(SS, { recursive: true });

let idx = 0;
const ss   = async (page, n) => { const p=`${SS}/${String(++idx).padStart(2,'0')}-${n}.png`; await page.screenshot({path:p,fullPage:false}); console.log(`  📸 ${p}`); };
const pass=[], fail=[], warn=[];
const ok   = m => { pass.push(m); console.log(`  ✅ ${m}`); };
const bad  = m => { fail.push(m); console.log(`  ❌ ${m}`); };
const note = m => { warn.push(m); console.log(`  ⚠️  ${m}`); };
const wait = ms => new Promise(r => setTimeout(r, ms));

// click "Avanti →" or "Continua" if visible (post-answer feedback panel)
async function advanceIfNeeded(page) {
  for (let i = 0; i < 3; i++) {
    const avanti = page.locator('button').filter({ hasText: /^Avanti|Continua →|Avanti →/ }).first();
    if (await avanti.isVisible().catch(()=>false)) {
      await avanti.click();
      await wait(500);
      return true;
    }
    await wait(300);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
    executablePath: process.env.CHROME_PATH,
  });
  const ctx = await browser.newContext({ viewport:{width:390,height:844}, hasTouch:true });
  const page = await ctx.newPage();

  // Capture only non-audio JS errors
  const jsErrors = [];
  page.on('console', m => {
    if (m.type() === 'error') {
      const t = m.text();
      if (!t.includes('Audio') && !t.includes('NotAllowed') && !t.includes('play()') && !t.includes('style property')) {
        jsErrors.push(t);
      }
    }
  });
  page.on('pageerror', e => { if (!e.message.includes('Audio')) jsErrors.push(e.message); });

  // ── 1. Load + inject profile ──────────────────────────────────────────────
  console.log('\n[1] Caricamento + profilo iniettato (età 5)');
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await wait(800);

  await page.evaluate(() => {
    const pid = 'test-pid-age5';
    const profile = {
      id: pid, childName: 'Luca', childAge: 5, companion: 'foglia',
      totalStars: 0,
      skills: { logica:1, numeri:1, parole:1, empatia:1, creativita:1, coding:1 },
      items: [], streak: 0, missionsDone: [], dailyCompletedDate: null,
      lastDate: new Date().toISOString().slice(0,10), achievements: [], dailyCount: 0,
      equippedCosmetic: null, sessionLog: [], schoolMode: false, schoolCode: null, schoolAssigned: null
    };
    localStorage.setItem('mondomago_consent', '1');
    localStorage.setItem('mondomago_tutorial', '1');
    localStorage.setItem('mondomago_profiles_v1', JSON.stringify([profile]));
  });

  await page.reload({ waitUntil: 'networkidle' });
  await wait(1000);
  await ss(page, 'map');
  const mapBody = await page.textContent('body').catch(()=>'');
  if (mapBody.includes('Foresta') || mapBody.includes('foresta') || mapBody.includes('🌲') || mapBody.includes('Mondi')) {
    ok('Mappa caricata (onboarding saltato)');
  } else {
    note('Mappa non rilevata, testo: ' + mapBody.slice(0,100));
  }

  // ── 2. Foresta → world intro ──────────────────────────────────────────────
  console.log('\n[2] Foresta → intro');
  let clicked = false;
  for (const sel of ['button:has-text("Foresta")', 'button:has-text("foresta")', 'button:has-text("🌲")']) {
    const b = page.locator(sel).first();
    if (await b.isVisible().catch(()=>false)) { await b.click(); await wait(700); ok(`"${sel}" cliccato`); clicked=true; break; }
  }
  if (!clicked) bad('Bottone Foresta non trovato');
  await ss(page, 'world-clicked');

  // Advance through world_intro panels
  for (let i = 0; i < 6; i++) {
    await wait(400);
    const sb = page.locator('button').filter({ hasText: /Inizia|Cominciamo|Avanti →/ }).first();
    if (await sb.isVisible().catch(()=>false)) { await sb.click(); await wait(500); ok(`Intro panel ${i+1}`); }
    const b = await page.textContent('body').catch(()=>'');
    if (b.includes('stelle') || b.includes('⭐') || b.includes('Esci')) break;
  }
  await ss(page, 'challenge-start');

  // ── 3. Play challenges ────────────────────────────────────────────────────
  console.log('\n[3] Sfide — verifica bug 1 e bug 2');
  const mathMult=[], brokenBoss=[], fixedPrompts=[];
  let challengeCount = 0;

  for (let round = 0; round < 20; round++) {
    await wait(600);
    const body = await page.textContent('body').catch(()=>'');

    // World end check
    if (body.includes('completato') || body.includes('Torna ai Mondi')) {
      ok(`World end al round ${round+1}`);
      await ss(page, 'world-end');
      if (body.includes('Riascolta') || body.includes('canzone')) ok('"Riascolta la canzone" presente ✓');
      else note('"Riascolta la canzone" non trovato nel world_end');
      break;
    }

    // ── Bug 2: moltiplicazione per età 5
    const mMatch = body.match(/(\d+\s*×\s*\d+)/);
    if (mMatch) mathMult.push(`R${round+1}: "${mMatch[0]}"`);
    if (body.includes('settimana ha 7 giorni') && body.includes('2 settimane'))
      brokenBoss.push(`R${round+1}: boss 7×2 ancora visibile a età 5!`);

    // ── Bug 1: prompt corretti
    if (body.includes('Abbina ogni animale al posto dove vive')) { fixedPrompts.push('drag_drop'); ok(`R${round+1}: ✓ prompt drag_drop corretto`); }
    if (body.includes('Tocca due carte uguali per fare una coppia')) { fixedPrompts.push('mm-3-5'); ok(`R${round+1}: ✓ mm prompt 3-5yr corretto`); }
    if (body.includes('Abbina ogni animale al cibo che mangia')) { fixedPrompts.push('mm-cibo'); ok(`R${round+1}: ✓ mm prompt cibo corretto`); }
    if (body.includes('Abbina ogni animale al suo nome')) { fixedPrompts.push('mm-nome'); ok(`R${round+1}: ✓ mm prompt nome corretto`); }
    if (body.includes('ghiande')) { fixedPrompts.push('boss-ghiande'); ok(`R${round+1}: ✓ boss fb12 = ghiande (non 7×2)`); }

    // Screenshot at key moments
    if (round === 0 || round === 2 || round === 4) await ss(page, `r${round+1}`);

    // ── Interact with current challenge ──────────────────────────────────
    let acted = false;

    // memory_match
    if (body.includes('coppie') || body.includes('Tocca due carte') || body.includes('Abbina ogni')) {
      const cards = page.locator('[style*="aspect-ratio"]');
      const cnt = await cards.count();
      if (cnt >= 4) {
        await ss(page, `mm-r${round+1}`);
        for (let c = 0; c+1 < cnt && c < 8; c += 2) {
          await cards.nth(c).click();   await wait(350);
          await cards.nth(c+1).click(); await wait(700);
        }
        ok(`R${round+1}: memory_match — ${cnt} carte`);
        acted = true;
        await wait(1500);
      }
    }

    // sequence_tap (bottoni numerati da toccare in ordine)
    if (!acted && body.includes('ordine') || body.includes('Tocca nell')) {
      const seqBtns = page.locator('button').filter({ hasText: /\d+|[A-Z]/ });
      const cnt = await seqBtns.count();
      for (let bi = 0; bi < Math.min(cnt, 6); bi++) {
        const btn = seqBtns.nth(bi);
        const txt = await btn.textContent().catch(()=>'');
        if (txt.trim() && !['Esci','←','Avanti'].some(s => txt.includes(s))) {
          await btn.click(); await wait(300);
        }
      }
      acted = true;
    }

    // generic: click first valid option
    if (!acted) {
      const opts = page.locator('button').filter({ hasText: /[^\s]/ });
      const cnt2 = await opts.count();
      const skipWords = ['Esci','←','🔊','Inizia','Avanti','Salta','Torna','Menu','⚙','Pausa'];
      for (let bi = 0; bi < Math.min(cnt2, 12); bi++) {
        const btn = opts.nth(bi);
        const txt = await btn.textContent().catch(()=>'');
        if (!skipWords.some(s => txt.includes(s)) && txt.trim().length > 0) {
          try { await btn.click({timeout:3000}); } catch {}
          await wait(400);
          challengeCount++;
          break;
        }
      }
    }

    // After answering: click "Avanti →" feedback panel if it appears
    await wait(1000);
    const advanced = await advanceIfNeeded(page);
    if (advanced) await wait(400);

    // Also click Avanti after waiting if still there
    await advanceIfNeeded(page);
  }

  await ss(page, 'final-state');

  // ── 4. JS errors (critical only) ─────────────────────────────────────────
  console.log('\n[4] Errori JS critici');
  if (jsErrors.length === 0) ok('Nessun errore JS critico');
  else jsErrors.forEach(e => bad(`Errore JS: ${e.slice(0,140)}`));

  await browser.close();

  // ── REPORT ────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('REPORT VERIFICA FIX — MondoMago');
  console.log('═'.repeat(60));

  console.log(`\nSfide attraversate: ${challengeCount}`);

  console.log('\n📋 Bug 1 — Prompt esplicativi:');
  if (fixedPrompts.length) fixedPrompts.forEach(p => ok(`  Visto: ${p}`));
  else note('Prompt corretti non apparsi in questa sessione (sfide casuali)');

  console.log('\n📋 Bug 2 — No × per età 5:');
  if (mathMult.length) mathMult.forEach(m => bad(m));
  else ok('Nessuna moltiplicazione rilevata');
  if (brokenBoss.length) brokenBoss.forEach(b => bad(b));
  else ok('Boss 7×2 non apparsa per età 5');

  console.log(`\n✅ PASS (${pass.length}):`);
  pass.forEach(p => console.log(`  • ${p}`));
  if (warn.length) { console.log(`\n⚠️  NOTE (${warn.length}):`); warn.forEach(w => console.log(`  • ${w}`)); }
  if (fail.length) { console.log(`\n❌ FAIL (${fail.length}):`); fail.forEach(f => console.log(`  • ${f}`)); }

  console.log(`\nScreenshot: ${SS}/`);
  console.log(`\nVerdetto: ${fail.length === 0 ? '✅ PASS' : '❌ FAIL'}`);
})();
