import type { RegionCode, Tone, WholesaleItem } from "@/lib/mock-data";

type PublicDataValue = {
  label: string;
  unit: string;
  value: string;
};

type PublicDataGroup = {
  id: string;
  label: string;
  sample?: {
    matchedValues?: PublicDataValue[];
    totalValues?: number;
  };
  tables?: Array<{
    id: string;
    title: string;
  }>;
};

type PublicDataResponse = {
  groups?: PublicDataGroup[];
};

type JmaWeatherObservation = {
  precipitation1h: number | null;
  precipitation24h: number | null;
  temperature: number | null;
  timestamp: string;
};

type JmaWeatherResponse = {
  forecast?: {
    precipitationProbabilities?: string[];
    temperatures?: string[];
    weather?: string;
  };
  observations?: JmaWeatherObservation[];
};

type MaffLivestockResponse = {
  groups?: Array<{
    kind: string;
    latestDate: string;
    totalRecords: number;
  }>;
};

type MaffRiceResponse = {
  records?: Array<Record<string, string>>;
  title?: string;
  totalRecords?: number;
};

export type DemandForecastCategory =
  | "vegetables"
  | "fruits"
  | "meat"
  | "rice"
  | "bread";

export type DemandForecastSeriesPoint = {
  label: string;
  type: "history" | "forecast";
  value: number;
};

export type DemandForecast = {
  action: string;
  confidence: number;
  demandChange: number;
  demandLabel: string;
  demandScore: number;
  evidence: string[];
  historyDriver: string;
  id: DemandForecastCategory;
  label: string;
  regionCode: RegionCode;
  series: DemandForecastSeriesPoint[];
  sourceSummary: string;
  supplyDriver: string;
  tone: Tone;
  updatedAt: string;
  weatherDriver: string;
};

export type DemandForecastInputs = {
  generatedAt: string;
  household: PublicDataResponse | null;
  jma: JmaWeatherResponse | null;
  livestock: MaffLivestockResponse | null;
  production: PublicDataResponse | null;
  rice: MaffRiceResponse | null;
  regionCode: RegionCode;
  wholesaleItems: WholesaleItem[];
};

