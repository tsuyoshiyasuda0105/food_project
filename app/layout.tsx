import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "仕入れ予報 ダッシュボード",
  description: "地域の食品価格、天候、観光消費、宿泊需要を確認する需要予測ダッシュボード",
  icons: {
    icon: "/favicon.svg"
  }
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
