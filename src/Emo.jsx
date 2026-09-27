import { emoji3d } from "./data/grafica3d.js";

// Divide un testo in grafemi, così "👨‍👩‍👧" o "❤️" restano interi.
const segmenta = (t) => typeof Intl?.Segmenter === "function"
  ? [...new Intl.Segmenter().segment(t)].map(s => s.segment)
  : Array.from(t);

/**
 * Mostra un testo sostituendo le emoji che hanno un'immagine 3D.
 * `size` è l'altezza dell'immagine: di default segue il carattere (1.25em).
 * Un testo fatto di una sola emoji diventa un'immagine grande quanto `size`.
 */
export default function Emo({ text, size, style }) {
  if (text == null) return null;
  const s = String(text);
  const parti = segmenta(s);
  if (!parti.some(p => emoji3d(p))) return s;
  const h = size ? `${size}px` : "1.25em";
  return (
    <span style={{ display: "inline", ...style }}>
      {parti.map((p, i) => {
        const src = emoji3d(p);
        if (!src) return p;
        return (
          <img key={i} src={src} alt={p} draggable={false} decoding="async"
            style={{ height: h, width: "auto", verticalAlign: size ? "middle" : "-0.28em",
              margin: "0 .04em", userSelect: "none", pointerEvents: "none",
              filter: "drop-shadow(0 2px 3px rgba(0,0,0,.28))" }} />
        );
      })}
    </span>
  );
}
