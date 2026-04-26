# Problem Statement: AI-Powered Restaurant Recommendation (Zomato-Style)

Build an **AI-powered restaurant recommendation service** inspired by Zomato. The system should suggest restaurants that match each user by combining **structured data** (filters, attributes) with a **Large Language Model (LLM)** for ranking and natural-language explanations.

---

## Objective

Design and implement an application that:

- Accepts **user preferences** (e.g. location, budget, cuisine, minimum rating).
- Uses a **real-world restaurant dataset** as the source of truth.
- Uses an **LLM** to turn filtered candidates into **personalized, human-like** recommendations.
- **Surfaces** results in a **clear, scannable** layout for the end user.

---

## System Workflow

### 1. Data ingestion

- Load and preprocess the Zomato dataset from Hugging Face: [ManikaSaini/zomato-restaurant-recommendation](https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation).
- Extract the fields you need (e.g. name, area/city, cuisine, cost, rating, and any other fields useful for filtering and display).

### 2. User input

Collect preferences such as:

| Dimension | Examples |
| --- | --- |
| Location | Delhi, Bangalore, etc. |
| Budget | low, medium, high (or a concrete range) |
| Cuisine | Italian, Chinese, etc. |
| Minimum rating | e.g. 3.5+ |
| Extras (optional) | family-friendly, quick service, etc. |

### 3. Integration layer

- **Filter** the dataset to a relevant subset from the user’s constraints.
- **Prepare** that subset as structured input for the LLM (e.g. compact rows or a small table in the prompt).
- **Design prompts** so the model can **reason** over real attributes and **rank** options, not invent venues that are not in the data.

### 4. Recommendation engine (LLM)

Use the LLM to:

- **Rank** the filtered (or top-N) restaurants for this user.
- **Explain** why each pick fits the stated preferences.
- **Optionally** add a short summary of the overall shortlist.

### 5. Output

Present the **top** recommendations in a user-friendly way. Each item should be easy to scan and include at least:

- **Restaurant name**
- **Cuisine**
- **Rating**
- **Estimated cost**
- **AI-generated explanation** (why it matches)

---

## Summary

The product goal is a **credible, data-backed** recommender: structured filtering keeps recommendations **grounded in the dataset**; the LLM adds **ranking nuance and explanations** that read naturally to the user.
