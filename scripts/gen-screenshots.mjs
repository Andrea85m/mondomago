import sharp from 'sharp';
import { writeFileSync } from 'fs';

const W = 1080, H = 1920;
const FF = "Fredoka One, system-ui, sans-serif";
const BG = "#1a1a2e";
const CARD = "rgba(255,255,255,0.08)";

function svg(content) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bgG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="100%" stop-color="#12102a"/>
    </linearGradient>
    <linearGradient id="goldG" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#FFD700"/>
      <stop offset="50%" stop-color="#FFA500"/>
      <stop offset="100%" stop-color="#FFD700"/>
    </linearGradient>
    <linearGradient id="greenG" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#16A34A"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bgG)"/>
  ${content}
</svg>`;
}

function card(x, y, w, h, color = "rgba(255,255,255,0.08)", r = 32) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}" stroke="rgba(255,255,255,0.12)" stroke-width="2"/>`;
}

function text(t, x, y, size, color = "white", anchor = "middle", weight = "normal", font = "Nunito, system-ui, sans-serif") {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${color}" text-anchor="${anchor}" font-family="${font}" font-weight="${weight}" dominant-baseline="central">${t}</text>`;
}

function emoji(e, x, y, size) {
  return `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central">${e}</text>`;
}

function worldCard(x, y, w, h, icon, name, color, stars, locked = false) {
  const alpha = locked ? "0.4" : "1";
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${locked ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.10)'}" stroke="${color}${locked ? '44' : '66'}" stroke-width="2"/>
    <rect x="${x+16}" y="${y+16}" width="80" height="80" rx="20" fill="${color}33"/>
    <text x="${x+56}" y="${y+56}" font-size="44" text-anchor="middle" dominant-baseline="central" opacity="${alpha}">${icon}</text>
    ${locked ? `<text x="${x+w/2+50}" y="${y+56}" font-size="34" text-anchor="middle" dominant-baseline="central">🔒</text>` : ''}
    <text x="${x+116}" y="${y+36}" font-size="28" fill="white" font-family="Nunito,sans-serif" font-weight="800" opacity="${alpha}">${name}</text>
    <text x="${x+116}" y="${y+68}" font-size="26" fill="#FFD700" font-family="Nunito,sans-serif">${'⭐'.repeat(Math.min(stars,3))}${'☆'.repeat(Math.max(0,3-stars))}</text>
  `;
}

// ── SCREEN 1: MAP ──────────────────────────────────────────────────────────────
async function screenMap() {
  const worlds = [
    { icon:"🌲", name:"Foresta Magica",       color:"#22C55E", stars:3, locked:false },
    { icon:"🏰", name:"Castello delle Nuvole", color:"#A78BFA", stars:2, locked:false },
    { icon:"🌊", name:"Oceano Luminoso",        color:"#38BDF8", stars:1, locked:false },
    { icon:"🎪", name:"Mercato dei Colori",     color:"#F97316", stars:0, locked:false },
    { icon:"🌌", name:"Galassia Stellare",      color:"#818CF8", stars:0, locked:true  },
    { icon:"🌋", name:"Vulcano Magico",         color:"#EF4444", stars:0, locked:true  },
    { icon:"📚", name:"Biblioteca Incantata",   color:"#D97706", stars:0, locked:true  },
    { icon:"🔬", name:"Laboratorio Logico",     color:"#06B6D4", stars:0, locked:true  },
  ];

  let cards = '';
  worlds.forEach((w, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 40 + col * 510, y = 360 + row * 136;
    cards += worldCard(x, y, 490, 118, w.icon, w.name, w.color, w.stars, w.locked);
  });

  const content = `
    <!-- header bg -->
    <rect x="0" y="0" width="${W}" height="300" fill="rgba(255,255,255,0.03)"/>

    <!-- title -->
    ${emoji("🧙‍♂️", 540, 80, 64)}
    ${text("MondoMago", 540, 150, 64, "white", "middle", "bold", FF)}
    ${text("Scegli il tuo mondo!", 540, 208, 34, "rgba(255,255,255,0.6)")}

    <!-- stats bar -->
    ${card(40, 248, 310, 88, "rgba(255,215,0,0.12)", 24)}
    ${emoji("⭐", 100, 292, 40)}
    ${text("142 stelle", 200, 292, 30, "#FFD700", "middle", "800")}
    ${card(370, 248, 310, 88, "rgba(168,139,250,0.12)", 24)}
    ${emoji("🏆", 430, 292, 40)}
    ${text("Livello 4", 530, 292, 30, "#A78BFA", "middle", "800")}
    ${card(700, 248, 340, 88, "rgba(255,107,107,0.12)", 24)}
    ${emoji("🔥", 760, 292, 40)}
    ${text("5 giorni", 870, 292, 30, "#FF6B6B", "middle", "800")}

    <!-- world cards -->
    ${cards}

    <!-- companion -->
    ${emoji("🐉", 90, 1664, 90)}
    ${card(160, 1618, 620, 100, "rgba(255,107,107,0.15)", 24)}
    ${text("Avventura di oggi pronta! 🔥", 470, 1668, 30, "rgba(255,255,255,0.9)", "middle", "700")}

    <!-- nav tabs -->
    <rect x="0" y="1790" width="${W}" height="130" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
    ${emoji("🗺️", 162, 1840, 44)}
    ${text("Mappa", 162, 1884, 22, "#A78BFA", "middle", "800")}
    ${emoji("🧠", 378, 1840, 44)}
    ${text("Abilità", 378, 1884, 22, "rgba(255,255,255,0.4)", "middle", "600")}
    ${emoji("👨‍👩‍👧", 594, 1840, 44)}
    ${text("Famiglia", 594, 1884, 22, "rgba(255,255,255,0.4)", "middle", "600")}
    ${emoji("✨", 810, 1840, 44)}
    ${text("Premi", 810, 1884, 22, "rgba(255,255,255,0.4)", "middle", "600")}
    <rect x="60" y="1790" width="200" height="4" rx="2" fill="#A78BFA"/>
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-map.png');
  console.log('✅ screen-map.png');
}

