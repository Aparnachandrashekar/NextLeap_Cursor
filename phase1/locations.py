from __future__ import annotations

from config.settings import get_settings
from phase1.storage import connect_sqlite


def list_dataset_locations() -> list[str]:
    """
    Distinct localities from the Zomato dataset (stored in `restaurants.city`,
    sourced from HuggingFace column `listed_in(city)` — each value is a Bangalore area).
    """
    settings = get_settings()
    conn = connect_sqlite(settings.sqlite_db_path)
    try:
        cur = conn.execute(
            """
            SELECT DISTINCT city
            FROM restaurants
            WHERE city IS NOT NULL AND TRIM(city) != ''
            ORDER BY city COLLATE NOCASE
            """
        )
        return [r[0] for r in cur.fetchall() if r[0]]
    finally:
        conn.close()
