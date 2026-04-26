from __future__ import annotations

from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from common.user_preference import UserPreference

"""JSON contracts for the primary API action (no HTTP server in Phase 0)."""

# Route registration in a later phase should use these.
RECOMMEND_METHOD: str = "POST"
RECOMMEND_PATH: str = "/recommend"


class RecommendRequest(BaseModel):
    """`POST /recommend` request body."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    preferences: UserPreference
    top_k: int = Field(
        10, ge=1, le=100, description="Max recommendations to return after ranking."
    )
    # Allow forward-compatible optional flags without breaking clients.
    options: dict[str, Any] = Field(default_factory=dict, description="Future: locale, model id, etc.")


class RecommendationItem(BaseModel):
    """
    One ranked row for the user; ties field names to the product spec
    (name, cuisine, rating, estimated cost, explanation).
    """

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    restaurant_id: str = Field(..., description="Must match a candidate `Restaurant.id`.")
    name: str
    cuisine: str = Field(..., description="Display string, e.g. 'North Indian' or 'Italian, Pizza'.")
    rating: float | None
    estimated_cost: int | None = Field(
        None, description="Local currency; typically cost for two."
    )
    explanation: str = Field(..., min_length=1, description="LLM- or template-generated rationale.")


class RecommendResponse(BaseModel):
    """`POST /recommend` response body."""

    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    recommendations: list[RecommendationItem] = Field(default_factory=list)
    summary: str | None = Field(None, description="Optional short blurb of the shortlist.")
    warnings: list[str] = Field(
        default_factory=list,
        description="E.g. relaxed filters, no exact cuisine match, LLM fallback used.",
    )
    # Trace / debugging: optional, populated by the API in later phases.
    meta: dict[str, Any] = Field(default_factory=dict, description="Dataset version, prompt id, etc.")
