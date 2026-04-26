from __future__ import annotations

import argparse

from common.api import RecommendRequest
from common.user_preference import BudgetBucket, UserPreference
from phase3.service import recommend_with_llm


def main() -> None:
    parser = argparse.ArgumentParser(description="Phase 3: LLM-style grounded ranking.")
    parser.add_argument("--location", required=True)
    parser.add_argument("--budget", choices=["low", "medium", "high"], default=None)
    parser.add_argument("--cuisine", action="append", default=[])
    parser.add_argument("--min-rating", type=float, default=None)
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    preference = UserPreference(
        location=args.location,
        budget=BudgetBucket(args.budget) if args.budget else None,
        cuisines=args.cuisine,
        min_rating=args.min_rating,
    )
    request = RecommendRequest(preferences=preference, top_k=args.top_k)
    response = recommend_with_llm(request)

    print(f"recommendations={len(response.recommendations)}")
    if response.summary:
        print(f"summary: {response.summary}")
    for warning in response.warnings:
        print(f"warning: {warning}")
    for idx, item in enumerate(response.recommendations, start=1):
        print(
            f"{idx}. [{item.restaurant_id}] {item.name} | cuisine={item.cuisine} | "
            f"rating={item.rating or '-'} | cost={item.estimated_cost or '-'}"
        )


if __name__ == "__main__":
    main()
