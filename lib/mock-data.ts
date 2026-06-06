import {
  aggregateCurrentMarketRows,
  type ProduceMarketPriceRow
} from "./price-aggregation";

export type Tone = "red" | "green" | "blue" | "amber" | "slate";

export type Department = "vegetable" | "fruit";

export type RegionCode = "kanto" | "tokai" | "kinki" | "kyushu";

export type WholesaleItem = {
  code: string;
  name: string;
  department: Department;
  group: string;
  unit: string;
  marketRows?: ProduceMarketPriceRow[];
  priceBasisLabel?: string;
  middlePrice: number;
  highPrice: number;
  lowPrice: number;
  weekChange: number;
  yearMonthChange: number;
  normalRatio: number;
  volumeChange: number;
  supplyLabel: string;
  judgment: string;
  tone: Tone;
  score: number;
  action: string;
};

export type Metric = {
  label: string;
  main: string;
  sub: string;
  tone: Tone;
};

export type RegionProfile = {
  code: RegionCode;
  name: string;
  market: string;
  weatherArea: string;
  updatedAt: string;
  weatherLabel: string;
  priceLabel: string;
  demandNote: string;
  logisticsNote: string;
  focusCodes: string[];
  highlights: Metric[];
};

export type InboundMarket = {
  country: string;
  shareLabel: string;
  note: string;
  tone: Tone;
};

export type InboundProfile = {
  regionCode: RegionCode;
  headline: string;
  statusLabel: string;
  visitorIndex: number;
  stayIndex: number;
  spendIndex: number;
  monthChange: number;
  topMarkets: InboundMarket[];
  demandItems: Metric[];
  foodDemandNote: string;
  actionNote: string;
  apiSourceLabel: string;
};

export type MinpakuProfile = {
  regionCode: RegionCode;
  headline: string;
  statusLabel: string;
  demandIndex: number;
  occupancyIndex: number;
  cleaningIndex: number;
  supplyIndex: number;
  weekChange: number;
  guestTypeLabel: string;
  riskLabel: string;
  demandItems: Metric[];
  operationNotes: Metric[];
  foodDemandNote: string;
  actionNote: string;
  apiSourceLabel: string;
};

export type PrefectureCode =
  | "hokkaido"
  | "aomori"
  | "iwate"
  | "miyagi"
  | "akita"
  | "yamagata"
  | "fukushima"
  | "ibaraki"
  | "tochigi"
  | "gunma"
  | "saitama"
  | "chiba"
  | "tokyo"
  | "kanagawa"
  | "niigata"
  | "toyama"
  | "ishikawa"
  | "fukui"
  | "yamanashi"
  | "nagano"
  | "gifu"
  | "shizuoka"
  | "aichi"
  | "mie"
  | "shiga"
  | "kyoto"
  | "osaka"
  | "hyogo"
  | "nara"
  | "wakayama"
  | "tottori"
  | "shimane"
  | "okayama"
  | "hiroshima"
  | "yamaguchi"
  | "tokushima"
  | "kagawa"
  | "ehime"
  | "kochi"
  | "fukuoka"
  | "saga"
  | "nagasaki"
  | "kumamoto"
  | "oita"
  | "miyazaki"
  | "kagoshima"
  | "okinawa";

export type PrefectureOption = {
  code: PrefectureCode;
  name: string;
  regionCode: RegionCode;
};

export type NationalityTravelExpense = {
  country: string;
  diningExpenseYen: number;
  shoppingExpenseYen: number;
  lodgingExpenseYen: number;
  totalTravelExpenseYen: number;
  note: string;
  tone: Tone;
};

export type LodgingNationalityGuest = {
  country: string;
  guests: number;
  share: number;
  travelExpense: NationalityTravelExpense;
  tone: Tone;
};

export type PrefectureLodgingProfile = {
  prefectureCode: PrefectureCode;
  prefectureName: string;
  regionCode: RegionCode;
  totalGuests: number;
  foreignGuests: number;
  roomOccupancyRate: number;
  nationalityGuests: LodgingNationalityGuest[];
  monthChange: number;
  updatedAt: string;
  demandNote: string;
};

export type WeatherSignal = {
  name: string;
  low: number;
  normal: number;
  high: number;
  value: string;
};

export type ActionItem = {
  label: string;
  tone: Tone;
  title: string;
  description: string;
};

export type PricePoint = {
  label: string;
  current: number;
  lastYear: number;
  normal: number;
};

export type CategoryTab = {
  id: "all" | Department | string;
  label: string;
  countLabel: string;
};

export const dashboardSummary = {
  title: "仕入れ予報",
  market: "東京都中央卸売市場",
  area: "関東甲信",
  updatedAt: "更新 06:40",
  dateLabel: "2026年6月4日",
  decision: "卸売中値で高騰・買い時を即判断。くだものは露出強化候補を分けて確認。",
  note:
    "中値、前年同月比、平年比、入荷量を同じ面で比較します。品目が増えたら検索とカテゴリで絞り、注目品目だけカードで監視します。"
};

export const metrics: Metric[] = [
  {
    label: "高騰注意",
    main: "キャベツ",
    sub: "中値 184円/kg / 前年同月比 +38%",
    tone: "red"
  },
  {
    label: "特売向き",
    main: "きゅうり",
    sub: "中値 286円/kg / 前週比 -8%",
    tone: "green"
  },
  {
    label: "果物チャンス",
    main: "すいか",
    sub: "高温需要 / 入荷量 +12%",
    tone: "blue"
  },
  {
    label: "廃棄注意",
    main: "葉物野菜",
    sub: "高温時の鮮度劣化リスク",
    tone: "amber"
  }
];

export const regionProfiles: RegionProfile[] = [
  {
    code: "kanto",
    name: "関東甲信",
    market: "東京都中央卸売市場",
    weatherArea: "関東甲信地方",
    updatedAt: "更新 06:40",
    weatherLabel: "高温傾向",
    priceLabel: "葉物高騰・果菜買い時",
    demandNote: "首都圏は気温上昇で、すいか、きゅうり、トマト、冷やし惣菜連動の需要が伸びやすい想定です。",
    logisticsNote: "朝便で葉物の鮮度確認を優先。午後便はカット野菜と果物の補充を厚めにします。",
    focusCodes: ["cabbage", "watermelon", "cucumber", "spinach"],
    highlights: [
      { label: "高騰注意", main: "キャベツ", sub: "関東は入荷減。売価調整を優先", tone: "red" },
      { label: "販促向き", main: "きゅうり", sub: "高温と入荷増で入口展開向き", tone: "green" },
      { label: "果物チャンス", main: "すいか", sub: "週末の高温販促に合わせる", tone: "blue" },
      { label: "鮮度注意", main: "葉物野菜", sub: "気温上昇で廃棄リスク上昇", tone: "amber" }
    ]
  },
  {
    code: "tokai",
    name: "東海",
    market: "名古屋市中央卸売市場",
    weatherArea: "東海地方",
    updatedAt: "更新 06:35",
    weatherLabel: "蒸し暑さ強め",
    priceLabel: "果菜・柑橘を厚め",
    demandNote: "湿度が高く、冷やし麺、サラダ、カットフルーツと相性のよい品目が動きやすい想定です。",
    logisticsNote: "昼以降は鮮度劣化が出やすいため、葉物は少量補充、果菜と果物は平台回転を重視します。",
    focusCodes: ["tomato", "cucumber", "mandarin", "melon"],
    highlights: [
      { label: "需要増", main: "トマト", sub: "冷やし惣菜と連動しやすい", tone: "green" },
      { label: "販促向き", main: "きゅうり", sub: "浅漬け・サラダ訴求", tone: "green" },
      { label: "果物", main: "メロン", sub: "家庭用価格帯を中心に展開", tone: "blue" },
      { label: "注意", main: "葉物", sub: "蒸し暑さで傷みやすい", tone: "amber" }
    ]
  },
  {
    code: "kinki",
    name: "近畿",
    market: "大阪市中央卸売市場",
    weatherArea: "近畿地方",
    updatedAt: "更新 06:30",
    weatherLabel: "日照多め",
    priceLabel: "果物露出・根菜安定",
    demandNote: "日照が多い日は、すいか、もも、ぶどうなど季節果実の売場露出で売上を取りやすい想定です。",
    logisticsNote: "果物は入口から主通路へ。根菜は価格安定枠としてまとめ買い訴求を維持します。",
    focusCodes: ["peach", "grape", "watermelon", "potato"],
    highlights: [
      { label: "果物強化", main: "もも", sub: "旬訴求と回転重視", tone: "green" },
      { label: "高値注意", main: "ぶどう", sub: "小容量で単価感を抑える", tone: "red" },
      { label: "安定", main: "じゃがいも", sub: "まとめ買いに使いやすい", tone: "blue" },
      { label: "天候", main: "日照多め", sub: "季節果実の露出を強化", tone: "amber" }
    ]
  },
  {
    code: "kyushu",
    name: "九州北部",
    market: "福岡市中央卸売市場",
    weatherArea: "九州北部地方",
    updatedAt: "更新 06:25",
    weatherLabel: "降水多め",
    priceLabel: "入荷変動・葉物注意",
    demandNote: "降水が多い日は来店動機が弱くなりやすいため、定番野菜と即食性の高い果物を絞って見せます。",
    logisticsNote: "雨天時は午前の売れ行きを見て追加発注を判断。葉物は鮮度と在庫過多に注意します。",
    focusCodes: ["banana", "kiwi", "hakusai", "moyashi"],
    highlights: [
      { label: "定番安定", main: "バナナ", sub: "雨天でも動きやすい定番果物", tone: "blue" },
      { label: "代替向き", main: "はくさい", sub: "キャベツ代替で訴求", tone: "green" },
      { label: "低価格", main: "もやし", sub: "高騰野菜の代替枠", tone: "green" },
      { label: "注意", main: "葉物", sub: "雨天で在庫を持ちすぎない", tone: "amber" }
    ]
  }
];

