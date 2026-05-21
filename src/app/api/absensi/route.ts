import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendWhatsApp, buildAbsensiMessage } from "@/lib/fonnte";
import { AbsensiRequest, ApiResponse } from "@/lib/types";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Verify API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.API_SECRET_KEY) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: AbsensiRequest = await request.json();
    const { nfc_uid, jenis, keterangan } = body;

    if (!nfc_uid || !jenis) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "nfc_uid dan jenis wajib diisi" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Cari siswa berdasarkan NFC UID
    const { data: siswa, error: siswaError } = await supabase
      .from("siswa")
      .select("*")
      .eq("nfc_uid", nfc_uid)
      .eq("aktif", true)
      .single();

    if (siswaError || !siswa) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Kartu NFC tidak terdaftar" },
        { status: 404 }
      );
    }

    // Cek duplikasi absensi (dalam 5 menit terakhir)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from("log_absensi")
      .select("id")
      .eq("siswa_id", siswa.id)
      .eq("jenis", jenis)
      .gte("waktu", fiveMinsAgo)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Absensi sudah tercatat (duplikasi dalam 5 menit)" },
        { status: 409 }
      );
    }

    const waktu = new Date().toISOString();

    // Simpan log absensi
    const { error: insertError } = await supabase.from("log_absensi").insert({
      siswa_id: siswa.id,
      jenis,
      waktu,
      keterangan: keterangan || null,
      wa_terkirim: false,
    });

    if (insertError) {
      return NextResponse.json<ApiResponse>(
        { success: false, message: "Gagal menyimpan absensi" },
        { status: 500 }
      );
    }

    // Kirim WA ke ortu
    let waTerkirim = false;
    if (siswa.no_hp_ortu) {
      const waktuFormatted = format(new Date(waktu), "EEEE, dd MMMM yyyy HH:mm", {
        locale: id,
      });
      const message = buildAbsensiMessage(siswa.nama, jenis, waktuFormatted);

      try {
        await sendWhatsApp({ phone: siswa.no_hp_ortu, message });
        waTerkirim = true;

        // Update status WA
        await supabase
          .from("log_absensi")
          .update({ wa_terkirim: true })
          .eq("siswa_id", siswa.id)
          .eq("waktu", waktu);
      } catch {
        // WA gagal tapi absensi tetap tercatat
        console.error("Gagal kirim WA");
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: `Absensi ${jenis} berhasil untuk ${siswa.nama}`,
      data: {
        siswa: siswa.nama,
        kelas: siswa.kelas,
        jenis,
        waktu,
        wa_terkirim: waTerkirim,
      },
    });
  } catch (error) {
    console.error("Error absensi:", error);
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
