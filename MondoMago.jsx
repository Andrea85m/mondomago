import { useState } from "react";

// ── CONSTANTS ────────────────────────────────────────────────────────────────

const COMPANIONS = [
  {
    id: "fiamma", name: "Fiamma", emoji: "🐉", type: "Drago",
    color: "#FF6B6B", bg: "linear-gradient(135deg,#FF6B6B,#FF4040)",
    onCorrect: (name) => `FUOCO, ${name}! Lo sapevo che eri un campione!`,
    onWrong: () => "I draghi imparano cadendo! Su, riprova!",
    onStreak: (n) => `${n} di fila! Sei imbattibile!`,
    onReturn: (name) => `${name}! Ero qui ad aspettarti. Pronti a sputare fuoco?`,
  },
  {
    id: "luna", name: "Luna", emoji: "🦄", type: "Unicorno",
    color: "#C084FC", bg: "linear-gradient(135deg,#C084FC,#9B40E0)",
    onCorrect: (name) => `Hai fatto brillare il cielo, ${name}! Sei una stella! ✨`,
    onWrong: () => "Ogni stella brilla dopo il buio. Ci riproveremo insieme.",
    onStreak: (n) => `${n} risposte magiche! La tua luce cresce sempre di più.`,
    onReturn: (name) => `${name}! Il cielo era più buio senza di te. Bentornato/a!`,
  },
  {
    id: "onde", name: "Onde", emoji: "🐬", type: "Delfino",
    color: "#60A5FA", bg: "linear-gradient(135deg,#60A5FA,#2563EB)",
    onCorrect: (name) => `Splash! ${name} ha centrato l'obiettivo! Bravo esploratore!`,
    onWrong: () => "Interessante! Sai perché? Proviamo a scoprirlo!",
    onStreak: (n) => `${n} risposte corrette! Stai nuotando velocissimo!`,
    onReturn: (name) => `${name}! Che bello rivederti! Cosa scopriamo oggi?`,
  },
  {
    id: "foglia", name: "Foglia", emoji: "🦊", type: "Volpe",
    color: "#34D399", bg: "linear-gradient(135deg,#34D399,#059669)",
    onCorrect: (name) => `Mossa da maestro, ${name}! Nessuno ci avrebbe pensato!`,
    onWrong: () => "Strategia interessante... proviamo da un altro angolo!",
    onStreak: (n) => `${n} risposte! La volpe più astuta del bosco sei tu!`,
    onReturn: (name) => `${name}! Avevo un piano segreto per te. Pronti?`,
  },
];

const WORLDS = [
  { id: "foresta", name: "Foresta Magica", emoji: "🌲", color: "#22C55E", description: "Aiuta gli animali del bosco!", unlocked: true },
  { id: "castello", name: "Castello delle Nuvole", emoji: "🏰", color: "#A78BFA", description: "Supera le sfide del re!", unlocked: true },
  { id: "oceano", name: "Oceano Luminoso", emoji: "🌊", color: "#38BDF8", description: "Esplora i fondali!", unlocked: false },
  { id: "mercato", name: "Mercato dei Colori", emoji: "🎪", color: "#F97316", description: "Un mondo di colori e forme!", unlocked: false },
  { id: "galassia", name: "Galassia delle Stelle", emoji: "🌌", color: "#818CF8", description: "Viaggia nello spazio!", unlocked: false },
];

// skill → which challenge types contribute to it
const SKILL_MAP = {
  logica: ["logica", "pattern", "geometria", "memoria"],
  numeri: ["numeri", "conteggio"],
  creativita: ["creativita"],
  empatia: ["empatia"],
  parole: ["parole"],
};

const SKILLS = [
  { id: "logica", name: "Logica", emoji: "🧩", color: "#6366F1" },
  { id: "numeri", name: "Numeri", emoji: "🔢", color: "#F59E0B" },
  { id: "creativita", name: "Creatività", emoji: "🎨", color: "#EC4899" },
  { id: "empatia", name: "Empatia", emoji: "💛", color: "#10B981" },
  { id: "parole", name: "Parole", emoji: "📖", color: "#8B5CF6" },
];

