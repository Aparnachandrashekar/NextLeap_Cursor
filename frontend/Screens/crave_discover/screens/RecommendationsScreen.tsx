import { RECOMMENDATION_CARD_IMAGES } from "../lib/stitchImageUrls";
import { SiteFooter } from "../components/SiteFooter";
import type { RecommendResponse } from "../types";

type Props = {
  data: RecommendResponse;
  onBack: () => void;
  areaLabel: string;
  searchSubtitle: string;
};

function costTier(estimated: number | null) {
  if (estimated == null) return "—";
  if (estimated < 500) return "₹";
  if (estimated < 1500) return "₹₹";
  return "₹₹₹";
}

export function RecommendationsScreen({ data, onBack, areaLabel, searchSubtitle }: Props) {
  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <span className="text-headline-md text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
              AIroma
            </span>
            <nav className="hidden items-center gap-6 md:flex">
              <a
                className="text-base font-bold text-orange-600 font-epilogue border-b-2 border-orange-600 pb-1 dark:text-orange-500"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
              >
                Discover
              </a>
              <a
                className="text-base font-medium text-slate-600 font-epilogue transition-all active:scale-95 duration-200 hover:bg-slate-50 hover:text-orange-500 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Trending
              </a>
              <a
                className="text-base font-medium text-slate-600 font-epilogue transition-all active:scale-95 duration-200 hover:bg-slate-50 hover:text-orange-500 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Collections
              </a>
              <a
                className="text-base font-medium text-slate-600 font-epilogue transition-all active:scale-95 duration-200 hover:bg-slate-50 hover:text-orange-500 dark:text-slate-400 dark:hover:bg-slate-900"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Nearby
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-outline-variant hidden items-center rounded-full border bg-surface-container-low px-4 py-2 sm:flex">
              <span className="material-symbols-outlined text-on-surface-variant mr-2 text-sm">search</span>
              <input
                className="w-48 border-none bg-transparent text-sm focus:ring-0"
                placeholder="Dishes or restaurants"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant active:scale-95 rounded-full p-2"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                className="text-on-surface-variant transition-colors duration-200 hover:bg-surface-variant active:scale-95 rounded-full p-2"
                type="button"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="font-display-lg text-display-lg mb-2 text-on-surface">Restaurants in {areaLabel}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {data.summary?.trim() ? data.summary : searchSubtitle}
          </p>
        </div>
        {data.warnings.length > 0 && (
          <div className="border-outline-variant text-on-primary-fixed bg-primary-fixed mb-8 flex items-start gap-4 rounded-xl border p-4">
            <span
              className="material-symbols-outlined text-primary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              info
            </span>
            <div>
              <p className="font-title-sm text-title-sm mb-1">Filters relaxed</p>
              <p className="text-on-primary-fixed text-body-sm font-body-sm">
                {data.warnings.map((w, i) => (
                  <span key={i}>
                    {i > 0 ? " " : ""}
                    {w}
                  </span>
                ))}
              </p>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 md:w-64">
            <div className="filter-sticky flex flex-col gap-8">
              <div>
                <h3 className="text-title-sm mb-4 font-title-sm">Budget</h3>
                <div className="flex flex-col gap-3">
                  {[
                    { id: "b1", cur: "₹ Under 500" },
                    { id: "b2", cur: "₹₹ 500 - 1500", on: true },
                    { id: "b3", cur: "₹₹₹ 1500+" },
                  ].map((b) => (
                    <label key={b.id} className="group flex cursor-pointer items-center gap-3">
                      <input
                        className="border-outline-variant h-5 w-5 rounded text-primary focus:ring-primary"
                        type="checkbox"
                        defaultChecked={b.on}
                        readOnly
                      />
                      <span className="text-on-surface-variant font-body-md transition-colors group-hover:text-primary group-hover:transition-colors">
                        {b.cur}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-title-sm mb-4 font-title-sm">Cuisine</h3>
                <div className="flex flex-wrap gap-2">
                  {["Italian", "Indian", "Chinese", "Mexican", "Vegan"].map((c) => (
                    <span
                      key={c}
                      className={
                        c === "Italian"
                          ? "text-label-caps font-label-caps cursor-pointer rounded-full bg-primary px-3 py-1 text-on-primary"
                          : "text-label-caps font-label-caps text-on-surface-variant hover:bg-primary-fixed cursor-pointer rounded-full bg-surface-container-high px-3 py-1 transition-colors"
                      }
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-title-sm mb-4 font-title-sm">Rating</h3>
                <div className="flex flex-col gap-3">
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      className="border-outline-variant h-5 w-5 text-primary focus:ring-primary"
                      name="rating"
                      type="radio"
                      readOnly
                    />
                    <span className="text-on-surface-variant font-body-md group-hover:transition-colors group-hover:text-primary">
                      4.5+ Exceptional
                    </span>
                  </label>
                  <label className="group flex cursor-pointer items-center gap-3">
                    <input
                      className="border-outline-variant h-5 w-5 text-primary focus:ring-primary"
                      name="rating"
                      type="radio"
                      defaultChecked
                      readOnly
                    />
                    <span className="text-on-surface-variant font-body-md group-hover:transition-colors group-hover:text-primary">
                      4.0+ Very Good
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </aside>
          <section className="flex flex-grow flex-col gap-8">
            {data.recommendations.map((r, i) => {
              const img = RECOMMENDATION_CARD_IMAGES[i % RECOMMENDATION_CARD_IMAGES.length]!;
              const isFirst = i === 0;
              const tagBg = isFirst
                ? "bg-primary text-on-primary"
                : "text-on-secondary bg-secondary font-headline-md";
              return (
                <div
                  key={r.restaurant_id + i}
                  className="border-slate-100 text-on-surface group flex h-full flex-col overflow-hidden rounded-2xl border bg-surface-container-lowest shadow-sm transition-all duration-300 hover:shadow-lg lg:flex-row"
                >
                  <div className="relative h-48 overflow-hidden lg:h-auto lg:w-1/3">
                    <div
                      className={
                        tagBg +
                        " absolute left-4 top-4 z-10 flex items-center gap-1 rounded-lg px-3 py-1 font-headline-md text-headline-md"
                      }
                    >
                      #{i + 1}
                    </div>
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      src={img}
                      alt={r.name}
                    />
                  </div>
                  <div className="p-6 lg:w-2/3">
                    <div className="mb-2 flex items-start justify-between">
                      <div>
                        <h2 className="text-title-sm font-title-sm text-on-surface">{r.name}</h2>
                        <p className="text-on-surface-variant text-body-sm font-body-sm">{r.cuisine}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-primary-container flex items-center justify-end font-bold">
                          <span
                            className="material-symbols-outlined mr-1 text-sm"
                            style={{ fontVariationSettings: "'FILL' 1" }}
                          >
                            star
                          </span>
                          {r.rating != null ? r.rating : "—"}
                        </div>
                        <span className="text-label-caps text-on-surface-variant font-label-caps">
                          {costTier(r.estimated_cost)}
                        </span>
                      </div>
                    </div>
                    <div
                      className={
                        (isFirst ? "border border-primary/10" : "") +
                        " text-on-surface-variant mt-4 rounded-xl bg-surface-container-low p-4"
                      }
                    >
                      <p className="text-on-surface-variant text-body-sm font-body-sm">
                        {isFirst ? (
                          <>
                            <span className="text-primary font-bold italic">WHY THIS PICK:</span> &quot;{r.explanation}
                            &quot;
                          </>
                        ) : (
                          <>
                            <span className="text-primary font-bold">AIroma Insights:</span> {r.explanation}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
