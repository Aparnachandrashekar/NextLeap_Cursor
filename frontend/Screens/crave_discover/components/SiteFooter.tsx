export function SiteFooter() {
  return (
    <footer className="w-full rounded-none border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 sm:px-8 md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <span className="text-lg font-bold text-orange-600 dark:text-orange-500">AIroma</span>
          <p className="font-epilogue text-sm text-slate-500 dark:text-slate-400">
            © 2024 AIroma. Effortless culinary discovery.
          </p>
        </div>
        <div className="flex gap-8">
          <a
            className="font-epilogue text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            About Us
          </a>
          <a
            className="font-epilogue text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Privacy
          </a>
          <a
            className="font-epilogue text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Terms
          </a>
          <a
            className="font-epilogue text-sm text-slate-500 underline-offset-4 transition-colors duration-200 hover:text-orange-600 hover:underline dark:text-slate-400 dark:hover:text-orange-400"
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            Partner Support
          </a>
        </div>
      </div>
    </footer>
  );
}
