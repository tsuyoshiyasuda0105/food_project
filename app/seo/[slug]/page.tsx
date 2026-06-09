import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://food-project-taupe-seven.vercel.app").replace(/\/$/, "");

type SeoArticle = {
  audience: string;
  description: string;
  keywords: string[];
  noteUrl?: string;
  slug: string;
  title: string;
  sections: {
    heading: string;
    body: string;
  }[];
};

const seoArticles: SeoArticle[] = [
  {
    audience: "農業・飲食店・スーパー・家庭向け",
    description:
      "米価格を生産量、相対取引価格、小売価格、消費量から整理し、農家の売り値、飲食店の仕入れ、スーパーの価格判断、家庭の買い時に使える見方を解説します。",
    keywords: [
      "米価格",
      "米 相対取引価格",
      "米 仕入れ価格",
      "米 小売価格",
      "農家 売り値",
      "飲食店 仕入れ",
      "スーパー 仕入れ",
      "食品価格 統計",
      "家計 米 消費"
    ],
    noteUrl: "https://note.com/bold_vole5830/n/n5f6cfaceecd7",
    slug: "rice-price-report",
    title: "米価格は本当に下がったのか。生産量・仕入れ価格・小売価格・消費から見る",
    sections: [
      {
        heading: "生産量は増えているが、仕入れ価格はまだ高い",
        body:
          "令和7年産の主食用米は収穫量が718万1,000tとなり、前年産より増えています。一方で、令和8年4月の相対取引価格は33,447円 / 玄米60kgで、前年同月より高い水準です。米価格を見るときは、生産量だけでなく、相対取引価格、流通量、在庫、小売価格を分けて確認する必要があります。"
      },
      {
        heading: "店頭価格と仕入れ価格には時間差がある",
        body:
          "スーパーの店頭価格は下がり始めていますが、卸売段階の価格がすぐに下がるとは限りません。飲食店やスーパーの仕入れ担当は、店頭価格だけで判断せず、相対取引価格と小売価格の両方を見て、原価率や販促タイミングを決めることが重要です。"
      },
      {
        heading: "農家、飲食店、家庭で見るべき数字は違う",
        body:
          "農家は売り値と出荷判断、飲食店は仕入れ価格と原価率、スーパーは販売数量と店頭価格、家庭は小売価格と家計支出を見る必要があります。同じ米価格でも、立場によって使う数字が違うため、生産から消費までの流れで見ることが大切です。"
      },
      {
        heading: "詳しい分析はnoteでも公開しています",
        body:
          "今回の米価格レポートは、noteでも読みやすい形で公開しています。公開記事はこちらです。https://note.com/bold_vole5830/n/n5f6cfaceecd7"
      }
    ]
  },
  {
    audience: "飲食店向け",
    description:
      "飲食店が食品価格、卸売市場、天候、家計需要を見ながら仕入れとメニュー判断を行うための考え方をまとめます。",
    keywords: ["飲食店 仕入れ", "食品価格", "卸売市場", "原価管理", "メニュー開発"],
    slug: "restaurant-food-cost",
    title: "飲食店の仕入れ判断に食品価格データを使う方法",
    sections: [
      {
        heading: "原価が動く前提でメニューを考える",
        body:
          "野菜、果物、米、肉、卵は、天候や入荷量で価格が動きます。日々の中値や前年同月比を見ておくと、値上がり前に代替食材や限定メニューを考えやすくなります。"
      },
      {
        heading: "安い食材を売上につなげる",
        body:
          "価格が下がり、入荷量が多い食材は販促の候補です。仕入れ予報では、安い品目を大きく表示し、飲食店が今日使いやすい食材を見つけやすくします。"
      }
    ]
  },
  {
    audience: "スーパー・バイヤー向け",
    description:
      "スーパーの仕入れ担当が青果、米、肉、卵、天候、家計データを使って売場と発注を判断するためのページです。",
    keywords: ["スーパー バイヤー", "仕入れ担当", "青果 価格", "食品需要予測", "売場づくり"],
    slug: "supermarket-buyer",
    title: "スーパーの仕入れ担当が見るべき食品価格と需要データ",
    sections: [
      {
        heading: "売場は価格と天候で変わる",
        body:
          "気温が上がると冷たい食品、サラダ、果物、飲料の需要が伸びやすくなります。価格だけでなく、週間予報や1か月予報を合わせて見ることで、発注量と売場づくりの精度を上げられます。"
      },
      {
        heading: "前年同月比で異常値を見つける",
        body:
          "前年同月より高いのか安いのか、入荷量が多いのか少ないのかを並べると、平年と違う動きが見つかります。ヒートマップは大量の品目を短時間で見るための入口です。"
      }
    ]
  },
  {
    audience: "農業生産者向け",
    description:
      "農業生産者が卸売価格、入荷量、需要の流れを把握し、出荷や売値の判断に活用するための解説です。",
    keywords: ["農業 売値", "生産者 価格", "出荷判断", "青果 卸売価格", "農産物 需要"],
    slug: "farmer-selling-price",
    title: "農業生産者が売値と出荷判断に使える価格データ",
    sections: [
      {
        heading: "市場価格を知ることは交渉材料になる",
        body:
          "生産者にとって、自分の作物が市場でどの価格帯にあるかを知ることは大切です。卸売市場の中値、入荷量、前年同月比を見ることで、出荷のタイミングや販売先との会話がしやすくなります。"
      },
      {
        heading: "需要側の動きも合わせて見る",
        body:
          "価格は供給だけでなく、家庭、飲食店、観光需要でも変わります。仕入れ予報では、家計調査や宿泊・観光消費も合わせて、地域ごとの需要感を見える化します。"
      }
    ]
  },
  {
    audience: "民泊・宿泊業向け",
    description:
      "民泊や宿泊業が宿泊者数、外国人宿泊者数、国籍別消費、食品需要を見ながら運営判断するためのページです。",
    keywords: ["民泊 需要", "宿泊者数", "外国人宿泊者数", "インバウンド 消費", "観光需要"],
    slug: "minpaku-tourism-demand",
    title: "民泊・宿泊業が見たい宿泊者数とインバウンド消費データ",
    sections: [
      {
        heading: "宿泊需要は周辺消費に変わる",
        body:
          "宿泊者数や外国人宿泊者数が増える地域では、飲食、買い物、宿泊関連消費が伸びやすくなります。地域の食品需要を見るうえでも観光データは重要です。"
      },
      {
        heading: "国籍別の消費内訳を見る",
        body:
          "食費、買い物代、宿泊費、旅行費用を国籍別に見ると、どの客層にどのサービスを用意するか考えやすくなります。"
      }
    ]
  },
  {
    audience: "天候データ活用",
    description:
      "気象庁の週間予報と1か月予報を、食品価格や需要予測と組み合わせて使う考え方を解説します。",
    keywords: ["気象庁 1か月予報", "食品価格 天候", "需要予測", "気温 降水量", "仕入れ 予報"],
    slug: "weather-food-price",
    title: "天候と食品価格の関係を仕入れ判断に使う",
    sections: [
      {
        heading: "暑さ、寒さ、雨は需要を変える",
        body:
          "気温が高い日は果物、飲料、冷たい食品が動きやすく、雨が続くと買い物行動や外食需要が変わります。天候は価格だけでなく、売れ方を見るための重要なシグナルです。"
      },
      {
        heading: "1か月予報は今月の売場づくりに向く",
        body:
          "日々の天気だけではなく、地域の1か月傾向を見ることで、旬、売場、在庫、広告の方向性を早めに決められます。"
      }
    ]
  },
  {
    audience: "家庭・家計向け",
    description:
      "家庭や主婦層が食品価格、前年同月比、天候を見ながら買い時を判断するための解説です。",
    keywords: ["食品価格 家計", "野菜 価格", "米 価格", "買い時", "家計調査"],
    slug: "household-food-price",
    title: "家計に役立つ食品価格と買い時の見方",
    sections: [
      {
        heading: "高い理由が見えると買い方を変えられる",
        body:
          "野菜や果物が高いとき、入荷量が少ないのか、天候の影響なのか、前年より高いのかが分かると、代替品を選びやすくなります。"
      },
      {
        heading: "安い品目を見つけて献立に活かす",
        body:
          "ヒートマップで安い品目を見つければ、買い物や献立の判断に使えます。家庭向けにも、卸売価格の傾向は十分に価値があります。"
      }
    ]
  }
];

