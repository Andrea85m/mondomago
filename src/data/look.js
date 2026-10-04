// ─────────────────────────────────────────────────────────────────────────────
// Look del compagno: dove va ogni accessorio.
//
// Prima gli accessori erano emoji in tre posti fissi (sopra, a destra, in alto a
// destra), uguali per tutti e cinque i compagni e per tutte le pose: la corona
// fluttuava sopra la testa, gli occhiali stavano di fianco alla guancia.
// Ora ogni compagno ha i suoi punti di aggancio (testa, occhi, orecchio, spalla)
// per ogni posa, in look.json, e gli accessori sono le immagini 3D del negozio.
//
// Le misure sono frazioni del riquadro quadrato del compagno, quindi valgono a
// qualunque dimensione. Controllo visivo: python3 scripts/look-prova.py, che
// usa questa stessa geometria (tenerle allineate).
// ─────────────────────────────────────────────────────────────────────────────

import LOOK from "./look.json";

export const OGGETTI = LOOK.oggetti;

/** Lo slot di un cosmetico: testa, viso, fiocco, spalla, sfondo, aura. */
export const slotDi = (id) => OGGETTI[id]?.slot || null;

/**
 * Il look salvato era una stringa (un cosmetico per compagno). Ora è una lista,
 * al massimo uno per slot: corona + occhiali + fiocco insieme.
 */
export function normalizzaLook(v) {
  const lista = Array.isArray(v) ? v : v ? [v] : [];
  const visti = new Set();
  return lista.filter(id => {
    const s = slotDi(id);
    if (!s || visti.has(s)) return false;
    visti.add(s);
    return true;
  });
}

/** Indossa o toglie un cosmetico: nello stesso slot il nuovo sostituisce il vecchio. */
export function alternaLook(v, id) {
  const look = normalizzaLook(v);
  if (look.includes(id)) return look.filter(x => x !== id);
  const s = slotDi(id);
  return [...look.filter(x => slotDi(x) !== s), id];
}

const gradi = (r) => r * 180 / Math.PI;

/**
 * Dove disegnare un cosmetico su un compagno in una posa.
 * Ritorna { x, y, w, rot, dietro } con x,y = angolo in alto a sinistra e w =
 * larghezza, tutto in frazioni del lato del riquadro; rot in gradi attorno al
 * centro dell'immagine. null se manca qualcosa (compagno o posa sconosciuti).
 */
export function posaOggetto(id, compagnoId, posa = "base") {
  const o = OGGETTI[id];
  const pose = LOOK.compagni[compagnoId];
  const a = pose?.[posa] || pose?.base;
  if (!o || !a) return null;

  const [xl, yl, xr, yr] = a.occhi;
  const inclinazione = gradi(Math.atan2(yr - yl, xr - xl));
  const [tx, ty, larghezzaTesta] = a.testa;

  switch (o.slot) {
    case "testa": {
      const w = larghezzaTesta * o.larg;
      const h = w * o.ar;
      return { x: tx - w / 2, y: ty - o.appoggio * h, w, rot: inclinazione + (o.rot || 0), dietro: false };
    }
    case "viso": {
      const d = Math.hypot(xr - xl, yr - yl);
      const w = d / o.lenti;
      const h = w * o.ar;
      const cx = (xl + xr) / 2, cy = (yl + yr) / 2;
      return { x: cx - w / 2, y: cy - o.lentiY * h, w, rot: inclinazione, dietro: false };
    }
    case "fiocco": {
      const [fx, fy, r] = a.fiocco;
      const w = o.larg, h = w * o.ar;
      return { x: fx - w / 2, y: fy - h / 2, w, rot: r, dietro: false };
    }
    case "spalla": {
      const [sx, sy] = a.spalla;
      const w = o.larg, h = w * o.ar;
      return { x: sx - w / 2, y: sy - h / 2, w, rot: 0, dietro: false };
    }
    case "sfondo": {
      const w = o.larg, h = w * o.ar;
      const base = (yl + yr) / 2 + o.sottoOcchi;
      return { x: tx - w / 2, y: base - h, w, rot: 0, dietro: true };
    }
    case "aura": {
      const w = o.larg, h = w * o.ar;
      if (o.suSpalla) {
        const [sx, sy] = a.spalla;
        return { x: sx - w / 2, y: sy - h / 2, w, rot: 0, dietro: false };
      }
      if (o.vicinoTesta) {
        const cx = tx + o.vicinoTesta[0], cy = ty + o.vicinoTesta[1];
        return { x: cx - w / 2, y: cy - h / 2, w, rot: 0, dietro: false };
      }
      const [cx, cy] = o.centro;
      return { x: cx - w / 2, y: cy - h / 2, w, rot: 0, dietro: true };
    }
    default:
      return null;
  }
}
