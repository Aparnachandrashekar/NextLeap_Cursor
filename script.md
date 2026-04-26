# Project Script: AI-Powered Restaurant Recommender

This script is a practical runbook for setting up, running, and demoing the project end-to-end.

---

## 1) Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- Groq API key

---

## 2) One-time setup

From project root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Frontend setup:

```bash
cd frontend
npm install
cd ..
```

---

## 3) Environment variables

Create/update `.env` in project root:

```env
RR_GROQ_API_KEY=your_groq_api_key_here
RR_LLM_PROVIDER=groq
```

Optional overrides:

```env
RR_GROQ_MODEL=llama-3.3-70b-versatile
RR_SQLITE_DB_PATH=data/restaurants.db
```

Frontend API URL (`frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

---

## 4) Ingest dataset (Phase 1)

Run full ingestion:

```bash
source .venv/bin/activate
python -m phase1.ingest
```

Expected output:

```text
Ingestion complete: read=..., normalized=..., written=..., skipped=...
```

---

## 5) Run backend (Phase 4 API)

```bash
source .venv/bin/activate
uvicorn phase4.api:app --host 127.0.0.1 --port 8000
```

Health checks:

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/metrics
```

List Bangalore-area localities (from the ingested dataset, `listed_in(city)` field):

```bash
curl -sS http://127.0.0.1:8000/locations | python -m json.tool
```

---

## 6) Run frontend (Next.js)

If port `3000` is occupied, use `3001`.

```bash
cd frontend
npm run dev -- --hostname 127.0.0.1 --port 3001
```

Open:

- Frontend: `http://127.0.0.1:3001`
- API docs: `http://127.0.0.1:8000/docs`

---

## 7) Test API directly (recommended)

```bash
curl -sS -X POST "http://127.0.0.1:8000/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "location": "Bellandur",
      "max_cost": 2000,
      "min_rating": 4.0
    },
    "top_k": 5
  }' | python -m json.tool
```

What to check in response:

- `recommendations[].rating` is populated
- `recommendations[].estimated_cost` is populated
- `meta.adapter_mode` is `groq`
- `warnings` is empty or clearly informative

---

## 8) Demo script (presentation flow)

Use this exact sequence when presenting:

1. Show project goal from `Docs/problemstatement.md`.
2. Show architecture from `Docs/phase-wise-architecture.md`.
3. Start backend and frontend.
4. Open frontend and submit:
   - Location: Bellandur
   - Budget/max cost: 2000
   - Min rating: 4.0
   - Top K: 5
5. Walk through returned cards:
   - name
   - cuisine
   - rating
   - estimated cost
   - AI explanation
6. Open API response in terminal and highlight:
   - `mode: llm_ranking`
   - `adapter_mode: groq`
7. Show `/metrics` endpoint for observability.

---

## 9) Troubleshooting

- **Failed to fetch (frontend)**:
  - backend not running, wrong API URL, or CORS mismatch.
- **Fallback warnings from LLM**:
  - check model validity and API key.
- **Ratings/cost missing**:
  - re-run `python -m phase1.ingest` after normalization updates.
- **Port conflict**:
  - run frontend on 3001 and backend on 8000.

---

## 10) Useful commands

Re-run only query testing:

```bash
python -m phase3.query --location Bellandur --budget medium --min-rating 4 --top-k 5
```

Run retrieval-only test:

```bash
python -m phase2.query --location Bellandur --min-rating 4 --limit 5
```

---

## 11) Current module map

- `common/` -> shared schemas/contracts
- `config/` -> env settings
- `phase1/` -> ingestion + normalization + SQLite storage
- `phase2/` -> deterministic retrieval + fallback logic
- `phase3/` -> Groq/LLM ranking + guardrails
- `phase4/` -> productized API + observability
- `backend/` -> hardened backend layering (`api`, `services`, `repositories`, `llm`, `telemetry`)

---

## 12) Streamlit deployment (single-service backend+UI)

This project is now ready to run directly on Streamlit without a separate FastAPI process.

Local run:

```bash
source .venv/bin/activate
streamlit run streamlit_app.py
```

For Streamlit Cloud:

1. Keep `requirements.txt` in repo root.
2. Set app entry file as `streamlit_app.py`.
3. Add secrets in Streamlit dashboard (or use `.streamlit/secrets.toml` locally):

```toml
RR_GROQ_API_KEY = "your_groq_api_key_here"
RR_LLM_PROVIDER = "groq"
RR_GROQ_MODEL = "llama-3.3-70b-versatile"
```

Notes:
- Streamlit app uses the same recommendation core: `backend.services.RecommendationService`.
- It reads locations from ingested SQLite data.
- Run ingestion once before deploy if the database is not already present.

