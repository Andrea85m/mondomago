// ─────────────────────────────────────────────────────────────────────────────
// ALL_CHALLENGES — tutte le sfide degli 8 mondi (zona 🟢 Andrea).
// Blocchi per mondo: mondi diversi = zero conflitti. Dopo ogni modifica:
// `npm run audit` controlla risposte, fasce d'età e voce registrata.
// ─────────────────────────────────────────────────────────────────────────────

// ── CHALLENGES ────────────────────────────────────────────────────────────────
// Formats:
//   visual_tap      — emoji only, age 3-4
//   multiple_choice — text + optional visual, age 5-6
//   story_choice    — narrative branch with two outcomes
//   sequence_tap    — tap items in correct order
//   rhyme_complete  — filastrocca with blank at end, pick the rhyming word
// isBoss:true → harder, worth 3 stars

export const ALL_CHALLENGES = {
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
      options:["🐟","🦀","🦈","🐙"],   correct:0 },

    { id:"o05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🔵🟦💧",     prompt:"Tocca la goccia d'acqua!", emoji:"💧",
      options:["💧","🔥","🌿","⭐"],   correct:0 },

    { id:"o06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🐠🐡🐠🐡🐠", prompt:"🦈 Lo Squalo chiede:\ncosa viene dopo? 🐠🐡🐠🐡🐠__", emoji:"🦈",
      options:["🐡","🐠","🦑","🦞"],   correct:0 },

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
      prompt:"🦈 Lo Squalo chiede:\n20 pesci nel banco. 8 si nascondono.\nArrivano 3 nuovi. Quanti pesci ci sono?",
      emoji:"🦈", options:["13","14","15","16"], correct:2 },
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
      options:["🔴","🟡","🔵","🟢"],   correct:0 },

    { id:"m05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🍕🍔🌮🍎",  prompt:"Quale è il cibo più sano?", emoji:"🥗",
      options:["🍎","🍕","🍔","🌮"],   correct:0 },

    { id:"m06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"🍎🍊🍎🍊🍎", prompt:"🧙 Il Mago chiede:\ncosa viene dopo? 🍎🍊🍎🍊🍎__", emoji:"🧙",
      options:["🍊","🍎","🍋","🍇"],   correct:0 },

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
      prompt:"🧙 Il Mago chiede:\nHai 15 caramelle. Ne mangi 4 e ne regali 3.\nQuante caramelle ti restano?",
      emoji:"🧙", options:["6","7","8","9"], correct:2 },
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
      options:["🌍","🌕","⭐","🚀"],   correct:0 },

    { id:"g05", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4,
      visual:"🌑🌒🌓🌔🌕", prompt:"Quale è la luna piena?", emoji:"🌕",
      options:["🌕","🌑","🌒","🌓"],   correct:0 },

    { id:"g06", format:"visual_tap", type:"logica",    ageMin:3, ageMax:4, isBoss:true,
      visual:"⭐🪐⭐🪐⭐", prompt:"👽 L'Alieno chiede:\ncosa viene dopo? ⭐🪐⭐🪐⭐__", emoji:"👽",
      options:["🪐","⭐","☀️","🌙"],   correct:0 },

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
      prompt:"👽 L'Alieno chiede:\n18 stelle in cielo. Ne cadono 5, ne nascono 3 nuove.\nQuante stelle ci sono?",
      emoji:"👽", options:["14","15","16","17"], correct:2 },
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
      options:["🌷","🌿","🌺","🌻"], correct:0 },
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
      // "Finestra" (-estra) non rima con "foresta" (-esta): è un'assonanza.
      emoji:"🎶", options:["Montagna","Festa","Bosco","Fiore"], correct:1 },
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
      // "Oceano" è sdrucciola: nessuna delle opzioni ci rimava davvero.
      prompt:"Quale parola fa rima con DELFINO?",
      emoji:"🎶", options:["Marino","Lontano","Profondo","Azzurro"], correct:0 },
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
      visual:"🍊🍊🍊🍊🍊", prompt:"Quante arance?", emoji:"🍊",
      options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },
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
      visual:"🌟🌟🌟🌟🌟", prompt:"Quante stelle?", emoji:"🚀",
      options:["3️⃣","4️⃣","5️⃣","6️⃣"], correct:2 },
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
      prompt:"👽 L'Alieno chiede:\nIl razzo ha 4 serbatoi con 5 litri ciascuno.\nQuanti litri in tutto?",
      emoji:"👽", options:["9","15","20","25"], correct:2 },
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
    prompt:"🌋 La Fenice chiede:\nIl vulcano erutta 5 volte di giorno\ne 4 volte di notte. Quante eruzioni in tutto?",
    emoji:"🐦", options:["7","8","9","10"], correct:2 },
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
    prompt:"Una biblioteca ha 4 scaffali con 5 libri ciascuno.\nQuanti libri in tutto?",
    emoji:"📚", options:["9","15","20","25"], correct:2 },
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
  // ── 3-4 anni ────────────────────────────────────────────────────────────────
  // A quest'età il pensiero computazionale è "se succede questo allora quello"
  // e "prima, poi, infine": nessuna lettura per rispondere, si tocca l'immagine.
  // Prima di queste il mondo era di fatto ingiocabile sotto i 5 anni: 5 sfide
  // sole, cioè sempre le stesse.
  { id:"lab_a1", format:"visual_tap", type:"condizione", ageMin:3, ageMax:4,
    visual:"🤖💧", prompt:"Il robot ha sete.\nCosa gli serve?", emoji:"🤖",
    options:["💧","🪨","⚽","🎸"], correct:0 },

  { id:"lab_a2", format:"visual_tap", type:"sequenza", ageMin:3, ageMax:4,
    visual:"🌰", prompt:"Dal seme nasce...", emoji:"🌱",
    options:["🌳","🐟","🏰","🎺"], correct:0 },

  { id:"lab_a3", format:"visual_tap", type:"condizione", ageMin:3, ageMax:4,
    visual:"🔥", prompt:"Il fuoco scotta!\nCosa lo spegne?", emoji:"🧯",
    options:["💧","🍞","🎈","👑"], correct:0 },

  { id:"lab_a4", format:"code_sequence", type:"sequenza", ageMin:3, ageMax:4,
    prompt:"Aiuta Pixel a mangiare una mela!\nMetti in ordine:", emoji:"🍎",
    items:["🧺 Prendi la mela","💧 Lavala","😋 Mangiala"], correctOrder:[0,1,2] },

  { id:"lab_a5", format:"code_sequence", type:"sequenza", ageMin:3, ageMax:4,
    prompt:"Come si costruisce una torre?\nMetti in ordine:", emoji:"🧱",
    items:["🟦 Il primo cubo in basso","🟩 Poi il secondo sopra","⭐ La stella in cima"],
    correctOrder:[0,1,2] },

  { id:"lab_a6", format:"visual_tap", type:"coding", ageMin:3, ageMax:4, isBoss:true,
    visual:"🔴🔵🔴🔵", prompt:"🤖 Pixel chiede:\nche colore viene dopo?", emoji:"🤖",
    options:["🔴","🔵","🟡","🟢"], correct:0 },

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
    // Prima: "premi il freno prima di partire" era marcato come bug, ma è la manovra corretta.
    items:["1. Avvia motore 🔑","2. Chiudi gli occhi 🙈","3. Inserisci marcia ⚙️","4. Accelera 🚀"],
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
  { id:"ps06", world:"vulcano", ageMin:5, ageMax:6, size:2,
    question:"Rimetti in ordine il vulcano!",
    emojis:["🌋","🔥","🪨"] },
  // ps07 — Biblioteca 3x3 (5-7)
  { id:"ps07", world:"biblioteca", ageMin:5, ageMax:7, size:2,
    question:"Riordina la biblioteca!",
    emojis:["📚","🔭","🎸"] },
  // ps08 — Laboratorio 3x3 (6-8)
  { id:"ps08", world:"laboratorio", ageMin:7, ageMax:8, size:3,
    question:"Rimetti in ordine il laboratorio di Pixel!",
    emojis:["🤖","🔋","💡","🧪","⚙️","🔧","🖥️","📡"] },
  // ps09 — Foresta 3x3 (6-8)
  { id:"ps09", world:"foresta", ageMin:7, ageMax:8, size:3,
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
