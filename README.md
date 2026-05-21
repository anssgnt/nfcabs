# Absensi NFC - Sistem Absensi Siswa

Sistem absensi siswa menggunakan kartu NFC dengan notifikasi WhatsApp ke orang tua.

## Fitur
- ✅ Absensi Datang
- ✅ Absensi Pulang
- ✅ Absensi Sholat Dhuha
- ✅ Absensi Sholat Dhuhur
- ✅ Absensi Khusus
- ✅ Notifikasi WA otomatis ke orang tua (via Fonnte)
- ✅ Web Admin Dashboard (laporan & kelola data)
- ✅ Anti duplikasi (5 menit cooldown)

## Tech Stack
- **Android App**: Flutter + NFC Manager
- **Backend + Web**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **WA Gateway**: Fonnte
- **Hosting**: Vercel (gratis)

## Setup

### 1. Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. Buka SQL Editor, jalankan `supabase-schema.sql`
3. Copy URL dan keys dari Settings > API

### 2. Fonnte
1. Daftar di [fonnte.com](https://fonnte.com)
2. Hubungkan nomor WhatsApp
3. Copy API key

### 3. Deploy Web (Vercel)
1. Push folder `absensi-nfc` ke GitHub (tanpa folder `flutter-app`)
2. Import di [vercel.com](https://vercel.com)
3. Set environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `FONNTE_API_KEY`
   - `API_SECRET_KEY` (buat random string untuk auth Flutter app)
4. Deploy!

### 4. Flutter App
1. Install Flutter SDK
2. Masuk ke folder `flutter-app`
3. `flutter pub get`
4. `flutter run`
5. Di app, buka Settings, masukkan URL Vercel dan API Key

## API Endpoints

### POST /api/absensi
Catat absensi (dipanggil dari Flutter app)
```json
Headers: { "x-api-key": "your-secret" }
Body: { "nfc_uid": "AA:BB:CC:DD", "jenis": "datang" }
```

### GET /api/laporan?tanggal=2024-01-15&kelas=7A&jenis=datang
Ambil data laporan dengan filter

### POST /api/siswa
Tambah siswa baru
```json
Body: { "nama": "Budi", "kelas": "7A", "nis": "12345", "nfc_uid": "AA:BB:CC:DD", "no_hp_ortu": "08123456789", "nama_ortu": "Pak Budi" }
```

### GET /api/siswa
List semua siswa

## Struktur Folder
```
absensi-nfc/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── absensi/route.ts    # API terima tap NFC
│   │   │   ├── siswa/route.ts      # CRUD siswa
│   │   │   └── laporan/route.ts    # Laporan & filter
│   │   ├── siswa/page.tsx          # Halaman kelola siswa
│   │   ├── page.tsx                # Dashboard utama
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── lib/
│       ├── supabase.ts             # Supabase client
│       ├── fonnte.ts               # WhatsApp gateway
│       └── types.ts                # TypeScript types
├── flutter-app/                    # Android app (separate project)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── screens/
│   │   └── services/
│   └── pubspec.yaml
├── supabase-schema.sql             # Database schema
└── .env.local.example              # Template env vars
```
