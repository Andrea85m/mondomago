/**
 * icons.jsx — sistema di icone custom "Sigillo di Stelle" per MondoMago.
 *
 * Due famiglie:
 *  • WorldIcon  → emblema-sigillo di ciascun mondo (silhouette pergamena + accento colore-mondo)
 *  • Icon       → glyph UI-chrome (lock, star, check, flame, trophy, bulb, frecce…)
 *
 * Tutte SVG inline viewBox 24×24, si scalano con `size` e prendono i colori dai token.
 * Sostituiscono le emoji di sistema (rese diverse su ogni OS) con un set coerente.
 */

const PARCH = "#F6ECD4"; // pergamena — silhouette base
const GOLD  = "#FFC24B"; // oro — magia
const RUNE  = "#6DE0C6"; // verde-runa — logica

// ─── EMBLEMI-MONDO ──────────────────────────────────────────────────────────
// Ogni funzione riceve il colore-identità del mondo (accento) e disegna
// la silhouette in pergamena + dettaglio nel colore del mondo.
const WORLD_EMBLEM = {
  foresta: (c) => (<>
    <rect x="10.8" y="16.5" width="2.4" height="4.5" rx="1" fill={PARCH} />
    <path d="M12 2.6 L7.6 9 H16.4 Z" fill={PARCH} />
    <path d="M12 6.4 L6.3 13.4 H17.7 Z" fill={PARCH} />
    <path d="M12 10.4 L5 18 H19 Z" fill={PARCH} />
    <circle cx="12" cy="3" r="1.5" fill={c} />
  </>),
  castello: (c) => (<>
    <rect x="5" y="12" width="14" height="9" rx="1" fill={PARCH} />
    <rect x="4.6" y="10" width="2.6" height="2.4" fill={PARCH} />
    <rect x="8.6" y="10" width="2.6" height="2.4" fill={PARCH} />
    <rect x="12.8" y="10" width="2.6" height="2.4" fill={PARCH} />
    <rect x="16.8" y="10" width="2.6" height="2.4" fill={PARCH} />
    <rect x="9.6" y="6" width="4.8" height="6" rx="1" fill={PARCH} />
    <rect x="9.3" y="4.6" width="1.6" height="1.8" fill={PARCH} />
    <rect x="13.1" y="4.6" width="1.6" height="1.8" fill={PARCH} />
    <path d="M12 15 q3 0 3 6 H9 q0-6 3-6Z" fill={c} />
    <path d="M12 6 L12 2 L16.5 3.2 L12 4.6Z" fill={c} />
  </>),
  oceano: (c) => (<>
    <path d="M3 15 q2.4 -4 4.8 0 q2.4 4 4.8 0 q2.4 -4 4.8 0 q1.2 2 2.4 1.4 L19.8 21 H3 Z" fill={PARCH} />
    <path d="M12 3 C12 3 8 7.5 8 10.4 a4 4 0 0 0 8 0 C16 7.5 12 3 12 3Z" fill={c} />
    <circle cx="10.6" cy="10" r="1.1" fill={PARCH} opacity=".85" />
  </>),
  mercato: (c) => (<>
    <rect x="6" y="12" width="12" height="9" rx="1" fill={PARCH} />
    <path d="M4 12 L5.6 6.5 H18.4 L20 12 Z" fill={PARCH} />
    <path d="M4 12 h3.2 l.8 2.6 l-2-.0 Z" fill={c} />
    <path d="M10.4 12 h3.2 l.4 2.6 h-4 Z" fill={c} />
    <path d="M16.8 12 H20 l-1.2 2.6 l-1.6 0 Z" fill={c} />
    <rect x="9" y="15" width="6" height="6" rx="1" fill={c} opacity=".55" />
  </>),
  galassia: (c) => (<>
    <circle cx="11" cy="12" r="5.4" fill={PARCH} />
    <ellipse cx="11" cy="12" rx="9" ry="3.2" fill="none" stroke={c} strokeWidth="1.8" transform="rotate(-20 11 12)" />
    <path d="M18.5 4 l.7 1.8 l1.8 .7 l-1.8 .7 l-.7 1.8 l-.7 -1.8 l-1.8 -.7 l1.8 -.7 Z" fill={c} />
  </>),
  vulcano: (c) => (<>
    <path d="M4 20 L9 8 h6 l5 12 Z" fill={PARCH} />
    <path d="M9 8 h6 l1.4 3.4 q-4.4 2-8.8 0 Z" fill={c} />
    <circle cx="12" cy="6.4" r="1.5" fill={c} />
    <circle cx="9.6" cy="4.2" r="1.1" fill={c} opacity=".8" />
    <circle cx="14.3" cy="4" r="1.2" fill={c} opacity=".85" />
  </>),
  biblioteca: (c) => (<>
    <path d="M12 6.5 C10 5 6.5 5 4.5 6 V19 C6.5 18 10 18 12 19.4 Z" fill={PARCH} />
    <path d="M12 6.5 C14 5 17.5 5 19.5 6 V19 C17.5 18 14 18 12 19.4 Z" fill={PARCH} />
    <path d="M12 6.5 V19.4" stroke={c} strokeWidth="1.4" />
    <path d="M6.5 9 h3.4 M6.5 11.4 h3.4 M14.1 9 h3.4 M14.1 11.4 h3.4" stroke={c} strokeWidth="1" opacity=".7" />
  </>),
  laboratorio: (c) => (<>
    <path d="M10 3.5 h4 v5 l4 8.2 a2 2 0 0 1 -1.8 3 H7.8 a2 2 0 0 1 -1.8 -3 l4 -8.2 Z" fill={PARCH} />
    <path d="M8.3 14 h7.4 l1.5 3.7 a2 2 0 0 1 -1.8 3 H8.6 a2 2 0 0 1 -1.8 -3 Z" fill={c} opacity=".6" />
    <circle cx="11" cy="17" r="1.1" fill={PARCH} />
    <circle cx="13.6" cy="18.4" r=".9" fill={PARCH} />
    <rect x="9.2" y="2.6" width="5.6" height="1.8" rx=".9" fill={PARCH} />
  </>),
};

