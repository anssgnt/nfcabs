"use client";

import { useState } from "react";

interface ImportRow {
  nama: string;
  kelas: string;
  nis: string;
  nfc_uid: string;
  no_hp_ortu: string;
  nama_ortu: string;
}

export default function ImportSiswaPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [mode, setMode] = useState<"upload" | "scan">("upload");
  const [scanQueue, setScanQueue] = useState<Omit<ImportRow, "nfc_uid">[]>([]);
  const [scanIndex, setScanIndex] = useState(0);
  const [scanningNfc, setScanningNfc] = useState(false);
  const [scannedCards, setScannedCards] = useState<ImportRow[]>([]);

  function parseCSV(text: string): ImportRow[] {
    const lines = text.trim().split("\n");
    const rows: ImportRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length >= 4) {
        rows.push({
          nama: cols[0] || "",
          kelas: cols[1] || "",
          nis: cols[2] || "",
          nfc_uid: cols[3] || "",
          no_hp_ortu: cols[4] || "",
          nama_ortu: cols[5] || "",
        });
      }
    }
    return rows;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const text = await f.text();
    const rows = parseCSV(text);
    setPreview(rows);
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    setResult(null);

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    // Batch 10 at a time
    for (let i = 0; i < preview.length; i += 10) {
      const batch = preview.slice(i, i + 10);
      const promises = batch.map(async (row, idx) => {
        try {
          const res = await fetch("/api/siswa", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(row),
          });
          const data = await res.json();
          if (data.success) {
            success++;
          } else {
            failed++;
            errors.push(`Baris ${i + idx + 2}: ${row.nama} — ${data.message}`);
          }
        } catch {
          failed++;
          errors.push(`Baris ${i + idx + 2}: ${row.nama} — Koneksi gagal`);
        }
      });
      await Promise.all(promises);
    }

    setResult({ success, failed, errors });
    setImporting(false);
  }

  // Mode scan batch: upload CSV tanpa NFC UID, lalu scan satu-satu
  async function handleFileForScan(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);

    const text = await f.text();
    const lines = text.trim().split("\n");
    const rows: Omit<ImportRow, "nfc_uid">[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ""));
      if (cols.length >= 3) {
        rows.push({
          nama: cols[0] || "",
          kelas: cols[1] || "",
          nis: cols[2] || "",
          no_hp_ortu: cols[3] || "",
          nama_ortu: cols[4] || "",
        });
      }
    }
    setScanQueue(rows);
    setScanIndex(0);
    setScannedCards([]);
  }

  async function scanAndRegister() {
    if (!("NDEFReader" in window)) {
      alert("NFC tidak didukung. Gunakan Chrome Android.");
      return;
    }

    const current = scanQueue[scanIndex];
    if (!current) return;

    setScanningNfc(true);

    try {
      const ndef = new (window as any).NDEFReader();
      const controller = new AbortController();

      ndef.addEventListener("reading", async (event: any) => {
        const uid = event.serialNumber.toUpperCase();
        controller.abort();

        if (navigator.vibrate) navigator.vibrate(200);

        const row: ImportRow = { ...current, nfc_uid: uid };

        // Simpan ke server
        const res = await fetch("/api/siswa", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });
        const data = await res.json();

        if (data.success) {
          setScannedCards((prev) => [...prev, row]);
          setScanIndex((prev) => prev + 1);
        } else {
          alert(`Gagal: ${data.message}`);
        }

        setScanningNfc(false);
      }, { once: true });

      await ndef.scan({ signal: controller.signal });
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      setScanningNfc(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">📥 Import Data Siswa</h1>
        <p className="text-gray-600 mt-1">Upload CSV untuk daftarkan banyak siswa sekaligus</p>
      </header>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode("upload")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "upload" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          📄 Upload CSV Lengkap
        </button>
        <button
          onClick={() => setMode("scan")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            mode === "scan" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
          }`}
        >
          📲 Upload + Scan NFC Satu-satu
        </button>
      </div>

      {mode === "upload" ? (
        <>
          {/* Template */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="font-medium text-blue-800 mb-2">📋 Format CSV:</p>
            <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
              nama,kelas,nis,nfc_uid,no_hp_ortu,nama_ortu<br />
              Ahmad Budi,7A,12001,04:A2:B3:C4:D5:E6:F7,081234567890,Pak Budi<br />
              Siti Aisyah,7B,12002,04:B3:C4:D5:E6:F7:A8,081234567891,Bu Aisyah
            </code>
            <p className="text-xs text-blue-600 mt-2">
              Separator: koma (,) atau titik koma (;) atau tab. Baris pertama = header.
            </p>
            <p className="text-xs text-blue-600 mt-1">
              <strong>Kalau belum punya NFC UID:</strong> Gunakan mode &quot;Upload + Scan NFC Satu-satu&quot;
            </p>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="p-4 border-b flex justify-between items-center">
                <p className="font-medium text-gray-900">
                  Preview: {preview.length} siswa
                </p>
                <button
                  onClick={handleImport}
                  disabled={importing}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                >
                  {importing ? "Mengimport..." : `Import ${preview.length} Siswa`}
                </button>
              </div>
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">#</th>
                      <th className="px-4 py-2 text-left">Nama</th>
                      <th className="px-4 py-2 text-left">Kelas</th>
                      <th className="px-4 py-2 text-left">NIS</th>
                      <th className="px-4 py-2 text-left">NFC UID</th>
                      <th className="px-4 py-2 text-left">HP Ortu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-2">{row.nama}</td>
                        <td className="px-4 py-2">{row.kelas}</td>
                        <td className="px-4 py-2">{row.nis}</td>
                        <td className="px-4 py-2 font-mono text-xs">{row.nfc_uid}</td>
                        <td className="px-4 py-2">{row.no_hp_ortu}</td>
                      </tr>
                    ))}
                    {preview.length > 20 && (
                      <tr>
                        <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                          ... dan {preview.length - 20} siswa lainnya
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`rounded-lg p-4 ${result.failed > 0 ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
              <p className="font-medium">
                ✅ Berhasil: {result.success} | ❌ Gagal: {result.failed}
              </p>
              {result.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="text-sm text-red-600 cursor-pointer">
                    Lihat error ({result.errors.length})
                  </summary>
                  <ul className="mt-1 text-xs text-red-600 list-disc pl-4">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          {/* Mode Scan Batch */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="font-medium text-yellow-800 mb-2">📋 Format CSV (tanpa NFC UID):</p>
            <code className="text-xs bg-white px-2 py-1 rounded block overflow-x-auto">
              nama,kelas,nis,no_hp_ortu,nama_ortu<br />
              Ahmad Budi,7A,12001,081234567890,Pak Budi<br />
              Siti Aisyah,7B,12002,081234567891,Bu Aisyah
            </code>
            <p className="text-xs text-yellow-700 mt-2">
              Upload daftar siswa, lalu panggil satu-satu untuk tap kartu NFC.
            </p>
          </div>

          {scanQueue.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6">
              <input
                type="file"
                accept=".csv,.txt"
                onChange={handleFileForScan}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress */}
              <div className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress: {scanIndex} / {scanQueue.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round((scanIndex / scanQueue.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-full transition-all"
                    style={{ width: `${(scanIndex / scanQueue.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Student */}
              {scanIndex < scanQueue.length ? (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">Siswa berikutnya:</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">
                    {scanQueue[scanIndex].nama}
                  </p>
                  <p className="text-gray-600 mb-6">
                    {scanQueue[scanIndex].kelas} — NIS: {scanQueue[scanIndex].nis}
                  </p>

                  <button
                    onClick={scanAndRegister}
                    disabled={scanningNfc}
                    className={`w-32 h-32 rounded-full text-white flex flex-col items-center justify-center mx-auto transition ${
                      scanningNfc
                        ? "bg-yellow-500 animate-pulse"
                        : "bg-blue-600 hover:bg-blue-700 active:scale-95"
                    }`}
                  >
                    <span className="text-3xl mb-1">{scanningNfc ? "📡" : "📲"}</span>
                    <span className="text-sm font-bold">
                      {scanningNfc ? "Tempel..." : "Scan NFC"}
                    </span>
                  </button>

                  <p className="text-sm text-gray-500 mt-4">
                    {scanningNfc
                      ? "Tempelkan kartu NFC siswa ini..."
                      : "Tekan tombol, lalu tempelkan kartu"}
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="text-lg font-bold text-green-800">Selesai!</p>
                  <p className="text-green-700">
                    {scannedCards.length} kartu berhasil didaftarkan
                  </p>
                </div>
              )}

              {/* Recent scans */}
              {scannedCards.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    ✅ Terakhir didaftarkan:
                  </p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {[...scannedCards].reverse().slice(0, 10).map((card, i) => (
                      <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                        <span>{card.nama} ({card.kelas})</span>
                        <span className="font-mono text-xs text-gray-500">{card.nfc_uid}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Nav */}
      <div className="mt-8 flex gap-4">
        <a href="/siswa" className="text-blue-600 hover:underline text-sm">
          ← Data Siswa
        </a>
        <a href="/dashboard" className="text-blue-600 hover:underline text-sm">
          Dashboard
        </a>
      </div>
    </div>
  );
}
