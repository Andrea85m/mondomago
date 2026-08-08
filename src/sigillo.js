// ─────────────────────────────────────────────────────────────────────────────
// "Sigillo di Stelle" — i token del design system.
//
// Erano dichiarati dentro src/MondoMago.jsx. Stanno qui perché da adesso li
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
