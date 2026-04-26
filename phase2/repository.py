from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass

from common.restaurant import Restaurant
from phase2.normalize import RetrievalQuery


@dataclass(frozen=True)
class Candidate:
    restaurant: Restaurant
    score: float
    signals: dict[str, float]


def _build_where_clause(query: RetrievalQuery) -> tuple[str, list[object]]:
    clauses = ["(LOWER(COALESCE(city, '')) LIKE ? OR LOWER(COALESCE(area, '')) LIKE ?)"]
    params: list[object] = [f"%{query.location}%", f"%{query.location}%"]

    if query.min_rating is not None:
        clauses.append("rating IS NOT NULL AND rating >= ?")
        params.append(query.min_rating)
    if query.min_cost is not None:
        clauses.append("cost_for_two IS NOT NULL AND cost_for_two >= ?")
        params.append(query.min_cost)
    if query.max_cost is not None:
        clauses.append("cost_for_two IS NOT NULL AND cost_for_two <= ?")
        params.append(query.max_cost)

    return " AND ".join(clauses), params


def _compute_score(restaurant: Restaurant, query: RetrievalQuery) -> tuple[float, dict[str, float]]:
    rating_signal = (restaurant.rating or 0.0) / 5.0

    cuisine_signal = 0.0
    if query.cuisines:
        restaurant_cuisines = {c.lower() for c in restaurant.cuisines}
        overlap = len(restaurant_cuisines.intersection(set(query.cuisines)))
        cuisine_signal = overlap / len(query.cuisines)

    budget_signal = 0.5
    if query.min_cost is not None or query.max_cost is not None:
        if restaurant.cost_for_two is None:
            budget_signal = 0.0
        else:
            min_ok = query.min_cost is None or restaurant.cost_for_two >= query.min_cost
            max_ok = query.max_cost is None or restaurant.cost_for_two <= query.max_cost
            budget_signal = 1.0 if min_ok and max_ok else 0.0

    # Deterministic weighted score for pre-LLM shortlist.
    score = (0.5 * rating_signal) + (0.35 * cuisine_signal) + (0.15 * budget_signal)
    return score, {
        "rating_signal": round(rating_signal, 4),
        "cuisine_signal": round(cuisine_signal, 4),
        "budget_signal": round(budget_signal, 4),
    }


def fetch_candidates(
    conn: sqlite3.Connection,
    query: RetrievalQuery,
    *,
    candidate_limit: int = 100,
    prefetch_limit: int = 1000,
) -> list[Candidate]:
    where_sql, params = _build_where_clause(query)
    sql = f"""
        SELECT id, name, city, area, cuisines_json, cost_for_two, rating, url, metadata_json
        FROM restaurants
        WHERE {where_sql}
        ORDER BY rating DESC, cost_for_two ASC, name ASC
        LIMIT ?
    """
    rows = conn.execute(sql, [*params, prefetch_limit]).fetchall()

    deduped: dict[tuple[str, str, str], Candidate] = {}
    for row in rows:
        restaurant = Restaurant(
            id=row["id"],
            name=row["name"],
            city=row["city"],
            area=row["area"],
            cuisines=json.loads(row["cuisines_json"] or "[]"),
            cost_for_two=row["cost_for_two"],
            rating=row["rating"],
            url=row["url"],
            metadata=json.loads(row["metadata_json"] or "{}"),
        )
        score, signals = _compute_score(restaurant, query)
        if query.cuisines and signals["cuisine_signal"] <= 0:
            continue
        candidate = Candidate(restaurant=restaurant, score=score, signals=signals)
        key = (
            restaurant.name.strip().lower(),
            (restaurant.city or "").strip().lower(),
            (restaurant.area or "").strip().lower(),
        )
        current = deduped.get(key)
        if current is None or candidate.score > current.score:
            deduped[key] = candidate

    scored = list(deduped.values())
    scored.sort(key=lambda c: (-c.score, -(c.restaurant.rating or 0), c.restaurant.cost_for_two or 10**9, c.restaurant.name.lower()))
    return scored[:candidate_limit]
