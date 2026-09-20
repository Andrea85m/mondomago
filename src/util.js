// Piccoli aiuti condivisi fra il gioco e i suoi dati.

/** Un elemento a caso dell'array. */
export function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ── Contrasto ─────────────────────────────────────────────────────────────────
// Serve dove una scritta finisce sopra un colore deciso dai dati delle sfide, non
// dal tema: le pasticche del selettore colori. Il bianco fisso andava bene sui
// colori scuri e spariva su quelli chiari — l'oro #CD9D07 dava 2.49:1, sotto il
// minimo di 4.5:1 che le WCAG chiedono a un testo di quella dimensione.

/** Luminanza relativa (WCAG 2.x) di un colore #rgb o #rrggbb. */
function luminanza(hex) {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const canale = i => {
    const v = parseInt(h.slice(i * 2, i * 2 + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canale(0) + 0.7152 * canale(1) + 0.0722 * canale(2);
}

/** Rapporto di contrasto fra due colori, da 1 (identici) a 21 (bianco su nero). */
export function contrasto(a, b) {
  const la = luminanza(a), lb = luminanza(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Il colore di scritta che si legge meglio sopra `sfondo`: inchiostro scuro sui
 * colori chiari, pergamena su quelli scuri. Sceglie confrontando il contrasto vero
 * dei due, non una soglia di luminanza approssimata.
 */
export function inchiostroSu(sfondo, scuro = '#1B1035', chiaro = '#FFFFFF') {
  try {
    return contrasto(sfondo, scuro) >= contrasto(sfondo, chiaro) ? scuro : chiaro;
  } catch {
    return chiaro;
  }
}
