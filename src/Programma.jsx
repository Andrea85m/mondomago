// ─────────────────────────────────────────────────────────────────────────────
// IL PROGRAMMA — nell'area genitori, per genitori e insegnanti.
//
// Due domande a cui risponde:
//   1. "A che punto è?"      → il sentiero di ogni mondo (tappa e medaglia)
//   2. "Cosa sta imparando?" → gli obiettivi del curricolo (Indicazioni Nazionali,
//      campo `obiettivo` delle sfide, ricondotto ai 70 obiettivi curati di
//      data/obiettivi.js) per la sua età, divisi per materia, con
//      quelli già incontrati e quelli su cui sta ancora lavorando.
// Le sfide più vecchie non hanno `obiettivo`: contano nella materia ricavata dal
// loro `type`, ma non compaiono nell'elenco degli obiettivi.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { ALL_CHALLENGES } from "./data/sfide.js";
import { WORLDS } from "./data/mondi.js";
import { isola3d } from "./data/grafica3d.js";
import { OBIETTIVI, OBIETTIVO_DI } from "./data/obiettivi.js";

const AREE = [
  { id: "mat", nome: "Matematica", colore: "#60A5FA" },
  { id: "ita", nome: "Italiano e linguaggio", colore: "#F472B6" },
  { id: "mondo", nome: "Logica e conoscenza del mondo", colore: "#FFC24B" },
  { id: "sci", nome: "Scienze", colore: "#34D399" },
  { id: "tec", nome: "Tecnologia e coding", colore: "#6DE0C6" },
  { id: "sé", nome: "Emozioni e cittadinanza", colore: "#FB923C" },
  { id: "arte", nome: "Arte, musica e corpo", colore: "#C084FC" },
];

const obiettivoDi = (c) => (c.obiettivo && OBIETTIVI[OBIETTIVO_DI[c.obiettivo]]) ? OBIETTIVO_DI[c.obiettivo] : null;

function areaDi(c) {
  const ob = obiettivoDi(c);
  if (ob) return OBIETTIVI[ob].area;
  const t = c.type;
  if (t === "numeri" || t === "conteggio" || t === "geometria") return "mat";
  if (t === "parole") return "ita";
  if (["coding", "debug", "condizione", "sequenza"].includes(t)) return "tec";
  if (t === "empatia") return "sé";
  if (t === "creativita") return "arte";
  return "mondo";
}

