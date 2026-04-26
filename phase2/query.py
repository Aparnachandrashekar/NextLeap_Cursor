from __future__ import annotations

import argparse

from common.user_preference import BudgetBucket, UserPreference
from phase2.service import get_candidates


def main() -> None:
    parser = argparse.ArgumentParser(description="Phase 2: retrieve candidate restaurants.")
    parser.add_argument("--location", required=True)
    parser.add_argument("--budget", choices=["low", "medium", "high"], default=None)
    parser.add_argument("--cuisine", action="append", default=[])
    parser.add_argument("--min-rating", type=float, default=None)
    parser.add_argument("--min-cost", type=int, default=None)
    parser.add_argument("--max-cost", type=int, default=None)
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()

    budget = BudgetBucket(args.budget) if args.budget else None
    preference = UserPreference(
        location=args.location,
        budget=budget,
        cuisines=args.cuisine,
        min_rating=args.min_rating,
        min_cost=args.min_cost,
        max_cost=args.max_cost,
    )

    candidates, warnings = get_candidates(preference, limit=args.limit)
    print(f"candidates={len(candidates)}")
    for warning in warnings:
        print(f"warning: {warning}")

    for idx, item in enumerate(candidates[:10], start=1):
        print(
            f"{idx}. {item.name} | city={item.city or '-'} | cuisines={', '.join(item.cuisines[:3]) or '-'} "
            f"| rating={item.rating or '-'} | cost_for_two={item.cost_for_two or '-'}"
        )


if __name__ == "__main__":
    main()
