export type JenisAbsensi =
  | "datang"
  | "pulang"
  | "sholat_dhuha"
  | "sholat_dhuhur"
  | "khusus";

export interface Siswa {
  id: string;
  nama: string;
  kelas: string;
  nis: string;
  nfc_uid: string;
  no_hp_ortu: string;
  nama_ortu: string;
  aktif: boolean;
  created_at: string;
}

export interface LogAbsensi {
  id: string;
  siswa_id: string;
  jenis: JenisAbsensi;
  waktu: string;
  wa_terkirim: boolean;
  keterangan?: string;
  created_at: string;
}

export interface AbsensiRequest {
  nfc_uid: string;
  jenis: JenisAbsensi;
  keterangan?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
