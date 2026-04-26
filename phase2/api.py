from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from common.api import (
    RECOMMEND_PATH,
    RecommendRequest,
    RecommendationItem,
    RecommendResponse,
)
from phase2.service import get_candidates


app = FastAPI(title="Restaurant Recommender API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _build_explanation(item: RecommendationItem) -> str:
    parts: list[str] = []
    if item.rating is not None:
        parts.append(f"rated {item.rating:.1f}/5")
    if item.estimated_cost is not None:
        parts.append(f"approx cost for two is {item.estimated_cost}")
    if item.cuisine:
        parts.append(f"matches your cuisine preference ({item.cuisine})")
    if not parts:
        return "This option is included based on your selected location and available restaurant data."
    return "This option is recommended because it is " + ", ".join(parts) + "."


def build_recommend_response(request: RecommendRequest) -> RecommendResponse:
    candidates, warnings = get_candidates(request.preferences, limit=request.top_k)
    recommendations: list[RecommendationItem] = []

    for restaurant in candidates:
        cuisine = ", ".join(restaurant.cuisines[:3]) if restaurant.cuisines else "N/A"
        item = RecommendationItem(
            restaurant_id=restaurant.id,
            name=restaurant.name,
            cuisine=cuisine,
            rating=restaurant.rating,
            estimated_cost=restaurant.cost_for_two,
            explanation="Candidate selected from structured retrieval.",
        )
        item = item.model_copy(update={"explanation": _build_explanation(item)})
        recommendations.append(item)

    summary = None
    if recommendations:
        summary = f"Found {len(recommendations)} restaurants for location '{request.preferences.location}'."

    return RecommendResponse(
        recommendations=recommendations,
        summary=summary,
        warnings=warnings,
        meta={"phase": "phase2", "mode": "retrieval_only"},
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(RECOMMEND_PATH, response_model=RecommendResponse)
def recommend(request: RecommendRequest) -> RecommendResponse:
    return build_recommend_response(request)
