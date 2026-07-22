import { useState, useEffect, useRef, useMemo } from "react";
import TTS_MAP from "./ttsMap.json";
import WorldScene from "./WorldScene.jsx";
import { WorldIcon, Icon, SkillIcon } from "./icons.jsx";
import SvgAsset from "./SvgAssets.jsx";
import canvasConfetti from "canvas-confetti";

// ── MONETIZZAZIONE (impalcatura freemium, OFF) ──────────────────────────────────
// Strategia: monetizzare il GENITORE, mai il bambino. Tutto il loop educativo
// (8 mondi, sfide adattive, SRS, TTS, offline) resta SEMPRE gratis per non
// frenare l'acquisizione. Solo feature parent-facing "avanzate" (report
// settimanale + export) sono candidate premium "MondoMago Famiglia".
// Finché MONETIZATION_ENABLED = false NULLA è bloccato: isPremium è true per
// tutti → zero rischio acquisizione, ma le "cuciture" del gating esistono già.
// Per attivare il freemium in futuro: mettere il flag a true e collegare un
// checkout (Stripe sul web / Play Billing su Android) a unlockPremium().
const MONETIZATION_ENABLED = false;

// ── CSS ANIMATIONS ────────────────────────────────────────────────────────────
function AnimationStyles() {
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
      .screen-enter { animation: screenEnter .36s cubic-bezier(.22,1,.36,1) both; }
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
      .screen-enter-fwd { animation: slideInRight .3s cubic-bezier(.22,1,.36,1) both; }
      .screen-enter-bk  { animation: slideInLeft  .3s cubic-bezier(.22,1,.36,1) both; }
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

// ── PWA INSTALL PROMPT (A2HS) ─────────────────────────────────────────────────
// Captures beforeinstallprompt and shows a friendly bottom banner.
let _deferredInstall = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  _deferredInstall = e;
  window.dispatchEvent(new CustomEvent('installready'));
});

const ONBOARDING_SCREENS = new Set(["consent","onboarding","name","age","companion","companion_welcome","profile_select"]);

function InstallBanner({ screen }) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(
    () => !!localStorage.getItem('mondomago_install_dismissed')
  );

  useEffect(() => {
    if (dismissed) return;
    if (_deferredInstall) { setShow(true); return; }
    const handler = () => setShow(true);
    window.addEventListener('installready', handler);
    return () => window.removeEventListener('installready', handler);
  }, [dismissed]);

  if (!show || dismissed || ONBOARDING_SCREENS.has(screen)) return null;

  const install = async () => {
    if (!_deferredInstall) return;
    _deferredInstall.prompt();
    const { outcome } = await _deferredInstall.userChoice;
    if (outcome === 'accepted') _deferredInstall = null;
    setShow(false);
  };

  const dismiss = () => {
    localStorage.setItem('mondomago_install_dismissed', '1');
    setDismissed(true);
    setShow(false);
  };

  return (
    <div className="install-banner" style={{
      position:"fixed", bottom:0, left:0, right:0, zIndex:900,
      background:"linear-gradient(135deg,#1e1b4b,#312e81)",
      borderTop:"2px solid #7C3AED",
      padding:"14px 20px",
      paddingBottom:"max(env(safe-area-inset-bottom,0px),14px)",
      display:"flex", alignItems:"center", gap:12,
      boxShadow:"0 -8px 32px rgba(124,58,237,.4)",
    }}>
      <span style={{fontSize:36}}>🧙‍♂️</span>
      <div style={{flex:1, color:"white"}}>
        <div style={{fontWeight:900, fontSize:14}}>Installa MondoMago</div>
        <div style={{fontSize:12, opacity:.75}}>Gioca offline, sempre a portata di mano!</div>
      </div>
      <button onClick={install} style={{
        background:"#7C3AED", color:"white", border:"none",
        borderRadius:20, padding:"9px 18px", fontWeight:800, fontSize:13,
      }}>Installa</button>
      <button onClick={dismiss} style={{
        background:"rgba(255,255,255,.1)", color:"white", border:"none",
        borderRadius:20, padding:"9px 14px", fontWeight:700, fontSize:13,
      }}>✕</button>
    </div>
  );
}

// ── CONFETTI ──────────────────────────────────────────────────────────────────
// Confetti "Sigillo di Stelle": due accenti (oro=magia, verde-runa=logica) + pergamena/stelle
const CONFETTI_COLORS = ["#FFC24B","#6DE0C6","#F6ECD4","#FFD97A","#8CE8D2","#FFFFFF"];
function triggerConfetti(big = false) {
  if (big) {
    canvasConfetti({ particleCount: 100, spread: 100, origin: { y: 0.52 }, ticks: 280, colors: CONFETTI_COLORS });
    setTimeout(() => canvasConfetti({ particleCount: 55, spread: 70, origin: { y: 0.42, x: 0.2 }, ticks: 200, colors: CONFETTI_COLORS }), 320);
    setTimeout(() => canvasConfetti({ particleCount: 55, spread: 70, origin: { y: 0.42, x: 0.8 }, ticks: 200, colors: CONFETTI_COLORS }), 580);
  } else {
    canvasConfetti({ particleCount: 40, spread: 60, origin: { y: 0.62 }, ticks: 140, colors: CONFETTI_COLORS });
  }
}

// ── CORRECT BURST — radial particle explosion from answer button ──────────────
function CorrectBurst({ pos, particles }) {
  if (!pos) return null;
  const angles = [0, 40, 80, 120, 160, 200, 240, 280, 320];
  return (
    <div style={{position:"fixed",left:pos.x,top:pos.y,pointerEvents:"none",zIndex:520}}>
      {angles.map((a, i) => (
        <div key={i} style={{
          position:"absolute", left:0, top:0,
          fontSize:18 + (i%3)*6,
          "--a": `${a}deg`,
          animation:"burstOut .75s cubic-bezier(.22,1,.36,1) both",
          animationDelay:`${i*0.028}s`,
        }}>{particles[i % particles.length]}</div>
      ))}
    </div>
  );
}

// ── PREMIUM VISUAL COMPONENTS ────────────────────────────────────────────────

// 58 deterministic twinkling stars — pure CSS, zero JS overhead
function StarField() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {Array.from({length:58}, (_,i) => {
        const x    = (i * 73.13 + 11.7) % 100;
        const y    = (i * 47.37 + 23.1) % 100;
        const size = [1,1,2,2,2,3][i%6];
        const dur  = 2.2 + (i%7) * 0.38;
        const del  = (i * 0.21) % 4.2;
        return (
          <div key={i} style={{
            position:"absolute", left:`${x}%`, top:`${y}%`,
            width:size, height:size, borderRadius:"50%", background:"white",
            animation:`twinkle ${dur}s ease-in-out ${del}s infinite`,
          }} />
        );
      })}
    </div>
  );
}

const WORLD_AMBIENTS = {
  foresta:     ["🍃","🌿","✨","🍀","🦋"],
  castello:    ["✨","💫","⭐","🔮","🌙"],
  oceano:      ["💧","🫧","✨","🐠","🐡"],
  mercato:     ["🎈","🎊","✨","🎨","🌈"],
  galassia:    ["⭐","💫","🌟","🪐","✨"],
  vulcano:     ["🔥","✨","💥","🌋","⬆️"],
  biblioteca:  ["✨","📖","🔮","💡","📜"],
  laboratorio: ["⚡","💡","🔮","✨","🤖"],
};

// Per-world floating ambient particles — gives each world a living identity
function WorldAmbient({ worldId }) {
  const emojis = WORLD_AMBIENTS[worldId];
  if (!emojis) return null;
  return (
    <div style={{position:"fixed",inset:0,overflow:"hidden",pointerEvents:"none",zIndex:0}}>
      {Array.from({length:12}, (_,i) => {
        const left = (i * 23.7 + 8) % 91;
        const dur  = 5.5 + (i%5) * 1.1;
        const del  = (i * 0.72) % 5;
        const dx   = -22 + (i%7) * 8;
        return (
          <div key={i} style={{
            position:"absolute", bottom:`${(i%4)*10+4}%`, left:`${left}%`,
            fontSize: 13 + (i%3)*5,
            animation:`ambientRise ${dur}s ease-out ${del}s infinite`,
            "--dx":`${dx}px`, userSelect:"none",
          }}>{emojis[i%emojis.length]}</div>
        );
      })}
    </div>
  );
}

// Orbiting particles around companion on map
function CompanionOrbit({ color }) {
  const palette = [color,"#FFD700","#FF9FF3","#54A0FF","#5F27CD"];
  return (
    <>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          position:"absolute", left:"50%", top:"50%",
          width:0, height:0, pointerEvents:"none",
          animation:`orbitSpin ${3.8+i*0.65}s linear ${i*0.6}s infinite`,
        }}>
          <div style={{
            width:6, height:6, borderRadius:"50%",
            background:palette[i],
            boxShadow:`0 0 7px ${palette[i]}`,
            position:"absolute", transform:"translate(-50%,-50%)",
          }} />
        </div>
      ))}
    </>
  );
}

// ── NAV ICONS (K4) ───────────────────────────────────────────────────────────
function NavMap({c="currentColor",s=22}){return<svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 6L8 4L14 7L20 5L20 18L14 20L8 17L2 19Z" fill={c} fillOpacity=".18"/><line x1="8" y1="4" x2="8" y2="17"/><line x1="14" y1="7" x2="14" y2="20"/></svg>;}
function NavBrain({c="currentColor",s=22}){return<svg width={s} height={s} viewBox="0 0 22 22" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M8 6C8 4 10 3 12 5C14 3 17 5 16 8C18 9 18 12 16 13C17 16 15 19 12 18L10 18C7 19 5 16 6 13C4 12 4 9 6 8C5 5 6 3 8 6Z"/><line x1="11" y1="5" x2="11" y2="18" strokeDasharray="2.5 2"/></svg>;}
function NavFamily({c="currentColor",s=22}){return<svg width={s} height={s} viewBox="0 0 22 22" fill={c} stroke="none"><circle cx="6" cy="6" r="2.4"/><circle cx="16" cy="6" r="2.4"/><circle cx="11" cy="9" r="1.9"/><path d="M2 15C2 12 4 11 6 11C8 11 9.5 12 9.5 13L9.5 20L2 20Z"/><path d="M12.5 15C12.5 12 14 11 16 11C18 11 20 12 20 15L20 20L12.5 20Z"/><path d="M8 16C8 14 9.2 13 11 13C12.8 13 14 14 14 16L14 20L8 20Z"/></svg>;}
function NavSparkle({c="currentColor",s=22}){return<svg width={s} height={s} viewBox="0 0 22 22" fill={c} stroke="none"><path d="M11 2L12.8 9.2L20 11L12.8 12.8L11 20L9.2 12.8L2 11L9.2 9.2Z"/><circle cx="18" cy="5" r="1.5"/><circle cx="5" cy="16.5" r="1.2"/></svg>;}

// ── COMPANION SVG FACES ───────────────────────────────────────────────────────
// Fully inline SVG companions with blink, expressions, and talking animation.
// mood: "idle" | "happy" | "sad" | "excited" | "thinking" | "celebrating"

// World-themed costume badge shown on companions during gameplay
const WORLD_COSTUMES = {
  foresta:    "🌿", cielo:   "⭐", oceano:    "🌊",
  montagna:   "🍃", giungla: "🌴", vulcano:   "🔥",
  biblioteca: "📖", laboratorio: "🔬",
};

// Render 3D character art (transparent PNG) in place of the companion emoji.
// Keyed by companion id ("foglia" = Foglia, la volpe). Falls back to emoji if id is unmapped.
const COMPANION_IMG = { fiamma:"fiamma", luna:"luna", onde:"onde", foglia:"volpe", pixel:"pixel" };
const companionCharSrc = (id) => COMPANION_IMG[id]
  ? `${import.meta.env.BASE_URL}characters/${COMPANION_IMG[id]}_cutout.png`
  : null;

function CompanionAvatar({ c, size = 64, anim = "", cosmetic = null, mood = "idle", talking = false, worldId = null, showBody = false }) {
  const s = size;
  const auraCols = { "🔥":"#FF6B00","❄️":"#60D0FF","✨":"#FFD700","🏆":"#C084FC" };
  const auraCol  = cosmetic?.type === "aura" ? (auraCols[cosmetic.emoji] || "#C084FC") : null;
  const celebratingExtras = mood === "celebrating" && size >= 48;
  return (
    <div className={anim} style={{ position:"relative", width:s, height:showBody && size >= 80 ? Math.round(s*1.2) : s, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {auraCol && (
        <div style={{position:"absolute",inset:-Math.round(s*0.22),borderRadius:"50%",
          background:`conic-gradient(transparent,${auraCol}66,transparent,${auraCol}44,transparent)`,
          animation:"wiggle 2.4s ease-in-out infinite",pointerEvents:"none",zIndex:0}} />
      )}
      {(() => {
        const src = companionCharSrc(c.id);
        return src ? (
          <img src={src} alt={c.name} draggable={false}
            style={{width:s,height:s,objectFit:"contain",userSelect:"none",
              filter:`drop-shadow(0 3px 9px rgba(0,0,0,.45))`,zIndex:1,
              animation: talking ? "ws-twinkle 0.3s ease-in-out infinite alternate" : undefined}} />
        ) : (
          <div style={{fontSize:Math.round(s*0.88),lineHeight:1,userSelect:"none",
            filter:`drop-shadow(0 2px 8px rgba(0,0,0,.35))`,zIndex:1,textAlign:"center",
            animation: talking ? "ws-twinkle 0.3s ease-in-out infinite alternate" : undefined}}>
            {c.emoji}
          </div>
        );
      })()}
      {celebratingExtras && (
        <div style={{position:"absolute",top:`-${Math.round(s*.3)}px`,left:"50%",transform:"translateX(-50%)",
          fontSize:Math.round(s*.32),userSelect:"none",pointerEvents:"none",zIndex:4,
          animation:"ws-twinkle 0.6s ease-in-out infinite"}}>✨</div>
      )}
      {worldId && WORLD_COSTUMES[worldId] && size >= 44 && (
        <div style={{position:"absolute",bottom:0,right:0,fontSize:Math.round(s*0.32),
          userSelect:"none",filter:"drop-shadow(0 1px 4px rgba(0,0,0,.7))",lineHeight:1}}>
          {WORLD_COSTUMES[worldId]}
        </div>
      )}
      {cosmetic?.type === "hat" && (
        <div style={{position:"absolute",top:`-${Math.round(s*.28)}px`,left:"50%",transform:"translateX(-50%)",
          fontSize:Math.round(s*.44),filter:"drop-shadow(0 2px 5px rgba(0,0,0,.6))",
          pointerEvents:"none",zIndex:3,animation:"float 3s ease-in-out infinite"}}>{cosmetic.emoji}</div>
      )}
      {cosmetic?.type === "acc" && (
        <div style={{position:"absolute",right:`-${Math.round(s*.16)}px`,top:"28%",
          fontSize:Math.round(s*.36),filter:"drop-shadow(0 2px 4px rgba(0,0,0,.5))",
          pointerEvents:"none",zIndex:3,animation:"float 2.6s ease-in-out infinite"}}>{cosmetic.emoji}</div>
      )}
      {cosmetic?.type === "aura" && size >= 48 && (
        <div style={{position:"absolute",top:`-${Math.round(s*.26)}px`,right:`-${Math.round(s*.08)}px`,
          fontSize:Math.round(s*.26),filter:"drop-shadow(0 0 4px rgba(255,255,255,.8))",
          pointerEvents:"none",zIndex:3,animation:"float 1.8s ease-in-out infinite"}}>{cosmetic.emoji}</div>
      )}
    </div>
  );
}

// ── COMPANIONS ────────────────────────────────────────────────────────────────
const COMPANIONS = [
  {
    id:"fiamma", name:"Fiamma", emoji:"🐉", type:"Drago",
    color:"#FF6B6B", bg:"linear-gradient(135deg,#FF6B6B,#b91c1c)",
    onCorrect: () => pick([
      "Bravo! Sei forte come il fuoco!",
      "Perfetto! Una risposta da drago!",
      "Giusto! Sei un vero campione!",
      "Wow! Che bella risposta!",
      "Eccellente! Sei davvero in gamba!",
    ]),
    onWrong: () => pick([
      "Quasi! Dai, riprova!",
      "Non mollare! Ce la fai!",
      "Forza! La prossima va bene!",
      "Nessun problema! Avanti!",
      "I draghi imparano cadendo! Su!",
    ]),
    onStreak: () => pick([
      "Sei in serie! Bravissimo!",
      "Una dopo l'altra! Grandioso!",
      "Che forza! Continua così!",
      "Stai volando! Fantastico!",
      "Nessuno ti ferma più!",
    ]),
    onReturn: () => pick([
      "Bentornato! Pronti per una nuova avventura?",
      "Eccoti! Oggi ci divertiamo!",
      "Sei pronto? Si parte!",
    ]),
    onWorldStart: () => pick([
      "Fuoco e coraggio! Siamo pronti!",
      "All'attacco! Nessuno ci ferma!",
      "Pronti a bruciare le sfide?",
    ]),
    onWorld: () => pick([
      "Missione completata! Sei il migliore!",
      "Ce l'abbiamo fatta! Sei fantastico!",
      "Vittoria! Insieme siamo imbattibili!",
    ]),
    onMeet: (name) => `Ciao ${name}! Sono Fiamma il Drago! Bruciamo ogni sfida insieme! 🔥`,
  },
  {
    id:"luna", name:"Luna", emoji:"🦄", type:"Unicorno",
    color:"#C084FC", bg:"linear-gradient(135deg,#C084FC,#7c3aed)",
    onCorrect: () => pick([
      "Sei una stella! Bellissimo!",
      "Bravissimo! Hai fatto magia!",
      "Perfetto! Come sapevo!",
      "Che risposta meravigliosa!",
      "Hai fatto brillare tutto!",
    ]),
    onWrong: () => pick([
      "Non preoccuparti! Ci riproviamo!",
      "Quasi! Ogni errore ci insegna!",
      "Coraggio! La prossima va bene!",
      "Va bene così! Avanti insieme!",
      "Insieme ce la facciamo!",
    ]),
    onStreak: () => pick([
      "Stai brillando! Che magia!",
      "Una stella dopo l'altra!",
      "Sei incredibile! Continua!",
      "La tua luce cresce!",
      "Che serie magica!",
    ]),
    onReturn: () => pick([
      "Il cielo ti aspettava!",
      "Che bello rivederti!",
      "Oggi facciamo magia!",
    ]),
    onWorldStart: () => pick([
      "Spieghiamo le ali! È il nostro momento!",
      "La magia ci aspetta!",
      "Insieme faremo brillare tutto!",
    ]),
    onWorld: () => pick([
      "Che viaggio meraviglioso! Bravissimo!",
      "Abbiamo vinto! Sei un mago!",
      "Fantastico! Sei stato bravissimo!",
    ]),
    onMeet: (name) => `${name}! Che bello incontrarsi! Sono Luna! Facciamo brillare questa avventura! ✨`,
  },
  {
    id:"onde", name:"Onde", emoji:"🐬", type:"Delfino",
    color:"#60A5FA", bg:"linear-gradient(135deg,#60A5FA,#1d4ed8)",
    onCorrect: () => pick([
      "Splash! Hai centrato il bersaglio!",
      "Esatto! Che bella scoperta!",
      "Bravo! Risposta perfetta!",
      "Sei un esploratore vero!",
      "Fantastico! Ci hai preso!",
    ]),
    onWrong: () => pick([
      "Interessante! Proviamo da un'altra parte!",
      "Quasi! I delfini non si arrendono!",
      "Forza! Dai un'altra occhiata!",
      "Non mollare! Sei quasi arrivato!",
      "Riprova! Ce la fai!",
    ]),
    onStreak: () => pick([
      "Nuoti velocissimo! Bravissimo!",
      "Che serie! Bravissimo!",
      "Splash dopo splash! Grandioso!",
      "Non ti fermi più!",
      "Stai volando!",
    ]),
    onReturn: () => pick([
      "Nuove scoperte ci aspettano!",
      "Cosa scopriamo oggi?",
      "L'avventura ti aspetta!",
    ]),
    onWorldStart: () => pick([
      "Immergiamoci nell'avventura!",
      "Splash! Si parte!",
      "Occhi aperti! Ogni sfida è una scoperta!",
    ]),
    onWorld: () => pick([
      "Missione compiuta! Grande esploratore!",
      "Abbiamo scoperto tutto! Fantastico!",
      "Ce l'abbiamo fatta! Sei magnifico!",
    ]),
    onMeet: (name) => `SPLASH! Ciao ${name}! Sono Onde! Pronti per esplorare il mondo insieme? 🌊`,
  },
  {
    id:"foglia", name:"Foglia", emoji:"🦊", type:"Volpe",
    color:"#34D399", bg:"linear-gradient(135deg,#34D399,#047857)",
    onCorrect: () => pick([
      "Mossa da maestro! Geniale!",
      "Perfetto! Lo sapevo che ce la facevi!",
      "Risposta da volpe astuta! Bravo!",
      "Sei un cervellone! Fantastico!",
      "Esatto! Ci hai pensato bene!",
    ]),
    onWrong: () => pick([
      "Strategia interessante! Proviamo ancora!",
      "Non mollare! Anche le volpi sbagliano!",
      "Quasi! Rifletti ancora un po'!",
      "Forza! Ce la puoi fare!",
      "Dai! Un altro tentativo!",
    ]),
    onStreak: () => pick([
      "Sei la volpe più brava del bosco!",
      "Una risposta dopo l'altra! Grandioso!",
      "Sei in serie! Straordinario!",
      "Che cervellone! Avanti così!",
      "Nessuno ti ferma!",
    ]),
    onReturn: () => pick([
      "Ho un piano segreto per te!",
      "Sei pronto per una sfida?",
      "Oggi scopriamo cose nuove!",
    ]),
    onWorldStart: () => pick([
      "Piano pronto! Eseguiamo!",
      "Cervello in moto! Cominciamo!",
      "Questa missione è fatta per noi!",
    ]),
    onWorld: () => pick([
      "Piano eseguito alla perfezione! Sei un genio!",
      "Missione riuscita! Sei straordinario!",
      "Ce l'abbiamo fatta! Grande mente!",
    ]),
    onMeet: (name) => `Ehilà ${name}! Sono Foglia! Ho già un piano perfetto per noi! 🦊`,
  },
  {
    id:"pixel", name:"Pixel", emoji:"🤖", type:"Robot",
    color:"#06B6D4", bg:"linear-gradient(135deg,#06B6D4,#0284C7)",
    onCorrect: () => pick([
      "Codice corretto! BEEP — sistema aggiornato!",
      "Elaborazione completata! Risposta esatta!",
      "Calcolo verificato! Sei un programmatore nato!",
      "Dati confermati! Bravissimo!",
      "Output corretto! Il robot applaude!",
    ]),
    onWrong: () => pick([
      "Bug rilevato! Nessun problema — i robot imparano dagli errori.",
      "Errore nel codice! Proviamo a debuggare insieme.",
      "Dato non corretto. Rianalizza il problema!",
      "Sistema in modalità apprendimento. Riprova!",
      "Piccolo glitch! Ce la fai al prossimo tentativo.",
    ]),
    onStreak: () => pick([
      "Istruzioni perfette di fila! Sei un vero programmatore!",
      "Serie di successi! Il robot è impressionato!",
      "COMBO attivata! Stai hackando la sfida!",
      "Prestazioni eccellenti! Livello ESPERTO raggiunto!",
      "Processore al massimo! Inarrestabile!",
    ]),
    onReturn: () => pick([
      "Sistema riavviato. Pronti a scrivere codice?",
      "Connessione ristabilita! Iniziamo a programmare!",
      "Boot completato! Nuove sfide ci aspettano!",
    ]),
    onWorldStart: () => pick([
      "Inizializzazione missione! Sistema pronto!",
      "Caricamento programma... Pronti!",
      "Codice attivato! Iniziamo!",
    ]),
    onWorld: () => pick([
      "Missione completata al 100%! Sei un genio del codice!",
      "Programma eseguito con successo! Bravo programmatore!",
      "Sistema di vittoria attivato! Sei fantastico!",
    ]),
    onMeet: (name) => `BEEP-BOOP! Ciao ${name}! Sono Pixel! Sistema amicizia: ATTIVATO! 🤖`,
  },
];

// ── STORY ARCS ────────────────────────────────────────────────────────────────
const STORY_ARCS = {
  foresta: {
    intro_title: "La Foresta in Pericolo! 🌲",
    intro_text:  "Gli spiritelli birichini hanno rubato il cibo di tutti gli animali del bosco. Lo scoiattolo, il coniglietto e la volpe contano su di te! Risolvi i loro enigmi per salvare la foresta.",
    outro: "🎉 Hai salvato la Foresta Magica! Gli animali cantano di gioia e le lucciole illuminano il bosco. La tua saggezza ha vinto!",
    reward_emoji: "🍃",
    reward_name:  "Corona della Foresta",
    color: "#22C55E",
  },
  castello: {
    intro_title: "Il Castello delle Nuvole! 🏰",
    intro_text:  "La chiave magica del castello si è frantumata in 5 pezzi! Il Re delle Nuvole ha bisogno di te per raccoglierli tutti. Solo il più coraggioso può farcela.",
    outro: "✨ La chiave è ricomposta! Il castello brilla di nuova luce e il Re delle Nuvole ti incoronerà campione per sempre!",
    reward_emoji: "⭐",
    reward_name:  "Stella Magica",
    color: "#A78BFA",
  },
  oceano: {
    intro_title: "L'Oceano Luminoso! 🌊",
    intro_text:  "Le perle magiche dell'oceano sono sparse sul fondo del mare! Il delfino Splash ti chiede aiuto: risolvi gli enigmi marini e riporta la luce alle profondità.",
    outro: "🌊 Le perle brillano di nuovo! I pesci cantano e le balene danzano. L'oceano ti ringrazia, grande esploratore!",
    reward_emoji: "🐚",
    reward_name:  "Conchiglia Magica",
    color: "#38BDF8",
  },
  mercato: {
    intro_title: "Il Mercato dei Colori! 🎪",
    intro_text:  "Nel Mercato Magico tutti i colori sono scappati! Il pittore Arcobaleno ha bisogno di te per ritrovarli. Risolvi i suoi enigmi e ridai colore al mondo.",
    outro: "🎨 I colori sono tornati! Il mercato brilla come un arcobaleno e il pittore dipinge il tuo ritratto da eroe!",
    reward_emoji: "🎨",
    reward_name:  "Pennello Arcobaleno",
    color: "#F97316",
  },
  galassia: {
    intro_title: "La Galassia Stellare! 🌌",
    intro_text:  "Una tempesta cosmica ha spento le stelle della galassia! L'astronauta Cosmo ha bisogno del cervello più brillante dell'universo. Sei tu il prescelto?",
    outro: "🌌 Le stelle brillano di nuovo! La galassia ti ha scelto come suo guardiano. Sei una leggenda dell'universo!",
    reward_emoji: "🌌",
    reward_name:  "Cristallo Galattico",
    color: "#818CF8",
  },
  vulcano: {
    intro_title: "Il Vulcano Magico! 🌋",
    intro_text:  "Il Vulcano Magico si sta risvegliando e la lava sta minacciando il villaggio! La Fenice Fiammante ha bisogno di te: risolvi gli enigmi di fuoco per fermare l'eruzione e salvare tutti.",
    outro: "🌋 L'eruzione si è fermata! Il villaggio è salvo e la Fenice ti ha donato una piuma d'oro. Sei un eroe leggendario!",
    reward_emoji: "🔥",
    reward_name:  "Piuma della Fenice",
    color: "#EF4444",
  },
  biblioteca: {
    intro_title: "La Biblioteca Incantata! 📚",
    intro_text:  "Nella Biblioteca Incantata le parole sono scappate dai libri e volano dappertutto! La Civetta Saggia ha bisogno del tuo aiuto per rimettere ogni parola al suo posto.",
    outro: "📚 Le parole sono tornate nei libri! La Civetta Saggia ti nomina Guardiano delle Parole. La conoscenza è il tuo superpotere!",
    reward_emoji: "📖",
    reward_name:  "Libro della Saggezza",
    color: "#D97706",
  },
  laboratorio: {
    intro_title: "Il Codice Segreto di Pixel! 🔬",
    intro_text:  "Il Laboratorio Logico è in pericolo! I robot si sono inceppati e il codice è pieno di bug. Pixel il Robot ha bisogno di te: risolvi i puzzle di programmazione e rimetti in moto il laboratorio!",
    outro: "💻 Il laboratorio è ripartito! Pixel esulta e ti consegna il Diploma di Programmatore. Sei un vero genio del codice!",
    reward_emoji: "💻",
    reward_name:  "Diploma di Programmatore",
    color: "#06B6D4",
  },
  daily: {
    intro_title: "Sfida del Giorno! 🌟",
    intro_text:  "Ogni giorno ti aspettano 3 sfide speciali scelte per te! Completale tutte per guadagnare 3 stelle bonus. Pronto?",
    outro: "🌟 Sfida del Giorno completata! Hai guadagnato 3 stelle bonus! Torna domani per una nuova avventura.",
    reward_emoji: "🌟",
    reward_name:  "Stella del Giorno",
    color: "#FFD95A",
  },
};

// ── WORLDS ────────────────────────────────────────────────────────────────────
const WORLDS = [
  { id:"foresta",   name:"Foresta Magica",        emoji:"🌲", color:"#22C55E", unlocked:true,  starsNeeded:0   },
  { id:"castello",  name:"Castello delle Nuvole",  emoji:"🏰", color:"#A78BFA", unlocked:true,  starsNeeded:0   },
  { id:"oceano",    name:"Oceano Luminoso",         emoji:"🌊", color:"#38BDF8", unlocked:false, starsNeeded:15  },
  { id:"mercato",   name:"Mercato dei Colori",      emoji:"🎪", color:"#F97316", unlocked:false, starsNeeded:30  },
  { id:"galassia",  name:"Galassia Stellare",       emoji:"🌌", color:"#818CF8", unlocked:false, starsNeeded:50  },
  { id:"vulcano",   name:"Vulcano Magico",          emoji:"🌋", color:"#EF4444", unlocked:false, starsNeeded:70  },
  { id:"biblioteca",  name:"Biblioteca Incantata",   emoji:"📚", color:"#D97706", unlocked:false, starsNeeded:100 },
  { id:"laboratorio", name:"Laboratorio Logico",     emoji:"🔬", color:"#06B6D4", unlocked:false, starsNeeded:140 },
];

// ── SIGILLO MAGICO ─────────────────────────────────────────────────────────────
// 8 frammenti del sigillo, uno per ogni mondo. Il 9° (giardino) verrà in futuro.
const SIGILLO_FRAGMENTS = [
  { worldId:"foresta",    angle:0,   color:"#22C55E", emoji:"🌲" },
  { worldId:"castello",   angle:45,  color:"#A78BFA", emoji:"🏰" },
  { worldId:"oceano",     angle:90,  color:"#38BDF8", emoji:"🌊" },
  { worldId:"mercato",    angle:135, color:"#F97316", emoji:"🎪" },
  { worldId:"galassia",   angle:180, color:"#818CF8", emoji:"🌌" },
  { worldId:"vulcano",    angle:225, color:"#EF4444", emoji:"🌋" },
  { worldId:"biblioteca", angle:270, color:"#D97706", emoji:"📚" },
  { worldId:"laboratorio",angle:315, color:"#06B6D4", emoji:"🔬" },
];

const SIGILLO_STORY = {
  0: "Benvenuto, giovane mago! Il Grande Sigillo Magico è in pezzi. Esplora i Mondi per ricomporlo...",
  1: "Hai trovato il primo frammento! Il sigillo comincia a brillare. Continua la tua avventura!",
  2: "Due frammenti! Le magiche energie si svegliano. Ogni mondo ti rende più forte.",
  3: "Tre frammenti riuniti! I companion dei mondi si parlano nelle stelle della notte...",
  4: "Metà del sigillo è ricomposta! Fiamma, Luna, Onde e Foglia cantano la tua vittoria!",
  5: "Cinque frammenti! Il sigillo emette una luce dorata visibile da tutto il regno magico.",
  6: "Sei frammenti! I Grandi Maestri del regno ti osservano con ammirazione.",
  7: "Quasi completo! Il regno intero trema di emozione. Un solo frammento manca...",
  8: "✨ IL SIGILLO È COMPLETO! ✨ Sei il più grande Mago del regno! Tutti i companion festeggiano insieme!",
};

// ── SKILLS ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { id:"logica",     name:"Logica",     emoji:"🧩", color:"#6366F1" },
  { id:"numeri",     name:"Numeri",     emoji:"🔢", color:"#F59E0B" },
  { id:"creativita", name:"Creatività", emoji:"🎨", color:"#EC4899" },
  { id:"empatia",    name:"Empatia",    emoji:"💛", color:"#10B981" },
  { id:"parole",     name:"Parole",     emoji:"📖", color:"#8B5CF6" },
  { id:"coding",     name:"Coding",     emoji:"💻", color:"#06B6D4" },
];

const SKILL_MAP = {
  logica:     ["logica","pattern","geometria","memoria"],
  numeri:     ["numeri","conteggio"],
  creativita: ["creativita"],
  empatia:    ["empatia"],
  parole:     ["parole"],
  coding:     ["coding","sequenza","condizione","debug"],
};

// ── CHALLENGES ────────────────────────────────────────────────────────────────
// Formats:
//   visual_tap      — emoji only, age 3-4
//   multiple_choice — text + optional visual, age 5-6
//   story_choice    — narrative branch with two outcomes
//   sequence_tap    — tap items in correct order
//   rhyme_complete  — filastrocca with blank at end, pick the rhyming word
// isBoss:true → harder, worth 3 stars

const ALL_CHALLENGES = {
  foresta: [
    // ── 3-4 anni ─────────────────────────────────────────────────────────────
    { id:"f01", format:"visual_tap",      type:"conteggio", ageMin:3, ageMax:4,
      visual:"🍎🍎🍎",       prompt:"Quante 🍎?",       emoji:"🐿️",
      options:["1️⃣","2️⃣","3️⃣","4️⃣"], correct:2 },

    { id:"f02", format:"visual_tap",      type:"pattern",   ageMin:3, ageMax:4,
      visual:"🌸🍃🌸🍃🌸",   prompt:"Cosa viene dopo?", emoji:"🌿",
      options:["🌸","🍃","🌺","🌻"],   correct:1 },

    { id:"f03", format:"visual_tap",      type:"empatia",   ageMin:3, ageMax:4,
      visual:"🐰😢",         prompt:"Come si sente?",   emoji:"🐰",
      options:["😊","😢","😠","😲"],   correct:1 },

    { id:"f04", format:"visual_tap",      type:"logica",    ageMin:3, ageMax:4,
      visual:"🐘🐭",         prompt:"Chi è più grande?", emoji:"🌳",
      options:["🐘","🐭","🐸","🐛"],   correct:0 },

    { id:"f05", format:"visual_tap",      type:"logica",    ageMin:3, ageMax:4,
      visual:"🦋🐸🐢🐟",     prompt:"Quale animale vola?", emoji:"🌸",
      options:["🦋","🐸","🐢","🐟"],   correct:0 },

    { id:"f06", format:"visual_tap",      type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🌰🍂🌰🍂🌰🍂", prompt:"🦉 Il Gufo chiede:\ncosa viene dopo?", emoji:"🦉",
      options:["🌰","🍂","🌿","🍁"],   correct:0 },

    // ── 5-6 anni ─────────────────────────────────────────────────────────────
    { id:"f07", format:"multiple_choice", type:"numeri",    ageMin:5, ageMax:6,
      prompt:"Lo scoiattolo ha 5 ghiande.\nNe mangia 2 e ne trova 3.\nQuante ghiande ha adesso?",
      emoji:"🐿️", options:["4","5","6","8"], correct:2 },

    { id:"f08", format:"multiple_choice", type:"empatia",   ageMin:5, ageMax:6,
      prompt:"Il coniglietto ha perso la sua casetta.\nCome si sente?",
      emoji:"🐰", options:["Felice 😊","Triste 😢","Arrabbiato 😠","Annoiato 😐"], correct:1 },

    { id:"f09", format:"multiple_choice", type:"logica",    ageMin:5, ageMax:6,
      prompt:"Quale NON appartiene al gruppo?\n🐦  🦋  🐝  🐸",
      emoji:"🌲", options:["🐦 uccello","🦋 farfalla","🐝 ape","🐸 rana"], correct:3 },

    { id:"f10", format:"sequence_tap",    type:"logica",    ageMin:5, ageMax:6,
      prompt:"Metti in ordine le stagioni!\nTocca nell'ordine giusto:",
      emoji:"🍂",
      items:["❄️ Inverno","🌸 Primavera","☀️ Estate","🍂 Autunno"],
      correctOrder:[0,1,2,3] },

    { id:"f11", format:"story_choice",    type:"empatia",   ageMin:5, ageMax:6,
      emoji:"🦊",
      situation:"La piccola volpe trova una fragola nel bosco. La sua amica ha fame. Cosa fa la volpe?",
      choices:[
        { text:"🍓 Divide la fragola con l'amica", outcome:"Che cuore grande! L'amicizia è il dono più bello. L'amica sorride!", correct:true  },
        { text:"🏃 La mangia tutta di corsa",       outcome:"La volpe ha mangiato da sola... la sua amica è rimasta triste.",   correct:false },
      ] },

    { id:"f12", format:"multiple_choice", type:"logica",    ageMin:5, ageMax:6, isBoss:true,
      prompt:"🦉 Il Grande Gufo chiede:\n10 animali nel bosco. 3 vanno a dormire,\n2 arrivano nuovi. Quanti animali ci sono?",
      emoji:"🦉", options:["7","8","9","10"], correct:2 },

    // ── Filastrocche (tutte le età) ───────────────────────────────────────────
    { id:"f_rh1", format:"rhyme_complete", type:"parole", ageMin:3, ageMax:5,
      emoji:"📜",
      prompt:"Nel bosco verde e bello,\ncanta un piccolo ___",
      options:["uccello","tavolo","mattone","cestino"], correct:0 },

    { id:"f_rh2", format:"rhyme_complete", type:"parole", ageMin:4, ageMax:6,
      emoji:"📜",
      prompt:"La luna splende nel cielo scuro,\nla notte è silenziosa e il sogno è ___",
      options:["puro","brutto","mosso","vuoto"], correct:0 },

    { id:"f_rh3", format:"rhyme_complete", type:"parole", ageMin:5, ageMax:8,
      emoji:"📜",
      prompt:"Il sole sorge piano piano,\nriscalda il prato verde e ___",
      options:["lontano","freddo","vicino","piccolo"], correct:0 },
  ],

  castello: [
    // ── 3-4 anni ─────────────────────────────────────────────────────────────
    { id:"c01", format:"visual_tap",      type:"conteggio", ageMin:3, ageMax:4,
      visual:"⭐⭐⭐⭐",       prompt:"Quante ⭐?",        emoji:"👑",
      options:["2️⃣","3️⃣","4️⃣","5️⃣"], correct:2 },

    { id:"c02", format:"visual_tap",      type:"empatia",   ageMin:3, ageMax:4,
      visual:"🐱🐶🐮🐸",     prompt:"Quale animale fa MIAO?", emoji:"🏰",
      options:["🐱","🐶","🐮","🐸"],   correct:0 },

    { id:"c03", format:"visual_tap",      type:"pattern",   ageMin:3, ageMax:4,
      visual:"⭐🌙⭐🌙",      prompt:"Cosa viene dopo?\n⭐🌙⭐🌙__", emoji:"✨",
      options:["☀️","⭐","🌙","💫"],   correct:1 },

    { id:"c04", format:"visual_tap",      type:"empatia",   ageMin:3, ageMax:4,
      visual:"👑😊",         prompt:"Il Re è contento.\nCome si sente?", emoji:"👑",
      options:["😊","😢","😠","😴"],   correct:0 },

    { id:"c05", format:"visual_tap",      type:"creativita", ageMin:3, ageMax:4,
      visual:"🎺🍎⚽🌸",     prompt:"Tocca lo strumento musicale!", emoji:"🎵",
      options:["🎺","🍎","⚽","🌸"],   correct:0 },

    { id:"c06", format:"visual_tap",      type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🌙🌟🌙🌟🌙",   prompt:"🐲 Il Drago chiede:\ncosa viene dopo? 🌙🌟🌙🌟🌙__", emoji:"🐲",
      options:["🌟","🌙","⭐","☀️"],   correct:0 },

    // ── 5-6 anni ─────────────────────────────────────────────────────────────
    { id:"c07", format:"multiple_choice", type:"numeri",    ageMin:5, ageMax:6,
      prompt:"Il castello ha 3 torri a sinistra\ne 4 a destra.\nQuante torri in tutto?",
      emoji:"🏰", options:["5","6","7","8"], correct:2 },

    { id:"c08", format:"multiple_choice", type:"empatia",   ageMin:5, ageMax:6,
      prompt:"La principessa vince il torneo di arco!\nCome si sente?",
      emoji:"👑", options:["Triste 😢","Spaventata 😨","Felice 🎉","Arrabbiata 😠"], correct:2 },

    { id:"c09", format:"sequence_tap",    type:"logica",    ageMin:5, ageMax:6,
      prompt:"Metti i numeri dal più piccolo\nal più grande. Tocca nell'ordine!",
      emoji:"🔢",
      items:["🔢 1","🔢 5","🔢 3","🔢 2"],
      correctOrder:[0,3,2,1] },

    { id:"c10", format:"multiple_choice", type:"parole",    ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima\ncon CASTELLO?",
      emoji:"🎶", options:["Mare","Bello","Sole","Porta"], correct:1 },

    { id:"c11", format:"story_choice",    type:"empatia",   ageMin:5, ageMax:6,
      emoji:"🤝",
      situation:"Il principe trova un bambino che piange perché ha perso il suo giocattolo preferito. Cosa fa?",
      choices:[
        { text:"🔍 Lo aiuta a cercarlo insieme", outcome:"Insieme trovano il giocattolo! Il bambino sorride di nuovo e diventano amici.", correct:true  },
        { text:"🚶 Continua per la sua strada",  outcome:"Il principe è andato via... un amico triste avrebbe avuto bisogno di aiuto.",   correct:false },
      ] },

    { id:"c12", format:"multiple_choice", type:"logica",    ageMin:5, ageMax:6, isBoss:true,
      prompt:"🐲 Il Drago chiede:\n12 stelle nel cielo. Ne cadono 4.\nNe nascono 2 nuove. Quante stelle?",
      emoji:"🐲", options:["8","9","10","11"], correct:2 },
  ],

  oceano: [
    // ── 3-4 anni ─────────────────────────────────────────────────────────────
    { id:"o01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🐟🐟🐟🐟", prompt:"Quanti pesci?", emoji:"🐬",
      options:["2️⃣","3️⃣","4️⃣","5️⃣"], correct:2 },

    { id:"o02", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🌊🌊🌊🌊", prompt:"Chi vive nel mare?", emoji:"🌊",
      options:["🐬","🦅","🐺","🦁"],   correct:0 },

    { id:"o03", format:"visual_tap", type:"empatia",   ageMin:3, ageMax:4,
      visual:"🐳😊",       prompt:"La balena è felice!\nCome si sente?", emoji:"🐳",
      options:["😊","😢","😠","😴"],   correct:0 },

    { id:"o04", format:"visual_tap", type:"pattern",   ageMin:3, ageMax:4,
      visual:"🐟🦀🐟🦀",  prompt:"Cosa viene dopo?\n🐟🦀🐟🦀__", emoji:"🐚",
      options:["🐟","🦀","🦈","🐙"],   correct:1 },

    { id:"o05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🔵🟦💧",     prompt:"Tocca la goccia d'acqua!", emoji:"💧",
      options:["💧","🔥","🌿","⭐"],   correct:0 },

    { id:"o06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🐠🐡🐠🐡🐠", prompt:"🦈 Lo Squalo chiede:\ncosa viene dopo? 🐠🐡🐠🐡🐠__", emoji:"🦈",
      options:["🐡","🐠","🦑","🦞"],   correct:1 },

    // ── 5-6 anni ─────────────────────────────────────────────────────────────
    { id:"o07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Sul fondo del mare ci sono 8 stelle marine.\nNe arrivano 4 nuove. Quante ce ne sono?",
      emoji:"⭐", options:["10","11","12","13"], correct:2 },

    { id:"o08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale di questi animali NON è un pesce?\n🐟 🦈 🐙 🐡",
      emoji:"🌊", options:["🐟 tonno","🦈 squalo","🐙 polpo","🐡 pesce palla"], correct:2 },

    { id:"o09", format:"sequence_tap",   type:"logica", ageMin:5, ageMax:6,
      prompt:"Metti in ordine dal più piccolo al più grande!",
      emoji:"📏",
      items:["🦐 Gamberetto","🐠 Pesciolino","🐬 Delfino","🐳 Balena"],
      correctOrder:[0,1,2,3] },

    { id:"o10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con MARE?",
      emoji:"🎶", options:["Sole","Cielo","Amare","Nuvola"], correct:2 },

    { id:"o11", format:"story_choice",    type:"empatia", ageMin:5, ageMax:6,
      emoji:"🐬",
      situation:"Il delfino trova una tartaruga impigliata in una rete. È pericoloso avvicinarsi. Cosa fa il delfino?",
      choices:[
        { text:"🤝 La aiuta ad uscire dalla rete", outcome:"Il delfino la libera! La tartaruga è salva e nuoteranno insieme per sempre.", correct:true },
        { text:"🏊 Nuota via veloce",               outcome:"La tartaruga è rimasta sola... a volte la gentilezza richiede coraggio.", correct:false },
      ] },

    { id:"o12", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🦈 Lo Squalo chiede:\n20 pesci nel banco. Metà si nasconde.\nArrivano 3 nuovi. Quanti pesci ci sono?",
      emoji:"🦈", options:["11","12","13","14"], correct:2 },
  ],

  mercato: [
    // ── 3-4 anni ─────────────────────────────────────────────────────────────
    { id:"m01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🍎🍎🍎🍎🍎", prompt:"Quante mele?", emoji:"🍎",
      options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },

    { id:"m02", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🍎🍊🍋🍇",  prompt:"Quale è la frutta gialla?", emoji:"🍋",
      options:["🍋","🍎","🍊","🍇"],   correct:0 },

    { id:"m03", format:"visual_tap", type:"empatia",   ageMin:3, ageMax:4,
      visual:"👧😄",       prompt:"La bambina ha comprato il gelato!\nCome si sente?", emoji:"🍦",
      options:["😄","😢","😠","😨"],   correct:0 },

    { id:"m04", format:"visual_tap", type:"pattern",   ageMin:3, ageMax:4,
      visual:"🔴🟡🔴🟡",  prompt:"Cosa viene dopo?\n🔴🟡🔴🟡__", emoji:"🎨",
      options:["🔴","🟡","🔵","🟢"],   correct:1 },

    { id:"m05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🍕🍔🌮🍎",  prompt:"Quale è il cibo più sano?", emoji:"🥗",
      options:["🍎","🍕","🍔","🌮"],   correct:0 },

    { id:"m06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🍎🍊🍎🍊🍎", prompt:"🧙 Il Mago chiede:\ncosa viene dopo? 🍎🍊🍎🍊🍎__", emoji:"🧙",
      options:["🍊","🍎","🍋","🍇"],   correct:1 },

    // ── 5-6 anni ─────────────────────────────────────────────────────────────
    { id:"m07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Hai 10 monete. Compri una mela che costa 3.\nQuante monete ti restano?",
      emoji:"💰", options:["5","6","7","8"], correct:2 },

    { id:"m08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale di questi NON si può mangiare?\n🍎 🍞 🧲 🍦",
      emoji:"🤔", options:["🍎 mela","🍞 pane","🧲 calamita","🍦 gelato"], correct:2 },

    { id:"m09", format:"sequence_tap",   type:"numeri", ageMin:5, ageMax:6,
      prompt:"Metti i prezzi dal più economico al più caro!",
      emoji:"🏷️",
      items:["🏷️ 1€","🏷️ 5€","🏷️ 2€","🏷️ 3€"],
      correctOrder:[0,2,3,1] },

    { id:"m10", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:6,
      prompt:"Il pittore mescola rosso e giallo.\nChe colore ottiene?",
      emoji:"🎨", options:["Verde","Arancione","Viola","Rosa"], correct:1 },

    { id:"m11", format:"story_choice",    type:"empatia",   ageMin:5, ageMax:6,
      emoji:"🛒",
      situation:"Al mercato, una signora anziana lascia cadere la spesa. Nessuno si ferma ad aiutarla. Cosa fai?",
      choices:[
        { text:"🤲 Mi fermo e raccolgo tutto", outcome:"La signora ti ringrazia con un sorriso enorme. Hai fatto la cosa giusta!", correct:true },
        { text:"🚶 Continuo per la mia strada",  outcome:"La signora è rimasta sola... un piccolo gesto può cambiare la giornata di qualcuno.", correct:false },
      ] },

    { id:"m12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🧙 Il Mago chiede:\nHai 15 caramelle. Le dividi in 3 sacchetti uguali.\nQuante caramelle in ogni sacchetto?",
      emoji:"🧙", options:["3","4","5","6"], correct:2 },
  ],

  galassia: [
    // ── 3-4 anni ─────────────────────────────────────────────────────────────
    { id:"g01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🚀🚀🚀",     prompt:"Quanti razzi?", emoji:"🚀",
      options:["1️⃣","2️⃣","3️⃣","4️⃣"], correct:2 },

    { id:"g02", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"⭐🌙☀️🌍",  prompt:"Quale è il sole?", emoji:"☀️",
      options:["☀️","⭐","🌙","🌍"],   correct:0 },

    { id:"g03", format:"visual_tap", type:"empatia",   ageMin:3, ageMax:4,
      visual:"👨‍🚀😃",    prompt:"L'astronauta atterra!\nCome si sente?", emoji:"👨‍🚀",
      options:["😃","😢","😠","😨"],   correct:0 },

    { id:"g04", format:"visual_tap", type:"pattern",   ageMin:3, ageMax:4,
      visual:"🌍🌕🌍🌕",  prompt:"Cosa viene dopo?\n🌍🌕🌍🌕__", emoji:"🔭",
      options:["🌍","🌕","⭐","🚀"],   correct:1 },

    { id:"g05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🌑🌒🌓🌔🌕", prompt:"Quale è la luna piena?", emoji:"🌕",
      options:["🌕","🌑","🌒","🌓"],   correct:0 },

    { id:"g06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"⭐🪐⭐🪐⭐", prompt:"👽 L'Alieno chiede:\ncosa viene dopo? ⭐🪐⭐🪐⭐__", emoji:"👽",
      options:["🪐","⭐","☀️","🌙"],   correct:1 },

    // ── 5-6 anni ─────────────────────────────────────────────────────────────
    { id:"g07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Un razzo va da Terra alla Luna in 3 giorni.\nAndata e ritorno quanto fa?",
      emoji:"🚀", options:["3","4","5","6"], correct:3 },

    { id:"g08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale pianeta è il più vicino al Sole?\n☀️ Mercurio — Venere — Terra — Marte",
      emoji:"🪐", options:["Mercurio","Venere","Terra","Marte"], correct:0 },

    { id:"g09", format:"sequence_tap",   type:"logica", ageMin:5, ageMax:6,
      prompt:"Metti in ordine: dal più piccolo al più grande!",
      emoji:"🔭",
      items:["🌍 Terra","☀️ Sole","🌕 Luna","🪐 Saturno"],
      correctOrder:[2,0,3,1] },

    { id:"g10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con STELLA?",
      emoji:"⭐", options:["Sole","Bella","Luna","Cielo"], correct:1 },

    { id:"g11", format:"story_choice",    type:"empatia", ageMin:5, ageMax:6,
      emoji:"👽",
      situation:"Il tuo razzo può portare solo una persona. Un alieno è rimasto solo sul pianeta e ha paura. Cosa fai?",
      choices:[
        { text:"🤝 Lo porto con me sulla Terra",   outcome:"L'alieno non è più solo! Hai trovato un amico dall'altra parte dell'universo.", correct:true },
        { text:"🚀 Parto da solo, è troppo rischioso", outcome:"L'alieno è rimasto solo nello spazio... a volte il coraggio è aiutare chi ha paura.", correct:false },
      ] },

    { id:"g12", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6, isBoss:true,
      prompt:"👽 L'Alieno chiede:\n100 stelle in cielo. Ne esplodono 15, ne nascono 8 nuove.\nQuante stelle ci sono?",
      emoji:"👽", options:["90","91","92","93"], correct:3 },
  ],
};

// ── CHALLENGES SET B (pool expanded per world) ────────────────────────────────
Object.assign(ALL_CHALLENGES, {
  foresta: ALL_CHALLENGES.foresta.concat([
    // 3-4 anni
    { id:"fb01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🦋🦋🦋🦋", prompt:"Quante farfalle?", emoji:"🌸",
      options:["2️⃣","3️⃣","4️⃣","5️⃣"], correct:2 },
    { id:"fb02", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
      visual:"🌷🌿🌷🌿", prompt:"Cosa viene dopo?\n🌷🌿🌷🌿__", emoji:"🌷",
      options:["🌷","🌿","🌺","🌻"], correct:1 },
    { id:"fb03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
      visual:"🐰😊", prompt:"Il coniglietto ha trovato le carote!\nCome si sente?", emoji:"🥕",
      options:["😊","😢","😠","😴"], correct:0 },
    { id:"fb04", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🐔🐮🐘🐸", prompt:"Chi fa le uova?", emoji:"🥚",
      options:["🐔","🐮","🐘","🐸"], correct:0 },
    { id:"fb05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🐌🐦🐢🐟", prompt:"Chi è il più lento?", emoji:"🌿",
      options:["🐌","🐦","🐢","🐟"], correct:0 },
    // boss B
    { id:"fb06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
      visual:"🍄🌿🍄🌿🍄", prompt:"🦉 Il Gufo chiede:\ncosa viene dopo? 🍄🌿🍄🌿🍄__", emoji:"🦉",
      options:["🌿","🍄","🌸","🍁"], correct:0 },
    // 5-6 anni
    { id:"fb07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Nella foresta 6 uccelli sono su un ramo.\n2 volano via, 4 arrivano.\nQuanti uccelli ci sono?",
      emoji:"🐦", options:["6","7","8","9"], correct:2 },
    { id:"fb08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale di questi NON è un insetto?\n🐝  🦋  🐌  🐜",
      emoji:"🌿", options:["🐝 ape","🦋 farfalla","🐌 lumaca","🐜 formica"], correct:2 },
    { id:"fb09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
      prompt:"Dal più piccolo al più grande. Tocca nell'ordine!",
      emoji:"📏",
      items:["🐜 Formica","🐦 Uccello","🐺 Lupo","🐘 Elefante"],
      correctOrder:[0,1,2,3] },
    { id:"fb10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con FORESTA?",
      emoji:"🎶", options:["Montagna","Finestra","Bosco","Fiore"], correct:1 },
    { id:"fb11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
      emoji:"🐺",
      situation:"Il lupo viene escluso dal gioco degli altri animali. Sta piangendo da solo sotto un albero. Cosa fai?",
      choices:[
        { text:"🤝 Lo invito a giocare con noi", outcome:"Il lupo sorride! Tutti giocano insieme. La gentilezza trasforma il mondo!", correct:true },
        { text:"🏃 Non è affar mio, me ne vado", outcome:"Il lupo è rimasto solo... includere chi è escluso è un atto di grande coraggio.", correct:false },
      ] },
    { id:"fb12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🦉 Il Grande Gufo chiede:\nHai 8 ghiande. Ne regali 3 all'amico scoiattolo. Quante ne restano?",
      emoji:"🦉", options:["4","5","6","7"], correct:1 },
    { id:"fb12b", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🦉 Il Grande Gufo chiede:\nUna settimana ha 7 giorni. Quanti giorni ci sono in 2 settimane?",
      emoji:"🦉", options:["10","12","14","16"], correct:2 },
  ]),
  castello: ALL_CHALLENGES.castello.concat([
    { id:"cb01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🌟🌟🌟🌟🌟", prompt:"Quante stelle?", emoji:"👑",
      options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },
    { id:"cb02", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
      visual:"🐱😊", prompt:"Il gatto ha trovato il latte!\nCome si sente?", emoji:"🐱",
      options:["😊","😢","😠","😴"], correct:0 },
    { id:"cb03", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
      visual:"🔷🔸🔷🔸", prompt:"Cosa viene dopo?\n🔷🔸🔷🔸__", emoji:"✨",
      options:["🔷","🔸","🔵","🟠"], correct:0 },
    { id:"cb04", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🌙⭐☀️🐟", prompt:"Quale NON appartiene al cielo?", emoji:"🌌",
      options:["🌙","⭐","☀️","🐟"], correct:3 },
    { id:"cb05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🐮🐕🐱🦆", prompt:"Chi dice MUU?", emoji:"🏰",
      options:["🐮","🐕","🐱","🦆"], correct:0 },
    { id:"cb06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
      visual:"🏰⭐🏰⭐🏰", prompt:"🐲 Il Drago chiede:\ncosa viene dopo? 🏰⭐🏰⭐🏰__", emoji:"🐲",
      options:["⭐","🏰","🌟","💫"], correct:0 },
    { id:"cb07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"La principessa ha 8 frecce.\nNe usa 3 nel torneo.\nQuante frecce le restano?",
      emoji:"🏹", options:["5","6","7","8"], correct:0 },
    { id:"cb08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Qual è il contrario di GRANDE?",
      emoji:"🔄", options:["Piccolo","Nuovo","Vecchio","Lungo"], correct:0 },
    { id:"cb09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
      prompt:"Metti in ordine dalla più corta alla più alta!",
      emoji:"📏",
      items:["🌱 Germoglio","🌿 Pianticella","🌳 Albero","🏔️ Montagna"],
      correctOrder:[0,1,2,3] },
    { id:"cb10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con CASTELLO?",
      emoji:"🎶", options:["Montagna","Cammello","Giardino","Palazzo"], correct:1 },
    { id:"cb11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
      emoji:"🤝",
      situation:"Il principe trova una strega da sola che sembra spaventata. Gli altri cavalieri fuggono. Cosa fa?",
      choices:[
        { text:"💬 Si avvicina e le chiede se ha bisogno d'aiuto", outcome:"La strega sorride: era solo una vecchina! A volte le apparenze ingannano.", correct:true },
        { text:"🐴 Scappa con gli altri cavalieri", outcome:"La strega è rimasta sola... la gentilezza è più forte di qualsiasi incantesimo.", correct:false },
      ] },
    { id:"cb12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🐲 Il Drago chiede:\nUn castello ha 4 lati con 3 finestre ciascuno.\nQuante finestre in tutto?",
      emoji:"🐲", options:["9","10","11","12"], correct:3 },
  ]),
  oceano: ALL_CHALLENGES.oceano.concat([
    { id:"ob01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🐡🐡🐡🐡🐡", prompt:"Quanti pesci palla?", emoji:"🐬",
      options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },
    { id:"ob02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🐠🦅🐙🦑", prompt:"Chi vola?", emoji:"🌊",
      options:["🐠","🦅","🐙","🦑"], correct:1 },
    { id:"ob03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
      visual:"🐬😄", prompt:"Il delfino ha trovato i suoi amici!\nCome si sente?", emoji:"🐬",
      options:["😄","😢","😠","😴"], correct:0 },
    { id:"ob04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
      visual:"🌊💧🌊💧", prompt:"Cosa viene dopo?\n🌊💧🌊💧__", emoji:"💧",
      options:["🌊","💧","🐠","🐚"], correct:0 },
    { id:"ob05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"💙💚🔴🟡", prompt:"Che colore è il mare?", emoji:"🌊",
      options:["💙","💚","🔴","🟡"], correct:0 },
    { id:"ob06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
      visual:"🐙🦑🐙🦑🐙", prompt:"🦈 Lo Squalo chiede:\ncosa viene dopo? 🐙🦑🐙🦑🐙__", emoji:"🦈",
      options:["🦑","🐙","🐬","🦞"], correct:0 },
    { id:"ob07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Un polpo ha 8 tentacoli.\nNe perde 2 in una lotta (poi ricrescono!).\nQuanti tentacoli ha adesso?",
      emoji:"🐙", options:["6","7","8","9"], correct:0 },
    { id:"ob08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale di questi animali vola?\n🦈  🐙  🐦  🐳",
      emoji:"🌊", options:["🦈 squalo","🐙 polpo","🐦 gabbiano","🐳 balena"], correct:2 },
    { id:"ob09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
      prompt:"Dal più leggero al più pesante. Tocca nell'ordine!",
      emoji:"⚖️",
      items:["🦐 Gamberetto","🐡 Pesce","🦑 Calamaro","🐳 Balena"],
      correctOrder:[0,1,2,3] },
    { id:"ob10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con OCEANO?",
      emoji:"🎶", options:["Marino","Lontano","Profondo","Azzurro"], correct:1 },
    { id:"ob11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
      emoji:"🐢",
      situation:"Il piccolo granchio ha perso la sua conchiglia e trema di freddo. Hai trovato una conchiglia bellissima. Cosa fai?",
      choices:[
        { text:"🐚 Gliela regalo — lui ne ha più bisogno", outcome:"Il granchio è al caldo! Hai fatto un gesto meraviglioso. Sei il suo eroe!", correct:true },
        { text:"🏃 La tengo, l'ho trovata io", outcome:"Il granchio è rimasto senza casa... a volte dare qualcosa di tuo rende felici entrambi.", correct:false },
      ] },
    { id:"ob12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🦈 Lo Squalo chiede:\n3 barche pescano 5 pesci ciascuna.\nQuanti pesci in tutto?",
      emoji:"🦈", options:["12","13","15","16"], correct:2 },
  ]),
  mercato: ALL_CHALLENGES.mercato.concat([
    { id:"mb01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🍊🍊🍊🍊🍊🍊", prompt:"Quante arance?", emoji:"🍊",
      options:["4️⃣","5️⃣","6️⃣","7️⃣"], correct:2 },
    { id:"mb02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🍎🥦🍇🍓", prompt:"Quale è la verdura?", emoji:"🥗",
      options:["🍎","🥦","🍇","🍓"], correct:1 },
    { id:"mb03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
      visual:"👦😔", prompt:"Il bambino ha perso i soldi.\nCome si sente?", emoji:"💰",
      options:["😔","😊","😠","🤩"], correct:0 },
    { id:"mb04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
      visual:"🍇🍓🍇🍓", prompt:"Cosa viene dopo?\n🍇🍓🍇🍓__", emoji:"🍇",
      options:["🍇","🍓","🍋","🍍"], correct:0 },
    { id:"mb05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🧃🥛🍕💧", prompt:"Quale NON si beve?", emoji:"🤔",
      options:["🧃","🥛","🍕","💧"], correct:2 },
    { id:"mb06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
      visual:"🌈🎨🌈🎨🌈", prompt:"🧙 Il Mago chiede:\ncosa viene dopo? 🌈🎨🌈🎨🌈__", emoji:"🧙",
      options:["🎨","🌈","⭐","💫"], correct:0 },
    { id:"mb07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Hai 20 monete e ne spendi 7 al mercato.\nQuante monete ti restano?",
      emoji:"💰", options:["11","12","13","14"], correct:2 },
    { id:"mb08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale di questi pesa di più?\n🪶  🍎  🧲  🪨",
      emoji:"⚖️", options:["🪶 piuma","🍎 mela","🧲 calamita","🪨 sasso"], correct:3 },
    { id:"mb09", format:"sequence_tap", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Dal più caro al meno caro. Tocca nell'ordine!",
      emoji:"🏷️",
      items:["🏷️ 8€","🏷️ 2€","🏷️ 5€","🏷️ 1€"],
      correctOrder:[0,2,1,3] },
    { id:"mb10", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:6,
      prompt:"Il pittore mescola blu e rosso.\nChe colore ottiene?",
      emoji:"🎨", options:["Viola","Verde","Arancione","Giallo"], correct:0 },
    { id:"mb11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
      emoji:"🛒",
      situation:"Al mercato vedi un bambino che prova a prendere una mela ma non arriva. La commessa non se ne accorge. Cosa fai?",
      choices:[
        { text:"🤲 L'aiuto a prendere la mela", outcome:"Il bambino sorride! Un piccolo gesto può cambiare la giornata di qualcuno.", correct:true },
        { text:"🚶 Non sono affari miei", outcome:"Il bambino non è riuscito a prendere la mela... a volte basta un secondo per aiutare.", correct:false },
      ] },
    { id:"mb12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"🧙 Il Mago chiede:\nCompri 3 caramelle a 2€ l'una.\nHai 10€. Quanti euro ti restano?",
      emoji:"🧙", options:["4","5","6","7"], correct:0 },
  ]),
  galassia: ALL_CHALLENGES.galassia.concat([
    { id:"gb01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
      visual:"🌟🌟🌟🌟🌟🌟", prompt:"Quante stelle?", emoji:"🚀",
      options:["4️⃣","5️⃣","6️⃣","7️⃣"], correct:2 },
    { id:"gb02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"⭐🪐☀️🚀", prompt:"Quale è il pianeta?", emoji:"🔭",
      options:["⭐","🪐","☀️","🚀"], correct:1 },
    { id:"gb03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
      visual:"👨‍🚀😨", prompt:"L'astronauta è spaventato!\nCome si sente?", emoji:"👨‍🚀",
      options:["😨","😊","😠","😴"], correct:0 },
    { id:"gb04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
      visual:"🚀💫🚀💫", prompt:"Cosa viene dopo?\n🚀💫🚀💫__", emoji:"💫",
      options:["🚀","💫","⭐","🌌"], correct:0 },
    { id:"gb05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
      visual:"🚀🐦🐟🌻", prompt:"Quale va sulla Luna?", emoji:"🌕",
      options:["🚀","🐦","🐟","🌻"], correct:0 },
    { id:"gb06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
      visual:"🌌🌟🌌🌟🌌", prompt:"👽 L'Alieno chiede:\ncosa viene dopo? 🌌🌟🌌🌟🌌__", emoji:"👽",
      options:["🌟","🌌","☀️","🌙"], correct:0 },
    { id:"gb07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
      prompt:"Un razzo parte alle 8 di mattina\ne atterra alle 14. Quante ore dura il viaggio?",
      emoji:"🚀", options:["4","5","6","7"], correct:2 },
    { id:"gb08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
      prompt:"Quale pianeta ha gli anelli famosi?",
      emoji:"🪐", options:["Giove","Saturno","Marte","Venere"], correct:1 },
    { id:"gb09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
      prompt:"Metti in ordine i pianeti dal Sole! Tocca nell'ordine corretto.",
      emoji:"☀️",
      items:["🌍 Terra","🔴 Marte","🟤 Mercurio","🟠 Venere"],
      correctOrder:[2,3,0,1] },
    { id:"gb10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
      prompt:"Quale parola fa rima con RAZZO?",
      emoji:"🎶", options:["Stivale","Pazzo","Luna","Nuvola"], correct:1 },
    { id:"gb11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
      emoji:"👽",
      situation:"Sulla luna incontri un alieno triste e solitario. Ha bisogno di indicazioni per tornare a casa ma non parla la tua lingua. Cosa fai?",
      choices:[
        { text:"🗺️ Cerco di aiutarlo con gesti e disegni", outcome:"L'alieno capisce! Sorride e ti saluta con le antenne. Un amico dell'universo!", correct:true },
        { text:"🚀 Parto — non riesco a capirlo", outcome:"L'alieno è rimasto solo nello spazio... la gentilezza non ha bisogno di parole.", correct:false },
      ] },
    { id:"gb12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
      prompt:"👽 L'Alieno chiede:\nIl razzo ha 4 serbatoi con 25 litri ciascuno.\nQuanti litri in tutto?",
      emoji:"👽", options:["80","90","100","110"], correct:2 },
  ]),
});

// ── AGE 7-8 CHALLENGES ───────────────────────────────────────────────────────
Object.assign(ALL_CHALLENGES, {
  foresta: ALL_CHALLENGES.foresta.concat([
    { id:"fa01", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Uno scoiattolo ha 24 ghiande e ne mangia 1/3. Quante ne restano?", emoji:"🐿️",
      options:["8","12","16","6"], correct:2 },
    { id:"fa02", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"In una foresta ci sono alberi in fila: quercia, pino, betulla, quercia, pino, betulla... Qual è il 7° albero?", emoji:"🌳",
      options:["Quercia","Pino","Betulla","Acero"], correct:0 },
    { id:"fa03", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🦉 Il Gufo Saggio chiede:\nUna volpe mangia 3 conigli al giorno. In una settimana quanti ne mangia?", emoji:"🦉",
      options:["18","21","24","28"], correct:1 },
  ]),
  castello: ALL_CHALLENGES.castello.concat([
    { id:"ca01", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Il Re ha 36 monete d'oro e le divide equamente tra 4 cavalieri. Quante ne riceve ciascuno?", emoji:"👑",
      options:["8","9","6","12"], correct:1 },
    { id:"ca02", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"Nella sequenza: 2, 4, 8, 16, … qual è il numero mancante?", emoji:"🔮",
      options:["18","24","32","20"], correct:2 },
    { id:"ca03", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🏰 Il Re chiede:\nUn castello ha 5 torri con 12 soldati ciascuna. Quanti soldati in totale?", emoji:"🏰",
      options:["50","55","60","65"], correct:2 },
  ]),
  oceano: ALL_CHALLENGES.oceano.concat([
    { id:"oa01", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Un polpo ha 8 tentacoli. Quanti tentacoli hanno 3 polpi insieme?", emoji:"🐙",
      options:["16","18","24","32"], correct:2 },
    { id:"oa02", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"Una barca parte alle 9:00 e arriva alle 12:30. Quante ore ha navigato?", emoji:"⛵",
      options:["2 ore","2,5 ore","3 ore","3,5 ore"], correct:3 },
    { id:"oa03", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🐬 Splash chiede:\nIn fondo al mare ci sono 7 bauli con 15 monete ciascuno. Quante monete in tutto?", emoji:"🐬",
      options:["95","100","105","110"], correct:2 },
  ]),
  mercato: ALL_CHALLENGES.mercato.concat([
    { id:"ma01", format:"multiple_choice", type:"creativita", ageMin:7, ageMax:8,
      prompt:"Mischiando rosso e giallo ottengo arancione. Mischiando rosso e blu ottengo…?", emoji:"🎨",
      options:["Verde","Viola","Rosa","Marrone"], correct:1 },
    { id:"ma02", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Un mercante ha 45 mele. Ne vende 18 al mattino e 12 al pomeriggio. Quante rimangono?", emoji:"🍎",
      options:["25","15","20","10"], correct:1 },
    { id:"ma03", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🎪 Il Pittore chiede:\nUna tavolozza ha 8 colori. Un pittore vuole mescolare tutte le coppie possibili. Quante miscele può creare?", emoji:"🎪",
      options:["16","24","28","32"], correct:2 },
  ]),
  galassia: ALL_CHALLENGES.galassia.concat([
    { id:"ga01", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"La Terra compie 1 giro intorno al Sole in quanto tempo?", emoji:"🌍",
      options:["24 ore","1 mese","1 anno","10 anni"], correct:2 },
    { id:"ga02", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Il sistema solare ha 8 pianeti. Se ne scoprissi altri 4, quanti pianeti ci sarebbero?", emoji:"🪐",
      options:["10","12","14","16"], correct:1 },
    { id:"ga03", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🚀 Cosmo chiede:\nUn razzo viaggia a 100 km/h. In 2 ore e mezza quanti km percorre?", emoji:"🚀",
      options:["200","225","250","300"], correct:2 },
  ]),
});

// ── WORD-PICTURE CHALLENGES (literacy, ages 5-8) ─────────────────────────────
// format:"word_picture" — show a word, tap the matching emoji
[
  { id:"wp01", world:"foresta", word:"ALBERO",  options:["🌳","🐟","🚗","🏠"], correct:0 },
  { id:"wp02", world:"foresta", word:"FARFALLA", options:["🦋","🐸","🌺","🐦"], correct:0 },
  { id:"wp03", world:"castello", word:"CORONA",  options:["👑","🗡️","🏰","💎"], correct:0 },
  { id:"wp04", world:"castello", word:"DRAGO",   options:["🐲","🦁","🐺","🦅"], correct:0 },
  { id:"wp05", world:"oceano",   word:"POLPO",   options:["🐙","🐬","🦈","🐠"], correct:0 },
  { id:"wp06", world:"oceano",   word:"BALENA",  options:["🐋","🦞","🐡","🦑"], correct:0 },
  { id:"wp07", world:"galassia", word:"PIANETA",  options:["🪐","⭐","☄️","🌙"], correct:0 },
  { id:"wp08", world:"mercato",  word:"MELA",    options:["🍎","🍊","🍋","🍇"], correct:0 },
].forEach(({ id, world, word, options, correct }) => {
  ALL_CHALLENGES[world].push({
    id, format:"word_picture", type:"parole",
    ageMin:5, ageMax:8, emoji:"📖",
    word, options, correct,
  });
});

// ── WORLD: VULCANO MAGICO ─────────────────────────────────────────────────────
ALL_CHALLENGES.vulcano = [
  // ── 3-4 anni ────────────────────────────────────────────────────────────────
  { id:"v01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
    visual:"🔥🔥🔥🔥", prompt:"Quante fiamme?", emoji:"🌋",
    options:["2️⃣","3️⃣","4️⃣","5️⃣"], correct:2 },
  { id:"v02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"🧊💧🔥🌊", prompt:"Quale scalda?", emoji:"🔥",
    options:["🧊","💧","🔥","🌊"], correct:2 },
  { id:"v03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
    visual:"🦊😱", prompt:"La volpe è spaventata!\nCome si sente?", emoji:"🦊",
    options:["😱","😊","😠","😴"], correct:0 },
  { id:"v04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
    visual:"🌋🔥🌋🔥", prompt:"Cosa viene dopo?\n🌋🔥🌋🔥__", emoji:"🔥",
    options:["🌋","🔥","💧","🧊"], correct:0 },
  { id:"v05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"🌊🧊❄️🔥", prompt:"Quale NON è freddo?", emoji:"🌡️",
    options:["🌊","🧊","❄️","🔥"], correct:3 },
  { id:"v06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
    visual:"🦅🔥🦅🔥🦅", prompt:"🐦 La Fenice chiede:\ncosa viene dopo? 🦅🔥🦅🔥🦅__", emoji:"🐦",
    options:["🔥","🦅","🌋","💧"], correct:0 },
  { id:"v_dd1", format:"drag_drop", type:"logica", ageMin:3, ageMax:4,
    prompt:"Abbina ogni animale al posto dove vive!", emoji:"🌋",
    items:["🦁","🐬","🦅"],
    zones:["🌋 Vulcano","🌊 Mare","☁️ Cielo"],
    correctMapping:[0,1,2] },
  // ── 5-6 anni ────────────────────────────────────────────────────────────────
  { id:"v07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
    prompt:"Il vulcano ha eruttato 6 rocce.\nNe cadono 4 nel mare. Quante restano?",
    emoji:"🌋", options:["1","2","3","4"], correct:1 },
  { id:"v08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
    prompt:"Quale materiale NON è infiammabile?\n🪵  🧊  🍃  🧻",
    emoji:"🔥", options:["🪵 legno","🧊 ghiaccio","🍃 foglie","🧻 carta"], correct:1 },
  { id:"v09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
    prompt:"Metti in ordine dal più freddo al più caldo!",
    emoji:"🌡️",
    items:["🧊 Ghiaccio",  "💧 Acqua fredda", "☀️ Sole", "🌋 Lava"],
    correctOrder:[0,1,2,3] },
  { id:"v10", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
    prompt:"Quale parola fa rima con FUOCO?",
    emoji:"🎶", options:["Gioco","Bosco","Fiume","Cielo"], correct:0 },
  { id:"v11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
    emoji:"🌋",
    situation:"Un dragone piange vicino al vulcano. Dice che ha perso la sua famiglia nell'eruzione. Cosa fai?",
    choices:[
      { text:"🤗 Gli sto vicino e lo aiuto a cercarla", outcome:"Il dragone sorride tra le lacrime. Insieme trovate la sua famiglia! Il coraggio è condividerlo.", correct:true },
      { text:"🏃 Scappo, i draghi mi spaventano", outcome:"Il dragone è rimasto solo... a volte le creature più spaventose hanno bisogno di aiuto.", correct:false },
    ] },
  { id:"v12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
    prompt:"🌋 La Fenice chiede:\nIl vulcano erutta ogni 4 ore.\nIn un giorno quante volte erutta?",
    emoji:"🐦", options:["4","5","6","7"], correct:2 },
];

// ── WORLD: BIBLIOTECA INCANTATA ───────────────────────────────────────────────
ALL_CHALLENGES.biblioteca = [
  // ── 3-4 anni ────────────────────────────────────────────────────────────────
  { id:"b01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
    visual:"📚📚📚", prompt:"Quanti libri?", emoji:"📚",
    options:["1️⃣","2️⃣","3️⃣","4️⃣"], correct:2 },
  { id:"b02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"📚✏️🖍️🎸", prompt:"Quale si legge?", emoji:"🦉",
    options:["📚","✏️","🖍️","🎸"], correct:0 },
  { id:"b03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
    visual:"👧😊", prompt:"La bambina ha letto il suo libro preferito!\nCome si sente?", emoji:"📖",
    options:["😊","😢","😠","😴"], correct:0 },
  { id:"b04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
    visual:"📚✨📚✨", prompt:"Cosa viene dopo?\n📚✨📚✨__", emoji:"✨",
    options:["📚","✨","🔮","📖"], correct:0 },
  { id:"b05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"🖊️✏️📝🎸", prompt:"Quale NON si usa per scrivere?", emoji:"✏️",
    options:["🖊️","✏️","📝","🎸"], correct:3 },
  { id:"b06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
    visual:"🦉📚🦉📚🦉", prompt:"🦉 La Civetta chiede:\ncosa viene dopo? 🦉📚🦉📚🦉__", emoji:"🦉",
    options:["📚","🦉","✨","🔮"], correct:0 },
  { id:"b_dd1", format:"drag_drop", type:"logica", ageMin:3, ageMax:4,
    prompt:"Abbina ogni cosa al suo posto!", emoji:"📚",
    items:["📚","🎸","🖊️"],
    zones:["📖 Leggo","🎵 Suono","✏️ Scrivo"],
    correctMapping:[0,1,2] },

  // ── Alfabeto (ages 3-6) ───────────────────────────────────────────────────
  // Each challenge: exactly ONE option starts with the target letter
  { id:"ba_A", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🦅🐬🐻🌺", prompt:"Quale inizia con la lettera A?\n(Aquila · Delfino · Orso · Fiore)", emoji:"🔤",
    options:["🦅","🐬","🐻","🌺"], correct:0 },

  { id:"ba_B", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐬🐋🐻🐸", prompt:"Quale inizia con la lettera B?\n(Delfino · Balena · Orso · Rana)", emoji:"🔤",
    options:["🐬","🐋","🐻","🐸"], correct:1 },

  { id:"ba_C", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐶🐻🐸🐬", prompt:"Quale inizia con la lettera C?\n(Cane · Orso · Rana · Delfino)", emoji:"🔤",
    options:["🐶","🐻","🐸","🐬"], correct:0 },

  { id:"ba_E", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐻🐸🐘🐬", prompt:"Quale inizia con la lettera E?\n(Orso · Rana · Elefante · Delfino)", emoji:"🔤",
    options:["🐻","🐸","🐘","🐬"], correct:2 },

  { id:"ba_F", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐬🐻🐸🦋", prompt:"Quale inizia con la lettera F?\n(Delfino · Orso · Rana · Farfalla)", emoji:"🔤",
    options:["🐬","🐻","🐸","🦋"], correct:3 },

  { id:"ba_G", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐱🐬🐻🐸", prompt:"Quale inizia con la lettera G?\n(Gatto · Delfino · Orso · Rana)", emoji:"🔤",
    options:["🐱","🐬","🐻","🐸"], correct:0 },

  { id:"ba_L", format:"visual_tap", type:"parole", ageMin:4, ageMax:6,
    visual:"🐬🦁🐻🐸", prompt:"Quale inizia con la lettera L?\n(Delfino · Leone · Orso · Rana)", emoji:"🔤",
    options:["🐬","🦁","🐻","🐸"], correct:1 },

  { id:"ba_M", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🍎🐬🐻🐸", prompt:"Quale inizia con la lettera M?\n(Mela · Delfino · Orso · Rana)", emoji:"🔤",
    options:["🍎","🐬","🐻","🐸"], correct:0 },

  { id:"ba_P", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐬🐻🐧🐸", prompt:"Quale inizia con la lettera P?\n(Delfino · Orso · Pinguino · Rana)", emoji:"🔤",
    options:["🐬","🐻","🐧","🐸"], correct:2 },

  { id:"ba_R", format:"visual_tap", type:"parole", ageMin:4, ageMax:7,
    visual:"🚀🐬🐻🌺", prompt:"Quale inizia con la lettera R?\n(Razzo · Delfino · Orso · Fiore)", emoji:"🔤",
    options:["🚀","🐬","🐻","🌺"], correct:0 },

  { id:"ba_S", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"☀️🐬🐻🐸", prompt:"Quale inizia con la lettera S?\n(Sole · Delfino · Orso · Rana)", emoji:"🔤",
    options:["☀️","🐬","🐻","🐸"], correct:0 },

  { id:"ba_T", format:"visual_tap", type:"parole", ageMin:5, ageMax:6,
    visual:"🐬🐢🐻🐸", prompt:"Quale inizia con la lettera T?\n(Delfino · Tartaruga · Orso · Rana)", emoji:"🔤",
    options:["🐬","🐢","🐻","🐸"], correct:1 },

  // ── 5-6 anni ────────────────────────────────────────────────────────────────
  { id:"b07", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6,
    prompt:"Quale parola significa il contrario di RUMORE?",
    emoji:"🔇", options:["Silenzio","Suono","Voce","Musica"], correct:0 },
  { id:"b08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
    prompt:"Una biblioteca ha 5 scaffali con 8 libri ciascuno.\nQuanti libri in tutto?",
    emoji:"📚", options:["35","38","40","45"], correct:2 },
  { id:"b09", format:"sequence_tap", type:"parole", ageMin:5, ageMax:6,
    prompt:"Metti le parole in ordine alfabetico!",
    emoji:"🔤",
    items:["🦁 Leone","🐝 Ape","🦊 Volpe","🦆 Papera"],
    correctOrder:[1,0,3,2] },
  { id:"b10", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:6,
    prompt:"Una storia ha sempre un inizio, uno svolgimento e una…?",
    emoji:"📖", options:["Fine","Copertina","Titolo","Illustrazione"], correct:0 },
  { id:"b11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
    emoji:"📚",
    situation:"Il tuo amico non sa leggere bene e si vergogna. Tutti ridono quando sbaglia. Cosa fai?",
    choices:[
      { text:"📖 Lo aiuto a leggere piano piano insieme", outcome:"Il tuo amico migliora ogni giorno! La tua gentilezza vale più di mille libri.", correct:true },
      { text:"😶 Non dico nulla per non imbarazzarlo", outcome:"Restare in silenzio a volte fa sentire ancora più soli. Un piccolo aiuto cambia tutto.", correct:false },
    ] },
  { id:"b12", format:"multiple_choice", type:"parole", ageMin:5, ageMax:6, isBoss:true,
    prompt:"🦉 La Civetta chiede:\nQuale di queste è una parola con il doppio?",
    emoji:"🦉", options:["Mamma","Cane","Luna","Pane"], correct:0 },

  // ── Filastrocche della Biblioteca ────────────────────────────────────────
  { id:"b_rh1", format:"rhyme_complete", type:"parole", ageMin:3, ageMax:5,
    emoji:"📜",
    prompt:"Il mago agita la bacchetta d'oro,\ne trasforma il ferro nel suo ___",
    options:["tesoro","banco","libro","tetto"], correct:0 },

  { id:"b_rh2", format:"rhyme_complete", type:"parole", ageMin:5, ageMax:7,
    emoji:"📜",
    prompt:"La fata vola e fa girare,\nle stelle si mettono a ___",
    options:["ballare","mangiare","dormire","piangere"], correct:0 },

  { id:"b_rh3", format:"rhyme_complete", type:"parole", ageMin:6, ageMax:8, isBoss:true,
    emoji:"📜",
    prompt:"🦉 La Civetta chiede:\nLa principessa nell'alto castello chiaro,\naspettava il principe buono e ___",
    options:["caro","bello","forte","lontano"], correct:0 },

  // ── Letter tracing (age 3-4) ─────────────────────────────────────────────
  { id:"lt_I", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"I", word:"Isola", wordEmoji:"🏝️",
    emoji:"✏️", prompt:"Traccia la lettera I come in Isola!", tts:[] },
  { id:"lt_O", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"O", word:"Orso", wordEmoji:"🐻",
    emoji:"✏️", prompt:"Traccia la lettera O come in Orso!", tts:[] },
  { id:"lt_U", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"U", word:"Uva", wordEmoji:"🍇",
    emoji:"✏️", prompt:"Traccia la lettera U come in Uva!", tts:[] },
  { id:"lt_A", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"A", word:"Arancia", wordEmoji:"🍊",
    emoji:"✏️", prompt:"Traccia la lettera A come in Arancia!", tts:[] },
  { id:"lt_M", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"M", word:"Mela", wordEmoji:"🍎",
    emoji:"✏️", prompt:"Traccia la lettera M come in Mela!", tts:[] },
  { id:"lt_E", format:"letter_trace", type:"parole", ageMin:3, ageMax:4,
    letter:"E", word:"Elefante", wordEmoji:"🐘",
    emoji:"✏️", prompt:"Traccia la lettera E come in Elefante!", tts:[] },
];

// ── AGE 7-8 EXTENSIONS: VULCANO + BIBLIOTECA ─────────────────────────────────
Object.assign(ALL_CHALLENGES, {
  vulcano: ALL_CHALLENGES.vulcano.concat([
    { id:"va01", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Il magma scorre a 15 km/h. In 3 ore quanti km percorre?", emoji:"🌋",
      options:["30","40","45","50"], correct:2 },
    { id:"va02", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"La temperatura della lava è circa 1200°C. L'acqua bolle a 100°C. Quante volte è più calda la lava?", emoji:"🌡️",
      options:["10 volte","12 volte","15 volte","20 volte"], correct:1 },
    { id:"va03", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🌋 La Fenice chiede:\nUn vulcano è eruttato in: 1980, 1992, 2004, 2016... Quando erutta di nuovo?", emoji:"🐦",
      options:["2024","2026","2028","2030"], correct:2 },
    { id:"va04", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Un'eruzione dura 2 giorni e 6 ore. Quante ore dura in totale?", emoji:"⏱️",
      options:["48","50","54","60"], correct:2 },
    { id:"va05", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"Le rocce che si formano dal raffreddamento della lava si chiamano...", emoji:"🪨",
      options:["Rocce magmatiche","Rocce sedimentarie","Rocce metamorfiche","Cristalli"], correct:0 },
    { id:"va06", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8,
      prompt:"Il gas più abbondante emesso dai vulcani è...", emoji:"💨",
      options:["Vapore acqueo","Ossigeno","Anidride carbonica","Idrogeno"], correct:0 },
  ]),
  biblioteca: ALL_CHALLENGES.biblioteca.concat([
    { id:"ba01", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8,
      prompt:"Quale di queste è una parola composta?", emoji:"📖",
      options:["Portafoglio","Bambino","Scuola","Gioco"], correct:0 },
    { id:"ba02", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Un libro ha 180 pagine. Leggi 15 pagine al giorno. In quanti giorni lo finisci?", emoji:"📚",
      options:["10","12","15","18"], correct:1 },
    { id:"ba03", format:"multiple_choice", type:"creativita", ageMin:7, ageMax:8, isBoss:true,
      prompt:"🦉 La Civetta chiede:\nUna fiaba inizia sempre con 'C'era una volta'. Come si chiama questa formula?", emoji:"🦉",
      options:["Formula magica","Incipit","Finale","Titolo"], correct:1 },
    { id:"ba04", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8,
      prompt:"Cosa significa 'sinonimo'?", emoji:"📝",
      options:["Parola con significato simile","Parola contraria","Parola straniera","Errore grammaticale"], correct:0 },
    { id:"ba05", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8,
      prompt:"Una biblioteca ha 5 scaffali con 40 libri ciascuno. Quanti libri ci sono in tutto?", emoji:"📚",
      options:["150","180","200","220"], correct:2 },
    { id:"ba06", format:"multiple_choice", type:"creativita", ageMin:7, ageMax:8,
      prompt:"Quale figura retorica usa la parola 'come' per fare un paragone?", emoji:"✍️",
      options:["Similitudine","Metafora","Allitterazione","Personificazione"], correct:0 },
  ]),
});

// ── LABORATORIO LOGICO (Mondo 8) ──────────────────────────────────────────────
ALL_CHALLENGES.laboratorio = [
  // ── 4-5 anni: if_else_tap + code_sequence 3 passi ───────────────────────────
  { id:"lab01", format:"if_else_tap", type:"coding", ageMin:4, ageMax:5,
    emoji:"🐻", condition:"L'orso vede il miele 🍯",
    prompt:"L'orso ha fame. Se vede il miele, lo mangia.\nL'orso vede il miele?",
    correct:0 },

  { id:"lab02", format:"if_else_tap", type:"coding", ageMin:4, ageMax:5,
    emoji:"☂️", condition:"Oggi piove? 🌧️",
    prompt:"Se piove, prendi l'ombrello.\nOggi c'è il sole! ☀️",
    correct:1 },

  { id:"lab03", format:"code_sequence", type:"coding", ageMin:4, ageMax:5,
    emoji:"🤖", prompt:"Aiuta il robot a fare colazione!\nMetti in ordine le istruzioni:",
    items:["🥣 Mangia i cereali","🥛 Versa il latte","🛒 Apri la scatola"],
    correctOrder:[2,1,0] },

  { id:"lab04", format:"if_else_tap", type:"coding", ageMin:4, ageMax:5,
    emoji:"🔢", condition:"3 è più grande di 5?",
    prompt:"Se il numero è più grande di 5, dì VERO.\nIl numero è 3.",
    correct:1 },

  { id:"lab05", format:"code_sequence", type:"coding", ageMin:4, ageMax:5,
    emoji:"🤖", prompt:"Come si veste il robot al mattino?\nMetti in ordine:",
    items:["👕 Metti la maglietta","👖 Indossa i pantaloni","🧦 Calza i calzini"],
    correctOrder:[2,0,1] },

  { id:"lab06", format:"if_else_tap", type:"coding", ageMin:4, ageMax:5, isBoss:true,
    emoji:"🤖", condition:"Il robot ha abbastanza energia? 🔋",
    prompt:"BOSS! 👾\nSe il robot ha abbastanza energia, può camminare.\nIl robot ha 80% di energia!",
    correct:0 },

  // ── 5-6 anni: sequenze 4 passi, condizioni, debug base ──────────────────────
  { id:"lab07", format:"code_sequence", type:"coding", ageMin:5, ageMax:6,
    emoji:"🌱", prompt:"Ordina le istruzioni per annaffiare la pianta:",
    items:["💧 Annaffia la pianta","🪣 Riempi il secchio","🌡️ Controlla il terreno","☀️ Metti al sole"],
    correctOrder:[2,1,0,3] },

  { id:"lab08", format:"if_else_tap", type:"coding", ageMin:5, ageMax:6,
    emoji:"🔢", condition:"6 è un numero pari?",
    prompt:"SE il numero è pari, stampa VERO.\nIl numero è 6.",
    correct:0 },

  { id:"lab09", format:"debug_find", type:"coding", ageMin:5, ageMax:6,
    emoji:"🥤", prompt:"Qual è l'istruzione SBAGLIATA nella ricetta del succo?",
    items:["1. Prendi le arance 🍊","2. Spremi le arance 🍊","3. Aggiungi sale 🧂","4. Versa nel bicchiere 🥛"],
    correct:2 },

  { id:"lab10", format:"code_sequence", type:"coding", ageMin:5, ageMax:6,
    emoji:"🧱", prompt:"Ordina per costruire una casa con i mattoncini:",
    items:["🏠 Metti il tetto","🧱 Metti le pareti","🚪 Aggiungi la porta","🪨 Posa le fondamenta"],
    correctOrder:[3,1,2,0] },

  { id:"lab11", format:"if_else_tap", type:"coding", ageMin:5, ageMax:6,
    emoji:"🍓", condition:"Questa frutta è rossa?",
    prompt:"SE la frutta è rossa, è una fragola.\nQuesta frutta è gialla! 🍌",
    correct:1 },

  { id:"lab12", format:"debug_find", type:"coding", ageMin:5, ageMax:6,
    emoji:"🦷", prompt:"Qual è l'istruzione SBAGLIATA per lavarsi i denti?",
    items:["1. Prendi lo spazzolino 🪥","2. Metti il dentifricio 🪥","3. Strofina i capelli 💇","4. Sciacqua la bocca 💧"],
    correct:2 },

  { id:"lab13", format:"code_sequence", type:"coding", ageMin:5, ageMax:6,
    emoji:"📱", prompt:"Aiuta il robot a mandare un messaggio:",
    items:["📤 Invia il messaggio","✍️ Scrivi il testo","📱 Apri l'app","👤 Scegli il destinatario"],
    correctOrder:[2,3,1,0] },

  { id:"lab14", format:"if_else_tap", type:"coding", ageMin:5, ageMax:6,
    emoji:"🚦", condition:"Il semaforo è verde?",
    prompt:"SE il semaforo è verde, vai avanti.\nIl semaforo è rosso! 🔴",
    correct:1 },

  { id:"lab15", format:"debug_find", type:"coding", ageMin:5, ageMax:6, isBoss:true,
    emoji:"🎒", prompt:"BOSS! 👾 Pixel ha un bug!\nQual è il comando SBAGLIATO per andare a scuola?",
    items:["1. Svegliati 🌅","2. Fai colazione 🥣","3. Vai a letto 🛏️","4. Prendi lo zaino 🎒"],
    correct:2 },

  // ── 6-7 anni: confronti numerici, debug, loop count ─────────────────────────
  { id:"lab16", format:"if_else_tap", type:"coding", ageMin:6, ageMax:7,
    emoji:"💡", condition:"15 è maggiore di 10?",
    prompt:"SE 15 è maggiore di 10, il robot accende la luce.\n15 > 10?",
    correct:0 },

  { id:"lab17", format:"debug_find", type:"coding", ageMin:6, ageMax:7,
    emoji:"🤖", prompt:"In quale riga c'è il BUG?\nIl robot deve contare da 1 a 5:",
    items:["1. Parti da 1 🔢","2. Conta: 1, 2, 3, 4... 📊","3. Salta a 7 📈","4. Fermati a 5 🛑"],
    correct:2 },

  { id:"lab18", format:"code_sequence", type:"coding", ageMin:6, ageMax:7,
    emoji:"🔄", prompt:"Ordina le istruzioni del loop:\n'Ripeti 3 volte: saluta!'",
    items:["🔁 Ripeti 3 volte","👋 Dì 'Ciao!'","✅ Dopo 3 volte, fermati"],
    correctOrder:[0,1,2] },

  { id:"lab19", format:"if_else_tap", type:"coding", ageMin:6, ageMax:7,
    emoji:"🏆", condition:"85 >= 100?",
    prompt:"SE il punteggio >= 100, hai vinto!\nIl tuo punteggio è 85.",
    correct:1 },

  { id:"lab20", format:"debug_find", type:"coding", ageMin:6, ageMax:7,
    emoji:"🚦", prompt:"Trova il BUG nel programma del semaforo:",
    items:["1. Mostra VERDE per 30s ✅","2. Mostra GIALLO per 3s ⚠️","3. Mostra VERDE ancora 🟢","4. Mostra ROSSO per 30s 🛑"],
    correct:2 },

  { id:"lab21", format:"code_sequence", type:"coding", ageMin:6, ageMax:7, isBoss:true,
    emoji:"🤖", prompt:"BOSS! 👾 Ordina il programma del robot cameriere:",
    items:["🍽️ Porta il piatto al tavolo","📋 Prendi l'ordine","👋 Saluta il cliente","🍳 Porta in cucina"],
    correctOrder:[2,1,3,0] },

  // ── 7-8 anni: variabili, loop, bug avanzato ──────────────────────────────────
  { id:"lab22", format:"if_else_tap", type:"coding", ageMin:7, ageMax:8,
    emoji:"🔢", condition:"8 è un numero pari?",
    prompt:"SE il resto di 8 ÷ 2 è zero, 8 è pari.\n8 ÷ 2 = 4, resto 0.",
    correct:0 },

  { id:"lab23", format:"debug_find", type:"coding", ageMin:7, ageMax:8,
    emoji:"✖️", prompt:"C'è un bug nella tabellina del 3.\nTrova l'errore!",
    items:["3 × 1 = 3 ✅","3 × 2 = 6 ✅","3 × 3 = 10 ❌","3 × 4 = 12 ✅"],
    correct:2 },

  { id:"lab24", format:"code_sequence", type:"coding", ageMin:7, ageMax:8,
    emoji:"⬜", prompt:"Ordina il programma per disegnare un quadrato:",
    items:["↑ Vai avanti 10 passi","↰ Gira a sinistra 90°","↑ Ancora avanti 10","↰ Ancora sinistra 90°"],
    correctOrder:[0,1,2,3] },

  { id:"lab25", format:"if_else_tap", type:"coding", ageMin:7, ageMax:8,
    emoji:"🌡️", condition:"Il robot ha la febbre?",
    prompt:"Il robot ha una variabile: temperatura = 38°\nSE temperatura > 37°, il robot ha la febbre!",
    correct:0 },

  { id:"lab26", format:"debug_find", type:"coding", ageMin:7, ageMax:8,
    emoji:"🚗", prompt:"Trova il BUG nel programma dell'auto:",
    items:["1. Avvia motore 🔑","2. Premi freno prima di partire 🛑","3. Inserisci marcia ⚙️","4. Accelera 🚀"],
    correct:1 },

  { id:"lab27", format:"code_sequence", type:"coding", ageMin:7, ageMax:8,
    emoji:"🔐", prompt:"Programma la password del robot:",
    items:["✅ Accesso concesso!","🔑 Inserisci password","🤔 Confronta con quella salvata","👁️ Controlla le cifre"],
    correctOrder:[1,3,2,0] },

  { id:"lab28", format:"if_else_tap", type:"coding", ageMin:7, ageMax:8,
    emoji:"🔋", condition:"Il robot si ricarica?",
    prompt:"Il programma dice:\nSE batteria < 20% → ricarica\nLa batteria è al 15%.",
    correct:0 },

  { id:"lab29", format:"debug_find", type:"coding", ageMin:7, ageMax:8,
    emoji:"⭕", prompt:"Trova il BUG nel loop:\n'Disegna 4 cerchi rossi'",
    items:["1. Inizia il loop (4 volte) 🔄","2. Disegna cerchio ⭕","3. Colora di VERDE 🟢","4. Ripeti finché non sono 4 ✅"],
    correct:2 },

  { id:"lab30", format:"code_sequence", type:"coding", ageMin:7, ageMax:8, isBoss:true,
    emoji:"🚗", prompt:"BOSS! 👾 Programma l'auto autonoma!\nOrdina le istruzioni:",
    items:["🔴 Fermati se c'è ostacolo","📡 Scansiona la strada","🚗 Vai avanti","🔄 Calcola il percorso"],
    correctOrder:[1,3,2,0] },
];

// ── VULCANO SET B (pool expansion) ────────────────────────────────────────────
ALL_CHALLENGES.vulcano = ALL_CHALLENGES.vulcano.concat([
  // 3-4 anni
  { id:"vb01", format:"visual_tap", type:"conteggio", ageMin:3, ageMax:4,
    visual:"🌋🌋🌋🌋🌋", prompt:"Quanti vulcani?", emoji:"🔥",
    options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },
  { id:"vb02", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"🔥💧🌿❄️", prompt:"Quale è il più caldo?", emoji:"🌡️",
    options:["🔥","💧","🌿","❄️"], correct:0 },
  { id:"vb03", format:"visual_tap", type:"empatia", ageMin:3, ageMax:4,
    visual:"🦊😲", prompt:"La volpe è sorpresa!\nCome si sente?", emoji:"🦊",
    options:["😲","😊","😢","😠"], correct:0 },
  { id:"vb04", format:"visual_tap", type:"pattern", ageMin:3, ageMax:4,
    visual:"🌋💥🌋💥", prompt:"Cosa viene dopo?\n🌋💥🌋💥__", emoji:"💥",
    options:["🌋","💥","🔥","🪨"], correct:0 },
  { id:"vb05", format:"visual_tap", type:"logica", ageMin:3, ageMax:4,
    visual:"🌋🗻🏔️🏕️", prompt:"Quale è il vulcano?", emoji:"🌋",
    options:["🌋","🗻","🏔️","🏕️"], correct:0 },
  { id:"vb06", format:"visual_tap", type:"logica", ageMin:3, ageMax:4, isBoss:true,
    visual:"🦅💥🦅💥🦅", prompt:"🐦 La Fenice chiede:\ncosa viene dopo? 🦅💥🦅💥🦅__", emoji:"🐦",
    options:["💥","🦅","🔥","🌋"], correct:0 },
  // 5-6 anni
  { id:"vb07", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6,
    prompt:"Il vulcano erutta 3 volte al mattino\ne 2 volte al pomeriggio.\nQuante eruzioni in tutto?",
    emoji:"🌋", options:["3","4","5","6"], correct:2 },
  { id:"vb08", format:"multiple_choice", type:"logica", ageMin:5, ageMax:6,
    prompt:"Quale di questi NON è prodotto dal vulcano?\n🌋 Lava  🪨 Roccia  ❄️ Ghiaccio  💨 Gas",
    emoji:"🤔", options:["Lava 🌋","Roccia 🪨","Ghiaccio ❄️","Gas 💨"], correct:2 },
  { id:"vb09", format:"sequence_tap", type:"logica", ageMin:5, ageMax:6,
    prompt:"Dal più leggero al più pesante. Tocca nell'ordine!",
    emoji:"⚖️",
    items:["🪶 Cenere","🌊 Lava","🪨 Roccia","🏔️ Montagna"],
    correctOrder:[0,1,2,3] },
  { id:"vb10", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:6,
    prompt:"La fenice è un uccello magico che risorge dalle ___.",
    emoji:"🐦", options:["Fiamme 🔥","Nuvole ☁️","Onde 🌊","Stelle ⭐"], correct:0 },
  { id:"vb11", format:"story_choice", type:"empatia", ageMin:5, ageMax:6,
    emoji:"🌋",
    situation:"Vicino al vulcano trovi un piccolo uccellino caduto dal nido. Le fiamme si avvicinano. Cosa fai?",
    choices:[
      { text:"🤲 Lo prendo e lo metto in salvo", outcome:"L'uccellino è salvo! Ti guarda con occhi grandi e poi vola via. Sei un eroe!", correct:true },
      { text:"🏃 Scappo da solo, è troppo pericoloso", outcome:"L'uccellino è rimasto solo... il coraggio vero è pensare anche agli altri.", correct:false },
    ] },
  { id:"vb12", format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, isBoss:true,
    prompt:"🌋 La Fenice chiede:\nIl vulcano ha 4 crateri.\nOgni cratere erutta 3 volte.\nQuante eruzioni in tutto?",
    emoji:"🐦", options:["9","10","12","15"], correct:2 },
]);

// ── DRAG-DROP: aggiunto ai 5 mondi principali ─────────────────────────────────
[
  { id:"f_dd1",  world:"foresta",  ageMin:3, ageMax:5,
    prompt:"Abbina ogni animale al posto dove vive!", emoji:"🌲",
    items:["🐟","🦅","🐺"], zones:["💧 Acqua","☁️ Cielo","🌲 Bosco"],
    correctMapping:[0,1,2] },
  { id:"c_dd1",  world:"castello", ageMin:4, ageMax:6,
    prompt:"Abbina ogni oggetto al suo posto!", emoji:"🏰",
    items:["🗡️","🎺","🍞"], zones:["⚔️ Battaglia","🎵 Musica","🍽️ Cucina"],
    correctMapping:[0,1,2] },
  { id:"o_dd1",  world:"oceano",   ageMin:3, ageMax:5,
    prompt:"Dove nuota ognuno nel mare?", emoji:"🌊",
    items:["🐬","🦞","🦑"], zones:["🌊 Superficie","🪸 Fondale","🌑 Profondità"],
    correctMapping:[0,1,2] },
  { id:"m_dd1",  world:"mercato",  ageMin:3, ageMax:5,
    prompt:"Separa i cibi per colore!", emoji:"🎨",
    items:["🍎","🍋","🥦"], zones:["🔴 Rosso","🟡 Giallo","🟢 Verde"],
    correctMapping:[0,1,2] },
  { id:"g_dd1",  world:"galassia", ageMin:4, ageMax:6,
    prompt:"Abbina al tipo giusto!", emoji:"🌌",
    items:["🚀","🪐","⭐"], zones:["🛸 Veicolo","🌍 Pianeta","✨ Stella"],
    correctMapping:[0,1,2] },
].forEach(({ id, world, ageMin, ageMax, prompt, emoji, items, zones, correctMapping }) => {
  ALL_CHALLENGES[world].push({ id, format:"drag_drop", type:"logica", ageMin, ageMax, emoji, prompt, items, zones, correctMapping });
});

// ── MEMORY MATCH ─────────────────────────────────────────────────────────────
[
  // Foresta
  { id:"f_mm1", world:"foresta", ageMin:3, ageMax:5, prompt:"Tocca due carte uguali per fare una coppia!",
    pairs:[{a:"🌲",b:"🌲"},{a:"🦊",b:"🦊"},{a:"🍄",b:"🍄"},{a:"🐇",b:"🐇"}] },
  { id:"f_mm2", world:"foresta", ageMin:5, ageMax:7, prompt:"Abbina ogni animale al cibo che mangia!",
    pairs:[{a:"🐇",b:"🥕"},{a:"🐝",b:"🍯"},{a:"🐦",b:"🌱"},{a:"🦊",b:"🐟"},{a:"🐛",b:"🍃"},{a:"🐺",b:"🦴"}] },
  { id:"f_mm3", world:"foresta", ageMin:5, ageMax:7, prompt:"Abbina ogni animale al suo nome!",
    pairs:[{a:"🌲",b:"Albero"},{a:"🍄",b:"Fungo"},{a:"🐇",b:"Coniglio"},{a:"🌿",b:"Foglia"},{a:"🦋",b:"Farfalla"},{a:"🐝",b:"Ape"}] },
  // Oceano
  { id:"o_mm1", world:"oceano", ageMin:3, ageMax:5, prompt:"Trova le coppie del mare!",
    pairs:[{a:"🐬",b:"🐬"},{a:"🐙",b:"🐙"},{a:"🦞",b:"🦞"},{a:"🐠",b:"🐠"}] },
  { id:"o_mm2", world:"oceano", ageMin:5, ageMax:7, prompt:"Abbina animale all'habitat!",
    pairs:[{a:"🐬",b:"🌊"},{a:"🦀",b:"🪸"},{a:"🐙",b:"🌑"},{a:"🦈",b:"🔵"},{a:"🐠",b:"🌿"},{a:"🐚",b:"🏖️"}] },
  { id:"o_mm3", world:"oceano", ageMin:5, ageMax:7, prompt:"Abbina ogni animale marino al suo nome!",
    pairs:[{a:"🐬",b:"Delfino"},{a:"🦑",b:"Calamaro"},{a:"🦞",b:"Aragosta"},{a:"🐠",b:"Pesce"},{a:"🐙",b:"Polpo"},{a:"🦈",b:"Squalo"}] },
  // Mercato
  { id:"m_mm1", world:"mercato", ageMin:3, ageMax:5, prompt:"Trova le coppie di frutta!",
    pairs:[{a:"🍎",b:"🍎"},{a:"🍋",b:"🍋"},{a:"🍇",b:"🍇"},{a:"🍓",b:"🍓"}] },
  { id:"m_mm2", world:"mercato", ageMin:5, ageMax:7, prompt:"Abbina frutto al colore!",
    pairs:[{a:"🍎",b:"🔴"},{a:"🍋",b:"🟡"},{a:"🫐",b:"🔵"},{a:"🥝",b:"🟢"},{a:"🍊",b:"🟠"},{a:"🍇",b:"🟣"}] },
  { id:"m_mm3", world:"mercato", ageMin:5, ageMax:7, prompt:"Abbina ogni frutto al suo nome!",
    pairs:[{a:"🍎",b:"Mela"},{a:"🍋",b:"Limone"},{a:"🍇",b:"Uva"},{a:"🍓",b:"Fragola"},{a:"🍊",b:"Arancia"},{a:"🍌",b:"Banana"}] },
].forEach(({ id, world, ageMin, ageMax, prompt, pairs }) => {
  ALL_CHALLENGES[world].push({ id, format:"memory_match", type:"logica", ageMin, ageMax, emoji:"🃏", prompt, pairs });
});

// ── RHYME-COMPLETE: aggiunto a 5 mondi ───────────────────────────────────────
[
  { id:"c_rh1", world:"castello", ageMin:3, ageMax:5,
    prompt:"Il re porta la corona d'oro,\nè il tesoro del suo ___",
    options:["coro","drago","bosco","mare"], correct:0 },
  { id:"c_rh2", world:"castello", ageMin:5, ageMax:7,
    prompt:"Il cavaliere parte all'alba chiara,\nla sua spada brilla, è cosa ___",
    options:["rara","triste","pesante","vecchia"], correct:0 },
  { id:"o_rh1", world:"oceano", ageMin:3, ageMax:5,
    prompt:"Il delfino nuota nel mare puro,\nil suo salto è bellissimo e ___",
    options:["sicuro","brutto","piccolo","triste"], correct:0 },
  { id:"o_rh2", world:"oceano", ageMin:5, ageMax:7,
    prompt:"Sotto il mare c'è un mondo fatato,\npieno di colori mai visto e ___",
    options:["sognato","brutto","vecchio","piccolo"], correct:0 },
  { id:"m_rh1", world:"mercato", ageMin:3, ageMax:5,
    prompt:"La frutta al mercato è colorata,\nla mela rossa è bella e ___",
    options:["profumata","brutta","piccola","pesante"], correct:0 },
  { id:"m_rh2", world:"mercato", ageMin:5, ageMax:7,
    prompt:"Il venditore grida a gran voce forte,\nchiama i clienti ad ogni ___",
    options:["sorte","casa","piazza","bosco"], correct:0 },
  { id:"g_rh1", world:"galassia", ageMin:4, ageMax:6,
    prompt:"Il razzo parte per il cielo immenso,\nlo spazio è misterioso e ___",
    options:["denso","piccolo","bello","caldo"], correct:0 },
  { id:"g_rh2", world:"galassia", ageMin:6, ageMax:8,
    prompt:"L'astronauta guarda la Terra piccina,\nda lassù sembra una stella ___",
    options:["bambina","rossa","grande","lontana"], correct:0 },
  { id:"v_rh1", world:"vulcano", ageMin:4, ageMax:6,
    prompt:"Il vulcano fa un gran rumore,\nla lava scorre col suo ___",
    options:["furore","silenzio","gelo","vento"], correct:0 },
  { id:"v_rh2", world:"vulcano", ageMin:6, ageMax:8,
    prompt:"La fenice risorge dal fuoco ardente,\nle sue ali sono meravigliose e ___",
    options:["splendenti","tristi","piccole","deboli"], correct:0 },
].forEach(({ id, world, ageMin, ageMax, prompt, options, correct }) => {
  ALL_CHALLENGES[world].push({ id, format:"rhyme_complete", type:"parole", ageMin, ageMax, emoji:"📜", prompt, options, correct });
});

// ── WORD-PICTURE: Vulcano e Biblioteca ───────────────────────────────────────
[
  { id:"wp09", world:"vulcano",    word:"FUOCO",   options:["🔥","💧","🌿","⭐"] },
  { id:"wp10", world:"vulcano",    word:"ROCCIA",  options:["🪨","💧","🌺","🎈"] },
  { id:"wp11", world:"biblioteca", word:"LIBRO",   options:["📚","🎸","⚽","🎨"] },
  { id:"wp12", world:"biblioteca", word:"MATITA",  options:["✏️","📚","🎵","🏆"] },
].forEach(({ id, world, word, options }) => {
  ALL_CHALLENGES[world].push({ id, format:"word_picture", type:"parole", ageMin:5, ageMax:8, emoji:"📖", word, options, correct:0 });
});

// ── QUIZ_CARTOON: Indovina l'emoji oscurata ───────────────────────────────────
[
  // Foresta — animali
  { id:"qc01", world:"foresta", ageMin:3, ageMax:5, cartoonEmoji:"🦁", question:"Sono il re della savana, chi sono?",
    options:["Leone","Tigre","Orso","Lupo"], correct:0 },
  { id:"qc02", world:"foresta", ageMin:3, ageMax:5, cartoonEmoji:"🐻", question:"Sono grande, peloso e vado in letargo, chi sono?",
    options:["Orso","Leone","Lupo","Cervo"], correct:0 },
  { id:"qc03", world:"foresta", ageMin:4, ageMax:6, cartoonEmoji:"🦊", question:"Ho la coda rossa e sono molto furbo, chi sono?",
    options:["Volpe","Scoiattolo","Lupo","Gatto"], correct:0 },
  { id:"qc04", world:"foresta", ageMin:5, ageMax:7, cartoonEmoji:"🦌", question:"Ho le corna ramificate e salto tra gli alberi, chi sono?",
    options:["Cervo","Alce","Capra","Cavallo"], correct:0 },
  // Oceano — animali marini
  { id:"qc05", world:"oceano", ageMin:3, ageMax:5, cartoonEmoji:"🐬", question:"Salto fuori dall'acqua e faccio 'eee eee', chi sono?",
    options:["Delfino","Balena","Squalo","Polpo"], correct:0 },
  { id:"qc06", world:"oceano", ageMin:4, ageMax:6, cartoonEmoji:"🐙", question:"Ho otto braccia e cambio colore, chi sono?",
    options:["Polpo","Medusa","Granchio","Calamaro"], correct:0 },
  { id:"qc07", world:"oceano", ageMin:5, ageMax:7, cartoonEmoji:"🦈", question:"Sono il pesce più temuto dell'oceano, chi sono?",
    options:["Squalo","Orca","Barracuda","Murena"], correct:0 },
  // Foresta — natura extra
  { id:"qc08", world:"foresta", ageMin:3, ageMax:5, cartoonEmoji:"🍓", question:"Sono rossa, piccola e molto dolce, cosa sono?",
    options:["Fragola","Ciliegia","Mela","Pomodoro"], correct:0 },
  { id:"qc09", world:"foresta", ageMin:3, ageMax:5, cartoonEmoji:"🌻", question:"Giro sempre verso il sole, sono un fiore, cosa sono?",
    options:["Girasole","Rosa","Margherita","Tulipano"], correct:0 },
  { id:"qc10", world:"mercato", ageMin:4, ageMax:6, cartoonEmoji:"🦋", question:"Ho le ali colorate e bevo il nettare, chi sono?",
    options:["Farfalla","Libellula","Ape","Vespa"], correct:0 },
  // Mercato — cibi
  { id:"qc11", world:"mercato", ageMin:3, ageMax:5, cartoonEmoji:"🍕", question:"Sono un piatto italiano con pomodoro e mozzarella, cosa sono?",
    options:["Pizza","Lasagna","Risotto","Gnocchi"], correct:0 },
  { id:"qc12", world:"mercato", ageMin:4, ageMax:6, cartoonEmoji:"🍦", question:"Sono freddo, dolce e si lecca con la lingua, cosa sono?",
    options:["Gelato","Budino","Torta","Cioccolata"], correct:0 },
  // Galassia — spazio e scienza
  { id:"qc13", world:"galassia", ageMin:4, ageMax:6, cartoonEmoji:"✈️", question:"Volo in cielo e porto le persone lontano, cosa sono?",
    options:["Aereo","Elicottero","Aquilone","Razzo"], correct:0 },
  { id:"qc14", world:"galassia", ageMin:6, ageMax:8, cartoonEmoji:"🪐", question:"Quale pianeta ha gli anelli intorno?",
    options:["Saturno","Giove","Marte","Venere"], correct:0 },
  // Castello — fiabe e professioni
  { id:"qc15", world:"castello", ageMin:4, ageMax:6, cartoonEmoji:"👨‍🚒", question:"Spengo gli incendi e salvo le persone, chi sono?",
    options:["Pompiere","Poliziotto","Dottore","Cuoco"], correct:0 },
  { id:"qc16", world:"castello", ageMin:5, ageMax:7, cartoonEmoji:"👸", question:"Perde la scarpetta di cristallo a mezzanotte, chi è?",
    options:["Cenerentola","Biancaneve","Rapunzel","Bella"], correct:0 },
  // Biblioteca — strumenti e conoscenza
  { id:"qc17", world:"biblioteca", ageMin:5, ageMax:7, cartoonEmoji:"🎸", question:"Ho le corde e si suona pizzicandole, cosa sono?",
    options:["Chitarra","Violino","Piano","Arpa"], correct:0 },
  { id:"qc18", world:"biblioteca", ageMin:6, ageMax:8, cartoonEmoji:"🔭", question:"Si usa per guardare le stelle lontane, cos'è?",
    options:["Telescopio","Microscopio","Binocolo","Lente"], correct:0 },
  // Vulcano — natura potente
  { id:"qc19", world:"vulcano", ageMin:4, ageMax:6, cartoonEmoji:"🌋", question:"Erutto lava e fumo, cosa sono?",
    options:["Vulcano","Montagna","Collina","Geyser"], correct:0 },
  // Laboratorio — scienza e logica
  { id:"qc20", world:"laboratorio", ageMin:6, ageMax:8, cartoonEmoji:"🌡️", question:"Si usa per misurare la temperatura, cos'è?",
    options:["Termometro","Righello","Bilancia","Orologio"], correct:0 },
].forEach(({ id, world, ageMin, ageMax, cartoonEmoji, question, options, correct }) => {
  ALL_CHALLENGES[world].push({ id, format:"quiz_cartoon", type:"logica", ageMin, ageMax, emoji:"🔍", question, cartoonEmoji, options, correct });
});

// ── COLOR_ZONES CHALLENGES ────────────────────────────────────────────────────
// zones: [{id, x, y, size, label, targetColor}] — SVG circles laid on a 280×140 canvas
// colors: palette hex values shown as swatches
// colorNames: short labels on swatches (max 3 chars)
[
  // cz01 — Arcobaleno (foresta, 3-5)
  { id:"cz01", world:"foresta", ageMin:3, ageMax:5,
    question:"Colora l'arcobaleno! Rosso, giallo, blu",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"🔴", targetColor:"#EF4444" },
      { id:"z2", x:110, y:20, size:60, label:"🟡", targetColor:"#EAB308" },
      { id:"z3", x:200, y:20, size:60, label:"🔵", targetColor:"#3B82F6" },
    ],
    colors:["#EF4444","#EAB308","#3B82F6","#22C55E"],
    colorNames:["Ros","Gia","Blu","Ver"],
  },
  // cz02 — Semaforo (mercato, 3-5)
  { id:"cz02", world:"mercato", ageMin:3, ageMax:5,
    question:"Colora il semaforo! In alto rosso, in mezzo giallo, in basso verde",
    gridWidth:280, gridHeight:140,
    zones:[
      { id:"z1", x:100, y:10,  size:60, label:"🔴", targetColor:"#EF4444" },
      { id:"z2", x:100, y:80,  size:60, label:"🟡", targetColor:"#EAB308" },
      { id:"z3", x:100, y:150, size:60, label:"🟢", targetColor:"#22C55E" },
    ],
    colors:["#EF4444","#EAB308","#22C55E","#3B82F6"],
    colorNames:["Ros","Gia","Ver","Blu"],
  },
  // cz03 — Il Sole e il Mare (oceano, 3-5)
  { id:"cz03", world:"oceano", ageMin:3, ageMax:5,
    question:"Il sole è giallo, il mare è blu!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"☀️", targetColor:"#EAB308" },
      { id:"z2", x:110, y:20, size:60, label:"🌊", targetColor:"#3B82F6" },
      { id:"z3", x:200, y:20, size:60, label:"🏖️", targetColor:"#F59E0B" },
    ],
    colors:["#EAB308","#3B82F6","#F59E0B","#EF4444"],
    colorNames:["Gia","Blu","Sab","Ros"],
  },
  // cz04 — Bandiera italiana (castello, 4-6)
  { id:"cz04", world:"castello", ageMin:4, ageMax:6,
    question:"Colora la bandiera italiana: verde, bianco, rosso!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"🟢", targetColor:"#22C55E" },
      { id:"z2", x:110, y:20, size:60, label:"⬜", targetColor:"#F8FAFC" },
      { id:"z3", x:200, y:20, size:60, label:"🔴", targetColor:"#EF4444" },
    ],
    colors:["#22C55E","#F8FAFC","#EF4444","#3B82F6"],
    colorNames:["Ver","Bia","Ros","Blu"],
  },
  // cz05 — Pianeti (galassia, 4-6)
  { id:"cz05", world:"galassia", ageMin:4, ageMax:6,
    question:"Marte è rosso, la Terra è blu-verde, Saturno è giallo!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"♂️", targetColor:"#EF4444" },
      { id:"z2", x:110, y:20, size:60, label:"🌍", targetColor:"#3B82F6" },
      { id:"z3", x:200, y:20, size:60, label:"🪐", targetColor:"#EAB308" },
    ],
    colors:["#EF4444","#3B82F6","#EAB308","#A855F7"],
    colorNames:["Ros","Blu","Gia","Vio"],
  },
  // cz06 — Vulcano (vulcano, 4-6)
  { id:"cz06", world:"vulcano", ageMin:4, ageMax:6,
    question:"La lava è rossa, il fumo è grigio, il cielo è arancione!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"🌋", targetColor:"#EF4444" },
      { id:"z2", x:110, y:20, size:60, label:"💨", targetColor:"#6B7280" },
      { id:"z3", x:200, y:20, size:60, label:"🌅", targetColor:"#F97316" },
    ],
    colors:["#EF4444","#6B7280","#F97316","#EAB308"],
    colorNames:["Ros","Gri","Ara","Gia"],
  },
  // cz07 — Biblioteca stagioni (biblioteca, 5-7)
  { id:"cz07", world:"biblioteca", ageMin:5, ageMax:7,
    question:"Primavera rosa, estate gialla, autunno arancione, inverno blu!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:10,  y:20, size:50, label:"🌸", targetColor:"#EC4899" },
      { id:"z2", x:80,  y:20, size:50, label:"☀️", targetColor:"#EAB308" },
      { id:"z3", x:150, y:20, size:50, label:"🍂", targetColor:"#F97316" },
      { id:"z4", x:220, y:20, size:50, label:"❄️", targetColor:"#3B82F6" },
    ],
    colors:["#EC4899","#EAB308","#F97316","#3B82F6"],
    colorNames:["Ros","Gia","Ara","Blu"],
  },
  // cz08 — Laboratorio (laboratorio, 5-7)
  { id:"cz08", world:"laboratorio", ageMin:5, ageMax:7,
    question:"Il laser è rosso, l'energia è verde, il plasma è blu!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"⚡", targetColor:"#EF4444" },
      { id:"z2", x:110, y:20, size:60, label:"🔋", targetColor:"#22C55E" },
      { id:"z3", x:200, y:20, size:60, label:"🔬", targetColor:"#3B82F6" },
    ],
    colors:["#EF4444","#22C55E","#3B82F6","#A855F7"],
    colorNames:["Ros","Ver","Blu","Vio"],
  },
  // cz09 — Emozioni (foresta, 5-7)
  { id:"cz09", world:"foresta", ageMin:5, ageMax:7,
    question:"Felicità è gialla, tristezza è blu, arrabbiatura è rossa!",
    gridWidth:280, gridHeight:100,
    zones:[
      { id:"z1", x:20,  y:20, size:60, label:"😊", targetColor:"#EAB308" },
      { id:"z2", x:110, y:20, size:60, label:"😢", targetColor:"#3B82F6" },
      { id:"z3", x:200, y:20, size:60, label:"😡", targetColor:"#EF4444" },
    ],
    colors:["#EAB308","#3B82F6","#EF4444","#22C55E"],
    colorNames:["Gia","Blu","Ros","Ver"],
  },
].forEach(({ id, world, ageMin, ageMax, question, zones, colors, colorNames, gridWidth, gridHeight }) => {
  ALL_CHALLENGES[world].push({ id, format:"color_zones", type:"creativita", ageMin, ageMax, emoji:"🎨",
    question, zones, colors, colorNames, gridWidth, gridHeight });
});

// ── PUZZLE_SWAP CHALLENGES ────────────────────────────────────────────────────
// emojis: array of tiles (without the hole). size:2 → 2×2 (3 tiles + 1 hole); size:3 → 3×3 (8 tiles + 1 hole)
[
  // ps01 — Animali foresta 2x2 (3-4)
  { id:"ps01", world:"foresta", ageMin:3, ageMax:4, size:2,
    question:"Rimetti in ordine gli animali della foresta!",
    emojis:["🐻","🦊","🌲"] },
  // ps02 — Frutti oceano 2x2 (3-4)
  { id:"ps02", world:"oceano", ageMin:3, ageMax:4, size:2,
    question:"Riordina gli animali del mare!",
    emojis:["🐬","🐙","🦈"] },
  // ps03 — Cibi mercato 2x2 (3-4)
  { id:"ps03", world:"mercato", ageMin:3, ageMax:4, size:2,
    question:"Rimetti in ordine il mercato!",
    emojis:["🍎","🍋","🥦"] },
  // ps04 — Castello 2x2 (4-5)
  { id:"ps04", world:"castello", ageMin:4, ageMax:5, size:2,
    question:"Riordina gli oggetti del castello!",
    emojis:["👑","🗡️","🏰"] },
  // ps05 — Galassia 2x2 (4-5)
  { id:"ps05", world:"galassia", ageMin:4, ageMax:5, size:2,
    question:"Riordina i pianeti!",
    emojis:["🚀","🪐","⭐"] },
  // ps06 — Vulcano 3x3 (5-6)
  { id:"ps06", world:"vulcano", ageMin:5, ageMax:6, size:3,
    question:"Rimetti in ordine il vulcano! 8 pezzi da sistemare.",
    emojis:["🌋","🔥","💨","🪨","🌡️","🦎","🏜️","⛏️"] },
  // ps07 — Biblioteca 3x3 (5-7)
  { id:"ps07", world:"biblioteca", ageMin:5, ageMax:7, size:3,
    question:"Riordina la biblioteca! 8 oggetti al posto giusto.",
    emojis:["📚","🔭","🎸","📝","🔬","🖊️","📖","🎹"] },
  // ps08 — Laboratorio 3x3 (6-8)
  { id:"ps08", world:"laboratorio", ageMin:6, ageMax:8, size:3,
    question:"Rimetti in ordine il laboratorio di Pixel!",
    emojis:["🤖","🔋","💡","🧪","⚙️","🔧","🖥️","📡"] },
  // ps09 — Foresta 3x3 (6-8)
  { id:"ps09", world:"foresta", ageMin:6, ageMax:8, size:3,
    question:"La foresta è in disordine — sistema tutti gli elementi!",
    emojis:["🌲","🍄","🦋","🐝","🌸","🍓","🌿","🐿️"] },
].forEach(({ id, world, ageMin, ageMax, size, question, emojis }) => {
  ALL_CHALLENGES[world].push({ id, format:"puzzle_swap", type:"logica", ageMin, ageMax, emoji:"🧩",
    question, emojis, size });
});

// ── ESPANSIONE ADATTIVA 2026-06 ──────────────────────────────────────────────
// Rinforzo fascia 7-8 (sotto-servita), skill creatività (color-mixing) ed empatia (SEL).
// Ogni oggetto porta il proprio `world`; viene rimosso prima del push per coerenza
// con la convenzione dei blocchi per-mondo (il mondo è implicito nella chiave array).
[
  // ===== FORESTA 🌲 =====
  { id:"e_for1", world:"foresta", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🦊",
    prompt:"Nel bosco ci sono 4 tane,\ne ogni tana ha 3 cuccioli di volpe.\nQuanti cuccioli in tutto?", options:["7","12","9","10"], correct:1 },
  { id:"e_for2", world:"foresta", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🌳",
    prompt:"Tutti gli alberi del bosco perdono\nle foglie in autunno.\nIl faggio è un albero del bosco.\nIn autunno il faggio...", options:["perde le foglie","fa i frutti","diventa blu","vola via"], correct:0 },
  { id:"e_for3", world:"foresta", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Qual è il contrario di 'GIORNO'?", options:["notte","sole","luce","mattino"], correct:0 },
  { id:"e_for4", world:"foresta", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per dipingere le foglie d'autunno\ndi color ARANCIONE,\nquali due colori mescoli?", options:["Rosso e giallo 🍂","Blu e blu","Bianco e nero","Verde e blu"], correct:0 },
  { id:"e_for5", world:"foresta", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"🦌",
    situation:"Un cerbiatto è rimasto indietro dal suo gruppo e trema di paura. Tu e i tuoi amici cosa fate?",
    choices:[
      { text:"🤝 Lo accompagniamo dolcemente fino al suo gruppo", outcome:"Il cerbiatto si sente al sicuro e vi ringrazia con un salto di gioia! La gentilezza scalda il cuore.", correct:true },
      { text:"🏃 Corriamo via senza badare a lui", outcome:"Il cerbiatto è rimasto solo e spaventato... un piccolo aiuto avrebbe fatto la differenza.", correct:false },
    ] },
  { id:"e_for6", world:"foresta", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🌰",
    prompt:"Hai raccolto 12 ghiande\ne ne dai la metà al tuo amico.\nQuante ghiande tieni per te?", options:["4","6","8","3"], correct:1 },

  // ===== CASTELLO 🏰 =====
  { id:"e_cas1", world:"castello", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🏰",
    prompt:"Il castello ha 5 torri\ne ogni torre ha 6 finestre.\nQuante finestre in tutto?", options:["11","30","25","36"], correct:1 },
  { id:"e_cas2", world:"castello", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"👑",
    prompt:"Il Re è più alto della Regina.\nLa Regina è più alta del Principe.\nChi è il PIÙ BASSO?", options:["Il Principe","Il Re","La Regina","Sono uguali"], correct:0 },
  { id:"e_cas3", world:"castello", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Quale parola significa 'CORAGGIOSO'?", options:["valoroso","pauroso","stanco","piccolo"], correct:0 },
  { id:"e_cas4", world:"castello", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per dipingere il mantello reale\ndi color VIOLA,\nquali due colori mescoli?", options:["Rosso e blu 👑","Giallo e verde","Bianco e nero","Verde e rosso"], correct:0 },
  { id:"e_cas5", world:"castello", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"🤝",
    situation:"Durante il torneo, il cavaliere avversario cade da cavallo davanti a tutti. Cosa fai?",
    choices:[
      { text:"🤝 Mi fermo e lo aiuto a rialzarsi", outcome:"Tutti applaudono il tuo gesto! Vincere con gentilezza è la vittoria più grande.", correct:true },
      { text:"😆 Rido di lui e continuo a correre", outcome:"Hai vinto la gara ma perso il rispetto di tutti. La gentilezza vale più di una coppa.", correct:false },
    ] },
  { id:"e_cas6", world:"castello", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🪑",
    prompt:"Nel salone ci sono 24 sedie\ndisposte in 4 file uguali.\nQuante sedie per fila?", options:["4","6","8","5"], correct:1 },

  // ===== OCEANO 🌊 =====
  { id:"e_oce1", world:"oceano", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"⭐",
    prompt:"Ci sono 5 stelle marine\ne ogni stella ha 5 braccia.\nQuante braccia in tutto?", options:["10","25","20","15"], correct:1 },
  { id:"e_oce2", world:"oceano", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🐬",
    prompt:"I pesci respirano con le branchie.\nIl delfino respira con i polmoni.\nQuindi il delfino...", options:["non è un pesce","è un pesce","vive sulla terra","non sa nuotare"], correct:0 },
  { id:"e_oce3", world:"oceano", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Quale parola fa RIMA con 'MARE'?", options:["andare","monte","pesce","blu"], correct:0 },
  { id:"e_oce4", world:"oceano", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per dipingere il mare al tramonto\ndi color ARANCIONE,\nquali due colori mescoli?", options:["Rosso e giallo 🌅","Blu e verde","Nero e blu","Bianco e blu"], correct:0 },
  { id:"e_oce5", world:"oceano", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"🐢",
    situation:"Trovi una tartaruga marina impigliata in un sacchetto di plastica sulla spiaggia. Cosa fai?",
    choices:[
      { text:"🤲 La libero con delicatezza e butto la plastica", outcome:"La tartaruga torna libera nel mare! Hai aiutato un animale e protetto l'oceano.", correct:true },
      { text:"📸 Le faccio una foto e me ne vado", outcome:"La tartaruga è rimasta in difficoltà... a volte basta poco per aiutare chi è in pericolo.", correct:false },
    ] },
  { id:"e_oce6", world:"oceano", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🫧",
    prompt:"Salgono 20 bolle d'aria,\nne scoppiano 8, poi ne arrivano 5.\nQuante bolle ci sono ora?", options:["12","17","15","20"], correct:1 },

  // ===== MERCATO 🧙 =====
  { id:"e_mer1", world:"mercato", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🧪",
    prompt:"Una pozione magica costa 8 monete.\nQuanto spendi per 3 pozioni?", options:["11","24","16","21"], correct:1 },
  { id:"e_mer2", world:"mercato", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🧙",
    prompt:"Al mercato la mela costa meno della pera.\nLa pera costa meno dell'uva.\nCosa costa DI PIÙ?", options:["L'uva","La mela","La pera","Costano uguale"], correct:0 },
  { id:"e_mer3", world:"mercato", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Quale parola significa 'COMPRARE'?", options:["acquistare","vendere","regalare","perdere"], correct:0 },
  { id:"e_mer4", world:"mercato", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per preparare una pozione\ndi color VERDE,\nquali due colori mescoli?", options:["Giallo e blu 🧪","Rosso e bianco","Nero e grigio","Rosso e giallo"], correct:0 },
  { id:"e_mer5", world:"mercato", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"👵",
    situation:"Al mercato una signora anziana fatica a portare la sua borsa pesante. Cosa fai?",
    choices:[
      { text:"💪 Le offro di aiutarla a portarla", outcome:"La signora ti sorride riconoscente! Aiutare chi ne ha bisogno rende felici tutti e due.", correct:true },
      { text:"🙈 Faccio finta di non vederla", outcome:"La signora ha faticato da sola... un piccolo gesto avrebbe reso migliore la sua giornata.", correct:false },
    ] },
  { id:"e_mer6", world:"mercato", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🎩",
    prompt:"Hai 20 monete e compri\nun cappello magico da 13 monete.\nQuante monete ti restano?", options:["5","7","6","8"], correct:1 },

  // ===== GALASSIA 🌌 =====
  { id:"e_gal1", world:"galassia", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🚀",
    prompt:"Partono 3 razzi\ne ogni razzo porta 4 astronauti.\nQuanti astronauti in tutto?", options:["7","12","9","16"], correct:1 },
  { id:"e_gal2", world:"galassia", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🪐",
    prompt:"La Terra è più grande della Luna.\nIl Sole è più grande della Terra.\nCosa è il PIÙ GRANDE di tutti?", options:["Il Sole","La Luna","La Terra","Sono uguali"], correct:0 },
  { id:"e_gal3", world:"galassia", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Come si chiama chi viaggia\nnello spazio?", options:["astronauta","marinaio","autista","giardiniere"], correct:0 },
  { id:"e_gal4", world:"galassia", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per dipingere un pianeta\ndi color VIOLA,\nquali due colori mescoli?", options:["Rosso e blu 🪐","Giallo e verde","Bianco e giallo","Verde e blu"], correct:0 },
  { id:"e_gal5", world:"galassia", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"👨‍🚀",
    situation:"Un compagno astronauta ha paura del buio dello spazio e non vuole uscire dalla navicella. Cosa fai?",
    choices:[
      { text:"🤝 Gli sto vicino e usciamo insieme tenendoci la mano", outcome:"Insieme la paura diventa più piccola! Il tuo amico trova il coraggio grazie a te.", correct:true },
      { text:"😤 Lo prendo in giro perché ha paura", outcome:"Il tuo amico si sente solo e ferito... la paura si vince con il sostegno, non con le risate.", correct:false },
    ] },
  { id:"e_gal6", world:"galassia", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"⭐",
    prompt:"Una stella brilla ogni 2 secondi.\nQuante volte brilla in 10 secondi?", options:["4","5","6","10"], correct:1 },

  // ===== VULCANO 🌋 =====
  { id:"e_vul1", world:"vulcano", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🌋",
    prompt:"Il vulcano erutta 6 volte ogni ora.\nQuante volte erutta in 3 ore?", options:["9","18","12","15"], correct:1 },
  { id:"e_vul2", world:"vulcano", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🔥",
    prompt:"La lava è molto calda.\nIl ghiaccio è freddo.\nSe la lava tocca il ghiaccio, il ghiaccio...", options:["si scioglie","diventa più freddo","resta uguale","vola via"], correct:0 },
  { id:"e_vul3", world:"vulcano", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Qual è il contrario di 'CALDO'?", options:["freddo","bollente","fuoco","rosso"], correct:0 },
  { id:"e_vul4", world:"vulcano", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Per dipingere la lava\ndi color ARANCIONE,\nquali due colori mescoli?", options:["Rosso e giallo 🔥","Blu e verde","Nero e grigio","Bianco e blu"], correct:0 },
  { id:"e_vul5", world:"vulcano", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"😨",
    situation:"Un amico si spaventa per il rumore forte del vulcano e inizia a piangere. Cosa fai?",
    choices:[
      { text:"💛 Lo abbraccio e gli spiego che siamo al sicuro", outcome:"Il tuo amico si calma e si sente protetto. Spiegare con calma aiuta a vincere la paura!", correct:true },
      { text:"😴 Lo lascio piangere e penso ai fatti miei", outcome:"Il tuo amico è rimasto solo con la sua paura... un abbraccio avrebbe cambiato tutto.", correct:false },
    ] },
  { id:"e_vul6", world:"vulcano", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🪨",
    prompt:"Ci sono 32 rocce vulcaniche\nda dividere in 4 gruppi uguali.\nQuante rocce per gruppo?", options:["6","8","7","9"], correct:1 },

  // ===== BIBLIOTECA 📖 =====
  { id:"e_bib1", world:"biblioteca", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"🐱",
    prompt:"Leggi: «Il gatto dorme sul tappeto.»\nDOVE dorme il gatto?", options:["Sul tappeto","Sul letto","Sulla sedia","Sul tavolo"], correct:0 },
  { id:"e_bib2", world:"biblioteca", format:"multiple_choice", type:"parole", ageMin:7, ageMax:8, emoji:"📖",
    prompt:"Quale parola significa 'FELICE'?", options:["contento","triste","stanco","arrabbiato"], correct:0 },
  { id:"e_bib3", world:"biblioteca", format:"multiple_choice", type:"logica", ageMin:7, ageMax:8, emoji:"🔤",
    prompt:"Quale lettera viene DOPO la M\nnell'alfabeto?", options:["N","L","O","P"], correct:0 },
  { id:"e_bib4", world:"biblioteca", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"📚",
    prompt:"Un libro ha 30 pagine.\nNe hai già lette 12.\nQuante pagine ti restano da leggere?", options:["18","22","12","20"], correct:0 },
  { id:"e_bib5", world:"biblioteca", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"✨",
    prompt:"Vuoi inventare una storia.\nQuale inizio è il PIÙ FANTASIOSO?", options:["C'era una volta un drago\nche amava cucinare torte 🐲","Un giorno qualcuno\nfece qualcosa","Questa è una storia","E poi finì"], correct:0 },
  { id:"e_bib6", world:"biblioteca", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"📕",
    situation:"In biblioteca un bambino non riesce a leggere una parola difficile e si vergogna. Cosa fai?",
    choices:[
      { text:"😊 Lo aiuto con gentilezza, senza prenderlo in giro", outcome:"Insieme leggete la parola! Il bambino sorride e impara una cosa nuova grazie a te.", correct:true },
      { text:"🤣 Rido perché non sa leggere", outcome:"Il bambino si sente umiliato e chiude il libro... tutti imparano a ritmi diversi.", correct:false },
    ] },

  // ===== LABORATORIO 🔬 (Pixel) — amplio numeri/creatività/empatia oltre al coding =====
  { id:"e_lab1", world:"laboratorio", format:"multiple_choice", type:"condizione", ageMin:6, ageMax:8, emoji:"🤖",
    prompt:"Il robot ha questa regola:\nSE piove ALLORA prendi l'ombrello.\nOggi piove. Cosa fa il robot?", options:["Prende l'ombrello ☂️","Va al mare","Non fa niente","Si spegne"], correct:0 },
  { id:"e_lab2", world:"laboratorio", format:"multiple_choice", type:"sequenza", ageMin:6, ageMax:8, emoji:"🍞",
    prompt:"Il robot deve fare il pane.\nQuale istruzione va per PRIMA?", options:["Impastare la farina","Tagliare il pane","Mangiare il pane","Servire il pane"], correct:0 },
  { id:"e_lab3", world:"laboratorio", format:"multiple_choice", type:"debug", ageMin:7, ageMax:8, emoji:"🐞",
    prompt:"Il robot deve andare a DESTRA\nma va sempre a SINISTRA.\nDov'è il bug?", options:["Nell'istruzione di direzione","Nelle ruote","Nel colore","Nell'antenna"], correct:0 },
  { id:"e_lab4", world:"laboratorio", format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:"🔁",
    prompt:"Un ciclo ripete 'salta' 3 volte,\npoi lo ripete altre 2 volte.\nQuanti salti fa in tutto il robot?", options:["4","5","6","3"], correct:1 },
  { id:"e_lab5", world:"laboratorio", format:"multiple_choice", type:"creativita", ageMin:5, ageMax:8, emoji:"🎨",
    prompt:"Il robot deve illuminare lo schermo\ndi color ARANCIONE.\nQuali due luci accende?", options:["Rossa e gialla 🟠","Blu e verde","Bianca e nera","Verde e rossa"], correct:0 },
  { id:"e_lab6", world:"laboratorio", format:"story_choice", type:"empatia", ageMin:6, ageMax:8, emoji:"🤖",
    situation:"Il robot Pixel ha fatto un errore nel suo codice e dice: «Mi dispiace, ho sbagliato.» Cosa gli rispondi?",
    choices:[
      { text:"💛 «Non importa Pixel, tutti sbagliano e si impara!»", outcome:"Pixel fa BEEP di gioia! Sbagliare fa parte dell'imparare, e un amico gentile lo ricorda.", correct:true },
      { text:"😠 «Sei un robot inutile e rotto!»", outcome:"Pixel abbassa l'antenna, triste... le parole gentili aiutano ad imparare meglio.", correct:false },
  ] },
].forEach(({ world, ...rest }) => { ALL_CHALLENGES[world].push(rest); });

const FAMILY_MISSIONS = [
  { id:1, emoji:"🍳", title:"Chef Magico",          desc:"Cucinare insieme! Conta ingredienti, misura le porzioni, segui una ricetta semplice.", skill:"numeri",     dur:"20 min" },
  { id:2, emoji:"🌱", title:"Giardino Segreto",      desc:"Pianta un seme. Disegna come cresce ogni giorno per una settimana!",                   skill:"logica",     dur:"Settimana" },
  { id:3, emoji:"🗺️", title:"Caccia al Tesoro",      desc:"Nascondi oggetti in casa e crea indizi scritti o disegnati insieme.",                   skill:"logica",     dur:"30 min" },
  { id:4, emoji:"📖", title:"Storia a Staffetta",    desc:"Inizia una storia, poi passa al bambino: ognuno aggiunge una frase!",                   skill:"parole",     dur:"15 min" },
  { id:5, emoji:"🎭", title:"Teatro delle Emozioni", desc:"Recitate situazioni diverse. Come ci si sente? Come si reagisce con gentilezza?",       skill:"empatia",    dur:"25 min" },
  { id:6, emoji:"🔢", title:"Spesa Matematica",      desc:"Al supermercato: conta prodotti, confronta quantità, trova l'offerta migliore!",        skill:"numeri",     dur:"20 min" },
  { id:7, emoji:"🌊", title:"Esplorazione Natura",   desc:"Vai al parco o in giardino. Raccogliete foglie, sassi, petali. Chi ne trova di più tipi?", skill:"logica",     dur:"30 min" },
  { id:8, emoji:"🎨", title:"Pittori per un Giorno", desc:"Dipingete insieme! Scegliete un tema: il mare, lo spazio, il bosco. Ogni quadro vale!",    skill:"creativita", dur:"40 min" },
  { id:9, emoji:"🚀", title:"Astronomi Junior",       desc:"Di notte guardate il cielo. Trovate la luna, una stella. Inventate una costellazione!",    skill:"logica",     dur:"20 min" },
  { id:10, emoji:"🤖", title:"Robot di Casa",         desc:"Dai istruzioni precise come un robot! Es: 'Vai avanti 3 passi, gira a destra, prendi la tazza'. Chi le esegue meglio?", skill:"coding", dur:"15 min" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getSkill(type) {
  for (const [sk, types] of Object.entries(SKILL_MAP)) {
    if (types.includes(type)) return sk;
  }
  return "logica";
}
const SKILL_TIPS = {
  logica:     ["💡 Guarda bene il pattern — si ripete sempre nello stesso modo!", "💡 Pensa a cosa viene prima e cosa viene dopo.", "💡 Chiudi gli occhi e immagina la sequenza."],
  numeri:     ["💡 Conta sulle dita — funziona sempre!", "💡 Usa i blocchi o disegna pallini per contare.", "💡 Pensa a quante cose hai nella tua stanza!"],
  creativita: ["💡 Non c'è risposta sbagliata in arte — ma qui una è più giusta!", "💡 Guarda i colori e le forme con attenzione.", "💡 Immagina di essere un pittore!"],
  empatia:    ["💡 Pensa a come ti sentiresti tu al posto del personaggio.", "💡 Le espressioni del viso ci dicono come ci sentiamo.", "💡 Cosa faresti tu in questa situazione?"],
  parole:     ["💡 Pronuncia la parola ad alta voce lentamente.", "💡 Pensa alla prima lettera — quale suono fa?", "💡 Conosci altre parole che suonano simili?"],
  coding:     ["💡 Segui le istruzioni passo dopo passo, come un robot.", "💡 Prima pensa poi agisci — i computer fanno così!", "💡 Rileggi la condizione: è VERO o FALSO?"],
};
function getSkillTip(type) {
  const sk = getSkill(type);
  const tips = SKILL_TIPS[sk] || SKILL_TIPS.logica;
  return tips[Math.floor(Math.random() * tips.length)];
}

// ── PROCEDURAL MATH GENERATOR ─────────────────────────────────────────────────
function _rnd(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function _opts(correct, spread, count = 4) {
  const vals = new Set([correct]);
  let guard = 0;
  while (vals.size < count) {
    if (++guard > 200) { // C3: safety valve — fill remaining slots deterministically
      for (let i = 1; vals.size < count; i++) vals.add(correct + spread + i);
      break;
    }
    const delta = _rnd(1, spread) * (Math.random() < 0.5 ? 1 : -1);
    const v = correct + delta;
    if (v > 0) vals.add(v);
  }
  const arr = [...vals].sort(() => Math.random() - 0.5);
  return { options: arr.map(String), correct: arr.indexOf(correct) };
}
function genMathChallenge(worldId, age) {
  const id = `proc_${worldId}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const emojis = { foresta:"🐿️", castello:"👑", oceano:"🐬", mercato:"🧙", galassia:"🚀", vulcano:"🌋", biblioteca:"📖", laboratorio:"🤖" };
  const e = emojis[worldId] || "⭐";
  if (age <= 4) {
    // Simple addition with pictures
    const a = _rnd(1, 4), b = _rnd(1, 3);
    const things = pick(["🍎","⭐","🌸","🐟","🌙","🦋"]);
    const { options, correct } = _opts(a + b, 2);
    return { id, format:"multiple_choice", type:"numeri", ageMin:3, ageMax:4, emoji:e,
      prompt:`${things.repeat(a)} e ${things.repeat(b)}\nQuanti ${things} in tutto?`, options, correct };
  }
  if (age <= 6) {
    const type = _rnd(0, 1);
    if (type === 0) {
      const a = _rnd(3, 12), b = _rnd(1, Math.min(a - 1, 8));
      const { options, correct } = _opts(a + b, 3);
      return { id, format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, emoji:e,
        prompt:`${a} + ${b} = ?`, options, correct };
    }
    const a = _rnd(5, 15), b = _rnd(1, a - 1);
    const { options, correct } = _opts(a - b, 3);
    return { id, format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, emoji:e,
      prompt:`${a} − ${b} = ?`, options, correct };
  }
  // age 7-8
  const type = _rnd(0, 2);
  if (type === 0) {
    const a = _rnd(3, 9), b = _rnd(3, 9);
    const { options, correct } = _opts(a * b, 5);
    return { id, format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:e,
      prompt:`${a} × ${b} = ?`, options, correct };
  }
  if (type === 1) {
    const b = _rnd(2, 9), c = _rnd(2, 9);
    const { options, correct } = _opts(b * c, 6);
    return { id, format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:e,
      prompt:`${b * c} ÷ ${b} = ?`, options, correct };
  }
  const tens = _rnd(2, 9) * 10, add = _rnd(15, 45);
  const { options, correct } = _opts(tens + add, 8);
  return { id, format:"multiple_choice", type:"numeri", ageMin:7, ageMax:8, emoji:e,
    prompt:`${tens} + ${add} = ?`, options, correct };
}

function filterByAge(worldId, age, skills = null) {
  const all = (ALL_CHALLENGES[worldId] || []).filter(c => age >= c.ageMin && age <= c.ageMax);
  const bosses = all.filter(c => c.isBoss);
  // Selezione ADATTIVA per skill: se sono note le competenze del bambino, le sfide
  // delle skill più DEBOLI (mastery più basso) hanno più probabilità di uscire.
  // Random × livello: un livello basso comprime il punteggio → ordina prima = esce di più.
  // Senza skills → shuffle puro (retrocompatibile, comportamento originale).
  const normals = skills
    ? all.filter(c => !c.isBoss)
         .map(c => ({ c, k: Math.random() * (skills[getSkill(c.type)] ?? 1) }))
         .sort((a, b) => a.k - b.k)
         .map(x => x.c)
    : all.filter(c => !c.isBoss).sort(() => Math.random() - 0.5);
  const boss = bosses[Math.floor(Math.random() * bosses.length)];
  // Inject 1 procedural math challenge per session, swap out 1 normal
  const proc = genMathChallenge(worldId, age);
  const slice = boss ? normals.slice(0, 4) : normals.slice(0, 5);
  const mixed = [...slice, proc].sort(() => Math.random() - 0.5);
  return boss ? [...mixed, boss] : mixed;
}
function getDailyChallenges(age, profileId = '') {
  const d = new Date().toISOString().slice(0, 10);
  const pidHash = profileId.split('').reduce((a, c) => a * 31 + c.charCodeAt(0), 0);
  const seed = d.split('-').reduce((a, v) => a * 1000 + parseInt(v), 0) + pidHash; // M6: per-profile seed
  const pool = Object.values(ALL_CHALLENGES).flat().filter(c => !c.isBoss && age >= c.ageMin && age <= c.ageMax);
  if (!pool.length) return [];
  const picks = []; const used = new Set();
  for (let i = 0; i < 3; i++) {
    let idx = Math.abs((seed * 31 + i * 919 + i * i * 137)) % pool.length;
    let t = 0; while (used.has(idx) && t++ < 20) idx = (idx + 1) % pool.length;
    used.add(idx); picks.push(pool[idx]);
  }
  return picks;
}
function initSkills() { return { logica:1, numeri:1, creativita:1, empatia:1, parole:1, coding:1 }; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
// C7: parse "YYYY-MM-DD" as local midnight to avoid UTC off-by-one in European timezones
function parseDateLocal(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }
function escapeHtml(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function addSkill(skills, type) {
  const k = getSkill(type);
  return { ...skills, [k]: Math.min(10, +(skills[k] + 0.5).toFixed(1)) };
}

let _bestVoice    = undefined; // undefined = uncached; null = none found
let _currentAudio = null;
let _ttsEnabled   = true;     // toggled from parent panel

function getBestVoice() {
  if (_bestVoice !== undefined) return _bestVoice;
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (!voices.length) return null;
  // Priority: premium neural/enhanced > Alice (macOS) > Google > local female > any italian
  _bestVoice =
    voices.find(v => /Alice/i.test(v.name) && v.lang.startsWith('it')) ||
    voices.find(v => /Federica|Serena|Giulia/i.test(v.name) && v.lang.startsWith('it')) ||
    voices.find(v => /Elsa|Bianca|Paola|Isabella/i.test(v.name) && v.lang.startsWith('it')) ||
    voices.find(v => /Google.*ital/i.test(v.name)) ||
    voices.find(v => v.lang === 'it-IT' && v.localService && !/cosimo|luca|male/i.test(v.name)) ||
    voices.find(v => v.lang === 'it-IT' && v.localService) ||
    voices.find(v => v.lang === 'it-IT' && !/cosimo|luca/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('it')) ||
    null;
  return _bestVoice;
}

function speakBrowser(text, rate = 0.85) {
  if (!window?.speechSynthesis || !text) return;
  const clean = String(text)
    .replace(/\n/g, ', ')
    .replace(/[^\w\s.,!?àèéìòùÀÈÉÌÒÙ'-]/g, '')
    .replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang   = 'it-IT';
  u.rate   = Math.min(rate, 0.92);  // mai troppo veloce — più naturale
  u.pitch  = 1.08;                  // leggermente caldo, non robotico
  u.volume = 1.0;
  const v = getBestVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

let _onTalkingEnd = null; // callback to clear compTalking

function speak(text, rate = 0.85, onEnd) {
  if (!_ttsEnabled || !text) { if (onEnd) setTimeout(onEnd, 300); return; }
  window.speechSynthesis?.cancel?.();
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  if (_onTalkingEnd) { _onTalkingEnd(); _onTalkingEnd = null; }
  if (onEnd) _onTalkingEnd = onEnd;

  const file = TTS_MAP[text];
  if (file) {
    const audio = new Audio(`./audio/${file}`);
    audio.playbackRate = rate <= 0.78 ? 0.88 : 1.0;
    _currentAudio = audio;
    audio.onended = () => {
      if (_currentAudio === audio) _currentAudio = null;
      if (_onTalkingEnd) { _onTalkingEnd(); _onTalkingEnd = null; }
    };
    audio.play().catch(() => { _currentAudio = null; speakBrowser(text, rate); if (_onTalkingEnd) { _onTalkingEnd(); _onTalkingEnd = null; } });
    return;
  }
  speakBrowser(text, rate);
  // Browser TTS has no reliable onend cross-browser; clear after estimate
  if (onEnd) setTimeout(onEnd, Math.max(1000, text.length * 65));
}

// ── AUDIO UNLOCK ─────────────────────────────────────────────────────────────
// Browsers block HTMLAudio autoplay until a user gesture. Call once on first tap.
let _audioUnlocked = false;
function warmUpAudio() {
  if (_audioUnlocked) return;
  _audioUnlocked = true;
  // Unlock AudioContext
  try { getCtxRaw(); } catch (e) {}
  // Unlock HTMLAudio with a silent 100ms WAV
  const a = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
  a.volume = 0.001;
  a.play().catch(() => {});
}
// ── SOUND ENGINE ─────────────────────────────────────────────────────────────
let _ctx = null;
function getCtxRaw() {
  if (!_ctx) _ctx = new (window.AudioContext || window.webkitAudioContext)();
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}
function getCtx() {
  return getCtxRaw();
}
function playTone(freq, type, start, dur, gainPeak = 0.28) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.connect(g); g.connect(ctx.destination);
  osc.type      = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gainPeak, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
  osc.start(ctx.currentTime + start);
  osc.stop(ctx.currentTime + start + dur + 0.05);
}
const SFX = {
  correct() {
    // Ascending triad C-E-G
    [[523, 0], [659, 0.1], [784, 0.2]].forEach(([f, t]) => playTone(f, 'sine', t, 0.3));
  },
  wrong() {
    // Low dull thud
    playTone(180, 'triangle', 0, 0.25, 0.18);
    playTone(140, 'triangle', 0.05, 0.2, 0.12);
  },
  combo() {
    // Quick ascending 5-note fanfare
    [[523,0],[659,.07],[784,.14],[1047,.21],[1319,.28]].forEach(([f,t]) => playTone(f,'sine',t,0.22,0.22));
  },
  boss() {
    // Dramatic low chord
    [[220,0],[277,0.02],[330,0.04]].forEach(([f,t]) => playTone(f,'sawtooth',t,0.5,0.15));
  },
  victory() {
    // Full victory fanfare
    [[523,0],[659,.1],[784,.2],[1047,.3],[784,.5],[1047,.65],[1319,.8]].forEach(([f,t]) => playTone(f,'sine',t,0.35,0.3));
  },
  tap() {
    playTone(880, 'sine', 0, 0.08, 0.12);
    navigator.vibrate?.(8);
  },
  unlock() {
    [[659,0],[784,.12],[1047,.24],[1319,.36]].forEach(([f,t]) => playTone(f,'sine',t,0.28,0.2));
  },
  levelUp() {
    [[523,0],[659,.08],[784,.16],[1047,.24],[1319,.32],[1047,.5],[1319,.6],[1568,.72]].forEach(([f,t]) => playTone(f,'sine',t,0.3,0.22));
  },
  achievement() {
    [[880,0],[1047,.1],[1319,.2],[1047,.35],[1319,.45]].forEach(([f,t]) => playTone(f,'sine',t,0.25,0.18));
  },
  // UX: sound gentile per risposta errata nei quiz bambini (meno punitivo del wrong)
  gentle() {
    playTone(330, 'sine', 0, 0.18, 0.1);
    playTone(294, 'sine', 0.1, 0.15, 0.08);
  },
  // UX: chime per pausa sessione
  sessionChime() {
    [[784,0],[659,.15],[523,.3]].forEach(([f,t]) => playTone(f,'sine',t,0.35,0.15));
  },
  // UX: milestone celebration (streak 3/7, sigillo completato)
  milestone() {
    [[523,0],[659,.06],[784,.12],[1047,.18],[1319,.24],[1568,.30],[1319,.50],[1047,.64],[1319,.78],[1568,.92]].forEach(([f,t]) => playTone(f,'sine',t,0.28,0.2));
    navigator.vibrate?.([50,30,80,30,120]);
  },
};

// ── AMBIENT MUSIC ENGINE ─────────────────────────────────────────────────────
const WORLD_SCALES = {
  foresta:   { freqs:[261.6,293.7,329.6,349.2,329.6,293.7], ms:680 },
  castello:  { freqs:[220.0,246.9,261.6,293.7,261.6,246.9], ms:620 },
  oceano:    { freqs:[293.7,329.6,369.9,415.3,369.9,329.6], ms:760 },
  mercato:   { freqs:[349.2,392.0,440.0,493.9,440.0,392.0], ms:540 },
  galassia:  { freqs:[196.0,220.0,246.9,261.6,246.9,220.0], ms:880 },
  vulcano:   { freqs:[246.9,261.6,311.1,329.6,311.1,261.6], ms:560 },
  biblioteca:{ freqs:[329.6,349.2,392.0,440.0,392.0,349.2], ms:720 },
};
let _musicTimer = null, _musicStep = 0;
function startMusic(worldId) {
  if (_musicTimer) return; // already running
  const scale = WORLD_SCALES[worldId]; if (!scale) return;
  function tick() {
    const f = scale.freqs[_musicStep % scale.freqs.length];
    playTone(f,   'sine', 0, scale.ms / 1000 * 0.85, 0.055);
    playTone(f/2, 'sine', 0, scale.ms / 1000 * 0.85, 0.028);
    _musicStep++;
    _musicTimer = setTimeout(tick, scale.ms);
  }
  tick();
}
function stopMusic() {
  clearTimeout(_musicTimer);
  _musicTimer = null;
  _musicStep  = 0;
}

// ── SONG ENGINE (MP3 pre-recorded lines) ─────────────────────────────────────
const WORLD_SONGS = {
  foresta:    ["Nella foresta magica canto,","tra gli alberi verdi e il cielo incantato!","Lo scoiattolo salta, l'uccello vola via,","quante cose belle nella foresta mia!","Uno, due, tre, quattro animali,","volano le farfalle con le ali speciali!","Nella foresta magica canto,","la natura è bella — ho imparato tanto!"],
  castello:   ["C'è un castello nel mezzo del cielo,","con torri di pietra e un lungo mantello!","Il cavaliere coraggioso parte,","con il suo scudo e le sue arti!","Uno, due, tre passi nel castello,","ogni stanza nasconde qualcosa di bello!","Sii coraggioso come il cavalier snello,","e il castello diventerà il posto più bello!"],
  oceano:     ["Nell'oceano profondo e blu,","nuotano i pesci in su e in giù!","Il polpo danza, il granchio cammina,","la stella marina splende e scintilla!","Uno, due, tre bolle nell'acqua,","l'oceano è bello ogni mattina!","Nuota con me nelle acque del blu,","l'oceano ci aspetta, andiamo su!"],
  mercato:    ["Al mercato colorato e bello,","compro la frutta nel mio cestello!","Rosse le mele, gialle le banane,","arancio l'arancia, verdi le castagne!","Uno, due, tre frutti nel cesto,","conta con me — fai presto, fai presto!","Al mercato colorato e bello,","porta a casa tutto il cestello!"],
  galassia:   ["Volo tra le stelle nel cielo blu,","pianeti lontani e la luna lassù!","La luna brilla, il sole scalda,","nello spazio infinito che mi sbalorda!","Uno, due, tre, quattro, cinque stelle,","scintillano su nel cielo belle!","Astronauta anch'io nel cielo blu,","le stelle mi aspettano, ci volo su!"],
  vulcano:    ["Il vulcano brontola e fa boom,","la lava scende con il suo profumo!","Il drago dorme nella montagna,","si sveglia solo con la mattina!","Uno, due, tre, il vulcano conta,","ogni sfida vinta è una vetta che monta!","Sei coraggioso come il drago vero,","il vulcano magico è il tuo sentiero!"],
  biblioteca: ["In biblioteca tante parole,","le lettere danzano come le viole!","La A di aiuto, la B di bambino,","la C di ciao e la D di destino!","Leggo una pagina, poi un'altra ancora,","in biblioteca il tempo vola!","Le lettere magiche mi insegnano tanto,","leggere è bello — è il mio canto!"],
  laboratorio:["Nel laboratorio di Pixel il robot,","il codice corre su ogni spot!","Prima fai questo, poi fai quello,","il programma funziona — è tutto bello!","Uno, due, tre comandi in fila,","Pixel danza a meraviglia!","Nel laboratorio sei un campione,","programmare è la tua missione!"],
  giardino:   ["Nel giardino magico canto,","tra i fiori colorati e il sole tanto!","La farfalla vola, l'ape ronza via,","quante cose belle nella natura mia!","Uno, due, tre fiori sbocciati,","ogni petalo rosa nei prati incantati!","Nel giardino magico canto,","la natura è bella — ho imparato tanto!"],
};
let _songAudio = null, _songWorld = null, _songLine = 0, _songActive = false;
let _onSongTick = null;
function _playSongLine() {
  if (!_songActive || !_songWorld) return;
  const lines = WORLD_SONGS[_songWorld]; if (!lines) return;
  const idx = _songLine % lines.length;
  _songAudio = new Audio(`${import.meta.env.BASE_URL}audio/song_${_songWorld}_${idx}.mp3`);
  _songAudio.volume = 0.38;
  if (_onSongTick) _onSongTick(lines[idx]);
  _songAudio.onended = () => { if (_songActive) { _songLine++; _playSongLine(); } };
  _songAudio.play().catch(() => {});
}
function startSong(worldId) {
  stopSong();
  if (!WORLD_SONGS[worldId]) return;
  _songWorld = worldId; _songLine = 0; _songActive = true;
  _playSongLine();
}
function stopSong() {
  _songActive = false;
  if (_songAudio) { _songAudio.pause(); _songAudio = null; }
  _songLine = 0; _songWorld = null;
  if (_onSongTick) _onSongTick(null);
}

// ── PLAYER LEVELS ────────────────────────────────────────────────────────────
const PLAYER_LEVELS = [
  { min:0,   title:"Apprendista",  emoji:"🌱", xpNext:15  },
  { min:15,  title:"Esploratore",  emoji:"🗺️", xpNext:20  },
  { min:35,  title:"Avventuriero", emoji:"⚔️", xpNext:30  },
  { min:65,  title:"Stregone",     emoji:"🔮", xpNext:35  },
  { min:100, title:"Mago",         emoji:"🧙", xpNext:50  },
  { min:150, title:"Grande Mago",  emoji:"✨", xpNext:70  },
  { min:220, title:"Arcimago",     emoji:"🌟", xpNext:80  },
  { min:300, title:"Leggenda",     emoji:"🏆", xpNext:null },
];
function getLevel(stars) {
  let r = PLAYER_LEVELS[0];
  for (const l of PLAYER_LEVELS) if (stars >= l.min) r = l;
  return r;
}
function getLevelProgress(stars) {
  const lvl  = getLevel(stars);
  const next = PLAYER_LEVELS.find(l => l.min > stars);
  if (!next) return { lvl, pct: 100, toNext: 0, nextTitle: null };
  const pct = Math.round(((stars - lvl.min) / (next.min - lvl.min)) * 100);
  return { lvl, pct, toNext: next.min - stars, nextTitle: next.title, nextEmoji: next.emoji };
}

// ── COSMETICS ────────────────────────────────────────────────────────────────
const COSMETICS = [
  { id:"acc_bow",       emoji:"🎀", name:"Fiocco Magico",      type:"acc",  coinCost:5   },
  { id:"hat_crown",     emoji:"👑", name:"Corona Reale",       type:"hat",  coinCost:8   },
  { id:"acc_glasses",   emoji:"🕶️", name:"Occhiali Cool",      type:"acc",  coinCost:15  },
  { id:"hat_wizard",    emoji:"🎩", name:"Cappello Mago",      type:"hat",  coinCost:20  },
  { id:"acc_rainbow",   emoji:"🌈", name:"Arcobaleno",         type:"acc",  coinCost:30  },
  { id:"aura_fire",     emoji:"🔥", name:"Aura di Fuoco",      type:"aura", coinCost:40  },
  { id:"hat_party",     emoji:"🎉", name:"Cappello Festa",     type:"hat",  coinCost:50  },
  { id:"acc_lightning", emoji:"⚡", name:"Fulmine Elettrico",  type:"acc",  coinCost:60  },
  { id:"aura_ice",      emoji:"❄️", name:"Aura di Ghiaccio",   type:"aura", coinCost:80  },
  { id:"hat_star",      emoji:"🌟", name:"Stella d'Oro",       type:"hat",  coinCost:100 },
  { id:"acc_moon",      emoji:"🌙", name:"Luna d'Argento",     type:"acc",  coinCost:120 },
  { id:"aura_gold",     emoji:"✨", name:"Aura Dorata",        type:"aura", coinCost:150 },
  { id:"aura_legend",   emoji:"🏆", name:"Aura Leggendaria",   type:"aura", coinCost:200 },
];

// ── SEASONS / EVENTI ─────────────────────────────────────────────────────────
function getCurrentSeason() {
  const now = new Date();
  const md = now.getMonth() * 100 + now.getDate();
  if (md >= 1201 || md <= 106) return {
    id:'natale', name:'Natale 🎅', emoji:'🎄',
    color:'#CC2200', bg:'linear-gradient(160deg,#0d1a0d,#1a2e1a,#0d1a0d)',
    accent:'#CC2200', particles:['❄️','🎄','⭐','🎁','🔔','❄️','🎅'],
    banner:'🎄 Buon Natale! Sfide speciali invernali disponibili! ❄️',
  };
  if (md >= 315 && md <= 420) return {
    id:'pasqua', name:'Pasqua 🐣', emoji:'🐰',
    color:'#84CC16', bg:'linear-gradient(160deg,#0d1a00,#1a2e0a,#0d1a00)',
    accent:'#84CC16', particles:['🐣','🐰','🌸','🥚','🌷','🌼','🐥'],
    banner:'🐰 Buona Pasqua! Trova le uova nascoste! 🥚',
  };
  if (md >= 901 && md <= 915) return {
    id:'scuola', name:'Inizio Scuola 📚', emoji:'📚',
    color:'#2563EB', bg:'linear-gradient(160deg,#0a0a2e,#1a1a4e,#0a0a2e)',
    accent:'#2563EB', particles:['📚','✏️','🎒','📐','🖊️','📏','🔬'],
    banner:'📚 Bentornato a scuola! Nuove sfide ti aspettano! ✏️',
  };
  if (md >= 1025 && md <= 1102) return {
    id:'halloween', name:'Halloween 🎃', emoji:'🎃',
    color:'#F97316', bg:'linear-gradient(160deg,#100500,#2d0f00,#100500)',
    accent:'#F97316', particles:['🎃','👻','🕷️','🦇','🌙','💀','🕸️'],
    banner:'👻 Buon Halloween! Sfide da brivido! 🎃',
  };
  if (md >= 615 && md <= 831) return {
    id:'estate', name:'Estate ☀️', emoji:'🌞',
    color:'#FBD423', bg:'linear-gradient(160deg,#1a0e00,#2d1a00,#1a0e00)',
    accent:'#FBD423', particles:['☀️','🌊','🏖️','🍦','🌺','🐚','🌴'],
    banner:'☀️ Buona Estate! Avventure estive ti aspettano! 🏖️',
  };
  return null;
}

// ── ACHIEVEMENTS ──────────────────────────────────────────────────────────────
const ACHIEVEMENTS = [
  { id:"first_star",  emoji:"⭐", name:"Prima Stella",        desc:"Guadagna la tua prima stella" },
  { id:"perfect",     emoji:"💯", name:"Missione Perfetta",   desc:"Completa un mondo senza errori" },
  { id:"streak3",     emoji:"🌙", name:"Tre Notti di Stelle", desc:"Gioca 3 giorni di fila" },
  { id:"streak7",     emoji:"🔥", name:"Settimana di Fuoco",  desc:"Gioca 7 giorni di fila" },
  { id:"all_worlds",  emoji:"🌍", name:"Esploratore Totale",  desc:"Completa tutti e 5 i mondi" },
  { id:"collector",   emoji:"🎭", name:"Collezionista",       desc:"Sblocca 5 oggetti cosmetici" },
  { id:"centurion",   emoji:"💫", name:"Centurione",          desc:"Raggiungi 100 stelle totali" },
  { id:"arcane",      emoji:"✨", name:"Ascesa all'Arcanato", desc:"Diventa Grande Mago (150 stelle)" },
  { id:"daily5",      emoji:"🌟", name:"Eroe del Giorno",     desc:"Completa la sfida del giorno 5 volte" },
  { id:"combo5",      emoji:"🎯", name:"Combo Maestro",       desc:"Ottieni 5 risposte giuste di fila" },
  { id:"family3",     emoji:"👨‍👩‍👧",name:"Eroe di Famiglia",   desc:"Completa 3 missioni famiglia" },
  { id:"skill_5",     emoji:"🧠", name:"Genio in Erba",       desc:"Porta un'abilità al livello 5" },
  { id:"all_skills",  emoji:"🎓", name:"Studente Completo",   desc:"Allenati in tutte e 5 le abilità" },
  { id:"word_master", emoji:"📖", name:"Maestro delle Parole",desc:"Porta l'abilità Parole al livello 5" },
];
function checkNewAchievements(prev, { totalStars, results, items, streak, combo, missionsDone, skills, dailyCount }) {
  const add = (id, cond) => (!prev.includes(id) && cond) ? [id] : [];
  return [
    ...add("first_star",  totalStars >= 1),
    ...add("perfect",     results.length >= 5 && results.every(r => r.ok)),
    ...add("streak3",     streak >= 3),
    ...add("streak7",     streak >= 7),
    ...add("all_worlds",  items.length >= 5),
    ...add("collector",   totalStars >= 50),
    ...add("centurion",   totalStars >= 100),
    ...add("arcane",      totalStars >= 150),
    ...add("daily5",      (dailyCount||0) >= 5),
    ...add("combo5",      combo >= 5),
    ...add("family3",     missionsDone.length >= 3),
    ...add("skill_5",     Object.values(skills).some(v => v >= 5)),
    ...add("all_skills",  Object.values(skills).filter(v => v > 1).length >= 5),
    ...add("word_master", (skills.parole||1) >= 5),
  ];
}

// ── WORLD BACKGROUND PARTICLES ───────────────────────────────────────────────
const WORLD_PARTICLES = {
  foresta:     ["🌿","🍃","🌲","🦋","🐝","🌸"],
  castello:    ["⭐","✨","🌟","💫","🔮","🌙"],
  oceano:      ["🌊","🐚","💧","🐠","🐡","🌿"],
  mercato:     ["🎨","🌈","✨","🎪","🍎","🌸"],
  galassia:    ["⭐","🌟","💫","🪐","🌌","✨"],
  vulcano:     ["🌋","🔥","💥","✨","🌑","🪨"],
  biblioteca:  ["📚","📖","✨","🦉","📜","🔮"],
  laboratorio: ["⚡","💡","🔮","✨","🤖","🔬"],
};
function WorldBg({ worldId }) {
  // Illustrated SVG scene background — replaces old emoji particles
  return <WorldScene worldId={worldId} variant="bg" />;
}

// ── PERSISTENCE ───────────────────────────────────────────────────────────────
const SAVE_KEY    = 'mondomago_v1';
const PARENT_KEY  = 'mondomago_parent_v1';
const PROFILES_KEY = 'mondomago_profiles_v1';
function uid() { return Math.random().toString(36).slice(2, 10); }
function loadAllProfiles() {
  try { const d = JSON.parse(localStorage.getItem(PROFILES_KEY) || '[]'); return Array.isArray(d) ? d : []; }
  catch { return []; }
}
function writeAllProfiles(arr) {
  try { localStorage.setItem(PROFILES_KEY, JSON.stringify(arr)); } catch {}
}
function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); } catch { return null; }
}
function writeSave(data) {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(data)); } catch {}
}
function loadParent() {
  try { return JSON.parse(localStorage.getItem(PARENT_KEY) || 'null'); } catch { return null; }
}
function writeParent(data) {
  try { localStorage.setItem(PARENT_KEY, JSON.stringify(data)); } catch {}
}

// ── SCREEN NAVIGATION DEPTH MAP (for directional transitions) ─────────────────
const SCREEN_DEPTH = {
  consent: 0, onboarding: 0.5, name: 1, age: 2, companion: 3, companion_welcome: 3.5, map: 4,
  profile_select: 5, skills: 5, family: 5, cosmetics: 5, profile: 5, story_book: 5,
  parent: 5, fulmine: 5, coplay_intro: 6, world_intro: 7, school: 6,
  challenge: 8, world_end: 9, session_stats: 9,
};

// ── LETTER TRACING (L2) ───────────────────────────────────────────────────────
// Letters defined in a 0-100 normalized coordinate space (SVG viewBox "0 0 100 100").
// refPts are waypoints sampled from the ideal path; a draw session passes when
// ≥65% of refPts are within HIT_RADIUS (18 units ≈ 40px on the 220px canvas).
const LETTER_DATA = {
  I: {
    guide:   "M50,10 L50,90",
    refPts:  [[50,10],[50,30],[50,50],[50,70],[50,90]],
    start:   [50,10],
  },
  O: {
    guide:   "M50,10 C74,10 90,26 90,50 C90,74 74,90 50,90 C26,90 10,74 10,50 C10,26 26,10 50,10 Z",
    refPts:  [[50,10],[79,22],[90,50],[79,78],[50,90],[21,78],[10,50],[21,22],[50,10]],
    start:   [50,10],
  },
  U: {
    guide:   "M22,10 L22,65 C22,88 38,93 50,93 C62,93 78,88 78,65 L78,10",
    refPts:  [[22,10],[22,38],[22,65],[27,80],[40,90],[50,93],[60,90],[73,80],[78,65],[78,38],[78,10]],
    start:   [22,10],
  },
  A: {
    guide:   "M15,90 L50,8 L85,90 M32,56 L68,56",
    refPts:  [[15,90],[25,72],[38,56],[50,28],[50,8],[62,28],[62,56],[75,72],[85,90],[32,56],[50,56],[68,56]],
    start:   [15,90],
  },
  M: {
    guide:   "M10,90 L10,10 L50,55 L90,10 L90,90",
    refPts:  [[10,90],[10,60],[10,30],[10,10],[30,32],[50,55],[70,32],[90,10],[90,30],[90,60],[90,90]],
    start:   [10,90],
  },
  E: {
    guide:   "M75,12 L20,12 L20,90 L75,90 M20,51 L60,51",
    refPts:  [[75,12],[48,12],[20,12],[20,40],[20,51],[60,51],[20,51],[20,70],[20,90],[48,90],[75,90]],
    start:   [75,12],
  },
};

function LetterTracer({ letter, onComplete, youngBg }) {
  const svgRef           = useRef(null);
  const [path, setPath]  = useState([]);
  const [active, setAct] = useState(false);
  const [pct, setPct]    = useState(0);
  const [done, setDone]  = useState(false);

  const ld  = LETTER_DATA[letter] || LETTER_DATA.I;
  const HIT = 18;   // hit radius in normalized units
  const PASS = 65;  // % coverage needed to succeed

  function pt(e) {
    const svg = svgRef.current; if (!svg) return null;
    const r = svg.getBoundingClientRect();
    const s = e.touches?.[0] || e.changedTouches?.[0] || e;
    return { x: ((s.clientX-r.left)/r.width)*100, y: ((s.clientY-r.top)/r.height)*100 };
  }

  function onStart(e) {
    e.preventDefault(); if (done) return;
    const p = pt(e); if (!p) return;
    setAct(true); setPath([p]); setPct(0);
  }
  function onMove(e) {
    e.preventDefault(); if (!active || done) return;
    const p = pt(e); if (!p) return;
    setPath(prev => {
      const last = prev[prev.length-1];
      if (last && Math.hypot(p.x-last.x, p.y-last.y) < 2.5) return prev;
      return [...prev, p];
    });
  }
  function onEnd(e) {
    e.preventDefault(); if (!active) return;
    setAct(false);
    const score = Math.round(
      (ld.refPts.filter(([rx,ry]) => path.some(p => Math.hypot(p.x-rx,p.y-ry)<HIT)).length
       / ld.refPts.length) * 100
    );
    setPct(score);
    if (score >= PASS) { setDone(true); setTimeout(onComplete, 700); }
  }
  function reset() { setPath([]); setPct(0); setDone(false); setAct(false); }

  const poly = path.map(p => `${p.x},${p.y}`).join(' ');
  const [sx, sy] = ld.start;

  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
      <svg ref={svgRef} viewBox="0 0 100 100" width={220} height={220}
        style={{background:youngBg?"white":"rgba(255,255,255,.09)",borderRadius:24,
          border:youngBg?"2px solid rgba(0,0,0,.08)":"2px solid rgba(255,255,255,.12)",
          touchAction:"none",cursor:"crosshair",display:"block"}}
        onMouseDown={onStart} onMouseMove={onMove} onMouseUp={onEnd} onMouseLeave={onEnd}
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}>

        {/* Guide letter — thick light fill */}
        <path d={ld.guide} fill="none"
          stroke={youngBg?"#DCDCF0":"rgba(255,255,255,.14)"}
          strokeWidth={14} strokeLinecap="round" strokeLinejoin="round"/>
        {/* Guide outline — dashed centerline */}
        <path d={ld.guide} fill="none"
          stroke={youngBg?"#AAAAC8":"rgba(255,255,255,.22)"}
          strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3,3"/>

        {/* Starting dot — pulsing green circle */}
        {!done && (
          <circle cx={sx} cy={sy} r={youngBg?7:6} fill="#22C55E" className="pulse" opacity={active?0:.9}/>
        )}

        {/* User drawn path */}
        {path.length > 1 && (
          <polyline points={poly} fill="none"
            stroke={done?"#22C55E":"#7C3AED"}
            strokeWidth={youngBg?7:5.5} strokeLinecap="round" strokeLinejoin="round" opacity={.88}/>
        )}

        {/* Success star */}
        {done && <text x="50" y="56" textAnchor="middle" dominantBaseline="middle" fontSize="38">⭐</text>}
      </svg>

      {/* Progress bar */}
      {pct > 0 && !done && (
        <div style={{width:220,background:youngBg?"rgba(0,0,0,.09)":"rgba(255,255,255,.09)",borderRadius:8,height:9,overflow:"hidden"}}>
          <div style={{background:pct>=PASS?"#22C55E":"#7C3AED",height:"100%",borderRadius:8,
            width:`${Math.min(pct,100)}%`,transition:"width .3s"}}/>
        </div>
      )}

      {/* Hint / retry */}
      {!done && path.length === 0 && (
        <div style={{fontSize:13,color:youngBg?"rgba(0,0,0,.4)":"rgba(255,255,255,.4)",fontFamily:"'Fredoka One',cursive"}}>
          Traccia con il dito! 👆
        </div>
      )}
      {pct > 0 && pct < PASS && !done && (
        <button onClick={reset}
          style={{background:youngBg?"rgba(0,0,0,.07)":"rgba(255,255,255,.12)",border:"none",
            color:youngBg?"#444":"white",borderRadius:20,padding:"8px 22px",fontSize:14,
            cursor:"pointer",fontWeight:700,fontFamily:"'Fredoka One',cursive"}}>
          Riprova! 🔄
        </button>
      )}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
const FF = "'Fredoka One', cursive";
// Direzione "Sigillo di Stelle": display storybook + mono per i dati numerici
const FF_DISPLAY = "'Grandstander', 'Fredoka One', cursive";
const FF_MONO = "'DM Mono', ui-monospace, 'SFMono-Regular', monospace";
// Token palette "Sigillo di Stelle" (livello modulo, riusabili in ogni schermata)
const SG_GOLD  = "#FFC24B";   // magia / accento primario
const SG_RUNE  = "#6DE0C6";   // logica / codice
const SG_PARCH = "#F6ECD4";   // testo su superfici scure
const SG_INK   = "#1B1035";   // testo scuro su oro
const SG_BG    = "radial-gradient(125% 85% at 50% -8%, #2D1B54 0%, #1B1035 52%, #140B29 100%)";
const SG_CARD  = "rgba(45,27,84,.55)";              // superficie card indaco caldo
const SG_BR    = "1px solid rgba(255,194,75,.14)";  // filo d'oro sottile
const SG_GOLD_GRAD = "linear-gradient(135deg,#FFC24B,#F6A93B)"; // pulsanti primari
const SG_TILE  = "rgba(20,11,41,.5)";               // riquadri interni più scuri
// Alias a livello modulo per le schermate (skills/session_stats/…) che usano i
// token P_* originariamente locali al blocco "parent". Il blocco parent ridefinisce
// i propri P_* localmente (shadowing legale) → nessun conflitto.
const P_CARD = SG_CARD, P_BR = SG_BR, P_TILE = SG_TILE;

export default function MondoMago() {
  const [screen,       setScreen]       = useState("name");
  const [screenAnim,   setScreenAnim]   = useState("screen-enter");
  const prevScreenRef = useRef("");
  const nextRef       = useRef(null);
  const advancingRef  = useRef(false);
  const obTouchRef    = useRef(0);
  const [childName,    setChildName]    = useState("");
  const [childAge,     setChildAge]     = useState(null);
  const [companion,    setCompanion]    = useState(null);
  const [world,        setWorld]        = useState(null);
  const [challenges,   setChallenges]   = useState([]);
  const [ci,           setCi]           = useState(0);
  const [selected,     setSelected]     = useState(null);
  const [storyChoice,  setStoryChoice]  = useState(null);
  const [seqTaps,      setSeqTaps]      = useState([]);
  const [seqError,     setSeqError]     = useState(false);
  const [sessionStars, setSessionStars] = useState(0);
  const [totalStars,   setTotalStars]   = useState(0);
  const [coins,        setCoins]        = useState(0);
  const [ownedCosmetics, setOwnedCosmetics] = useState([]);
  const [skills,       setSkills]       = useState(initSkills());
  const [results,      setResults]      = useState([]);
  const [combo,        setCombo]        = useState(0);
  const [items,        setItems]        = useState([]);
  const [compAnim,     setCompAnim]     = useState("float");
  const [cardAnim,     setCardAnim]     = useState("");
  const [starPop,      setStarPop]      = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [isReturning,  setIsReturning]  = useState(false);
  const [streak,       setStreak]       = useState(1);
  const [exitConfirm,    setExitConfirm]    = useState(false);
  const [missionsDone,   setMissionsDone]   = useState([]);
  const [feedbackMsg,    setFeedbackMsg]    = useState("");
  const [parentUnlocked, setParentUnlocked] = useState(false);
  const [pinInput,       setPinInput]       = useState("");
  const [pinSaved,       setPinSaved]       = useState("");
  const [pinError,       setPinError]       = useState(false);
  const [timeLimit,      setTimeLimit]      = useState(0);   // 0=off, 15, 20, 30 min
  const [notifTime,      setNotifTime]      = useState("19:00"); // daily reminder time HH:MM
  const [confirmPinReset, setConfirmPinReset] = useState(false);
  const [consentChecked,  setConsentChecked]  = useState(false);
  const [sessionStart,   setSessionStart]   = useState(0);
  const [nowTick,        setNowTick]        = useState(0);
  const [dailyCompletedDate, setDailyCompletedDate] = useState("");
  const [wrongStreak,    setWrongStreak]    = useState(0);
  const [showFeedback,   setShowFeedback]   = useState(false);
  // multi-profile
  const [allProfiles,     setAllProfiles]     = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  // achievements & levels
  const [achievements,    setAchievements]    = useState([]);
  const [dailyCount,      setDailyCount]      = useState(0);
  const [newAchievements, setNewAchievements] = useState([]);
  const [newLevel,        setNewLevel]        = useState(null);
  const [lastKnownLevel,  setLastKnownLevel]  = useState(null);
  const [streakCelebrate, setStreakCelebrate] = useState(false);
  const [tutorialSeen,    setTutorialSeen]    = useState(false);
  // drag-drop state
  const [dragPicked,      setDragPicked]      = useState(null);   // index of picked item
  const [dragPlaced,      setDragPlaced]      = useState({});     // {zoneIdx: itemIdx}
  // memory-match state
  const [mmFlipped,       setMmFlipped]       = useState([]);     // indices of face-up cards
  const [mmMatched,       setMmMatched]       = useState([]);     // indices of matched cards
  const [mmLocked,        setMmLocked]        = useState(false);  // locked while checking pair
  // color-zones state
  const [colorZoneColors, setColorZoneColors] = useState({});    // {zoneId: colorHex}
  const [colorZonePicked, setColorZonePicked] = useState(null);  // selected color hex
  // puzzle-swap state
  const [puzzleGrid,      setPuzzleGrid]      = useState(null);  // shuffled tile array (-1=hole)
  const [puzzleMoves,     setPuzzleMoves]     = useState(0);
  // song lyric ticker
  const [songLyric,       setSongLyric]       = useState(null);
  // tts toggle (persisted)
  const [ttsEnabled,      setTtsEnabledState] = useState(() => localStorage.getItem('mondomago_tts') !== '0');
  // Preferenze di accessibilità (device-level, sopravvivono ai reset profilo)
  const [a11y, setA11y] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mondomago_a11y') || 'null') || {}; }
    catch { return {}; }
  });
  const setA11yPref = (patch) => setA11y(prev => ({ ...prev, ...patch }));
  // Entitlement premium (device-level, come a11y: sopravvive ai reset profilo
  // perché un acquisto è legato al dispositivo/account, non al singolo bambino).
  const [premium, setPremium] = useState(() => localStorage.getItem('mondomago_premium') === '1');
  // Quando la monetizzazione è OFF tutto è sbloccato per tutti.
  const isPremium = !MONETIZATION_ENABLED || premium;
  // Da collegare a un checkout (Stripe/Play Billing) quando si attiverà il freemium.
  const unlockPremium = () => { localStorage.setItem('mondomago_premium', '1'); setPremium(true); };
  // Fase C — cosmetics, seasons, school, session log
  const [equippedCosmetic,  setEquippedCosmetic]  = useState({});
  const [newCosmetics,      setNewCosmetics]      = useState([]);
  const [season,            setSeason]            = useState(null);
  const [schoolMode,        setSchoolMode]        = useState(false);
  const [schoolCode,        setSchoolCode]        = useState("");
  // Fase D — visual & engagement upgrades
  const [compMood,          setCompMood]          = useState("idle");   // idle|happy|sad|excited
  const [compTalking,       setCompTalking]        = useState(false);
  const [autoAdvancing,     setAutoAdvancing]      = useState(false);
  const [mysteryBox,        setMysteryBox]         = useState(null);    // null | reward string
  const [doubleStar,        setDoubleStar]         = useState(false);   // next correct = 2×
  const [burstPos,          setBurstPos]           = useState(null);    // {x,y} for particle burst
  const [guidedTap,         setGuidedTap]          = useState(false);   // first-challenge hand guide
  const [bossHPAnimated,    setBossHPAnimated]     = useState(100);
  const [schoolCodeInput,   setSchoolCodeInput]   = useState("");
  const [schoolAssigned,    setSchoolAssigned]    = useState([]);  // challenge ids from teacher
  const [sessionLog,        setSessionLog]        = useState([]); // [{date,stars,world,correct,total}]
  const [missed,            setMissed]            = useState([]); // SRS: [{id,world,s}] sfide sbagliate da ripassare
  const [showReport,        setShowReport]        = useState(false);
  const [fulminoTime,       setFulminoTime]       = useState(60);  // countdown seconds
  const [fulminoScore,      setFulminoScore]      = useState(0);   // correct answers
  const [fulminoCi,         setFulminoCi]         = useState(0);   // challenge index in pool
  const [fulminoPool,       setFulminoPool]       = useState([]); // shuffled visual_tap challenges
  const [fulminoRunning,    setFulminoRunning]    = useState(false);
  const [obSlide,           setObSlide]           = useState(0);
  const [mapSpotDismissed,  setMapSpotDismissed]  = useState(false);
  const [screenFlash,  setScreenFlash]  = useState(null);   // null | "ok" | "bad"
  const [comboPopup,   setComboPopup]   = useState(null);   // null | string
  const [wrongIdx,     setWrongIdx]     = useState(null);   // null | button index
  const [paused,           setPaused]           = useState(false);
  const [coinPop,          setCoinPop]          = useState(false);
  const [coinPopAmt,       setCoinPopAmt]       = useState(0);
  const [isFirstWorldComplete, setIsFirstWorldComplete] = useState(false);
  const [perfectBonus,     setPerfectBonus]     = useState(false);

  const comp  = COMPANIONS.find(c => c.id === companion);
  const arc   = world ? STORY_ARCS[world.id] : null;
  const ch    = challenges[ci];
  const young    = (childAge || 5) <= 4;
  const youngBg  = false;
  const done  = selected !== null;

  // Worlds unlocked dynamically based on totalStars
  const unlockedWorlds = useMemo(() => WORLDS.map(w => ({ // M8: memoize to avoid recreation every render
    ...w,
    unlocked: w.starsNeeded === 0 || totalStars >= w.starsNeeded,
  })), [totalStars]);

  // memory_match cards — shuffled once per challenge id (hook must be at component level)
  const memCards = useMemo(() => {
    if (!ch?.pairs) return [];
    const cards = [];
    ch.pairs.forEach((p, i) => {
      cards.push({ pairId: i, face: p.a });
      cards.push({ pairId: i, face: p.b });
    });
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    return cards;
  }, [ch?.id]); // eslint-disable-line

  // puzzle_swap — generate shuffled grid via random adjacent swaps (always solvable)
  const initialPuzzleGrid = useMemo(() => {
    if (ch?.format !== "puzzle_swap" || !ch?.emojis) return null;
    const size = ch.size || 2;
    const total = size * size;
    const grid = Array.from({ length: total }, (_, i) => i < ch.emojis.length ? i : -1);
    let emptyIdx = grid.indexOf(-1);
    for (let iter = 0; iter < 60; iter++) {
      const adj = [];
      const row = Math.floor(emptyIdx / size), col = emptyIdx % size;
      if (row > 0) adj.push(emptyIdx - size);
      if (row < size - 1) adj.push(emptyIdx + size);
      if (col > 0) adj.push(emptyIdx - 1);
      if (col < size - 1) adj.push(emptyIdx + 1);
      const swap = adj[Math.floor(Math.random() * adj.length)];
      [grid[emptyIdx], grid[swap]] = [grid[swap], grid[emptyIdx]];
      emptyIdx = swap;
    }
    return grid;
  }, [ch?.id]); // eslint-disable-line

  function resetGame() {
    const remaining = allProfiles.filter(p => p.id !== activeProfileId);
    writeAllProfiles(remaining);
    setAllProfiles(remaining);
    setChildName(''); setChildAge(null); setCompanion(null);
    setTotalStars(0); setSkills(initSkills()); setItems([]); setMissed([]);
    setCombo(0); setResults([]); setConfirmReset(false); setIsReturning(false); setStreak(1);
    setMissionsDone([]); setDailyCompletedDate('');
    setWrongStreak(0); setShowFeedback(false);
    setAchievements([]); setDailyCount(0); setActiveProfileId(null);
    setEquippedCosmetic({}); setSessionLog([]);
    setCoins(0); setOwnedCosmetics([]);
    setSchoolMode(false); setSchoolCode(""); setSchoolAssigned([]);
    navigate(remaining.length > 0 ? 'profile_select' : 'name');
  }

  function completeMission(id) {
    SFX.correct();
    navigator.vibrate?.(50);
    setMissionsDone(d => [...d, id]);
    setTotalStars(s => s + 2);
    triggerConfetti();
  }

  // Animation triggers
  const COMBO_MILESTONES = { 3:"🔥 3 di fila!", 5:"⚡ 5 COMBO!", 7:"🌟 7 in serie!", 10:"🏆 10 PERFETTI!" };
  // ── Ripetizione spaziata (SRS) ──────────────────────────────────────────────
  // Registra una sfida sbagliata per riproporla in una sessione SUCCESSIVA.
  // `s` = numero di sessioni completate al momento dell'errore (da sessionLog),
  // così la sfida torna solo quando sessionLog.length è cresciuto (spacing ≥ 1 sessione).
  function noteMiss(c) {
    if (!c?.id || c.isBoss || world?.id === "daily") return;
    setMissed(prev => prev.some(m => m.id === c.id)
      ? prev
      : [...prev.slice(-39), { id: c.id, world: world?.id, s: sessionLog.length }]);
  }
  // Sfida superata → rimossa dalla coda di ripasso (competenza acquisita).
  function clearMiss(c) {
    if (!c?.id) return;
    setMissed(prev => prev.some(m => m.id === c.id) ? prev.filter(m => m.id !== c.id) : prev);
  }
  function triggerOK(pts) {
    clearMiss(ch);
    const actualPts = doubleStar ? pts * 2 : pts;
    if (doubleStar) setDoubleStar(false);
    navigator.vibrate?.(combo >= 4 ? [30,20,30,20,80] : combo >= 2 ? [40,20,60] : [50]);
    setSessionStars(s => s + actualPts); setTotalStars(s => s + actualPts); setCoins(c => c + actualPts);
    setScreenFlash("ok"); setTimeout(() => setScreenFlash(null), 420);
    setCombo(c => {
      const nc = c + 1;
      if (nc >= 5) { SFX.combo(); setCompMood("excited"); }
      else if (nc >= 3) { SFX.combo(); setCompMood("excited"); }
      else { SFX.correct(); setCompMood("happy"); }
      const milestone = COMBO_MILESTONES[nc] || (nc >= 10 && nc % 5 === 0 ? `🔥 ${nc} di fila!` : null);
      if (milestone) { setComboPopup(milestone); setTimeout(() => setComboPopup(null), 1700); }
      return nc;
    });
    setAutoAdvancing(true);
    setStarPop(true);  setTimeout(() => setStarPop(false),  700);
    setCoinPopAmt(actualPts); setCoinPop(true); setTimeout(() => setCoinPop(false), 800);
    triggerConfetti();
    setCompAnim("bounce"); setTimeout(() => setCompAnim("float"), 900);
    setTimeout(() => setCompMood("idle"), 2000);
    // Mystery box: every 5 correct answers in session
    setResults(prev => {
      const nextCorrect = prev.filter(r=>r.ok).length + 1;
      if (nextCorrect > 0 && nextCorrect % 5 === 0) {
        const rewards = ["⭐⭐⭐ Tre stelle bonus!", "✨ Doppia stella prossima risposta!", "🎁 Cosmetico sbloccato!"];
        const reward = rewards[Math.floor(Math.random() * rewards.length)];
        setTimeout(() => {
          setMysteryBox(reward);
          if (reward.includes("Doppia")) setDoubleStar(true);
          if (reward.includes("stelle bonus")) { setTotalStars(s => s + 3); setSessionStars(s => s + 3); setCoins(c => c + 3); }
          setTimeout(() => setMysteryBox(null), 3500);
        }, 800);
      }
      return prev;
    });
  }
  function triggerBAD() {
    noteMiss(ch);
    navigator.vibrate?.([60, 30, 60]);
    SFX.wrong();
    setCombo(0); setAutoAdvancing(false); setCompMood("sad");
    setScreenFlash("bad"); setTimeout(() => setScreenFlash(null), 420);
    setTimeout(() => setCardAnim(""), 500);
    setCompAnim("wiggle"); setTimeout(() => setCompAnim("float"), 600);
    setTimeout(() => setCompMood("idle"), 1200);
  }

  function handlePause() {
    setPaused(true);
    setAutoAdvancing(false);
  }
  function handleResume() {
    setPaused(false);
    // Se l'utente aveva già risposto correttamente, avanza manualmente
    if (done && isCorrect) setTimeout(() => nextRef.current?.(), 350);
  }
  function handlePauseExit() {
    setPaused(false);
    stopMusic(); stopSong();
    navigate("map");
  }

  // Answer handlers
  function answerMC(idx, evt) {
    if (done) return;
    setSelected(idx);
    const ok  = idx === ch.correct;
    const pts = ch.isBoss ? 3 : young ? 1 : 2;
    const nc  = combo + 1;
    if (ok) {
      // [A5] Burst from tapped button position
      if (evt?.currentTarget) {
        const r = evt.currentTarget.getBoundingClientRect();
        setBurstPos({ x: r.left + r.width/2, y: r.top + r.height/2 });
        setTimeout(() => setBurstPos(null), 900);
      }
      triggerOK(pts); setSkills(s => addSkill(s, ch.type));
      setWrongStreak(0);
      if (comp) {
        const msg = nc >= 2 ? comp.onStreak() : comp.onCorrect();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
    } else {
      triggerBAD();
      setWrongIdx(idx); setTimeout(() => setWrongIdx(null), 520);
      setWrongStreak(w => w + 1);
      if (comp) {
        const msg = comp.onWrong();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
    }
    setResults(r => [...r, { type: ch.type, ok }]);
    setTimeout(() => setShowFeedback(true), 280);
  }
  function answerStory(choice) {
    if (storyChoice) return;
    setStoryChoice(choice); setSelected(0);
    const nc = combo + 1;
    if (choice.correct) {
      triggerOK(2); setSkills(s => addSkill(s, ch.type));
      setWrongStreak(0);
      if (comp) {
        const msg = nc >= 2 ? comp.onStreak() : comp.onCorrect();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
    } else {
      triggerBAD();
      setWrongStreak(w => w + 1);
      if (comp) {
        const msg = comp.onWrong();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
    }
    setResults(r => [...r, { type: ch.type, ok: choice.correct }]);
    setTimeout(() => setShowFeedback(true), 280);
  }
  function answerSeq(idx) {
    if (seqError || done) return;
    if (seqTaps.includes(idx)) return; // A2: guard double-tap on already-tapped item
    if (idx !== ch.correctOrder[seqTaps.length]) {
      setSeqError(true); triggerBAD();
      setWrongStreak(w => w + 1);
      if (comp) {
        const msg = comp.onWrong();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
      setTimeout(() => { setSeqTaps([]); setSeqError(false); }, 900);
      return;
    }
    SFX.tap();
    const next = [...seqTaps, idx];
    setSeqTaps(next);
    if (next.length === ch.items.length) {
      const nc = combo + 1;
      setSelected(999); triggerOK(2);
      setSkills(s => addSkill(s, ch.type));
      setResults(r => [...r, { type: ch.type, ok: true }]);
      setWrongStreak(0);
      if (comp) {
        const msg = nc >= 2 ? comp.onStreak() : comp.onCorrect();
        setFeedbackMsg(msg);
        setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400);
      }
      setTimeout(() => setShowFeedback(true), 280);
    }
  }

  function answerDrag(zoneIdx, itemIdx) {
    if (done) return;
    if (autoAdvancing) return; // O5: guard double-tap while advancing
    const pts = ch?.isBoss ? 3 : young ? 1 : 2;
    SFX.tap();
    if (dragPicked === null) {
      setDragPicked(itemIdx); return;
    }
    if (zoneIdx < 0) {
      // Tray tap: deselect if same item, reselect if different
      if (dragPicked === itemIdx) { setDragPicked(null); return; }
      setDragPicked(itemIdx); return;
    }
    // Place picked item into zone
    const newPlaced = { ...dragPlaced, [zoneIdx]: dragPicked };
    setDragPlaced(newPlaced);
    setDragPicked(null);
    // Check if all zones are filled
    if (Object.keys(newPlaced).length < ch.zones.length) return;
    // Evaluate: correctMapping[itemIdx] === zoneIdx for every placement
    const ok = ch.correctMapping.every(
      (expectedZone, itemI) => {
        const assignedZone = Object.entries(newPlaced).find(([z, it]) => Number(it) === itemI)?.[0];
        return assignedZone !== undefined && Number(assignedZone) === expectedZone;
      }
    );
    setSelected(ok ? 0 : 1);
    if (ok) {
      triggerOK(pts); setSkills(s => addSkill(s, ch.type));
      setWrongStreak(0);
      if (comp) { const msg = comp.onCorrect(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
      setTimeout(() => setShowFeedback(true), 280);
    } else {
      triggerBAD(); setWrongStreak(w => w + 1);
      if (comp) { const msg = comp.onWrong(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
      setTimeout(() => { setDragPlaced({}); setSelected(null); }, 1200);
    }
    setResults(r => [...r, { type: ch.type, ok }]);
  }

  function swapPuzzleTile(idx) {
    if (done || !puzzleGrid) return;
    const size = ch.size || 2;
    const emptyIdx = puzzleGrid.indexOf(-1);
    const row = Math.floor(emptyIdx / size), col = emptyIdx % size;
    const tRow = Math.floor(idx / size), tCol = idx % size;
    const isAdj = (Math.abs(row - tRow) === 1 && col === tCol) || (Math.abs(col - tCol) === 1 && row === tRow);
    if (!isAdj) return;
    SFX.tap();
    const newGrid = [...puzzleGrid];
    [newGrid[emptyIdx], newGrid[idx]] = [newGrid[idx], newGrid[emptyIdx]];
    setPuzzleGrid(newGrid);
    setPuzzleMoves(m => m + 1);
    // Victory check: emojis in order 0..n-1, hole at end
    const solved = newGrid.every((val, i) => val === -1 ? i === newGrid.length - 1 : val === i);
    if (solved) {
      setSelected(999);
      const pts = ch.isBoss ? 3 : young ? 1 : 2;
      triggerOK(pts); setSkills(s => addSkill(s, ch.type || "logica"));
      setWrongStreak(0);
      if (comp) { const msg = comp.onCorrect(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
      setResults(r => [...r, { type: ch.type || "logica", ok: true }]);
      setTimeout(() => setShowFeedback(true), 280);
    }
  }

  function next() {
    setAutoAdvancing(false); setBurstPos(null); setGuidedTap(false);
    setFeedbackMsg(""); setWrongStreak(0); setShowFeedback(false);
    setDragPicked(null); setDragPlaced({}); setWrongIdx(null); setScreenFlash(null); setComboPopup(null);
    if (ci < challenges.length - 1) {
      setCi(i => i + 1);
      setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({}); setMmFlipped([]); setMmMatched([]); setMmLocked(false); setColorZoneColors({}); setColorZonePicked(null); setPuzzleGrid(null); setPuzzleMoves(0);
    } else {
      const firstComplete = arc && !items.find(it => it.emoji === arc.reward_emoji);
      setIsFirstWorldComplete(!!firstComplete);
      if (firstComplete) {
        setItems(prev => [...prev, { emoji: arc.reward_emoji, name: arc.reward_name }]);
        // Celebration escalation: milestone sound per ogni nuovo frammento sigillo
        const isSignalloFragment = SIGILLO_FRAGMENTS.some(f => f.worldId === world?.id);
        if (isSignalloFragment) setTimeout(() => SFX.milestone(), 800);
      }
      // +5 monete bonus se tutte le risposte sono corrette
      const allPerfect = results.every(r => r.ok) && isCorrect;
      if (allPerfect) { setCoins(c => c + 5); setPerfectBonus(true); }
      else { setPerfectBonus(false); }
      const today = new Date().toISOString().slice(0, 10);
      if (world?.id === "daily") {
        setDailyCompletedDate(today);
        setTotalStars(s => s + 3);
        setSessionStars(s => s + 3);
        setCoins(c => c + 3);
        setDailyCount(d => d + 1);
      }
      // Log this session for parent report
      setSessionLog(prev => {
        const skillData = {};
        results.forEach(r => {
          const sk = getSkill(r.type);
          if (!skillData[sk]) skillData[sk] = { correct: 0, total: 0 };
          skillData[sk].total++;
          if (r.ok) skillData[sk].correct++;
        });
        const duration = sessionStart > 0 ? Math.max(1, Math.round((Date.now() - sessionStart) / 60000)) : 0;
        const entry = {
          date: today,
          stars: sessionStars + (world?.id === "daily" ? 3 : 0),
          world: world?.id || "?",
          correct: results.filter(r=>r.ok).length,
          total: results.length,
          duration,
          skillData,
        };
        return [...prev.slice(-59), entry]; // keep last 60 sessions
      });
      triggerConfetti(true);
      setCompMood("celebrating"); setTimeout(() => setCompMood("idle"), 3500);
      navigate("world_end");
    }
  }

  function navigate(newScreen) {
    const prev = prevScreenRef.current;
    const prevDepth = SCREEN_DEPTH[prev] ?? 4;
    const newDepth  = SCREEN_DEPTH[newScreen] ?? 4;
    if (!prev || newDepth === prevDepth) setScreenAnim("screen-enter");
    else if (newDepth > prevDepth)       setScreenAnim("screen-enter-fwd");
    else                                 setScreenAnim("screen-enter-bk");
    prevScreenRef.current = newScreen;
    setScreen(newScreen);
  }

  function startWorld(w) {
    if (!w.unlocked) return;
    const base = filterByAge(w.id, childAge || 5, skills); // selezione adattiva per skill
    if (!base.length) return;
    // SRS: anteponi fino a 2 sfide sbagliate in sessioni PRECEDENTI (ripasso spaziato).
    let list = base;
    const due = (missed || [])
      .filter(m => m.world === w.id && sessionLog.length > m.s)
      .map(m => (ALL_CHALLENGES[w.id] || []).find(c => c.id === m.id))
      .filter(Boolean)
      .slice(0, 2);
    if (due.length) {
      const present = new Set(base.map(c => c.id));
      const inject = due.filter(c => !present.has(c.id));
      if (inject.length) {
        list = [...inject, ...base];
        const injectedIds = new Set(inject.map(c => c.id));
        setMissed(prev => prev.filter(m => !injectedIds.has(m.id)));
      }
    }
    stopMusic(); stopSong();
    setWorld(w); setChallenges(list); setCi(0);
    setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({}); setColorZoneColors({}); setColorZonePicked(null); setPuzzleGrid(null); setPuzzleMoves(0);
    setFeedbackMsg(""); setWrongStreak(0); setShowFeedback(false);
    setSessionStars(0); setResults([]); setCombo(0); setSessionAlertShown(false); setShowSessionAlert(false);
    setCompMood("idle"); setCompTalking(false); setAutoAdvancing(false);
    setMysteryBox(null); setDoubleStar(false); setBurstPos(null); setGuidedTap(false); setBossHPAnimated(100);
    setSessionStart(Date.now());
    navigate((childAge || 5) <= 4 ? "coplay_intro" : "world_intro");
  }
  function startDaily() {
    const list = getDailyChallenges(childAge || 5, activeProfileId); // M6: per-profile daily
    if (!list.length) return;
    stopMusic(); stopSong();
    setWorld({ id:"daily", name:"Sfida del Giorno", emoji:"🌟", color:"#FFD95A", unlocked:true });
    setChallenges(list); setCi(0);
    setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({}); setColorZoneColors({}); setColorZonePicked(null); setPuzzleGrid(null); setPuzzleMoves(0);
    setFeedbackMsg(""); setWrongStreak(0); setShowFeedback(false);
    setSessionStars(0); setResults([]); setCombo(0);
    setCompMood("idle"); setCompTalking(false); setAutoAdvancing(false);
    setMysteryBox(null); setDoubleStar(false); setBurstPos(null); setGuidedTap(false); setBossHPAnimated(100);
    setSessionStart(Date.now());
    navigate((childAge||5)<=4?"coplay_intro":"world_intro"); // A8
  }

  function applyProfile(p) {
    setActiveProfileId(p.id);
    if (p.childName)                      setChildName(p.childName);
    if (p.childAge)                       setChildAge(p.childAge);
    if (p.companion)                      setCompanion(p.companion);
    if (typeof p.totalStars === 'number') setTotalStars(p.totalStars);
    if (p.skills)                         setSkills(p.skills);
    if (p.items)                          setItems(p.items);
    if (p.missionsDone)                   setMissionsDone(p.missionsDone);
    if (p.dailyCompletedDate)             setDailyCompletedDate(p.dailyCompletedDate);
    if (p.achievements)                   setAchievements(p.achievements);
    if (p.dailyCount)                     setDailyCount(p.dailyCount);
    if (p.equippedCosmetic)               setEquippedCosmetic(p.equippedCosmetic);
    if (p.sessionLog)                     setSessionLog(p.sessionLog);
    if (p.missed)                         setMissed(p.missed);
    if (typeof p.coins === 'number')      setCoins(p.coins);
    if (p.ownedCosmetics)                 setOwnedCosmetics(p.ownedCosmetics);
    if (p.schoolMode)                     setSchoolMode(p.schoolMode);
    if (p.schoolCode)                     setSchoolCode(p.schoolCode);
    if (p.schoolAssigned)                 setSchoolAssigned(p.schoolAssigned);
    const today = new Date().toISOString().slice(0,10);
    if (p.lastDate) {
      const diff = Math.floor((parseDateLocal(today) - parseDateLocal(p.lastDate)) / 86400000);
      const newStreak = diff === 0 ? (p.streak||1) : diff === 1 ? (p.streak||0)+1 : 1;
      setStreak(newStreak);
      if (diff === 1 && newStreak >= 3) {
        if (newStreak % 7 === 0 || newStreak === 3) {
          setStreakCelebrate(true);
          setTimeout(() => SFX.milestone(), 400);
        }
      }
    }
    setIsReturning(true);
    navigate('map');
  }
  function selectProfile(id) {
    const p = allProfiles.find(pr => pr.id === id);
    if (p) applyProfile(p);
  }
  function startNewProfile() {
    setActiveProfileId(uid());
    setChildName(''); setChildAge(null); setCompanion(null);
    setTotalStars(0); setSkills(initSkills()); setItems([]); setMissed([]);
    setCombo(0); setResults([]); setStreak(1);
    setMissionsDone([]); setDailyCompletedDate('');
    setAchievements([]); setDailyCount(0);
    setEquippedCosmetic({}); setSessionLog([]);
    setSchoolMode(false); setSchoolCode(""); setSchoolAssigned([]);
    setCoins(0); setOwnedCosmetics([]);
    setIsReturning(false);
    navigate('name');
  }

  const isCorrect =
    ch?.format === "story_choice"  ? storyChoice?.correct :
    ch?.format === "sequence_tap" || ch?.format === "code_sequence" ? selected === 999 :
    ch?.format === "drag_drop"     ? selected === 0 :
    ch?.format === "memory_match"  ? selected === 999 :
    ch?.format === "color_zones"   ? selected === 999 :
    ch?.format === "puzzle_swap"   ? selected === 999 :
    selected === ch?.correct;

  const progressPct = challenges.length ? ((ci + 1) / challenges.length) * 100 : 0;

  // Android hardware/gesture back button — navigate instead of closing PWA
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onPop = () => {
      window.history.pushState(null, '', window.location.href);
      if (screen === "challenge") setExitConfirm(true);
      else if (["consent","profile_select","name","age","companion","companion_welcome"].includes(screen)) { /* no-op on onboarding */ }
      else if (screen === "map") { /* already home */ }
      else navigate("map");
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [screen]); // eslint-disable-line

  // Keyboard awareness on name screen (prevent layout shift on iOS/Android)
  useEffect(() => {
    if (screen !== "name") return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      document.documentElement.style.setProperty('--vvh', `${vv.height}px`);
    };
    vv.addEventListener('resize', onResize);
    onResize();
    return () => {
      vv.removeEventListener('resize', onResize);
      document.documentElement.style.removeProperty('--vvh');
    };
  }, [screen]);

  // Load on mount: check consent → profiles → migrate legacy save
  useEffect(() => {
    if (!localStorage.getItem('mondomago_consent')) { navigate('consent'); return; }
    if (localStorage.getItem('mondomago_tutorial')) setTutorialSeen(true);
    const profiles = loadAllProfiles();
    if (profiles.length > 0) {
      setAllProfiles(profiles);
      if (profiles.length === 1) {
        applyProfile(profiles[0]);
      } else {
        navigate('profile_select');
      }
      return;
    }
    // Migrate legacy single-profile save
    const s = loadSave();
    if (s && s.childName && s.childAge && s.companion) {
      const newId = uid();
      const migrated = { id: newId, ...s };
      writeAllProfiles([migrated]);
      setAllProfiles([migrated]);
      applyProfile(migrated);
      return;
    }
    // Fresh install — already on 'name' screen
  }, []); // eslint-disable-line

  // Auto-save profile on any progress change
  useEffect(() => {
    if (!childName || !childAge || !companion || !activeProfileId) return;
    const today = new Date().toISOString().slice(0,10);
    const data = { id: activeProfileId, childName, childAge, companion, totalStars, skills, items, streak, missionsDone, dailyCompletedDate, lastDate: today, achievements, dailyCount, equippedCosmetic, sessionLog, missed, schoolMode, schoolCode, schoolAssigned, coins, ownedCosmetics };
    setAllProfiles(prev => {
      const updated = prev.some(p => p.id === activeProfileId)
        ? prev.map(p => p.id === activeProfileId ? data : p)
        : [...prev, data];
      writeAllProfiles(updated);
      return updated;
    });
  }, [childName, childAge, companion, totalStars, skills, items, streak, missionsDone, dailyCompletedDate, achievements, dailyCount, equippedCosmetic, sessionLog, missed, schoolMode, schoolCode, schoolAssigned, coins, ownedCosmetics]); // eslint-disable-line

  // Achievement check
  useEffect(() => {
    if (!childName || !activeProfileId) return;
    const fresh = checkNewAchievements(achievements, { totalStars, results, items, streak, combo, missionsDone, skills, dailyCount });
    if (!fresh.length) return;
    setAchievements(a => [...a, ...fresh]);
    setNewAchievements(fresh);
    SFX.achievement();
    setTimeout(() => setNewAchievements([]), 3500);
  }, [totalStars, results, items, streak, combo, missionsDone, skills, dailyCount]); // eslint-disable-line

  // Level-up check
  useEffect(() => {
    if (!childName || !activeProfileId) return;
    const current = getLevel(totalStars);
    if (lastKnownLevel && lastKnownLevel !== current.title) {
      setNewLevel(current);
      SFX.levelUp();
      triggerConfetti(true);
    }
    setLastKnownLevel(current.title);
  }, [totalStars]); // eslint-disable-line

  // Seasonal theme — set once on mount
  useEffect(() => { setSeason(getCurrentSeason()); }, []);

  // Always keep nextRef current so the auto-advance closure never goes stale
  nextRef.current = next;

  // [C1+A1+A3] Auto-advance on correct answer — uses ref to avoid stale closure; youngBg gets longer delay
  useEffect(() => {
    if (screen !== "challenge" || !autoAdvancing) return;
    if (advancingRef.current) return;
    advancingRef.current = true;
    const delay = young ? 3000 : 1550;
    const t = setTimeout(() => { advancingRef.current = false; setAutoAdvancing(false); nextRef.current?.(); }, delay); // eslint-disable-line
    return () => { clearTimeout(t); advancingRef.current = false; };
  }, [autoAdvancing, screen]); // eslint-disable-line

  // [B1] Boss HP bar animation — animates to target value on entering boss challenge
  useEffect(() => {
    if (!ch?.isBoss) return;
    const sessionCorrect = results.filter(r => r.ok).length;
    const target = Math.max(20, 100 - sessionCorrect * 18);
    setBossHPAnimated(100);
    const t = setTimeout(() => setBossHPAnimated(target), 200);
    return () => clearTimeout(t);
  }, [ch?.id]); // eslint-disable-line

  // [B4] Guided tap — show hand on very first challenge ever
  useEffect(() => {
    if (screen === "challenge" && ci === 0 && !tutorialSeen && !done) {
      const t = setTimeout(() => setGuidedTap(true), 1800);
      return () => clearTimeout(t);
    } else {
      setGuidedTap(false);
    }
  }, [screen, ci, done, tutorialSeen]); // eslint-disable-line

  // Companion alive on map — cycles expressions every ~9s to feel "live"
  useEffect(() => {
    if (screen !== "map") return;
    const moods = ["happy", "thinking", "idle", "idle"];
    const id = setInterval(() => {
      const m = moods[Math.floor(Math.random() * moods.length)];
      setCompMood(m);
      setTimeout(() => setCompMood("idle"), 1600);
    }, 8500 + Math.random() * 2000);
    return () => clearInterval(id);
  }, [screen]); // eslint-disable-line

  // Companion "thinking" mood when a new challenge loads, returns to idle after 1.8s
  useEffect(() => {
    if (screen !== "challenge" || done) return;
    setCompMood("thinking");
    const t = setTimeout(() => setCompMood("idle"), 1800);
    return () => clearTimeout(t);
  }, [screen, ci]); // eslint-disable-line

  // Companion idle ambient — periodic expression change while waiting for answer
  useEffect(() => {
    if (screen !== "challenge" || done) return;
    const delay = 10000 + Math.random() * 4000;
    const id = setInterval(() => {
      setCompMood(m => {
        if (m !== "idle") return m;
        setTimeout(() => setCompMood(cur => cur === "thinking" ? "idle" : cur), 1500);
        return "thinking";
      });
    }, delay);
    return () => clearInterval(id);
  }, [screen, ci, done]); // eslint-disable-line


  // Notify when coins cross a cosmetic's coinCost for the first time
  useEffect(() => {
    if (!childName || !activeProfileId) return;
    const newlyAffordable = COSMETICS.filter(c =>
      !ownedCosmetics.includes(c.id) && coins >= c.coinCost && (coins - 2) < c.coinCost
    );
    if (!newlyAffordable.length) return;
    setNewCosmetics([newlyAffordable[0].id]);
    SFX.achievement();
    setTimeout(() => setNewCosmetics([]), 4000);
  }, [coins]); // eslint-disable-line

  // [C1] Sfida Fulmine — countdown timer
  useEffect(() => {
    if (screen !== "fulmine" || !fulminoRunning) return;
    if (fulminoTime <= 0) {
      setFulminoRunning(false); return;
    }
    const t = setInterval(() => setFulminoTime(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [screen, fulminoRunning, fulminoTime]);

  // Load parent settings (PIN + time limit) — survives game resets
  useEffect(() => {
    const p = loadParent();
    if (!p) return;
    if (p.pin)        setPinSaved(p.pin);
    if (p.timeLimit)  setTimeLimit(p.timeLimit);
    if (p.notifTime)  setNotifTime(p.notifTime);
  }, []);

  // Save parent settings when they change
  useEffect(() => {
    writeParent({ pin: pinSaved, timeLimit, notifTime });
  }, [pinSaved, timeLimit, notifTime]);

  // Sync ttsEnabled to module-level flag
  useEffect(() => {
    _ttsEnabled = ttsEnabled;
    localStorage.setItem('mondomago_tts', ttsEnabled ? '1' : '0');
  }, [ttsEnabled]);

  // Applica le preferenze di accessibilità a <html> e le persiste
  useEffect(() => {
    const el = document.documentElement;
    el.setAttribute('data-reduce-motion', a11y.reducedMotion ? '1' : '0');
    el.setAttribute('data-contrast', a11y.highContrast ? 'high' : 'normal');
    el.setAttribute('data-dyslexia', a11y.dyslexiaFont ? '1' : '0');
    el.setAttribute('data-text-scale', a11y.textScale || 'md');
    try { localStorage.setItem('mondomago_a11y', JSON.stringify(a11y)); } catch {}
  }, [a11y]);

  // Scheduled notification check — runs every minute when page is visible
  useEffect(() => {
    const NOTIF_KEY = 'mondomago_lastNotif_v1';
    function checkAndNotify() {
      if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);
      const lastNotif = localStorage.getItem(NOTIF_KEY) || '';
      if (lastNotif === todayStr) return; // already notified today
      const [hh, mm] = notifTime.split(':').map(Number);
      const notifMinutes = hh * 60 + mm;
      const nowMinutes   = now.getHours() * 60 + now.getMinutes();
      if (nowMinutes < notifMinutes) return; // not yet time
      // Check if user played today
      const playedToday = sessionLog.some(s => s.date === todayStr);
      if (playedToday) { localStorage.setItem(NOTIF_KEY, todayStr); return; }
      // Show notification
      const msg = streak >= 3
        ? `🔥 Streak di ${streak} giorni! Non dimenticare di giocare oggi per mantenerla!`
        : `✨ La sfida del giorno ti aspetta! Guadagna 3 stelle bonus oggi.`;
      try {
        new Notification('MondoMago 🧙‍♂️', {
          body: msg,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'mondomago-daily',
        });
      } catch {}
      localStorage.setItem(NOTIF_KEY, todayStr);
    }
    checkAndNotify(); // immediate check
    const id = setInterval(checkAndNotify, 60000); // check every minute
    return () => clearInterval(id);
  }, [notifTime, sessionLog, streak]);

  // PIN check: when 4 digits entered in parent screen, verify or set
  useEffect(() => {
    if (screen !== "parent" || parentUnlocked || pinInput.length !== 4) return;
    if (!pinSaved) {
      setPinSaved(pinInput); setPinInput(""); setParentUnlocked(true);
    } else if (pinInput === pinSaved) {
      setPinInput(""); setParentUnlocked(true);
    } else {
      setPinError(true);
      setTimeout(() => { setPinInput(""); setPinError(false); }, 700);
    }
  }, [pinInput, screen, parentUnlocked, pinSaved]);

  // Reset parent unlock when leaving parent screen
  useEffect(() => {
    if (screen !== "parent") setParentUnlocked(false);
  }, [screen]);

  // Tick every 30s for session timer + session intelligence
  useEffect(() => {
    if (!sessionStart) return;
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [sessionStart]);

  // Session intelligence: proactive rest reminder after 8 minutes
  const [sessionAlertShown, setSessionAlertShown] = useState(false);
  const [showSessionAlert, setShowSessionAlert] = useState(false);
  useEffect(() => {
    if (!sessionStart || sessionAlertShown || screen !== "challenge") return;
    const elapsed = (Date.now() - sessionStart) / 60000;
    if (elapsed >= 8) {
      setShowSessionAlert(true);
      setSessionAlertShown(true);
      SFX.sessionChime();
      setTimeout(() => setShowSessionAlert(false), 5000);
    }
  }, [nowTick, sessionStart, sessionAlertShown, screen]); // eslint-disable-line

  // Pre-load voices so getBestVoice() has data on first speak()
  useEffect(() => {
    if (!window?.speechSynthesis) return;
    const refresh = () => { _bestVoice = undefined; };
    window.speechSynthesis.addEventListener('voiceschanged', refresh);
    window.speechSynthesis.getVoices();
    return () => window.speechSynthesis.removeEventListener('voiceschanged', refresh);
  }, []);

  // Auto-TTS + screen SFX
  useEffect(() => {
    _onSongTick = setSongLyric;
    if (screen === "consent") {
      setTimeout(() => speak("Ciao genitore! MondoMago è pronto per voi.", 0.82), 600);
      return;
    }
    if (screen === "name") { setTimeout(() => speak("Come ti chiami?", 0.8), 300); return; }
    if (screen === "age")  { setTimeout(() => speak(`Benvenuto ${childName || ""}! Quanti anni hai?`, 0.8), 300); return; }
    if (screen === "companion") {
      setTimeout(() => speak("Scegli il tuo compagno magico!", 0.8), 400); return;
    }
    if (screen === "companion_welcome") {
      const cw = COMPANIONS.find(c => c.id === companion);
      if (cw?.onMeet) setTimeout(() => speak(cw.onMeet(childName || "amico"), 0.82), 700);
      return;
    }
    if (screen === "challenge") {
      const c = challenges[ci];
      if (!c) return;
      if (c.isBoss) SFX.boss();
      const autoText = c.format === "story_choice" ? c.situation
        : c.format === "word_picture" ? `Trova l'immagine per la parola: ${c.word}`
        : c.format === "rhyme_complete" ? c.prompt.replace("___", "...")
        : c.id?.startsWith("ba_") ? `Quale immagine inizia con la lettera ${c.id.replace("ba_","")}?`
        : c.prompt;
      speak(autoText);
    } else if (screen === "world_intro" && arc) {
      startMusic(world?.id);
      startSong(world?.id);
      speak(arc.intro_text, 0.8);
    } else if (screen === "coplay_intro") {
      startMusic(world?.id);
      startSong(world?.id);
      speak(`Ciao! Siediti vicino a ${childName} e aiutalo a giocare. Leggi le domande ad alta voce e toccate le risposte insieme!`, 0.8);
    } else if (screen === "world_end") {
      stopMusic(); stopSong();
      SFX.victory();
      triggerConfetti(true);
      if (arc) setTimeout(() => speak(arc.outro, 0.85), 1400);
    } else if (screen === "map" || screen === "session_stats") {
      stopMusic(); stopSong();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, ci]);

  // Leggi il titolo della slide onboarding quando cambia
  useEffect(() => {
    if (screen !== "onboarding") return;
    const titles = [
      "Benvenuto in MondoMago! Il gioco educativo per bambini da tre a otto anni.",
      "Sfide che fanno crescere! Calibrate per la tua età, sempre nuove.",
      "Guadagna stelle e premi! Sblocca nuovi mondi e personalizza il tuo compagno.",
    ];
    const t = setTimeout(() => speak(titles[obSlide] || titles[0], 0.82), 400);
    return () => clearTimeout(t);
  }, [screen, obSlide]); // eslint-disable-line

  const G = (
    <>
      <AnimationStyles />
      <InstallBanner screen={screen} />
      {newAchievements.length > 0 && (() => {
        const a = ACHIEVEMENTS.find(x => x.id === newAchievements[0]);
        return (
          <div style={{position:"fixed",bottom:32,left:0,right:0,display:"flex",justifyContent:"center",zIndex:600,pointerEvents:"none"}}>
            <div className="slide-up" style={{background:"linear-gradient(135deg,#1e1e3a,#2d2d5e)",border:"2px solid #A78BFA",borderRadius:24,padding:"14px 22px",display:"flex",alignItems:"center",gap:12,maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
              <span style={{fontSize:34}}>{a?.emoji}</span>
              <div>
                <div style={{fontFamily:FF,fontSize:13,color:"#A78BFA"}}>OBIETTIVO SBLOCCATO!</div>
                <div style={{fontFamily:FF,fontSize:16,color:"white"}}>{a?.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{a?.desc}</div>
              </div>
            </div>
          </div>
        );
      })()}
      {newLevel && (
        <div onClick={() => setNewLevel(null)} style={{position:"fixed",inset:0,background:"radial-gradient(120% 90% at 50% 38%, rgba(45,27,84,.92), rgba(10,6,25,.96))",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer"}}>
          <div className="pop-in" style={{background:SG_BG,border:`2px solid ${SG_GOLD}`,borderRadius:28,padding:"30px 26px 26px",textAlign:"center",maxWidth:334,width:"100%",boxShadow:"0 0 70px rgba(255,194,75,.35), inset 0 0 44px rgba(255,194,75,.06)",position:"relative"}}>
            <div style={{fontFamily:FF_MONO,fontSize:12,letterSpacing:3,color:SG_RUNE,textTransform:"uppercase",marginBottom:16}}>Nuovo livello</div>
            {/* Sigillo che si accende: anelli runici + stelle in orbita + disco d'oro */}
            <div style={{position:"relative",width:150,height:150,margin:"0 auto 16px",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div className="seal-ring" style={{position:"absolute",inset:0,borderRadius:"50%",border:`2px dashed rgba(255,194,75,.4)`}} />
              <div className="seal-ring-rev" style={{position:"absolute",inset:15,borderRadius:"50%",border:`1px solid rgba(109,224,198,.4)`}} />
              {[0,1,2,3].map(i => (
                <div key={i} style={{position:"absolute",top:"50%",left:"50%",width:6,height:6,marginLeft:-3,marginTop:-3,borderRadius:"50%",background:i%2?SG_RUNE:SG_GOLD,boxShadow:`0 0 8px ${i%2?SG_RUNE:SG_GOLD}`,animation:`orbitSpin ${7+i}s linear infinite`,animationDelay:`${i*.5}s`}} />
              ))}
              <div className="glow" style={{width:94,height:94,borderRadius:"50%",background:"radial-gradient(circle at 50% 34%, #FFE7A6, #FFC24B 55%, #E7972B)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:52,boxShadow:"inset 0 -6px 14px rgba(120,60,0,.35), inset 0 5px 11px rgba(255,255,255,.6)"}}>{newLevel.emoji}</div>
            </div>
            <div style={{fontFamily:FF_DISPLAY,fontSize:34,color:SG_GOLD,lineHeight:1.05,marginBottom:4}}>{newLevel.title}</div>
            <div style={{fontFamily:FF_MONO,fontSize:13,color:SG_PARCH,opacity:.65,marginBottom:18}}>{totalStars} ⭐ raccolte</div>
            {comp && (
              <div style={{display:"flex",alignItems:"center",gap:12,background:SG_CARD,border:SG_BR,borderRadius:18,padding:"11px 14px",marginBottom:22,textAlign:"left"}}>
                <div className="bounce" style={{flexShrink:0}}><CompanionAvatar c={comp} size={44} /></div>
                <span style={{fontSize:14,color:SG_PARCH,lineHeight:1.4}}>Che magia, {childName}! Ora sei <b style={{color:SG_GOLD}}>{newLevel.title}</b>. Continuiamo insieme!</span>
              </div>
            )}
            <button onClick={() => setNewLevel(null)} style={{fontFamily:FF_DISPLAY,background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"14px 40px",fontSize:19,fontWeight:800,cursor:"pointer",boxShadow:"0 6px 20px rgba(255,194,75,.4)"}}>
              Continua! ✨
            </button>
          </div>
        </div>
      )}
      {newCosmetics.length > 0 && (() => {
        const c = COSMETICS.find(x => x.id === newCosmetics[0]);
        return (
          <div style={{position:"fixed",bottom:88,left:0,right:0,display:"flex",justifyContent:"center",zIndex:601,pointerEvents:"none"}}>
            <div className="slide-up" style={{background:"linear-gradient(135deg,#1a0f2e,#2d1b50)",border:"2px solid #C084FC",borderRadius:24,padding:"14px 22px",display:"flex",alignItems:"center",gap:12,maxWidth:340,boxShadow:"0 8px 32px rgba(192,132,252,.3)"}}>
              <span style={{fontSize:34}}>{c?.emoji}</span>
              <div>
                <div style={{fontFamily:FF,fontSize:13,color:"#C084FC"}}>PUOI ACQUISTARLO! 💎</div>
                <div style={{fontFamily:FF,fontSize:16,color:"white"}}>{c?.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Vai in ✨ Personalizza!</div>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Streak milestone celebration */}
      {streakCelebrate && (
        <div onClick={() => setStreakCelebrate(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:710,display:"flex",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer"}}>
          <div className="pop-in" style={{background:"linear-gradient(135deg,#7C2D12,#B45309,#92400E)",border:"2px solid #FCD34D",borderRadius:28,padding:"36px 28px",textAlign:"center",maxWidth:320,boxShadow:"0 0 80px rgba(252,211,77,.4), 0 20px 60px rgba(0,0,0,.6)"}}>
            <div style={{fontSize:72,marginBottom:4,animation:"wiggle 0.6s ease-in-out infinite"}}>🔥</div>
            <div style={{fontFamily:FF,fontSize:15,color:"#FCD34D",marginBottom:8}}>STREAK DA CAMPIONE!</div>
            <div style={{fontFamily:FF,fontSize:40,color:"white",marginBottom:4}}>{streak} giorni</div>
            <div style={{fontFamily:FF,fontSize:18,color:"#FCD34D",marginBottom:6}}>di fila!</div>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:14,marginBottom:24,lineHeight:1.6}}>Sei incredibile! Continua così ogni giorno!</p>
            <button onClick={() => setStreakCelebrate(false)} style={{fontFamily:FF,background:"#FCD34D",color:"#1a1a2e",border:"none",borderRadius:50,padding:"14px 40px",fontSize:18,cursor:"pointer"}}>
              Continuo! 🔥
            </button>
          </div>
        </div>
      )}
      {/* [B2] Mystery box reward */}
      {mysteryBox && (
        <div style={{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:650,pointerEvents:"none"}}>
          <div style={{animation:"mysteryOpen .45s cubic-bezier(.34,1.56,.64,1) both",background:"linear-gradient(135deg,#78350f,#92400e)",border:"3px solid #FCD34D",borderRadius:28,padding:"24px 32px",textAlign:"center",boxShadow:"0 0 50px rgba(252,211,77,.5), 0 20px 60px rgba(0,0,0,.6)",maxWidth:300}}>
            <div style={{fontSize:52,marginBottom:8}}>🎁</div>
            <div style={{color:"#FCD34D",fontWeight:900,fontSize:13,letterSpacing:1,marginBottom:6}}>MYSTERY BOX!</div>
            <div style={{color:"white",fontWeight:800,fontSize:18,lineHeight:1.3}}>{mysteryBox}</div>
          </div>
        </div>
      )}
      {/* [A5] Correct burst particles */}
      <CorrectBurst pos={burstPos} particles={world ? (WORLD_PARTICLES[world.id] || ["⭐","✨","💫"]) : ["⭐","✨","💫"]} />
      {/* Screen flash overlay — green on correct, red on wrong */}
      {screenFlash && (
        <div style={{
          position:"fixed", inset:0, zIndex:490, pointerEvents:"none",
          background: screenFlash === "ok" ? "#22C55E" : "#EF4444",
          animation: screenFlash === "ok" ? "screenFlashOk .42s ease-out both" : "screenFlashBad .42s ease-out both",
        }} />
      )}
      {/* Combo milestone popup */}
      {comboPopup && (
        <div style={{position:"fixed",inset:0,zIndex:510,pointerEvents:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{
            fontFamily:"Fredoka One, Nunito, sans-serif",
            fontSize: youngBg ? 36 : 42,
            fontWeight:900,
            color:"white",
            textShadow:"0 4px 20px rgba(0,0,0,.55), 0 0 40px rgba(249,115,22,.7)",
            animation:"comboZoom 1.7s cubic-bezier(.34,1.56,.64,1) both",
            background:"rgba(0,0,0,.35)",
            borderRadius:28,
            padding:"16px 32px",
            letterSpacing:1,
          }}>{comboPopup}</div>
        </div>
      )}
      {/* [B4] Guided hand — first challenge ever */}
      {guidedTap && ch && (ch.format === "multiple_choice" || ch.format === "visual_tap") && (
        <div style={{position:"fixed",bottom:"12%",left:"50%",transform:"translateX(-50%)",zIndex:800,pointerEvents:"none",textAlign:"center",userSelect:"none"}}>
          {/* target pulse ring */}
          <div style={{position:"absolute",top:"30%",left:"50%",width:80,height:80,borderRadius:"50%",
            border:"3px solid rgba(167,139,250,.9)",marginLeft:-40,marginTop:-40,
            animation:"tapRipple 1.1s ease-out infinite"}} />
          <div style={{position:"absolute",top:"30%",left:"50%",width:80,height:80,borderRadius:"50%",
            border:"2px solid rgba(167,139,250,.5)",marginLeft:-40,marginTop:-40,
            animation:"tapRipple 1.1s ease-out infinite",animationDelay:".4s"}} />
          {/* hand descending + tapping */}
          <div style={{
            fontSize:64,
            animation:"tapGesture 1.3s cubic-bezier(.34,1.56,.64,1) infinite",
            display:"inline-block",
            filter:"drop-shadow(0 6px 18px rgba(167,139,250,1)) drop-shadow(0 2px 6px rgba(0,0,0,.5))",
            position:"relative",zIndex:1,
            marginBottom:4,
          }}>
            👆
          </div>
          <div style={{
            background:"rgba(124,58,237,.92)",backdropFilter:"blur(8px)",
            borderRadius:24,padding:"8px 22px",marginTop:4,color:"white",
            fontSize:youngBg?16:14,fontFamily:FF,fontWeight:800,
            border:"2px solid rgba(167,139,250,.6)",
            boxShadow:"0 4px 20px rgba(124,58,237,.5)",
            display:"inline-block",animation:"pulse 1.8s ease-in-out infinite",
          }}>
            👆 Tocca una risposta!
          </div>
        </div>
      )}
    </>
  );

  // ════════════════════ SCREEN: CONSENT ════════════════════════════════════
  if (screen === "consent") return (
    <div key="consent" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:SG_PARCH,padding:28,paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      {G}
      <div className="float" style={{fontSize:72,marginBottom:16}}>👨‍👩‍👧</div>
      <h1 style={{fontFamily:FF_DISPLAY,fontSize:26,fontWeight:900,marginBottom:10,color:SG_GOLD}}>Ciao, genitore!</h1>
      <div style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"18px 22px",maxWidth:380,marginBottom:28,fontSize:14,lineHeight:1.8,textAlign:"left"}}>
        <div style={{marginBottom:8}}>🎮 App educativa per bambini <strong>3–8 anni</strong></div>
        <div style={{marginBottom:8}}>🔒 <strong>Nessun dato personale</strong> raccolto o trasmesso</div>
        <div style={{marginBottom:8}}>🚫 <strong>Nessuna pubblicità</strong> — zero acquisti in-app</div>
        <div>💾 I progressi sono salvati solo <strong>su questo dispositivo</strong></div>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,cursor:"pointer",fontSize:13,opacity:.85,maxWidth:340,textAlign:"left"}}>
        <input type="checkbox" checked={consentChecked} onChange={e => setConsentChecked(e.target.checked)}
          aria-label="Confermo di essere un adulto responsabile dell'utilizzo dell'app"
          style={{width:18,height:18,accentColor:SG_GOLD,flexShrink:0}} />
        Confermo di essere un adulto e di essere il responsabile dell'utilizzo di questa app da parte del bambino.
      </label>
      <button onClick={() => { if(!consentChecked) return; warmUpAudio(); localStorage.setItem('mondomago_consent','1'); navigate('onboarding'); }}
        style={{background:consentChecked?SG_GOLD_GRAD:"rgba(255,255,255,.15)",border:"none",color:consentChecked?SG_INK:"rgba(255,255,255,.6)",borderRadius:50,padding:"16px 44px",fontWeight:900,fontSize:18,cursor:consentChecked?"pointer":"default",marginBottom:14,boxShadow:consentChecked?"0 8px 32px rgba(255,194,75,.35)":"none",transition:"all .3s",opacity:consentChecked?1:.5}}>
        Inizia! ✨
      </button>
      <p style={{fontSize:11,opacity:.35,maxWidth:320}}>Nessun dato personale viene raccolto — tutto rimane sul dispositivo.</p>
    </div>
  );

  // ════════════════════ SCREEN: PROFILE SELECT ══════════════════════════════
  if (screen === "profile_select") return (
    <div key="profile_select" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:SG_PARCH,padding:28,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:60}}>
      {G}
      <div className="float" style={{fontSize:56,marginBottom:12}}>👋</div>
      <h2 style={{fontFamily:FF_DISPLAY,fontSize:30,marginBottom:4,color:SG_GOLD}}>Chi gioca oggi?</h2>
      <p style={{opacity:.75,fontSize:14,marginBottom:32}}>Scegli il tuo profilo</p>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:12}}>
        {allProfiles.map((p, i) => {
          const lvl = getLevel(p.totalStars || 0);
          const ageLabel = (p.childAge||5) <= 4 ? "3–4" : (p.childAge||5) <= 6 ? "5–6" : "7–8";
          return (
            <button key={p.id} onClick={() => selectProfile(p.id)} className="slide-up"
              style={{background:SG_CARD,border:SG_BR,borderRadius:22,padding:"16px 20px",color:SG_PARCH,cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",animationDelay:`${i*.08}s`,boxShadow:"0 4px 16px rgba(0,0,0,.25)"}}>
              <div style={{fontSize:40}}>{lvl.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontFamily:FF_DISPLAY,fontSize:20,color:SG_GOLD}}>{p.childName}</div>
                <div style={{fontFamily:FF_MONO,fontSize:12,opacity:.75}}>{lvl.title} · {p.totalStars||0} ⭐ · età {ageLabel}</div>
              </div>
              <span style={{fontSize:22,color:SG_GOLD,opacity:.8}}>→</span>
            </button>
          );
        })}
        {allProfiles.length < 4 && (
          <button onClick={startNewProfile} className="slide-up"
            style={{background:"rgba(255,255,255,.05)",border:"2px dashed rgba(255,194,75,.35)",borderRadius:22,padding:"16px 20px",color:SG_PARCH,cursor:"pointer",display:"flex",alignItems:"center",gap:14,animationDelay:`${allProfiles.length*.08}s`}}>
            <div style={{fontSize:40}}>➕</div>
            <div style={{fontWeight:700,fontSize:16}}>Nuovo giocatore</div>
          </button>
        )}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: ONBOARDING (K5) ════════════════════════════
  if (screen === "onboarding") {
    const OB = [
      {
        bg:    SG_BG,
        icon:  "✨",
        title: "Benvenuto in MondoMago!",
        sub:   "Il viaggio magico che fa crescere i bambini",
        body: (
          <div style={{display:"flex",gap:10,justifyContent:"center",margin:"20px 0 16px",flexWrap:"wrap"}}>
            {COMPANIONS.map(c => <CompanionAvatar key={c.id} c={c} size={60} anim="float" mood="happy" />)}
          </div>
        ),
        pills: ["3–8 anni","100% offline","Zero pubblicità"],
      },
      {
        bg:    "radial-gradient(125% 85% at 50% -8%, #16342B 0%, #14243A 45%, #140B29 100%)",
        icon:  "🧠",
        title: "Sfide che fanno crescere!",
        sub:   "Calibrate per la tua età, sempre nuove",
        body: (
          <div style={{display:"flex",flexWrap:"wrap",gap:10,justifyContent:"center",margin:"20px 0 16px",maxWidth:320}}>
            {[["🔢","Numeri"],["📝","Lettura"],["🎵","Ritmo"],["🖼️","Immagini"],["🧠","Logica"]].map(([e,l]) => (
              <div key={l} style={{background:SG_CARD,border:"1px solid rgba(109,224,198,.28)",borderRadius:16,padding:"10px 14px",fontSize:13,fontWeight:700,display:"flex",flexDirection:"column",alignItems:"center",gap:4,minWidth:72}}>
                <span style={{fontSize:28}}>{e}</span>{l}
              </div>
            ))}
          </div>
        ),
        pills: null,
      },
      {
        bg:    "radial-gradient(125% 85% at 50% -8%, #3A2A12 0%, #241546 48%, #140B29 100%)",
        icon:  "🏆",
        title: "Guadagna stelle e premi!",
        sub:   "Sblocca mondi e personalizza il tuo compagno",
        body: (
          <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0 16px"}}>
            {[["⭐","Stelle"],["🏆","Trofei"],["✨","Costumi"],["🗺️","Mondi"]].map(([e,l]) => (
              <div key={l} style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"14px 12px",textAlign:"center",minWidth:64}}>
                <div style={{fontSize:32,marginBottom:4}}>{e}</div>
                <div style={{fontSize:11,fontWeight:700,opacity:.8}}>{l}</div>
              </div>
            ))}
          </div>
        ),
        pills: null,
      },
    ];
    const sl = OB[obSlide];
    return (
      <div key="onboarding" className={screenAnim}
        style={{minHeight:"100dvh",background:sl.bg,color:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"44px 28px",paddingBottom:"max(env(safe-area-inset-bottom,0px),44px)",textAlign:"center"}}
        onTouchStart={e => { obTouchRef.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          const dx = e.changedTouches[0].clientX - obTouchRef.current;
          if (dx < -50 && obSlide < 2) setObSlide(s => s+1);
          else if (dx > 50 && obSlide > 0) setObSlide(s => s-1);
        }}>
        {G}
        <div style={{alignSelf:"flex-end"}}>
          <button onClick={() => navigate("name")}
            style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.6)",borderRadius:20,padding:"7px 18px",fontSize:13,cursor:"pointer",fontWeight:700}}>
            Salta
          </button>
        </div>
        <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",width:"100%",maxWidth:400}}>
          <div className="pop-in" style={{fontSize:52,marginBottom:6}}>{sl.icon}</div>
          <h2 style={{fontFamily:FF_DISPLAY,fontSize:28,margin:"0 0 8px",lineHeight:1.2,color:SG_GOLD}}>{sl.title}</h2>
          <p style={{opacity:.75,fontSize:14,margin:0,maxWidth:300}}>{sl.sub}</p>
          {sl.body}
          {sl.pills && (
            <div style={{display:"flex",gap:8,flexWrap:"wrap",justifyContent:"center"}}>
              {sl.pills.map(p => (
                <span key={p} style={{background:"rgba(255,194,75,.14)",border:SG_BR,color:SG_GOLD,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:700}}>{p}</span>
              ))}
            </div>
          )}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:18}}>
          <div style={{display:"flex",gap:8}}>
            {[0,1,2].map(i => (
              <div key={i} onClick={() => setObSlide(i)} style={{width:i===obSlide?26:8,height:8,borderRadius:8,background:i===obSlide?SG_GOLD:"rgba(255,255,255,.3)",transition:"width .3s",cursor:"pointer"}} />
            ))}
          </div>
          <button onClick={() => obSlide < 2 ? setObSlide(s => s+1) : navigate("name")}
            style={{background:SG_GOLD_GRAD,border:"none",color:SG_INK,borderRadius:50,padding:"16px 48px",fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 8px 32px rgba(255,194,75,.35)"}}>
            {obSlide < 2 ? "Avanti →" : "Inizia! ✨"}
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════ SCREEN: NAME ════════════════════════════════════════
  if (screen === "name") return (
    <div key="name" className={screenAnim} style={{minHeight:"var(--vvh,100dvh)",background:SG_BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:SG_PARCH,padding:24,paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)",textAlign:"center"}}>
      {G}
      <div style={{display:"flex",gap:8,justifyContent:"center",marginBottom:16}}>
        {COMPANIONS.map((c,i) => (
          <div key={c.id} style={{animation:"float 3s ease-in-out infinite",animationDelay:`${i*.35}s`}}>
            <CompanionAvatar c={c} size={52} mood="happy" />
          </div>
        ))}
      </div>
      <h1 style={{fontFamily:FF_DISPLAY,fontSize:42,margin:"0 0 6px",color:SG_GOLD,textShadow:"0 2px 18px rgba(255,194,75,.25)"}}>MondoMago</h1>
      <p style={{fontSize:15,opacity:.75,marginBottom:44}}>Il tuo viaggio magico inizia qui! ✨</p>
      <div style={{width:"100%",maxWidth:340}}>
        <p style={{fontFamily:FF_DISPLAY,fontSize:20,marginBottom:14,color:SG_PARCH}}>Come ti chiami? 👋</p>
        <input value={childName} onChange={e => setChildName(e.target.value)}
          onKeyDown={e => e.key==="Enter" && childName.trim() && navigate("age")}
          placeholder="Scrivi il tuo nome..."
          autoComplete="given-name"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          style={{width:"100%",padding:"16px 20px",borderRadius:20,border:"2px solid rgba(255,194,75,.3)",fontSize:18,outline:"none",textAlign:"center",color:"#1a1a2e",boxSizing:"border-box"}} />
        <button onClick={() => childName.trim() && navigate("age")} disabled={!childName.trim()}
          style={{marginTop:14,width:"100%",background:childName.trim()?SG_GOLD_GRAD:"rgba(255,255,255,.15)",color:childName.trim()?SG_INK:"rgba(255,255,255,.6)",border:"none",borderRadius:50,padding:16,fontSize:18,fontWeight:900,cursor:childName.trim()?"pointer":"default",boxShadow:childName.trim()?"0 8px 24px rgba(255,194,75,.35)":"none",transition:"all .3s"}}>
          Avanti ✨
        </button>
      </div>
    </div>
  );

  // ════════════════════ SCREEN: AGE ═════════════════════════════════════════
  if (screen === "age") return (
    <div key="age" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:SG_PARCH,padding:24,paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)",textAlign:"center",position:"relative"}}>
      {G}
      <button onClick={() => navigate("name")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:SG_PARCH,borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
      <div style={{marginBottom:14,display:"flex",gap:6,justifyContent:"center"}}>
        {COMPANIONS.map((c,i) => (
          <div key={c.id} style={{animation:"float 3s ease-in-out infinite",animationDelay:`${i*.35}s`}}>
            <CompanionAvatar c={c} size={44} mood="happy" />
          </div>
        ))}
      </div>
      <h2 style={{fontFamily:FF_DISPLAY,fontSize:28,marginBottom:8,color:SG_GOLD}}>Quanti anni hai, {childName}?</h2>
      <p style={{opacity:.85,marginBottom:40}}>Sceglierò le sfide perfette per te!</p>
      <div style={{display:"flex",gap:14,width:"100%",maxWidth:420}}>
        {[{label:"3 – 4",val:4,emoji:"🐣",desc:"Sfide visive e divertenti"},
          {label:"5 – 6",val:6,emoji:"🚀",desc:"Sfide con testo e numeri"},
          {label:"7 – 8",val:8,emoji:"🧑‍🚀",desc:"Sfide avanzate"}].map(o => (
          <button key={o.val} onClick={() => { setChildAge(o.val); navigate("companion"); }}
            style={{flex:1,background:SG_CARD,border:SG_BR,borderRadius:24,padding:"20px 10px",cursor:"pointer",color:SG_PARCH,boxShadow:"0 4px 20px rgba(0,0,0,.3)",transition:"all .2s"}}>
            <div style={{fontSize:44}}>{o.emoji}</div>
            <div style={{fontFamily:FF_DISPLAY,fontSize:24,marginTop:8,color:SG_GOLD}}>{o.label}</div>
            <div style={{fontSize:11,opacity:.85,marginTop:5}}>{o.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: COMPANION ═══════════════════════════════════
  const COMP_DESC = {
    fiamma: "Energico e diretto. Ti sprona sempre a dare il massimo!",
    luna:   "Poetica e gentile. Ogni errore è un passo verso la luce.",
    onde:   "Curioso e giocoso. Ogni sfida è una scoperta meravigliosa!",
    foglia: "Furba e creativa. Trova sempre l'angolo inaspettato.",
    pixel:  "Logico e preciso. Trasforma ogni errore in un codice migliore!",
  };
  if (screen === "companion") return (
    <div key="companion" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 20px 0",paddingBottom:"max(env(safe-area-inset-bottom,0px),48px)",color:SG_PARCH,position:"relative"}}>
      {G}
      <button onClick={() => navigate("age")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:SG_PARCH,borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
      <div className="bounce" style={{fontSize:32,marginBottom:10}}>✨</div>
      <h2 style={{fontFamily:FF_DISPLAY,fontSize:28,marginBottom:4,textAlign:"center",color:SG_GOLD}}>Scegli il tuo compagno!</h2>
      <p style={{opacity:.6,marginBottom:32,fontSize:13,textAlign:"center"}}>Sarà con te in ogni avventura magica, {childName}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,width:"100%",maxWidth:420}}>
        {COMPANIONS.map((c,i) => (
          <button key={c.id} onClick={() => { SFX.tap(); setCompanion(c.id); navigate("companion_welcome"); }}
            className="slide-up pop-in"
            style={{
              background:`linear-gradient(160deg,${c.color}22,${c.color}08)`,
              border:`2px solid ${c.color}66`,
              borderRadius:24, padding:"18px 8px 16px",
              cursor:"pointer", color:"white",
              animationDelay:`${i*.09}s`,
              boxShadow:`0 8px 32px ${c.color}22`,
              display:"flex", flexDirection:"column", alignItems:"center",
            }}>
            <CompanionAvatar c={c} size={72} anim="float" mood="happy" />
            <div style={{fontFamily:FF_DISPLAY,fontWeight:900,fontSize:16,marginTop:10,color:SG_PARCH}}>{c.name}</div>
            <div style={{fontFamily:FF_MONO,fontSize:10,color:c.color,marginTop:2,fontWeight:700,letterSpacing:.5}}>{c.type.toUpperCase()}</div>
            <div style={{fontSize:10,opacity:.65,marginTop:6,lineHeight:1.5,textAlign:"center"}}>{COMP_DESC[c.id]}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: COMPANION WELCOME ══════════════════════════
  if (screen === "companion_welcome") {
    const cw = COMPANIONS.find(c => c.id === companion) || COMPANIONS[0];
    const meetMsg = cw.onMeet ? cw.onMeet(childName || "amico") : `Ciao! Sono ${cw.name}!`;
    return (
      <div key="companion_welcome" className={screenAnim}
        style={{minHeight:"100dvh",background:SG_BG,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"space-between",padding:"52px 28px",paddingBottom:"max(env(safe-area-inset-bottom,0px),52px)",textAlign:"center",color:SG_PARCH,position:"relative",overflow:"hidden"}}>
        {G}
        {/* Floating sparkles */}
        {[["✨",12,16,2.4,0],["⭐",82,10,3.0,0.4],["💫",22,74,2.7,0.8],["🌟",74,68,2.3,0.2],["✨",48,88,3.4,0.6]].map(([e,l,t,dur,del],i) => (
          <div key={i} style={{position:"absolute",left:`${l}%`,top:`${t}%`,fontSize:18+i*4,opacity:.45,animation:`float ${dur}s ease-in-out infinite`,animationDelay:`${del}s`,pointerEvents:"none",userSelect:"none"}}>{e}</div>
        ))}
        {/* Back link */}
        <div style={{alignSelf:"flex-start"}}>
          <button onClick={() => { setCompanion(null); navigate("companion"); }}
            style={{background:"rgba(255,255,255,.15)",border:"none",color:"rgba(255,255,255,.75)",borderRadius:20,padding:"7px 16px",fontSize:13,cursor:"pointer",fontWeight:700}}>
            ← Cambia
          </button>
        </div>
        {/* Companion hero */}
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:22,width:"100%",maxWidth:360,flex:1,justifyContent:"center"}}>
          <div className="pop-in" style={{position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div className="pulse" style={{position:"absolute",inset:-16,borderRadius:"50%",background:`${cw.color}28`,border:`3px solid ${cw.color}55`}} />
            <CompanionAvatar c={cw} size={180} anim="float" mood="happy" talking={false} />
          </div>
          <h1 style={{fontFamily:FF_DISPLAY,fontSize:42,margin:0,color:SG_GOLD,textShadow:"0 2px 18px rgba(255,194,75,.28)",letterSpacing:.5}}>{cw.name}!</h1>
          {/* Speech bubble */}
          <div className="slide-up" style={{background:SG_CARD,border:SG_BR,borderRadius:24,padding:"18px 24px",fontSize:17,lineHeight:1.65,fontWeight:700,maxWidth:330,color:SG_PARCH}}>
            {meetMsg}
          </div>
        </div>
        {/* CTA */}
        <button onClick={() => { warmUpAudio(); navigate("map"); }}
          style={{background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"18px 52px",fontSize:20,fontWeight:900,cursor:"pointer",boxShadow:"0 8px 32px rgba(255,194,75,.35)",width:"100%",maxWidth:340}}>
          Iniziamo l'avventura! 🚀
        </button>
      </div>
    );
  }

  // ════════════════════ SCREEN: MAP ═════════════════════════════════════════
  if (screen === "map") {
    const mapBg = season ? season.bg : "radial-gradient(125% 85% at 50% -8%, #2D1B54 0%, #1B1035 52%, #140B29 100%)";
    const equippedForComp = comp ? (COSMETICS.find(c => c.id === equippedCosmetic[comp.id]) || null) : null;
    const { lvl: mapLvl, pct: mapPct, toNext: mapToNext, nextTitle: mapNextTitle } = getLevelProgress(totalStars);
    // L1: light-mode theme tokens for children ≤ 4 years
    const mt = youngBg ? {
      bg:         "linear-gradient(180deg,#FFF8EC,#EDE9FE)",
      fg:         "#1a1a2e",   fgDim: "rgba(0,0,0,.45)",  fgDimmer: "rgba(0,0,0,.28)",
      card:       "rgba(0,0,0,.05)",    cardBd: "1px solid rgba(0,0,0,.08)",
      xpBg:       "rgba(255,215,0,.12)", xpBd: "1px solid rgba(255,215,0,.3)", xpBarBg: "rgba(0,0,0,.07)",
      tabAct:     "linear-gradient(135deg,rgba(0,0,0,.12),rgba(0,0,0,.07))", tabActBd: "1px solid rgba(0,0,0,.18)", tabActFg: "#1a1a2e",
      tabInact:   "rgba(0,0,0,.04)",  tabInactBd: "1px solid rgba(0,0,0,.06)",  tabInactFg: "rgba(0,0,0,.4)",
      wCard:      "rgba(255,255,255,.92)", wLocked: "rgba(0,0,0,.04)",
      wOvl:       "linear-gradient(90deg,rgba(255,255,255,.9) 0%,rgba(255,255,255,.55) 55%,transparent 100%)",
      wNodeConn:  "rgba(0,0,0,.10)", wNodeTxt: "#1a1a2e", wNodeLocked: "rgba(0,0,0,.28)",
      parentBtn:  "rgba(0,0,0,.04)", parentBd: "1px solid rgba(0,0,0,.09)", parentFg: "rgba(0,0,0,.4)",
      sectionLbl: "rgba(0,0,0,.4)",
    } : {
      bg:         mapBg,
      fg:         "#F6ECD4",    fgDim: "rgba(246,236,212,.55)", fgDimmer: "rgba(246,236,212,.3)",
      card:       "rgba(246,236,212,.06)", cardBd: "1px solid rgba(246,236,212,.1)",
      xpBg:       "rgba(255,194,75,.1)",   xpBd: "1px solid rgba(255,194,75,.28)",  xpBarBg: "rgba(246,236,212,.09)",
      tabAct:     "linear-gradient(135deg,rgba(255,194,75,.24),rgba(255,194,75,.08))", tabActBd: "1px solid rgba(255,194,75,.42)", tabActFg: "#FFE3A6",
      tabInact:   "rgba(246,236,212,.05)", tabInactBd: "1px solid rgba(246,236,212,.08)", tabInactFg: "rgba(246,236,212,.55)",
      wCard:      "rgba(29,17,54,.72)",  wLocked: "rgba(246,236,212,.04)",
      wOvl:       "linear-gradient(90deg,rgba(20,11,41,.94) 0%,rgba(20,11,41,.5) 55%,transparent 100%)",
      wNodeConn:  "rgba(246,236,212,.12)", wNodeTxt: "#F6ECD4", wNodeLocked: "rgba(246,236,212,.32)",
      parentBtn:  "rgba(246,236,212,.04)", parentBd: "1px solid rgba(246,236,212,.09)", parentFg: "rgba(246,236,212,.42)",
      sectionLbl: "rgba(255,194,75,.62)",
    };
    return (
    <div key="map" className={screenAnim} style={{minHeight:"100dvh",background:mt.bg,color:mt.fg,padding:22,paddingBottom:"max(env(safe-area-inset-bottom,0px),22px)",position:"relative"}}>
      {G}
      {/* StarField — dark mode only, adds cosmic depth */}
      {!youngBg && <StarField />}
      {/* Seasonal background particles */}
      {season && (
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
          {season.particles.flatMap((e, pi) =>
            [0,1].map(j => {
              const id = pi * 2 + j;
              return (
                <div key={id} style={{
                  position:"absolute",
                  left:`${(id * 13 + 7) % 94}%`,
                  top:`${(id * 19 + 5) % 86}%`,
                  fontSize: 12 + (id % 3) * 6,
                  opacity: 0.12 + (id % 3) * 0.05,
                  animation:`particleFloat ${3.5 + (id % 4) * 0.8}s ease-in-out infinite`,
                  animationDelay:`${id * 0.4}s`,
                  userSelect:"none",
                }}>{e}</div>
              );
            })
          )}
        </div>
      )}
      <div style={{position:"relative",zIndex:1}}>
      {/* Seasonal banner */}
      {season && (
        <div className="slide-up" style={{background:`${season.color}22`,border:`1px solid ${season.color}55`,borderRadius:14,padding:"10px 14px",marginBottom:14,fontSize:12,textAlign:"center",fontWeight:700,color:mt.fg}}>
          {season.banner}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12,color:mt.fgDim}}>{isReturning ? `Bentornato, ${childName}!` : `Ciao, ${childName}!`} 👋</div>
          <h2 style={{fontFamily:FF_DISPLAY,fontWeight:800,margin:0,fontSize:23,letterSpacing:.3}}>🗺️ I Mondi Magici</h2>
        </div>
        {comp && (
          <div onClick={() => navigate("profile")}
            style={{textAlign:"center",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4,flexShrink:0}}>
            <div style={{position:"relative",width:72,height:72}}>
              <CompanionAvatar c={comp} size={72} mood="idle" anim={compAnim} />
              {!youngBg && <CompanionOrbit color={comp.color} />}
            </div>
            <div style={{fontFamily:FF,fontSize:13,color:comp.color}}>{comp.name}</div>
          </div>
        )}
      </div>
      {/* Time-of-day greeting */}
      {(() => {
        const h = new Date().getHours();
        const g = h < 10 ? "☀️ Buongiorno!" : h < 13 ? "🌤️ Buona mattina!" : h < 17 ? "🌤️ Buon pomeriggio!" : h < 21 ? "🌙 Buona sera!" : "🌟 Notte di avventura!";
        return <div style={{fontSize:12,color:mt.fgDim,marginBottom:12,textAlign:"right",fontWeight:600}}>{g}</div>;
      })()}
      {/* ── IL SIGILLO MAGICO (banner di progresso in cima) ── */}
      {(() => {
        const completedWorlds = SIGILLO_FRAGMENTS.filter(f =>
          items.find(it => it.emoji === STORY_ARCS[f.worldId]?.reward_emoji)
        );
        const count = completedWorlds.length;
        const isComplete = count === SIGILLO_FRAGMENTS.length;
        return (
          <button onClick={() => navigate("story_book")}
            style={{
              width:"100%",marginBottom:14,
              background:isComplete
                ? "linear-gradient(135deg,rgba(255,194,75,.26),rgba(255,160,40,.12))"
                : "linear-gradient(135deg,rgba(255,194,75,.12),rgba(45,27,84,.42))",
              border:`2px solid ${isComplete?"rgba(255,194,75,.6)":"rgba(255,194,75,.28)"}`,
              borderRadius:22,padding:"15px 18px",
              color:mt.fg,cursor:"pointer",
              display:"flex",alignItems:"center",gap:16,textAlign:"left",
              boxShadow:isComplete?"0 6px 28px rgba(255,194,75,.28)":"0 4px 20px rgba(255,194,75,.1)",
            }}>
            {/* Sigillo SVG */}
            <svg width={58} height={58} viewBox="0 0 100 100"
              className={isComplete?"sigillo-glow":""} style={{flexShrink:0}}>
              <circle cx={50} cy={50} r={44} fill="none"
                stroke={isComplete?"rgba(255,194,75,.6)":"rgba(255,194,75,.28)"} strokeWidth={2}/>
              {SIGILLO_FRAGMENTS.map((f, i) => {
                const rad = (f.angle - 90) * Math.PI / 180;
                const x = 50 + 32 * Math.cos(rad);
                const y = 50 + 32 * Math.sin(rad);
                const active = !!items.find(it => it.emoji === STORY_ARCS[f.worldId]?.reward_emoji);
                return (
                  <circle key={i} cx={x} cy={y} r={9}
                    fill={active ? f.color : "rgba(246,236,212,.08)"}
                    stroke={active ? `${f.color}bb` : "rgba(246,236,212,.14)"}
                    strokeWidth={1.5}
                    opacity={active ? 1 : 0.5}
                  />
                );
              })}
              {/* Centro */}
              <circle cx={50} cy={50} r={11}
                fill={isComplete?"rgba(255,194,75,.65)":"rgba(246,236,212,.08)"}
                stroke={isComplete?"#FFC24B":"rgba(255,194,75,.4)"} strokeWidth={2}/>
              <text x={50} y={55} textAnchor="middle" fontSize={12} fill={mt.fg} style={{pointerEvents:"none"}}>
                {isComplete?"✨":"✦"}
              </text>
            </svg>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontFamily:FF_DISPLAY,fontWeight:800,fontSize:16,color:isComplete?"#FFE3A6":"#FFD9A0",marginBottom:3}}>
                Il Sigillo Magico {isComplete?"— COMPLETO! ✨":""}
              </div>
              <div style={{fontSize:12,color:mt.fgDim,lineHeight:1.35}}>
                <span style={{fontFamily:FF_MONO,color:"#FFC24B"}}>{count}/{SIGILLO_FRAGMENTS.length}</span> frammenti · {SIGILLO_STORY[count]?.slice(0,48)}…
              </div>
              <div style={{display:"flex",gap:5,marginTop:7,flexWrap:"wrap"}}>
                {SIGILLO_FRAGMENTS.map((f, i) => {
                  const active = !!items.find(it => it.emoji === STORY_ARCS[f.worldId]?.reward_emoji);
                  return <div key={i} style={{width:9,height:9,borderRadius:"50%",background:active?f.color:"rgba(246,236,212,.15)",boxShadow:active?`0 0 5px ${f.color}99`:"none"}} />;
                })}
              </div>
            </div>
            <div style={{fontSize:20,color:"rgba(255,194,75,.6)"}}>›</div>
          </button>
        );
      })()}
      {/* ── STATS ROW ── */}
      <div style={{display:"flex",gap:10,marginBottom:12}}>
        {[{n:"star",v:totalStars,l:"stelle",c:"#FFC24B"},{n:"trophy",v:items.length,l:"trofei",c:"#C084FC"},{n:"coin",v:coins,l:"monete",c:"#6DE0C6"}].map((s,idx) => (
          <div key={idx} style={{flex:1,background:mt.card,borderRadius:20,padding:"14px 8px",textAlign:"center",border:mt.cardBd}}>
            <div style={{height:28,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={s.n} color={s.c} size={26} /></div>
            <div style={{fontFamily:FF_MONO,fontWeight:500,fontSize:24,color:s.c,lineHeight:1}}>{s.v}</div>
            <div style={{fontSize:11,color:mt.fgDim,marginTop:2}}>{s.l}</div>
          </div>
        ))}
        {/* Streak card */}
        {(() => {
          const flameCount = streak >= 7 ? 3 : streak >= 3 ? 2 : 1;
          const today = new Date().toISOString().slice(0,10);
          const playedToday = sessionLog.some(s => s.date === today) || sessionLog.length > 0;
          const last7 = Array.from({length:7},(_,i) => { const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
          const playedDates = new Set(sessionLog.map(s=>s.date));
          playedDates.add(today);
          const streakAtRisk = streak >= 2 && !playedToday;
          return (
            <div style={{
              flex:1,
              background:streakAtRisk
                ?(youngBg?"rgba(239,68,68,.1)":"rgba(239,68,68,.12)")
                :(youngBg?"rgba(255,100,0,.1)":"rgba(249,115,22,.1)"),
              borderRadius:20,padding:"10px 8px",textAlign:"center",
              border:streakAtRisk
                ?(youngBg?"1px solid rgba(239,68,68,.3)":"1px solid rgba(239,68,68,.3)")
                :(youngBg?"1px solid rgba(255,100,0,.2)":"1px solid rgba(249,115,22,.2)"),
            }}>
              <div className={streak>=3?"streak-flame":""} style={{display:"flex",justifyContent:"center",gap:1,height:24,alignItems:"center"}}>{Array.from({length:flameCount},(_,fi) => <Icon key={fi} name="flame" color={streakAtRisk?"#F87171":"#FB923C"} size={22} />)}</div>
              <div style={{fontFamily:FF_MONO,fontWeight:500,fontSize:24,color:streakAtRisk?"#F87171":"#FB923C",lineHeight:1}}>{streak}</div>
              <div style={{fontSize:9,fontWeight:800,color:streakAtRisk?"#F87171":"#FB923C",opacity:.8,marginBottom:3}}>
                {streakAtRisk?"⚠️ a rischio!":streak>=7?"🏆 LEGGENDA":streak>=3?"⭐ SERIE":streak>=1?"Giorni":""}
              </div>
              <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:3}}>
                {last7.map(d => {
                  const dayLbl = ["D","L","M","M","G","V","S"][new Date(d+"T12:00:00").getDay()];
                  const played = playedDates.has(d);
                  return (
                    <div key={d} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                      <div style={{fontSize:8,fontWeight:800,color:played?"#F97316":youngBg?"rgba(0,0,0,.3)":"rgba(255,255,255,.3)",lineHeight:1}}>{dayLbl}</div>
                      <div style={{width:10,height:10,borderRadius:"50%",background:played?"#F97316":youngBg?"rgba(0,0,0,.14)":"rgba(255,255,255,.12)"}} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
      {/* ── XP LEVEL BAR ── */}
      {(() => {
        return (
          <div style={{background:mt.xpBg,border:mt.xpBd,borderRadius:20,padding:"14px 16px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:mapToNext ? 10 : 0}}>
              <span style={{fontSize:30}}>{mapLvl.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontFamily:FF,fontSize:17,color:"#FFD95A"}}>{mapLvl.title}</div>
                {mapToNext ? <div style={{fontSize:11,opacity:.5}}>{mapToNext} stelle per <strong>{mapNextTitle}</strong></div>
                           : <div style={{fontSize:11,color:"#FFD700",opacity:.8}}>Livello massimo! 🏆</div>}
              </div>
              {allProfiles.length > 1 && (
                <button onClick={() => navigate('profile_select')} style={{background:youngBg?"rgba(0,0,0,.07)":"rgba(255,255,255,.1)",border:youngBg?"1px solid rgba(0,0,0,.14)":"1px solid rgba(255,255,255,.2)",color:mt.fg,borderRadius:20,padding:"6px 14px",fontSize:12,cursor:"pointer",fontWeight:700}}>
                  Cambia
                </button>
              )}
            </div>
            {mapToNext > 0 && (
              <div>
                <div style={{background:mt.xpBarBg,borderRadius:8,height:12,overflow:"hidden",border:youngBg?"1px solid rgba(0,0,0,.05)":"1px solid rgba(255,255,255,.06)",position:"relative"}}>
                  <div style={{background:"linear-gradient(90deg,#E8952B,#FFC24B,#FFE3A6)",height:"100%",borderRadius:8,width:`${mapPct}%`,transition:"width 1.2s cubic-bezier(.22,1,.36,1)",boxShadow:"0 0 8px #FFC24B88"}} />
                  {!youngBg && mapPct > 10 && <div className="xp-glint" />}
                </div>
                <div style={{fontSize:10,opacity:.35,marginTop:4,textAlign:"right"}}>{Math.round(mapPct)}%</div>
              </div>
            )}
          </div>
        );
      })()}
      {/* School mode indicator */}
      {schoolMode && schoolCode && (
        <div style={{background:"rgba(37,99,235,.15)",border:"1px solid rgba(37,99,235,.4)",borderRadius:12,padding:"8px 14px",marginBottom:12,fontSize:12,display:"flex",alignItems:"center",gap:8}}>
          <span>🏫</span>
          <span style={{flex:1}}>Modalità Scuola attiva · Classe <strong>{schoolCode}</strong></span>
          {schoolAssigned.length > 0 && <span style={{background:"#2563EB",color:"white",borderRadius:10,padding:"2px 8px",fontSize:10,fontWeight:900}}>{schoolAssigned.length} sfide</span>}
        </div>
      )}
      {/* Il Sigillo Magico è ora un banner di progresso in cima alla mappa */}
      {/* ── DAILY CHALLENGE ── */}
      {(() => {
        const today = new Date().toISOString().slice(0,10);
        const done  = dailyCompletedDate === today;
        return (
          <button onClick={done ? undefined : startDaily}
            style={{width:"100%",marginBottom:12,
              background:done
                ? "rgba(255,255,255,.04)"
                : "linear-gradient(135deg,rgba(255,217,90,.18),rgba(255,122,0,.12))",
              border:`2px solid ${done?"rgba(255,255,255,.08)":"rgba(255,217,90,.5)"}`,
              borderRadius:24,padding:"16px 20px",color:"white",
              cursor:done?"default":"pointer",
              display:"flex",alignItems:"center",gap:16,textAlign:"left",
              boxShadow:done?"none":"0 4px 24px rgba(255,217,90,.15)",
              opacity:done?.6:1}}>
            <span style={{display:"flex"}}>{done ? <Icon name="check" color="#6DE0C6" size={40} /> : <Icon name="star" color="#FFD95A" size={40} />}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:17,marginBottom:3}}>Sfida del Giorno</div>
              <div style={{fontSize:13,opacity:.7}}>{done?"Completata! Torna domani ✨":"3 sfide speciali · +3 stelle bonus"}</div>
            </div>
            {!done && <div style={{background:"linear-gradient(135deg,#FFD95A,#FFB800)",color:"#1a1a2e",borderRadius:20,padding:"6px 14px",fontSize:13,fontWeight:900,whiteSpace:"nowrap"}}>+3 ⭐</div>}
          </button>
        );
      })()}
      {/* ── SFIDA FULMINE ── */}
      <button onClick={() => {
        const pool = Object.values(ALL_CHALLENGES).flat().filter(c => c.format === "visual_tap" && c.ageMin <= (childAge||5) && c.ageMax >= (childAge||5));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setFulminoPool(shuffled); setFulminoCi(0); setFulminoScore(0); setFulminoTime(60); setFulminoRunning(false);
        navigate("fulmine");
      }} className="pulse"
        style={{width:"100%",marginBottom:16,
          background:"linear-gradient(135deg,#F59E0B,#FBBF24)",
          border:"none",borderRadius:24,padding:"16px 20px",
          color:"#1a1a2e",cursor:"pointer",
          display:"flex",alignItems:"center",gap:16,textAlign:"left",fontWeight:900,
          boxShadow:"0 6px 28px rgba(251,191,36,.4)"}}>
        <span style={{fontSize:40}}>⚡</span>
        <div style={{flex:1}}>
          <div style={{fontSize:17}}>Sfida Fulmine!</div>
          <div style={{fontSize:12,fontWeight:700,opacity:.65}}>60 secondi · rispondi più che puoi!</div>
        </div>
        <div style={{background:"rgba(0,0,0,.15)",borderRadius:20,padding:"5px 14px",fontSize:13,fontWeight:900}}>GO!</div>
      </button>
      {/* ── NAV TABS ── */}
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[[NavMap,"Mondi"],[NavBrain,"Skill"],[NavFamily,"Famiglia"],[NavSparkle,"Look"]].map(([Icon,label],i) => (
          <button key={i} onClick={() => {
            if(i===1) navigate("skills");
            else if(i===2) navigate("family");
            else if(i===3) navigate("cosmetics");
          }}
            style={{
              flex:1,
              background:i===0?mt.tabAct:mt.tabInact,
              border:i===0?mt.tabActBd:mt.tabInactBd,
              borderRadius:16,padding:"14px 10px",minHeight:58,
              color:i===0?mt.tabActFg:mt.tabInactFg,
              fontFamily:FF,fontSize:13,cursor:"pointer",
              display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
            }}>
            <Icon c={i===0?mt.tabActFg:mt.tabInactFg} s={22}/>
            <div>{label}</div>
          </button>
        ))}
      </div>
      {/* [A2] Visual path map */}
      <div style={{fontSize:11,fontWeight:800,letterSpacing:1,marginBottom:10,color:mt.sectionLbl}}>🗺️ MONDI</div>
      <div className="h-scroll" style={{overflowX:"auto",overflowY:"visible",paddingBottom:12,marginBottom:4}}>
        <div style={{display:"flex",gap:0,alignItems:"center",minWidth: unlockedWorlds.length * 106 + 40, padding:"16px 12px 8px"}}>
          {unlockedWorlds.map((w, i) => {
            const a   = STORY_ARCS[w.id];
            const has = items.find(it => it.emoji === a?.reward_emoji);
            const starsEarned = has ? 3 : 0;
            const isLast = i === unlockedWorlds.length - 1;
            return (
              <div key={w.id} style={{display:"flex",alignItems:"center"}}>
                {/* World node */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:5,width:96}}>
                  <button onClick={() => startWorld(w)} disabled={!w.unlocked}
                    className={w.unlocked ? "pop-in" : ""}
                    style={{
                      width:72, height:72, borderRadius:"50%",
                      background:w.unlocked?`radial-gradient(circle at 35% 32%,${w.color}55,${w.color}88)`:
                                            "rgba(255,255,255,.08)",
                      border:`3px solid ${w.unlocked?w.color+"aa":"rgba(255,255,255,.15)"}`,
                      boxShadow:w.unlocked?(has?`0 0 14px ${w.color}55,0 4px 12px rgba(0,0,0,.4)`:`0 4px 14px ${w.color}33,0 4px 12px rgba(0,0,0,.3)`):"none",
                      cursor:w.unlocked?"pointer":"default",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                      fontSize:32, padding:0, position:"relative",
                      transform:w.unlocked?"scale(1)":"scale(0.88)",
                      transition:"transform .2s",
                      animationDelay:`${i*.05}s`,
                    }}>
                    {/* Illustrated scene medallion (a window into the world) */}
                    {w.unlocked && (
                      <div className="ws-static" style={{position:"absolute",inset:0,borderRadius:"50%",overflow:"hidden"}} aria-hidden="true">
                        <WorldScene worldId={w.id} variant="card" />
                        <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 50% 40%, transparent 30%, rgba(20,11,41,.35) 72%, rgba(20,11,41,.72) 100%), linear-gradient(0deg, ${w.color}33, transparent 60%)`}} />
                      </div>
                    )}
                    <span style={{display:"flex",position:"relative",zIndex:1,filter:w.unlocked?"drop-shadow(0 1px 4px rgba(0,0,0,.85))":"none"}}>{w.unlocked ? <WorldIcon id={w.id} color="#F6ECD4" size={36} /> : <Icon name="lock" color={w.color} size={34} />}</span>
                    {w.id === "laboratorio" && !has && (
                      <div aria-label="Novità: mondo del coding" style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",
                        background:"linear-gradient(90deg,#06B6D4,#A855F7)",color:"white",borderRadius:10,
                        padding:"2px 7px",fontSize:8.5,fontWeight:900,letterSpacing:.3,whiteSpace:"nowrap",
                        border:"1.5px solid white",boxShadow:"0 2px 8px rgba(168,85,247,.5)",zIndex:3}}>
                        ✨ NOVITÀ
                      </div>
                    )}
                    {has && <div style={{position:"absolute",top:-6,right:-6,background:w.color,borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,border:"2px solid white"}}>✓</div>}
                    {!w.unlocked && w.starsNeeded > 0 && (
                      <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",
                        background:youngBg?"rgba(255,255,255,.9)":"rgba(0,0,0,.8)",border:`1px solid ${w.color}44`,
                        borderRadius:10,padding:"1px 6px",fontSize:9,color:youngBg?"#333":"rgba(255,255,255,.7)",whiteSpace:"nowrap"}}>
                        ⭐{w.starsNeeded}
                      </div>
                    )}
                  </button>
                  <div style={{fontFamily:FF,fontSize:11,color:w.unlocked?mt.wNodeTxt:mt.wNodeLocked,textAlign:"center",lineHeight:1.2,maxWidth:90}}>
                    {w.name.split(" ").slice(0,2).join(" ")}
                  </div>
                  {/* Stars earned */}
                  <div style={{display:"flex",gap:1,height:12}}>
                    {[0,1,2].map(si => (
                      <span key={si} style={{fontSize:10,opacity:si < starsEarned ? 1 : 0.2}}>⭐</span>
                    ))}
                  </div>
                </div>
                {/* Connector path between nodes */}
                {!isLast && (
                  <div style={{width:22,height:4,marginBottom:22,borderRadius:3,
                    background: unlockedWorlds[i+1]?.unlocked
                      ? `linear-gradient(90deg,${w.color}88,${unlockedWorlds[i+1].color}88)`
                      : mt.wNodeConn,
                    flexShrink:0}} />
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Selected world detail card */}
      {(() => {
        // Show detail on tap — use a simpler "expand on click" via a separate state-less approach:
        // Just show all worlds as scrollable cards below the path
        return null;
      })()}
      {/* ── WORLD CARDS ── */}
      <div style={{fontSize:12,fontWeight:800,letterSpacing:1.5,marginBottom:12,textTransform:"uppercase",color:mt.sectionLbl}}>✦ I tuoi Mondi</div>
      <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:8}}>
        {unlockedWorlds.map((w,i) => {
          const a   = STORY_ARCS[w.id];
          const has = items.find(it => it.emoji === a?.reward_emoji);
          const locked = !w.unlocked;
          const isSpot = i === 0 && !isReturning && totalStars === 0 && !mapSpotDismissed;
          return (
            <button key={w.id} onClick={() => { if (isSpot) setMapSpotDismissed(true); locked ? speak(`Guadagna ancora ${w.starsNeeded - totalStars} stelle per aprire ${w.name}!`) : startWorld(w); }}
              className={`slide-up${locked?"":" world-card-btn"}${isSpot?" pulse":""}`}
              disabled={locked}
              style={{
                background:locked ? "rgba(20,11,41,.55)" : mt.wCard,
                border:`2px solid ${locked?"rgba(246,236,212,.1)":has?w.color+"cc":w.color+"55"}`,
                borderRadius:28,padding:"18px 20px",minHeight:96,
                cursor:locked?"default":"pointer",
                color:mt.fg,
                display:"flex",alignItems:"center",gap:18,textAlign:"left",
                boxShadow:locked?"none":has
                  ? `0 8px 28px ${w.color}44`
                  : `0 4px 20px ${w.color}28`,
                opacity:locked?.72:1,
                animationDelay:`${i*.06}s`,
                position:"relative",overflow:"hidden",
                transition:"transform .16s ease, box-shadow .16s ease",
              }}>
              {/* WorldScene illustrated hero — full presence for unlocked, dark mystery preview for locked */}
              <div style={{position:"absolute",inset:0,borderRadius:26,overflow:"hidden",opacity:locked?.3:.55,pointerEvents:"none",filter:locked?"grayscale(.5) brightness(.7)":"none"}}><WorldScene worldId={w.id} variant="card" /></div>
              {/* Left→right scrim: text stays crisp on the left, scene glows through on the right */}
              <div style={{position:"absolute",inset:0,borderRadius:26,pointerEvents:"none",background:locked
                ? "linear-gradient(90deg, rgba(20,11,41,.82) 0%, rgba(20,11,41,.72) 100%)"
                : "linear-gradient(90deg, rgba(20,11,41,.92) 0%, rgba(20,11,41,.64) 40%, rgba(20,11,41,.24) 72%, transparent 100%)"}} />
              {/* Shimmer accent for completed */}
              {has && !locked && <div style={{position:"absolute",top:0,right:0,width:60,height:"100%",background:`linear-gradient(90deg,transparent,${w.color}22)`,borderRadius:"0 26px 26px 0",pointerEvents:"none"}} />}
              {/* Animated shimmer sweep */}
              {!locked && !youngBg && <div className="world-shimmer" style={{animationDelay:`${i*0.55}s`}} />}
              {/* World icon */}
              <div style={{
                width:68,height:68,borderRadius:20,flexShrink:0,
                background:locked?"rgba(255,255,255,.06)":`${w.color}22`,
                border:`2px solid ${locked?"rgba(255,255,255,.1)":w.color+"55"}`,
                display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:34,position:"relative",zIndex:1,
                boxShadow:locked?"none":`0 0 20px ${w.color}44`,
              }}>
                {locked ? <Icon name="lock" color={w.color} size={34} /> : <WorldIcon id={w.id} color={w.color} size={40} />}
                {has && !locked && <div style={{position:"absolute",bottom:-6,right:-6,fontSize:18,lineHeight:1,filter:"drop-shadow(0 1px 3px rgba(0,0,0,.5))"}}>{a?.reward_emoji}</div>}
              </div>
              {/* Content */}
              <div style={{flex:1,minWidth:0,position:"relative",zIndex:1}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <span style={{fontWeight:900,fontSize:16,color:locked?mt.fgDimmer:mt.fg}}>{w.name}</span>
                  {has && <span style={{background:`${w.color}33`,color:w.color,fontSize:10,fontWeight:900,borderRadius:20,padding:"2px 8px",border:`1px solid ${w.color}55`}}>✓ COMPLETO</span>}
                </div>
                {locked
                  ? <div style={{fontSize:12,color:w.color,opacity:.7,fontWeight:700}}>🔒 Servono {w.starsNeeded} ⭐ per sbloccare</div>
                  : has
                    ? <div style={{fontSize:12,color:youngBg?"#D97706":"#FFD95A",fontWeight:700}}>🏆 {a?.reward_name}</div>
                    : <div style={{fontSize:12,color:mt.fgDim}}>🎯 ~6 sfide · {young?"visive":"interattive"}</div>}
                {/* Stars */}
                {!locked && (
                  <div style={{display:"flex",gap:4,marginTop:6}}>
                    {[0,1,2].map(si => (
                      <span key={si} style={{fontSize:14,opacity:si<(has?3:0)?1:.2,color:"#FFC24B"}}>⭐</span>
                    ))}
                  </div>
                )}
              </div>
              {/* Arrow */}
              {!locked && <div style={{color:youngBg?w.color:w.color,fontSize:22,opacity:youngBg?.9:.8,flexShrink:0,position:"relative",zIndex:1}}>›</div>}
              {/* First-visit spotlight tooltip */}
              {isSpot && (
                <div className="pop-in" style={{position:"absolute",top:-42,left:"50%",transform:"translateX(-50%)",background:"white",color:"#1a1a2e",borderRadius:20,padding:"6px 16px",fontSize:12,fontWeight:900,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,.25)",zIndex:20,pointerEvents:"none"}}>
                  {comp?.emoji} Inizia da qui! 👆
                  <div style={{position:"absolute",bottom:-6,left:"50%",transform:"translateX(-50%)",width:0,height:0,borderLeft:"6px solid transparent",borderRight:"6px solid transparent",borderTop:"6px solid white"}} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      <button onClick={() => navigate("parent")}
        style={{width:"100%",marginTop:10,background:mt.parentBtn,border:mt.parentBd,borderRadius:18,padding:"13px",color:mt.parentFg,fontSize:13,cursor:"pointer",fontWeight:700}}>
        🔐 Area Genitori
      </button>
      </div>{/* /relative z-1 */}
    </div>
    );
  }

  // ════════════════════ SCREEN: COPLAY INTRO ═══════════════════════════════
  if (screen === "coplay_intro" && world) return (
    <div key="coplay" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative"}}>
      {G}
      <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Esci</button>
      <div className="bounce" style={{fontSize:72,marginBottom:12}}>🤝</div>
      <h2 className="slide-up" style={{fontFamily:FF_DISPLAY,fontSize:25,fontWeight:900,marginBottom:10,color:SG_GOLD}}>
        Modalità Co-Gioco
      </h2>
      <p className="fade-in" style={{fontSize:15,lineHeight:1.75,opacity:.9,marginBottom:20,maxWidth:360,animationDelay:".1s"}}>
        {childName} ha {childAge} anni — l'età perfetta per giocare insieme!
      </p>
      <div className="fade-in" style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"18px 22px",marginBottom:24,fontSize:14,maxWidth:360,lineHeight:1.9,animationDelay:".2s",textAlign:"left"}}>
        <div style={{marginBottom:6}}>🔊 <strong>Leggi le domande</strong> ad alta voce — le sentirà anche il telefono</div>
        <div style={{marginBottom:6}}>👆 <strong>Aiuta a toccare</strong> la risposta giusta insieme</div>
        <div>🎉 <strong>Festeggia sempre</strong>, qualunque sia la risposta!</div>
      </div>
      {comp && (
        <div className="slide-up" style={{background:SG_CARD,border:SG_BR,borderRadius:18,padding:"12px 18px",marginBottom:28,fontSize:13,maxWidth:320,animationDelay:".3s",display:"flex",alignItems:"center",gap:12}}>
          <CompanionAvatar c={comp} size={36} />
          <span>{comp.onWorldStart()}</span>
        </div>
      )}
      <button className="pop-in" onClick={() => navigate("world_intro")}
        style={{background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"16px 48px",fontFamily:FF_DISPLAY,fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 8px 28px rgba(255,194,75,.32)",animationDelay:".4s"}}>
        Pronti insieme! 🎮
      </button>
    </div>
  );

  // ════════════════════ SCREEN: WORLD INTRO ════════════════════════════════
  if (screen === "world_intro" && arc) return (
    <div key="world_intro" className={screenAnim} style={{minHeight:"100dvh",background:`linear-gradient(160deg,#1B1035,${arc.color}44,#140B29)`,color:"#F6ECD4",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative"}}>
      {/* WorldScene full illustrated background */}
      <div style={{position:"absolute",inset:0,overflow:"hidden",zIndex:0}}><WorldScene worldId={world?.id} variant="full" /></div>
      <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(10,8,26,.55) 0%,rgba(10,8,26,.25) 50%,rgba(10,8,26,.75) 100%)",zIndex:1,pointerEvents:"none"}} />
      {G}
      <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700,zIndex:2}}>← Mappa</button>
      <div className="float" style={{marginBottom:16,position:"relative",zIndex:2,display:"flex"}}><WorldIcon id={world.id} color={world.color} size={76} /></div>
      <div style={{position:"relative",zIndex:2,display:"flex",flexDirection:"column",alignItems:"center",width:"100%"}}>
        <h2 className="slide-up" style={{fontFamily:FF_DISPLAY,fontSize:27,fontWeight:900,marginBottom:14,color:SG_GOLD}}>{arc.intro_title}</h2>
        <p className="fade-in" style={{fontSize:16,lineHeight:1.75,opacity:.9,marginBottom:12,maxWidth:380,animationDelay:".15s"}}>{arc.intro_text}</p>
        <button onClick={() => speak(arc.intro_text, 0.8)}
          style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:50,padding:"8px 22px",cursor:"pointer",marginBottom:24,fontSize:14}}>
          🔊 Riascolta
        </button>
        {comp && (
          <div className="slide-up" style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"12px 18px",marginBottom:32,fontSize:14,maxWidth:360,animationDelay:".25s",display:"flex",alignItems:"center",gap:12}}>
            <CompanionAvatar c={comp} size={38} />
            <span>{comp.onWorldStart()}</span>
          </div>
        )}
        <button className="pop-in" onClick={() => navigate("challenge")}
          style={{background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"16px 48px",fontFamily:FF_DISPLAY,fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 8px 28px rgba(255,194,75,.32)",animationDelay:".35s"}}>
          Inizia la Missione! ⚔️
        </button>
      </div>
    </div>
  );

  // ════════════════════ SCREEN: SFIDA FULMINE ══════════════════════════════
  if (screen === "fulmine") {
    const fc = fulminoPool[fulminoCi % Math.max(1, fulminoPool.length)];
    const pct = (fulminoTime / 60) * 100;
    const timerColor = fulminoTime > 30 ? "#22C55E" : fulminoTime > 15 ? "#F59E0B" : "#EF4444";
    const starsWon = Math.floor(fulminoScore / 3);

    function fulminoAnswer(idx) {
      if (!fulminoRunning || fulminoTime <= 0) return;
      SFX.tap();
      if (idx === fc.correct) {
        SFX.correct(); navigator.vibrate?.(40);
        setFulminoScore(s => s + 1);
      } else {
        SFX.wrong(); navigator.vibrate?.(80);
      }
      setFulminoCi(i => i + 1);
    }

    // Results screen when time is up
    if (!fulminoRunning && fulminoTime <= 0) {
      return (
        <div key="fulmine-end" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          {G}
          <div className="pop-in" style={{fontSize:80,marginBottom:8}}>⚡</div>
          <h2 className="slide-up" style={{fontFamily:FF_DISPLAY,fontSize:26,fontWeight:900,marginBottom:6,color:SG_GOLD}}>Sfida Fulmine!</h2>
          <div className="fade-in" style={{fontSize:64,fontWeight:900,margin:"16px 0",color:"#FCD34D"}}>{fulminoScore}</div>
          <div style={{opacity:.7,marginBottom:24}}>risposte corrette in 60 secondi</div>
          {starsWon > 0 && (
            <div className="pop-in glow" style={{background:"rgba(255,215,0,.15)",borderRadius:24,padding:"18px 28px",marginBottom:24,border:"2px solid rgba(255,215,0,.45)"}}>
              <div style={{fontSize:36,marginBottom:4}}>{"⭐".repeat(Math.min(starsWon, 10))}</div>
              <div style={{fontWeight:900,color:"#FCD34D"}}>+{starsWon} stelle guadagnate!</div>
            </div>
          )}
          {starsWon === 0 && (
            <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"14px 22px",marginBottom:24,fontSize:14,opacity:.7}}>
              Fai 3 risposte giuste per guadagnare stelle ⭐
            </div>
          )}
          <div style={{display:"flex",gap:12,width:"100%",maxWidth:320}}>
            <button onClick={() => {
              if (starsWon > 0) setTotalStars(s => s + starsWon);
              const pool = [...fulminoPool].sort(() => Math.random() - 0.5);
              setFulminoPool(pool); setFulminoCi(0); setFulminoScore(0); setFulminoTime(60); setFulminoRunning(false);
            }} style={{flex:1,background:"linear-gradient(135deg,#FBBF24,#F59E0B)",color:"#1a1a2e",border:"none",borderRadius:50,padding:14,cursor:"pointer",fontSize:15,fontWeight:900}}>
              ⚡ Ancora!
            </button>
            <button onClick={() => { if (starsWon > 0) setTotalStars(s => s + starsWon); navigate("map"); }}
              style={{flex:1,background:"rgba(255,255,255,.12)",color:"white",border:"none",borderRadius:50,padding:14,cursor:"pointer",fontSize:15,fontWeight:700}}>
              🗺️ Mappa
            </button>
          </div>
        </div>
      );
    }

    // Countdown / ready screen
    if (!fulminoRunning) {
      return (
        <div key="fulmine-ready" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          {G}
          <div className="float" style={{fontSize:80,marginBottom:12}}>⚡</div>
          <h2 className="slide-up" style={{fontFamily:FF_DISPLAY,fontSize:26,fontWeight:900,color:SG_GOLD,marginBottom:10}}>Sfida Fulmine!</h2>
          <p className="fade-in" style={{fontSize:15,lineHeight:1.75,opacity:.85,marginBottom:8,maxWidth:320,animationDelay:".1s"}}>
            Risposta rapida! Tocca la risposta giusta il più veloce possibile.
          </p>
          <div className="fade-in" style={{background:"rgba(255,255,255,.07)",borderRadius:18,padding:"14px 20px",marginBottom:28,maxWidth:320,fontSize:13,lineHeight:1.7,animationDelay:".2s"}}>
            <div>⏱️ <strong>60 secondi</strong> di sfide rapide</div>
            <div>⭐ <strong>1 stella ogni 3</strong> risposte giuste</div>
            <div>🔥 Vai più veloce che puoi!</div>
          </div>
          <button className="pop-in" onClick={() => setFulminoRunning(true)}
            style={{background:"linear-gradient(135deg,#FBBF24,#F59E0B)",color:"#1a1a2e",border:"none",borderRadius:50,padding:"18px 56px",fontWeight:900,fontSize:20,cursor:"pointer",boxShadow:"0 8px 32px rgba(251,191,36,.45)",animationDelay:".3s"}}>
            VIA! ⚡
          </button>
          <button onClick={() => navigate("map")} style={{marginTop:14,background:"none",border:"none",color:"rgba(255,255,255,.4)",cursor:"pointer",fontSize:14}}>← Torna alla mappa</button>
        </div>
      );
    }

    // Active challenge
    return (
      <div key={`ful-${fulminoCi}`} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:20,display:"flex",flexDirection:"column",position:"relative"}}>
        {G}
        {/* Timer bar */}
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
            <span style={{fontWeight:900,fontSize:18,color:timerColor}}>⚡ {fulminoTime}s</span>
            <span style={{fontSize:14,fontWeight:700,color:"#FCD34D"}}>✅ {fulminoScore}</span>
          </div>
          <div style={{background:"rgba(255,255,255,.12)",borderRadius:8,height:10,overflow:"hidden"}}>
            <div style={{background:timerColor,height:"100%",borderRadius:8,width:`${pct}%`,transition:"width 1s linear"}} />
          </div>
        </div>
        {/* Challenge */}
        {fc && (
          <>
            <div className="pop-in" style={{background:"rgba(255,255,255,.1)",borderRadius:24,padding:"24px 20px",marginBottom:14,textAlign:"center",border:"1px solid rgba(255,255,255,.14)",boxShadow:"0 8px 32px rgba(0,0,0,.4)"}}>
              {fc.visual && <div style={{fontSize:64,letterSpacing:8,marginBottom:10}}>{fc.visual}</div>}
              <p style={{fontSize:18,fontWeight:700,margin:0}}>{fc.prompt}</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {fc.options.map((opt, idx) => (
                <button key={idx} onClick={() => fulminoAnswer(idx)}
                  className="ans-btn"
                  style={{background:"rgba(255,255,255,.09)",border:"3px solid rgba(255,255,255,.18)",borderRadius:22,height:88,fontSize:42,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"white"}}>
                  {opt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ════════════════════ SCREEN: CHALLENGE ══════════════════════════════════
  if (screen === "challenge" && ch) {
    const isMC         = ch.format === "multiple_choice";
    const isVis        = ch.format === "visual_tap";
    const isStory      = ch.format === "story_choice";
    const isSeq        = ch.format === "sequence_tap" || ch.format === "code_sequence";
    const isDrag       = ch.format === "drag_drop";
    const isRhyme      = ch.format === "rhyme_complete";
    const isWordPic    = ch.format === "word_picture";
    const isLetterTrace= ch.format === "letter_trace";
    const isIfElse     = ch.format === "if_else_tap";
    const isDebug      = ch.format === "debug_find";
    const isMemMatch   = ch.format === "memory_match";
    const isCartoon    = ch.format === "quiz_cartoon";
    const isColorZone  = ch.format === "color_zones";
    const isPuzzleSwap = ch.format === "puzzle_swap";
    // sync initialPuzzleGrid into state when challenge changes
    if (isPuzzleSwap && puzzleGrid === null && initialPuzzleGrid) setPuzzleGrid(initialPuzzleGrid);

    function tapMemCard(idx) {
      if (mmLocked || mmFlipped.length >= 2 || mmFlipped.includes(idx) || mmMatched.includes(idx)) return;
      SFX.tap();
      const newFlipped = [...mmFlipped, idx];
      setMmFlipped(newFlipped);
      if (newFlipped.length === 2) {
        setMmLocked(true);
        const [i1, i2] = newFlipped;
        if (memCards[i1].pairId === memCards[i2].pairId) {
          const newMatched = [...mmMatched, i1, i2];
          setMmMatched(newMatched);
          setMmFlipped([]);
          setMmLocked(false);
          SFX.correct();
          if (newMatched.length === memCards.length) {
            setTimeout(() => {
              setSelected(999);
              triggerOK(young ? 1 : 2);
              setSkills(s => addSkill(s, ch.type || "logica"));
              setResults(r => [...r, { type: ch.type || "logica", ok: true }]);
            }, 400);
          }
        } else {
          SFX.wrong();
          setTimeout(() => { setMmFlipped([]); setMmLocked(false); }, 850);
        }
      }
    }
    const isAlpha      = ch.id?.startsWith("ba_");  // biblioteca alphabet challenge
    const alphaLetter = isAlpha ? ch.id.replace("ba_","") : null;
    const pts     = ch.isBoss ? 3 : young ? 1 : 2;

    const worldColor = world?.color || "#22C55E";
    const youngColors = ["#FF5252","#26C6DA","#66BB6A","#FFA726"];
    return (
      <div key={`ch-${ci}`} className={screenAnim} style={{minHeight:"100dvh",background:ch.isBoss?`linear-gradient(135deg,#1a0808,#3a0808)`:`radial-gradient(125% 90% at 50% -6%, #2D1B54 0%, #1B1035 55%, #140B29 100%)`,color:"#F6ECD4",padding:20,display:"flex",flexDirection:"column",position:"relative"}}>
        {G}
        <WorldBg worldId={world?.id} />
        <WorldAmbient worldId={world?.id} />
        {/* Session time limit overlay */}
        {timeLimit > 0 && sessionStart > 0 && Math.floor((Date.now() - sessionStart) / 60000) >= timeLimit && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#241546",borderRadius:24,padding:"32px 24px",maxWidth:320,textAlign:"center"}}>
              <div style={{fontSize:60,marginBottom:12}}>⏰</div>
              <h3 style={{color:"white",margin:"0 0 8px",fontSize:22}}>È ora di una pausa!</h3>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:14,margin:"0 0 24px",lineHeight:1.6}}>
                Hai giocato per {Math.floor((Date.now()-sessionStart)/60000)} minuti.<br/>Torna dopo un po'!
              </p>
              <div style={{display:"flex",gap:12}}>
                <button onClick={() => setSessionStart(s => s - 5 * 60000)}
                  style={{flex:1,background:"rgba(255,255,255,.12)",border:"none",color:"white",borderRadius:50,padding:14,cursor:"pointer",fontSize:13,fontWeight:700}}>
                  +5 minuti
                </button>
                <button onClick={() => { stopMusic(); stopSong(); navigate("map"); }}
                  style={{flex:1,background:"white",border:"none",color:"#1a1a2e",borderRadius:50,padding:14,cursor:"pointer",fontSize:13,fontWeight:900}}>
                  Vai alla mappa
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tutorial overlay — shown once ever */}
        {!tutorialSeen && ci === 0 && !done && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:900,display:"flex",alignItems:"flex-end",justifyContent:"center",padding:24}}>
            <div className="slide-up" style={{background:"#241546",borderRadius:24,padding:"26px 22px",maxWidth:360,textAlign:"center",marginBottom:20,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
              <div style={{fontSize:52,marginBottom:10}}>👆</div>
              <h3 style={{color:"white",fontWeight:900,fontSize:20,marginBottom:8}}>Come si gioca!</h3>
              <div style={{color:"rgba(255,255,255,.8)",fontSize:14,lineHeight:1.8,marginBottom:22,textAlign:"left"}}>
                <div style={{marginBottom:6}}>📖 Leggi la domanda (o ascoltala con 🔊)</div>
                <div style={{marginBottom:6}}>👆 Tocca la risposta che ti sembra giusta</div>
                <div>⭐ Risposte giuste di fila = più stelle bonus!</div>
              </div>
              <button onClick={() => { setTutorialSeen(true); localStorage.setItem('mondomago_tutorial','1'); }}
                style={{background:"white",color:"#1a1a2e",border:"none",borderRadius:50,padding:"14px 40px",fontWeight:900,fontSize:16,cursor:"pointer"}}>
                Capito! Iniziamo! 🚀
              </button>
            </div>
          </div>
        )}
        {/* Pause modal */}
        {paused && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#241546",borderRadius:24,padding:"32px 24px",maxWidth:320,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)",width:"100%"}}>
              <div style={{fontSize:52,marginBottom:12}}>⏸</div>
              <h3 style={{color:"white",margin:"0 0 6px",fontSize:22,fontFamily:FF}}>In pausa</h3>
              <p style={{color:"rgba(255,255,255,.6)",fontSize:13,margin:"0 0 10px",lineHeight:1.5}}>
                Sfida {ci+1} di {challenges.length}
              </p>
              <div style={{background:P_TILE,borderRadius:14,padding:"8px 16px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                <span style={{fontSize:16}}>⭐</span>
                <span style={{color:"#FFD95A",fontWeight:800,fontSize:15}}>{sessionStars} stelle</span>
                <span style={{color:"rgba(255,255,255,.3)",fontSize:13,margin:"0 6px"}}>·</span>
                <span style={{fontSize:16}}>💎</span>
                <span style={{color:"#38BDF8",fontWeight:800,fontSize:15}}>{coins}</span>
              </div>
              {comp && (
                <div style={{marginBottom:20,display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                  <CompanionAvatar c={comp} size={64} anim="float" />
                  <span style={{color:"rgba(255,255,255,.55)",fontSize:12}}>Pronto a riprendere!</span>
                </div>
              )}
              <div style={{display:"flex",gap:10,flexDirection:"column"}}>
                <button onClick={handleResume}
                  style={{background:"linear-gradient(135deg,#22C55E,#16A34A)",border:"none",color:"white",borderRadius:50,padding:"16px",cursor:"pointer",fontSize:16,fontWeight:900,boxShadow:"0 4px 16px rgba(34,197,94,.35)"}}>
                  ▶ Continua!
                </button>
                <button onClick={handlePauseExit}
                  style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.7)",borderRadius:50,padding:"13px",cursor:"pointer",fontSize:14,fontWeight:700}}>
                  🚪 Esci dal mondo
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Exit confirmation modal */}
        {exitConfirm && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#241546",borderRadius:24,padding:"28px 24px",maxWidth:320,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
              <div style={{fontSize:52,marginBottom:12}}>🚪</div>
              <h3 style={{color:"white",margin:"0 0 8px",fontSize:20}}>Vuoi uscire?</h3>
              <p style={{color:"rgba(255,255,255,.65)",fontSize:14,margin:"0 0 24px",lineHeight:1.6}}>Perderai i progressi di questa sessione.</p>
              <div style={{display:"flex",gap:12}}>
                <button onClick={() => { stopMusic(); stopSong(); setExitConfirm(false); navigate("map"); }}
                  style={{flex:1,background:"rgba(255,255,255,.12)",border:"none",color:"white",borderRadius:50,padding:14,cursor:"pointer",fontSize:14,fontWeight:700}}>
                  Sì, esci
                </button>
                <button onClick={() => setExitConfirm(false)}
                  style={{flex:1,background:"white",border:"none",color:"#1a1a2e",borderRadius:50,padding:14,cursor:"pointer",fontSize:14,fontWeight:900}}>
                  Continua!
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Session alert: proactive rest reminder after 8 min */}
        {showSessionAlert && (
          <div className="session-alert" style={{
            position:"fixed",top:0,left:0,right:0,zIndex:2000,
            background:"linear-gradient(135deg,#7C3AED,#4F46E5)",
            padding:"12px 20px",textAlign:"center",
            boxShadow:"0 4px 20px rgba(0,0,0,.4)",
          }}>
            <div style={{fontSize:15,fontWeight:800,color:"white",marginBottom:2}}>
              ⏱️ Hai giocato per 8 minuti!
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,.75)"}}>
              Riposati gli occhi dopo questa sfida — poi torna per guadagnare ancora! 🌟
            </div>
          </div>
        )}
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,position:"relative",zIndex:1}}>
          <div style={{display:"flex",gap:6}}>
            <button onClick={() => setExitConfirm(true)}
              aria-label="Esci dalla sfida" style={{background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.1)",border:"none",color:youngBg?"#444":"white",borderRadius:12,padding:"11px 16px",cursor:"pointer",fontSize:14}}>
              ← Esci
            </button>
            <button onClick={() => {
              const t = ch.format==="story_choice" ? ch.situation
                : ch.format==="word_picture" ? `Trova l'immagine per la parola: ${ch.word}`
                : ch.id?.startsWith("ba_") ? `Quale immagine inizia con la lettera ${ch.id.replace("ba_","")}?`
                : ch.format==="rhyme_complete" ? ch.prompt.replace("___","...")
                : ch.prompt;
              speak(t);
            }}
              style={{background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.1)",border:"none",color:youngBg?"#444":"white",borderRadius:12,padding:"11px 14px",cursor:"pointer",fontSize:17}}
              title="Rileggi la domanda" aria-label="Rileggi la domanda">
              🔊
            </button>
            <button onClick={handlePause}
              aria-label="Metti in pausa" style={{background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.1)",border:"none",color:youngBg?"#444":"white",borderRadius:12,padding:"11px 14px",cursor:"pointer",fontSize:17}}>
              ⏸
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:14,position:"relative"}}>
            {world && <span style={{fontFamily:FF,fontSize:12,background:`${worldColor}33`,border:`1px solid ${worldColor}55`,borderRadius:20,padding:"2px 10px",color:worldColor}}>{world.emoji} {world.name}</span>}
            {starPop
              ? <span className="star-pop" style={{fontSize:22,color:"#FFD95A"}}>⭐+{pts}</span>
              : <span style={{fontWeight:800,color:youngBg?"#1a1a2e":"white"}}>⭐ {sessionStars}</span>
            }
            {coinPop && (
              <span className="coin-pop" style={{position:"absolute",top:-18,right:0,fontSize:17,color:"#38BDF8",fontWeight:900,pointerEvents:"none"}}>
                💎+{coinPopAmt}
              </span>
            )}
            {combo >= 2 && <span style={{fontSize:12,color:"#F97316",fontWeight:900}}>🔥×{combo}</span>}
          </div>
          {comp && <CompanionAvatar c={comp} size={56} anim={compAnim} talking={compTalking} mood={compMood} worldId={world?.id} />}
        </div>
        {/* Progress bar — Duolingo style */}
        <div style={{position:"relative",zIndex:1,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.10)",borderRadius:50,height:youngBg?16:12,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,.15)"}}>
            <div style={{
              background:ch.isBoss?"linear-gradient(90deg,#FF4444,#FF8800)":youngBg?`linear-gradient(90deg,${youngColors[0]},${youngColors[2]})`:"linear-gradient(90deg,#22C55E,#6DE0C6)",
              height:"100%", borderRadius:50,
              width:`${progressPct}%`,
              transition:"width .5s cubic-bezier(.22,1,.36,1)",
              boxShadow: done && isCorrect && ci === challenges.length-1
                ? "0 0 14px rgba(255,215,0,.9), 0 2px 6px rgba(34,197,94,.35)"
                : youngBg?"0 2px 6px rgba(255,82,82,.35)":"0 2px 6px rgba(34,197,94,.35)",
              animation: done && isCorrect && ci === challenges.length-1 ? "pulse .55s ease-in-out 3" : "none",
            }} />
          </div>
          <div style={{fontSize:11,fontWeight:900,color:youngBg?"#666":"rgba(255,255,255,.5)",whiteSpace:"nowrap",minWidth:32,textAlign:"right"}}>
            {ci+1}/{challenges.length}
          </div>
        </div>
        {/* Lyric ticker */}
        {songLyric && !youngBg && (
          <div style={{textAlign:"center",fontSize:11,color:"rgba(255,255,255,.38)",fontStyle:"italic",marginBottom:4,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",letterSpacing:.2}}>
            🎵 {songLyric}
          </div>
        )}
        {/* [A3] Auto-advance countdown ring */}
        {autoAdvancing && (
          <div style={{position:"fixed",bottom:28,right:24,zIndex:600,pointerEvents:"none"}}>
            <svg width={44} height={44} viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="21" fill="rgba(0,0,0,.55)" stroke="rgba(255,255,255,.15)" strokeWidth="2"/>
              <circle cx="22" cy="22" r="21" fill="none" stroke="#22C55E" strokeWidth="3"
                strokeDasharray="132" strokeDashoffset="132"
                style={{animation:"autoRing 1.55s linear both", transformOrigin:"center", transform:"rotate(-90deg)"}}/>
              <text x="22" y="27" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">→</text>
            </svg>
          </div>
        )}
        {/* [B1] Boss HP bar + mini monster */}
        {ch.isBoss && (
          <div className="pop-in boss-bg" style={{borderRadius:14,padding:"10px 16px",marginBottom:12,border:"1px solid rgba(255,80,80,.4)",position:"relative",zIndex:1}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:28,animation:"wiggle 0.8s ease-in-out infinite"}}>👾</span>
              <div style={{flex:1}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:10,opacity:.7,marginBottom:3}}>
                  <span style={{fontWeight:900,color:"#FF6B6B"}}>⚠️ BOSS — Vale 3 stelle!</span>
                  <span>❤️ {bossHPAnimated}%</span>
                </div>
                <div style={{background:"rgba(255,255,255,.1)",borderRadius:4,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#FF4444,#FF8800)",height:"100%",borderRadius:4,
                    width:`${bossHPAnimated}%`,transition:"width 1.2s cubic-bezier(.22,1,.36,1)"}} />
                </div>
              </div>
            </div>
            <div style={{textAlign:"center",fontSize:11,opacity:.55}}>Indebolito dalle sfide precedenti!</div>
          </div>
        )}
        {/* Challenge card */}
        {isLetterTrace ? (
          /* Letter trace card — big letter + word label */
          <div className={`slide-up ${cardAnim}`}
            style={{background:youngBg?"white":"rgba(255,255,255,.10)",borderRadius:youngBg?32:24,
              padding:"18px 20px 12px",marginBottom:10,
              border:`1px solid ${youngBg?"rgba(0,0,0,.06)":"rgba(255,255,255,.14)"}`,
              boxShadow:youngBg?"0 6px 30px rgba(0,0,0,.10)":"0 8px 32px rgba(0,0,0,.4)",
              position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,marginBottom:6,color:youngBg?"#666":"rgba(255,255,255,.5)"}}>✏️ TRACCIA LA LETTERA</div>
            <div style={{fontFamily:FF,fontSize:88,lineHeight:1,color:youngBg?"#764ba2":worldColor,
              textShadow:youngBg?"none":`0 0 30px ${worldColor}88`,marginBottom:4}}>
              {ch.letter}
            </div>
            <div style={{fontSize:15,fontWeight:700,color:youngBg?"#444":"rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span style={{fontSize:22}}>{ch.wordEmoji}</span> {ch.word}
            </div>
          </div>
        ) : isWordPic ? (
          /* Word-picture card — big word + "tap the emoji" */
          <div className={`slide-up ${cardAnim}`}
            style={{background:youngBg?"white":"rgba(255,255,255,.10)",borderRadius:youngBg?32:24,padding:"28px 20px",marginBottom:16,border:`1px solid ${youngBg?"rgba(0,0,0,.06)":"rgba(255,255,255,.14)"}`,boxShadow:youngBg?"0 6px 30px rgba(0,0,0,.10)":"0 8px 32px rgba(0,0,0,.4)",position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,opacity:.45,marginBottom:10,color:youngBg?"#666":"rgba(255,255,255,.5)"}}>📖 TROVA L'IMMAGINE</div>
            <div style={{
              fontSize:youngBg?42:36, fontWeight:900, letterSpacing:3,
              color:youngBg?"#1a1a2e":worldColor,
              textShadow:youngBg?"none":`0 0 20px ${worldColor}66`,
              fontFamily:"monospace",
              border:`3px solid ${youngBg?worldColor+"44":worldColor+"66"}`,
              borderRadius:16, padding:"12px 20px", display:"inline-block",
              background:youngBg?worldColor+"0d":"rgba(255,255,255,.06)",
            }}>
              {ch.word}
            </div>
            <div style={{fontSize:13,opacity:.4,marginTop:10,color:youngBg?"#555":"inherit"}}>Tocca l'immagine giusta!</div>
          </div>
        ) : isRhyme ? (
          /* Filastrocca card — parchment style */
          <div className={`slide-up ${cardAnim}`}
            style={{background:"linear-gradient(135deg,#FFF8E1,#FFF3CD)",borderRadius:28,padding:"24px 22px",marginBottom:16,border:"2px solid #FFD54F",boxShadow:"0 6px 28px rgba(0,0,0,.18)",position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:32,marginBottom:8}}>🎵 📜 🎵</div>
            <div onClick={() => { SFX.tap(); speak(ch.prompt.replace("___","...")); }}
              style={{cursor:"pointer"}}>
              {ch.prompt.split("\n").map((line, li) => {
                const parts = line.split("___");
                return (
                  <div key={li} style={{fontSize:youngBg?20:17,fontWeight:700,lineHeight:1.85,color:"#5D4037",fontStyle:"italic",marginBottom:li<ch.prompt.split("\n").length-1?4:0}}>
                    {parts.length > 1
                      ? <>{parts[0]}<span style={{display:"inline-block",borderBottom:"3px dashed #F57C00",minWidth:64,color:"#F57C00",fontStyle:"normal",fontWeight:900,padding:"0 6px"}}>___</span>{parts[1]}</>
                      : line}
                  </div>
                );
              })}
            </div>
            <div style={{fontSize:11,opacity:.5,marginTop:10,color:"#795548"}}>🔊 Tocca per ascoltare</div>
          </div>
        ) : isAlpha ? (
          /* Alphabet letter challenge — big letter + prompt */
          <div className={`slide-up ${cardAnim}`}
            style={{background:youngBg?"white":"rgba(255,255,255,.10)",borderRadius:youngBg?32:24,padding:"22px 20px",marginBottom:16,border:`1px solid ${youngBg?"rgba(0,0,0,.06)":"rgba(255,255,255,.14)"}`,boxShadow:youngBg?"0 6px 30px rgba(0,0,0,.10)":"0 8px 32px rgba(0,0,0,.4)",position:"relative",zIndex:1,textAlign:"center"}}>
            <div style={{fontSize:11,fontWeight:800,letterSpacing:2,opacity:.5,marginBottom:6,color:youngBg?"#666":"rgba(255,255,255,.5)"}}>🔤 TROVA LA LETTERA</div>
            <div onClick={() => { SFX.tap(); speak(`Quale immagine inizia con la lettera ${alphaLetter}?`); }}
              style={{
                fontFamily:FF, fontSize:100, lineHeight:1,
                color:youngBg?"#764ba2":worldColor,
                textShadow:youngBg?"none":`0 0 30px ${worldColor}88`,
                cursor:"pointer",
                display:"inline-block", marginBottom:6,
              }}>
              {alphaLetter}
            </div>
            <p style={{fontSize:youngBg?14:12,opacity:.6,margin:0,color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
              Tocca l'immagine che inizia con questa lettera!
            </p>
          </div>
        ) : (
          <div className={`slide-up ${cardAnim}`}
            style={{background:youngBg?"white":ch.isBoss?"rgba(255,60,60,.13)":"rgba(255,255,255,.10)",borderRadius:youngBg?32:24,padding:youngBg?"24px 22px":"22px 20px",marginBottom:16,border:`1px solid ${youngBg?"rgba(0,0,0,.06)":ch.isBoss?"rgba(255,80,80,.3)":"rgba(255,255,255,.14)"}`,boxShadow:youngBg?"0 6px 30px rgba(0,0,0,.10)":"0 8px 32px rgba(0,0,0,.4)",position:"relative",zIndex:1}}>
            <div onClick={() => { SFX.tap(); speak(ch.format==="story_choice"?ch.situation:ch.prompt); }}
              style={{fontSize:youngBg?52:40,marginBottom:12,cursor:"pointer",display:"inline-block"}}>{ch.emoji}</div>
            {isVis && (() => {
              const segs = typeof Intl?.Segmenter === "function"
                ? [...new Intl.Segmenter().segment(ch.visual)].map(s => s.segment).filter(s => s.trim())
                : Array.from(ch.visual).filter(c => c.trim());
              return (
                <div onClick={() => { SFX.tap(); speak(ch.prompt); }}
                  style={{display:"flex",flexWrap:"wrap",gap:youngBg?10:8,justifyContent:"center",marginBottom:14,cursor:"pointer"}}>
                  {segs.map((em, i) => (
                    <SvgAsset key={i} emoji={em} size={youngBg?60:50} state="default" />
                  ))}
                </div>
              );
            })()}
            {isStory
              ? <p style={{fontSize:youngBg?17:15,lineHeight:1.75,margin:0,color:youngBg?"#333":"inherit"}}>{ch.situation}</p>
              : <p style={{fontFamily:FF_DISPLAY,fontWeight:700,fontSize:isVis?(youngBg?26:23):youngBg?23:19,lineHeight:1.55,margin:0,whiteSpace:"pre-line",color:youngBg?"#222":"inherit"}}>{ch.prompt}</p>
            }
          </div>
        )}

        {/* Letter tracer — interactive SVG canvas */}
        {isLetterTrace && !done && (
          <div style={{display:"flex",justifyContent:"center",position:"relative",zIndex:1}}>
            <LetterTracer
              letter={ch.letter}
              youngBg={youngBg}
              onComplete={() => {
                setSelected(999);
                triggerOK(young ? 1 : 2);
                setSkills(s => addSkill(s, ch.type || "parole"));
                setResults(r => [...r, { type: ch.type || "parole", ok: true }]);
              }}
            />
          </div>
        )}
        {isLetterTrace && done && (
          <div style={{textAlign:"center",padding:"18px 0 4px",fontSize:18,fontFamily:FF,
            color:youngBg?"#15803D":"#6DE0C6"}}>
            ⭐ Bravissimo! Lettera completata!
          </div>
        )}

        {/* If-else tap — two large SE VERO / SE FALSO buttons */}
        {isIfElse && !done && (
          <div style={{position:"relative",zIndex:1,marginBottom:8}}>
            <div style={{background:"rgba(109,224,198,.14)",border:"1px solid rgba(109,224,198,.4)",
              borderRadius:16,padding:"10px 16px",marginBottom:14,textAlign:"center",
              fontSize:youngBg?15:13,fontWeight:800,color:"#6DE0C6",letterSpacing:.3}}>
              🔍 {ch.condition}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <button onClick={(e) => answerMC(0, e)}
                aria-label="Se vero"
                style={{background:youngBg?"rgba(109,224,198,.16)":"rgba(109,224,198,.2)",
                  border:"3px solid rgba(109,224,198,.6)",borderRadius:22,
                  padding:"22px 20px",color:youngBg?"#0F7A63":"#6DE0C6",
                  fontSize:youngBg?22:20,fontWeight:900,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  minHeight:72,transition:"all .15s",
                  boxShadow:"0 4px 16px rgba(109,224,198,.2)"}}>
                ✅ SE VERO
              </button>
              <button onClick={(e) => answerMC(1, e)}
                aria-label="Se falso"
                style={{background:youngBg?"rgba(239,68,68,.15)":"rgba(239,68,68,.2)",
                  border:"3px solid rgba(239,68,68,.6)",borderRadius:22,
                  padding:"22px 20px",color:youngBg?"#DC2626":"#F87171",
                  fontSize:youngBg?22:20,fontWeight:900,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:10,
                  minHeight:72,transition:"all .15s",
                  boxShadow:"0 4px 16px rgba(239,68,68,.2)"}}>
                ❌ SE FALSO
              </button>
            </div>
          </div>
        )}
        {isIfElse && done && (
          <div style={{textAlign:"center",padding:"10px 0 4px",fontSize:16,fontFamily:FF,
            color:isCorrect?(youngBg?"#15803D":"#6DE0C6"):(youngBg?"#DC2626":"#F87171")}}>
            {isCorrect ? "✅ Esatto!" : `La risposta giusta era: ${ch.correct === 0 ? "SE VERO ✅" : "SE FALSO ❌"}`}
          </div>
        )}

        {/* Debug find — numbered list, tap the wrong instruction */}
        {isDebug && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <p style={{textAlign:"center",fontSize:youngBg?13:12,opacity:.65,marginBottom:10,
              color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
              🐛 Tocca l'istruzione SBAGLIATA!
            </p>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ch.items.map((item, idx) => (
                <button key={idx} onClick={(e) => answerMC(idx, e)}
                  aria-label={`Risposta ${idx + 1}: ${item}`}
                  style={{background:youngBg?"rgba(0,0,0,.04)":"rgba(246,236,212,.08)",
                    border:`2px solid ${youngBg?"rgba(0,0,0,.10)":"rgba(255,194,75,.34)"}`,
                    borderRadius:16,padding:"14px 16px",
                    color:youngBg?"#1a1a2e":"white",
                    fontSize:youngBg?16:15,fontWeight:700,cursor:"pointer",
                    textAlign:"left",lineHeight:1.4,transition:"all .15s"}}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
        {isDebug && done && (
          <div style={{textAlign:"center",padding:"10px 0 4px",fontSize:15,fontFamily:FF,
            color:isCorrect?(youngBg?"#15803D":"#6DE0C6"):(youngBg?"#DC2626":"#F87171")}}>
            {isCorrect ? "🐛 Bug trovato! Ottimo lavoro!" : `Il bug era: ${ch.items[ch.correct]}`}
          </div>
        )}

        {/* Memory match — card flip grid */}
        {isMemMatch && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <p style={{textAlign:"center",fontSize:youngBg?13:12,opacity:.6,marginBottom:12,color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
              🃏 Tocca due carte per trovare le coppie!
            </p>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(4, 1fr)",
              gap:youngBg?10:8,
              maxWidth: ch.pairs?.length <= 4 ? 300 : 360,
              margin:"0 auto 10px",
            }}>
              {memCards.map((card, idx) => {
                const isUp      = mmFlipped.includes(idx) || mmMatched.includes(idx);
                const isOk      = mmMatched.includes(idx);
                const isEven    = card.face.length <= 2; // emoji vs text
                return (
                  <div key={idx} onClick={() => tapMemCard(idx)}
                    role="button" aria-label={isUp ? `Carta ${idx + 1}: ${card.face}` : `Carta ${idx + 1} coperta`}
                    style={{
                      aspectRatio:"1",
                      borderRadius:youngBg?18:14,
                      background: isOk
                        ? (youngBg?"rgba(109,224,198,.25)":"rgba(109,224,198,.22)")
                        : isUp
                          ? (youngBg?"rgba(255,255,255,.95)":"rgba(255,255,255,.18)")
                          : (youngBg?`${worldColor}22`:`${worldColor}33`),
                      border:`2.5px solid ${isOk?"#6DE0C6":isUp?(youngBg?"rgba(0,0,0,.15)":"rgba(255,255,255,.55)"):(worldColor+"66")}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize: isUp ? (isEven?32:11) : youngBg?26:22,
                      fontWeight: isUp && !isEven ? 800 : undefined,
                      color: isUp && !isEven ? (youngBg?"#1a1a2e":"white") : undefined,
                      cursor: mmLocked || isOk ? "default" : "pointer",
                      transition:"all .22s cubic-bezier(.34,1.56,.64,1)",
                      transform: isUp ? "scale(1.04)" : "scale(0.94)",
                      boxShadow: isOk ? "0 4px 14px rgba(109,224,198,.4)" : isUp ? "0 4px 12px rgba(0,0,0,.25)" : "none",
                      userSelect:"none",
                      padding: isEven ? 0 : "2px 4px",
                      textAlign:"center",lineHeight:1.2,
                    }}>
                    {isUp ? card.face : youngBg ? "⭐" : "?"}
                  </div>
                );
              })}
            </div>
            <div style={{textAlign:"center",fontSize:12,opacity:.5,color:youngBg?"#555":"rgba(255,255,255,.6)"}}>
              {mmMatched.length/2}/{ch.pairs?.length} coppie trovate
            </div>
          </div>
        )}
        {isMemMatch && done && (
          <div style={{textAlign:"center",padding:"12px 0 4px",fontSize:17,fontFamily:FF,color:youngBg?"#15803D":"#6DE0C6"}}>
            🃏 Tutte le coppie trovate! Bravissimo!
          </div>
        )}

        {/* Story choice */}
        {isStory && !storyChoice && (
          <div style={{display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:1}}>
            {ch.choices.map((c,idx) => (
              <button key={idx} onClick={() => answerStory(c)}
                aria-label={`Scelta ${idx + 1}: ${c.text}`}
                style={{background:"rgba(246,236,212,.08)",border:"2px solid rgba(255,194,75,.34)",borderRadius:22,padding:"20px 22px",color:"white",fontSize:17,fontWeight:700,cursor:"pointer",textAlign:"left",lineHeight:1.45}}>
                {c.text}
              </button>
            ))}
          </div>
        )}
        {/* story outcome handled by unified bottom sheet */}

        {/* Sequence tap */}
        {isSeq && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"flex",gap:6,marginBottom:10,justifyContent:"center"}}>
              {ch.items.map((_,i) => (
                <div key={i} style={{width:28,height:28,borderRadius:"50%",background:seqTaps.length>i?"#6DE0C6":"rgba(246,236,212,.12)",color:seqTaps.length>i?"#0F2E28":"inherit",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,transition:"all .2s"}}>
                  {seqTaps.length>i ? "✓" : i+1}
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:8}}>
              {ch.items.map((item,idx) => {
                const tapIdx = seqTaps.indexOf(idx);
                const tapped = tapIdx !== -1;
                return (
                  <button key={idx} onClick={() => answerSeq(idx)}
                    aria-label={`Passo: ${item}${tapped ? `, selezionato in posizione ${tapIdx + 1}` : ""}`}
                    style={{background:tapped?"rgba(109,224,198,.28)":seqError?"rgba(239,68,68,.15)":"rgba(246,236,212,.08)",
                      border:`2.5px solid ${tapped?"#6DE0C6":"rgba(255,194,75,.34)"}`,
                      borderRadius:16,padding:"16px 12px",color:"white",fontSize:15,fontWeight:700,cursor:"pointer",
                      position:"relative",transition:"all .2s",minHeight:64}}>
                    {tapped&&<span style={{position:"absolute",top:6,right:8,fontSize:11,opacity:.7,fontWeight:900}}>{tapIdx+1}</span>}
                    {item}
                  </button>
                );
              })}
            </div>
            {seqError && <p style={{textAlign:"center",opacity:.55,fontSize:13}}>Ricomincia dall'inizio! 🔄</p>}
          </div>
        )}
        {/* sequence feedback handled by unified bottom sheet */}

        {/* Drag-drop (tap-to-select, tap-to-place) */}
        {isDrag && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <p style={{textAlign:"center",fontSize:13,opacity:.6,marginBottom:10}}>
              Tocca un oggetto, poi tocca dove metterlo!
            </p>
            {/* Drop zones */}
            <div style={{display:"grid",gridTemplateColumns:`repeat(${ch.zones.length},1fr)`,gap:10,marginBottom:16}}>
              {ch.zones.map((zone, zi) => {
                const placedItem = dragPlaced[zi] !== undefined ? ch.items[dragPlaced[zi]] : null;
                return (
                  <div key={zi} onClick={() => { if (dragPicked !== null) answerDrag(zi, dragPicked); }}
                    role="button" aria-label={`Posizione ${zone}${placedItem ? `: contiene ${placedItem}` : ", vuota"}`}
                    style={{
                      minHeight:90, borderRadius:20,
                      border:`3px dashed ${dragPicked !== null ? (world?.color || "#A78BFA") : "rgba(255,255,255,.25)"}`,
                      background: placedItem ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                      cursor:"pointer", // C5: always pointer — Safari iOS won't fire click on cursor:default
                      gap:4, padding:"8px 4px",
                      transition:"border-color .2s, background .2s",
                      boxShadow: dragPicked !== null ? `0 0 12px ${(world?.color||"#A78BFA")}44` : "none",
                    }}>
                    {placedItem
                      ? <><div style={{fontSize:36}}>{placedItem}</div><div style={{fontSize:10,opacity:.7,fontWeight:700,textAlign:"center"}}>{zone}</div></>
                      : <div style={{fontSize:11,opacity:.5,textAlign:"center",lineHeight:1.4}}>{zone}</div>
                    }
                  </div>
                );
              })}
            </div>
            {/* Item tray */}
            <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
              {ch.items.map((item, ii) => {
                const isPlaced = Object.values(dragPlaced).includes(ii);
                const isPicked = dragPicked === ii;
                return (
                  <div key={ii} onClick={() => !isPlaced && answerDrag(-1, ii)}
                    role="button" aria-label={`Oggetto: ${item}${isPlaced ? ", già posizionato" : ""}`}
                    className="ans-vis"
                    style={{
                      width:72, height:72, borderRadius:18,
                      background: isPicked ? `${world?.color || "#A78BFA"}44` : "rgba(246,236,212,.08)",
                      border:`3px solid ${isPicked ? (world?.color||"#A78BFA") : "rgba(255,194,75,.34)"}`,
                      display:"flex",alignItems:"center",justifyContent:"center",
                      fontSize:36, cursor: isPlaced ? "default" : "pointer",
                      opacity: isPlaced ? 0.25 : 1,
                      transform: isPicked ? "scale(1.12)" : "scale(1)",
                      transition:"all .15s",
                      boxShadow: isPicked ? `0 0 16px ${(world?.color||"#A78BFA")}66` : "none",
                    }}>
                    {item}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* drag-drop feedback handled by unified bottom sheet */}

        {/* ── QUIZ CARTOON ── Indovina l'emoji oscurata ─────────────────────── */}
        {isCartoon && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:11,fontWeight:800,letterSpacing:2,opacity:.5,marginBottom:12,
                color:youngBg?"#666":"rgba(255,255,255,.5)"}}>
                🔍 INDOVINA CHI È!
              </div>
              <div style={{
                fontSize:110,lineHeight:1,display:"inline-block",
                filter:"blur(8px) brightness(0.65) saturate(0)",
                opacity:0.85,
                transition:"filter .55s cubic-bezier(.34,1.56,.64,1), transform .55s cubic-bezier(.34,1.56,.64,1)",
                userSelect:"none",
              }}>
                {ch.cartoonEmoji}
              </div>
              <p style={{fontSize:13,opacity:.55,margin:"10px 0 0",
                color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
                Tocca una risposta per scoprirlo!
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:youngBg?14:10}}>
              {ch.options.map((opt, idx) => {
                let bg = "rgba(246,236,212,.08)", border = "rgba(255,194,75,.34)";
                if (youngBg) { const yc=["#FF6B9D","#A78BFA","#38BDF8","#34D399"]; bg=yc[idx%4]+"22"; border=yc[idx%4]; }
                return (
                  <button key={`${ci}-qc-${idx}`} onClick={e => answerMC(idx, e)}
                    className={`ans-btn ans-btn-idle ans-enter`}
                    style={{
                      animationDelay:`${idx*80}ms`,
                      background:bg, border:`3px solid ${border}`,
                      borderRadius:youngBg?22:18, color:youngBg?(["#FF6B9D","#A78BFA","#38BDF8","#34D399"][idx%4]):"white",
                      fontWeight:youngBg?800:600, cursor:"pointer",
                      height:youngBg?96:84, fontSize:youngBg?19:17,
                      display:"flex",alignItems:"center",justifyContent:"center",
                    }}>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {isCartoon && done && (
          <div style={{textAlign:"center",padding:"14px 0 4px"}}>
            <div className="cartoon-reveal" style={{fontSize:96,lineHeight:1,marginBottom:10}}>
              {ch.cartoonEmoji}
            </div>
            <div style={{fontSize:17,fontFamily:"Fredoka One, sans-serif",
              color:isCorrect?(youngBg?"#15803D":"#6DE0C6"):(youngBg?"#DC2626":"#F87171")}}>
              {isCorrect ? `✓ Era ${ch.options[ch.correct]}!` : `Era ${ch.options[ch.correct]}!`}
            </div>
          </div>
        )}

        {/* ── COLOR ZONES ── Colora le zone nel colore giusto ────────────────── */}
        {isColorZone && !done && ch.zones && (
          <div style={{position:"relative",zIndex:1}}>
            <p style={{textAlign:"center",fontSize:13,opacity:.6,marginBottom:12,
              color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
              🎨 Scegli un colore, poi tocca una zona!
            </p>
            <div style={{display:"flex",justifyContent:"center",marginBottom:16}}>
              <svg width={ch.gridWidth||280} height={ch.gridHeight||120}
                viewBox={`0 0 ${ch.gridWidth||280} ${ch.gridHeight||120}`}
                style={{borderRadius:14,background:youngBg?"rgba(255,255,255,.92)":"rgba(0,0,0,.18)",
                  border:`2px solid ${youngBg?"rgba(0,0,0,.1)":"rgba(255,194,75,.28)"}`}}>
                {ch.zones.map(zone => {
                  const filled = colorZoneColors[zone.id];
                  return (
                    <g key={zone.id} onClick={() => {
                      if (!colorZonePicked) return;
                      SFX.tap();
                      const nc = { ...colorZoneColors, [zone.id]: colorZonePicked };
                      setColorZoneColors(nc);
                      setColorZonePicked(null);
                      if (ch.zones.every(z => nc[z.id] === z.targetColor)) {
                        setSelected(999);
                        const pts = ch.isBoss ? 3 : young ? 1 : 2;
                        triggerOK(pts); setSkills(s => addSkill(s, ch.type||"creativita"));
                        if (comp) { const msg = comp.onCorrect(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
                        setResults(r => [...r, { type: ch.type||"creativita", ok: true }]);
                        setTimeout(() => setShowFeedback(true), 280);
                      }
                    }} style={{cursor:colorZonePicked?"pointer":"default"}}>
                      <circle cx={zone.x+(zone.size/2)} cy={zone.y+(zone.size/2)} r={zone.size/2}
                        fill={filled||"rgba(200,200,200,.25)"}
                        stroke={filled===zone.targetColor?"#6DE0C6":(colorZonePicked&&!filled?"rgba(255,194,75,.75)":"rgba(180,180,180,.4)")}
                        strokeWidth={filled===zone.targetColor?3:2}
                        style={{transition:"all .25s"}} />
                      <text x={zone.x+(zone.size/2)} y={zone.y+(zone.size/2)+5}
                        textAnchor="middle" fontSize={14} fontWeight="900"
                        fill={filled?"rgba(255,255,255,.9)":(youngBg?"#888":"rgba(255,255,255,.5)")}
                        style={{pointerEvents:"none"}}>
                        {zone.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <p style={{fontSize:11,opacity:.45,textAlign:"center",marginBottom:8,
              color:youngBg?"#666":"rgba(255,255,255,.5)"}}>Scegli un colore:</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap",marginBottom:8}}>
              {ch.colors.map((color, ci2) => (
                <button key={ci2} onClick={() => { SFX.tap(); setColorZonePicked(color); }}
                  aria-label={`Colore ${ci2 + 1}`} aria-pressed={colorZonePicked === color}
                  style={{
                    width:56,height:56,borderRadius:16,background:color,cursor:"pointer",
                    border:`4px solid ${colorZonePicked===color?(youngBg?"#333":"white"):"rgba(255,255,255,.18)"}`,
                    boxShadow:colorZonePicked===color?`0 0 18px ${color}88`:"0 2px 6px rgba(0,0,0,.2)",
                    transform:colorZonePicked===color?"scale(1.12)":"scale(1)",
                    transition:"all .15s",fontSize:11,fontWeight:800,color:"white",
                    textShadow:"0 1px 3px rgba(0,0,0,.45)",
                  }}>
                  {ch.colorNames?.[ci2]?.slice(0,3)||""}
                </button>
              ))}
            </div>
            <div style={{textAlign:"center",fontSize:12,opacity:.45,
              color:youngBg?"#555":"rgba(255,255,255,.55)"}}>
              {Object.keys(colorZoneColors).filter(k=>colorZoneColors[k]===ch.zones.find(z=>z.id===k)?.targetColor).length}/{ch.zones.length} zone corrette
            </div>
          </div>
        )}
        {isColorZone && done && (
          <div style={{textAlign:"center",padding:"14px 0 4px",fontSize:17,fontFamily:"Fredoka One, sans-serif",
            color:youngBg?"#15803D":"#6DE0C6"}}>
            🎨 Bellissimo! Sei un artista!
          </div>
        )}

        {/* ── PUZZLE SWAP ── Sliding puzzle con emoji ────────────────────────── */}
        {isPuzzleSwap && puzzleGrid && !done && (
          <div style={{position:"relative",zIndex:1}}>
            <p style={{textAlign:"center",fontSize:13,opacity:.6,marginBottom:12,
              color:youngBg?"#555":"rgba(255,255,255,.7)"}}>
              🧩 Tocca un pezzo accanto al buco per spostarlo!
            </p>
            {(() => {
              const size = ch.size || 2;
              const tileSize = size === 2 ? 88 : size === 3 ? 72 : 60;
              const gap = 8;
              return (
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:14}}>
                  <div style={{
                    display:"grid",
                    gridTemplateColumns:`repeat(${size}, ${tileSize}px)`,
                    gap:`${gap}px`,
                    padding:12,
                    background:youngBg?"rgba(255,255,255,.9)":"rgba(0,0,0,.18)",
                    borderRadius:16,
                    border:`2px solid ${youngBg?"rgba(0,0,0,.1)":"rgba(255,194,75,.28)"}`,
                  }}>
                    {puzzleGrid.map((itemIdx, gridIdx) => {
                      const isEmpty = itemIdx === -1;
                      return (
                        <div key={gridIdx} onClick={() => swapPuzzleTile(gridIdx)}
                          role="button" aria-label={isEmpty ? "Spazio vuoto" : `Tessera ${gridIdx + 1}`}
                          className={isEmpty?"":"ans-btn"}
                          style={{
                            width:tileSize,height:tileSize,borderRadius:12,
                            background:isEmpty
                              ?(youngBg?"#f0f0f0":"rgba(255,255,255,.06)")
                              :(youngBg?"white":"rgba(255,255,255,.12)"),
                            border:isEmpty
                              ?`2px dashed ${youngBg?"rgba(0,0,0,.15)":"rgba(255,255,255,.2)"}`
                              :`2px solid ${youngBg?"rgba(0,0,0,.1)":"rgba(255,194,75,.32)"}`,
                            display:"flex",alignItems:"center",justifyContent:"center",
                            fontSize:size===2?46:size===3?34:26,
                            cursor:isEmpty?"default":"pointer",
                            transition:"all .15s cubic-bezier(.34,1.56,.64,1)",
                            boxShadow:isEmpty?"inset 0 2px 4px rgba(0,0,0,.08)":"0 2px 6px rgba(0,0,0,.1)",
                            userSelect:"none",
                          }}>
                          {!isEmpty && ch.emojis[itemIdx]}
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop:10,fontSize:12,opacity:.45,
                    color:youngBg?"#555":"rgba(255,255,255,.55)"}}>
                    Mosse: {puzzleMoves}
                  </div>
                </div>
              );
            })()}
          </div>
        )}
        {isPuzzleSwap && !puzzleGrid && !done && (
          <div style={{textAlign:"center",padding:"40px 20px",fontSize:32}}>🧩</div>
        )}
        {isPuzzleSwap && done && (
          <div style={{textAlign:"center",padding:"14px 0 4px",fontSize:17,fontFamily:"Fredoka One, sans-serif",
            color:youngBg?"#15803D":"#6DE0C6"}}>
            🧩 Perfetto in {puzzleMoves} {puzzleMoves===1?"mossa":"mosse"}!
          </div>
        )}

        {/* Multiple choice / visual tap */}
        {(isMC || isVis || isRhyme || isWordPic || isAlpha) && (
          <div style={{position:"relative",zIndex:1}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:(isVis||isWordPic)?14:10}}>
              {ch.options.map((opt,idx) => {
                let bg = "rgba(246,236,212,.08)", border = "rgba(255,194,75,.34)";
                let correct = false, wrong = false;
                if (done) {
                  if (idx === ch.correct)    { bg="rgba(109,224,198,.24)"; border="#6DE0C6"; correct=true; }
                  else if (idx === selected) { bg="rgba(239,68,68,.28)"; border="#F87171"; wrong=true; }
                }
                return (
                  <button key={`${ci}-${idx}`} onClick={(e) => answerMC(idx, e)}
                    aria-label={`Risposta ${idx + 1}: ${opt}`}
                    className={`${(isVis||isWordPic||isAlpha)?"ans-vis":"ans-btn"}${!done?" ans-btn-idle ans-enter":""}${correct?" correct-flash":""}${wrongIdx===idx?" shake":""}`}
                    style={{
                      animationDelay: !done ? `${idx * 80}ms` : undefined,
                      background:bg, border:`3px solid ${border}`,
                      borderRadius: (isVis||isWordPic||isAlpha) ? 28 : 18,
                      color: "white",
                      fontWeight: 600,
                      cursor:done?"default":"pointer",
                      height: (isVis||isWordPic) ? 148 : isAlpha ? 120 : (young ? 92 : 82),
                      fontSize: isAlpha ? 52 : 18,
                      display:"flex", flexDirection:(isVis||isWordPic)?"column":"row",
                      alignItems:"center", justifyContent:"center",
                      padding: (isVis||isWordPic) ? "10px 4px 8px" : isAlpha ? 0 : "16px 12px",
                      gap: (isVis||isWordPic) ? 4 : 0,
                      transform: wrong ? "scale(0.97)" : correct ? "scale(1.04)" : "scale(1)",
                      boxShadow: correct ? "0 0 22px rgba(109,224,198,.45)" : (done&&wrong) ? "0 0 18px rgba(239,68,68,.5)" : "none",
                      position:"relative",
                      overflow:"hidden",
                    }}>
                    {(isVis||isWordPic) ? (
                      <>
                        <SvgAsset
                          emoji={opt}
                          size={94}
                          state={done ? (idx===ch.correct ? "correct" : idx===selected ? "wrong" : "dimmed") : "default"}
                        />
                        {(isWordPic) && (
                          <span style={{fontSize:11,opacity:done?0.6:0.45,lineHeight:1,maxWidth:"90%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                            {opt}
                          </span>
                        )}
                      </>
                    ) : opt}
                    {correct && <span style={{position:"absolute",top:6,right:8,fontSize:18,lineHeight:1}}>✓</span>}
                  </button>
                );
              })}
            </div>
            {/* MC/visual feedback handled by unified bottom sheet */}
          </div>
        )}

        {/* ── Unified fixed bottom feedback sheet (all formats) ──────────────── */}
        {showFeedback && (
          <div className="feedback-sheet" style={{
            position:"fixed", bottom:0, left:0, right:0, zIndex:800,
            borderRadius:"28px 28px 0 0",
            borderTop:`3px solid ${isCorrect ? "#22C55E" : "#FBBF24"}`,
            background: isCorrect
              ? youngBg ? "linear-gradient(180deg,#F0FFF4,#DCFCE7)"       : "linear-gradient(180deg,rgba(20,83,45,.97),rgba(21,128,61,.97))"
              : youngBg ? "linear-gradient(180deg,#FFFBEB,#FEF9C3)"       : "linear-gradient(180deg,rgba(120,53,15,.97),rgba(133,77,14,.97))",
            padding:"18px 20px",
            paddingBottom:"max(env(safe-area-inset-bottom,0px),18px)",
            boxShadow:"0 -12px 48px rgba(0,0,0,.45)",
          }}>
            <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:14}}>
              <div style={{fontSize:youngBg?48:36,lineHeight:1,flexShrink:0}}>
                {isCorrect ? "🎉" : "🌟"}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{
                  fontFamily:FF, fontSize:youngBg?22:19,
                  color:isCorrect?(youngBg?"#15803D":"#6DE0C6"):(youngBg?"#D97706":"#FCD34D"),
                  marginBottom:3,
                }}>
                  {isCorrect
                    ? (isDrag ? "Abbinamenti perfetti!" : isSeq ? "Ordine perfetto!" : "Perfetto!")
                    : (["Quasi ci sei!","Riprova, ce la fai!","Non mollare!","Ancora un tentativo!","Ci siamo quasi!","Dai, una volta ancora!"])[Math.min((wrongStreak||1)-1,5)]}
                </div>
                {/* Story narrative outcome */}
                {isStory && storyChoice?.outcome && (
                  <div style={{fontSize:13,lineHeight:1.5,marginBottom:4,color:youngBg?"#444":"rgba(255,255,255,.88)"}}>
                    {storyChoice.outcome}
                  </div>
                )}
                {/* Correct answer revealed on wrong (MC/visual/rhyme/word) */}
                {!isCorrect && !isStory && !isSeq && !isDrag && ch.options && (
                  <div style={{fontSize:13,fontWeight:700,color:youngBg?"#92400E":"rgba(255,255,255,.8)"}}>
                    Risposta giusta:{" "}
                    <span style={{color:youngBg?"#D97706":"#FCD34D"}}>{ch.options[ch.correct]}</span>
                  </div>
                )}
                {/* Skill-based educational tip after wrong answer */}
                {!isCorrect && ch.type && (
                  <div style={{
                    fontSize:12,lineHeight:1.5,marginTop:6,
                    color:youngBg?"#78350F":"rgba(255,255,255,.65)",
                    background:youngBg?"rgba(251,191,36,.15)":"rgba(255,255,255,.07)",
                    borderRadius:10,padding:"5px 10px",
                    borderLeft:`3px solid ${youngBg?"#FBBF24":"rgba(251,191,36,.5)"}`,
                  }}>
                    {getSkillTip(ch.type)}
                  </div>
                )}
                {/* Companion message */}
                {feedbackMsg && (
                  <div style={{fontSize:12,lineHeight:1.4,marginTop:4,color:youngBg?"#555":"rgba(255,255,255,.72)"}}>
                    {feedbackMsg}
                  </div>
                )}
              </div>
              {comp && (
                <CompanionAvatar c={comp} size={youngBg?52:44} anim="bounce" talking={compTalking} mood={compMood} />
              )}
            </div>
            <button onClick={next} style={{
              width:"100%",
              background:isCorrect ? "#22C55E" : youngBg ? "#FBBF24" : "rgba(255,255,255,.18)",
              color:isCorrect ? "white" : youngBg ? "#1a1a2e" : "white",
              border:isCorrect||youngBg ? "none" : "2px solid rgba(255,255,255,.35)",
              borderRadius:50, padding:"15px",
              fontFamily:FF, fontSize:20, cursor:"pointer",
              boxShadow:isCorrect ? "0 4px 20px rgba(34,197,94,.45)" : youngBg ? "0 4px 16px rgba(251,191,36,.35)" : "none",
            }}>
              {ci < challenges.length-1 ? "Avanti →" : "Fine Missione! 🏁"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // ════════════════════ SCREEN: WORLD END ══════════════════════════════════
  if (screen === "world_end" && arc) {
    const correct = results.filter(r => r.ok).length;
    const pct     = results.length ? Math.round((correct/results.length)*100) : 0;
    return (
      <div key="world_end" className={screenAnim} style={{minHeight:"100dvh",background:`linear-gradient(160deg,#1B1035,${arc.color}55,#140B29)`,color:"#F6ECD4",padding:28,paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        {G}
        <div className="pop-in" style={{fontSize:72,marginBottom:4,animationDelay:"0s"}}>{arc.reward_emoji}</div>
        <div className="bounce" style={{marginBottom:14,animationDelay:".25s",display:"flex"}}><WorldIcon id={world.id} color={world.color} size={64} /></div>
        <h2 className="slide-up" style={{fontFamily:FF_DISPLAY,fontSize:28,color:SG_GOLD,marginBottom:12,animationDelay:".5s"}}> Mondo completato! 🏆</h2>
        <p className="fade-in" style={{fontSize:15,lineHeight:1.75,opacity:.9,marginBottom:24,maxWidth:360,animationDelay:".7s"}}>{arc.outro}</p>
        {comp && (
          <div className="slide-up" style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"12px 18px",marginBottom:22,fontSize:14,maxWidth:360,animationDelay:".95s",display:"flex",alignItems:"center",gap:12}}>
            <CompanionAvatar c={comp} size={38} />
            <span>{comp.onWorld()}</span>
          </div>
        )}
        <div className="pop-in glow" style={{background:"rgba(255,194,75,.13)",borderRadius:24,padding:"20px 32px",marginBottom:24,border:"2px solid rgba(255,194,75,.45)",animationDelay:"1.2s"}}>
          <div style={{fontSize:50}}>{arc.reward_emoji}</div>
          <div style={{fontFamily:FF_DISPLAY,fontSize:22,marginTop:8,color:SG_GOLD}}>{arc.reward_name}</div>
          <div style={{fontSize:12,opacity:.65,marginTop:4}}>Sbloccato per {comp?.name}!</div>
        </div>
        {/* Diploma prima volta */}
        {isFirstWorldComplete && (
          <div className="pop-in glow" style={{background:"linear-gradient(135deg,rgba(255,215,0,.18),rgba(255,170,0,.1))",borderRadius:24,padding:"16px 24px",marginBottom:18,border:"2px solid rgba(255,215,0,.55)",textAlign:"center",width:"100%",maxWidth:360,animationDelay:"1.25s"}}>
            <div style={{fontSize:44,marginBottom:4}}>🏅</div>
            <div style={{fontFamily:FF,fontSize:18,color:"#FFD95A",marginBottom:2}}>Prima volta!</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.75)",lineHeight:1.5}}>Hai completato questo mondo per la prima volta. Sei un vero campione!</div>
          </div>
        )}
        {/* Bonus 100% accuratezza */}
        {perfectBonus && (
          <div className="pop-in glow" style={{background:"linear-gradient(135deg,rgba(34,197,94,.2),rgba(16,185,129,.1))",borderRadius:20,padding:"12px 24px",marginBottom:14,border:"2px solid rgba(34,197,94,.5)",display:"flex",alignItems:"center",gap:12,width:"100%",maxWidth:360,animationDelay:"1.4s"}}>
            <span style={{fontSize:32}}>🎯</span>
            <div style={{textAlign:"left"}}>
              <div style={{fontFamily:FF,fontSize:16,color:"#6DE0C6"}}>Punteggio perfetto! +5 💎</div>
              <div style={{fontSize:12,opacity:.7}}>Tutte le risposte corrette</div>
            </div>
          </div>
        )}
        {world?.id === "daily" && (
          <div className="pop-in glow" style={{background:"rgba(255,213,0,.18)",borderRadius:20,padding:"12px 28px",marginBottom:16,border:"2px solid rgba(255,213,0,.5)",fontSize:16,fontWeight:900,color:"#FFD95A",animationDelay:"1.35s"}}>
            🌟 +3 stelle bonus!
          </div>
        )}
        <div className="pop-in" style={{background:SG_TILE,border:SG_BR,borderRadius:20,padding:"10px 20px",marginBottom:14,display:"flex",alignItems:"center",gap:10,animationDelay:"1.1s"}}>
          <span style={{fontSize:28}}>💎</span>
          <div>
            <div style={{fontFamily:FF_MONO,fontSize:20,color:SG_GOLD,lineHeight:1}}>+{sessionStars + (perfectBonus ? 5 : 0)}</div>
            <div style={{fontSize:11,opacity:.7}}>monete magiche{perfectBonus ? " (+5 perfetto!)" : ""}</div>
          </div>
          <div style={{marginLeft:"auto",textAlign:"right"}}>
            <div style={{fontSize:11,opacity:.5}}>totale</div>
            <div style={{fontFamily:FF_MONO,fontSize:16,color:SG_GOLD}}>{coins} 💎</div>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20,width:"100%",maxWidth:360}}>
          {[{n:"star",c:"#FFC24B",v:sessionStars,l:"stelle"},{n:"check",c:"#6DE0C6",v:correct,l:"giuste"},{n:"target",c:"#C084FC",v:`${pct}%`,l:"precisione"},{n:"flame",c:"#FB923C",v:combo,l:"combo max"}].map((s,idx) => (
            <div key={idx} className="pop-in" style={{textAlign:"center",background:SG_TILE,borderRadius:16,padding:"12px 6px",animationDelay:`${1.55 + idx*.1}s`}}>
              <div style={{height:26,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={s.n} color={s.c} size={24} /></div>
              <div style={{fontFamily:FF_MONO,fontSize:20,marginTop:4}}>{s.v}</div>
              <div style={{opacity:.5,fontSize:10,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Skills trained this session */}
        {(() => {
          const trained = [...new Set(results.map(r => getSkill(r.type)))];
          return trained.length > 0 && (
            <div className="fade-in" style={{background:SG_TILE,border:SG_BR,borderRadius:18,padding:"12px 18px",marginBottom:20,width:"100%",maxWidth:360,textAlign:"left",animationDelay:"1.9s"}}>
              <div style={{fontSize:11,opacity:.5,fontWeight:800,marginBottom:8,letterSpacing:1}}>ABILITÀ ALLENATE OGGI</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {trained.map(sk => {
                  const s = SKILLS.find(s => s.id === sk);
                  return s ? (
                    <span key={sk} style={{background:`${s.color}33`,border:`1px solid ${s.color}55`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:s.color,display:"inline-flex",alignItems:"center",gap:6}}>
                      <SkillIcon id={s.id} color={s.color} size={15} />{s.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })()}
        <div className="fade-in" style={{width:"100%",maxWidth:360,marginBottom:12,animationDelay:"2.1s"}}>
          {/* Skills breakdown */}
          <div style={{background:SG_TILE,border:SG_BR,borderRadius:18,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:11,opacity:.5,fontWeight:800,marginBottom:10,letterSpacing:1}}>ABILITÀ ALLENATE</div>
            {SKILLS.map(sk => (
              <div key={sk.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5}}><SkillIcon id={sk.id} color={sk.color} size={15} />{sk.name}</span>
                  <span style={{color:sk.color,fontWeight:800}}>Lv.{skills[sk.id]}</span>
                </div>
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:7}}>
                  <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(skills[sk.id]/10)*100}%`,transition:"width .9s cubic-bezier(.22,1,.36,1)"}} />
                </div>
              </div>
            ))}
          </div>
          {navigator.share && (
            <button onClick={() => {
              const correct = results.filter(r => r.ok).length;
              navigator.share({
                title: "MondoMago 🧙‍♂️",
                text: `${childName} ha completato "${arc.reward_name}" in MondoMago! ${sessionStars}⭐ guadagnate, ${correct}/${results.length} risposte giuste. Livello: ${getLevel(totalStars).title} ${getLevel(totalStars).emoji}`,
                url: window.location.href,
              }).catch(() => {});
            }} style={{width:"100%",background:SG_CARD,color:SG_GOLD,border:SG_BR,borderRadius:50,padding:"14px",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10}}>
              📤 Condividi il risultato!
            </button>
          )}
          {world?.id && WORLD_SONGS[world.id] && (
            <button onClick={() => { warmUpAudio(); startSong(world.id); }}
              style={{width:"100%",background:`linear-gradient(135deg,${arc.color}44,${arc.color}22)`,color:"white",border:`1px solid ${arc.color}66`,borderRadius:50,padding:"13px",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              🎵 Riascolta la canzone del mondo!
            </button>
          )}
          <button onClick={() => navigate("session_stats")}
            style={{width:"100%",background:SG_TILE,color:SG_PARCH,border:SG_BR,borderRadius:50,padding:"13px",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10}}>
            📊 Vedi statistiche dettagliate
          </button>
          <button onClick={() => { navigate("map"); setSessionStars(0); setResults([]); setCombo(0); }}
            style={{width:"100%",fontFamily:FF_DISPLAY,background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"16px",fontWeight:800,fontSize:17,cursor:"pointer",boxShadow:"0 6px 20px rgba(255,194,75,.4)"}}>
            🗺️ Torna ai Mondi
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════ SCREEN: SESSION STATS ══════════════════════════════
  if (screen === "session_stats") {
    const correct = results.filter(r => r.ok).length;
    const pct     = results.length ? Math.round((correct/results.length)*100) : 0;
    return (
      <div key="stats" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:SG_PARCH,padding:24,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        {G}
        <div className="pop-in" style={{fontSize:60,marginBottom:12}}>{pct===100?"🏆":pct>=60?"⭐":"💪"}</div>
        <h2 style={{fontFamily:FF_DISPLAY,fontSize:26,color:SG_GOLD,marginBottom:8}}>{pct===100?"Missione perfetta!":pct>=60?"Ottimo lavoro!":"Bel tentativo!"}</h2>
        {comp && (
          <div style={{background:SG_CARD,border:SG_BR,borderRadius:20,padding:"12px 18px",marginBottom:18,fontSize:13,maxWidth:320,display:"flex",alignItems:"center",gap:12}}>
            <CompanionAvatar c={comp} size={36} />
            <span>{pct>=60?comp.onCorrect():comp.onWrong()}</span>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",maxWidth:340,marginBottom:22}}>
          {[{n:"check",c:"#6DE0C6",v:correct,l:"Corrette"},{n:"star",c:"#FFC24B",v:sessionStars,l:"Stelle"},{n:"target",c:"#C084FC",v:`${pct}%`,l:"Precisione"},{n:"flame",c:"#FB923C",v:combo,l:"Combo"}].map((s,i) => (
            <div key={i} className="pop-in" style={{background:SG_TILE,border:SG_BR,borderRadius:18,padding:"16px 10px",animationDelay:`${i*.07}s`}}>
              <div style={{height:28,display:"flex",alignItems:"center",justifyContent:"center"}}><Icon name={s.n} color={s.c} size={26} /></div>
              <div style={{fontFamily:FF_MONO,fontSize:22,marginTop:6,color:s.c}}>{s.v}</div>
              <div style={{fontSize:11,opacity:.55,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{width:"100%",maxWidth:340,background:SG_TILE,border:SG_BR,borderRadius:20,padding:"16px 18px",marginBottom:22,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:12,letterSpacing:1}}>LE TUE ABILITÀ</div>
          {SKILLS.map(sk => (
            <div key={sk.id} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:6}}><SkillIcon id={sk.id} color={sk.color} size={15} />{sk.name}</span>
                <span style={{fontFamily:FF_MONO,color:sk.color,fontWeight:700}}>Lv.{skills[sk.id]}</span>
              </div>
              <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:8}}>
                <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(skills[sk.id]/10)*100}%`,transition:"width .9s cubic-bezier(.22,1,.36,1)"}} />
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,width:"100%",maxWidth:340}}>
          <button onClick={() => navigate(arc ? "world_end" : "map")}
            style={{flex:1,background:SG_TILE,color:SG_PARCH,border:SG_BR,borderRadius:50,padding:"14px",fontWeight:800,fontSize:14,cursor:"pointer"}}>
            ← Risultati
          </button>
          <button onClick={() => { navigate("map"); setSessionStars(0); setResults([]); setCombo(0); }}
            style={{flex:2,fontFamily:FF_DISPLAY,background:SG_GOLD_GRAD,color:SG_INK,border:"none",borderRadius:50,padding:"14px",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 6px 20px rgba(255,194,75,.4)"}}>
            🗺️ Torna ai Mondi
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════ SCREEN: SKILLS ═════════════════════════════════════
  const SKILL_DESC = {
    logica:     "Sequenze, pattern e problem solving",
    numeri:     "Contare, calcolare e confrontare",
    creativita: "Colori, musica e fantasia",
    empatia:    "Emozioni, gentilezza e amicizia",
    parole:     "Lettura, rime e storie",
  };
  // ════════════════════ SCREEN: STORIA / SIGILLO ═══════════════════════════════
  if (screen === "story_book") {
    const completedCount = SIGILLO_FRAGMENTS.filter(f =>
      items.find(it => it.emoji === STORY_ARCS[f.worldId]?.reward_emoji)
    ).length;
    const isComplete = completedCount === SIGILLO_FRAGMENTS.length;
    return (
      <div key="story_book" className={screenAnim}
        style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:24,paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)"}}>
        {G}
        <button onClick={() => navigate("map")}
          style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",marginBottom:20,fontSize:14,fontWeight:700}}>
          ← Mappa
        </button>
        <div style={{textAlign:"center",marginBottom:24}}>
          <h2 style={{fontFamily:FF_DISPLAY,margin:"0 0 6px",fontSize:26,fontWeight:900,color:SG_GOLD}}>📖 Il Libro della Storia</h2>
          <p style={{opacity:.55,fontSize:13,margin:0}}>Il Sigillo Magico si ricompone con ogni mondo completato</p>
        </div>
        {/* Sigillo SVG grande */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <svg width={200} height={200} viewBox="0 0 100 100"
            className={isComplete?"sigillo-glow":""}>
            <circle cx={50} cy={50} r={44} fill="none"
              stroke={isComplete?"rgba(255,215,0,.4)":"rgba(255,255,255,.08)"} strokeWidth={1.5}/>
            {SIGILLO_FRAGMENTS.map((f, i) => {
              const rad = (f.angle - 90) * Math.PI / 180;
              const x = 50 + 32 * Math.cos(rad);
              const y = 50 + 32 * Math.sin(rad);
              const active = !!items.find(it => it.emoji === STORY_ARCS[f.worldId]?.reward_emoji);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={11}
                    fill={active ? f.color : "rgba(255,255,255,.05)"}
                    stroke={active ? f.color+"aa" : "rgba(255,255,255,.1)"} strokeWidth={1.5}
                    opacity={active ? 1 : 0.3}
                    style={{filter:active?`drop-shadow(0 0 6px ${f.color})`:"none"}}/>
                  <text x={x} y={y+5} textAnchor="middle" fontSize={10} style={{pointerEvents:"none"}}>
                    {f.emoji}
                  </text>
                </g>
              );
            })}
            <circle cx={50} cy={50} r={14}
              fill={isComplete?"rgba(255,215,0,.25)":"rgba(255,255,255,.06)"}
              stroke={isComplete?"#FFD700":"rgba(255,255,255,.2)"} strokeWidth={2}
              style={{filter:isComplete?"drop-shadow(0 0 8px rgba(255,215,0,.6))":"none"}}/>
            <text x={50} y={55} textAnchor="middle" fontSize={16} style={{pointerEvents:"none"}}>
              {isComplete?"✨":"✦"}
            </text>
          </svg>
        </div>
        {/* Testo narrativo */}
        <div style={{background:P_TILE,border:"1px solid rgba(255,255,255,.1)",borderRadius:20,padding:"18px 20px",marginBottom:20,textAlign:"center"}}>
          <div style={{fontSize:14,lineHeight:1.6,color:isComplete?"#FFD95A":"rgba(255,255,255,.85)"}}>
            {SIGILLO_STORY[completedCount]}
          </div>
          <div style={{marginTop:10,fontSize:13,opacity:.5}}>
            {completedCount}/{SIGILLO_FRAGMENTS.length} frammenti raccolti
          </div>
        </div>
        {/* Lista mondi con stato */}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {SIGILLO_FRAGMENTS.map((f, i) => {
            const arc = STORY_ARCS[f.worldId];
            const active = !!items.find(it => it.emoji === arc?.reward_emoji);
            return (
              <div key={i} style={{
                display:"flex",alignItems:"center",gap:14,
                background:active?`${f.color}15`:"rgba(255,255,255,.04)",
                border:`1px solid ${active?f.color+"44":"rgba(255,255,255,.07)"}`,
                borderRadius:16,padding:"12px 16px",
                opacity:active?1:0.55,
              }}>
                <div style={{fontSize:28}}>{f.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontFamily:FF,fontSize:14,color:active?f.color:"rgba(255,255,255,.7)"}}>
                    {WORLDS.find(w=>w.id===f.worldId)?.name || f.worldId}
                  </div>
                  <div style={{fontSize:11,opacity:.6,marginTop:2}}>
                    {active ? `✓ ${arc?.reward_name}` : "Non ancora completato"}
                  </div>
                </div>
                {active && <div style={{fontSize:20}}>{arc?.reward_emoji}</div>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (screen === "skills") return (
    <div key="skills" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#0f0c29,#302b63)",color:"white",padding:24}}>
      {G}
      <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",marginBottom:20,fontSize:14,fontWeight:700}}>← Mappa</button>
      <h2 style={{margin:"0 0 4px",fontSize:26,fontWeight:900}}>🌳 Le tue Abilità</h2>
      <p style={{opacity:.5,fontSize:13,marginBottom:28}}>Crescono ad ogni sfida che superi</p>
      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {SKILLS.map((sk,i) => {
          const lvl   = skills[sk.id];
          const pct   = (lvl / 10) * 100;
          const stars = Math.floor(lvl / 2);
          return (
            <div key={sk.id} className="slide-up" style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"18px 20px",animationDelay:`${i*.07}s`,border:`1px solid ${sk.color}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{background:`${sk.color}22`,borderRadius:12,padding:"7px",lineHeight:1,display:"flex"}}><SkillIcon id={sk.id} color={sk.color} size={28} /></span>
                  <div>
                    <div style={{fontWeight:900,fontSize:16}}>{sk.name}</div>
                    <div style={{fontSize:11,opacity:.5,marginTop:1}}>{SKILL_DESC[sk.id]}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:sk.color,fontWeight:900,fontSize:20}}>Lv.{lvl}</div>
                  <div style={{display:"flex",gap:1,justifyContent:"flex-end",minHeight:13,alignItems:"center",opacity:.85}}>{stars>0 ? Array.from({length:stars},(_,si)=><Icon key={si} name="star" color="#FFC24B" size={12} />) : <span style={{opacity:.4,fontSize:11}}>—</span>}</div>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,.08)",borderRadius:8,height:10,overflow:"hidden",marginTop:8}}>
                <div style={{background:`linear-gradient(90deg,${sk.color}99,${sk.color})`,height:"100%",borderRadius:8,width:`${pct}%`,transition:"width .9s cubic-bezier(.22,1,.36,1)"}} />
              </div>
              <div style={{fontSize:10,opacity:.35,marginTop:5,display:"flex",justifyContent:"space-between"}}>
                <span>0</span><span>{lvl} / 10</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: FAMILY ═════════════════════════════════════
  if (screen === "family") return (
    <div key="family" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:24}}>
      {G}
      <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",marginBottom:16,fontSize:14,fontWeight:700}}>← Mappa</button>
      <h2 style={{fontFamily:FF_DISPLAY,margin:"0 0 4px",fontSize:26,fontWeight:800,color:SG_GOLD}}>👨‍👩‍👧 Missioni Famiglia</h2>
      <p style={{opacity:.65,fontSize:13,marginBottom:24}}>Avventure da fare insieme, nella vita reale!</p>
      <div style={{display:"flex",flexDirection:"column",gap:13}}>
        {FAMILY_MISSIONS.map((m,i) => {
          const sk = SKILLS.find(s => s.id === m.skill) || SKILLS[0];
          return (
            <div key={m.id} className="slide-up" style={{background:"rgba(255,255,255,.92)",borderRadius:20,padding:"16px 18px",animationDelay:`${i*.06}s`,color:"#1a1a2e"}}>
              <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <span style={{fontSize:36}}>{m.emoji}</span>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>{m.title}</div>
                  <div style={{fontSize:13,opacity:.75,marginBottom:10}}>{m.desc}</div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{background:sk.color,color:"white",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700,display:"inline-flex",alignItems:"center",gap:5}}><SkillIcon id={sk.id} color="rgba(255,255,255,.95)" size={14} />{sk.name}</span>
                    <span style={{background:"rgba(0,0,0,.1)",borderRadius:20,padding:"3px 10px",fontSize:11}}>⏱ {m.dur}</span>
                  </div>
                  <div style={{marginTop:10}}>
                    {missionsDone.includes(m.id)
                      ? <div style={{color:"#16A34A",fontWeight:900,fontSize:13}}>✅ Completata! +2 ⭐</div>
                      : <button onClick={() => completeMission(m.id)}
                          style={{background:"#16A34A",color:"white",border:"none",borderRadius:50,padding:"8px 18px",cursor:"pointer",fontSize:13,fontWeight:800}}>
                          ✅ Fatto insieme!
                        </button>
                    }
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: COSMETICS ══════════════════════════════════
  if (screen === "cosmetics" && comp) {
    const owned    = COSMETICS.filter(c => ownedCosmetics.includes(c.id));
    const notOwned = COSMETICS.filter(c => !ownedCosmetics.includes(c.id));
    const equipped = equippedCosmetic[comp.id] || null;
    const equippedObj = COSMETICS.find(c => c.id === equipped) || null;
    function buyCosmetic(c) {
      if (coins < c.coinCost) return;
      setCoins(cx => cx - c.coinCost);
      setOwnedCosmetics(prev => [...prev, c.id]);
      setEquippedCosmetic(prev => ({...prev, [comp.id]: c.id}));
      SFX.achievement();
    }
    return (
      <div key="cosmetics" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:24}}>
        {G}
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
          <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Mappa</button>
          <h2 style={{fontFamily:FF_DISPLAY,margin:0,fontSize:20,fontWeight:900,flex:1,color:SG_GOLD}}>✨ Personalizza</h2>
          <div style={{background:"rgba(56,189,248,.15)",border:"1px solid rgba(56,189,248,.4)",borderRadius:20,padding:"6px 14px",display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:18}}>💎</span>
            <span style={{fontFamily:FF,fontSize:18,color:"#38BDF8"}}>{coins}</span>
          </div>
        </div>
        {/* Current look preview */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:24,padding:"20px",marginBottom:18,display:"flex",flexDirection:"column",alignItems:"center",gap:10}}>
          <div style={{fontSize:11,opacity:.45,letterSpacing:1,fontWeight:800}}>IL TUO {comp.name.toUpperCase()} ADESSO</div>
          <CompanionAvatar c={comp} size={96} anim="float" cosmetic={equippedObj} showBody />
          <div style={{fontSize:13,opacity:.7}}>{equippedObj ? `${equippedObj.emoji} ${equippedObj.name}` : "Nessun cosmetico equipaggiato"}</div>
          {equipped && (
            <button onClick={() => setEquippedCosmetic(prev => { const n = {...prev}; delete n[comp.id]; return n; })}
              style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.6)",borderRadius:20,padding:"6px 16px",fontSize:12,cursor:"pointer"}}>
              Rimuovi
            </button>
          )}
        </div>
        {/* Owned cosmetics */}
        {owned.length > 0 && (
          <div style={{marginBottom:18}}>
            <div style={{fontSize:11,opacity:.45,fontWeight:800,letterSpacing:1,marginBottom:10}}>I TUOI COSMETICI ({owned.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {owned.map(c => {
                const isEq = equipped === c.id;
                return (
                  <button key={c.id} onClick={() => setEquippedCosmetic(prev => ({...prev, [comp.id]: isEq ? undefined : c.id}))}
                    className={isEq ? "pulse" : ""}
                    style={{background:isEq?"rgba(192,132,252,.25)":"rgba(255,255,255,.08)",border:`2px solid ${isEq?"#C084FC":"rgba(255,255,255,.14)"}`,borderRadius:18,padding:"14px 8px",cursor:"pointer",textAlign:"center",color:"white",position:"relative"}}>
                    {isEq && <div style={{position:"absolute",top:4,right:6,fontSize:10,fontWeight:900,color:"#C084FC"}}>ON</div>}
                    <div style={{fontSize:32,marginBottom:4}}>{c.emoji}</div>
                    <div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{c.name}</div>
                    <div style={{fontSize:9,opacity:.5,marginTop:2}}>{isEq?"Equipaggiato":"Tocca per equipaggiare"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* Shop */}
        {notOwned.length > 0 && (
          <div>
            <div style={{fontSize:11,opacity:.45,fontWeight:800,letterSpacing:1,marginBottom:10}}>🛒 NEGOZIO MAGICO</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {notOwned.map(c => {
                const canAfford = coins >= c.coinCost;
                return (
                  <button key={c.id} onClick={() => canAfford && buyCosmetic(c)}
                    style={{background:canAfford?"rgba(56,189,248,.12)":"rgba(255,255,255,.04)",border:`2px solid ${canAfford?"rgba(56,189,248,.4)":"rgba(255,255,255,.08)"}`,borderRadius:18,padding:"14px 8px",cursor:canAfford?"pointer":"default",textAlign:"center",color:"white",opacity:canAfford?1:.6,transition:"transform .1s",position:"relative"}}>
                    {canAfford && <div style={{position:"absolute",top:4,left:"50%",transform:"translateX(-50%)",fontSize:8,fontWeight:900,color:"#38BDF8",letterSpacing:.5,whiteSpace:"nowrap"}}>PUOI ACQUISTARE</div>}
                    <div style={{fontSize:32,marginBottom:4,marginTop:canAfford?8:0,filter:canAfford?"none":"grayscale(.7)"}}>{c.emoji}</div>
                    <div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{c.name}</div>
                    <div style={{fontSize:10,marginTop:4,color:canAfford?"#38BDF8":"rgba(255,255,255,.4)",fontWeight:700}}>💎 {c.coinCost}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {owned.length === 0 && (
          <div style={{textAlign:"center",padding:"20px",opacity:.5,fontSize:13}}>
            Guadagna 5 💎 per il tuo primo cosmetico!
          </div>
        )}
      </div>
    );
  }

  // ════════════════════ SCREEN: SCHOOL ═════════════════════════════════════
  if (screen === "school") {
    const SCHOOL_KEY = 'mondomago_school_v1';
    function loadSchoolData(code) {
      try { return JSON.parse(localStorage.getItem(`${SCHOOL_KEY}_${code}`) || 'null'); } catch { return null; }
    }
    function saveSchoolData(code, data) {
      try { localStorage.setItem(`${SCHOOL_KEY}_${code}`, JSON.stringify(data)); } catch {}
    }
    function generateClassCode() {
      return Math.random().toString(36).slice(2,8).toUpperCase();
    }
    return (
      <div key="school" className={screenAnim} style={{minHeight:"100dvh",background:SG_BG,color:"#F6ECD4",padding:24}}>
        {G}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => navigate("parent")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
          <h2 style={{fontFamily:FF_DISPLAY,margin:0,fontSize:20,fontWeight:900,color:SG_GOLD}}>🏫 Modalità Scuola</h2>
        </div>
        <p style={{opacity:.6,fontSize:13,marginBottom:20,lineHeight:1.6}}>
          Consente agli insegnanti di assegnare sfide specifiche. Il codice classe collega il bambino alle sfide assegnate (salvate su questo dispositivo).
        </p>
        {/* Active class */}
        {schoolMode && schoolCode ? (
          <div style={{background:"rgba(37,99,235,.15)",border:"2px solid rgba(37,99,235,.4)",borderRadius:20,padding:"18px 20px",marginBottom:16}}>
            <div style={{fontSize:12,opacity:.5,fontWeight:800,letterSpacing:1,marginBottom:10}}>CLASSE ATTIVA</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
              <span style={{fontSize:36}}>🏫</span>
              <div>
                <div style={{fontWeight:900,fontSize:20,letterSpacing:2}}>{schoolCode}</div>
                <div style={{fontSize:12,opacity:.6}}>{schoolAssigned.length} sfide assegnate</div>
              </div>
            </div>
            <button onClick={() => { setSchoolMode(false); setSchoolCode(""); setSchoolAssigned([]); }}
              style={{background:"rgba(239,68,68,.2)",border:"1px solid rgba(239,68,68,.4)",color:"#FCA5A5",borderRadius:50,padding:"9px 20px",fontSize:12,fontWeight:700,cursor:"pointer",width:"100%"}}>
              Esci dalla classe
            </button>
          </div>
        ) : (
          <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"18px 20px",marginBottom:16}}>
            <div style={{fontSize:12,opacity:.5,fontWeight:800,letterSpacing:1,marginBottom:12}}>ENTRA IN UNA CLASSE</div>
            <input value={schoolCodeInput} onChange={e => setSchoolCodeInput(e.target.value.toUpperCase().slice(0,8))}
              placeholder="Inserisci codice classe..."
              style={{width:"100%",padding:"12px 16px",borderRadius:14,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.08)",color:"white",fontSize:16,fontFamily:"inherit",outline:"none",marginBottom:10,boxSizing:"border-box",textAlign:"center",letterSpacing:3,fontWeight:900}} />
            <button onClick={() => {
              if (!schoolCodeInput.trim()) return;
              const data = loadSchoolData(schoolCodeInput);
              setSchoolCode(schoolCodeInput);
              setSchoolMode(true);
              setSchoolAssigned(data?.assignedChallenges || []);
              setSchoolCodeInput("");
            }}
              disabled={!schoolCodeInput.trim()}
              style={{width:"100%",background:schoolCodeInput.trim()?"#2563EB":"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"12px",fontSize:14,fontWeight:900,cursor:schoolCodeInput.trim()?"pointer":"default"}}>
              Entra nella classe
            </button>
          </div>
        )}
        {/* Teacher mode */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"18px 20px",marginBottom:16}}>
          <div style={{fontSize:12,opacity:.5,fontWeight:800,letterSpacing:1,marginBottom:12}}>MODALITÀ DOCENTE</div>
          <p style={{fontSize:12,opacity:.6,marginBottom:12,lineHeight:1.6}}>
            Crea un codice classe e assegna sfide da far completare agli studenti.
          </p>
          <button onClick={() => {
            const code = generateClassCode();
            const data = { assignedChallenges: ['f01','f02','f03','c01','c02'], createdAt: new Date().toISOString() };
            saveSchoolData(code, data);
            setSchoolCode(code);
            setSchoolMode(true);
            setSchoolAssigned(data.assignedChallenges);
          }}
            style={{width:"100%",background:"linear-gradient(135deg,#1d4ed8,#2563EB)",border:"none",color:"white",borderRadius:50,padding:"12px",fontSize:14,fontWeight:900,cursor:"pointer"}}>
            Crea nuova classe 📋
          </button>
          <p style={{fontSize:10,opacity:.35,marginTop:8,textAlign:"center"}}>Genera un codice da condividere con gli studenti sul tuo dispositivo.</p>
        </div>
      </div>
    );
  }

  // ════════════════════ SCREEN: COMPANION PROFILE ═══════════════════════════
  if (screen === "profile" && comp) return (
    <div key="profile" className={screenAnim} style={{minHeight:"100dvh",background:comp.bg,color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
      {G}
      <button onClick={() => navigate("map")} style={{alignSelf:"flex-start",background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:12,padding:"8px 14px",cursor:"pointer",marginBottom:24,fontSize:14}}>← Indietro</button>
      <CompanionAvatar c={comp} size={110} anim="float" cosmetic={COSMETICS.find(c => c.id === equippedCosmetic[comp.id]) || null} showBody />
      <h2 style={{fontSize:28,fontWeight:900,marginBottom:4}}>{comp.name}</h2>
      <div style={{fontSize:14,opacity:.7,marginBottom:8}}>{comp.type} · Il tuo compagno magico</div>
      <button onClick={() => navigate("cosmetics")} style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:20,padding:"6px 18px",fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:22}}>
        ✨ Personalizza look
      </button>
      <div style={{width:"100%",maxWidth:360,background:"rgba(255,255,255,.12)",borderRadius:24,padding:"20px 24px",marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:800,opacity:.6,marginBottom:14,letterSpacing:1}}>OGGETTI RACCOLTI</div>
        {items.length === 0
          ? <div style={{opacity:.5,fontSize:14}}>Completa un mondo per sbloccare il primo oggetto!</div>
          : <div style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
              {items.map((it,i) => (
                <div key={i} className="pop-in" style={{textAlign:"center",background:"rgba(255,255,255,.15)",borderRadius:18,padding:"16px 20px",animationDelay:`${i*.1}s`}}>
                  <div style={{fontSize:42}}>{it.emoji}</div>
                  <div style={{fontSize:12,marginTop:6,fontWeight:700}}>{it.name}</div>
                </div>
              ))}
            </div>
        }
      </div>
      {/* Achievements */}
      <div style={{width:"100%",maxWidth:360,background:"rgba(255,255,255,.1)",borderRadius:20,padding:"16px 20px",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:800,opacity:.6,marginBottom:12,letterSpacing:1}}>OBIETTIVI</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10}}>
          {ACHIEVEMENTS.map(a => {
            const earned = achievements.includes(a.id);
            return (
              <div key={a.id} style={{textAlign:"center",opacity:earned?1:.3,filter:earned?"none":"grayscale(1)",transition:"opacity .3s"}}>
                <div style={{fontSize:26}}>{a.emoji}</div>
                <div style={{fontSize:8,marginTop:3,fontWeight:700,color:"white",lineHeight:1.2}}>{a.name.split(" ").slice(0,2).join(" ")}</div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,opacity:.4,marginTop:12,textAlign:"center"}}>{achievements.length} / {ACHIEVEMENTS.length} sbloccati</div>
      </div>
      <div style={{width:"100%",maxWidth:360,background:"rgba(255,255,255,.1)",borderRadius:20,padding:"16px 20px"}}>
        <div style={{fontSize:13,fontWeight:800,opacity:.6,marginBottom:10,letterSpacing:1}}>PERSONALITÀ</div>
        <div style={{fontSize:14,lineHeight:1.75,opacity:.9}}>
          {comp.id==="fiamma"&&"Coraggioso, diretto e sempre pronto a una sfida. Parla con energia pura e ti spinge sempre a dare il massimo! 🔥"}
          {comp.id==="luna"  &&"Poetica, sognante e gentile. Vede la bellezza in ogni cosa e ti ricorda che ogni errore è un passo verso la luce. ✨"}
          {comp.id==="onde"  &&"Curioso di tutto, ama esplorare e fare domande. Trasforma ogni sfida in una scoperta meravigliosa! 🌊"}
          {comp.id==="foglia"&&"Furba e creativa, trova sempre un angolo inaspettato. Il suo modo di pensare è unico, proprio come te! 🌿"}
        </div>
      </div>
      {/* Reset */}
      <div style={{marginTop:28,width:"100%",maxWidth:360}}>
        {!confirmReset
          ? <button onClick={() => setConfirmReset(true)}
              style={{width:"100%",background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.15)",color:"rgba(255,255,255,.45)",borderRadius:50,padding:"11px 0",cursor:"pointer",fontSize:13}}>
              🔄 Ricomincia da capo
            </button>
          : <div style={{background:"rgba(0,0,0,.25)",borderRadius:20,padding:"16px 18px",textAlign:"center"}}>
              <p style={{fontSize:13,opacity:.8,marginBottom:12}}>Perderai stelle, abilità e oggetti raccolti. Sei sicuro?</p>
              <div style={{display:"flex",gap:10,justifyContent:"center"}}>
                <button onClick={resetGame}
                  style={{background:"#EF4444",border:"none",color:"white",borderRadius:50,padding:"10px 22px",cursor:"pointer",fontSize:13,fontWeight:700}}>
                  Sì, ricomincia
                </button>
                <button onClick={() => setConfirmReset(false)}
                  style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:50,padding:"10px 22px",cursor:"pointer",fontSize:13}}>
                  Annulla
                </button>
              </div>
            </div>
        }
      </div>
    </div>
  );

  // ════════════════════ SCREEN: PARENT DASHBOARD ═══════════════════════════
  if (screen === "parent") {
    const PIN_LABELS = [1,2,3,4,5,6,7,8,9,"",0,"⌫"];
    // ── Token "Sigillo di Stelle" per l'area genitori ──────────────────────────
    const P_BG   = "radial-gradient(125% 85% at 50% -8%, #2D1B54 0%, #1B1035 52%, #140B29 100%)";
    const P_CARD = "rgba(45,27,84,.55)";   // superficie card indaco caldo
    const P_TILE = "rgba(20,11,41,.5)";    // riquadri interni più scuri
    const P_BR   = "1px solid rgba(255,194,75,.14)"; // filo d'oro sottile
    const GOLD   = "#FFC24B";              // magia / accento primario
    const RUNE   = "#6DE0C6";              // logica / codice
    const PARCH  = "#F6ECD4";              // testo su superfici
    const INK    = "#1B1035";              // testo scuro su oro

    if (!parentUnlocked) return (
      <div key="parent-lock" className={screenAnim} style={{minHeight:"100dvh",background:P_BG,color:PARCH,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        {G}
        <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:PARCH,borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
        <div style={{fontSize:56,marginBottom:12}}>🔐</div>
        <h2 style={{fontFamily:FF_DISPLAY,fontSize:24,fontWeight:900,margin:"0 0 6px",color:GOLD}}>Area Genitori</h2>
        <p style={{fontSize:13,opacity:.6,marginBottom:28}}>{!pinSaved ? "Crea un PIN a 4 cifre" : "Inserisci il tuo PIN"}</p>
        {/* PIN dots */}
        <div style={{display:"flex",gap:12,marginBottom:8}}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{width:50,height:58,background:P_TILE,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,color:GOLD,border:`2px solid ${pinInput.length > i ? GOLD : "rgba(255,194,75,.14)"}`}}>
              {pinInput[i] ? "●" : ""}
            </div>
          ))}
        </div>
        {pinError && <p style={{color:"#EF4444",fontSize:13,marginBottom:4}}>PIN errato. Riprova.</p>}
        {!pinError && <div style={{height:20}}/>}
        {/* Numpad */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,width:"100%",maxWidth:260,marginTop:8}}>
          {PIN_LABELS.map((n, i) => (
            <button key={i} onClick={() => {
              if (n === "⌫") setPinInput(p => p.slice(0,-1));
              else if (n !== "" && pinInput.length < 4) setPinInput(p => p + String(n));
            }}
              style={{height:56,background:n===""?"transparent":P_TILE,border:n===""?"none":P_BR,borderRadius:14,color:PARCH,fontFamily:FF_MONO,fontSize:20,fontWeight:700,cursor:n===""?"default":"pointer"}}>
              {n}
            </button>
          ))}
        </div>
      </div>
    );

    // Dashboard (unlocked)
    const completedMissions = missionsDone.length;
    const timeLimitOptions = [0, 15, 20, 30];

    // ── Analytics computations ────────────────────────────────────────────────
    const activeDays = new Set(sessionLog.map(s => s.date)).size;
    const totalMinutes = sessionLog.reduce((a, s) => a + (s.duration || 0), 0);
    const avgMinPerSession = sessionLog.length > 0 ? Math.round(totalMinutes / sessionLog.length) : 0;

    // Per-skill accuracy from ALL sessions (using skillData field if present)
    const skillAccuracy = {};
    SKILLS.forEach(sk => { skillAccuracy[sk.id] = { correct: 0, total: 0 }; });
    sessionLog.forEach(s => {
      if (s.skillData) {
        SKILLS.forEach(sk => {
          const d = s.skillData[sk.id];
          if (d) {
            skillAccuracy[sk.id].correct += d.correct;
            skillAccuracy[sk.id].total   += d.total;
          }
        });
      }
    });

    // ── SRS: coda "da ripassare" (sfide sbagliate riproposte dal motore) ──────
    const reviewItems = (missed || [])
      .map(m => {
        const ch = (ALL_CHALLENGES[m.world] || []).find(c => c.id === m.id);
        return ch ? { ch, world: m.world, skill: getSkill(ch.type), due: sessionLog.length > m.s } : null;
      })
      .filter(Boolean);
    const reviewBySkill = {};
    reviewItems.forEach(r => {
      if (!reviewBySkill[r.skill]) reviewBySkill[r.skill] = { count: 0, due: 0 };
      reviewBySkill[r.skill].count++;
      if (r.due) reviewBySkill[r.skill].due++;
    });
    const reviewRows = SKILLS
      .filter(sk => reviewBySkill[sk.id])
      .map(sk => ({ ...sk, ...reviewBySkill[sk.id] }))
      .sort((a, b) => b.count - a.count);
    const reviewExamples = reviewItems.slice(0, 3);
    const maxReviewCount = reviewRows.length ? reviewRows[0].count : 1;

    // ── 20-rule proactive coaching engine ────────────────────────────────────
    const totalCorrect = Object.values(skillAccuracy).reduce((a,v) => a + v.correct, 0);
    const totalAttempts = Object.values(skillAccuracy).reduce((a,v) => a + v.total, 0);
    const overallPct = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : null;
    const last7Days  = Array.from({length:7}, (_,i) => { const d=new Date(); d.setDate(d.getDate()-i); return d.toISOString().slice(0,10); });
    const recentSessions = sessionLog.filter(s => last7Days.includes(s.date));
    const todayStr   = new Date().toISOString().slice(0, 10);
    const playedToday = sessionLog.some(s => s.date === todayStr);
    const worldsDone = new Set(sessionLog.map(s => s.world)).size;

    const allCoachingRules = [
      // ── Skill-based rules (10) ─────────────────────────────────────────────
      ...SKILLS.flatMap(sk => {
        const acc = skillAccuracy[sk.id];
        if (acc.total < 5) return [];
        const pct = Math.round((acc.correct / acc.total) * 100);
        const tips = {
          logica:     {
            struggle: ["Fai puzzle fisici insieme ogni sera — incastri, Lego, giochi di logica.", "Gioca a 'cosa succede dopo?' mentre leggete una storia.", "I giochi in sequenza come le filastrocche aiutano molto la logica."],
            strong:   ["È pronto per sfide più complesse: prova a fargli creare le sue regole di gioco.", "Introduci i giochi di strategia come gli scacchi semplificati per bambini."],
          },
          numeri:     {
            struggle: ["Conta oggetti concreti ogni giorno: scalini, mele, macchine.", "Usa monete vere per insegnargli i numeri in contesto.", "Le canzoni con i numeri aiutano molto la memoria numerica."],
            strong:   ["Introduce l'addizione con oggetti fisici: 3 mele + 2 mele.", "È pronto per le prime misurazioni: altezza, peso, tempo."],
          },
          creativita: {
            struggle: ["Disegna insieme senza tema fisso — lascia fluire la sua fantasia.", "Costruite una storia con 3 oggetti casuali trovati in casa.", "La creta e il disegno libero stimolano molto la creatività."],
            strong:   ["Inventa storie insieme ogni sera prima di dormire.", "Proponigli di creare il suo personaggio immaginario con nome e poteri."],
          },
          empatia:    {
            struggle: ["Parla di come si sentono i personaggi dei suoi libri preferiti.", "Guarda cartoni animati insieme e chiedi 'come si sente quel personaggio?'.", "I giochi di ruolo con bambole o pupazzi sviluppano l'empatia."],
            strong:   ["Chiedigli sempre come si sente il suo compagno di giochi dopo una sessione.", "Coinvolgilo in piccoli gesti di cura: annaffiare piante, dare da mangiare agli animali."],
          },
          parole:     {
            struggle: ["Leggi ad alta voce ogni giorno, anche solo 10 minuti.", "Raccontate storie a turno aggiungendo una frase ciascuno.", "Giocate alle rime durante i pasti — è divertente e formativo."],
            strong:   ["Sfidatevi a trovare parole che iniziano con la stessa lettera.", "È pronto per i primi giochi di parole scritte: completa la parola mancante."],
          },
        };
        const tipArr = tips[sk.id]?.[pct < 55 ? "struggle" : "strong"] || [];
        const tip = tipArr[Math.floor(Math.random() * tipArr.length)];
        if (pct < 55) return [{ emoji: sk.emoji, title: `${childName} fatica un po' con ${sk.name} (${pct}% corretto)`, tip, color: "#FCD34D", priority: 3 }];
        if (pct >= 85 && acc.total >= 10) return [{ emoji: sk.emoji, title: `${childName} è forte in ${sk.name}! (${pct}%)`, tip, color: "#6DE0C6", priority: 2 }];
        return [];
      }),
      // ── Habit & behavioral rules (10) ──────────────────────────────────────
      streak >= 7 && playedToday
        ? { emoji:"🔥", title:`Streak di ${streak} giorni consecutivi — straordinario!`, tip:`Condividi questo risultato con ${childName}: riconosce i propri progressi e si motiva ancora di più.`, color:"#FB923C", priority:1 }
        : null,
      streak >= 2 && !playedToday
        ? { emoji:"⚠️", title:`Streak a rischio! ${streak} giorni di fila ma oggi non ha ancora giocato.`, tip:`Un solo minuto di gioco basta per mantenere la serie. Suggeriscigli di fare la sfida del giorno prima di cena.`, color:"#F87171", priority:1 }
        : null,
      recentSessions.length === 0 && activeDays > 0
        ? { emoji:"😴", title:`${childName} non ha giocato negli ultimi 7 giorni.`, tip:`Una pausa lunga è normale. Riprendi con la sfida del giorno — è breve e rilascia dopamina positiva.`, color:"#93C5FD", priority:2 }
        : null,
      avgMinPerSession > 0 && avgMinPerSession < 4 && sessionLog.length >= 3
        ? { emoji:"⏱", title:`Le sessioni di ${childName} sono molto brevi (media ${avgMinPerSession} min).`, tip:`È normale per i bambini 3-5 anni. Prova a giocare insieme: la co-presenza prolunga l'attenzione fino a 3x.`, color:"#C4B5FD", priority:3 }
        : null,
      avgMinPerSession >= 15 && sessionLog.length >= 3
        ? { emoji:"🎯", title:`${childName} è molto concentrato: sessioni da ${avgMinPerSession} min in media!`, tip:`Ottima capacità attentiva. Assicurati che faccia anche pause fisiche ogni 20-30 minuti.`, color:"#6DE0C6", priority:3 }
        : null,
      overallPct !== null && overallPct < 45 && totalAttempts >= 20
        ? { emoji:"🤔", title:`Precisione generale bassa: ${overallPct}%. Le sfide potrebbero essere troppo difficili.`, tip:`Prova a cambiare la fascia d'età in questa sezione (vai su "Età di ${childName}"). Le sfide si adatteranno automaticamente.`, color:"#FCD34D", priority:1 }
        : null,
      overallPct !== null && overallPct >= 88 && totalAttempts >= 20
        ? { emoji:"🚀", title:`${childName} risponde correttamente a ${overallPct}% delle domande — è pronto per qualcosa di più!`, tip:`Aumenta la fascia d'età nelle impostazioni per offrirgli sfide più stimolanti.`, color:"#34d399", priority:2 }
        : null,
      achievements.length >= 8
        ? { emoji:"🏆", title:`${childName} ha sbloccato ${achievements.length} obiettivi su ${ACHIEVEMENTS.length}!`, tip:`Condividere questi traguardi rafforza l'autostima. Chiedigli di mostrarti i suoi trofei nella sezione obiettivi.`, color:"#FCD34D", priority:3 }
        : null,
      worldsDone >= 5
        ? { emoji:"🌍", title:`Ha esplorato ${worldsDone} mondi diversi — ottima varietà!`, tip:`La varietà delle attività sviluppa più aree cognitive contemporaneamente. Continua così!`, color:"#60A5FA", priority:3 }
        : null,
      (childAge || 5) <= 4 && totalStars >= 30
        ? { emoji:"🐣", title:`Per la sua età (3–4 anni), ${childName} ha già guadagnato ${totalStars} stelle — eccellente!`, tip:`I bambini 3-4 anni imparano soprattutto attraverso il gioco visivo. Le sue capacità sono al di sopra della media per questa fascia.`, color:"#6DE0C6", priority:2 }
        : null,
    ].filter(Boolean).sort((a, b) => a.priority - b.priority).slice(0, 4);

    const insights = allCoachingRules;

    return (
      <div key="parent-dash" className={screenAnim} style={{minHeight:"100dvh",background:P_BG,color:PARCH,padding:24,paddingBottom:40}}>
        {G}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:PARCH,borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Mappa</button>
          <h2 style={{fontFamily:FF_DISPLAY,margin:0,fontSize:24,color:GOLD}}>🔐 Area Genitori</h2>
        </div>

        {/* Child overview */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>PROFILO DI {childName.toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,textAlign:"center"}}>
            {[
              {i:"⭐",v:totalStars,    l:"stelle"},
              {i:"🔥",v:streak,        l:"streak"},
              {i:"📅",v:activeDays,    l:"giorni attivi"},
              {i:"✅",v:completedMissions,l:"missioni"},
            ].map((s,i) => (
              <div key={i} style={{background:P_TILE,borderRadius:14,padding:"10px 4px"}}>
                <div style={{fontSize:20}}>{s.i}</div>
                <div style={{fontFamily:FF_MONO,fontSize:20,fontWeight:700,color:GOLD}}>{s.v}</div>
                <div style={{fontSize:9,opacity:.5}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Spotlight: coding (il differenziatore unico) */}
        <div style={{background:"linear-gradient(135deg,rgba(109,224,198,.16),rgba(45,27,84,.55))",
          border:"1.5px solid rgba(109,224,198,.45)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <span style={{fontSize:22}}>🤖</span>
            <div style={{fontFamily:FF_DISPLAY,fontSize:14,fontWeight:900,letterSpacing:.3,color:RUNE}}>Impara a pensare come un computer</div>
          </div>
          <p style={{fontSize:12,opacity:.8,lineHeight:1.5,marginBottom:8}}>
            Nel <b>Laboratorio Logico</b>, con il robot Pixel, tuo figlio sviluppa il <b>pensiero
            computazionale</b>: sequenze, condizioni e debug, le basi del coding spiegate col gioco.
          </p>
          <p style={{fontSize:11,opacity:.6,lineHeight:1.5}}>
            È ciò che rende MondoMago unico: l'unica app in italiano che insegna a programmare
            ai più piccoli, adattandosi al loro ritmo.
          </p>
        </div>

        {/* Time analytics */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>⏱ TEMPO GIOCATO</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,textAlign:"center"}}>
            {[
              {v: totalMinutes >= 60 ? `${Math.floor(totalMinutes/60)}h ${totalMinutes%60}m` : `${totalMinutes}m`, l:"totale"},
              {v: `${avgMinPerSession}m`, l:"media sessione"},
              {v: sessionLog.length,       l:"sessioni totali"},
            ].map((s,i) => (
              <div key={i} style={{background:P_TILE,borderRadius:14,padding:"12px 4px"}}>
                <div style={{fontFamily:FF_MONO,fontSize:18,fontWeight:700,color:RUNE}}>{s.v}</div>
                <div style={{fontSize:9,opacity:.5,marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill accuracy breakdown */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,opacity:.5,marginBottom:12,letterSpacing:1}}>🎯 PRECISIONE PER ABILITÀ</div>
          {SKILLS.map(sk => {
            const acc = skillAccuracy[sk.id];
            const pct = acc.total > 0 ? Math.round((acc.correct / acc.total) * 100) : null;
            const lvColor = pct === null ? "rgba(255,255,255,.2)" : pct >= 80 ? "#6DE0C6" : pct >= 55 ? "#FCD34D" : "#F87171";
            return (
              <div key={sk.id} style={{marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,marginBottom:4}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:5}}><SkillIcon id={sk.id} color={sk.color} size={15} />{sk.name}</span>
                  <span style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:FF_MONO,color:"rgba(246,236,212,.4)",fontSize:10}}>Lv.{skills[sk.id]}</span>
                    <span style={{fontFamily:FF_MONO,fontWeight:700,fontSize:13,color:lvColor}}>
                      {pct !== null ? `${pct}%` : "—"}
                    </span>
                  </span>
                </div>
                <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:8,position:"relative"}}>
                  <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(skills[sk.id]/10)*100}%`,transition:"width .7s",opacity:.7}} />
                  {pct !== null && (
                    <div style={{position:"absolute",top:0,left:0,height:"100%",borderRadius:6,
                      width:`${pct}%`,
                      background:`${lvColor}55`,
                      borderRight:`2px solid ${lvColor}`,
                      transition:"width .9s cubic-bezier(.22,1,.36,1)"}} />
                  )}
                </div>
                {pct !== null && (
                  <div style={{fontSize:9,opacity:.4,marginTop:2}}>{acc.correct}/{acc.total} risposte corrette</div>
                )}
              </div>
            );
          })}
        </div>

        {/* SRS — Da ripassare: sfide sbagliate riproposte dal motore adattivo */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:reviewItems.length?12:0}}>
            <div style={{fontSize:11,fontWeight:800,opacity:.5,letterSpacing:1}}>📌 DA RIPASSARE</div>
            {reviewItems.length > 0 && (
              <div style={{fontFamily:FF_MONO,fontWeight:700,fontSize:13,color:GOLD}}>{reviewItems.length} {reviewItems.length===1?"sfida":"sfide"}</div>
            )}
          </div>

          {reviewItems.length === 0 ? (
            <div style={{textAlign:"center",padding:"6px 0",opacity:.55,fontSize:12}}>
              🎉 Nessuna sfida in sospeso — {childName} sta consolidando tutto!
            </div>
          ) : (
            <>
              <p style={{fontSize:11,opacity:.55,margin:"0 0 12px",lineHeight:1.5}}>
                Argomenti che {childName} sta allenando. Il gioco li ripropone da solo: quelli <b style={{color:GOLD}}>● in arrivo</b> torneranno alla prossima partita, e spariscono da qui appena li supera.
              </p>

              {reviewRows.map(sk => (
                <div key={sk.id} style={{marginBottom:10}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,marginBottom:4}}>
                    <span style={{display:"inline-flex",alignItems:"center",gap:5}}><SkillIcon id={sk.id} color={sk.color} size={15} />{sk.name}</span>
                    <span style={{display:"flex",gap:8,alignItems:"center"}}>
                      {sk.due > 0 && <span style={{fontFamily:FF_MONO,fontSize:10,color:GOLD,fontWeight:700}}>● {sk.due} in arrivo</span>}
                      <span style={{fontFamily:FF_MONO,fontWeight:700,fontSize:13,color:sk.color}}>{sk.count}</span>
                    </span>
                  </div>
                  <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:8}}>
                    <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(sk.count/maxReviewCount)*100}%`,transition:"width .7s",opacity:.8}} />
                  </div>
                </div>
              ))}

              <div style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(255,255,255,.06)"}}>
                <div style={{fontSize:10,fontWeight:700,opacity:.4,marginBottom:8,letterSpacing:.5}}>ESEMPI DA RINFORZARE A CASA</div>
                {reviewExamples.map((r, i) => {
                  const w = WORLDS.find(w => w.id === r.world);
                  const label = (r.ch.prompt || "").replace(/\n/g," ").trim();
                  return (
                    <div key={i} style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",fontSize:11,marginBottom:i<reviewExamples.length-1?6:0}}>
                      <span style={{opacity:.8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                        {r.ch.emoji || "•"} {label.length > 42 ? label.slice(0,42)+"…" : label}
                      </span>
                      <span style={{flexShrink:0,opacity:.45,fontSize:10}}>{w ? `${w.emoji} ${w.name.split(" ")[0]}` : ""}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Proactive parent coaching insights */}
        {insights.length > 0 && (
          <div style={{background:"linear-gradient(135deg,rgba(255,194,75,.13),rgba(45,27,84,.55))",border:"1px solid rgba(255,194,75,.28)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:800,opacity:.9,marginBottom:12,letterSpacing:1,color:GOLD}}>💡 SUGGERIMENTI PER TE</div>
            {insights.map((ins, i) => (
              <div key={i} style={{display:"flex",gap:12,marginBottom:i < insights.length-1 ? 12 : 0,paddingBottom:i < insights.length-1 ? 12 : 0,borderBottom:i < insights.length-1 ? "1px solid rgba(255,255,255,.06)" : "none"}}>
                <div style={{fontSize:24,flexShrink:0,lineHeight:1.2}}>{ins.emoji}</div>
                <div>
                  <div style={{fontSize:12,fontWeight:700,color:ins.color,marginBottom:4,lineHeight:1.4}}>
                    {ins.title}
                  </div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.65)",lineHeight:1.55}}>
                    {ins.tip}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {insights.length === 0 && sessionLog.length < 3 && (
          <div style={{background:"rgba(255,255,255,.05)",borderRadius:20,padding:"14px 18px",marginBottom:14,textAlign:"center",opacity:.5}}>
            <div style={{fontSize:11}}>💡 I suggerimenti personalizzati appariranno dopo qualche sessione di gioco.</div>
          </div>
        )}

        {/* Age change */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>🎂 ETÀ DI {childName.toUpperCase()}</div>
          <div style={{display:"flex",gap:8}}>
            {[{label:"3–4",val:4},{label:"5–6",val:6},{label:"7–8",val:8}].map(o => (
              <button key={o.val} onClick={() => setChildAge(o.val)}
                style={{flex:1,background:childAge===o.val?GOLD:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"9px 4px",color:childAge===o.val?INK:PARCH,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {o.label}
              </button>
            ))}
          </div>
          <p style={{fontSize:11,opacity:.45,marginTop:8,marginBottom:0}}>Cambia fascia di età senza perdere le stelle.</p>
        </div>

        {/* Time limit */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>⏱ LIMITE DI SESSIONE</div>
          <p style={{fontSize:12,opacity:.6,marginBottom:12}}>Mostra una pausa quando il bambino gioca troppo a lungo.</p>
          <div style={{display:"flex",gap:8}}>
            {timeLimitOptions.map(v => (
              <button key={v} onClick={() => setTimeLimit(v)}
                style={{flex:1,background:timeLimit===v?GOLD:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"9px 4px",color:timeLimit===v?INK:PARCH,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {v===0?"Off":`${v} min`}
              </button>
            ))}
          </div>
        </div>

        {/* TTS Toggle */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>🔊 NARRAZIONE VOCALE</div>
          <p style={{fontSize:12,opacity:.6,marginBottom:12}}>Attiva o disattiva la voce che legge le domande ad alta voce.</p>
          <div style={{display:"flex",gap:8}}>
            {[{v:true,l:"🔊 Attiva"},{v:false,l:"🔇 Disattiva"}].map(opt => (
              <button key={String(opt.v)} onClick={() => setTtsEnabledState(opt.v)}
                style={{flex:1,background:ttsEnabled===opt.v?GOLD:"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"10px 4px",color:ttsEnabled===opt.v?INK:PARCH,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {opt.l}
              </button>
            ))}
          </div>
        </div>

        {/* Accessibilità */}
        <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>♿ ACCESSIBILITÀ</div>
          <p style={{fontSize:12,opacity:.6,marginBottom:14}}>Rendi il gioco più accessibile e inclusivo per ogni bambino.</p>
          {[
            {key:"reducedMotion", icon:"🎬", title:"Riduci le animazioni", desc:"Meno movimento: utile per chi si distrae o ha sensibilità al movimento."},
            {key:"highContrast",  icon:"🌗", title:"Alto contrasto",       desc:"Sfondo più scuro e bordi di focus visibili per ipovisione."},
            {key:"dyslexiaFont",  icon:"🔤", title:"Font per dislessia",   desc:"Usa il carattere OpenDyslexic, più facile da leggere."},
          ].map(opt => {
            const on = !!a11y[opt.key];
            return (
              <div key={opt.key} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:14,fontWeight:700}}>{opt.icon} {opt.title}</div>
                  <div style={{fontSize:11,opacity:.55,marginTop:2}}>{opt.desc}</div>
                </div>
                <button
                  role="switch" aria-checked={on} aria-label={opt.title}
                  onClick={() => setA11yPref({ [opt.key]: !on })}
                  style={{flexShrink:0,width:54,height:30,borderRadius:30,border:"none",cursor:"pointer",
                    background:on?GOLD:"rgba(255,255,255,.18)",position:"relative",transition:"background .2s"}}>
                  <span style={{position:"absolute",top:3,left:on?27:3,width:24,height:24,borderRadius:"50%",
                    background:"#fff",transition:"left .2s",boxShadow:"0 1px 3px rgba(0,0,0,.4)"}} />
                </button>
              </div>
            );
          })}
          {/* Dimensione testo */}
          <div style={{marginTop:4}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:6}}>🔠 Dimensione del testo</div>
            <div role="radiogroup" aria-label="Dimensione del testo" style={{display:"flex",gap:8}}>
              {[{v:"md",l:"Normale"},{v:"lg",l:"Grande"},{v:"xl",l:"Molto grande"}].map(opt => {
                const sel = (a11y.textScale || "md") === opt.v;
                return (
                  <button key={opt.v} role="radio" aria-checked={sel} aria-label={opt.l}
                    onClick={() => setA11yPref({ textScale: opt.v })}
                    style={{flex:1,background:sel?GOLD:"rgba(255,255,255,.08)",border:"none",borderRadius:10,
                      padding:"10px 4px",color:sel?INK:PARCH,fontSize:opt.v==="md"?12:opt.v==="lg"?14:16,fontWeight:700,cursor:"pointer"}}>
                    {opt.l}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Push notifications */}
        {(() => {
          const notifSupported = 'Notification' in window;
          const granted = notifSupported && Notification.permission === 'granted';
          const denied  = notifSupported && Notification.permission === 'denied';
          async function enableNotifications() {
            if (!notifSupported) return;
            const perm = await Notification.requestPermission();
            if (perm === 'granted') {
              if ('periodicSync' in (navigator.serviceWorker || {})) {
                const reg = await navigator.serviceWorker?.ready?.catch(() => null);
                if (reg) reg.periodicSync?.register('daily-reminder', { minInterval: 86400000 }).catch(() => {});
              }
              // Trigger re-render
              setNotifTime(t => t);
            }
          }
          const HOUR_OPTIONS = ["07:00","08:00","16:00","17:00","18:00","19:00","20:00","21:00"];
          return (
            <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"14px 18px",marginBottom:14}}>
              <div style={{fontSize:11,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>🔔 PROMEMORIA GIORNALIERO</div>
              <p style={{fontSize:12,opacity:.6,marginBottom:12}}>
                Ricevi una notifica quando è ora di giocare. Include un avviso streak se non ha ancora giocato oggi.
              </p>
              {denied ? (
                <p style={{fontSize:11,color:"#F87171"}}>Notifiche bloccate. Abilitale nelle impostazioni del browser.</p>
              ) : granted ? (
                <div>
                  <div style={{display:"flex",alignItems:"center",gap:10,color:"#6DE0C6",fontSize:13,fontWeight:700,marginBottom:12}}>
                    <span>✅</span>Promemoria attivo
                  </div>
                  <div style={{fontSize:11,opacity:.5,marginBottom:8}}>Orario promemoria:</div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {HOUR_OPTIONS.map(t => (
                      <button key={t} onClick={() => setNotifTime(t)}
                        style={{background:notifTime===t?GOLD:"rgba(255,255,255,.1)",
                          border:"none",borderRadius:10,padding:"6px 10px",fontFamily:FF_MONO,
                          color:notifTime===t?INK:PARCH,fontSize:12,fontWeight:700,cursor:"pointer"}}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div style={{fontSize:10,opacity:.4,marginTop:8}}>Promemoria ogni giorno alle {notifTime}</div>
                </div>
              ) : (
                <button onClick={enableNotifications}
                  style={{background:GOLD,border:"none",color:INK,borderRadius:50,padding:"10px 24px",fontSize:13,fontWeight:900,cursor:"pointer",width:"100%"}}>
                  Attiva promemoria 🔔
                </button>
              )}
            </div>
          );
        })()}

        {/* Weekly activity report */}
        {(() => {
          const today = new Date();
          const last7 = Array.from({length:7}, (_,i) => {
            const d = new Date(today); d.setDate(d.getDate() - i);
            return d.toISOString().slice(0,10);
          }).reverse();
          const logByDay = {};
          sessionLog.forEach(s => {
            if (!logByDay[s.date]) logByDay[s.date] = { stars:0, sessions:0, correct:0, total:0, minutes:0 };
            logByDay[s.date].stars    += s.stars;
            logByDay[s.date].sessions += 1;
            logByDay[s.date].correct  += s.correct  || 0;
            logByDay[s.date].total    += s.total    || 0;
            logByDay[s.date].minutes  += s.duration || 0;
          });
          const weekStars  = last7.reduce((a,d) => a + (logByDay[d]?.stars   || 0), 0);
          const weekSess   = last7.reduce((a,d) => a + (logByDay[d]?.sessions || 0), 0);
          const dayLabels  = ['Lu','Ma','Me','Gi','Ve','Sa','Do'];
          const maxStars   = Math.max(1, ...last7.map(d => logByDay[d]?.stars || 0));

          function downloadReport() {
            const lvl = getLevel(totalStars);
            const rows = last7.map(d => {
              const e = logByDay[d] || {};
              const acc = e.total > 0 ? Math.round((e.correct/e.total)*100) : null;
              return `<tr><td>${d}</td><td>${e.sessions||0}</td><td>${e.stars||0}</td><td>${e.minutes||0}m</td><td>${acc !== null ? acc+'%' : '—'}</td></tr>`;
            }).join('');
            const skillRows = SKILLS.map(sk => {
              const acc = skillAccuracy[sk.id];
              const pct = acc.total > 0 ? Math.round((acc.correct/acc.total)*100) : null;
              return `<tr><td>${sk.emoji} ${sk.name}</td><td>Lv.${skills[sk.id]}/10</td><td>${pct !== null ? pct+'%' : '—'}</td><td>${acc.correct}/${acc.total}</td></tr>`;
            }).join('');
            const safeChildName = escapeHtml(childName);
            const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Report MondoMago — ${safeChildName}</title>
<style>body{font-family:system-ui,sans-serif;max-width:640px;margin:40px auto;padding:20px;background:#f9fafb}h1,h2{color:#764ba2}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e5e7eb;padding:10px;text-align:center}th{background:#f3f4f6;font-weight:700}.stat{display:inline-block;background:#ede9fe;border-radius:12px;padding:12px 20px;margin:6px;text-align:center}.stat b{display:block;font-size:24px;color:#764ba2}.pct-good{color:#16a34a;font-weight:700}.pct-mid{color:#d97706;font-weight:700}.pct-low{color:#dc2626;font-weight:700}</style></head>
<body><h1>📊 Report MondoMago — ${safeChildName}</h1>
<p>Generato il ${new Date().toLocaleDateString('it-IT')} | Livello: ${lvl.emoji} ${lvl.title} | Stelle totali: ${totalStars} ⭐</p>
<div>
  <span class="stat"><b>${weekStars}</b>Stelle (7gg)</span>
  <span class="stat"><b>${weekSess}</b>Sessioni (7gg)</span>
  <span class="stat"><b>${streak}</b>Giorni di fila</span>
  <span class="stat"><b>${activeDays}</b>Giorni attivi</span>
  <span class="stat"><b>${totalMinutes}m</b>Tempo totale</span>
  <span class="stat"><b>${achievements.length}/${ACHIEVEMENTS.length}</b>Obiettivi</span>
</div>
<h2>Attività ultimi 7 giorni</h2><table><tr><th>Data</th><th>Sessioni</th><th>Stelle</th><th>Tempo</th><th>Precisione</th></tr>${rows}</table>
<h2>Precisione per abilità</h2><table><tr><th>Abilità</th><th>Livello</th><th>Precisione</th><th>Risposte</th></tr>${skillRows}</table>
<p style="color:#9ca3af;font-size:12px">MondoMago — App educativa per bambini 3–8 anni. Tutti i dati sono salvati solo su questo dispositivo.</p></body></html>`;
            const blob = new Blob([html], {type:'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `mondomago_report_${childName.toLowerCase()}_${today.toISOString().slice(0,10)}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(a.href), 150); // C4: Safari needs async revoke
          }
          // Gate freemium: il report settimanale + export è feature premium
          // parent-facing. Con MONETIZATION_ENABLED=false isPremium è true → il
          // teaser non compare mai e il pannello resta gratis per tutti.
          if (!isPremium) {
            return (
              <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14,textAlign:"center"}}>
                <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>📊 REPORT SETTIMANALE</div>
                <div style={{fontSize:34,marginBottom:6}}>🔒</div>
                <div style={{fontSize:13,opacity:.7,marginBottom:12,lineHeight:1.4}}>
                  Andamento settimanale, grafici e report scaricabile sono inclusi in <b>MondoMago Famiglia</b>.
                </div>
                <button onClick={unlockPremium}
                  style={{width:"100%",background:"linear-gradient(135deg,#FFC24B,#F6A93B)",border:"none",color:INK,borderRadius:50,padding:"11px",fontSize:13,fontWeight:900,cursor:"pointer"}}>
                  ✨ Sblocca MondoMago Famiglia
                </button>
              </div>
            );
          }
          return (
            <div style={{background:P_CARD,border:P_BR,borderRadius:20,padding:"16px 18px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>📊 REPORT SETTIMANALE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[{i:"⭐",v:weekStars,l:"stelle 7gg"},{i:"🎮",v:weekSess,l:"sessioni 7gg"}].map((s,i) => (
                  <div key={i} style={{background:P_TILE,borderRadius:12,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:18}}>{s.i}</div>
                    <div style={{fontFamily:FF_MONO,fontWeight:700,fontSize:18,color:GOLD}}>{s.v}</div>
                    <div style={{fontSize:10,opacity:.5}}>{s.l}</div>
                  </div>
                ))}
              </div>
              {/* Mini bar chart last 7 days */}
              <div style={{display:"flex",gap:4,alignItems:"flex-end",height:48,marginBottom:6}}>
                {last7.map((d, i) => {
                  const stars = logByDay[d]?.stars || 0;
                  const h = maxStars > 0 ? Math.max(4, Math.round((stars/maxStars)*40)) : 4;
                  const dow = (new Date(d).getDay() + 6) % 7;
                  return (
                    <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                      <div style={{width:"100%",background:stars>0?GOLD:"rgba(255,255,255,.1)",borderRadius:"4px 4px 0 0",height:h,transition:"height .5s"}} />
                      <div style={{fontSize:9,opacity:.5}}>{dayLabels[dow]}</div>
                    </div>
                  );
                })}
              </div>
              <button onClick={downloadReport}
                style={{width:"100%",background:"linear-gradient(135deg,#FFC24B,#F6A93B)",border:"none",color:INK,borderRadius:50,padding:"11px",fontSize:13,fontWeight:900,cursor:"pointer",marginTop:8}}>
                📥 Scarica report HTML
              </button>
            </div>
          );
        })()}

        {/* School mode */}
        <button onClick={() => navigate("school")}
          style={{width:"100%",background:"rgba(37,99,235,.12)",border:"1px solid rgba(37,99,235,.3)",color:"white",borderRadius:14,padding:"13px 18px",cursor:"pointer",fontSize:13,fontWeight:700,marginBottom:14,display:"flex",alignItems:"center",gap:10,textAlign:"left"}}>
          <span style={{fontSize:20}}>🏫</span>
          <div style={{flex:1}}>
            <div style={{fontWeight:900}}>Modalità Scuola</div>
            <div style={{fontSize:11,opacity:.6,fontWeight:400}}>{schoolMode && schoolCode ? `Classe: ${schoolCode} attiva` : "Collega al docente con un codice classe"}</div>
          </div>
          <span style={{opacity:.5}}>→</span>
        </button>

        {/* Reset PIN */}
        {!confirmPinReset ? (
          <button onClick={() => setConfirmPinReset(true)}
            style={{width:"100%",background:P_TILE,border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",borderRadius:14,padding:12,cursor:"pointer",fontSize:12,marginBottom:8}}>
            🔑 Cambia PIN
          </button>
        ) : (
          <div style={{marginBottom:8,display:"flex",gap:8}}>
            <button onClick={() => { setPinSaved(""); setParentUnlocked(false); setConfirmPinReset(false); }}
              style={{flex:1,background:"rgba(239,68,68,.2)",border:"1px solid rgba(239,68,68,.4)",color:"#ef4444",borderRadius:14,padding:12,cursor:"pointer",fontSize:12}}>
              ⚠️ Conferma reset
            </button>
            <button onClick={() => setConfirmPinReset(false)}
              style={{flex:1,background:P_TILE,border:"none",color:"rgba(255,255,255,.4)",borderRadius:14,padding:12,cursor:"pointer",fontSize:12}}>
              Annulla
            </button>
          </div>
        )}
        <button onClick={() => setParentUnlocked(false)}
          style={{width:"100%",background:"rgba(255,255,255,.04)",border:"none",color:"rgba(255,255,255,.3)",borderRadius:14,padding:10,cursor:"pointer",fontSize:11}}>
          🔒 Blocca area genitori
        </button>
      </div>
    );
  }

  // C2: emergency recovery — unknown screen value, redirect to safe state
  return (
    <div style={{minHeight:"100dvh",background:"#1a1a2e",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"white",gap:16}}>
      <div style={{fontSize:48}}>🧙‍♂️</div>
      <div style={{fontFamily:"'Fredoka One',cursive",fontSize:24}}>Ops, qualcosa è andato storto!</div>
      <button onClick={() => navigate(childName ? "map" : "name")}
        style={{background:"#6C63FF",border:"none",color:"white",borderRadius:16,padding:"14px 32px",fontSize:16,cursor:"pointer",fontFamily:"'Fredoka One',cursive"}}>
        Torna all'inizio
      </button>
    </div>
  );
}
