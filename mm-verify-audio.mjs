import { chromium } from 'playwright';
const BASE = 'https://andrea85m.github.io/mondomago/';
const RICH = JSON.stringify([{
  id:'t1', childName:'Teo', childAge:6, companion:'foglia', totalStars:999,
  skills:{numeri:5,parole:5,logica:5,natura:5,coding:5}, items:[], streak:5,
  missionsDone:0, dailyCompletedDate:null, lastDate:null, achievements:[],
  dailyCount:0, equippedCosmetic:null, sessionLog:[],
  schoolMode:false, schoolCode:'', schoolAssigned:false,
  coins:500, ownedCosmetics:[]
}]);

const browser = await chromium.launch({ args:['--no-sandbox'] });
const ctx = await browser.newContext({ viewport:{width:390,height:844}, locale:'it-IT' });
const page = await ctx.newPage();

const notFound404 = [], audioOk = [];
page.on('response', r => {
  const u = r.url();
  if (!u.includes('mondomago') && !u.includes('github')) return;
  if (u.includes('/audio/tts_')) {
    if (r.status() === 404) notFound404.push(u.replace(/.*mondomago\//,''));
    else if (r.status() === 200) audioOk.push(u.replace(/.*mondomago\//,''));
  }
});

await page.goto(BASE, { waitUntil:'domcontentloaded', timeout:20000 });
await page.evaluate((p) => {
  localStorage.setItem('mondomago_consent','1');
  localStorage.setItem('mondomago_profiles_v1', p);
}, RICH);
await page.reload({ waitUntil:'networkidle', timeout:30000 });
await page.waitForTimeout(5000); // let autoSpeak fire

console.log('TTS 200 OK:', audioOk.length ? audioOk.join(', ') : 'nessuno ancora caricato');
console.log('TTS 404:   ', notFound404.length ? notFound404.join(', ') : 'nessuno ✅');

// Check built JS for the path
const jsResp = await page.evaluate(async () => {
  const scripts = [...document.querySelectorAll('script[src]')].map(s=>s.src);
  const jsUrl = scripts.find(s => s.includes('/assets/index'));
  if (!jsUrl) return 'non trovato';
  const r = await fetch(jsUrl);
  const txt = await r.text();
  const match = txt.match(/new Audio\([^)]{0,40}audio[^)]{0,40}\)/g);
  return match ? match.join(' | ') : 'pattern non trovato';
});
console.log('Audio path nel JS:', jsResp);

await ctx.close();
await browser.close();
