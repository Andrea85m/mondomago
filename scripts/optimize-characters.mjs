/**
 * Rigenera i companion "web-ready" a partire dai master in art/characters-src/.
 *
 *   node scripts/optimize-characters.mjs
 *
 * I master (1024–1104px) non vanno in public/: sarebbero serviti tali e quali
 * al telefono. Qui li riduciamo a 512px sul lato lungo — il render più grande
 * in app è 180 CSS px (companion_welcome), quindi 512px copre anche un DPR 2.8×
 * — e ne emettiamo due formati:
 *
 *   *_cutout.webp  → servito ai browser moderni tramite <picture>
 *   *_cutout.png   → fallback, stesso nome di prima (nessun percorso da cambiare)
 */
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'fs';
import { join } from 'path';

const SRC = 'art/characters-src';
const OUT = 'public/characters';
const MAX = 512;

const kb = n => (n / 1024).toFixed(0) + 'K';
let before = 0, after = 0;

for (const file of readdirSync(SRC).filter(f => f.endsWith('_cutout.png')).sort()) {
  const src = join(SRC, file);
  const orig = statSync(src).size;
  before += orig;

  const resized = sharp(src).resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true });

  const png  = await resized.clone().png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
  const webp = await resized.clone().webp({ quality: 88, alphaQuality: 90 }).toBuffer();

  writeFileSync(join(OUT, file), png);
  writeFileSync(join(OUT, file.replace(/\.png$/, '.webp')), webp);
  after += webp.length;

  console.log(`${file.padEnd(22)} ${kb(orig).padStart(6)} → png ${kb(png.length).padStart(5)} · webp ${kb(webp.length).padStart(5)}`);
}

console.log(`\nTotale servito: ${kb(before)} → ${kb(after)} (webp)`);
