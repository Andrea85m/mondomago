// ─────────────────────────────────────────────────────────────────────────────
// Configurazione del mondo di gioco (zona 🔴 condivisa): compagni e loro battute,
// archi narrativi, mondi, frammenti del Sigillo, abilità.
// I testi parlati qui dentro hanno una clip in public/audio: dopo averli
// cambiati, `npm run voce` e poi `npm run audit`.
// ─────────────────────────────────────────────────────────────────────────────

import { pick } from "../util.js";

// ── COMPANIONS ────────────────────────────────────────────────────────────────
export const COMPANIONS = [
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
export const STORY_ARCS = {
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
export const WORLDS = [
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
export const SIGILLO_FRAGMENTS = [
  { worldId:"foresta",    angle:0,   color:"#22C55E", emoji:"🌲" },
  { worldId:"castello",   angle:45,  color:"#A78BFA", emoji:"🏰" },
  { worldId:"oceano",     angle:90,  color:"#38BDF8", emoji:"🌊" },
  { worldId:"mercato",    angle:135, color:"#F97316", emoji:"🎪" },
  { worldId:"galassia",   angle:180, color:"#818CF8", emoji:"🌌" },
  { worldId:"vulcano",    angle:225, color:"#EF4444", emoji:"🌋" },
  { worldId:"biblioteca", angle:270, color:"#D97706", emoji:"📚" },
  { worldId:"laboratorio",angle:315, color:"#06B6D4", emoji:"🔬" },
];

export const SIGILLO_STORY = {
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
export const SKILLS = [
  { id:"logica",     name:"Logica",     emoji:"🧩", color:"#6366F1" },
  { id:"numeri",     name:"Numeri",     emoji:"🔢", color:"#F59E0B" },
  { id:"creativita", name:"Creatività", emoji:"🎨", color:"#EC4899" },
  { id:"empatia",    name:"Empatia",    emoji:"💛", color:"#10B981" },
  { id:"parole",     name:"Parole",     emoji:"📖", color:"#8B5CF6" },
  { id:"coding",     name:"Coding",     emoji:"💻", color:"#06B6D4" },
];

export const SKILL_MAP = {
  logica:     ["logica","pattern","geometria","memoria"],
  numeri:     ["numeri","conteggio"],
  creativita: ["creativita"],
  empatia:    ["empatia"],
  parole:     ["parole"],
  coding:     ["coding","sequenza","condizione","debug"],
};
