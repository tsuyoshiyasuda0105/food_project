import type { Metadata } from "next";
import LandingPage from "./lp/page";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    absolute: "仕入れ予報｜食品価格・卸売市場・統計データをAIで見える化"
  },
  description:
    "仕入れ予報は、食品価格・卸売市場・統計データを見える化し、AIが経営判断をサポートするWebサービスです。農業生産者、飲食店、スーパーの仕入れ担当、宿泊・民泊事業者、家庭の買い物判断に役立つ情報を届けます。",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "食品価格",
    "卸売市場",
    "卸売相場",
    "仕入れ予報",
    "農産物 価格",
    "農業 売り値",
    "野菜 相場",
    "果物 相場",
    "米 価格",
    "食肉 価格",
    "スーパー バイヤー",
    "飲食店 仕入れ",
    "民泊 需要",
    "観光 消費",
    "統計データ AI"
  ],
  openGraph: {
    title: "仕入れ予報｜食品価格・卸売市場・統計データをAIで見える化",
    description:
      "農業生産者、飲食店、スーパー、宿泊・民泊事業者向けに、価格・天候・家計・観光需要をまとめて見える化する食品データサービス。",
    images: [
      {
        url: "/landing-generated-dashboard.png",
        width: 1672,
        height: 941,
        alt: "仕入れ予報の食品価格ダッシュボード"
      }
    ],
    locale: "ja_JP",
    siteName: "仕入れ予報",
    type: "website",
    url: siteUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "仕入れ予報｜食品価格・卸売市場・統計データをAIで見える化",
    description:
      "食品価格・卸売市場・統計データを見える化し、AIが経営判断をサポートします。",
    images: ["/landing-generated-dashboard.png"]
  }
};

export default function Home() {
  return <LandingPage />;
}