export const inboundProfiles: InboundProfile[] = [
  {
    regionCode: "kanto",
    headline: "都心・空港動線で果物と即食需要が強い",
    statusLabel: "回復強",
    visitorIndex: 128,
    stayIndex: 134,
    spendIndex: 142,
    monthChange: 18,
    topMarkets: [
      { country: "韓国", shareLabel: "短期滞在", note: "コンビニ・即食・果物カット需要", tone: "green" },
      { country: "台湾", shareLabel: "買物強め", note: "季節果実と土産系の相性が良い", tone: "blue" },
      { country: "中国", shareLabel: "単価高め", note: "高単価果物と外食需要に寄与", tone: "amber" }
    ],
    demandItems: [
      { label: "果物", main: "すいか", sub: "ホテル・空港周辺でカット需要", tone: "green" },
      { label: "即食", main: "カット野菜", sub: "惣菜連動で小容量を厚め", tone: "blue" },
      { label: "外食", main: "トマト", sub: "飲食店向け需要を加味", tone: "green" },
      { label: "注意", main: "葉物", sub: "人流増でも廃棄リスクは高い", tone: "amber" }
    ],
    foodDemandNote: "訪日客が多い地域は、果物、カット野菜、サラダ、冷やし惣菜の回転が上がりやすい想定です。",
    actionNote: "空港・ホテル・繁華街近隣の店舗は、入口に季節果実、惣菜横にカット野菜を寄せます。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / e-Stat宿泊旅行統計 / RESAS観光マップ"
  },
  {
    regionCode: "tokai",
    headline: "広域移動と工業都市滞在で定番需要が堅い",
    statusLabel: "安定増",
    visitorIndex: 112,
    stayIndex: 118,
    spendIndex: 120,
    monthChange: 9,
    topMarkets: [
      { country: "台湾", shareLabel: "観光", note: "果物・菓子売場と相性が良い", tone: "blue" },
      { country: "韓国", shareLabel: "短期", note: "即食・コンビニ導線が強い", tone: "green" },
      { country: "米国", shareLabel: "長め", note: "ホテル滞在で朝食需要", tone: "amber" }
    ],
    demandItems: [
      { label: "果菜", main: "トマト", sub: "サラダ・惣菜連動", tone: "green" },
      { label: "果物", main: "メロン", sub: "家庭用価格帯を厚め", tone: "blue" },
      { label: "定番", main: "バナナ", sub: "朝食需要に強い", tone: "green" },
      { label: "注意", main: "葉物", sub: "蒸し暑さで鮮度管理", tone: "amber" }
    ],
    foodDemandNote: "宿泊需要が伸びる日は、朝食向け果物とサラダ素材の補充優先度を上げます。",
    actionNote: "駅前・ホテル近隣では、バナナ、トマト、カットサラダを小容量で見せます。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / e-Stat宿泊旅行統計 / RESAS外国人訪問分析"
  },
  {
    regionCode: "kinki",
    headline: "観光集中エリアで果物・外食需要が強い",
    statusLabel: "高水準",
    visitorIndex: 146,
    stayIndex: 152,
    spendIndex: 158,
    monthChange: 21,
    topMarkets: [
      { country: "中国", shareLabel: "消費強め", note: "高単価果実と外食に寄与", tone: "red" },
      { country: "韓国", shareLabel: "短期", note: "即食・惣菜需要", tone: "green" },
      { country: "欧米", shareLabel: "滞在長め", note: "ホテル朝食・外食需要", tone: "blue" }
    ],
    demandItems: [
      { label: "果物", main: "もも", sub: "旬訴求と回転を重視", tone: "green" },
      { label: "高単価", main: "ぶどう", sub: "小容量で単価感を抑える", tone: "red" },
      { label: "外食", main: "なす", sub: "飲食店需要を加味", tone: "blue" },
      { label: "即食", main: "カット果物", sub: "観光動線で露出", tone: "green" }
    ],
    foodDemandNote: "観光客の滞在が強い地域は、季節果実と外食向け野菜の需要を同時に見ます。",
    actionNote: "繁華街・観光地近隣では、果物を入口、外食向け野菜を業務需要の見える棚に寄せます。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / e-Stat宿泊旅行統計 / RESAS外国人訪問分析"
  },
  {
    regionCode: "kyushu",
    headline: "アジア近距離客で即食・定番果物が動きやすい",
    statusLabel: "回復中",
    visitorIndex: 118,
    stayIndex: 126,
    spendIndex: 124,
    monthChange: 12,
    topMarkets: [
      { country: "韓国", shareLabel: "近距離", note: "短期滞在で即食需要", tone: "green" },
      { country: "台湾", shareLabel: "観光", note: "果物・土産導線が強い", tone: "blue" },
      { country: "香港", shareLabel: "買物", note: "高品質果物の訴求余地", tone: "amber" }
    ],
    demandItems: [
      { label: "定番", main: "バナナ", sub: "朝食・即食で安定", tone: "blue" },
      { label: "果物", main: "キウイ", sub: "ホテル朝食向け", tone: "green" },
      { label: "代替", main: "もやし", sub: "低価格帯を維持", tone: "green" },
      { label: "注意", main: "葉物", sub: "雨天時は在庫を絞る", tone: "amber" }
    ],
    foodDemandNote: "短期滞在が多い地域は、即食性と持ち運びやすさを優先して需要を見ます。",
    actionNote: "駅・港・ホテル近隣は、バナナ、キウイ、小容量サラダを補充優先にします。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / e-Stat宿泊旅行統計 / RESAS外国人訪問分析"
  }
];

