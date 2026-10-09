import { createContext, useContext, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { ReactNode } from 'react'
import type { Dataset, DatasetKind } from '@/lib/affiliate'
import type { ViralPost } from '@/types/post'

export type SlotKey = 'A' | 'B'
export type Store = Record<DatasetKind, Record<SlotKey, Dataset | null>>

export const emptyStore: Store = {
  komisi: { A: null, B: null },
  click: { A: null, B: null },
}

interface AppState {
  // Shopee Analyzer
  tab: DatasetKind
  setTab: Dispatch<SetStateAction<DatasetKind>>
  store: Store
  setStore: Dispatch<SetStateAction<Store>>
  view: SlotKey
  setView: Dispatch<SetStateAction<SlotKey>>
  // Page Viral Finder
  posts: ViralPost[] | null
  setPosts: Dispatch<SetStateAction<ViralPost[] | null>>
  fileName: string
  setFileName: Dispatch<SetStateAction<string>>
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [tab, setTab] = useState<DatasetKind>('komisi')
  const [store, setStore] = useState<Store>(emptyStore)
  const [view, setView] = useState<SlotKey>('A')
  const [posts, setPosts] = useState<ViralPost[] | null>(null)
  const [fileName, setFileName] = useState('')

  return (
    <AppContext.Provider value={{ tab, setTab, store, setStore, view, setView, posts, setPosts, fileName, setFileName }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp harus dipakai di dalam AppProvider')
  return ctx
}
