// ─────────────────────────────────────────────────────────────────────────────
// PUZZLE DEGLI ANIMALI — i dati
//
// Ogni animale: una foto vera da ricomporre e il suo verso vero, che si sente a
// puzzle finito, seguito dal nome e da una curiosità detta dalla voce.
// Il formato "ricomponi l'animale → senti il verso" è quello delle app di
// puzzle per bambini più scaricate (Abuzz "Animal Puzzle & Games for Kids",
// 10M+ download su Google Play; CLEVERBIT "Animal Puzzles for Kids", 5M+).
//
// Foto e versi sono solo CC0 o pubblico dominio: autore, licenza e pagina di
// origine di ogni file stanno in public/img/animali/CREDITI.md.
//
// `frase` è quello che dice la voce: gen-tts.py la legge da qui (insieme a
// `nome`), quindi va scritta per intero, senza template.
// Le curiosità sono volutamente semplici e vere per un bambino di 3-8 anni:
// niente numeri a effetto che non si possono verificare.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = import.meta.env.BASE_URL;

const A = ({ id, nome, frase }) => ({
  id, nome, frase,
  foto: `${BASE}img/animali/${id}.webp`,
  mini: `${BASE}img/animali/${id}-mini.webp`,
  verso: `${BASE}audio/versi/${id}.mp3`,
});

export const ANIMALI = [
  A({ id: "leone", nome: "Leone", frase: "Il leone! Il suo ruggito si sente da lontanissimo." }),
  A({ id: "elefante", nome: "Elefante", frase: "L'elefante! Con la proboscide beve, annusa e afferra le cose." }),
  A({ id: "mucca", nome: "Mucca", frase: "La mucca! Mangia tanta erba e ci dà il latte." }),
  A({ id: "cane", nome: "Cane", frase: "Il cane! Sente gli odori molto meglio di noi." }),
  A({ id: "gatto", nome: "Gatto", frase: "Il gatto! Quando è contento fa le fusa." }),
  A({ id: "gallo", nome: "Gallo", frase: "Il gallo! Canta chicchirichì al mattino presto." }),
  A({ id: "cavallo", nome: "Cavallo", frase: "Il cavallo! Riesce a dormire anche stando in piedi." }),
  A({ id: "pecora", nome: "Pecora", frase: "La pecora! Con la sua lana si fanno maglioni caldi." }),
  A({ id: "maiale", nome: "Maiale", frase: "Il maiale! Si rotola nel fango per stare fresco." }),
  A({ id: "rana", nome: "Rana", frase: "La rana! Da piccola è un girino e nuota nell'acqua." }),
  A({ id: "gufo", nome: "Gufo", frase: "Il gufo! Esce di notte e vede bene anche al buio." }),
  A({ id: "anatra", nome: "Anatra", frase: "L'anatra! Le sue zampe palmate sono perfette per nuotare." }),
];
