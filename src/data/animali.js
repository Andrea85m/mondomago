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

import { emoji3dHd } from "./grafica3d.js";

const BASE = import.meta.env.BASE_URL;

// `cartone`: l'animale in 3D cartoon, trasparente, da tagliare in pezzi sagomati.
// `foto`: l'animale vero, che compare a puzzle finito insieme al suo verso.
const A = ({ id, nome, emoji, frase }) => ({
  id, nome, emoji, frase,
  cartone: emoji3dHd(emoji),
  foto: `${BASE}img/animali/${id}.webp`,
  mini: `${BASE}img/animali/${id}-mini.webp`,
  verso: `${BASE}audio/versi/${id}.mp3`,
});

// Gallo, pecora e maiale tornano quando avranno un cartoon all'altezza: foto e
// versi sono già pronti in public/ (vedi CREDITI.md).
export const ANIMALI = [
  A({ id: "leone", nome: "Leone", emoji: "🦁", frase: "Il leone! Il suo ruggito si sente da lontanissimo." }),
  A({ id: "elefante", nome: "Elefante", emoji: "🐘", frase: "L'elefante! Con la proboscide beve, annusa e afferra le cose." }),
  A({ id: "mucca", nome: "Mucca", emoji: "🐮", frase: "La mucca! Mangia tanta erba e ci dà il latte." }),
  A({ id: "cane", nome: "Cane", emoji: "🐕", frase: "Il cane! Sente gli odori molto meglio di noi." }),
  A({ id: "gatto", nome: "Gatto", emoji: "🐱", frase: "Il gatto! Quando è contento fa le fusa." }),
  A({ id: "gallina", nome: "Gallina", emoji: "🐔", frase: "La gallina! Fa le uova e dice coccodè." }),
  A({ id: "cavallo", nome: "Cavallo", emoji: "🐴", frase: "Il cavallo! Riesce a dormire anche stando in piedi." }),
  A({ id: "lupo", nome: "Lupo", emoji: "🐺", frase: "Il lupo! Ulula per chiamare gli altri lupi del suo branco." }),
  A({ id: "orso", nome: "Orso", emoji: "🐻", frase: "L'orso! D'inverno dorme a lungo nella sua tana." }),
  A({ id: "rana", nome: "Rana", emoji: "🐸", frase: "La rana! Da piccola è un girino e nuota nell'acqua." }),
  A({ id: "gufo", nome: "Gufo", emoji: "🦉", frase: "Il gufo! Esce di notte e vede bene anche al buio." }),
  A({ id: "anatra", nome: "Anatra", emoji: "🦆", frase: "L'anatra! Le sue zampe palmate sono perfette per nuotare." }),
];
