// ─────────────────────────────────────────────────────────────────────────────
// Tutte le @keyframes e il CSS globale del gioco (zona 🎨 grafica).
// Stavano in cima a MondoMago.jsx: qui si ritoccano le animazioni senza
// scorrere 7.000 righe di logica.
// ─────────────────────────────────────────────────────────────────────────────

// ── CSS ANIMATIONS ────────────────────────────────────────────────────────────
export default function AnimationStyles() {
  return (
    <style>{`
      @keyframes popIn {
        0%   { transform: scale(0.5) rotate(-4deg); opacity: 0; }
        70%  { transform: scale(1.1) rotate(1deg); }
        100% { transform: scale(1)   rotate(0deg); opacity: 1; }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%     { transform: translateX(-10px); }
        40%     { transform: translateX(10px); }
        60%     { transform: translateX(-8px); }
        80%     { transform: translateX(8px); }
      }
      @keyframes bounceChar {
        0%,100% { transform: translateY(0) scale(1); }
        40%     { transform: translateY(-18px) scale(1.1); }
        70%     { transform: translateY(-8px) scale(1.04); }
      }
      @keyframes float {
        0%,100% { transform: translateY(0); }
        50%     { transform: translateY(-10px); }
      }
      /* Companion "vita": respiro lento + blink simulato (squash) su PNG senza faccia controllabile */
      @keyframes compIdle {
        0%   { transform: scale(1,1); }
        22%  { transform: scale(1.025,1.03); }
        46%  { transform: scale(1,1); }
        88%  { transform: scale(1,1); }
        92%  { transform: scale(1.06,0.84); }
        96%  { transform: scale(1,1); }
        100% { transform: scale(1,1); }
      }
      /* Companion mentre parla: bob ritmico */
      @keyframes compTalk {
        0%   { transform: translateY(0) scale(1,1); }
        50%  { transform: translateY(-2.5px) scale(1.03,0.97); }
        100% { transform: translateY(0) scale(1,1); }
      }
      /* Companion reazione (happy/excited/celebrating): squash-stretch vivace */
      @keyframes compPop {
        0%,100% { transform: scale(1,1) translateY(0); }
        30%     { transform: scale(1.13,0.88) translateY(0); }
        55%     { transform: scale(0.94,1.12) translateY(-7px); }
        78%     { transform: scale(1.05,0.97) translateY(0); }
      }
      /* SigilloSky — profondità "notte incantata": nebulose a deriva + sigillo + rune */
      @keyframes nebA   { 0%,100% { transform: translate(0,0) scale(1); }   50% { transform: translate(6%,4%) scale(1.08); } }
      @keyframes nebB   { 0%,100% { transform: translate(0,0) scale(1); }   50% { transform: translate(-5%,5%) scale(1.06); } }
      @keyframes sigilPulse { 0%,100% { opacity: .3; }  50% { opacity: .62; } }
      @keyframes runeUp { 0% { transform: translateY(0) rotate(0deg); opacity: 0; } 12% { opacity: .5; } 85% { opacity: .5; } 100% { transform: translateY(-112vh) rotate(70deg); opacity: 0; } }
      @keyframes slideUp {
        from { transform: translateY(28px); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.97); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes starPop {
        0%   { transform: scale(0) rotate(-20deg); }
        65%  { transform: scale(1.6) rotate(10deg); }
        100% { transform: scale(1)   rotate(0deg); }
      }
      @keyframes coinPop {
        0%   { transform: scale(0) translateY(0); opacity: 0; }
        55%  { transform: scale(1.45) translateY(-10px); opacity: 1; }
        100% { transform: scale(0.85) translateY(-20px); opacity: 0; }
      }
      .coin-pop { animation: coinPop .75s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes confettiFly {
        0%   { transform: translateY(0) rotate(0deg)   scale(1);   opacity: 1; }
        100% { transform: translateY(-160px) rotate(540deg) scale(0.2); opacity: 0; }
      }
      @keyframes glow {
        0%,100% { box-shadow: 0 0 10px rgba(255,215,0,.3); }
        50%     { box-shadow: 0 0 28px rgba(255,215,0,.85), 0 0 50px rgba(255,215,0,.3); }
      }
      @keyframes wiggle {
        0%,100% { transform: rotate(0deg) scale(1); }
        25%     { transform: rotate(-12deg) scale(1.05); }
        75%     { transform: rotate(12deg) scale(1.05); }
      }
      @keyframes pulse {
        0%,100% { transform: scale(1); }
        50%     { transform: scale(1.05); }
      }
      @keyframes bossFlash {
        0%,100% { background: rgba(220,38,38,.08); }
        50%     { background: rgba(220,38,38,.18); }
      }
      .pop-in   { animation: popIn      .38s cubic-bezier(.34,1.56,.64,1) both; }
      .shake    { animation: shake      .42s ease both; }
      .bounce   { animation: bounceChar .65s ease both; }
      .float    { animation: float      3.2s ease-in-out infinite; }
      .slide-up { animation: slideUp    .32s ease both; }
      .fade-in  { animation: fadeIn     .4s  ease both; }
      .star-pop { animation: starPop    .45s cubic-bezier(.34,1.56,.64,1) both; }
      .glow     { animation: glow       2s   ease-in-out infinite; }
      .wiggle   { animation: wiggle     .42s ease both; }
      .pulse    { animation: pulse      1.6s ease-in-out infinite; }
      .boss-bg     { animation: bossFlash  1.8s ease-in-out infinite; }
      @keyframes screenEnter {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0); }
      }
      /* fill-mode backwards (not both): after the enter animation the wrapper keeps NO
         residual transform, so position:fixed celebration modals (level-up/streak/mystery)
         stay viewport-centered instead of being trapped in the screen's containing block. */
      .screen-enter { animation: screenEnter .36s cubic-bezier(.22,1,.36,1) backwards; }
      @keyframes feedbackPop {
        0%   { transform: scale(0.6); opacity:0; }
        70%  { transform: scale(1.15); }
        100% { transform: scale(1); opacity:1; }
      }
      .feedback-pop { animation: feedbackPop .45s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes correctFlash {
        0%   { transform: scale(1); filter: brightness(1); }
        45%  { transform: scale(1.1); filter: brightness(1.6); }
        100% { transform: scale(1.04); filter: brightness(1.1); }
      }
      .correct-flash { animation: correctFlash .38s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes particleFloat {
        0%,100% { transform: translateY(0) rotate(0deg) scale(1); }
        30%     { transform: translateY(-10px) rotate(6deg) scale(1.06); }
        70%     { transform: translateY(-16px) rotate(-5deg) scale(0.94); }
      }
      .ans-btn { transition: transform .22s cubic-bezier(.34,1.56,.64,1), filter .15s; touch-action: manipulation; }
      .ans-btn:active { transform: scale(0.87) !important; filter: brightness(0.88); }
      .ans-vis { transition: transform .22s cubic-bezier(.34,1.56,.64,1), filter .15s; touch-action: manipulation; }
      .ans-vis:active { transform: scale(0.83) !important; filter: brightness(0.85); }
      @keyframes burstOut {
        0%   { transform: translate(-50%,-50%) rotate(var(--a)) translateY(0)    scale(1);   opacity:1; }
        100% { transform: translate(-50%,-50%) rotate(var(--a)) translateY(-62px) scale(0.2); opacity:0; }
      }
      @keyframes handPoint {
        0%,100% { transform: translateY(0) rotate(-20deg); }
        50%     { transform: translateY(-10px) rotate(-20deg); }
      }
      @keyframes tapGesture {
        0%,100% { transform: translateY(0) scale(1); }
        20%     { transform: translateY(0) scale(1); }
        40%     { transform: translateY(18px) scale(0.88); }
        55%     { transform: translateY(18px) scale(0.85); }
        75%     { transform: translateY(0) scale(1.08); }
      }
      @keyframes tapRipple {
        0%   { transform: scale(0.4); opacity: 0.9; }
        60%  { transform: scale(1.1); opacity: 0.35; }
        100% { transform: scale(1.8); opacity: 0; }
      }
      @keyframes tapRipple2 {
        0%   { transform: scale(0.4); opacity: 0.6; }
        100% { transform: scale(2.2); opacity: 0; }
      }
      @keyframes autoRing {
        from { stroke-dashoffset: 132; }
        to   { stroke-dashoffset: 0; }
      }
      @keyframes mysteryOpen {
        0%   { transform: scale(0.3) rotate(-8deg); opacity:0; }
        60%  { transform: scale(1.15) rotate(3deg); opacity:1; }
        100% { transform: scale(1)    rotate(0deg); opacity:1; }
      }
      @keyframes youngPulse {
        0%,100% { filter: brightness(1); }
        50%     { filter: brightness(1.08); }
      }
      /* ── Mobile-first global overrides ──────────────────────────────────── */
      button { touch-action: manipulation; -webkit-tap-highlight-color: transparent; }
      /* Smooth scroll in any horizontal scroll container */
      .h-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
      .h-scroll::-webkit-scrollbar { display: none; }
      /* Safe-area bottom padding for last-element containers */
      .pb-safe { padding-bottom: max(env(safe-area-inset-bottom, 0px), 20px) !important; }
      /* Active scale for all interactive cards */
      .tap-card { transition: transform .11s ease, box-shadow .11s ease; }
      .tap-card:active { transform: scale(0.96) !important; }
      /* ── PREMIUM VISUAL EFFECTS ─────────────────────────────────────────── */
      @keyframes twinkle {
        0%,100% { opacity: 0.07; transform: scale(0.6); }
        50%     { opacity: 1;    transform: scale(1.4); }
      }
      @keyframes orbitSpin {
        from { transform: rotate(0deg)   translateX(40px) rotate(0deg);    }
        to   { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
      }
      @keyframes shimmerSweep {
        0%   { transform: translateX(-200%) skewX(-20deg); }
        100% { transform: translateX(400%)  skewX(-20deg); }
      }
      @keyframes barGlint {
        0%,70%  { transform: translateX(-100%); opacity: 0; }
        76%     { opacity: 1; }
        100%    { transform: translateX(400%);  opacity: 0; }
      }
      @keyframes ambientRise {
        0%   { transform: translateY(0)     translateX(0)              scale(1);   opacity: 0; }
        12%  { opacity: 0.65; }
        80%  { opacity: 0.35; }
        100% { transform: translateY(-170px) translateX(var(--dx,12px)) scale(0.5); opacity: 0; }
      }
      @keyframes cardLift {
        from { transform: translateY(0); }
        to   { transform: translateY(-3px); }
      }
      .world-card-btn:not(:disabled):hover {
        transform: translateY(-3px) !important;
        transition: transform .16s ease, box-shadow .16s ease !important;
      }
      .world-shimmer {
        position: absolute; top: 0; bottom: 0;
        width: 30%; pointer-events: none; border-radius: inherit;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.11), transparent);
        animation: shimmerSweep 5s ease-in-out infinite;
      }
      .xp-glint {
        position: absolute; top: 0; bottom: 0; left: 0; width: 38%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,.52), transparent);
        border-radius: 8px; pointer-events: none;
        animation: barGlint 5s ease-in-out 0.8s infinite;
      }
      .ans-enter { animation: slideUp .32s cubic-bezier(.34,1.56,.64,1) both; }
      .ans-btn-idle {
        transition: transform .1s ease, box-shadow .15s ease, border-color .15s ease;
      }
      .ans-btn-idle:not(:disabled):hover {
        transform: scale(1.03) !important;
        box-shadow: 0 0 16px rgba(255,194,75,.35) !important;
      }
      @keyframes screenFlashOk {
        0%   { opacity: 0; }
        18%  { opacity: 1; }
        100% { opacity: 0; }
      }
      @keyframes screenFlashBad {
        0%   { opacity: 0; }
        18%  { opacity: 0.72; }
        100% { opacity: 0; }
      }
      @keyframes comboZoom {
        0%   { transform: scale(0.35) rotate(-8deg); opacity: 0; }
        52%  { transform: scale(1.14) rotate(3deg);  opacity: 1; }
        75%  { transform: scale(1)    rotate(0deg);  opacity: 1; }
        100% { transform: scale(0.85) rotate(0deg);  opacity: 0; }
      }
      @keyframes installSlide {
        from { transform: translateY(120%); }
        to   { transform: translateY(0); }
      }
      .install-banner { animation: installSlide .38s cubic-bezier(.22,1,.36,1) both; }
      @keyframes sheetUp {
        from { transform: translateY(100%); opacity: .6; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      .feedback-sheet { animation: sheetUp .28s cubic-bezier(.22,1,.36,1) both; }
      @keyframes slideInRight {
        from { transform: translateX(55%); opacity: 0.55; }
        to   { transform: translateX(0);   opacity: 1; }
      }
      @keyframes slideInLeft {
        from { transform: translateX(-55%); opacity: 0.55; }
        to   { transform: translateX(0);    opacity: 1; }
      }
      .screen-enter-fwd { animation: slideInRight .3s cubic-bezier(.22,1,.36,1) backwards; }
      .screen-enter-bk  { animation: slideInLeft  .3s cubic-bezier(.22,1,.36,1) backwards; }
      @keyframes cartoonReveal {
        0%   { filter: blur(12px) brightness(0.5) saturate(0); transform: scale(0.85); }
        55%  { filter: blur(3px)  brightness(1.15) saturate(1.2); transform: scale(1.06); }
        100% { filter: blur(0px)  brightness(1)   saturate(1);   transform: scale(1); }
      }
      .cartoon-reveal { animation: cartoonReveal .55s cubic-bezier(.34,1.56,.64,1) both; }
      @keyframes tileSwap {
        0%   { transform: scale(1); }
        40%  { transform: scale(0.88); }
        100% { transform: scale(1); }
      }
      .tile-swap { animation: tileSwap .18s ease both; }
      @keyframes colorFill {
        0%   { transform: scale(0.85); opacity: 0.5; }
        65%  { transform: scale(1.08); }
        100% { transform: scale(1);    opacity: 1; }
      }
      @keyframes sigilloPulse {
        0%,100% { filter: drop-shadow(0 0 4px rgba(255,215,0,.3)); }
        50%     { filter: drop-shadow(0 0 12px rgba(255,215,0,.9)); }
      }
      .sigillo-glow { animation: sigilloPulse 2.4s ease-in-out infinite; }
      @keyframes streakFlame {
        0%,100% { transform: scale(1) rotate(-3deg); }
        50%     { transform: scale(1.18) rotate(3deg); }
      }
      .streak-flame { animation: streakFlame 1.2s ease-in-out infinite; }
      @keyframes sessionAlert {
        0%   { transform: translateY(-40px); opacity: 0; }
        15%  { transform: translateY(0);     opacity: 1; }
        85%  { transform: translateY(0);     opacity: 1; }
        100% { transform: translateY(-40px); opacity: 0; }
      }
      .session-alert { animation: sessionAlert 4s cubic-bezier(.22,1,.36,1) both; }
      @keyframes sealSpin    { from { transform: rotate(0deg); }  to { transform: rotate(360deg); }  }
      @keyframes sealSpinRev { from { transform: rotate(0deg); }  to { transform: rotate(-360deg); } }
      .seal-ring     { animation: sealSpin    16s linear infinite; }
      .seal-ring-rev { animation: sealSpinRev 24s linear infinite; }

      /* ── ACCESSIBILITÀ ──────────────────────────────────────────────────────
         Toggle device-level dall'area genitori (data-* su <html>) + rispetto
         della preferenza di sistema. Vedi sezione "♿ Accessibilità". */
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          animation-duration: 0.001ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.001ms !important;
        }
      }
      html[data-reduce-motion="1"] *,
      html[data-reduce-motion="1"] *::before,
      html[data-reduce-motion="1"] *::after {
        animation-duration: 0.001ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.001ms !important;
        scroll-behavior: auto !important;
      }
      html[data-dyslexia="1"],
      html[data-dyslexia="1"] * {
        font-family: 'OpenDyslexic', 'Nunito', system-ui, sans-serif !important;
        letter-spacing: 0.015em;
      }
      /* Ingrandimento testo via zoom su #root: l'app usa font-size px inline,
         quindi il font-size della root non scalerebbe. zoom scala tutto coerentemente. */
      html[data-text-scale="lg"] #root { zoom: 1.15; }
      html[data-text-scale="xl"] #root { zoom: 1.30; }
      html[data-contrast="high"] body { background: #000 !important; }
      html[data-contrast="high"] { filter: contrast(1.18) brightness(1.04); }
      /* Focus visibile per navigazione da tastiera/switch access */
      html[data-contrast="high"] button:focus-visible,
      html[data-contrast="high"] [role="button"]:focus-visible,
      button:focus-visible, [role="button"]:focus-visible {
        outline: 3px solid #FFD400 !important;
        outline-offset: 2px !important;
      }
    `}</style>
  );
}
