import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");
const pageUrl = `${siteUrl}/`;
const serviceName = "仕入れ予報";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "仕入れ予報 | 食品価格・天候・観光消費を地域別に予測するダッシュボード",
  description:
    "野菜、果物、米、肉、卵の価格に、気象庁予報、家計調査、卸売市場、日本政府観光局（JNTO）、観光消費、宿泊・民泊需要を重ね、飲食店・スーパー・民泊・主婦・生産者の判断を支援します。",
  alternates: {
    canonical: "/"
  },
  keywords: [
    "食品価格",
    "野菜価格",
    "果物価格",
    "米価格",
    "牛肉価格",
    "豚肉価格",
    "卵価格",
    "卸売市場",
    "気象庁",
    "家計調査",
    "食品需要予測",
    "スーパー バイヤー 仕入れ",
    "飲食店 仕入れ",
    "民泊 経営 データ",
    "宿泊需要",
    "訪日外国人 消費",
    "日本政府観光局 JNTO",
    "観光消費",
    "都道府県 食品価格",
    "生産者 出荷判断"
  ],
  openGraph: {
    title: "仕入れ予報 | 地域の食品価格と観光消費を、売上判断に変える",
    description:
      "食品価格、天候、家計、卸売市場、訪日客、宿泊・民泊需要を都道府県別に重ねる地域需要インテリジェンス。",
    images: [
      {
        url: "/landing-generated-dashboard.png",
        width: 1672,
        height: 941,
        alt: "仕入れ予報の食品価格ヒートマップ"
      }
    ],
    locale: "ja_JP",
    siteName: serviceName,
    type: "website",
    url: pageUrl
  },
  twitter: {
    card: "summary_large_image",
    title: "仕入れ予報 | 食品価格・天候・観光消費の地域ダッシュボード",
    description: "飲食店、スーパー、民泊、主婦、生産者向けに、地域の食品価格と需要変化を見える化します。",
    images: ["/landing-generated-dashboard.png"]
  }
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: serviceName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: pageUrl,
  isAccessibleForFree: true,
  description:
    "食品価格、卸売市場、米・肉・卵、気象庁予報、家計調査、日本政府観光局（JNTO）、観光消費、宿泊・民泊需要を統合し、都道府県別に需要予測を可視化するWebダッシュボード。",
  audience: [
    { "@type": "Audience", audienceType: "飲食店・料理店" },
    { "@type": "Audience", audienceType: "スーパーのバイヤー・仕入れ担当" },
    { "@type": "Audience", audienceType: "民泊経営者・宿泊施設" },
    { "@type": "Audience", audienceType: "主婦・家庭" },
    { "@type": "Audience", audienceType: "生産者" }
  ],
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
    name: "無料ダッシュボード"
  },
  featureList: [
    "都道府県ごとの食品価格・天候・観光需要ダッシュボード",
    "野菜・果物・米・肉・卵のヒートマップ",
    "気象庁予報と過去データを使った今月の見通し",
    "訪日外客数・観光消費・宿泊統計の可視化",
    "Pythonスケジューラによる日次取得と再取得",
    "ローカル10年保存とWeb配信用データの分離"
  ]
};

const heroMetrics = [
  { value: "47", label: "都道府県別に初期表示" },
  { value: "10年", label: "ローカルDB保存を想定" },
  { value: "5層", label: "生産・供給・価格・家計・観光" }
];

const simpleSteps = [
  {
    number: "01",
    title: "価格を見る",
    text: "野菜、果物、米、肉、卵を、安い・高い・入荷が多いで直感的に確認します。"
  },
  {
    number: "02",
    title: "地域で読む",
    text: "都道府県、天候、宿泊、訪日消費を重ね、地元で起きる需要を見ます。"
  },
  {
    number: "03",
    title: "行動に変える",
    text: "仕入れ、売場、献立、民泊備品、出荷判断へつながる見通しを表示します。"
  }
];

