from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

import streamlit as st
from pydantic import ValidationError

from backend.services.recommendation_service import RecommendationService
from common.api import RecommendRequest
from common.user_preference import UserPreference
from config.settings import get_settings
from phase1.locations import list_dataset_locations
from phase1.storage import connect_sqlite


def _bootstrap_env_from_streamlit_secrets() -> None:
    """
    Streamlit Cloud stores secrets in st.secrets.
    Mirror key settings to env vars expected by AppSettings.
    """
    try:
        secrets = st.secrets
    except Exception:
        return
    if not os.getenv("RR_GROQ_API_KEY") and secrets.get("RR_GROQ_API_KEY"):
        os.environ["RR_GROQ_API_KEY"] = str(secrets["RR_GROQ_API_KEY"])
    if not os.getenv("RR_LLM_PROVIDER") and secrets.get("RR_LLM_PROVIDER"):
        os.environ["RR_LLM_PROVIDER"] = str(secrets["RR_LLM_PROVIDER"])
    if not os.getenv("RR_GROQ_MODEL") and secrets.get("RR_GROQ_MODEL"):
        os.environ["RR_GROQ_MODEL"] = str(secrets["RR_GROQ_MODEL"])
    if not os.getenv("RR_SQLITE_DB_PATH") and secrets.get("RR_SQLITE_DB_PATH"):
        os.environ["RR_SQLITE_DB_PATH"] = str(secrets["RR_SQLITE_DB_PATH"])


def _set_runtime_paths() -> None:
    """
    Hosted Streamlit: no pre-built `data/` SQLite (it is not committed). Use a
    local check-in if present, otherwise /tmp + temp HF cache dirs.
    """
    if not os.getenv("RR_SQLITE_DB_PATH"):
        local = Path("data/restaurants.db")
        if local.is_file() and local.stat().st_size > 0:
            os.environ["RR_SQLITE_DB_PATH"] = str(local.resolve())
        else:
            os.environ["RR_SQLITE_DB_PATH"] = str(Path("/tmp/rr_restaurants.db"))
    get_settings.cache_clear()
    hf = Path(tempfile.gettempdir()) / "rr_hf"
    os.environ.setdefault("HF_HOME", str(hf / "root"))
    os.environ.setdefault("HF_HUB_CACHE", str(hf / "hub"))
    os.environ.setdefault("HF_DATASETS_CACHE", str(hf / "datasets"))


def _row_count() -> int:
    settings = get_settings()
    conn = connect_sqlite(settings.sqlite_db_path)
    try:
        r = conn.execute("SELECT COUNT(*) AS n FROM restaurants").fetchone()
        return int(r[0] if r else 0)
    except Exception:
        return 0
    finally:
        conn.close()


def _maybe_ingest_if_empty() -> None:
    if _row_count() > 0:
        return
    try:
        secrets = st.secrets
    except Exception:
        secrets = {}
    limit: int = 5_000
    try:
        v = os.getenv("RR_STREAMLIT_INGEST_LIMIT") or (secrets or {}).get("RR_STREAMLIT_INGEST_LIMIT")
        if v is not None and str(v).strip():
            limit = int(str(v).strip())
    except (TypeError, ValueError):
        limit = 5_000
    try:
        with st.spinner("First-time load: building SQLite from Hugging Face (one-time; may take a few minutes)..."):
            from phase1.ingest import ingest_to_sqlite

            s = get_settings()
            res = ingest_to_sqlite(
                dataset_name=s.hf_dataset_name,
                split=s.hf_dataset_split,
                db_path=s.sqlite_db_path,
                limit=limit,
            )
        st.success(
            f"Database ready. Loaded {res['rows_written']:,} restaurants "
            f"(read {res['rows_read']:,} rows, skipped {res['rows_skipped']:,}).",
        )
    except Exception as exc:
        st.error(
            "Failed to import restaurant data. Check Streamlit / Hugging Face connectivity and logs.",
        )
        st.exception(exc)
        st.info(
            "Set **RR_GROQ_API_KEY** in secrets. Optionally set **RR_STREAMLIT_INGEST_LIMIT** (default 5000) "
            "or build `data/restaurants.db` locally with `python -m phase1.ingest` and commit a deployment artifact.",
        )
        st.stop()
    _locations.clear()
    get_settings.cache_clear()
    _service.clear()


@st.cache_data(show_spinner=False)
def _locations() -> list[str]:
    return list_dataset_locations()


@st.cache_resource(show_spinner=False)
def _service() -> RecommendationService:
    return RecommendationService()


def main() -> None:
    st.set_page_config(
        page_title="AI Restaurant Recommender",
        page_icon="🍽️",
        layout="centered",
    )
    _bootstrap_env_from_streamlit_secrets()
    _set_runtime_paths()
    st.title("AI-Powered Restaurant Recommender")
    st.caption("Groq-backed ranking on top of structured restaurant filtering")

    _maybe_ingest_if_empty()

    locations = _locations()
    if not locations:
        st.error("No locations found. Run ingestion first: `python -m phase1.ingest`.")
        return

    with st.form("recommend-form"):
        location = st.selectbox(
            "Location",
            options=locations,
            index=locations.index("Bellandur") if "Bellandur" in locations else 0,
        )
        col1, col2 = st.columns(2)
        with col1:
            max_cost = st.number_input("Max cost for two (INR)", min_value=0, value=2000, step=100)
        with col2:
            min_rating = st.number_input("Minimum rating", min_value=0.0, max_value=5.0, value=4.0, step=0.1)
        cuisines_text = st.text_input("Cuisines (comma-separated)", value="Italian, Chinese")
        top_k = st.slider("Top K", min_value=1, max_value=10, value=5)
        submitted = st.form_submit_button("Get recommendations", use_container_width=True)

    if not submitted:
        return

    cuisines = [c.strip() for c in cuisines_text.split(",") if c.strip()]

    try:
        request = RecommendRequest(
            preferences=UserPreference(
                location=location,
                max_cost=int(max_cost),
                min_rating=float(min_rating),
                cuisines=cuisines,
            ),
            top_k=top_k,
        )
    except ValidationError as exc:
        st.error("Invalid input.")
        st.code(str(exc))
        return

    with st.spinner("Generating recommendations..."):
        response = _service().recommend(request)

    if response.summary:
        st.success(response.summary)
    if response.warnings:
        for warning in response.warnings:
            st.warning(warning)

    if not response.recommendations:
        st.info("No recommendations found for this filter set.")
        return

    for idx, item in enumerate(response.recommendations, start=1):
        with st.container(border=True):
            st.markdown(f"**#{idx} {item.name}**")
            st.write(f"Cuisine: {item.cuisine}")
            st.write(f"Rating: {item.rating if item.rating is not None else 'N/A'}")
            st.write(f"Estimated cost for two: {item.estimated_cost if item.estimated_cost is not None else 'N/A'}")
            st.write(item.explanation)

    with st.expander("Technical metadata"):
        st.json(response.meta)


if __name__ == "__main__":
    main()
