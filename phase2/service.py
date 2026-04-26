from __future__ import annotations

from dataclasses import replace

from common.restaurant import Restaurant
from common.user_preference import UserPreference
from config.settings import get_settings
from phase1.storage import connect_sqlite
from phase2.normalize import RetrievalQuery, normalize_preferences
from phase2.repository import fetch_candidates


def _run_query(query: RetrievalQuery, *, limit: int) -> list[Restaurant]:
    settings = get_settings()
    conn = connect_sqlite(settings.sqlite_db_path)
    try:
        candidates = fetch_candidates(conn, query, candidate_limit=limit)
        return [c.restaurant for c in candidates]
    finally:
        conn.close()


def get_candidates(preferences: UserPreference, *, limit: int = 100) -> tuple[list[Restaurant], list[str]]:
    """
    Deterministic candidate retrieval for Phase 2.
    Returns restaurants and warning notes describing any applied relaxations.
    """
    warnings: list[str] = []
    query = normalize_preferences(preferences)

    candidates = _run_query(query, limit=limit)
    if candidates:
        return candidates, warnings

    # Fallback 1: relax budget bounds.
    relaxed = replace(query, min_cost=None, max_cost=None)
    candidates = _run_query(relaxed, limit=limit)
    if candidates:
        warnings.append("No exact budget match; widened budget range.")
        return candidates, warnings

    # Fallback 2: relax rating.
    relaxed = replace(relaxed, min_rating=None)
    candidates = _run_query(relaxed, limit=limit)
    if candidates:
        warnings.append("No exact budget/rating match; minimum rating relaxed.")
        return candidates, warnings

    # Fallback 3: relax cuisine.
    relaxed = replace(relaxed, cuisines=[])
    candidates = _run_query(relaxed, limit=limit)
    if candidates:
        warnings.append("No cuisine-specific match in location; showing best available options.")
        return candidates, warnings

    return [], ["No restaurants found for the selected location."]