export const minpakuProfiles: MinpakuProfile[] = [
  {
    regionCode: "kanto",
    headline: "都心・空港・イベント動線で短期滞在の回転が高い",
    statusLabel: "週末強め",
    demandIndex: 136,
    occupancyIndex: 82,
    cleaningIndex: 91,
    supplyIndex: 78,
    weekChange: 14,
    guestTypeLabel: "短期・家族/グループ",
    riskLabel: "清掃手配と備品欠品に注意",
    demandItems: [
      { label: "朝食", main: "バナナ", sub: "セルフ朝食・小容量で補充", tone: "blue" },
      { label: "果物", main: "カット果物", sub: "空港/都心滞在で即食需要", tone: "green" },
      { label: "惣菜", main: "サラダ", sub: "夜到着客向けに動きやすい", tone: "green" },
      { label: "備品", main: "水・紙類", sub: "連泊より回転増で消耗", tone: "amber" }
    ],
    operationNotes: [
      { label: "清掃", main: "翌日午前", sub: "チェックアウト集中。外注枠を前日確保", tone: "amber" },
      { label: "補充", main: "2泊分", sub: "水・タオル・紙類を標準より厚め", tone: "blue" },
      { label: "食品", main: "即食中心", sub: "火を使わない果物・サラダが向く", tone: "green" },
      { label: "価格", main: "高稼働", sub: "週末は単価維持、平日は連泊割", tone: "green" }
    ],
    foodDemandNote: "民泊はホテルより自炊・即食の比率が高く、バナナ、カット果物、サラダ、飲料、紙類の需要に変換しやすいです。",
    actionNote: "週末前は清掃枠と備品を先に確保し、近隣スーパー向けには小容量の朝食・即食セットを出します。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / 住宅宿泊事業届出件数 / e-Stat宿泊旅行統計 / 地域イベント"
  },
  {
    regionCode: "tokai",
    headline: "駅周辺・広域移動客で平日滞在と週末観光が混在",
    statusLabel: "安定",
    demandIndex: 114,
    occupancyIndex: 68,
    cleaningIndex: 72,
    supplyIndex: 70,
    weekChange: 7,
    guestTypeLabel: "出張・観光混在",
    riskLabel: "平日と週末で補充量を分ける",
    demandItems: [
      { label: "朝食", main: "バナナ", sub: "出張滞在の朝食補助", tone: "blue" },
      { label: "野菜", main: "トマト", sub: "サラダ・軽食と相性", tone: "green" },
      { label: "果物", main: "メロン", sub: "週末観光の地域訴求", tone: "blue" },
      { label: "備品", main: "洗剤", sub: "連泊時の自炊・洗濯需要", tone: "amber" }
    ],
    operationNotes: [
      { label: "平日", main: "連泊対応", sub: "洗剤・紙類を厚め", tone: "blue" },
      { label: "週末", main: "観光対応", sub: "即食果物と飲料を補充", tone: "green" },
      { label: "清掃", main: "標準", sub: "急な回転増に予備枠", tone: "amber" },
      { label: "価格", main: "安定", sub: "イベント日は上限単価", tone: "green" }
    ],
    foodDemandNote: "東海は出張と観光が混ざるため、朝食の定番と週末の果物訴求を分けて見ると使いやすいです。",
    actionNote: "駅前店舗は平日朝食、週末は果物・飲料。民泊運営側は連泊備品を定型セットにします。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / 住宅宿泊事業届出件数 / e-Stat宿泊旅行統計 / RESAS人流"
  },
  {
    regionCode: "kinki",
    headline: "観光地・繁華街周辺で民泊回転と食品需要が高い",
    statusLabel: "高需要",
    demandIndex: 152,
    occupancyIndex: 88,
    cleaningIndex: 96,
    supplyIndex: 86,
    weekChange: 19,
    guestTypeLabel: "観光・長め滞在",
    riskLabel: "清掃遅延と高単価果物の欠品に注意",
    demandItems: [
      { label: "果物", main: "もも", sub: "観光客の即食・土産需要", tone: "green" },
      { label: "果物", main: "ぶどう", sub: "高単価でも小容量で動く", tone: "red" },
      { label: "自炊", main: "なす", sub: "長め滞在の簡単調理", tone: "blue" },
      { label: "備品", main: "タオル", sub: "高回転で不足しやすい", tone: "amber" }
    ],
    operationNotes: [
      { label: "清掃", main: "最優先", sub: "チェックアウト集中を分散", tone: "red" },
      { label: "補充", main: "多め", sub: "水・紙類・タオルを厚め", tone: "amber" },
      { label: "食品", main: "果物", sub: "小容量・持ち帰り導線", tone: "green" },
      { label: "価格", main: "強気", sub: "観光集中日は単価維持", tone: "green" }
    ],
    foodDemandNote: "近畿は観光集中で、民泊周辺の小売は果物、飲料、即食惣菜、簡単調理食材の需要が伸びやすいです。",
    actionNote: "観光地近隣は果物小容量と飲料を入口へ。民泊運営は清掃外注とタオル在庫を先に押さえます。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / 住宅宿泊事業届出件数 / e-Stat宿泊旅行統計 / 地域イベント"
  },
  {
    regionCode: "kyushu",
    headline: "港・空港周辺で短期滞在の即食需要が出やすい",
    statusLabel: "回復中",
    demandIndex: 121,
    occupancyIndex: 74,
    cleaningIndex: 79,
    supplyIndex: 73,
    weekChange: 11,
    guestTypeLabel: "近距離アジア・短期",
    riskLabel: "雨天時は直前キャンセルと備品過多に注意",
    demandItems: [
      { label: "朝食", main: "バナナ", sub: "短期滞在でも動きやすい", tone: "blue" },
      { label: "果物", main: "キウイ", sub: "ホテル/民泊朝食向け", tone: "green" },
      { label: "低価格", main: "もやし", sub: "自炊需要の底支え", tone: "green" },
      { label: "備品", main: "傘・水", sub: "雨天時の追加需要", tone: "amber" }
    ],
    operationNotes: [
      { label: "雨天", main: "在庫抑制", sub: "食品補充は午前需要で判断", tone: "amber" },
      { label: "清掃", main: "通常強化", sub: "短期回転に予備枠", tone: "blue" },
      { label: "食品", main: "即食", sub: "バナナ・キウイ・飲料", tone: "green" },
      { label: "価格", main: "回復中", sub: "週末だけ単価を上げる", tone: "green" }
    ],
    foodDemandNote: "九州北部は近距離アジア客の短期滞在が多く、持ち運びやすい果物、飲料、軽食の需要を見ます。",
    actionNote: "雨天時は食品を積みすぎず、傘・水・紙類を補助。駅・港近隣は即食果物を厚めにします。",
    apiSourceLabel: "出典: 日本政府観光局（JNTO） / 住宅宿泊事業届出件数 / e-Stat宿泊旅行統計 / RESAS人流"
  }
];

