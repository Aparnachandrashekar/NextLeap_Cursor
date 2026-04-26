from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class LLMRankedItem(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    restaurant_id: str = Field(..., min_length=1)
    explanation: str = Field(..., min_length=1)


class LLMRankingOutput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    ranked_items: list[LLMRankedItem] = Field(default_factory=list)
    summary: str | None = None
