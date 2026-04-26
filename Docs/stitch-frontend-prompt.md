# Google Stitch Prompt (Next.js Frontend UI)

Use this prompt in Google Stitch to generate frontend UI images and component concepts for this project.

## Prompt to paste into Google Stitch

Design a modern, clean, mobile-responsive frontend UI for an **AI-powered restaurant recommendation app**.

### Tech and constraints
- Frontend framework: **Next.js** (App Router style architecture)
- Styling approach: **Tailwind CSS**-friendly design language
- Visual style: minimal, modern, food-discovery product (Zomato-inspired but original)
- Accessibility: WCAG-friendly contrast, large tap targets, keyboard-friendly forms
- Output should include both:
  - high-fidelity page mockups
  - reusable component ideas

### Product context
The app recommends restaurants based on user preferences and displays:
- restaurant name
- cuisine
- rating
- estimated cost
- AI-generated explanation ("why this pick")
- optional warning badges (for fallback or relaxed filters)

### Primary user flow
1. User opens search page
2. User enters preferences:
   - location (e.g., Bellandur)
   - budget (low/medium/high or max cost)
   - cuisines (multi-select chips)
   - minimum rating slider/input
3. User submits and sees loading/skeleton state
4. User gets top recommendations in ranked cards
5. User can expand "Why this pick" per card

### Required screens
Generate UI images for these screens:

1) **Home / Search Screen**
- Hero/title + short helper text
- Preference form with:
  - location input
  - budget selector
  - max cost input
  - cuisine chip multi-select
  - min rating control
  - submit button ("Find Restaurants")
- clean spacing and strong CTA

2) **Results Screen**
- Header showing search summary (location + filters)
- List/grid of top 5 recommendation cards
- Each card must show:
  - rank number
  - restaurant name
  - cuisine tags
  - rating
  - estimated cost
  - short AI explanation
  - expandable "Why this pick"
- Include optional warning alert area (e.g., "minimum rating relaxed")

3) **Loading State**
- Skeleton cards and shimmering placeholders
- disabled form submit state

4) **Empty State**
- Friendly message: no exact matches
- "Try broader filters" suggestions
- button to go back and edit preferences

5) **Error State**
- Non-blocking error card with retry button
- preserve previously entered filters

6) **Internal Debug/Trace Panel (optional admin view)**
- request id
- llm provider/model
- adapter mode (groq/fallback)
- candidate pool size

### Design system guidance
- Use a card-based layout with rounded corners and subtle shadows
- Typography hierarchy:
  - bold heading
  - medium card titles
  - muted metadata text
- Color tokens:
  - primary: warm red/orange accent
  - neutral grayscale background
  - success/warning/error semantic colors
- Include dark mode variant for at least Home and Results screens

### Responsive behavior
- Mobile-first (single-column cards)
- Tablet (2-column results)
- Desktop (form and results with comfortable max-width)

### Next.js component structure to reflect in design
Represent the UI as if built with these reusable components:
- `SearchForm`
- `BudgetSelector`
- `CuisineMultiSelect`
- `RecommendationCard`
- `WarningBanner`
- `LoadingSkeleton`
- `EmptyState`
- `ErrorState`
- `TracePanel`

### Interaction details
- Hover state on cards and primary buttons
- Active filter chips
- Expand/collapse animation affordance for explanations
- Sticky filter summary bar on results page (desktop)

### Deliverables expected from Stitch
- 2-3 visual variations per key screen
- Consistent design language across all screens
- Component-level callouts with naming aligned to Next.js components above
- One polished end-to-end user journey storyboard (Search -> Loading -> Results)
