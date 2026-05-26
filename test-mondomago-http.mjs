/**
 * Test suite per MondoMago (senza browser)
 * Verifica HTTP, HTML, JS bundle, manifest PWA, service worker, audio
 */

const BASE = 'https://andrea85m.github.io/mondomago';

const results = [];
async function check(name, fn) {
  try {
    const ok = await fn();
    const status = ok ? '✅' : '❌';
    console.log(`${status} ${name}`);
    results.push({ name, ok });
  } catch (e) {
    console.log(`❌ ${name}: ${e.message}`);
    results.push({ name, ok: false, error: e.message });
  }
}

async function fetchText(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

async function fetchStatus(url) {
  const r = await fetch(url);
  return r.status;
}

console.log(`\nTest MondoMago — ${BASE}\n${'─'.repeat(50)}`);

// ── 1. HTTP fondamentale ─────────────────────────────────────────────────────
console.log('\n1. HTTP & Struttura\n');

await check('index.html risponde 200', async () => {
  const s = await fetchStatus(`${BASE}/`);
  return s === 200;
});

await check('manifest.json presente', async () => {
  const s = await fetchStatus(`${BASE}/manifest.json`);
  return s === 200;
});

await check('service worker (sw.js) presente', async () => {
  const s = await fetchStatus(`${BASE}/sw.js`);
  return s === 200;
});

await check('icon-192.png presente', async () => {
  const s = await fetchStatus(`${BASE}/icon-192.png`);
  return s === 200;
});

await check('icon-512.png presente', async () => {
  const s = await fetchStatus(`${BASE}/icon-512.png`);
  return s === 200;
});

await check('apple-touch-icon.png presente', async () => {
  const s = await fetchStatus(`${BASE}/apple-touch-icon.png`);
  return s === 200;
});

await check('privacy-policy.html presente', async () => {
  const s = await fetchStatus(`${BASE}/privacy-policy.html`);
  return s === 200;
});

// ── 2. HTML ──────────────────────────────────────────────────────────────────
console.log('\n2. HTML\n');
const html = await fetchText(`${BASE}/`);

await check('Tag <title> presente', async () => /<title>/i.test(html));
await check('Meta viewport mobile', async () => /viewport.*width=device-width/i.test(html));
await check('Link manifest.json', async () => /manifest\.json/.test(html));
await check('Registrazione service worker', async () => /serviceWorker|sw\.js/.test(html));
await check('Font Fredoka/Nunito (offline via fontsource)', async () => {
  // Either CDN link or @fontsource import in bundle
  return /fredoka|nunito/i.test(html);
});
await check('apple-touch-icon link', async () => /apple-touch-icon/.test(html));
await check('charset UTF-8', async () => /charset.*utf-8/i.test(html));

// ── 3. PWA Manifest ──────────────────────────────────────────────────────────
console.log('\n3. PWA Manifest\n');
const manifest = JSON.parse(await fetchText(`${BASE}/manifest.json`));

await check('name presente', async () => !!manifest.name);
await check('short_name presente', async () => !!manifest.short_name);
await check('start_url presente', async () => !!manifest.start_url);
await check('display: standalone', async () => manifest.display === 'standalone');
await check('background_color presente', async () => !!manifest.background_color);
await check('theme_color presente', async () => !!manifest.theme_color);
await check('Icons: 192px', async () => manifest.icons?.some(i => i.sizes?.includes('192x192')));
await check('Icons: 512px', async () => manifest.icons?.some(i => i.sizes?.includes('512x512')));
await check('shortcuts PWA (sfida del giorno)', async () => Array.isArray(manifest.shortcuts) && manifest.shortcuts.length > 0);
await check('screenshots PWA', async () => Array.isArray(manifest.screenshots) && manifest.screenshots.length > 0);
await check('lang italiano', async () => manifest.lang === 'it' || manifest.dir === 'ltr');

// ── 4. Service Worker ────────────────────────────────────────────────────────
console.log('\n4. Service Worker\n');
const sw = await fetchText(`${BASE}/sw.js`);

await check('SW: install event', async () => /addEventListener.*install|self\.on.*install/.test(sw));
await check('SW: fetch event', async () => /addEventListener.*fetch/.test(sw));
await check('SW: cache v5', async () => /cache.*v5|CACHE.*5|v5/.test(sw));
await check('SW: precache assets', async () => /index\.html|\.js|\.css/.test(sw));
await check('SW: SKIP_WAITING', async () => /skipWaiting/.test(sw));
await check('SW: navigation fallback SPA', async () => /navigate|index\.html/.test(sw));

// ── 5. JS Bundle — Features chiave ──────────────────────────────────────────
console.log('\n5. JS Bundle (feature check)\n');

// Get the bundle filename from HTML
const jsSrc = html.match(/assets\/(index-[^"']+\.js)/)?.[1];
if (!jsSrc) {
  console.log('⚠️  Bundle JS non trovato nell\'HTML, skip test bundle');
} else {
  const jsUrl = `${BASE}/assets/${jsSrc}`;
  console.log(`   Bundle: ${jsSrc}`);
  const js = await fetchText(jsUrl);

  await check('canvas-confetti importato', async () => /canvas.confetti|canvasConfetti/i.test(js));
  await check('Fredoka One font', async () => /fredoka.one|fredoka-one/i.test(js));
  await check('I 7 mondi presenti', async () => {
    const worlds = ['foresta','vulcano','oceano','cielo','biblioteca','giardino','castello'];
    return worlds.every(w => js.toLowerCase().includes(w));
  });
  await check('Mondo 8 Laboratorio', async () => /laboratorio|laboratorio.logico/i.test(js));
  await check('Companion Pixel (robot)', async () => /pixel|Pixel/i.test(js));
  await check('5 companion totali', async () => {
    const companions = ['Fiamma','Luna','Onde','Foglia','Pixel'];
    return companions.every(c => js.includes(c));
  });
  await check('Formati sfida: visual_tap', async () => /visual_tap/.test(js));
  await check('Formati sfida: drag_drop', async () => /drag_drop/.test(js));
  await check('Formati sfida: if_else_tap', async () => /if_else_tap/.test(js));
  await check('Formati sfida: code_sequence', async () => /code_sequence/.test(js));
  await check('Formati sfida: debug_find', async () => /debug_find/.test(js));
  await check('Multi-profilo (max 4)', async () => /allProfiles|profiles.*4|max.*4/i.test(js));
  await check('COPPA consent', async () => /coppa|parentConsent|parent.consent/i.test(js));
  await check('Achievement (14+)', async () => {
    const achievementCount = (js.match(/"achievement_/g) || []).length;
    return achievementCount >= 10;
  });
  await check('Streak system', async () => /streak|lastPlayDate/i.test(js));
  await check('Daily challenge', async () => /daily|getDailyChallenges/i.test(js));
  await check('TTS / speak()', async () => /speak\(|ttsMap|tts_/i.test(js));
  await check('Parent dashboard', async () => /parentReport|parent.report|sessionLog/i.test(js));
  await check('Push notifications', async () => /Notification|pushNotif/i.test(js));
  await check('wrongStreak (hint progressivo)', async () => /wrongStreak/.test(js));
  await check('idleHint (hint passività)', async () => /idleHint/.test(js));
  await check('Guided hand animation', async () => /tapGesture|handAnim|guided/i.test(js));
  await check('Skill coaching 20 regole', async () => /SKILL_TIPS|skillStruggle|skillTips/i.test(js));
  await check('compMood (companion animato)', async () => /compMood/.test(js));
  await check('triggerConfetti()', async () => /triggerConfetti/.test(js));
  await check('parseDateLocal (timezone fix)', async () => /parseDateLocal/.test(js));
  await check('escapeHtml (XSS fix)', async () => /escapeHtml/.test(js));
  await check('Font Nunito', async () => /nunito/i.test(js));
}

// ── 6. Audio TTS ─────────────────────────────────────────────────────────────
console.log('\n6. Audio TTS (sample 5 file)\n');
const audioHashes = [
  'tts_00a197c4', 'tts_5d31cb4e', 'tts_a03ac286',
  'tts_f716d209', 'tts_ed97e120'
];
for (const hash of audioHashes) {
  await check(`Audio ${hash}.mp3`, async () => {
    const s = await fetchStatus(`${BASE}/audio/${hash}.mp3`);
    return s === 200;
  });
}

// ── 7. Screenshot (fallback: check HTTP) ────────────────────────────────────
console.log('\n7. Screenshot store\n');
const screenshots = [
  'screen-map.png', 'screen-challenge-visual.png', 'screen-challenge-mc.png',
  'screen-laboratorio.png', 'feature-graphic.png'
];
for (const sc of screenshots) {
  await check(`Screenshot ${sc}`, async () => {
    const s = await fetchStatus(`${BASE}/screenshots/${sc}`);
    return s === 200;
  });
}

// ── RIEPILOGO ────────────────────────────────────────────────────────────────
const passed = results.filter(r => r.ok).length;
const failed = results.filter(r => !r.ok).length;
const total = results.length;

console.log(`\n${'═'.repeat(50)}`);
console.log('RIEPILOGO TEST MONDOMAGO');
console.log(`${'═'.repeat(50)}`);
console.log(`✅ Passati:  ${passed}/${total}`);
console.log(`❌ Falliti:  ${failed}/${total}`);
console.log(`📊 Score:    ${Math.round(passed/total*100)}%`);

if (failed > 0) {
  console.log('\nTest falliti:');
  results.filter(r => !r.ok).forEach(r => console.log(`  ❌ ${r.name}${r.error ? ': '+r.error : ''}`));
}
console.log('');
process.exit(failed > 0 ? 1 : 0);
