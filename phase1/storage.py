from __future__ import annotations

import json
import sqlite3
from pathlib import Path

from common.restaurant import Restaurant


def connect_sqlite(db_path: str) -> sqlite3.Connection:
    path = Path(db_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    # Fresh deploys (e.g. Streamlit /tmp DB) can create an empty file with no schema.
    init_schema(conn)
    return conn


def init_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS restaurants (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            city TEXT,
            area TEXT,
            cuisines_json TEXT NOT NULL,
            cost_for_two INTEGER,
            rating REAL,
            url TEXT,
            metadata_json TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_restaurants_city ON restaurants(city);
        CREATE INDEX IF NOT EXISTS idx_restaurants_area ON restaurants(area);
        CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);
        CREATE INDEX IF NOT EXISTS idx_restaurants_cost_for_two ON restaurants(cost_for_two);
        """
    )
    conn.commit()


def clear_restaurants(conn: sqlite3.Connection) -> None:
    conn.execute("DELETE FROM restaurants")
    conn.commit()


def upsert_restaurants(conn: sqlite3.Connection, restaurants: list[Restaurant]) -> int:
    rows = [
        (
            r.id,
            r.name,
            r.city,
            r.area,
            json.dumps(r.cuisines),
            r.cost_for_two,
            r.rating,
            r.url,
            json.dumps(r.metadata),
        )
        for r in restaurants
    ]
    conn.executemany(
        """
        INSERT INTO restaurants (
            id, name, city, area, cuisines_json, cost_for_two, rating, url, metadata_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            city=excluded.city,
            area=excluded.area,
            cuisines_json=excluded.cuisines_json,
            cost_for_two=excluded.cost_for_two,
            rating=excluded.rating,
            url=excluded.url,
            metadata_json=excluded.metadata_json
        """,
        rows,
    )
    conn.commit()
    return len(rows)
