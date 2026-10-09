import * as XLSX from 'xlsx'

export type DatasetKind = 'click' | 'komisi'

export interface BreakdownItem {
  label: string
  count: number
  komisi?: number
  gmv?: number
}

export interface ClickStats {
  totalKlik: number
  klikUnik: number
  byHour: number[]
  jamSibuk: number // 0-23, -1 jika tidak ada
  byTaglink: BreakdownItem[]
  byPlatform: BreakdownItem[]
}

export interface KomisiStats {
  totalPesanan: number
  totalItem: number
  komisiBersih: number
  gmv: number
  byTaglink: BreakdownItem[]
  byPlatform: BreakdownItem[]
}

export interface Dataset {
  kind: DatasetKind
  fileName: string
  importedAt: Date
  columns: string[]
  /** rows of cleaned cells; numbers already parsed for numeric columns */
  rows: (string | number)[][]
  numericCols: boolean[]
  duplicatesRemoved: number
  clickStats?: ClickStats
  komisiStats?: KomisiStats
}

const normHeader = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '')

const pad2 = (n: number) => String(n).padStart(2, '0')

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`

const cleanText = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : fmtDate(v)
  let s = String(v).replace(/\s+/g, ' ').trim()
  if (/^-+$/.test(s)) return ''
  s = s.replace(/-{2,}$/, '') // hapus filler "----" di akhir taglink
  return s
}

export const parseNum = (v: unknown): number => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0
  let s = cleanText(v)
  if (!s) return 0
  s = s.replace(/[%\s]/g, '')
  // Format Indonesia "1.234,56": titik ribuan + koma desimal
  if (/,\d{1,2}$/.test(s) && s.includes('.')) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else {
    s = s.replace(/,/g, '')
  }
  const n = parseFloat(s)
  return Number.isFinite(n) ? n : 0
}

/** kolom komisi yang dipertahankan: D, F, O, P, Q, R, S, AK, AP, AQ, AR, AS, AT, AU, AV */
const KOMISI_COLS: { idx: number; match: string; label: string; numeric?: boolean }[] = [
  { idx: 3, match: 'waktupemesanan', label: 'Waktu Pemesanan' },
  { idx: 5, match: 'waktuklik', label: 'Waktu Klik' },
  { idx: 14, match: 'l1kategoriglobal', label: 'Kategori L1' },
  { idx: 15, match: 'l2kategoriglobal', label: 'Kategori L2' },
  { idx: 16, match: 'l3kategoriglobal', label: 'Kategori L3' },
  { idx: 17, match: 'hargarp', label: 'Harga (Rp)', numeric: true },
  { idx: 18, match: 'jumlah', label: 'Jumlah', numeric: true },
  { idx: 36, match: 'komisibersihaffiliaterp', label: 'Komisi Bersih (Rp)', numeric: true },
  { idx: 41, match: 'taglink1', label: 'Taglink 1' },
  { idx: 42, match: 'taglink2', label: 'Taglink 2' },
  { idx: 43, match: 'taglink3', label: 'Taglink 3' },
  { idx: 44, match: 'taglink4', label: 'Taglink 4' },
  { idx: 45, match: 'taglink5', label: 'Taglink 5' },
  { idx: 46, match: 'platform', label: 'Platform' },
  { idx: 47, match: 'contenttype', label: 'Content Type' },
]

const CLICK_COLS: { match: string; label: string }[] = [
  { match: 'klikid', label: 'Klik ID' },
  { match: 'waktuklik', label: 'Waktu Klik' },
  { match: 'wilayahklik', label: 'Wilayah Klik' },
  { match: 'taglink', label: 'Taglink' },
  { match: 'perujuk', label: 'Platform' },
]

function findCol(headers: string[], match: string, fallbackIdx: number): number {
  const i = headers.findIndex((h) => normHeader(h) === match)
  if (i >= 0) return i
  return fallbackIdx < headers.length ? fallbackIdx : -1
}

export function detectKind(headers: string[]): DatasetKind | null {
  const norm = headers.map(normHeader)
  if (norm.includes('klikid')) return 'click'
  if (norm.includes('idpemesanan') || norm.some((h) => h.startsWith('komisibersih'))) return 'komisi'
  return null
}

function dedupeRows(rows: (string | number)[][]): { rows: (string | number)[][]; removed: number } {
  const seen = new Set<string>()
  const out: (string | number)[][] = []
  for (const r of rows) {
    const key = JSON.stringify(r)
    if (!seen.has(key)) {
      seen.add(key)
      out.push(r)
    }
  }
  return { rows: out, removed: rows.length - out.length }
}

const hourOf = (waktu: string): number => {
  const m = waktu.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
  if (!m) return -1
  const h = parseInt(m[1], 10)
  return h >= 0 && h <= 23 ? h : -1
}

function buildClickStats(rows: (string | number)[][]): ClickStats {
  const ids = new Set<string>()
  const byHour = new Array(24).fill(0)
  const tag = new Map<string, number>()
  const plat = new Map<string, number>()
  for (const r of rows) {
    const id = String(r[0] ?? '')
    if (id) ids.add(id)
    const h = hourOf(String(r[1] ?? ''))
    if (h >= 0) byHour[h]++
    const t = String(r[3] ?? '') || 'Tanpa Taglink'
    tag.set(t, (tag.get(t) ?? 0) + 1)
    const p = String(r[4] ?? '') || 'Tidak Diketahui'
    plat.set(p, (plat.get(p) ?? 0) + 1)
  }
  let jamSibuk = -1
  let max = 0
  byHour.forEach((c, h) => {
    if (c > max) {
      max = c
      jamSibuk = h
    }
  })
  const toItems = (m: Map<string, number>): BreakdownItem[] =>
    [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count)
  return { totalKlik: rows.length, klikUnik: ids.size, byHour, jamSibuk, byTaglink: toItems(tag), byPlatform: toItems(plat) }
}

function buildKomisiStats(rows: (string | number)[][]): KomisiStats {
  let komisiBersih = 0
  let gmv = 0
  let totalItem = 0
  const tag = new Map<string, BreakdownItem>()
  const plat = new Map<string, BreakdownItem>()
  for (const r of rows) {
    const harga = Number(r[5]) || 0
    const jumlah = Number(r[6]) || 0
    const komisi = Number(r[7]) || 0
    const rowGmv = harga * jumlah
    komisiBersih += komisi
    gmv += rowGmv
    totalItem += jumlah
    const tags = [r[8], r[9], r[10], r[11], r[12]].map((t) => String(t ?? '')).filter(Boolean)
    const tagLabel = tags.length ? tags.join(' + ') : 'Tanpa Taglink'
    const t = tag.get(tagLabel) ?? { label: tagLabel, count: 0, komisi: 0, gmv: 0 }
    t.count++
    t.komisi = (t.komisi ?? 0) + komisi
    t.gmv = (t.gmv ?? 0) + rowGmv
    tag.set(tagLabel, t)
    const pLabel = String(r[13] ?? '') || 'Tidak Diketahui'
    const p = plat.get(pLabel) ?? { label: pLabel, count: 0, komisi: 0, gmv: 0 }
    p.count++
    p.komisi = (p.komisi ?? 0) + komisi
    p.gmv = (p.gmv ?? 0) + rowGmv
    plat.set(pLabel, p)
  }
  const sortK = (arr: BreakdownItem[]) => arr.sort((a, b) => (b.komisi ?? 0) - (a.komisi ?? 0))
  return {
    totalPesanan: rows.length,
    totalItem,
    komisiBersih,
    gmv,
    byTaglink: sortK([...tag.values()]),
    byPlatform: sortK([...plat.values()]),
  }
}

export async function parseFile(file: File): Promise<Dataset> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: true })
  if (aoa.length < 2) throw new Error('File kosong atau tidak memiliki data.')

  const headers = aoa[0].map((h) => cleanText(h))
  const kind = detectKind(headers)
  if (!kind) throw new Error('Format tidak dikenali. Gunakan file ekspor Klik atau Komisi Shopee Affiliate.')

  let columns: string[]
  let numericCols: boolean[]
  let rawRows: (string | number)[][]

  if (kind === 'click') {
    const idx = CLICK_COLS.map((c) => findCol(headers, c.match, headers.indexOf(c.label)))
    columns = CLICK_COLS.map((c) => c.label)
    numericCols = columns.map(() => false)
    rawRows = aoa
      .slice(1)
      .filter((r) => r.some((c) => cleanText(c)))
      .map((r) => idx.map((i) => (i >= 0 ? cleanText(r[i]) : '')))
  } else {
    const idx = KOMISI_COLS.map((c) => findCol(headers, c.match, c.idx))
    columns = KOMISI_COLS.map((c) => c.label)
    numericCols = KOMISI_COLS.map((c) => !!c.numeric)
    rawRows = aoa
      .slice(1)
      .filter((r) => r.some((c) => cleanText(c)))
      .map((r) =>
        idx.map((i, ci) => {
          const spec = KOMISI_COLS[ci]
          if (i < 0) return spec.numeric ? 0 : ''
          return spec.numeric ? parseNum(r[i]) : cleanText(r[i])
        }),
      )
  }

  const { rows, removed } = dedupeRows(rawRows)

  const ds: Dataset = {
    kind,
    fileName: file.name,
    importedAt: new Date(),
    columns,
    rows,
    numericCols,
    duplicatesRemoved: removed,
  }
  if (kind === 'click') ds.clickStats = buildClickStats(rows)
  else ds.komisiStats = buildKomisiStats(rows)
  return ds
}

export function exportCleaned(ds: Dataset) {
  const aoa: (string | number)[][] = [ds.columns, ...ds.rows]
  const ws = XLSX.utils.aoa_to_sheet(aoa)
  ws['!cols'] = ds.columns.map((c, i) => ({
    wch: Math.min(Math.max(c.length + 2, ...ds.rows.slice(0, 200).map((r) => String(r[i] ?? '').length + 2)), 40),
  }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, ds.kind === 'click' ? 'Klik Rapi' : 'Komisi Rapi')
  const base = ds.fileName.replace(/\.(csv|xlsx|xls)$/i, '')
  XLSX.writeFile(wb, `${base}-rapi.xlsx`)
}

const idNum = new Intl.NumberFormat('id-ID')
export const fmtNum = (n: number) => idNum.format(Math.round(n))
export const fmtRp = (n: number) => 'Rp' + idNum.format(Math.round(n))
export const fmtHour = (h: number) => (h < 0 ? '—' : `${String(h).padStart(2, '0')}:00–${String((h + 1) % 24).padStart(2, '0')}:00`)
