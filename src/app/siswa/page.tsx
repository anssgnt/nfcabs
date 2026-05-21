"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Siswa } from "@/lib/types";

export default function SiswaPage() {
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kelas: "",
    nis: "",
    nfc_uid: "",
    no_hp_ortu: "",
    nama_ortu: "",
  });

  useEffect(() => {
    fetchSiswa();
  }, []);

  async function fetchSiswa() {
    setLoading(true);
    const { data } = await supabase
      .from("siswa")
      .select("*")
      .order("kelas")
      .order("nama");
    setSiswaList(data || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/siswa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await res.json();
    if (result.success) {
      setForm({ nama: "", kelas: "", nis: "", nfc_uid: "", no_hp_ortu: "", nama_ortu: "" });
      setShowForm(false);
      fetchSiswa();
    } else {
      alert(result.message);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👨‍🎓 Data Siswa</h1>
          <p className="text-gray-600 mt-1">Kelola data siswa dan kartu NFC</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Tambah Siswa
        </button>
      </header>

      {/* Form Tambah */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Siswa
            </label>
            <input
              type="text"
              required
              value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
            <input
              type="text"
              required
              value={form.kelas}
              onChange={(e) => setForm({ ...form, kelas: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="7A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIS
            </label>
            <input
              type="text"
              required
              value={form.nis}
              onChange={(e) => setForm({ ...form, nis: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NFC UID
            </label>
            <input
              type="text"
              required
              value={form.nfc_uid}
              onChange={(e) => setForm({ ...form, nfc_uid: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="Scan kartu untuk mendapatkan UID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No HP Ortu (WhatsApp)
            </label>
            <input
              type="text"
              required
              value={form.no_hp_ortu}
              onChange={(e) => setForm({ ...form, no_hp_ortu: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
              placeholder="08xxxxxxxxxx"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Ortu
            </label>
            <input
              type="text"
              value={form.nama_ortu}
              onChange={(e) => setForm({ ...form, nama_ortu: e.target.value })}
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Nama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Kelas
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                NIS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                NFC UID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                No HP Ortu
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Memuat...
                </td>
              </tr>
            ) : siswaList.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Belum ada data siswa
                </td>
              </tr>
            ) : (
              siswaList.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {s.nama}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.kelas}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{s.nis}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">
                    {s.nfc_uid}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.no_hp_ortu}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {s.aktif ? (
                      <span className="text-green-600 font-medium">Aktif</span>
                    ) : (
                      <span className="text-red-500">Nonaktif</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Nav */}
      <div className="mt-6">
        <a href="/" className="text-blue-600 hover:underline">
          ← Kembali ke Dashboard
        </a>
      </div>
    </div>
  );
}
