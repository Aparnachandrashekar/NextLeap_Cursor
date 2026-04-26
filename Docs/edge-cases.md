# Edge Cases & Failure Modes: AI-Powered Restaurant Recommender

This checklist is derived from the project spec in `Docs/problemstatement.md` and the build phases in `Docs/phase-wise-architecture.md`. Use it as both an implementation guide (what to guard against) and a test matrix (what to verify).

---

## Phase 0 — Foundations (schemas + API contracts)

### Schema and contract edge cases
- **Missing required fields**: dataset rows without `name`, `location`, `cuisine`, `cost`, or `rating`.
- **Type mismatches**: numbers stored as strings (e.g., `"4.1"`), ratings as `"NEW"` / `"--"` / empty.
- **Multi-valued cuisines**: cuisine stored as a comma-separated string vs array; inconsistent separators (`","`, `"|"`, `" / "`).
- **Location variance**: `city` vs `area` vs `locality` vs `address` fields; user expects “Bangalore” but dataset uses “Bengaluru”.
- **Currency/units ambiguity**: “cost for two” vs per-person vs unspecified; currency symbol missing.
- **Duplicate identity**: same restaurant name appears multiple times (branches) or duplicated rows.

### API edge cases
- **Empty request body** / missing keys.
- **Unknown keys**: client sends additional filters that the API ignores silently (dangerous) vs rejects (safer).
- **Inconsistent normalization**: “low/medium/high” meaning differs between UI and API.
- **Response stability**: ordering changes between identical requests due to nondeterminism (LLM or retrieval).

---

## Phase 1 — Data ingestion + storage (ground truth layer)

### Dataset acquisition edge cases
- **Dataset schema changes**: column renamed/removed/added on Hugging Face.
- **Partial downloads**: network failures mid-fetch leading to truncated data.
- **Encoding issues**: non-UTF8 characters, emojis, unusual punctuation in names/addresses.

### Cleaning/normalization edge cases
- **Nulls and placeholders**: `null`, `""`, `"N/A"`, `"NA"`, `"--"`, `"unknown"`.
- **Rating formats**: floats, strings, “NEW”, “Not rated”, 0, out-of-range (e.g., 6.0).
- **Cost formats**: numeric, ranges (`"300-500"`), text (`"₹500 for two"`), missing currency.
- **Cuisine normalization**: inconsistent casing, whitespace, duplicates (“North Indian” vs “North-Indian”).
- **Location normalization**: abbreviations (“BLR”), alternative spellings, trailing locality info.
- **Outliers**: extremely high cost, negative cost, rating 0 with many votes.

### Storage/indexing edge cases
- **Uniqueness key choice**: no stable restaurant id → must generate (hash) and keep deterministic across ingestions.
- **Branch collisions**: two distinct restaurants map to same normalized key (name+area).
- **Index skew**: location/cuisine fields too noisy → indexes don’t help; query becomes slow.

---

## Phase 2 — User input + rule-based candidate retrieval

### Location input edge cases
- **Not in dataset**: user types a city not present → must return “no matches” gracefully.
- **Ambiguous names**: “New Delhi” vs “Delhi”, “Bangalore” vs “Bengaluru”.
- **Case/whitespace**: `  delhi `, mixed-case, spelling mistakes.
- **Area vs city**: user provides neighborhood but dataset only has city (or vice-versa).

### Budget input edge cases
- **Bucket mapping**: “low/medium/high” unclear without defined thresholds.
- **Range inversion**: min > max if user uses range input.
- **Non-numeric**: user enters “500-700” in a numeric field.
- **Currency mismatch**: user assumes INR but dataset is not explicit.

### Cuisine input edge cases
- **Cuisine not present**: user selects “Korean” but none exist for that location.
- **Multiple cuisines**: user selects [Italian, Chinese]—should it be AND or OR?
- **Synonyms**: “BBQ” vs “Barbeque”, “South Indian” vs “South-Indian”.

### Minimum rating edge cases
- **Too strict**: rating threshold filters everything; need fallback behavior (lower threshold / widen location / suggest alternatives).
- **Missing ratings**: unrated restaurants should be excluded, included, or treated as 0 (make explicit).
- **Different rating scales**: if dataset has 0–5 vs 0–10 (confirm during ingestion; normalize).

### Extras/preferences edge cases
- **Not represented in data**: “family-friendly”, “quick service” may not exist as structured fields.
  - Decide: ignore extras at retrieval time and only mention them in LLM explanation *if supported by available attributes*, otherwise state limitation.
- **Conflicting constraints**: user wants “low budget” + “fine dining”.

### Retrieval logic edge cases
- **No candidates**: strict filters yield 0 rows.
  - Provide a ranked fallback strategy: relax budget first, then rating, then cuisine, then location radius (if any).
