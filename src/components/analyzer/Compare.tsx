import type { BreakdownItem, Dataset } from '@/lib/affiliate'
import { fmtHour, fmtNum, fmtRp } from '@/lib/affiliate'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface Props {
  a: Dataset
  b: Dataset
}

interface MetricRow {
  label: string
  a: number | string
  b: number | string
  money?: boolean
}

function Delta({ a, b }: { a: number; b: number }) {
  const diff = b - a
  if (diff === 0)
    return (
      <span className="font-mono2 inline-flex items-center gap-1 text-[var(--ink-mute)]">
        <Minus size={12} /> 0
      </span>
    )
  const pct = a !== 0 ? (diff / Math.abs(a)) * 100 : 0
  const up = diff > 0
  return (
    <span
      className={`font-mono2 inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold ${
        up ? 'bg-[var(--up-bg)] text-[var(--up)]' : 'bg-[var(--down-bg)] text-[var(--down)]'
      }`}
    >
      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
      {up ? '+' : ''}
      {fmtNum(diff)}
      {a !== 0 && ` (${up ? '+' : ''}${pct.toFixed(1)}%)`}
    </span>
  )
}

function metricsOf(a: Dataset, b: Dataset): MetricRow[] {
  if (a.kind === 'komisi' && a.komisiStats && b.komisiStats) {
    const sa = a.komisiStats
    const sb = b.komisiStats
    return [
      { label: 'Komisi Bersih', a: sa.komisiBersih, b: sb.komisiBersih, money: true },
      { label: 'Nilai Penjualan (GMV)', a: sa.gmv, b: sb.gmv, money: true },
      { label: 'Total Pesanan', a: sa.totalPesanan, b: sb.totalPesanan },
      { label: 'Total Item Terjual', a: sa.totalItem, b: sb.totalItem },
      {
        label: 'Komisi per Pesanan',
        a: sa.totalPesanan ? sa.komisiBersih / sa.totalPesanan : 0,
        b: sb.totalPesanan ? sb.komisiBersih / sb.totalPesanan : 0,
        money: true,
      },
      {
        label: 'Sumber Taglink Teratas',
        a: sa.byTaglink[0]?.label ?? '—',
        b: sb.byTaglink[0]?.label ?? '—',
      },
      { label: 'Platform Teratas', a: sa.byPlatform[0]?.label ?? '—', b: sb.byPlatform[0]?.label ?? '—' },
    ]
  }
  const sa = a.clickStats!
  const sb = b.clickStats!
  return [
    { label: 'Total Klik', a: sa.totalKlik, b: sb.totalKlik },
    { label: 'Klik Unik', a: sa.klikUnik, b: sb.klikUnik },
    { label: 'Jam Sibuk', a: fmtHour(sa.jamSibuk), b: fmtHour(sb.jamSibuk) },
    { label: 'Sumber Taglink Teratas', a: sa.byTaglink[0]?.label ?? '—', b: sb.byTaglink[0]?.label ?? '—' },
    { label: 'Platform Teratas', a: sa.byPlatform[0]?.label ?? '—', b: sb.byPlatform[0]?.label ?? '—' },
  ]
}

function CompareBreakdown({ title, ia, ib }: { title: string; ia: BreakdownItem[]; ib: BreakdownItem[] }) {
  const labels = [...new Set([...ia.map((i) => i.label), ...ib.map((i) => i.label)])]
  const mapA = new Map(ia.map((i) => [i.label, i.count]))
  const mapB = new Map(ib.map((i) => [i.label, i.count]))
  const rows = labels
    .map((label) => ({ label, a: mapA.get(label) ?? 0, b: mapB.get(label) ?? 0 }))
    .sort((x, y) => y.a + y.b - (x.a + x.b))
    .slice(0, 10)
  const max = Math.max(...rows.flatMap((r) => [r.a, r.b]), 1)
  return (
    <div className="border border-[var(--line)] bg-white">
      <p className="font-mono2 border-b border-[var(--line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-mute)]">
        {title}
      </p>
      <div className="divide-y divide-[var(--line)]">
        {rows.map((r) => (
          <div key={r.label} className="px-4 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-[13px] font-medium text-[var(--ink)]">{r.label}</span>
              <span className="font-mono2 shrink-0 text-[11px] text-[var(--ink-soft)]">
                <span className="text-[var(--ink)]">{fmtNum(r.a)}</span>
                <span className="text-[var(--ink-mute)]"> → </span>
                <span className="text-[var(--accent)]">{fmtNum(r.b)}</span>
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              <div className="h-[4px] w-full bg-[var(--paper-2)]">
                <div className="h-full bg-[var(--ink)]" style={{ width: `${Math.max((r.a / max) * 100, r.a ? 2 : 0)}%` }} />
              </div>
              <div className="h-[4px] w-full bg-[var(--paper-2)]">
                <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.max((r.b / max) * 100, r.b ? 2 : 0)}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="font-mono2 border-t border-[var(--line)] px-4 py-2 text-[10px] text-[var(--ink-mute)]">
        <span className="mr-3 inline-flex items-center gap-1"><span className="inline-block h-2 w-2 bg-[var(--ink)]" /> Data A</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block h-2 w-2 bg-[var(--accent)]" /> Data B</span>
      </p>
    </div>
  )
}

export default function Compare({ a, b }: Props) {
  const metrics = metricsOf(a, b)
  const isKomisi = a.kind === 'komisi'
  return (
    <section className="rise rise-2 mt-10">
      <div className="mb-4 flex items-center gap-3">
        <h2 className="font-mono2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]">
          Perbandingan — Data A vs Data B
        </h2>
        <div className="h-px flex-1 bg-[var(--line)]" />
      </div>

      <div className="overflow-x-auto border border-[var(--line)] bg-white">
        <table className="data-table">
          <thead>
            <tr>
              <th className="!cursor-default">Metrik</th>
              <th className="!cursor-default">Data A</th>
              <th className="!cursor-default">Data B</th>
              <th className="!cursor-default">Selisih (B − A)</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((m) => {
              const numeric = typeof m.a === 'number' && typeof m.b === 'number'
              return (
                <tr key={m.label}>
                  <td className="font-medium">{m.label}</td>
                  <td className="num">{numeric ? (m.money ? fmtRp(m.a as number) : fmtNum(m.a as number)) : String(m.a)}</td>
                  <td className="num">{numeric ? (m.money ? fmtRp(m.b as number) : fmtNum(m.b as number)) : String(m.b)}</td>
                  <td>{numeric ? <Delta a={m.a as number} b={m.b as number} /> : <span className="text-[var(--ink-mute)]">—</span>}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <CompareBreakdown
          title="Sumber Taglink — A vs B"
          ia={isKomisi ? a.komisiStats!.byTaglink : a.clickStats!.byTaglink}
          ib={isKomisi ? b.komisiStats!.byTaglink : b.clickStats!.byTaglink}
        />
        <CompareBreakdown
          title="Platform — A vs B"
          ia={isKomisi ? a.komisiStats!.byPlatform : a.clickStats!.byPlatform}
          ib={isKomisi ? b.komisiStats!.byPlatform : b.clickStats!.byPlatform}
        />
      </div>
    </section>
  )
}
