# `Screens/`

This folder is the home for product UI, aligned with the Stitch design exports in `stitch_smartbite_ai_discovery/`.

- **`crave_discover/`** — “Crave & Discover” (AIroma) implementation used by `app/page.tsx`.
- **`stitch_smartbite_ai_discovery/`** — Source HTML, PNG, and `DESIGN.md` from the design tool (reference only).

The live app composes:
- `CraveDiscoverApp` — flow + API calls
- `screens/*` — Home search, finding flavor, results, no results, error
- `components/TopNav` — shell navigation

To tweak branding or tokens, see `crave_discover/DESIGN.md` in the reference folder and `tailwind.config.ts` theme extensions.
