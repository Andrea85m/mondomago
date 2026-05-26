# MondoMago AI Agents

Sistema di 10 agenti AI specializzati per sviluppare e migliorare l'app educativa MondoMago.

## Prerequisiti

- [Claude Code CLI](https://claude.ai/code) installato e autenticato
- Python 3.11+
- [uv](https://docs.astral.sh/uv/) (installato automaticamente se assente: `curl -LsSf https://astral.sh/uv/install.sh | sh`)

## Setup

```bash
cd agents/

# 1. Copia il file env e inserisci la tua chiave API
cp .env.example .env
# Modifica .env → ANTHROPIC_API_KEY=sk-ant-...

# 2. Installa le dipendenze
uv sync --no-install-project
```

Ottieni la chiave API su https://console.anthropic.com/

## Avvio

### Menu interattivo (consigliato)

```bash
uv run python main.py
```

### Agente specifico con prompt

```bash
uv run python main.py <numero> ["prompt opzionale"]

# Esempi:
uv run python main.py 1   # Content Generator (prompt default)
uv run python main.py 3 "progetta le transizioni tra schermate"
uv run python main.py 6 "verifica touch targets e contrasti"
```

### Audit completo (tutti gli agenti)

```bash
uv run python orchestrator.py --full-audit
```

### Agente standalone

```bash
uv run python dev_assistant.py "analizza performance di MondoMago.jsx"
uv run python tts_pipeline.py  # genera MP3 mancanti
```

## Agenti disponibili

| # | Agente | Funzione |
|---|--------|----------|
| 1 | Content Generator | Crea sfide, storie, dialoghi |
| 2 | TTS Pipeline | Genera MP3 con edge-tts (Isabella Neural) |
| 3 | Dev Assistant | Review codice, feature design |
| 4 | Pedagogical Advisor | Valida contenuti (Piaget, Montessori) |
| 5 | Linguistics | Qualità italiano per bambini |
| 6 | UX Auditor | Audit accessibilità WCAG 2.2 AA |
| 7 | Game Balance | Curva difficoltà, engagement |
| 8 | Performance Monitor | Bundle, PWA score, Core Web Vitals |
| 9 | QA Agent | Bug finding, test cases |
| 10 | Parent Insights | Report narrativi per genitori |
| 0 | Orchestratore | Coordina tutti gli agenti |

## Note

- Gli agenti operano sul progetto in `../` (root MondoMago)
- Per default gli agenti usano `permission_mode="plan"` (non modificano file)
- Il TTS Pipeline usa `acceptEdits` di default (genera MP3 senza conferma)
- Passa `accept_edits=True` alle funzioni `run()` per abilitare modifiche automatiche
