/**
 * WorldScene — illustrated SVG scenes for each world in MondoMago.
 * variant="card"   : small hero inside world cards on the map
 * variant="bg"     : full-screen translucent background behind challenges
 * variant="full"   : full-screen opaque scene (world_intro, world_end)
 */

// Inject keyframes once at module load
if (typeof document !== "undefined" && !document.getElementById("ws-styles")) {
  const s = document.createElement("style");
  s.id = "ws-styles";
  s.textContent = `
    @keyframes ws-float    { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-8px)} }
    @keyframes ws-float-sm { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-4px)} }
    @keyframes ws-sway     { 0%,100%{transform:rotate(-4deg)}   50%{transform:rotate(4deg)}  }
    @keyframes ws-sway-sm  { 0%,100%{transform:rotate(-2deg)}   50%{transform:rotate(2deg)}  }
    @keyframes ws-twinkle  { 0%,100%{opacity:.9} 50%{opacity:.2} }
    @keyframes ws-twinkle2 { 0%,100%{opacity:.6} 40%{opacity:1} 70%{opacity:.1} }
    @keyframes ws-rise     { 0%{transform:translateY(0);opacity:.8} 100%{transform:translateY(-60px);opacity:0} }
    @keyframes ws-drift    { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }
    @keyframes ws-drift-r  { 0%{transform:translateX(0)} 100%{transform:translateX(40px)} }
    @keyframes ws-pulse    { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:.9;transform:scale(1.08)} }
    @keyframes ws-spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes ws-spin-slow{ from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
    @keyframes ws-flicker  { 0%,100%{opacity:.9} 30%{opacity:.5} 60%{opacity:1} 80%{opacity:.7} }
    @keyframes ws-wave1    { 0%,100%{d:path("M0 180 Q50 165 100 180 Q150 195 200 180 Q250 165 300 180 Q350 195 400 180 L400 240 L0 240Z")} 50%{d:path("M0 180 Q50 195 100 180 Q150 165 200 180 Q250 195 300 180 Q350 165 400 180 L400 240 L0 240Z")} }
    @keyframes ws-ember    { 0%{transform:translate(0,0);opacity:1} 100%{transform:translate(var(--ex),var(--ey));opacity:0} }
    @keyframes ws-book-fly { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-10px) rotate(3deg)} }
    @keyframes ws-mote     { 0%{transform:translate(0,0);opacity:0} 20%{opacity:.6} 80%{opacity:.6} 100%{transform:translate(var(--mx),var(--my));opacity:0} }
    @keyframes ws-lava-glow{ 0%,100%{opacity:.7;transform:scaleX(1)} 50%{opacity:1;transform:scaleX(1.05)} }
    @keyframes ws-cloud    { 0%{transform:translateX(0)} 100%{transform:translateX(-80px)} }
    @keyframes ws-pennant  { 0%,100%{transform-origin:top left;transform:skewX(0deg)} 50%{transform:skewX(12deg)} }
    @keyframes ws-fish     { 0%,100%{transform:translateX(0)} 50%{transform:translateX(30px)} }
    @keyframes ws-bubble   { 0%{transform:translateY(0) translateX(0);opacity:.7} 100%{transform:translateY(-70px) translateX(6px);opacity:0} }
  `;
  document.head.appendChild(s);
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const A = (name, dur, delay = 0, iter = "infinite", ease = "ease-in-out") =>
  ({ animation: `${name} ${dur}s ${ease} ${delay}s ${iter}` });

// ─── FORESTA MAGICA ───────────────────────────────────────────────────────────
function SceneForesta({ full }) {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="ff-sky" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#1a3a1a" />
          <stop offset="100%" stopColor="#0a1f0a" />
        </radialGradient>
        <radialGradient id="ff-glow" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </radialGradient>
        <filter id="ff-blur"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      {/* Sky */}
      <rect width="400" height="240" fill="url(#ff-sky)" />

      {/* Background atmospheric glow */}
      <ellipse cx="200" cy="160" rx="180" ry="100" fill="url(#ff-glow)" filter="url(#ff-blur)" />

      {/* Far trees — lightest */}
      {[30, 80, 130, 200, 270, 340, 380].map((x, i) => (
        <g key={i}>
          <polygon points={`${x},${90 + i % 3 * 8} ${x - 18},${140 + i % 2 * 6} ${x + 18},${140 + i % 2 * 6}`}
            fill="#1a4020" opacity="0.6" />
          <polygon points={`${x},${75 + i % 3 * 8} ${x - 14},${105 + i % 2 * 6} ${x + 14},${105 + i % 2 * 6}`}
            fill="#1f5025" opacity="0.7" />
        </g>
      ))}

      {/* Mid trees */}
      {[20, 90, 175, 260, 340].map((x, i) => (
        <g key={i}>
          <rect x={x - 4} y={145} width={8} height={40} fill="#2d1a0a" />
          <polygon points={`${x},${60 + i % 2 * 15} ${x - 28},${145} ${x + 28},${145}`} fill="#166534" />
          <polygon points={`${x},${42 + i % 2 * 15} ${x - 22},${95 + i % 2 * 10} ${x + 22},${95 + i % 2 * 10}`} fill="#15803d" />
          <polygon points={`${x},${28 + i % 2 * 15} ${x - 16},${65 + i % 2 * 10} ${x + 16},${65 + i % 2 * 10}`} fill="#16a34a" />
        </g>
      ))}

      {/* Ground */}
      <ellipse cx="200" cy="230" rx="230" ry="30" fill="#14532d" />
      <ellipse cx="200" cy="232" rx="220" ry="22" fill="#166534" />
      {/* Grass tufts */}
      {[40, 100, 155, 220, 290, 350].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 225 Q${x - 4} 215 ${x - 2} 210`} stroke="#4ade80" strokeWidth="1.5" fill="none" />
          <path d={`M${x} 225 Q${x + 2} 213 ${x + 4} 210`} stroke="#22c55e" strokeWidth="1.5" fill="none" />
        </g>
      ))}

      {/* Light shafts */}
      {[100, 200, 300].map((x, i) => (
        <polygon key={i} points={`${x - 8},0 ${x + 8},0 ${x + 30},240 ${x - 30},240`}
          fill="#a3e635" opacity="0.03" />
      ))}

      {/* Fireflies */}
      {[
        { x: 60,  y: 100, d: 1.8, del: 0   },
        { x: 140, y: 130, d: 2.3, del: 0.7 },
        { x: 190, y: 95,  d: 1.6, del: 1.2 },
        { x: 250, y: 115, d: 2.1, del: 0.3 },
        { x: 310, y: 105, d: 1.9, del: 1.5 },
        { x: 360, y: 125, d: 2.4, del: 0.9 },
        { x: 80,  y: 80,  d: 1.4, del: 2.0 },
      ].map((f, i) => (
        <g key={i} style={A("ws-float", f.d, f.del)}>
          <circle cx={f.x} cy={f.y} r={2.5} fill="#bbf7d0" style={A("ws-twinkle", f.d * 0.8, f.del)} />
          <circle cx={f.x} cy={f.y} r={6} fill="#4ade80" opacity="0.25" filter="url(#ff-blur)"
            style={A("ws-twinkle", f.d * 0.8, f.del)} />
        </g>
      ))}

      {full && (
        <>
          {/* Extra foreground detail for full variant */}
          <path d="M0 200 Q60 185 120 200 Q180 215 240 200 Q300 185 360 200 Q390 208 400 205 L400 240 L0 240Z"
            fill="#14532d" />
          <path d="M0 215 Q80 205 160 215 Q240 225 320 215 Q370 220 400 218 L400 240 L0 240Z"
            fill="#166534" />
        </>
      )}
    </svg>
  );
}

// ─── CASTELLO DELLE NUVOLE ────────────────────────────────────────────────────
function SceneCastello({ full }) {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fc-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0020" />
          <stop offset="60%" stopColor="#2d1b6e" />
          <stop offset="100%" stopColor="#1a0a40" />
        </linearGradient>
        <radialGradient id="fc-moon" cx="75%" cy="20%">
          <stop offset="0%" stopColor="#e0d4ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
        <filter id="fc-glow"><feGaussianBlur stdDeviation="4" /></filter>
        <filter id="fc-glow-sm"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* Sky */}
      <rect width="400" height="240" fill="url(#fc-sky)" />
      {/* Moon glow */}
      <ellipse cx="300" cy="45" rx="80" ry="60" fill="url(#fc-moon)" />
      <circle cx="300" cy="45" r="22" fill="#f5f0ff" />
      <circle cx="300" cy="45" r="28" fill="#ddd6fe" opacity="0.3" filter="url(#fc-glow)" />

      {/* Stars */}
      {[
        [20,18],[55,30],[90,12],[140,22],[170,8],[220,25],[260,15],[310,28],[360,10],[380,22],
        [40,45],[110,50],[180,40],[240,52],[320,38],[70,60],[150,55],[280,48],[350,58],[400,35],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.5 : 1}
          fill="white" opacity={0.6 + (i % 3) * 0.15}
          style={A(i % 2 === 0 ? "ws-twinkle" : "ws-twinkle2", 2 + (i % 3), i * 0.3)} />
      ))}

      {/* Clouds — animated drift */}
      {[
        { x: 20,  y: 70, w: 80, del: 0,   dur: 18 },
        { x: 160, y: 55, w: 100,del: 6,   dur: 22 },
        { x: 310, y: 75, w: 70, del: 12,  dur: 16 },
      ].map((c, i) => (
        <g key={i} style={{ animation: `ws-cloud ${c.dur}s linear ${c.del}s infinite alternate` }}>
          <ellipse cx={c.x + c.w * 0.5} cy={c.y} rx={c.w * 0.4} ry={12} fill="white" opacity="0.12" />
          <ellipse cx={c.x + c.w * 0.3} cy={c.y - 6} rx={c.w * 0.25} ry={10} fill="white" opacity="0.10" />
          <ellipse cx={c.x + c.w * 0.7} cy={c.y - 4} rx={c.w * 0.2} ry={8} fill="white" opacity="0.10" />
        </g>
      ))}

      {/* Castle base + walls */}
      <rect x="130" y="145" width="140" height="80" fill="#1e0a50" />
      <rect x="110" y="130" width="35" height="95" fill="#2d1276" />
      <rect x="255" y="130" width="35" height="95" fill="#2d1276" />
      {/* Battlements main */}
      {[130, 150, 170, 190, 210, 230, 250].map((x, i) => (
        <rect key={i} x={x} y={135} width={12} height={14} fill="#1e0a50" />
      ))}
      {/* Battlements side towers */}
      {[110, 122].map((x, i) => <rect key={i} x={x} y={120} width={10} height={13} fill="#2d1276" />)}
      {[255, 267].map((x, i) => <rect key={i} x={x} y={120} width={10} height={13} fill="#2d1276" />)}

      {/* Main tower */}
      <rect x="168" y="80" width="64" height="70" fill="#3b0f96" />
      {[168, 183, 198, 213, 220].map((x, i) => (
        <rect key={i} x={x} y={70} width={11} height={15} fill="#3b0f96" />
      ))}

      {/* Gate arch */}
      <path d="M175 225 L175 180 Q200 160 225 180 L225 225Z" fill="#0a0018" />

      {/* Pennants — sway animation */}
      {[
        { x: 110, y: 120, color: "#c4b5fd", dir: 1 },
        { x: 168, y: 70,  color: "#818cf8", dir: -1 },
        { x: 288, y: 120, color: "#a78bfa", dir: 1 },
      ].map((p, i) => (
        <g key={i} style={{ transformOrigin: `${p.x}px ${p.y}px`, ...A("ws-pennant", 1.8, i * 0.4) }}>
          <line x1={p.x} y1={p.y} x2={p.x} y2={p.y - 22} stroke="#fbbf24" strokeWidth="1.5" />
          <polygon points={`${p.x},${p.y - 22} ${p.x + 18 * p.dir},${p.y - 16} ${p.x},${p.y - 10}`}
            fill={p.color} />
        </g>
      ))}

      {/* Window glows */}
      {[[188, 105], [207, 105], [150, 160], [238, 160]].map(([x, y], i) => (
        <g key={i}>
          <ellipse cx={x} cy={y} rx={7} ry={9} fill="#fbbf24" opacity="0.7" filter="url(#fc-glow-sm)"
            style={A("ws-flicker", 2.5, i * 0.6)} />
          <ellipse cx={x} cy={y} rx={4} ry={5} fill="#fef08a" style={A("ws-flicker", 2.5, i * 0.6)} />
        </g>
      ))}

      {/* Ground */}
      <ellipse cx="200" cy="235" rx="220" ry="18" fill="#1a0a3e" />
    </svg>
  );
}

// ─── OCEANO LUMINOSO ──────────────────────────────────────────────────────────
function SceneOceano({ full }) {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fo-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1b2e" />
          <stop offset="45%" stopColor="#0a3d5c" />
          <stop offset="100%" stopColor="#0e4f7a" />
        </linearGradient>
        <radialGradient id="fo-glow" cx="50%" cy="70%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
        </radialGradient>
        <filter id="fo-blur"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="fo-blur-sm"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      <rect width="400" height="240" fill="url(#fo-sky)" />
      {/* Bioluminescent glow center */}
      <ellipse cx="200" cy="180" rx="200" ry="100" fill="url(#fo-glow)" filter="url(#fo-blur)" />

      {/* Deep water caustics */}
      {[50, 120, 200, 280, 350].map((x, i) => (
        <ellipse key={i} cx={x} cy={150 + i * 8} rx={20 + i * 4} ry={4}
          fill="#38bdf8" opacity="0.06" style={A("ws-pulse", 3 + i * 0.5, i * 0.4)} />
      ))}

      {/* Coral / seabed */}
      <ellipse cx="200" cy="238" rx="220" ry="20" fill="#0c3250" />
      {/* Coral branches */}
      {[30, 80, 160, 240, 320, 370].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 235 L${x - 4} 218 M${x} 235 L${x + 6} 215 M${x - 4} 218 L${x - 10} 208 M${x + 6} 215 L${x + 12} 205`}
            stroke={i % 2 === 0 ? "#f97316" : "#e879f9"} strokeWidth="2" fill="none"
            style={A("ws-sway-sm", 2.5 + i * 0.3, i * 0.5)} />
          <circle cx={x - 10} cy={208} r={3} fill={i % 2 === 0 ? "#fb923c" : "#f0abfc"} />
          <circle cx={x + 12} cy={205} r={3} fill={i % 2 === 0 ? "#fdba74" : "#e879f9"} />
        </g>
      ))}

      {/* Seagrass */}
      {[55, 110, 185, 265, 335].map((x, i) => (
        <g key={i}>
          <path d={`M${x} 238 Q${x - 5} 225 ${x - 2} 215`} stroke="#34d399" strokeWidth="2" fill="none"
            style={A("ws-sway", 3 + i * 0.4, i * 0.3)} />
          <path d={`M${x + 5} 238 Q${x + 10} 224 ${x + 8} 213`} stroke="#6ee7b7" strokeWidth="1.5" fill="none"
            style={A("ws-sway", 2.8 + i * 0.4, i * 0.5 + 0.3)} />
        </g>
      ))}

      {/* Fish */}
      {[
        { x: 80,  y: 140, size: 12, color: "#f97316", del: 0,   dur: 6 },
        { x: 240, y: 110, size: 9,  color: "#e879f9", del: 1.5, dur: 8 },
        { x: 340, y: 155, size: 14, color: "#22d3ee", del: 3,   dur: 7 },
      ].map((f, i) => (
        <g key={i} style={A("ws-fish", f.dur, f.del)}>
          <ellipse cx={f.x} cy={f.y} rx={f.size} ry={f.size * 0.55} fill={f.color} />
          <polygon points={`${f.x + f.size},${f.y} ${f.x + f.size * 1.8},${f.y - f.size * 0.5} ${f.x + f.size * 1.8},${f.y + f.size * 0.5}`}
            fill={f.color} />
          <circle cx={f.x - f.size * 0.4} cy={f.y - f.size * 0.1} r={2} fill="#0c1b2e" />
        </g>
      ))}

      {/* Bubbles */}
      {[
        { x: 60,  y: 200, d: 3,   del: 0 },
        { x: 120, y: 210, d: 4,   del: 1 },
        { x: 180, y: 205, d: 2.5, del: 2 },
        { x: 250, y: 200, d: 3.5, del: 0.5 },
        { x: 310, y: 208, d: 3,   del: 1.5 },
        { x: 370, y: 202, d: 2,   del: 2.5 },
      ].map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.d} fill="none" stroke="#7dd3fc" strokeWidth="1"
          opacity="0.6" style={A("ws-bubble", 4 + i * 0.5, b.del)} />
      ))}

      {/* Surface shine */}
      <path d="M0 90 Q100 82 200 90 Q300 98 400 90 L400 100 Q300 108 200 100 Q100 92 0 100Z"
        fill="#38bdf8" opacity="0.12" />
      <path d="M0 95 Q80 88 160 95 Q240 102 320 95 Q370 91 400 95"
        stroke="#bae6fd" strokeWidth="1" fill="none" opacity="0.2" />

      {/* Bioluminescent dots */}
      {[70, 130, 200, 270, 330].map((x, i) => (
        <circle key={i} cx={x} cy={170 + i * 5} r={3}
          fill="#38bdf8" opacity="0.6" filter="url(#fo-blur-sm)"
          style={A("ws-twinkle", 2 + i * 0.4, i * 0.6)} />
      ))}
    </svg>
  );
}

