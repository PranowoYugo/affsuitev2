import { useRef, useState } from 'react'
import { Download, FileSpreadsheet, Trash2, Upload } from 'lucide-react'
import type { Dataset } from '@/lib/affiliate'
import { fmtNum } from '@/lib/affiliate'

interface Props {
  slot: 'A' | 'B'
  dataset: Dataset | null
  onFile: (f: File) => void
  onClear: () => void
  onExport: () => void
}

export default function UploadSlot({ slot, dataset, onFile, onClear, onExport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [drag, setDrag] = useState(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onFile(f)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={`border transition-colors ${
        drag ? 'border-[var(--accent)] bg-[var(--accent-soft)]' : 'border-[var(--line)] bg-[var(--paper-2)]'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />

      <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5">
        <span className="font-mono2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-mute)]">
          Data {slot}
        </span>
        {dataset && (
          <button
            onClick={onClear}
            aria-label={`Hapus Data ${slot}`}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center text-[var(--ink-mute)] transition-colors hover:text-[var(--down)]"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {dataset ? (
        <div className="px-4 py-4">
          <div className="flex items-start gap-3">
            <FileSpreadsheet size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{dataset.fileName}</p>
              <p className="font-mono2 mt-1 text-[11px] text-[var(--ink-mute)]">
                {fmtNum(dataset.rows.length)} baris
                {dataset.duplicatesRemoved > 0 && ` · ${dataset.duplicatesRemoved} duplikat dibersihkan`}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={onExport}
              className="flex min-h-[44px] flex-1 items-center justify-center gap-2 bg-[var(--ink)] px-3 text-xs font-medium text-[var(--paper)] transition-colors hover:bg-[var(--accent)]"
            >
              <Download size={14} /> Unduh Versi Rapi
            </button>
            <button
              onClick={() => inputRef.current?.click()}
              className="flex min-h-[44px] items-center justify-center border border-[var(--line)] px-4 text-xs font-medium text-[var(--ink-soft)] transition-colors hover:border-[var(--ink)]"
            >
              Ganti
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[132px] w-full flex-col items-center justify-center gap-2 px-4 py-6 text-center"
        >
          <Upload size={20} className="text-[var(--ink-mute)]" />
          <span className="text-sm font-medium text-[var(--ink-soft)]">
            Tarik & letakkan file, atau ketuk untuk memilih
          </span>
          <span className="font-mono2 text-[11px] text-[var(--ink-mute)]">.csv / .xlsx ekspor Shopee Affiliate</span>
        </button>
      )}
    </div>
  )
}