export function WorldIcon({ id, color = GOLD, size = 24, style }) {
  const draw = WORLD_EMBLEM[id];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      {draw(color)}
    </svg>
  );
}

// ─── UI-CHROME GLYPH ────────────────────────────────────────────────────────
const GLYPH = {
  lock: (c) => (<>
    <rect x="5" y="10.5" width="14" height="10" rx="2.6" fill={PARCH} />
    <path d="M8 10.5 V8 a4 4 0 0 1 8 0 v2.5" fill="none" stroke={PARCH} strokeWidth="2.2" />
    <circle cx="12" cy="15" r="1.7" fill={c} />
    <rect x="11.2" y="15" width="1.6" height="3" rx=".8" fill={c} />
  </>),
  star: (c) => (
    <path d="M12 2.6 l2.9 5.9 6.5 .95 -4.7 4.6 1.1 6.5 -5.8 -3.05 -5.8 3.05 1.1 -6.5 -4.7 -4.6 6.5 -.95Z" fill={c} />
  ),
  check: (c) => (<>
    <circle cx="12" cy="12" r="9.4" fill={c} />
    <path d="M7.5 12.4 l3 3 6-6.4" fill="none" stroke="#0F2E28" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  coin: (c) => (<>
    <circle cx="12" cy="12" r="8.5" fill={c} />
    <circle cx="12" cy="12" r="8.5" fill="none" stroke={PARCH} strokeWidth="1.2" opacity=".5" />
    <path d="M12 7.5 v9 M9.6 9.5 h3.2 a1.9 1.9 0 0 1 0 3.8 H10 h3.2 a1.9 1.9 0 0 1 0 3.8 H9.6" fill="none" stroke="#7a5a10" strokeWidth="1.5" strokeLinecap="round" />
  </>),
  flame: (c) => (<>
    <path d="M12 2.5 C13 6 17 7.5 17 12.5 A5 5 0 0 1 7 12.5 C7 10 8.5 9 9 7.5 C10.5 9.5 10.8 6 12 2.5Z" fill={c} />
    <path d="M12 20 C10 19 9.5 16.5 11 14.5 C11.4 16 13 16.4 13 18 A1.6 1.6 0 0 1 12 20Z" fill={PARCH} />
  </>),
  trophy: (c) => (<>
    <path d="M7 4 h10 v4 a5 5 0 0 1 -10 0Z" fill={c} />
    <path d="M7 5 H4.5 a2.5 2.5 0 0 0 2.8 4" fill="none" stroke={c} strokeWidth="1.6" />
    <path d="M17 5 H19.5 a2.5 2.5 0 0 1 -2.8 4" fill="none" stroke={c} strokeWidth="1.6" />
    <rect x="11" y="12.5" width="2" height="3.5" fill={c} />
    <rect x="8" y="16" width="8" height="2.4" rx="1" fill={PARCH} />
  </>),
  bulb: () => (<>
    <circle cx="12" cy="9.5" r="6" fill={GOLD} />
    <rect x="9.4" y="15" width="5.2" height="2" rx="1" fill={PARCH} />
    <rect x="10" y="17.4" width="4" height="2" rx="1" fill={PARCH} />
    <path d="M12 6.5 a3 3 0 0 0 -3 3" fill="none" stroke={PARCH} strokeWidth="1.4" opacity=".7" />
  </>),
  arrowR: () => (
    <path d="M5 12 h12 M13 7 l5 5 -5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  arrowL: () => (
    <path d="M19 12 H7 M11 7 l-5 5 5 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  ),
  target: (c) => (<>
    <circle cx="12" cy="12" r="9" fill="none" stroke={c} strokeWidth="2" />
    <circle cx="12" cy="12" r="5" fill="none" stroke={c} strokeWidth="2" opacity=".7" />
    <circle cx="12" cy="12" r="1.8" fill={c} />
  </>),
  // ── 2ª tornata: chrome/header/decorative ──
  map: (c) => (<>
    <path d="M3.5 6.5 L9 4.5 L15 6.5 L20.5 4.5 V17.5 L15 19.5 L9 17.5 L3.5 19.5 Z" fill={PARCH} />
    <path d="M9 4.7 V17.4 M15 6.6 V19.3" stroke="#241546" strokeWidth=".9" opacity=".3" />
    <path d="M6 8.5 q2.4 2 1 4.4 M7.2 15 h3.6 q1.8 0 2.8 -1.8" fill="none" stroke={c} strokeWidth="1.3" strokeDasharray="1.6 2" strokeLinecap="round" />
    <path d="M16 8.6 l2.6 2.6 M18.6 8.6 l-2.6 2.6" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
  </>),
  wave: (c) => (<>
    <path d="M8.6 12.4 V6.4 a1.3 1.3 0 0 1 2.6 0 V10.8 M11.2 10.8 V5.2 a1.3 1.3 0 0 1 2.6 0 V10.8 M13.8 10.8 V6 a1.3 1.3 0 0 1 2.6 0 V11.8 M16.4 11.8 V8.2 a1.3 1.3 0 0 1 2.4 0 v5 a6.2 6.2 0 0 1 -6.2 6.2 a5.6 5.6 0 0 1 -4.3 -2 L5 15 a1.4 1.4 0 0 1 2 -2 l1.6 1.6 Z" fill={PARCH} />
    <path d="M6 4.6 l-1.5 -1.1 M8.8 3.4 l-.5 -1.7 M11.9 3.7 l.5 -1.7" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
  </>),
  sun: (c) => (<>
    <circle cx="12" cy="12" r="5" fill={c} />
    {[0,45,90,135,180,225,270,315].map(a => { const r = a*Math.PI/180; return (
      <line key={a} x1={12+Math.cos(r)*7.4} y1={12+Math.sin(r)*7.4} x2={12+Math.cos(r)*10} y2={12+Math.sin(r)*10} stroke={c} strokeWidth="2" strokeLinecap="round" />
    ); })}
  </>),
  cloudSun: (c) => (<>
    <circle cx="9" cy="8.6" r="3.4" fill={c} />
    {[205,240,275,310].map((a,i) => { const r = a*Math.PI/180; return (
      <line key={i} x1={9+Math.cos(r)*4.6} y1={8.6+Math.sin(r)*4.6} x2={9+Math.cos(r)*6.3} y2={8.6+Math.sin(r)*6.3} stroke={c} strokeWidth="1.6" strokeLinecap="round" />
    ); })}
    <path d="M7.5 18.5 a3.1 3.1 0 0 1 .3 -6.2 a4 4 0 0 1 7.6 1 a2.9 2.9 0 0 1 -.4 5.2 Z" fill={PARCH} />
  </>),
  moon: (c) => (<>
    <path d="M15.6 3.6 a8.5 8.5 0 1 0 4.8 15.1 A7 7 0 0 1 15.6 3.6 Z" fill={PARCH} />
    <path d="M6.4 5.6 l.55 1.7 1.75 .55 -1.75 .55 -.55 1.7 -.55 -1.7 -1.75 -.55 1.75 -.55 Z" fill={c} />
  </>),
  nightStars: (c) => (<>
    <path d="M13 3.8 l1.7 3.5 3.9 .55 -2.8 2.7 .66 3.85 -3.46 -1.82 -3.46 1.82 .66 -3.85 -2.8 -2.7 3.9 -.55 Z" fill={c} />
    <path d="M6.2 13 l.7 1.5 1.6 .23 -1.15 1.1 .27 1.6 -1.42 -.75 -1.42 .75 .27 -1.6 -1.15 -1.1 1.6 -.23 Z" fill={PARCH} />
  </>),
  bolt: (c) => (
    <path d="M13.6 2.5 L5 13.6 h5 l-1.6 7.9 L19 10 h-5.3 Z" fill={c} />
  ),
  school: (c) => (<>
    <rect x="5" y="11" width="14" height="10" fill={PARCH} />
    <path d="M12 3.4 L3.2 9.2 h17.6 Z" fill={PARCH} />
    <rect x="10.4" y="14.6" width="3.2" height="6.4" fill={c} />
    <path d="M12 4.6 V2.6 h3 v1.8" fill="none" stroke={c} strokeWidth="1.2" strokeLinejoin="round" />
    <circle cx="12" cy="8.6" r="1.1" fill={c} />
  </>),
  share: (c) => (<>
    <path d="M6 10.5 h2.4 V19 h7.2 V10.5 H18 V21 H6 Z" fill={PARCH} />
    <path d="M12 3 l3.6 3.8 M12 3 l-3.6 3.8 M12 3 V14" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  chart: (c) => (<>
    <path d="M4.5 20 H19.5" stroke={PARCH} strokeWidth="2" strokeLinecap="round" />
    <rect x="6" y="12" width="3.2" height="6" rx="1" fill={c} />
    <rect x="10.4" y="8" width="3.2" height="10" rx="1" fill={PARCH} />
    <rect x="14.8" y="5" width="3.2" height="13" rx="1" fill={c} />
  </>),
  music: (c) => (<>
    <path d="M9 17 V6 l8.4 -2.1 V15" fill="none" stroke={PARCH} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <ellipse cx="6.9" cy="17.1" rx="2.5" ry="1.9" fill={c} transform="rotate(-16 6.9 17.1)" />
    <ellipse cx="15.3" cy="14.9" rx="2.5" ry="1.9" fill={c} transform="rotate(-16 15.3 14.9)" />
  </>),
  sparkles: (c) => (<>
    <path d="M10.5 3 l1.4 4 4 1.4 -4 1.4 -1.4 4 -1.4 -4 -4 -1.4 4 -1.4 Z" fill={c} />
    <path d="M17.4 13 l.8 2.2 2.2 .8 -2.2 .8 -.8 2.2 -.8 -2.2 -2.2 -.8 2.2 -.8 Z" fill={PARCH} />
  </>),
  clock: (c) => (<>
    <circle cx="12" cy="12" r="8.5" fill={PARCH} />
    <path d="M12 7 V12 L15.6 14.1" fill="none" stroke={c} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </>),
  // ── 3ª tornata: micro-chrome rimaste ──
  bookmark: (c) => (<>
    <path d="M6 3.5 h12 a1.5 1.5 0 0 1 1.5 1.5 V20.5 l-7.5 -4.4 L4.5 20.5 V5 a1.5 1.5 0 0 1 1.5 -1.5 Z" fill={PARCH} />
    <path d="M9 8 h6 M9 11 h4" stroke={c} strokeWidth="1.7" strokeLinecap="round" />
  </>),
};

export function Icon({ name, color = GOLD, size = 24, style }) {
  const draw = GLYPH[name];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      {draw(color)}
    </svg>
  );
}

// ─── EMBLEMI-ABILITÀ ────────────────────────────────────────────────────────
// Glyph mono-colore nel colore-abilità (categorie scansionabili nelle stats/dashboard).
const SKILL_EMBLEM = {
  logica: (c) => (<>
    <path d="M8.4 5 h2.2 a1.5 1.5 0 0 1 2.8 0 H16 v2.6 a1.5 1.5 0 0 1 0 2.9 V13 h-2.6 a1.5 1.5 0 0 0 -2.8 0 H8.4 v-2.6 a1.5 1.5 0 0 1 0 -2.9Z" fill={c} />
    <path d="M13 13 v2.6 a1.5 1.5 0 0 0 2.8 0 H18.4 v3.4 H8.4 v-3.4 h2.2 a1.5 1.5 0 0 0 2.4 -2.6Z" fill={c} opacity=".55" />
  </>),
  numeri: (c) => (<>
    <rect x="4.5" y="4.5" width="15" height="15" rx="4" fill="none" stroke={c} strokeWidth="1.8" />
    <circle cx="8.5" cy="8.5" r="1.4" fill={c} /><circle cx="15.5" cy="8.5" r="1.4" fill={c} />
    <circle cx="12" cy="12" r="1.4" fill={c} />
    <circle cx="8.5" cy="15.5" r="1.4" fill={c} /><circle cx="15.5" cy="15.5" r="1.4" fill={c} />
  </>),
  creativita: (c) => (<>
    <path d="M12 4 a8 8 0 1 0 1.6 15.8 c1.4-.3 1-1.9 1.9-2.6 .7-.6 2.3-.1 3-1.3 A8 8 0 0 0 12 4Z" fill="none" stroke={c} strokeWidth="1.7" />
    <circle cx="8.6" cy="10" r="1.3" fill={c} /><circle cx="12" cy="8.2" r="1.3" fill={c} /><circle cx="15.4" cy="10.2" r="1.3" fill={c} />
  </>),
  empatia: (c) => (
    <path d="M12 20 C5 15.2 3 11.4 3 8.4 A4.3 4.3 0 0 1 12 6.2 A4.3 4.3 0 0 1 21 8.4 C21 11.4 19 15.2 12 20Z" fill={c} />
  ),
  parole: (c) => (<>
    <path d="M4 5 h16 a2 2 0 0 1 2 2 v7 a2 2 0 0 1 -2 2 H10.5 l-4.5 3.4 v-3.4 H4 a2 2 0 0 1 -2 -2 V7 a2 2 0 0 1 2 -2Z" fill={c} />
    <path d="M6.5 9 h11 M6.5 12 h7" stroke="#241546" strokeWidth="1.5" strokeLinecap="round" />
  </>),
  coding: (c) => (<>
    <path d="M9 7.5 L4.5 12 L9 16.5 M15 7.5 L19.5 12 L15 16.5" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.4 5.5 L10.6 18.5" stroke={c} strokeWidth="2" strokeLinecap="round" />
  </>),
};

export function SkillIcon({ id, color = GOLD, size = 24, style }) {
  const draw = SKILL_EMBLEM[id];
  if (!draw) return null;
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      {draw(color)}
    </svg>
  );
}

// ─── EMBLEMI-RANGO (badge livello giocatore) ────────────────────────────────
// 8 ranghi in progressione: germoglio → bussola → spade → sfera → cappello-mago
// → scintille → stella raggiante → coppa. Rimpiazzano 🌱🗺️⚔️🔮🧙✨🌟🏆.
const RANK_EMBLEM = [
  (c) => (<> {/* 0 Apprendista — germoglio */}
    <path d="M12 21 V11.5" stroke={PARCH} strokeWidth="2" strokeLinecap="round" />
    <path d="M12 13.5 C8 13.5 6 11 6 8 C10 8 12 10.5 12 13.5 Z" fill={c} />
    <path d="M12 11.5 C12 8.5 14 6 18 6 C18 9 16 11.5 12 11.5 Z" fill={c} opacity=".65" />
  </>),
  (c) => (<> {/* 1 Esploratore — bussola */}
    <circle cx="12" cy="12" r="8.4" fill={PARCH} />
    <path d="M12 6.5 l2.2 5.5 -2.2 5.5 -2.2 -5.5 Z" fill={c} />
    <circle cx="12" cy="12" r="1.2" fill="#241546" />
  </>),
  (c) => (<> {/* 2 Avventuriero — spade incrociate */}
    <path d="M4.5 4.5 L15 15 M4.5 4.5 v3 h3" fill="none" stroke={PARCH} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M19.5 4.5 L9 15 M19.5 4.5 v3 h-3" fill="none" stroke={PARCH} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5.5 16.5 l3.5 3.5 M18.5 16.5 l-3.5 3.5" stroke={c} strokeWidth="2.3" strokeLinecap="round" />
  </>),
  (c) => (<> {/* 3 Stregone — sfera magica */}
    <circle cx="12" cy="9.8" r="6" fill={c} />
    <circle cx="10" cy="7.8" r="1.8" fill={PARCH} opacity=".85" />
    <path d="M6.5 17.5 h11 l-1.8 3 H8.3 Z" fill={PARCH} />
  </>),
  (c) => (<> {/* 4 Mago — cappello a punta */}
    <path d="M12 2.5 L5 17.5 h14 Z" fill={PARCH} />
    <path d="M3.8 17.5 h16.4 v2.4 H3.8 Z" fill={PARCH} />
    <path d="M12 8 l.85 2.1 2.15 .3 -1.6 1.5 .42 2.1 -1.82 -1.05 -1.82 1.05 .42 -2.1 -1.6 -1.5 2.15 -.3 Z" fill={c} />
  </>),
  (c) => (<> {/* 5 Grande Mago — scintille */}
    <path d="M10 3 l1.35 3.9 3.9 1.35 -3.9 1.35 -1.35 3.9 -1.35 -3.9 -3.9 -1.35 3.9 -1.35 Z" fill={c} />
    <path d="M17 12.5 l.9 2.5 2.5 .9 -2.5 .9 -.9 2.5 -.9 -2.5 -2.5 -.9 2.5 -.9 Z" fill={PARCH} />
  </>),
  (c) => (<> {/* 6 Arcimago — stella raggiante */}
    <path d="M12 2 l2.6 6.5 6.9 .5 -5.3 4.4 1.7 6.7 -5.9 -3.7 -5.9 3.7 1.7 -6.7 -5.3 -4.4 6.9 -.5 Z" fill={c} />
    <circle cx="12" cy="11.5" r="1.8" fill={PARCH} opacity=".7" />
  </>),
  (c) => (<> {/* 7 Leggenda — coppa */}
    <path d="M7 4 h10 v4 a5 5 0 0 1 -10 0Z" fill={c} />
    <path d="M7 5 H4.5 a2.5 2.5 0 0 0 2.8 4" fill="none" stroke={c} strokeWidth="1.6" />
    <path d="M17 5 H19.5 a2.5 2.5 0 0 1 -2.8 4" fill="none" stroke={c} strokeWidth="1.6" />
    <rect x="11" y="12.5" width="2" height="3.5" fill={c} />
    <rect x="8" y="16" width="8" height="2.4" rx="1" fill={PARCH} />
  </>),
];

export function RankIcon({ level = 0, color = GOLD, size = 24, style }) {
  const i = Math.max(0, Math.min(RANK_EMBLEM.length - 1, level | 0));
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style}
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      {RANK_EMBLEM[i](color)}
    </svg>
  );
}