const categoryLabels: Record<DemandForecastCategory, string> = {
  bread: "パン",
  fruits: "果物",
  meat: "肉",
  rice: "コメ",
  vegetables: "野菜"
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatSignedPercent(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

function parseNumericText(value: string | undefined) {
  if (!value) return null;
  const normalized = value.replaceAll(",", "").replaceAll("−", "-");
  const match = normalized.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const numberValue = Number(match[0]);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function parseNumbers(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => parseNumericText(String(value ?? "")))
    .filter((value): value is number => value !== null);
}

function getPublicGroup(data: PublicDataResponse | null, id: string) {
  return data?.groups?.find((group) => group.id === id) ?? null;
}

function getGroupValues(group: PublicDataGroup | null) {
  return (group?.sample?.matchedValues ?? [])
    .map((value) => ({
      ...value,
      numericValue: parseNumericText(value.value)
    }))
    .filter((value): value is PublicDataValue & { numericValue: number } => value.numericValue !== null);
}

function getHistoricalSignal(group: PublicDataGroup | null) {
  const values = getGroupValues(group);
  const numericValues = values.map((value) => value.numericValue);
  const baseline = average(numericValues);
  const recent = average(numericValues.slice(0, Math.min(3, numericValues.length)));
  const trend = baseline > 0 ? ((recent - baseline) / baseline) * 100 : 0;
  const normalizedTrend = clamp(trend, -14, 14);
  const evidence = values.slice(0, 3).map((value) => `${value.label}: ${value.value}${value.unit}`);

  return {
    evidence,
    pointCount: numericValues.length,
    trend: normalizedTrend
  };
}

function getWeatherSignal(jma: JmaWeatherResponse | null, category: DemandForecastCategory) {
  const forecastTemperatures = parseNumbers(jma?.forecast?.temperatures ?? []);
  const latestTemperature = jma?.observations?.[0]?.temperature;
  const temperature =
    forecastTemperatures.length > 0
      ? average(forecastTemperatures)
      : latestTemperature !== null && latestTemperature !== undefined
        ? latestTemperature
        : 22;
  const pop = average(parseNumbers(jma?.forecast?.precipitationProbabilities ?? []));
  const rain24h = jma?.observations?.[0]?.precipitation24h ?? 0;
  const weatherText = jma?.forecast?.weather ?? "天候未取得";
  const isHot = temperature >= 28;
  const isCool = temperature <= 16;
  const isRainy = pop >= 50 || rain24h >= 10 || weatherText.includes("雨");

  let score = 0;
  const notes: string[] = [];

  if (category === "vegetables") {
    if (isHot) {
      score += 5;
      notes.push("高温でサラダ・冷菜需要");
    }
    if (isRainy) {
      score -= 2;
      notes.push("降雨で来店鈍化に注意");
    }
  }

  if (category === "fruits") {
    if (isHot) {
      score += 8;
      notes.push("高温で果物・水分補給需要");
    }
    if (isRainy) {
      score -= 3;
      notes.push("雨天で店頭露出は抑えめ");
    }
  }

  if (category === "meat") {
    if (isCool || isRainy) {
      score += 3;
      notes.push("内食・温かい献立に寄りやすい");
    }
    if (isHot) {
      score -= 1;
      notes.push("高温時は惣菜・簡便調理寄り");
    }
  }

  if (category === "rice") {
    if (isCool || isRainy) score += 2;
    if (isHot) score -= 1;
    notes.push("主食需要は天候影響が小さめ");
  }

  if (category === "bread") {
    if (isRainy) {
      score += 4;
      notes.push("雨天で簡便食・買い置き需要");
    }
    if (isCool) score += 2;
    if (isHot) score -= 1;
  }

  return {
    driver:
      notes.length > 0
        ? `${weatherText} / ${Math.round(temperature)}℃ / 降水確率${Math.round(pop)}%: ${notes.join("、")}`
        : `${weatherText} / ${Math.round(temperature)}℃ / 降水確率${Math.round(pop)}%`,
    score
  };
}

function getProduceSupplySignal(items: WholesaleItem[], department: "vegetable" | "fruit") {
  const departmentItems = items.filter((item) => item.department === department);
  const priceChange = average(departmentItems.map((item) => item.yearMonthChange));
  const volumeChange = average(departmentItems.map((item) => item.volumeChange));
  const score = clamp(volumeChange * 0.12 - priceChange * 0.08, -8, 9);

  return {
    driver: `卸売: 価格${formatSignedPercent(priceChange)}、入荷${formatSignedPercent(volumeChange)}`,
    score
  };
}

function getMeatSupplySignal(livestock: MaffLivestockResponse | null) {
  const groups = livestock?.groups ?? [];
  const meatGroups = groups.filter((group) => group.kind === "pork" || group.kind === "beef");
  const records = meatGroups.reduce((sum, group) => sum + group.totalRecords, 0);
  const score = records > 100 ? 2 : records > 0 ? 1 : 0;

  return {
    driver:
      records > 0
        ? `食肉市況: 牛・豚の取得レコード ${records.toLocaleString("ja-JP")}件`
        : "食肉市況: 取得待ち",
    score
  };
}

function getRiceSupplySignal(rice: MaffRiceResponse | null) {
  const records = rice?.totalRecords ?? rice?.records?.length ?? 0;
  const title = rice?.title ?? "米相対取引価格";

  return {
    driver:
      records > 0
        ? `${title}: ${records.toLocaleString("ja-JP")}銘柄`
        : "米相対取引価格: 取得待ち",
    score: records > 0 ? 1.5 : 0
  };
}

function getProductionEvidence(group: PublicDataGroup | null) {
  const values = getGroupValues(group);
  return values.slice(0, 2).map((value) => `${value.label}: ${value.value}${value.unit}`);
}

function getDemandLabel(score: number) {
  if (score >= 72) return "かなり強い";
  if (score >= 62) return "強い";
  if (score >= 54) return "やや強い";
  if (score <= 42) return "弱い";
  return "標準";
}

function getTone(score: number, supplyScore: number): Tone {
  if (score >= 68 && supplyScore < -2) return "red";
  if (score >= 62) return "green";
  if (score >= 54) return "blue";
  if (score <= 42) return "amber";
  return "slate";
}

function getAction(category: DemandForecastCategory, score: number) {
  if (score >= 62) {
    if (category === "fruits") return "入口・平台の露出を増やし、カット果物や飲料と連動";
    if (category === "vegetables") return "サラダ・冷菜・カット野菜を厚めに展開";
    if (category === "meat") return "惣菜・簡便調理の肉メニューを強める";
    if (category === "rice") return "米飯惣菜・弁当連動を強める";
    return "食パン・惣菜パンの欠品を避ける";
  }

  if (score <= 42) return "露出を絞り、値引きより在庫量の調整を優先";
  return "通常展開。価格が下がる品目だけスポット販促";
}

function buildSeries(historyValues: Array<PublicDataValue & { numericValue: number }>, score: number) {
  const numericValues = historyValues.map((value) => value.numericValue).slice(0, 5).reverse();
  const baseline = average(numericValues);
  const history =
    numericValues.length > 0
      ? numericValues.map((value, index) => ({
          label: `${index + 1}期前`,
          type: "history" as const,
          value: Math.round(clamp(50 + ((value - baseline) / Math.max(1, baseline)) * 45, 34, 76))
        }))
      : [45, 48, 50, 51].map((value, index) => ({
          label: `${4 - index}期前`,
          type: "history" as const,
          value
        }));

  return [
    ...history,
    {
      label: "予測",
      type: "forecast" as const,
      value: score
    }
  ];
}

function buildForecast(
  category: DemandForecastCategory,
  inputs: DemandForecastInputs,
  householdGroupId: string,
  productionGroupId: string | null,
  supplySignal: { driver: string; score: number }
): DemandForecast {
  const householdGroup = getPublicGroup(inputs.household, householdGroupId);
  const productionGroup = productionGroupId ? getPublicGroup(inputs.production, productionGroupId) : null;
  const historySignal = getHistoricalSignal(householdGroup);
  const weatherSignal = getWeatherSignal(inputs.jma, category);
  const score = Math.round(
    clamp(50 + historySignal.trend * 0.48 + weatherSignal.score + supplySignal.score, 28, 84)
  );
  const sourceCount =
    (historySignal.pointCount > 0 ? 1 : 0) +
    (inputs.jma ? 1 : 0) +
    (productionGroup ? 1 : 0) +
    (supplySignal.driver.includes("取得待ち") ? 0 : 1);
  const confidence = clamp(48 + sourceCount * 12 + Math.min(10, historySignal.pointCount), 40, 90);
  const evidence = [
    ...historySignal.evidence.slice(0, 2),
    ...getProductionEvidence(productionGroup)
  ].slice(0, 4);

  return {
    action: getAction(category, score),
    confidence: Math.round(confidence),
    demandChange: Math.round((score - 50) * 0.8),
    demandLabel: getDemandLabel(score),
    demandScore: score,
    evidence,
    historyDriver:
      historySignal.pointCount > 0
        ? `家計調査の過去候補 ${historySignal.pointCount}件 / 支出指数 ${formatSignedPercent(historySignal.trend)}`
        : "家計調査の過去候補: 取得待ち",
    id: category,
    label: categoryLabels[category],
    regionCode: inputs.regionCode,
    series: buildSeries(getGroupValues(householdGroup), score),
    sourceSummary: "家計調査・卸売/市況・生産高候補・気象庁予報を使った説明可能な初期モデル",
    supplyDriver: supplySignal.driver,
    tone: getTone(score, supplySignal.score),
    updatedAt: inputs.generatedAt,
    weatherDriver: weatherSignal.driver
  };
}

export function buildDemandForecasts(inputs: DemandForecastInputs) {
  return [
    buildForecast(
      "vegetables",
      inputs,
      "vegetables",
      "vegetables",
      getProduceSupplySignal(inputs.wholesaleItems, "vegetable")
    ),
    buildForecast(
      "fruits",
      inputs,
      "fruits",
      "fruits",
      getProduceSupplySignal(inputs.wholesaleItems, "fruit")
    ),
    buildForecast("meat", inputs, "meat", "livestock", getMeatSupplySignal(inputs.livestock)),
    buildForecast("rice", inputs, "staple", "rice", getRiceSupplySignal(inputs.rice)),
    buildForecast("bread", inputs, "staple", null, {
      driver: "パン: 家計調査の米・パン分類と天候から推定",
      score: 0
    })
  ];
}
