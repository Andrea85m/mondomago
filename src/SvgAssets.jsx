/**
 * SvgAssets — custom SVG illustrations for visual_tap challenge tiles.
 * Each component returns a self-contained 100×100 circle illustration.
 * SvgAsset wraps them with drop-shadow and fallback to styled emoji.
 */

// ─── helpers ──────────────────────────────────────────────────────────────────
const Eye = ({ x, y, r = 6, iris = "#3b82f6" }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="white" />
    <circle cx={x} cy={y} r={r * 0.62} fill={iris} />
    <circle cx={x} cy={y} r={r * 0.32} fill="#111" />
    <circle cx={x - r * 0.22} cy={y - r * 0.25} r={r * 0.18} fill="white" />
  </g>
);

const Smile = ({ cx, cy, r, stroke = "#333", sw = 2 }) => (
  <path d={`M${cx - r} ${cy} Q${cx} ${cy + r * 1.2} ${cx + r} ${cy}`}
    stroke={stroke} strokeWidth={sw} fill="none" strokeLinecap="round" />
);

const BgCircle = ({ from, to }) => (
  <>
    <defs>
      <radialGradient id="bg" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor={from} />
        <stop offset="100%" stopColor={to} />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="48" fill="url(#bg)" />
    <circle cx="32" cy="30" r="10" fill="white" opacity="0.18" />
  </>
);

// ─── ANIMALI TERRESTRI ────────────────────────────────────────────────────────
const Bear = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#a1855a" to="#6b4c28" />
    {/* Ears */}
    <circle cx="28" cy="30" r="13" fill="#8B6340" />
    <circle cx="72" cy="30" r="13" fill="#8B6340" />
    <circle cx="28" cy="30" r="8" fill="#c4916a" />
    <circle cx="72" cy="30" r="8" fill="#c4916a" />
    {/* Head */}
    <circle cx="50" cy="54" r="30" fill="#A0744A" />
    {/* Muzzle */}
    <ellipse cx="50" cy="65" rx="14" ry="10" fill="#C8976C" />
    <ellipse cx="50" cy="61" rx="6" ry="4" fill="#5a2e10" />
    <Smile cx={50} cy={68} r={5} stroke="#5a2e10" />
    <Eye x={38} y={48} r={7} iris="#4a2e1a" />
    <Eye x={62} y={48} r={7} iris="#4a2e1a" />
  </svg>
);

const Frog = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#6ee7b7" to="#059669" />
    {/* Head */}
    <circle cx="50" cy="56" r="28" fill="#22c55e" />
    {/* Eye bumps */}
    <circle cx="32" cy="34" r="13" fill="#22c55e" />
    <circle cx="68" cy="34" r="13" fill="#22c55e" />
    <Eye x={32} y={34} r={8} iris="#14532d" />
    <Eye x={68} y={34} r={8} iris="#14532d" />
    {/* Smile */}
    <path d="M35 62 Q50 74 65 62" stroke="#14532d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Belly */}
    <ellipse cx="50" cy="68" rx="16" ry="10" fill="#a7f3d0" opacity="0.6" />
    {/* Nostrils */}
    <circle cx="45" cy="55" r="2" fill="#14532d" />
    <circle cx="55" cy="55" r="2" fill="#14532d" />
  </svg>
);

const Dog = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#d97706" />
    {/* Floppy ears */}
    <ellipse cx="26" cy="45" rx="12" ry="20" fill="#b45309" transform="rotate(-15 26 45)" />
    <ellipse cx="74" cy="45" rx="12" ry="20" fill="#b45309" transform="rotate(15 74 45)" />
    {/* Head */}
    <circle cx="50" cy="50" r="28" fill="#fbbf24" />
    {/* Muzzle */}
    <ellipse cx="50" cy="63" rx="15" ry="11" fill="#fde68a" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="7" ry="5" fill="#1c1917" />
    <circle cx="48" cy="57" r="2" fill="white" opacity="0.6" />
    <Smile cx={50} cy={67} r={5} stroke="#92400e" />
    <Eye x={37} y={46} r={7} iris="#78350f" />
    <Eye x={63} y={46} r={7} iris="#78350f" />
  </svg>
);

const Cat = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#f97316" />
    {/* Pointy ears */}
    <polygon points="25,42 18,18 38,30" fill="#fb923c" />
    <polygon points="75,42 82,18 62,30" fill="#fb923c" />
    <polygon points="27,40 22,22 36,31" fill="#fca5a5" />
    <polygon points="73,40 78,22 64,31" fill="#fca5a5" />
    {/* Head */}
    <circle cx="50" cy="54" r="28" fill="#f97316" />
    {/* Muzzle */}
    <ellipse cx="50" cy="65" rx="14" ry="9" fill="#fed7aa" />
    {/* Nose */}
    <polygon points="50,60 46,65 54,65" fill="#ec4899" />
    {/* Whiskers */}
    <line x1="36" y1="63" x2="20" y2="60" stroke="#9a3412" strokeWidth="1.5" />
    <line x1="36" y1="67" x2="20" y2="68" stroke="#9a3412" strokeWidth="1.5" />
    <line x1="64" y1="63" x2="80" y2="60" stroke="#9a3412" strokeWidth="1.5" />
    <line x1="64" y1="67" x2="80" y2="68" stroke="#9a3412" strokeWidth="1.5" />
    <Smile cx={50} cy={69} r={4} stroke="#9a3412" />
    <Eye x={37} y={48} r={7} iris="#7c2d12" />
    <Eye x={63} y={48} r={7} iris="#7c2d12" />
  </svg>
);

const Lion = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#b45309" />
    {/* Mane */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <ellipse key={i} cx={50 + Math.cos(rad) * 26} cy={50 + Math.sin(rad) * 26}
        rx={8} ry={11} fill={i % 2 === 0 ? "#b45309" : "#d97706"}
        transform={`rotate(${deg}, ${50 + Math.cos(rad) * 26}, ${50 + Math.sin(rad) * 26})`} />;
    })}
    {/* Face */}
    <circle cx="50" cy="50" r="20" fill="#fbbf24" />
    {/* Muzzle */}
    <ellipse cx="50" cy="58" rx="10" ry="7" fill="#fde68a" />
    <ellipse cx="50" cy="54" rx="4" ry="3" fill="#b45309" />
    <Smile cx={50} cy={61} r={4} stroke="#92400e" />
    <Eye x={40} y={45} r={6} iris="#78350f" />
    <Eye x={60} y={45} r={6} iris="#78350f" />
  </svg>
);

const Rabbit = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#f0abfc" to="#a21caf" />
    {/* Long ears */}
    <ellipse cx="34" cy="22" rx="9" ry="22" fill="white" />
    <ellipse cx="66" cy="22" rx="9" ry="22" fill="white" />
    <ellipse cx="34" cy="22" rx="5" ry="16" fill="#f9a8d4" />
    <ellipse cx="66" cy="22" rx="5" ry="16" fill="#f9a8d4" />
    {/* Head */}
    <circle cx="50" cy="57" r="26" fill="white" />
    {/* Muzzle */}
    <ellipse cx="50" cy="67" rx="11" ry="8" fill="#fce7f3" />
    <ellipse cx="50" cy="63" rx="4" ry="3" fill="#ec4899" />
    <Smile cx={50} cy={70} r={4} stroke="#be185d" />
    <Eye x={38} y={51} r={6} iris="#7e22ce" />
    <Eye x={62} y={51} r={6} iris="#7e22ce" />
  </svg>
);

const Fox = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fb923c" to="#c2410c" />
    {/* Ears (triangular) */}
    <polygon points="28,42 18,14 44,34" fill="#ef4444" />
    <polygon points="72,42 82,14 56,34" fill="#ef4444" />
    <polygon points="30,39 22,18 42,33" fill="#fcd34d" />
    <polygon points="70,39 78,18 58,33" fill="#fcd34d" />
    {/* Head */}
    <circle cx="50" cy="55" r="27" fill="#f97316" />
    {/* White face marking */}
    <ellipse cx="50" cy="62" rx="16" ry="15" fill="white" />
    {/* Nose */}
    <ellipse cx="50" cy="59" rx="5" ry="4" fill="#1c1917" />
    <circle cx="49" cy="58" r="1.5" fill="white" opacity="0.6" />
    <Smile cx={50} cy={65} r={4} stroke="#7c2d12" />
    <Eye x={37} y={47} r={6.5} iris="#7c2d12" />
    <Eye x={63} y={47} r={6.5} iris="#7c2d12" />
  </svg>
);

const Elephant = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#93c5fd" to="#1d4ed8" />
    {/* Big ears */}
    <ellipse cx="20" cy="52" rx="14" ry="20" fill="#9ca3af" />
    <ellipse cx="80" cy="52" rx="14" ry="20" fill="#9ca3af" />
    <ellipse cx="20" cy="52" rx="9" ry="14" fill="#d1d5db" opacity="0.5" />
    <ellipse cx="80" cy="52" rx="9" ry="14" fill="#d1d5db" opacity="0.5" />
    {/* Head */}
    <circle cx="50" cy="50" r="26" fill="#6b7280" />
    {/* Trunk */}
    <path d="M44 66 Q40 80 45 88 Q52 94 55 84 Q55 76 52 68" fill="#6b7280" stroke="#4b5563" strokeWidth="1" />
    {/* Tusks */}
    <ellipse cx="38" cy="66" rx="4" ry="8" fill="#fffbeb" transform="rotate(-20 38 66)" />
    <ellipse cx="62" cy="66" rx="4" ry="8" fill="#fffbeb" transform="rotate(20 62 66)" />
    <Eye x={36} y={44} r={6.5} iris="#1e3a5f" />
    <Eye x={62} y={44} r={6.5} iris="#1e3a5f" />
    {/* Smile */}
    <Smile cx={50} cy={68} r={5} stroke="#374151" />
  </svg>
);

const Turtle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#86efac" to="#15803d" />
    {/* Shell */}
    <ellipse cx="50" cy="50" r="28" fill="#16a34a" />
    {/* Shell hexagonal pattern */}
    <polygon points="50,30 60,36 60,48 50,54 40,48 40,36" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
    <polygon points="50,54 60,48 68,54 66,64 50,66 34,64 32,54 40,48" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
    {/* Head */}
    <circle cx="50" cy="26" r="13" fill="#4ade80" />
    {/* Legs */}
    <ellipse cx="24" cy="55" rx="8" ry="12" fill="#4ade80" transform="rotate(-20 24 55)" />
    <ellipse cx="76" cy="55" rx="8" ry="12" fill="#4ade80" transform="rotate(20 76 55)" />
    <ellipse cx="30" cy="72" rx="8" ry="10" fill="#4ade80" transform="rotate(10 30 72)" />
    <ellipse cx="70" cy="72" rx="8" ry="10" fill="#4ade80" transform="rotate(-10 70 72)" />
    <Eye x={43} y={24} r={5} iris="#14532d" />
    <Eye x={57} y={24} r={5} iris="#14532d" />
    <Smile cx={50} cy={31} r={4} stroke="#14532d" />
  </svg>
);

const Cow = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#e2e8f0" to="#64748b" />
    {/* Horns */}
    <path d="M34 28 Q28 14 38 18" stroke="#d97706" strokeWidth="4" fill="none" strokeLinecap="round" />
    <path d="M66 28 Q72 14 62 18" stroke="#d97706" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* Head */}
    <circle cx="50" cy="54" r="28" fill="white" />
    {/* Spots */}
    <ellipse cx="38" cy="44" rx="8" ry="10" fill="#1c1917" opacity="0.8" />
    <ellipse cx="66" cy="56" rx="6" ry="8" fill="#1c1917" opacity="0.8" />
    {/* Muzzle */}
    <ellipse cx="50" cy="66" rx="14" ry="10" fill="#fda4af" />
    <circle cx="45" cy="65" r="3" fill="#9f1239" />
    <circle cx="55" cy="65" r="3" fill="#9f1239" />
    <Smile cx={50} cy={70} r={4} stroke="#9f1239" />
    {/* Ears */}
    <ellipse cx="20" cy="48" rx="8" ry="12" fill="white" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(-15 20 48)" />
    <ellipse cx="80" cy="48" rx="8" ry="12" fill="white" stroke="#94a3b8" strokeWidth="1.5" transform="rotate(15 80 48)" />
    <Eye x={37} y={48} r={7} iris="#1c1917" />
    <Eye x={63} y={48} r={7} iris="#1c1917" />
  </svg>
);

