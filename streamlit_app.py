from __future__ import annotations

import os

import streamlit as st
from pydantic import ValidationError

from backend.services.recommendation_service import RecommendationService
from common.api import RecommendRequest
from common.user_preference import UserPreference
from phase1.locations import list_dataset_locations


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


@st.cache_data(show_spinner=False)
def _locations() -> list[str]:
    return list_dataset_locations()


@st.cache_resource(show_spinner=False)
def _service() -> RecommendationService:
    return RecommendationService()


def main() -> None:
    _bootstrap_env_from_streamlit_secrets()

    st.set_page_config(
        page_title="AI Restaurant Recommender",
        page_icon="🍽️",
        layout="centered",
    )
    st.title("AI-Powered Restaurant Recommender")
    st.caption("Groq-backed ranking on top of structured restaurant filtering")

    locations = _locations()
    if not locations:
        st.error("No locations found. Run ingestion first: `python -m phase1.ingest`.")
        return

    with st.form("recommend-form"):
        location = st.selectbox("Location", options=locations, index=locations.index("Bellandur") if "Bellandur" in locations else 0)
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
