import { Link } from 'react-router'
import { ArrowUpRight, BarChart3, Flame, ShieldCheck, Smartphone } from 'lucide-react'

const TOOLS = [
  {
    to: '/shopee-analyzer',
    icon: <BarChart3 className="h-7 w-7" strokeWidth={1.8} />,
    title: 'Shopee Analyzer',
    desc: 'Impor laporan ekspor Shopee Affiliate — komisi & klik — lalu lihat statistik utama, grafik sumber taglink, platform, jam sibuk, dan perbandingan dua periode berdampingan.',
    tags: ['Komisi', 'Klik', 'Perbandingan A/B'],
  },
  {
    to: '/page-viral-finder',
    icon: <Flame className="h-7 w-7" strokeWidth={1.8} />,
    title: 'Page Viral Finder',
    desc: 'Butuh Data Page Viral Finder dari corafeed. Unggah file data postingan, lalu temukan konten paling viral lewat skor, filter, pencarian, dan grid interaktif.',
    tags: ['Skor Viral', 'Filter & Cari', 'Ekspor CSV'],
  },
]

export default function Landing() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-4 pt-14 sm:px-6 sm:pt-24">
      {/* Hero */}
      <section className="rise mx-auto max-w-3xl text-center">
        <p className="font-mono2 text-[11px] font-medium uppercase tracking-[0.3em] text-[var(--accent)]">
          Suite Analitik Affiliate
        </p>
        <h1 className="font-display mt-4 text-5xl font-bold leading-[1.05] tracking-tight text-[var(--ink)] sm:text-7xl">
          Aff<span className="text-[var(--accent)]">Suite</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg">
          Dua alat analitik dalam satu suite — rapikan dan bedah data Shopee Affiliate,
          serta temukan postingan paling viral dari halaman Anda. Semua diproses lokal di browser.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-medium text-[var(--ink-mute)]">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-2">
            <ShieldCheck className="h-4 w-4 text-[var(--accent)]" /> 100% Privat — tanpa server
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-2">
            <Smartphone className="h-4 w-4 text-[var(--accent)]" /> Responsif di HP & PC
          </span>
        </div>
      </section>

      {/* Menu tools */}
      <section className="mx-auto mt-14 grid max-w-4xl gap-5 sm:mt-20 md:grid-cols-2">
        {TOOLS.map((t, i) => (
          <Link
            key={t.to}
            to={t.to}
            className={`group rise ${i === 1 ? 'rise-1' : ''} relative flex flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--paper-2)] p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/50 hover:shadow-[0_24px_60px_-24px_var(--shadow-card)]`}
          >
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--accent)]/10 blur-2xl" />
            <div className="flex items-start justify-between">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-colors duration-300 group-hover:bg-[var(--accent)] group-hover:text-[var(--paper)]">
                {t.icon}
              </span>
              <ArrowUpRight className="h-5 w-5 text-[var(--ink-mute)] transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[var(--accent)]" />
            </div>
            <h2 className="font-display mt-5 text-2xl font-bold text-[var(--ink)]">{t.title}</h2>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--ink-soft)]">{t.desc}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[var(--line)] px-3 py-1 text-[11px] font-medium text-[var(--ink-mute)]">
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
