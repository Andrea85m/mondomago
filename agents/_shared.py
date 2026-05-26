"""Utilities condivise tra tutti gli agenti MondoMago."""
import os
from pathlib import Path
from claude_agent_sdk import AssistantMessage, ResultMessage, TextBlock

PROJECT_ROOT = str(Path(__file__).parent.parent)

# Rimuovi ANTHROPIC_API_KEY dall'ambiente corrente: il subprocess `claude` usa
# le credenziali claude.ai già configurate invece della chiave di sessione.
os.environ.pop("ANTHROPIC_API_KEY", None)


def stream_print(message: object) -> None:
    """Stampa il testo in streaming da un messaggio assistente."""
    if isinstance(message, AssistantMessage):
        for block in message.content:
            if isinstance(block, TextBlock):
                print(block.text, end="", flush=True)


def get_result(message: object) -> str | None:
    """Estrae il risultato finale da un ResultMessage; solleva RuntimeError su is_error."""
    if isinstance(message, ResultMessage):
        if message.is_error:
            errors = message.errors or []
            raise RuntimeError(f"Agent error: {'; '.join(errors) or message.result or 'unknown error'}")
        return message.result
    return None
