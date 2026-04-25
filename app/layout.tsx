import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATHANOR — Beeton",
  description: "Thoth Tarot 6-layer divination spread"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
