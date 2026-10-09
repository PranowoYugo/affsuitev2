import { ArrowDownWideNarrow, Download, FileBarChart, Heart, MessageCircle, Search, Share2, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { SortKey, ViralPost } from '@/types/post'
import { exportCsv, formatNum } from '@/lib/viral'
import PostCard from '@/components/viral/PostCard'

interface Props {
  posts: ViralPost[]
  fileName: string
  onReset: () => void
}

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'score', label: 'Paling viral' },
  { value: 'likes', label: 'Suka terbanyak' },
  { value: 'comments', label: 'Komentar terbanyak' },
  { value: 'shares', label: 'Share terbanyak' },
  { value: 'newest', label: 'Terbaru' },
  { value: 'oldest', label: 'Terlama' },
]

export default function DashboardSection({ posts, fileName, onReset }: Props) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('Semua')
  const [sort, setSort] = useState<SortKey>('score')

  const types = useMemo(() => {
    const set = new Set(posts.map((p) => p.type))
    return ['Semua', ...Array.from(set).sort()]
  }, [posts])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = posts.filter((p) => {
      const matchType = typeFilter === 'Semua' || p.type === typeFilter
      const matchQuery =
        !q ||
        p.content.toLowerCase().includes(q) ||
        p.postUrl.toLowerCase().includes(q) ||
        p.postId.toLowerCase().includes(q)
      return matchType && matchQuery
    })
    const byNum = (k: 'score' | 'likes' | 'comments' | 'shares') =>
      [...list].sort((a, b) => b[k] - a[k])
    switch (sort) {
      case 'score': return byNum('score')
      case 'likes': return byNum('likes')
      case 'comments': return byNum('comments')
      case 'shares': return byNum('shares')
      case 'newest':
        return [...list].sort((a, b) => (b.createdTs ?? 0) - (a.createdTs ?? 0))
      case 'oldest':
        return [...list].sort((a, b) => (a.createdTs ?? Infinity) - (b.createdTs ?? Infinity))
    }
  }, [posts, query, typeFilter, sort])

  // Peringkat viral dihitung dari seluruh data (bukan hasil filter)
  const rankOf = useMemo(() => {
    const sorted = [...posts].sort((a, b) => b.score - a.score)
    const map = new Map<string, number>()
    sorted.forEach((p, i) => map.set(p.postId + p.postUrl, i + 1))
    return map
  }, [posts])

  const totals = useMemo(
    () =>
      posts.reduce(
        (acc, p) => ({
          likes: acc.likes + p.likes,
          comments: acc.comments + p.comments,
          shares: acc.shares + p.shares,
        }),
        { likes: 0, comments: 0, shares: 0 },
      ),
    [posts],
  )

  return (
    <div className="space-y-6">
      {/* Ringkasan */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryCard icon={<FileBarChart className="h-5 w-5" />} label="Postingan" value={posts.length} />
        <SummaryCard icon={<Heart className="h-5 w-5" />} label="Total Suka" value={totals.likes} />
        <SummaryCard icon={<MessageCircle className="h-5 w-5" />} label="Total Komentar" value={totals.comments} />
        <SummaryCard icon={<Share2 className="h-5 w-5" />} label="Total Share" value={totals.shares} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3 sm:p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari caption, link, atau ID postingan…"
              className="h-11 w-full rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--ink)]/35 focus:border-[var(--accent)]"
            />
          </label>
          <label className="relative md:w-56">
            <ArrowDownWideNarrow className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="h-11 w-full appearance-none rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] pl-11 pr-4 text-sm font-medium outline-none focus:border-[var(--accent)]"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => exportCsv(filtered)}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--accent-hover)] md:flex-none"
            >
              <Download className="h-4 w-4" />
              Unduh CSV Rapi
            </button>
            <button
              onClick={onReset}
              title="Ganti file"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--ink)]/15 text-[var(--ink)]/70 transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter tipe */}
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`min-h-[36px] rounded-full px-4 text-xs font-semibold transition-colors ${
                typeFilter === t
                  ? 'bg-[var(--ink)] text-[var(--paper)]'
                  : 'border border-[var(--ink)]/15 text-[var(--ink)]/60 hover:border-[var(--ink)]/40'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-[var(--ink)]/50">
        <span className="font-semibold text-[var(--ink)]">{fileName}</span> — menampilkan{' '}
        <span className="font-semibold text-[var(--ink)]">{filtered.length}</span> dari {posts.length} postingan
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((p) => (
            <PostCard key={p.postId + p.postUrl} post={p} rank={rankOf.get(p.postId + p.postUrl)} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[var(--ink)]/10 bg-white py-16 text-center">
          <p className="font-display text-lg font-semibold text-[var(--ink)]">Tidak ada hasil</p>
          <p className="mt-1 text-sm text-[var(--ink)]/50">Coba ubah kata kunci atau filter tipe postingan.</p>
        </div>
      )}
    </div>
  )
}

function SummaryCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-[var(--ink)]/10 bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-[var(--accent)]">{icon}</div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums text-[var(--ink)] sm:text-3xl">
        {formatNum(value)}
      </div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-[var(--ink)]/45">{label}</div>
    </div>
  )
}