const Penguin = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#93c5fd" to="#1e3a8a" />
    {/* Body */}
    <ellipse cx="50" cy="60" rx="24" ry="28" fill="#1e1b4b" />
    {/* White belly */}
    <ellipse cx="50" cy="63" rx="16" ry="20" fill="white" />
    {/* Head */}
    <circle cx="50" cy="36" r="20" fill="#1e1b4b" />
    {/* White face */}
    <ellipse cx="50" cy="38" rx="13" ry="12" fill="white" />
    {/* Beak */}
    <polygon points="50,44 44,50 56,50" fill="#f97316" />
    {/* Flippers */}
    <ellipse cx="24" cy="56" rx="8" ry="16" fill="#1e1b4b" transform="rotate(10 24 56)" />
    <ellipse cx="76" cy="56" rx="8" ry="16" fill="#1e1b4b" transform="rotate(-10 76 56)" />
    <Eye x={42} y={34} r={6} iris="#1e1b4b" />
    <Eye x={58} y={34} r={6} iris="#1e1b4b" />
  </svg>
);

const Owl = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fed7aa" to="#92400e" />
    {/* Body */}
    <ellipse cx="50" cy="62" rx="22" ry="26" fill="#92400e" />
    {/* Wing feather pattern */}
    <ellipse cx="28" cy="62" rx="10" ry="20" fill="#78350f" transform="rotate(-10 28 62)" />
    <ellipse cx="72" cy="62" rx="10" ry="20" fill="#78350f" transform="rotate(10 72 62)" />
    {/* Head */}
    <circle cx="50" cy="40" r="22" fill="#b45309" />
    {/* Ear tufts */}
    <polygon points="36,22 28,8 40,18" fill="#92400e" />
    <polygon points="64,22 72,8 60,18" fill="#92400e" />
    {/* Facial disc */}
    <ellipse cx="50" cy="42" rx="17" ry="14" fill="#fed7aa" />
    {/* Big eyes */}
    <circle cx="40" cy="40" r="10" fill="white" />
    <circle cx="60" cy="40" r="10" fill="white" />
    <circle cx="40" cy="40" r="7" fill="#f97316" />
    <circle cx="60" cy="40" r="7" fill="#f97316" />
    <circle cx="40" cy="40" r="4" fill="#1c1917" />
    <circle cx="60" cy="40" r="4" fill="#1c1917" />
    <circle cx="38" cy="38" r="1.5" fill="white" />
    <circle cx="58" cy="38" r="1.5" fill="white" />
    {/* Beak */}
    <polygon points="50,44 46,50 54,50" fill="#f97316" />
    {/* Belly */}
    <ellipse cx="50" cy="66" rx="13" ry="16" fill="#fde68a" opacity="0.6" />
  </svg>
);

const Mouse = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#e2e8f0" to="#94a3b8" />
    {/* Ears */}
    <circle cx="28" cy="28" r="14" fill="#94a3b8" />
    <circle cx="72" cy="28" r="14" fill="#94a3b8" />
    <circle cx="28" cy="28" r="9" fill="#fda4af" />
    <circle cx="72" cy="28" r="9" fill="#fda4af" />
    {/* Head */}
    <circle cx="50" cy="54" r="26" fill="#94a3b8" />
    {/* Muzzle */}
    <ellipse cx="50" cy="65" rx="12" ry="8" fill="#cbd5e1" />
    {/* Nose */}
    <ellipse cx="50" cy="61" rx="4" ry="3" fill="#ec4899" />
    <Smile cx={50} cy={68} r={4} stroke="#475569" />
    {/* Whiskers */}
    <line x1="38" y1="64" x2="22" y2="62" stroke="#475569" strokeWidth="1.5" />
    <line x1="62" y1="64" x2="78" y2="62" stroke="#475569" strokeWidth="1.5" />
    <Eye x={38} y={48} r={6} iris="#1e293b" />
    <Eye x={62} y={48} r={6} iris="#1e293b" />
  </svg>
);

const Wolf = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#94a3b8" to="#334155" />
    <polygon points="28,40 20,14 42,30" fill="#475569" />
    <polygon points="72,40 80,14 58,30" fill="#475569" />
    <polygon points="30,38 24,18 40,30" fill="#f1f5f9" opacity="0.5" />
    <polygon points="70,38 76,18 60,30" fill="#f1f5f9" opacity="0.5" />
    <circle cx="50" cy="54" r="27" fill="#64748b" />
    <ellipse cx="50" cy="64" rx="15" ry="11" fill="#e2e8f0" />
    <ellipse cx="50" cy="60" rx="6" ry="4" fill="#1e293b" />
    <Smile cx={50} cy={68} r={5} stroke="#1e293b" />
    <Eye x={37} y={47} r={7} iris="#f59e0b" />
    <Eye x={63} y={47} r={7} iris="#f59e0b" />
  </svg>
);

// ─── ANIMALI MARINI ───────────────────────────────────────────────────────────
const Dolphin = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#7dd3fc" to="#0369a1" />
    {/* Body arc */}
    <ellipse cx="50" cy="60" rx="32" ry="20" fill="#38bdf8" transform="rotate(-15 50 60)" />
    <ellipse cx="50" cy="55" rx="26" ry="14" fill="#7dd3fc" transform="rotate(-15 50 55)" />
    {/* Head */}
    <circle cx="34" cy="44" r="16" fill="#38bdf8" />
    {/* Snout/beak */}
    <ellipse cx="22" cy="50" rx="12" ry="6" fill="#38bdf8" transform="rotate(-10 22 50)" />
    <ellipse cx="22" cy="50" rx="10" ry="4" fill="#bae6fd" opacity="0.6" transform="rotate(-10 22 50)" />
    {/* Dorsal fin */}
    <path d="M55 40 Q65 18 72 38" fill="#0ea5e9" />
    {/* Tail */}
    <path d="M78 68 Q90 58 90 74 Q82 80 78 68Z" fill="#0ea5e9" />
    <path d="M78 68 Q90 74 88 82 Q80 84 78 68Z" fill="#38bdf8" />
    <Eye x={30} y={42} r={5} iris="#0369a1" />
    {/* Smile line */}
    <path d="M16 52 Q24 56 30 52" stroke="#0369a1" strokeWidth="1.5" fill="none" strokeLinecap="round" />
  </svg>
);

const Whale = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#93c5fd" to="#1d4ed8" />
    {/* Body */}
    <ellipse cx="52" cy="58" rx="36" ry="22" fill="#3b82f6" />
    {/* Belly */}
    <ellipse cx="52" cy="64" rx="24" ry="13" fill="#bfdbfe" />
    {/* Head */}
    <circle cx="22" cy="50" r="20" fill="#2563eb" />
    {/* Flippers */}
    <ellipse cx="50" cy="76" rx="12" ry="6" fill="#1d4ed8" transform="rotate(20 50 76)" />
    {/* Tail */}
    <path d="M84 56 Q98 48 96 58 Q98 68 84 62Z" fill="#1d4ed8" />
    {/* Blowhole */}
    <ellipse cx="22" cy="32" rx="4" ry="3" fill="#1e40af" />
    <path d="M22 32 Q24 22 22 18 Q20 14 24 12" stroke="#bfdbfe" strokeWidth="2" fill="none" />
    <Eye x={16} y={46} r={5} iris="#1e3a8a" />
    <Smile cx={16} cy={54} r={5} stroke="#1e3a8a" />
  </svg>
);

const Fish = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fed7aa" to="#ea580c" />
    {/* Body */}
    <ellipse cx="48" cy="50" rx="28" ry="18" fill="#f97316" />
    {/* Tail fin */}
    <polygon points="76,38 96,28 96,72 76,62" fill="#ea580c" />
    {/* Scales pattern */}
    {[[38, 44], [50, 40], [60, 44], [44, 52], [54, 50], [40, 58], [52, 56]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx="6" ry="4" fill="none" stroke="#c2410c" strokeWidth="1" opacity="0.4" />
    ))}
    {/* Dorsal fin */}
    <path d="M38 34 Q50 20 62 34" fill="#fb923c" />
    {/* Pectoral fin */}
    <ellipse cx="52" cy="62" rx="10" ry="5" fill="#fb923c" transform="rotate(15 52 62)" />
    <Eye x={26} y={48} r={7} iris="#7c2d12" />
    {/* Mouth */}
    <path d="M18 50 Q20 54 24 52" stroke="#7c2d12" strokeWidth="2" fill="none" strokeLinecap="round" />
  </svg>
);

const Octopus = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#d8b4fe" to="#7e22ce" />
    {/* Tentacles */}
    {[20, 30, 44, 56, 70, 80].map((x, i) => (
      <path key={i} d={`M${x} 66 Q${x + (i % 2 === 0 ? -8 : 8)} ${80} ${x + (i % 2 === 0 ? -4 : 4)} 92`}
        stroke="#9333ea" strokeWidth="8" fill="none" strokeLinecap="round" />
    ))}
    {/* Head/body */}
    <ellipse cx="50" cy="48" rx="28" ry="24" fill="#a855f7" />
    {/* Spots */}
    <circle cx="36" cy="42" r="4" fill="#c084fc" opacity="0.6" />
    <circle cx="50" cy="38" r="3" fill="#c084fc" opacity="0.6" />
    <circle cx="64" cy="42" r="4" fill="#c084fc" opacity="0.6" />
    <Eye x={38} y={48} r={8} iris="#4c1d95" />
    <Eye x={62} y={48} r={8} iris="#4c1d95" />
    <Smile cx={50} cy={58} r={5} stroke="#581c87" />
  </svg>
);

const Shark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#93c5fd" to="#1e3a8a" />
    {/* Body */}
    <ellipse cx="52" cy="56" rx="34" ry="20" fill="#6b7280" />
    {/* Belly */}
    <ellipse cx="52" cy="62" rx="24" ry="12" fill="#e2e8f0" />
    {/* Dorsal fin */}
    <polygon points="52,36 40,56 64,56" fill="#4b5563" />
    {/* Tail */}
    <polygon points="84,48 98,36 98,64 84,64" fill="#4b5563" />
    {/* Head */}
    <ellipse cx="22" cy="52" rx="18" ry="16" fill="#6b7280" />
    {/* Mouth with teeth */}
    <path d="M12 56 Q22 64 32 56" fill="#e2e8f0" />
    {[14, 18, 22, 26, 30].map((x, i) => (
      <polygon key={i} points={`${x},60 ${x + 2},56 ${x + 4},60`} fill="white" />
    ))}
    <Eye x={18} y={46} r={5.5} iris="#1e3a8a" />
    {/* Pectoral fin */}
    <ellipse cx="56" cy="70" rx="14" ry="5" fill="#4b5563" transform="rotate(10 56 70)" />
  </svg>
);

const Butterfly = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fbcfe8" to="#9d174d" />
    {/* Upper wings */}
    <ellipse cx="30" cy="40" rx="22" ry="28" fill="#f472b6" transform="rotate(-20 30 40)" />
    <ellipse cx="70" cy="40" rx="22" ry="28" fill="#f472b6" transform="rotate(20 70 40)" />
    {/* Lower wings */}
    <ellipse cx="28" cy="66" rx="18" ry="20" fill="#ec4899" transform="rotate(15 28 66)" />
    <ellipse cx="72" cy="66" rx="18" ry="20" fill="#ec4899" transform="rotate(-15 72 66)" />
    {/* Wing patterns */}
    <circle cx="30" cy="40" r="6" fill="#fbbf24" opacity="0.7" />
    <circle cx="70" cy="40" r="6" fill="#fbbf24" opacity="0.7" />
    <circle cx="28" cy="66" r="5" fill="#fef08a" opacity="0.6" />
    <circle cx="72" cy="66" r="5" fill="#fef08a" opacity="0.6" />
    {/* Body */}
    <ellipse cx="50" cy="52" rx="5" ry="20" fill="#1e1b4b" />
    {/* Antennae */}
    <path d="M47 34 Q38 18 35 12" stroke="#1e1b4b" strokeWidth="2" fill="none" />
    <path d="M53 34 Q62 18 65 12" stroke="#1e1b4b" strokeWidth="2" fill="none" />
    <circle cx="35" cy="12" r="3" fill="#fbbf24" />
    <circle cx="65" cy="12" r="3" fill="#fbbf24" />
    <Eye x={46} y={46} r={3.5} iris="#7e22ce" />
    <Eye x={54} y={46} r={3.5} iris="#7e22ce" />
  </svg>
);

const Eagle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#92400e" />
    {/* Wings spread */}
    <ellipse cx="18" cy="52" rx="20" ry="10" fill="#92400e" transform="rotate(-15 18 52)" />
    <ellipse cx="82" cy="52" rx="20" ry="10" fill="#92400e" transform="rotate(15 82 52)" />
    {/* Tail */}
    <ellipse cx="50" cy="78" rx="14" ry="8" fill="#78350f" />
    {/* Body */}
    <ellipse cx="50" cy="58" rx="18" ry="22" fill="#92400e" />
    {/* White head */}
    <circle cx="50" cy="38" r="18" fill="white" />
    {/* Beak */}
    <polygon points="50,48 42,52 52,56" fill="#f59e0b" />
    {/* Wing tips detail */}
    {[-20, -12, -4, 4, 12, 20].map((dx, i) => (
      <rect key={i} x={8 + i * 5} y={56} width="4" height="8" fill="#78350f"
        transform={`rotate(-20 ${8 + i * 5} 56)`} rx="2" />
    ))}
    <Eye x={44} y={36} r={6} iris="#92400e" />
    <Eye x={56} y={36} r={6} iris="#92400e" />
  </svg>
);

