# Phase-Wise Architecture: AI-Powered Restaurant Recommendation (Zomato-Style)

This document breaks the system described in [problemstatement.md](problemstatement.md) into build phases: **data → filtering → LLM → UX → hardening → optional semantic search**. Each phase has a clear goal, components, and outputs.

---

## Phase 0 — Foundations (repo + contracts)

- **Goal**: Shared types, validation, and API shapes so later phases stay consistent.
- **Deliverables**
  - **Restaurant schema**: id, name, city/area, cuisines[], cost_for_two, rating, url, and any other fields needed for filtering and display
  - **UserPreference schema**: location, budget or range, cuisines, minimum rating, optional extras
  - **API contracts** for a primary endpoint, e.g. `POST /recommend` (request/response JSON)
- **Components**
  - `common/` or `packages/shared/` (schemas, validation, constants)
  - `config/` (environment, model or provider settings)

---

## Phase 1 — Data ingestion + storage (ground truth layer)

- **Goal**: Load the dataset once, normalize it, and store it for fast, reproducible queries.
- **Components**
  - **Ingestion job** (batch): fetch from [Hugging Face: zomato-restaurant-recommendation](https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation) → clean/normalize → write to storage
  - **Storage** (choose by scope; pick one main store first):
    - **SQLite or PostgreSQL** for structured filtering (recommended default)
    - **Vector store** (optional, deferred to Phase 6) if you add semantic search
- **Key outputs**
  - Deduplicated, normalized restaurant records
  - Useful indexes (e.g. on location, rating, cost, cuisine tags)

---

## Phase 2 — Preference capture + rule-based candidate retrieval

- **Goal**: Deterministic filtering to produce a **high-quality candidate set** the LLM will only rank and explain.
- **Components**
  - **Client / UI**: form for location, budget, cuisine, minimum rating, extras
  - **API service**:
    - Validate and **normalize** inputs (e.g. map low/medium/high to cost ranges)
    - **Candidate retrieval** (SQL or equivalent filters) plus light **scoring heuristics** if useful
- **Outputs**
  - `candidate_restaurants[]` (e.g. top 30–100) with **computed features** (cuisine match, price bucket, etc.)

---

## Phase 3 — LLM ranking + explanation (reasoning layer)

- **Goal**: Use the LLM to **rank only the retrieved candidates** and provide **grounded, human-like explanations**.
- **Components**
  - **Prompt builder**: compact **structured** candidate table + user preferences + clear ranking and tie-break rules
  - **LLM adapter**: provider-agnostic client (e.g. OpenAI, Anthropic) behind one interface
  - **Guardrails**
    - Instruction: *only* choose from the provided list
    - Response must reference restaurant **ids** (or an equivalent key) from the candidate set
    - **Post-validate** LLM output: drop or repair entries that are not in `candidate_restaurants`
- **Outputs**
  - Ranked list, per-item **why it fits** explanation, optional **one-paragraph** summary of the shortlist

---

## Phase 4 — Presentation + productization (user experience)

- **Goal**: Results are **scannable, trustworthy, and consistent** with the problem statement.
- **Components**
  - **Response formatter** / view model: one shape for UI and API
  - **UI** (if applicable): list/cards, filters, expandable “why this pick”
  - **Observability**: structured logs, metrics (latency, LLM token or cost if exposed), request correlation ids
- **Output fields** (per recommendation), aligned with the spec:
  - restaurant name, cuisine, rating, estimated cost, **AI explanation**

---

## Phase 5 — Quality, evaluation, and iteration (reliability and cost)

- **Goal**: Improve relevance, reduce **hallucinations** and runaway **cost/latency**.
- **Components**
  - **Offline / semi-manual eval**: sample queries, expected properties (cuisine, budget band, min rating)
  - **A/B** or versioned **prompt and retrieval** experiments
  - **Caching**: normalized preference key → (candidates) and optionally LLM result for identical requests
- **Outputs**
  - Measured quality signals and a cheaper, faster p95 for repeat traffic

---

## Phase 6 — Backend architecture hardening (production API)

