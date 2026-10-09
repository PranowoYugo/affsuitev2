import { NavLink, Outlet } from 'react-router'
import { Sparkles, Instagram } from 'lucide-react'

const NAV = [
  { to: '/', label: 'Beranda' },
  { to: '/shopee-analyzer', label: 'Shopee Analyzer' },
  { to: '/page-viral-finder', label: 'Page Viral Finder' },
]

export default function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--paper)]/85 backdrop-blur-md">
        <div className="relative mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <NavLink to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--paper)] shadow-[0_8px_24px_-8px_var(--accent)]">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </span>
            <span className="font-display text-xl font-bold tracking-tight text-[var(--ink)]">
              Aff<span className="text-[var(--accent)]">Suite</span>
            </span>
          </NavLink>

          <nav className="flex w-full flex-wrap items-center justify-center gap-1 sm:absolute sm:left-1/2 sm:top-1/2 sm:w-auto sm:-translate-x-1/2 sm:-translate-y-1/2">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-4 sm:py-2 sm:text-sm ${
                    isActive
                      ? 'bg-[var(--ink)] text-[var(--paper)]'
                      : 'text-[var(--ink-soft)] hover:bg-[var(--paper-2)] hover:text-[var(--ink)]'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <span className="hidden w-[104px] sm:block" aria-hidden="true" />
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-[var(--line)]">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-center sm:flex-row sm:px-6 sm:text-left">
          <p className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-[var(--ink-mute)]">
            AffSuite · Lokal · Privat · Tanpa Server
          </p>
          <p className="flex items-center gap-1.5 text-sm text-[var(--ink-soft)]">
            Credit:
            <a
              href="https://instagram.com/pranowoyugo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-[var(--accent)] underline-offset-4 transition-colors hover:text-[var(--accent-hover)] hover:underline"
            >
              <Instagram className="h-4 w-4" />
              Pranowo Yugo
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
