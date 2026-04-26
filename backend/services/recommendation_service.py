from __future__ import annotations

from common.api import RecommendRequest, RecommendationItem, RecommendResponse
from config.settings import get_settings
from phase3.guardrails import post_validate_and_repair
from phase3.prompt import build_ranking_prompt
from phase3.types import LLMRankingOutput

from backend.llm import get_ranker_adapter
from backend.repositories import RestaurantRepository


class RecommendationService:
    """Application layer for end-to-end recommendation orchestration."""

    def __init__(self, repository: RestaurantRepository | None = None) -> None:
        self._repository = repository or RestaurantRepository()

    def recommend(self, request: RecommendRequest) -> RecommendResponse:
        settings = get_settings()
        candidate_pool_size = min(100, max(request.top_k * 5, request.top_k))
        candidates, retrieval_warnings = self._repository.get_candidates(
            request.preferences, limit=candidate_pool_size
        )

        if not candidates:
            return RecommendResponse(
                recommendations=[],
                summary=None,
                warnings=retrieval_warnings,
                meta={"phase": "phase6", "mode": "no_candidates"},
            )

        prompt = build_ranking_prompt(
            preferences=request.preferences,
            candidates=candidates,
            top_k=request.top_k,
        )
        adapter, adapter_mode = get_ranker_adapter(settings)

        try:
            raw_output = adapter.rank(
                prompt=prompt,
                preferences=request.preferences,
                candidates=candidates,
                top_k=request.top_k,
            )
        except Exception as exc:
            raw_output = LLMRankingOutput(
                ranked_items=[],
                summary="LLM ranking unavailable; returned retrieval-grounded fallback.",
            )
            retrieval_warnings.append(f"LLM adapter error: {type(exc).__name__}")

        repaired_output, guardrail_warnings = post_validate_and_repair(
            output=raw_output,
            candidates=candidates,
            top_k=request.top_k,
        )
        by_id = {r.id: r for r in candidates}

        recommendations: list[RecommendationItem] = []
        for item in repaired_output.ranked_items:
            restaurant = by_id[item.restaurant_id]
            recommendations.append(
                RecommendationItem(
                    restaurant_id=restaurant.id,
                    name=restaurant.name,
                    cuisine=", ".join(restaurant.cuisines[:3]) if restaurant.cuisines else "N/A",
                    rating=restaurant.rating,
                    estimated_cost=restaurant.cost_for_two,
                    explanation=item.explanation,
                )
            )

        return RecommendResponse(
            recommendations=recommendations,
            summary=repaired_output.summary,
            warnings=[*retrieval_warnings, *guardrail_warnings],
            meta={
                "phase": "phase6",
                "mode": "backend_hardened",
                "adapter_mode": adapter_mode,
                "llm_provider": settings.llm_provider,
                "llm_model": settings.groq_model
                if settings.llm_provider.lower() == "groq"
                else settings.llm_model,
                "candidate_pool_size": len(candidates),
            },
        )
