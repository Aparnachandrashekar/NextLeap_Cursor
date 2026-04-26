import { NO_RESULTS_HERO } from "../lib/stitchImageUrls";
import { SiteFooter } from "../components/SiteFooter";

type Props = { onBack: () => void };

export function NoResultsScreen({ onBack }: Props) {
  return (
    <div className="bg-background text-on-background font-body-md flex min-h-screen flex-col antialiased">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="text-2xl font-black tracking-tighter text-orange-600 dark:text-orange-500">AIroma</div>
          <nav className="text-base font-epilogue font-medium hidden items-center gap-8 md:flex">
            <a
              className="text-orange-600 border-b-2 border-orange-600 pb-1 font-bold dark:text-orange-500"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Discover
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 transition-all rounded px-2 py-1 hover:bg-slate-50 hover:text-orange-500 dark:hover:bg-slate-900"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Trending
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 transition-all rounded px-2 py-1 hover:bg-slate-50 hover:text-orange-500 dark:hover:bg-slate-900"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Collections
            </a>
            <a
              className="text-slate-600 dark:text-slate-400 transition-all rounded px-2 py-1 hover:bg-slate-50 hover:text-orange-500 dark:hover:bg-slate-900"
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Nearby
            </a>
          </nav>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="text-on-surface-variant/60 material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2">
                search
              </span>
              <input
                className="text-body-sm w-64 rounded-xl border-none bg-surface-container-low py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary-container"
                placeholder="Search for dishes…"
                readOnly
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-on-surface-variant transition-colors active:scale-95 duration-200 rounded-full p-2 hover:bg-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                className="text-on-surface-variant transition-colors active:scale-95 duration-200 rounded-full p-2 hover:bg-surface-variant"
                type="button"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="px-gutter py-2xl flex flex-grow items-center justify-center">
        <div className="mb-2xl flex w-full max-w-2xl flex-col items-center text-center">
          <div className="mb-lg relative w-full max-w-sm">
            <div className="bg-primary/5 absolute inset-0 -scale-y-110 transform rounded-full blur-3xl" />
            <img
              className="border-4 border-white relative aspect-[4/3] h-auto w-full rounded-[2rem] object-cover shadow-xl"
              src={NO_RESULTS_HERO}
              alt=""
            />
            <div className="bg-primary absolute -bottom-4 -right-4 rotate-3 transform rounded-2xl p-4 text-white shadow-lg">
              <span
                className="material-symbols-outlined text-4xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant_menu
              </span>
            </div>
          </div>
          <h1 className="mb-md text-on-surface font-display-lg text-display-lg">No perfect matches</h1>
          <p className="text-on-surface-variant font-body-md text-body-md mb-xl mx-auto max-w-md leading-relaxed">
            Even the best chefs sometimes start with a blank slate. We couldn&apos;t find exactly what
            you were looking for, but the perfect dish is still out there.
          </p>
          <div className="mb-2xl flex flex-col items-center gap-md sm:flex-row">
            <button
              className="text-on-primary font-title-sm bg-primary flex items-center gap-2 rounded-xl px-xl py-md shadow-lg transition-all active:scale-95 hover:brightness-110"
              type="button"
              onClick={onBack}
            >
              <span className="material-symbols-outlined">tune</span>
              Edit search filters
            </button>
            <button
              className="text-on-secondary-container font-title-sm bg-secondary-container rounded-xl px-xl py-md transition-all active:scale-95 hover:bg-secondary-fixed-dim"
              type="button"
              onClick={onBack}
            >
              Browse all dishes
            </button>
          </div>
          <div className="w-full">
            <p className="mb-lg text-on-surface-variant/70 font-label-caps text-label-caps uppercase tracking-widest">
              Try broadening your discovery
            </p>
            <div className="flex flex-wrap justify-center gap-sm">
              {(
                [
                  { icon: "local_fire_department" as const, t: "Trending Now" },
                  { icon: "restaurant" as const, t: "Any Cuisine" },
                  { icon: "distance" as const, t: "Nearby 5 miles" },
                  { icon: "star" as const, t: "Top Rated" },
                ] as const
              ).map((x) => (
                <button
                  key={x.t}
                  className="border-outline-variant/30 text-on-surface-variant bg-surface-container flex items-center gap-2 rounded-full border px-lg py-2 font-body-sm transition-colors hover:bg-primary-fixed hover:text-on-primary-fixed"
                  type="button"
                  onClick={onBack}
                >
                  <span className="text-lg material-symbols-outlined">{x.icon}</span>
                  {x.t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