const Bird = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#a5f3fc" to="#0891b2" />
    {/* Body */}
    <ellipse cx="52" cy="58" rx="22" ry="18" fill="#22d3ee" />
    {/* Head */}
    <circle cx="34" cy="42" r="16" fill="#06b6d4" />
    {/* Beak */}
    <polygon points="22,44 12,40 12,48" fill="#f59e0b" />
    {/* Wing */}
    <ellipse cx="62" cy="52" rx="20" ry="12" fill="#0891b2" transform="rotate(-10 62 52)" />
    {/* Tail */}
    <path d="M72 62 Q84 56 86 66 Q84 72 72 68Z" fill="#0e7490" />
    {/* Feet */}
    <line x1="44" y1="74" x2="40" y2="84" stroke="#f59e0b" strokeWidth="2" />
    <line x1="52" y1="74" x2="56" y2="84" stroke="#f59e0b" strokeWidth="2" />
    <Eye x={30} y={40} r={5.5} iris="#0e7490" />
  </svg>
);

// ─── NATURA ───────────────────────────────────────────────────────────────────
const Sun = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fef08a" to="#b45309" />
    {/* Rays */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      const x1 = 50 + Math.cos(rad) * 28, y1 = 50 + Math.sin(rad) * 28;
      const x2 = 50 + Math.cos(rad) * 42, y2 = 50 + Math.sin(rad) * 42;
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="#fbbf24" strokeWidth={i % 2 === 0 ? 4 : 3} strokeLinecap="round" />;
    })}
    {/* Sun face */}
    <circle cx="50" cy="50" r="25" fill="#fde047" />
    <circle cx="50" cy="50" r="22" fill="#facc15" />
    <Eye x={40} y={46} r={5} iris="#b45309" />
    <Eye x={60} y={46} r={5} iris="#b45309" />
    <Smile cx={50} cy={54} r={6} stroke="#b45309" sw={2.5} />
  </svg>
);

const Moon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#312e81" to="#0f0628" />
    {/* Stars in background */}
    {[[20, 20], [76, 18], [82, 56], [25, 72], [16, 48]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#e0e7ff" opacity="0.7" />
    ))}
    {/* Moon crescent */}
    <circle cx="52" cy="50" r="28" fill="#fef08a" />
    <circle cx="62" cy="44" r="24" fill="#312e81" />
    {/* Crescent face */}
    <Eye x={36} y={46} r={5} iris="#92400e" />
    <Smile cx={40} cy={58} r={5} stroke="#92400e" />
    {/* Crater details */}
    <circle cx="42" cy="36" r="4" fill="#fde047" />
    <circle cx="34" cy="54" r="3" fill="#fde047" />
  </svg>
);

const Star = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#312e81" to="#0f0628" />
    {/* Sparkle background stars */}
    {[[15, 20], [80, 22], [18, 74], [82, 70], [50, 10]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.5} fill="white" opacity="0.5" />
    ))}
    {/* Main star */}
    <polygon points="50,14 61,38 88,38 66,56 74,82 50,66 26,82 34,56 12,38 39,38"
      fill="#fde047" stroke="#f59e0b" strokeWidth="2" />
    {/* Inner glow */}
    <polygon points="50,24 57,40 74,40 62,50 67,67 50,57 33,67 38,50 26,40 43,40"
      fill="#fef08a" opacity="0.6" />
    {/* Face */}
    <Eye x={42} y={44} r={4.5} iris="#b45309" />
    <Eye x={58} y={44} r={4.5} iris="#b45309" />
    <Smile cx={50} cy={52} r={4} stroke="#b45309" sw={2} />
  </svg>
);

const Rainbow = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bae6fd" to="#0369a1" />
    {/* Clouds */}
    <ellipse cx="15" cy="74" rx="14" ry="10" fill="white" />
    <ellipse cx="85" cy="74" rx="14" ry="10" fill="white" />
    {/* Rainbow arcs */}
    {[
      { r: 46, color: "#ef4444" }, { r: 40, color: "#f97316" }, { r: 34, color: "#eab308" },
      { r: 28, color: "#22c55e" }, { r: 22, color: "#3b82f6" }, { r: 16, color: "#8b5cf6" },
    ].map(({ r, color }, i) => (
      <path key={i} d={`M${50 - r} 74 A${r} ${r} 0 0 1 ${50 + r} 74`}
        stroke={color} strokeWidth="6" fill="none" />
    ))}
  </svg>
);

const Wave = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#7dd3fc" to="#0369a1" />
    {/* Background water */}
    <rect x="4" y="60" width="92" height="36" fill="#0ea5e9" rx="4" />
    {/* Main wave */}
    <path d="M4 52 Q20 38 36 52 Q52 66 68 52 Q84 38 96 52 L96 72 Q84 58 68 72 Q52 86 36 72 Q20 58 4 72Z"
      fill="#38bdf8" />
    {/* Top crest */}
    <path d="M4 52 Q20 38 36 52 Q52 66 68 52 Q84 38 96 52"
      stroke="#bae6fd" strokeWidth="3" fill="none" />
    {/* Foam dots */}
    {[20, 36, 52, 68, 84].map((x, i) => (
      <circle key={i} cx={x} cy={52} r={3} fill="white" opacity="0.6" />
    ))}
    {/* Water sparkles */}
    {[15, 40, 65, 82].map((x, i) => (
      <text key={i} x={x} y={70} fontSize="8" fill="white" opacity="0.4">✦</text>
    ))}
  </svg>
);

const Fire = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#7f1d1d" />
    {/* Outer flame */}
    <path d="M50 88 Q28 80 22 60 Q16 40 32 28 Q26 50 38 50 Q32 36 38 18 Q48 34 44 46 Q52 32 58 20 Q68 40 62 52 Q70 46 66 28 Q80 42 76 62 Q72 80 50 88Z"
      fill="#ef4444" />
    {/* Mid flame */}
    <path d="M50 82 Q32 74 30 58 Q28 46 38 38 Q34 52 44 52 Q40 42 46 28 Q54 40 50 50 Q56 38 62 32 Q68 46 62 58 Q66 48 62 38 Q72 50 68 62 Q64 76 50 82Z"
      fill="#f97316" />
    {/* Inner flame */}
    <path d="M50 74 Q36 66 36 54 Q36 44 44 40 Q40 52 48 52 Q46 42 52 34 Q58 44 54 54 Q62 46 60 38 Q66 50 62 60 Q60 70 50 74Z"
      fill="#fbbf24" />
    {/* Core */}
    <ellipse cx="50" cy="66" rx="10" ry="12" fill="#fef08a" />
    {/* Face */}
    <Eye x={42} y={58} r={4} iris="#b45309" />
    <Eye x={58} y={58} r={4} iris="#b45309" />
    <Smile cx={50} cy={66} r={4} stroke="#b45309" sw={2} />
  </svg>
);

const Snowflake = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bfdbfe" to="#1e40af" />
    {/* 6 arms */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      const x2 = 50 + Math.cos(rad) * 36, y2 = 50 + Math.sin(rad) * 36;
      const mx = 50 + Math.cos(rad) * 22, my = 50 + Math.sin(rad) * 22;
      const px = Math.cos((deg + 90) * Math.PI / 180) * 8;
      const py = Math.sin((deg + 90) * Math.PI / 180) * 8;
      return (
        <g key={i}>
          <line x1="50" y1="50" x2={x2} y2={y2} stroke="white" strokeWidth="4" strokeLinecap="round" />
          <line x1={mx - px} y1={my - py} x2={mx + px} y2={my + py}
            stroke="white" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    })}
    <circle cx="50" cy="50" r="6" fill="#e0f2fe" />
    {/* Tips */}
    {[0, 60, 120, 180, 240, 300].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <circle key={i} cx={50 + Math.cos(rad) * 36} cy={50 + Math.sin(rad) * 36}
        r={4} fill="#e0f2fe" />;
    })}
  </svg>
);

const WaterDrop = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bae6fd" to="#0369a1" />
    {/* Drop shape */}
    <path d="M50 20 Q68 42 68 60 Q68 78 50 82 Q32 78 32 60 Q32 42 50 20Z" fill="#38bdf8" />
    {/* Highlight */}
    <ellipse cx="42" cy="48" rx="6" ry="10" fill="white" opacity="0.4" transform="rotate(-15 42 48)" />
    {/* Shine */}
    <ellipse cx="58" cy="62" rx="4" ry="7" fill="white" opacity="0.25" />
    {/* Face */}
    <Eye x={41} y={58} r={5} iris="#0369a1" />
    <Eye x={59} y={58} r={5} iris="#0369a1" />
    <Smile cx={50} cy={68} r={4} stroke="#0369a1" sw={2} />
  </svg>
);

const Flower = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fce7f3" to="#9d174d" />
    {/* Stem */}
    <path d="M50 78 Q46 88 42 94" stroke="#16a34a" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M50 70 Q38 66 32 72" stroke="#16a34a" strokeWidth="3" fill="none" />
    <ellipse cx="30" cy="74" rx="8" ry="5" fill="#22c55e" transform="rotate(-20 30 74)" />
    {/* Petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <ellipse key={i}
        cx={50 + Math.cos(rad) * 20} cy={50 + Math.sin(rad) * 20}
        rx={10} ry={14} fill={i % 2 === 0 ? "#f472b6" : "#fb7185"}
        transform={`rotate(${deg}, ${50 + Math.cos(rad) * 20}, ${50 + Math.sin(rad) * 20})`} />;
    })}
    {/* Center */}
    <circle cx="50" cy="50" r="14" fill="#fbbf24" />
    <circle cx="50" cy="50" r="10" fill="#f59e0b" />
    {/* Center seeds */}
    {[[-3, -3], [3, -3], [-3, 3], [3, 3], [0, -5], [0, 5], [-5, 0], [5, 0]].map(([dx, dy], i) => (
      <circle key={i} cx={50 + dx} cy={50 + dy} r={1.5} fill="#92400e" />
    ))}
  </svg>
);

const Sunflower = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fef08a" to="#15803d" />
    {/* Stem */}
    <rect x="47" y="70" width="6" height="22" fill="#16a34a" rx="3" />
    {/* Leaves */}
    <ellipse cx="36" cy="76" rx="12" ry="6" fill="#22c55e" transform="rotate(-30 36 76)" />
    <ellipse cx="64" cy="74" rx="12" ry="6" fill="#22c55e" transform="rotate(30 64 74)" />
    {/* Petals */}
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <ellipse key={i}
        cx={50 + Math.cos(rad) * 22} cy={50 + Math.sin(rad) * 22}
        rx={7} ry={14} fill="#facc15"
        transform={`rotate(${deg}, ${50 + Math.cos(rad) * 22}, ${50 + Math.sin(rad) * 22})`} />;
    })}
    {/* Dark center */}
    <circle cx="50" cy="50" r="16" fill="#78350f" />
    <circle cx="50" cy="50" r="13" fill="#92400e" />
    {/* Seed pattern */}
    {[[-4, -4], [0, -5], [4, -4], [-5, 0], [5, 0], [-4, 4], [0, 5], [4, 4]].map(([dx, dy], i) => (
      <circle key={i} cx={50 + dx} cy={50 + dy} r={2} fill="#451a03" />
    ))}
  </svg>
);

const Mushroom = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#7f1d1d" />
    {/* Stem */}
    <rect x="38" y="60" width="24" height="28" fill="#fefce8" rx="4" />
    {/* Gills */}
    <line x1="44" y1="60" x2="44" y2="86" stroke="#fef9c3" strokeWidth="1.5" />
    <line x1="50" y1="60" x2="50" y2="88" stroke="#fef9c3" strokeWidth="1.5" />
    <line x1="56" y1="60" x2="56" y2="86" stroke="#fef9c3" strokeWidth="1.5" />
    {/* Cap */}
    <path d="M15 62 Q22 32 50 26 Q78 32 85 62Z" fill="#ef4444" />
    {/* Cap edge */}
    <ellipse cx="50" cy="62" rx="36" ry="8" fill="#fca5a5" />
    {/* White dots */}
    {[[38, 40], [56, 36], [46, 50], [66, 46], [30, 50]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={5} fill="white" />
    ))}
    {/* Face */}
    <Eye x={40} y={56} r={4} iris="#7f1d1d" />
    <Eye x={60} y={56} r={4} iris="#7f1d1d" />
    <Smile cx={50} cy={60} r={4} stroke="#7f1d1d" sw={2} />
  </svg>
);

