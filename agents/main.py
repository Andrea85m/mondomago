"""CLI interattivo MondoMago Agents — menu rich con selezione agente e prompt libero."""
import asyncio
import importlib
import sys
import os
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich import box

load_dotenv(Path(__file__).parent / ".env")

console = Console()

AGENTS = {
    "1":  ("content-generator",   "content_generator",   "Generatore Contenuti",   "Crea sfide, storie, dialoghi educativi"),
    "2":  ("tts-pipeline",        "tts_pipeline",        "Pipeline TTS",           "Genera file audio MP3 con edge-tts"),
    "3":  ("dev-assistant",       "dev_assistant",       "Assistente Sviluppo",    "Review codice, design feature, architettura"),
    "4":  ("pedagogical-advisor", "pedagogical_advisor", "Consulente Pedagogico",  "Valida contenuti per sviluppo cognitivo 3-8 anni"),
    "5":  ("linguistics",         "linguistics",         "Linguistica Italiana",   "Qualità del linguaggio per bambini"),
    "6":  ("ux-auditor",          "ux_auditor",          "UX Auditor",             "Audit accessibilità e design mobile"),
    "7":  ("game-balance",        "game_balance",        "Game Balance",           "Curva difficoltà, engagement, retention"),
    "8":  ("performance-monitor", "performance_monitor", "Performance Monitor",    "Bundle, PWA score, Core Web Vitals"),
    "9":  ("qa-agent",            "qa_agent",            "QA Agent",               "Test cases, bug finding, regressioni"),
    "10": ("parent-insights",     "parent_insights",     "Parent Insights",        "Report narrativi per genitori"),
    "0":  ("orchestrator",        "orchestrator",        "Orchestratore Completo", "Coordina tutti gli agenti"),
}


def check_api_key() -> bool:
    if not os.getenv("ANTHROPIC_API_KEY"):
        console.print(Panel(
            "[bold red]ANTHROPIC_API_KEY non trovata![/]\n\n"
            "1. Copia [cyan].env.example[/] in [cyan].env[/]\n"
            "2. Inserisci la tua chiave da [link]https://console.anthropic.com/[/link]",
            title="Configurazione richiesta",
            border_style="red",
        ))
        return False
    return True


def print_header() -> None:
    console.print(Panel(
        "[bold magenta]🧙 MondoMago AI Agents[/]\n"
        "[dim]Sistema di 10 agenti specializzati per l'app educativa[/]",
        border_style="magenta",
    ))


def print_agents_table() -> None:
    table = Table(box=box.ROUNDED, border_style="cyan", show_header=True)
    table.add_column("#", style="bold cyan", width=3)
    table.add_column("Agente", style="bold white", width=22)
    table.add_column("Funzione", style="dim white")

    for key, (_, _, name, desc) in AGENTS.items():
        style = "bold yellow" if key == "0" else ""
        table.add_row(key, f"[{style}]{name}[/]" if style else name, desc)

    console.print(table)


async def run_agent(key: str, prompt: str) -> None:
    _, module_name, name, _ = AGENTS[key]

    console.print(f"\n[bold cyan]Avvio:[/] {name}\n")

    if key == "0":
        from orchestrator import run as orch_run
        await orch_run(prompt)
    else:
        module = importlib.import_module(module_name)
        await module.run(prompt)

    console.print("\n[dim]─── Fine output agente ───[/]\n")


async def interactive_loop() -> None:
    print_header()

    if not check_api_key():
        return

    while True:
        print_agents_table()
        console.print("\n[dim]Digita [bold]q[/] per uscire[/]")

        choice = Prompt.ask("\n[bold]Seleziona agente[/]", default="0")

        if choice.lower() in ("q", "quit", "exit"):
            console.print("[bold green]Arrivederci! 🧙[/]")
            break

        if choice not in AGENTS:
            console.print("[red]Scelta non valida.[/]")
            continue

        _, _, name, desc = AGENTS[choice]
        console.print(f"\n[bold]{name}[/] — {desc}")
        console.print("[dim]Lascia vuoto per usare il prompt di default[/]")

        prompt = Prompt.ask("[bold]Prompt[/]", default="")

        if not prompt:
            defaults = {
                "1": "Analizza le sfide nel mondo della foresta e crea 5 nuove sfide multiple_choice per bambini 5-6 anni",
                "2": "Controlla le stringhe TTS mancanti e genera i MP3 mancanti in public/audio/",
                "3": "Fai code review di src/MondoMago.jsx con focus su performance mobile e accessibilità",
                "4": "Valuta l'appropriatezza pedagogica delle sfide per ogni fascia d'età",
                "5": "Analizza la qualità linguistica italiana dei testi di sfida e dialoghi companion",
                "6": "Esegui audit UX completo: touch targets, contrasti, navigazione, feedback visivo",
                "7": "Analizza curva difficoltà, sistema achievement e bilanciamento engagement",
                "8": "Analizza bundle Vite, service worker e suggerisci ottimizzazioni performance",
                "9": "Cerca bug logici nei 7 formati sfida e nel sistema di progressione",
                "10": "Progetta un report settimanale tipo per genitori con dati di esempio",
                "0": "Esegui audit completo usando dev-assistant, ux-auditor e qa-agent. Identifica i 5 problemi più critici.",
            }
            prompt = defaults.get(choice, "Analizza src/MondoMago.jsx e fornisci raccomandazioni")

        console.print()
        try:
            await run_agent(choice, prompt)
        except KeyboardInterrupt:
            console.print("\n[yellow]Interrotto.[/]")
        except Exception as e:
            console.print(f"\n[red]Errore: {e}[/]")

        if not Confirm.ask("\n[bold]Vuoi eseguire un altro agente?[/]", default=True):
            console.print("[bold green]Arrivederci! 🧙[/]")
            break


def cli_main() -> None:
    asyncio.run(interactive_loop())


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Modalità non-interattiva: python main.py <num_agente> [prompt...]
        key = sys.argv[1]
        prompt = " ".join(sys.argv[2:]) if len(sys.argv) > 2 else ""
        if key not in AGENTS:
            console.print(f"[red]Agente '{key}' non trovato. Scegli tra: {', '.join(AGENTS.keys())}[/]")
            sys.exit(1)
        if not check_api_key():
            sys.exit(1)
        asyncio.run(run_agent(key, prompt or "Analizza src/MondoMago.jsx e fornisci raccomandazioni"))
    else:
        cli_main()
