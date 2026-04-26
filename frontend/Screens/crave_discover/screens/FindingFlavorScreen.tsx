import { SiteFooter } from "../components/SiteFooter";

function SkeletonCard() {
  return (
    <div className="border-outline-variant bg-surface-container-lowest overflow-hidden rounded-xl border shadow-sm">
      <div className="skeleton h-48 w-full" />
      <div className="space-y-3 p-4">
        <div className="h-6 w-3/4 rounded skeleton" />
        <div className="flex gap-2">
          <div className="h-4 w-16 rounded skeleton" />
          <div className="h-4 w-16 rounded skeleton" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 w-20 rounded skeleton" />
          <div className="h-8 w-24 rounded-lg skeleton" />
        </div>
      </div>
    </div>
  );
}

export function FindingFlavorScreen() {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-8">
            <span className="text-display-lg font-black tracking-tighter text-orange-600 text-2xl dark:text-orange-500">
              AIroma
            </span>
            <nav className="hidden items-center gap-6 md:flex">
              <a
                className="border-b-2 border-orange-600 pb-1 text-base font-bold text-orange-600 font-epilogue dark:text-orange-500"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Discover
              </a>
              <a
                className="text-base font-medium text-slate-600 transition-all hover:text-orange-500 font-epilogue hover:bg-slate-50"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Trending
              </a>
              <a
                className="text-base font-medium text-slate-600 transition-all hover:text-orange-500 font-epilogue hover:bg-slate-50"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Collections
              </a>
              <a
                className="text-base font-medium text-slate-600 transition-all hover:text-orange-500 font-epilogue hover:bg-slate-50"
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                Nearby
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="border-outline-variant hidden w-80 items-center rounded-full border bg-surface-container px-4 py-2 opacity-60 lg:flex">
              <span className="text-outline material-symbols-outlined">search</span>
              <span className="ml-2 font-body-sm text-outline">Searching for culinary inspiration…</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="cursor-not-allowed p-2 text-slate-600 opacity-50 dark:text-slate-400"
                type="button"
                disabled
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button
                className="cursor-not-allowed p-2 text-slate-600 opacity-50 dark:text-slate-400"
                type="button"
                disabled
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-24 rounded-full opacity-60 skeleton" />
            <div className="h-10 w-28 rounded-full opacity-60 skeleton" />
            <div className="h-10 w-20 rounded-full opacity-60 skeleton" />
            <div className="h-10 w-32 rounded-full opacity-60 skeleton" />
          </div>
          <div className="h-10 w-40 rounded-lg opacity-40 skeleton" />
        </div>
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-6">
            <div className="skeleton mb-6 h-8 w-64 rounded-md" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-2">
              <SkeletonCard />
              <div className="border-outline-variant bg-surface-container-lowest overflow-hidden rounded-xl border shadow-sm">
                <div className="skeleton h-48 w-full" />
                <div className="space-y-3 p-4">
                  <div className="h-6 w-1/2 rounded skeleton" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 rounded skeleton" />
                    <div className="h-4 w-16 rounded skeleton" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-24 rounded skeleton" />
                    <div className="h-8 w-24 rounded-lg skeleton" />
                  </div>
                </div>
              </div>
              <div className="border-outline-variant bg-surface-container-lowest overflow-hidden rounded-xl border shadow-sm">
                <div className="skeleton h-48 w-full" />
                <div className="space-y-3 p-4">
                  <div className="h-6 w-2/3 rounded skeleton" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 rounded skeleton" />
                    <div className="h-4 w-16 rounded skeleton" />
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-5 w-16 rounded skeleton" />
                    <div className="h-8 w-24 rounded-lg skeleton" />
                  </div>
                </div>
              </div>
              <SkeletonCard />
            </div>
          </div>
          <div className="hidden lg:block lg:w-[400px] xl:w-[450px]">
            <div className="skeleton border-outline-variant sticky top-24 h-[calc(100vh-160px)] w-full overflow-hidden rounded-2xl border">
              <div className="text-outline-variant absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <span className="text-outline material-symbols-outlined text-6xl">map</span>
                  <span className="text-title-sm font-title-sm">Loading culinary map…</span>
                </div>
              </div>
              <div className="skeleton border-outline absolute left-1/3 top-1/4 h-8 w-8 rounded-full border-2 border-white shadow-lg" />
              <div className="skeleton border-outline absolute left-2/3 top-1/2 h-8 w-8 rounded-full border-2 border-white shadow-lg" />
              <div className="skeleton border-outline absolute bottom-1/3 left-1/4 h-8 w-8 rounded-full border-2 border-white shadow-lg" />
              <div className="skeleton border-outline absolute left-1/2 top-2/3 h-8 w-8 rounded-full border-2 border-white shadow-lg" />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
