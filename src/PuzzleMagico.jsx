// ─────────────────────────────────────────────────────────────────────────────
// PUZZLE MAGICO — la sezione puzzle di Magistella
//
// Cinque giochi, sulla falsariga di "Puzzle Kids — Jigsaw Puzzles"
// (com.rvappstudios.jigsaw.puzzles.kids, 50M+ download, Teacher Approved):
//
//   Animali      ← Animal Puzzles   · animale cartoon a pezzi sagomati, poi verso e foto vera
//   Ombre        ← Shape Matching   · l'oggetto va sulla sua sagoma
//   Costruttore  ← Object Builder   · l'animale del tema, pochi pezzi sagomati a taglio dritto
//   Indovina     ← Guess the Object · si scopre poco alla volta, si indovina
//   Incastro     ← Jigsaw Puzzles   · il quadro dipinto di un mondo, a incastro classico
//
// Immagini: i soggetti 3D cartoon in alta definizione (public/img/3d/emoji-hd,
// scripts/emoji-hd.py) e gli sfondi dipinti dei mondi (public/img/3d/sfondi).
// Animali e Costruttore usano GiocoSagomato: i pezzi seguono il contorno.
//
// Il file è tutto suo: non tocca né la logica né i dati di Magistella.jsx.
// Riceve `speak` e `sfx` come prop invece di importarli, così la sezione resta
// staccabile e non crea dipendenze incrociate.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useLayoutEffect, useMemo, useRef, useCallback, useId } from "react";
import SvgAsset, { ASSET_MAP } from "./SvgAssets.jsx";
import { Icon } from "./icons.jsx";
import { ANIMALI } from "./data/animali.js";
import { emoji3dHd } from "./data/grafica3d.js";
import {
  FF, FF_DISPLAY, FF_NUM,
  SG_GOLD, SG_RUNE, SG_PARCH, SG_INK, SG_BG, SG_CARD, SG_BR, SG_GOLD_GRAD, SG_TILE,
} from "./sigillo.js";

const SAVE_KEY = "mondomago_puzzle_v1";

// ═══════════════════════════════════════════════════════════════════════════
// SOGGETTI
// ═══════════════════════════════════════════════════════════════════════════
const SCENES = [
  { id: "foresta",     nome: "Foresta Magica" },
  { id: "castello",    nome: "Castello delle Nuvole" },
  { id: "oceano",      nome: "Oceano Luminoso" },
  { id: "mercato",     nome: "Mercato dei Colori" },
  { id: "galassia",    nome: "Galassia Stellare" },
  { id: "vulcano",     nome: "Vulcano Magico" },
  { id: "biblioteca",  nome: "Biblioteca Incantata" },
  { id: "laboratorio", nome: "Laboratorio Logico" },
];

// Soggetti singoli, raggruppati per tema come nel gioco di riferimento.
// Ogni voce ha il nome italiano: serve per la voce e per il gioco "Indovina".
const TEMI = [
  {
    id: "animali", nome: "Animali", icona: "🦊",
    cose: [
      ["🐻", "Orso"], ["🦊", "Volpe"], ["🐰", "Coniglio"], ["🦁", "Leone"],
      ["🐘", "Elefante"], ["🐢", "Tartaruga"], ["🐮", "Mucca"], ["🐧", "Pinguino"],
      ["🦉", "Gufo"], ["🐺", "Lupo"], ["🐸", "Rana"], ["🐶", "Cane"],
      ["🐱", "Gatto"], ["🐭", "Topolino"], ["🐔", "Gallina"], ["🦆", "Papera"],
    ],
  },
  {
    id: "mare", nome: "Mare", icona: "🐬",
    cose: [
      ["🐬", "Delfino"], ["🐋", "Balena"], ["🐟", "Pesce"], ["🐙", "Polpo"],
      ["🦈", "Squalo"], ["🦀", "Granchio"], ["🐚", "Conchiglia"], ["🦑", "Calamaro"],
      ["🦞", "Aragosta"], ["🐌", "Lumaca"],
    ],
  },
  {
    id: "natura", nome: "Natura", icona: "🌈",
    cose: [
      ["☀️", "Sole"], ["🌙", "Luna"], ["⭐", "Stella"], ["🌈", "Arcobaleno"],
      ["🌊", "Onda"], ["🔥", "Fuoco"], ["❄️", "Fiocco di neve"], ["💧", "Goccia"],
      ["🌸", "Fiore"], ["🌻", "Girasole"], ["🍄", "Fungo"], ["🌿", "Foglia"],
      ["🍂", "Foglia d'autunno"], ["🌷", "Tulipano"], ["🏔️", "Montagna"],
    ],
  },
  {
    id: "cibo", nome: "Cibo", icona: "🍎",
    cose: [
      ["🍎", "Mela"], ["🍊", "Arancia"], ["🍋", "Limone"], ["🍓", "Fragola"],
      ["🍇", "Uva"], ["🍕", "Pizza"], ["🍍", "Ananas"], ["🥦", "Broccolo"],
      ["🥛", "Latte"], ["🍔", "Panino"],
    ],
  },
  {
    id: "magia", nome: "Magia", icona: "🔮",
    cose: [
      ["🚀", "Razzo"], ["🪐", "Pianeta"], ["🌍", "Terra"], ["🏰", "Castello"],
      ["👑", "Corona"], ["🔮", "Sfera magica"], ["📚", "Libri"], ["🎸", "Chitarra"],
      ["🎺", "Tromba"], ["🎨", "Tavolozza"], ["🌋", "Vulcano"], ["⚽", "Pallone"],
    ],
  },
];
const TUTTE_LE_COSE = TEMI.flatMap(t => t.cose.map(([e, n]) => ({ emoji: e, nome: n, tema: t.id })))
  .filter(c => ASSET_MAP[c.emoji] || ASSET_MAP[c.emoji.replace(/️/g, "")]);

// Il bambino sceglie il tema (Animali, Mare, …) e Ombre e "Cosa si nasconde"
// pescano solo da lì. Se un tema non basta per il livello, si completa con il
// resto: meglio un oggetto fuori tema che una partita con due ombre.
function cosePerTema(tema, quante) {
  const delTema = tema === "tutti" ? TUTTE_LE_COSE : TUTTE_LE_COSE.filter(c => c.tema === tema);
  if (delTema.length >= quante) return delTema;
  const altre = TUTTE_LE_COSE.filter(c => !delTema.includes(c));
  return [...delTema, ...shuffle(altre).slice(0, quante - delTema.length)];
}

// ═══════════════════════════════════════════════════════════════════════════
// DIFFICOLTÀ
// Parte dall'età scelta all'inizio del gioco, ma resta cambiabile a mano —
// nel gioco di riferimento è proprio la voce che i genitori regolano più spesso.
// ═══════════════════════════════════════════════════════════════════════════
const LIVELLI = [
  { id: "facile",   nome: "Facile",   perEtà: 4, ombre: 3, costruttore: [2, 2], indovina: 6,  incastro: [2, 2] },
  { id: "medio",    nome: "Medio",    perEtà: 6, ombre: 4, costruttore: [3, 2], indovina: 9,  incastro: [3, 2] },
  { id: "difficile",nome: "Difficile",perEtà: 8, ombre: 6, costruttore: [3, 3], indovina: 12, incastro: [4, 3] },
  { id: "mago",     nome: "Mago",     perEtà: 9, ombre: 8, costruttore: [4, 3], indovina: 16, incastro: [5, 4] },
];
const livelloPerEtà = (età) => LIVELLI.find(l => l.perEtà >= (età || 5)) || LIVELLI[1];

// ═══════════════════════════════════════════════════════════════════════════
// ADESIVI — la ricompensa. Nel gioco di riferimento sono sticker e giocattoli;
// qui sono frammenti del Sigillo, che è il linguaggio di Magistella.
// ═══════════════════════════════════════════════════════════════════════════
const ADESIVI = [
  { id: "a1", emoji: "⭐", nome: "Stella d'oro" },
  { id: "a2", emoji: "🌙", nome: "Luna d'argento" },
  { id: "a3", emoji: "🔮", nome: "Sfera magica" },
  { id: "a4", emoji: "👑", nome: "Corona del mago" },
  { id: "a5", emoji: "🦊", nome: "Volpe furba" },
  { id: "a6", emoji: "🐬", nome: "Delfino saltatore" },
  { id: "a7", emoji: "🌈", nome: "Arcobaleno" },
  { id: "a8", emoji: "🚀", nome: "Razzo stellare" },
  { id: "a9", emoji: "🦉", nome: "Gufo saggio" },
  { id: "a10", emoji: "🌻", nome: "Girasole" },
  { id: "a11", emoji: "🏰", nome: "Castello incantato" },
  { id: "a12", emoji: "🐻", nome: "Orso dormiglione" },
];