const Leaf = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#86efac" to="#14532d" />
    {/* Leaf shape */}
    <path d="M50 82 Q22 66 18 42 Q14 18 36 16 Q50 14 64 16 Q86 18 82 42 Q78 66 50 82Z"
      fill="#22c55e" />
    {/* Vein system */}
    <path d="M50 82 Q50 50 50 18" stroke="#16a34a" strokeWidth="2.5" fill="none" />
    <path d="M50 50 Q36 44 24 38" stroke="#16a34a" strokeWidth="1.5" fill="none" />
    <path d="M50 50 Q64 44 76 38" stroke="#16a34a" strokeWidth="1.5" fill="none" />
    <path d="M50 34 Q38 28 30 24" stroke="#16a34a" strokeWidth="1.2" fill="none" />
    <path d="M50 34 Q62 28 70 24" stroke="#16a34a" strokeWidth="1.2" fill="none" />
    <path d="M50 64 Q38 60 30 56" stroke="#16a34a" strokeWidth="1.2" fill="none" />
    <path d="M50 64 Q62 60 70 56" stroke="#16a34a" strokeWidth="1.2" fill="none" />
    {/* Highlight */}
    <path d="M50 24 Q60 28 68 38 Q62 24 50 24Z" fill="#4ade80" opacity="0.5" />
  </svg>
);

const AutumnLeaf = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fed7aa" to="#7c2d12" />
    <path d="M60 80 Q38 68 24 50 Q12 32 26 18 Q34 12 50 20 Q62 26 68 14 Q80 28 72 44 Q84 38 86 52 Q88 68 60 80Z"
      fill="#f97316" />
    <path d="M60 80 Q52 58 44 36 Q42 26 50 20" stroke="#ea580c" strokeWidth="2" fill="none" />
    <path d="M52 50 Q38 46 26 50" stroke="#ea580c" strokeWidth="1.5" fill="none" />
    <path d="M54 36 Q66 30 72 24" stroke="#ea580c" strokeWidth="1.5" fill="none" />
    <path d="M57 64 Q68 58 78 60" stroke="#ea580c" strokeWidth="1.5" fill="none" />
    <path d="M58 80 Q62 86 58 94" stroke="#92400e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

// ─── CIBO ─────────────────────────────────────────────────────────────────────
const Apple = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fca5a5" to="#7f1d1d" />
    {/* Stem */}
    <path d="M50 26 Q54 16 60 12" stroke="#78350f" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Leaf */}
    <ellipse cx="58" cy="18" rx="8" ry="5" fill="#22c55e" transform="rotate(30 58 18)" />
    {/* Apple body */}
    <path d="M34 36 Q22 40 20 58 Q18 76 34 82 Q42 86 50 84 Q58 86 66 82 Q82 76 80 58 Q78 40 66 36 Q58 30 50 32 Q42 30 34 36Z"
      fill="#ef4444" />
    {/* Highlight */}
    <ellipse cx="36" cy="44" rx="8" ry="12" fill="white" opacity="0.25" transform="rotate(-20 36 44)" />
    {/* Dent at top */}
    <path d="M44 34 Q50 28 56 34" fill="#dc2626" />
  </svg>
);

const Orange = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fed7aa" to="#c2410c" />
    {/* Orange body */}
    <circle cx="50" cy="54" r="30" fill="#f97316" />
    {/* Segment lines */}
    {[30, 60, 90, 120, 150].map((deg, i) => {
      const rad = deg * Math.PI / 180;
      return <line key={i} x1="50" y1="54"
        x2={50 + Math.cos(rad) * 30} y2={54 + Math.sin(rad) * 30}
        stroke="#ea580c" strokeWidth="1.5" opacity="0.5" />;
    })}
    <circle cx="50" cy="54" r="30" fill="none" stroke="#ea580c" strokeWidth="1.5" />
    {/* Highlight */}
    <ellipse cx="40" cy="42" rx="8" ry="10" fill="white" opacity="0.2" />
    {/* Stem */}
    <path d="M50 24 Q50 18 52 14" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    {/* Leaf */}
    <ellipse cx="54" cy="20" rx="6" ry="4" fill="#22c55e" transform="rotate(20 54 20)" />
    {/* Navel */}
    <circle cx="50" cy="54" r="4" fill="#c2410c" opacity="0.4" />
  </svg>
);

const Lemon = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fef08a" to="#a16207" />
    {/* Lemon body */}
    <ellipse cx="50" cy="52" rx="30" ry="24" fill="#fde047" />
    {/* Tips */}
    <ellipse cx="22" cy="52" rx="10" ry="6" fill="#facc15" />
    <ellipse cx="78" cy="52" rx="10" ry="6" fill="#facc15" />
    {/* Texture */}
    {[[38, 42], [54, 40], [42, 58], [62, 56], [48, 50]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#eab308" opacity="0.4" />
    ))}
    {/* Highlight */}
    <ellipse cx="38" cy="44" rx="8" ry="6" fill="white" opacity="0.25" />
    {/* Leaf */}
    <ellipse cx="54" cy="30" rx="10" ry="5" fill="#22c55e" transform="rotate(20 54 30)" />
    <path d="M50 36 Q52 30 54 28" stroke="#16a34a" strokeWidth="1.5" fill="none" />
  </svg>
);

const Strawberry = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fca5a5" to="#9f1239" />
    {/* Leaves/sepals */}
    <ellipse cx="44" cy="28" rx="10" ry="6" fill="#16a34a" transform="rotate(-30 44 28)" />
    <ellipse cx="50" cy="26" rx="10" ry="6" fill="#22c55e" transform="rotate(0 50 26)" />
    <ellipse cx="56" cy="28" rx="10" ry="6" fill="#16a34a" transform="rotate(30 56 28)" />
    {/* Berry shape */}
    <path d="M30 40 Q28 60 36 74 Q42 84 50 86 Q58 84 64 74 Q72 60 70 40 Q62 32 50 32 Q38 32 30 40Z"
      fill="#ef4444" />
    {/* Seeds */}
    {[[40, 50], [52, 46], [62, 52], [44, 62], [56, 64], [50, 74], [36, 60], [66, 62]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={2.5} ry={3} fill="#fca5a5" transform={`rotate(${i * 20} ${x} ${y})`} />
    ))}
    {/* Highlight */}
    <ellipse cx="38" cy="48" rx="6" ry="10" fill="white" opacity="0.2" transform="rotate(-10 38 48)" />
  </svg>
);

const Grapes = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#e9d5ff" to="#4c1d95" />
    {/* Stem */}
    <path d="M50 20 Q50 26 50 30" stroke="#78350f" strokeWidth="2.5" fill="none" />
    <path d="M50 24 Q42 18 36 16" stroke="#78350f" strokeWidth="2" fill="none" />
    <ellipse cx="34" cy="16" rx="8" ry="5" fill="#22c55e" transform="rotate(-20 34 16)" />
    {/* Grape cluster */}
    {[
      [50, 36], [40, 44], [60, 44], [34, 54], [50, 52], [66, 54],
      [40, 64], [56, 64], [50, 76], [46, 54], [58, 44]
    ].map(([x, y], i) => (
      <g key={i}>
        <circle cx={x} cy={y} r={11} fill="#8b5cf6" />
        <circle cx={x - 3} cy={y - 3} r={3} fill="#c4b5fd" opacity="0.5" />
      </g>
    ))}
  </svg>
);

const Pizza = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fed7aa" to="#7c2d12" />
    {/* Crust */}
    <polygon points="50,20 14,80 86,80" fill="#b45309" />
    {/* Cheese */}
    <polygon points="50,30 22,76 78,76" fill="#fde047" />
    {/* Tomato sauce patches */}
    <circle cx="50" cy="52" r="8" fill="#ef4444" opacity="0.7" />
    <circle cx="38" cy="62" r="6" fill="#ef4444" opacity="0.7" />
    <circle cx="62" cy="62" r="6" fill="#ef4444" opacity="0.7" />
    {/* Toppings */}
    {[[44, 46], [56, 48], [38, 58], [50, 66], [62, 58]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={4} fill="#dc2626" />
    ))}
    {/* Herbs */}
    {[[46, 54], [54, 52], [48, 68]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={2} fill="#16a34a" />
    ))}
  </svg>
);

// ─── SPAZIO & OGGETTI ─────────────────────────────────────────────────────────
const Rocket = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#312e81" to="#0f0628" />
    {/* Stars */}
    {[[18, 22], [78, 18], [82, 68], [16, 72], [50, 12]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.5} fill="white" opacity="0.6" />
    ))}
    {/* Flame */}
    <path d="M42 76 Q44 88 50 92 Q56 88 58 76Z" fill="#f97316" />
    <path d="M44 76 Q46 84 50 86 Q54 84 56 76Z" fill="#fde047" />
    {/* Rocket body */}
    <path d="M36 74 L36 50 Q36 28 50 18 Q64 28 64 50 L64 74Z" fill="white" />
    <path d="M36 74 L36 50 Q36 28 50 18 Q64 28 64 50 L64 74Z" fill="none" stroke="#e2e8f0" strokeWidth="1" />
    {/* Nose */}
    <path d="M36 50 Q36 28 50 18 Q64 28 64 50Z" fill="#ef4444" />
    {/* Window */}
    <circle cx="50" cy="52" r="10" fill="#7dd3fc" />
    <circle cx="50" cy="52" r="7" fill="#38bdf8" />
    <circle cx="47" cy="49" r="2.5" fill="white" opacity="0.5" />
    {/* Fins */}
    <polygon points="36,74 24,86 36,60" fill="#ef4444" />
    <polygon points="64,74 76,86 64,60" fill="#ef4444" />
  </svg>
);

const Planet = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#312e81" to="#0f0628" />
    {/* Stars */}
    {[[15, 20], [82, 24], [20, 78], [80, 72]].map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.5} fill="white" opacity="0.6" />
    ))}
    {/* Ring (behind) */}
    <ellipse cx="50" cy="52" rx="42" ry="12" fill="#8b5cf6" opacity="0.5" />
    {/* Planet */}
    <circle cx="50" cy="52" r="26" fill="#6366f1" />
    {/* Surface bands */}
    <path d="M24 48 Q50 42 76 48" stroke="#818cf8" strokeWidth="4" fill="none" opacity="0.5" />
    <path d="M26 56 Q50 50 74 56" stroke="#a5b4fc" strokeWidth="3" fill="none" opacity="0.4" />
    {/* Highlight */}
    <ellipse cx="40" cy="42" rx="10" ry="7" fill="white" opacity="0.2" />
    {/* Ring (front) */}
    <path d="M8 52 Q50 62 92 52" stroke="#c4b5fd" strokeWidth="3" fill="none" />
    <path d="M8 52 Q50 66 92 52" stroke="#7c3aed" strokeWidth="5" fill="none" opacity="0.4" />
  </svg>
);

const Earth = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#312e81" to="#0f0628" />
    {/* Ocean base */}
    <circle cx="50" cy="50" r="30" fill="#3b82f6" />
    {/* Continents */}
    <path d="M36 28 Q40 24 50 28 Q62 24 66 34 Q68 42 60 46 Q52 46 48 40 Q42 42 36 38Z" fill="#22c55e" />
    <path d="M28 50 Q24 58 30 66 Q36 70 42 64 Q44 56 38 52Z" fill="#22c55e" />
    <path d="M54 56 Q58 52 68 54 Q72 60 66 68 Q58 70 54 64Z" fill="#22c55e" />
    <path d="M36 68 Q40 72 48 70 Q50 66 44 64Z" fill="#22c55e" />
    {/* Ice caps */}
    <path d="M40 22 Q50 18 60 22 Q54 24 50 22 Q46 24 40 22Z" fill="white" />
    <path d="M40 76 Q50 80 60 76 Q54 78 50 76 Q46 78 40 76Z" fill="white" />
    {/* Atmosphere glow */}
    <circle cx="50" cy="50" r="30" fill="none" stroke="#7dd3fc" strokeWidth="2" opacity="0.3" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#bae6fd" strokeWidth="1" opacity="0.2" />
    {/* Highlight */}
    <ellipse cx="38" cy="36" rx="8" ry="6" fill="white" opacity="0.2" />
  </svg>
);

