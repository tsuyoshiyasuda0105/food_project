const JAFIC_MARKET_URL = "https://www.market.jafic.or.jp/";
const JAFIC_BUSINESS_URL = "https://www.jafic.or.jp/business/market/";

export type JaficFishLink = {
  title: string;
  url: string;
};

const dailySampleColumns = [
  "市場",
  "水揚日",
  "魚種名",
  "数量(t)",
  "魚体組成(大)",
  "魚体組成(中)",
  "魚体組成(小)",
  "魚体組成(極小)",
  "大_高値",
  "大_中値",
  "大_安値",
  "中_高値",
  "中_中値",
  "中_安値",
  "小_高値",
  "小_中値",
  "小_安値",
  "極小_高値",
  "極小_中値",
  "極小_安値"
];

const dailySampleRows = [
  {
    市場: "浜中",
    水揚日: "11/18分",
    魚種名: "生マイワシ",
    "数量(t)": "24",
    "大_高値": "205",
    "大_中値": "186",
    "大_安値": "167"
  },
  {
    市場: "厚岸",
    水揚日: "11/18分",
    魚種名: "生マイワシ",
    "数量(t)": "1",
    "大_高値": "216",
    "大_中値": "216",
    "大_安値": "216"
  },
  {
    市場: "気仙沼",
    水揚日: "11/18分",
    魚種名: "生マイワシ",
    "数量(t)": "1",
    "大_高値": "22",
    "大_中値": "22",
    "大_安値": "22"
  }
];

function decodeBuffer(buffer: ArrayBuffer, encoding: "utf-8" | "shift_jis") {
  return new TextDecoder(encoding).decode(buffer);
}

async function fetchShiftJisHtml(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "text/html,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`JAFIC fetch failed: ${response.status} ${url}`);
  }

  return decodeBuffer(await response.arrayBuffer(), "shift_jis");
}

function cleanHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractLinks(html: string) {
  return Array.from(html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)).map(
    (match) => ({
      title: cleanHtml(match[2]),
      url: new URL(match[1], JAFIC_MARKET_URL).toString()
    })
  );
}

export async function fetchJaficFishSummary() {
  const html = await fetchShiftJisHtml(JAFIC_MARKET_URL);
  const links = extractLinks(html);
  const monthlyLinks = links
    .filter((link) => link.url.includes("/file/sanchi/") && link.url.includes("01_tukibetu"))
    .slice(0, 8);
  const refrigeratedLinks = links
    .filter((link) => link.url.includes("/file/reizo/"))
    .slice(0, 4);

  return {
    ok: true,
    source: "JAFIC 産地水産物流通調査",
    generatedAt: new Date().toISOString(),
    sourceUrl: JAFIC_MARKET_URL,
    businessUrl: JAFIC_BUSINESS_URL,
    latestMonthlyLinks: monthlyLinks,
    latestRefrigeratedLinks: refrigeratedLinks,
    dailySampleColumns,
    dailySampleRows,
    note: "JAFICの公開サイトはShift_JISのHTMLとExcel/HTML資料が中心です。本日の水揚げ情報は市場・水揚日・魚種・数量・魚体サイズ別の高値/中値/安値として取り込みます。"
  };
}