export const prefectureOptions: PrefectureOption[] = [
  { code: "hokkaido", name: "北海道", regionCode: "kanto" },
  { code: "aomori", name: "青森県", regionCode: "kanto" },
  { code: "iwate", name: "岩手県", regionCode: "kanto" },
  { code: "miyagi", name: "宮城県", regionCode: "kanto" },
  { code: "akita", name: "秋田県", regionCode: "kanto" },
  { code: "yamagata", name: "山形県", regionCode: "kanto" },
  { code: "fukushima", name: "福島県", regionCode: "kanto" },
  { code: "ibaraki", name: "茨城県", regionCode: "kanto" },
  { code: "tochigi", name: "栃木県", regionCode: "kanto" },
  { code: "gunma", name: "群馬県", regionCode: "kanto" },
  { code: "saitama", name: "埼玉県", regionCode: "kanto" },
  { code: "chiba", name: "千葉県", regionCode: "kanto" },
  { code: "tokyo", name: "東京都", regionCode: "kanto" },
  { code: "kanagawa", name: "神奈川県", regionCode: "kanto" },
  { code: "niigata", name: "新潟県", regionCode: "tokai" },
  { code: "toyama", name: "富山県", regionCode: "tokai" },
  { code: "ishikawa", name: "石川県", regionCode: "tokai" },
  { code: "fukui", name: "福井県", regionCode: "tokai" },
  { code: "yamanashi", name: "山梨県", regionCode: "tokai" },
  { code: "nagano", name: "長野県", regionCode: "tokai" },
  { code: "gifu", name: "岐阜県", regionCode: "tokai" },
  { code: "shizuoka", name: "静岡県", regionCode: "tokai" },
  { code: "aichi", name: "愛知県", regionCode: "tokai" },
  { code: "mie", name: "三重県", regionCode: "tokai" },
  { code: "shiga", name: "滋賀県", regionCode: "kinki" },
  { code: "kyoto", name: "京都府", regionCode: "kinki" },
  { code: "osaka", name: "大阪府", regionCode: "kinki" },
  { code: "hyogo", name: "兵庫県", regionCode: "kinki" },
  { code: "nara", name: "奈良県", regionCode: "kinki" },
  { code: "wakayama", name: "和歌山県", regionCode: "kinki" },
  { code: "tottori", name: "鳥取県", regionCode: "kinki" },
  { code: "shimane", name: "島根県", regionCode: "kinki" },
  { code: "okayama", name: "岡山県", regionCode: "kinki" },
  { code: "hiroshima", name: "広島県", regionCode: "kinki" },
  { code: "yamaguchi", name: "山口県", regionCode: "kinki" },
  { code: "tokushima", name: "徳島県", regionCode: "kinki" },
  { code: "kagawa", name: "香川県", regionCode: "kinki" },
  { code: "ehime", name: "愛媛県", regionCode: "kinki" },
  { code: "kochi", name: "高知県", regionCode: "kinki" },
  { code: "fukuoka", name: "福岡県", regionCode: "kyushu" },
  { code: "saga", name: "佐賀県", regionCode: "kyushu" },
  { code: "nagasaki", name: "長崎県", regionCode: "kyushu" },
  { code: "kumamoto", name: "熊本県", regionCode: "kyushu" },
  { code: "oita", name: "大分県", regionCode: "kyushu" },
  { code: "miyazaki", name: "宮崎県", regionCode: "kyushu" },
  { code: "kagoshima", name: "鹿児島県", regionCode: "kyushu" },
  { code: "okinawa", name: "沖縄県", regionCode: "kyushu" }
];

const lodgingNationalitySamplesByRegion: Record<RegionCode, LodgingNationalityGuest[]> = {
  kanto: [],
  tokai: [],
  kinki: [],
  kyushu: []
};

const nationalityTravelExpensePresets: Record<
  string,
  Omit<NationalityTravelExpense, "country" | "tone">
> = {
  韓国: {
    diningExpenseYen: 38000,
    shoppingExpenseYen: 52000,
    lodgingExpenseYen: 68000,
    totalTravelExpenseYen: 214000,
    note: "近距離・短期滞在が多く、飲食と買物の回転が速い想定"
  },
  台湾: {
    diningExpenseYen: 46000,
    shoppingExpenseYen: 72000,
    lodgingExpenseYen: 76000,
    totalTravelExpenseYen: 258000,
    note: "果物、菓子、日用品の買物需要と外食需要が強い想定"
  },
  中国: {
    diningExpenseYen: 52000,
    shoppingExpenseYen: 116000,
    lodgingExpenseYen: 94000,
    totalTravelExpenseYen: 334000,
    note: "買物代と宿泊費が大きく、土産・高単価品の需要を見やすい想定"
  },
  米国: {
    diningExpenseYen: 64000,
    shoppingExpenseYen: 68000,
    lodgingExpenseYen: 142000,
    totalTravelExpenseYen: 404000,
    note: "長めの滞在と高めの宿泊費を想定。朝食・外食需要を厚めに見る"
  },
  香港: {
    diningExpenseYen: 54000,
    shoppingExpenseYen: 98000,
    lodgingExpenseYen: 92000,
    totalTravelExpenseYen: 316000,
    note: "買物と外食の単価が高く、果物・即食商品の需要に変換しやすい想定"
  },
  欧米: {
    diningExpenseYen: 70000,
    shoppingExpenseYen: 62000,
    lodgingExpenseYen: 158000,
    totalTravelExpenseYen: 446000,
    note: "長期滞在・宿泊費高め。朝食、飲食、体験消費を重視する想定"
  }
};

function normalizeNationalityCountry(country: string) {
  if (country === "アメリカ") return "米国";
  if (country.includes("欧米")) return "欧米";
  return country;
}

export function getNationalityTravelExpense(country: string, tone: Tone = "slate"): NationalityTravelExpense {
  const normalizedCountry = normalizeNationalityCountry(country);
  const preset =
    nationalityTravelExpensePresets[normalizedCountry] ?? {
      diningExpenseYen: 43000,
      shoppingExpenseYen: 56000,
      lodgingExpenseYen: 80000,
      totalTravelExpenseYen: 246000,
      note: "観光庁インバウンド消費動向調査を接続するまでの補完値"
    };

  return {
    country: normalizedCountry,
    tone,
    ...preset
  };
}

function lodgingNationalityGuest(
  country: string,
  guests: number,
  share: number,
  tone: Tone
): LodgingNationalityGuest {
  const normalizedCountry = normalizeNationalityCountry(country);

  return {
    country: normalizedCountry,
    guests,
    share,
    tone,
    travelExpense: getNationalityTravelExpense(normalizedCountry, tone)
  };
}

const baseLodgingNationalitySamplesByRegion: Record<RegionCode, LodgingNationalityGuest[]> = {
  kanto: [
    lodgingNationalityGuest("韓国", 4200, 34, "green"),
    lodgingNationalityGuest("台湾", 3100, 25, "blue"),
    lodgingNationalityGuest("米国", 2300, 19, "amber")
  ],
  tokai: [
    lodgingNationalityGuest("台湾", 2600, 31, "blue"),
    lodgingNationalityGuest("韓国", 2100, 25, "green"),
    lodgingNationalityGuest("米国", 1500, 18, "amber")
  ],
  kinki: [
    lodgingNationalityGuest("中国", 3600, 30, "red"),
    lodgingNationalityGuest("韓国", 3300, 28, "green"),
    lodgingNationalityGuest("欧米", 2400, 20, "blue")
  ],
  kyushu: [
    lodgingNationalityGuest("韓国", 3200, 36, "green"),
    lodgingNationalityGuest("台湾", 2300, 26, "blue"),
    lodgingNationalityGuest("香港", 1500, 17, "amber")
  ]
};

Object.assign(lodgingNationalitySamplesByRegion, baseLodgingNationalitySamplesByRegion);

const lodgingRegionOffsets: Record<RegionCode, number> = {
  kanto: 5200,
  tokai: 3600,
  kinki: 4700,
  kyushu: 3100
};

const prefectureLodgingProfileOverrides: Partial<
  Record<
    PrefectureCode,
    Partial<Omit<PrefectureLodgingProfile, "prefectureCode" | "prefectureName" | "regionCode" | "updatedAt">>
  >
