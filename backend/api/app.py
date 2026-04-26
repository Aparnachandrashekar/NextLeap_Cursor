from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.api.routes import router
from backend.telemetry import observe_request, request_context

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
logger = logging.getLogger("backend")

app = FastAPI(title="Restaurant Recommender Backend", version="0.6.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def telemetry_middleware(request: Request, call_next):  # type: ignore[no-untyped-def]
    rid = request_context(request.headers.get("x-request-id"))
    with observe_request(str(request.url.path), request.method):
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("request_failed request_id=%s path=%s", rid, request.url.path)
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error", "request_id": rid},
            )
    response.headers["x-request-id"] = rid
    return response


app.include_router(router)
