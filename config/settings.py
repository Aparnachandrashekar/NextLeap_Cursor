from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from common.constants import DEFAULT_HF_DATASET


class AppSettings(BaseSettings):
    """
    Environment-based configuration. Prefix: `RR_` (restaurant recommender) to
    avoid colliding with generic `DATABASE_URL`-only apps.
    """

    model_config = SettingsConfigDict(
        env_prefix="RR_",
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Phase 1+ ingestion
    hf_dataset_name: str = Field(
        default=DEFAULT_HF_DATASET,
        description="Hugging Face dataset id for restaurant records.",
    )
    hf_dataset_split: str = Field(default="train", description="Dataset split to ingest.")
    hf_home: str = Field(
        default=".hf_cache",
        description="Local Hugging Face cache directory to keep downloads project-scoped.",
    )
    sqlite_db_path: str = Field(
        default="data/restaurants.db",
        description="SQLite file used by ingestion and retrieval layers.",
    )

    # Phase 3+ LLM
    llm_provider: str = Field(default="groq", description="e.g. groq, openai, anthropic, ollama.")
    llm_model: str = Field(
        default="llama-3.3-70b-versatile",
        description="Default model id for ranking/explanations.",
    )
    llm_max_tokens: int = Field(default=1500, ge=256, le=32000)
    llm_temperature: float = Field(default=0.2, ge=0.0, le=1.0)
    llm_timeout_seconds: int = Field(default=30, ge=1, le=120)
    groq_api_key: str | None = Field(default=None, description="Groq API key for LLM ranking.")
    groq_model: str = Field(
        default="llama-3.3-70b-versatile",
        description="Groq model used for Phase 4 ranking/explanations.",
    )

    # API server (when added)
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = "INFO"


@lru_cache
def get_settings() -> AppSettings:
    return AppSettings()
