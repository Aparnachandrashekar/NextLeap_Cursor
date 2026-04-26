from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from common.api import RECOMMEND_PATH, RecommendRequest, RecommendResponse
from phase3.service import recommend_with_llm


app = FastAPI(title="Restaurant Recommender API - Phase 3", version="0.3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(RECOMMEND_PATH, response_model=RecommendResponse)
def recommend(request: RecommendRequest) -> RecommendResponse:
    return recommend_with_llm(request)
