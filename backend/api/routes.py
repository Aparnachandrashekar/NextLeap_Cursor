from __future__ import annotations

from fastapi import APIRouter

from common.api import RECOMMEND_PATH, RecommendRequest, RecommendResponse
from backend.services import RecommendationService
from backend.telemetry import metrics_snapshot
from phase1.locations import list_dataset_locations

router = APIRouter()
service = RecommendationService()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/locations")
def locations() -> dict[str, list[str]]:
    """All distinct localities from the ingested dataset (`listed_in(city)` → Bangalore areas)."""
    return {"locations": list_dataset_locations()}


@router.get("/metrics")
def metrics() -> dict[str, dict[str, float | int]]:
    return metrics_snapshot()


@router.post(RECOMMEND_PATH, response_model=RecommendResponse)
def recommend(request: RecommendRequest) -> RecommendResponse:
    return service.recommend(request)
