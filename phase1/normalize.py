from __future__ import annotations

import hashlib
import re
from typing import Any

from common.restaurant import Restaurant


_COST_DIGITS_RE = re.compile(r"\d+")
# e.g. "4.1/5", "4.1/ 5" from the HuggingFace Zomato-style dataset
_RATING_FRACTION_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)\s*/\s*5\s*$", re.IGNORECASE)
_RATING_NUM_RE = re.compile(r"^\s*(\d+(?:\.\d+)?)\s*$")


def _clean_text(value: Any) -> str | None:
    if value is None:
        return None
    text = str(value).strip()
    if not text or text.lower() in {"n/a", "na", "none", "null", "--", "unknown"}:
        return None
    return text


def _extract_first_non_empty(row: dict[str, Any], keys: list[str]) -> str | None:
    for key in keys:
        value = _clean_text(row.get(key))
        if value:
            return value
    return None


def _parse_rating(value: Any) -> float | None:
    text = _clean_text(value)
    if text is None:
        return None
    lowered = text.lower()
    if lowered in {"new", "not rated", "-", "--", "na", "n/a", "none"}:
        return None
    m = _RATING_FRACTION_RE.match(text)
    if m:
        parsed = float(m.group(1))
    else:
        m2 = _RATING_NUM_RE.match(text)
        if m2:
            parsed = float(m2.group(1))
        else:
            return None
    if parsed > 5:
        parsed = parsed / 2 if parsed <= 10 else 5.0
    return max(0.0, min(parsed, 5.0))


def _parse_cost_for_two(value: Any) -> int | None:
    text = _clean_text(value)
    if text is None:
        return None
    digits = [int(chunk) for chunk in _COST_DIGITS_RE.findall(text)]
    if not digits:
        return None
    if len(digits) == 1:
        return digits[0]
    # For ranges like "300-500", use midpoint.
    return int(sum(digits[:2]) / 2)


def _parse_cuisines(value: Any) -> list[str]:
    text = _clean_text(value)
    if text is None:
        return []
    text = text.replace("|", ",").replace("/", ",")
    seen: set[str] = set()
    cuisines: list[str] = []
    for part in text.split(","):
        norm = part.strip()
        if norm and norm.lower() not in seen:
            seen.add(norm.lower())
            cuisines.append(norm)
    return cuisines


def _stable_id(name: str, city: str | None, area: str | None, url: str | None) -> str:
    source = "|".join([name.lower(), (city or "").lower(), (area or "").lower(), (url or "").lower()])
    return hashlib.sha1(source.encode("utf-8")).hexdigest()[:16]


def normalize_restaurant_row(row: dict[str, Any]) -> Restaurant | None:
    """
    Convert one raw dataset row into the canonical Restaurant schema.
    Returns None when required minimum information is not present.
    """
    name = _extract_first_non_empty(row, ["restaurant_name", "name", "res_name"])
    if not name:
        return None

    # ManikaSaini/zomato-restaurant-recommendation columns: `rate`, `approx_cost(for two people)`,
    # `location` (locality), `listed_in(city)` (eg. Bangalore), `address`.
    city = _extract_first_non_empty(
        row,
        ["listed_in(city)", "city", "location_city"],
    )
    area = _extract_first_non_empty(
        row,
        ["address", "area", "locality", "location"],
    )
    url = _extract_first_non_empty(row, ["url", "restaurant_url", "menu_url"])
    cuisines = _parse_cuisines(_extract_first_non_empty(row, ["cuisines", "cuisine", "food_type"]))
    rating = _parse_rating(
        _extract_first_non_empty(row, ["rate", "rating", "aggregate_rating", "user_rating"])
    )
    cost_for_two = _parse_cost_for_two(
        _extract_first_non_empty(
            row,
            [
                "approx_cost(for two people)",
                "cost_for_two",
                "average_cost_for_two",
                "cost",
            ],
        )
    )

    restaurant = Restaurant(
        id=_stable_id(name=name, city=city, area=area, url=url),
        name=name,
        city=city,
        area=area,
        cuisines=cuisines,
        cost_for_two=cost_for_two,
        rating=rating,
        url=url,
        metadata={"raw_columns": sorted(row.keys())},
    )
    return restaurant