// ── SCREEN 2: VISUAL CHALLENGE (3-4 anni) ─────────────────────────────────────
async function screenChallenge() {
  const content = `
    <!-- top bar -->
    <rect x="40" y="60" width="140" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${text("← Esci", 110, 96, 28, "white", "middle", "700")}
    <rect x="200" y="60" width="72" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${emoji("🔊", 236, 96, 36)}

    <!-- progress bar -->
    <rect x="40" y="160" width="${W-80}" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
    <rect x="40" y="160" width="${(W-80)*0.4}" height="12" rx="6" fill="#22C55E"/>
    ${text("2 / 5", 540, 194, 26, "rgba(255,255,255,0.5)")}

    <!-- challenge card -->
    ${card(40, 230, W-80, 220, "rgba(255,255,255,0.1)", 36)}
    ${emoji("🐿️", 180, 340, 80)}
    ${text("Quante 🍎?", 560, 320, 48, "white", "middle", "bold", FF)}
    ${emoji("🍎🍎🍎", 540, 390, 56)}

    <!-- companion -->
    ${emoji("🐉", 90, 560, 100)}
    ${card(180, 520, 580, 90, "rgba(255,107,107,0.15)", 20)}
    ${text("Conta bene! Ce la fai!", 470, 565, 30, "rgba(255,255,255,0.85)", "middle", "700")}

    <!-- answer buttons -->
    <rect x="40" y="660" width="480" height="340" rx="32" fill="${"#FF525222"}" stroke="#FF5252" stroke-width="3"/>
    ${emoji("1️⃣", 280, 840, 130)}

    <rect x="560" y="660" width="480" height="340" rx="32" fill="${"#26C6DA22"}" stroke="#26C6DA" stroke-width="3"/>
    ${emoji("2️⃣", 800, 840, 130)}

    <rect x="40" y="1030" width="480" height="340" rx="32" fill="${"#66BB6A22"}" stroke="#66BB6A" stroke-width="3"/>
    ${emoji("3️⃣", 280, 1210, 130)}

    <rect x="560" y="1030" width="480" height="340" rx="32" fill="${"#FFA72622"}" stroke="#FFA726" stroke-width="3"/>
    ${emoji("4️⃣", 800, 1210, 130)}

    <!-- streak -->
    ${card(360, 1420, 360, 72, "rgba(255,165,0,0.2)", 36)}
    ${emoji("🔥", 430, 1456, 34)}
    ${text("3 di fila!", 560, 1456, 30, "#FFA500", "middle", "800")}
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-challenge-visual.png');
  console.log('✅ screen-challenge-visual.png');
}

// ── SCREEN 3: MC CHALLENGE (6-7 anni) ─────────────────────────────────────────
async function screenChallengeMC() {
  const content = `
    <!-- top bar -->
    <rect x="40" y="60" width="140" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${text("← Esci", 110, 96, 28, "white", "middle", "700")}
    <rect x="200" y="60" width="72" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${emoji("🔊", 236, 96, 36)}

    <!-- progress -->
    <rect x="40" y="160" width="${W-80}" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
    <rect x="40" y="160" width="${(W-80)*0.6}" height="12" rx="6" fill="#22C55E"/>

    <!-- challenge card -->
    ${card(40, 210, W-80, 300, "rgba(255,255,255,0.10)", 32)}
    ${emoji("🌋", 540, 280, 70)}
    ${text("Un vulcano erutta 3 volte", 540, 370, 36, "white", "middle", "700", FF)}
    ${text("al mattino e 2 al pomeriggio.", 540, 418, 36, "white", "middle", "700", FF)}
    ${text("Quante eruzioni in tutto?", 540, 466, 36, "white", "middle", "700", FF)}

    <!-- companion -->
    ${emoji("🦊", 90, 570, 90)}
    ${card(180, 534, 600, 80, "rgba(52,211,153,0.15)", 20)}
    ${text("Pensa bene! Conta insieme!", 480, 574, 28, "rgba(255,255,255,0.85)", "middle", "700")}

    <!-- answer buttons -->
    <rect x="40" y="670" width="480" height="140" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="2.5"/>
    ${text("3", 280, 740, 52, "white", "middle", "700")}

    <rect x="560" y="670" width="480" height="140" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="2.5"/>
    ${text("4", 800, 740, 52, "white", "middle", "700")}

    <rect x="40" y="840" width="480" height="140" rx="22" fill="rgba(34,197,94,0.3)" stroke="#22C55E" stroke-width="2.5"/>
    ${text("5", 280, 910, 52, "white", "middle", "800")}
    <text x="470" y="860" font-size="32" fill="#22C55E" text-anchor="middle" dominant-baseline="central">✓</text>

    <rect x="560" y="840" width="480" height="140" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="2.5"/>
    ${text("6", 800, 910, 52, "white", "middle", "700")}

    <!-- feedback sheet -->
    <rect x="0" y="1100" width="${W}" height="820" rx="0" fill="rgba(20,83,45,0.97)" stroke="#22C55E" stroke-width="3"/>
    <rect x="0" y="1100" width="${W}" height="3" fill="#22C55E"/>
    ${emoji("🎉", 90, 1190, 70)}
    ${text("Perfetto!", 540, 1190, 54, "#4ade80", "middle", "bold", FF)}
    ${text("Bravo! 3 + 2 = 5 eruzioni!", 540, 1260, 36, "rgba(255,255,255,0.85)", "middle", "700")}
    ${emoji("🦊", 940, 1190, 70)}

    <rect x="60" y="1340" width="${W-120}" height="140" rx="50" fill="#22C55E"/>
    ${text("Avanti →", 540, 1410, 48, "white", "middle", "bold", FF)}

    ${card(60, 1520, W-120, 120, "rgba(255,255,255,0.08)", 24)}
    ${emoji("⭐⭐", 200, 1580, 44)}
    ${text("+2 stelle guadagnate!", 540, 1580, 32, "#FFD700", "middle", "800")}
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-challenge-mc.png');
  console.log('✅ screen-challenge-mc.png');
}