> = {
  tokyo: {
    totalGuests: 248000,
    foreignGuests: 118000,
    roomOccupancyRate: 86,
    nationalityGuests: [
      lodgingNationalityGuest("韓国", 32000, 27, "green"),
      lodgingNationalityGuest("米国", 26000, 22, "amber"),
      lodgingNationalityGuest("台湾", 21000, 18, "blue")
    ],
    monthChange: 18,
    demandNote: "都市滞在とイベント需要を想定したAPI接続前のサンプルです。実統計値ではありません。"
  },
  osaka: {
    totalGuests: 168000,
    foreignGuests: 82000,
    roomOccupancyRate: 84,
    nationalityGuests: [
      lodgingNationalityGuest("韓国", 28000, 34, "green"),
      lodgingNationalityGuest("中国", 18000, 22, "red"),
      lodgingNationalityGuest("台湾", 14000, 17, "blue")
    ],
    monthChange: 16,
    demandNote: "繁華街・観光動線の宿泊回転を想定したモック値です。実統計値ではありません。"
  },
  kyoto: {
    totalGuests: 126000,
    foreignGuests: 69000,
    roomOccupancyRate: 88,
    nationalityGuests: [
      lodgingNationalityGuest("欧米", 22000, 32, "blue"),
      lodgingNationalityGuest("中国", 15000, 22, "red"),
      lodgingNationalityGuest("韓国", 12000, 17, "green")
    ],
    monthChange: 21,
    demandNote: "観光地の長め滞在を想定したAPI接続前サンプルです。実統計値ではありません。"
  },
  hokkaido: {
    totalGuests: 112000,
    foreignGuests: 47000,
    roomOccupancyRate: 79,
    nationalityGuests: [
      lodgingNationalityGuest("台湾", 17000, 36, "blue"),
      lodgingNationalityGuest("韓国", 11000, 23, "green"),
      lodgingNationalityGuest("香港", 8200, 17, "amber")
    ],
    monthChange: 12,
    demandNote: "広域観光と季節需要を想定したモック値です。実統計値ではありません。"
  },
  fukuoka: {
    totalGuests: 92000,
    foreignGuests: 43000,
    roomOccupancyRate: 81,
    nationalityGuests: [
      lodgingNationalityGuest("韓国", 23000, 53, "green"),
      lodgingNationalityGuest("台湾", 7600, 18, "blue"),
      lodgingNationalityGuest("香港", 4200, 10, "amber")
    ],
    monthChange: 13,
    demandNote: "近距離アジア客と都市滞在を想定したAPI接続前サンプルです。実統計値ではありません。"
  },
  okinawa: {
    totalGuests: 104000,
    foreignGuests: 56000,
    roomOccupancyRate: 87,
    nationalityGuests: [
      lodgingNationalityGuest("台湾", 21000, 38, "blue"),
      lodgingNationalityGuest("韓国", 14000, 25, "green"),
      lodgingNationalityGuest("香港", 9200, 16, "amber")
    ],
    monthChange: 19,
    demandNote: "リゾート滞在と連泊を想定したモック値です。実統計値ではありません。"
  },
  aichi: {
    totalGuests: 86000,
    foreignGuests: 31000,
    roomOccupancyRate: 74,
    nationalityGuests: [
      lodgingNationalityGuest("台湾", 9200, 30, "blue"),
      lodgingNationalityGuest("韓国", 7600, 25, "green"),
      lodgingNationalityGuest("米国", 5200, 17, "amber")
    ],
    monthChange: 9,
    demandNote: "出張・都市観光の混在を想定したAPI接続前サンプルです。実統計値ではありません。"
  }
};

export const prefectureLodgingProfiles: PrefectureLodgingProfile[] = prefectureOptions.map((option, index) => {
  const baseTotalGuests = 18000 + index * 940 + lodgingRegionOffsets[option.regionCode];
  const foreignRatio = 0.28 + (index % 5) * 0.035;
  const override = prefectureLodgingProfileOverrides[option.code] ?? {};

  return {
    prefectureCode: option.code,
    prefectureName: option.name,
    regionCode: option.regionCode,
    totalGuests: baseTotalGuests,
    foreignGuests: Math.round(baseTotalGuests * foreignRatio),
    roomOccupancyRate: 58 + (index % 9) * 3,
    nationalityGuests: lodgingNationalitySamplesByRegion[option.regionCode],
    monthChange: (index % 7) - 2,
    updatedAt: "API接続前サンプル",
    demandNote: `${option.name}の民泊表示確認用に作成したモック値です。実統計値ではありません。`,
    ...override
  };
});

export const categoryTabs: CategoryTab[] = [
  { id: "all", label: "すべて", countLabel: "24品目" },
  { id: "vegetable", label: "野菜", countLabel: "16品目" },
  { id: "fruit", label: "くだもの", countLabel: "8品目" },
  { id: "葉物", label: "葉物", countLabel: "4品目" },
  { id: "果菜", label: "果菜", countLabel: "5品目" },
  { id: "根菜", label: "根菜", countLabel: "4品目" }
];

