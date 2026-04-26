from __future__ import annotations

from common.restaurant import Restaurant
from common.user_preference import UserPreference


def build_ranking_prompt(*, preferences: UserPreference, candidates: list[Restaurant], top_k: int) -> str:
    """
    Build a compact, grounded prompt:
    - includes only retrieved candidates
    - requires id-only references
    - asks for machine-parseable JSON
    """
    lines = [
        "You are ranking restaurants for a user.",
        "Use ONLY candidate ids listed below. Do not invent any restaurant.",
        f"Return exactly {top_k} or fewer ranked items if candidates are fewer.",
        "Output JSON object with keys: ranked_items (list), summary (string).",
        "Each ranked_items entry must contain: restaurant_id, explanation.",
        "",
        "User Preferences:",
        f"- location: {preferences.location}",
        f"- budget: {preferences.budget or 'not specified'}",
        f"- min_cost: {preferences.min_cost if preferences.min_cost is not None else 'not specified'}",
        f"- max_cost: {preferences.max_cost if preferences.max_cost is not None else 'not specified'}",
        f"- cuisines: {', '.join(preferences.cuisines) if preferences.cuisines else 'any'}",
        f"- min_rating: {preferences.min_rating if preferences.min_rating is not None else 'not specified'}",
        f"- extras: {preferences.extras or 'none'}",
        "",
        "Candidates:",
    ]
    for c in candidates:
        lines.append(
            f"- id={c.id} | name={c.name} | city={c.city or '-'} | area={c.area or '-'} "
            f"| cuisines={', '.join(c.cuisines) if c.cuisines else '-'} "
            f"| rating={c.rating if c.rating is not None else '-'} "
            f"| cost_for_two={c.cost_for_two if c.cost_for_two is not None else '-'}"
        )
    lines.extend(
        [
            "",
            "Important rules:",
            "1) Use only provided ids.",
            "2) Prefer better rating and stronger cuisine/budget/location fit.",
            "3) Keep explanations concise and factual based on provided fields.",
        ]
    )
    return "\n".join(lines)
