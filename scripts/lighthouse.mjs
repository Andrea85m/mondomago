import { writeFileSync } from 'fs';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const args = process.argv.slice(2);
// Support both --url=VALUE and --url VALUE
const urlFlagIdx = args.findIndex(a => a === '--url' || a.startsWith('--url='));
let URL = 'http://localhost:4173/app/';
if (urlFlagIdx !== -1) {
  const arg = args[urlFlagIdx];
  URL = arg.startsWith('--url=') ? arg.slice(6) : (args[urlFlagIdx + 1] || URL);
}

// Ordine: CHROME_PATH esplicito → Chrome di sistema (macOS, Linux) → Chromium
// scaricato da Playwright (qualsiasi versione, anche su WSL).
const HOME = process.env.HOME || '';
const CHROME_PATHS = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium',
].filter(Boolean);

async function findChromePath() {
  const { existsSync, readdirSync } = await import('fs');
  const found = CHROME_PATHS.find(p => existsSync(p));
  if (found) return found;
  for (const cache of [`${HOME}/Library/Caches/ms-playwright`, `${HOME}/.cache/ms-playwright`]) {
    if (!existsSync(cache)) continue;
    const builds = readdirSync(cache).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const b of builds) {
      for (const rel of [
        'chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
        'chrome-mac/Chromium.app/Contents/MacOS/Chromium',
        'chrome-linux64/chrome',
        'chrome-linux/chrome',
      ]) {
        const p = `${cache}/${b}/${rel}`;
        if (existsSync(p)) return p;
      }
    }
  }
  return null;
}

// WSL: inject extracted libs so Playwright Chromium can find libnspr4/libnss3
{
  const LIBS = '/tmp/chrome-libs/usr/lib/x86_64-linux-gnu';
  const { existsSync: _ex } = await import('fs');
  if (_ex(LIBS)) {
    const parts = [LIBS, _ex(`${LIBS}/nss`) ? `${LIBS}/nss` : null, process.env.LD_LIBRARY_PATH].filter(Boolean);
    process.env.LD_LIBRARY_PATH = parts.join(':');
  }
}

async function run() {
  console.log(`\nAudit Lighthouse: ${URL}\n`);

  const chromePath = await findChromePath();
  if (!chromePath) { console.error('Nessun browser trovato.'); process.exit(1); }
  console.log(`Browser: ${chromePath}\n`);

  const chrome = await chromeLauncher.launch({
    chromePath,
    chromeFlags: [
      '--headless=new',
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  const result = await lighthouse(URL, {
    port: chrome.port,
    output: ['html', 'json'],
    logLevel: 'error',
    onlyCategories: ['performance', 'accessibility', 'best-practices'],
  });

  await chrome.kill();

  const { categories } = result.lhr;
  const scores = {
    Performance:      Math.round((categories.performance?.score ?? 0) * 100),
    Accessibility:    Math.round((categories.accessibility?.score ?? 0) * 100),
    'Best Practices': Math.round((categories['best-practices']?.score ?? 0) * 100),
  };

  const pad = s => String(s).padStart(3);
  const bar = n => '█'.repeat(Math.round(n / 5)).padEnd(20);
  const green = '\x1b[32m', yellow = '\x1b[33m', red = '\x1b[31m', reset = '\x1b[0m';
  const color = n => n >= 90 ? green : n >= 50 ? yellow : red;

  console.log('━'.repeat(50));
  for (const [label, score] of Object.entries(scores)) {
    console.log(`${color(score)}${label.padEnd(18)} ${pad(score)}  ${bar(score)}${reset}`);
  }
  console.log('━'.repeat(50));

  writeFileSync('lighthouse-report.html', result.report[0]);
  writeFileSync('lighthouse-report.json', result.report[1]);
  console.log('\nReport: lighthouse-report.html  lighthouse-report.json\n');

  const failing = Object.entries(scores).filter(([, s]) => s < 90);
  if (failing.length) {
    console.warn('Sotto 90:', failing.map(([l, s]) => `${l}(${s})`).join(', '));
  }
}

run().catch(e => { console.error(e); process.exit(1); });