const FAMILY_MISSIONS = [
  { id: 1, emoji: "🍳", title: "Chef Magico", description: "Cucina insieme! Conta gli ingredienti e misura le porzioni.", area: "Numeri", duration: "20 min" },
  { id: 2, emoji: "🌱", title: "Giardino Segreto", description: "Pianta un seme, osserva e disegna come cresce ogni giorno.", area: "Scienze", duration: "Settimanale" },
  { id: 3, emoji: "🗺️", title: "Caccia al Tesoro", description: "Nascondi oggetti in casa e scrivi gli indizi insieme.", area: "Logica", duration: "30 min" },
  { id: 4, emoji: "📖", title: "Storia a Staffetta", description: "Inizia una storia, poi passa al bambino: ognuno aggiunge una parte!", area: "Parole", duration: "15 min" },
  { id: 5, emoji: "🎭", title: "Teatro delle Emozioni", description: "Recitate situazioni diverse: come ci si sente? Come si reagisce?", area: "Empatia", duration: "25 min" },
  { id: 6, emoji: "🔢", title: "Spesa Matematica", description: "Al supermercato: conta i prodotti, confronta le quantità!", area: "Numeri", duration: "20 min" },
];

// ── CHALLENGES DATABASE ──────────────────────────────────────────────────────
// format: "visual" = emoji/image only, no prose (age 3-4)
// format: "text"   = text + visuals (age 5-6)
// ageMin/ageMax filter which group sees the challenge

