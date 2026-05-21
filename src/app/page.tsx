import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <span className="text-xl font-bold text-gray-900">AbsensiNFC</span>
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/siswa"
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Kelola Siswa
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <span>📱</span> Sistem Absensi Modern untuk Sekolah
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Absensi Siswa dengan
          <br />
          <span className="text-blue-600">Kartu NFC</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          Tap kartu, absensi tercatat, orang tua langsung dapat notifikasi WhatsApp.
          Simpel, cepat, dan transparan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            Buka Dashboard
          </Link>
          <Link
            href="/siswa"
            className="px-8 py-3 bg-white text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition border border-gray-200"
          >
            Kelola Data Siswa
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Fitur Lengkap untuk Sekolah
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Jenis Absensi */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          5 Jenis Absensi
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {jenisAbsensi.map((j, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 text-center ${j.bg}`}
            >
              <div className="text-2xl mb-2">{j.icon}</div>
              <p className="font-semibold text-sm">{j.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-12">
          Cara Kerja
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={i} className="text-center">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                {i + 1}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="bg-blue-600 rounded-2xl p-10 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Siap Digunakan Sekarang
          </h2>
          <p className="text-blue-100 mb-8 max-w-lg mx-auto">
            Tambahkan data siswa, bagikan kartu NFC, dan mulai pantau kehadiran
            dengan notifikasi real-time ke orang tua.
          </p>
          <Link
            href="/siswa"
            className="inline-block px-8 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition"
          >
            Mulai Tambah Siswa →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-sm text-gray-500">
          <p>© 2024 AbsensiNFC — Sistem Absensi Siswa dengan NFC & WhatsApp</p>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: "📲",
    title: "Tap & Go",
    desc: "Siswa cukup tempelkan kartu NFC ke device. Absensi tercatat dalam hitungan detik.",
  },
  {
    icon: "💬",
    title: "Notifikasi WhatsApp",
    desc: "Orang tua langsung dapat pesan WA otomatis setiap anak tap kartu absensi.",
  },
  {
    icon: "📊",
    title: "Laporan Real-time",
    desc: "Dashboard web untuk monitoring kehadiran harian, filter per kelas dan jenis absensi.",
  },
  {
    icon: "🕌",
    title: "Absensi Sholat",
    desc: "Pantau kehadiran sholat Dhuha dan Dhuhur siswa dengan kartu yang sama.",
  },
  {
    icon: "🔒",
    title: "Anti Duplikasi",
    desc: "Sistem otomatis mencegah tap ganda dalam 5 menit. Tidak ada data dobel.",
  },
  {
    icon: "☁️",
    title: "Cloud & Gratis",
    desc: "Hosting gratis di Vercel + Supabase. Akses dari mana saja, kapan saja.",
  },
];

const jenisAbsensi = [
  { icon: "🟢", label: "Datang", bg: "bg-green-50 text-green-800" },
  { icon: "🔵", label: "Pulang", bg: "bg-blue-50 text-blue-800" },
  { icon: "🟡", label: "Sholat Dhuha", bg: "bg-yellow-50 text-yellow-800" },
  { icon: "🟣", label: "Sholat Dhuhur", bg: "bg-purple-50 text-purple-800" },
  { icon: "🔴", label: "Khusus", bg: "bg-red-50 text-red-800" },
];

const steps = [
  { title: "Tap Kartu", desc: "Siswa tempelkan kartu NFC ke tablet/HP" },
  { title: "Data Tercatat", desc: "Sistem simpan waktu & jenis absensi" },
  { title: "WA Terkirim", desc: "Orang tua dapat notifikasi otomatis" },
  { title: "Laporan Tersedia", desc: "Admin pantau via web dashboard" },
];