const signalCards = [
  {
    title: "安い品目を大きく表示",
    text: "ヒートマップで価格が下がった品目や入荷が多い品目をすぐ見つけ、売場・献立・仕入れに使えます。",
    tag: "Food"
  },
  {
    title: "天候から需要を読む",
    text: "気象庁の週間予報と1か月予報から、暑さ、雨、冷え込みが食品需要に与える影響を要約します。",
    tag: "Weather"
  },
  {
    title: "訪日客と消費を重ねる",
    text: "日本政府観光局（JNTO）と観光消費データを使い、飲食、買物、宿泊、民泊備品の需要を地域別に見ます。",
    tag: "Tourism"
  },
  {
    title: "取れない日も取り戻す",
    text: "Python取得スケジュール、失敗時リトライ、PC・サーバーダウン後の再取得まで運用画面で管理します。",
    tag: "Ops"
  }
];

const audienceCards = [
  {
    role: "飲食店",
    headline: "原価が上がる前にメニューを変える",
    detail: "肉・卵・野菜・米の仕入れ価格を見て、日替わり、代替食材、値付けを判断。"
  },
  {
    role: "スーパー",
    headline: "朝の仕入れと売場を決める",
    detail: "安い品目を入口へ、高い品目は露出調整。気温や雨も販促に反映。"
  },
  {
    role: "民泊・宿泊",
    headline: "稼働率と国籍別消費を読む",
    detail: "宿泊者数、外国人宿泊者数、客室稼働率、食費・買物代・宿泊費を表示。"
  },
  {
    role: "主婦・家庭",
    headline: "今週の買い時と節約を知る",
    detail: "前年同月比と価格推移で、買うもの・控えるもの・献立の方向性を判断。"
  },
  {
    role: "生産者",
    headline: "出荷量と需要の波を合わせる",
    detail: "生産量、供給量、仕入れ価格、家計支出、観光需要の流れを確認。"
  }
];

const sourceGroups = [
  {
    name: "食品価格",
    items: ["青果物卸売市場調査", "食肉卸売市場調査", "鶏卵市況", "米の相対取引価格"]
  },
  {
    name: "生活・天候",
    items: ["気象庁 週間予報", "気象庁 1か月予報", "家計調査", "小売物価統計"]
  },
  {
    name: "観光・宿泊",
    items: ["日本政府観光局（JNTO）", "観光庁 インバウンド消費動向調査", "宿泊旅行統計", "民泊関連データ"]
  }
];

const flowSteps = [
  "生産量",
  "供給量",
  "仕入れ価格",
  "家計支出",
  "観光消費",
  "需要予測"
];

const monetizationCards = [
  {
    label: "Phase 1",
    title: "無料公開で毎朝見る習慣を作る",
    text: "地域名、品目名、食品価格、民泊、訪日消費のSEO記事とLPから無料ダッシュボードへ流入を作ります。"
  },
  {
    label: "Phase 2",
    title: "地域広告と協賛枠",
    text: "食品卸、物流、農産物、宿泊備品、地域スーパーなど、都道府県と品目に合わせた広告を掲載します。"
  },
  {
    label: "Phase 3",
    title: "有料アラート・AI予測",
    text: "価格高騰、買い時、入荷増、民泊備品、訪日消費増を通知する月額プランへ展開します。"
  },
  {
    label: "Phase 4",
    title: "API・業務連携",
    text: "ローカル10年保存の時系列データを、仕入れ、発注、BI、宿泊運営システムへ連携します。"
  }
];

