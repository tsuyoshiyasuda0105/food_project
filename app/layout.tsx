import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "仕入れ予報",
    template: "%s | 仕入れ予報"
  },
  description:
    "食品価格・卸売市場・統計データを見える化し、AIが経営判断をサポートするWebサービスです。",
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
