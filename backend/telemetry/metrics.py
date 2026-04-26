from __future__ import annotations

import time
import uuid
from collections import defaultdict
from contextlib import contextmanager
from dataclasses import dataclass
from threading import Lock
from typing import Iterator


@dataclass
class _Metrics:
    counts: dict[str, int]
    total_latency_ms: dict[str, float]
    lock: Lock


_METRICS = _Metrics(counts=defaultdict(int), total_latency_ms=defaultdict(float), lock=Lock())


def request_context(request_id: str | None = None) -> str:
    return request_id or str(uuid.uuid4())


@contextmanager
def observe_request(path: str, method: str) -> Iterator[float]:
    start = time.perf_counter()
    try:
        yield start
    finally:
        latency_ms = (time.perf_counter() - start) * 1000
        key = f"{method.upper()} {path}"
        with _METRICS.lock:
            _METRICS.counts[key] += 1
            _METRICS.total_latency_ms[key] += latency_ms


def metrics_snapshot() -> dict[str, dict[str, float | int]]:
    with _METRICS.lock:
        out: dict[str, dict[str, float | int]] = {}
        for key, count in _METRICS.counts.items():
            total = _METRICS.total_latency_ms[key]
            out[key] = {"count": count, "avg_latency_ms": round(total / count, 2)}
        return out
