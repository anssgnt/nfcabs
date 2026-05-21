-- =============================================
-- SCHEMA DATABASE ABSENSI NFC
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tabel Siswa
CREATE TABLE siswa (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  kelas VARCHAR(10) NOT NULL,
  nis VARCHAR(20) UNIQUE NOT NULL,
  nfc_uid VARCHAR(50) UNIQUE NOT NULL,
  no_hp_ortu VARCHAR(20) NOT NULL,
  nama_ortu VARCHAR(100),
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Log Absensi
CREATE TABLE log_absensi (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  siswa_id UUID REFERENCES siswa(id) ON DELETE CASCADE,
  jenis VARCHAR(20) NOT NULL CHECK (jenis IN ('datang', 'pulang', 'sholat_dhuha', 'sholat_dhuhur', 'khusus')),
  waktu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  wa_terkirim BOOLEAN DEFAULT false,
  keterangan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk performa query
CREATE INDEX idx_log_absensi_waktu ON log_absensi(waktu DESC);
CREATE INDEX idx_log_absensi_siswa ON log_absensi(siswa_id);
CREATE INDEX idx_log_absensi_jenis ON log_absensi(jenis);
CREATE INDEX idx_siswa_nfc_uid ON siswa(nfc_uid);

-- Enable Row Level Security
ALTER TABLE siswa ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_absensi ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read for authenticated users (web admin)
CREATE POLICY "Allow read siswa" ON siswa FOR SELECT USING (true);
CREATE POLICY "Allow read log" ON log_absensi FOR SELECT USING (true);

-- Policy: Allow insert/update via service role only (API)
CREATE POLICY "Allow insert siswa" ON siswa FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update siswa" ON siswa FOR UPDATE USING (true);
CREATE POLICY "Allow insert log" ON log_absensi FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update log" ON log_absensi FOR UPDATE USING (true);
