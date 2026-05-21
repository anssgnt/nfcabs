"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type JenisAbsensi = "datang" | "pulang" | "sholat_dhuha" | "sholat_dhuhur" | "khusus";
type ScanState = "idle" | "ready" | "processing" | "success" | "error";

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

interface HistoryItem {
  id: number;
  nama: string;
  kelas: string;
  waktu: string;
  success: boolean;
  message: string;
  wa: boolean;
}

const JENIS_OPTIONS: { value: JenisAbsensi; label: string; icon: string; gradient: string }[] = [
  { value: "datang", label: "Datang", icon: "☀️", gradient: "from-green-400 to-emerald-500" },
  { value: "pulang", label: "Pulang", icon: "🌙", gradient: "from-blue-400 to-indigo-500" },
  { value: "sholat_dhuha", label: "Dhuha", icon: "🕌", gradient: "from-yellow-400 to-orange-500" },
  { value: "sholat_dhuhur", label: "Dhuhur", icon: "🕋", gradient: "from-purple-400 to-violet-500" },
  { value: "khusus", label: "Khusus", icon: "⭐", gradient: "from-red-400 to-pink-500" },
];

export default function ScanPage() {
  const [jenis, setJenis] = useState<JenisAbsensi>("datang");
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [scanCount, setScanCount] = useState(0);
  const [currentTime, setCurrentTime] = useState("");
  const ndefRef = useRef<any>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const historyIdRef = useRef(0);

  // Clock
  useEffect(() => {
    const tick = () => {
      setCurrentTime(
        new Date().toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  function getApiKey(): string {
    if (typeof window !== "undefined") {
      return localStorage.getItem("api_key") || "";
    }
    return "";
  }

  const startContinuousScan = useCallback(async () => {
    if (!("NDEFReader" in window)) {
      setNfcSupported(false);
      return;
    }

    setNfcSupported(true);

    try {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }

      const controller = new AbortController();
      controllerRef.current = controller;

      const ndef = new (window as any).NDEFReader();
      ndefRef.current = ndef;

      ndef.addEventListener("reading", async (event: any) => {
        const uid = event.serialNumber.toUpperCase();

        // Prevent double scan
        setScanState("processing");
        if (navigator.vibrate) navigator.vibrate(100);

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
            setScanState("success");
            setScanCount((c) => c + 1);
            if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

            setHistory((prev) => [
              {
                id: ++historyIdRef.current,
                nama: result.data!.siswa,
                kelas: result.data!.kelas,
                waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                success: true,
                message: "",
                wa: result.data!.wa_terkirim,
              },
              ...prev.slice(0, 49),
            ]);
          } else {
            setScanState("error");
            if (navigator.vibrate) navigator.vibrate(400);

            setHistory((prev) => [
              {
                id: ++historyIdRef.current,
                nama: uid,
                kelas: "",
                waktu: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                success: false,
                message: result.message,
                wa: false,
              },
              ...prev.slice(0, 49),
            ]);
          }
        } catch {
          setScanState("error");
          setLastResult({ success: false, message: "Koneksi gagal" });
        }

        // Kembali ke ready setelah 2 detik
        setTimeout(() => {
          setScanState("ready");
          setLastResult(null);
        }, 2000);
      });

      ndef.addEventListener("readingerror", () => {
        setScanState("error");
        setTimeout(() => setScanState("ready"), 2000);
      });

      await ndef.scan({ signal: controller.signal });
      setScanState("ready");
    } catch (error: any) {
      if (error.name !== "AbortError") {
        setNfcSupported(false);
      }
    }
  }, [jenis]);

  // Auto start scan
  useEffect(() => {
    startContinuousScan();
    return () => {
      if (controllerRef.current) {
        controllerRef.current.abort();
      }
    };
  }, [startContinuousScan]);

  const selectedJenis = JENIS_OPTIONS.find((j) => j.value === jenis)!;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
      {/* Status Bar */}
      <div className="bg-gray-900 px-4 py-2 flex justify-between items-center text-xs">
        <span className="text-gray-400">{currentTime}</span>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${scanState === "ready" ? "bg-green-400 animate-pulse" : scanState === "processing" ? "bg-yellow-400" : "bg-gray-600"}`} />
          <span className="text-gray-400">
            {scanState === "ready" ? "NFC Aktif" : scanState === "processing" ? "Memproses..." : scanState === "idle" ? "Memulai..." : ""}
          </span>
        </div>
        <span className="text-gray-400 font-mono">{scanCount} scan</span>
      </div>

      {/* Jenis Selector */}
      <div className="px-3 py-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {JENIS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setJenis(opt.value)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                jenis === opt.value
                  ? `bg-gradient-to-r ${opt.gradient} text-white shadow-lg scale-105`
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Scan Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 relative">
        {nfcSupported === false ? (
          <div className="text-center p-6">
            <div className="text-6xl mb-4">🚫</div>
            <p className="text-xl font-bold text-red-400 mb-2">NFC Tidak Tersedia</p>
            <p className="text-gray-400 text-sm">Gunakan Chrome di Android dengan HTTPS</p>
          </div>
        ) : (
          <>
            {/* Scan Circle */}
            <div className="relative">
              {/* Outer ring animation */}
              <div
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  scanState === "ready"
                    ? "animate-ping bg-blue-500/20"
                    : scanState === "processing"
                    ? "animate-spin bg-yellow-500/20"
                    : scanState === "success"
                    ? "bg-green-500/30 scale-110"
                    : scanState === "error"
                    ? "bg-red-500/30 scale-110"
                    : ""
                }`}
                style={{ width: "200px", height: "200px", margin: "-10px" }}
              />

              {/* Main circle */}
              <div
                className={`w-44 h-44 rounded-full flex flex-col items-center justify-center transition-all duration-300 border-4 ${
                  scanState === "ready"
                    ? `bg-gradient-to-br ${selectedJenis.gradient} border-white/20 shadow-2xl`
                    : scanState === "processing"
                    ? "bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-300/50 animate-pulse"
                    : scanState === "success"
                    ? "bg-gradient-to-br from-green-400 to-emerald-600 border-green-300/50 scale-105"
                    : scanState === "error"
                    ? "bg-gradient-to-br from-red-400 to-rose-600 border-red-300/50 scale-95"
                    : "bg-gray-800 border-gray-700"
                }`}
              >
                {scanState === "idle" && (
                  <>
                    <span className="text-4xl mb-1">⏳</span>
                    <span className="text-sm font-medium opacity-80">Memulai...</span>
                  </>
                )}
                {scanState === "ready" && (
                  <>
                    <span className="text-5xl mb-1">📲</span>
                    <span className="text-sm font-bold">TAP KARTU</span>
                  </>
                )}
                {scanState === "processing" && (
                  <>
                    <span className="text-4xl mb-1 animate-bounce">⚡</span>
                    <span className="text-xs font-medium">Memproses...</span>
                  </>
                )}
                {scanState === "success" && (
                  <>
                    <span className="text-5xl mb-1">✅</span>
                    <span className="text-sm font-bold">Berhasil!</span>
                  </>
                )}
                {scanState === "error" && (
                  <>
                    <span className="text-5xl mb-1">❌</span>
                    <span className="text-xs font-medium text-center px-2">Gagal</span>
                  </>
                )}
              </div>
            </div>

            {/* Result Text */}
            <div className="mt-6 text-center min-h-[80px] flex flex-col items-center justify-center">
              {scanState === "ready" && (
                <p className="text-gray-400 text-sm animate-pulse">
                  Tempelkan kartu NFC ke belakang HP...
                </p>
              )}
              {scanState === "success" && lastResult?.data && (
                <div className="animate-in fade-in">
                  <p className="text-xl font-bold text-green-400">{lastResult.data.siswa}</p>
                  <p className="text-gray-400 text-sm">{lastResult.data.kelas}</p>
                  <p className="text-xs mt-1">
                    {lastResult.data.wa_terkirim ? (
                      <span className="text-green-400">💬 WA terkirim</span>
                    ) : (
                      <span className="text-yellow-400">💬 WA pending</span>
                    )}
                  </p>
                </div>
              )}
              {scanState === "error" && lastResult && (
                <p className="text-red-400 text-sm">{lastResult.message}</p>
              )}
              {scanState === "processing" && (
                <p className="text-yellow-400 text-sm">Mengirim data & WA...</p>
              )}
            </div>
          </>
        )}
      </div>

      {/* History */}
      <div className="bg-gray-900 rounded-t-3xl px-4 pt-4 pb-6 max-h-[35vh] overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-gray-300">Riwayat Hari Ini</h3>
          <button
            onClick={() => {
              const key = prompt("Masukkan API Key:");
              if (key) localStorage.setItem("api_key", key);
            }}
            className="text-xs text-gray-500 hover:text-gray-300"
          >
            ⚙️
          </button>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-600 text-sm">Belum ada scan hari ini</p>
          </div>
        ) : (
          <div className="space-y-2 overflow-y-auto max-h-[25vh] pr-1">
            {history.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl ${
                  item.success ? "bg-gray-800" : "bg-red-950/50"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${
                    item.success
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {item.success ? "✓" : "✗"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {item.nama}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.success
                      ? `${item.kelas} ${item.wa ? "• 💬" : ""}`
                      : item.message}
                  </p>
                </div>
                <span className="text-xs text-gray-600 flex-shrink-0">{item.waktu}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
