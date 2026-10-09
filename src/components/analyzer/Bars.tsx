import type { BreakdownItem } from '@/lib/affiliate'
import { fmtNum, fmtRp } from '@/lib/affiliate'

interface Props {
  title: string
  items: BreakdownItem[]
  /** tampilkan nilai komisi per baris (mode komisi) */
  showKomisi?: boolean
}

export default function Bars({ title, items, showKomisi }: Props) {
  const max = Math.max(...items.map((i) => (showKomisi ? (i.komisi ?? 0) : i.count)), 1)
  return (
    <div className="border border-[var(--line)] bg-[var(--paper-2)]">
      <p className="font-mono2 border-b border-[var(--line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-mute)]">
        {title}
      </p>
      <div className="divide-y divide-[var(--line)]">
        {items.length === 0 && <p className="px-4 py-6 text-sm text-[var(--ink-mute)]">Belum ada data.</p>}
        {items.slice(0, 10).map((it) => {
          const v = showKomisi ? (it.komisi ?? 0) : it.count
          return (
            <div key={it.label} className="px-4 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] font-medium text-[var(--ink)]">{it.label}</span>
                <span className="font-mono2 shrink-0 text-[12px] text-[var(--ink-soft)]">
                  {showKomisi ? `${fmtRp(v)} · ` : ''}
                  {fmtNum(it.count)}
                  {showKomisi ? ' pesanan' : ''}
                </span>
              </div>
              <div className="mt-1.5 h-[5px] w-full bg-[var(--paper-2)]">
                <div
                  className="h-full bg-[var(--accent)] transition-[width] duration-500"
                  style={{ width: `${Math.max((v / max) * 100, 2)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
