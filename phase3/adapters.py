from __future__ import annotations

import json
from json import JSONDecodeError
from typing import Protocol

from common.restaurant import Restaurant
from common.user_preference import UserPreference
from config.settings import AppSettings
from phase3.types import LLMRankedItem, LLMRankingOutput


class LLMAdapter(Protocol):
    def rank(
        self,
        *,
        prompt: str,
        preferences: UserPreference,
        candidates: list[Restaurant],
        top_k: int,
    ) -> LLMRankingOutput: ...


class HeuristicLLMAdapter:
    """
    Provider-agnostic fallback adapter.
    It behaves like an "LLM ranking layer" but runs fully local and deterministic.
    """

    def rank(
        self,
        *,
        prompt: str,
        preferences: UserPreference,
        candidates: list[Restaurant],
        top_k: int,
    ) -> LLMRankingOutput:
        _ = prompt  # Kept for interface parity and future provider calls.

        wanted_cuisines = {c.strip().lower() for c in preferences.cuisines}

        def score(c: Restaurant) -> tuple[float, float, int]:
            rating_signal = (c.rating or 0.0) / 5.0
            cuisine_signal = 0.0
            if wanted_cuisines:
                has_overlap = bool({x.lower() for x in c.cuisines}.intersection(wanted_cuisines))
                cuisine_signal = 1.0 if has_overlap else 0.0

            budget_signal = 0.5
            if preferences.min_cost is not None or preferences.max_cost is not None:
                if c.cost_for_two is None:
                    budget_signal = 0.0
                else:
                    min_ok = preferences.min_cost is None or c.cost_for_two >= preferences.min_cost
                    max_ok = preferences.max_cost is None or c.cost_for_two <= preferences.max_cost
                    budget_signal = 1.0 if min_ok and max_ok else 0.0

            total = (0.55 * rating_signal) + (0.30 * cuisine_signal) + (0.15 * budget_signal)
            return total, rating_signal, c.cost_for_two or 10**9

        ordered = sorted(candidates, key=lambda c: (-score(c)[0], -(c.rating or 0), score(c)[2], c.name.lower()))
        chosen = ordered[:top_k]

        ranked_items = []
        for c in chosen:
            explanation_bits = []
            if c.rating is not None:
                explanation_bits.append(f"rating {c.rating:.1f}/5")
            if c.cuisines:
                explanation_bits.append(f"cuisines include {', '.join(c.cuisines[:2])}")
            if c.cost_for_two is not None:
                explanation_bits.append(f"cost for two around {c.cost_for_two}")
            explanation = "Good overall fit based on " + ", ".join(explanation_bits) + "."
            ranked_items.append(LLMRankedItem(restaurant_id=c.id, explanation=explanation))

        summary = f"Ranked {len(chosen)} options using candidate-only grounded reasoning."
        return LLMRankingOutput(ranked_items=ranked_items, summary=summary)


def _parse_ranking_output(text: str) -> LLMRankingOutput:
    content = text.strip()
    if "```" in content:
        content = content.replace("```json", "").replace("```", "").strip()
    try:
        parsed = json.loads(content)
    except JSONDecodeError as exc:
        raise ValueError("LLM output is not valid JSON") from exc
    return LLMRankingOutput.model_validate(parsed)


class GroqLLMAdapter:
    def __init__(self, *, api_key: str, model: str, temperature: float, max_tokens: int, timeout_seconds: int):
        self.api_key = api_key
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.timeout_seconds = timeout_seconds

    def rank(
        self,
        *,
        prompt: str,
        preferences: UserPreference,
        candidates: list[Restaurant],
        top_k: int,
    ) -> LLMRankingOutput:
        _ = preferences
        _ = candidates
        _ = top_k
        from groq import Groq

        client = Groq(api_key=self.api_key, timeout=self.timeout_seconds)
        completion = client.chat.completions.create(
            model=self.model,
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            response_format={"type": "json_object"},
            messages=[
                {
                    "role": "system",
                    "content": "You are a strict JSON API. Return only valid JSON, no markdown.",
                },
                {"role": "user", "content": prompt},
            ],
        )
        text = completion.choices[0].message.content or "{}"
        return _parse_ranking_output(text)


def get_llm_adapter(settings: AppSettings) -> tuple[LLMAdapter, str]:
    """
    Returns adapter + adapter mode.
    For now, all providers route to a deterministic local adapter.
    This keeps Phase 3 architecture complete without requiring API keys.
    """
    _ = json.dumps(
        {
            "provider": settings.llm_provider,
            "model": settings.llm_model,
            "max_tokens": settings.llm_max_tokens,
            "temperature": settings.llm_temperature,
            "timeout_s": settings.llm_timeout_seconds,
        }
    )
    if settings.llm_provider.lower() == "groq" and settings.groq_api_key:
        return (
            GroqLLMAdapter(
                api_key=settings.groq_api_key,
                model=settings.groq_model,
                temperature=settings.llm_temperature,
                max_tokens=settings.llm_max_tokens,
                timeout_seconds=settings.llm_timeout_seconds,
            ),
            "groq",
        )
    return HeuristicLLMAdapter(), "heuristic_local"