const baseWholesaleItems: WholesaleItem[] = [
  {
    code: "cabbage",
    name: "キャベツ",
    department: "vegetable",
    group: "葉物",
    unit: "kg",
    middlePrice: 184,
    highPrice: 228,
    lowPrice: 142,
    weekChange: 12,
    yearMonthChange: 38,
    normalRatio: 42,
    volumeChange: -21,
    supplyLabel: "入荷減",
    judgment: "高騰注意",
    tone: "red",
    score: 88,
    action: "特売は回避。白菜、もやしで代替売場を作る。"
  },
  {
    code: "lettuce",
    name: "レタス",
    department: "vegetable",
    group: "葉物",
    unit: "kg",
    middlePrice: 312,
    highPrice: 386,
    lowPrice: 246,
    weekChange: 7,
    yearMonthChange: 22,
    normalRatio: 18,
    volumeChange: -9,
    supplyLabel: "やや減",
    judgment: "売価注意",
    tone: "amber",
    score: 64,
    action: "サラダ訴求は維持。小玉・半量パックで価格感を抑える。"
  },
  {
    code: "spinach",
    name: "ほうれん草",
    department: "vegetable",
    group: "葉物",
    unit: "kg",
    middlePrice: 698,
    highPrice: 820,
    lowPrice: 540,
    weekChange: 17,
    yearMonthChange: 31,
    normalRatio: 29,
    volumeChange: -16,
    supplyLabel: "入荷減",
    judgment: "発注抑制",
    tone: "red",
    score: 80,
    action: "廃棄回避を優先。小松菜、豆苗に誘導する。"
  },
  {
    code: "komatsuna",
    name: "小松菜",
    department: "vegetable",
    group: "葉物",
    unit: "kg",
    middlePrice: 356,
    highPrice: 420,
    lowPrice: 286,
    weekChange: -4,
    yearMonthChange: 5,
    normalRatio: 2,
    volumeChange: 6,
    supplyLabel: "安定",
    judgment: "代替向き",
    tone: "green",
    score: 74,
    action: "ほうれん草代替として露出を強める。"
  },
  {
    code: "cucumber",
    name: "きゅうり",
    department: "vegetable",
    group: "果菜",
    unit: "kg",
    middlePrice: 286,
    highPrice: 342,
    lowPrice: 238,
    weekChange: -8,
    yearMonthChange: -14,
    normalRatio: -10,
    volumeChange: 18,
    supplyLabel: "入荷増",
    judgment: "販促強化",
    tone: "green",
    score: 82,
    action: "冷やし惣菜、サラダ、浅漬けで前面展開。"
  },
  {
    code: "tomato",
    name: "トマト",
    department: "vegetable",
    group: "果菜",
    unit: "kg",
    middlePrice: 421,
    highPrice: 498,
    lowPrice: 358,
    weekChange: 3,
    yearMonthChange: 9,
    normalRatio: 6,
    volumeChange: 2,
    supplyLabel: "横ばい",
    judgment: "通常",
    tone: "blue",
    score: 58,
    action: "数量は維持。高単価品は露出を絞る。"
  },
  {
    code: "eggplant",
    name: "なす",
    department: "vegetable",
    group: "果菜",
    unit: "kg",
    middlePrice: 372,
    highPrice: 448,
    lowPrice: 308,
    weekChange: -3,
    yearMonthChange: -6,
    normalRatio: -4,
    volumeChange: 9,
    supplyLabel: "やや増",
    judgment: "夏売場",
    tone: "green",
    score: 72,
    action: "焼きなす、麻婆なす、夏野菜セットで訴求。"
  },
  {
    code: "green-pepper",
    name: "ピーマン",
    department: "vegetable",
    group: "果菜",
    unit: "kg",
    middlePrice: 398,
    highPrice: 462,
    lowPrice: 330,
    weekChange: -2,
    yearMonthChange: 4,
    normalRatio: 3,
    volumeChange: 4,
    supplyLabel: "安定",
    judgment: "通常",
    tone: "blue",
    score: 56,
    action: "定番棚を維持。肉詰め材料と連動。"
  },
  {
    code: "daikon",
    name: "だいこん",
    department: "vegetable",
    group: "根菜",
    unit: "kg",
    marketRows: [
      {
        market: "大田",
        itemName: "だいこん",
        origin: "青森",
        grade: "A",
        sizeClass: "L",
        quantityTons: 83.7,
        unitWeightKg: 10,
        highPriceYen: 1512,
        middlePriceYen: 1296,
        lowPriceYen: 1188
      },
      {
        market: "大田",
        itemName: "だいこん",
        origin: "千葉",
        grade: "A",
        sizeClass: "L",
        quantityTons: 54.7,
        unitWeightKg: 10,
        highPriceYen: 1620,
        middlePriceYen: 1080,
        lowPriceYen: 540
      }
    ],
    middlePrice: 118,
    highPrice: 154,
    lowPrice: 82,
    weekChange: -5,
    yearMonthChange: -12,
    normalRatio: -8,
    volumeChange: 14,
    supplyLabel: "入荷増",
    judgment: "買い時",
    tone: "green",
    score: 76,
    action: "サラダ、浅漬け、煮物の両面で売場を作る。"
  },
  {
    code: "carrot",
    name: "にんじん",
    department: "vegetable",
    group: "根菜",
    unit: "kg",
    middlePrice: 176,
    highPrice: 216,
    lowPrice: 132,
    weekChange: 2,
    yearMonthChange: 8,
    normalRatio: 5,
    volumeChange: -3,
    supplyLabel: "横ばい",
    judgment: "通常",
    tone: "blue",
    score: 52,
    action: "カレー材料、常備菜で通常展開。"
  },
  {
    code: "potato",
    name: "じゃがいも",
    department: "vegetable",
    group: "根菜",
    unit: "kg",
    middlePrice: 168,
    highPrice: 208,
    lowPrice: 126,
    weekChange: -1,
    yearMonthChange: -4,
    normalRatio: -2,
    volumeChange: 8,
    supplyLabel: "安定",
    judgment: "特売候補",
    tone: "green",
    score: 70,
    action: "カレー、ポテトサラダ、まとめ買い訴求。"
  },
  {
    code: "onion",
    name: "玉ねぎ",
    department: "vegetable",
    group: "根菜",
    unit: "kg",
    middlePrice: 142,
    highPrice: 178,
    lowPrice: 104,
    weekChange: 1,
    yearMonthChange: 4,
    normalRatio: 2,
    volumeChange: 5,
    supplyLabel: "安定",
    judgment: "通常強化",
    tone: "blue",
    score: 70,
    action: "カレー、炒め物、まとめ買い訴求を継続。"
  },
  {
    code: "hakusai",
    name: "はくさい",
    department: "vegetable",
    group: "葉茎",
    unit: "kg",
    middlePrice: 96,
    highPrice: 126,
    lowPrice: 68,
    weekChange: -5,
    yearMonthChange: -22,
    normalRatio: -18,
    volumeChange: 16,
    supplyLabel: "入荷増",
    judgment: "代替向き",
    tone: "green",
    score: 73,
    action: "キャベツ代替、漬物、カット野菜で使い切り訴求。"
  },
  {
    code: "moyashi",
    name: "もやし",
    department: "vegetable",
    group: "葉茎",
    unit: "kg",
    middlePrice: 72,
    highPrice: 92,
    lowPrice: 56,
    weekChange: 0,
    yearMonthChange: 1,
    normalRatio: 0,
    volumeChange: 2,
    supplyLabel: "安定",
    judgment: "価格安定",
    tone: "blue",
    score: 68,
    action: "高騰野菜の代替として常時露出。"
  },
  {
    code: "apple",
    name: "りんご",
    department: "fruit",
    group: "仁果",
    unit: "kg",
    middlePrice: 512,
    highPrice: 620,
    lowPrice: 428,
    weekChange: 4,
    yearMonthChange: 18,
    normalRatio: 15,
    volumeChange: -8,
    supplyLabel: "やや減",
    judgment: "売価注意",
    tone: "amber",
    score: 61,
    action: "高単価品は絞り、袋売りで価格感を作る。"
  },
  {
    code: "banana",
    name: "バナナ",
    department: "fruit",
    group: "輸入果実",
    unit: "kg",
    middlePrice: 278,
    highPrice: 336,
    lowPrice: 224,
    weekChange: 1,
    yearMonthChange: 3,
    normalRatio: 2,
    volumeChange: 7,
    supplyLabel: "安定",
    judgment: "定番強化",
    tone: "blue",
    score: 66,
    action: "朝食・まとめ買い訴求で安定販売。"
  },
  {
    code: "watermelon",
    name: "すいか",
    department: "fruit",
    group: "果実的野菜",
    unit: "kg",
    middlePrice: 326,
    highPrice: 410,
    lowPrice: 258,
    weekChange: -6,
    yearMonthChange: -10,
    normalRatio: -7,
    volumeChange: 12,
    supplyLabel: "入荷増",
    judgment: "高温販促",
    tone: "green",
    score: 86,
    action: "高温シグナルに合わせて入口・カット売場を強化。"
  },
  {
    code: "melon",
    name: "メロン",
    department: "fruit",
    group: "果実的野菜",
    unit: "kg",
    middlePrice: 684,
    highPrice: 880,
    lowPrice: 520,
    weekChange: -2,
    yearMonthChange: -5,
    normalRatio: -4,
    volumeChange: 6,
    supplyLabel: "やや増",
    judgment: "季節販促",
    tone: "green",
    score: 72,
    action: "贈答より家庭用価格帯を中心に展開。"
  },
  {
    code: "grape",
    name: "ぶどう",
    department: "fruit",
    group: "果実",
    unit: "kg",
    middlePrice: 980,
    highPrice: 1240,
    lowPrice: 760,
    weekChange: 9,
    yearMonthChange: 24,
    normalRatio: 21,
    volumeChange: -12,
    supplyLabel: "入荷減",
    judgment: "高値注意",
    tone: "red",
    score: 77,
    action: "試食・小容量で単価の重さを緩和。"
  },
  {
    code: "peach",
    name: "もも",
    department: "fruit",
    group: "核果",
    unit: "kg",
    middlePrice: 748,
    highPrice: 960,
    lowPrice: 590,
    weekChange: -3,
    yearMonthChange: 6,
    normalRatio: 4,
    volumeChange: 10,
    supplyLabel: "入荷増",
    judgment: "旬訴求",
    tone: "green",
    score: 74,
    action: "旬の棚で露出。傷みやすいので回転重視。"
  },
  {
    code: "mandarin",
    name: "みかん",
    department: "fruit",
    group: "柑橘",
    unit: "kg",
    middlePrice: 436,
    highPrice: 520,
    lowPrice: 350,
    weekChange: 2,
    yearMonthChange: 11,
    normalRatio: 9,
    volumeChange: -4,
    supplyLabel: "横ばい",
    judgment: "通常",
    tone: "blue",
    score: 54,
    action: "袋売りと小容量を併用。"
  },
  {
    code: "kiwi",
    name: "キウイ",
    department: "fruit",
    group: "輸入果実",
    unit: "kg",
    middlePrice: 598,
    highPrice: 720,
    lowPrice: 486,
    weekChange: 0,
    yearMonthChange: 5,
    normalRatio: 3,
    volumeChange: 3,
    supplyLabel: "安定",
    judgment: "定番",
    tone: "blue",
    score: 52,
    action: "ヨーグルト、朝食売場と連動。"
  }
];

type WholesaleSeed = {
  code: string;
  name: string;
  department: Department;
  group: string;
  middlePrice: number;
  yearMonthChange: number;
  volumeChange: number;
};

