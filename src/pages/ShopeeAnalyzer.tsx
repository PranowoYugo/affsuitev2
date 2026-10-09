import { useState } from 'react'
import { Toaster, toast } from 'sonner'
import { MousePointerClick, Wallet } from 'lucide-react'
import type { Dataset, DatasetKind } from '@/lib/affiliate'
import { exportCleaned, fmtHour, fmtNum, fmtRp, parseFile } from '@/lib/affiliate'
import UploadSlot from '@/components/analyzer/UploadSlot'
import Stat from '@/components/analyzer/Stat'
import Bars from '@/components/analyzer/Bars'
import Hours from '@/components/analyzer/Hours'
import DataTable from '@/components/analyzer/DataTable'
import Compare from '@/components/analyzer/Compare'

type SlotKey = 'A' | 'B'
type Store = Record<DatasetKind, Record<SlotKey, Dataset | null>>

const emptyStore: Store = {
  komisi: { A: null, B: null },
  click: { A: null, B: null },
}

const TAB_LABEL: Record<DatasetKind, string> = { komisi: 'Komisi', click: 'Klik' }

export default function Home() {
  const [tab, setTab] = useState<DatasetKind>('komisi')
  const [store, setStore] = useState<Store>(emptyStore)
  const [view, setView] = useState<SlotKey>('A')

  const current = store[tab]
  const active = current[view] ?? current.A ?? current.B
  const both = current.A && current.B

  const handleFile = async (slot: SlotKey, file: File) => {
    const t = toast.loading(`Membaca ${file.name}…`)
    try {
      const ds = await parseFile(file)
      setStore((s) => ({ ...s, [ds.kind]: { ...s[ds.kind], [slot]: ds } }))
      setView(slot)
      if (ds.kind !== tab) setTab(ds.kind)
      toast.success(
        `${file.name} dimuat sebagai Data ${slot} (${TAB_LABEL[ds.kind]}) — ${fmtNum(ds.rows.length)} baris${
          ds.duplicatesRemoved > 0 ? `, ${ds.duplicatesRemoved} duplikat dibersihkan` : ''
        }.`,
        { id: t },
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Gagal membaca file.', { id: t })
    }
  }

  const clearSlot = (slot: SlotKey) =>
    setStore((s) => ({ ...s, [tab]: { ...s[tab], [slot]: null } }))

  const doExport = (slot: SlotKey) => {
    const ds = current[slot]
    if (!ds) return
    exportCleaned(ds)
    toast.success(`Versi rapi ${ds.fileName} diunduh sebagai .xlsx`)
  }

  const switchTab = (k: DatasetKind) => {
    setTab(k)
    setView('A')
  }

  return (
    <div>
      <Toaster position="top-center" richColors />

      <main className="mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        {/* ── Intro ── */}
        <div className="rise mb-6 sm:mb-8">
          <p className="font-mono2 text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--accent)]">Shopee Analyzer</p>
          <h2 className="mt-2 max-w-2xl font-display text-3xl font-bold leading-tight tracking-tight text-[var(--ink)] sm:text-4xl">
            Statistik & pembanding laporan Shopee Affiliate Anda.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
            Impor file ekspor, rapikan datanya, lihat statistik utama, lalu bandingkan dua periode berdampingan.
            Semua diproses langsung di browser — tidak ada data yang dikirim keluar perangkat.
          </p>
        </div>

        {/* ── Pill tabs ── */}
        <div className="rise rise-1 mb-6 inline-flex rounded-full border border-[var(--line)] bg-[var(--paper-2)] p-1">
          {(['komisi', 'click'] as DatasetKind[]).map((k) => (
            <button
              key={k}
              onClick={() => switchTab(k)}
              className={`flex min-h-[44px] items-center gap-2 rounded-full px-5 text-sm font-medium transition-colors sm:px-7 ${
                tab === k ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {k === 'komisi' ? <Wallet size={15} /> : <MousePointerClick size={15} />}
              {TAB_LABEL[k]}
            </button>
          ))}
        </div>

        {/* ── Upload ── */}
        <div className="rise rise-1 grid gap-4 sm:grid-cols-2">
          {(['A', 'B'] as SlotKey[]).map((slot) => (
            <UploadSlot
              key={`${tab}-${slot}`}
              slot={slot}
              dataset={current[slot]}
              onFile={(f) => handleFile(slot, f)}
              onClear={() => clearSlot(slot)}
              onExport={() => doExport(slot)}
            />
          ))}
        </div>
        <p className="font-mono2 mt-3 text-[11px] text-[var(--ink-mute)]">
          Isi Data A dan Data B dengan dua file {TAB_LABEL[tab].toLowerCase()} untuk melihat perbandingan otomatis.
        </p>

        {/* ── Stats ── */}
        {active && (
          <section className="rise rise-2 mt-10">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <h3 className="font-mono2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]">
                Statistik
              </h3>
              {both && (
                <div className="inline-flex rounded-full border border-[var(--line)] p-0.5">
                  {(['A', 'B'] as SlotKey[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setView(s)}
                      className={`min-h-[36px] rounded-full px-4 font-mono2 text-[11px] font-semibold transition-colors ${
                        view === s ? 'bg-[var(--ink)] text-white' : 'text-[var(--ink-soft)]'
                      }`}
                    >
                      Data {s}
                    </button>
                  ))}
                </div>
              )}
              <div className="h-px flex-1 bg-[var(--line)]" />
            </div>

            {active.kind === 'komisi' && active.komisiStats && (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat accent label="Komisi Bersih" value={fmtRp(active.komisiStats.komisiBersih)} sub="Komisi Bersih Affiliate" />
                  <Stat label="Total Pesanan" value={fmtNum(active.komisiStats.totalPesanan)} sub={`${fmtNum(active.komisiStats.totalItem)} item terjual`} />
                  <Stat label="Nilai Penjualan (GMV)" value={fmtRp(active.komisiStats.gmv)} sub="Harga × jumlah, seluruh baris" />
                  <Stat
                    label="Platform Teratas"
                    value={active.komisiStats.byPlatform[0]?.label ?? '—'}
                    sub={`${fmtNum(active.komisiStats.byPlatform[0]?.count ?? 0)} pesanan`}
                  />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <Bars title="Sumber Taglink — per komisi" items={active.komisiStats.byTaglink} showKomisi />
                  <Bars title="Platform — per komisi" items={active.komisiStats.byPlatform} showKomisi />
                </div>
              </>
            )}

            {active.kind === 'click' && active.clickStats && (
              <>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <Stat accent label="Total Klik" value={fmtNum(active.clickStats.totalKlik)} sub="Seluruh baris klik" />
                  <Stat label="Klik Unik" value={fmtNum(active.clickStats.klikUnik)} sub="Berdasarkan Klik ID" />
                  <Stat label="Jam Sibuk" value={fmtHour(active.clickStats.jamSibuk)} sub="Jam dengan klik terbanyak" />
                  <Stat
                    label="Platform Teratas"
                    value={active.clickStats.byPlatform[0]?.label ?? '—'}
                    sub={`${fmtNum(active.clickStats.byPlatform[0]?.count ?? 0)} klik`}
                  />
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <Bars title="Sumber Taglink" items={active.clickStats.byTaglink} />
                  <div className="space-y-4">
                    <Bars title="Platform" items={active.clickStats.byPlatform} />
                    <Hours byHour={active.clickStats.byHour} jamSibuk={active.clickStats.jamSibuk} />
                  </div>
                </div>
              </>
            )}
          </section>
        )}

        {/* ── Compare ── */}
        {both && <Compare a={current.A!} b={current.B!} />}

        {/* ── Table ── */}
        {active && (
          <section className="rise rise-3 mt-10">
            <div className="mb-4 flex items-center gap-3">
              <h3 className="font-mono2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink)]">
                Data Rapi {both ? `— ${view}` : ''}
              </h3>
              <div className="h-px flex-1 bg-[var(--line)]" />
              <span className="font-mono2 text-[11px] text-[var(--ink-mute)]">ketuk kepala kolom untuk mengurutkan</span>
            </div>
            <DataTable columns={active.columns} rows={active.rows} numericCols={active.numericCols} />
          </section>
        )}

        {/* ── Empty state ── */}
        {!active && (
          <div className="rise rise-2 mt-12 border border-dashed border-[var(--line)] px-6 py-14 text-center">
            <p className="font-mono2 text-[11px] uppercase tracking-[0.22em] text-[var(--ink-mute)]">Belum ada data</p>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[var(--ink-soft)]">
              Impor file ekspor {TAB_LABEL[tab].toLowerCase()} dari Shopee Affiliate di salah satu slot di atas untuk
              melihat statistik dan tabel yang sudah dirapikan.
            </p>
          </div>
        )}
      </main>


    </div>
  )
}
