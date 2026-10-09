// ─────────────────────────────────────────────────────────────────────────────
// Il sentiero che si vede mentre si gioca (feedback di Andrea, 7 Ott 2026:
// "alla fine di ogni esercizio fammi vedere a che punto del percorso sei
// arrivato per raggiungere la prossima tappa").
//
//   <SentieroTappa>     in cima alla sfida, al posto della barra: da questa
//                       tappa alla prossima, il compagno fa un passo a ogni
//                       risposta.
//   <SentieroFineTappa> a fine tappa: tutto il sentiero del mondo, il compagno
//                       cammina fino alla tappa che si è appena aperta.
//
// Il compagno arriva come prop (`avatar`): CompanionAvatar vive in Magistella.jsx.
// Con "riduci animazioni" (area genitori o sistema) le transizioni sono spente
// dal CSS globale di AnimationStyles: il compagno compare già al suo posto.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { premio3d, ui3d } from "./data/grafica3d.js";

const INK = "#27134F";
const ORO = "linear-gradient(180deg,#FFE08A,#F5A623)";
const VIOLA = "linear-gradient(180deg,#B39BFF,#6D42F2)";
const CHIUSA = "linear-gradient(180deg,#5A4A86,#3A2D63)";

/** Il simbolo di una tappa: corona per il boss, coppa per l'ultima, numero per le altre. */
function Simbolo({ i, totale, boss, lato, spento = false }) {
  const filtro = spento ? "grayscale(.5) brightness(.85)" : "none";
  if (i === totale - 1) return <img src={premio3d("trophy")} alt="" style={{ width: lato * .66, height: lato * .66, objectFit: "contain", filter: filtro }} />;
  if (boss) return <img src={premio3d("royal-crown")} alt="" style={{ width: lato * .66, height: lato * .66, objectFit: "contain", filter: filtro }} />;
  return <span style={{ fontFamily: "'Grandstander',system-ui,sans-serif", fontWeight: 800, fontSize: lato * .42, color: spento ? "#D8CCFF" : INK, lineHeight: 1 }}>{i + 1}</span>;
}

/**
 * Da questa tappa alla prossima. `passi` = risposte date, `domande` = quante
 * ce ne sono. Nella Sfida del Giorno (`tappa` null) si va dal regalo alla stella.
 */
export function SentieroTappa({ tappa, totale, bossDi, passi, domande, avatar, coloreBoss = false }) {
  const giorno = tappa == null;
  const prossima = giorno ? null : tappa + 1;
  const frazione = domande ? Math.min(1, passi / domande) : 0;
  const fine = !giorno && prossima < totale;
  const etichetta = giorno
    ? `Sfida del Giorno, domanda ${Math.min(passi + 1, domande)} di ${domande}`
    : `Tappa ${tappa + 1} del sentiero, domanda ${Math.min(passi + 1, domande)} di ${domande}`;
  const pieno = coloreBoss ? "linear-gradient(90deg,#FF4444,#FF8800)" : "linear-gradient(90deg,#FFC24B,#FFE08A)";
  return (
    <div role="progressbar" aria-label={etichetta} aria-valuemin={0} aria-valuemax={domande} aria-valuenow={passi}
      style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 1, marginBottom: 14, paddingTop: 30 }}>
      {/* la tappa che si sta giocando */}
      <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: `3px solid ${INK}`, boxShadow: `0 3px 0 ${INK}`,
        background: VIOLA, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {giorno
          ? <img src={ui3d("gift-box")} alt="" style={{ width: 22, height: 22 }} />
          : <Simbolo i={tappa} totale={totale} boss={bossDi(tappa)} lato={28} />}
      </div>
      {/* il tratto di sentiero con un passo per domanda */}
      <div style={{ flex: 1, position: "relative", height: 12 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 4, borderTop: "4px dotted rgba(255,236,190,.38)" }} />
        <div style={{ position: "absolute", left: 0, top: 3, height: 6, borderRadius: 6, background: pieno,
          width: `${frazione * 100}%`, transition: "width .7s cubic-bezier(.22,1,.36,1)", boxShadow: "0 0 10px rgba(255,194,75,.55)" }} />
        {Array.from({ length: Math.max(0, domande - 1) }, (_, k) => {
          const fatto = k + 1 <= passi;
          return <span key={k} aria-hidden="true" style={{ position: "absolute", top: 1, left: `${((k + 1) / domande) * 100}%`, width: 10, height: 10, marginLeft: -5, borderRadius: "50%",
            background: fatto ? "#FFE08A" : "#3A2D63", border: `2px solid ${fatto ? "#F5A623" : "rgba(255,236,190,.35)"}`, transition: "background .3s" }} />;
        })}
        {/* il compagno: un passo avanti a ogni risposta, con un saltello */}
        {avatar && (
          <div aria-hidden="true" style={{ position: "absolute", bottom: 6, left: `${frazione * 100}%`, transform: "translateX(-50%)",
            transition: "left .7s cubic-bezier(.34,1.35,.64,1)" }}>
            <div key={passi} className={passi > 0 ? "mg-saltello" : ""}>{avatar}</div>
          </div>
        )}
      </div>
      {/* la meta: la prossima tappa (o la stella, nella Sfida del Giorno) */}
      <div style={{ width: 34, height: 34, flexShrink: 0, borderRadius: "50%", border: `3px solid ${INK}`, boxShadow: `0 3px 0 ${INK}`,
        background: frazione >= 1 ? ORO : CHIUSA, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .4s" }}>
        {giorno || !fine
          ? <img src={premio3d(giorno ? "star" : "golden-star")} alt="" style={{ width: 22, height: 22 }} />
          : <Simbolo i={prossima} totale={totale} boss={bossDi(prossima)} lato={28} spento={frazione < 1} />}
      </div>
    </div>
  );
}

