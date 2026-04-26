import { ERROR_PILL_IMAGES, ERROR_SUGGESTION_IMAGES } from "../lib/stitchImageUrls";
import { SiteFooter } from "../components/SiteFooter";

type Props = {
  message: string;
  onBack: () => void;
  onRetry: () => void;
};

const TREND = [
  { t: "Kyoto Soul Ramen", sub: "Japanese • 1.2 miles", tag: "TRENDING" as const, b: "bg-primary text-white" as const, r: 4.8, img: ERROR_SUGGESTION_IMAGES[0] },
  { t: "El Fuego Cantina", sub: "Mexican • 0.8 miles", tag: "LOCAL FAVORITE" as const, b: "bg-secondary text-white" as const, r: 4.6, img: ERROR_SUGGESTION_IMAGES[1] },
  { t: "Morning Glory", sub: "Brunch • 2.4 miles", tag: null, b: null, r: 4.9, img: ERROR_SUGGESTION_IMAGES[2] },
] as const;

export function ErrorScreen({ message, onBack, onRetry }: Props) {
  return (
    <div className="bg-background text-on-background font-body-md flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <span className="text-headline-md text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-500">
              AIroma
            </span>
            <nav className="hidden items-center gap-6 md:flex">
              <a
                className="text-orange-600 font-epilogue text-base font-bold border-b-2 border-orange-600 pb-1 transition-all dark:text-orange-500"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onBack();
                }}
              >
                Discover
              </a>
              <a
                className="text-slate-600 font-epilogue text-base font-medium dark:text-slate-400 dark:hover:bg-slate-900 transition-all hover:rounded-lg hover:bg-slate-50 hover:text-orange-500"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Trending
              </a>
              <a
                className="text-slate-600 font-epilogue text-base font-medium dark:text-slate-400 dark:hover:bg-slate-900 transition-all hover:rounded-lg hover:bg-slate-50 hover:text-orange-500"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Collections
              </a>
              <a
                className="text-slate-600 font-epilogue text-base font-medium dark:text-slate-400 dark:hover:bg-slate-900 transition-all hover:rounded-lg hover:bg-slate-50 hover:text-orange-500"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Nearby
              </a>
            </nav>
          </div>
          <div className="hidden items-center gap-4 md:flex">
            <div className="relative">
              <span className="text-outline material-symbols-outlined absolute left-3">search</span>
              <input
                className="w-64 rounded-xl border-none bg-surface-container-low py-2 pl-10 pr-4 text-body-sm focus:ring-2 focus:ring-primary/20"
                placeholder="Search for dishes…"
                readOnly
              />
            </div>
            <button
              className="active:scale-95 duration-200 rounded-full p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
              type="button"
            >
              <span className="text-slate-600 material-symbols-outlined">notifications</span>
            </button>
            <button
              className="active:scale-95 duration-200 rounded-full p-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
              type="button"
            >
              <span className="text-slate-600 material-symbols-outlined">account_circle</span>
            </button>
          </div>
        </div>
      </header>
      <main className="custom-scrollbar max-w-7xl mx-auto flex w-full flex-grow flex-col gap-8 px-4 py-8 sm:px-8 md:flex-row">
        <aside className="w-full flex-shrink-0 md:w-64">
          <div className="border-outline-variant text-on-surface space-y-8 rounded-xl border bg-surface-container-lowest p-6 shadow-sm">
            <div>
              <h3 className="text-title-sm mb-4 font-headline-md">Applied Filters</h3>
              <div className="flex flex-wrap gap-2">
                {["Italian", "Under $30", "4+ Stars"].map((f) => (
                  <span
                    key={f}
                    className="text-label-caps inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-on-primary"
                  >
                    {f} <span className="text-[14px] material-symbols-outlined">close</span>
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-title-sm mb-4 font-headline-md">Cuisine</h3>
              <div className="space-y-3">
                {["Italian", "Japanese", "Mediterranean", "Mexican"].map((c, j) => (
                  <label key={c} className="text-body-md group flex cursor-pointer items-center gap-3">
                    <input
                      className="text-primary border-outline-variant focus:ring-primary h-4 w-4 rounded"
                      type="checkbox"
                      defaultChecked={j === 0}
                      disabled
                    />
                    <span className="transition-colors group-hover:text-primary">
                      {c}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-title-sm mb-4 font-headline-md">Delivery Time</h3>
              <div className="space-y-3">
                <label className="text-body-md flex items-center gap-3">
                  <input
                    className="text-primary border-outline-variant focus:ring-primary"
                    name="time"
                    type="radio"
                    disabled
                  />
                  <span>Under 20 min</span>
                </label>
                <label className="text-body-md flex items-center gap-3">
                  <input
                    className="text-primary border-outline-variant focus:ring-primary"
                    name="time"
                    type="radio"
                    defaultChecked
                    disabled
                  />
                  <span>Under 40 min</span>
                </label>
              </div>
            </div>
            <button
              className="text-on-secondary-container font-title-sm bg-secondary-container w-full rounded-lg py-3 transition-all active:scale-[0.98] hover:bg-opacity-80"
              type="button"
              onClick={onBack}
            >
              Clear All
            </button>
          </div>
        </aside>
        <div className="custom-scrollbar flex min-w-0 flex-grow flex-col">
          <div className="mb-6">
            <h1 className="text-display-lg font-headline-md text-on-background">Search Results</h1>
            <p className="text-body-md text-outline">Finding the best flavors based on your preferences…</p>
          </div>
          {message ? (
            <p className="text-on-error-container bg-error-container/30 mb-4 max-w-2xl rounded-lg border border-error/20 p-3 text-left text-body-sm" title={message}>
              {message}
            </p>
          ) : null}
          <div className="border-error/20 relative min-h-[400px] flex flex-col items-center justify-center overflow-hidden rounded-xl border bg-white p-8 text-center shadow-lg md:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-5"
              style={{
                backgroundImage: "radial-gradient(circle at 2px 2px, #ba1a1a 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative mb-6">
              <div className="text-error bg-error-container mb-2 flex h-20 w-20 items-center justify-center rounded-full">
                <span
                  className="text-[40px] material-symbols-outlined"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  wifi_off
                </span>
              </div>
              <div className="absolute -right-1 -top-1">
                <span className="flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                  <span className="bg-error relative inline-flex h-4 w-4 rounded-full" />
                </span>
              </div>
            </div>
            <h2 className="text-headline-md text-error font-headline-md mb-2">Taste Buds Interrupted</h2>
            <p className="text-on-surface-variant text-body-md mx-auto mb-8 max-w-md">
              We&apos;re having trouble connecting to our culinary engine. Don&apos;t worry, your
              filters are still saved. Let&apos;s try to get those dishes back on your plate.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <button
                className="text-on-primary font-title-sm bg-primary flex items-center gap-2 rounded-xl px-8 py-3 shadow-md transition-all active:scale-95 hover:bg-primary-container"
                type="button"
                onClick={onRetry}
              >
                <span className="text-[20px] material-symbols-outlined">refresh</span>
                Retry Search
              </button>
              <button
                className="text-on-surface-variant font-title-sm bg-surface-container-high rounded-xl px-8 py-3 transition-all active:scale-95 hover:bg-surface-variant"
                type="button"
                onClick={onBack}
              >
                Check Status
              </button>
            </div>
            <div className="text-outline-variant border-outline-variant mt-12 flex w-full max-w-lg items-center justify-center gap-6 border-t pt-8 opacity-60 grayscale">
              {ERROR_PILL_IMAGES.map((src) => (
                <img
                  key={src}
                  className="h-12 w-12 rounded-full border-2 border-white object-cover shadow-sm"
                  src={src}
                  alt=""
                />
              ))}
            </div>
          </div>
          <div className="mt-12">
            <div className="text-on-background font-headline-md mb-6 flex items-end justify-between">
              <h3 className="text-title-sm">While you wait: Trending in your area</h3>
              <a
                className="text-body-sm text-primary font-bold flex items-center gap-1 hover:underline"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                View All <span className="text-[16px] material-symbols-outlined">arrow_forward</span>
              </a>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {TREND.map((c, i) => (
                <div
                  key={c.t}
                  className={
                    (i === 2 ? "hidden lg:block " : "") +
                    "border-outline-variant text-on-background group relative cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md"
                  }
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={c.img}
                      alt=""
                    />
                    {c.tag && c.b && (
                      <div className={`text-label-caps font-label-caps absolute left-3 top-3 rounded px-2 py-1 ${c.b}`}>
                        {c.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="text-on-background mb-1 flex items-start justify-between">
                      <h4 className="text-title-sm font-title-sm">{c.t}</h4>
                      <div className="text-primary flex items-center gap-1">
                        <span className="text-body-sm text-[16px] material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" } as React.CSSProperties}>
                          star
                        </span>
                        <span className="text-body-sm font-bold">{c.r}</span>
                      </div>
                    </div>
                    <p className="text-body-sm text-outline">{c.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
