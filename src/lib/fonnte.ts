interface SendMessageParams {
  phone: string;
  message: string;
}

export async function sendWhatsApp({ phone, message }: SendMessageParams) {
  const response = await fetch("https://api.fonnte.com/send", {
    method: "POST",
    headers: {
      Authorization: process.env.FONNTE_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      target: phone,
      message: message,
      countryCode: "62",
    }),
  });

  const data = await response.json();
  return data;
}

export function buildAbsensiMessage(
  namaSiswa: string,
  jenisAbsensi: string,
  waktu: string
): string {
  const jenisLabel: Record<string, string> = {
    datang: "tiba di sekolah",
    pulang: "pulang dari sekolah",
    sholat_dhuha: "melaksanakan sholat Dhuha",
    sholat_dhuhur: "melaksanakan sholat Dhuhur",
    khusus: "tercatat absensi khusus",
  };

  const label = jenisLabel[jenisAbsensi] || jenisAbsensi;

  return (
    `📋 *NOTIFIKASI ABSENSI*\n\n` +
    `Assalamu'alaikum Bapak/Ibu,\n\n` +
    `Ananda *${namaSiswa}* telah ${label} pada:\n` +
    `🕐 ${waktu}\n\n` +
    `Terima kasih.\n` +
    `_Sistem Absensi NFC Sekolah_`
  );
}
