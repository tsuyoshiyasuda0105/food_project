import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ブログ",
  description:
    "仕入れ予報のSEOブログ一覧です。食品価格、卸売市場、農業、飲食店、スーパー、民泊、天候、家計調査に関する記事を掲載しています。",
  alternates: {
    canonical: "/blog"
  },
  openGraph: {
    title: "ブログ | 仕入れ予報",
    description:
      "食品価格・卸売市場・統計データを経営判断に使うためのブログ記事一覧です。",
    type: "website",
    url: `${siteUrl}/blog`
  }
};

const articles = [
  {
    href: "/seo/meat-price-report",
    label: "肉価格",
    title: "肉の価格はどこで決まるのか。生産量・卸売市場・家計データから読む",
    text: "牛肉・豚肉・鶏肉の仕入れ判断を、生産量、食肉卸売市場、家計調査の流れで整理します。"
  },
  {
    href: "/seo/rice-price-report",
    label: "米価格",
    title: "米価格は本当に下がったのか。生産量・仕入れ価格・小売価格・消費から見る",
    text: "農業関係者、飲食店、スーパー、家庭が見るべき米価格の流れを整理します。"
  },
  {
    href: "/seo/restaurant-food-cost",
    label: "飲食店",
    title: "飲食店の仕入れ判断に食品価格データを使う方法",
    text: "原価率、メニュー変更、代替食材の判断に使えるデータの見方です。"
  },
  {
    href: "/seo/supermarket-buyer",
    label: "スーパー",
    title: "スーパーの仕入れ担当が見るべき食品価格と需要データ",
    text: "売場づくり、発注量、販促の判断に使うポイントを整理します。"
  },
  {
    href: "/seo/farmer-selling-price",
    label: "農業",
    title: "農業生産者が売り値と出荷判断に使える価格データ",
    text: "卸売価格、入荷量、前年同月比を生産者目線で活用します。"
  },
  {
    href: "/seo/minpaku-tourism-demand",
    label: "民泊・観光",
    title: "民泊・宿泊業が見るべき宿泊者数とインバウンド消費データ",
    text: "宿泊者数、外国人宿泊者数、国籍別消費を地域需要として読みます。"
  },
  {
    href: "/seo/weather-food-price",
    label: "天候",
    title: "天候と食品価格の関係を仕入れ判断に使う",
    text: "気温、降水量、長期予報を価格と需要の変化に結びつけます。"
  },
  {
    href: "/seo/household-food-price",
    label: "家計",
    title: "家計に役立つ食品価格と買い時の見方",
    text: "家庭の支出、買い時、代替品の判断に使える価格データの見方です。"
  }
];

export default function BlogPage() {
  return (
    <main className="blog-page">
      <section className="blog-hero">
        <Link href="/" className="blog-back-link">
          仕入れ予報へ戻る
        </Link>
        <span>Blog</span>
        <h1>食品価格・卸売市場・統計データを、経営判断に使うためのブログ。</h1>
        <p>
          飲食店、スーパー、農業生産者、民泊・宿泊関係者、家庭向けに、公開統計と取得済みデータの読み方を整理しています。
        </p>
      </section>

      <section className="blog-list" aria-label="ブログ記事一覧">
        {articles.map((article) => (
          <Link href={article.href} key={article.href}>
            <span>{article.label}</span>
            <strong>{article.title}</strong>
            <p>{article.text}</p>
          </Link>
        ))}
      </section>

      <section className="blog-contact-cta">
        <div>
          <span>Contact</span>
          <h2>データ活用や広告掲載の相談も受け付けています。</h2>
        </div>
        <Link href="/contact">問い合わせる</Link>
      </section>
    </main>
  );
}
