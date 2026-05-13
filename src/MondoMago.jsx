import { useState, useEffect, useRef } from "react";
import TTS_MAP from "./ttsMap.json";

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
      .ans-btn { transition: transform .12s ease, filter .15s; touch-action: manipulation; }
      .ans-btn:active { transform: scale(0.95) !important; filter: brightness(0.9); }
      .ans-vis { transition: transform .1s ease, filter .15s; touch-action: manipulation; }
      .ans-vis:active { transform: scale(0.92) !important; filter: brightness(0.85); }
      @keyframes burstOut {
        0%   { transform: translate(-50%,-50%) rotate(var(--a)) translateY(0)    scale(1);   opacity:1; }
        100% { transform: translate(-50%,-50%) rotate(var(--a)) translateY(-62px) scale(0.2); opacity:0; }
      }
      @keyframes handPoint {
        0%,100% { transform: translateY(0) rotate(-20deg); }
        50%     { transform: translateY(-10px) rotate(-20deg); }
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

function InstallBanner() {
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

  if (!show || dismissed) return null;

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
const CONF = [
  {l:8,  d:0,    e:"⭐"}, {l:18, d:.08, e:"✨"}, {l:28, d:.04, e:"🎉"},
  {l:38, d:.12, e:"💫"}, {l:48, d:.02, e:"🌟"}, {l:58, d:.09, e:"🎊"},
  {l:68, d:.16, e:"🎈"}, {l:78, d:.06, e:"⭐"}, {l:88, d:.14, e:"✨"},
  {l:13, d:.22, e:"💫"}, {l:43, d:.18, e:"🌟"}, {l:73, d:.11, e:"🎉"},
  {l:23, d:.26, e:"🎊"}, {l:53, d:.20, e:"⭐"}, {l:83, d:.07, e:"✨"},
];
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:500,overflow:"hidden"}}>
      {CONF.map((c, i) => (
        <div key={i} style={{
          position:"absolute", left:`${c.l}%`, top:"78%",
          fontSize: i % 3 === 0 ? 28 : 22,
          animation:"confettiFly 1.2s ease-out both",
          animationDelay:`${c.d}s`,
        }}>{c.e}</div>
      ))}
    </div>
  );
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

// ── COMPANION SVG FACES ───────────────────────────────────────────────────────
// Fully inline SVG companions with blink, expressions, and talking animation.
// mood: "idle" | "happy" | "sad" | "excited"  talking: bool
const COMPANION_FACE_DATA = {
  fiamma: { // Dragon
    headFill:"url(#fG)", headStroke:"#FF4500",
    highlights:[{cx:34,cy:32,rx:12,ry:8}],
    extras: (s) => <>
      <polygon points={`${s*.3},${s*.2} ${s*.26},${s*.06} ${s*.38},${s*.18}`} fill="#FF4500" />
      <polygon points={`${s*.7},${s*.2} ${s*.74},${s*.06} ${s*.62},${s*.18}`} fill="#FF4500" />
    </>,
    decoTop: "🔥",
  },
  luna: { // Unicorn
    headFill:"url(#lG)", headStroke:"#A855F7",
    highlights:[{cx:36,cy:33,rx:11,ry:7}],
    extras: (s) => <>
      <polygon points={`${s*.5},${s*.03} ${s*.44},${s*.22} ${s*.56},${s*.22}`} fill="url(#hornG)" />
      <polygon points={`${s*.24},${s*.34} ${s*.17},${s*.16} ${s*.3},${s*.28}`} fill="#F0ABFC" />
      <polygon points={`${s*.76},${s*.34} ${s*.83},${s*.16} ${s*.7},${s*.28}`} fill="#F0ABFC" />
    </>,
    decoTop: "✨",
    lashes: true,
  },
  onde: { // Dolphin
    headFill:"url(#oG)", headStroke:"#2563EB",
    highlights:[{cx:36,cy:34,rx:11,ry:7}],
    extras: (s) => <>
      <ellipse cx={s*.5} cy={s*.68} rx={s*.18} ry={s*.1} fill="#93C5FD" />
      <polygon points={`${s*.2},${s*.36} ${s*.12},${s*.2} ${s*.28},${s*.32}`} fill="#60A5FA" />
      <polygon points={`${s*.8},${s*.36} ${s*.88},${s*.2} ${s*.72},${s*.32}`} fill="#60A5FA" />
    </>,
    decoTop: "💧",
  },
  foglia: { // Fox
    headFill:"url(#fxG)", headStroke:"#059669",
    highlights:[{cx:36,cy:33,rx:11,ry:7}],
    extras: (s) => <>
      <polygon points={`${s*.24},${s*.36} ${s*.15},${s*.1} ${s*.36},${s*.3}`} fill="#34D399" />
      <polygon points={`${s*.76},${s*.36} ${s*.85},${s*.1} ${s*.64},${s*.3}`} fill="#34D399" />
      <polygon points={`${s*.26},${s*.33} ${s*.19},${s*.16} ${s*.33},${s*.28}`} fill="#FCA5A5" />
      <polygon points={`${s*.74},${s*.33} ${s*.81},${s*.16} ${s*.67},${s*.28}`} fill="#FCA5A5" />
    </>,
    decoTop: "🍃",
    whiskers: true,
  },
};

function CompanionAvatar({ c, size = 64, anim = "", cosmetic = null, mood = "idle", talking = false }) {
  const [blink, setBlink] = useState(false);
  const [mouthPhase, setMouthPhase] = useState(0);

  // Blink every 3-5s
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 140);
    }, 3200 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);

  // Mouth animation when talking
  useEffect(() => {
    if (!talking) { setMouthPhase(0); return; }
    const interval = setInterval(() => setMouthPhase(p => (p + 1) % 3), 120);
    return () => clearInterval(interval);
  }, [talking]);

  const fd = COMPANION_FACE_DATA[c.id] || COMPANION_FACE_DATA.fiamma;
  const s  = size;
  const cx = s * 0.5, cy = s * 0.52;
  const r  = s * 0.44;

  // Eye geometry
  const eyeRY = blink ? 1 : mood === "excited" ? s*0.12 : mood === "happy" ? s*0.10 : mood === "sad" ? s*0.08 : s*0.09;
  const eyeLX = s * 0.34, eyeRX = s * 0.66, eyeY = s * 0.46;
  const browTilt = mood === "sad" ? 3 : mood === "happy" || mood === "excited" ? -2 : 0;
  const browY    = s * 0.36;

  // Mouth path
  const mouthOpenY = talking ? [s*0.67, s*0.7, s*0.67][mouthPhase] : s*0.68;
  const mouthCurve = mood === "happy" || mood === "excited" ? s*0.76 : mood === "sad" ? s*0.64 : mouthOpenY;
  const mouthPath  = `M ${s*.33} ${s*.68} Q ${s*.5} ${mouthCurve} ${s*.67} ${s*.68}`;

  // Cheek blush (happy/excited only)
  const showCheeks = mood === "happy" || mood === "excited";

  // Aura color
  const auraCols = { "🔥":"#FF6B00","❄️":"#60D0FF","✨":"#FFD700","🏆":"#C084FC" };
  const auraCol  = cosmetic?.type === "aura" ? (auraCols[cosmetic.emoji] || "#C084FC") : null;

  return (
    <div className={anim} style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {/* Aura ring */}
      {auraCol && (
        <div style={{position:"absolute",inset:-Math.round(s*0.22),borderRadius:"50%",
          background:`conic-gradient(transparent,${auraCol}66,transparent,${auraCol}44,transparent)`,
          animation:"wiggle 2.4s ease-in-out infinite",pointerEvents:"none",zIndex:0}} />
      )}
      {/* Outer glow ring */}
      <div style={{position:"absolute",inset:-Math.round(s*0.07),borderRadius:"50%",
        background:`conic-gradient(${c.color}33,transparent,${c.color}55,transparent,${c.color}33)`,
        animation:"wiggle 4s ease-in-out infinite",
        animationDelay:c.id==="luna"?"0.5s":c.id==="onde"?"1s":c.id==="foglia"?"1.5s":"0s"}} />
      {/* SVG face */}
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{display:"block",overflow:"visible"}}>
        <defs>
          {c.id==="fiamma" && <radialGradient id="fG" cx="38%" cy="32%"><stop offset="0%" stopColor="#FF9A8B"/><stop offset="100%" stopColor="#c0392b"/></radialGradient>}
          {c.id==="luna"   && <radialGradient id="lG" cx="38%" cy="32%"><stop offset="0%" stopColor="#E9D5FF"/><stop offset="100%" stopColor="#7c3aed"/></radialGradient>}
          {c.id==="onde"   && <radialGradient id="oG" cx="38%" cy="32%"><stop offset="0%" stopColor="#BAE6FD"/><stop offset="100%" stopColor="#1d4ed8"/></radialGradient>}
          {c.id==="foglia" && <radialGradient id="fxG" cx="38%" cy="32%"><stop offset="0%" stopColor="#BBF7D0"/><stop offset="100%" stopColor="#047857"/></radialGradient>}
          <linearGradient id="hornG" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F9A8D4"/><stop offset="100%" stopColor="#FDE68A"/></linearGradient>
        </defs>
        {/* Companion-specific extras (ears, horns, fins) */}
        {fd.extras(s)}
        {/* Head */}
        <circle cx={cx} cy={cy} r={r} fill={fd.headFill} stroke={fd.headStroke} strokeWidth={Math.max(1.5,s*0.025)} />
        {/* Inner shimmer */}
        {fd.highlights.map((h,i)=><ellipse key={i} cx={h.cx/100*s} cy={h.cy/100*s} rx={h.rx/100*s} ry={h.ry/100*s} fill="rgba(255,255,255,0.22)" />)}
        {/* Cheeks */}
        {showCheeks && <>
          <ellipse cx={s*.28} cy={s*.56} rx={s*.07} ry={s*.045} fill={c.color} opacity="0.4"/>
          <ellipse cx={s*.72} cy={s*.56} rx={s*.07} ry={s*.045} fill={c.color} opacity="0.4"/>
        </>}
        {/* Eyebrows */}
        <line x1={eyeLX-s*.08} y1={browY+browTilt} x2={eyeLX+s*.08} y2={browY-browTilt} stroke={fd.headStroke} strokeWidth={Math.max(1,s*0.028)} strokeLinecap="round"/>
        <line x1={eyeRX-s*.08} y1={browY-browTilt} x2={eyeRX+s*.08} y2={browY+browTilt} stroke={fd.headStroke} strokeWidth={Math.max(1,s*0.028)} strokeLinecap="round"/>
        {/* Eyes */}
        <ellipse cx={eyeLX} cy={eyeY} rx={s*.09} ry={eyeRY} fill="white"/>
        <ellipse cx={eyeRX} cy={eyeY} rx={s*.09} ry={eyeRY} fill="white"/>
        {!blink && <>
          <ellipse cx={eyeLX+s*.02} cy={eyeY+s*.01} rx={s*.046} ry={Math.min(eyeRY*.7,s*.046)} fill="#1a1a2e"/>
          <ellipse cx={eyeRX+s*.02} cy={eyeY+s*.01} rx={s*.046} ry={Math.min(eyeRY*.7,s*.046)} fill="#1a1a2e"/>
          <circle cx={eyeLX+s*.03} cy={eyeY-s*.015} r={s*.016} fill="white"/>
          <circle cx={eyeRX+s*.03} cy={eyeY-s*.015} r={s*.016} fill="white"/>
          {fd.lashes && <>
            <line x1={eyeLX-s*.07} y1={eyeY-eyeRY-s*.01} x2={eyeLX-s*.1} y2={eyeY-eyeRY-s*.04} stroke={fd.headStroke} strokeWidth={s*.018} strokeLinecap="round"/>
            <line x1={eyeLX} y1={eyeY-eyeRY-s*.01} x2={eyeLX} y2={eyeY-eyeRY-s*.05} stroke={fd.headStroke} strokeWidth={s*.018} strokeLinecap="round"/>
            <line x1={eyeRX+s*.07} y1={eyeY-eyeRY-s*.01} x2={eyeRX+s*.1} y2={eyeY-eyeRY-s*.04} stroke={fd.headStroke} strokeWidth={s*.018} strokeLinecap="round"/>
          </>}
        </>}
        {/* Mouth */}
        <path d={mouthPath} fill={talking && mouthPhase===1 ? "#1a1a2e" : "none"} stroke="#1a1a2e" strokeWidth={Math.max(1.2,s*.027)} strokeLinecap="round"/>
        {/* Whiskers (Foglia) */}
        {fd.whiskers && <>
          <line x1={s*.22} y1={s*.62} x2={s*.38} y2={s*.64} stroke={fd.headStroke} strokeWidth={s*.015} strokeLinecap="round" opacity=".6"/>
          <line x1={s*.22} y1={s*.66} x2={s*.37} y2={s*.66} stroke={fd.headStroke} strokeWidth={s*.015} strokeLinecap="round" opacity=".6"/>
          <line x1={s*.78} y1={s*.62} x2={s*.62} y2={s*.64} stroke={fd.headStroke} strokeWidth={s*.015} strokeLinecap="round" opacity=".6"/>
          <line x1={s*.78} y1={s*.66} x2={s*.63} y2={s*.66} stroke={fd.headStroke} strokeWidth={s*.015} strokeLinecap="round" opacity=".6"/>
        </>}
        {/* Deco top emoji (small) — only for larger sizes */}
        {size >= 52 && fd.decoTop && (
          <text x={s*.78} y={s*.14} fontSize={s*.22} textAnchor="middle" style={{userSelect:"none",filter:"drop-shadow(0 1px 2px rgba(0,0,0,.5))"}}>
            {fd.decoTop}
          </text>
        )}
      </svg>
      {/* Hat cosmetic */}
      {cosmetic?.type === "hat" && (
        <div style={{position:"absolute",top:`-${Math.round(s*.28)}px`,left:"50%",transform:"translateX(-50%)",
          fontSize:Math.round(s*.44),filter:"drop-shadow(0 2px 5px rgba(0,0,0,.6))",
          pointerEvents:"none",zIndex:3,animation:"float 3s ease-in-out infinite"}}>{cosmetic.emoji}</div>
      )}
      {/* Accessory cosmetic */}
      {cosmetic?.type === "acc" && (
        <div style={{position:"absolute",right:`-${Math.round(s*.16)}px`,top:"28%",
          fontSize:Math.round(s*.36),filter:"drop-shadow(0 2px 4px rgba(0,0,0,.5))",
          pointerEvents:"none",zIndex:3,animation:"float 2.6s ease-in-out infinite"}}>{cosmetic.emoji}</div>
      )}
      {/* Aura particle */}
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
  { id:"biblioteca",name:"Biblioteca Incantata",    emoji:"📚", color:"#D97706", unlocked:false, starsNeeded:100 },
];