const additionalWholesaleSeeds: WholesaleSeed[] = [
  { code: "turnip", name: "かぶ", department: "vegetable", group: "根菜", middlePrice: 238, yearMonthChange: 7, volumeChange: -2 },
  { code: "burdock", name: "ごぼう", department: "vegetable", group: "根菜", middlePrice: 326, yearMonthChange: 12, volumeChange: -7 },
  { code: "bamboo-shoot", name: "たけのこ", department: "vegetable", group: "根菜", middlePrice: 742, yearMonthChange: 18, volumeChange: -11 },
  { code: "lotus-root", name: "れんこん", department: "vegetable", group: "根菜", middlePrice: 512, yearMonthChange: 9, volumeChange: -4 },
  { code: "mizuna", name: "みずな", department: "vegetable", group: "葉物", middlePrice: 286, yearMonthChange: -7, volumeChange: 8 },
  { code: "other-leafy", name: "その他の菜類", department: "vegetable", group: "葉物", middlePrice: 318, yearMonthChange: 4, volumeChange: 1 },
  { code: "qing-geng-cai", name: "ちんげんさい", department: "vegetable", group: "葉物", middlePrice: 268, yearMonthChange: -5, volumeChange: 7 },
  { code: "welsh-onion", name: "ねぎ", department: "vegetable", group: "葉物", middlePrice: 452, yearMonthChange: 14, volumeChange: -8 },
  { code: "butterbur", name: "ふき", department: "vegetable", group: "葉物", middlePrice: 594, yearMonthChange: 11, volumeChange: -6 },
  { code: "mitsuba", name: "みつば", department: "vegetable", group: "葉物", middlePrice: 824, yearMonthChange: 16, volumeChange: -9 },
  { code: "garland-chrysanthemum", name: "しゅんぎく", department: "vegetable", group: "葉物", middlePrice: 686, yearMonthChange: 21, volumeChange: -12 },
  { code: "garlic-chives", name: "にら", department: "vegetable", group: "葉物", middlePrice: 418, yearMonthChange: 6, volumeChange: 3 },
  { code: "celery", name: "セルリー", department: "vegetable", group: "葉物", middlePrice: 356, yearMonthChange: -3, volumeChange: 4 },
  { code: "asparagus", name: "アスパラガス", department: "vegetable", group: "茎菜", middlePrice: 1140, yearMonthChange: 19, volumeChange: -10 },
  { code: "cauliflower", name: "カリフラワー", department: "vegetable", group: "花菜", middlePrice: 438, yearMonthChange: 5, volumeChange: 2 },
  { code: "broccoli", name: "ブロッコリー", department: "vegetable", group: "花菜", middlePrice: 386, yearMonthChange: -9, volumeChange: 13 },
  { code: "pumpkin", name: "かぼちゃ", department: "vegetable", group: "果菜", middlePrice: 274, yearMonthChange: -6, volumeChange: 9 },
  { code: "mini-tomato", name: "ミニトマト", department: "vegetable", group: "果菜", middlePrice: 824, yearMonthChange: 13, volumeChange: -5 },
  { code: "shishito", name: "ししとうがらし", department: "vegetable", group: "果菜", middlePrice: 1040, yearMonthChange: 17, volumeChange: -8 },
  { code: "sweet-corn", name: "スイートコーン", department: "vegetable", group: "果菜", middlePrice: 358, yearMonthChange: -12, volumeChange: 16 },
  { code: "green-beans", name: "さやいんげん", department: "vegetable", group: "豆類", middlePrice: 926, yearMonthChange: 8, volumeChange: -3 },
  { code: "snow-peas", name: "さやえんどう", department: "vegetable", group: "豆類", middlePrice: 1280, yearMonthChange: 15, volumeChange: -7 },
  { code: "green-peas", name: "実えんどう", department: "vegetable", group: "豆類", middlePrice: 980, yearMonthChange: 6, volumeChange: 2 },
  { code: "broad-beans", name: "そらまめ", department: "vegetable", group: "豆類", middlePrice: 1180, yearMonthChange: 10, volumeChange: -4 },
  { code: "edamame", name: "えだまめ", department: "vegetable", group: "豆類", middlePrice: 846, yearMonthChange: -11, volumeChange: 15 },
  { code: "sweet-potato", name: "かんしょ", department: "vegetable", group: "いも類", middlePrice: 268, yearMonthChange: 4, volumeChange: 5 },
  { code: "taro", name: "さといも", department: "vegetable", group: "いも類", middlePrice: 428, yearMonthChange: 12, volumeChange: -6 },
  { code: "yam", name: "やまのいも", department: "vegetable", group: "いも類", middlePrice: 618, yearMonthChange: 8, volumeChange: -3 },
  { code: "garlic", name: "にんにく", department: "vegetable", group: "香味", middlePrice: 1180, yearMonthChange: 20, volumeChange: -9 },
  { code: "ginger", name: "しょうが", department: "vegetable", group: "香味", middlePrice: 624, yearMonthChange: 11, volumeChange: -5 },
  { code: "shiitake", name: "生しいたけ", department: "vegetable", group: "きのこ", middlePrice: 962, yearMonthChange: 7, volumeChange: -2 },
  { code: "nameko", name: "なめこ", department: "vegetable", group: "きのこ", middlePrice: 426, yearMonthChange: -4, volumeChange: 6 },
  { code: "enoki", name: "えのきだけ", department: "vegetable", group: "きのこ", middlePrice: 312, yearMonthChange: -8, volumeChange: 11 },
  { code: "shimeji", name: "しめじ", department: "vegetable", group: "きのこ", middlePrice: 386, yearMonthChange: -2, volumeChange: 5 },
  { code: "other-vegetables", name: "その他の野菜", department: "vegetable", group: "その他", middlePrice: 358, yearMonthChange: 3, volumeChange: 2 },
  { code: "pepper", name: "とうがらし", department: "vegetable", group: "香味", middlePrice: 1360, yearMonthChange: 16, volumeChange: -6 },
  { code: "navel-orange", name: "ネーブルオレンジ", department: "fruit", group: "かんきつ", middlePrice: 520, yearMonthChange: 6, volumeChange: 2 },
  { code: "amanatsu", name: "甘なつみかん", department: "fruit", group: "かんきつ", middlePrice: 398, yearMonthChange: -5, volumeChange: 8 },
  { code: "iyokan", name: "いよかん", department: "fruit", group: "かんきつ", middlePrice: 386, yearMonthChange: 4, volumeChange: 3 },
  { code: "hassaku", name: "はっさく", department: "fruit", group: "かんきつ", middlePrice: 412, yearMonthChange: 9, volumeChange: -4 },
  { code: "shiranui", name: "しらぬひ", department: "fruit", group: "かんきつ", middlePrice: 684, yearMonthChange: 13, volumeChange: -6 },
  { code: "other-citrus", name: "その他の雑かん", department: "fruit", group: "かんきつ", middlePrice: 456, yearMonthChange: 2, volumeChange: 2 },
  { code: "tsugaru", name: "つがる", department: "fruit", group: "りんご", middlePrice: 542, yearMonthChange: 10, volumeChange: -5 },
  { code: "jonagold", name: "ジョナゴールド", department: "fruit", group: "りんご", middlePrice: 568, yearMonthChange: 12, volumeChange: -6 },
  { code: "orin", name: "王林", department: "fruit", group: "りんご", middlePrice: 526, yearMonthChange: 8, volumeChange: -3 },
  { code: "fuji", name: "ふじ", department: "fruit", group: "りんご", middlePrice: 598, yearMonthChange: 15, volumeChange: -8 },
  { code: "other-apples", name: "その他のりんご", department: "fruit", group: "りんご", middlePrice: 488, yearMonthChange: 5, volumeChange: 1 },
  { code: "japanese-pear", name: "日本なし", department: "fruit", group: "なし", middlePrice: 642, yearMonthChange: 7, volumeChange: -2 },
  { code: "kosui", name: "幸水", department: "fruit", group: "なし", middlePrice: 720, yearMonthChange: 14, volumeChange: -7 },
  { code: "hosui", name: "豊水", department: "fruit", group: "なし", middlePrice: 706, yearMonthChange: 11, volumeChange: -5 },
  { code: "nijisseiki", name: "二十世紀", department: "fruit", group: "なし", middlePrice: 684, yearMonthChange: 9, volumeChange: -4 },
  { code: "niitaka", name: "新高", department: "fruit", group: "なし", middlePrice: 736, yearMonthChange: 16, volumeChange: -8 },
  { code: "other-pears", name: "その他のなし", department: "fruit", group: "なし", middlePrice: 612, yearMonthChange: 6, volumeChange: 1 },
  { code: "western-pear", name: "西洋なし", department: "fruit", group: "なし", middlePrice: 842, yearMonthChange: 18, volumeChange: -9 },
  { code: "sweet-persimmon", name: "甘がき", department: "fruit", group: "かき", middlePrice: 486, yearMonthChange: 7, volumeChange: -2 },
  { code: "astringent-persimmon", name: "渋がき", department: "fruit", group: "かき", middlePrice: 448, yearMonthChange: 5, volumeChange: 1 },
  { code: "loquat", name: "びわ", department: "fruit", group: "核果", middlePrice: 1420, yearMonthChange: 20, volumeChange: -10 },
  { code: "plum", name: "すもも", department: "fruit", group: "核果", middlePrice: 826, yearMonthChange: 12, volumeChange: -4 },
  { code: "cherry", name: "おうとう", department: "fruit", group: "核果", middlePrice: 2480, yearMonthChange: 22, volumeChange: -13 },
  { code: "ume", name: "うめ", department: "fruit", group: "核果", middlePrice: 682, yearMonthChange: -7, volumeChange: 9 },
  { code: "delaware", name: "デラウェア", department: "fruit", group: "ぶどう", middlePrice: 1280, yearMonthChange: 14, volumeChange: -6 },
  { code: "kyoho", name: "巨峰", department: "fruit", group: "ぶどう", middlePrice: 1580, yearMonthChange: 19, volumeChange: -9 },
  { code: "shine-muscat", name: "シャインマスカット", department: "fruit", group: "ぶどう", middlePrice: 2680, yearMonthChange: 24, volumeChange: -12 },
  { code: "other-grapes", name: "その他のぶどう", department: "fruit", group: "ぶどう", middlePrice: 1140, yearMonthChange: 9, volumeChange: -2 },
  { code: "chestnut", name: "くり", department: "fruit", group: "木の実", middlePrice: 980, yearMonthChange: 13, volumeChange: -5 },
  { code: "strawberry", name: "いちご", department: "fruit", group: "ベリー", middlePrice: 1260, yearMonthChange: 18, volumeChange: -8 },
  { code: "greenhouse-melon", name: "温室メロン", department: "fruit", group: "メロン", middlePrice: 1180, yearMonthChange: 10, volumeChange: -4 },
  { code: "andes-melon", name: "アンデスメロン", department: "fruit", group: "メロン", middlePrice: 824, yearMonthChange: -4, volumeChange: 7 },
  { code: "other-melon", name: "その他のメロン", department: "fruit", group: "メロン", middlePrice: 732, yearMonthChange: -2, volumeChange: 5 },
  { code: "pineapple", name: "パインアップル", department: "fruit", group: "輸入果実", middlePrice: 386, yearMonthChange: -6, volumeChange: 10 },
  { code: "lemon", name: "レモン", department: "fruit", group: "輸入果実", middlePrice: 562, yearMonthChange: 8, volumeChange: -3 },
  { code: "grapefruit", name: "グレープフルーツ", department: "fruit", group: "輸入果実", middlePrice: 426, yearMonthChange: 3, volumeChange: 2 }
];

