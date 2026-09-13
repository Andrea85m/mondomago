#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// ICONE DELL'APP — un solo disegno, tutti i formati.
//
//   node scripts/gen-icons.mjs
//
// Il simbolo è il Sigillo di Stelle, lo stesso del salto di livello: disco
// d'oro con la stella, anello tratteggiato d'oro, anello interno verde-runa,
// quattro stelline in orbita, notte indaco dietro.
//
// Escono in public/:
//   favicon.svg            scheda del browser (versione semplificata, leggibile a 16px)
//   icon-192.png           icona "any"
//   icon-512.png           icona "any"
//   icon-maskable-512.png  Android adattiva: tutto dentro l'80% centrale
//   apple-touch-icon.png   iOS, 180×180, senza trasparenza
// ─────────────────────────────────────────────────────────────────────────────

import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const PUBLIC = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');

const GOLD = '#FFC24B', RUNE = '#6DE0C6', INK = '#1B1035';

/** Stella a 5 punte centrata in (cx, cy), punta in alto. */
function stella(cx, cy, R, r) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const rad = (i % 2 ? r : R), a = -Math.PI / 2 + i * Math.PI / 5;
    pts.push(`${(cx + rad * Math.cos(a)).toFixed(2)},${(cy + rad * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join('L')}Z`;
}

/** Scintilla a 4 punte. */
function scintilla(cx, cy, R) {
  const k = R * 0.22;
  return `M${cx},${cy - R} L${cx + k},${cy - k} L${cx + R},${cy} L${cx + k},${cy + k} L${cx},${cy + R} L${cx - k},${cy + k} L${cx - R},${cy} L${cx - k},${cy - k}Z`;
}

const defs = `
  <radialGradient id="notte" cx="50%" cy="36%" r="78%">
    <stop offset="0" stop-color="#3B2475"/>
    <stop offset=".58" stop-color="${INK}"/>
    <stop offset="1" stop-color="#110824"/>
  </radialGradient>
  <radialGradient id="oro" cx="50%" cy="32%" r="70%">
    <stop offset="0" stop-color="#FFEBB3"/>
    <stop offset=".55" stop-color="${GOLD}"/>
    <stop offset="1" stop-color="#E08E26"/>
  </radialGradient>
  <radialGradient id="alone" cx="50%" cy="50%" r="50%">
    <stop offset=".55" stop-color="${GOLD}" stop-opacity=".30"/>
    <stop offset="1" stop-color="${GOLD}" stop-opacity="0"/>
  </radialGradient>`;

/** Il sigillo completo su un quadrato 512, scalato di `s` attorno al centro. */
function sigillo(s = 1) {
  const orbite = [-58, 32, 122, 212].map((deg, i) => {
    const a = deg * Math.PI / 180;
    return `<circle cx="${(256 + 183 * Math.cos(a)).toFixed(1)}" cy="${(256 + 183 * Math.sin(a)).toFixed(1)}" r="11" fill="${i % 2 ? RUNE : GOLD}"/>`;
  }).join('');
  return `
  <g transform="translate(256 256) scale(${s}) translate(-256 -256)">
    <circle cx="256" cy="256" r="200" fill="url(#alone)"/>
    <circle cx="256" cy="256" r="183" fill="none" stroke="${GOLD}" stroke-opacity=".55" stroke-width="7" stroke-dasharray="20 15" stroke-linecap="round"/>
    <circle cx="256" cy="256" r="156" fill="none" stroke="${RUNE}" stroke-opacity=".5" stroke-width="4"/>
    ${orbite}
    <circle cx="256" cy="256" r="124" fill="url(#oro)"/>
    <circle cx="256" cy="256" r="118" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="5"/>
    <path d="${stella(256, 262, 82, 34)}" fill="#2D1B54" stroke="#2D1B54" stroke-width="10" stroke-linejoin="round"/>
    <path d="${scintilla(380, 118, 26)}" fill="#FFF1C9"/>
    <path d="${scintilla(128, 402, 16)}" fill="${RUNE}" fill-opacity=".85"/>
  </g>`;
}

const iconaPiena = (s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>${defs}</defs>
  <rect width="512" height="512" fill="url(#notte)"/>
  ${sigillo(s)}
</svg>`;

// A 16px anelli e orbite diventano rumore: restano fondo, disco e stella.
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <defs>
    <radialGradient id="n" cx="50%" cy="36%" r="78%"><stop offset="0" stop-color="#3B2475"/><stop offset="1" stop-color="${INK}"/></radialGradient>
    <radialGradient id="o" cx="50%" cy="32%" r="70%"><stop offset="0" stop-color="#FFEBB3"/><stop offset=".55" stop-color="${GOLD}"/><stop offset="1" stop-color="#E08E26"/></radialGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#n)"/>
  <circle cx="32" cy="32" r="22" fill="url(#o)"/>
  <path d="${stella(32, 33.2, 14.5, 6)}" fill="#2D1B54" stroke="#2D1B54" stroke-width="1.6" stroke-linejoin="round"/>
</svg>
`;

async function png(svg, size, file) {
  await sharp(Buffer.from(svg), { density: 72 * size / 512 * 4 })
    .resize(size, size)
    .flatten({ background: INK })
    .png({ compressionLevel: 9, palette: false })
    .toFile(join(PUBLIC, file));
  console.log(`  ✓ ${file} (${size}×${size})`);
}

writeFileSync(join(PUBLIC, 'favicon.svg'), favicon);
console.log(`  ✓ favicon.svg (${favicon.length} byte)`);
await png(iconaPiena(1), 192, 'icon-192.png');
await png(iconaPiena(1), 512, 'icon-512.png');
await png(iconaPiena(0.8), 512, 'icon-maskable-512.png');   // zona sicura: cerchio dell'80%
await png(iconaPiena(0.92), 180, 'apple-touch-icon.png');   // iOS arrotonda gli angoli