// ── SCREEN 4: LETTER TRACING ───────────────────────────────────────────────────
async function screenLetterTrace() {
  const content = `
    <!-- light bg for young kids -->
    <rect width="${W}" height="${H}" fill="url(#youngG)"/>
    <defs>
      <linearGradient id="youngG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#FFF8EC"/>
        <stop offset="100%" stop-color="#F0EAFF"/>
      </linearGradient>
    </defs>

    <!-- top bar -->
    <rect x="40" y="60" width="160" height="72" rx="18" fill="rgba(0,0,0,0.07)"/>
    ${text("← Esci", 120, 96, 28, "#444", "middle", "700")}

    <!-- letter card -->
    <rect x="40" y="180" width="${W-80}" height="280" rx="36" fill="white" stroke="rgba(0,0,0,0.06)" stroke-width="2"/>
    ${text("✏️ TRACCIA LA LETTERA", 540, 248, 26, "#888", "middle", "800")}
    ${text("A", 540, 370, 160, "#764ba2", "middle", "bold", FF)}

    <!-- word label -->
    ${emoji("🍊", 440, 500, 52)}
    ${text("Arancia", 560, 500, 36, "#444", "middle", "700")}

    <!-- tracer canvas -->
    <rect x="130" y="560" width="820" height="820" rx="40" fill="white" stroke="rgba(118,75,162,0.2)" stroke-width="3"/>
    <!-- guide letter A (faint) -->
    <path d="M 250 1260 L 540 620 L 830 1260 M 370 1000 L 710 1000" stroke="#764ba222" stroke-width="18" fill="none" stroke-linecap="round"/>
    <!-- start dot -->
    <circle cx="250" cy="1260" r="22" fill="#22C55E" opacity="0.9"/>
    ${text("Inizia qui!", 250, 1318, 24, "#22C55E", "middle", "700")}
    <!-- user trace partial -->
    <path d="M 250 1260 L 290 1190 L 360 1060 L 430 930 L 490 820 L 530 720" stroke="#7C3AED" stroke-width="14" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>
    <!-- direction arrows -->
    ${emoji("↑", 540, 700, 44)}

    <!-- companion -->
    ${emoji("🦄", 90, 1468, 90)}
    <rect x="180" y="1432" width="700" height="88" rx="24" fill="rgba(192,132,252,0.15)" stroke="rgba(192,132,252,0.3)" stroke-width="1.5"/>
    ${text("Bravissimo! Continua così! ✨", 530, 1476, 30, "#7c3aed", "middle", "700")}

    <!-- retry button -->
    <rect x="360" y="1560" width="360" height="88" rx="44" fill="rgba(118,75,162,0.12)" stroke="rgba(118,75,162,0.3)" stroke-width="2"/>
    ${text("🔄 Riprova", 540, 1604, 32, "#764ba2", "middle", "800")}
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-letter-trace.png');
  console.log('✅ screen-letter-trace.png');
}

// ── SCREEN 5: LABORATORIO LOGICO (Pixel) ──────────────────────────────────────
async function screenLaboratorio() {
  const content = `
    <!-- top bar -->
    <rect x="40" y="60" width="140" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${text("← Esci", 110, 96, 28, "white", "middle", "700")}
    <rect x="200" y="60" width="72" height="72" rx="18" fill="rgba(255,255,255,0.1)"/>
    ${emoji("🔊", 236, 96, 36)}

    <!-- progress -->
    <rect x="40" y="160" width="${W-80}" height="12" rx="6" fill="rgba(255,255,255,0.1)"/>
    <rect x="40" y="160" width="${(W-80)*0.35}" height="12" rx="6" fill="#06B6D4"/>

    <!-- challenge card -->
    ${card(40, 210, W-80, 330, "rgba(255,255,255,0.10)", 32)}
    ${emoji("🚦", 540, 290, 72)}
    ${text("SE il semaforo è verde, vai avanti.", 540, 382, 34, "white", "middle", "700", FF)}
    ${text("Il semaforo è rosso! 🔴", 540, 432, 34, "white", "middle", "700", FF)}
    ${text("Devi andare avanti?", 540, 482, 34, "#06B6D4", "middle", "800", FF)}

    <!-- condition pill -->
    <rect x="120" y="570" width="840" height="70" rx="35" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.4)" stroke-width="1.5"/>
    ${emoji("🔍", 200, 605, 32)}
    ${text("Il semaforo è verde?", 540, 605, 30, "#06B6D4", "middle", "800")}

    <!-- Pixel companion -->
    ${emoji("🤖", 90, 730, 90)}
    ${card(180, 698, 640, 80, "rgba(6,182,212,0.15)", 20)}
    ${text("Analizza il problema! BEEP 🤖", 500, 738, 28, "rgba(255,255,255,0.85)", "middle", "700")}

    <!-- SE VERO button -->
    <rect x="40" y="820" width="${W-80}" height="200" rx="28" fill="rgba(34,197,94,0.15)" stroke="rgba(34,197,94,0.5)" stroke-width="3"/>
    ${text("✅  SE VERO", 540, 920, 52, "#4ade80", "middle", "900", FF)}

    <!-- SE FALSO button (correct — highlighted) -->
    <rect x="40" y="1050" width="${W-80}" height="200" rx="28" fill="rgba(239,68,68,0.3)" stroke="#EF4444" stroke-width="3"/>
    ${text("❌  SE FALSO", 540, 1150, 52, "#F87171", "middle", "900", FF)}

    <!-- Laboratorio badge -->
    ${card(300, 1300, 480, 72, "rgba(6,182,212,0.15)", 36)}
    ${emoji("🔬", 380, 1336, 34)}
    ${text("Laboratorio Logico", 540, 1336, 28, "#06B6D4", "middle", "800")}

    <!-- coding skill -->
    ${card(60, 1410, 300, 80, "rgba(6,182,212,0.12)", 20)}
    ${emoji("💻", 120, 1450, 34)}
    ${text("Coding", 210, 1450, 28, "#06B6D4", "middle", "700")}
    <rect x="250" y="1436" width="96" height="20" rx="10" fill="#06B6D422"/>
    <rect x="250" y="1436" width="72" height="20" rx="10" fill="#06B6D4"/>
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-laboratorio.png');
  console.log('✅ screen-laboratorio.png');
}

