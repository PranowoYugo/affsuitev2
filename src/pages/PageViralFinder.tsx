import { useState } from 'react'
import { parseSpreadsheet } from '@/lib/viral'
import { useApp } from '@/lib/app-store'
import UploadSection from '@/components/viral/UploadSection'
import DashboardSection from '@/components/viral/DashboardSection'

export default function Home() {
  const { posts, setPosts, fileName, setFileName } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFile = async (file: File) => {
    setLoading(true)
    setError('')
    try {
      const data = await parseSpreadsheet(file)
      setPosts(data)
      setFileName(file.name)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal membaca file. Pastikan formatnya benar.')
      setPosts(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--paper)]">
      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {posts ? (
          <DashboardSection posts={posts} fileName={fileName} onReset={() => setPosts(null)} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold leading-tight text-[var(--ink)] sm:text-4xl">
                Rapikan data postingan,{' '}
                <em className="not-italic text-[var(--accent)]">temukan yang viral</em>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[var(--ink)]/55 sm:text-base">
                Unggah file Excel berisi data postingan Facebook — link, suka, komentar, share, caption,
                dan gambar — lalu lihat semuanya tersusun rapi dalam grid yang bisa dicari, difilter,
                dan diurutkan.
              </p>
              <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--paper-2)] px-4 py-1.5 text-xs font-medium text-[var(--ink-soft)]">
                Butuh Data Page Viral Finder dari corafeed
              </p>
            </div>
            <UploadSection onFile={handleFile} loading={loading} />
            {error && (
              <div className="rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/5 p-4 text-sm text-[var(--ink)]/75">
                {error}
              </div>
            )}
          </div>
        )}
      </main>


    </div>
  )
}
