from __future__ import annotations

import logging
import time
import uuid
from collections import defaultdict
from dataclasses import dataclass
from threading import Lock

from fastapi import Request


logger = logging.getLogger("phase4")


@dataclass
class _MetricStore:
    counters: dict[str, int]
    total_latency_ms: dict[str, float]
    lock: Lock


_store = _MetricStore(counters=defaultdict(int), total_latency_ms=defaultdict(float), lock=Lock())


def record_request(path: str, status_code: int, latency_ms: float) -> None:
    key = f"{path}:{status_code}"
    with _store.lock:
        _store.counters[key] += 1
        _store.total_latency_ms[key] += latency_ms


def metrics_snapshot() -> dict[str, dict[str, float | int]]:
    with _store.lock:
        snapshot: dict[str, dict[str, float | int]] = {}
        for key, count in _store.counters.items():
            total_latency = _store.total_latency_ms[key]
            snapshot[key] = {
                "count": count,
                "avg_latency_ms": round(total_latency / count, 2) if count else 0.0,
            }
        return snapshot


def attach_request_context(request: Request) -> str:
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    request.state.request_id = request_id
    request.state.started_at = time.perf_counter()
    return request_id


def finalize_request_logging(request: Request, status_code: int) -> None:
    started_at = getattr(request.state, "started_at", time.perf_counter())
    request_id = getattr(request.state, "request_id", "unknown")
    latency_ms = (time.perf_counter() - started_at) * 1000
    record_request(str(request.url.path), status_code, latency_ms)
    logger.info(
        "request_complete request_id=%s method=%s path=%s status=%s latency_ms=%.2f",
        request_id,
        request.method,
        request.url.path,
        status_code,
        latency_ms,
    )
