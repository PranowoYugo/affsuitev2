interface Props {
  label: string
  value: string
  sub?: string
  accent?: boolean
}

export default function Stat({ label, value, sub, accent }: Props) {
  return (
    <div className={`border border-[var(--line)] px-4 py-4 sm:px-5 ${accent ? 'bg-[var(--accent)] text-[var(--paper)]' : 'bg-[var(--paper-2)]'}`}>
      <p
        className={`font-mono2 text-[10px] font-medium uppercase tracking-[0.18em] ${
          accent ? 'text-[var(--paper)]/70' : 'text-[var(--ink-mute)]'
        }`}
      >
        {label}
      </p>
      <p
        className={`font-mono2 mt-2 text-xl font-semibold leading-none sm:text-2xl lg:text-[28px] ${
          accent ? 'text-[var(--accent)]' : 'text-[var(--ink)]'
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className={`mt-2 text-[11px] leading-snug ${accent ? 'text-[var(--paper)]/70' : 'text-[var(--ink-mute)]'}`}>{sub}</p>
      )}
    </div>
  )
}