const seoLinkCards = [
  {
    href: "/seo/meat-price-report",
    label: "肉価格レポート",
    title: "肉の価格はどこで決まるのか。生産量・卸売市場・家計データから読む",
    text: "牛肉・豚肉・鶏肉の仕入れ判断を、生産量、食肉卸売市場、家計調査の流れで整理します。"
  },
  {
    href: "/seo/rice-price-report",
    label: "米価格レポート",
    title: "米価格は本当に下がったのか。生産量・仕入れ価格・小売価格・消費から見る",
    text: "農家の売り値、飲食店の仕入れ、スーパーの価格判断、家庭の買い時に使える米価格データの見方を整理。note記事とも相互リンクします。"
  },
  {
    href: "/seo/restaurant-food-cost",
    label: "飲食店向け",
    title: "飲食店の仕入れ判断に食品価格データを使う方法",
    text: "原価管理、メニュー変更、代替食材の判断に使える食品価格・卸売市場データの見方。"
  },
  {
    href: "/seo/supermarket-buyer",
    label: "スーパー・バイヤー向け",
    title: "スーパーの仕入れ担当が見るべき食品価格と需要データ",
    text: "青果、米、肉、卵、天候、家計需要を売場づくりと発注判断に変える考え方。"
  },
  {
    href: "/seo/farmer-selling-price",
    label: "農業生産者向け",
    title: "農業生産者が売値と出荷判断に使える価格データ",
    text: "卸売価格、入荷量、前年同月比を見て、出荷タイミングや売値の判断材料にする。"
  },
  {
    href: "/seo/minpaku-tourism-demand",
    label: "民泊・宿泊業向け",
    title: "民泊・宿泊業が見たい宿泊者数とインバウンド消費データ",
    text: "宿泊者数、外国人宿泊者数、国籍別消費を地域の食品・観光需要として読む。"
  },
  {
    href: "/seo/weather-food-price",
    label: "天候データ活用",
    title: "天候と食品価格の関係を仕入れ判断に使う",
    text: "気象庁の週間予報と1か月予報を、価格変動や需要予測のシグナルとして使う。"
  },
  {
    href: "/seo/household-food-price",
    label: "家庭・家計向け",
    title: "家計に役立つ食品価格と買い時の見方",
    text: "野菜、果物、米、肉、卵の前年同月比を見て、買い時や献立判断に活かす。"
  }
];