// ═══════════════════════════════════════════════════════════════════════════
// UTILITÀ
// ═══════════════════════════════════════════════════════════════════════════
const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch { return {}; }
}
function writeSave(d) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch { /* quota o modalità privata */ }
}

// ═══════════════════════════════════════════════════════════════════════════
// GEOMETRIA DEL PUZZLE A INCASTRO
//
// Ogni bordo interno ha una linguetta che sporge da una parte e rientra
// dall'altra: il pezzo a destra ha l'incavo dove il pezzo a sinistra ha la
// bozza. Il profilo qui sotto è in coordinate normalizzate sul bordo —
// t = quanto si è avanzati lungo il bordo (0→1), u = quanto si sporge fuori.
// ═══════════════════════════════════════════════════════════════════════════
const PROFILO = [
  [0.20, 0.00, 0.36, 0.00, 0.40, 0.03],
  [0.48, 0.08, 0.34, 0.17, 0.40, 0.23],
  [0.45, 0.30, 0.55, 0.30, 0.60, 0.23],
  [0.66, 0.17, 0.52, 0.08, 0.60, 0.03],
  [0.64, 0.00, 0.80, 0.00, 1.00, 0.00],
];
const AMPIEZZA = 0.9;  // moltiplicatore della sporgenza rispetto al profilo base

/** Un bordo da P a Q. segno 0 = dritto (bordo esterno), +1 = bozza, -1 = incavo. */
function bordo(P, Q, segno) {
  if (!segno) return `L${Q[0].toFixed(2)},${Q[1].toFixed(2)}`;
  const dx = Q[0] - P[0], dy = Q[1] - P[1];
  const L = Math.hypot(dx, dy);
  // normale "verso l'esterno" percorrendo il perimetro in senso orario
  const nx = dy / L, ny = -dx / L;
  const at = (t, u) => {
    const k = u * L * AMPIEZZA * segno;
    return [P[0] + dx * t + nx * k, P[1] + dy * t + ny * k];
  };
  let d = "";
  for (const [c1t, c1u, c2t, c2u, pt, pu] of PROFILO) {
    const c1 = at(c1t, c1u), c2 = at(c2t, c2u), p = at(pt, pu);
    d += `C${c1[0].toFixed(2)},${c1[1].toFixed(2)} ${c2[0].toFixed(2)},${c2[1].toFixed(2)} ${p[0].toFixed(2)},${p[1].toFixed(2)}`;
  }
  return d;
}

/**
 * Taglia un rettangolo W×H in cols×rows pezzi a incastro.
 * Restituisce, per ogni pezzo: dove sta nell'immagine (ax, ay), il tracciato
 * in coordinate assolute, e il riquadro che lo contiene linguette comprese.
 */
function tagliaPuzzle(cols, rows, W, H, linguette = true) {
  const cw = W / cols, ch = H / rows;
  // segno delle linguette: verso destra e verso il basso si estraggono a caso,
  // il pezzo accanto eredita l'opposto — così i due bordi combaciano sempre
  // senza linguette (Costruttore) i tagli sono dritti, come un puzzle di legno
  const verso = () => (linguette ? (Math.random() < 0.5 ? 1 : -1) : 0);
  const vert = Array.from({ length: rows }, () => Array.from({ length: cols - 1 }, verso));
  const oriz = Array.from({ length: rows - 1 }, () => Array.from({ length: cols }, verso));

  const pezzi = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw, y = r * ch;
      const TL = [x, y], TR = [x + cw, y], BR = [x + cw, y + ch], BL = [x, y + ch];
      const top    = r === 0 ? 0 : -oriz[r - 1][c];
      const right  = c === cols - 1 ? 0 : vert[r][c];
      const bottom = r === rows - 1 ? 0 : oriz[r][c];
      const left   = c === 0 ? 0 : -vert[r][c - 1];
      const d =
        `M${TL[0].toFixed(2)},${TL[1].toFixed(2)}` +
        bordo(TL, TR, top) + bordo(TR, BR, right) +
        bordo(BR, BL, bottom) + bordo(BL, TL, left) + "Z";
      // la linguetta sporge fino a 0.30 del lato (vedi PROFILO), più il tratto
      const sp = Math.max(cw, ch) * 0.30 * AMPIEZZA + 3;
      pezzi.push({
        id: `p${r}_${c}`, r, c, ax: x, ay: y, cw, ch, d,
        box: {
          x: x - (left > 0 ? sp : 0), y: y - (top > 0 ? sp : 0),
          w: cw + (left > 0 ? sp : 0) + (right > 0 ? sp : 0),
          h: ch + (top > 0 ? sp : 0) + (bottom > 0 ? sp : 0),
        },
      });
    }
  }
  return pezzi;
}

// ═══════════════════════════════════════════════════════════════════════════
// PUZZLE SAGOMATO — i pezzi seguono il contorno dell'animale
// Si taglia la griglia come sempre, poi si guarda quanto animale c'è in ogni
// cella (canale alfa dell'immagine): le celle vuote spariscono, quelle con
// solo un pezzetto (una punta d'orecchio, una zampa) si fondono con la vicina
// più piena. Ogni pezzo ritaglia l'immagine trasparente, quindi il suo bordo
// esterno È il contorno dell'animale: niente rettangoli.
// ═══════════════════════════════════════════════════════════════════════════
const SOGLIA_PEZZO = 0.28;    // sotto questa frazione di cella piena, il pezzo si fonde

/** Riquadro (x,y,w,h) in cui l'immagine sta nel tabellone W×H, centrata e intera. */
function adatta(iw, ih, W, H, margine = 0.04) {
  const k = Math.min(W * (1 - margine * 2) / iw, H * (1 - margine * 2) / ih);
  const w = iw * k, h = ih * k;
  return { x: (W - w) / 2, y: (H - h) / 2, w, h };
}

/**
 * Carica l'immagine e misura quanta parte opaca c'è in ogni rettangolo.
 * Ritorna null finché l'immagine non è pronta.
 */
function useCopertura(src, W, H) {
  const [stato, setStato] = useState(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- immagine nuova: si rimisura
    setStato(null);
    if (!src) return;
    let annullato = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (annullato) return;
      const r = adatta(img.naturalWidth, img.naturalHeight, W, H);
      const cv = document.createElement("canvas");
      cv.width = W; cv.height = H;
      const cx = cv.getContext("2d", { willReadFrequently: true });
      cx.drawImage(img, r.x, r.y, r.w, r.h);
      let A;
      try { A = cx.getImageData(0, 0, W, H).data; } catch { A = null; }
      const copertura = (x, y, w, h) => {
        if (!A) return 1;                      // senza alfa leggibile: pezzi pieni
        let n = 0, t = 0;
        const x0 = Math.max(0, Math.floor(x)), x1 = Math.min(W, Math.ceil(x + w));
        const y0 = Math.max(0, Math.floor(y)), y1 = Math.min(H, Math.ceil(y + h));
        for (let j = y0; j < y1; j += 2) for (let i = x0; i < x1; i += 2) { t++; if (A[(j * W + i) * 4 + 3] > 48) n++; }
        return t ? n / t : 0;
      };
      setStato({ rect: r, copertura });
    };
    img.onerror = () => { if (!annullato) setStato({ rect: { x: 0, y: 0, w: W, h: H }, copertura: () => 1 }); };
    img.src = src;
    return () => { annullato = true; };
  }, [src, W, H]);
  return stato;
}

