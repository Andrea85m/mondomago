// ─────────────────────────────────────────────────────────────────────────────
// "Sigillo di Stelle" — i token del design system.
//
// Erano dichiarati dentro src/Magistella.jsx. Stanno qui perché da adesso li
// usano anche schermate che vivono in file propri (PuzzleMagico), e due copie
// degli stessi colori divergono al primo ritocco.
// ─────────────────────────────────────────────────────────────────────────────

export const FF         = "'Fredoka One', cursive";
export const FF_DISPLAY = "'Grandstander', 'Fredoka One', cursive";
export const FF_MONO    = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
// Cifre che legge il bambino. DM Mono ha lo zero BARRATO come glifo di default
// (non è una alternate: font-feature-settings "zero" 0 non lo disattiva, provato),
// quindi in un'app che insegna a riconoscere i numeri a 3-8 anni ogni "0" arrivava
// a schermo come "Ø". FF_MONO resta dov'è il sapore-coding e non ci sono cifre da
// leggere: etichette maiuscolette, tipo del companion, e tutta l'area genitori.
export const FF_NUM     = "'Grandstander', 'Nunito', system-ui, sans-serif";

export const SG_GOLD  = "#FFC24B";   // magia / accento primario
export const SG_RUNE  = "#6DE0C6";   // logica / codice
export const SG_PARCH = "#F6ECD4";   // testo su superfici scure
export const SG_INK   = "#1B1035";   // testo scuro su oro
export const SG_BG    = "radial-gradient(120% 80% at 18% 10%, rgba(124,58,237,.26) 0%, transparent 46%), radial-gradient(95% 72% at 86% 6%, rgba(255,194,75,.11) 0%, transparent 42%), radial-gradient(85% 62% at 78% 96%, rgba(109,224,198,.10) 0%, transparent 46%), radial-gradient(125% 85% at 50% -8%, #2D1B54 0%, #1B1035 52%, #140B29 100%)";
export const SG_CARD  = "rgba(45,27,84,.55)";              // superficie card indaco caldo
export const SG_BR    = "1px solid rgba(255,194,75,.14)";  // filo d'oro sottile
export const SG_GOLD_GRAD = "linear-gradient(135deg,#FFC24B,#F6A93B)"; // pulsanti primari
export const SG_TILE  = "rgba(20,11,41,.5)";               // riquadri interni più scuri

// ── Contrasto (WCAG 2.1) ──────────────────────────────────────────────────────
// Il colore del testo si sceglie coi numeri, non a occhio: 4.5:1 è la soglia AA
// per il testo normale. Servono #RRGGBB.

function luminanza(hex) {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Rapporto di contrasto fra due colori, da 1 a 21. */
export function contrasto(a, b) {
  const [x, y] = [luminanza(a), luminanza(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

function scurisci(hex, t) {
  return "#" + [1, 3, 5].map(i => Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - t))
    .toString(16).padStart(2, "0")).join("");
}

/**
 * Etichetta piena nel colore dato, sempre leggibile: testo inchiostro se basta,
 * altrimenti testo bianco sul colore scurito quanto serve (non di più).
 */
export function etichettaLeggibile(colore, minimo = 4.5) {
  if (contrasto(colore, SG_INK) >= minimo) return { sfondo: colore, testo: SG_INK };
  let t = 0, sfondo = colore;
  while (contrasto(sfondo, "#FFFFFF") < minimo && t < 0.9) { t += 0.02; sfondo = scurisci(colore, t); }
  return { sfondo, testo: "#FFFFFF" };
}
