from __future__ import annotations

from common.api import RecommendRequest, RecommendationItem, RecommendResponse
from config.settings import get_settings
from phase2.service import get_candidates
from phase3.adapters import get_llm_adapter
from phase3.guardrails import post_validate_and_repair
from phase3.prompt import build_ranking_prompt
from phase3.types import LLMRankingOutput


def recommend_with_llm(request: RecommendRequest) -> RecommendResponse:
    """
    Phase 3 ranking service:
    1) Pull deterministic candidates from Phase 2
    2) Build grounded prompt
    3) Rank/explain via adapter
    4) Post-validate ids and repair output when needed
    """
    candidate_pool_size = min(100, max(request.top_k * 5, request.top_k))
    candidates, retrieval_warnings = get_candidates(request.preferences, limit=candidate_pool_size)

    if not candidates:
        return RecommendResponse(
            recommendations=[],
            summary=None,
            warnings=retrieval_warnings,
            meta={"phase": "phase3", "mode": "no_candidates"},
        )

    prompt = build_ranking_prompt(
        preferences=request.preferences,
        candidates=candidates,
        top_k=request.top_k,
    )

    settings = get_settings()
    adapter, adapter_mode = get_llm_adapter(settings)
    try:
        raw_output: LLMRankingOutput = adapter.rank(
            prompt=prompt,
            preferences=request.preferences,
            candidates=candidates,
            top_k=request.top_k,
        )
    except Exception as exc:
        # Never fail closed on LLM issues; use safe deterministic fallback.
        fallback_output = LLMRankingOutput(
            ranked_items=[],
            summary="LLM ranking unavailable; returned retrieval-grounded fallback.",
        )
        repaired_output, guardrail_warnings = post_validate_and_repair(
            output=fallback_output,
            candidates=candidates,
            top_k=request.top_k,
        )
        guardrail_warnings.append(f"LLM adapter error: {type(exc).__name__}")
        by_id = {c.id: c for c in candidates}
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
                "phase": "phase3",
                "mode": "llm_fallback",
                "adapter_mode": adapter_mode,
                "candidate_pool_size": len(candidates),
            },
        )

    repaired_output, guardrail_warnings = post_validate_and_repair(
        output=raw_output,
        candidates=candidates,
        top_k=request.top_k,
    )

    by_id = {c.id: c for c in candidates}
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
            "phase": "phase3",
            "mode": "llm_ranking",
            "adapter_mode": adapter_mode,
            "llm_provider": settings.llm_provider,
            "llm_model": settings.llm_model,
            "candidate_pool_size": len(candidates),
        },
    )
