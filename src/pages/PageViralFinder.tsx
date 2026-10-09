import { useState } from 'react'
import type { ViralPost } from '@/types/post'
import { parseSpreadsheet } from '@/lib/viral'
import UploadSection from '@/components/viral/UploadSection'
import DashboardSection from '@/components/viral/DashboardSection'

export default function Home() {
  const [posts, setPosts] = useState<ViralPost[] | null>(null)
  const [fileName, setFileName] = useState('')
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
    <div className="flex min-h-screen flex-col bg-[#faf7f1]">
      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        {posts ? (
          <DashboardSection posts={posts} fileName={fileName} onReset={() => setPosts(null)} />
        ) : (
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="text-center">
              <h2 className="font-display text-3xl font-bold leading-tight text-[#18181b] sm:text-4xl">
                Rapikan data postingan,{' '}
                <em className="not-italic text-[#c0613d]">temukan yang viral</em>
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-[#18181b]/55 sm:text-base">
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
              <div className="rounded-2xl border border-[#c0613d]/30 bg-[#c0613d]/5 p-4 text-sm text-[#18181b]/75">
                {error}
              </div>
            )}
          </div>
        )}
      </main>


    </div>
  )
}