// ─── MERCATO DEI COLORI ───────────────────────────────────────────────────────
function SceneMercato({ full }) {
  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fm-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#431407" />
          <stop offset="50%" stopColor="#7c2d12" />
          <stop offset="100%" stopColor="#9a3412" />
        </linearGradient>
        <radialGradient id="fm-sun" cx="85%" cy="18%">
          <stop offset="0%" stopColor="#fef08a" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
        </radialGradient>
        <filter id="fm-glow"><feGaussianBlur stdDeviation="4" /></filter>
      </defs>

      <rect width="400" height="240" fill="url(#fm-sky)" />
      {/* Sun */}
      <circle cx="340" cy="42" r="28" fill="url(#fm-sun)" />
      <circle cx="340" cy="42" r="16" fill="#fef08a" style={A("ws-pulse", 4, 0)} />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
        const rad = deg * Math.PI / 180;
        return <line key={i}
          x1={340 + Math.cos(rad) * 20} y1={42 + Math.sin(rad) * 20}
          x2={340 + Math.cos(rad) * 34} y2={42 + Math.sin(rad) * 34}
          stroke="#fef08a" strokeWidth="2" opacity="0.5"
          style={A("ws-pulse", 3, i * 0.2)} />;
      })}

      {/* Ground */}
      <rect x="0" y="195" width="400" height="45" fill="#451a03" />
      <rect x="0" y="195" width="400" height="6" fill="#78350f" />
      {/* Cobblestones */}
      {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380].map((x, i) => (
        <ellipse key={i} cx={x} cy={210 + (i % 2) * 8} rx={15} ry={5}
          fill="#92400e" opacity="0.4" />
      ))}

      {/* Stalls */}
      {[
        { x: 10,  w: 90, h: 70, roof: "#ef4444", pole: "#92400e" },
        { x: 120, w: 80, h: 65, roof: "#3b82f6", pole: "#1e40af" },
        { x: 220, w: 90, h: 70, roof: "#22c55e", pole: "#166534" },
        { x: 330, w: 75, h: 65, roof: "#a855f7", pole: "#6b21a8" },
      ].map((s, i) => (
        <g key={i}>
          {/* Stall body */}
          <rect x={s.x} y={130} width={s.w} height={65} fill="#451a03" opacity="0.9" />
          {/* Awning */}
          <path d={`M${s.x - 5} 130 L${s.x + s.w + 5} 130 L${s.x + s.w + 10} ${130 + s.h * 0.45} L${s.x - 10} ${130 + s.h * 0.45}Z`}
            fill={s.roof} />
          {/* Awning stripes */}
          {[0, 1, 2].map(j => (
            <line key={j}
              x1={s.x + (s.w / 4) * (j + 0.5)} y1={130}
              x2={s.x + (s.w / 4) * (j + 0.5) + 3} y2={130 + s.h * 0.45}
              stroke="white" strokeWidth="4" opacity="0.25" />
          ))}
          {/* Scalloped bottom edge */}
          {[0, 1, 2, 3, 4].map(j => (
            <circle key={j} cx={s.x + (s.w / 4) * j} cy={130 + s.h * 0.45} r={6}
              fill={s.roof} />
          ))}
          {/* Display items */}
          <rect x={s.x + 8} y={165} width={s.w - 16} height={20} fill="#92400e" />
          {/* Colorful goods */}
          {[0, 1, 2, 3].map(j => (
            <circle key={j} cx={s.x + 16 + j * (s.w - 20) / 3} cy={172} r={5}
              fill={["#fbbf24", "#f87171", "#34d399", "#818cf8"][j]} />
          ))}
        </g>
      ))}

      {/* Festoons between stalls — animated sway */}
      {[
        { x1: 55, y1: 115, x2: 125, y2: 115, color: "#fbbf24" },
        { x1: 160, y1: 112, x2: 220, y2: 112, color: "#f472b6" },
        { x1: 268, y1: 115, x2: 335, y2: 115, color: "#34d399" },
      ].map((f, i) => (
        <g key={i} style={A("ws-sway-sm", 3 + i * 0.4, i * 0.5)}>
          <path d={`M${f.x1} ${f.y1} Q${(f.x1 + f.x2) / 2} ${f.y1 + 12} ${f.x2} ${f.y2}`}
            stroke={f.color} strokeWidth="1.5" fill="none" opacity="0.8" />
          {[0, 1, 2, 3, 4].map(j => {
            const t = j / 4;
            const qx = (1 - t) * (1 - t) * f.x1 + 2 * (1 - t) * t * ((f.x1 + f.x2) / 2) + t * t * f.x2;
            const qy = (1 - t) * (1 - t) * f.y1 + 2 * (1 - t) * t * (f.y1 + 12) + t * t * f.y2;
            return <circle key={j} cx={qx} cy={qy} r={3}
              fill={["#fbbf24", "#f87171", "#60a5fa", "#34d399", "#e879f9"][j]} />;
          })}
        </g>
      ))}

      {/* Floating market particles */}
      {[80, 160, 240, 310].map((x, i) => (
        <circle key={i} cx={x} cy={160 - i * 8} r={2}
          fill="#fbbf24" opacity="0.6"
          style={A("ws-float", 3 + i * 0.5, i * 0.7)} />
      ))}
    </svg>
  );
}