// Geometria del sentiero intero: zig-zag con tratti tutti uguali, così la scia
// d'oro (pathLength) arriva esattamente sui nodi.
const LARGO = 340, ALTO = 96, MARGINE = 20, SU = 34, GIU = 66;

/**
 * Tutto il sentiero del mondo a fine tappa. `fatti` = tappe completate (la
 * prossima da giocare ha indice `fatti`). Il compagno parte dalla tappa appena
 * finita e cammina fino a quella nuova.
 */
export function SentieroFineTappa({ fatti, totale, bossDi, avatar }) {
  const [arrivato, setArrivato] = useState(false);
  useEffect(() => { const t = setTimeout(() => setArrivato(true), 650); return () => clearTimeout(t); }, []);
  const passo = (LARGO - 2 * MARGINE) / (totale - 1);
  const nodo = (i) => ({ x: MARGINE + i * passo, y: i % 2 ? GIU : SU });
  const punti = Array.from({ length: totale }, (_, i) => nodo(i));
  const d = punti.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  const da = Math.max(0, fatti - 1), a = Math.min(totale - 1, fatti);
  const qui = arrivato ? a : da;
  const pc = (v, su) => `${(v / su) * 100}%`;
  return (
    <div style={{ width: "100%", maxWidth: 360, position: "relative", aspectRatio: `${LARGO} / ${ALTO + 30}`, margin: "6px auto 2px" }}
      role="img" aria-label={`Sentiero: ${fatti} tappe su ${totale}. ${a < totale ? `Ora si gioca la tappa ${a + 1}.` : ""}`}>
      <svg viewBox={`0 0 ${LARGO} ${ALTO + 30}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }} aria-hidden="true">
        <g transform="translate(0 30)">
          <path d={d} fill="none" stroke="rgba(255,236,190,.35)" strokeWidth="4" strokeDasharray="2 7" strokeLinecap="round" />
          <path d={d} fill="none" stroke="#FFC24B" strokeWidth="5" strokeLinecap="round" pathLength={totale - 1}
            strokeDasharray={`${qui} ${totale}`} style={{ transition: "stroke-dasharray .9s cubic-bezier(.22,1,.36,1)", filter: "drop-shadow(0 0 4px rgba(255,194,75,.7))" }} />
        </g>
      </svg>
      {punti.map((p, i) => {
        const fatta = i < fatti, attuale = i === a && fatti < totale, boss = bossDi(i) || i === totale - 1;
        const lato = boss ? 30 : attuale ? 24 : 20;
        return (
          <div key={i} aria-hidden="true"
            style={{ position: "absolute", left: pc(p.x, LARGO), top: pc(p.y + 30, ALTO + 30), width: lato, height: lato, transform: "translate(-50%,-50%)",
              borderRadius: "50%", border: `2.5px solid ${INK}`, boxShadow: `0 2px 0 ${INK}`,
              background: fatta ? ORO : attuale ? VIOLA : CHIUSA, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .4s" }}>
            {boss && <Simbolo i={i} totale={totale} boss lato={lato} spento={!fatta} />}
            {attuale && arrivato && <span className="pulse" style={{ position: "absolute", inset: -8, borderRadius: "50%", border: "3px solid rgba(255,194,75,.7)" }} />}
            {i === fatti - 1 && <span className="pop-in" style={{ position: "absolute", inset: -7, borderRadius: "50%", border: "2px solid rgba(255,224,138,.8)" }} />}
          </div>
        );
      })}
      {avatar && (
        <div aria-hidden="true" style={{ position: "absolute", left: pc(punti[qui].x, LARGO), top: pc(punti[qui].y + 30, ALTO + 30),
          transform: "translate(-50%,-112%)", transition: "left .9s cubic-bezier(.34,1.25,.64,1), top .9s cubic-bezier(.34,1.25,.64,1)", zIndex: 2 }}>
          <div key={qui} className={arrivato ? "mg-saltello" : ""}>{avatar}</div>
        </div>
      )}
    </div>
  );
}
