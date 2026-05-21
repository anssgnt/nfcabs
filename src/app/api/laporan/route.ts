import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { ApiResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET - Laporan absensi dengan filter
export async function GET(request: NextRequest) {
  const supabase = createServiceClient();
  const { searchParams } = new URL(request.url);

  const tanggal = searchParams.get("tanggal"); // YYYY-MM-DD
  const kelas = searchParams.get("kelas");
  const jenis = searchParams.get("jenis");
  const siswa_id = searchParams.get("siswa_id");

  let query = supabase
    .from("log_absensi")
    .select(`
      *,
      siswa:siswa_id (nama, kelas, nis)
    `)
    .order("waktu", { ascending: false });

  if (tanggal) {
    const startOfDay = `${tanggal}T00:00:00.000Z`;
    const endOfDay = `${tanggal}T23:59:59.999Z`;
    query = query.gte("waktu", startOfDay).lte("waktu", endOfDay);
  }

  if (jenis) {
    query = query.eq("jenis", jenis);
  }

  if (siswa_id) {
    query = query.eq("siswa_id", siswa_id);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  // Filter by kelas (from joined table)
  let filtered = data;
  if (kelas) {
    filtered = data?.filter((item: any) => item.siswa?.kelas === kelas) || [];
  }

  return NextResponse.json<ApiResponse>({
    success: true,
    message: "OK",
    data: filtered,
  });
}
