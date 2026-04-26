from __future__ import annotations

import logging
import os
import threading

from config.settings import get_settings
from phase1.storage import connect_sqlite

_log = logging.getLogger(__name__)

_ingest_lock = threading.Lock()
_ingest_started = False


def _restaurant_row_count() -> int:
    settings = get_settings()
    conn = connect_sqlite(settings.sqlite_db_path)
    try:
        row = conn.execute("SELECT COUNT(*) AS n FROM restaurants").fetchone()
        return int(row[0] if row else 0)
    except Exception:  # noqa: BLE001 — startup path; be resilient
        return 0
    finally:
        conn.close()


def _ingest_to_sqlite_blocking() -> None:
    if _restaurant_row_count() > 0:
        return
    from phase1.ingest import ingest_to_sqlite  # local import: datasets/ heavy deps

    s = get_settings()
    # Match `python -m phase1.ingest` so caches land under a writable project path.
    os.environ.setdefault("HF_HOME", s.hf_home)
    os.environ.setdefault("HF_HUB_CACHE", os.path.join(s.hf_home, "hub"))
    os.environ.setdefault("HF_DATASETS_CACHE", os.path.join(s.hf_home, "datasets"))
    limit: int | None = None
    raw = (os.getenv("RR_DEPLOY_INGEST_LIMIT") or os.getenv("RR_STREAMLIT_INGEST_LIMIT") or "").strip()
    if raw:
        try:
            limit = int(raw)
        except ValueError:
            _log.warning("ignoring invalid RR_DEPLOY_INGEST_LIMIT / RR_STREAMLIT_INGEST_LIMIT: %r", raw)
    _log.info(
        "ingesting_huggingface_dataset name=%s split=%s limit=%s",
        s.hf_dataset_name,
        s.hf_dataset_split,
        limit,
    )
    ingest_to_sqlite(
        dataset_name=s.hf_dataset_name,
        split=s.hf_dataset_split,
        db_path=s.sqlite_db_path,
        limit=limit,
    )
    get_settings.cache_clear()


def _background_ingest_worker() -> None:
    try:
        _ingest_to_sqlite_blocking()
    except Exception:  # noqa: BLE001 — log and continue; empty DB is better than a crash loop
        _log.exception("background_ingest_failed (retry after fixing HF/network; or set Render build to run python -m phase1.ingest)")


def start_background_ingest_if_empty() -> None:
    """
    Streamlit auto-ingests on first load; the FastAPI server had no data until
    a DB exists. `data/` is not in git, so production deploys start with an
    empty SQLite file. Call this once on API startup: if the DB is empty, load
    the Hugging Face dataset in a daemon thread (non-blocking for /health).
    Prefer baking `data/restaurants.db` during the Render *build* so /locations
    is full on first request.
    """
    global _ingest_started
    with _ingest_lock:
        if _ingest_started or _restaurant_row_count() > 0:
            return
        _ingest_started = True
    t = threading.Thread(target=_background_ingest_worker, name="hf_ingest", daemon=True)
    t.start()
    _log.warning(
        "api_startup: sqlite had no rows; background ingest started — /locations will fill after HF load completes. "
        "For instant lists, set Render buildCommand to `pip install -r requirements.txt` then `python -m phase1.ingest`."
    )