const ALL_CHALLENGES = {
  foresta: [
    // VISUAL — 3-4 anni
    {
      id: "f01", format: "visual", type: "conteggio", ageMin: 3, ageMax: 4,
      prompt: "Quante 🍎 vedi?",
      visual: "🍎🍎🍎",
      options: ["1️⃣", "2️⃣", "3️⃣", "4️⃣"],
      correct: 2, emoji: "🐿️",
    },
    {
      id: "f02", format: "visual", type: "pattern", ageMin: 3, ageMax: 4,
      prompt: "Quale viene dopo?",
      visual: "🐛🦋🐛🦋🐛__",
      options: ["🦋", "🐛", "🌸", "🐝"],
      correct: 0, emoji: "🌿",
    },
    {
      id: "f03", format: "visual", type: "empatia", ageMin: 3, ageMax: 4,
      prompt: "Come si sente il coniglietto?",
      visual: "🐰😢",
      options: ["😊", "😢", "😠", "😲"],
      correct: 1, emoji: "🐰",
    },
    {
      id: "f04", format: "visual", type: "geometria", ageMin: 3, ageMax: 4,
      prompt: "Che forma è?",
      visual: "🔴",
      options: ["⬛", "🔵", "🔺", "🟦"],
      correct: 1, emoji: "🌈",
    },
    {
      id: "f05", format: "visual", type: "conteggio", ageMin: 3, ageMax: 4,
      prompt: "Quante 🦋 ci sono?",
      visual: "🦋🦋",
      options: ["1️⃣", "2️⃣", "3️⃣", "4️⃣"],
      correct: 1, emoji: "🌸",
    },
    // TEXT — 5-6 anni
    {
      id: "f06", format: "text", type: "logica", ageMin: 5, ageMax: 6,
      prompt: "Lo scoiattolo ha 5 ghiande. Ne mangia 2 e ne trova 3. Quante ghiande ha adesso?",
      options: ["4", "5", "6", "8"],
      correct: 2, emoji: "🐿️",
    },
    {
      id: "f07", format: "text", type: "empatia", ageMin: 5, ageMax: 6,
      prompt: "Il coniglietto ha perso la sua casetta. Come si sente?",
      options: ["Felice 😊", "Triste 😢", "Arrabbiato 😠", "Annoiato 😐"],
      correct: 1, emoji: "🐰",
    },
    {
      id: "f08", format: "text", type: "pattern", ageMin: 5, ageMax: 6,
      prompt: "Quale animale viene dopo nella sequenza?\n🦁🐯🦁🐯__",
      options: ["🐯", "🦁", "🐻", "🦊"],
      correct: 0, emoji: "🌿",
    },
    {
      id: "f09", format: "text", type: "numeri", ageMin: 5, ageMax: 6,
      prompt: "La volpe raccoglie 4 more + 3 fragole. Quanti frutti in tutto?",
      options: ["5", "6", "7", "8"],
      correct: 2, emoji: "🦊",
    },
    {
      id: "f10", format: "text", type: "logica", ageMin: 5, ageMax: 6,
      prompt: "Quale non appartiene al gruppo?\n🐦 🦋 🐝 🐸",
      options: ["🐦 (uccello)", "🦋 (farfalla)", "🐝 (ape)", "🐸 (rana)"],
      correct: 3, emoji: "🌲",
    },
  ],
  castello: [
    {
      id: "c01", format: "visual", type: "conteggio", ageMin: 3, ageMax: 4,
      prompt: "Quante ⭐ vedi?",
      visual: "⭐⭐⭐⭐",
      options: ["2️⃣", "3️⃣", "4️⃣", "5️⃣"],
      correct: 2, emoji: "👑",
    },
    {
      id: "c02", format: "visual", type: "geometria", ageMin: 3, ageMax: 4,
      prompt: "Quale forma è diversa?",
      visual: "🔵🔵🔵🔴",
      options: ["🔵", "🔴", "🟢", "🟡"],
      correct: 1, emoji: "🏰",
    },
    {
      id: "c03", format: "visual", type: "pattern", ageMin: 3, ageMax: 4,
      prompt: "Cosa viene dopo?",
      visual: "⭐🌙⭐🌙__",
      options: ["☀️", "⭐", "🌙", "💫"],
      correct: 0, emoji: "✨",
    },
    {
      id: "c04", format: "text", type: "numeri", ageMin: 5, ageMax: 6,
      prompt: "Il castello ha 3 torri a sinistra e 4 a destra. Quante torri in tutto?",
      options: ["5", "6", "7", "8"],
      correct: 2, emoji: "🏰",
    },
    {
      id: "c05", format: "text", type: "logica", ageMin: 5, ageMax: 6,
      prompt: "Il principe vede 8 draghi. 3 volano via. Quanti ne restano?",
      options: ["3", "4", "5", "6"],
      correct: 2, emoji: "🐉",
    },
    {
      id: "c06", format: "text", type: "empatia", ageMin: 5, ageMax: 6,
      prompt: "La principessa vince il torneo! Come si sente?",
      options: ["Triste 😢", "Arrabbiata 😠", "Felice 🎉", "Spaventata 😨"],
      correct: 2, emoji: "👑",
    },
    {
      id: "c07", format: "text", type: "parole", ageMin: 5, ageMax: 6,
      prompt: "Quale parola fa rima con CASTELLO?",
      options: ["Mare", "Bello", "Sole", "Porta"],
      correct: 1, emoji: "🎶",
    },
  ],
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function getSkillForType(type) {
  for (const [skill, types] of Object.entries(SKILL_MAP)) {
    if (types.includes(type)) return skill;
  }
  return "logica";
}

function filterChallenges(worldId, age) {
  const all = ALL_CHALLENGES[worldId] || [];
  return all.filter(c => age >= c.ageMin && age <= c.ageMax);
}

function initSkills() {
  return { logica: 1, numeri: 1, creativita: 1, empatia: 1, parole: 1 };
}

function updateSkills(skills, type, correct) {
  const skill = getSkillForType(type);
  const delta = correct ? 0.5 : 0;
  return {
    ...skills,
    [skill]: Math.min(10, +(skills[skill] + delta).toFixed(1)),
  };
}

// ── COMPONENT ────────────────────────────────────────────────────────────────

export default function MondoMago() {
  const [screen, setScreen] = useState("onboarding_name");
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState(null); // 4 or 6 (represents 3-4 or 5-6)
  const [companion, setCompanion] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [sessionStars, setSessionStars] = useState(0);
  const [totalStars, setTotalStars] = useState(0);
  const [streak, setStreak] = useState(3);
  const [skills, setSkills] = useState(initSkills());
  const [sessionResults, setSessionResults] = useState([]);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);

  const companionObj = COMPANIONS.find(c => c.id === companion);
  const currentChallenge = challenges[challengeIndex];

  function startWorld(world) {
    if (!world.unlocked) return;
    const filtered = filterChallenges(world.id, childAge || 5);
    if (filtered.length === 0) return;
    setSelectedWorld(world);
    setChallenges(filtered);
    setChallengeIndex(0);
    setSelected(null);
    setSessionStars(0);
    setSessionResults([]);
    setConsecutiveCorrect(0);
    setScreen("challenge");
  }

  function handleAnswer(idx) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === currentChallenge.correct;
    const earned = correct ? (currentChallenge.format === "visual" ? 1 : 2) : 0;
    if (correct) {
      setSessionStars(s => s + earned);
      setTotalStars(s => s + earned);
      setConsecutiveCorrect(c => c + 1);
    } else {
      setConsecutiveCorrect(0);
    }
    setSkills(s => updateSkills(s, currentChallenge.type, correct));
    setSessionResults(r => [...r, { type: currentChallenge.type, correct }]);
  }

  function nextChallenge() {
    if (challengeIndex < challenges.length - 1) {
      setChallengeIndex(i => i + 1);
      setSelected(null);
    } else {
      setScreen("session_end");
    }
  }

  const isYoung = (childAge || 5) <= 4;

  // ── SCREENS ──────────────────────────────────────────────────────────────

  // 1. ONBOARDING — Name
  if (screen === "onboarding_name") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", color: "white", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🧙‍♂️</div>
      <h1 style={{ fontSize: 38, fontWeight: 900, margin: "0 0 8px" }}>MondoMago</h1>
      <p style={{ fontSize: 16, opacity: .85, marginBottom: 40 }}>Il tuo viaggio magico inizia qui!</p>
      <div style={{ width: "100%", maxWidth: 340 }}>
        <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Come ti chiami? 👋</p>
        <input
          value={childName}
          onChange={e => setChildName(e.target.value)}
          placeholder="Scrivi il tuo nome..."
          style={{ width: "100%", padding: "16px 20px", borderRadius: 20, border: "none", fontSize: 18, outline: "none", textAlign: "center", color: "#1a1a2e" }}
        />
        <button
          onClick={() => childName.trim() && setScreen("onboarding_age")}
          disabled={!childName.trim()}
          style={{ marginTop: 20, width: "100%", background: childName.trim() ? "white" : "rgba(255,255,255,.3)", color: "#764ba2", border: "none", borderRadius: 50, padding: "16px", fontSize: 18, fontWeight: 700, cursor: childName.trim() ? "pointer" : "default" }}
        >
          Avanti ✨
        </button>
      </div>
    </div>
  );

  // 2. ONBOARDING — Age
  if (screen === "onboarding_age") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f093fb,#f5576c)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif", color: "white", padding: 24, textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 12 }}>🎂</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>Quanti anni hai, {childName}?</h2>
      <p style={{ opacity: .85, marginBottom: 40 }}>Le sfide saranno perfette per te!</p>
      <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 360 }}>
        {[
          { label: "3-4", value: 4, emoji: "🐣", desc: "Sfide visive e divertenti" },
          { label: "5-6", value: 6, emoji: "🚀", desc: "Sfide con parole e numeri" },
        ].map(opt => (
          <button key={opt.value} onClick={() => { setChildAge(opt.value); setScreen("companion"); }}
            style={{ flex: 1, background: "rgba(255,255,255,.2)", border: "3px solid white", borderRadius: 24, padding: "28px 16px", cursor: "pointer", color: "white" }}>
            <div style={{ fontSize: 44 }}>{opt.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 24, marginTop: 8 }}>{opt.label}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 6 }}>{opt.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 3. COMPANION SELECTION
  if (screen === "companion") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e,#4A2090)", display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", fontFamily: "system-ui,sans-serif", color: "white" }}>
      <div style={{ fontSize: 44, marginBottom: 8 }}>🌟</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Scegli il tuo compagno, {childName}!</h2>
      <p style={{ opacity: .75, marginBottom: 32, fontSize: 14 }}>Ti accompagnerà in ogni avventura</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%", maxWidth: 400 }}>
        {COMPANIONS.map(c => (
          <button key={c.id} onClick={() => { setCompanion(c.id); setScreen("worlds"); }}
            style={{ background: "rgba(255,255,255,.08)", border: "3px solid rgba(255,255,255,.15)", borderRadius: 22, padding: "24px 16px", cursor: "pointer", color: "white", transition: "all .2s" }}>
            <div style={{ fontSize: 52 }}>{c.emoji}</div>
            <div style={{ fontWeight: 800, fontSize: 17, marginTop: 10 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: c.color, marginTop: 4, fontWeight: 600 }}>{c.type}</div>
          </button>
        ))}
      </div>
    </div>
  );

  // 4. WORLDS MAP
  if (screen === "worlds") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#1a1a2e 0%,#0f3460 100%)", fontFamily: "system-ui,sans-serif", color: "white", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 13, opacity: .6 }}>Ciao, {childName}! 👋</div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800 }}>🗺️ I Mondi Magici</h2>
        </div>
        {companionObj && (
          <div style={{ textAlign: "center", background: "rgba(255,255,255,.08)", borderRadius: 16, padding: "8px 12px", cursor: "pointer" }} onClick={() => setScreen("companion")}>
            <div style={{ fontSize: 26 }}>{companionObj.emoji}</div>
            <div style={{ fontSize: 10, opacity: .7 }}>{companionObj.name}</div>
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {[
          { icon: "⭐", val: totalStars, label: "stelle" },
          { icon: "🔥", val: streak, label: "giorni" },
          { icon: "🎯", val: sessionResults.length, label: "sfide" },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: "rgba(255,255,255,.08)", borderRadius: 14, padding: "10px 8px", textAlign: "center" }}>
            <div style={{ fontSize: 18 }}>{s.icon}</div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>{s.val}</div>
            <div style={{ fontSize: 10, opacity: .6 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {[["🗺️", "Mondi"], ["🌳", "Skill"], ["👨‍👩‍👧", "Famiglia"]].map(([icon, label], i) => (
          <button key={i} onClick={() => { if (i === 1) setScreen("skills"); if (i === 2) setScreen("family"); }}
            style={{ flex: 1, background: i === 0 ? "rgba(255,255,255,.2)" : "rgba(255,255,255,.06)", border: "none", borderRadius: 14, padding: "10px 4px", color: "white", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* World cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {WORLDS.map(world => {
          const count = filterChallenges(world.id, childAge || 5).length;
          return (
            <button key={world.id} onClick={() => startWorld(world)} disabled={!world.unlocked}
              style={{ background: world.unlocked ? `linear-gradient(135deg,${world.color}30,${world.color}15)` : "rgba(255,255,255,.04)", border: `2px solid ${world.unlocked ? world.color : "rgba(255,255,255,.08)"}`, borderRadius: 20, padding: "18px 20px", cursor: world.unlocked ? "pointer" : "default", color: world.unlocked ? "white" : "rgba(255,255,255,.3)", display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
              <span style={{ fontSize: 38 }}>{world.unlocked ? world.emoji : "🔒"}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{world.name}</div>
                <div style={{ fontSize: 12, opacity: .75, marginTop: 3 }}>{world.description}</div>
                {world.unlocked && count > 0 && (
                  <div style={{ fontSize: 11, opacity: .55, marginTop: 4 }}>
                    🎯 {count} sfide · {isYoung ? "visive 🖼️" : "testo + immagini"}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  // 5. CHALLENGE SCREEN
  if (screen === "challenge" && currentChallenge) {
    const isCorrect = selected === currentChallenge.correct;
    const isVisual = currentChallenge.format === "visual";
    let feedbackMsg = "";
    if (selected !== null && companionObj) {
      if (isCorrect) {
        feedbackMsg = consecutiveCorrect >= 2
          ? companionObj.onStreak(consecutiveCorrect)
          : companionObj.onCorrect(childName);
      } else {
        feedbackMsg = companionObj.onWrong();
      }
    }

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(180deg,#1a1a2e,#0f2027)", fontFamily: "system-ui,sans-serif", color: "white", padding: 20, display: "flex", flexDirection: "column" }}>
        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setScreen("worlds")} style={{ background: "rgba(255,255,255,.1)", border: "none", color: "white", borderRadius: 12, padding: "8px 14px", cursor: "pointer", fontSize: 14 }}>
            ← Esci
          </button>
          <div style={{ display: "flex", gap: 14, fontSize: 14, alignItems: "center" }}>
            <span>⭐ {sessionStars}</span>
            <span style={{ opacity: .6 }}>{challengeIndex + 1} / {challenges.length}</span>
          </div>
          {companionObj && <span style={{ fontSize: 24 }}>{companionObj.emoji}</span>}
        </div>

        {/* Progress bar */}
        <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 8, height: 6, marginBottom: 24 }}>
          <div style={{ background: "#22C55E", height: "100%", borderRadius: 8, width: `${((challengeIndex + 1) / challenges.length) * 100}%`, transition: "width .4s" }} />
        </div>

        {/* Challenge card */}
        <div style={{ background: "rgba(255,255,255,.06)", borderRadius: 24, padding: 24, marginBottom: 20, flex: isVisual ? "0 0 auto" : "0 0 auto" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>{currentChallenge.emoji}</div>
          {/* Visual format: large visual display */}
          {isVisual ? (
            <>
              <div style={{ fontSize: 48, letterSpacing: 8, marginBottom: 12 }}>{currentChallenge.visual}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,.85)" }}>{currentChallenge.prompt}</div>
            </>
          ) : (
            <p style={{ fontSize: 17, lineHeight: 1.6, margin: 0, fontWeight: 500, whiteSpace: "pre-line" }}>{currentChallenge.prompt}</p>
          )}
        </div>

        {/* Options */}
        <div style={{ display: "grid", gridTemplateColumns: isVisual ? "1fr 1fr" : "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {currentChallenge.options.map((opt, idx) => {
            let bg = "rgba(255,255,255,.09)";
            let border = "rgba(255,255,255,.14)";
            if (selected !== null) {
              if (idx === currentChallenge.correct) { bg = "rgba(34,197,94,.3)"; border = "#22C55E"; }
              else if (idx === selected) { bg = "rgba(239,68,68,.3)"; border = "#EF4444"; }
            }
            return (
              <button key={idx} onClick={() => handleAnswer(idx)}
                style={{ background: bg, border: `2.5px solid ${border}`, borderRadius: 18, padding: isVisual ? "20px 10px" : "16px 12px", color: "white", fontSize: isVisual ? 28 : 16, fontWeight: 600, cursor: selected === null ? "pointer" : "default", transition: "all .2s" }}>
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {selected !== null && (
          <div style={{ background: isCorrect ? "rgba(34,197,94,.15)" : "rgba(99,102,241,.15)", borderRadius: 20, padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{isCorrect ? "🎉" : "💙"}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>
              {isCorrect ? "Corretto!" : "Quasi!"}
            </div>
            {companionObj && (
              <div style={{ fontSize: 13, opacity: .85, marginBottom: 14 }}>
                {companionObj.emoji} {feedbackMsg}
              </div>
            )}
            <button onClick={nextChallenge}
              style={{ background: "white", color: "#1a1a2e", border: "none", borderRadius: 50, padding: "12px 32px", fontWeight: 800, fontSize: 15, cursor: "pointer" }}>
              {challengeIndex < challenges.length - 1 ? "Avanti →" : "Fine sessione! 🏁"}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 6. SESSION END
  if (screen === "session_end") {
    const correct = sessionResults.filter(r => r.correct).length;
    const total = sessionResults.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const topSkill = (() => {
      const counts = {};
      sessionResults.filter(r => r.correct).forEach(r => {
        const s = getSkillForType(r.type);
        counts[s] = (counts[s] || 0) + 1;
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0];
    })();
    const topSkillObj = SKILLS.find(s => s.id === topSkill);

    return (
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#1a1a2e,#4A2090)", fontFamily: "system-ui,sans-serif", color: "white", padding: 28, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 12 }}>
          {pct === 100 ? "🏆" : pct >= 60 ? "⭐" : "💪"}
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, marginBottom: 6 }}>
          {pct === 100 ? "Perfetto!" : pct >= 60 ? "Bravissimo/a!" : "Ottima partita!"}
        </h2>
        {companionObj && (
          <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 20, padding: "14px 20px", marginBottom: 24, fontSize: 14, opacity: .9 }}>
            {companionObj.emoji} {pct >= 60 ? companionObj.onCorrect(childName) : companionObj.onWrong()}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "100%", maxWidth: 340, marginBottom: 24 }}>
          {[
            { icon: "✅", val: correct, label: "Corrette" },
            { icon: "⭐", val: sessionStars, label: "Stelle" },
            { icon: "🎯", val: `${pct}%`, label: "Precisione" },
            { icon: topSkillObj?.emoji || "🧩", val: topSkillObj?.name || "—", label: "Top abilità" },
          ].map((s, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,.1)", borderRadius: 18, padding: "18px 12px" }}>
              <div style={{ fontSize: 28 }}>{s.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 20, marginTop: 6 }}>{s.val}</div>
              <div style={{ fontSize: 11, opacity: .65, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Skill progress */}
        <div style={{ width: "100%", maxWidth: 340, background: "rgba(255,255,255,.07)", borderRadius: 20, padding: 18, marginBottom: 28, textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 800, opacity: .7, marginBottom: 14 }}>LE TUE ABILITÀ</div>
          {SKILLS.map(skill => (
            <div key={skill.id} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{skill.emoji} {skill.name}</span>
                <span style={{ color: skill.color, fontWeight: 700 }}>Lv.{skills[skill.id]}</span>
              </div>
              <div style={{ background: "rgba(255,255,255,.1)", borderRadius: 6, height: 6 }}>
                <div style={{ background: skill.color, height: "100%", borderRadius: 6, width: `${(skills[skill.id] / 10) * 100}%`, transition: "width .6s" }} />
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => { setScreen("worlds"); setSessionStars(0); setSessionResults([]); }}
          style={{ background: "white", color: "#4A2090", border: "none", borderRadius: 50, padding: "16px 48px", fontWeight: 800, fontSize: 17, cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.2)" }}>
          🗺️ Torna ai Mondi
        </button>
      </div>
    );
  }

  // 7. SKILL TREE
  if (screen === "skills") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#0f0c29,#302b63)", fontFamily: "system-ui,sans-serif", color: "white", padding: 24 }}>
      <button onClick={() => setScreen("worlds")} style={{ background: "none", border: "none", color: "white", fontSize: 24, cursor: "pointer", marginBottom: 16 }}>←</button>
      <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800 }}>🌳 Le tue Abilità</h2>
      <p style={{ opacity: .6, fontSize: 13, marginBottom: 28 }}>Crescono ad ogni sfida completata</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {SKILLS.map(skill => (
          <div key={skill.id} style={{ background: "rgba(255,255,255,.07)", borderRadius: 20, padding: "20px 22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{skill.emoji}</span>
                <span style={{ fontWeight: 800, fontSize: 17 }}>{skill.name}</span>
              </div>
              <span style={{ color: skill.color, fontWeight: 900, fontSize: 20 }}>Lv.{skills[skill.id]}</span>
            </div>
            <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 8, height: 10 }}>
              <div style={{ background: skill.color, height: "100%", borderRadius: 8, width: `${(skills[skill.id] / 10) * 100}%`, transition: "width .6s" }} />
            </div>
            <div style={{ fontSize: 11, opacity: .5, marginTop: 6 }}>{skills[skill.id]} / 10 — {10 - skills[skill.id]} livelli alla padronanza</div>
          </div>
        ))}
      </div>
    </div>
  );

  // 8. FAMILY MISSIONS
  if (screen === "family") return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f6d365,#fda085)", fontFamily: "system-ui,sans-serif", color: "#1a1a2e", padding: 24 }}>
      <button onClick={() => setScreen("worlds")} style={{ background: "none", border: "none", color: "#1a1a2e", fontSize: 24, cursor: "pointer", marginBottom: 16 }}>←</button>
      <h2 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800 }}>👨‍👩‍👧 Missioni Famiglia</h2>
      <p style={{ opacity: .7, fontSize: 13, marginBottom: 24 }}>Avventure da fare insieme, nella vita reale!</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {FAMILY_MISSIONS.map(m => {
          const skillObj = SKILLS.find(s => s.name.toLowerCase() === m.area.toLowerCase()) || SKILLS[0];
          return (
            <div key={m.id} style={{ background: "rgba(255,255,255,.65)", borderRadius: 20, padding: "18px 20px" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ fontSize: 36 }}>{m.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>{m.title}</div>
                  <div style={{ fontSize: 13, opacity: .8, marginBottom: 10 }}>{m.description}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ background: skillObj.color, color: "white", borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>{m.area}</span>
                    <span style={{ background: "rgba(0,0,0,.1)", borderRadius: 20, padding: "3px 10px", fontSize: 11 }}>⏱ {m.duration}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return null;
}