/** Taglia e sagoma: pezzi con { id, cells, d, ax, ay, cw, ch, box }. */
function tagliaSagomato(cols, rows, W, H, copertura, linguette) {
  let pezzi = tagliaPuzzle(cols, rows, W, H, linguette).map(p => ({
    ...p, cells: [[p.r, p.c]], paths: [p.d], pieno: copertura(p.ax, p.ay, p.cw, p.ch),
  })).filter(p => p.pieno > 0.003);
  const cw = W / cols, ch = H / rows;
  const vicini = (a, b) => a.cells.some(([r, c]) => b.cells.some(([r2, c2]) => Math.abs(r - r2) + Math.abs(c - c2) === 1));
  // quanto animale attraversa il bordo comune: fondere due celle che si toccano
  // solo con lo sfondo trasparente darebbe un pezzo fatto di due isole
  const contatto = (a, b) => {
    let t = 0;
    for (const [r, c] of a.cells) for (const [r2, c2] of b.cells) {
      if (r === r2 && Math.abs(c - c2) === 1) t += copertura(Math.max(c, c2) * cw - 3, r * ch, 6, ch);
      if (c === c2 && Math.abs(r - r2) === 1) t += copertura(c * cw, Math.max(r, r2) * ch - 3, cw, 6);
    }
    return t;
  };
  // si fonde sempre il più vuoto, finché tutti sono abbastanza pieni
  for (;;) {
    const piccolo = pezzi.filter(p => p.pieno / p.cells.length < SOGLIA_PEZZO && pezzi.length > 2)
      .sort((a, b) => a.pieno - b.pieno)[0];
    if (!piccolo) break;
    const dove = pezzi.filter(q => q !== piccolo && vicini(q, piccolo))
      .sort((a, b) => (contatto(b, piccolo) - contatto(a, piccolo)) || (b.pieno - a.pieno))[0];
    if (!dove) break;
    dove.cells.push(...piccolo.cells);
    dove.paths.push(...piccolo.paths);
    dove.pieno += piccolo.pieno;
    dove.box = {
      x: Math.min(dove.box.x, piccolo.box.x), y: Math.min(dove.box.y, piccolo.box.y),
      w: Math.max(dove.box.x + dove.box.w, piccolo.box.x + piccolo.box.w) - Math.min(dove.box.x, piccolo.box.x),
      h: Math.max(dove.box.y + dove.box.h, piccolo.box.y + piccolo.box.h) - Math.min(dove.box.y, piccolo.box.y),
    };
    pezzi = pezzi.filter(q => q !== piccolo);
  }
  return pezzi.map(p => {
    const xs = p.cells.map(([, c]) => c), ys = p.cells.map(([r]) => r);
    const ax = Math.min(...xs) * cw, ay = Math.min(...ys) * ch;
    return { ...p, d: p.paths.join(" "), ax, ay, cw: (Math.max(...xs) + 1) * cw - ax, ch: (Math.max(...ys) + 1) * ch - ay };
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// PEZZI CHE SI TRASCINANO — un gancio solo per tutti e tre i giochi che lo usano
// Funziona a dito e a mouse (Pointer Events), e anche a due tocchi: tocca il
// pezzo, tocca dove va. Sotto i 5 anni il trascinamento continuo è ancora
// incerto, e il doppio tocco salva la partita.
// ═══════════════════════════════════════════════════════════════════════════
function useTrascinamento(svgRef, onRilascio) {
  const [preso, setPreso] = useState(null);   // { id, dx, dy, x, y }
  const presoRef = useRef(null);
  // allineato a ogni commit, prima che arrivi il prossimo evento del dito
  useLayoutEffect(() => { presoRef.current = preso; }, [preso]);

  const puntoSvg = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }, [svgRef]);

  const inizia = useCallback((e, id, x, y) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = puntoSvg(e);
    setPreso({ id, dx: p.x - x, dy: p.y - y, x, y, mosso: false });
  }, [puntoSvg]);

  const muovi = useCallback((e) => {
    if (!presoRef.current) return;
    const p = puntoSvg(e);
    setPreso(s => s && { ...s, x: p.x - s.dx, y: p.y - s.dy, mosso: true });
  }, [puntoSvg]);

  const finisci = useCallback(() => {
    const s = presoRef.current;
    setPreso(null);
    if (s) onRilascio(s);
  }, [onRilascio]);

  return { preso, inizia, muovi, finisci, puntoSvg };
}

// ═══════════════════════════════════════════════════════════════════════════
// PEZZI COMUNI DI INTERFACCIA
// ═══════════════════════════════════════════════════════════════════════════
// Su PC e tablet il gioco resta della misura di un telefono grande, centrato:
// a tutto schermo un pezzo diventava largo 30 cm e la vaschetta finiva sotto la piega.
const LARGHEZZA_MAX = 520;

function Cornice({ titolo, sottotitolo, onIndietro, azione, children }) {
  return (
    <div style={{ maxWidth: LARGHEZZA_MAX, margin: "0 auto",
      minHeight: "var(--vvh,100dvh)", background: SG_BG, color: SG_PARCH,
      display: "flex", flexDirection: "column",
      padding: "14px 14px max(env(safe-area-inset-bottom,0px),18px)",
      isolation: "isolate",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <button onClick={onIndietro} aria-label="Indietro"
          style={{ background: "rgba(255,255,255,.10)", border: "none", color: SG_PARCH, borderRadius: 14, padding: "10px 14px", cursor: "pointer", fontSize: 15, fontWeight: 800, flexShrink: 0 }}>
          ←
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ fontFamily: FF_DISPLAY, fontSize: 20, fontWeight: 400, margin: 0, color: SG_GOLD, lineHeight: 1.15 }}>{titolo}</h1>
          {sottotitolo && <div style={{ fontSize: 12, opacity: .7, marginTop: 2 }}>{sottotitolo}</div>}
        </div>
        {azione}
      </div>
      {children}
    </div>
  );
}

function SceltaLivello({ valore, onCambia }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
      {LIVELLI.map(l => (
        <button key={l.id} onClick={() => onCambia(l)}
          aria-pressed={l.id === valore.id}
          style={{
            flex: 1, padding: "9px 4px", minHeight: 44, borderRadius: 12, cursor: "pointer",
            background: l.id === valore.id ? SG_GOLD_GRAD : "rgba(255,255,255,.07)",
            color: l.id === valore.id ? SG_INK : SG_PARCH,
            border: l.id === valore.id ? "none" : "1px solid rgba(255,194,75,.16)",
            fontFamily: FF, fontSize: 12, fontWeight: 800,
          }}>
          {l.nome}
        </button>
      ))}
    </div>
  );
}

