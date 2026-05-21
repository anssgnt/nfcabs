import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET - List semua siswa
export async function GET() {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("siswa")
    .select("*")
    .order("nama", { ascending: true });

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "OK",
    data,
  });
}

// POST - Tambah siswa baru
export async function POST(request: NextRequest) {
  const supabase = createServiceClient();
  const body = await request.json();

  const { nama, kelas, nis, nfc_uid, no_hp_ortu, nama_ortu } = body;

  if (!nama || !kelas || !nis || !nfc_uid || !no_hp_ortu) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "Semua field wajib diisi" },
      { status: 400 }
    );
  }

  // Cek duplikasi NFC UID
  const { data: existing } = await supabase
    .from("siswa")
    .select("id")
    .eq("nfc_uid", nfc_uid)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: "NFC UID sudah terdaftar" },
      { status: 409 }
    );
  }

  const { data, error } = await supabase
    .from("siswa")
    .insert({ nama, kelas, nis, nfc_uid, no_hp_ortu, nama_ortu, aktif: true })
    .select()
    .single();

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "Siswa berhasil ditambahkan",
    data,
  });
}