function buildAdditionalWholesaleItem(seed: WholesaleSeed, index: number): WholesaleItem {
  const tone: Tone =
    seed.yearMonthChange >= 18
      ? "red"
      : seed.yearMonthChange <= -6
        ? "green"
        : seed.yearMonthChange >= 10
          ? "amber"
          : "blue";

  return {
    code: seed.code,
    name: seed.name,
    department: seed.department,
    group: seed.group,
    unit: "kg",
    middlePrice: seed.middlePrice,
    highPrice: Math.round(seed.middlePrice * 1.18),
    lowPrice: Math.round(seed.middlePrice * 0.82),
    weekChange: (index % 9) - 4,
    yearMonthChange: seed.yearMonthChange,
    normalRatio: Math.round(seed.yearMonthChange * 0.72),
    volumeChange: seed.volumeChange,
    supplyLabel: seed.volumeChange >= 6 ? "入荷増" : seed.volumeChange <= -6 ? "入荷減" : "横ばい",
    judgment:
      tone === "green"
        ? "買い時"
        : tone === "red"
          ? "高騰注意"
          : tone === "amber"
            ? "売価注意"
            : "通常",
    tone,
    score: Math.min(92, Math.max(46, 58 + Math.abs(seed.yearMonthChange) + (tone === "green" ? 10 : 0))),
    action: `${seed.name}はAPI品目マスタ想定のサンプルです。実API接続後は市場・産地・等級別の実績値で更新します。`
  };
}

function applyAggregatedMarketRows(item: WholesaleItem): WholesaleItem {
  const aggregate = aggregateCurrentMarketRows(item.marketRows);

  if (!aggregate) return item;

  return {
    ...item,
    middlePrice: Math.round(aggregate.middlePricePerKg),
    highPrice: Math.round(aggregate.observedHighPricePerKg ?? item.highPrice),
    lowPrice: Math.round(aggregate.observedLowPricePerKg ?? item.lowPrice),
    priceBasisLabel:
      "中値をkg換算し、数量で重み付けして品目の中値として表示しています。"
  };
}

export const wholesaleItems: WholesaleItem[] = [
  ...baseWholesaleItems,
  ...additionalWholesaleSeeds.map(buildAdditionalWholesaleItem)
].map(applyAggregatedMarketRows);

export const weatherSignals: WeatherSignal[] = [
  { name: "気温", low: 10, normal: 30, high: 60, value: "高 60" },
  { name: "降水量", low: 20, normal: 40, high: 40, value: "並/多" },
  { name: "日照", low: 30, normal: 30, high: 40, value: "高 40" }
];

export const weatherNote =
  "高温傾向。すいか、きゅうり、トマト、冷やし惣菜関連は需要増。葉物は鮮度劣化と売価調整に注意。";

export const priceTrend: PricePoint[] = [
  { label: "7月", current: 132, lastYear: 118, normal: 116 },
  { label: "8月", current: 126, lastYear: 121, normal: 118 },
  { label: "9月", current: 138, lastYear: 126, normal: 121 },
  { label: "10月", current: 146, lastYear: 131, normal: 125 },
  { label: "11月", current: 154, lastYear: 136, normal: 129 },
  { label: "12月", current: 171, lastYear: 142, normal: 134 },
  { label: "1月", current: 188, lastYear: 148, normal: 139 },
  { label: "2月", current: 203, lastYear: 151, normal: 143 },
  { label: "3月", current: 216, lastYear: 155, normal: 147 },
  { label: "4月", current: 224, lastYear: 159, normal: 151 },
  { label: "5月", current: 238, lastYear: 164, normal: 156 },
  { label: "6月", current: 252, lastYear: 170, normal: 162 }
];

export const actionItems: ActionItem[] = [
  {
    label: "売価",
    tone: "red",
    title: "キャベツはチラシ対象から外す",
    description: "中値184円/kg、平年比+42%。代替売場は白菜、もやし。"
  },
  {
    label: "果物",
    tone: "green",
    title: "すいかを高温販促の主役にする",
    description: "入荷増、前年同月比-10%。入口とカット売場で露出。"
  },
  {
    label: "一覧",
    tone: "blue",
    title: "大量品目はカテゴリで絞って確認",
    description: "野菜・くだもの・葉物・果菜・根菜で切り替え、表はスクロール運用。"
  }
];
