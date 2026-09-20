import Magistella from './Magistella'
import ErrorBoundary from './ErrorBoundary.jsx'

// Crash di prova, solo in sviluppo: con /?crash si vede la schermata d'errore
// (lo usa lo smoke test). In produzione import.meta.env.DEV è false e Vite
// toglie tutto il ramo dal bundle.
function CrashDiProva() {
  throw new Error('Crash di prova (?crash)')
}
const crashDiProva = import.meta.env.DEV && new URLSearchParams(window.location.search).has('crash')

export default function App() {
  return (
    <ErrorBoundary>
      {crashDiProva ? <CrashDiProva /> : <Magistella />}
    </ErrorBoundary>
  )
}
