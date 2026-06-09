import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
const noteProfileUrl = "https://note.com/bold_vole5830";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "お問い合わせ",
  description:
    "仕入れ予報へのお問い合わせページです。無料ベータ版の利用相談、広告掲載、データ連携、農業・飲食店・スーパー向けの活用相談を受け付けています。",
  alternates: {
    canonical: "/contact"
  },
  openGraph: {
    title: "お問い合わせ | 仕入れ予報",
    description:
      "食品価格、卸売市場、統計データ、AI予測を活用した仕入れ判断についてご相談ください。",
    type: "website",
    url: `${siteUrl}/contact`
  }
};

const contactTopics = [
  {
    title: "無料ベータ版を使いたい",
    text: "飲食店、スーパー、農業関係、民泊・宿泊関係での利用イメージを確認します。"
  },
  {
    title: "広告掲載・協業の相談",
    text: "地域の食品事業者、卸売、農業資材、宿泊関連サービスとの掲載相談を受け付けます。"
  },
  {
    title: "データ連携の相談",
    text: "価格、在庫、売上、気象、観光需要など、自社データとの連携可能性を整理します。"
  }
];

export default function ContactPage() {
  const subject = encodeURIComponent("仕入れ予報への問い合わせ");
  const body = encodeURIComponent(
    [
      "お問い合わせ内容:",
      "",
      "お名前:",
      "会社名・屋号:",
      "業種:",
      "都道府県:",
      "相談したい内容:"
    ].join("\n")
  );

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <Link href="/" className="contact-back-link">
          仕入れ予報へ戻る
        </Link>
        <span>Contact</span>
        <h1>仕入れ判断、売場づくり、広告掲載の相談はこちら。</h1>
        <p>
          仕入れ予報は、食品価格・卸売市場・気象・家計・観光需要を組み合わせて、地域の経営判断を支える無料ベータ版として公開しています。
          使ってみたい方、掲載や連携を相談したい方は、下記からご連絡ください。
        </p>
        <div className="contact-actions">
          {contactEmail ? (
            <a href={`mailto:${contactEmail}?subject=${subject}&body=${body}`}>メールで問い合わせる</a>
          ) : (
            <a href={noteProfileUrl} rel="noopener noreferrer" target="_blank">
              noteから問い合わせる
            </a>
          )}
          <Link href="/blog">ブログを見る</Link>
        </div>
      </section>

      <section className="contact-topics" aria-label="問い合わせ内容">
        {contactTopics.map((topic) => (
          <article key={topic.title}>
            <h2>{topic.title}</h2>
            <p>{topic.text}</p>
          </article>
        ))}
      </section>

      <section className="contact-form-guide">
        <div>
          <span>What to include</span>
          <h2>最初の問い合わせでは、地域と業種がわかるだけで十分です。</h2>
        </div>
        <ul>
          <li>飲食店、スーパー、農業、宿泊、家庭向けなどの利用目的</li>
          <li>見たい都道府県、市場、品目</li>
          <li>広告掲載、データ連携、レポート作成などの相談内容</li>
        </ul>
      </section>
    </main>
  );
}