// ─── GALASSIA STELLARE ────────────────────────────────────────────────────────
function SceneGalassia({ full }) {
  const stars = Array.from({ length: 55 }, (_, i) => ({
    x: (i * 137.508) % 400,
    y: (i * 89.733) % 180,
    r: i % 5 === 0 ? 2 : i % 3 === 0 ? 1.5 : 1,
    del: (i * 0.17) % 3,
    dur: 1.8 + (i % 4) * 0.5,
  }));

  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id="fg-bg" cx="40%" cy="50%">
          <stop offset="0%" stopColor="#1e1b4b" />
          <stop offset="60%" stopColor="#0f0a2e" />
          <stop offset="100%" stopColor="#060412" />
        </radialGradient>
        <radialGradient id="fg-neb1" cx="30%" cy="40%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fg-neb2" cx="70%" cy="30%">
          <stop offset="0%" stopColor="#db2777" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#9d174d" stopOpacity="0" />
        </radialGradient>
        <filter id="fg-blur"><feGaussianBlur stdDeviation="8" /></filter>
        <filter id="fg-glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <rect width="400" height="240" fill="url(#fg-bg)" />

      {/* Nebula blobs */}
      <ellipse cx="120" cy="100" rx="110" ry="70" fill="url(#fg-neb1)" filter="url(#fg-blur)" />
      <ellipse cx="290" cy="80" rx="90" ry="60" fill="url(#fg-neb2)" filter="url(#fg-blur)" />

      {/* Stars */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white"
          opacity={0.5 + (i % 4) * 0.1}
          style={A(i % 2 === 0 ? "ws-twinkle" : "ws-twinkle2", s.dur, s.del)} />
      ))}

      {/* Milky way band */}
      <ellipse cx="200" cy="90" rx="180" ry="20" fill="white" opacity="0.04" filter="url(#fg-blur)" />

      {/* Planets */}
      {/* Large planet with rings */}
      <g style={{ transformOrigin: "320px 145px", ...A("ws-float-sm", 8, 0) }}>
        <ellipse cx="320" cy="150" rx="45" ry="12" fill="#4f46e5" opacity="0.5" />
        <circle cx="320" cy="145" r="28" fill="#6366f1" />
        <circle cx="320" cy="145" r="28" fill="none" stroke="#818cf8" strokeWidth="1" opacity="0.5" />
        {/* Planet surface bands */}
        <path d="M293 140 Q320 136 347 140" stroke="#818cf8" strokeWidth="3" fill="none" opacity="0.4" />
        <path d="M294 148 Q320 144 346 148" stroke="#a5b4fc" strokeWidth="2" fill="none" opacity="0.3" />
        <ellipse cx="320" cy="145" rx="45" ry="10" fill="none" stroke="#c4b5fd" strokeWidth="1.5" opacity="0.35" />
      </g>

      {/* Small planet */}
      <g style={{ transformOrigin: "85px 160px", ...A("ws-float-sm", 6, 2) }}>
        <circle cx="85" cy="160" r="16" fill="#0e7490" />
        <path d="M70 155 Q85 151 100 155" stroke="#22d3ee" strokeWidth="2" fill="none" opacity="0.5" />
        <circle cx="85" cy="160" r="16" fill="none" stroke="#67e8f9" strokeWidth="1" opacity="0.3" />
      </g>

      {/* Tiny moon */}
      <circle cx="170" cy="185" r="8" fill="#d1d5db" style={A("ws-float-sm", 5, 1)} />
      <circle cx="173" cy="183" r={2.5} fill="#9ca3af" opacity="0.5" />

      {/* Shooting star (periodic) */}
      <g style={A("ws-drift", 5, 0, "infinite")}>
        <line x1="50" y1="30" x2="20" y2="30" stroke="white" strokeWidth="1.5" opacity="0.7" />
        <circle cx="50" cy="30" r={2} fill="white" />
      </g>

      {/* Asteroid belt dots */}
      {[200, 215, 228, 242, 255, 268].map((x, i) => (
        <circle key={i} cx={x} cy={200 + (i % 3) * 5} r={i % 3 === 0 ? 2.5 : 1.5}
          fill="#6b7280" opacity="0.5" style={A("ws-float-sm", 4 + i * 0.3, i * 0.4)} />
      ))}
    </svg>
  );
}