const Books = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fde68a" to="#78350f" />
    {/* Bottom book */}
    <rect x="18" y="68" width="64" height="16" fill="#3b82f6" rx="2" />
    <rect x="18" y="68" width="8" height="16" fill="#1d4ed8" rx="2" />
    <line x1="30" y1="70" x2="30" y2="82" stroke="#93c5fd" strokeWidth="1.5" />
    <line x1="34" y1="70" x2="34" y2="82" stroke="#93c5fd" strokeWidth="1" />
    {/* Middle book */}
    <rect x="22" y="52" width="56" height="16" fill="#ef4444" rx="2" />
    <rect x="22" y="52" width="8" height="16" fill="#b91c1c" rx="2" />
    <line x1="34" y1="54" x2="34" y2="66" stroke="#fca5a5" strokeWidth="1.5" />
    <line x1="38" y1="54" x2="38" y2="66" stroke="#fca5a5" strokeWidth="1" />
    {/* Top book (leaning) */}
    <rect x="28" y="34" width="44" height="18" fill="#22c55e" rx="2" transform="rotate(-5 28 34)" />
    <rect x="28" y="34" width="8" height="18" fill="#15803d" rx="2" transform="rotate(-5 28 34)" />
    {/* Bookmark ribbon */}
    <rect x="60" y="26" width="5" height="18" fill="#fbbf24" />
    <polygon points="60,44 62.5,40 65,44" fill="#f59e0b" />
  </svg>
);

const Pencil = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fef08a" to="#a16207" />
    {/* Pencil body (diagonal) */}
    <rect x="28" y="20" width="22" height="66" fill="#fde047" rx="3"
      transform="rotate(15 38 52)" />
    {/* Side stripe */}
    <rect x="30" y="20" width="7" height="66" fill="#facc15" rx="2"
      transform="rotate(15 38 52)" />
    {/* Eraser (top) */}
    <rect x="28" y="20" width="22" height="12" fill="#fca5a5" rx="3"
      transform="rotate(15 38 52)" />
    {/* Metal band */}
    <rect x="28" y="32" width="22" height="6" fill="#9ca3af"
      transform="rotate(15 38 52)" />
    {/* Tip cone */}
    <polygon points="28,84 50,84 39,96" fill="#d4a373"
      transform="rotate(15 38 52)" />
    <polygon points="36,88 44,88 39,96" fill="#1c1917"
      transform="rotate(15 38 52)" />
    {/* Shine line */}
    <line x1="34" y1="38" x2="46" y2="78" stroke="white" strokeWidth="2" opacity="0.3"
      transform="rotate(15 38 52)" />
  </svg>
);

// ─── COLORI GEOMETRICI (per sfide pattern) ────────────────────────────────────
const RedCircle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fca5a5" to="#7f1d1d" />
    <circle cx="50" cy="50" r="28" fill="#ef4444" />
    <circle cx="50" cy="50" r="22" fill="#dc2626" />
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="white" opacity="0.25" />
  </svg>
);

const BlueCircle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bfdbfe" to="#1e3a8a" />
    <circle cx="50" cy="50" r="28" fill="#3b82f6" />
    <circle cx="50" cy="50" r="22" fill="#2563eb" />
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="white" opacity="0.25" />
  </svg>
);

const YellowCircle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fef9c3" to="#713f12" />
    <circle cx="50" cy="50" r="28" fill="#facc15" />
    <circle cx="50" cy="50" r="22" fill="#eab308" />
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="white" opacity="0.3" />
  </svg>
);

const GreenCircle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bbf7d0" to="#14532d" />
    <circle cx="50" cy="50" r="28" fill="#22c55e" />
    <circle cx="50" cy="50" r="22" fill="#16a34a" />
    <ellipse cx="40" cy="40" rx="8" ry="6" fill="white" opacity="0.25" />
  </svg>
);

// ─── EXTRA ────────────────────────────────────────────────────────────────────
const Volcano = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#fca5a5" to="#450a02" />
    {/* Lava ground */}
    <ellipse cx="50" cy="92" rx="44" ry="10" fill="#f97316" opacity="0.5" />
    {/* Volcano shape */}
    <polygon points="50,22 14,88 86,88" fill="#7f1d1d" />
    <polygon points="50,22 22,88 78,88" fill="#991b1b" />
    {/* Lava flow */}
    <path d="M46 32 Q44 50 46 70 Q48 82 50 88" stroke="#f97316" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
    {/* Crater glow */}
    <ellipse cx="50" cy="26" rx="14" ry="6" fill="#f97316" opacity="0.9" />
    {/* Smoke */}
    <circle cx="48" cy="14" r="6" fill="#4b5563" opacity="0.5" />
    <circle cx="54" cy="8" r="5" fill="#6b7280" opacity="0.4" />
  </svg>
);

const Castle = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#c4b5fd" to="#2e1065" />
    {/* Ground */}
    <rect x="8" y="82" width="84" height="10" fill="#1e0a50" rx="2" />
    {/* Main walls */}
    <rect x="22" y="54" width="56" height="34" fill="#2d1276" />
    {/* Side towers */}
    <rect x="12" y="44" width="24" height="44" fill="#3b0f96" />
    <rect x="64" y="44" width="24" height="44" fill="#3b0f96" />
    {/* Central tower */}
    <rect x="34" y="32" width="32" height="56" fill="#4c1d95" />
    {/* Battlements */}
    {[22, 32, 42, 52, 62].map((x, i) => <rect key={i} x={x} y={44} width={9} height={12} fill="#2d1276" />)}
    {[12, 22].map((x, i) => <rect key={i} x={x} y={34} width={9} height={12} fill="#3b0f96" />)}
    {[64, 74].map((x, i) => <rect key={i} x={x} y={34} width={9} height={12} fill="#3b0f96" />)}
    {[34, 46, 56].map((x, i) => <rect key={i} x={x} y={22} width={9} height={12} fill="#4c1d95" />)}
    {/* Gate */}
    <path d="M40 88 L40 68 Q50 58 60 68 L60 88Z" fill="#0a0018" />
    {/* Windows */}
    {[[46, 42], [54, 42]].map(([x, y], i) => (
      <ellipse key={i} cx={x} cy={y} rx={5} ry={6} fill="#fbbf24" opacity="0.8" />
    ))}
    {/* Pennant */}
    <line x1="50" y1="22" x2="50" y2="10" stroke="#fbbf24" strokeWidth="1.5" />
    <polygon points="50,10 62,14 50,18" fill="#ef4444" />
  </svg>
);

const Soccer = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
    <BgCircle from="#bbf7d0" to="#065f46" />
    {/* Ball */}
    <circle cx="50" cy="50" r="30" fill="white" stroke="#1c1917" strokeWidth="2" />
    {/* Pentagon patches */}
    <polygon points="50,24 60,31 56,43 44,43 40,31" fill="#1c1917" />
    <polygon points="74,40 78,52 68,60 60,55 62,43" fill="#1c1917" />
    <polygon points="38,57 36,70 26,66 24,54 34,46" fill="#1c1917" />
    <polygon points="62,57 64,70 74,66 76,54 66,46" fill="#1c1917" />
    <polygon points="50,72 40,79 32,70 36,58 44,57 56,57 64,58 68,70 60,79" fill="#1c1917" />
    {/* Shine */}
    <ellipse cx="38" cy="36" rx="8" ry="6" fill="white" opacity="0.4" />
  </svg>
);

// ─── FACES / EMOTIONS ────────────────────────────────────────────────────────
const FaceBase = ({ bg1="#FFD700", bg2="#F59E0B", mouth, extras }) => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from={bg1} to={bg2} />
    <circle cx="50" cy="52" r="30" fill="#FFD166" />
    <Eye x={38} y={44} r={6} iris="#1a1a2e" />
    <Eye x={62} y={44} r={6} iris="#1a1a2e" />
    {mouth}
    {extras}
  </svg>
);
const FaceHappy    = () => <FaceBase mouth={<Smile cx={50} cy={58} r={9} stroke="#5a2e10" sw={2.5}/>} />;
const FaceVeryHappy= () => <FaceBase mouth={<path d="M38 60 Q50 76 62 60" fill="#c0392b" stroke="#5a2e10" strokeWidth="2" strokeLinecap="round"/>} />;
const FaceExcited  = () => <FaceBase mouth={<><ellipse cx="50" cy="64" rx="9" ry="7" fill="#c0392b"/><ellipse cx="50" cy="64" rx="6" ry="4" fill="#7f0000" opacity=".5"/></>} />;
const FaceSad      = () => <FaceBase mouth={<path d="M38 68 Q50 58 62 68" stroke="#5a2e10" strokeWidth="2.5" fill="none" strokeLinecap="round"/>} />;
const FaceAngry    = () => <FaceBase bg1="#FF6B6B" bg2="#D62828"
  mouth={<path d="M38 68 Q50 60 62 68" stroke="#5a2e10" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
  extras={<><line x1="32" y1="37" x2="42" y2="42" stroke="#5a2e10" strokeWidth="2.5" strokeLinecap="round"/><line x1="68" y1="37" x2="58" y2="42" stroke="#5a2e10" strokeWidth="2.5" strokeLinecap="round"/></>}/>;
const FaceCrying   = () => <FaceBase
  mouth={<path d="M38 68 Q50 58 62 68" stroke="#5a2e10" strokeWidth="2.5" fill="none" strokeLinecap="round"/>}
  extras={<><ellipse cx="36" cy="55" rx="4" ry="6" fill="#60A5FA" opacity=".8"/><ellipse cx="64" cy="55" rx="4" ry="6" fill="#60A5FA" opacity=".8"/></>}/>;
const FaceScared   = () => <FaceBase bg1="#C4B5FD" bg2="#7C3AED"
  mouth={<ellipse cx="50" cy="65" rx="7" ry="5" fill="#5a2e10"/>}
  extras={<><line x1="32" y1="42" x2="42" y2="37" stroke="#5a2e10" strokeWidth="2" strokeLinecap="round"/><line x1="68" y1="42" x2="58" y2="37" stroke="#5a2e10" strokeWidth="2" strokeLinecap="round"/></>}/>;
const FaceShocked  = () => <FaceBase mouth={<ellipse cx="50" cy="65" rx="8" ry="8" fill="#5a2e10"/>}/>;
const FaceSurprised= () => <FaceBase mouth={<ellipse cx="50" cy="65" rx="7" ry="6" fill="#c0392b"/>}/>;
const FaceSleepy   = () => <FaceBase
  mouth={<Smile cx={50} cy={64} r={6} stroke="#5a2e10" sw={2}/>}
  extras={<><ellipse cx="38" cy="44" rx="6" ry="3" fill="#1a1a2e" opacity=".8"/><ellipse cx="62" cy="44" rx="6" ry="3" fill="#1a1a2e" opacity=".8"/><text x="72" y="34" fontSize="18" textAnchor="middle">💤</text></>}/>;
const FaceStarstruck = () => <FaceBase
  mouth={<path d="M38 62 Q50 74 62 62" fill="#c0392b" stroke="#5a2e10" strokeWidth="2" strokeLinecap="round"/>}
  extras={<><text x="37" y="50" fontSize="14" textAnchor="middle">⭐</text><text x="63" y="50" fontSize="14" textAnchor="middle">⭐</text></>}/>;

// ─── NUMBERS ─────────────────────────────────────────────────────────────────
const NCOLORS = ["#EF4444","#F97316","#EAB308","#22C55E","#3B82F6","#8B5CF6","#EC4899"];
const Num = (n) => () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from={NCOLORS[(n-1)%7]} to={NCOLORS[(n-1)%7]+"bb"} />
    <circle cx="50" cy="50" r="30" fill="white" opacity=".22"/>
    <text x="50" y="64" fontSize="40" fontWeight="900" textAnchor="middle" fill="white" fontFamily="system-ui,sans-serif">{n}</text>
  </svg>
);
const Num1=Num(1),Num2=Num(2),Num3=Num(3),Num4=Num(4),Num5=Num(5),Num6=Num(6),Num7=Num(7);