function getArticle(slug: string) {
  return seoArticles.find((article) => article.slug === slug);
}

export function generateStaticParams() {
  return seoArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const article = getArticle(resolvedParams.slug);
  if (!article) {
    return {};
  }

  return {
    title: article.title,
    description: article.description,
    alternates: {
      canonical: `/seo/${article.slug}`
    },
    keywords: article.keywords,
    openGraph: {
      title: `${article.title} | 仕入れ予報`,
      description: article.description,
      type: "article",
      url: `${siteUrl}/seo/${article.slug}`
    }
  };
}

export default async function SeoArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const article = getArticle(resolvedParams.slug);
  if (!article) {
    notFound();
  }

  return (
    <main className="seo-page">
      <section className="seo-hero">
        <Link href="/" className="seo-back-link">
          仕入れ予報へ戻る
        </Link>
        <span>{article.audience}</span>
        <h1>{article.title}</h1>
        <p>{article.description}</p>
        <div className="seo-keywords">
          {article.keywords.map((keyword) => (
            <strong key={keyword}>{keyword}</strong>
          ))}
        </div>
      </section>

      <section className="seo-body">
        {article.sections.map((section) => (
          <article key={section.heading}>
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>

      {article.noteUrl ? (
        <section className="seo-cta">
          <span>note連携記事</span>
          <h2>noteでも読みやすく公開しています</h2>
          <p>同じテーマをnote向けに読みやすく整理した記事です。自社サイトとnoteを相互リンクさせ、検索流入の入口を増やします。</p>
          <a href={article.noteUrl} rel="noopener noreferrer" target="_blank">
            note記事を読む
          </a>
        </section>
      ) : null}

      <section className="seo-cta">
        <span>無料ダッシュボード</span>
        <h2>地域の食品価格と需要を、画面で確認できます。</h2>
        <p>野菜、果物、米、肉、卵、天候、宿泊・観光データを組み合わせて、仕入れや売場判断に使える情報として表示します。</p>
        <Link href="/dashboard">ダッシュボードを見る</Link>
      </section>
    </main>
  );
}
