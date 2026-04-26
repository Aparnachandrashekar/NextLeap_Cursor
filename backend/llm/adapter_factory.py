from __future__ import annotations

from config.settings import AppSettings
from phase3.adapters import LLMAdapter, get_llm_adapter


def get_ranker_adapter(settings: AppSettings) -> tuple[LLMAdapter, str]:
    """LLM integration boundary for ranking/explanation providers."""
    return get_llm_adapter(settings)
