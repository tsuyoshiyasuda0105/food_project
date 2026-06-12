import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGeneratedSeoArticles } from "@/lib/seo-markdown";

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
    "audience": "米価格レポート",
    "description": "米価格の変動を、生産量、供給量、相対取引価格、卸売・小売、家計支出の流れで整理。農業経営、スーパー仕入れ、飲食店、家庭が価格上昇や買い時を判断するための見方を解説します。",
    "keywords": [
      "米価格",
      "米 価格 高騰",
      "米 仕入れ価格",
      "米 卸売価格",
      "米 相対取引価格",
      "米 生産量",
      "米 需給",
      "米 小売価格",
      "スーパー 米 仕入れ",
      "飲食店 米 仕入れ",
      "農業経営 米 価格",
      "家計 米 支出",
      "仕入れ予報"
    ],
    "noteUrl": "https://note.com/bold_vole5830/n/n5c692e9ab93c",
    "slug": "rice-price-procurement",
    "title": "米価格はなぜ動くのか。生産量・卸売価格・家計から見る仕入れ判断",
    "sections": [
      {
        "heading": "米価格を見るときの基本は「川上から川下」",
        "body": "米の価格は、いきなり店頭で決まるわけではありません。 大きく見ると、次の順番で動きます。 この流れを一つずつ見ると、「なぜ今の米価格になっているのか」がかなり見えやすくなります。"
      },
      {
        "heading": "生産量が減ると、価格上昇の圧力が出やすい",
        "body": "米は天候や作況の影響を受けます。 高温、台風、長雨、水不足などで収穫量や品質に影響が出ると、供給に不安が出ます。供給量が減る可能性が高まると、仕入れ側は早めに在庫を確保しようとします。 その結果、価格が上がりやすくなります。"
      },
      {
        "heading": "仕入れ価格は「相対取引価格」を必ず見る",
        "body": "米の仕入れ判断では、相対取引価格が重要です。 相対取引価格は、出荷業者と卸売業者などの取引価格を見るための指標です。小売価格よりも川上に近いので、店頭価格に変化が出る前のサインとして使えます。 たとえば、相対取引価格が上がっているのに店頭価格がまだ大きく動いていない場合、今後の小売価格や外食原価に影響が出る可能性があります。"
      },
      {
        "heading": "家計支出を見ると「買い控え」や「代替」が見える",
        "body": "米価格が上がると、家計にも影響します。 家計調査などで米への支出が増えている場合、それが単価上昇によるものなのか、購入数量の増加によるものなのかを分けて見る必要があります。 支出が増えていても数量が減っているなら、消費者は価格上昇を受けて買い控えをしている可能性があります。"
      },
      {
        "heading": "スーパー仕入れでは「価格」だけでなく「売場の見せ方」も変わる",
        "body": "スーパーの仕入れ担当者は、価格が上がる局面で単純に値上げするだけでは売上を落とす可能性があります。 見るべきポイントは次の通りです。 相対取引価格が上がっているか"
      },
      {
        "heading": "飲食店は米価格を「原価率」だけで見ない方がいい",
        "body": "飲食店では、米の値上がりを原価率だけで判断しがちです。 しかし、米は定食、丼、寿司、弁当、カレー、ラーメンのライスセットなど、多くのメニューに関係します。 米価格が上がるときは、次の判断が必要です。"
      },
      {
        "heading": "農業経営では「売り値の見える化」が重要になる",
        "body": "農業関係者にとっても、市場価格や小売価格の見える化は重要です。 自分たちの生産物が、どの価格で流通し、最終的に消費者にどう届いているのかを知ることで、販売戦略を考えやすくなります。 特に米は、地域、銘柄、等級、流通先によって見え方が変わります。生産量だけでなく、相対取引価格、卸売価格、小売価格、家計支出を同じ画面で比較できると、判断材料として使いやすくなります。"
      },
      {
        "heading": "仕入れ予報で見えるようにしたいこと",
        "body": "「仕入れ予報」では、米を含む食品価格を、事業者にも家庭にも分かりやすく見える化することを目指しています。 具体的には、次のような情報を組み合わせます。 米の相対取引価格"
      }
    ]
  },
  {
    audience: "飲食店・スーパー・畜産生産者・家庭向け",
    description:
      "肉価格を生産量、食肉卸売市場、家計調査から整理し、牛肉・豚肉・鶏肉の仕入れ判断や売場づくり、家庭の買い時に使える見方を解説します。",
    keywords: [
      "肉価格",
      "食肉卸売市場",
      "牛肉価格",
      "豚肉価格",
      "肉 仕入れ価格",
      "飲食店 仕入れ 肉",
      "スーパー 仕入れ 肉",
      "家計調査 肉類",
      "畜産物流通調査"
    ],
    noteUrl: "https://note.com/bold_vole5830/n/n53ee606cf9ab",
    slug: "meat-price-report",
    title: "肉の価格はどこで決まるのか。生産量・卸売市場・家計データから読む",
    sections: [
      {
        heading: "肉価格は生産量、卸売市場、家計需要を分けて見る",
        body:
          "肉の価格は、店頭価格だけでは判断できません。畜産物流通調査で生産・流通量を見て、食肉卸売市場調査で牛・豚の枝肉価格と成立頭数を見て、家計調査で生活側の需要を確認する必要があります。牛肉、豚肉、鶏肉は供給サイクルも価格の動き方も違うため、肉全体ではなく品目別に見ることが重要です。"
      },
      {
        heading: "2026年6月9日の取得済み食肉市況",
        body:
          "仕入れ予報で取得した2026年6月9日の食肉日別市況では、豚は主要8市場の平均価格が614円/kg、成立頭数合計が2,325頭でした。東京市場では豚の平均価格が603円/kg、成立頭数が919頭です。牛は119件のレコードを取得し、主要市場の平均価格は1,979円/kg、東京市場の和牛めすA平均は2,577円/kgでした。"
      },
      {
        heading: "飲食店とスーパーは代替需要を見る",
        body:
          "牛肉が高い局面では、家庭や飲食店の需要が豚肉・鶏肉へ移りやすくなります。飲食店は原価率を見ながら豚肉定食、鶏肉メニュー、ひき肉料理を強める判断ができます。スーパーは豚こま、鶏もも、ひき肉、惣菜用の肉を売場づくりに活用しやすくなります。"
      },
      {
        heading: "家計調査で生活側の反応を見る",
        body:
          "総務省の家計調査は、家庭がどの食品に支出しているかを見るための重要な統計です。卸売市場で価格が動いても、家計がすぐに同じ方向へ動くとは限りません。家計支出と卸売価格を並べることで、価格上昇が消費を抑えているのか、代替品へ移っているのかを読みやすくなります。"
      }
    ]
  },
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

const generatedSeoArticles = getGeneratedSeoArticles();
const allSeoArticles = [...generatedSeoArticles, ...seoArticles];

function getArticle(slug: string) {
  return allSeoArticles.find((article) => article.slug === slug);
}

export function generateStaticParams() {
  return allSeoArticles.map((article) => ({ slug: article.slug }));
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
        <Link href="/blog">ブログ一覧を見る</Link>
        <Link href="/contact">問い合わせる</Link>
      </section>
    </main>
  );
}