// ── SCREEN 6: WORLD END REWARD ────────────────────────────────────────────────
async function screenReward() {
  const content = `
    <!-- radial glow -->
    <radialGradient id="glow" cx="50%" cy="40%" r="50%">
      <stop offset="0%" stop-color="#22C55E44"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
    <rect width="${W}" height="${H}" fill="url(#glow)"/>

    <!-- particles -->
    ${emoji("✨", 120, 300, 48)}
    ${emoji("⭐", 900, 250, 42)}
    ${emoji("🎉", 200, 680, 42)}
    ${emoji("✨", 880, 700, 38)}
    ${emoji("⭐", 100, 900, 36)}
    ${emoji("🎊", 950, 880, 44)}

    <!-- reward badge -->
    <circle cx="540" cy="420" r="190" fill="rgba(255,215,0,0.12)" stroke="rgba(255,215,0,0.4)" stroke-width="4"/>
    <circle cx="540" cy="420" r="148" fill="rgba(255,215,0,0.18)"/>
    ${emoji("🍃", 540, 420, 140)}

    <!-- title -->
    ${text("Mondo Completato!", 540, 680, 58, "#FFD95A", "middle", "bold", FF)}
    ${emoji("🏆", 540, 770, 60)}

    <!-- story outro -->
    ${card(60, 830, W-120, 220, "rgba(255,255,255,0.07)", 28)}
    ${text("Le parole sono tornate nei libri!", 540, 896, 34, "rgba(255,255,255,0.9)", "middle", "700")}
    ${text("La Civetta Saggia ti nomina", 540, 942, 32, "rgba(255,255,255,0.7)", "middle", "600")}
    ${text("Guardiano delle Parole. 📖", 540, 988, 32, "rgba(255,255,255,0.7)", "middle", "600")}

    <!-- companion message -->
    ${emoji("🦊", 100, 1116, 72)}
    ${card(180, 1084, 700, 80, "rgba(52,211,153,0.15)", 20)}
    ${text("Missione riuscita! Sei un genio!", 530, 1124, 28, "rgba(255,255,255,0.85)", "middle", "700")}

    <!-- reward item -->
    ${card(160, 1210, 760, 220, "rgba(255,215,0,0.12)", 28)}
    <rect x="160" y="1210" width="760" height="220" rx="28" fill="none" stroke="rgba(255,215,0,0.45)" stroke-width="2"/>
    ${emoji("📖", 540, 1284, 70)}
    ${text("Libro della Saggezza", 540, 1366, 36, "#FFD95A", "middle", "800", FF)}

    <!-- stars earned -->
    ${card(200, 1470, 680, 100, "rgba(255,215,0,0.1)", 24)}
    ${text("⭐ ⭐ ⭐  +3 stelle bonus!", 540, 1520, 38, "#FFD700", "middle", "800")}

    <!-- CTA button -->
    <rect x="60" y="1610" width="${W-120}" height="140" rx="50" fill="url(#greenG)"/>
    ${text("Torna alla Mappa 🗺️", 540, 1680, 44, "white", "middle", "bold", FF)}

    <!-- XP bar -->
    ${card(60, 1790, W-120, 72, "rgba(255,255,255,0.05)", 16)}
    ${text("Livello 5 — 85 / 120 XP", 180, 1826, 26, "rgba(255,255,255,0.5)", "start", "600")}
    <rect x="60" y="1810" width="${(W-120)*0.71}" height="72" rx="16" fill="url(#goldG)" opacity="0.55"/>
  `;
  await sharp(Buffer.from(svg(content))).png().toFile('public/screenshots/screen-reward.png');
  console.log('✅ screen-reward.png');
}