// ─── ANIMALS (additional) ─────────────────────────────────────────────────────
const Chicken = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FEF3C7" to="#F59E0B"/>
    <circle cx="50" cy="58" r="24" fill="white"/>
    <circle cx="50" cy="35" r="16" fill="white"/>
    <polygon points="50,18 55,30 45,30" fill="#F97316"/>
    <circle cx="44" cy="32" r="5" fill="black"/>
    <circle cx="56" cy="32" r="5" fill="black"/>
    <circle cx="45" cy="31" r="2" fill="white"/>
    <circle cx="57" cy="31" r="2" fill="white"/>
    <polygon points="42,36 38,42 46,42" fill="#F97316"/>
    <ellipse cx="50" cy="78" rx="14" ry="8" fill="#FDBA74"/>
    <ellipse cx="38" cy="80" rx="6" ry="4" fill="#FB923C"/>
    <ellipse cx="62" cy="80" rx="6" ry="4" fill="#FB923C"/>
  </svg>
);
const Duck = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#F59E0B"/>
    <ellipse cx="50" cy="65" rx="26" ry="20" fill="#FDE047"/>
    <circle cx="50" cy="38" r="18" fill="#FDE047"/>
    <ellipse cx="38" cy="38" rx="8" ry="6" fill="#F97316"/>
    <circle cx="56" cy="34" r="5" fill="black"/>
    <circle cx="57" cy="33" r="2" fill="white"/>
    <ellipse cx="65" cy="72" rx="12" ry="6" fill="#FBBF24"/>
    <ellipse cx="35" cy="72" rx="12" ry="6" fill="#FBBF24"/>
  </svg>
);
const Snail = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#86EFAC" to="#16A34A"/>
    <ellipse cx="52" cy="65" rx="28" ry="14" fill="#A3A3A3"/>
    <circle cx="52" cy="50" r="22" fill="#F97316"/>
    <circle cx="52" cy="50" r="15" fill="#EA580C"/>
    <circle cx="52" cy="50" r="8" fill="#C2410C"/>
    <circle cx="52" cy="50" r="3" fill="#7C2D12"/>
    <ellipse cx="30" cy="65" rx="14" ry="9" fill="#A3A3A3"/>
    <line x1="27" y1="57" x2="23" y2="48" stroke="#A3A3A3" strokeWidth="3" strokeLinecap="round"/>
    <line x1="34" y1="56" x2="30" y2="47" stroke="#A3A3A3" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="23" cy="47" r="3" fill="black"/>
    <circle cx="30" cy="46" r="3" fill="black"/>
  </svg>
);
const Crab = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FCA5A5" to="#DC2626"/>
    <ellipse cx="50" cy="55" rx="24" ry="18" fill="#EF4444"/>
    <ellipse cx="18" cy="48" rx="14" ry="9" fill="#EF4444"/>
    <ellipse cx="82" cy="48" rx="14" ry="9" fill="#EF4444"/>
    <ellipse cx="14" cy="42" rx="8" ry="10" fill="#EF4444" transform="rotate(-20 14 42)"/>
    <ellipse cx="86" cy="42" rx="8" ry="10" fill="#EF4444" transform="rotate(20 86 42)"/>
    <circle cx="40" cy="48" r="6" fill="white"/>
    <circle cx="60" cy="48" r="6" fill="white"/>
    <circle cx="40" cy="49" r="3" fill="black"/>
    <circle cx="60" cy="49" r="3" fill="black"/>
    <path d="M38 62 Q50 70 62 62" stroke="#7f1d1d" strokeWidth="2" fill="none" strokeLinecap="round"/>
    <line x1="36" y1="70" x2="30" y2="80" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
    <line x1="44" y1="72" x2="42" y2="82" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
    <line x1="56" y1="72" x2="58" y2="82" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
    <line x1="64" y1="70" x2="70" y2="80" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);
const Worm = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#86EFAC" to="#15803D"/>
    <ellipse cx="30" cy="62" rx="12" ry="12" fill="#F97316"/>
    <ellipse cx="50" cy="58" rx="12" ry="12" fill="#FB923C"/>
    <ellipse cx="68" cy="54" rx="13" ry="12" fill="#F97316"/>
    <circle cx="78" cy="42" r="14" fill="#FCA5A5"/>
    <Eye x={72} y={38} r={5} iris="#5a2e10"/>
    <Eye x={84} y={38} r={5} iris="#5a2e10"/>
    <Smile cx={78} cy={46} r={5} stroke="#5a2e10" sw={2}/>
  </svg>
);
const Whale2 = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#BAE6FD" to="#0284C7"/>
    <ellipse cx="48" cy="58" rx="34" ry="22" fill="#38BDF8"/>
    <circle cx="28" cy="52" r="18" fill="#38BDF8"/>
    <Eye x={22} y={48} r={6} iris="#0369A1"/>
    <Smile cx={28} cy={58} r={7} stroke="#0369A1" sw={2}/>
    <ellipse cx="82" cy="52" rx="12" ry="7" fill="#38BDF8" transform="rotate(-20 82 52)"/>
    <path d="M44 76 Q50 86 56 76" fill="#0EA5E9" stroke="#0284C7" strokeWidth="1"/>
    <path d="M30 34 Q28 24 34 22 Q28 32 36 30" fill="#7DD3FC"/>
  </svg>
);
const Crown = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <polygon points="20,72 20,45 35,60 50,30 65,60 80,45 80,72" fill="#FCD34D" stroke="#D97706" strokeWidth="2"/>
    <rect x="18" y="68" width="64" height="12" rx="4" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5"/>
    <circle cx="50" cy="32" r="6" fill="#EF4444"/>
    <circle cx="22" cy="58" r="5" fill="#3B82F6"/>
    <circle cx="78" cy="58" r="5" fill="#22C55E"/>
    <circle cx="35" cy="60" r="4" fill="#8B5CF6"/>
    <circle cx="65" cy="60" r="4" fill="#F97316"/>
  </svg>
);
const Boy = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#BAE6FD" to="#0284C7"/>
    <circle cx="50" cy="38" r="20" fill="#FDBCAF"/>
    <rect x="30" y="55" width="40" height="30" rx="10" fill="#3B82F6"/>
    <circle cx="50" cy="38" r="15" fill="#FDBCAF"/>
    <Eye x={43} y={35} r={4} iris="#1a1a2e"/>
    <Eye x={57} y={35} r={4} iris="#1a1a2e"/>
    <Smile cx={50} cy={43} r={5} stroke="#c0392b" sw={2}/>
    <rect x="22" y="56" width="12" height="24" rx="6" fill="#FDBCAF"/>
    <rect x="66" y="56" width="12" height="24" rx="6" fill="#FDBCAF"/>
    <rect x="34" y="72" width="14" height="16" rx="5" fill="#1D4ED8"/>
    <rect x="52" y="72" width="14" height="16" rx="5" fill="#1D4ED8"/>
  </svg>
);
const Girl = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FBCFE8" to="#DB2777"/>
    <circle cx="50" cy="38" r="22" fill="#7C3AED"/>
    <circle cx="50" cy="38" r="20" fill="#FDBCAF"/>
    <Eye x={43} y={35} r={4} iris="#1a1a2e"/>
    <Eye x={57} y={35} r={4} iris="#1a1a2e"/>
    <Smile cx={50} cy={43} r={5} stroke="#c0392b" sw={2}/>
    <ellipse cx="50" cy="70" rx="22" ry="20" fill="#EC4899"/>
    <rect x="22" y="56" width="12" height="20" rx="6" fill="#FDBCAF"/>
    <rect x="66" y="56" width="12" height="20" rx="6" fill="#FDBCAF"/>
  </svg>
);
const Person = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#D1D5DB" to="#6B7280"/>
    <circle cx="50" cy="35" r="18" fill="#FDBCAF"/>
    <rect x="30" y="50" width="40" height="30" rx="10" fill="#6B7280"/>
    <Eye x={43} y={32} r={4} iris="#1a1a2e"/>
    <Eye x={57} y={32} r={4} iris="#1a1a2e"/>
    <Smile cx={50} cy={40} r={5} stroke="#c0392b" sw={2}/>
    <rect x="22" y="52" width="12" height="22" rx="6" fill="#FDBCAF"/>
    <rect x="66" y="52" width="12" height="22" rx="6" fill="#FDBCAF"/>
  </svg>
);

// ─── FOOD / DRINK (additional) ───────────────────────────────────────────────
const Taco = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <path d="M15 65 Q50 30 85 65 Z" fill="#F59E0B"/>
    <path d="M15 65 Q50 55 85 65" fill="#22C55E"/>
    <ellipse cx="50" cy="62" rx="28" ry="6" fill="#EF4444" opacity=".8"/>
    <ellipse cx="40" cy="60" rx="6" ry="4" fill="#FBBF24"/>
    <ellipse cx="60" cy="60" rx="6" ry="4" fill="#FBBF24"/>
    <path d="M18 65 Q50 72 82 65 Q50 80 18 65" fill="#F59E0B"/>
  </svg>
);
const Pineapple = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#F59E0B"/>
    <ellipse cx="50" cy="64" rx="20" ry="26" fill="#FBBF24"/>
    <line x1="50" y1="38" x2="50" y2="56" stroke="#15803D" strokeWidth="4"/>
    <line x1="40" y1="28" x2="48" y2="42" stroke="#15803D" strokeWidth="3" strokeLinecap="round"/>
    <line x1="60" y1="28" x2="52" y2="42" stroke="#15803D" strokeWidth="3" strokeLinecap="round"/>
    <line x1="50" y1="22" x2="50" y2="40" stroke="#16A34A" strokeWidth="3" strokeLinecap="round"/>
    {["M30 54 Q50 48 70 54","M28 62 Q50 56 72 62","M30 70 Q50 64 70 70","M34 78 Q50 72 66 78"].map((d,i)=>(
      <path key={i} d={d} stroke="#D97706" strokeWidth="1.5" fill="none"/>
    ))}
    {["M50 54 L50 82","M42 54 L40 82","M58 54 L60 82"].map((d,i)=>(
      <line key={i} d={d} stroke="#D97706" strokeWidth="1.5"/>
    ))}
  </svg>
);
const Burger = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <ellipse cx="50" cy="38" rx="30" ry="16" fill="#D97706"/>
    <rect x="20" y="48" width="60" height="10" rx="2" fill="#22C55E"/>
    <rect x="20" y="56" width="60" height="10" rx="2" fill="#EF4444"/>
    <rect x="20" y="64" width="60" height="8" rx="2" fill="#F97316"/>
    <ellipse cx="50" cy="68" rx="30" ry="12" fill="#FBBF24"/>
    <circle cx="36" cy="36" r="3" fill="#FBBF24" opacity=".6"/>
    <circle cx="50" cy="34" r="3" fill="#FBBF24" opacity=".6"/>
    <circle cx="64" cy="36" r="3" fill="#FBBF24" opacity=".6"/>
  </svg>
);
const Milk = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#E0F2FE" to="#0284C7"/>
    <rect x="30" y="32" width="40" height="50" rx="8" fill="white"/>
    <rect x="35" y="24" width="30" height="14" rx="4" fill="#E0E7FF"/>
    <rect x="30" y="56" width="40" height="26" rx="8" fill="#DBEAFE"/>
    <text x="50" y="52" fontSize="22" textAnchor="middle">🥛</text>
    <path d="M38 40 Q50 36 62 40" stroke="#BFDBFE" strokeWidth="2" fill="none"/>
  </svg>
);
const Broccoli = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#86EFAC" to="#15803D"/>
    <rect x="44" y="62" width="12" height="24" rx="6" fill="#4ADE80"/>
    <circle cx="50" cy="44" r="20" fill="#22C55E"/>
    <circle cx="36" cy="38" r="16" fill="#16A34A"/>
    <circle cx="64" cy="38" r="16" fill="#16A34A"/>
    <circle cx="50" cy="30" r="16" fill="#15803D"/>
    <circle cx="50" cy="44" r="14" fill="#22C55E"/>
  </svg>
);
const Juice = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <rect x="30" y="38" width="40" height="44" rx="8" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="30" y="60" width="40" height="22" rx="8" fill="#FCD34D" opacity=".8"/>
    <rect x="26" y="32" width="48" height="12" rx="4" fill="#F59E0B"/>
    <circle cx="38" cy="52" r="4" fill="#F97316" opacity=".7"/>
    <circle cx="62" cy="56" r="3" fill="#F97316" opacity=".7"/>
    <rect x="48" y="18" width="4" height="20" rx="2" fill="#6EE7B7"/>
  </svg>
);

