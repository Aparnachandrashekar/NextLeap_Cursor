from __future__ import annotations

from dataclasses import dataclass

from common.user_preference import BudgetBucket, UserPreference


@dataclass(frozen=True)
class RetrievalQuery:
    location: str
    cuisines: list[str]
    min_rating: float | None
    min_cost: int | None
    max_cost: int | None
    extras: str | None


def _budget_to_range(budget: BudgetBucket | None) -> tuple[int | None, int | None]:
    if budget == BudgetBucket.low:
        return 0, 500
    if budget == BudgetBucket.medium:
        return 501, 1500
    if budget == BudgetBucket.high:
        return 1501, None
    return None, None


def normalize_preferences(preferences: UserPreference) -> RetrievalQuery:
    budget_min, budget_max = _budget_to_range(preferences.budget)

    min_cost = preferences.min_cost if preferences.min_cost is not None else budget_min
    max_cost = preferences.max_cost if preferences.max_cost is not None else budget_max

    cuisines = []
    seen: set[str] = set()
    for cuisine in preferences.cuisines:
        key = cuisine.strip().lower()
        if key and key not in seen:
            seen.add(key)
            cuisines.append(key)

    return RetrievalQuery(
        location=preferences.location.strip().lower(),
        cuisines=cuisines,
        min_rating=preferences.min_rating,
        min_cost=min_cost,
        max_cost=max_cost,
        extras=preferences.extras,
    )
