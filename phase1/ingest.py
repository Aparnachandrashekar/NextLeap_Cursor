from __future__ import annotations

import argparse
import os
from collections.abc import Iterable
from typing import Any

from config.settings import get_settings
from phase1.normalize import normalize_restaurant_row
from phase1.storage import clear_restaurants, connect_sqlite, init_schema, upsert_restaurants


def _iter_rows(dataset_name: str, split: str) -> Iterable[dict[str, Any]]:
    from datasets import load_dataset

    dataset = load_dataset(dataset_name, split=split)
    for row in dataset:
        yield dict(row)


def ingest_to_sqlite(
    *,
    dataset_name: str,
    split: str,
    db_path: str,
    limit: int | None = None,
    batch_size: int = 1000,
) -> dict[str, int]:
    conn = connect_sqlite(db_path)
    init_schema(conn)
    if limit is None:
        clear_restaurants(conn)

    seen_ids: set[str] = set()
    batch = []
    counters = {"rows_read": 0, "rows_normalized": 0, "rows_written": 0, "rows_skipped": 0}

    for row in _iter_rows(dataset_name=dataset_name, split=split):
        counters["rows_read"] += 1
        if limit is not None and counters["rows_read"] > limit:
            break
        restaurant = normalize_restaurant_row(row)
        if restaurant is None:
            counters["rows_skipped"] += 1
            continue
        if restaurant.id in seen_ids:
            continue
        seen_ids.add(restaurant.id)
        counters["rows_normalized"] += 1
        batch.append(restaurant)
        if len(batch) >= batch_size:
            counters["rows_written"] += upsert_restaurants(conn, batch)
            batch.clear()

    if batch:
        counters["rows_written"] += upsert_restaurants(conn, batch)

    conn.close()
    return counters


def main() -> None:
    settings = get_settings()
    os.environ.setdefault("HF_HOME", settings.hf_home)
    os.environ.setdefault("HF_HUB_CACHE", os.path.join(settings.hf_home, "hub"))
    os.environ.setdefault("HF_DATASETS_CACHE", os.path.join(settings.hf_home, "datasets"))
    parser = argparse.ArgumentParser(description="Phase 1: ingest and normalize restaurants to SQLite.")
    parser.add_argument("--dataset", default=settings.hf_dataset_name, help="Hugging Face dataset id.")
    parser.add_argument("--split", default=settings.hf_dataset_split, help="Dataset split to ingest.")
    parser.add_argument("--db-path", default=settings.sqlite_db_path, help="SQLite output path.")
    parser.add_argument("--limit", type=int, default=None, help="Optional row limit for smoke runs.")
    args = parser.parse_args()

    result = ingest_to_sqlite(
        dataset_name=args.dataset,
        split=args.split,
        db_path=args.db_path,
        limit=args.limit,
    )
    print(
        "Ingestion complete:",
        f"read={result['rows_read']}",
        f"normalized={result['rows_normalized']}",
        f"written={result['rows_written']}",
        f"skipped={result['rows_skipped']}",
    )


if __name__ == "__main__":
    main()