// ─── NATURE / OBJECTS ─────────────────────────────────────────────────────────
const GlowStar = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <polygon points="50,14 58,36 82,36 63,52 70,76 50,62 30,76 37,52 18,36 42,36" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1.5"/>
    <polygon points="50,24 55,38 70,38 58,46 63,60 50,52 37,60 42,46 30,38 45,38" fill="#FDE68A"/>
  </svg>
);
const Tulip = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FBCFE8" to="#DB2777"/>
    <line x1="50" y1="50" x2="50" y2="82" stroke="#22C55E" strokeWidth="5" strokeLinecap="round"/>
    <path d="M50 26 C40 26 30 36 30 50 Q40 52 50 50" fill="#F472B6"/>
    <path d="M50 26 C60 26 70 36 70 50 Q60 52 50 50" fill="#EC4899"/>
    <path d="M50 22 C48 18 42 16 40 22 C42 24 46 26 50 26" fill="#F9A8D4"/>
    <path d="M50 22 C52 18 58 16 60 22 C58 24 54 26 50 26" fill="#F9A8D4"/>
    <path d="M50 22 C50 16 50 14 50 12 C50 14 50 16 50 22" fill="#F472B6"/>
    <path d="M42 62 Q38 56 40 48 C42 52 48 56 50 60" fill="#16A34A" opacity=".8"/>
  </svg>
);
const Leaves = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#86EFAC" to="#15803D"/>
    <path d="M50 70 C30 55 22 38 30 22 C40 36 52 50 50 70" fill="#22C55E"/>
    <line x1="50" y1="70" x2="38" y2="28" stroke="#15803D" strokeWidth="2"/>
    <path d="M50 70 C70 55 78 38 70 22 C60 36 48 50 50 70" fill="#16A34A"/>
    <line x1="50" y1="70" x2="62" y2="28" stroke="#166534" strokeWidth="2"/>
    <path d="M50 70 C28 68 20 78 28 86 C36 80 46 74 50 70" fill="#4ADE80"/>
    <path d="M50 70 C72 68 80 78 72 86 C64 80 54 74 50 70" fill="#22C55E"/>
  </svg>
);
const Mountain = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#BAE6FD" to="#0284C7"/>
    <polygon points="50,18 80,78 20,78" fill="#6B7280"/>
    <polygon points="50,18 65,48 35,48" fill="white"/>
    <polygon points="28,60 48,78 8,78" fill="#9CA3AF"/>
    <polygon points="72,55 90,78 54,78" fill="#9CA3AF"/>
    <circle cx="20" cy="30" r="8" fill="white" opacity=".7"/>
    <circle cx="76" cy="25" r="10" fill="white" opacity=".7"/>
  </svg>
);
const CrystalBall = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#A78BFA" to="#6D28D9"/>
    <circle cx="50" cy="48" r="30" fill="url(#cbg)"/>
    <defs>
      <radialGradient id="cbg" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="#C4B5FD"/>
        <stop offset="60%" stopColor="#7C3AED"/>
        <stop offset="100%" stopColor="#4C1D95"/>
      </radialGradient>
    </defs>
    <ellipse cx="42" cy="38" rx="8" ry="5" fill="white" opacity=".3" transform="rotate(-20 42 38)"/>
    <circle cx="38" cy="36" r="3" fill="white" opacity=".4"/>
    <text x="50" y="54" fontSize="18" textAnchor="middle">✨</text>
    <ellipse cx="50" cy="78" rx="24" ry="8" fill="#5B21B6"/>
    <rect x="42" y="74" width="16" height="8" rx="4" fill="#6D28D9"/>
  </svg>
);
const Guitar = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#92400E"/>
    <line x1="50" y1="20" x2="50" y2="40" stroke="#92400E" strokeWidth="4"/>
    <rect x="42" y="14" width="16" height="14" rx="3" fill="#B45309"/>
    <ellipse cx="50" cy="58" rx="16" ry="20" fill="#D97706"/>
    <ellipse cx="50" cy="42" rx="10" ry="12" fill="#D97706"/>
    <circle cx="50" cy="58" r="4" fill="#92400E"/>
    <line x1="44" y1="38" x2="44" y2="72" stroke="#92400E" strokeWidth="1"/>
    <line x1="50" y1="38" x2="50" y2="72" stroke="#92400E" strokeWidth="1"/>
    <line x1="56" y1="38" x2="56" y2="72" stroke="#92400E" strokeWidth="1"/>
  </svg>
);
const Trumpet = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <rect x="22" y="44" width="40" height="12" rx="6" fill="#F59E0B"/>
    <ellipse cx="72" cy="52" rx="18" ry="14" fill="#FBBF24"/>
    <ellipse cx="72" cy="52" rx="14" ry="10" fill="#FCD34D"/>
    <circle cx="30" cy="38" r="7" fill="#F59E0B"/>
    <circle cx="30" cy="38" r="4" fill="#D97706"/>
    <circle cx="42" cy="36" r="7" fill="#F59E0B"/>
    <circle cx="42" cy="36" r="4" fill="#D97706"/>
    <path d="M22 50 C20 36 28 26 34 30" stroke="#F59E0B" strokeWidth="4" fill="none" strokeLinecap="round"/>
  </svg>
);
const Palette = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FBCFE8" to="#9333EA"/>
    <path d="M50 20 C28 20 18 36 20 52 C22 66 34 76 50 74 C58 74 62 68 58 62 C54 56 62 52 68 56 C76 60 80 52 78 44 C74 30 64 20 50 20" fill="white"/>
    <circle cx="32" cy="36" r="7" fill="#EF4444"/>
    <circle cx="22" cy="52" r="7" fill="#F97316"/>
    <circle cx="30" cy="66" r="7" fill="#EAB308"/>
    <circle cx="48" cy="22" r="7" fill="#22C55E"/>
    <circle cx="66" cy="24" r="7" fill="#3B82F6"/>
    <circle cx="76" cy="40" r="7" fill="#8B5CF6"/>
    <circle cx="56" cy="65" r="10" fill="#1a1a2e"/>
  </svg>
);
const Book2 = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DBEAFE" to="#1D4ED8"/>
    <rect x="22" y="24" width="56" height="60" rx="6" fill="#EFF6FF"/>
    <rect x="22" y="24" width="12" height="60" rx="4" fill="#93C5FD"/>
    <line x1="38" y1="38" x2="72" y2="38" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
    <line x1="38" y1="48" x2="72" y2="48" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
    <line x1="38" y1="58" x2="72" y2="58" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
    <line x1="38" y1="68" x2="60" y2="68" stroke="#BFDBFE" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="62" cy="75" r="8" fill="#3B82F6"/>
    <text x="62" y="79" fontSize="10" textAnchor="middle" fill="white" fontWeight="bold">★</text>
  </svg>
);
const Memo = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FEF9C3" to="#D97706"/>
    <rect x="24" y="18" width="52" height="64" rx="6" fill="#FFFBEB"/>
    <polygon points="60,18 76,34 60,34" fill="#FDE68A"/>
    <polygon points="60,18 76,34 60,34" fill="#D97706" opacity=".4"/>
    <line x1="32" y1="44" x2="68" y2="44" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="54" x2="68" y2="54" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="64" x2="54" y2="64" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="32" y1="34" x2="56" y2="34" stroke="#D97706" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
  </svg>
);
const Pen = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DBEAFE" to="#1D4ED8"/>
    <rect x="44" y="18" width="12" height="58" rx="4" fill="#3B82F6" transform="rotate(35 50 50)"/>
    <polygon points="50,76 44,82 56,82" fill="#1D4ED8" transform="rotate(35 50 50)"/>
    <polygon points="50,80 44,88 56,88" fill="#111" transform="rotate(35 50 50)"/>
    <rect x="44" y="18" width="12" height="12" rx="3" fill="#93C5FD" transform="rotate(35 50 50)"/>
  </svg>
);

// ─── GEOMETRIC / SHAPES ───────────────────────────────────────────────────────
const SolidCircle = (color) => () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from={color} to={color+"99"}/>
    <circle cx="50" cy="50" r="26" fill={color} opacity=".9"/>
    <circle cx="40" cy="40" r="8" fill="white" opacity=".2"/>
  </svg>
);
const OrangeCircle2 = SolidCircle("#F97316");
const BlueDiamond = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DBEAFE" to="#1D4ED8"/>
    <polygon points="50,20 76,50 50,80 24,50" fill="#3B82F6"/>
    <polygon points="50,26 70,50 50,74 30,50" fill="#60A5FA"/>
    <polygon points="50,26 70,50 50,44 30,50" fill="#93C5FD" opacity=".5"/>
  </svg>
);
const SmallOrangeDiamond = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <polygon points="50,26 70,50 50,74 30,50" fill="#F97316"/>
    <polygon points="50,32 64,50 50,68 36,50" fill="#FBBF24"/>
    <polygon points="50,32 64,50 50,46 36,50" fill="#FDE68A" opacity=".5"/>
  </svg>
);
const BlueSquare = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DBEAFE" to="#1D4ED8"/>
    <rect x="28" y="28" width="44" height="44" rx="6" fill="#3B82F6"/>
    <rect x="34" y="34" width="32" height="32" rx="4" fill="#60A5FA"/>
    <rect x="34" y="34" width="32" height="14" rx="4" fill="#93C5FD" opacity=".5"/>
  </svg>
);
const BlueHeart = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DBEAFE" to="#2563EB"/>
    <path d="M50 74 C30 60 16 44 18 32 C20 22 30 18 38 22 C42 24 46 28 50 32 C54 28 58 24 62 22 C70 18 80 22 82 32 C84 44 70 60 50 74Z" fill="#3B82F6"/>
    <path d="M50 64 C36 54 26 44 26 36 C26 30 32 28 36 30 C40 32 44 36 50 40 C56 36 60 32 64 30 C68 28 74 30 74 36 C74 44 64 54 50 64Z" fill="#93C5FD" opacity=".5"/>
  </svg>
);
const GreenHeart = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#DCFCE7" to="#15803D"/>
    <path d="M50 74 C30 60 16 44 18 32 C20 22 30 18 38 22 C42 24 46 28 50 32 C54 28 58 24 62 22 C70 18 80 22 82 32 C84 44 70 60 50 74Z" fill="#22C55E"/>
    <path d="M50 64 C36 54 26 44 26 36 C26 30 32 28 36 30 C40 32 44 36 50 40 C56 36 60 32 64 30 C68 28 74 30 74 36 C74 44 64 54 50 64Z" fill="#86EFAC" opacity=".5"/>
  </svg>
);
const Explosion = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#DC2626"/>
    <polygon points="50,14 56,34 74,20 64,38 84,36 68,50 82,64 62,60 66,80 50,66 34,80 38,60 18,64 32,50 16,36 36,38 26,20 44,34" fill="#F97316"/>
    <polygon points="50,26 54,38 66,30 60,42 72,40 62,50 70,60 58,56 60,68 50,60 40,68 42,56 30,60 38,50 28,40 40,42 34,30 46,38" fill="#FCD34D"/>
    <circle cx="50" cy="50" r="10" fill="#FEF9C3"/>
  </svg>
);
const Dizzy = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#D97706"/>
    <circle cx="50" cy="50" r="8" fill="#FBBF24"/>
    {[0,60,120,180,240,300].map((deg,i) => {
      const r = 25, a = deg*Math.PI/180;
      const x = 50+r*Math.cos(a), y = 50+r*Math.sin(a);
      const x2 = 50+(r-10)*Math.cos(a+(i%2?0.4:-0.4));
      const y2 = 50+(r-10)*Math.sin(a+(i%2?0.4:-0.4));
      return <line key={deg} x1={50+10*Math.cos(a)} y1={50+10*Math.sin(a)} x2={x} y2={y} stroke="#F59E0B" strokeWidth={4} strokeLinecap="round"/>;
    })}
  </svg>
);
const IceCube = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#E0F2FE" to="#0284C7"/>
    <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="#BAE6FD"/>
    <polygon points="50,18 78,34 50,50 22,34" fill="#E0F2FE" opacity=".8"/>
    <polygon points="22,34 50,50 50,82 22,66" fill="#7DD3FC" opacity=".8"/>
    <polygon points="78,34 50,50 50,82 78,66" fill="#38BDF8" opacity=".8"/>
    <line x1="50" y1="18" x2="50" y2="50" stroke="white" strokeWidth="1.5" opacity=".6"/>
    <line x1="22" y1="34" x2="50" y2="50" stroke="white" strokeWidth="1.5" opacity=".6"/>
    <line x1="78" y1="34" x2="50" y2="50" stroke="white" strokeWidth="1.5" opacity=".6"/>
  </svg>
);
const Rock = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#D1D5DB" to="#4B5563"/>
    <path d="M20 68 C18 54 24 36 36 28 C48 20 64 22 74 34 C84 46 82 64 74 72 C62 82 22 82 20 68Z" fill="#9CA3AF"/>
    <path d="M24 58 C24 46 30 36 40 32 C50 28 62 32 68 42 C58 36 44 38 36 48 C30 54 28 62 24 58Z" fill="#D1D5DB" opacity=".6"/>
    <path d="M60 72 C66 68 72 62 72 56 C68 62 64 68 60 72Z" fill="#6B7280" opacity=".4"/>
  </svg>
);
const MoonPhase = (fill, bg1="#1e293b", bg2="#0f172a") => () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from={bg1} to={bg2}/>
    <circle cx="50" cy="50" r="30" fill="#1e3a5f"/>
    <clipPath id="mpclip"><circle cx="50" cy="50" r="30"/></clipPath>
    <rect x={fill[0]} y="20" width={fill[1]} height="60" fill="#FCD34D" clipPath="url(#mpclip)"/>
    {Array.from({length:8},(_,i)=>{const a=i*45*Math.PI/180,r=38,x=50+r*Math.cos(a),y=50+r*Math.sin(a);return <circle key={i} cx={x} cy={y} r={1.5} fill="white" opacity=".6"/>;})}
  </svg>
);
const MoonNew      = MoonPhase([50,0]);
const MoonCrescent = MoonPhase([38,12]);
const MoonHalf1    = MoonPhase([20,30]);
const MoonGibbous  = MoonPhase([20,44]);
const MoonFull     = MoonPhase([20,60]);
const Galaxy = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#1e1b4b" to="#0f0a2e"/>
    <ellipse cx="50" cy="50" rx="34" ry="18" fill="none" stroke="#818CF8" strokeWidth="2" opacity=".7" transform="rotate(-20 50 50)"/>
    <ellipse cx="50" cy="50" rx="26" ry="12" fill="#312E81" opacity=".8" transform="rotate(-20 50 50)"/>
    <circle cx="50" cy="50" r="8" fill="#C7D2FE"/>
    <circle cx="50" cy="50" r="4" fill="white"/>
    {[[22,30],[76,28],[18,62],[78,68],[38,22],[66,72],[30,74],[70,24]].map(([x,y],i)=>(
      <circle key={i} cx={x} cy={y} r={i%3===0?2:1.5} fill="white" opacity={0.5+i*0.06}/>
    ))}
  </svg>
);
const Chestnut = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#92400E"/>
    <ellipse cx="50" cy="60" rx="26" ry="24" fill="#92400E"/>
    <ellipse cx="50" cy="54" rx="24" ry="18" fill="#B45309"/>
    <ellipse cx="44" cy="48" rx="8" ry="6" fill="#D97706" opacity=".5"/>
    <path d="M38 28 C42 18 58 18 62 28 C66 32 64 40 50 42 C36 40 34 32 38 28" fill="#15803D"/>
    <path d="M44 30 Q50 26 56 30" stroke="#166534" strokeWidth="2" fill="none"/>
    <ellipse cx="50" cy="78" rx="22" ry="6" fill="#7C2D12" opacity=".4"/>
  </svg>
);
const Shell = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FDE68A" to="#F59E0B"/>
    <path d="M50 76 C28 72 18 56 22 40 C26 26 40 18 54 22 C66 26 76 38 72 54 C68 68 56 78 50 76Z" fill="#FBBF24"/>
    <path d="M50 76 C44 68 40 58 42 48 C44 36 52 28 60 32 C68 36 72 46 68 56 C64 68 56 76 50 76Z" fill="#FCD34D"/>
    <line x1="50" y1="76" x2="34" y2="34" stroke="#D97706" strokeWidth="1.5" opacity=".6"/>
    <line x1="50" y1="76" x2="50" y2="22" stroke="#D97706" strokeWidth="1.5" opacity=".6"/>
    <line x1="50" y1="76" x2="66" y2="32" stroke="#D97706" strokeWidth="1.5" opacity=".6"/>
    <line x1="50" y1="76" x2="72" y2="56" stroke="#D97706" strokeWidth="1.5" opacity=".4"/>
    <ellipse cx="50" cy="80" rx="20" ry="6" fill="#F59E0B" opacity=".6"/>
  </svg>
);

