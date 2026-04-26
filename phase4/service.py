from __future__ import annotations

from common.api import RecommendRequest, RecommendResponse
from config.settings import get_settings
from phase3.service import recommend_with_llm
from phase4.formatters import to_card


def phase4_recommend(request: RecommendRequest) -> RecommendResponse:
    """
    Phase 4 wrapper:
    - Uses Phase 3 ranking pipeline
    - Enriches response meta for productization and observability
    - Emits card-format preview for UI compatibility
    """
    response = recommend_with_llm(request)
    settings = get_settings()

    response.meta = {
        **response.meta,
        "phase": "phase4",
        "llm_provider": settings.llm_provider,
        "llm_model": settings.groq_model if settings.llm_provider.lower() == "groq" else settings.llm_model,
        "card_preview": [to_card(item) for item in response.recommendations[:3]],
    }
    return response
