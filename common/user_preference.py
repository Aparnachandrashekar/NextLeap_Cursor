from __future__ import annotations

from enum import Enum
from typing import Self

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from common import constants


class BudgetBucket(str, Enum):
    """Discrete budget when the user does not supply a numeric range."""

    low = "low"
    medium = "medium"
    high = "high"


class UserPreference(BaseModel):
    """
    User-stated filters for candidate retrieval and LLM ranking.

    Either `budget` (bucket) and/or `min_cost` / `max_cost` may be set; later phases
    map buckets to concrete ranges. Validation ensures costs are not inverted.
    """

    model_config = ConfigDict(str_strip_whitespace=True, use_enum_values=True, extra="forbid")

    location: str = Field(..., min_length=1, description="City/area the user cares about.")
    budget: BudgetBucket | None = None
    min_cost: int | None = Field(None, ge=0)
    max_cost: int | None = Field(None, ge=0)
    cuisines: list[str] = Field(default_factory=list, description="Desired cuisines; empty = any.")
    min_rating: float | None = Field(
        None,
        description="Minimum accepted rating; same scale as Restaurant.rating (0–5).",
    )
    extras: str | None = Field(
        None, description="Free-text: family-friendly, quick service, etc."
    )

    @field_validator("cuisines", mode="before")
    @classmethod
    def _normalize_cuisines(cls, v: object) -> list[str]:
        if v is None:
            return []
        if isinstance(v, str):
            return [c.strip() for c in v.split(",") if c.strip()]
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        return []

    @model_validator(mode="after")
    def _cost_range_sane(self) -> Self:
        a, b = self.min_cost, self.max_cost
        if a is not None and b is not None and a > b:
            raise ValueError("min_cost cannot be greater than max_cost")
        return self

    @model_validator(mode="after")
    def _min_rating_in_range(self) -> Self:
        v = self.min_rating
        if v is not None and not (constants.RATING_MIN <= v <= constants.RATING_MAX):
            msg = f"min_rating must be between {constants.RATING_MIN} and {constants.RATING_MAX}"
            raise ValueError(msg)
        return self
