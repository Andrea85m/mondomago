#!/usr/bin/env node
// Stampa in JSON tutte le domande che i generatori di esercizi possono fare.
// La usa gen-tts.py per registrarle tutte in anticipo.
import { engine } from './lib/extract-challenges.mjs';
console.log(JSON.stringify(engine.frasiGenerate()));