// ── SKILLS ────────────────────────────────────────────────────────────────────
const SKILLS = [
  { id:"logica",     name:"Logica",     emoji:"🧩", color:"#6366F1" },
  { id:"numeri",     name:"Numeri",     emoji:"🔢", color:"#F59E0B" },
  { id:"creativita", name:"Creatività", emoji:"🎨", color:"#EC4899" },
  { id:"empatia",    name:"Empatia",    emoji:"💛", color:"#10B981" },
  { id:"parole",     name:"Parole",     emoji:"📖", color:"#8B5CF6" },
];

const SKILL_MAP = {
  logica:     ["logica","pattern","geometria","memoria"],
  numeri:     ["numeri","conteggio"],
  creativita: ["creativita"],
  empatia:    ["empatia"],
  parole:     ["parole"],
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
      situation:"Al mercato, una bambina anziana lascia cadere la spesa. Nessuno si ferma ad aiutarla. Cosa fai?",
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
    prompt:"Dove vive ognuno?", emoji:"🌋",
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
  { id:"ba_A", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🦅🐬🐻🌺", prompt:"Quale inizia con la lettera A?\n(Aquila · Delfino · Orso · Fiore)", emoji:"🔤",
    options:["🦅","🐬","🐻","🌺"], correct:0 },

  { id:"ba_B", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐬🐋🐻🐸", prompt:"Quale inizia con la lettera B?\n(Delfino · Balena · Orso · Rana)", emoji:"🔤",
    options:["🐬","🐋","🐻","🐸"], correct:1 },

  { id:"ba_C", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐶🐻🐸🐬", prompt:"Quale inizia con la lettera C?\n(Cane · Orso · Rana · Delfino)", emoji:"🔤",
    options:["🐶","🐻","🐸","🐬"], correct:0 },

  { id:"ba_E", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐻🐸🐘🐬", prompt:"Quale inizia con la lettera E?\n(Orso · Rana · Elefante · Delfino)", emoji:"🔤",
    options:["🐻","🐸","🐘","🐬"], correct:2 },

  { id:"ba_F", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐬🐻🐸🦋", prompt:"Quale inizia con la lettera F?\n(Delfino · Orso · Rana · Farfalla)", emoji:"🔤",
    options:["🐬","🐻","🐸","🦋"], correct:3 },

  { id:"ba_G", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐱🐬🐻🐸", prompt:"Quale inizia con la lettera G?\n(Gatto · Delfino · Orso · Rana)", emoji:"🔤",
    options:["🐱","🐬","🐻","🐸"], correct:0 },

  { id:"ba_L", format:"visual_tap", type:"parole", ageMin:4, ageMax:6,
    visual:"🐬🦁🐻🐸", prompt:"Quale inizia con la lettera L?\n(Delfino · Leone · Orso · Rana)", emoji:"🔤",
    options:["🐬","🦁","🐻","🐸"], correct:1 },

  { id:"ba_M", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🍎🐬🐻🐸", prompt:"Quale inizia con la lettera M?\n(Mela · Delfino · Orso · Rana)", emoji:"🔤",
    options:["🍎","🐬","🐻","🐸"], correct:0 },

  { id:"ba_P", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"🐬🐻🐧🐸", prompt:"Quale inizia con la lettera P?\n(Delfino · Orso · Pinguino · Rana)", emoji:"🔤",
    options:["🐬","🐻","🐧","🐸"], correct:2 },

  { id:"ba_R", format:"visual_tap", type:"parole", ageMin:4, ageMax:7,
    visual:"🚀🐬🐻🌺", prompt:"Quale inizia con la lettera R?\n(Razzo · Delfino · Orso · Fiore)", emoji:"🔤",
    options:["🚀","🐬","🐻","🌺"], correct:0 },

  { id:"ba_S", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
    visual:"☀️🐬🐻🐸", prompt:"Quale inizia con la lettera S?\n(Sole · Delfino · Orso · Rana)", emoji:"🔤",
    options:["☀️","🐬","🐻","🐸"], correct:0 },

  { id:"ba_T", format:"visual_tap", type:"parole", ageMin:3, ageMax:6,
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
  ]),
});

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
    prompt:"Dove vive ognuno?", emoji:"🌲",
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
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function getSkill(type) {
  for (const [sk, types] of Object.entries(SKILL_MAP)) {
    if (types.includes(type)) return sk;
  }
  return "logica";
}
// ── PROCEDURAL MATH GENERATOR ─────────────────────────────────────────────────
function _rnd(min, max) { return min + Math.floor(Math.random() * (max - min + 1)); }
function _opts(correct, spread, count = 4) {
  const vals = new Set([correct]);
  while (vals.size < count) {
    const delta = _rnd(1, spread) * (Math.random() < 0.5 ? 1 : -1);
    const v = correct + delta;
    if (v > 0) vals.add(v);
  }
  const arr = [...vals].sort(() => Math.random() - 0.5);
  return { options: arr.map(String), correct: arr.indexOf(correct) };
}
function genMathChallenge(worldId, age) {
  const id = `proc_${worldId}_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
  const emojis = { foresta:"🐿️", castello:"👑", oceano:"🐬", mercato:"🧙", galassia:"🚀", vulcano:"🌋", biblioteca:"📖" };
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
    const type = _rnd(0, 2);
    if (type === 0) {
      const a = _rnd(5, 15), b = _rnd(1, a - 1);
      const { options, correct } = _opts(a + b, 3);
      return { id, format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, emoji:e,
        prompt:`${a} + ${b} = ?`, options, correct };
    }
    if (type === 1) {
      const a = _rnd(6, 18), b = _rnd(1, a - 2);
      const { options, correct } = _opts(a - b, 3);
      return { id, format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, emoji:e,
        prompt:`${a} − ${b} = ?`, options, correct };
    }
    const a = _rnd(2, 5), b = _rnd(2, 4);
    const { options, correct } = _opts(a * b, 3);
    return { id, format:"multiple_choice", type:"numeri", ageMin:5, ageMax:6, emoji:e,
      prompt:`${a} × ${b} = ?`, options, correct };
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

function filterByAge(worldId, age) {
  const all = (ALL_CHALLENGES[worldId] || []).filter(c => age >= c.ageMin && age <= c.ageMax);
  const bosses = all.filter(c => c.isBoss);
  const normals = all.filter(c => !c.isBoss).sort(() => Math.random() - 0.5);
  const boss = bosses[Math.floor(Math.random() * bosses.length)];
  // Inject 1 procedural math challenge per session, swap out 1 normal
  const proc = genMathChallenge(worldId, age);
  const slice = boss ? normals.slice(0, 4) : normals.slice(0, 5);
  const mixed = [...slice, proc].sort(() => Math.random() - 0.5);
  return boss ? [...mixed, boss] : mixed;
}
function getDailyChallenges(age) {
  const d = new Date().toISOString().slice(0, 10);
  const seed = d.split('-').reduce((a, v) => a * 1000 + parseInt(v), 0);
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
function initSkills() { return { logica:1, numeri:1, creativita:1, empatia:1, parole:1 }; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function addSkill(skills, type) {
  const k = getSkill(type);
  return { ...skills, [k]: Math.min(10, +(skills[k] + 0.5).toFixed(1)) };
}

let _bestVoice    = undefined; // undefined = uncached; null = none found
let _currentAudio = null;

function getBestVoice() {
  if (_bestVoice !== undefined) return _bestVoice;
  const voices = window.speechSynthesis?.getVoices?.() ?? [];
  if (!voices.length) return null;
  _bestVoice =
    voices.find(v => /Alice/i.test(v.name) && v.lang.startsWith('it')) ||
    voices.find(v => /Elsa|Bianca|Paola|Isabella/i.test(v.name) && v.lang.startsWith('it')) ||
    voices.find(v => /Google.*ital/i.test(v.name)) ||
    voices.find(v => v.lang === 'it-IT' && v.localService && !/cosimo|luca|male/i.test(v.name)) ||
    voices.find(v => v.lang === 'it-IT' && !/cosimo|luca/i.test(v.name)) ||
    voices.find(v => v.lang.startsWith('it') && !/cosimo|luca/i.test(v.name)) ||
    null;
  return _bestVoice;
}

function speakBrowser(text, rate = 0.85) {
  if (!window?.speechSynthesis || !text) return;
  const clean = String(text)
    .replace(/\n/g, ', ')
    .replace(/[^\w\s.,!?àèéìòùÀÈÉÌÒÙ]/g, '')
    .replace(/\s+/g, ' ').trim();
  if (!clean) return;
  const u = new SpeechSynthesisUtterance(clean);
  u.lang  = 'it-IT';
  u.rate  = rate;
  u.pitch = 1.15;
  const v = getBestVoice();
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

let _onTalkingEnd = null; // callback to clear compTalking

function speak(text, rate = 0.85, onEnd) {
  if (!text) { if (onEnd) setTimeout(onEnd, 300); return; }
  window.speechSynthesis?.cancel?.();
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  if (_onTalkingEnd) { _onTalkingEnd(); _onTalkingEnd = null; }
  if (onEnd) _onTalkingEnd = onEnd;

  const file = TTS_MAP[text];
  if (file) {
    const audio = new Audio(`/audio/${file}`);
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
  { id:"acc_bow",       emoji:"🎀", name:"Fiocco Magico",      type:"acc",  starsNeeded:5   },
  { id:"hat_crown",     emoji:"👑", name:"Corona Reale",       type:"hat",  starsNeeded:10  },
  { id:"acc_glasses",   emoji:"🕶️", name:"Occhiali Cool",      type:"acc",  starsNeeded:20  },
  { id:"hat_wizard",    emoji:"🎩", name:"Cappello Mago",      type:"hat",  starsNeeded:35  },
  { id:"acc_rainbow",   emoji:"🌈", name:"Arcobaleno",         type:"acc",  starsNeeded:50  },
  { id:"aura_fire",     emoji:"🔥", name:"Aura di Fuoco",      type:"aura", starsNeeded:65  },
  { id:"hat_party",     emoji:"🎉", name:"Cappello Festa",     type:"hat",  starsNeeded:80  },
  { id:"acc_lightning", emoji:"⚡", name:"Fulmine Elettrico",  type:"acc",  starsNeeded:100 },
  { id:"aura_ice",      emoji:"❄️", name:"Aura di Ghiaccio",   type:"aura", starsNeeded:130 },
  { id:"hat_star",      emoji:"🌟", name:"Stella d'Oro",       type:"hat",  starsNeeded:160 },
  { id:"acc_moon",      emoji:"🌙", name:"Luna d'Argento",     type:"acc",  starsNeeded:190 },
  { id:"aura_gold",     emoji:"✨", name:"Aura Dorata",        type:"aura", starsNeeded:220 },
  { id:"aura_legend",   emoji:"🏆", name:"Aura Leggendaria",   type:"aura", starsNeeded:300 },
];
function getUnlockedCosmetics(stars) {
  return COSMETICS.filter(c => stars >= c.starsNeeded);
}

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
  foresta:   ["🌿","🍃","🌲","🦋","🐝","🌸"],
  castello:  ["⭐","✨","🌟","💫","🔮","🌙"],
  oceano:    ["🌊","🐚","💧","🐠","🐡","🌿"],
  mercato:   ["🎨","🌈","✨","🎪","🍎","🌸"],
  galassia:  ["⭐","🌟","💫","🪐","🌌","✨"],
  vulcano:   ["🌋","🔥","💥","✨","🌑","🪨"],
  biblioteca:["📚","📖","✨","🦉","📜","🔮"],
};
function WorldBg({ worldId }) {
  const parts = WORLD_PARTICLES[worldId]; if (!parts) return null;
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {parts.flatMap((e, pi) =>
        [0,1,2].map(j => {
          const id = pi * 3 + j;
          return (
            <div key={id} style={{
              position:"absolute",
              left:`${(id * 17 + 5) % 92}%`,
              top: `${(id * 23 + 8) % 88}%`,
              fontSize: 14 + (id % 3) * 8,
              opacity: 0.16 + (id % 3) * 0.06,
              animation:`particleFloat ${3.2 + (id % 4) * 0.7}s ease-in-out infinite`,
              animationDelay:`${id * 0.32}s`,
              userSelect:"none",
            }}>{e}</div>
          );
        })
      )}
    </div>
  );
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
  consent: 0, name: 1, age: 2, companion: 3, map: 4,
  profile_select: 5, skills: 5, family: 5, cosmetics: 5, profile: 5,
  parent: 5, fulmine: 5, coplay_intro: 6, world_intro: 7, school: 6,
  challenge: 8, world_end: 9, session_stats: 9,
};

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MondoMago() {
  const [screen,       setScreen]       = useState("name");
  const [screenAnim,   setScreenAnim]   = useState("screen-enter");
  const prevScreenRef = useRef("");
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
  const [skills,       setSkills]       = useState(initSkills());
  const [results,      setResults]      = useState([]);
  const [combo,        setCombo]        = useState(0);
  const [items,        setItems]        = useState([]);
  const [confetti,     setConfetti]     = useState(false);
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
  const [sessionStart,   setSessionStart]   = useState(0);
  const [nowTick,        setNowTick]        = useState(0);
  const [dailyCompletedDate, setDailyCompletedDate] = useState("");
  const [wrongStreak,    setWrongStreak]    = useState(0);
  const [showHint,       setShowHint]       = useState(false);
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
  const [showReport,        setShowReport]        = useState(false);
  const [fulminoTime,       setFulminoTime]       = useState(60);  // countdown seconds
  const [fulminoScore,      setFulminoScore]      = useState(0);   // correct answers
  const [fulminoCi,         setFulminoCi]         = useState(0);   // challenge index in pool
  const [fulminoPool,       setFulminoPool]       = useState([]); // shuffled visual_tap challenges
  const [fulminoRunning,    setFulminoRunning]    = useState(false);

  const comp  = COMPANIONS.find(c => c.id === companion);
  const arc   = world ? STORY_ARCS[world.id] : null;
  const ch    = challenges[ci];
  const young = (childAge || 5) <= 4;
  const done  = selected !== null;

  // Worlds unlocked dynamically based on totalStars
  const unlockedWorlds = WORLDS.map(w => ({
    ...w,
    unlocked: w.starsNeeded === 0 || totalStars >= w.starsNeeded,
  }));

  function resetGame() {
    const remaining = allProfiles.filter(p => p.id !== activeProfileId);
    writeAllProfiles(remaining);
    setAllProfiles(remaining);
    setChildName(''); setChildAge(null); setCompanion(null);
    setTotalStars(0); setSkills(initSkills()); setItems([]);
    setCombo(0); setResults([]); setConfirmReset(false); setIsReturning(false); setStreak(1);
    setMissionsDone([]); setDailyCompletedDate('');
    setWrongStreak(0); setShowHint(false); setShowFeedback(false);
    setAchievements([]); setDailyCount(0); setActiveProfileId(null);
    setEquippedCosmetic({}); setSessionLog([]);
    setSchoolMode(false); setSchoolCode(""); setSchoolAssigned([]);
    navigate(remaining.length > 0 ? 'profile_select' : 'name');
  }

  function completeMission(id) {
    SFX.correct();
    navigator.vibrate?.(50);
    setMissionsDone(d => [...d, id]);
    setTotalStars(s => s + 2);
    setConfetti(true); setTimeout(() => setConfetti(false), 1600);
  }

  // Animation triggers
  function triggerOK(pts) {
    const actualPts = doubleStar ? pts * 2 : pts;
    if (doubleStar) setDoubleStar(false);
    navigator.vibrate?.(combo >= 4 ? [30,20,30,20,80] : combo >= 2 ? [40,20,60] : [50]);
    setSessionStars(s => s + actualPts); setTotalStars(s => s + actualPts);
    setCombo(c => {
      const nc = c + 1;
      if (nc >= 5) { SFX.combo(); setCompMood("excited"); }
      else if (nc >= 3) { SFX.combo(); setCompMood("excited"); }
      else { SFX.correct(); setCompMood("happy"); }
      return nc;
    });
    setAutoAdvancing(true);
    setStarPop(true);  setTimeout(() => setStarPop(false),  700);
    setConfetti(true); setTimeout(() => setConfetti(false), 1600);
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
          if (reward.includes("stelle bonus")) { setTotalStars(s => s + 3); setSessionStars(s => s + 3); }
          setTimeout(() => setMysteryBox(null), 3500);
        }, 800);
      }
      return prev;
    });
  }
  function triggerBAD() {
    navigator.vibrate?.([60, 30, 60]);
    SFX.wrong();
    setCombo(0); setAutoAdvancing(false); setCompMood("sad");
    setCardAnim("shake"); setTimeout(() => setCardAnim(""), 500);
    setCompAnim("wiggle"); setTimeout(() => setCompAnim("float"), 600);
    setTimeout(() => setCompMood("idle"), 1200);
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
      setWrongStreak(0); setShowHint(false);
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
    setResults(r => [...r, { type: ch.type, ok }]);
    setTimeout(() => setShowFeedback(true), 280);
  }
  function answerStory(choice) {
    if (storyChoice) return;
    setStoryChoice(choice); setSelected(0);
    const nc = combo + 1;
    if (choice.correct) {
      triggerOK(2); setSkills(s => addSkill(s, ch.type));
      setWrongStreak(0); setShowHint(false);
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
      setWrongStreak(0); setShowHint(false);
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
      setWrongStreak(0); setShowHint(false);
      if (comp) { const msg = comp.onCorrect(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
      setTimeout(() => setShowFeedback(true), 280);
    } else {
      triggerBAD(); setWrongStreak(w => w + 1);
      if (comp) { const msg = comp.onWrong(); setFeedbackMsg(msg); setTimeout(() => { setCompTalking(true); speak(msg, 0.85, () => setCompTalking(false)); }, 400); }
      setTimeout(() => { setDragPlaced({}); setSelected(null); }, 1200);
    }
    setResults(r => [...r, { type: ch.type, ok }]);
  }

  function next() {
    setAutoAdvancing(false); setBurstPos(null); setGuidedTap(false);
    setFeedbackMsg(""); setShowHint(false); setWrongStreak(0); setShowFeedback(false);
    setDragPicked(null); setDragPlaced({});
    if (ci < challenges.length - 1) {
      setCi(i => i + 1);
      setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({});
    } else {
      if (arc && !items.find(it => it.emoji === arc.reward_emoji))
        setItems(prev => [...prev, { emoji: arc.reward_emoji, name: arc.reward_name }]);
      const today = new Date().toISOString().slice(0, 10);
      if (world?.id === "daily") {
        setDailyCompletedDate(today);
        setTotalStars(s => s + 3);
        setSessionStars(s => s + 3);
        setDailyCount(d => d + 1);
      }
      // Log this session for parent report
      setSessionLog(prev => {
        const entry = { date: today, stars: sessionStars + (world?.id === "daily" ? 3 : 0), world: world?.id || "?", correct: results.filter(r=>r.ok).length, total: results.length };
        return [...prev.slice(-29), entry]; // keep last 30 sessions
      });
      setConfetti(true); setTimeout(() => setConfetti(false), 2800);
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
    const list = filterByAge(w.id, childAge || 5);
    if (!list.length) return;
    stopMusic();
    setWorld(w); setChallenges(list); setCi(0);
    setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({});
    setFeedbackMsg(""); setShowHint(false); setWrongStreak(0); setShowFeedback(false);
    setSessionStars(0); setResults([]); setCombo(0);
    setCompMood("idle"); setCompTalking(false); setAutoAdvancing(false);
    setMysteryBox(null); setDoubleStar(false); setBurstPos(null); setGuidedTap(false); setBossHPAnimated(100);
    setSessionStart(Date.now());
    navigate((childAge || 5) <= 4 ? "coplay_intro" : "world_intro");
  }
  function startDaily() {
    const list = getDailyChallenges(childAge || 5);
    if (!list.length) return;
    stopMusic();
    setWorld({ id:"daily", name:"Sfida del Giorno", emoji:"🌟", color:"#FFD95A", unlocked:true });
    setChallenges(list); setCi(0);
    setSelected(null); setStoryChoice(null); setSeqTaps([]); setSeqError(false); setDragPicked(null); setDragPlaced({});
    setFeedbackMsg(""); setShowHint(false); setWrongStreak(0); setShowFeedback(false);
    setSessionStars(0); setResults([]); setCombo(0);
    setCompMood("idle"); setCompTalking(false); setAutoAdvancing(false);
    setMysteryBox(null); setDoubleStar(false); setBurstPos(null); setGuidedTap(false); setBossHPAnimated(100);
    setSessionStart(Date.now());
    navigate("world_intro");
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
    if (p.schoolMode)                     setSchoolMode(p.schoolMode);
    if (p.schoolCode)                     setSchoolCode(p.schoolCode);
    if (p.schoolAssigned)                 setSchoolAssigned(p.schoolAssigned);
    const today = new Date().toISOString().slice(0,10);
    if (p.lastDate) {
      const diff = Math.floor((new Date(today) - new Date(p.lastDate)) / 86400000);
      const newStreak = diff === 0 ? (p.streak||1) : diff === 1 ? (p.streak||0)+1 : 1;
      setStreak(newStreak);
      if (diff === 1 && newStreak >= 7 && newStreak % 7 === 0) {
        setStreakCelebrate(true);
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
    setTotalStars(0); setSkills(initSkills()); setItems([]);
    setCombo(0); setResults([]); setStreak(1);
    setMissionsDone([]); setDailyCompletedDate('');
    setAchievements([]); setDailyCount(0);
    setEquippedCosmetic({}); setSessionLog([]);
    setSchoolMode(false); setSchoolCode(""); setSchoolAssigned([]);
    setIsReturning(false);
    navigate('name');
  }

  const isCorrect =
    ch?.format === "story_choice" ? storyChoice?.correct :
    ch?.format === "sequence_tap" ? selected === 999 :
    ch?.format === "drag_drop"    ? selected === 0 :
    selected === ch?.correct;

  const progressPct = challenges.length ? ((ci + 1) / challenges.length) * 100 : 0;

  // Android hardware/gesture back button — navigate instead of closing PWA
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    const onPop = () => {
      window.history.pushState(null, '', window.location.href);
      if (screen === "challenge") setExitConfirm(true);
      else if (["consent","profile_select","name","age","companion"].includes(screen)) { /* no-op on onboarding */ }
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
    const data = { id: activeProfileId, childName, childAge, companion, totalStars, skills, items, streak, missionsDone, dailyCompletedDate, lastDate: today, achievements, dailyCount, equippedCosmetic, sessionLog, schoolMode, schoolCode, schoolAssigned };
    setAllProfiles(prev => {
      const updated = prev.some(p => p.id === activeProfileId)
        ? prev.map(p => p.id === activeProfileId ? data : p)
        : [...prev, data];
      writeAllProfiles(updated);
      return updated;
    });
  }, [childName, childAge, companion, totalStars, skills, items, streak, missionsDone, dailyCompletedDate, achievements, dailyCount, equippedCosmetic, sessionLog, schoolMode, schoolCode, schoolAssigned]); // eslint-disable-line

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
    }
    setLastKnownLevel(current.title);
  }, [totalStars]); // eslint-disable-line

  // Seasonal theme — set once on mount
  useEffect(() => { setSeason(getCurrentSeason()); }, []);

  // [A3] Auto-advance on correct answer
  useEffect(() => {
    if (screen !== "challenge" || !autoAdvancing) return;
    const t = setTimeout(() => { setAutoAdvancing(false); next(); }, 1550);
    return () => clearTimeout(t);
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

  // Cosmetics unlock check
  useEffect(() => {
    if (!childName || !activeProfileId) return;
    const unlocked = getUnlockedCosmetics(totalStars).map(c => c.id);
    const prev     = getUnlockedCosmetics(Math.max(0, totalStars - 10)).map(c => c.id);
    const fresh    = unlocked.filter(id => !prev.includes(id));
    if (!fresh.length) return;
    setNewCosmetics(fresh);
    SFX.achievement();
    setTimeout(() => setNewCosmetics([]), 4000);
  }, [totalStars]); // eslint-disable-line

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
    if (p.pin)       setPinSaved(p.pin);
    if (p.timeLimit) setTimeLimit(p.timeLimit);
  }, []);

  // Save parent settings when they change
  useEffect(() => {
    writeParent({ pin: pinSaved, timeLimit });
  }, [pinSaved, timeLimit]);

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

  // Tick every 30s for session timer
  useEffect(() => {
    if (!timeLimit || !sessionStart) return;
    const id = setInterval(() => setNowTick(Date.now()), 30000);
    return () => clearInterval(id);
  }, [timeLimit, sessionStart]);

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
    if (screen === "name") { setTimeout(() => speak("Come ti chiami?", 0.8), 300); return; }
    if (screen === "age")  { setTimeout(() => speak("Quanti anni hai?", 0.8), 300); return; }
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
      speak(arc.intro_text, 0.8);
    } else if (screen === "coplay_intro") {
      startMusic(world?.id);
      speak(`Ciao! Siediti vicino a ${childName} e aiutalo a giocare. Leggi le domande ad alta voce e toccate le risposte insieme!`, 0.8);
    } else if (screen === "companion") {
      setTimeout(() => speak("Scegli il tuo compagno magico!", 0.8), 400);
    } else if (screen === "world_end") {
      stopMusic();
      SFX.victory();
      if (arc) setTimeout(() => speak(arc.outro, 0.85), 1400);
    } else if (screen === "map" || screen === "session_stats") {
      stopMusic();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, ci]);

  const G = (
    <>
      <AnimationStyles />
      <InstallBanner />
      <Confetti active={confetti} />
      {newAchievements.length > 0 && (() => {
        const a = ACHIEVEMENTS.find(x => x.id === newAchievements[0]);
        return (
          <div style={{position:"fixed",bottom:32,left:0,right:0,display:"flex",justifyContent:"center",zIndex:600,pointerEvents:"none"}}>
            <div className="slide-up" style={{background:"linear-gradient(135deg,#1e1e3a,#2d2d5e)",border:"2px solid #A78BFA",borderRadius:24,padding:"14px 22px",display:"flex",alignItems:"center",gap:12,maxWidth:340,boxShadow:"0 8px 32px rgba(0,0,0,.5)"}}>
              <span style={{fontSize:34}}>{a?.emoji}</span>
              <div>
                <div style={{fontWeight:900,fontSize:12,color:"#A78BFA",letterSpacing:1}}>OBIETTIVO SBLOCCATO!</div>
                <div style={{fontWeight:700,fontSize:15,color:"white"}}>{a?.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>{a?.desc}</div>
              </div>
            </div>
          </div>
        );
      })()}
      {newLevel && (
        <div onClick={() => setNewLevel(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.86)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer"}}>
          <div className="pop-in" style={{background:"linear-gradient(135deg,#2d1b69,#1a1a2e)",border:"2px solid #FFD700",borderRadius:28,padding:"36px 28px",textAlign:"center",maxWidth:320,boxShadow:"0 0 60px rgba(255,215,0,.3)"}}>
            <div style={{fontSize:72,marginBottom:12}}>{newLevel.emoji}</div>
            <div style={{color:"#FFD700",fontWeight:900,fontSize:12,letterSpacing:2,marginBottom:8}}>LIVELLO RAGGIUNTO!</div>
            <div style={{color:"white",fontWeight:900,fontSize:28,marginBottom:6}}>{newLevel.title}</div>
            <p style={{color:"rgba(255,255,255,.7)",fontSize:14,marginBottom:24}}>Continua così! Sei davvero bravo!</p>
            <button onClick={() => setNewLevel(null)} style={{background:"#FFD700",color:"#1a1a2e",border:"none",borderRadius:50,padding:"13px 36px",fontWeight:900,fontSize:16,cursor:"pointer"}}>
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
                <div style={{fontWeight:900,fontSize:12,color:"#C084FC",letterSpacing:1}}>COSMETICO SBLOCCATO! ✨</div>
                <div style={{fontWeight:700,fontSize:15,color:"white"}}>{c?.name}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,.6)"}}>Equipaggialo in Personalizza!</div>
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
            <div style={{color:"#FCD34D",fontWeight:900,fontSize:13,letterSpacing:2,marginBottom:8}}>STREAK DA CAMPIONE!</div>
            <div style={{color:"white",fontWeight:900,fontSize:36,marginBottom:4}}>{streak} giorni</div>
            <div style={{color:"#FCD34D",fontWeight:700,fontSize:16,marginBottom:6}}>di fila!</div>
            <p style={{color:"rgba(255,255,255,.8)",fontSize:14,marginBottom:24,lineHeight:1.6}}>Sei incredibile! Continua così ogni giorno!</p>
            <button onClick={() => setStreakCelebrate(false)} style={{background:"#FCD34D",color:"#1a1a2e",border:"none",borderRadius:50,padding:"14px 40px",fontWeight:900,fontSize:16,cursor:"pointer"}}>
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
      {/* [B4] Guided hand — first challenge ever */}
      {guidedTap && ch && (ch.format === "multiple_choice" || ch.format === "visual_tap") && (
        <div style={{position:"fixed",bottom:"18%",left:"50%",transform:"translateX(-50%)",zIndex:800,pointerEvents:"none",textAlign:"center"}}>
          <div style={{fontSize:52,animation:"handPoint 0.9s ease-in-out infinite",display:"inline-block"}}>👆</div>
          <div style={{background:"rgba(0,0,0,.7)",borderRadius:20,padding:"6px 18px",marginTop:6,color:"white",fontSize:13,fontWeight:700}}>Tocca la risposta!</div>
        </div>
      )}
    </>
  );

  // ════════════════════ SCREEN: CONSENT ════════════════════════════════════
  if (screen === "consent") return (
    <div key="consent" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#0f3460)",color:"white",padding:28,paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
      {G}
      <div className="float" style={{fontSize:72,marginBottom:16}}>👨‍👩‍👧</div>
      <h1 style={{fontSize:24,fontWeight:900,marginBottom:10}}>Ciao, genitore!</h1>
      <div style={{background:"rgba(255,255,255,.08)",borderRadius:20,padding:"18px 22px",maxWidth:380,marginBottom:28,fontSize:14,lineHeight:1.8,textAlign:"left"}}>
        <div style={{marginBottom:8}}>🎮 App educativa per bambini <strong>3–8 anni</strong></div>
        <div style={{marginBottom:8}}>🔒 <strong>Nessun dato personale</strong> raccolto o trasmesso</div>
        <div style={{marginBottom:8}}>🚫 <strong>Nessuna pubblicità</strong> — zero acquisti in-app</div>
        <div>💾 I progressi sono salvati solo <strong>su questo dispositivo</strong></div>
      </div>
      <button onClick={() => { warmUpAudio(); localStorage.setItem('mondomago_consent','1'); navigate('name'); }}
        style={{background:"linear-gradient(135deg,#667eea,#764ba2)",border:"none",color:"white",borderRadius:50,padding:"16px 44px",fontWeight:900,fontSize:18,cursor:"pointer",marginBottom:14,boxShadow:"0 8px 32px rgba(102,126,234,.4)"}}>
        Sono un adulto — Inizia! ✨
      </button>
      <p style={{fontSize:11,opacity:.35,maxWidth:320}}>Confermando accetti l'utilizzo del dispositivo per questo gioco.</p>
    </div>
  );

  // ════════════════════ SCREEN: PROFILE SELECT ══════════════════════════════
  if (screen === "profile_select") return (
    <div key="profile_select" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:60}}>
      {G}
      <div className="float" style={{fontSize:56,marginBottom:12}}>👋</div>
      <h2 style={{fontWeight:900,fontSize:24,marginBottom:4}}>Chi gioca oggi?</h2>
      <p style={{opacity:.75,fontSize:14,marginBottom:32}}>Scegli il tuo profilo</p>
      <div style={{width:"100%",maxWidth:360,display:"flex",flexDirection:"column",gap:12}}>
        {allProfiles.map((p, i) => {
          const lvl = getLevel(p.totalStars || 0);
          const ageLabel = (p.childAge||5) <= 4 ? "3–4" : (p.childAge||5) <= 6 ? "5–6" : "7–8";
          return (
            <button key={p.id} onClick={() => selectProfile(p.id)} className="slide-up"
              style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.45)",borderRadius:22,padding:"16px 20px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",animationDelay:`${i*.08}s`,boxShadow:"0 4px 16px rgba(0,0,0,.15)"}}>
              <div style={{fontSize:40}}>{lvl.emoji}</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:18}}>{p.childName}</div>
                <div style={{fontSize:12,opacity:.85}}>{lvl.title} · {p.totalStars||0} ⭐ · età {ageLabel}</div>
              </div>
              <span style={{fontSize:22,opacity:.7}}>→</span>
            </button>
          );
        })}
        <button onClick={startNewProfile} className="slide-up"
          style={{background:"rgba(255,255,255,.1)",border:"2px dashed rgba(255,255,255,.45)",borderRadius:22,padding:"16px 20px",color:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:14,animationDelay:`${allProfiles.length*.08}s`}}>
          <div style={{fontSize:40}}>➕</div>
          <div style={{fontWeight:700,fontSize:16}}>Nuovo giocatore</div>
        </button>
      </div>
    </div>
  );

  // ════════════════════ SCREEN: NAME ════════════════════════════════════════
  if (screen === "name") return (
    <div key="name" className={screenAnim} style={{minHeight:"var(--vvh,100dvh)",background:"linear-gradient(135deg,#667eea,#764ba2)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"white",padding:24,paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)",textAlign:"center"}}>
      {G}
      <div className="float" style={{fontSize:80,marginBottom:16}}>🧙‍♂️</div>
      <h1 style={{fontSize:40,fontWeight:900,margin:"0 0 6px",textShadow:"0 2px 14px rgba(0,0,0,.3)"}}>MondoMago</h1>
      <p style={{fontSize:16,opacity:.8,marginBottom:44}}>Il tuo viaggio magico inizia qui! ✨</p>
      <div style={{width:"100%",maxWidth:340}}>
        <p style={{fontWeight:700,fontSize:18,marginBottom:14}}>Come ti chiami? 👋</p>
        <input value={childName} onChange={e => setChildName(e.target.value)}
          onKeyDown={e => e.key==="Enter" && childName.trim() && navigate("age")}
          placeholder="Scrivi il tuo nome..."
          autoComplete="given-name"
          autoCapitalize="words"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          style={{width:"100%",padding:"16px 20px",borderRadius:20,border:"none",fontSize:18,outline:"none",textAlign:"center",color:"#1a1a2e",boxSizing:"border-box"}} />
        <button onClick={() => childName.trim() && navigate("age")} disabled={!childName.trim()}
          style={{marginTop:14,width:"100%",background:childName.trim()?"white":"rgba(255,255,255,.3)",color:"#764ba2",border:"none",borderRadius:50,padding:16,fontSize:18,fontWeight:900,cursor:childName.trim()?"pointer":"default"}}>
          Avanti ✨
        </button>
      </div>
    </div>
  );

  // ════════════════════ SCREEN: AGE ═════════════════════════════════════════
  if (screen === "age") return (
    <div key="age" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#4f46e5,#7c3aed)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",color:"white",padding:24,paddingBottom:"max(env(safe-area-inset-bottom,0px),24px)",textAlign:"center",position:"relative"}}>
      {G}
      <button onClick={() => navigate("name")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.2)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
      <div className="bounce" style={{fontSize:60,marginBottom:14}}>🎂</div>
      <h2 style={{fontSize:26,fontWeight:800,marginBottom:8}}>Quanti anni hai, {childName}?</h2>
      <p style={{opacity:.85,marginBottom:40}}>Sceglierò le sfide perfette per te!</p>
      <div style={{display:"flex",gap:14,width:"100%",maxWidth:420}}>
        {[{label:"3 – 4",val:4,emoji:"🐣",desc:"Sfide visive e divertenti"},
          {label:"5 – 6",val:6,emoji:"🚀",desc:"Sfide con testo e numeri"},
          {label:"7 – 8",val:8,emoji:"🧑‍🚀",desc:"Sfide avanzate"}].map(o => (
          <button key={o.val} onClick={() => { setChildAge(o.val); navigate("companion"); }}
            style={{flex:1,background:"rgba(255,255,255,.2)",border:"3px solid rgba(255,255,255,.7)",borderRadius:24,padding:"20px 10px",cursor:"pointer",color:"white"}}>
            <div style={{fontSize:44}}>{o.emoji}</div>
            <div style={{fontWeight:900,fontSize:22,marginTop:8}}>{o.label}</div>
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
  };
  if (screen === "companion") return (
    <div key="companion" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0f0c29,#302b63,#0f0c29)",display:"flex",flexDirection:"column",alignItems:"center",padding:"36px 20px 0",paddingBottom:"max(env(safe-area-inset-bottom,0px),48px)",color:"white",position:"relative"}}>
      {G}
      <button onClick={() => navigate("age")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
      <div className="bounce" style={{fontSize:32,marginBottom:10}}>✨</div>
      <h2 style={{fontSize:22,fontWeight:900,marginBottom:4,textAlign:"center"}}>Scegli il tuo compagno!</h2>
      <p style={{opacity:.6,marginBottom:32,fontSize:13,textAlign:"center"}}>Sarà con te in ogni avventura magica, {childName}</p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,width:"100%",maxWidth:420}}>
        {COMPANIONS.map((c,i) => (
          <button key={c.id} onClick={() => { SFX.tap(); setCompanion(c.id); navigate("map"); }}
            className="slide-up pop-in"
            style={{
              background:`linear-gradient(160deg,${c.color}22,${c.color}08)`,
              border:`2px solid ${c.color}66`,
              borderRadius:28, padding:"24px 14px 20px",
              cursor:"pointer", color:"white",
              animationDelay:`${i*.09}s`,
              boxShadow:`0 8px 32px ${c.color}22`,
              display:"flex", flexDirection:"column", alignItems:"center",
            }}>
            <div style={{fontSize:80,lineHeight:1,filter:"drop-shadow(0 4px 16px rgba(0,0,0,.5))",animation:"float 3s ease-in-out infinite",animationDelay:`${i*.4}s`}}>{c.emoji}</div>
            <div style={{fontWeight:900,fontSize:17,marginTop:14}}>{c.name}</div>
            <div style={{fontSize:11,color:c.color,marginTop:3,fontWeight:800,letterSpacing:.5}}>{c.type.toUpperCase()}</div>
            <div style={{fontSize:11,opacity:.65,marginTop:8,lineHeight:1.5,textAlign:"center"}}>{COMP_DESC[c.id]}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // ════════════════════ SCREEN: MAP ═════════════════════════════════════════
  if (screen === "map") {
    const mapBg = season ? season.bg : "linear-gradient(180deg,#1a1a2e,#0f3460)";
    const equippedForComp = comp ? (COSMETICS.find(c => c.id === equippedCosmetic[comp.id]) || null) : null;
    const { lvl: mapLvl, pct: mapPct, toNext: mapToNext, nextTitle: mapNextTitle } = getLevelProgress(totalStars);
    return (
    <div key="map" className={screenAnim} style={{minHeight:"100dvh",background:mapBg,color:"white",padding:22,paddingBottom:"max(env(safe-area-inset-bottom,0px),22px)",position:"relative"}}>
      {G}
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
        <div className="slide-up" style={{background:`${season.color}22`,border:`1px solid ${season.color}55`,borderRadius:14,padding:"10px 14px",marginBottom:14,fontSize:12,textAlign:"center",fontWeight:700,color:"white"}}>
          {season.banner}
        </div>
      )}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18}}>
        <div>
          <div style={{fontSize:12,opacity:.5}}>{isReturning ? `Bentornato, ${childName}!` : `Ciao, ${childName}!`} 👋</div>
          <h2 style={{margin:0,fontSize:20,fontWeight:900}}>🗺️ I Mondi Magici</h2>
        </div>
        {comp && (
          <div onClick={() => navigate("profile")}
            style={{textAlign:"center",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <CompanionAvatar c={comp} size={48} anim={compAnim} cosmetic={equippedForComp} />
            <div style={{fontSize:10,opacity:.6}}>{comp.name}</div>
          </div>
        )}
      </div>
      {/* [C4] Time-of-day greeting */}
      {(() => {
        const h = new Date().getHours();
        const g = h < 10 ? "☀️ Buongiorno!" : h < 13 ? "🌤️ Buona mattina!" : h < 17 ? "🌤️ Buon pomeriggio!" : h < 21 ? "🌙 Buona sera!" : "🌟 Notte di avventura!";
        return <div style={{fontSize:11,color:"rgba(255,255,255,.45)",marginBottom:8,textAlign:"right"}}>{g}</div>;
      })()}
      <div style={{display:"flex",gap:8,marginBottom:10}}>
        {[{i:"⭐",v:totalStars,l:"stelle"},{i:"🏆",v:items.length,l:"trofei"}].map((s,idx) => (
          <div key={idx} style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
            <div style={{fontSize:20}}>{s.i}</div>
            <div style={{fontWeight:900,fontSize:18}}>{s.v}</div>
            <div style={{fontSize:10,opacity:.5}}>{s.l}</div>
          </div>
        ))}
        {/* [A6] Streak flame visual */}
        {(() => {
          const sz = streak >= 7 ? 28 : streak >= 3 ? 22 : 16;
          const flames = streak >= 7 ? "🔥🔥🔥" : streak >= 3 ? "🔥🔥" : "🔥";
          const today = new Date().toISOString().slice(0,10);
          const last7 = Array.from({length:7},(_,i) => { const d=new Date(); d.setDate(d.getDate()-6+i); return d.toISOString().slice(0,10); });
          const playedDates = new Set(sessionLog.map(s=>s.date));
          playedDates.add(today.slice(0,10)); // today always counts if logged in
          return (
            <div style={{flex:1,background:"rgba(255,255,255,.07)",borderRadius:14,padding:"10px 6px",textAlign:"center"}}>
              <div style={{fontSize:sz,animation:streak>=3?"pulse 1.4s ease-in-out infinite":"none"}}>{flames}</div>
              <div style={{fontWeight:900,fontSize:18}}>{streak}</div>
              <div style={{display:"flex",gap:2,justifyContent:"center",marginTop:4}}>
                {last7.map(d => (
                  <div key={d} style={{width:6,height:6,borderRadius:"50%",background:playedDates.has(d)?"#F97316":"rgba(255,255,255,.15)"}} />
                ))}
              </div>
            </div>
          );
        })()}
      </div>
      {/* Enhanced level badge with XP progress bar */}
      {(() => {
        return (
          <div style={{background:"rgba(255,215,0,.07)",border:"1px solid rgba(255,215,0,.25)",borderRadius:14,padding:"10px 14px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:mapToNext ? 8 : 0}}>
              <span style={{fontSize:26}}>{mapLvl.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:900,fontSize:13,color:"#FFD95A"}}>{mapLvl.title}</div>
                {mapToNext ? <div style={{fontSize:10,opacity:.5}}>{mapToNext} stelle per {mapNextTitle}</div>
                           : <div style={{fontSize:10,color:"#FFD700",opacity:.8}}>Livello massimo! 🏆</div>}
              </div>
              {allProfiles.length > 1 && (
                <button onClick={() => navigate('profile_select')} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:20,padding:"5px 12px",fontSize:11,cursor:"pointer",fontWeight:700}}>
                  Cambia
                </button>
              )}
            </div>
            {mapToNext > 0 && (
              <div>
                <div style={{background:"rgba(255,255,255,.1)",borderRadius:6,height:8,overflow:"hidden"}}>
                  <div style={{background:"linear-gradient(90deg,#FFB800,#FFD700)",height:"100%",borderRadius:6,width:`${mapPct}%`,transition:"width 1s cubic-bezier(.22,1,.36,1)"}} />
                </div>
                <div style={{fontSize:10,opacity:.4,marginTop:3,textAlign:"right"}}>{mapPct}%</div>
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
      {/* Daily challenge */}
      {(() => {
        const today = new Date().toISOString().slice(0,10);
        const done  = dailyCompletedDate === today;
        return (
          <button onClick={done ? undefined : startDaily}
            style={{width:"100%",marginBottom:14,background:done?"rgba(255,255,255,.04)":"linear-gradient(135deg,#FFD95A33,#FF7A0033)",
              border:`2px solid ${done?"rgba(255,255,255,.1)":"#FFD95A66"}`,borderRadius:18,
              padding:"14px 18px",color:"white",cursor:done?"default":"pointer",
              display:"flex",alignItems:"center",gap:14,textAlign:"left",
              opacity:done?.65:1}}>
            <span style={{fontSize:36}}>{done?"✅":"🌟"}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:900,fontSize:15,marginBottom:2}}>Sfida del Giorno</div>
              <div style={{fontSize:12,opacity:.7}}>{done?"Completata! Torna domani ✨":"3 sfide speciali · +3 stelle bonus"}</div>
            </div>
            {!done && <span style={{background:"#FFD95A",color:"#1a1a2e",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:900}}>+3⭐</span>}
          </button>
        );
      })()}
      {/* [C1] Sfida Fulmine quick-launch */}
      <button onClick={() => {
        const pool = Object.values(ALL_CHALLENGES).flat().filter(c => c.format === "visual_tap" && c.ageMin <= (childAge||5) && c.ageMax >= (childAge||5));
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        setFulminoPool(shuffled); setFulminoCi(0); setFulminoScore(0); setFulminoTime(60); setFulminoRunning(false);
        navigate("fulmine");
      }} className="pulse"
        style={{width:"100%",marginBottom:12,background:"linear-gradient(135deg,#FBBF24,#F59E0B)",border:"2px solid #FCD34D",borderRadius:18,padding:"13px 18px",color:"#1a1a2e",cursor:"pointer",display:"flex",alignItems:"center",gap:14,textAlign:"left",fontWeight:900}}>
        <span style={{fontSize:32}}>⚡</span>
        <div style={{flex:1}}>
          <div style={{fontSize:15}}>Sfida Fulmine!</div>
          <div style={{fontSize:11,fontWeight:600,opacity:.6}}>60 secondi · rispondi più che puoi!</div>
        </div>
        <span style={{background:"#1a1a2e22",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:900}}>+⭐</span>
      </button>
      <div style={{display:"flex",gap:8,marginBottom:18}}>
        {[["🗺️","Mondi"],["🌳","Skill"],["👨‍👩‍👧","Famiglia"],["✨","Look"]].map(([icon,label],i) => (
          <button key={i} onClick={() => {
            if(i===1) navigate("skills");
            else if(i===2) navigate("family");
            else if(i===3) navigate("cosmetics");
          }}
            style={{flex:1,background:i===0?"rgba(255,255,255,.18)":"rgba(255,255,255,.05)",border:i===0?"1px solid rgba(255,255,255,.3)":"none",borderRadius:12,padding:"10px 4px",color:"white",fontSize:11,fontWeight:700,cursor:"pointer"}}>
            {icon} {label}
          </button>
        ))}
      </div>
      {/* [A2] Visual path map */}
      <div style={{fontSize:11,opacity:.45,fontWeight:800,letterSpacing:1,marginBottom:10}}>🗺️ MONDI</div>
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
                      background:w.unlocked?`radial-gradient(circle at 35% 32%,${w.color}88,${w.color}cc)`:
                                            "rgba(255,255,255,.08)",
                      border:`3px solid ${w.unlocked?w.color:"rgba(255,255,255,.15)"}`,
                      boxShadow:w.unlocked?(has?`0 0 20px ${w.color}88,0 4px 16px rgba(0,0,0,.4)`:`0 4px 20px ${w.color}44,0 4px 16px rgba(0,0,0,.3)`):"none",
                      cursor:w.unlocked?"pointer":"default",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                      fontSize:32, padding:0, position:"relative",
                      transform:w.unlocked?"scale(1)":"scale(0.88)",
                      transition:"transform .2s",
                      animationDelay:`${i*.05}s`,
                    }}>
                    <span>{w.unlocked?w.emoji:"🔒"}</span>
                    {has && <div style={{position:"absolute",top:-6,right:-6,background:"#22C55E",borderRadius:"50%",width:20,height:20,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,border:"2px solid white"}}>✓</div>}
                    {!w.unlocked && w.starsNeeded > 0 && (
                      <div style={{position:"absolute",bottom:-10,left:"50%",transform:"translateX(-50%)",
                        background:"rgba(0,0,0,.8)",border:`1px solid ${w.color}44`,
                        borderRadius:10,padding:"1px 6px",fontSize:9,color:"rgba(255,255,255,.7)",whiteSpace:"nowrap"}}>
                        ⭐{w.starsNeeded}
                      </div>
                    )}
                  </button>
                  <div style={{fontSize:10,fontWeight:700,color:w.unlocked?"white":"rgba(255,255,255,.3)",textAlign:"center",lineHeight:1.2,maxWidth:90}}>
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
                  <div style={{width:22,height:6,marginBottom:22,borderRadius:3,
                    background: unlockedWorlds[i+1]?.unlocked
                      ? `linear-gradient(90deg,${w.color},${unlockedWorlds[i+1].color})`
                      : "rgba(255,255,255,.12)",
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
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:4}}>
        {unlockedWorlds.filter(w=>w.unlocked).map((w,i) => {
          const a   = STORY_ARCS[w.id];
          const has = items.find(it => it.emoji === a?.reward_emoji);
          return (
            <button key={w.id} onClick={() => startWorld(w)}
              className="slide-up"
              style={{background:`linear-gradient(135deg,${w.color}1a,${w.color}0d)`,
                border:`1.5px solid ${w.color}44`,borderRadius:16,padding:"12px 16px",
                cursor:"pointer",color:"white",display:"flex",alignItems:"center",gap:12,textAlign:"left",
                animationDelay:`${i*.05}s`}}>
              <span style={{fontSize:28}}>{w.emoji}</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:800,fontSize:14,display:"flex",alignItems:"center",gap:6}}>
                  {w.name}
                  {has && <span style={{background:"#22C55E44",color:"#4ade80",fontSize:9,fontWeight:900,borderRadius:20,padding:"2px 7px"}}>✓ FATTO</span>}
                </div>
                {has
                  ? <div style={{fontSize:10,marginTop:2,color:"#FFD95A",opacity:.8}}>🏆 {a.reward_name}</div>
                  : <div style={{fontSize:10,opacity:.4,marginTop:2}}>🎯 ~6 sfide · {young?"visive":"testo"}</div>}
              </div>
              <span style={{opacity:.4,fontSize:18}}>→</span>
            </button>
          );
        })}
      </div>
      <button onClick={() => navigate("parent")}
        style={{width:"100%",marginTop:16,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:14,padding:"11px",color:"rgba(255,255,255,.4)",fontSize:12,cursor:"pointer",fontWeight:700}}>
        🔐 Area Genitori
      </button>
      </div>{/* /relative z-1 */}
    </div>
    );
  }

  // ════════════════════ SCREEN: COPLAY INTRO ═══════════════════════════════
  if (screen === "coplay_intro" && world) return (
    <div key="coplay" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(160deg,#1a1a2e,#0f3460,#1a1a2e)",color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative"}}>
      {G}
      <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Esci</button>
      <div className="bounce" style={{fontSize:72,marginBottom:12}}>🤝</div>
      <h2 className="slide-up" style={{fontSize:24,fontWeight:900,marginBottom:10,color:"#FFD95A"}}>
        Modalità Co-Gioco
      </h2>
      <p className="fade-in" style={{fontSize:15,lineHeight:1.75,opacity:.9,marginBottom:20,maxWidth:360,animationDelay:".1s"}}>
        {childName} ha {childAge} anni — l'età perfetta per giocare insieme!
      </p>
      <div className="fade-in" style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"18px 22px",marginBottom:24,fontSize:14,maxWidth:360,lineHeight:1.9,animationDelay:".2s",textAlign:"left"}}>
        <div style={{marginBottom:6}}>🔊 <strong>Leggi le domande</strong> ad alta voce — le sentirà anche il telefono</div>
        <div style={{marginBottom:6}}>👆 <strong>Aiuta a toccare</strong> la risposta giusta insieme</div>
        <div>🎉 <strong>Festeggia sempre</strong>, qualunque sia la risposta!</div>
      </div>
      {comp && (
        <div className="slide-up" style={{background:"rgba(255,255,255,.1)",borderRadius:18,padding:"12px 18px",marginBottom:28,fontSize:13,maxWidth:320,animationDelay:".3s",display:"flex",alignItems:"center",gap:12}}>
          <CompanionAvatar c={comp} size={36} />
          <span>{comp.onWorldStart()}</span>
        </div>
      )}
      <button className="pop-in" onClick={() => navigate("world_intro")}
        style={{background:"white",color:"#1a1a2e",border:"none",borderRadius:50,padding:"16px 48px",fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,.25)",animationDelay:".4s"}}>
        Pronti insieme! 🎮
      </button>
    </div>
  );

  // ════════════════════ SCREEN: WORLD INTRO ════════════════════════════════
  if (screen === "world_intro" && arc) return (
    <div key="world_intro" className={screenAnim} style={{minHeight:"100dvh",background:`linear-gradient(160deg,#1a1a2e,${arc.color}44,#1a1a2e)`,color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",position:"relative"}}>
      {G}
      <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Mappa</button>
      <div className="float" style={{fontSize:72,marginBottom:16}}>{world.emoji}</div>
      <h2 className="slide-up" style={{fontSize:26,fontWeight:900,marginBottom:14,color:"#FFD95A"}}>{arc.intro_title}</h2>
      <p className="fade-in" style={{fontSize:16,lineHeight:1.75,opacity:.9,marginBottom:12,maxWidth:380,animationDelay:".15s"}}>{arc.intro_text}</p>
      <button onClick={() => speak(arc.intro_text, 0.8)}
        style={{background:"rgba(255,255,255,.15)",border:"none",color:"white",borderRadius:50,padding:"8px 22px",cursor:"pointer",marginBottom:24,fontSize:14}}>
        🔊 Riascolta
      </button>
      {comp && (
        <div className="slide-up" style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"12px 18px",marginBottom:32,fontSize:14,maxWidth:360,animationDelay:".25s",display:"flex",alignItems:"center",gap:12}}>
          <CompanionAvatar c={comp} size={38} />
          <span>{comp.onWorldStart()}</span>
        </div>
      )}
      <button className="pop-in" onClick={() => navigate("challenge")}
        style={{background:"white",color:"#1a1a2e",border:"none",borderRadius:50,padding:"16px 48px",fontWeight:900,fontSize:18,cursor:"pointer",boxShadow:"0 6px 24px rgba(0,0,0,.25)",animationDelay:".35s"}}>
        Inizia la Missione! ⚔️
      </button>
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
        <div key="fulmine-end" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#2d1b69)",color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          {G}
          <div className="pop-in" style={{fontSize:80,marginBottom:8}}>⚡</div>
          <h2 className="slide-up" style={{fontSize:26,fontWeight:900,marginBottom:6,color:"#FCD34D"}}>Sfida Fulmine!</h2>
          <div className="fade-in" style={{fontSize:64,fontWeight:900,margin:"16px 0",color:"#FCD34D"}}>{fulminoScore}</div>
          <div style={{opacity:.7,marginBottom:24}}>risposte corrette in 60 secondi</div>
          {starsWon > 0 && (
            <div className="pop-in glow" style={{background:"rgba(255,215,0,.15)",borderRadius:24,padding:"18px 28px",marginBottom:24,border:"2px solid rgba(255,215,0,.45)"}}>
              <div style={{fontSize:36,marginBottom:4}}>{"⭐".repeat(Math.min(starsWon, 10))}</div>
              <div style={{fontWeight:900,color:"#FCD34D"}}>+{starsWon} stelle guadagnate!</div>
            </div>
          )}
          {starsWon === 0 && (
            <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"14px 22px",marginBottom:24,fontSize:14,opacity:.7}}>
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
        <div key="fulmine-ready" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#2d1b69)",color:"white",padding:28,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center"}}>
          {G}
          <div className="float" style={{fontSize:80,marginBottom:12}}>⚡</div>
          <h2 className="slide-up" style={{fontSize:26,fontWeight:900,color:"#FCD34D",marginBottom:10}}>Sfida Fulmine!</h2>
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
      <div key={`ful-${fulminoCi}`} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#2d1b69)",color:"white",padding:20,display:"flex",flexDirection:"column",position:"relative"}}>
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
    const isMC      = ch.format === "multiple_choice";
    const isVis     = ch.format === "visual_tap";
    const isStory   = ch.format === "story_choice";
    const isSeq     = ch.format === "sequence_tap";
    const isDrag    = ch.format === "drag_drop";
    const isRhyme   = ch.format === "rhyme_complete";
    const isWordPic = ch.format === "word_picture";
    const isAlpha   = ch.id?.startsWith("ba_");  // biblioteca alphabet challenge
    const alphaLetter = isAlpha ? ch.id.replace("ba_","") : null;
    const pts     = ch.isBoss ? 3 : young ? 1 : 2;

    const worldColor = world?.color || "#22C55E";
    const youngBg = young && !ch.isBoss;
    const youngColors = ["#FF5252","#26C6DA","#66BB6A","#FFA726"];
    return (
      <div key={`ch-${ci}`} className={screenAnim} style={{minHeight:"100dvh",background:youngBg?"linear-gradient(180deg,#FFF8EC,#F0EAFF)":ch.isBoss?`linear-gradient(135deg,#1a0808,#3a0808)`:`linear-gradient(180deg,#1a1a2e,${worldColor}1a)`,color:youngBg?"#1a1a2e":"white",padding:20,display:"flex",flexDirection:"column",position:"relative"}}>
        {G}
        <WorldBg worldId={world?.id} />
        {/* Session time limit overlay */}
        {timeLimit > 0 && sessionStart > 0 && Math.floor((Date.now() - sessionStart) / 60000) >= timeLimit && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.88)",zIndex:1001,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#1e1e3a",borderRadius:24,padding:"32px 24px",maxWidth:320,textAlign:"center"}}>
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
                <button onClick={() => { stopMusic(); navigate("map"); }}
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
            <div className="slide-up" style={{background:"#1e1e3a",borderRadius:24,padding:"26px 22px",maxWidth:360,textAlign:"center",marginBottom:20,boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
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
        {/* Exit confirmation modal */}
        {exitConfirm && (
          <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.82)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:24}}>
            <div style={{background:"#1e1e3a",borderRadius:24,padding:"28px 24px",maxWidth:320,textAlign:"center",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
              <div style={{fontSize:52,marginBottom:12}}>🚪</div>
              <h3 style={{color:"white",margin:"0 0 8px",fontSize:20}}>Vuoi uscire?</h3>
              <p style={{color:"rgba(255,255,255,.65)",fontSize:14,margin:"0 0 24px",lineHeight:1.6}}>Perderai i progressi di questa sessione.</p>
              <div style={{display:"flex",gap:12}}>
                <button onClick={() => { stopMusic(); setExitConfirm(false); navigate("map"); }}
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
        {/* Top bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,position:"relative",zIndex:1}}>
          <div style={{display:"flex",gap:6}}>
            <button onClick={() => setExitConfirm(true)}
              style={{background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.1)",border:"none",color:youngBg?"#444":"white",borderRadius:12,padding:"8px 14px",cursor:"pointer",fontSize:14}}>
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
              style={{background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.1)",border:"none",color:youngBg?"#444":"white",borderRadius:12,padding:"8px 12px",cursor:"pointer",fontSize:17}}
              title="Rileggi la domanda">
              🔊
            </button>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10,fontSize:14}}>
            {world && <span style={{fontSize:11,background:`${worldColor}33`,border:`1px solid ${worldColor}55`,borderRadius:20,padding:"2px 10px",color:worldColor,fontWeight:800}}>{world.emoji} {world.name}</span>}
            {starPop
              ? <span className="star-pop" style={{fontSize:22,color:"#FFD95A"}}>⭐+{pts}</span>
              : <span style={{fontWeight:800,color:youngBg?"#1a1a2e":"white"}}>⭐ {sessionStars}</span>
            }
            {combo >= 2 && <span style={{fontSize:12,color:"#F97316",fontWeight:900}}>🔥×{combo}</span>}
          </div>
          {comp && <CompanionAvatar c={comp} size={40} anim={compAnim} talking={compTalking} mood={compMood} />}
        </div>
        {/* Progress bar — Duolingo style */}
        <div style={{position:"relative",zIndex:1,marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,background:youngBg?"rgba(0,0,0,.08)":"rgba(255,255,255,.10)",borderRadius:50,height:youngBg?16:12,overflow:"hidden",boxShadow:"inset 0 1px 3px rgba(0,0,0,.15)"}}>
            <div style={{
              background:ch.isBoss?"linear-gradient(90deg,#FF4444,#FF8800)":youngBg?`linear-gradient(90deg,${youngColors[0]},${youngColors[2]})`:"linear-gradient(90deg,#22C55E,#4ade80)",
              height:"100%", borderRadius:50,
              width:`${progressPct}%`,
              transition:"width .5s cubic-bezier(.22,1,.36,1)",
              boxShadow:youngBg?"0 2px 6px rgba(255,82,82,.35)":"0 2px 6px rgba(34,197,94,.35)",
            }} />
          </div>
          <div style={{fontSize:11,fontWeight:900,color:youngBg?"#666":"rgba(255,255,255,.5)",whiteSpace:"nowrap",minWidth:32,textAlign:"right"}}>
            {ci+1}/{challenges.length}
          </div>
        </div>
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
        {isWordPic ? (
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
                fontSize:96, fontWeight:900, lineHeight:1,
                color:youngBg?"#764ba2":worldColor,
                textShadow:youngBg?"none":`0 0 30px ${worldColor}88`,
                fontFamily:"serif", cursor:"pointer",
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
            {isVis && <div onClick={() => { SFX.tap(); speak(ch.prompt); }}
              style={{fontSize:youngBg?60:52,letterSpacing:8,marginBottom:12,cursor:"pointer"}}>{ch.visual}</div>}
            {isStory
              ? <p style={{fontSize:youngBg?17:15,lineHeight:1.75,margin:0,color:youngBg?"#333":"inherit"}}>{ch.situation}</p>
              : <p style={{fontSize:isVis?(youngBg?22:19):youngBg?19:15,lineHeight:1.65,margin:0,fontWeight:isVis?700:youngBg?700:500,whiteSpace:"pre-line",color:youngBg?"#222":"inherit"}}>{ch.prompt}</p>
            }
          </div>
        )}

        {/* Story choice */}
        {isStory && !storyChoice && (
          <div style={{display:"flex",flexDirection:"column",gap:12,position:"relative",zIndex:1}}>
            {ch.choices.map((c,idx) => (
              <button key={idx} onClick={() => answerStory(c)}
                style={{background:"rgba(255,255,255,.09)",border:"2px solid rgba(255,255,255,.15)",borderRadius:18,padding:"18px 20px",color:"white",fontSize:15,fontWeight:600,cursor:"pointer",textAlign:"left"}}>
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
                <div key={i} style={{width:28,height:28,borderRadius:"50%",background:seqTaps.length>i?"#22C55E":"rgba(255,255,255,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,transition:"all .2s"}}>
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
                    style={{background:tapped?"rgba(34,197,94,.3)":seqError?"rgba(239,68,68,.15)":"rgba(255,255,255,.09)",
                      border:`2.5px solid ${tapped?"#22C55E":"rgba(255,255,255,.14)"}`,
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
                    style={{
                      minHeight:90, borderRadius:20,
                      border:`3px dashed ${dragPicked !== null ? (world?.color || "#A78BFA") : "rgba(255,255,255,.25)"}`,
                      background: placedItem ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.04)",
                      display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                      cursor:dragPicked!==null?"pointer":"default",
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
                    className="ans-vis"
                    style={{
                      width:72, height:72, borderRadius:18,
                      background: isPicked ? `${world?.color || "#A78BFA"}44` : "rgba(255,255,255,.1)",
                      border:`3px solid ${isPicked ? (world?.color||"#A78BFA") : "rgba(255,255,255,.2)"}`,
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

        {/* Multiple choice / visual tap */}
        {(isMC || isVis || isRhyme || isWordPic || isAlpha) && (
          <div style={{position:"relative",zIndex:1}}>
            {wrongStreak >= 3 && !done && !showHint && (
              <button onClick={() => setShowHint(true)}
                style={{width:"100%",marginBottom:10,background:"rgba(255,213,0,.18)",border:"2px solid rgba(255,213,0,.5)",borderRadius:14,padding:"10px 16px",color:"#FFD95A",cursor:"pointer",fontSize:14,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                💡 Aiuto! Mostrami un suggerimento
              </button>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:(isVis||isWordPic)?14:youngBg?14:10}}>
              {ch.options.map((opt,idx) => {
                let bg = "rgba(255,255,255,.09)", border = "rgba(255,255,255,.14)";
                let correct = false, wrong = false;
                const isHinted = showHint && idx === ch.correct && !done;
                if (youngBg && !done && !isHinted) { bg=youngColors[idx%4]+"22"; border=youngColors[idx%4]; }
                if (isHinted) { bg="rgba(255,213,0,.12)"; border="#FFD95A88"; }
                if (done) {
                  if (idx === ch.correct)    { bg=youngBg?"#22C55E":"rgba(34,197,94,.35)";  border="#22C55E"; correct=true; }
                  else if (idx === selected) { bg=youngBg?"#FF5252":"rgba(239,68,68,.35)";  border="#EF4444"; wrong=true; }
                  else if (youngBg) { bg="rgba(0,0,0,.04)"; border="rgba(0,0,0,.08)"; }
                }
                return (
                  <button key={idx} onClick={(e) => answerMC(idx, e)}
                    className={`${(isVis||isWordPic||isAlpha)?"ans-vis":"ans-btn"}${correct?" correct-flash":""}`}
                    style={{
                      background:bg, border:`3px solid ${border}`,
                      borderRadius: (isVis||isWordPic||isAlpha) ? 28 : youngBg ? 22 : 18,
                      color: youngBg ? (done && (correct||wrong) ? "white" : youngColors[idx%4]) : "white",
                      fontWeight: youngBg ? 800 : 600,
                      cursor:done?"default":"pointer",
                      height: (isVis||isWordPic||isAlpha) ? 120 : (youngBg ? 96 : young ? 88 : 76),
                      fontSize: (isVis||isWordPic||isAlpha) ? 52 : youngBg ? 19 : 17,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      padding: (isVis||isWordPic||isAlpha) ? 0 : "16px 12px",
                      transform: wrong ? "scale(0.97)" : correct ? "scale(1.04)" : "scale(1)",
                      boxShadow: youngBg&&!done ? `0 4px 14px ${youngColors[idx%4]}44` : isHinted ? "0 0 16px rgba(255,213,0,.4)" : correct ? "0 0 20px rgba(34,197,94,.4)" : "none",
                      position:"relative",
                    }}>
                    {isHinted && <span style={{position:"absolute",top:5,left:8,fontSize:14,lineHeight:1}}>💡</span>}
                    {opt}
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
                  fontWeight:900, fontSize:youngBg?20:17,
                  color:isCorrect?(youngBg?"#15803D":"#4ade80"):(youngBg?"#D97706":"#FCD34D"),
                  marginBottom:3,
                }}>
                  {isCorrect
                    ? (isDrag ? "Abbinamenti perfetti!" : isSeq ? "Ordine perfetto!" : "Perfetto!")
                    : "Quasi ci sei!"}
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
              fontWeight:900, fontSize:18, cursor:"pointer",
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
      <div key="world_end" className={screenAnim} style={{minHeight:"100dvh",background:`linear-gradient(160deg,#1a1a2e,${arc.color}55,#1a1a2e)`,color:"white",padding:28,paddingBottom:"max(env(safe-area-inset-bottom,0px),28px)",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        {G}
        <div className="pop-in" style={{fontSize:72,marginBottom:4}}>{arc.reward_emoji}</div>
        <div className="bounce" style={{fontSize:64,marginBottom:14}}>{world.emoji}</div>
        <h2 className="slide-up" style={{fontSize:24,fontWeight:900,color:"#FFD95A",marginBottom:12}}>Mondo completato! 🏆</h2>
        <p className="fade-in" style={{fontSize:15,lineHeight:1.75,opacity:.9,marginBottom:24,maxWidth:360,animationDelay:".1s"}}>{arc.outro}</p>
        {comp && (
          <div className="slide-up" style={{background:"rgba(255,255,255,.1)",borderRadius:20,padding:"12px 18px",marginBottom:22,fontSize:14,maxWidth:360,animationDelay:".2s",display:"flex",alignItems:"center",gap:12}}>
            <CompanionAvatar c={comp} size={38} />
            <span>{comp.onWorld()}</span>
          </div>
        )}
        <div className="pop-in glow" style={{background:"rgba(255,215,0,.15)",borderRadius:24,padding:"20px 32px",marginBottom:24,border:"2px solid rgba(255,215,0,.45)",animationDelay:".3s"}}>
          <div style={{fontSize:50}}>{arc.reward_emoji}</div>
          <div style={{fontWeight:800,fontSize:18,marginTop:8,color:"#FFD95A"}}>{arc.reward_name}</div>
          <div style={{fontSize:12,opacity:.65,marginTop:4}}>Sbloccato per {comp?.name}!</div>
        </div>
        {world?.id === "daily" && (
          <div className="pop-in glow" style={{background:"rgba(255,213,0,.18)",borderRadius:20,padding:"12px 28px",marginBottom:16,border:"2px solid rgba(255,213,0,.5)",fontSize:16,fontWeight:900,color:"#FFD95A",animationDelay:".35s"}}>
            🌟 +3 stelle bonus!
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:10,marginBottom:20,width:"100%",maxWidth:360}}>
          {[{i:"⭐",v:sessionStars,l:"stelle"},{i:"✅",v:correct,l:"giuste"},{i:"🎯",v:`${pct}%`,l:"precisione"},{i:"🔥",v:combo,l:"combo max"}].map((s,idx) => (
            <div key={idx} className="pop-in" style={{textAlign:"center",background:"rgba(255,255,255,.08)",borderRadius:16,padding:"12px 6px",animationDelay:`${idx*.06}s`}}>
              <div style={{fontSize:24}}>{s.i}</div>
              <div style={{fontWeight:900,fontSize:18,marginTop:4}}>{s.v}</div>
              <div style={{opacity:.5,fontSize:10,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Skills trained this session */}
        {(() => {
          const trained = [...new Set(results.map(r => getSkill(r.type)))];
          return trained.length > 0 && (
            <div className="fade-in" style={{background:"rgba(255,255,255,.07)",borderRadius:18,padding:"12px 18px",marginBottom:20,width:"100%",maxWidth:360,textAlign:"left"}}>
              <div style={{fontSize:11,opacity:.5,fontWeight:800,marginBottom:8,letterSpacing:1}}>ABILITÀ ALLENATE OGGI</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {trained.map(sk => {
                  const s = SKILLS.find(s => s.id === sk);
                  return s ? (
                    <span key={sk} style={{background:`${s.color}33`,border:`1px solid ${s.color}55`,borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700,color:s.color}}>
                      {s.emoji} {s.name}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })()}
        <div style={{width:"100%",maxWidth:360,marginBottom:12}}>
          {/* Skills breakdown */}
          <div style={{background:"rgba(255,255,255,.07)",borderRadius:18,padding:"14px 16px",marginBottom:12}}>
            <div style={{fontSize:11,opacity:.5,fontWeight:800,marginBottom:10,letterSpacing:1}}>ABILITÀ ALLENATE</div>
            {SKILLS.map(sk => (
              <div key={sk.id} style={{marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                  <span>{sk.emoji} {sk.name}</span>
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
            }} style={{width:"100%",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",border:"none",borderRadius:50,padding:"14px",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:"0 4px 16px rgba(102,126,234,.3)",marginBottom:10}}>
              📤 Condividi il risultato!
            </button>
          )}
          <button onClick={() => navigate("session_stats")}
            style={{width:"100%",background:"rgba(255,255,255,.1)",color:"white",border:"1px solid rgba(255,255,255,.2)",borderRadius:50,padding:"13px",fontWeight:800,fontSize:14,cursor:"pointer",marginBottom:10}}>
            📊 Vedi statistiche dettagliate
          </button>
          <button onClick={() => { navigate("map"); setSessionStars(0); setResults([]); setCombo(0); }}
            style={{width:"100%",background:"white",color:"#1a1a2e",border:"none",borderRadius:50,padding:"16px",fontWeight:900,fontSize:16,cursor:"pointer",boxShadow:"0 4px 16px rgba(0,0,0,.2)"}}>
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
      <div key="stats" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#4A2090)",color:"white",padding:24,display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center"}}>
        {G}
        <div className="pop-in" style={{fontSize:60,marginBottom:12}}>{pct===100?"🏆":pct>=60?"⭐":"💪"}</div>
        <h2 style={{fontSize:24,fontWeight:900,marginBottom:8}}>{pct===100?"Missione perfetta!":pct>=60?"Ottimo lavoro!":"Bel tentativo!"}</h2>
        {comp && (
          <div style={{background:"rgba(255,255,255,.08)",borderRadius:20,padding:"12px 18px",marginBottom:18,fontSize:13,maxWidth:320,display:"flex",alignItems:"center",gap:12}}>
            <CompanionAvatar c={comp} size={36} />
            <span>{pct>=60?comp.onCorrect():comp.onWrong()}</span>
          </div>
        )}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,width:"100%",maxWidth:340,marginBottom:22}}>
          {[{i:"✅",v:correct,l:"Corrette"},{i:"⭐",v:sessionStars,l:"Stelle"},{i:"🎯",v:`${pct}%`,l:"Precisione"},{i:"🔥",v:combo,l:"Combo"}].map((s,i) => (
            <div key={i} className="pop-in" style={{background:"rgba(255,255,255,.08)",borderRadius:18,padding:"16px 10px",animationDelay:`${i*.07}s`}}>
              <div style={{fontSize:26}}>{s.i}</div>
              <div style={{fontWeight:900,fontSize:20,marginTop:6}}>{s.v}</div>
              <div style={{fontSize:11,opacity:.55,marginTop:2}}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{width:"100%",maxWidth:340,background:"rgba(255,255,255,.06)",borderRadius:20,padding:"16px 18px",marginBottom:22,textAlign:"left"}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:12,letterSpacing:1}}>LE TUE ABILITÀ</div>
          {SKILLS.map(sk => (
            <div key={sk.id} style={{marginBottom:11}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                <span>{sk.emoji} {sk.name}</span>
                <span style={{color:sk.color,fontWeight:800}}>Lv.{skills[sk.id]}</span>
              </div>
              <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:8}}>
                <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(skills[sk.id]/10)*100}%`,transition:"width .7s"}} />
              </div>
            </div>
          ))}
        </div>
        <div style={{display:"flex",gap:10,width:"100%",maxWidth:340}}>
          <button onClick={() => navigate(arc ? "world_end" : "map")}
            style={{flex:1,background:"rgba(255,255,255,.12)",color:"white",border:"1px solid rgba(255,255,255,.2)",borderRadius:50,padding:"14px",fontWeight:800,fontSize:14,cursor:"pointer"}}>
            ← Risultati
          </button>
          <button onClick={() => { navigate("map"); setSessionStars(0); setResults([]); setCombo(0); }}
            style={{flex:2,background:"white",color:"#4A2090",border:"none",borderRadius:50,padding:"14px",fontWeight:900,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,.25)"}}>
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
            <div key={sk.id} className="slide-up" style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"18px 20px",animationDelay:`${i*.07}s`,border:`1px solid ${sk.color}22`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <span style={{fontSize:30,background:`${sk.color}22`,borderRadius:12,padding:"6px 8px",lineHeight:1}}>{sk.emoji}</span>
                  <div>
                    <div style={{fontWeight:900,fontSize:16}}>{sk.name}</div>
                    <div style={{fontSize:11,opacity:.5,marginTop:1}}>{SKILL_DESC[sk.id]}</div>
                  </div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:sk.color,fontWeight:900,fontSize:20}}>Lv.{lvl}</div>
                  <div style={{fontSize:11,opacity:.4}}>{Array(stars).fill("⭐").join("")||"—"}</div>
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
    <div key="family" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#1a1a2e,#3d1f38)",color:"white",padding:24}}>
      {G}
      <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",marginBottom:16,fontSize:14,fontWeight:700}}>← Mappa</button>
      <h2 style={{margin:"0 0 4px",fontSize:26,fontWeight:800}}>👨‍👩‍👧 Missioni Famiglia</h2>
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
                    <span style={{background:sk.color,color:"white",borderRadius:20,padding:"3px 10px",fontSize:11,fontWeight:700}}>{sk.emoji} {sk.name}</span>
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
    const unlocked = getUnlockedCosmetics(totalStars);
    const locked   = COSMETICS.filter(c => totalStars < c.starsNeeded);
    const equipped = equippedCosmetic[comp.id] || null;
    const equippedObj = COSMETICS.find(c => c.id === equipped) || null;
    return (
      <div key="cosmetics" className={screenAnim} style={{minHeight:"100dvh",background:`linear-gradient(160deg,#0f0c29,#1a0f2e,#0f0c29)`,color:"white",padding:24}}>
        {G}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Mappa</button>
          <h2 style={{margin:0,fontSize:20,fontWeight:900}}>✨ Personalizza</h2>
        </div>
        {/* Current look preview */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:24,padding:"22px 20px",marginBottom:20,display:"flex",flexDirection:"column",alignItems:"center",gap:12}}>
          <div style={{fontSize:12,opacity:.5,letterSpacing:1,fontWeight:800,marginBottom:4}}>IL TUO {comp.name.toUpperCase()} ADESSO</div>
          <CompanionAvatar c={comp} size={96} anim="float" cosmetic={equippedObj} />
          <div style={{fontSize:13,opacity:.7}}>{equippedObj ? `Equipaggiato: ${equippedObj.emoji} ${equippedObj.name}` : "Nessun cosmetico equipaggiato"}</div>
          {equipped && (
            <button onClick={() => setEquippedCosmetic(prev => { const n = {...prev}; delete n[comp.id]; return n; })}
              style={{background:"rgba(255,255,255,.1)",border:"none",color:"rgba(255,255,255,.6)",borderRadius:20,padding:"6px 16px",fontSize:12,cursor:"pointer"}}>
              Rimuovi cosmetico
            </button>
          )}
        </div>
        {/* Unlocked cosmetics */}
        {unlocked.length > 0 && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:12,opacity:.5,fontWeight:800,letterSpacing:1,marginBottom:12}}>SBLOCCATI ({unlocked.length})</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {unlocked.map(c => {
                const isEq = equipped === c.id;
                return (
                  <button key={c.id} onClick={() => setEquippedCosmetic(prev => ({...prev, [comp.id]: isEq ? undefined : c.id}))}
                    className={isEq ? "pulse" : ""}
                    style={{background:isEq?"rgba(192,132,252,.25)":"rgba(255,255,255,.07)",border:`2px solid ${isEq?"#C084FC":"rgba(255,255,255,.12)"}`,borderRadius:18,padding:"14px 8px",cursor:"pointer",textAlign:"center",color:"white",position:"relative"}}>
                    {isEq && <div style={{position:"absolute",top:4,right:6,fontSize:10,fontWeight:900,color:"#C084FC"}}>ON</div>}
                    <div style={{fontSize:32,marginBottom:4}}>{c.emoji}</div>
                    <div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{c.name}</div>
                    <div style={{fontSize:9,opacity:.5,marginTop:2}}>{c.type === "hat" ? "Cappello" : c.type === "acc" ? "Accessorio" : "Aura"}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {/* Locked cosmetics */}
        {locked.length > 0 && (
          <div>
            <div style={{fontSize:12,opacity:.5,fontWeight:800,letterSpacing:1,marginBottom:12}}>DA SBLOCCARE</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
              {locked.map(c => (
                <div key={c.id} style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:18,padding:"14px 8px",textAlign:"center",opacity:.55}}>
                  <div style={{fontSize:32,marginBottom:4,filter:"grayscale(1)"}}>🔒</div>
                  <div style={{fontSize:11,fontWeight:700,lineHeight:1.2}}>{c.name}</div>
                  <div style={{fontSize:9,opacity:.6,marginTop:3}}>⭐ {c.starsNeeded} stelle</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {unlocked.length === 0 && (
          <div style={{textAlign:"center",padding:"40px 20px",opacity:.5}}>
            <div style={{fontSize:48,marginBottom:12}}>🔒</div>
            <p style={{fontSize:14}}>Guadagna 5 stelle per sbloccare il tuo primo cosmetico!</p>
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
      <div key="school" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(160deg,#0a0a2e,#1a1a4e)",color:"white",padding:24}}>
        {G}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => navigate("parent")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
          <h2 style={{margin:0,fontSize:20,fontWeight:900}}>🏫 Modalità Scuola</h2>
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
          <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"18px 20px",marginBottom:16}}>
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
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"18px 20px",marginBottom:16}}>
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
      <CompanionAvatar c={comp} size={110} anim="float" cosmetic={COSMETICS.find(c => c.id === equippedCosmetic[comp.id]) || null} />
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

    if (!parentUnlocked) return (
      <div key="parent-lock" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#0f0c29,#302b63)",color:"white",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,textAlign:"center"}}>
        {G}
        <button onClick={() => navigate("map")} style={{position:"absolute",top:20,left:20,background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Indietro</button>
        <div style={{fontSize:56,marginBottom:12}}>🔐</div>
        <h2 style={{fontSize:22,fontWeight:900,margin:"0 0 6px"}}>Area Genitori</h2>
        <p style={{fontSize:13,opacity:.6,marginBottom:28}}>{!pinSaved ? "Crea un PIN a 4 cifre" : "Inserisci il tuo PIN"}</p>
        {/* PIN dots */}
        <div style={{display:"flex",gap:12,marginBottom:8}}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{width:50,height:58,background:"rgba(255,255,255,.1)",borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,border:`2px solid ${pinInput.length > i ? "#A78BFA" : "transparent"}`}}>
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
              style={{height:56,background:n===""?"transparent":"rgba(255,255,255,.1)",border:"none",borderRadius:14,color:"white",fontSize:20,fontWeight:700,cursor:n===""?"default":"pointer"}}>
              {n}
            </button>
          ))}
        </div>
      </div>
    );

    // Dashboard (unlocked)
    const completedMissions = missionsDone.length;
    const timeLimitOptions = [0, 15, 20, 30];
    return (
      <div key="parent-dash" className={screenAnim} style={{minHeight:"100dvh",background:"linear-gradient(135deg,#0f0c29,#302b63)",color:"white",padding:24}}>
        {G}
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
          <button onClick={() => navigate("map")} style={{background:"rgba(255,255,255,.1)",border:"none",color:"white",borderRadius:50,padding:"8px 16px",cursor:"pointer",fontSize:14,fontWeight:700}}>← Mappa</button>
          <h2 style={{margin:0,fontSize:20,fontWeight:900}}>🔐 Area Genitori</h2>
        </div>

        {/* Child overview */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>PROFILO DI {childName.toUpperCase()}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,textAlign:"center"}}>
            {[{i:"⭐",v:totalStars,l:"stelle"},{i:"🔥",v:streak,l:"streak"},{i:"✅",v:completedMissions,l:"missioni"}].map((s,i) => (
              <div key={i} style={{background:"rgba(255,255,255,.06)",borderRadius:14,padding:"12px 6px"}}>
                <div style={{fontSize:22}}>{s.i}</div>
                <div style={{fontWeight:900,fontSize:20}}>{s.v}</div>
                <div style={{fontSize:10,opacity:.5}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>ABILITÀ SVILUPPATE</div>
          {SKILLS.map(sk => (
            <div key={sk.id} style={{marginBottom:9}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:3}}>
                <span>{sk.emoji} {sk.name}</span>
                <span style={{color:sk.color,fontWeight:800}}>Lv.{skills[sk.id]}</span>
              </div>
              <div style={{background:"rgba(255,255,255,.08)",borderRadius:6,height:7}}>
                <div style={{background:sk.color,height:"100%",borderRadius:6,width:`${(skills[sk.id]/10)*100}%`,transition:"width .7s"}} />
              </div>
            </div>
          ))}
        </div>

        {/* Age change */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>🎂 ETÀ DI {childName.toUpperCase()}</div>
          <div style={{display:"flex",gap:8}}>
            {[{label:"3–4",val:4},{label:"5–6",val:6},{label:"7–8",val:8}].map(o => (
              <button key={o.val} onClick={() => setChildAge(o.val)}
                style={{flex:1,background:childAge===o.val?"#A78BFA":"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"9px 4px",color:"white",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {o.label}
              </button>
            ))}
          </div>
          <p style={{fontSize:11,opacity:.45,marginTop:8,marginBottom:0}}>Cambia fascia di età senza perdere le stelle.</p>
        </div>

        {/* Time limit */}
        <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
          <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>⏱ LIMITE DI SESSIONE</div>
          <p style={{fontSize:12,opacity:.6,marginBottom:12}}>Mostra una pausa quando il bambino gioca troppo a lungo.</p>
          <div style={{display:"flex",gap:8}}>
            {timeLimitOptions.map(v => (
              <button key={v} onClick={() => setTimeLimit(v)}
                style={{flex:1,background:timeLimit===v?"#A78BFA":"rgba(255,255,255,.08)",border:"none",borderRadius:10,padding:"9px 4px",color:"white",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                {v===0?"Off":`${v} min`}
              </button>
            ))}
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
              // Register periodic sync if available
              if ('periodicSync' in navigator.serviceWorker) {
                const reg = await navigator.serviceWorker.ready.catch(() => null);
                if (reg) reg.periodicSync?.register('daily-reminder', { minInterval: 86400000 }).catch(() => {});
              }
              // Force re-render
              window.dispatchEvent(new Event('notif-update'));
            }
          }
          return (
            <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"14px 18px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>🔔 PROMEMORIA GIORNALIERO</div>
              <p style={{fontSize:12,opacity:.6,marginBottom:12}}>Ricevi una notifica quando è ora di giocare con la sfida del giorno.</p>
              {denied
                ? <p style={{fontSize:11,color:"#F87171"}}>Notifiche bloccate dal browser. Abilitale nelle impostazioni del sito.</p>
                : granted
                  ? <div style={{display:"flex",alignItems:"center",gap:10,color:"#4ade80",fontSize:13,fontWeight:700}}><span>✅</span>Promemoria attivo!</div>
                  : <button onClick={enableNotifications}
                      style={{background:"#A78BFA",border:"none",color:"white",borderRadius:50,padding:"10px 24px",fontSize:13,fontWeight:900,cursor:"pointer",width:"100%"}}>
                      Attiva promemoria 🔔
                    </button>
              }
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
            if (!logByDay[s.date]) logByDay[s.date] = { stars:0, sessions:0, correct:0, total:0 };
            logByDay[s.date].stars    += s.stars;
            logByDay[s.date].sessions += 1;
            logByDay[s.date].correct  += s.correct || 0;
            logByDay[s.date].total    += s.total   || 0;
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
              return `<tr><td>${d}</td><td>${e.sessions||0}</td><td>${e.stars||0}</td><td>${acc !== null ? acc+'%' : '—'}</td></tr>`;
            }).join('');
            const html = `<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><title>Report MondoMago — ${childName}</title>
<style>body{font-family:system-ui,sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#f9fafb}h1{color:#764ba2}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #e5e7eb;padding:10px;text-align:center}th{background:#f3f4f6;font-weight:700}.stat{display:inline-block;background:#ede9fe;border-radius:12px;padding:12px 20px;margin:6px;text-align:center}.stat b{display:block;font-size:24px;color:#764ba2}</style></head>
<body><h1>📊 Report MondoMago — ${childName}</h1>
<p>Generato il ${new Date().toLocaleDateString('it-IT')} | Livello: ${lvl.emoji} ${lvl.title} | Stelle totali: ${totalStars} ⭐</p>
<div><span class="stat"><b>${weekStars}</b>Stelle (7gg)</span><span class="stat"><b>${weekSess}</b>Sessioni (7gg)</span><span class="stat"><b>${streak}</b>Giorni consecutivi</span><span class="stat"><b>${achievements.length}/${ACHIEVEMENTS.length}</b>Obiettivi</span></div>
<h2>Attività degli ultimi 7 giorni</h2><table><tr><th>Data</th><th>Sessioni</th><th>Stelle</th><th>Precisione</th></tr>${rows}</table>
<h2>Abilità sviluppate</h2><table><tr><th>Abilità</th><th>Livello</th></tr>${SKILLS.map(sk=>`<tr><td>${sk.emoji} ${sk.name}</td><td>Lv.${skills[sk.id]}/10</td></tr>`).join('')}</table>
<p style="color:#9ca3af;font-size:12px">MondoMago — App educativa per bambini 3–8 anni. Tutti i dati sono salvati solo su questo dispositivo.</p></body></html>`;
            const blob = new Blob([html], {type:'text/html'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `mondomago_report_${childName.toLowerCase()}_${today.toISOString().slice(0,10)}.html`;
            a.click();
            URL.revokeObjectURL(a.href);
          }
          return (
            <div style={{background:"rgba(255,255,255,.07)",borderRadius:20,padding:"16px 18px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:800,opacity:.5,marginBottom:10,letterSpacing:1}}>📊 REPORT SETTIMANALE</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                {[{i:"⭐",v:weekStars,l:"stelle 7gg"},{i:"🎮",v:weekSess,l:"sessioni 7gg"}].map((s,i) => (
                  <div key={i} style={{background:"rgba(255,255,255,.06)",borderRadius:12,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:18}}>{s.i}</div>
                    <div style={{fontWeight:900,fontSize:18}}>{s.v}</div>
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
                      <div style={{width:"100%",background:stars>0?"#A78BFA":"rgba(255,255,255,.1)",borderRadius:"4px 4px 0 0",height:h,transition:"height .5s"}} />
                      <div style={{fontSize:9,opacity:.5}}>{dayLabels[dow]}</div>
                    </div>
                  );
                })}
              </div>
              <button onClick={downloadReport}
                style={{width:"100%",background:"linear-gradient(135deg,#764ba2,#667eea)",border:"none",color:"white",borderRadius:50,padding:"11px",fontSize:13,fontWeight:900,cursor:"pointer",marginTop:8}}>
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
        <button onClick={() => { setPinSaved(""); setParentUnlocked(false); }}
          style={{width:"100%",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",color:"rgba(255,255,255,.4)",borderRadius:14,padding:12,cursor:"pointer",fontSize:12,marginBottom:8}}>
          🔑 Cambia PIN
        </button>
        <button onClick={() => setParentUnlocked(false)}
          style={{width:"100%",background:"rgba(255,255,255,.04)",border:"none",color:"rgba(255,255,255,.3)",borderRadius:14,padding:10,cursor:"pointer",fontSize:11}}>
          🔒 Blocca area genitori
        </button>
      </div>
    );
  }

  return null;
}
