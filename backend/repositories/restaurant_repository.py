from __future__ import annotations

import sqlite3

from common.restaurant import Restaurant
from common.user_preference import UserPreference
from config.settings import get_settings
from phase1.storage import connect_sqlite
from phase2.service import get_candidates


class RestaurantRepository:
    """Data access boundary for restaurant retrieval and persistence backing store."""

    def __init__(self, db_path: str | None = None) -> None:
        settings = get_settings()
        self._db_path = db_path or settings.sqlite_db_path

    def connect(self) -> sqlite3.Connection:
        return connect_sqlite(self._db_path)

    def get_candidates(self, preferences: UserPreference, *, limit: int) -> tuple[list[Restaurant], list[str]]:
        return get_candidates(preferences, limit=limit)