- **Too many candidates**: broad filters yield thousands; must cap (top-N) deterministically.
- **Ties**: many restaurants with same rating/cost → deterministic tie-breakers needed (votes count if available, alphabetical as last resort).
- **Duplicate results**: multiple branches or duplicated rows show up; dedupe strategy may hide legitimate branches.
- **Data drift**: if ingestion re-runs, generated ids change → cached results break; keep stable ids.

---

## Phase 3 — LLM ranking + explanation (reasoning layer)

### Prompt construction edge cases
- **Token limits**: too many candidates or too much text per candidate → prompt truncation changes rankings.
  - Mitigation: keep a compact candidate schema; cap candidates; summarize long fields.
- **Missing attributes**: if cost/rating/cuisine missing for some candidates, LLM may hallucinate values.
  - Mitigation: explicit `unknown` markers; instruct model not to guess.
- **Inconsistent field names**: prompt uses “cost_for_two” but UI expects “Estimated cost”; causes confusion.

### LLM output correctness edge cases
- **Hallucinated restaurants**: model suggests venues not in candidate list.
- **Invalid ids**: output references ids not present.
- **Wrong attribute echo**: model swaps ratings/costs between restaurants.
- **Non-compliant format**: not returning JSON (if you require JSON), missing required fields, extra commentary.
- **Repetition**: duplicates same restaurant multiple times in top results.
- **Unsafe/irrelevant content**: model includes unrelated text, stereotypes, or non-actionable fluff.

### Guardrail and recovery edge cases
- **Post-validation drops everything**: if model output is unusable, you need fallback:
  - Return retrieval-based top-N with a generic explanation template, or
  - Re-prompt once with stricter formatting instructions.
- **Provider errors**: timeouts, rate limits, 5xx, auth misconfig, quota exhaustion.
  - Retry policy must avoid duplicate charges and runaway loops.
- **Nondeterminism**: same request yields different rankings on repeated calls.
  - Mitigation: temperature=0 (or low), or accept variance but ensure it stays within candidates.

---

## Phase 4 — Output + UX (presentation layer)

### Display and formatting edge cases
- **Long names/cuisines**: overflow in UI; need truncation and expand behavior.
- **Missing fields**: show “Unknown rating/cost” rather than blank or broken layout.
- **Sorting mismatch**: UI resorting changes LLM order; preserve “recommended order”.
- **Locale**: formatting currency, decimals, and thousands separators.

### “Trust” edge cases
- **Explanation contradicts data**: explanation says “cheap” while cost is high.
  - Mitigation: add a post-check (simple rule) and either regenerate explanation or clip conflicting claims.
- **Overclaiming extras**: LLM claims “family-friendly” without evidence.
  - Mitigation: require explanations to reference only known attributes (cuisine, rating, cost, location) unless the dataset supports more.

---

## Phase 5 — Quality, evaluation, caching, and observability

### Evaluation edge cases
- **No ground truth labels**: “best” is subjective; define proxy metrics:
  - constraint satisfaction (location, cuisine, budget, rating)
  - diversity across cuisines/price points (if multiple cuisines chosen)
  - stability across runs
- **Prompt regressions**: small prompt edits cause large ranking shifts; version prompts and log prompt ids.

### Caching edge cases
- **Cache key explosion**: extras free-text creates infinite keys.
  - Normalize: lowercase, trim, sort cuisine list, map budget bucket.
- **Stale cache**: ingestion updates but cache returns old ids/rows.
  - Invalidate by dataset version or ingestion timestamp.
- **Partial caching**: cache candidates but not LLM output; ranking still expensive.

### Observability edge cases
- **Sensitive logging**: do not log full prompts with user data if it’s considered sensitive; log hashes/ids instead.
- **Debuggability**: without storing candidate ids and LLM output, you can’t reproduce issues.
  - Log: normalized preferences, candidate ids, LLM model name, prompt version, validation failures.

---

## Phase 6 — Optional semantic / hybrid retrieval

### Embeddings edge cases
- **No text fields**: if dataset lacks descriptions, embeddings may be low-signal.
- **Garbage-in embeddings**: noisy address strings dominate similarity.
- **Cost and rating ignored**: semantic search may surface great “vibe” but violates budget/rating constraints.
  - Mitigation: hybrid retrieval must still enforce hard filters (location/rating/budget) unless explicitly relaxed.

### Vector index edge cases
- **Cold start**: embedding generation takes time; index not ready → fallback to SQL-only retrieval.
- **Duplicate vectors**: same restaurant duplicated → repeated semantic hits.

---

## End-to-end “must-handle” scenarios (quick test list)

- **No match**: location exists but cuisine+rating+birthday extras filters everything.
- **Too broad**: only location given; results should still be relevant and stable.
- **Dirty data**: top candidates include missing cost/rating; output remains coherent without guessing.
- **LLM failure**: provider timeout; system still returns a reasonable ranked list (retrieval-only fallback).
- **Grounding**: model attempts to invent a restaurant; post-validation blocks it and response stays usable.
- **Consistency**: repeated identical request returns same results order (or within a small acceptable variance you define).

