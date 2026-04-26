from __future__ import annotations

from common.api import RecommendationItem


def to_card(item: RecommendationItem) -> dict[str, str | float | int | None]:
    return {
        "restaurant_name": item.name,
        "cuisine": item.cuisine,
        "rating": item.rating,
        "estimated_cost": item.estimated_cost,
        "explanation": item.explanation,
    }
