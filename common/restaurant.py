from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from common import constants

"""Ground-truth restaurant record (ingestion/DB + LLM grounding)."""


class Restaurant(BaseModel):
    """A restaurant as stored and filtered; ids must be stable for LLM post-validation."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    id: str = Field(..., min_length=1, description="Stable identifier in our store.")
    name: str = Field(..., min_length=1)
    city: str | None = None
    area: str | None = Field(None, description="Locality / neighborhood when available.")
    cuisines: list[str] = Field(default_factory=list)
    cost_for_two: int | None = Field(
        None, ge=0, description="Typical cost for two (local currency units, e.g. INR)."
    )
    rating: float | None = Field(None, description="0–5 style rating; None if missing.")
    url: str | None = None
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Extra fields from the dataset (votes, address, etc.).",
    )

    @field_validator("rating")
    @classmethod
    def _rating_in_range(cls, v: float | None) -> float | None:
        if v is None:
            return None
        if not (constants.RATING_MIN <= v <= constants.RATING_MAX):
            msg = f"rating must be between {constants.RATING_MIN} and {constants.RATING_MAX} or null"
            raise ValueError(msg)
        return v

    @field_validator("cuisines", mode="before")
    @classmethod
    def _cuisines_as_list(cls, v: object) -> list[str]:
        if v is None:
            return []
        if isinstance(v, str):
            return [c.strip() for c in v.split(",") if c.strip()]
        if isinstance(v, list):
            return [str(x).strip() for x in v if str(x).strip()]
        return []
