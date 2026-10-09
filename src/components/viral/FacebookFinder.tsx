import { Globe, Info, Link2, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PagePreview {
  url: string
  title: string
  description: string
  image: string
}

/**
 * Mencoba mengambil metadata publik halaman Facebook lewat proxy CORS.
 * Facebook membatasi akses anonim, jadi jika gagal kita tampilkan panduan.
 */
async function fetchPagePreview(pageUrl: string): Promise<PagePreview | null> {
  const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(pageUrl)}`
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch(proxy, { signal: controller.signal })
    if (!res.ok) return null
    const html = await res.text()
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const og = (prop: string) =>
      doc.querySelector(`meta[property="og:${prop}"]`)?.getAttribute('content')?.trim() ?? ''
    const title = og('title') || doc.title?.trim() || ''
    if (!title) return null
    return {
      url: pageUrl,
      title,
      description: og('description'),
      image: og('image'),
    }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

function isValidFbUrl(u: string): boolean {
  try {
    const url = new URL(u)
    return /(^|\.)facebook\.com$/.test(url.hostname) || /(^|\.)fb\.com$/.test(url.hostname)
  } catch {
    return false
  }
}

export default function FacebookFinder() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<PagePreview | null>(null)
  const [error, setError] = useState('')

  const search = async () => {
    const u = url.trim()
    setError('')
    setPreview(null)
    if (!isValidFbUrl(u)) {
      setError('Masukkan URL halaman Facebook yang valid, contoh: https://www.facebook.com/namahalaman')
      return
    }
    setLoading(true)
    const result = await fetchPagePreview(u)
    setLoading(false)
    if (result) {
      setPreview(result)
    } else {
      setError(
        'Facebook tidak mengizinkan akses data publik halaman secara langsung dari browser. Gunakan menu "Upload File" dengan data ekspor halaman Anda — hasilnya akan tampil lengkap dalam bentuk grid.',
      )
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-[var(--ink)]/10 bg-white p-5 sm:p-8">
        <h2 className="font-display text-xl font-semibold text-[var(--ink)] sm:text-2xl">
          Cari postingan viral dari halaman Facebook
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--ink)]/55">
          Tempel URL halaman Facebook di bawah ini. Jika halaman bisa diakses publik, pratinjaunya akan
          ditampilkan. Untuk data engagement lengkap (suka, komentar, share), ekspor data halaman lalu
          gunakan menu Upload File.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/40" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              inputMode="url"
              placeholder="https://www.facebook.com/namahalaman"
              className="h-12 w-full rounded-full border border-[var(--ink)]/15 bg-[var(--paper)] pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-[var(--ink)]/35 focus:border-[var(--accent)]"
            />
          </label>
          <button
            onClick={search}
            disabled={loading}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] px-7 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--accent)] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
            {loading ? 'Mencari…' : 'Cari'}
          </button>
        </div>

        {error && (
          <div className="mt-5 flex gap-3 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
            <p className="text-sm leading-relaxed text-[var(--ink)]/75">{error}</p>
          </div>
        )}

        {preview && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--ink)]/10">
            {preview.image && (
              <img
                src={preview.image}
                alt={preview.title}
                referrerPolicy="no-referrer"
                className="h-48 w-full object-cover sm:h-64"
                onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
              />
            )}
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-[var(--ink)]">{preview.title}</h3>
              {preview.description && (
                <p className="mt-1 line-clamp-3 text-sm text-[var(--ink)]/60">{preview.description}</p>
              )}
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--paper)] transition-colors hover:bg-[var(--accent-hover)]"
              >
                Buka Halaman
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
