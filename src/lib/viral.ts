import * as XLSX from 'xlsx'
import type { ViralPost } from '@/types/post'

/** Normalisasi nama kolom: huruf kecil, tanpa spasi/simbol */
function norm(s: string): string {
  return String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

const COLUMN_MAP: Record<keyof Omit<ViralPost, 'createdTs' | 'score'>, string[]> = {
  postId: ['postid', 'id', 'idpost'],
  type: ['type', 'tipe', 'jenis'],
  created: ['created', 'date', 'tanggal', 'createdat', 'waktu', 'posted'],
  likes: ['likes', 'like', 'suka', 'reactions', 'reaksi'],
  comments: ['comments', 'comment', 'komentar'],
  shares: ['shares', 'share', 'bagikan', 'dibagikan'],
  postUrl: ['posturl', 'link', 'linkpost', 'urlpost', 'postlink', 'url'],
  content: ['content', 'caption', 'konten', 'deskripsi', 'contentcaption', 'text'],
  imageUrl: ['imageurl', 'image', 'gambar', 'urlgambar', 'thumbnail', 'imgurl', 'imageurl', 'foto'],
}

function toNum(v: unknown): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v
  const n = parseInt(String(v ?? '').replace(/[^\d-]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

function parseCreated(raw: string): number | null {
  if (!raw) return null
  // Normalisasi timezone "+0000" -> "+00:00" agar bisa diparse Date
  const fixed = raw.trim().replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  const t = Date.parse(fixed)
  return Number.isNaN(t) ? null : t
}

function mapRow(row: Record<string, unknown>): ViralPost | null {
  const keys = Object.keys(row)
  const lookup = new Map<string, unknown>()
  for (const k of keys) lookup.set(norm(k), row[k])

  const pick = (aliases: string[]): unknown => {
    for (const a of aliases) {
      if (lookup.has(a)) return lookup.get(a)
    }
    return undefined
  }

  const postId = String(pick(COLUMN_MAP.postId) ?? '').trim()
  const postUrl = String(pick(COLUMN_MAP.postUrl) ?? '').trim()
  const content = String(pick(COLUMN_MAP.content) ?? '').trim()

  // Baris dianggap valid jika minimal punya link atau konten
  if (!postUrl && !content && !postId) return null

  const created = String(pick(COLUMN_MAP.created) ?? '').trim()
  const likes = toNum(pick(COLUMN_MAP.likes))
  const comments = toNum(pick(COLUMN_MAP.comments))
  const shares = toNum(pick(COLUMN_MAP.shares))

  return {
    postId,
    type: String(pick(COLUMN_MAP.type) ?? '').trim() || 'Lainnya',
    created,
    createdTs: parseCreated(created),
    likes,
    comments,
    shares,
    postUrl,
    content,
    imageUrl: String(pick(COLUMN_MAP.imageUrl) ?? '').trim(),
    score: likes + comments * 2 + shares * 3,
  }
}

/** Parse file Excel/CSV menjadi daftar postingan yang rapi */
export async function parseSpreadsheet(file: File): Promise<ViralPost[]> {
  const buf = await file.arrayBuffer()
  const wb = XLSX.read(buf, { type: 'array', codepage: 65001 })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) throw new Error('File tidak berisi sheet apa pun.')
  const ws = wb.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: '' })
  const posts = rows
    .map(mapRow)
    .filter((p): p is ViralPost => p !== null)
  if (posts.length === 0) {
    throw new Error(
      'Tidak ada data postingan yang dikenali. Pastikan file memiliki kolom seperti Post URL, Likes, Comments, Shares, Content, dan Image URL.',
    )
  }
  return posts
}

function csvEscape(v: string | number): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Ekspor data yang sudah rapi kembali menjadi CSV */
export function exportCsv(posts: ViralPost[], filename = 'cora-viral-finder-rapi.csv') {
  const header = ['Post ID', 'Type', 'Created', 'Likes', 'Comments', 'Shares', 'Viral Score', 'Post URL', 'Content', 'Image URL']
  const lines = posts.map((p) =>
    [p.postId, p.type, p.created, p.likes, p.comments, p.shares, p.score, p.postUrl, p.content, p.imageUrl]
      .map(csvEscape)
      .join(','),
  )
  const csv = '﻿' + [header.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

const ID_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function formatDate(p: ViralPost): string {
  if (p.createdTs === null) return p.created || '—'
  const d = new Date(p.createdTs)
  return `${d.getDate()} ${ID_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')} jt`
  if (n >= 10_000) return `${Math.round(n / 1000)} rb`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} rb`
  return String(n)
}