// ─── VULCANO MAGICO ───────────────────────────────────────────────────────────
function SceneVulcano({ full }) {
  const embers = Array.from({ length: 14 }, (_, i) => ({
    x: 170 + (i % 5 - 2) * 12,
    y: 88,
    ex: ((i % 3) - 1) * 30 + "px",
    ey: -(40 + i * 8) + "px",
    del: i * 0.3,
    dur: 2.5 + (i % 3) * 0.5,
  }));

  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fv-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f0302" />
          <stop offset="50%" stopColor="#2d0a02" />
          <stop offset="100%" stopColor="#450a02" />
        </linearGradient>
        <radialGradient id="fv-lava-glow" cx="50%" cy="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="1" />
          <stop offset="40%" stopColor="#ef4444" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#7f1d1d" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fv-crater" cx="50%" cy="80%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#f97316" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.6" />
        </radialGradient>
        <filter id="fv-blur"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id="fv-blur-sm"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      <rect width="400" height="240" fill="url(#fv-sky)" />

      {/* Distant mountains */}
      <polygon points="0,200 60,130 120,200" fill="#1c0703" />
      <polygon points="280,200 350,120 400,200" fill="#1c0703" />
      <polygon points="310,200 370,140 430,200" fill="#1c0703" />

      {/* Lava ground glow */}
      <ellipse cx="200" cy="240" rx="250" ry="60" fill="url(#fv-lava-glow)" filter="url(#fv-blur)"
        style={A("ws-pulse", 3, 0)} />

      {/* Main volcano */}
      <polygon points="200,82 50,230 350,230" fill="#450a02" />
      <polygon points="200,82 80,230 320,230" fill="#7f1d1d" />
      <polygon points="200,82 110,230 290,230" fill="#991b1b" />

      {/* Lava flow */}
      <path d="M190 120 Q200 140 195 165 Q192 180 198 200 Q202 215 200 230"
        stroke="#f97316" strokeWidth="5" fill="none" opacity="0.7"
        style={A("ws-pulse", 2.5, 0.5)} />
      <path d="M210 130 Q220 155 215 175 Q212 190 218 210 Q222 222 220 230"
        stroke="#ef4444" strokeWidth="3" fill="none" opacity="0.5"
        style={A("ws-pulse", 2, 1)} />

      {/* Crater */}
      <ellipse cx="200" cy="90" rx="32" ry="14" fill="url(#fv-crater)"
        style={A("ws-lava-glow", 2, 0)} />
      <ellipse cx="200" cy="90" rx="32" ry="14" fill="#fbbf24" opacity="0.4"
        filter="url(#fv-blur-sm)" style={A("ws-lava-glow", 2, 0)} />

      {/* Smoke puffs */}
      {[
        { x: 192, y: 75, r: 12, del: 0,   dur: 4 },
        { x: 205, y: 65, r: 10, del: 0.8, dur: 4.5 },
        { x: 188, y: 55, r: 9,  del: 1.6, dur: 5 },
      ].map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#4b1c07" opacity="0.6"
          filter="url(#fv-blur-sm)" style={A("ws-rise", s.dur, s.del)} />
      ))}

      {/* Embers */}
      {embers.map((e, i) => (
        <circle key={i} cx={e.x} cy={e.y} r={2 + (i % 2)}
          fill={i % 2 === 0 ? "#fbbf24" : "#f97316"}
          style={{
            "--ex": e.ex, "--ey": e.ey,
            ...A("ws-ember", e.dur, e.del)
          }} />
      ))}

      {/* Lava pools on ground */}
      {[60, 150, 260, 350].map((x, i) => (
        <ellipse key={i} cx={x} cy={230} rx={20 + i * 3} ry={5} fill="#f97316" opacity="0.6"
          style={A("ws-pulse", 2 + i * 0.3, i * 0.5)} />
      ))}

      {/* Ground rocks */}
      {[30, 100, 180, 270, 340, 390].map((x, i) => (
        <ellipse key={i} cx={x} cy={232} rx={10 + i % 3 * 5} ry={6} fill="#450a02" />
      ))}
    </svg>
  );
}

