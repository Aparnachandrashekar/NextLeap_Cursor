from __future__ import annotations

from common.restaurant import Restaurant
from phase3.types import LLMRankedItem, LLMRankingOutput


def _fallback_explanation(restaurant: Restaurant) -> str:
    return (
        f"Recommended from the filtered candidate set based on available attributes "
        f"(rating: {restaurant.rating if restaurant.rating is not None else 'unknown'}, "
        f"cost_for_two: {restaurant.cost_for_two if restaurant.cost_for_two is not None else 'unknown'})."
    )


def post_validate_and_repair(
    *,
    output: LLMRankingOutput,
    candidates: list[Restaurant],
    top_k: int,
) -> tuple[LLMRankingOutput, list[str]]:
    """
    Guardrails:
    - Keep only candidate ids.
    - Remove duplicates.
    - Backfill missing rows from original candidate order.
    """
    warnings: list[str] = []
    by_id = {r.id: r for r in candidates}
    seen: set[str] = set()
    repaired: list[LLMRankedItem] = []

    for item in output.ranked_items:
        if item.restaurant_id not in by_id:
            warnings.append(f"Dropped non-candidate id from LLM output: {item.restaurant_id}")
            continue
        if item.restaurant_id in seen:
            continue
        seen.add(item.restaurant_id)
        repaired.append(item)
        if len(repaired) >= top_k:
            break

    if len(repaired) < min(top_k, len(candidates)):
        warnings.append("LLM output incomplete; backfilled using retrieval order.")
        for c in candidates:
            if c.id in seen:
                continue
            seen.add(c.id)
            repaired.append(
                LLMRankedItem(
                    restaurant_id=c.id,
                    explanation=_fallback_explanation(c),
                )
            )
            if len(repaired) >= top_k:
                break

    return LLMRankingOutput(ranked_items=repaired, summary=output.summary), warnings