- **Goal**: Convert phase-wise logic into a clean, maintainable backend service with clear boundaries.
- **Components**
  - **API layer** (FastAPI): route handlers, request validation, response mapping
  - **Application layer**: orchestrates retrieval, LLM ranking, guardrails, and fallback
  - **Domain layer**: shared business models (`Restaurant`, `UserPreference`, recommendation contracts)
  - **Data access layer**: repository pattern for SQLite/Postgres and optional cache backend
  - **LLM integration layer**: provider adapters (Groq initially), prompt templates, retry/timeout policies
  - **Observability layer**: request ids, structured logs, latency/cost metrics, error taxonomy
- **Outputs**
  - Stable backend contracts, testable modules, and deployment-ready service boundaries

### Backend service boundaries

- **`/recommend` endpoint**
  - Input: `RecommendRequest`
  - Output: `RecommendResponse`
  - Responsibility: synchronous recommendation flow for UI calls
- **`/health` endpoint**
  - Liveness/readiness checks for deployment and monitoring
- **`/metrics` endpoint**
  - Basic operational metrics for dashboarding and alerting
- **Batch ingestion command**
  - Periodically refreshes restaurant data and records dataset version

### Backend target structure

- `common/` — shared contracts and constants
- `config/` — settings and environment configuration
- `phase1/` — ingestion, normalization, persistence
- `phase2/` — deterministic retrieval and candidate scoring
- `phase3/` — LLM ranking, prompting, and guardrails
- `phase4/` — API productization, formatting, observability
- `backend/` (optional consolidation)
  - `api/`, `services/`, `repositories/`, `llm/`, `telemetry/`, `tests/`

---

## Phase 7 — Frontend architecture (user-facing application)

- **Goal**: Provide a complete, user-friendly client that consumes backend APIs and explains recommendations clearly.
- **Components**
  - **App shell**: routing, layout, state initialization
  - **Search/filter form**: location, budget/range, cuisine, minimum rating, optional preferences
  - **Results module**: recommendation cards, ranking order, explanation expansion
  - **Feedback states**: loading, empty results, fallback warnings, error boundaries
  - **Client API layer**: typed request/response client for `/recommend`
  - **Telemetry hooks**: request-id propagation, UX timing, interaction events
- **Outputs**
  - Reliable frontend flow from user input to recommendation display with clear trust signals

### Frontend pages and components

- **Home/Search page**
  - Preference form with validation and presets
- **Results view**
  - Top-N recommendations with: name, cuisine, rating, cost, explanation
  - Display backend warnings (e.g., relaxed filters)
- **Recommendation card**
  - Compact summary + expandable “why this pick”
- **Debug/trace panel (optional for internal builds)**
  - request id, model/provider, fallback status

### Frontend target structure

- `frontend/`
  - `src/pages/` — main screens (Search, Results)
  - `src/components/` — cards, filters, loaders, warning banners
  - `src/api/` — typed API client and DTO mappers
  - `src/state/` — query/request/result state management
  - `src/styles/` — theme, design tokens, responsive rules
  - `src/tests/` — unit and integration UI tests

---

## Phase 8 — Advanced retrieval (optional: semantic + hybrid search)

- **Goal**: Support **fuzzy** or open-ended preferences (e.g. “quiet”, “family dinner”) beyond strict filters.
- **Components**
  - **Embeddings** from free-text or metadata (descriptions, tags) where the dataset allows
  - **Vector index** and **hybrid pipeline**: (SQL or rule filters) **intersect** or **union** (design choice) with top-k semantic matches → combined candidate set for the LLM
- **Outputs**
  - Broader match quality on vague queries, still with Phase 3 grounding to the final candidate list

---

## End-to-end request flow (runtime)

1. Client sends preferences to the **API**
2. API **validates/normalizes** → **queries the store** → returns **top-N candidates**
3. **Prompt** includes only those candidates → **LLM** ranks and explains → **output validated** against candidates
4. API returns a stable `RecommendResponse` with metadata/warnings
5. Frontend renders **name, cuisine, rating, cost, and explanation** for top results and shows fallback warnings

## Deployment view (backend + frontend)

- **Backend deploy unit**: FastAPI app behind a reverse proxy/load balancer
- **Frontend deploy unit**: static SPA (or SSR app) calling backend via HTTPS
- **Data plane**: SQLite (dev) -> PostgreSQL (staging/prod), optional Redis cache
- **Model plane**: Groq API for ranking/explanations with timeout and retry controls
- **Ops essentials**: env-based config, CI checks, smoke tests, and rollback-safe releases
