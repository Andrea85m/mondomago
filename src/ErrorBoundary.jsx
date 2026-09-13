import { Component } from "react";
import { FF_DISPLAY, SG_BG, SG_BR, SG_CARD, SG_GOLD, SG_GOLD_GRAD, SG_INK, SG_PARCH } from "./sigillo.js";

// ─────────────────────────────────────────────────────────────────────────────
// Rete di sicurezza per gli errori di render.
//
// Senza, un solo errore dentro una schermata smonta tutta l'app e il bambino
// resta davanti a una pagina vuota, senza sapere che basta ricaricare.
// I progressi non si perdono: il profilo si salva a ogni stella, non all'uscita.
//
// Uso:
//   <ErrorBoundary>…</ErrorBoundary>                          schermata intera
//   <ErrorBoundary etichetta="Torna alla mappa" onReset={…}>…  pulsante su misura
//   <ErrorBoundary fallback={reset => …}>…                     fallback su misura
// ─────────────────────────────────────────────────────────────────────────────

// Dopo un deploy, una pagina aperta da prima può chiedere un chunk (es. la
// sezione Puzzle) che sul server non esiste più. Non è un bug del codice:
// un ricaricamento prende la versione nuova.
const CHUNK_ERROR = /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i;
const RELOAD_FLAG = "mondomago_chunk_reload";

function reloadOnceForStaleChunk(error) {
  if (!CHUNK_ERROR.test(String(error?.message ?? error))) return false;
  try {
    // una volta sola per sessione: se il chunk manca davvero, niente loop
    if (sessionStorage.getItem(RELOAD_FLAG)) return false;
    sessionStorage.setItem(RELOAD_FLAG, "1");
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    reloadOnceForStaleChunk(error);
  }

  reset = () => {
    this.setState({ error: null });
    this.props.onReset?.();
  };

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    if (this.props.fallback) return this.props.fallback(this.reset);
    return <SchermataErrore onRiprova={this.reset} etichetta={this.props.etichetta} />;
  }
}

function SchermataErrore({ onRiprova, etichetta = "Riprova" }) {
  return (
    <div role="alert" style={{
      minHeight: "100dvh", background: SG_BG, color: SG_PARCH,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "24px 20px", textAlign: "center", fontFamily: "'Nunito', system-ui, sans-serif",
    }}>
      <div style={{
        maxWidth: 340, width: "100%", background: SG_CARD, border: SG_BR,
        borderRadius: 28, padding: "36px 24px 28px",
      }}>
        <svg viewBox="0 0 64 64" width="72" height="72" aria-hidden="true" style={{ marginBottom: 14 }}>
          <circle cx="32" cy="32" r="29" fill="none" stroke={SG_GOLD} strokeOpacity=".35" strokeWidth="2" strokeDasharray="3 5" />
          <path d="M32 11 l5.6 13.4 14.4 1.2 -11 9.4 3.4 14 -12.4 -7.6 -12.4 7.6 3.4 -14 -11 -9.4 14.4 -1.2Z" fill={SG_GOLD} />
        </svg>
        <h1 style={{ fontFamily: FF_DISPLAY, fontSize: 26, fontWeight: 800, lineHeight: 1.2, margin: "0 0 10px" }}>
          Ops! La magia si è inceppata
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.55, opacity: .78, margin: "0 0 26px" }}>
          Niente paura: le stelle e i progressi sono al sicuro.
        </p>
        <button onClick={onRiprova} style={{
          width: "100%", background: SG_GOLD_GRAD, color: SG_INK, border: "none",
          borderRadius: 50, padding: "15px 24px", fontSize: 17, fontWeight: 900,
          cursor: "pointer", marginBottom: 12, boxShadow: "0 8px 28px rgba(255,194,75,.3)",
        }}>
          {etichetta}
        </button>
        <button onClick={() => window.location.reload()} style={{
          width: "100%", background: "transparent", color: SG_PARCH,
          border: "1px solid rgba(246,236,212,.25)", borderRadius: 50,
          padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer",
        }}>
          Ricarica l'app
        </button>
      </div>
    </div>
  );
}
