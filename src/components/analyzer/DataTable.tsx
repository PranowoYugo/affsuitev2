import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { fmtNum } from '@/lib/affiliate'

interface Props {
  columns: string[]
  rows: (string | number)[][]
  numericCols: boolean[]
  /** Dipanggil setiap kali urutan baris berubah (sortir), agar halaman bisa mengekspor PDF sesuai urutan ini. */
  onSortedChange?: (sortedRows: (string | number)[][], sortCol: number, dir: SortDir, columns: string[]) => void
}

type SortDir = 'asc' | 'desc'

export default function DataTable({ columns, rows, numericCols, onSortedChange }: Props) {
  const [sortCol, setSortCol] = useState<number>(-1)
  const [dir, setDir] = useState<SortDir>('asc')

  const sorted = useMemo(() => {
    if (sortCol < 0) return rows
    const numeric = numericCols[sortCol]
    const copy = [...rows]
    copy.sort((a, b) => {
      const av = a[sortCol]
      const bv = b[sortCol]
      let cmp: number
      if (numeric) cmp = (Number(av) || 0) - (Number(bv) || 0)
      else cmp = String(av ?? '').localeCompare(String(bv ?? ''), 'id')
      return dir === 'asc' ? cmp : -cmp
    })
    return copy
  }, [rows, sortCol, dir, numericCols])

  useEffect(() => {
    onSortedChange?.(sorted, sortCol, dir, columns)
  }, [sorted, sortCol, dir, columns, onSortedChange])

  const toggleSort = (i: number) => {
    if (sortCol === i) {
      if (dir === 'asc') setDir('desc')
      else {
        setSortCol(-1)
        setDir('asc')
      }
    } else {
      setSortCol(i)
      setDir(numericCols[i] ? 'desc' : 'asc')
    }
  }

  return (
    <div className="overflow-x-auto border border-[var(--line)] bg-[var(--paper-2)]" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th className="!cursor-default">#</th>
            {columns.map((c, i) => (
              <th key={c} onClick={() => toggleSort(i)} title={`Urutkan berdasarkan ${c}`}>
                <span className="inline-flex items-center gap-1.5">
                  {c}
                  {sortCol === i ? (
                    dir === 'asc' ? (
                      <ArrowUp size={12} className="text-[var(--accent)]" />
                    ) : (
                      <ArrowDown size={12} className="text-[var(--accent)]" />
                    )
                  ) : (
                    <ArrowUpDown size={12} className="opacity-40" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, ri) => (
            <tr key={ri}>
              <td className="text-[var(--ink-mute)]">{ri + 1}</td>
              {r.map((cell, ci) => (
                <td key={ci} className={numericCols[ci] ? 'num' : ''}>
                  {numericCols[ci] ? fmtNum(Number(cell) || 0) : String(cell ?? '') || '—'}
                </td>
              ))}
            </tr>
          ))}
          {sorted.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className="py-8 text-center text-[var(--ink-mute)]">
                Tidak ada data.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
