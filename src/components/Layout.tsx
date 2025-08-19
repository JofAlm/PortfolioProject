export default function Layout({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-black/30 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl tracking-wide">
              RET<span className="text-brand-500">OUCH</span>
            </span>
            {title && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                / {title}
              </span>
            )}
          </div>
          {/* plats för dark-mode toggle eller login-länk */}
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
      </main>

      <footer className="border-t border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
          © {new Date().getFullYear()} Ditt namn
        </div>
      </footer>
    </div>
  );
}
