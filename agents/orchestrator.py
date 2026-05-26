"""Orchestratore principale — coordina tutti gli agenti MondoMago in parallelo o in sequenza."""
import asyncio
import sys
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition
from _shared import PROJECT_ROOT, stream_print, get_result

AGENT_DEFINITIONS: dict[str, AgentDefinition] = {
    "content-generator": AgentDefinition(
        description="Crea nuove sfide, storie e dialoghi educativi per bambini 3-8 anni.",
        prompt="""Sei un esperto creatore di contenuti educativi per bambini italiani 3-8 anni per MondoMago (React+Vite PWA con 7 mondi, 200+ sfide, 7 formati).
Rispetta la struttura JSON esistente in src/MondoMago.jsx. Vocabolario appropriato per età. Tono magico.""",
        tools=["Read", "Write", "Edit", "Glob", "Grep"],
        maxTurns=30,
        model="claude-sonnet-4-5",
    ),
    "tts-pipeline": AgentDefinition(
        description="Genera file audio MP3 TTS con edge-tts (voce Isabella Neural italiana).",
        prompt="""Gestisci la pipeline TTS di MondoMago. Usa edge-tts it-IT-IsabellaNeural.
Script: scripts/gen-tts.py. MP3 in public/audio/tts_HASH.mp3. Manifest: src/ttsMap.json.""",
        tools=["Read", "Write", "Bash", "Glob", "Grep"],
        maxTurns=30,
        model="claude-haiku-4-5-20251001",
    ),
    "dev-assistant": AgentDefinition(
        description="Review codice React/Vite, design feature, architettura PWA mobile-first.",
        prompt="""Senior developer React 18 + Vite + PWA. Conosci MondoMago (single-file JSX, mobile-first, safe-area, 100dvh, TTS audio pool).
Best practice: touch targets 44px+, bundle < 500KB gzip, aria-label, Android back button.""",
        tools=["Read", "Write", "Edit", "Glob", "Grep", "Bash"],
        maxTurns=25,
        model="claude-sonnet-4-5",
    ),
    "pedagogical-advisor": AgentDefinition(
        description="Valida l'appropriatezza educativa dei contenuti secondo Piaget, Montessori, UDL.",
        prompt="""Esperto pedagogia infantile. Applica Piaget, Montessori, ZPD Vygotsky, UDL.
Fascia 3-4 anni: forme/colori/sequenze 2-3 step. 5-6: conteggio/lettere. 7-8: addizioni/lettura.""",
        tools=["Read", "Glob", "Grep"],
        maxTurns=15,
        model="claude-haiku-4-5-20251001",
    ),
    "linguistics": AgentDefinition(
        description="Analizza qualità linguistica italiana: leggibilità, frequenza lessicale, registro.",
        prompt="""Linguista italiano per l'infanzia. Applica indice Gulpease, lista LIF, struttura SVO.
Personalità companion: Fiamma (entusiasta), Luna (poetica), Onde (ritmico), Foglia (narrativa).""",
        tools=["Read", "Write", "Edit", "Glob", "Grep"],
        maxTurns=20,
        model="claude-haiku-4-5-20251001",
    ),
    "ux-auditor": AgentDefinition(
        description="Audit UX/accessibilità per bambini: touch targets, contrasti, WCAG 2.2 AA.",
        prompt="""UX designer esperto app bambini. WCAG 2.2 AA, Nielsen Norman, CCI, Material Design 3.
Touch targets 64-96px per bambini, feedback entro 100ms, max 3 tap per ogni contenuto.""",
        tools=["Read", "Glob", "Grep"],
        maxTurns=15,
        model="claude-sonnet-4-5",
    ),
    "game-balance": AgentDefinition(
        description="Analizza curva difficoltà, engagement, retention e sistema gamification.",
        prompt="""Game designer educational. Flow Theory, Octalysis, progression loop.
MondoMago: 8 livelli, 10 achievement, streak, boss HP bar, mystery box, Sfida Fulmine.""",
        tools=["Read", "Glob", "Grep"],
        maxTurns=15,
        model="claude-sonnet-4-5",
    ),
    "performance-monitor": AgentDefinition(
        description="Analizza bundle Vite, PWA score, Core Web Vitals, service worker.",
        prompt="""Performance expert PWA. Target: FCP<1.8s, LCP<2.5s, TBT<200ms, CLS<0.1, PWA 100/100.
Bundle attuale: 401KB/113KB gzip. SW v3 cache separata core/audio. 319 MP3.""",
        tools=["Bash", "Read", "Glob", "Grep"],
        maxTurns=15,
        model="claude-sonnet-4-5",
    ),
    "qa-agent": AgentDefinition(
        description="Trova bug logici, genera test cases, verifica 7 formati sfida.",
        prompt="""QA engineer React + PWA. Verifica isCorrect per tutti i formati (visual_tap, MC, story, seq, drag, rhyme, word).
Testa audio iOS, back button Android, multi-profilo, offline mode.""",
        tools=["Read", "Write", "Glob", "Grep", "Bash"],
        maxTurns=20,
        model="claude-sonnet-4-5",
    ),
    "parent-insights": AgentDefinition(
        description="Genera report narrativi per genitori: progressi, aree forti/deboli, suggerimenti.",
        prompt="""Analista dati educativi. Report genitori: positivo, semplice, actionable.
Struttura localStorage MondoMago: profili, sessioni, streak, XP, achievement.""",
        tools=["Read", "Glob", "Grep", "Write"],
        maxTurns=15,
        model="claude-haiku-4-5-20251001",
    ),
}