function Vittoria({ testo, adesivo, monete = 0, onAncora, onEsci }) {
  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,6,25,.86)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div className="pop-in" style={{
        background: SG_CARD, border: SG_BR, borderRadius: 28, padding: "28px 24px",
        maxWidth: 340, width: "100%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,.5)", backdropFilter: "blur(8px)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Icon name="trophy" color={SG_GOLD} size={52} />
        </div>
        <div style={{ fontFamily: FF_DISPLAY, fontSize: 25, color: SG_GOLD, marginBottom: 6 }}>{testo}</div>
        {monete > 0 && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 10,
            background: "rgba(109,224,198,.14)", border: "1px solid rgba(109,224,198,.4)",
            borderRadius: 30, padding: "5px 14px" }}>
            <Icon name="coin" color={SG_RUNE} size={17} />
            <span style={{ fontFamily: FF_NUM, fontWeight: 800, fontSize: 16, color: SG_RUNE }}>+{monete}</span>
          </div>
        )}
        {adesivo && (
          <>
            <div style={{ fontSize: 12, opacity: .7, marginBottom: 8 }}>Hai vinto un adesivo!</div>
            <div className="bounce" style={{ fontSize: 58, lineHeight: 1.1 }}>{adesivo.emoji}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: SG_RUNE, marginBottom: 18 }}>{adesivo.nome}</div>
          </>
        )}
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button onClick={onEsci} style={{ flex: 1, background: "rgba(255,255,255,.09)", border: SG_BR, color: SG_PARCH, borderRadius: 40, padding: 14, fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
            Torna ai giochi
          </button>
          <button onClick={onAncora} style={{ flex: 1.2, background: SG_GOLD_GRAD, border: "none", color: SG_INK, borderRadius: 40, padding: 14, fontSize: 15, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 22px rgba(255,194,75,.34)" }}>
            Ancora!
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 1 · OMBRE  (Shape Matching)
// Le sagome stanno in alto, gli oggetti in basso. Ogni oggetto va posato sulla
// propria ombra. È il gioco d'ingresso: nessuna lettura, nessun numero.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoOmbre({ livello, seme, tema = "tutti", speak, sfx, onVinto, onIndietro, onLivello }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: nuovo giro, cose nuove
  const cose = useMemo(() => shuffle(cosePerTema(tema, livello.ombre)).slice(0, livello.ombre), [livello, seme, tema]);
  const vassoio = useMemo(() => shuffle(cose), [cose]);
  const [posati, setPosati] = useState({});     // emoji → true
  const [preso, setPreso] = useState(null);
  const [sbagliato, setSbagliato] = useState(null);
  const fatto = Object.keys(posati).length === cose.length;

  // eslint-disable-next-line react-hooks/set-state-in-effect -- nuovo giro: tabellone vuoto
  useEffect(() => { setPosati({}); setPreso(null); }, [cose]);
  useEffect(() => {
    const t = setTimeout(() => speak?.("Metti ogni cosa sulla sua ombra!"), 350);
    return () => clearTimeout(t);
  }, [speak]);

  function posa(target) {
    if (!preso) return;
    if (preso === target) {
      sfx?.correct?.();
      const nuovi = { ...posati, [target]: true };
      setPosati(nuovi);
      setPreso(null);
      const cosa = cose.find(c => c.emoji === target);
      if (Object.keys(nuovi).length === cose.length) setTimeout(() => onVinto(), 480);
      else speak?.(cosa?.nome || "");
    } else {
      sfx?.wrong?.();
      setSbagliato(target);
      setTimeout(() => setSbagliato(null), 420);
    }
  }

  const colonne = cose.length <= 4 ? cose.length : Math.ceil(cose.length / 2);

  return (
    <Cornice titolo="Ombre magiche" sottotitolo="Posa ogni cosa sulla sua ombra" onIndietro={onIndietro}>
      <SceltaLivello valore={livello} onCambia={onLivello} />

      {/* le sagome */}
      <div style={{
        display: "grid", gridTemplateColumns: `repeat(${colonne},1fr)`, gap: 10,
        background: SG_TILE, border: SG_BR, borderRadius: 22, padding: 14, marginBottom: 18,
      }}>
        {cose.map(c => {
          const pieno = posati[c.emoji];
          const err = sbagliato === c.emoji;
          return (
            <button key={c.emoji} onClick={() => posa(c.emoji)}
              aria-label={pieno ? c.nome : `Ombra di una cosa da indovinare`}
              style={{
                aspectRatio: "1", borderRadius: 18, cursor: preso ? "pointer" : "default",
                background: pieno ? "rgba(109,224,198,.15)" : "rgba(0,0,0,.28)",
                border: `2px ${pieno ? "solid" : "dashed"} ${err ? "#EF4444" : pieno ? SG_RUNE : preso ? "rgba(255,194,75,.7)" : "rgba(255,255,255,.16)"}`,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 6,
                transition: "all .2s cubic-bezier(.34,1.56,.64,1)",
                transform: err ? "translateX(-4px)" : "none",
              }}>
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <SvgAsset emoji={c.emoji} size={54} state={pieno ? "correct" : "shadow"} />
              </div>
            </button>
          );
        })}
      </div>

      {/* la vaschetta */}
      <div style={{ fontSize: 11, letterSpacing: 1.4, fontWeight: 800, opacity: .5, marginBottom: 8 }}>
        <Icon name="mano" color={SG_GOLD} size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />
        TOCCA UNA COSA, POI LA SUA OMBRA
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {vassoio.map(c => posati[c.emoji] ? null : (
          <button key={c.emoji}
            onClick={() => { sfx?.tap?.(); setPreso(preso === c.emoji ? null : c.emoji); speak?.(c.nome); }}
            aria-label={c.nome} aria-pressed={preso === c.emoji}
            style={{
              background: preso === c.emoji ? "rgba(255,194,75,.2)" : "rgba(255,255,255,.07)",
              border: `2px solid ${preso === c.emoji ? SG_GOLD : "rgba(255,255,255,.12)"}`,
              borderRadius: 18, padding: 8, cursor: "pointer",
              transform: preso === c.emoji ? "scale(1.09)" : "none",
              transition: "all .18s cubic-bezier(.34,1.56,.64,1)",
            }}>
            <SvgAsset emoji={c.emoji} size={56} />
          </button>
        ))}
      </div>
      {fatto && <div aria-live="polite" className="sr-only">Completato!</div>}
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 · COSTRUTTORE — è GiocoSagomato con i tagli dritti: l'animale del tema,
// diviso in pochi pezzi grandi che seguono il suo contorno (vedi sotto).
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// 3 · INDOVINA  (Guess the Object)
// L'immagine è coperta da tessere. Ogni indizio ne scopre una. Si vince con
// meno indizi possibile: è lì che sta il gioco.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoIndovina({ livello, seme, tema = "tutti", speak, sfx, onVinto, onIndietro, onLivello }) {
  const n = livello.indovina;
  const cols = n <= 6 ? 3 : n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);

  const { soluzione, opzioni } = useMemo(() => {
    const pool = cosePerTema(tema, 4);
    const s = pick(pool);
    const altri = shuffle(pool.filter(c => c.nome !== s.nome)).slice(0, 3);
    return { soluzione: s, opzioni: shuffle([s, ...altri]) };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: nuova cosa da indovinare
  }, [seme, tema]);

  const [scoperte, setScoperte] = useState([]);
  const [risposta, setRisposta] = useState(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: ordine degli indizi nuovo
  const ordine = useMemo(() => shuffle(Array.from({ length: cols * rows }, (_, i) => i)), [cols, rows, seme]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- nuova soluzione: si ricopre tutto
  useEffect(() => { setScoperte([]); setRisposta(null); }, [soluzione]);
  useEffect(() => {
    const t = setTimeout(() => speak?.("Cosa si nasconde? Scopri un pezzetto alla volta!"), 350);
    return () => clearTimeout(t);
  }, [speak]);

  const indizio = () => {
    if (scoperte.length >= ordine.length - 1) return;
    sfx?.tap?.();
    setScoperte(s => [...s, ordine[s.length]]);
  };

  function rispondi(c) {
    if (risposta) return;
    const giusto = c.nome === soluzione.nome;
    setRisposta({ nome: c.nome, giusto });
    if (giusto) {
      sfx?.correct?.();
      setScoperte(ordine);
      // solo il nome: le frasi composte a runtime non hanno una clip registrata
      // e farebbero entrare la voce di sistema proprio nel momento della vittoria
      speak?.(soluzione.nome);
      setTimeout(() => onVinto(ordine.length - scoperte.length), 1400);
    } else {
      sfx?.wrong?.();
      setScoperte(s => (s.length < ordine.length - 1 ? [...s, ordine[s.length]] : s));
      setTimeout(() => setRisposta(null), 900);
    }
  }

  const LATO = 260;
  const tw = LATO / cols, th = LATO / rows;

  return (
    <Cornice titolo="Cosa si nasconde?" sottotitolo={`Indizi usati: ${scoperte.length}`} onIndietro={onIndietro}>
      <SceltaLivello valore={livello} onCambia={onLivello} />

      <div style={{
        position: "relative", width: LATO, height: LATO, margin: "0 auto 16px",
        borderRadius: 22, overflow: "hidden", border: SG_BR,
        background: "rgba(0,0,0,.3)", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {emoji3dHd(soluzione.emoji)
          ? <img src={emoji3dHd(soluzione.emoji)} alt="" draggable={false} decoding="async"
              style={{ width: LATO - 24, height: LATO - 24, objectFit: "contain", userSelect: "none" }} />
          : <SvgAsset emoji={soluzione.emoji} size={LATO - 24} />}
        <div style={{
          position: "absolute", inset: 0,
          display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)`,
        }}>
          {Array.from({ length: cols * rows }, (_, i) => (
            <div key={i} style={{
              background: scoperte.includes(i) ? "transparent" : "#1B1035",
              border: scoperte.includes(i) ? "none" : "1px solid rgba(255,194,75,.10)",
              transition: "background .45s ease, opacity .45s ease",
              opacity: scoperte.includes(i) ? 0 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {!scoperte.includes(i) && (
                <Icon name="lente" color="rgba(255,194,75,.20)" size={Math.min(tw, th) * 0.42} />
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={indizio} disabled={scoperte.length >= ordine.length - 1 || !!risposta}
        style={{
          width: "100%", marginBottom: 16, borderRadius: 40, padding: 13, cursor: "pointer",
          background: scoperte.length >= ordine.length - 1 ? "rgba(255,255,255,.07)" : "rgba(109,224,198,.16)",
          border: `2px solid ${scoperte.length >= ordine.length - 1 ? "rgba(255,255,255,.10)" : SG_RUNE}`,
          color: SG_PARCH, fontFamily: FF, fontSize: 15, fontWeight: 800,
        }}>
        <Icon name="bulb" color={SG_RUNE} size={17} style={{ verticalAlign: "-3px", marginRight: 8 }} />
        Un altro indizio
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {opzioni.map(c => {
          const scelto = risposta?.nome === c.nome;
          return (
            <button key={c.nome} onClick={() => rispondi(c)}
              style={{
                position: "relative",
                borderRadius: 18, padding: "15px 26px 15px 10px", cursor: "pointer", minHeight: 58,
                background: scelto ? (risposta.giusto ? "rgba(109,224,198,.24)" : "rgba(239,68,68,.22)") : "rgba(246,236,212,.07)",
                border: `2px solid ${scelto ? (risposta.giusto ? SG_RUNE : "#EF4444") : "rgba(255,194,75,.3)"}`,
                color: SG_PARCH, fontFamily: FF, fontSize: 16, fontWeight: 800,
                transition: "all .2s",
              }}>
              {c.nome}
              {/* A 3-5 anni non si legge: l'altoparlante dice la parola senza
                  che toccarla valga come risposta. */}
              <span role="button" tabIndex={0} aria-label={`Ascolta: ${c.nome}`}
                onClick={(e) => { e.stopPropagation(); sfx?.tap?.(); speak?.(c.nome); }}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); speak?.(c.nome); } }}
                style={{ position: "absolute", top: 0, right: 0, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", opacity: .7, cursor: "pointer" }}>
                <Icon name="audio" color={SG_GOLD} size={18} />
              </span>
            </button>
          );
        })}
      </div>
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 · INCASTRO — GiocoSagomato con le linguette, sull'isola 3D di un mondo.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// GIOCO SAGOMATO — il motore comune di "Puzzle degli animali" e "Costruttore"
// Il soggetto è un'immagine trasparente (animale cartoon): sul tabellone resta
// la sua ombra, i pezzi seguono il contorno, ognuno con il bordo bianco da
// adesivo. Toccando o prendendo un pezzo, il suo posto si illumina in
// trasparenza: per un bambino di 3-4 anni è l'aiuto che fa la differenza.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoSagomato({
  livello, seme, speak, sfx, onVinto, onIndietro, onLivello, onNuovo,
  soggetto, griglia, linguette = true, titolo, consegna,
}) {
  const W = 360, H = 320;
  const [cols, rows] = griglia;
  const misura = useCopertura(soggetto.src, W, H);
  const pezzi = useMemo(
    () => (misura ? tagliaSagomato(cols, rows, W, H, misura.copertura, linguette) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: tagli nuovi
    [misura, cols, rows, linguette, seme],
  );
  const uid = useId().replace(/:/g, "");
  const SCALA = 0.52;
  const VASSOIO_Y = H + 20;

  const [posti, setPosti] = useState({});
  const [dove, setDove] = useState({});
  const [selezionato, setSelezionato] = useState(null);
  const svgRef = useRef(null);
  const casa = (p) => ({ x: p.ax + p.cw / 2, y: p.ay + p.ch / 2 });

  // vaschetta: i pezzi in fila come su uno scaffale, ognuno con il suo ingombro vero
  const { posIniziali, fondoVassoio } = useMemo(() => {
    const pos = {};
    let x = 6, y = VASSOIO_Y, alto = 0;
    for (const p of shuffle(pezzi)) {
      const w = p.box.w * SCALA, h = p.box.h * SCALA;
      if (x + w > W - 6 && x > 6) { x = 6; y += alto + 10; alto = 0; }
      const c = casa(p);
      pos[p.id] = { x: x - p.box.x * SCALA + c.x * SCALA, y: y - p.box.y * SCALA + c.y * SCALA };
      x += w + 10; alto = Math.max(alto, h);
    }
    return { posIniziali: pos, fondoVassoio: y + alto + 14 };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dipende solo dai pezzi
  }, [pezzi]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- pezzi nuovi: vaschetta piena, tabellone vuoto
  useEffect(() => { setDove(posIniziali); setPosti({}); setSelezionato(null); }, [posIniziali]);
  useEffect(() => {
    const t = setTimeout(() => speak?.(consegna), 350);
    return () => clearTimeout(t);
  }, [speak, consegna]);

  const altezza = Math.max(VASSOIO_Y + 60, fondoVassoio);
  const SCATTO = Math.max(30, Math.min(W / cols, H / rows) * 0.5);

  const metti = useCallback((p) => {
    sfx?.correct?.();
    setDove(d => ({ ...d, [p.id]: casa(p) }));
    setSelezionato(null);
    setPosti(pz => {
      const n = { ...pz, [p.id]: true };
      if (Object.keys(n).length === pezzi.length) setTimeout(() => onVinto(soggetto), 560);
      return n;
    });
  }, [pezzi, sfx, onVinto, soggetto]);

  const rilascia = useCallback((st) => {
    const p = pezzi.find(q => q.id === st.id);
    if (!p) return;
    if (!st.mosso) { setSelezionato(sel => (sel === st.id ? null : st.id)); sfx?.tap?.(); return; }
    const c = casa(p);
    if (Math.hypot(st.x - c.x, st.y - c.y) < SCATTO) metti(p);
    else setDove(d => ({ ...d, [st.id]: { x: clamp(st.x, 10, W - 10), y: clamp(st.y, 10, altezza - 10) } }));
  }, [pezzi, SCATTO, metti, sfx, altezza]);

  const { preso, inizia, muovi, finisci, puntoSvg } = useTrascinamento(svgRef, rilascia);

  // due tocchi: pezzo scelto, poi un tocco dentro la sua ombra
  function toccaTabellone(e) {
    if (!selezionato) return;
    const p = pezzi.find(q => q.id === selezionato);
    if (!p) return;
    const t = puntoSvg(e);
    const dentro = t.x >= p.ax - 8 && t.x <= p.ax + p.cw + 8 && t.y >= p.ay - 8 && t.y <= p.ay + p.ch + 8;
    if (dentro) metti(p); else sfx?.wrong?.();
  }

  const r = misura?.rect;
  const img = (extra = {}) => r && (
    <image href={soggetto.src} x={r.x} y={r.y} width={r.w} height={r.h} preserveAspectRatio="none" {...extra} />
  );
  const evidenziato = preso?.id || selezionato;
  const messi = Object.keys(posti).length;

  return (
    <Cornice titolo={titolo} sottotitolo={pezzi.length ? `${soggetto.nome} · ${messi}/${pezzi.length} pezzi` : soggetto.nome}
      onIndietro={onIndietro}
      azione={onNuovo && (
        <button onClick={onNuovo} aria-label="Un altro"
          style={{ background: "rgba(255,255,255,.10)", border: "none", color: SG_PARCH, borderRadius: 14, padding: "10px 12px", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="ricomincia" color={SG_GOLD} size={18} />
        </button>
      )}>
      <SceltaLivello valore={livello} onCambia={onLivello} />

      {/* Tabellone + vaschetta stanno sempre nello schermo: su PC (finestra bassa e
          larga) e sui telefoni piccoli il gioco si rimpicciolisce invece di finire
          sotto il bordo, dove il bambino non vede più i pezzi. */}
      <svg ref={svgRef} viewBox={`0 0 ${W} ${altezza}`} data-sagomato={soggetto.nome}
        style={{ width: "100%", height: "auto", maxHeight: "calc(var(--vvh, 100dvh) - 170px)", touchAction: "none", display: "block", margin: "0 auto" }}
        onPointerMove={muovi} onPointerUp={finisci} onPointerCancel={finisci}>
        <defs>
          {/* bordo bianco da adesivo intorno alla sagoma del pezzo */}
          <filter id={`bordo-${uid}`} x="-15%" y="-15%" width="130%" height="130%">
            <feMorphology in="SourceAlpha" operator="dilate" radius="2.6" result="spesso" />
            <feFlood floodColor="#FFFFFF" />
            <feComposite in2="spesso" operator="in" result="bianco" />
            <feMerge><feMergeNode in="bianco" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id={`ombra-${uid}`} x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#0B0619" floodOpacity="0.55" />
          </filter>
          {/* l'animale tutto nero e trasparente: la sua ombra sul tabellone */}
          <filter id={`ombra-animale-${uid}`}>
            <feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.04  0 0 0 0 0.16  0 0 0 0.55 0" />
          </filter>
          {pezzi.map(p => <clipPath key={p.id} id={`c-${uid}-${p.id}`}><path d={p.d} /></clipPath>)}
        </defs>

        <g onPointerDown={toccaTabellone}>
          <rect x="0" y="0" width={W} height={H} rx="18" fill="rgba(255,255,255,.05)" stroke="rgba(255,194,75,.18)" />
          {img({ filter: `url(#ombra-animale-${uid})` })}
          {/* dove va il pezzo che il bambino ha in mano */}
          {evidenziato && !posti[evidenziato] && (
            <g clipPath={`url(#c-${uid}-${evidenziato})`} opacity="0.5" className="pulse" pointerEvents="none">{img()}</g>
          )}
        </g>

        <rect x="0" y={VASSOIO_Y - 10} width={W} height={altezza - VASSOIO_Y + 8} rx="16"
          fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.07)" />

        {!misura && <text x={W / 2} y={H / 2} textAnchor="middle" fill={SG_PARCH} opacity=".6" fontSize="14">Preparo i pezzi…</text>}

        {[...pezzi].sort((a, b) => (posti[a.id] ? -1 : 1) - (posti[b.id] ? -1 : 1) || (preso?.id === a.id) - (preso?.id === b.id)).map((p, i) => {
          const messo = posti[p.id];
          const trascinato = preso?.id === p.id;
          const pos = trascinato ? { x: preso.x, y: preso.y } : (dove[p.id] || casa(p));
          const sc = messo || trascinato ? 1 : SCALA;
          const c = casa(p);
          return (
            <g key={p.id}
              transform={`translate(${pos.x - c.x * sc} ${pos.y - c.y * sc}) scale(${sc})`}
              onPointerDown={messo ? undefined : (e) => { e.stopPropagation(); inizia(e, p.id, pos.x, pos.y); }}
              style={{ cursor: messo ? "default" : "grab", touchAction: "none" }}
              role={messo ? undefined : "button"}
              aria-label={messo ? undefined : `Pezzo ${i + 1} di ${soggetto.nome}`}
              data-casa={`${c.x.toFixed(1)},${c.y.toFixed(1)}`}
              data-pos={`${pos.x.toFixed(1)},${pos.y.toFixed(1)}`}
              data-presa={`${((p.cells[0][1] + 0.5) * W / cols).toFixed(1)},${((p.cells[0][0] + 0.5) * H / rows).toFixed(1)}`}>
              <g filter={messo ? undefined : `url(#ombra-${uid})`}>
                <g filter={messo ? undefined : `url(#bordo-${uid})`}>
                  <g clipPath={`url(#c-${uid}-${p.id})`}>{img()}</g>
                </g>
              </g>
              {/* zona da afferrare: tutto il pezzo, anche dove l'animale è trasparente */}
              {!messo && <path d={p.d} fill="rgba(0,0,0,0)" />}
              {selezionato === p.id && !messo && (
                <path d={p.d} fill="none" stroke={SG_GOLD} strokeWidth={3 / sc} strokeDasharray="6 4" pointerEvents="none" />
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, opacity: .45, textAlign: "center", marginTop: 8 }}>
        Trascina un pezzo sulla sua ombra — oppure toccalo e poi tocca dove va.
      </div>
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 · PUZZLE DEGLI ANIMALI
// Si sceglie un animale, si ricompone la sua foto vera (il motore è quello del
// puzzle a incastro) e alla fine si sente il suo verso vero, poi la voce dice
// il nome e una curiosità. Gli animali finiti restano nell'album: si possono
// riascoltare quando si vuole. È il ciclo "raccogli e riascolta" che tiene i
// bambini sulle app di puzzle di animali più scaricate.
// ═══════════════════════════════════════════════════════════════════════════

// Il verso è un mp3 a parte, non una clip della voce: si suona da solo e, quando
// finisce, parla la voce. `poi` parte comunque (file mancante, autoplay negato,
// verso troppo lungo): la frase non deve mai restare muta.
// Magistella passa il suo lettore già sbloccato (Safari suona solo elementi
// avviati in un tocco): se c'è, si usa quello.
let _suonaEsterno = null;
function suonaVerso(src, poi) {
  if (_suonaEsterno) return _suonaEsterno(src, poi);
  const a = new Audio(src);
  let fatto = false;
  const fine = () => { if (fatto) return; fatto = true; clearTimeout(t); poi?.(); };
  const t = setTimeout(fine, 5000);
  a.onended = fine;
  a.onerror = fine;
  a.play().catch(fine);
  return () => { fatto = true; clearTimeout(t); a.pause(); };
}

function SceltaAnimale({ completati, onScegli, onIndietro, speak, sfx }) {
  useEffect(() => {
    const t = setTimeout(() => speak?.("Scegli un animale e rimetti insieme la sua foto!"), 350);
    return () => clearTimeout(t);
  }, [speak]);
  return (
    <Cornice titolo="Puzzle degli animali" sottotitolo={`${completati.length} animali su ${ANIMALI.length} nel tuo album`} onIndietro={onIndietro}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {ANIMALI.map(a => {
          const fatto = completati.includes(a.id);
          return (
            <button key={a.id} onClick={() => { sfx?.tap?.(); onScegli(a); }}
              aria-label={fatto ? `${a.nome}, già nel tuo album` : a.nome}
              style={{
                position: "relative", padding: 0, borderRadius: 18, overflow: "hidden", cursor: "pointer",
                border: fatto ? "3px solid #FFC24B" : "3px solid rgba(255,255,255,.14)",
                background: "radial-gradient(circle at 50% 40%, #3B2A78, #1B1035 75%)", aspectRatio: "1", boxShadow: "0 4px 14px rgba(0,0,0,.35)",
              }}>
              <img src={a.cartone} alt="" loading="lazy" decoding="async"
                style={{ position: "absolute", inset: "8% 10% 24%", width: "80%", height: "68%", objectFit: "contain",
                  filter: "drop-shadow(0 4px 6px rgba(0,0,0,.45))" }} />
              <span style={{
                position: "absolute", left: 0, right: 0, bottom: 0, padding: "14px 4px 5px",
                background: "linear-gradient(transparent, rgba(11,6,25,.85))",
                fontFamily: FF_DISPLAY, fontSize: 14, color: "#fff", textAlign: "center",
              }}>{a.nome}</span>
              {fatto && (
                <span style={{ position: "absolute", top: 5, right: 5, width: 24, height: 24, borderRadius: "50%",
                  background: SG_GOLD_GRAD, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,.4)" }}>
                  <Icon name="star" color={SG_INK} size={14} />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, opacity: .45, textAlign: "center", marginTop: 12 }}>
        A puzzle finito vedi l'animale vero e senti il suo verso.
      </div>
    </Cornice>
  );
}

function VittoriaAnimale({ animale, monete = 0, adesivo, speak, onAncora, onAltri }) {
  const ferma = useRef(null);
  const ascolta = useCallback(() => {
    ferma.current?.();
    ferma.current = suonaVerso(animale.verso, () => speak?.(animale.frase));
  }, [animale, speak]);
  useEffect(() => {
    const t = setTimeout(ascolta, 450);
    return () => { clearTimeout(t); ferma.current?.(); };
  }, [ascolta]);

  return (
    <div className="fade-in" style={{
      position: "fixed", inset: 0, zIndex: 60, background: "rgba(11,6,25,.88)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div className="pop-in" style={{
        background: SG_CARD, border: SG_BR, borderRadius: 28, padding: "18px 18px 20px",
        maxWidth: 360, width: "100%", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,.5)",
      }}>
        <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", border: "3px solid #FFC24B", marginBottom: 12, aspectRatio: "5 / 3", background: "#140B29" }}>
          <img src={animale.foto} alt={`${animale.nome} vero`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          <span style={{ position: "absolute", left: 8, top: 8, background: "rgba(11,6,25,.72)", color: "#fff", borderRadius: 20,
            padding: "3px 10px", fontSize: 12, fontWeight: 800 }}>Ecco quello vero!</span>
          <img src={animale.cartone} alt="" className="pop-in" style={{ position: "absolute", right: 6, bottom: 4, width: "34%",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,.6))" }} />
        </div>
        <div style={{ fontFamily: FF_DISPLAY, fontSize: 28, color: SG_GOLD, lineHeight: 1.1 }}>{animale.nome}</div>
        <div style={{ fontSize: 14, opacity: .85, margin: "6px 4px 10px", lineHeight: 1.35 }}>{animale.frase.replace(/^[^!]*!\s*/, "")}</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          {monete > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(109,224,198,.14)",
              border: "1px solid rgba(109,224,198,.4)", borderRadius: 30, padding: "4px 12px" }}>
              <Icon name="coin" color={SG_RUNE} size={16} />
              <span style={{ fontFamily: FF_NUM, fontWeight: 800, fontSize: 15, color: SG_RUNE }}>+{monete}</span>
            </span>
          )}
          {adesivo && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,194,75,.12)",
              border: "1px solid rgba(255,194,75,.4)", borderRadius: 30, padding: "4px 12px", fontSize: 13, fontWeight: 800 }}>
              <span style={{ fontSize: 18 }}>{adesivo.emoji}</span> {adesivo.nome}
            </span>
          )}
        </div>
        <button onClick={ascolta} aria-label={`Ascolta di nuovo il verso: ${animale.nome}`}
          style={{ width: "100%", background: "rgba(255,255,255,.09)", border: SG_BR, color: SG_PARCH, borderRadius: 40,
            padding: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", marginBottom: 10,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="audio" color={SG_GOLD} size={18} /> Ascolta il verso
        </button>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onAltri} style={{ flex: 1, background: "rgba(255,255,255,.09)", border: SG_BR, color: SG_PARCH, borderRadius: 40, padding: 13, fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
            Tutti gli animali
          </button>
          <button onClick={onAncora} style={{ flex: 1.2, background: SG_GOLD_GRAD, border: "none", color: SG_INK, borderRadius: 40, padding: 13, fontSize: 14, fontWeight: 900, cursor: "pointer", boxShadow: "0 8px 22px rgba(255,194,75,.34)" }}>
            Un altro!
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALBUM DEGLI ADESIVI
// ═══════════════════════════════════════════════════════════════════════════
function Album({ vinti, animali = [], onIndietro, speak }) {
  const ferma = useRef(null);
  useEffect(() => () => ferma.current?.(), []);
  const riascolta = (a) => { ferma.current?.(); ferma.current = suonaVerso(a.verso, () => speak?.(a.nome)); };
  return (
    <Cornice titolo="Il tuo album" sottotitolo={`${vinti.length} adesivi su ${ADESIVI.length} · ${animali.length} animali su ${ANIMALI.length}`} onIndietro={onIndietro}>
      <div style={{ fontSize: 11, opacity: .55, fontWeight: 800, letterSpacing: 1, margin: "2px 0 8px" }}>I TUOI ANIMALI</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 18 }}>
        {ANIMALI.map(a => {
          const preso = animali.includes(a.id);
          return (
            <button key={a.id} onClick={() => preso && riascolta(a)}
              aria-label={preso ? `${a.nome}: tocca per sentire il verso` : "Animale ancora da trovare"}
              style={{ aspectRatio: "1", padding: 0, borderRadius: 14, overflow: "hidden", cursor: preso ? "pointer" : "default",
                border: preso ? "2px solid rgba(255,194,75,.6)" : "2px dashed rgba(255,255,255,.12)", background: "rgba(0,0,0,.24)",
                display: "flex", alignItems: "center", justifyContent: "center", color: SG_PARCH }}>
              {preso
                ? <img src={a.cartone} alt="" loading="lazy" style={{ width: "82%", height: "82%", objectFit: "contain", display: "block" }} />
                : <span style={{ fontSize: 22, opacity: .35 }}>?</span>}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, opacity: .55, fontWeight: 800, letterSpacing: 1, margin: "0 0 8px" }}>I TUOI ADESIVI</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
        {ADESIVI.map(a => {
          const preso = vinti.includes(a.id);
          return (
            <button key={a.id} onClick={() => preso && speak?.(a.nome)}
              aria-label={preso ? a.nome : "Adesivo ancora da vincere"}
              style={{
                aspectRatio: "1", borderRadius: 20, cursor: preso ? "pointer" : "default",
                background: preso ? "rgba(255,194,75,.12)" : "rgba(0,0,0,.24)",
                border: `2px ${preso ? "solid" : "dashed"} ${preso ? "rgba(255,194,75,.5)" : "rgba(255,255,255,.12)"}`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                color: SG_PARCH, padding: 6,
              }}>
              <div style={{ fontSize: 38, filter: preso ? "none" : "grayscale(1) brightness(.35)", opacity: preso ? 1 : .5 }}>
                {preso ? a.emoji : "?"}
              </div>
              <div style={{ fontSize: 10, opacity: preso ? .85 : .35, textAlign: "center", lineHeight: 1.2 }}>
                {preso ? a.nome : "???"}
              </div>
            </button>
          );
        })}
      </div>
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPALE
// ═══════════════════════════════════════════════════════════════════════════
// Anteprima cartoon di ogni gioco nell'hub (al posto dell'icona piatta)
function AnteprimaGioco({ id, colore, icona }) {
  const hd = (e, st) => <img src={emoji3dHd(e)} alt="" aria-hidden="true" draggable={false} style={{ position: "absolute", objectFit: "contain", ...st }} />;
  const box = { position: "relative", width: 54, height: 54 };
  if (id === "ombre") return (
    <div style={box}>
      {hd("🦊", { width: 34, height: 34, left: 16, top: 14, filter: "brightness(0) opacity(.45)" })}
      {hd("🦊", { width: 34, height: 34, left: 4, top: 4 })}
    </div>);
  if (id === "costruttore") return (
    <div style={box}>
      {hd("🐘", { width: 46, height: 46, left: 4, top: 4, clipPath: "inset(0 50% 0 0)" })}
      {hd("🐘", { width: 46, height: 46, left: 8, top: 1, clipPath: "inset(0 0 0 50%)", filter: "drop-shadow(0 2px 2px rgba(0,0,0,.5))" })}
    </div>);
  if (id === "indovina") return (
    <div style={box}>
      {hd("🦉", { width: 44, height: 44, left: 5, top: 5, clipPath: "inset(0 0 40% 0)" })}
      <span style={{ position: "absolute", right: 0, bottom: -2, fontFamily: FF_DISPLAY, fontSize: 24, color: SG_GOLD, textShadow: "0 2px 0 #27134F" }}>?</span>
    </div>);
  if (id === "incastro") return (
    <div style={box}>
      <img src={`${import.meta.env.BASE_URL}img/3d/isole-hd/castello.webp`} alt="" aria-hidden="true" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
    </div>);
  return <Icon name={icona} color={colore} size={28} />;
}

const GIOCHI = [
  { id: "ombre",       nome: "Ombre magiche",    desc: "Posa ogni cosa sulla sua ombra", icona: "mano",     colore: "#6DE0C6" },
  { id: "costruttore", nome: "Il Costruttore",   desc: "Rimetti insieme l'animale",       icona: "immagini", colore: "#FFC24B" },
  { id: "indovina",    nome: "Cosa si nasconde", desc: "Scopri e indovina",               icona: "lente",    colore: "#A78BFA" },
  { id: "incastro",    nome: "Puzzle a incastro",desc: "Ricomponi l'isola di un mondo", icona: "puzzle",   colore: "#F97316" },
];

// ── Ricompense: monete sì, stelle no ─────────────────────────────────────────
// Le stelle aprono i mondi e fanno salire di grado: se le desse anche il puzzle,
// un bambino potrebbe sbloccare tutti e otto i mondi senza aver mai risolto una
// sfida, e il motore adattivo — che si taratura su come risponde — resterebbe al
// buio. Le monete invece comprano solo cosmetici: nessun cancello, nessuna
// scorciatoia. È la stessa separazione che tiene Duolingo fra XP e gemme.
// Il tetto giornaliero evita che il puzzle diventi una macchinetta da monete.
const MONETE_PER_LIVELLO = { facile: 1, medio: 2, difficile: 3, mago: 4 };
const TETTO_MONETE_AL_GIORNO = 20;

// `barra`: la barra delle sezioni di Magistella. Si vede solo nell'hub: dentro
// un gioco il bambino è in un'attività e la barra lo distrarrebbe (come in una
// sfida). Senza `barra` (sezione usata da sola) torna la freccia per uscire.
export default function PuzzleMagico({ età = 5, speak, suona = null, sfx, onExit, onMonete, barra = null }) {
  useEffect(() => { _suonaEsterno = suona; return () => { _suonaEsterno = null; }; }, [suona]);
  const [salvato, setSalvato] = useState(loadSave);
  const [schermo, setSchermo] = useState("hub");
  const [livello, setLivello] = useState(() => livelloPerEtà(età));
  const [vittoria, setVittoria] = useState(null);
  const [seme, setSeme] = useState(0);   // cambiarlo rimescola soggetti e tagli
  const [animale, setAnimale] = useState(null);   // l'animale del puzzle in corso

  useEffect(() => { writeSave(salvato); }, [salvato]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- cambia il bambino: il livello riparte dalla sua età
  useEffect(() => { setLivello(livelloPerEtà(età)); }, [età]);

  const adesiviVinti = salvato.adesivi || [];
  const partite = salvato.partite || 0;
  const animaliFatti = salvato.animali || [];
  const tema = salvato.tema || "animali";
  const scegliTema = (t) => setSalvato(s => ({ ...s, tema: t }));
  // l'Incastro ricompone l'isola di un mondo (3D cartoon, HD), una nuova a ogni giro
  const soggettoIncastro = useMemo(() => {
    const sc = pick(SCENES);
    return { nome: sc.nome, src: `${import.meta.env.BASE_URL}img/3d/isole-hd/${sc.id}.webp` };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: isola nuova
  }, [seme]);
  // il Costruttore ricompone un soggetto del tema (in HD), uno nuovo a ogni giro
  const soggettoCostruttore = useMemo(() => {
    const c = pick(cosePerTema(tema, 1));
    return { nome: c.nome, src: emoji3dHd(c.emoji) };
  // eslint-disable-next-line react-hooks/exhaustive-deps -- seme cambia apposta: soggetto nuovo
  }, [seme, tema]);

  // il prossimo animale da proporre: prima quelli non ancora nell'album
  function prossimoAnimale(dopo) {
    const nuovi = ANIMALI.filter(a => !animaliFatti.includes(a.id) && a.id !== dopo?.id);
    return pick(nuovi.length ? nuovi : ANIMALI.filter(a => a.id !== dopo?.id));
  }

  function vinci(testo, animaleVinto = null) {
    const mancanti = ADESIVI.filter(a => !adesiviVinti.includes(a.id));
    // un adesivo nuovo ogni 2 partite, finché ce ne sono
    const nuovo = mancanti.length && partite % 2 === 1 ? pick(mancanti) : null;

    const oggi = new Date().toISOString().slice(0, 10);
    const giaOggi = salvato.moneteData === oggi ? (salvato.moneteOggi || 0) : 0;
    const valore = MONETE_PER_LIVELLO[livello.id] || 2;
    const monete = Math.max(0, Math.min(valore, TETTO_MONETE_AL_GIORNO - giaOggi));

    setSalvato(s => ({
      ...s,
      partite: (s.partite || 0) + 1,
      adesivi: nuovo ? [...adesiviVinti, nuovo.id] : adesiviVinti,
      animali: animaleVinto && !(s.animali || []).includes(animaleVinto.id) ? [...(s.animali || []), animaleVinto.id] : (s.animali || []),
      moneteData: oggi,
      moneteOggi: giaOggi + monete,
    }));
    if (monete) onMonete?.(monete);
    sfx?.victory?.();
    // sul puzzle degli animali parla l'animale (verso + curiosità), non il "bravo" generico
    if (!animaleVinto) speak?.(nuovo ? "Bravissimo! Hai vinto un adesivo nuovo!" : "Bravissimo! Puzzle completato!");
    setVittoria({ testo, adesivo: nuovo, monete, animale: animaleVinto });
  }

  const chiudi = () => { setVittoria(null); setSchermo("hub"); };
  const ancora = () => { setVittoria(null); setSeme(n => n + 1); };

  if (schermo === "album")
    return <Album vinti={adesiviVinti} animali={animaliFatti} onIndietro={() => setSchermo("hub")} speak={speak} />;

  if (schermo === "animali")
    return <SceltaAnimale completati={animaliFatti} speak={speak} sfx={sfx}
      onIndietro={() => setSchermo("hub")}
      onScegli={(a) => { setAnimale(a); setSeme(n => n + 1); setSchermo("animale"); }} />;

  const comuni = {
    livello, seme, speak, sfx,
    onIndietro: () => setSchermo("hub"),
    onLivello: setLivello,
  };

  let gioco = null;
  if (schermo === "costruttore")
    gioco = <GiocoSagomato {...comuni} soggetto={soggettoCostruttore} griglia={livello.costruttore} linguette={false}
      titolo="Il Costruttore" consegna="Rimetti insieme i pezzi!"
      onNuovo={() => setSeme(n => n + 1)}
      onVinto={(sc) => vinci(`Hai ricostruito: ${sc.nome}!`)} />;
  if (schermo === "incastro")
    gioco = <GiocoSagomato {...comuni} soggetto={soggettoIncastro} griglia={livello.incastro}
      titolo="Puzzle a incastro" consegna="Trascina ogni pezzo al suo posto!"
      onNuovo={() => setSeme(n => n + 1)}
      onVinto={(sc) => vinci(`Puzzle completato: ${sc.nome}!`)} />;
  if (schermo === "animale" && animale)
    gioco = <GiocoSagomato {...comuni} soggetto={{ ...animale, src: animale.cartone }} griglia={livello.incastro}
      titolo="Puzzle degli animali" consegna="Rimetti insieme i pezzi dell'animale!"
      onIndietro={() => setSchermo("animali")}
      onNuovo={() => { setAnimale(prossimoAnimale(animale)); setSeme(n => n + 1); }}
      onVinto={() => vinci(animale.nome, animale)} />;
  if (schermo === "ombre" || schermo === "indovina")
    gioco = schermo === "ombre"
      ? <GiocoOmbre {...comuni} tema={tema} onVinto={() => vinci("Tutte al loro posto!")} />
      // key: a ogni turno il gioco riparte da zero. Prima, per mezzo secondo, le
      // tessere "scoperte" del turno precedente lasciavano vedere l'animale nuovo.
      : <GiocoIndovina key={`indovina-${seme}-${tema}-${livello.id}`} {...comuni} tema={tema} onVinto={(risparmiati) => vinci(risparmiati > 0 ? `Indovinato con ${risparmiati} pezzi ancora coperti!` : "Indovinato!")} />;

  if (gioco) return (
    <>
      {gioco}
      {vittoria && !vittoria.animale && <Vittoria testo={vittoria.testo} adesivo={vittoria.adesivo} monete={vittoria.monete} onAncora={ancora} onEsci={chiudi} />}
      {vittoria?.animale && (
        <VittoriaAnimale animale={vittoria.animale} monete={vittoria.monete} adesivo={vittoria.adesivo} speak={speak}
          onAltri={() => { setVittoria(null); setSchermo("animali"); }}
          onAncora={() => { setVittoria(null); setAnimale(prossimoAnimale(vittoria.animale)); setSeme(n => n + 1); }} />
      )}
    </>
  );

  // ── HUB ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "var(--vvh,100dvh)", background: SG_BG, color: SG_PARCH,
      maxWidth: LARGHEZZA_MAX, margin: "0 auto",
      padding: barra ? "18px 16px calc(100px + env(safe-area-inset-bottom,0px))" : "18px 16px max(env(safe-area-inset-bottom,0px),24px)",
      isolation: "isolate",
    }}>
      {barra}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        {!barra && (
          <button onClick={onExit} aria-label="Torna alla mappa"
            style={{ background: "rgba(255,255,255,.10)", border: "none", color: SG_PARCH, borderRadius: 14, padding: "10px 14px", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>
            ←
          </button>
        )}
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: FF_DISPLAY, fontSize: 26, fontWeight: 400, margin: 0, color: SG_GOLD, lineHeight: 1.1 }}>Puzzle Magico</h1>
          <div style={{ fontSize: 12, opacity: .7 }}>Cinque giochi per costruire, incastrare e indovinare</div>
        </div>
      </div>

      {/* in evidenza: il puzzle degli animali, con tre foto in anteprima */}
      <button onClick={() => { sfx?.tap?.(); setSchermo("animali"); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left", marginBottom: 14,
          background: "linear-gradient(135deg,rgba(255,194,75,.22),rgba(249,115,22,.16))",
          border: "2px solid rgba(255,194,75,.55)", borderRadius: 24, padding: "14px 16px",
          cursor: "pointer", color: SG_PARCH, boxShadow: "0 6px 26px rgba(0,0,0,.28)",
        }}>
        <div style={{ position: "relative", width: 86, height: 62, flexShrink: 0 }} aria-hidden="true">
          {ANIMALI.slice(0, 3).map((a, i) => (
            <img key={a.id} src={a.cartone} alt="" loading="lazy"
              style={{ position: "absolute", left: i * 20, top: i % 2 ? 10 : 0, width: 52, height: 52, objectFit: "contain",
                filter: "drop-shadow(0 3px 5px rgba(0,0,0,.5))", rotate: `${(i - 1) * 8}deg` }} />
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: FF_DISPLAY, fontSize: 19, color: SG_GOLD, marginBottom: 2 }}>Puzzle degli animali</div>
          <div style={{ fontSize: 12.5, opacity: .8 }}>Ricomponi l'animale e senti il suo verso · {animaliFatti.length}/{ANIMALI.length}</div>
        </div>
        <div style={{ fontSize: 20, opacity: .5 }}>›</div>
      </button>

      {/* tema di Ombre e "Cosa si nasconde" */}
      <div style={{ fontSize: 11, opacity: .55, fontWeight: 800, letterSpacing: 1, margin: "0 0 6px" }}>TEMA DEI GIOCHI</div>
      <div role="radiogroup" aria-label="Tema dei giochi" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 12 }}>
        {[...TEMI.map(t => ({ id: t.id, nome: t.nome, icona: t.icona })), { id: "tutti", nome: "Tutti", icona: "🎲" }].map(t => {
          const on = t.id === tema;
          return (
            <button key={t.id} role="radio" aria-checked={on} onClick={() => { sfx?.tap?.(); scegliTema(t.id); }}
              style={{ flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", minHeight: 44, borderRadius: 30,
                cursor: "pointer", fontFamily: FF, fontSize: 13, fontWeight: 800,
                background: on ? SG_GOLD_GRAD : "rgba(255,255,255,.07)", color: on ? SG_INK : SG_PARCH,
                border: on ? "none" : "1px solid rgba(255,194,75,.18)" }}>
              <span aria-hidden="true">{t.icona}</span>{t.nome}
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gap: 12, marginBottom: 16 }}>
        {GIOCHI.map(g => (
          <button key={g.id} onClick={() => { sfx?.tap?.(); setSchermo(g.id); }}
            style={{
              display: "flex", alignItems: "center", gap: 16, textAlign: "left",
              background: SG_CARD, border: SG_BR, borderRadius: 24, padding: "18px 18px",
              cursor: "pointer", color: SG_PARCH,
              boxShadow: "0 6px 26px rgba(0,0,0,.28)",
            }}>
            <div style={{
              width: 54, height: 54, borderRadius: 18, flexShrink: 0,
              background: `${g.colore}1f`, border: `1.5px solid ${g.colore}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <AnteprimaGioco id={g.id} colore={g.colore} icona={g.icona} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: FF_DISPLAY, fontSize: 18, marginBottom: 3 }}>{g.nome}</div>
              <div style={{ fontSize: 12.5, opacity: .7 }}>{g.desc}</div>
            </div>
            <div style={{ fontSize: 20, opacity: .35 }}>›</div>
          </button>
        ))}
      </div>

      <button onClick={() => { sfx?.tap?.(); setSchermo("album"); }}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 14, textAlign: "left",
          background: "linear-gradient(135deg,rgba(255,194,75,.16),rgba(255,122,0,.10))",
          border: "2px solid rgba(255,194,75,.42)", borderRadius: 24, padding: "16px 18px",
          cursor: "pointer", color: SG_PARCH,
        }}>
        <Icon name="gift" color={SG_GOLD} size={34} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FF_DISPLAY, fontSize: 17 }}>Il tuo album</div>
          <div style={{ fontSize: 12, opacity: .7 }}>
            {adesiviVinti.length} adesivi su {ADESIVI.length} — vinci una partita per collezionarne altri
          </div>
        </div>
        <div style={{ fontFamily: FF_NUM, fontWeight: 800, fontSize: 20, color: SG_GOLD }}>
          {adesiviVinti.length}
        </div>
      </button>
    </div>
  );
}
