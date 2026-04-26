from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from common.api import RECOMMEND_PATH, RecommendRequest, RecommendResponse
from phase4.observability import (
    attach_request_context,
    finalize_request_logging,
    metrics_snapshot,
)
from phase1.ensure_data import start_background_ingest_if_empty
from phase1.locations import list_dataset_locations
from phase4.service import phase4_recommend


logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")


@asynccontextmanager
async def _lifespan(_: FastAPI):
    # `data/` is not in git: empty DB until HuggingFace ingest (build step or background thread).
    start_background_ingest_if_empty()
    yield


app = FastAPI(
    title="Restaurant Recommender API - Phase 4",
    version="0.4.0",
    lifespan=_lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3002",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    request_id = attach_request_context(request)
    try:
        response = await call_next(request)
    except Exception:
        finalize_request_logging(request, 500)
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal Server Error", "request_id": request_id},
        )
    response.headers["x-request-id"] = request_id
    finalize_request_logging(request, response.status_code)
    return response


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/locations")
def locations() -> dict[str, list[str]]:
    return {"locations": list_dataset_locations()}


@app.get("/metrics")
def metrics() -> dict[str, dict[str, float | int]]:
    return metrics_snapshot()


@app.post(RECOMMEND_PATH, response_model=RecommendResponse)
def recommend(request: RecommendRequest) -> RecommendResponse:
    return phase4_recommend(request)
