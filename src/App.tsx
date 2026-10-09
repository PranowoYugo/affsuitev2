import { Routes, Route } from 'react-router'
import { AppProvider } from '@/lib/app-store'
import AppShell from '@/components/AppShell'
import Landing from '@/pages/Landing'
import ShopeeAnalyzer from '@/pages/ShopeeAnalyzer'
import PageViralFinder from '@/pages/PageViralFinder'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/shopee-analyzer" element={<ShopeeAnalyzer />} />
          <Route path="/page-viral-finder" element={<PageViralFinder />} />
          <Route path="*" element={<Landing />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}