ORCHESTRATOR_PROMPT = """Sei il coordinatore principale del sistema di agenti MondoMago.
Hai accesso a 10 agenti specializzati tramite il tool Agent:

- content-generator: crea contenuti educativi
- tts-pipeline: genera audio MP3
- dev-assistant: review e feature design
- pedagogical-advisor: validazione pedagogica
- linguistics: qualità linguistica italiana
- ux-auditor: audit UX/accessibilità
- game-balance: bilanciamento difficoltà
- performance-monitor: performance PWA
- qa-agent: testing e bug finding
- parent-insights: report genitori

Quando ricevi una richiesta:
1. Determina quali agenti sono rilevanti
2. Eseguili nell'ordine logico (prima analisi, poi sintesi)
3. Integra i risultati in un report coerente
4. Evidenzia priorità di azione con etichette [CRITICO], [IMPORTANTE], [SUGGERITO]
"""


async def run(prompt: str, agents: list[str] | None = None, accept_edits: bool = False) -> str:
    """Esegue l'orchestratore con tutti gli agenti o un sottoinsieme."""
    permission = "acceptEdits" if accept_edits else "plan"
    active_agents = {k: v for k, v in AGENT_DEFINITIONS.items() if agents is None or k in agents}
    result = ""

    async for msg in query(
        prompt=prompt,
        options=ClaudeAgentOptions(
            system_prompt=ORCHESTRATOR_PROMPT,
            allowed_tools=["Read", "Glob", "Grep", "Agent"],
            permission_mode=permission,
            cwd=PROJECT_ROOT,
            agents=active_agents,
        ),
    ):
        stream_print(msg)
        result = get_result(msg) or result

    return result


async def full_audit() -> str:
    """Esegue un audit completo di MondoMago con tutti gli agenti."""
    return await run(
        "Esegui un audit completo di MondoMago usando tutti gli agenti disponibili. "
        "Analizza contenuti, qualità linguistica, UX, performance, bilanciamento e bug. "
        "Produci un report executive con priorità di azione.",
    )


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--full-audit":
        asyncio.run(full_audit())
    else:
        prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else (
            "Usa dev-assistant e qa-agent per analizzare src/MondoMago.jsx "
            "e identificare i 3 problemi più critici da risolvere."
        )
        asyncio.run(run(prompt))