const Squid = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#BAE6FD" to="#0284C7"/>
    <ellipse cx="50" cy="42" rx="20" ry="26" fill="#F472B6"/>
    <ellipse cx="50" cy="36" rx="16" ry="14" fill="#EC4899"/>
    <Eye x={42} y={32} r={5} iris="#1a1a2e"/>
    <Eye x={58} y={32} r={5} iris="#1a1a2e"/>
    {[[-12,0],[-6,4],[0,6],[6,4],[12,0]].map(([dx,extra],i)=>(
      <line key={i} x1={50+dx} y1={68} x2={48+dx} y2={82+extra} stroke="#F9A8D4" strokeWidth={3} strokeLinecap="round"/>
    ))}
    <path d="M34 68 Q50 74 66 68" fill="#F472B6"/>
  </svg>
);
const Lobster = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#FCA5A5" to="#DC2626"/>
    <ellipse cx="50" cy="54" rx="18" ry="22" fill="#EF4444"/>
    <ellipse cx="50" cy="36" rx="14" ry="16" fill="#DC2626"/>
    <Eye x={43} y={30} r={5} iris="#1a1a2e"/>
    <Eye x={57} y={30} r={5} iris="#1a1a2e"/>
    <line x1="43" y1="24" x2="36" y2="16" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
    <line x1="57" y1="24" x2="64" y2="16" stroke="#DC2626" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="22" cy="52" rx="14" ry="9" fill="#EF4444" transform="rotate(-10 22 52)"/>
    <ellipse cx="78" cy="52" rx="14" ry="9" fill="#EF4444" transform="rotate(10 78 52)"/>
    <ellipse cx="14" cy="48" rx="9" ry="11" fill="#DC2626" transform="rotate(-25 14 48)"/>
    <ellipse cx="86" cy="48" rx="9" ry="11" fill="#DC2626" transform="rotate(25 86 48)"/>
    {[[-10,0],[-4,2],[4,2],[10,0]].map(([dx,extra],i)=>(
      <line key={i} x1={50+dx} y1={72} x2={48+dx} y2={84+extra} stroke="#F87171" strokeWidth={3} strokeLinecap="round"/>
    ))}
  </svg>
);
const Tent = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{width:"100%",height:"100%"}}>
    <BgCircle from="#86EFAC" to="#15803D"/>
    <polygon points="50,18 82,76 18,76" fill="#F59E0B"/>
    <polygon points="50,18 66,76 34,76" fill="#D97706"/>
    <polygon points="42,76 58,76 50,52" fill="#1a1a2e"/>
    <line x1="50" y1="16" x2="50" y2="8" stroke="#92400E" strokeWidth="3" strokeLinecap="round"/>
    <ellipse cx="50" cy="80" rx="32" ry="6" fill="#15803D" opacity=".5"/>
  </svg>
);

// ─── ASSET MAP ────────────────────────────────────────────────────────────────
export const ASSET_MAP = {
  // ── Animals (original) ───────────────────────────────────────────────────
  "🐻": Bear,    "🐸": Frog,      "🐶": Dog,       "🐱": Cat,
  "🦁": Lion,    "🐰": Rabbit,    "🦊": Fox,       "🐘": Elephant,
  "🐢": Turtle,  "🐮": Cow,       "🐧": Penguin,   "🦉": Owl,
  "🐭": Mouse,   "🐺": Wolf,
  "🐬": Dolphin, "🐋": Whale,     "🐟": Fish,      "🐠": Fish,
  "🐙": Octopus, "🦈": Shark,
  "🦋": Butterfly,"🦅": Eagle,    "🐦": Bird,
  // ── Animals (new) ────────────────────────────────────────────────────────
  "🐔": Chicken, "🐓": Chicken,   "🦆": Duck,      "🐌": Snail,
  "🦀": Crab,    "🐛": Worm,      "🐳": Whale2,    "🐡": Fish,
  "🐚": Shell,   "🐕": Dog,       "🦑": Squid,     "🦞": Lobster,
  // ── Nature (original) ────────────────────────────────────────────────────
  "☀️": Sun,     "☀": Sun,        "🌙": Moon,      "⭐": Star,
  "🌈": Rainbow, "🌊": Wave,      "🔥": Fire,      "❄️": Snowflake,
  "❄": Snowflake,"💧": WaterDrop,
  "🌸": Flower,  "🌺": Flower,    "🌻": Sunflower, "🍄": Mushroom,
  "🌿": Leaf,    "🍂": AutumnLeaf,"🍁": AutumnLeaf,
  // ── Nature (new) ─────────────────────────────────────────────────────────
  "🌟": GlowStar,"✨": GlowStar,  "💫": Dizzy,
  "🌷": Tulip,   "🍃": Leaves,    "🌰": Chestnut,
  "🏔": Mountain,"🏔️": Mountain,  "🗻": Mountain,  "🏕": Tent, "🏕️": Tent,
  "🌌": Galaxy,  "🌑": MoonNew,   "🌒": MoonCrescent,
  "🌓": MoonHalf1,"🌔": MoonGibbous,"🌕": MoonFull,
  // ── Food (original) ──────────────────────────────────────────────────────
  "🍎": Apple,   "🍊": Orange,    "🍋": Lemon,     "🍓": Strawberry,
  "🍇": Grapes,  "🍕": Pizza,
  // ── Food (new) ───────────────────────────────────────────────────────────
  "🌮": Taco,    "🍍": Pineapple, "🍔": Burger,    "🥛": Milk,
  "🥦": Broccoli,"🧃": Juice,
  // ── Space & Objects (original) ───────────────────────────────────────────
  "🚀": Rocket,  "🪐": Planet,    "🌍": Earth,
  "📚": Books,   "✏️": Pencil,    "✏": Pencil,     "🖍️": Pencil,
  "🔴": RedCircle,"🔵": BlueCircle,"🟡": YellowCircle,"🟢": GreenCircle,
  "🌋": Volcano, "🏰": Castle,    "⚽": Soccer,
  // ── Objects (new) ────────────────────────────────────────────────────────
  "🔮": CrystalBall,"📖": Book2,  "📝": Memo,      "🖊": Pen,
  "🖊️": Pen,     "👑": Crown,     "🎸": Guitar,    "🎺": Trumpet,
  "🎨": Palette, "🧊": IceCube,   "🪨": Rock,
  // ── People ───────────────────────────────────────────────────────────────
  "👦": Boy,     "👧": Girl,      "👨": Person,    "👤": Person,
  // ── Faces / Emotions ─────────────────────────────────────────────────────
  "😊": FaceHappy,"😄": FaceVeryHappy,"😃": FaceExcited,
  "😔": FaceSad, "😢": FaceCrying,"😠": FaceAngry,
  "😨": FaceScared,"😱": FaceShocked,"😲": FaceSurprised,
  "😴": FaceSleepy,"🤩": FaceStarstruck,
  // ── Geometric / Colors (new) ─────────────────────────────────────────────
  "🟠": OrangeCircle2,"🔷": BlueDiamond,
  "🔸": SmallOrangeDiamond,"🟦": BlueSquare,
  "💙": BlueHeart,"💚": GreenHeart,"💥": Explosion,
  // ── Numbers ──────────────────────────────────────────────────────────────
  "1️⃣": Num1, "2️⃣": Num2, "3️⃣": Num3, "4️⃣": Num4,
  "5️⃣": Num5, "6️⃣": Num6, "7️⃣": Num7,
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
/**
 * SvgAsset renders a custom SVG illustration for a given emoji,
 * or falls back to a styled emoji circle if no SVG is available.
 *
 * Props:
 *   emoji    — the emoji string to look up
 *   size     — pixel size (width = height), default 80
 *   state    — "default" | "selected" | "wrong" | "correct" | "dimmed"
 */
// Strip Unicode variation selectors (U+FE0F, U+FE0E) for robust lookup
function normalizeEmoji(s) {
  return String(s).replace(/[︎️]/g, '');
}

export default function SvgAsset({ emoji, size = 80, state = "default" }) {
  const Component = ASSET_MAP[emoji] || ASSET_MAP[normalizeEmoji(emoji)];

  const shadow = {
    default:  `drop-shadow(0 3px ${Math.round(size * 0.1)}px rgba(0,0,0,.45))`,
    selected: `drop-shadow(0 0 ${Math.round(size * 0.15)}px #FFD700) drop-shadow(0 0 ${Math.round(size * 0.08)}px #FFD700)`,
    correct:  `drop-shadow(0 0 ${Math.round(size * 0.15)}px #22c55e)`,
    wrong:    `drop-shadow(0 0 ${Math.round(size * 0.12)}px #ef4444)`,
    dimmed:   `drop-shadow(0 2px 4px rgba(0,0,0,.3))`,
  }[state] || `drop-shadow(0 3px 6px rgba(0,0,0,.45))`;

  const opacity = state === "dimmed" ? 0.4 : 1;
  const scale = state === "selected" ? 1.06 : 1;

  const containerStyle = {
    width: size, height: size,
    borderRadius: "50%",
    flexShrink: 0,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden",
    filter: shadow,
    opacity,
    transform: `scale(${scale})`,
    transition: "transform .15s ease, filter .15s ease, opacity .15s ease",
  };

  if (Component) {
    return (
      <div style={containerStyle}>
        <Component />
      </div>
    );
  }

  // Strip invisible control characters (ZWJ U+200D, VS U+FE0F) before display
  const displayEmoji = emoji.replace(/[‍️︎]/g, '').trim();
  if (!displayEmoji) return null;

  // Fallback — emoji in a styled gradient circle
  return (
    <div style={{
      ...containerStyle,
      background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,.18), rgba(0,0,0,.25))",
      border: "2px solid rgba(255,255,255,.15)",
      fontSize: Math.round(size * 0.52),
      lineHeight: 1,
    }}>
      {displayEmoji}
    </div>
  );
}
