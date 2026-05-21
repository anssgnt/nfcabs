"use client";

import { useState, useCallback } from "react";

type JenisAbsensi = "datang" | "pulang" | "sholat_dhuha" | "sholat_dhuhur" | "khusus";

interface ScanResult {
  success: boolean;
  message: string;
  data?: {
    siswa: string;
    kelas: string;
    jenis: string;
    waktu: string;
    wa_terkirim: boolean;
  };
}

const JENIS_OPTIONS: { value: JenisAbsensi; label: string; icon: string; color: string }[] = [
  { value: "datang", label: "Datang", icon: "🟢", color: "bg-green-100 border-green-400 text-green-800" },
  { value: "pulang", label: "Pulang", icon: "🔵", color: "bg-blue-100 border-blue-400 text-blue-800" },
  { value: "sholat_dhuha", label: "Sholat Dhuha", icon: "🟡", color: "bg-yellow-100 border-yellow-400 text-yellow-800" },
  { value: "sholat_dhuhur", label: "Sholat Dhuhur", icon: "🟣", color: "bg-purple-100 border-purple-400 text-purple-800" },
  { value: "khusus", label: "Khusus", icon: "🔴", color: "bg-red-100 border-red-400 text-red-800" },
];

export default function ScanPage() {
  const [jenis, setJenis] = useState<JenisAbsensi>("datang");
  const [scanning, setScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [lastSiswa, setLastSiswa] = useState("");
  const [scanCount, setScanCount] = useState(0);

  const startScan = useCallback(async () => {
    if (!("NDEFReader" in window)) {
      setNfcSupported(false);
      return;
    }

    setNfcSupported(true);
    setScanning(true);
    setLastResult(null);

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener("reading", async (event: any) => {
        const uid = event.serialNumber.toUpperCase();

        // Kirim ke API
        try {
          const res = await fetch("/api/absensi", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": getApiKey(),
            },
            body: JSON.stringify({ nfc_uid: uid, jenis }),
          });

          const result: ScanResult = await res.json();
          setLastResult(result);
          if (result.success && result.data) {
            setLastSiswa(result.data.siswa);
            setScanCount((c) => c + 1);
          }

          // Vibrate on success
          if (result.success && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          } else if (!result.success && navigator.vibrate) {
            navigator.vibrate([500]);
          }
        } catch {
          setLastResult({ success: false, message: "Gagal koneksi ke server" });
        }
      });

      ndef.addEventListener("readingerror", () => {
        setLastResult({ success: false, message: "Gagal membaca kartu NFC" });
      });
    } catch (error: any) {
      setLastResult({
        success: false,
        message: error.message || "Gagal mengaktifkan NFC",
      });
      setScanning(false);
    }
  }, [jenis]);

  function getApiKey(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("api_key") || "";
    }
    return "";
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📲</span>
          <h1 className="text-lg font-bold text-gray-900">NFC Scanner</h1>
        </div>
        <div className="text-sm text-gray-500">
          Scan: <span className="font-bold text-blue-600">{scanCount}</span>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4 gap-4 max-w-lg mx-auto w-full">
        {/* Pilih Jenis */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Jenis Absensi:</p>
          <div className="grid grid-cols-2 gap-2">
            {JENIS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setJenis(opt.value)}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition ${
                  jenis === opt.value
                    ? opt.color + " border-current"
                    : "bg-white border-gray-200 text-gray-600"
                }`}
              >
                {opt.icon} {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scan Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {!scanning ? (
            <div className="text-center">
              {nfcSupported === false && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700 text-sm font-medium">
                    ❌ NFC tidak didukung di browser ini.
                  </p>
                  <p className="text-red-600 text-xs mt-1">
                    Gunakan Chrome di Android dengan HTTPS.
                  </p>
                </div>
              )}
              <button
                onClick={startScan}
                className="w-40 h-40 rounded-full bg-blue-600 text-white flex flex-col items-center justify-center shadow-lg hover:bg-blue-700 transition active:scale-95"
              >
                <span className="text-4xl mb-2">📱</span>
                <span className="font-bold">Mulai Scan</span>
              </button>
              <p className="text-gray-500 text-sm mt-4">
                Tekan tombol lalu tempelkan kartu
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-40 h-40 rounded-full bg-green-100 border-4 border-green-400 flex flex-col items-center justify-center animate-pulse">
                <span className="text-4xl mb-2">📡</span>
                <span className="font-bold text-green-700 text-sm">Menunggu kartu...</span>
              </div>
              <p className="text-gray-600 text-sm mt-4">
                Tempelkan kartu NFC ke belakang HP
              </p>
            </div>
          )}
        </div>

        {/* Result */}
        {lastResult && (
          <div
            className={`rounded-lg p-4 border ${
              lastResult.success
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {lastResult.success ? "✅" : "❌"}
              </span>
              <div>
                <p
                  className={`font-medium ${
                    lastResult.success ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {lastResult.message}
                </p>
                {lastResult.data && (
                  <div className="mt-1 text-sm text-green-700">
                    <p>👤 {lastResult.data.siswa} — {lastResult.data.kelas}</p>
                    <p>
                      💬 WA:{" "}
                      {lastResult.data.wa_terkirim ? "Terkirim ✓" : "Gagal ✗"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* API Key Config */}
        <details className="bg-white rounded-lg border p-3">
          <summary className="text-sm font-medium text-gray-700 cursor-pointer">
            ⚙️ Pengaturan API Key
          </summary>
          <div className="mt-3">
            <input
              type="password"
              placeholder="Masukkan API Key"
              defaultValue={typeof window !== "undefined" ? localStorage.getItem("api_key") || "" : ""}
              onChange={(e) => localStorage.setItem("api_key", e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Sama dengan API_SECRET_KEY di Vercel
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
