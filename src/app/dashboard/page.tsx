"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LogAbsensi, JenisAbsensi } from "@/lib/types";

const JENIS_OPTIONS: { value: JenisAbsensi | ""; label: string }[] = [
  { value: "", label: "Semua Jenis" },
  { value: "datang", label: "Datang" },
  { value: "pulang", label: "Pulang" },
  { value: "sholat_dhuha", label: "Sholat Dhuha" },
  { value: "sholat_dhuhur", label: "Sholat Dhuhur" },
  { value: "khusus", label: "Khusus" },
];

const JENIS_BADGE: Record<string, string> = {
  datang: "bg-green-100 text-green-800",
  pulang: "bg-blue-100 text-blue-800",
  sholat_dhuha: "bg-yellow-100 text-yellow-800",
  sholat_dhuhur: "bg-purple-100 text-purple-800",
  khusus: "bg-red-100 text-red-800",
};

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [jenis, setJenis] = useState("");
  const [stats, setStats] = useState({
    datang: 0,
    pulang: 0,
    sholat_dhuha: 0,
    sholat_dhuhur: 0,
    khusus: 0,
  });

  useEffect(() => {
    fetchLogs();
  }, [tanggal, jenis]);

  async function fetchLogs() {
    setLoading(true);
    let query = supabase
      .from("log_absensi")
      .select(`*, siswa:siswa_id (nama, kelas, nis)`)
      .gte("waktu", `${tanggal}T00:00:00.000Z`)
      .lte("waktu", `${tanggal}T23:59:59.999Z`)
      .order("waktu", { ascending: false });

    if (jenis) {
      query = query.eq("jenis", jenis);
    }

    const { data } = await query.limit(500);
    setLogs(data || []);

    // Hitung stats
    const allQuery = await supabase
      .from("log_absensi")
      .select("jenis")
      .gte("waktu", `${tanggal}T00:00:00.000Z`)
      .lte("waktu", `${tanggal}T23:59:59.999Z`);

    const allData = allQuery.data || [];
    const newStats = { datang: 0, pulang: 0, sholat_dhuha: 0, sholat_dhuhur: 0, khusus: 0 };
    allData.forEach((item: any) => {
      if (item.jenis in newStats) {
        newStats[item.jenis as keyof typeof newStats]++;
      }
    });
    setStats(newStats);
    setLoading(false);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          📋 Dashboard Absensi NFC
        </h1>
        <p className="text-gray-600 mt-1">Monitoring absensi siswa real-time</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        {Object.entries(stats).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500 capitalize">
              {key.replace("_", " ")}
            </p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tanggal
          </label>
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jenis Absensi
          </label>
          <select
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {JENIS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Waktu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Jenis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                WA
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Memuat data...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Belum ada data absensi
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(log.waktu).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.siswa?.nama || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.siswa?.kelas || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        JENIS_BADGE[log.jenis] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {log.jenis.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {log.wa_terkirim ? (
                      <span className="text-green-600">✓ Terkirim</span>
                    ) : (
                      <span className="text-red-500">✗ Gagal</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