// ─── BIBLIOTECA INCANTATA ─────────────────────────────────────────────────────
function SceneBiblioteca({ full }) {
  const bookColors = [
    "#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6",
    "#8b5cf6", "#ec4899", "#14b8a6", "#f43f5e", "#6366f1",
    "#84cc16", "#06b6d4", "#a855f7", "#fb7185", "#fbbf24",
  ];

  return (
    <svg viewBox="0 0 400 240" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id="fb-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c0f03" />
          <stop offset="60%" stopColor="#2d1a07" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id="fb-warm" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
        </radialGradient>
        <filter id="fb-blur"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="fb-glow"><feGaussianBlur stdDeviation="3" /></filter>
      </defs>

      <rect width="400" height="240" fill="url(#fb-bg)" />
      <ellipse cx="200" cy="120" rx="200" ry="130" fill="url(#fb-warm)" filter="url(#fb-blur)" />

      {/* Bookshelf planks */}
      {[55, 130, 200].map((y, si) => (
        <g key={si}>
          {/* Shelf plank */}
          <rect x={0} y={y + 45} width={400} height={8} fill="#78350f" />
          <rect x={0} y={y + 48} width={400} height={3} fill="#451a03" opacity="0.5" />
          {/* Books on shelf */}
          {Array.from({ length: 14 }, (_, bi) => {
            const bw = 22 + (bi % 3) * 6;
            const bh = 28 + (bi % 4) * 8;
            const bx = bi * 28 + 5;
            const by = y + 45 - bh;
            const color = bookColors[(si * 5 + bi) % bookColors.length];
            return (
              <g key={bi}>
                <rect x={bx} y={by} width={bw} height={bh} fill={color} rx={1} />
                <rect x={bx + 2} y={by + 3} width={bw - 4} height={2} fill="white" opacity="0.2" />
                <rect x={bx} y={by} width={3} height={bh} fill="black" opacity="0.15" />
                <rect x={bx + bw - 3} y={by} width={3} height={bh} fill="white" opacity="0.08" />
              </g>
            );
          })}
        </g>
      ))}

      {/* Floating books */}
      {[
        { x: 80,  y: 25,  w: 36, h: 26, color: "#818cf8", del: 0,   dur: 4 },
        { x: 210, y: 18,  w: 40, h: 28, color: "#f472b6", del: 1.5, dur: 5 },
        { x: 330, y: 30,  w: 32, h: 24, color: "#34d399", del: 0.8, dur: 4.5 },
      ].map((b, i) => (
        <g key={i} style={A("ws-book-fly", b.dur, b.del)}>
          <rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.color} rx={2} />
          <rect x={b.x + 4} y={b.y + 4} width={b.w - 8} height={2} fill="white" opacity="0.3" />
          <rect x={b.x + 4} y={b.y + 10} width={b.w - 12} height={2} fill="white" opacity="0.2" />
          <rect x={b.x + 4} y={b.y + 16} width={b.w - 16} height={2} fill="white" opacity="0.15" />
          {/* Book spine */}
          <rect x={b.x} y={b.y} width={4} height={b.h} fill="black" opacity="0.15" />
        </g>
      ))}

      {/* Candles/lanterns */}
      {[35, 200, 365].map((x, i) => (
        <g key={i}>
          {/* Lantern body */}
          <rect x={x - 8} y={212} width={16} height={20} fill="#78350f" rx={2} />
          <rect x={x - 6} y={214} width={12} height={16} fill="#fef08a" opacity="0.4"
            style={A("ws-flicker", 2 + i * 0.3, i * 0.5)} />
          {/* Flame */}
          <ellipse cx={x} cy={210} rx={4} ry={6} fill="#fbbf24"
            filter="url(#fb-glow)" style={A("ws-flicker", 1.5, i * 0.4)} />
          <ellipse cx={x} cy={212} rx={2} ry={3} fill="#fef9c3"
            style={A("ws-flicker", 1.5, i * 0.4)} />
          {/* Light halo */}
          <circle cx={x} cy={210} r={25} fill="#fbbf24" opacity="0.06"
            filter="url(#fb-blur)" style={A("ws-pulse", 2, i * 0.6)} />
        </g>
      ))}

      {/* Dust motes */}
      {Array.from({ length: 12 }, (_, i) => ({
        x: (i * 37 + 20) % 380,
        y: 20 + (i * 19) % 200,
        mx: ((i % 3) - 1) * 15 + "px",
        my: -(10 + i * 5) + "px",
        del: i * 0.4,
      })).map((m, i) => (
        <circle key={i} cx={m.x} cy={m.y} r={1.5} fill="#fbbf24" opacity="0.4"
          style={{ "--mx": m.mx, "--my": m.my, ...A("ws-mote", 6 + i * 0.3, m.del) }} />
      ))}

      {/* Floor */}
      <rect x="0" y="228" width="400" height="12" fill="#3c1a06" />
      {[0, 40, 80, 120, 160, 200, 240, 280, 320, 360].map((x, i) => (
        <rect key={i} x={x} y={228} width={38} height={12} fill="#451a03" opacity={i % 2 === 0 ? 0.4 : 0.2} />
      ))}
    </svg>
  );
}

// ─── SCENE MAP ────────────────────────────────────────────────────────────────
const SCENE_MAP = {
  foresta:    SceneForesta,
  castello:   SceneCastello,
  oceano:     SceneOceano,
  mercato:    SceneMercato,
  galassia:   SceneGalassia,
  vulcano:    SceneVulcano,
  biblioteca: SceneBiblioteca,
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
/**
 * variant="card"   → sized 100%×100% inside parent, use as card hero
 * variant="bg"     → absolute overlay, z-index 0, low opacity (challenge bg)
 * variant="full"   → 100%×100%, full opacity (world_intro / world_end)
 */
export default function WorldScene({ worldId, variant = "bg", animated = true }) {
  const Scene = SCENE_MAP[worldId];
  if (!Scene) return null;

  const full = variant === "full";

  if (variant === "bg") {
    return (
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        opacity: 0.22, pointerEvents: "none",
        overflow: "hidden",
      }}>
        <Scene full={false} />
      </div>
    );
  }

  // card or full
  return (
    <div style={{
      width: "100%", height: "100%",
      overflow: "hidden",
      borderRadius: variant === "card" ? "inherit" : 0,
    }}>
      <Scene full={full} />
    </div>
  );
}
