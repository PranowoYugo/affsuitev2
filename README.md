# AffSuite

Suite analitik affiliate dalam satu aplikasi:

- **Shopee Analyzer** — rapikan & bandingkan laporan Shopee Affiliate (komisi & klik), statistik, grafik, dan tabel interaktif.
- **Page Viral Finder** — butuh Data Page Viral Finder dari corafeed; unggah data postingan dan temukan konten paling viral.

Dibangun dengan React + Vite + Tailwind CSS. 100% client-side: file tidak pernah meninggalkan perangkat.

## Menjalankan lokal
```bash
npm install
npm run dev
```

## Deploy ke Vercel melalui GitHub
1. Buat repository baru di GitHub, lalu push proyek ini:
   ```bash
   git init
   git add .
   git commit -m "AffSuite"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. Buka [vercel.com](https://vercel.com) → **Add New… → Project** → **Import** repository tersebut.
3. Framework terdeteksi otomatis sebagai **Vite** → klik **Deploy**. Selesai — setiap `git push` akan otomatis di-deploy ulang.

Credit: [Pranowo Yugo](https://instagram.com/pranowoyugo)
