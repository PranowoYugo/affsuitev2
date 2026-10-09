import { fmtNum } from '@/lib/affiliate'

interface Props {
  byHour: number[]
  jamSibuk: number
}

export default function Hours({ byHour, jamSibuk }: Props) {
  const max = Math.max(...byHour, 1)
  return (
    <div className="border border-[var(--line)] bg-[var(--paper-2)]">
      <p className="font-mono2 border-b border-[var(--line)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-mute)]">
        Distribusi Jam Klik
      </p>
      <div className="px-4 py-4">
        <div className="flex h-28 items-end gap-[3px] sm:h-32">
          {byHour.map((c, h) => (
            <div key={h} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className={`w-full transition-colors ${h === jamSibuk ? 'bg-[var(--accent)]' : 'bg-[var(--ink)] group-hover:bg-[var(--accent)]'}`}
                style={{ height: `${Math.max((c / max) * 100, c > 0 ? 4 : 1.5)}%` }}
              />
              <div className="font-mono2 pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap bg-[var(--ink)] px-1.5 py-0.5 text-[10px] text-[var(--paper)] opacity-0 transition-opacity group-hover:opacity-100">
                {String(h).padStart(2, '0')}:00 · {fmtNum(c)}
              </div>
            </div>
          ))}
        </div>
        <div className="font-mono2 mt-2 flex justify-between text-[10px] text-[var(--ink-mute)]">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
      </div>
    </div>
  )
}
