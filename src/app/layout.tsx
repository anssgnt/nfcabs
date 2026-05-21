import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Absensi NFC - Dashboard",
  description: "Sistem Absensi Siswa dengan NFC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
