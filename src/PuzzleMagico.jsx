// ─────────────────────────────────────────────────────────────────────────────
// PUZZLE MAGICO — la sezione puzzle di MondoMago
//
// Quattro giochi, sulla falsariga di "Puzzle Kids — Jigsaw Puzzles"
// (com.rvappstudios.jigsaw.puzzles.kids, 50M+ download, Teacher Approved):
//
//   Ombre        ← Shape Matching   · l'oggetto va sulla sua sagoma
//   Costruttore  ← Object Builder   · i pezzi ricompongono una figura
//   Indovina     ← Guess the Object · si scopre poco alla volta, si indovina
//   Incastro     ← Jigsaw Puzzles   · puzzle vero, a incastro, con la vaschetta
//
// Le immagini non arrivano da fuori: sono le 8 scene di WorldScene.jsx e le
// 150 illustrazioni di SvgAssets.jsx, già dentro il bundle. Zero KB di asset
// nuovi, e il puzzle ha la faccia dei mondi che il bambino già conosce.
//
// Il file è tutto suo: non tocca né la logica né i dati di MondoMago.jsx.
// Riceve `speak` e `sfx` come prop invece di importarli, così la sezione resta
// staccabile e non crea dipendenze incrociate.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useMemo, useRef, useCallback, useId } from "react";
import WorldScene from "./WorldScene.jsx";
import SvgAsset, { ASSET_MAP } from "./SvgAssets.jsx";
import { Icon } from "./icons.jsx";
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
// qui sono frammenti del Sigillo, che è il linguaggio di MondoMago.
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
function tagliaPuzzle(cols, rows, W, H) {
  const cw = W / cols, ch = H / rows;
  // segno delle linguette: verso destra e verso il basso si estraggono a caso,
  // il pezzo accanto eredita l'opposto — così i due bordi combaciano sempre
  const vert = Array.from({ length: rows }, () =>
    Array.from({ length: cols - 1 }, () => (Math.random() < 0.5 ? 1 : -1)));
  const oriz = Array.from({ length: rows - 1 }, () =>
    Array.from({ length: cols }, () => (Math.random() < 0.5 ? 1 : -1)));

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
      const sp = Math.max(cw, ch) * 0.23 * AMPIEZZA + 2;
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
// RASTERIZZAZIONE DELLA SCENA
// Le scene sono SVG con gradienti e id interni. Ritagliarle 20 volte a colpi
// di clipPath significherebbe 20 copie dello stesso disegno nel DOM (e id
// duplicati che si rubano i gradienti a vicenda). Si disegna una volta sola su
// canvas e i pezzi ritagliano quell'unica immagine.
// ═══════════════════════════════════════════════════════════════════════════
function useScenaRasterizzata(worldId, W, H) {
  const nascosto = useRef(null);
  const [url, setUrl] = useState(null);

  useEffect(() => {
    setUrl(null);
    const svg = nascosto.current?.querySelector("svg");
    if (!svg) return;
    let annullato = false;

    const clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", W);
    clone.setAttribute("height", H);
    const testo = new XMLSerializer().serializeToString(clone);
    const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(testo);

    const img = new Image();
    img.onload = () => {
      if (annullato) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cv = document.createElement("canvas");
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      const ctx = cv.getContext("2d");
      ctx.scale(dpr, dpr);
      ctx.drawImage(img, 0, 0, W, H);
      try { setUrl(cv.toDataURL("image/webp", 0.9)); }
      catch { setUrl(src); }              // se webp non c'è, si tiene l'SVG
    };
    img.onerror = () => { if (!annullato) setUrl(src); };
    img.src = src;
    return () => { annullato = true; };
  }, [worldId, W, H]);

  // il contenitore nascosto serve solo a far esistere l'SVG da serializzare
  const sorgente = (
    <div ref={nascosto} aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0, pointerEvents: "none" }}>
      <WorldScene worldId={worldId} variant="full" animated={false} />
    </div>
  );
  return [url, sorgente];
}