export default function Programma({ childName, childAge, percorso, visti, missed, tappe, medaglie, stile }) {
  const [aperta, setAperta] = useState(null);
  const { P_CARD, P_TILE, P_BR, GOLD, PARCH } = stile;
  const eta = childAge || 5;
  const daRipassare = new Set((missed || []).map(m => m.id));

  // sfide della sua età, in tutti i mondi
  const sue = Object.values(ALL_CHALLENGES).flat().filter(c => c.ageMin <= eta && c.ageMax >= eta);
  const perArea = AREE.map(a => {
    const qui = sue.filter(c => areaDi(c) === a.id);
    const obiettivi = new Map();                         // id → { testo, livello, visto, ripasso }
    for (const c of qui) {
      const id = obiettivoDi(c);
      if (!id) continue;
      const o = obiettivi.get(id) || { ...OBIETTIVI[id], visto: false, ripasso: false };
      if (visti?.[c.id] !== undefined) o.visto = true;
      if (daRipassare.has(c.id)) o.ripasso = true;
      obiettivi.set(id, o);
    }
    const lista = [...obiettivi.values()].sort((x, y) => (y.ripasso - x.ripasso) || (y.visto - x.visto) || x.testo.localeCompare(y.testo, "it"));
    return { ...a, totale: qui.length, viste: qui.filter(c => visti?.[c.id] !== undefined).length, lista };
  }).filter(a => a.totale > 0);

  const titolo = (t) => <div style={{ fontSize: 11, fontWeight: 800, opacity: .5, marginBottom: 12, letterSpacing: 1 }}>{t}</div>;

  return (
    <>
      {/* 1 · il sentiero di ogni mondo */}
      <section aria-label="Il sentiero dei mondi" style={{ background: P_CARD, border: P_BR, borderRadius: 20, padding: "16px 18px", marginBottom: 14 }}>
        {titolo("IL SENTIERO DEI MONDI")}
        <p style={{ fontSize: 11, opacity: .6, margin: "0 0 12px", lineHeight: 1.5 }}>
          Ogni mondo ha {tappe} tappe brevi. Finito il sentiero si riparte con la medaglia successiva
          (Bronzo, Argento, Oro) e le sfide diventano più difficili.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 8 }}>
          {WORLDS.map(w => {
            const s = percorso?.[w.id] || { tappa: 0, livello: 1 };
            const m = medaglie[Math.min(s.livello, medaglie.length) - 1];   // dopo l'Oro si ricomincia in Oro
            return (
              <div key={w.id} style={{ background: P_TILE, borderRadius: 14, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <img src={isola3d(w.id)} alt="" width={34} height={34} style={{ objectFit: "contain", flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{w.name}</div>
                  <div style={{ fontSize: 10, color: m.colore, fontWeight: 700 }}>
                    {`${m.nome} · tappa ${s.tappa + 1}/${tappe}`}
                  </div>
                  <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 4, height: 4, marginTop: 4 }}>
                    <div style={{ background: m.colore, height: "100%", borderRadius: 4, width: `${(s.tappa / tappe) * 100}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2 · cosa sta imparando, per materia */}
      <section aria-label="Cosa sta imparando" style={{ background: P_CARD, border: P_BR, borderRadius: 20, padding: "16px 18px", marginBottom: 14 }}>
        {titolo(`COSA STA IMPARANDO · ${eta} ANNI`)}
        <p style={{ fontSize: 11, opacity: .6, margin: "0 0 12px", lineHeight: 1.5 }}>
          Le attività seguono i traguardi delle Indicazioni Nazionali (scuola dell'infanzia e primi anni
          della primaria). Tocca una materia per vedere gli obiettivi: <b style={{ color: "#6DE0C6" }}>✓</b> già
          incontrati, <b style={{ color: GOLD }}>●</b> {childName} ci sta ancora lavorando.
        </p>
        {perArea.map(a => {
          const pct = Math.round((a.viste / a.totale) * 100);
          const su = aperta === a.id;
          return (
            <div key={a.id} style={{ marginBottom: 8 }}>
              <button onClick={() => setAperta(su ? null : a.id)} aria-expanded={su}
                style={{ width: "100%", minHeight: 44, background: P_TILE, border: "none", borderRadius: 12, padding: "8px 12px", color: PARCH, textAlign: "left", cursor: "pointer", font: "inherit" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 700 }}>{a.nome}</span>
                  <span style={{ opacity: .7 }}>{a.viste}/{a.totale} attività {su ? "▴" : "▾"}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 4, height: 6 }}>
                  <div style={{ background: a.colore, height: "100%", borderRadius: 4, width: `${pct}%`, transition: "width .6s" }} />
                </div>
              </button>
              {su && (
                <ul style={{ listStyle: "none", margin: "6px 0 4px", padding: "0 6px", fontSize: 12, lineHeight: 1.45 }}>
                  {a.lista.length === 0 && <li style={{ opacity: .6 }}>Attività di esercizio libero, senza un obiettivo specifico.</li>}
                  {a.lista.map(o => (
                    <li key={o.testo} style={{ display: "flex", gap: 8, padding: "3px 0", opacity: o.visto || o.ripasso ? 1 : .55 }}>
                      <span aria-hidden="true" style={{ width: 12, flexShrink: 0, color: o.ripasso ? GOLD : "#6DE0C6" }}>{o.ripasso ? "●" : o.visto ? "✓" : "·"}</span>
                      <span>{o.testo} <span style={{ fontSize: 10, opacity: .5 }}>({o.livello})</span></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