export default function LandingPage() {
  return (
    <main className="landing-page">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      <nav className="landing-nav" aria-label="ランディングページ">
        <Link href="/" className="landing-brand">
          仕入れ予報
        </Link>
        <div>
          <a href="#product">画面</a>
          <a href="#users">対象者</a>
          <a href="#business">収益化</a>
          <Link href="/blog">ブログ</Link>
          <Link href="/contact">問い合わせ</Link>
          <Link href="/dashboard">アプリを見る</Link>
        </div>
      </nav>

      <section className="landing-hero" aria-label="仕入れ予報">
        <Image
          alt="仕入れ予報の食品価格ヒートマップ"
          className="landing-hero-image"
          fill
          priority
          sizes="100vw"
          src="/landing-generated-dashboard.png"
        />
        <div className="landing-hero-shade" />
        <div className="landing-hero-copy">
          <span className="landing-eyebrow">食品価格 × 天候 × 観光消費 × 地域需要</span>
          <h1>仕入れ予報</h1>
          <strong className="landing-hero-lead">地域の「今日売れるもの」を、データで先に見る。</strong>
          <p>
            仕入れ予報は、野菜・果物・米・肉・卵の価格に、気象庁予報、家計調査、卸売市場、
            日本政府観光局（JNTO）、観光消費、宿泊・民泊需要を重ねる地域需要ダッシュボードです。
          </p>
          <div className="landing-hero-actions">
            <Link href="/dashboard" className="landing-primary-button">
              無料ダッシュボードを見る
            </Link>
            <Link href="/blog" className="landing-ghost-button">
              ブログを見る
            </Link>
          </div>
          <div className="landing-hero-metrics" aria-label="主要な特徴">
            {heroMetrics.map((metric) => (
              <div key={metric.label}>
                <strong>{metric.value}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-simple" aria-label="仕入れ予報でできること">
        <div className="landing-simple-head">
          <span>Simple View</span>
          <h2>見れば、今日の判断が決まる。</h2>
        </div>
        <div className="landing-simple-grid">
          {simpleSteps.map((step) => (
            <article key={step.number}>
              <span>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-problem">
        <div className="landing-section-head">
          <span>Why Now</span>
          <h2>値上げ、天候、観光需要。もう勘だけでは朝の判断が追いつかない。</h2>
          <p>
            飲食店は原価、スーパーは仕入れと売場、民泊は備品と朝食、家庭は買い時、生産者は出荷タイミングを気にしています。
            それぞれ別々に見ていた公開データを、ひとつの地域画面に集めます。
          </p>
        </div>
        <div className="landing-signal-grid">
          {signalCards.map((card) => (
            <article key={card.title}>
              <span>{card.tag}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-product" id="product">
        <div className="landing-product-copy">
          <span>Product</span>
          <h2>安い品目は大きく、前年同月比は色で。大量データでも一目で読める。</h2>
          <p>
            野菜・果物・米・食肉・卵を同じヒートマップ形式に統一。クリックすると2年分の推移グラフを開き、
            仕入れ価格、供給量、家計支出、宿泊需要との関係を確認できます。
          </p>
          <ul>
            <li>1日・1週間・1か月で表示期間を切り替え</li>
            <li>価格が安いものは緑、高いものは赤、横ばいは青</li>
            <li>都道府県・市場・カテゴリを初期設定で固定</li>
          </ul>
        </div>
        <div className="landing-screen-frame">
          <Image
            alt="食品価格ヒートマップと地域需要ダッシュボード"
            height={941}
            sizes="(max-width: 820px) 100vw, 58vw"
            src="/landing-generated-dashboard.png"
            width={1672}
          />
        </div>
      </section>

      <section className="landing-section landing-users" id="users">
        <div className="landing-section-head">
          <span>Use Cases</span>
          <h2>同じデータを、見る人ごとの行動に翻訳します。</h2>
        </div>
        <div className="landing-user-grid">
          {audienceCards.map((card) => (
            <article key={card.role}>
              <span>{card.role}</span>
              <h3>{card.headline}</h3>
              <p>{card.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-flow">
        <div className="landing-flow-copy">
          <span>Flow</span>
          <h2>生産量から家計、観光消費まで。お金が動く順番で見せる。</h2>
          <p>
            コメ、小麦、肉、卵、野菜、果物をカテゴリ別に並べ、生産量、供給量、仕入れ価格、家計支出、観光消費の順に可視化します。
            天候がどこに影響するのかも、グラフと表で追える設計です。
          </p>
        </div>
        <div className="landing-flow-rail" aria-label="データの流れ">
          {flowSteps.map((step, index) => (
            <div key={step} className="landing-flow-node">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="landing-section landing-business" id="business">
        <div className="landing-section-head">
          <span>Business Model</span>
          <h2>無料で広げ、地域広告・有料予測・APIで収益化する。</h2>
          <p>
            まずは検索流入と無料利用を優先し、「毎朝見るダッシュボード」として習慣化。
            データが蓄積したら、地域と品目に連動する広告、有料アラート、業務APIへ広げます。
          </p>
        </div>
        <div className="landing-business-grid">
          {monetizationCards.map((card) => (
            <article key={card.label}>
              <span>{card.label}</span>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-section landing-seo-links" id="seo-links" aria-label="仕入れ予報の用途別SEOリンク">
        <div className="landing-section-head">
          <span>SEO Topics</span>
          <h2>用途別に、食品価格・卸売市場・天候データの見方を解説しています。</h2>
          <p>
            飲食店、スーパーの仕入れ担当、農業生産者、民泊・宿泊業、家庭向けに、
            仕入れ予報のデータをどう使うかを分けて整理しました。
          </p>
        </div>
        <div className="landing-seo-grid">
          {seoLinkCards.map((card) => (
            <Link href={card.href} key={card.href}>
              <span>{card.label}</span>
              <strong>{card.title}</strong>
              <p>{card.text}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-cta">
        <span>Launch From Free Web</span>
        <h2>まずはWeb公開で、地域の食品価格と需要を毎朝見てもらう。</h2>
        <p>
          LPで検索流入を取り、無料ダッシュボードで利用習慣を作り、データが育ったところから収益化へ進めます。
        </p>
        <Link href="/dashboard" className="landing-primary-button">
          アプリを開く
        </Link>
        <Link href="/blog" className="landing-ghost-button">
          ブログを見る
        </Link>
        <Link href="/contact" className="landing-ghost-button">
          問い合わせる
        </Link>
      </section>
    </main>
  );
}