// ═══════════════════════════════════════════════════════════════════════════
// PEZZI CHE SI TRASCINANO — un gancio solo per tutti e tre i giochi che lo usano
// Funziona a dito e a mouse (Pointer Events), e anche a due tocchi: tocca il
// pezzo, tocca dove va. Sotto i 5 anni il trascinamento continuo è ancora
// incerto, e il doppio tocco salva la partita.
// ═══════════════════════════════════════════════════════════════════════════
function usaTrascinamento(svgRef, onRilascio) {
  const [preso, setPreso] = useState(null);   // { id, dx, dy, x, y }
  const presoRef = useRef(null);
  presoRef.current = preso;

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
function Cornice({ titolo, sottotitolo, onIndietro, azione, children }) {
  return (
    <div style={{
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
          <div style={{ fontFamily: FF_DISPLAY, fontSize: 20, color: SG_GOLD, lineHeight: 1.15 }}>{titolo}</div>
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
            flex: 1, padding: "9px 4px", borderRadius: 12, cursor: "pointer",
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

function Vittoria({ testo, adesivo, onAncora, onEsci }) {
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
function GiocoOmbre({ livello, seme, speak, sfx, onVinto, onIndietro, onLivello }) {
  const cose = useMemo(() => shuffle(TUTTE_LE_COSE).slice(0, livello.ombre), [livello, seme]);
  const vassoio = useMemo(() => shuffle(cose), [cose]);
  const [posati, setPosati] = useState({});     // emoji → true
  const [preso, setPreso] = useState(null);
  const [sbagliato, setSbagliato] = useState(null);
  const fatto = Object.keys(posati).length === cose.length;

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
// 2 · COSTRUTTORE  (Object Builder)
// La figura è divisa in tessere rettangolari. Le caselle vuote restano
// disegnate a tratteggio: si vede sempre dove manca un pezzo.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoCostruttore({ livello, seme, speak, sfx, onVinto, onIndietro, onLivello }) {
  const [cols, rows] = livello.costruttore;
  const scena = useMemo(() => pick(SCENES), [seme]);
  const LATO = 300, ALTO = Math.round(LATO * 240 / 400);
  const [url, sorgente] = useScenaRasterizzata(scena.id, LATO * 2, ALTO * 2);

  const caselle = useMemo(
    () => Array.from({ length: cols * rows }, (_, i) => i),
    [cols, rows],
  );
  const [vassoio, setVassoio] = useState([]);
  const [messi, setMessi] = useState({});     // casella → indice tessera
  const [preso, setPreso] = useState(null);
  const [errore, setErrore] = useState(null);

  useEffect(() => { setVassoio(shuffle(caselle)); setMessi({}); setPreso(null); }, [caselle, scena]);
  useEffect(() => {
    const t = setTimeout(() => speak?.("Rimetti a posto i pezzi dell'immagine!"), 350);
    return () => clearTimeout(t);
  }, [speak]);

  const tw = LATO / cols, th = ALTO / rows;
  const completo = Object.keys(messi).length === caselle.length;

  function posa(casella) {
    if (preso === null) return;
    if (preso === casella) {
      sfx?.correct?.();
      const n = { ...messi, [casella]: preso };
      setMessi(n);
      setVassoio(v => v.filter(i => i !== preso));
      setPreso(null);
      if (Object.keys(n).length === caselle.length) setTimeout(() => onVinto(scena), 520);
    } else {
      sfx?.wrong?.();
      setErrore(casella);
      setTimeout(() => setErrore(null), 400);
    }
  }

  const stiloTessera = (i, w, h) => ({
    width: w, height: h,
    backgroundImage: url ? `url(${url})` : "none",
    backgroundSize: `${LATO}px ${ALTO}px`,
    backgroundPosition: `-${(i % cols) * tw}px -${Math.floor(i / cols) * th}px`,
  });

  return (
    <Cornice titolo="Il Costruttore" sottotitolo={scena.nome} onIndietro={onIndietro}>
      {sorgente}
      <SceltaLivello valore={livello} onCambia={onLivello} />

      {/* Il fantasma dell'immagine sotto le caselle: senza, il tabellone è un
          rettangolo nero e il bambino non ha idea di cosa stia ricostruendo. */}
      <div style={{
        position: "relative", width: LATO, margin: "0 auto 20px",
        borderRadius: 16, overflow: "hidden", border: SG_BR, background: SG_TILE,
      }}>
      {url && <div aria-hidden style={{
        position: "absolute", inset: 0, backgroundImage: `url(${url})`,
        backgroundSize: "100% 100%", opacity: .17, pointerEvents: "none",
      }} />}
      <div style={{
        position: "relative",
        display: "grid", gridTemplateColumns: `repeat(${cols},${tw}px)`,
      }}>
        {caselle.map(i => {
          const pieno = messi[i] !== undefined;
          const err = errore === i;
          return (
            <button key={i} onClick={() => posa(i)}
              aria-label={pieno ? "Tessera al suo posto" : "Casella vuota"}
              style={{
                padding: 0, border: `1px ${pieno ? "solid rgba(0,0,0,0)" : "dashed rgba(255,194,75,.32)"}`,
                background: pieno ? "transparent" : err ? "rgba(239,68,68,.22)" : preso !== null ? "rgba(255,194,75,.10)" : "rgba(0,0,0,.22)",
                cursor: preso !== null ? "pointer" : "default", boxSizing: "border-box",
                transition: "background .2s",
                ...(pieno ? stiloTessera(i, tw, th) : { width: tw, height: th }),
              }} />
          );
        })}
      </div>
      </div>

      <div style={{ fontSize: 11, letterSpacing: 1.4, fontWeight: 800, opacity: .5, marginBottom: 8 }}>
        <Icon name="immagini" color={SG_GOLD} size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />
        TOCCA UN PEZZO, POI LA SUA CASELLA
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {vassoio.map(i => (
          <button key={i} onClick={() => { sfx?.tap?.(); setPreso(preso === i ? null : i); }}
            aria-label={`Pezzo ${i + 1}`} aria-pressed={preso === i}
            style={{
              padding: 0, borderRadius: 8, overflow: "hidden", cursor: "pointer",
              border: `2px solid ${preso === i ? SG_GOLD : "rgba(255,255,255,.14)"}`,
              transform: preso === i ? "scale(1.08)" : "none",
              transition: "all .18s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: preso === i ? "0 6px 20px rgba(255,194,75,.32)" : "none",
              ...stiloTessera(i, tw * 0.82, th * 0.82),
              backgroundSize: `${LATO * 0.82}px ${ALTO * 0.82}px`,
              backgroundPosition: `-${(i % cols) * tw * 0.82}px -${Math.floor(i / cols) * th * 0.82}px`,
            }} />
        ))}
      </div>
      {completo && <div aria-live="polite" className="sr-only">Immagine completata!</div>}
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 · INDOVINA  (Guess the Object)
// L'immagine è coperta da tessere. Ogni indizio ne scopre una. Si vince con
// meno indizi possibile: è lì che sta il gioco.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoIndovina({ livello, seme, speak, sfx, onVinto, onIndietro, onLivello }) {
  const n = livello.indovina;
  const cols = n <= 6 ? 3 : n <= 9 ? 3 : 4;
  const rows = Math.ceil(n / cols);

  const { soluzione, opzioni } = useMemo(() => {
    const s = pick(TUTTE_LE_COSE);
    const altri = shuffle(TUTTE_LE_COSE.filter(c => c.nome !== s.nome)).slice(0, 3);
    return { soluzione: s, opzioni: shuffle([s, ...altri]) };
  }, [seme]);

  const [scoperte, setScoperte] = useState([]);
  const [risposta, setRisposta] = useState(null);
  const ordine = useMemo(() => shuffle(Array.from({ length: cols * rows }, (_, i) => i)), [cols, rows, seme]);

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
        <SvgAsset emoji={soluzione.emoji} size={LATO - 24} />
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
                style={{ position: "absolute", top: 6, right: 7, padding: 4, lineHeight: 0, opacity: .55, cursor: "pointer" }}>
                <Icon name="audio" color={SG_GOLD} size={14} />
              </span>
            </button>
          );
        })}
      </div>
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 · INCASTRO  (Jigsaw)
// Il puzzle vero: pezzi con le linguette, vaschetta in basso, si trascinano
// col dito e scattano in posizione quando sono abbastanza vicini.
// ═══════════════════════════════════════════════════════════════════════════
function GiocoIncastro({ livello, seme, speak, sfx, onVinto, onIndietro, onLivello, onNuovaImmagine }) {
  const [cols, rows] = livello.incastro;
  const scena = useMemo(() => pick(SCENES), [seme]);

  const W = 360, H = Math.round(W * 240 / 400);
  const VASSOIO_Y = H + 26;
  const SCALA_VASSOIO = 0.56;
  const [url, sorgente] = useScenaRasterizzata(scena.id, W * 2, H * 2);
  const clipId = useId().replace(/:/g, "");

  const pezzi = useMemo(() => tagliaPuzzle(cols, rows, W, H), [cols, rows, seme]);
  const [posti, setPosti] = useState({});          // id → true
  const [dove, setDove] = useState({});            // id → {x,y} nel vassoio
  const [selezionato, setSelezionato] = useState(null);
  const svgRef = useRef(null);

  // disposizione iniziale nella vaschetta.
  // La cella deve contenere anche le linguette, altrimenti i pezzi dell'ultima
  // colonna escono dal bordo destro e si tagliano.
  useEffect(() => {
    const pw = (W / cols) * SCALA_VASSOIO;
    const ph = (H / rows) * SCALA_VASSOIO;
    const sporgenza = Math.max(pw, ph) * 0.23 * AMPIEZZA;
    const cellaW = pw + sporgenza * 2 + 6;
    const cellaH = ph + sporgenza * 2 + 6;
    const perRiga = Math.max(2, Math.floor(W / cellaW));
    const margine = (W - perRiga * cellaW) / 2 + cellaW / 2;
    const d = {};
    shuffle(pezzi).forEach((p, i) => {
      d[p.id] = {
        x: margine + (i % perRiga) * cellaW,
        y: VASSOIO_Y + Math.floor(i / perRiga) * cellaH + cellaH / 2,
      };
    });
    setDove(d);
    setPosti({});
    setSelezionato(null);
  }, [pezzi, cols, rows]);

  useEffect(() => {
    const t = setTimeout(() => speak?.("Trascina ogni pezzo al suo posto!"), 350);
    return () => clearTimeout(t);
  }, [speak]);

  const altezzaVassoio = useMemo(() => {
    const ys = Object.values(dove).map(p => p.y);
    return ys.length ? Math.max(...ys) + (H / rows) * SCALA_VASSOIO / 2 + 20 : VASSOIO_Y + 120;
  }, [dove, H, rows]);

  const centroCasa = (p) => ({ x: p.ax + p.cw / 2, y: p.ay + p.ch / 2 });
  const SCATTO = Math.max(26, Math.min(W / cols, H / rows) * 0.45);

  const rilascia = useCallback((s) => {
    const p = pezzi.find(q => q.id === s.id);
    if (!p) return;
    if (!s.mosso) { setSelezionato(sel => (sel === s.id ? null : s.id)); sfx?.tap?.(); return; }
    const casa = centroCasa(p);
    if (Math.hypot(s.x - casa.x, s.y - casa.y) < SCATTO) {
      sfx?.correct?.();
      setDove(d => ({ ...d, [s.id]: casa }));
      setPosti(pz => {
        const n = { ...pz, [s.id]: true };
        if (Object.keys(n).length === pezzi.length) setTimeout(() => onVinto(scena), 560);
        return n;
      });
    } else {
      setDove(d => ({ ...d, [s.id]: { x: clamp(s.x, 10, W - 10), y: clamp(s.y, 10, altezzaVassoio - 10) } }));
    }
  }, [pezzi, SCATTO, sfx, onVinto, scena, altezzaVassoio]);

  const { preso, inizia, muovi, finisci } = usaTrascinamento(svgRef, rilascia);

  // due tocchi: pezzo selezionato + tocco sul tabellone
  function toccaTabellone(e) {
    if (!selezionato) return;
    const p = pezzi.find(q => q.id === selezionato);
    if (!p) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const loc = pt.matrixTransform(svg.getScreenCTM().inverse());
    const casa = centroCasa(p);
    if (Math.hypot(loc.x - casa.x, loc.y - casa.y) < SCATTO * 1.6) {
      sfx?.correct?.();
      setDove(d => ({ ...d, [p.id]: casa }));
      setSelezionato(null);
      setPosti(pz => {
        const n = { ...pz, [p.id]: true };
        if (Object.keys(n).length === pezzi.length) setTimeout(() => onVinto(scena), 560);
        return n;
      });
    } else { sfx?.wrong?.(); }
  }

  const messi = Object.keys(posti).length;

  return (
    <Cornice titolo="Puzzle a incastro" sottotitolo={`${scena.nome} · ${messi}/${pezzi.length} pezzi`}
      onIndietro={onIndietro}
      azione={
        <button onClick={onNuovaImmagine} aria-label="Nuova immagine"
          style={{ background: "rgba(255,255,255,.10)", border: "none", color: SG_PARCH, borderRadius: 14, padding: "10px 12px", cursor: "pointer", flexShrink: 0 }}>
          <Icon name="ricomincia" color={SG_GOLD} size={18} />
        </button>
      }>
      {sorgente}
      <SceltaLivello valore={livello} onCambia={onLivello} />

      <svg ref={svgRef}
        viewBox={`0 0 ${W} ${altezzaVassoio}`}
        style={{ width: "100%", height: "auto", touchAction: "none", display: "block" }}
        onPointerMove={muovi} onPointerUp={finisci} onPointerCancel={finisci}>
        <defs>
          {url && <image id={`pic-${clipId}`} href={url} x="0" y="0" width={W} height={H} preserveAspectRatio="none" />}
          {pezzi.map(p => (
            <clipPath key={p.id} id={`c-${clipId}-${p.id}`}><path d={p.d} /></clipPath>
          ))}
        </defs>

        {/* il tabellone: sagome dei pezzi ancora da mettere */}
        <g onPointerDown={toccaTabellone}>
          <rect x="0" y="0" width={W} height={H} rx="14" fill="rgba(20,11,41,.55)" stroke="rgba(255,194,75,.22)" />
          {url && <image href={url} x="0" y="0" width={W} height={H} opacity="0.13" preserveAspectRatio="none" />}
          {pezzi.map(p => (
            <path key={p.id} d={p.d} fill="none"
              stroke={selezionato === p.id ? SG_GOLD : "rgba(255,194,75,.20)"}
              strokeWidth={selezionato === p.id ? 2.2 : 1}
              strokeDasharray={selezionato === p.id ? "5 3" : "none"} />
          ))}
        </g>

        {/* la vaschetta */}
        <rect x="0" y={VASSOIO_Y - 14} width={W} height={altezzaVassoio - VASSOIO_Y + 16} rx="14"
          fill="rgba(255,255,255,.035)" stroke="rgba(255,255,255,.07)" />

        {/* i pezzi: prima quelli a posto, poi quelli ancora in giro */}
        {[...pezzi].sort((a, b) => (posti[a.id] ? -1 : 1) - (posti[b.id] ? -1 : 1)).map(p => {
          const messo = posti[p.id];
          const trascinato = preso?.id === p.id;
          const pos = trascinato ? { x: preso.x, y: preso.y } : (dove[p.id] || centroCasa(p));
          const s = messo || trascinato ? 1 : SCALA_VASSOIO;
          const cx = p.ax + p.cw / 2, cy = p.ay + p.ch / 2;
          return (
            <g key={p.id}
              transform={`translate(${pos.x - cx * s} ${pos.y - cy * s}) scale(${s})`}
              onPointerDown={messo ? undefined : (e) => { e.stopPropagation(); inizia(e, p.id, pos.x, pos.y); }}
              style={{ cursor: messo ? "default" : "grab", touchAction: "none" }}
              role={messo ? undefined : "button"}
              aria-label={messo ? undefined : `Pezzo ${p.r + 1}-${p.c + 1}`}>
              {url && (
                <g clipPath={`url(#c-${clipId}-${p.id})`}>
                  <image href={url} x="0" y="0" width={W} height={H} preserveAspectRatio="none" />
                </g>
              )}
              <path d={p.d} fill="none"
                stroke={trascinato ? SG_GOLD : messo ? "rgba(255,255,255,.14)" : "rgba(255,255,255,.42)"}
                strokeWidth={trascinato ? 2.4 / s : 1.2 / s}
                style={{ filter: trascinato ? "drop-shadow(0 6px 14px rgba(0,0,0,.55))" : messo ? "none" : "drop-shadow(0 2px 5px rgba(0,0,0,.45))" }} />
            </g>
          );
        })}
      </svg>

      <div style={{ fontSize: 11, opacity: .45, textAlign: "center", marginTop: 8 }}>
        Trascina un pezzo sul tabellone — oppure toccalo e poi tocca dove va.
      </div>
    </Cornice>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// ALBUM DEGLI ADESIVI
// ═══════════════════════════════════════════════════════════════════════════
function Album({ vinti, onIndietro, speak }) {
  return (
    <Cornice titolo="Il tuo album" sottotitolo={`${vinti.length} adesivi su ${ADESIVI.length}`} onIndietro={onIndietro}>
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
const GIOCHI = [
  { id: "ombre",       nome: "Ombre magiche",    desc: "Posa ogni cosa sulla sua ombra", icona: "mano",     colore: "#6DE0C6" },
  { id: "costruttore", nome: "Il Costruttore",   desc: "Rimetti insieme la figura",       icona: "immagini", colore: "#FFC24B" },
  { id: "indovina",    nome: "Cosa si nasconde", desc: "Scopri e indovina",               icona: "lente",    colore: "#A78BFA" },
  { id: "incastro",    nome: "Puzzle a incastro",desc: "Il puzzle vero, pezzo per pezzo", icona: "puzzle",   colore: "#F97316" },
];

export default function PuzzleMagico({ età = 5, speak, sfx, onExit }) {
  const [salvato, setSalvato] = useState(loadSave);
  const [schermo, setSchermo] = useState("hub");
  const [livello, setLivello] = useState(() => livelloPerEtà(età));
  const [vittoria, setVittoria] = useState(null);
  const [seme, setSeme] = useState(0);   // cambiarlo rimescola soggetti e tagli

  useEffect(() => { writeSave(salvato); }, [salvato]);
  useEffect(() => { setLivello(livelloPerEtà(età)); }, [età]);

  const adesiviVinti = salvato.adesivi || [];
  const partite = salvato.partite || 0;

  function vinci(testo) {
    const mancanti = ADESIVI.filter(a => !adesiviVinti.includes(a.id));
    // un adesivo nuovo ogni 2 partite, finché ce ne sono
    const nuovo = mancanti.length && partite % 2 === 1 ? pick(mancanti) : null;
    setSalvato(s => ({
      ...s,
      partite: (s.partite || 0) + 1,
      adesivi: nuovo ? [...adesiviVinti, nuovo.id] : adesiviVinti,
    }));
    sfx?.victory?.();
    speak?.(nuovo ? "Bravissimo! Hai vinto un adesivo nuovo!" : "Bravissimo! Puzzle completato!");
    setVittoria({ testo, adesivo: nuovo });
  }

  const chiudi = () => { setVittoria(null); setSchermo("hub"); };
  const ancora = () => { setVittoria(null); setSeme(n => n + 1); };

  if (schermo === "album")
    return <Album vinti={adesiviVinti} onIndietro={() => setSchermo("hub")} speak={speak} />;

  const comuni = {
    livello, seme, speak, sfx,
    onIndietro: () => setSchermo("hub"),
    onLivello: setLivello,
  };

  let gioco = null;
  if (schermo === "ombre")
    gioco = <GiocoOmbre {...comuni} onVinto={() => vinci("Tutte al loro posto!")} />;
  if (schermo === "costruttore")
    gioco = <GiocoCostruttore {...comuni} onVinto={(sc) => vinci(`Hai ricostruito ${sc.nome}!`)} />;
  if (schermo === "indovina")
    gioco = <GiocoIndovina {...comuni} onVinto={(risparmiati) => vinci(risparmiati > 0 ? `Indovinato con ${risparmiati} pezzi ancora coperti!` : "Indovinato!")} />;
  if (schermo === "incastro")
    gioco = <GiocoIncastro {...comuni} onNuovaImmagine={() => setSeme(n => n + 1)} onVinto={(sc) => vinci(`${sc.nome} completata!`)} />;

  if (gioco) return (
    <>
      {gioco}
      {vittoria && <Vittoria testo={vittoria.testo} adesivo={vittoria.adesivo} onAncora={ancora} onEsci={chiudi} />}
    </>
  );

  // ── HUB ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "var(--vvh,100dvh)", background: SG_BG, color: SG_PARCH,
      padding: "18px 16px max(env(safe-area-inset-bottom,0px),24px)", isolation: "isolate",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <button onClick={onExit} aria-label="Torna alla mappa"
          style={{ background: "rgba(255,255,255,.10)", border: "none", color: SG_PARCH, borderRadius: 14, padding: "10px 14px", cursor: "pointer", fontSize: 15, fontWeight: 800 }}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: FF_DISPLAY, fontSize: 26, color: SG_GOLD, lineHeight: 1.1 }}>Puzzle Magico</div>
          <div style={{ fontSize: 12, opacity: .7 }}>Quattro giochi per costruire, incastrare e indovinare</div>
        </div>
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
              <Icon name={g.icona} color={g.colore} size={28} />
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
