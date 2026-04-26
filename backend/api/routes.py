from __future__ import annotations

from fastapi import APIRouter

from common.api import RECOMMEND_PATH, RecommendRequest, RecommendResponse
from backend.services import RecommendationService
from backend.telemetry import metrics_snapshot

router = APIRouter()
service = RecommendationService()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/metrics")
def metrics() -> dict[str, dict[str, float | int]]:
    return metrics_snapshot()


@router.post(RECOMMEND_PATH, response_model=RecommendResponse)
def recommend(request: RecommendRequest) -> RecommendResponse:
    return service.recommend(request)