// ── FEATURE GRAPHIC 1024×500 ──────────────────────────────────────────────────
async function featureGraphic() {
  const FW = 1024, FH = 500;
  const content = `<svg xmlns="http://www.w3.org/2000/svg" width="${FW}" height="${FH}" viewBox="0 0 ${FW} ${FH}">
  <defs>
    <linearGradient id="fgBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1a1a2e"/>
      <stop offset="60%" stop-color="#302b63"/>
      <stop offset="100%" stop-color="#1a1a2e"/>
    </linearGradient>
    <radialGradient id="fgGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#6C63FF44"/>
      <stop offset="100%" stop-color="transparent"/>
    </radialGradient>
  </defs>
  <rect width="${FW}" height="${FH}" fill="url(#fgBg)"/>
  <rect width="${FW}" height="${FH}" fill="url(#fgGlow)"/>

  <!-- companions row -->
  <text x="80"  y="210" font-size="90" text-anchor="middle" dominant-baseline="central">🐉</text>
  <text x="196" y="210" font-size="90" text-anchor="middle" dominant-baseline="central">🦄</text>
  <text x="312" y="210" font-size="90" text-anchor="middle" dominant-baseline="central">🐬</text>
  <text x="428" y="210" font-size="90" text-anchor="middle" dominant-baseline="central">🦊</text>
  <text x="544" y="210" font-size="90" text-anchor="middle" dominant-baseline="central">🤖</text>

  <!-- title -->
  <text x="780" y="140" font-size="80" fill="white" text-anchor="middle" dominant-baseline="central" font-family="Fredoka One,system-ui,sans-serif" font-weight="bold">MondoMago</text>
  <text x="780" y="230" font-size="32" fill="rgba(255,255,255,0.7)" text-anchor="middle" dominant-baseline="central" font-family="Nunito,system-ui,sans-serif">Giochi educativi per bambini</text>
  <text x="780" y="286" font-size="30" fill="rgba(255,255,255,0.55)" text-anchor="middle" dominant-baseline="central" font-family="Nunito,system-ui,sans-serif">3-8 anni · Offline · Senza pubblicità</text>

  <!-- world emojis bottom -->
  <text x="60"  y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🌲</text>
  <text x="150" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🏰</text>
  <text x="240" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🌊</text>
  <text x="330" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🌌</text>
  <text x="420" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🌋</text>
  <text x="510" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">📚</text>
  <text x="600" y="420" font-size="56" text-anchor="middle" dominant-baseline="central">🔬</text>

  <!-- badges -->
  <rect x="690" y="370" width="240" height="56" rx="28" fill="rgba(34,197,94,0.2)" stroke="rgba(34,197,94,0.5)" stroke-width="1.5"/>
  <text x="810" y="400" font-size="26" fill="#4ade80" text-anchor="middle" dominant-baseline="central" font-family="Nunito,sans-serif" font-weight="800">✅ 100% Offline</text>

  <rect x="948" y="370" width="64" height="56" rx="28" fill="rgba(255,215,0,0.2)" stroke="rgba(255,215,0,0.5)" stroke-width="1.5"/>
  <text x="980" y="400" font-size="32" text-anchor="middle" dominant-baseline="central">⭐</text>
</svg>`;
  await sharp(Buffer.from(content)).png().toFile('public/screenshots/feature-graphic.png');
  console.log('✅ feature-graphic.png (1024×500)');
}

// Run all
Promise.all([
  screenMap(),
  screenChallenge(),
  screenChallengeMC(),
  screenLetterTrace(),
  screenLaboratorio(),
  screenReward(),
  featureGraphic(),
]).then(() => console.log('\nDone! 7 files in public/screenshots/'));
