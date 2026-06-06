"use client";

import { useEffect, useMemo, useState } from "react";
import {
  categoryTabs,
  dashboardSummary,
  minpakuProfiles,
  prefectureLodgingProfiles,
  prefectureOptions,
  priceTrend,
  regionProfiles,
  weatherSignals,
  wholesaleItems,
  type CategoryTab,
  type Department,
  type MinpakuProfile,
  type PrefectureCode,
  type PrefectureOption,
  type PrefectureLodgingProfile,
  type PricePoint,
  type RegionCode,
  type RegionProfile,
  type Tone,
  type WholesaleItem
} from "@/lib/mock-data";
import { scrapingScheduleItems, type ScrapingScheduleItem } from "@/lib/scraping-schedule";

const toneClass: Record<Tone, string> = {
  red: "tone-red",
  green: "tone-green",
  blue: "tone-blue",
  amber: "tone-amber",
  slate: "tone-slate"
};

type SortMode = "risk" | "price" | "movement";
type HeatmapPeriod = "day" | "week" | "month";
type ScreenId = "dashboard" | "items" | "minpaku" | "weather" | "admin" | "settings";
type PreferredScreenId = "dashboard" | "items" | "minpaku" | "weather";
type ApiLoadStatus = "idle" | "loading" | "success" | "error";

type EstatProduceValue = {
  label: string;
  unit: string;
  value: string;
};

type EstatProduceTable = {
  id: string;
  title: string;
  cycle: string;
  surveyDate: string;
  updatedDate: string;
};

type EstatProduceGroup = {
  id: string;
  label: string;
  searchWord: string;
  totalTables: number;
  fetchedTables: number;
  tables: EstatProduceTable[];
  sample: {
    totalRows: number;
    from: number;
    to: number;
    nextKey: number | null;
    title: string;
    values: EstatProduceValue[];
    middleValues: EstatProduceValue[];
    priceValues: EstatProduceValue[];
  } | null;
};

type EstatProduceResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  groups: EstatProduceGroup[];
};

type MaffLivestockKind = "pork" | "beef" | "egg";

type MaffLivestockRecord = Record<string, string>;

type MaffLivestockReport = {
  reportId: string;
  areaName: string;
  records: MaffLivestockRecord[];
  columns: string[];
};

type MaffLivestockGroup = {
  kind: MaffLivestockKind;
  label: string;
  latestDate: string;
  dateLabel: string;
  availableDates: string[];
  reportAreaLabel: string;
  totalRecords: number;
  reports: MaffLivestockReport[];
  columns: string[];
  notice: string;
  sourceUrl: string;
};

type MaffLivestockResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  groups: MaffLivestockGroup[];
};

type LivestockBoardItem = {
  id: string;
  kind: MaffLivestockKind;
  categoryLabel: string;
  label: string;
  contextLabel: string;
  price: number;
  averagePrice: number;
  priceLabel: string;
  quantityLabel: string;
  dateLabel: string;
  sourceLabel: string;
  changeFromAverage: number;
  tone: Tone;
  score: number;
  record: MaffLivestockRecord;
};

type MaffRiceRecord = Record<string, string>;

type MaffRiceResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  title: string;
  sourceUrl: string;
  csvUrl: string;
  totalRecords: number;
  columns: string[];
  records: MaffRiceRecord[];
};

type RiceHeatmapItem = {
  brand: string;
  hasPrice: boolean;
  id: string;
  monthChange: number;
  origin: string;
  price: number;
  priceLabel: string;
  quantityLabel: string;
  volume: number;
  volumeChange: number;
  yearChange: number;
};

type JmaWeatherObservation = {
  timestamp: string;
  temperature: number | null;
  precipitation10m: number | null;
  precipitation1h: number | null;
  precipitation24h: number | null;
  humidity: number | null;
  sunshineDuration: number | null;
  wind: number | null;
};

type JmaWeatherResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  region: RegionCode;
  area: string;
  station: {
    code: string;
    name: string;
  };
  forecast: {
    reportDatetime: string;
    targetArea: string;
    weather: string;
    wind: string;
    wave: string;
    precipitationProbabilities: string[];
    temperatures: string[];
    timeDefines: string[];
  };
  observations: JmaWeatherObservation[];
  note: string;
};

type PublicDataValue = {
  label: string;
  unit: string;
  value: string;
};

type PublicDataTable = {
  id: string;
  title: string;
  statName: string;
  cycle: string;
  surveyDate: string;
  openDate: string;
  updatedDate: string;
};

type PublicDataGroup = {
  id: string;
  label: string;
  searchWord: string;
  totalTables: number;
  fetchedTables: number;
  tables: PublicDataTable[];
  sample: {
    totalValues: number;
    matchedValues: PublicDataValue[];
  };
};

type PublicDataResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  groups: PublicDataGroup[];
  note: string;
};

type LodgingApiTable = {
  metricId: string;
  metricLabel: string;
  id: string;
  title: string;
  cycle: string;
  surveyDate: string;
  updatedDate: string;
  matchedValue: string | null;
};

type LodgingApiResponse = {
  ok: boolean;
  source: string;
  generatedAt: string;
  fallback: boolean;
  note: string;
  profile: PrefectureLodgingProfile;
  tables: LodgingApiTable[];
};

type DemandForecastSeriesPoint = {
  label: string;
  type: "history" | "forecast";
  value: number;
};

type DemandForecastItem = {
  action: string;
  confidence: number;
  demandChange: number;
  demandLabel: string;
  demandScore: number;
  historyDriver: string;
  id: "vegetables" | "fruits" | "meat" | "rice" | "bread";
  label: string;
  series: DemandForecastSeriesPoint[];
  supplyDriver: string;
  tone: Tone;
  weatherDriver: string;
};

type DemandForecastResponse = {
  inputs: Array<{
    ok: boolean;
    source: string;
  }>;
  forecasts: DemandForecastItem[];
  model: string;
};

type DatabaseSyncResponse = {
  ok: boolean;
  configured?: boolean;
  error?: string;
  generatedAt?: string;
  schemaPath?: string;
  snapshotDate?: string;
  sources?: Array<{
    ok: boolean;
    sourceKey: string;
    sourceName: string;
  }>;
  writes?: Array<{
    error?: string;
    ok: boolean;
    rows: number;
    table: string;
  }>;
};

type LocalArchiveJobSummary = {
  archives: number;
  compressedBytes: number;
  label: string;
  lastArchivedAt: string | null;
  lastPath: string | null;
  lastScheduledAt: string | null;
  rawBytes: number;
  source: string;
};

type LocalArchiveStatusResponse = {
  ok: boolean;
  analysisRole: string;
  enabled: boolean;
  excludedData: string[];
  format: string;
  generatedAt: string;
  localStorageRole: string;
  manifest: {
    generatedAt: string | null;
    jobs: Record<string, LocalArchiveJobSummary>;
    root: string;
    totals: {
      archives: number;
      compressedBytes: number;
      rawBytes: number;
    };
  };
  manifestExists: boolean;
  manifestPath: string;
  retentionYears: number;
  root: string;
  supabaseRole: string;
  supabaseWindowYears: number;
};

const PAGE_SIZE = 12;
const PREFERRED_SCREEN_STORAGE_KEY = "seika-md-preferred-screen";
const REGION_STORAGE_KEY = "seika-md-region";
const PREFECTURE_STORAGE_KEY = "seika-md-prefecture";
const heatmapPeriodOptions: Array<{
  id: HeatmapPeriod;
  label: string;
  metricLabel: string;
  volumeLabel: string;
}> = [
  { id: "day", label: "1日", metricLabel: "前日比", volumeLabel: "日次入荷" },
  { id: "week", label: "1週間", metricLabel: "前週比", volumeLabel: "週間入荷" },
  { id: "month", label: "1か月", metricLabel: "前年同月比", volumeLabel: "月間入荷" }
];

const wheatMarketProfile = {
  domesticConsumptionTons: 6502000,
  domesticFlowTons: 940000,
  domesticProductionTons: 1029000,
  domesticSelfSufficiencyRate: 16,
  importFlowTons: 4570000,
  importShareRate: 83,
  previousSalePriceYenPerTon: 61010,
  salePriceChangeRate: 2.5,
  salePriceEffectivePeriod: "\u4ee4\u548c8\u5e744\u6708\u671f",
  salePricePublishedAt: "\u4ee4\u548c8\u5e743\u670811\u65e5",
  salePriceYenPerTon: 62520,
  sourceLabel: "\u8fb2\u6797\u6c34\u7523\u7701 \u9ea6\u306e\u9700\u7d66\u3068\u4fa1\u683c / \u98df\u6599\u9700\u7d66\u8868"
};

const screenItems: Array<{
  id: ScreenId;
  label: string;
  icon: "chart" | "table" | "home" | "cloud" | "admin" | "settings";
}> = [
  { id: "dashboard", label: "ダッシュボード", icon: "chart" },
  { id: "items", label: "食品", icon: "table" },
  { id: "minpaku", label: "民泊", icon: "home" },
  { id: "weather", label: "天候", icon: "cloud" },
  { id: "admin", label: "管理者", icon: "admin" },
  { id: "settings", label: "設定", icon: "settings" }
];

const preferredScreenItems = screenItems.filter(
  (screen): screen is typeof screen & { id: PreferredScreenId } =>
    screen.id !== "settings" && screen.id !== "admin"
);

const screenDescriptions: Record<PreferredScreenId, string> = {
  dashboard: "都道府県の週間予報、1か月予報、今月の消費見通しを確認",
  items: "野菜・くだものなど食品価格を中心に確認",
  minpaku: "民泊需要、清掃、備品、周辺食品需要を確認",
  weather: "長期予報と仕入れ判断を中心に確認"
};

const retailPresets: Record<string, { unitLabel: string; grams: number; marginRate: number }> = {
  cabbage: { unitLabel: "1玉", grams: 1200, marginRate: 1.45 },
  lettuce: { unitLabel: "1玉", grams: 450, marginRate: 1.55 },
  spinach: { unitLabel: "1袋", grams: 200, marginRate: 1.55 },
  komatsuna: { unitLabel: "1袋", grams: 200, marginRate: 1.55 },
  cucumber: { unitLabel: "1本", grams: 100, marginRate: 1.6 },
  tomato: { unitLabel: "1個", grams: 150, marginRate: 1.55 },
  eggplant: { unitLabel: "1本", grams: 90, marginRate: 1.6 },
  "green-pepper": { unitLabel: "1袋", grams: 150, marginRate: 1.6 },
  daikon: { unitLabel: "1本", grams: 1200, marginRate: 1.45 },
  carrot: { unitLabel: "3本", grams: 450, marginRate: 1.5 },
  potato: { unitLabel: "1袋", grams: 600, marginRate: 1.45 },
  onion: { unitLabel: "1袋", grams: 700, marginRate: 1.45 },
  hakusai: { unitLabel: "1/4玉", grams: 500, marginRate: 1.5 },
  moyashi: { unitLabel: "1袋", grams: 200, marginRate: 1.75 },
  apple: { unitLabel: "1個", grams: 280, marginRate: 1.5 },
  banana: { unitLabel: "1房", grams: 600, marginRate: 1.5 },
  watermelon: { unitLabel: "1玉", grams: 3500, marginRate: 1.45 },
  melon: { unitLabel: "1玉", grams: 1400, marginRate: 1.5 },
  grape: { unitLabel: "1パック", grams: 350, marginRate: 1.5 },
  peach: { unitLabel: "1個", grams: 250, marginRate: 1.5 },
  mandarin: { unitLabel: "1袋", grams: 800, marginRate: 1.45 },
  kiwi: { unitLabel: "1個", grams: 100, marginRate: 1.6 }
};

function isPreferredScreenId(value: string | null): value is PreferredScreenId {
  return value === "dashboard" || value === "items" || value === "minpaku" || value === "weather";
}

function isRegionCode(value: string | null): value is RegionCode {
  return value === "kanto" || value === "tokai" || value === "kinki" || value === "kyushu";
}

function isPrefectureCode(value: string | null): value is PrefectureCode {
  return prefectureOptions.some((prefecture) => prefecture.code === value);
}

function formatYen(value: number) {
  return value.toLocaleString("ja-JP");
}

function formatPercent(value: number) {
  const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(1);
  return `${value > 0 ? "+" : ""}${rounded}%`;
}

function formatCount(value: number) {
  return value.toLocaleString("ja-JP");
}

function formatBytes(value: number) {
  if (value >= 1024 * 1024 * 1024) return `${(value / 1024 / 1024 / 1024).toFixed(1)}GB`;
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)}MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1)}KB`;
  return `${value}B`;
}

function formatRate(value: number) {
  return `${value.toFixed(1)}%`;
}

function getNextRunLabel(runTimes: string[]) {
  if (runTimes.length === 0) return "停止中";

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const sortedTimes = [...runTimes].sort();
  const nextToday = sortedTimes.find((time) => {
    const [hour, minute] = time.split(":").map(Number);
    return hour * 60 + minute >= nowMinutes;
  });

  return nextToday ? `次回 ${nextToday}` : `次回 明日 ${sortedTimes[0]}`;
}

function getRetryLabel(schedule: ScrapingScheduleItem) {
  if (schedule.maxRetries === 0) return "リトライなし";
  return `${schedule.maxRetries}回 / ${schedule.retryMinutes.join("→")}分`;
}

function getStatusLabel(status: ScrapingScheduleItem["status"]) {
  if (status === "active") return "稼働中";
  if (status === "paused") return "停止中";
  return "実装予定";
}

function getVisibleEstatValues(sample: EstatProduceGroup["sample"]) {
  if (!sample) return [];
  if (sample.middleValues.length > 0) return sample.middleValues;
  if (sample.priceValues.length > 0) return sample.priceValues;
  return sample.values;
}

function getVisibleEstatValueLabel(sample: EstatProduceGroup["sample"]) {
  if (!sample) return "取得値";
  if (sample.middleValues.length > 0) return "中値候補";
  if (sample.priceValues.length > 0) return "価格候補";
  return "取得値";
}

function getRecordValue(record: MaffLivestockRecord, candidates: string[]) {
  return candidates.map((candidate) => record[candidate]).find((value) => value && value.trim().length > 0) ?? "";
}

function getLivestockSampleRows(group: MaffLivestockGroup) {
  return group.reports
    .flatMap((report) =>
      report.records.map((record) => ({
        areaName: report.areaName,
        record
      }))
    )
    .filter(({ record }) => Object.values(record).some((value) => value.trim().length > 0))
    .slice(0, 5);
}

function getLivestockPrimaryMetric(group: MaffLivestockGroup, record: MaffLivestockRecord) {
  if (group.kind === "egg") {
    const middle = getRecordValue(record, ["Ｍ中値", "M中値", "Ｌ中値", "L中値"]);
    return middle ? `M中値 ${formatCount(Number(middle) || 0)}円/kg` : "価格未取得";
  }

  const price =
    group.kind === "pork"
      ? getRecordValue(record, [
          "豚_規格別枝肉取引価格（平均）",
          "豚_規格別枝肉取引価格（極上・上規格）",
          "豚_規格別枝肉取引価格（上）"
        ])
      : getRecordValue(record, ["取引価格(平均)", "取引価格(4)", "取引価格(3)"]);

  return price ? `平均 ${formatCount(Number(price) || 0)}円/kg` : "価格未取得";
}

function getLivestockSecondaryMetric(group: MaffLivestockGroup, record: MaffLivestockRecord) {
  if (group.kind === "egg") {
    const volume = getRecordValue(record, ["入荷量"]);
    return volume ? `入荷量 ${formatCount(Number(volume) || 0)}t` : getRecordValue(record, ["系統名"]);
  }

  const headCount =
    group.kind === "pork"
      ? getRecordValue(record, ["豚_規格別枝肉取引成立頭数（計）"])
      : getRecordValue(record, ["取引成立頭数(計)"]);

  return headCount ? `成立 ${formatCount(Number(headCount) || 0)}頭` : getRecordValue(record, ["畜種", "畜種名"]);
}

function toNumberValue(value: string) {
  const normalized = value.replaceAll(",", "").trim();
  if (!normalized) return null;
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getNumericRecordValue(record: MaffLivestockRecord, candidates: string[]) {
  for (const candidate of candidates) {
    const numericValue = toNumberValue(record[candidate] ?? "");
    if (numericValue !== null) return numericValue;
  }
  return null;
}

function getLivestockPriceValue(group: MaffLivestockGroup, record: MaffLivestockRecord) {
  if (group.kind === "egg") {
    return getNumericRecordValue(record, ["Ｍ中値", "M中値", "Ｌ中値", "L中値", "ＭＳ中値", "S中値"]);
  }

  if (group.kind === "pork") {
    return getNumericRecordValue(record, [
      "豚_規格別枝肉取引価格（平均）",
      "豚_規格別枝肉取引価格（極上・上規格）",
      "豚_規格別枝肉取引価格（上）",
      "豚_規格別枝肉取引価格（極上）"
    ]);
  }

  return getNumericRecordValue(record, ["取引価格(平均)", "取引価格(4)", "取引価格(3)", "取引価格(5)"]);
}

function getLivestockQuantityLabel(group: MaffLivestockGroup, record: MaffLivestockRecord) {
  if (group.kind === "egg") {
    const volume = getNumericRecordValue(record, ["入荷量"]);
    return volume === null ? "入荷量 未取得" : `入荷量 ${formatCount(volume)}t`;
  }

  const headCount =
    group.kind === "pork"
      ? getNumericRecordValue(record, ["豚_規格別枝肉取引成立頭数（計）"])
      : getNumericRecordValue(record, ["取引成立頭数(計)"]);

  return headCount === null ? "成立頭数 未取得" : `成立 ${formatCount(headCount)}頭`;
}

function getLivestockItemLabel(group: MaffLivestockGroup, areaName: string, record: MaffLivestockRecord) {
  if (group.kind === "egg") {
    return getRecordValue(record, ["系統名"]) || areaName || group.label;
  }

  const marketName = getRecordValue(record, ["市場名"]) || areaName || group.label;
  const breedName = getRecordValue(record, ["畜種", "畜種名"]);
  return group.kind === "beef" && breedName ? `${marketName} ${breedName}` : marketName;
}

function getLivestockTone(changeFromAverage: number, quantityLabel: string): Tone {
  if (changeFromAverage <= -6) return "green";
  if (changeFromAverage <= -2) return "blue";
  if (changeFromAverage >= 8) return "red";
  if (changeFromAverage >= 3) return "amber";
  if (quantityLabel.includes("未取得")) return "slate";
  return "blue";
}

function getLivestockOpportunityScore(changeFromAverage: number, tone: Tone) {
  const toneBoost = tone === "green" ? 78 : tone === "blue" ? 34 : tone === "amber" ? 10 : 0;
  return toneBoost + Math.max(0, -changeFromAverage) * 6;
}

function getHeatmapPeriodFactor(period: HeatmapPeriod) {
  if (period === "month") return 1;
  if (period === "week") return 0.42;
  return 0.16;
}

function getLivestockQuantityValue(item: LivestockBoardItem) {
  const matched = item.quantityLabel.match(/[\d,]+(?:\.\d+)?/);
  return matched ? Number(matched[0].replaceAll(",", "")) || 0 : 0;
}

function getLivestockPeriodPriceChange(item: LivestockBoardItem, period: HeatmapPeriod) {
  return clampNumber(item.changeFromAverage * getHeatmapPeriodFactor(period), -22, 22);
}

function getLivestockVolumeSignal(item: LivestockBoardItem, averageQuantity: number, period: HeatmapPeriod) {
  const quantity = getLivestockQuantityValue(item);
  if (!quantity || !averageQuantity) return 0;
  const rawSignal = ((quantity - averageQuantity) / Math.max(1, averageQuantity)) * 100;
  return clampNumber(rawSignal * (period === "month" ? 1 : period === "week" ? 0.58 : 0.28), -30, 40);
}

function getLivestockPeriodTone(item: LivestockBoardItem, period: HeatmapPeriod): Tone {
  return getLivestockTone(getLivestockPeriodPriceChange(item, period), item.quantityLabel);
}

function getLivestockTileSize(item: LivestockBoardItem, period: HeatmapPeriod = "month", averageQuantity = 0) {
  const volumeSignal = getLivestockVolumeSignal(item, averageQuantity, period);

  if (volumeSignal >= 22) return { columns: 3, rows: 2 };
  if (volumeSignal >= 8) return { columns: 2, rows: 1 };
  if (getLivestockPeriodTone(item, period) === "green" && volumeSignal >= 2) return { columns: 2, rows: 1 };
  return { columns: 1, rows: 1 };
}

function buildLivestockBoardItems(data: MaffLivestockResponse | null) {
  if (!data) return [] as LivestockBoardItem[];

  return data.groups.flatMap((group) => {
    const rawItems = group.reports.flatMap((report) =>
      report.records
        .map((record, index) => {
          const price = getLivestockPriceValue(group, record);
          if (price === null) return null;
          return {
            report,
            record,
            index,
            price
          };
        })
        .filter((item): item is { report: MaffLivestockReport; record: MaffLivestockRecord; index: number; price: number } =>
          item !== null
        )
    );

    const averagePrice =
      rawItems.reduce((total, item) => total + item.price, 0) / Math.max(1, rawItems.length);

    return rawItems
      .map((item) => {
        const quantityLabel = getLivestockQuantityLabel(group, item.record);
        const changeFromAverage = ((item.price - averagePrice) / Math.max(1, averagePrice)) * 100;
        const tone = getLivestockTone(changeFromAverage, quantityLabel);
        const label = getLivestockItemLabel(group, item.report.areaName, item.record);
        const contextLabel =
          group.kind === "egg"
            ? item.report.areaName
            : getRecordValue(item.record, ["畜種", "畜種名"]) || item.report.areaName;

        return {
          id: `${group.kind}-${item.report.reportId}-${item.index}-${label}`,
          kind: group.kind,
          categoryLabel: group.label,
          label,
          contextLabel,
          price: item.price,
          averagePrice,
          priceLabel: `${formatCount(item.price)}円/kg`,
          quantityLabel,
          dateLabel: group.dateLabel,
          sourceLabel: group.notice,
          changeFromAverage,
          tone,
          score: getLivestockOpportunityScore(changeFromAverage, tone),
          record: item.record
        } satisfies LivestockBoardItem;
      })
      .sort((a, b) => {
        const scoreDifference = b.score - a.score;
        if (scoreDifference !== 0) return scoreDifference;
        return a.price - b.price;
      });
  });
}

function getRicePriceColumns(columns: string[]) {
  const directColumns = columns.filter((column) => column.includes("_価格"));
  return directColumns.length > 0 ? directColumns : columns.filter((column) => column.includes("価格"));
}

function getRiceVolumeColumns(columns: string[]) {
  const directColumns = columns.filter((column) => column.includes("_数量"));
  return directColumns.length > 0 ? directColumns : columns.filter((column) => column.includes("数量"));
}

function getRicePriceColumn(columns: string[]) {
  return getRicePriceColumns(columns)[0] ?? "";
}

function getRiceVolumeColumn(columns: string[]) {
  return getRiceVolumeColumns(columns)[0] ?? "";
}

function getRiceMonthCompareColumn(columns: string[]) {
  return columns.find((column) => column.includes("対前月比")) ?? "";
}

function getRiceYearCompareColumn(columns: string[]) {
  return columns.find((column) => column.includes("対前年比")) ?? "";
}

function getRiceOrigin(record: MaffRiceRecord) {
  return record["産地"] ?? record["都道府県"] ?? "産地未取得";
}

function getRiceBrand(record: MaffRiceRecord) {
  return record["品種銘柄"] ?? record["銘柄"] ?? record["品種"] ?? "銘柄未取得";
}

function getRiceRecordNumber(record: MaffRiceRecord, column: string) {
  if (!column) return null;
  return toNumberValue(record[column] ?? "");
}

function getFirstRiceRecordNumber(record: MaffRiceRecord, columns: string[]) {
  for (const column of columns) {
    const value = getRiceRecordNumber(record, column);
    if (value !== null) return value;
  }

  return null;
}

function parseRiceComparePercent(value: string | undefined) {
  const rawValue = value ?? "";
  const normalized = rawValue.replaceAll("％", "%").replace("%", "").trim();
  const numericValue = toNumberValue(normalized);
  if (numericValue === null) return 0;

  const looksLikeRatio = numericValue > 60 || rawValue.includes("%") || rawValue.includes("％");
  return clampNumber(looksLikeRatio ? numericValue - 100 : numericValue, -60, 60);
}

function buildRiceHeatmapItems(data: MaffRiceResponse | null) {
  if (!data) return [] as RiceHeatmapItem[];

  const priceColumns = getRicePriceColumns(data.columns);
  const volumeColumns = getRiceVolumeColumns(data.columns);
  const monthCompareColumn = getRiceMonthCompareColumn(data.columns);
  const yearCompareColumn = getRiceYearCompareColumn(data.columns);
  const rawItems = data.records.map((record, index) => {
    const price = getFirstRiceRecordNumber(record, priceColumns);
    const hasPrice = price !== null;
    const volume = getFirstRiceRecordNumber(record, volumeColumns) ?? 0;
    const origin = getRiceOrigin(record);
    const brand = getRiceBrand(record);

    return {
      brand,
      hasPrice,
      id: `${origin}-${brand}-${index}`,
      monthChange: parseRiceComparePercent(monthCompareColumn ? record[monthCompareColumn] : undefined),
      origin,
      price: price ?? 0,
      priceLabel: hasPrice ? `${formatCount(price)}円/60kg` : "価格未取得",
      quantityLabel: volume > 0 ? `数量 ${formatCount(volume)}` : "数量 未取得",
      volume,
      volumeChange: 0,
      yearChange: parseRiceComparePercent(yearCompareColumn ? record[yearCompareColumn] : undefined)
    } satisfies RiceHeatmapItem;
  });

  const volumeItems = rawItems.filter((item) => item.volume > 0);
  const averageVolume =
    volumeItems.reduce((total, item) => total + item.volume, 0) / Math.max(1, volumeItems.length);

  return rawItems
    .map((item) => ({
      ...item,
      volumeChange: averageVolume > 0 ? ((item.volume - averageVolume) / averageVolume) * 100 : 0
    }))
    .sort((a, b) => {
      if (a.hasPrice !== b.hasPrice) return a.hasPrice ? -1 : 1;
      const volumeDifference = b.volumeChange - a.volumeChange;
      if (volumeDifference !== 0) return volumeDifference;
      return getRicePeriodPriceChange(a, "month") - getRicePeriodPriceChange(b, "month");
    });
}

function getRicePeriodPriceChange(item: RiceHeatmapItem, period: HeatmapPeriod) {
  if (!item.hasPrice) return 0;
  const monthlySignal = item.monthChange || item.yearChange * 0.35;
  if (period === "month") return clampNumber(item.yearChange || monthlySignal, -60, 60);
  if (period === "week") return clampNumber(monthlySignal * 0.42, -18, 18);
  return clampNumber(monthlySignal * 0.16, -8, 8);
}

function getRicePeriodVolumeChange(item: RiceHeatmapItem, period: HeatmapPeriod) {
  if (period === "month") return clampNumber(item.volumeChange, -60, 80);
  if (period === "week") return clampNumber(item.volumeChange * 0.58, -35, 45);
  return clampNumber(item.volumeChange * 0.28, -18, 28);
}

function getRicePeriodTone(item: RiceHeatmapItem, period: HeatmapPeriod): Tone {
  if (!item.hasPrice) return "slate";
  const priceSignal = getRicePeriodPriceChange(item, period);
  const volumeSignal = getRicePeriodVolumeChange(item, period);

  if (priceSignal <= -5) return "green";
  if (priceSignal >= 8) return "red";
  if (volumeSignal <= -12) return "amber";
  if (priceSignal >= 4) return "red";
  return "blue";
}

function getRiceTileSize(item: RiceHeatmapItem, period: HeatmapPeriod) {
  const volumeSignal = getRicePeriodVolumeChange(item, period);

  if (volumeSignal >= 28) return { columns: 3, rows: 2 };
  if (volumeSignal >= 9) return { columns: 2, rows: 1 };
  if (getRicePeriodTone(item, period) === "green" && volumeSignal >= 3) return { columns: 2, rows: 1 };
  return { columns: 1, rows: 1 };
}

function buildRicePriceTrend(item: RiceHeatmapItem): PricePoint[] {
  const labels = ["7月", "8月", "9月", "10月", "11月", "12月", "1月", "2月", "3月", "4月", "5月", "6月"];
  const current = Math.max(1, item.price || 0);
  const yearChange = item.yearChange || item.monthChange * 0.35;
  const monthChange = item.monthChange || yearChange * 0.25;
  const lastYearCurrent = current / Math.max(0.35, 1 + yearChange / 100);
  const normalCurrent = current / Math.max(0.35, 1 + (yearChange * 0.45 + monthChange * 0.25) / 100);
  const seed = Array.from(item.id).reduce((total, char) => total + char.charCodeAt(0), 0);
  const seasonalAmplitude = Math.max(650, current * 0.018);

  return labels.map((label, index) => {
    const progress = index / (labels.length - 1);
    const seasonal = Math.sin((index + (seed % 12)) * (Math.PI * 2 / 12)) * seasonalAmplitude;
    const base = lastYearCurrent + (current - lastYearCurrent) * progress;
    const currentValue = index === labels.length - 1 ? current : Math.max(1, base + seasonal);
    const lastYearValue = index === labels.length - 1 ? lastYearCurrent : Math.max(1, currentValue / Math.max(0.35, 1 + yearChange / 100));
    const normalValue = index === labels.length - 1 ? normalCurrent : Math.max(1, normalCurrent + seasonal * 0.4);

    return {
      current: currentValue,
      label,
      lastYear: lastYearValue,
      normal: normalValue
    };
  });
}

function roundRetailPrice(value: number) {
  if (value < 100) return Math.max(10, Math.round(value / 5) * 5);
  return Math.round(value / 10) * 10;
}

function getRetailEstimate(item: WholesaleItem) {
  const preset =
    retailPresets[item.code] ??
    (item.department === "fruit"
      ? { unitLabel: "1個", grams: 250, marginRate: 1.5 }
      : { unitLabel: "1点", grams: 300, marginRate: 1.5 });
  const price = roundRetailPrice(item.middlePrice * (preset.grams / 1000) * preset.marginRate);

  return {
    price,
    unitLabel: preset.unitLabel
  };
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getHeatmapPeriodOption(period: HeatmapPeriod) {
  return heatmapPeriodOptions.find((option) => option.id === period) ?? heatmapPeriodOptions[0];
}

function HeatmapPeriodTabs({
  heatmapPeriod,
  label = "ヒートマップ期間",
  onHeatmapPeriodChange
}: {
  heatmapPeriod: HeatmapPeriod;
  label?: string;
  onHeatmapPeriodChange: (period: HeatmapPeriod) => void;
}) {
  return (
    <div className="heatmap-period-tabs" aria-label={label}>
      {heatmapPeriodOptions.map((period) => (
        <button
          className={heatmapPeriod === period.id ? "active" : ""}
          key={period.id}
          onClick={() => onHeatmapPeriodChange(period.id)}
          type="button"
        >
          {period.label}
        </button>
      ))}
    </div>
  );
}

function getHeatmapPriceChange(item: WholesaleItem, period: HeatmapPeriod) {
  if (period === "month") return item.yearMonthChange;
  if (period === "week") return item.weekChange;

  const volumeRelief = item.volumeChange >= 10 ? -1.6 : item.volumeChange <= -8 ? 1.8 : 0;
  return clampNumber(item.weekChange * 0.38 + volumeRelief + item.normalRatio * 0.04, -18, 18);
}

function getHeatmapVolumeChange(item: WholesaleItem, period: HeatmapPeriod) {
  if (period === "month") return item.volumeChange;
  if (period === "week") return clampNumber(item.volumeChange * 0.68 - item.weekChange * 0.12, -24, 32);
  return clampNumber(item.volumeChange * 0.36 - item.weekChange * 0.18, -18, 24);
}

function getWholesaleQuantityWeight(item: WholesaleItem) {
  const marketQuantity =
    item.marketRows?.reduce((total, row) => {
      const quantity = row.quantityTons;
      return Number.isFinite(quantity) && quantity > 0 ? total + quantity : total;
    }, 0) ?? 0;

  if (marketQuantity > 0) return marketQuantity;

  return Math.max(1, 100 + item.volumeChange);
}

function getHeatmapOpportunityScore(item: WholesaleItem, period: HeatmapPeriod) {
  const retail = getRetailEstimate(item);
  const toneBoost =
    item.tone === "green" ? 74 : item.tone === "blue" ? 36 : item.tone === "amber" ? 14 : 0;
  const priceDropScore = Math.max(0, -getHeatmapPriceChange(item, period)) * 5;
  const volumeScore = Math.max(0, getHeatmapVolumeChange(item, period)) * 1.4;
  const retailCheapScore = Math.max(0, 320 - retail.price) / 4;

  return toneBoost + priceDropScore + volumeScore + retailCheapScore;
}

function getHeatmapPriceTone(item: WholesaleItem, period: HeatmapPeriod): Tone {
  const periodChange = getHeatmapPriceChange(item, period);
  const priceSignal =
    period === "month" ? Math.round((periodChange + item.normalRatio) / 2) : Math.round(periodChange);
  const volumeSignal = getHeatmapVolumeChange(item, period);

  if (priceSignal <= -5) return "green";
  if (priceSignal >= 12) return "red";
  if (volumeSignal <= -8) return "amber";
  if (priceSignal >= 4) return "red";
  return "blue";
}

function getHeatmapTileSize(item: WholesaleItem, period: HeatmapPeriod) {
  const volumeSignal = getHeatmapVolumeChange(item, period);

  return {
    columns: volumeSignal >= 14 ? 3 : volumeSignal >= 5 ? 2 : 1,
    rows: volumeSignal >= 10 ? 2 : 1
  };
}

type LodgingYoYHeatmapItem = {
  id: string;
  category: string;
  label: string;
  valueLabel: string;
  change: number;
  impact: number;
  tone: Tone;
};

function getLodgingYoYTone(change: number): Tone {
  if (change >= 14) return "green";
  if (change >= 3) return "blue";
  if (change <= -8) return "red";
  if (change <= -2) return "amber";
  return "slate";
}

function getYoYDirectionLabel(change: number) {
  if (change > 0) return "上昇";
  if (change < 0) return "下落";
  return "横ばい";
}

function buildNationalityExpenseYoYItems(
  lodging: PrefectureLodgingProfile,
  market: PrefectureLodgingProfile["nationalityGuests"][number],
  marketIndex: number
) {
  const foreignShare = (lodging.foreignGuests / Math.max(1, lodging.totalGuests)) * 100;
  const baseChange = clampNumber(
    Math.round(lodging.monthChange + (lodging.roomOccupancyRate - 70) * 0.22 + foreignShare * 0.08),
    -30,
    60
  );
  const expenseData = [
    { key: "dining", label: "食費", value: market.travelExpense.diningExpenseYen },
    { key: "shopping", label: "買い物代", value: market.travelExpense.shoppingExpenseYen },
    { key: "lodging", label: "宿泊費", value: market.travelExpense.lodgingExpenseYen },
    { key: "travel", label: "旅行費用", value: market.travelExpense.totalTravelExpenseYen }
  ];

  return expenseData.map((expense, expenseIndex) => {
    const change = clampNumber(
      Math.round(baseChange * 0.42 + (market.share - 20) * 0.45 + (expense.value - 70000) / 9000 - marketIndex * 1.2),
      -30,
      72
    );
    const lastYearValue = Math.round(expense.value / Math.max(0.3, 1 + change / 100));

    return {
      ...expense,
      change,
      directionLabel: getYoYDirectionLabel(change),
      lastYearValue,
      tone: getLodgingYoYTone(change + expenseIndex * 0)
    };
  });
}

function getLodgingYoYTileSize(item: LodgingYoYHeatmapItem) {
  const impactScore = item.impact + Math.abs(item.change) * 0.7;

  return {
    columns: impactScore >= 86 ? 3 : impactScore >= 42 ? 2 : 1,
    rows: impactScore >= 76 ? 2 : 1
  };
}

function buildLodgingYoYHeatmapItems(lodging: PrefectureLodgingProfile) {
  const foreignShare = (lodging.foreignGuests / Math.max(1, lodging.totalGuests)) * 100;
  const baseChange = clampNumber(
    Math.round(lodging.monthChange + (lodging.roomOccupancyRate - 70) * 0.22 + foreignShare * 0.08),
    -30,
    60
  );
  const topGuestCount = Math.max(1, ...lodging.nationalityGuests.map((market) => market.guests));
  const expenseEntries = lodging.nationalityGuests.flatMap((market) => [
    {
      category: `${market.country} 飲食`,
      expense: market.travelExpense.diningExpenseYen,
      label: "飲食費"
    },
    {
      category: `${market.country} 買物`,
      expense: market.travelExpense.shoppingExpenseYen,
      label: "買い物代"
    },
    {
      category: `${market.country} 宿泊`,
      expense: market.travelExpense.lodgingExpenseYen,
      label: "宿泊費"
    },
    {
      category: `${market.country} 旅行`,
      expense: market.travelExpense.totalTravelExpenseYen,
      label: "旅行費用"
    }
  ]);
  const maxExpenseImpact = Math.max(
    1,
    ...expenseEntries.map((entry) => {
      const market = lodging.nationalityGuests.find((item) => entry.category.startsWith(item.country));
      return (market?.guests ?? 0) * entry.expense;
    })
  );

  const coreItems: LodgingYoYHeatmapItem[] = [
    {
      id: "lodging-total",
      category: "宿泊",
      label: "宿泊者数",
      valueLabel: `${formatCount(lodging.totalGuests)}人泊`,
      change: baseChange,
      impact: Math.min(100, lodging.totalGuests / 1600),
      tone: getLodgingYoYTone(baseChange)
    },
    {
      id: "lodging-foreign",
      category: "宿泊",
      label: "外国人宿泊者数",
      valueLabel: `${formatCount(lodging.foreignGuests)}人泊`,
      change: clampNumber(Math.round(baseChange + foreignShare * 0.32 - 8), -30, 72),
      impact: Math.min(100, lodging.foreignGuests / 700),
      tone: getLodgingYoYTone(clampNumber(Math.round(baseChange + foreignShare * 0.32 - 8), -30, 72))
    },
    {
      id: "lodging-occupancy",
      category: "稼働",
      label: "客室稼働率",
      valueLabel: formatRate(lodging.roomOccupancyRate),
      change: clampNumber(Math.round(lodging.roomOccupancyRate - 70 + lodging.monthChange * 0.24), -24, 38),
      impact: lodging.roomOccupancyRate,
      tone: getLodgingYoYTone(clampNumber(Math.round(lodging.roomOccupancyRate - 70 + lodging.monthChange * 0.24), -24, 38))
    }
  ];

  const nationalityItems: LodgingYoYHeatmapItem[] = lodging.nationalityGuests.map((market, index) => {
    const totalSpend = market.travelExpense.totalTravelExpenseYen;
    const change = clampNumber(
      Math.round(baseChange * 0.58 + (market.share - 22) * 0.72 + (totalSpend - 230000) / 18000 - index * 1.5),
      -35,
      78
    );

    return {
      id: `nationality-${market.country}`,
      category: "国籍別宿泊者数",
      label: market.country,
      valueLabel: `${formatCount(market.guests)}人泊`,
      change,
      impact: Math.min(100, (market.guests / topGuestCount) * 90 + Math.abs(change) * 0.35),
      tone: getLodgingYoYTone(change)
    };
  });

  const expenseItems: LodgingYoYHeatmapItem[] = lodging.nationalityGuests.flatMap((market, marketIndex) => {
    const expenseData = [
      { key: "dining", label: "飲食費", value: market.travelExpense.diningExpenseYen },
      { key: "shopping", label: "買い物代", value: market.travelExpense.shoppingExpenseYen },
      { key: "lodging", label: "宿泊費", value: market.travelExpense.lodgingExpenseYen },
      { key: "travel", label: "旅行費用", value: market.travelExpense.totalTravelExpenseYen }
    ];

    return expenseData.map((expense, expenseIndex) => {
      const change = clampNumber(
        Math.round(baseChange * 0.42 + (market.share - 20) * 0.45 + (expense.value - 70000) / 9000 - marketIndex * 1.2),
        -30,
        72
      );
      const impact = ((market.guests * expense.value) / maxExpenseImpact) * 100;

      return {
        id: `expense-${market.country}-${expense.key}`,
        category: `${market.country} 消費`,
        label: expense.label,
        valueLabel: `${formatYen(expense.value)}円`,
        change,
        impact: Math.min(100, impact + Math.abs(change) * 0.25 - expenseIndex * 2),
        tone: getLodgingYoYTone(change)
      };
    });
  });

  return [...coreItems, ...nationalityItems, ...expenseItems].sort((a, b) => {
    const impactDifference = b.impact - a.impact;
    if (impactDifference !== 0) return impactDifference;
    return b.change - a.change;
  });
}

function buildItemPriceTrend(item: WholesaleItem): PricePoint[] {
  const current = item.middlePrice;
  const lastYearCurrent = current / Math.max(0.25, 1 + item.yearMonthChange / 100);
  const normalCurrent = current / Math.max(0.25, 1 + item.normalRatio / 100);
  const codeSeed = Array.from(item.code).reduce((total, char) => total + char.charCodeAt(0), 0);
  const seasonalAmplitude = Math.max(3, current * 0.025 + Math.abs(current - normalCurrent) * 0.18);
  const previousYearChange = clampNumber(item.yearMonthChange * 0.42 + item.normalRatio * 0.28, -45, 70);
  const twoYearsAgoCurrent = lastYearCurrent / Math.max(0.35, 1 + previousYearChange / 100);
  const yearOverYearFactor = Math.max(0.35, 1 + item.yearMonthChange / 100);

  return Array.from({ length: 24 }, (_, index) => {
    const monthsBack = 23 - index;
    const label =
      monthsBack === 23
        ? "\u7d042\u5e74\u524d"
        : monthsBack === 12
          ? "\u7d041\u5e74\u524d"
          : monthsBack === 0
            ? "\u4eca\u6708"
            : `${monthsBack}\u304b\u6708\u524d`;
    const firstYearProgress = (23 - monthsBack) / 11;
    const secondYearProgress = (12 - monthsBack) / 12;
    const base =
      monthsBack >= 12
        ? twoYearsAgoCurrent + (lastYearCurrent - twoYearsAgoCurrent) * firstYearProgress
        : lastYearCurrent + (current - lastYearCurrent) * secondYearProgress;
    const seasonal = Math.sin((index + (codeSeed % 12)) * (Math.PI * 2 / 12)) * seasonalAmplitude;
    const smallWave = Math.cos((index + (codeSeed % 7)) * 0.85) * current * 0.008;
    const recentTilt = index > 20 ? ((index - 20) / 3) * (item.weekChange / 100) * current * 0.2 : 0;
    const currentValue = index === 23 ? current : Math.max(1, base + seasonal + smallWave + recentTilt);
    const lastYearValue = index === 23 ? lastYearCurrent : Math.max(1, currentValue / yearOverYearFactor + seasonal * 0.12);
    const normalValue = index === 23 ? normalCurrent : Math.max(1, normalCurrent + seasonal * 0.45);

    return {
      label,
      current: currentValue,
      lastYear: lastYearValue,
      normal: normalValue
    };
  });
}

function buildLivestockPriceTrend(item: LivestockBoardItem): PricePoint[] {
  const current = Math.max(1, item.price);
  const marketAverage = Math.max(1, item.averagePrice);
  const averageGap = clampNumber(item.changeFromAverage, -45, 70);
  const comparisonCurrent = current / Math.max(0.35, 1 + averageGap / 100);
  const seedSource = `${item.kind}-${item.label}-${item.contextLabel}`;
  const codeSeed = Array.from(seedSource).reduce((total, char) => total + char.charCodeAt(0), 0);
  const seasonalAmplitude = Math.max(6, current * 0.026 + Math.abs(current - marketAverage) * 0.16);

  return Array.from({ length: 12 }, (_, index) => {
    const monthsBack = 11 - index;
    const label = monthsBack === 0 ? "今月" : `${monthsBack}か月前`;
    const progress = index / 11;
    const base = comparisonCurrent + (current - comparisonCurrent) * progress;
    const seasonal = Math.sin((index + (codeSeed % 12)) * (Math.PI * 2 / 12)) * seasonalAmplitude;
    const smallWave = Math.cos((index + (codeSeed % 5)) * 0.9) * current * 0.006;
    const currentValue = index === 11 ? current : Math.max(1, base + seasonal + smallWave);
    const comparisonValue =
      index === 11 ? comparisonCurrent : Math.max(1, comparisonCurrent + seasonal * 0.22 + smallWave * 0.55);
    const normalValue = index === 11 ? marketAverage : Math.max(1, marketAverage + seasonal * 0.32);

    return {
      label,
      current: currentValue,
      lastYear: comparisonValue,
      normal: normalValue
    };
  });
}

function shouldShowPriceTrendLabel(index: number, total: number) {
  return index === 0 || index === total - 1 || index % 3 === 2;
}

function getPriceTrendLabelX(index: number, total: number) {
  return 56 + (index / Math.max(1, total - 1)) * 520;
}

function getPriceRange(points: PricePoint[]) {
  const values = points.flatMap((point) => [point.current, point.lastYear, point.normal]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = Math.max(10, (maxValue - minValue) * 0.18);

  return {
    min: Math.max(0, Math.floor((minValue - padding) / 10) * 10),
    max: Math.ceil((maxValue + padding) / 10) * 10
  };
}

function buildDynamicPolyline(
  points: PricePoint[],
  key: "current" | "lastYear" | "normal",
  range: { min: number; max: number }
) {
  const width = 520;
  const left = 56;
  const top = 32;
  const height = 188;
  const rangeSize = Math.max(1, range.max - range.min);

  return points
    .map((point, index) => {
      const x = left + (index / (points.length - 1)) * width;
      const y = top + ((range.max - point[key]) / rangeSize) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildPolyline(
  points: PricePoint[],
  key: "current" | "lastYear" | "normal"
) {
  const values = points.map((point) => point[key]);
  const min = 80;
  const max = 240;
  const width = 466;
  const left = 54;
  const top = 36;
  const height = 184;

  return values
    .map((value, index) => {
      const x = left + (index / (values.length - 1)) * width;
      const y = top + ((max - value) / (max - min)) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function matchesTab(item: WholesaleItem, tab: CategoryTab["id"]) {
  if (tab === "all") return true;
  if (tab === "vegetable" || tab === "fruit") return item.department === tab;
  return item.group === tab;
}

function sortItems(items: WholesaleItem[], sortMode: SortMode) {
  return [...items].sort((a, b) => {
    if (sortMode === "price") return b.middlePrice - a.middlePrice;
    if (sortMode === "movement") {
      return Math.abs(b.yearMonthChange) - Math.abs(a.yearMonthChange);
    }
    return b.score - a.score;
  });
}

function PriceCard({ item, rank }: { item: WholesaleItem; rank: number }) {
  const retail = getRetailEstimate(item);

  return (
    <article className={`price-card ${toneClass[item.tone]}`}>
      <div className="price-card-top">
        <span className="rank-label">注目 {rank}</span>
        <span className="group-label">{item.department === "fruit" ? "くだもの" : "野菜"} / {item.group}</span>
      </div>
      <div className="price-card-main">
        <div>
          <h3>{item.name}</h3>
          <p>{item.judgment}</p>
        </div>
        <div className="price-pair">
          <div className="retail-price">
            <span>店頭目安</span>
            <strong>{formatYen(retail.price)}</strong>
            <small>円/{retail.unitLabel}</small>
          </div>
          <div className="wholesale-price">
            <span>中値</span>
            <strong>{formatYen(item.middlePrice)}</strong>
            <small>円/{item.unit}</small>
          </div>
        </div>
      </div>
      <div className="price-range" aria-label={`${item.name}の卸売価格レンジ`}>
        <span style={{ width: `${Math.min(100, Math.max(16, item.score))}%` }} />
      </div>
      <div className="price-card-grid">
        <div>
          <span>高値</span>
          <strong>{formatYen(item.highPrice)}</strong>
        </div>
        <div>
          <span>安値</span>
          <strong>{formatYen(item.lowPrice)}</strong>
        </div>
        <div>
          <span>前年同月</span>
          <strong>{formatPercent(item.yearMonthChange)}</strong>
        </div>
        <div>
          <span>入荷</span>
          <strong>{item.supplyLabel}</strong>
        </div>
      </div>
    </article>
  );
}

function WholesaleHeatmap({
  heatmapPeriod,
  items,
  onHeatmapPeriodChange,
  onSelectItem
}: {
  heatmapPeriod: HeatmapPeriod;
  items: WholesaleItem[];
  onHeatmapPeriodChange: (period: HeatmapPeriod) => void;
  onSelectItem: (item: WholesaleItem) => void;
}) {
  const selectedPeriod = getHeatmapPeriodOption(heatmapPeriod);
  const heatmapItems = [...items].sort((a, b) => {
    const volumeDifference =
      getHeatmapVolumeChange(b, heatmapPeriod) - getHeatmapVolumeChange(a, heatmapPeriod);
    if (volumeDifference !== 0) return volumeDifference;
    return getHeatmapOpportunityScore(b, heatmapPeriod) - getHeatmapOpportunityScore(a, heatmapPeriod);
  });
  const heatmapGroups = [
    {
      id: "vegetable",
      label: "野菜",
      items: heatmapItems.filter((item) => item.department === "vegetable")
    },
    {
      id: "fruit",
      label: "果物",
      items: heatmapItems.filter((item) => item.department === "fruit")
    }
  ];

  return (
    <section className="panel heatmap-panel" aria-label="卸売市場ヒートマップ">
      <div className="panel-header heatmap-header">
        <div>
          <h2 className="panel-title">卸売市場ヒートマップ</h2>
          <span className="panel-subtitle">
            面積は{selectedPeriod.volumeLabel}、色は{selectedPeriod.metricLabel}の価格シグナル。クリックで価格グラフと売場判断を確認できます。
          </span>
        </div>
        <div className="heatmap-toolbar">
          <HeatmapPeriodTabs
            heatmapPeriod={heatmapPeriod}
            onHeatmapPeriodChange={onHeatmapPeriodChange}
          />
          <div className="heatmap-legend" aria-label="ヒートマップ凡例">
            <span><i className="legend-green" />価格安・買い時</span>
            <span><i className="legend-red" />価格高・高騰</span>
            <span><i className="legend-blue" />横ばい</span>
            <span><i className="legend-amber" />入荷減注意</span>
          </div>
        </div>
      </div>

      <div className="market-heatmap-sections">
        {heatmapGroups.map((group) => (
          <section className="market-heatmap-group" key={group.id} aria-label={`${group.label}ヒートマップ`}>
            <div className="heatmap-group-heading">
              <h3>{group.label}</h3>
              <span>{formatCount(group.items.length)}品目</span>
            </div>
            <div className="market-heatmap">
              {group.items.map((item) => {
                const retail = getRetailEstimate(item);
                const priceChange = getHeatmapPriceChange(item, heatmapPeriod);
                const volumeChange = getHeatmapVolumeChange(item, heatmapPeriod);
                const size = getHeatmapTileSize(item, heatmapPeriod);
                const sizeClass = `size-col-${size.columns} size-row-${size.rows}`;
                const priceTone = getHeatmapPriceTone(item, heatmapPeriod);

                return (
                  <button
                    className={`heatmap-tile ${toneClass[priceTone]} ${sizeClass}`}
                    onClick={() => onSelectItem(item)}
                    type="button"
                    key={item.code}
                    aria-label={`${item.name}の価格グラフを開く`}
                  >
                    <span>{group.label}</span>
                    <strong>{item.name}</strong>
                    <em>{formatPercent(priceChange)}</em>
                    <small>
                      入荷 {formatPercent(volumeChange)} / 中値 {formatYen(item.middlePrice)}円/{item.unit} / 店頭 {formatYen(retail.price)}円/{retail.unitLabel}
                    </small>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>

    </section>
  );
}

function LivestockHeatmap({
  data,
  error,
  heatmapPeriod,
  onHeatmapPeriodChange,
  status,
  onSelectItem
}: {
  data: MaffLivestockResponse | null;
  error: string;
  heatmapPeriod: HeatmapPeriod;
  onHeatmapPeriodChange: (period: HeatmapPeriod) => void;
  status: ApiLoadStatus;
  onSelectItem: (item: LivestockBoardItem) => void;
}) {
  const selectedPeriod = getHeatmapPeriodOption(heatmapPeriod);
  const boardItems = buildLivestockBoardItems(data);
  const groups = [
    {
      id: "pork",
      label: "豚",
      items: boardItems.filter((item) => item.kind === "pork")
    },
    {
      id: "beef",
      label: "牛",
      items: boardItems.filter((item) => item.kind === "beef")
    },
    {
      id: "egg",
      label: "鶏卵",
      items: boardItems.filter((item) => item.kind === "egg")
    }
  ];

  return (
    <section className="panel heatmap-panel livestock-heatmap-panel" aria-label="食肉・鶏卵ヒートマップ">
      <div className="panel-header heatmap-header">
        <div>
          <h2 className="panel-title">食肉・鶏卵ヒートマップ</h2>
          <span className="panel-subtitle">
            面積は{selectedPeriod.volumeLabel}に換算した成立頭数・入荷量、色は{selectedPeriod.metricLabel}に換算した価格差で判断します。
          </span>
        </div>
        <div className="heatmap-toolbar">
          <HeatmapPeriodTabs
            heatmapPeriod={heatmapPeriod}
            label="食肉・鶏卵ヒートマップ期間"
            onHeatmapPeriodChange={onHeatmapPeriodChange}
          />
          <div className="heatmap-legend" aria-label="食肉・鶏卵ヒートマップ凡例">
            <span><i className="legend-red" />高値注意</span>
            <span><i className="legend-green" />買い時</span>
            <span><i className="legend-blue" />平均より安い</span>
            <span><i className="legend-amber" />数量減注意</span>
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="api-state-box">農林水産省から食肉・鶏卵データを取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">食肉・鶏卵ヒートマップの取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="market-heatmap-sections">
          {groups.map((group) => {
            const quantityItems = group.items.filter((item) => getLivestockQuantityValue(item) > 0);
            const averageQuantity =
              quantityItems.reduce((total, item) => total + getLivestockQuantityValue(item), 0) /
              Math.max(1, quantityItems.length);
            const sortedItems = [...group.items].sort((a, b) => {
              const volumeDifference =
                getLivestockVolumeSignal(b, averageQuantity, heatmapPeriod) -
                getLivestockVolumeSignal(a, averageQuantity, heatmapPeriod);
              if (volumeDifference !== 0) return volumeDifference;
              return getLivestockPeriodPriceChange(a, heatmapPeriod) - getLivestockPeriodPriceChange(b, heatmapPeriod);
            });

            return (
              <section className="market-heatmap-group" key={group.id} aria-label={`${group.label}ヒートマップ`}>
                <div className="heatmap-group-heading">
                  <h3>{group.label}</h3>
                  <span>{formatCount(group.items.length)}件</span>
                </div>
                <div className="market-heatmap livestock-market-heatmap">
                  {sortedItems.map((item) => {
                    const priceChange = getLivestockPeriodPriceChange(item, heatmapPeriod);
                    const volumeSignal = getLivestockVolumeSignal(item, averageQuantity, heatmapPeriod);
                    const size = getLivestockTileSize(item, heatmapPeriod, averageQuantity);
                    const sizeClass = `size-col-${size.columns} size-row-${size.rows}`;
                    const tone = getLivestockPeriodTone(item, heatmapPeriod);

                    return (
                      <button
                        aria-label={`${item.label}の食肉・鶏卵詳細を開く`}
                        className={`heatmap-tile livestock-heatmap-tile ${toneClass[tone]} ${sizeClass}`}
                        key={item.id}
                        onClick={() => onSelectItem(item)}
                        type="button"
                      >
                        <span>{item.categoryLabel} / {item.contextLabel}</span>
                        <strong>{item.label}</strong>
                        <em>{formatPercent(priceChange)}</em>
                        <small>数量 {formatPercent(volumeSignal)} / {item.priceLabel} / {item.quantityLabel}</small>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </section>
  );
}

function EstatProducePanel({
  data,
  error,
  status
}: {
  data: EstatProduceResponse | null;
  error: string;
  status: ApiLoadStatus;
}) {
  return (
    <section className="panel estat-api-panel" aria-label="e-Stat API取得データ">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">e-Stat API取得データ</h2>
          <span className="panel-subtitle">青果物卸売市場調査から、野菜・果物の取得候補とサンプル値を表示</span>
        </div>
        <span className="panel-meta">{status === "success" ? "取得済み" : "API確認"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">e-Stat APIから野菜・果物データを取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">API取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="estat-api-compact">
          {data.groups.map((group) => {
            const visibleValues = getVisibleEstatValues(group.sample);
            const valueLabel = getVisibleEstatValueLabel(group.sample);

            return (
              <article className="estat-api-summary-card" key={group.id}>
                <div className="estat-api-card-head">
                  <div>
                    <span>{group.searchWord}</span>
                    <h3>{group.label}</h3>
                  </div>
                  <strong>{formatCount(group.totalTables)}件</strong>
                </div>

                <div className="estat-api-metrics">
                  <div>
                    <span>取得表</span>
                    <strong>{formatCount(group.fetchedTables)}件</strong>
                  </div>
                  <div>
                    <span>取得値</span>
                    <strong>{formatCount(group.sample?.values.length ?? 0)}件</strong>
                  </div>
                  <div>
                    <span>中値候補</span>
                    <strong>{formatCount(group.sample?.middleValues.length ?? 0)}件</strong>
                  </div>
                  <div>
                    <span>総データ行</span>
                    <strong>{formatCount(group.sample?.totalRows ?? 0)}行</strong>
                  </div>
                </div>

                <details className="estat-api-details">
                  <summary>{group.label}の取得候補とサンプル値を開く</summary>
                  {group.sample && (
                    <div className="estat-sample-box">
                      <span>{valueLabel}</span>
                      <strong>{group.sample.title}</strong>
                      <small>
                        取得範囲 {formatCount(group.sample.from)}-{formatCount(group.sample.to)}
                        {group.sample.nextKey ? ` / 続き ${formatCount(group.sample.nextKey)}行目から` : ""}
                      </small>
                      <div className="estat-sample-list">
                        {visibleValues.slice(0, 6).map((value, index) => (
                          <div key={`${group.id}-${value.label}-${value.unit}-${value.value}-${index}`}>
                            <span>{value.label}</span>
                            <strong>
                              {formatCount(Number(value.value) || 0)}
                              {value.unit}
                            </strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="estat-table-list">
                    {group.tables.slice(0, 5).map((table) => (
                      <div key={table.id}>
                        <span>{table.id}</span>
                        <strong>{table.title}</strong>
                        <small>{table.cycle} / {table.surveyDate} / 更新 {table.updatedDate}</small>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatNullableNumber(value: number | null, unit: string) {
  if (value === null) return "未取得";
  return `${value.toLocaleString("ja-JP")}${unit}`;
}

function formatJmaTimestamp(value: string) {
  if (value.length !== 14) return value;
  return `${value.slice(0, 4)}/${value.slice(4, 6)}/${value.slice(6, 8)} ${value.slice(8, 10)}:${value.slice(10, 12)}`;
}

function parseWeatherNumbers(values: Array<string | number | null | undefined>) {
  return values
    .map((value) => {
      if (value === null || value === undefined) return null;
      const numericValue = Number(String(value).replace("%", "").trim());
      return Number.isFinite(numericValue) ? numericValue : null;
    })
    .filter((value): value is number => value !== null);
}

function averageWeatherValue(values: number[], fallback = 0) {
  if (values.length === 0) return fallback;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function formatWeatherDay(value: string | undefined, fallbackIndex: number) {
  if (!value) return `${fallbackIndex + 1}日目`;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ja-JP", {
    day: "numeric",
    month: "numeric",
    weekday: "short"
  }).format(date);
}

function compactWeatherLabel(value: string) {
  if (value.includes("雪")) return "雪";
  if (value.includes("雨")) return "雨";
  if (value.includes("晴")) return "晴れ";
  if (value.includes("くもり") || value.includes("曇")) return "くもり";
  if (value.includes("高温")) return "高温";
  if (value.includes("低温")) return "低温";
  if (value.includes("多照")) return "日照多め";
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

function buildWeeklyForecastRows(data: JmaWeatherResponse | null, region: RegionProfile) {
  const pops = data?.forecast.precipitationProbabilities ?? [];
  const temperatures = data?.forecast.temperatures ?? [];
  const timeDefines = data?.forecast.timeDefines ?? [];
  const observationTemperatures = parseWeatherNumbers(data?.observations.map((observation) => observation.temperature) ?? []);
  const latestTemperature = data?.observations[0]?.temperature ?? null;
  const averageTemperature = Math.round(averageWeatherValue(observationTemperatures, latestTemperature ?? 21));
  const minTemperature = temperatures[0] ?? String(Math.max(0, averageTemperature - 4));
  const maxTemperature = temperatures[1] ?? String(averageTemperature + 5);
  const averagePop = Math.round(averageWeatherValue(parseWeatherNumbers(pops), 30));

  return Array.from({ length: 7 }, (_, index) => {
    const pop = pops[index] ?? String(averagePop);
    const isLongRangeFill = index >= Math.max(1, timeDefines.length, pops.length);

    return {
      dayLabel: formatWeatherDay(timeDefines[index], index),
      weatherLabel: compactWeatherLabel(isLongRangeFill ? region.weatherLabel : data?.forecast.weather || region.weatherLabel),
      temperatureLabel:
        index === 0 && latestTemperature !== null
          ? `${latestTemperature.toFixed(1)}℃`
          : `${minTemperature}-${maxTemperature}℃`,
      precipitationLabel: `${pop}%`,
      note: isLongRangeFill ? "1か月シグナルで補完" : "気象庁週間予報"
    };
  });
}

function buildMonthlyConsumptionOutlook(
  data: JmaWeatherResponse | null,
  region: RegionProfile,
  prefecture: PrefectureOption
) {
  const temperatures = parseWeatherNumbers(data?.forecast.temperatures ?? []);
  const pops = parseWeatherNumbers(data?.forecast.precipitationProbabilities ?? []);
  const latestTemperature = data?.observations[0]?.temperature ?? null;
  const averageTemperature = averageWeatherValue(temperatures, latestTemperature ?? 21);
  const averagePop = averageWeatherValue(pops, 30);
  const latestRain24h = data?.observations[0]?.precipitation24h ?? 0;
  const heatSignal =
    averageTemperature >= 24 ||
    region.weatherLabel.includes("高温") ||
    region.weatherLabel.includes("蒸し") ||
    region.weatherLabel.includes("日照");
  const rainSignal = averagePop >= 40 || latestRain24h >= 10 || region.weatherLabel.includes("雨");
  const lowTemperatureSignal = averageTemperature <= 12 || region.weatherLabel.includes("低温");
  const weatherPattern = heatSignal
    ? "高温・冷却需要型"
    : rainSignal
      ? "降水・内食寄り型"
      : lowTemperatureSignal
        ? "低温・温食需要型"
        : "平年並み分散型";

  const summary = `${prefecture.name}は${compactWeatherLabel(data?.forecast.weather || region.weatherLabel)}、${region.name}は${region.weatherLabel}。今月は${weatherPattern}として見ます。`;
  const outlookCards = heatSignal
    ? [
        { label: "飲料・冷やし麺", value: "+12%", tone: "green" as Tone, note: "高温時の過去傾向では冷却系と即食が伸びやすい" },
        { label: "果物・サラダ", value: "+9%", tone: "green" as Tone, note: "すいか、きゅうり、トマト、カット果物を厚めに見る" },
        { label: "米・パン", value: "-2%", tone: "blue" as Tone, note: "主食は横ばい。惣菜や麺との組み合わせを優先" },
        { label: "葉物鮮度", value: "注意", tone: "amber" as Tone, note: "気温上昇で廃棄リスクが上がるため少量補充" }
      ]
    : rainSignal
      ? [
          { label: "内食・米", value: "+8%", tone: "green" as Tone, note: "雨が多い月は家庭内消費と主食系が伸びやすい" },
          { label: "惣菜・肉", value: "+6%", tone: "green" as Tone, note: "外出控えに合わせて簡便調理と惣菜需要を想定" },
          { label: "果物", value: "-3%", tone: "blue" as Tone, note: "屋外需要は弱め。小容量・日持ち訴求が合う" },
          { label: "客数変動", value: "注意", tone: "amber" as Tone, note: "降水日は来店ピークが読みにくいため補充を分散" }
        ]
      : lowTemperatureSignal
        ? [
            { label: "温食・鍋具材", value: "+10%", tone: "green" as Tone, note: "低温型では根菜、肉、温かい惣菜が伸びやすい" },
            { label: "米・パン", value: "+5%", tone: "green" as Tone, note: "主食と温食メニューの連動を強める" },
            { label: "冷却系", value: "-6%", tone: "amber" as Tone, note: "冷やし麺、飲料、カット果物は控えめ" },
            { label: "葉物", value: "横ばい", tone: "blue" as Tone, note: "鮮度リスクは高温期より低く、価格を見て展開" }
          ]
        : [
            { label: "食品全体", value: "横ばい", tone: "blue" as Tone, note: "平年並み型。価格が安い品目を中心に販促" },
            { label: "果物", value: "+3%", tone: "green" as Tone, note: "週末や観光需要に合わせて露出を調整" },
            { label: "肉・惣菜", value: "+2%", tone: "blue" as Tone, note: "天候より価格と曜日の影響を重視" },
            { label: "米・パン", value: "横ばい", tone: "blue" as Tone, note: "家計調査と価格変化を見て補正" }
          ];

  return {
    averagePop: Math.round(averagePop),
    averageTemperature: Math.round(averageTemperature * 10) / 10,
    pattern: weatherPattern,
    summary,
    outlookCards
  };
}

function MonthlyWeatherOutlookPanel({
  data,
  error,
  prefecture,
  region,
  status
}: {
  data: JmaWeatherResponse | null;
  error: string;
  prefecture: PrefectureOption;
  region: RegionProfile;
  status: ApiLoadStatus;
}) {
  const weeklyRows = buildWeeklyForecastRows(data, region);
  const todayWeather = weeklyRows[0];
  const outlook = buildMonthlyConsumptionOutlook(data, region, prefecture);

  return (
    <section className="panel monthly-weather-outlook-panel" aria-label="今月の天候と消費見通し">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{prefecture.name}の今月の見通し</h2>
        </div>
        <span className={`api-status-pill ${status}`}>{status === "success" ? "取得済み" : "準備中"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">気象庁データから週間予報と1か月見通しを計算しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">気象庁データの取得に失敗しました。{error}</div>
      )}

      <div className="monthly-weather-summary">
        <div className="monthly-weather-ai">
          <span>AI 今月の見通し</span>
          <strong>{outlook.pattern}</strong>
          <p>{outlook.summary}</p>
        </div>
        <div className="monthly-weather-today">
          <span>今日の天気</span>
          <strong>{todayWeather.weatherLabel}</strong>
          <small>気温 {todayWeather.temperatureLabel} / 降水 {todayWeather.precipitationLabel}</small>
        </div>
        <div>
          <span>平均気温目安</span>
          <strong>{outlook.averageTemperature}℃</strong>
        </div>
        <div>
          <span>降水確率目安</span>
          <strong>{outlook.averagePop}%</strong>
        </div>
        <div>
          <span>1か月予報</span>
          <strong>{region.weatherLabel}</strong>
        </div>
      </div>

      <div className="monthly-consumption-grid" aria-label="1か月天候から見た消費予測">
        {outlook.outlookCards.map((card) => (
          <article className={`monthly-consumption-card ${toneClass[card.tone]}`} key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}

function JmaWeatherPanel({
  className,
  data,
  error,
  status
}: {
  className?: string;
  data: JmaWeatherResponse | null;
  error: string;
  status: ApiLoadStatus;
}) {
  const latestObservation = data?.observations[0] ?? null;
  const forecastTemperatures = data?.forecast.temperatures.filter((value) => value.trim().length > 0) ?? [];
  const forecastTemperatureLabel =
    forecastTemperatures.length > 0 ? `${forecastTemperatures.join(" / ")}℃` : "未取得";

  return (
    <section className={["panel public-api-panel", className].filter(Boolean).join(" ")} aria-label="気象庁API取得データ">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">気象庁データ</h2>
          <span className="panel-subtitle">予報JSONと日次アメダス要約から天候・気温・降水量を取得</span>
        </div>
        <span className="panel-meta">{status === "success" ? "取得済み" : "API確認"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">気象庁から天候・気温・降水量を取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">気象庁データの取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="public-data-grid weather-data-grid">
          <article className="public-data-card weather-main-card">
            <div>
              <span>{data.area} / {data.station.name}</span>
              <h3>{data.forecast.weather || "天候未取得"}</h3>
            </div>
            <p>{data.note}</p>
          </article>
          <article className="public-data-card">
            <span>実況気温</span>
            <strong>{formatNullableNumber(latestObservation?.temperature ?? null, "℃")}</strong>
            <small>{latestObservation ? formatJmaTimestamp(latestObservation.timestamp) : "最新時刻未取得"}</small>
          </article>
          <article className="public-data-card">
            <span>予報気温</span>
            <strong>{forecastTemperatureLabel}</strong>
            <small>{data.forecast.targetArea || "気象庁予報JSON"}</small>
          </article>
          <article className="public-data-card">
            <span>1時間降水量</span>
            <strong>{formatNullableNumber(latestObservation?.precipitation1h ?? null, "mm")}</strong>
            <small>24時間 {formatNullableNumber(latestObservation?.precipitation24h ?? null, "mm")}</small>
          </article>
          <article className="public-data-card">
            <span>降水確率候補</span>
            <strong>{data.forecast.precipitationProbabilities[0] ?? "未取得"}%</strong>
            <small>気象庁予報JSON</small>
          </article>
          <article className="public-data-card">
            <span>過去取得候補</span>
            <strong>{formatCount(data.observations.length)}件</strong>
            <small>直近日次アメダス要約</small>
          </article>
        </div>
      )}
    </section>
  );
}

function PublicDataPanel({
  data,
  error,
  status,
  subtitle,
  title
}: {
  data: PublicDataResponse | null;
  error: string;
  status: ApiLoadStatus;
  subtitle: string;
  title: string;
}) {
  return (
    <section className="panel public-api-panel" aria-label={title}>
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{title}</h2>
          <span className="panel-subtitle">{subtitle}</span>
        </div>
        <span className="panel-meta">{status === "success" ? "取得済み" : "API確認"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">{title}をe-Stat APIから取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">{title}の取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="public-data-grid">
          {data.groups.map((group) => (
            <article className="public-data-card" key={group.id}>
              <div className="public-data-card-head">
                <div>
                  <span>{group.searchWord}</span>
                  <h3>{group.label}</h3>
                </div>
                <strong>{formatCount(group.totalTables)}件</strong>
              </div>
              <div className="public-data-metrics">
                <div>
                  <span>取得表</span>
                  <strong>{formatCount(group.fetchedTables)}件</strong>
                </div>
                <div>
                  <span>値候補</span>
                  <strong>{formatCount(group.sample.totalValues)}件</strong>
                </div>
              </div>
              <details className="estat-api-details">
                <summary>{group.label}の候補値を開く</summary>
                <div className="estat-sample-box">
                  <span>{data.source}</span>
                  <strong>{group.tables[0]?.title ?? "統計表候補なし"}</strong>
                  <div className="estat-sample-list">
                    {group.sample.matchedValues.slice(0, 6).map((value, index) => (
                      <div key={`${group.id}-${value.label}-${value.unit}-${value.value}-${index}`}>
                        <span>{value.label}</span>
                        <strong>
                          {formatCount(Number(value.value) || 0)}
                          {value.unit}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function MaffLivestockPanel({
  data,
  error,
  status
}: {
  data: MaffLivestockResponse | null;
  error: string;
  status: ApiLoadStatus;
}) {
  return (
    <section className="panel livestock-api-panel" aria-label="農林水産省 食肉・鶏卵データ">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">食肉・鶏卵データ</h2>
          <span className="panel-subtitle">農林水産省の豚・牛・鶏卵の日別市況をCSV帳票から取得</span>
        </div>
        <span className="panel-meta">{status === "success" ? "取得済み" : "スクレイピング確認"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">農林水産省から豚・牛・鶏卵の日別データを取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">食肉・鶏卵データの取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="livestock-grid">
          {data.groups.map((group) => {
            const samples = getLivestockSampleRows(group);

            return (
              <article className={`livestock-card livestock-${group.kind}`} key={group.kind}>
                <div className="livestock-card-head">
                  <div>
                    <span>{group.dateLabel}</span>
                    <h3>{group.label}</h3>
                  </div>
                  <strong>{formatCount(group.totalRecords)}</strong>
                </div>
                <div className="livestock-metrics">
                  <div>
                    <span>{group.reportAreaLabel}数</span>
                    <strong>{formatCount(group.reports.length)}</strong>
                  </div>
                  <div>
                    <span>取得日候補</span>
                    <strong>{formatCount(group.availableDates.length)}</strong>
                  </div>
                </div>
                <div className="livestock-sample-list">
                  {samples.map(({ areaName, record }, index) => (
                    <div key={`${group.kind}-${areaName}-${index}`}>
                      <span>{areaName} / {getRecordValue(record, ["畜種", "畜種名", "系統名", "魚種名"])}</span>
                      <strong>{getLivestockPrimaryMetric(group, record)}</strong>
                      <small>{getLivestockSecondaryMetric(group, record)}</small>
                    </div>
                  ))}
                </div>
                <p>{group.notice}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ScrapingSchedulePanel({ schedules }: { schedules: ScrapingScheduleItem[] }) {
  const activeCount = schedules.filter((schedule) => schedule.status === "active").length;
  const plannedCount = schedules.filter((schedule) => schedule.status === "planned").length;
  const pausedCount = schedules.filter((schedule) => schedule.status === "paused").length;

  return (
    <section className="panel scraping-schedule-panel" aria-label="スクレイピング取得スケジュール">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">取得スケジュール</h2>
          <span className="panel-subtitle">Pythonが同じ定義を読み、失敗時は再取得、PC/サーバーダウン後は未実行分を取り戻します</span>
        </div>
        <span className="panel-meta">Asia/Tokyo</span>
      </div>
      <div className="schedule-overview">
        <div>
          <span>稼働中</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>実装予定</span>
          <strong>{plannedCount}</strong>
        </div>
        <div>
          <span>停止中</span>
          <strong>{pausedCount}</strong>
        </div>
        <div>
          <span>Python</span>
          <strong>sqlite復旧</strong>
        </div>
      </div>
      <div className="schedule-list">
        {schedules.map((schedule) => (
          <article className={`schedule-row ${schedule.status} priority-${schedule.priority}`} key={schedule.id}>
            <div className="schedule-time">
              {schedule.runTimes.length > 0 ? (
                schedule.runTimes.map((time) => (
                  <strong key={`${schedule.id}-${time}`}>{time}</strong>
                ))
              ) : (
                <strong>停止中</strong>
              )}
              <span>{getNextRunLabel(schedule.runTimes)}</span>
            </div>
            <div className="schedule-main">
              <div>
                <span>{schedule.label} / {schedule.cadence} / {schedule.ownerScreen}</span>
                <h3>{schedule.target}</h3>
              </div>
              <p>{schedule.action}</p>
              <small>{schedule.publishWindow}</small>
              {schedule.note && <small>{schedule.note}</small>}
              <div className="schedule-recovery-grid">
                <div>
                  <span>失敗時</span>
                  <strong>{getRetryLabel(schedule)}</strong>
                  <small>{schedule.failureAction}</small>
                </div>
                <div>
                  <span>ダウン復旧</span>
                  <strong>{schedule.catchUpWithinHours}時間以内</strong>
                  <small>{schedule.recoveryAction}</small>
                </div>
              </div>
            </div>
            <div className="schedule-source">
              <span>{getStatusLabel(schedule.status)} / {schedule.priority}</span>
              <strong>{schedule.source}</strong>
              {schedule.endpoint ? (
                <small>{schedule.method} {schedule.endpoint}</small>
              ) : (
                <small>取得先未設定</small>
              )}
              <small>timeout {schedule.timeoutSeconds}s</small>
            </div>
          </article>
        ))}
      </div>
      <div className="schedule-command-box">
        <span>Python実行例</span>
        <code>python python/data_scheduler.py --loop --region kanto --prefecture tokyo</code>
      </div>
    </section>
  );
}

function LocalArchivePanel({
  data,
  error,
  status
}: {
  data: LocalArchiveStatusResponse | null;
  error: string;
  status: ApiLoadStatus;
}) {
  const jobs = Object.entries(data?.manifest.jobs ?? {}).sort(
    ([, a], [, b]) => (b.lastArchivedAt ?? "").localeCompare(a.lastArchivedAt ?? "")
  );

  return (
    <section className="panel local-archive-panel" aria-label="ローカル長期保存">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">ローカル長期保存</h2>
          <span className="panel-subtitle">
            気象庁の時間別を除き、10年分の生データはローカルに保存。Supabaseには直近1年とAI結果だけを残します
          </span>
        </div>
        <span className="panel-meta">{data?.enabled ? "10年保存" : "停止中"}</span>
      </div>

      {status === "loading" && <div className="api-state-box">ローカル保存設定を確認しています。</div>}
      {status === "error" && <div className="api-state-box error">ローカル保存設定の取得に失敗しました。{error}</div>}

      {status === "success" && data && (
        <div className="local-archive-body">
          <div className="local-archive-grid">
            <div>
              <span>ローカル保持</span>
              <strong>{data.retentionYears}年</strong>
              <small>{data.root}</small>
            </div>
            <div>
              <span>Supabase保持</span>
              <strong>{data.supabaseWindowYears}年</strong>
              <small>画面用集計・AI結果のみ</small>
            </div>
            <div>
              <span>保存済み</span>
              <strong>{formatCount(data.manifest.totals.archives)}件</strong>
              <small>{formatBytes(data.manifest.totals.compressedBytes)} / gzip</small>
            </div>
            <div>
              <span>除外</span>
              <strong>時間別なし</strong>
              <small>{data.excludedData.join(" / ")}</small>
            </div>
          </div>

          <div className="archive-flow">
            <div>
              <span>1</span>
              <strong>Python取得</strong>
              <p>APIデータを定時取得し、成功分をローカルへgzip保存します。</p>
            </div>
            <div>
              <span>2</span>
              <strong>ローカルAI解析</strong>
              <p>10年履歴から需要予測、異常値、前年同月比を計算します。</p>
            </div>
            <div>
              <span>3</span>
              <strong>Web配信</strong>
              <p>Supabaseへ直近1年とスコアだけ保存し、画面は軽く表示します。</p>
            </div>
          </div>

          {jobs.length > 0 ? (
            <div className="archive-job-list">
              {jobs.slice(0, 6).map(([jobId, job]) => (
                <div key={jobId}>
                  <span>{job.label}</span>
                  <strong>{formatCount(job.archives)}件 / {formatBytes(job.compressedBytes)}</strong>
                  <small>{job.lastPath ?? "保存パス未作成"}</small>
                </div>
              ))}
            </div>
          ) : (
            <div className="api-state-box">
              まだローカル保存は実行されていません。<strong>python python/local_archive.py --region kanto --prefecture tokyo</strong> で現在データを保存できます。
            </div>
          )}

          <div className="schedule-command-box archive-command-box">
            <span>ローカル保存の実行例</span>
            <code>python python/data_scheduler.py --loop --region kanto --prefecture tokyo</code>
            <code>python python/local_archive.py --region kanto --prefecture tokyo</code>
          </div>
        </div>
      )}
    </section>
  );
}

function MaffRicePanel({
  data,
  error,
  status
}: {
  data: MaffRiceResponse | null;
  error: string;
  status: ApiLoadStatus;
}) {
  const priceColumn = data ? getRicePriceColumn(data.columns) : "";
  const volumeColumn = data ? getRiceVolumeColumn(data.columns) : "";

  return (
    <section className="panel rice-api-panel" aria-label="農林水産省 米データ">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">米データ</h2>
          <span className="panel-subtitle">農林水産省の相対取引価格・数量CSVを取得</span>
        </div>
        <span className="panel-meta">{status === "success" ? "取得済み" : "CSV確認"}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">農林水産省から米の最新CSVを取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">米データの取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="rice-body">
          <div className="rice-summary-card">
            <span>{data.title}</span>
            <strong>{formatCount(data.totalRecords)}銘柄</strong>
            <p>相対取引価格は主に60kg当たりの価格です。小売価格や家計向け表示には、e-Stat小売物価と組み合わせます。</p>
          </div>
          <div className="rice-sample-grid">
            {data.records.slice(0, 6).map((record, index) => (
              <div key={`${record["産地"]}-${record["品種銘柄"]}-${index}`}>
                <span>{record["産地"]}</span>
                <strong>{record["品種銘柄"]}</strong>
                <small>
                  {priceColumn ? `${record[priceColumn]}円 / 60kg` : "価格未取得"}
                  {volumeColumn ? ` / 数量 ${record[volumeColumn]}` : ""}
                </small>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RiceMarketPanel({
  data,
  error,
  heatmapPeriod,
  onHeatmapPeriodChange,
  onSelectItem,
  status
}: {
  data: MaffRiceResponse | null;
  error: string;
  heatmapPeriod: HeatmapPeriod;
  onHeatmapPeriodChange: (period: HeatmapPeriod) => void;
  onSelectItem: (item: RiceHeatmapItem) => void;
  status: ApiLoadStatus;
}) {
  const selectedPeriod = getHeatmapPeriodOption(heatmapPeriod);
  const priceColumn = data ? getRicePriceColumn(data.columns) : "";
  const volumeColumn = data ? getRiceVolumeColumn(data.columns) : "";
  const heatmapItems = buildRiceHeatmapItems(data);
  const riceRecordCount = data?.records.length ?? 0;

  return (
    <section className="panel heatmap-panel rice-market-panel" aria-label="米ヒートマップ">
      <div className="panel-header heatmap-header">
        <div>
          <h2 className="panel-title">米ヒートマップ</h2>
          <span className="panel-subtitle">
            面積は{selectedPeriod.volumeLabel}に換算した取引数量、色は{selectedPeriod.metricLabel}の価格シグナル。銘柄別の米コストを見ます。
          </span>
        </div>
        <div className="heatmap-toolbar">
          <HeatmapPeriodTabs
            heatmapPeriod={heatmapPeriod}
            label="米ヒートマップ期間"
            onHeatmapPeriodChange={onHeatmapPeriodChange}
          />
          <div className="heatmap-legend" aria-label="米ヒートマップ凡例">
            <span><i className="legend-green" />価格安・買い時</span>
            <span><i className="legend-red" />価格高・高騰</span>
            <span><i className="legend-blue" />横ばい</span>
            <span><i className="legend-amber" />数量減注意</span>
          </div>
        </div>
      </div>

      {status === "loading" && (
        <div className="api-state-box">農林水産省から米の最新CSVを取得しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">米データの取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <div className="rice-market-body">
          <div className="rice-market-summary">
            <div className="rice-market-main">
              <span>{data.title} / 全件表示</span>
              <strong>{formatCount(heatmapItems.length)}件</strong>
              <p>
                CSVから取得できた{formatCount(riceRecordCount)}行を絞り込まず全件ヒートマップ化します。価格未取得の行は灰色で残し、数量が平均より多い銘柄を大きく、価格が下がっている銘柄を緑で表示します。
              </p>
            </div>
            <div>
              <span>API総件数</span>
              <strong>{formatCount(data.totalRecords)}件</strong>
            </div>
            <div>
              <span>価格列</span>
              <strong>{priceColumn || "未取得"}</strong>
            </div>
            <div>
              <span>数量列</span>
              <strong>{volumeColumn || "未取得"}</strong>
            </div>
          </div>

          <div className="market-heatmap rice-market-heatmap" aria-label="米の銘柄別ヒートマップ">
            {heatmapItems.map((item) => {
              const priceChange = getRicePeriodPriceChange(item, heatmapPeriod);
              const volumeChange = getRicePeriodVolumeChange(item, heatmapPeriod);
              const size = getRiceTileSize(item, heatmapPeriod);
              const sizeClass = `size-col-${size.columns} size-row-${size.rows}`;
              const tone = getRicePeriodTone(item, heatmapPeriod);

              return (
                <button
                  aria-label={`${item.origin} ${item.brand}の米価格グラフを開く`}
                  className={`heatmap-tile rice-heatmap-tile ${toneClass[tone]} ${sizeClass}`}
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  type="button"
                >
                  <span>{item.origin}</span>
                  <strong>{item.brand}</strong>
                  <em>{formatPercent(priceChange)}</em>
                  <small>
                    数量 {formatPercent(volumeChange)} / {item.priceLabel} / {item.quantityLabel}
                  </small>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}

type WeatherMoneyFlowStage = {
  change: number;
  id: string;
  label: string;
  metric: string;
  note: string;
  source: string;
  tone: Tone;
  value: string;
};

type CategoryFlowCellId = "production" | "supply" | "procurement" | "household";

type CategoryFlowCell = {
  change: number;
  id: CategoryFlowCellId;
  label: string;
  note: string;
  source: string;
  tone: Tone;
  value: string;
};

type CategoryFlowCategory = {
  basis: string;
  cells: CategoryFlowCell[];
  group: string;
  id: string;
  label: string;
  summary: string;
};

type CategoryFlowSelection = {
  category: CategoryFlowCategory;
  cell: CategoryFlowCell;
};

function averageNumber(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function weightedAverageNumber(values: Array<{ value: number; weight: number }>) {
  const validValues = values.filter(
    (item) => Number.isFinite(item.value) && Number.isFinite(item.weight) && item.weight > 0
  );
  if (validValues.length === 0) return 0;

  const totalWeight = validValues.reduce((total, item) => total + item.weight, 0);
  if (totalWeight <= 0) return 0;

  return validValues.reduce((total, item) => total + item.value * item.weight, 0) / totalWeight;
}

function getPublicDataTableTotal(data: PublicDataResponse | null) {
  return data?.groups.reduce((total, group) => total + group.totalTables, 0) ?? 0;
}

function getPublicDataValueTotal(data: PublicDataResponse | null) {
  return data?.groups.reduce((total, group) => total + group.sample.matchedValues.length, 0) ?? 0;
}

function getStatusDisplayLabel(status: ApiLoadStatus) {
  if (status === "success") return "\u53d6\u5f97\u6e08\u307f";
  if (status === "loading") return "\u53d6\u5f97\u4e2d";
  if (status === "error") return "\u88dc\u5b8c\u8868\u793a";
  return "\u5f85\u6a5f\u4e2d";
}

function getStatusTone(status: ApiLoadStatus): Tone {
  if (status === "success") return "green";
  if (status === "loading") return "blue";
  if (status === "error") return "amber";
  return "slate";
}

function getFlowSupplyTone(change: number): Tone {
  if (change >= 8) return "green";
  if (change >= 2) return "blue";
  if (change <= -10) return "red";
  if (change <= -4) return "amber";
  return "slate";
}

function getFlowCostTone(change: number): Tone {
  if (change >= 8) return "red";
  if (change >= 3) return "amber";
  if (change <= -5) return "green";
  if (change <= -1) return "blue";
  return "slate";
}

function getWeatherMoneyFlowSignal(data: JmaWeatherResponse | null, region: RegionProfile) {
  const forecastTemperatures = parseWeatherNumbers(data?.forecast.temperatures ?? []);
  const observationTemperatures = parseWeatherNumbers(
    data?.observations.map((observation) => observation.temperature) ?? []
  );
  const temperatures = forecastTemperatures.length > 0 ? forecastTemperatures : observationTemperatures;
  const pops = parseWeatherNumbers(data?.forecast.precipitationProbabilities ?? []);
  const lastObservation = data?.observations[data.observations.length - 1];
  const latestRain24h = lastObservation?.precipitation24h ?? 0;
  const averageTemperature = averageWeatherValue(temperatures, lastObservation?.temperature ?? 21);
  const averagePop = averageWeatherValue(pops, 30);
  const heatSignal =
    averageTemperature >= 24 ||
    region.weatherLabel.includes("\u9ad8\u6e29") ||
    region.weatherLabel.includes("\u84b8\u3057") ||
    region.weatherLabel.includes("\u65e5\u7167");
  const rainSignal = averagePop >= 40 || latestRain24h >= 10 || region.weatherLabel.includes("\u96e8");
  const lowTemperatureSignal = averageTemperature <= 12 || region.weatherLabel.includes("\u4f4e\u6e29");

  if (heatSignal) {
    return {
      averagePop: Math.round(averagePop),
      averageTemperature: Math.round(averageTemperature * 10) / 10,
      householdChange: 7,
      householdNote: "\u51b7\u305f\u3044\u98df\u54c1\u30fb\u98f2\u6599\u30fb\u5373\u98df\u9700\u8981\u304c\u4f38\u3073\u3001\u5bb6\u8a08\u652f\u51fa\u306f\u98df\u54c1\u5185\u3067\u504f\u308a\u3084\u3059\u3044",
      label: "\u9ad8\u6e29\u30b7\u30b0\u30ca\u30eb",
      productionChange: -6,
      productionNote: "\u8449\u7269\u30fb\u679c\u83dc\u306f\u54c1\u8cea\u52a3\u5316\u3068\u524d\u5012\u3057\u51fa\u8377\u306b\u6ce8\u610f",
      tone: "amber" as Tone
    };
  }

  if (rainSignal) {
    return {
      averagePop: Math.round(averagePop),
      averageTemperature: Math.round(averageTemperature * 10) / 10,
      householdChange: -3,
      householdNote: "\u5916\u51fa\u6e1b\u3067\u5916\u98df\u30fb\u8cb7\u3044\u56de\u308a\u306f\u920d\u308a\u3001\u5bb6\u5ead\u5185\u306e\u7c21\u4fbf\u98df\u306b\u5bc4\u308a\u3084\u3059\u3044",
      label: "\u964d\u6c34\u30b7\u30b0\u30ca\u30eb",
      productionChange: -5,
      productionNote: "\u53ce\u7a6b\u30fb\u7269\u6d41\u306e\u9045\u308c\u3067\u4f9b\u7d66\u304c\u8aad\u307f\u306b\u304f\u3044",
      tone: "blue" as Tone
    };
  }

  if (lowTemperatureSignal) {
    return {
      averagePop: Math.round(averagePop),
      averageTemperature: Math.round(averageTemperature * 10) / 10,
      householdChange: 4,
      householdNote: "\u934b\u30fb\u6e29\u98df\u30fb\u7c73\u98ef\u7cfb\u306b\u5bc4\u308a\u3001\u91ce\u83dc\u3068\u8089\u306e\u7d44\u307f\u5408\u308f\u305b\u9700\u8981\u304c\u51fa\u3084\u3059\u3044",
      label: "\u4f4e\u6e29\u30b7\u30b0\u30ca\u30eb",
      productionChange: -4,
      productionNote: "\u751f\u80b2\u9045\u308c\u3068\u5358\u4fa1\u4e0a\u6607\u306e\u53ef\u80fd\u6027\u3092\u78ba\u8a8d",
      tone: "amber" as Tone
    };
  }

  return {
    averagePop: Math.round(averagePop),
    averageTemperature: Math.round(averageTemperature * 10) / 10,
    householdChange: 1,
    householdNote: "\u5bb6\u8a08\u306f\u4fa1\u683c\u5dee\u3068\u732e\u7acb\u983b\u5ea6\u3067\u52d5\u304d\u3084\u3059\u3044",
    label: "\u5e73\u5e74\u4e26\u307f\u30b7\u30b0\u30ca\u30eb",
    productionChange: 2,
    productionNote: "\u751f\u7523\u30fb\u51fa\u8377\u306f\u5927\u304d\u306a\u5d29\u308c\u304c\u5c11\u306a\u3044\u60f3\u5b9a",
    tone: "green" as Tone
  };
}

function buildCategoryFlowTrend(change: number, cellId: CategoryFlowCellId): PricePoint[] {
  const volatility = cellId === "procurement" ? 1.15 : cellId === "household" ? 1.05 : 0.9;
  const cellSeed = Array.from(cellId).reduce((total, char) => total + char.charCodeAt(0), 0);
  const comparisonChange = clampNumber(change * 0.38, -24, 32);

  return Array.from({ length: 24 }, (_, index) => {
    const monthsBack = 23 - index;
    const label =
      monthsBack === 23
        ? "\u7d042\u5e74\u524d"
        : monthsBack === 12
          ? "\u7d041\u5e74\u524d"
          : monthsBack === 0
            ? "\u4eca\u6708"
            : `${monthsBack}\u304b\u6708\u524d`;
    const progress = index / 23;
    const seasonal = Math.sin((index + (cellSeed % 12)) * (Math.PI * 2 / 12)) * volatility * 1.4;
    const smallWave = Math.cos((index + (cellSeed % 5)) * 0.75) * volatility * 0.55;
    const currentValue = 100 + change * progress + seasonal + smallWave;
    const lastYearValue = 100 + comparisonChange * progress + seasonal * 0.34 + smallWave * 0.45;

    return {
      current: currentValue,
      label,
      lastYear: lastYearValue,
      normal: 100
    };
  });
}

function getCategoryFlowModalToneLabel(cell: CategoryFlowCell) {
  if (cell.id === "production" || cell.id === "supply") {
    if (cell.tone === "green" || cell.tone === "blue") return "\u4f9b\u7d66\u4f59\u529b";
    if (cell.tone === "red" || cell.tone === "amber") return "\u4f9b\u7d66\u6ce8\u610f";
    return "\u6bd4\u8f03\u78ba\u8a8d";
  }

  if (cell.tone === "green" || cell.tone === "blue") return "\u8ca0\u62c5\u4f4e\u4e0b";
  if (cell.tone === "red" || cell.tone === "amber") return "\u8ca0\u62c5\u4e0a\u6607";
  return "\u6bd4\u8f03\u78ba\u8a8d";
}

function CategoryFlowTrendModal({
  onClose,
  periodLabel,
  selection
}: {
  onClose: () => void;
  periodLabel: string;
  selection: CategoryFlowSelection;
}) {
  const trend = buildCategoryFlowTrend(selection.cell.change, selection.cell.id);
  const range = getPriceRange(trend);
  const latest = trend[trend.length - 1];
  const latestX = getPriceTrendLabelX(trend.length - 1, trend.length);
  const latestY = 32 + ((range.max - latest.current) / Math.max(1, range.max - range.min)) * 188;
  const axisValues = [
    range.max,
    Math.round((range.max + range.min) / 2),
    range.min
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        aria-label={selection.category.label + " / " + selection.cell.label + "\u306e\u63a8\u79fb\u30b0\u30e9\u30d5"}
        aria-modal="true"
        className="price-modal category-flow-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className={`badge ${toneClass[selection.cell.tone]}`}>{getCategoryFlowModalToneLabel(selection.cell)}</span>
            <h2>{selection.category.label + " / " + selection.cell.label}</h2>
            <p>{selection.category.group + " / " + periodLabel + "\u306e\u5909\u5316 / 2\u5e74\u63a8\u79fb"}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} type="button">
            {"\u9589\u3058\u308b"}
          </button>
        </div>

        <div className="modal-summary-grid">
          <div>
            <span>{"\u5206\u985e"}</span>
            <strong>{selection.category.label}</strong>
            <small>{selection.category.group}</small>
          </div>
          <div>
            <span>{"\u6307\u6a19"}</span>
            <strong>{selection.cell.label}</strong>
            <small>{selection.cell.source}</small>
          </div>
          <div>
            <span>{"\u5909\u5316"}</span>
            <strong className={selection.cell.change > 0 ? "up-value" : "down-value"}>{selection.cell.value}</strong>
            <small>{"\u73fe\u5728\u5024"}</small>
          </div>
          <div>
            <span>{"\u8868\u793a\u671f\u9593"}</span>
            <strong>{"2\u5e74"}</strong>
            <small>{"24\u304b\u6708\u306e\u6708\u6b21\u63a8\u79fb"}</small>
          </div>
        </div>

        <div className="modal-chart-panel">
          <div className="modal-chart-heading">
            <h3>{"\u63a8\u79fb\u30b0\u30e9\u30d5\uff082\u5e74\uff09"}</h3>
            <span>{"\u6307\u6570 100=\u6bd4\u8f03\u57fa\u6e96"}</span>
          </div>
          <svg viewBox="0 0 640 270" role="img" aria-label={selection.category.label + " / " + selection.cell.label + "\u306e\u63a8\u79fb\u30b0\u30e9\u30d5"}>
            <rect x="0" y="0" width="640" height="270" fill="#ffffff" />
            {[32, 126, 220].map((y) => (
              <line key={y} x1="56" x2="596" y1={y} y2={y} stroke="#e5ebe6" />
            ))}
            <g className="chart-labels">
              {axisValues.map((value, index) => (
                <text key={value} x="10" y={36 + index * 94}>{formatCount(Math.round(value))}</text>
              ))}
              {trend.map((point, index) =>
                shouldShowPriceTrendLabel(index, trend.length) ? (
                  <text key={point.label} textAnchor="middle" x={getPriceTrendLabelX(index, trend.length)} y="248">{point.label}</text>
                ) : null
              )}
            </g>
            <polyline className="series normal-line" points={buildDynamicPolyline(trend, "normal", range)} />
            <polyline className="series last-line" points={buildDynamicPolyline(trend, "lastYear", range)} />
            <polyline className="series now-line" points={buildDynamicPolyline(trend, "current", range)} />
            <circle cx={latestX} cy={latestY} fill="#1f7a52" r="6" />
          </svg>
          <div className="legend">
            <span><i className="line-now" />{"\u73fe\u5728\u63a8\u79fb"}</span>
            <span><i className="line-last" />{"\u524d\u5e74\u57fa\u6e96"}</span>
            <span><i className="line-normal" />{"\u5e73\u5e74\u57fa\u6e96"}</span>
          </div>
        </div>

        <div className="modal-action-box">
          <strong>{"\u8a08\u7b97\u6839\u62e0"}</strong>
          <p>{selection.category.basis}</p>
        </div>

        <div className="modal-action-box">
          <strong>{"\u78ba\u8a8d\u30c7\u30fc\u30bf"}</strong>
          <p>{selection.cell.source + "\u3002" + selection.cell.note}</p>
        </div>

        <div className="modal-action-box">
          <strong>{"\u5c65\u6b74\u30c7\u30fc\u30bf"}</strong>
          <p>{"\u73fe\u5728\u306f\u53d6\u5f97\u6e08\u307f\u5909\u5316\u7387\u309224\u304b\u6708\u306e\u6307\u6570\u63a8\u79fb\u306b\u5c55\u958b\u3057\u3066\u8868\u793a\u3057\u3066\u3044\u307e\u3059\u3002DB\u306b\u5c65\u6b74\u304c\u84c4\u7a4d\u3055\u308c\u308b\u3068\u5b9f\u6e2c\u63a8\u79fb\u3078\u5dee\u3057\u66ff\u3048\u307e\u3059\u3002"}</p>
        </div>
      </section>
    </div>
  );
}

function WeatherMoneyFlowPanel({
  featuredItems,
  heatmapPeriod,
  householdData,
  items,
  maffLivestockData,
  maffRiceData,
  householdStatus,
  jmaWeatherData,
  jmaWeatherStatus,
  productionData,
  productionStatus,
  region
}: {
  featuredItems: WholesaleItem[];
  heatmapPeriod: HeatmapPeriod;
  householdData: PublicDataResponse | null;
  items: WholesaleItem[];
  maffLivestockData: MaffLivestockResponse | null;
  maffRiceData: MaffRiceResponse | null;
  householdStatus: ApiLoadStatus;
  jmaWeatherData: JmaWeatherResponse | null;
  jmaWeatherStatus: ApiLoadStatus;
  productionData: PublicDataResponse | null;
  productionStatus: ApiLoadStatus;
  region: RegionProfile;
}) {
  const [selectedCategoryFlow, setSelectedCategoryFlow] = useState<CategoryFlowSelection | null>(null);
  const period = getHeatmapPeriodOption(heatmapPeriod);
  const weather = getWeatherMoneyFlowSignal(jmaWeatherData, region);
  const supplyChange = Math.round(
    weightedAverageNumber(
      featuredItems.map((item) => ({
        value: getHeatmapVolumeChange(item, heatmapPeriod),
        weight: getWholesaleQuantityWeight(item)
      }))
    )
  );
  const priceChange = Math.round(
    weightedAverageNumber(
      featuredItems.map((item) => ({
        value: getHeatmapPriceChange(item, heatmapPeriod),
        weight: getWholesaleQuantityWeight(item)
      }))
    )
  );
  const productionChange = clampNumber(supplyChange, -18, 18);
  const householdPressure = clampNumber(
    Math.round(weather.householdChange + Math.max(0, priceChange) * 0.55 + Math.min(0, supplyChange) * -0.18),
    -12,
    22
  );
  const productionTables = getPublicDataTableTotal(productionData);
  const householdValues = getPublicDataValueTotal(householdData);
  const watchedItems = featuredItems.slice(0, 3).map((item) => item.name).join("\u30fb");

  const stages: WeatherMoneyFlowStage[] = [
    {
      change: productionChange,
      id: "production",
      label: "\u751f\u7523\u91cf",
      metric: period.label + "\u306e\u751f\u7523\u30fb\u51fa\u8377",
      note: "\u5929\u5019\u88dc\u6b63\u306f\u639b\u3051\u305a\u3001\u5165\u8377\u91cf\u306e\u6570\u91cf\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523\u30fb\u51fa\u8377\u306e\u4ee3\u7406\u6307\u6a19\u3068\u3057\u3066\u78ba\u8a8d",
      source: productionTables > 0 ? "e-Stat\u5019\u88dc " + formatCount(productionTables) + "\u8868 / \u5165\u8377\u91cf\u52a0\u91cd" : "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf\uff08\u751f\u7523\u4ee3\u7406\uff09",
      tone: getFlowSupplyTone(productionChange),
      value: formatPercent(productionChange)
    },
    {
      change: supplyChange,
      id: "supply",
      label: "\u4f9b\u7d66\u91cf",
      metric: period.label + "\u306e\u5165\u8377",
      note: watchedItems ? watchedItems + "\u3092\u4e2d\u5fc3\u306b\u5165\u8377\u91cf\u3092\u6bd4\u8f03" : "\u5730\u57df\u6ce8\u76ee\u54c1\u76ee\u306e\u5165\u8377\u91cf\u3092\u6bd4\u8f03",
      source: "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf",
      tone: getFlowSupplyTone(supplyChange),
      value: formatPercent(supplyChange)
    },
    {
      change: priceChange,
      id: "procurement",
      label: "\u4ed5\u5165\u308c\u4fa1\u683c",
      metric: period.label + "\u306e\u4e2d\u5024",
      note: priceChange >= 0 ? "\u4ed5\u5165\u308c\u5358\u4fa1\u306e\u4e0a\u632f\u308c\u3092\u58f2\u4fa1\u30fb\u7c97\u5229\u3067\u78ba\u8a8d" : "\u4e0b\u304c\u3063\u305f\u54c1\u76ee\u306f\u8ca9\u4fc3\u5019\u88dc\u3068\u3057\u3066\u78ba\u8a8d",
      source: "\u5378\u58f2\u5e02\u5834 \u4e2d\u5024",
      tone: getFlowCostTone(priceChange),
      value: formatPercent(priceChange)
    },
    {
      change: householdPressure,
      id: "household",
      label: "\u5bb6\u8a08",
      metric: "\u652f\u51fa\u5727\u529b",
      note: weather.householdNote,
      source: householdValues > 0 ? "\u5bb6\u8a08\u5019\u88dc " + formatCount(householdValues) + "\u4ef6" : "\u5bb6\u8a08\u8abf\u67fbAPI\u3092\u78ba\u8a8d\u4e2d",
      tone: getFlowCostTone(householdPressure),
      value: formatPercent(householdPressure)
    }
  ];

  const riceItems = buildRiceHeatmapItems(maffRiceData);
  const livestockItems = buildLivestockBoardItems(maffLivestockData);
  const getWholesaleCategoryFlow = (department: Department) => {
    const categoryItems = items.filter((item) => item.department === department);
    const weightedItems = categoryItems.map((item) => ({
      item,
      weight: getWholesaleQuantityWeight(item)
    }));

    return {
      price: Math.round(
        weightedAverageNumber(
          weightedItems.map(({ item, weight }) => ({
            value: getHeatmapPriceChange(item, heatmapPeriod),
            weight
          }))
        )
      ),
      supply: Math.round(
        weightedAverageNumber(
          weightedItems.map(({ item, weight }) => ({
            value: getHeatmapVolumeChange(item, heatmapPeriod),
            weight
          }))
        )
      )
    };
  };
  const getLivestockCategoryFlow = (kinds: MaffLivestockKind[]) => {
    const categoryItems = livestockItems.filter((item) => kinds.includes(item.kind));
    const quantityItems = categoryItems
      .map((item) => ({ item, quantity: getLivestockQuantityValue(item) }))
      .filter(({ quantity }) => quantity > 0);
    const averageQuantity = averageNumber(quantityItems.map(({ quantity }) => quantity));
    const getWeight = (item: LivestockBoardItem) => Math.max(1, getLivestockQuantityValue(item));

    return {
      price: Math.round(
        weightedAverageNumber(
          categoryItems.map((item) => ({
            value: getLivestockPeriodPriceChange(item, heatmapPeriod),
            weight: getWeight(item)
          }))
        )
      ),
      supply: Math.round(
        weightedAverageNumber(
          categoryItems.map((item) => ({
            value: getLivestockVolumeSignal(item, averageQuantity, heatmapPeriod),
            weight: getWeight(item)
          }))
        )
      )
    };
  };
  const riceFlow = {
    price: Math.round(
      weightedAverageNumber(
        riceItems.map((item) => ({
          value: getRicePeriodPriceChange(item, heatmapPeriod),
          weight: item.hasPrice ? Math.max(1, item.volume) : 0
        }))
      )
    ),
    supply: Math.round(
      weightedAverageNumber(
        riceItems.map((item) => ({
          value: getRicePeriodVolumeChange(item, heatmapPeriod),
          weight: Math.max(1, item.volume)
        }))
      )
    )
  };
  const wheatFlow = {
    price: wheatMarketProfile.salePriceChangeRate,
    supply: 0
  };
  const meatFlow = getLivestockCategoryFlow(["pork", "beef"]);
  const eggFlow = getLivestockCategoryFlow(["egg"]);
  const vegetableFlow = getWholesaleCategoryFlow("vegetable");
  const fruitFlow = getWholesaleCategoryFlow("fruit");
  const getCategoryProductionChange = (baseSupply: number) =>
    clampNumber(Math.round(baseSupply), -18, 18);
  const getCategoryHouseholdChange = (basePrice: number, baseSupply: number, extra = 0) =>
    clampNumber(
      Math.round(weather.householdChange + Math.max(0, basePrice) * 0.45 + Math.min(0, baseSupply) * -0.12 + extra),
      -12,
      24
    );
  const makeCategoryCells = ({
    production,
    supply,
    price,
    household,
    productionNote,
    supplyNote,
    priceNote,
    householdNote,
    productionSource,
    supplySource,
    priceSource,
    householdSource
  }: {
    household: number;
    householdNote: string;
    householdSource: string;
    price: number;
    priceNote: string;
    priceSource: string;
    production: number;
    productionNote: string;
    productionSource: string;
    supply: number;
    supplyNote: string;
    supplySource: string;
  }): CategoryFlowCell[] => [
    {
      change: production,
      id: "production",
      label: "\u751f\u7523\u91cf",
      note: productionNote,
      source: productionSource,
      tone: getFlowSupplyTone(production),
      value: formatPercent(production)
    },
    {
      change: supply,
      id: "supply",
      label: "\u4f9b\u7d66\u91cf",
      note: supplyNote,
      source: supplySource,
      tone: getFlowSupplyTone(supply),
      value: formatPercent(supply)
    },
    {
      change: price,
      id: "procurement",
      label: "\u4ed5\u5165\u308c\u4fa1\u683c",
      note: priceNote,
      source: priceSource,
      tone: getFlowCostTone(price),
      value: formatPercent(price)
    },
    {
      change: household,
      id: "household",
      label: "\u5bb6\u8a08/\u7d71\u8a08",
      note: householdNote,
      source: householdSource,
      tone: getFlowCostTone(household),
      value: formatPercent(household)
    }
  ];
  const categoryFlows: CategoryFlowCategory[] = [
    {
      id: "rice",
      group: "\u4e3b\u98df",
      label: "\u30b3\u30e1",
      summary: "\u7c73\u4fa1\u30fb\u6570\u91cf\u30fb\u5bb6\u5ead\u5185\u98df\u306e\u5909\u5316\u3092\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u7c73CSV\u306e\u53d6\u5f15\u6570\u91cf\u3092\u91cd\u307f\u306b\u3057\u3066\u3001\u4fa1\u683c\u5909\u5316\u7387\u3068\u6570\u91cf\u5909\u5316\u7387\u3092\u52a0\u91cd\u5e73\u5747\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(riceFlow.price, riceFlow.supply, -1),
        householdNote: "\u4e3b\u98df\u9700\u8981\u3068\u5916\u98df\u30fb\u7c21\u4fbf\u98df\u306e\u52d5\u304d\u3092\u78ba\u8a8d",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u7c73\u5019\u88dc",
        price: riceFlow.price,
        priceNote: "\u76f8\u5bfe\u53d6\u5f15\u4fa1\u683c\u30fb60kg\u4fa1\u683c\u3092\u78ba\u8a8d",
        priceSource: "\u8fb2\u6c34\u7701 \u7c73CSV",
        production: getCategoryProductionChange(riceFlow.supply),
        productionNote: "\u53d6\u5f15\u6570\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523\u30fb\u51fa\u8377\u306e\u4ee3\u7406\u6307\u6a19\u3068\u3057\u3066\u78ba\u8a8d",
        productionSource: "\u8fb2\u6c34\u7701 \u7c73\u6570\u91cf / \u52a0\u91cd\u5e73\u5747",
        supply: riceFlow.supply,
        supplyNote: "\u6570\u91cf\u304c\u5e73\u5747\u3088\u308a\u591a\u3044\u9298\u67c4\u3092\u78ba\u8a8d",
        supplySource: "\u8fb2\u6c34\u7701 \u7c73\u6570\u91cf"
      })
    },
    {
      id: "wheat",
      group: "\u4e3b\u98df",
      label: "\u5c0f\u9ea6",
      summary: "\u30d1\u30f3\u30fb\u9eba\u30fb\u7c89\u3082\u306e\u9700\u8981\u3092\u5bb6\u8a08\u3068\u4fa1\u683c\u3067\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u4ed5\u5165\u308c\u4fa1\u683c\u306f\u8f38\u5165\u5c0f\u9ea6\u653f\u5e9c\u58f2\u6e21\u4fa1\u683c\u306e\u5bfe\u524d\u671f\u6bd4\u3092\u4e3b\u6307\u6a19\u3002\u56fd\u518516%\u30fb\u8f38\u5165\u7d048\u5272\u3092\u5225\u6307\u6a19\u3067\u7ba1\u7406\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(wheatFlow.price, wheatFlow.supply, -1),
        householdNote: "\u30d1\u30f3\u30fb\u9eba\u306f\u6c17\u6e29\u3068\u5bb6\u8a08\u306e\u7bc0\u7d04\u884c\u52d5\u3067\u5909\u52d5",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u30d1\u30f3\u5019\u88dc",
        price: wheatFlow.price,
        priceNote: wheatMarketProfile.salePriceEffectivePeriod + "\u306e\u653f\u5e9c\u58f2\u6e21\u4fa1\u683c " + formatCount(wheatMarketProfile.salePriceYenPerTon) + "\u5186\/t\uff08\u5bfe\u524d\u671f " + formatPercent(wheatMarketProfile.salePriceChangeRate) + "\uff09",
        priceSource: "\u8f38\u5165\u5c0f\u9ea6\u653f\u5e9c\u58f2\u6e21\u4fa1\u683c / \u66f4\u65b0\u65e5 " + wheatMarketProfile.salePricePublishedAt,
        production: getCategoryProductionChange(wheatFlow.supply),
        productionNote: "\u56fd\u5185\u751f\u7523\u91cf " + formatCount(wheatMarketProfile.domesticProductionTons) + "t / \u56fd\u5185\u6d88\u8cbb\u4ed5\u5411\u91cf " + formatCount(wheatMarketProfile.domesticConsumptionTons) + "t",
        productionSource: "\u98df\u6599\u9700\u7d66\u8868 \u4ee4\u548c6\u5e74\u5ea6 / \u81ea\u7d66\u7387 " + wheatMarketProfile.domesticSelfSufficiencyRate + "%",
        supply: wheatFlow.supply,
        supplyNote: "\u5e73\u5747\u6d41\u901a\u91cf\u306f\u56fd\u5185\u7523 " + formatCount(wheatMarketProfile.domesticFlowTons) + "t\u3001\u5916\u56fd\u7523 " + formatCount(wheatMarketProfile.importFlowTons) + "t",
        supplySource: "\u8fb2\u6797\u6c34\u7523\u7701 / \u8f38\u5165\u5272\u5408 \u7d04" + wheatMarketProfile.importShareRate + "%"
      })
    },
    {
      id: "meat",
      group: "\u751f\u9bae",
      label: "\u8089",
      summary: "\u725b\u30fb\u8c5a\u306e\u6210\u7acb\u982d\u6570\u3068\u5e02\u5834\u4fa1\u683c\u3092\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u725b\u30fb\u8c5a\u306e\u6210\u7acb\u982d\u6570\u3092\u91cd\u307f\u306b\u3057\u3066\u3001\u5e02\u5834\u4fa1\u683c\u5dee\u3068\u4f9b\u7d66\u30b7\u30b0\u30ca\u30eb\u3092\u52a0\u91cd\u5e73\u5747\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(meatFlow.price, meatFlow.supply, 1),
        householdNote: "\u5916\u98df\u30fb\u60e3\u83dc\u30fb\u9031\u672b\u9700\u8981\u306e\u4e0a\u632f\u308c\u3092\u78ba\u8a8d",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u8089\u985e\u5019\u88dc",
        price: meatFlow.price,
        priceNote: "\u5e73\u5747\u4fa1\u683c\u3068\u6210\u7acb\u982d\u6570\u306e\u30ba\u30ec\u3092\u898b\u308b",
        priceSource: "\u8fb2\u6c34\u7701 \u98df\u8089\u5e02\u5834",
        production: getCategoryProductionChange(meatFlow.supply),
        productionNote: "\u6210\u7acb\u982d\u6570\u30fb\u5165\u8377\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523\u30fb\u4f9b\u7d66\u306e\u4ee3\u7406\u3068\u3057\u3066\u78ba\u8a8d",
        productionSource: "\u98df\u8089\u5e02\u5834 \u6570\u91cf\u52a0\u91cd",
        supply: meatFlow.supply,
        supplyNote: "\u6210\u7acb\u982d\u6570\u304c\u5897\u3048\u305f\u5e02\u5834\u306f\u8abf\u9054\u5019\u88dc",
        supplySource: "\u6210\u7acb\u982d\u6570"
      })
    },
    {
      id: "egg",
      group: "\u65e5\u914d",
      label: "\u5375",
      summary: "\u5165\u8377\u91cf\u30fbM\u4e2d\u5024\u30fb\u671d\u98df\u9700\u8981\u3092\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u9d8f\u5375\u306e\u5165\u8377\u91cf\u3092\u91cd\u307f\u306b\u3057\u3066\u3001M\u4e2d\u5024\u306a\u3069\u306e\u4fa1\u683c\u5dee\u3068\u4f9b\u7d66\u30b7\u30b0\u30ca\u30eb\u3092\u52a0\u91cd\u5e73\u5747\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(eggFlow.price, eggFlow.supply, 0),
        householdNote: "\u671d\u98df\u30fb\u60e3\u83dc\u30fb\u30d9\u30fc\u30ab\u30ea\u30fc\u9700\u8981\u3068\u5358\u4fa1\u3092\u78ba\u8a8d",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u5375\u5019\u88dc",
        price: eggFlow.price,
        priceNote: "M\u4e2d\u5024\u3068\u5165\u8377\u91cf\u3092\u4e26\u3079\u3066\u78ba\u8a8d",
        priceSource: "\u8fb2\u6c34\u7701 \u9d8f\u5375\u5e02\u6cc1",
        production: getCategoryProductionChange(eggFlow.supply),
        productionNote: "\u5165\u8377\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u4f9b\u7d66\u5074\u306e\u4ee3\u7406\u3068\u3057\u3066\u78ba\u8a8d",
        productionSource: "\u9d8f\u5375\u5e02\u6cc1 \u6570\u91cf\u52a0\u91cd",
        supply: eggFlow.supply,
        supplyNote: "\u5165\u8377\u91cf\u3068\u898f\u683c\u5225\u4fa1\u683c\u3092\u78ba\u8a8d",
        supplySource: "\u9d8f\u5375\u5165\u8377\u91cf"
      })
    },
    {
      id: "vegetable",
      group: "\u9752\u679c",
      label: "\u91ce\u83dc",
      summary: "\u5929\u5019\u306e\u5f71\u97ff\u304c\u51fa\u3084\u3059\u3044\u8449\u7269\u30fb\u679c\u83dc\u3092\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u5378\u58f2\u5e02\u5834\u306e\u5165\u8377\u91cf\u3092\u91cd\u307f\u306b\u3057\u3066\u4e2d\u5024\u5909\u5316\u7387\u3092\u52a0\u91cd\u5e73\u5747\u3002\u6570\u91cf\u672a\u53d6\u5f97\u54c1\u76ee\u306f\u76f8\u5bfe\u91cd\u307f\u3067\u88dc\u5b8c\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(vegetableFlow.price, vegetableFlow.supply, 3),
        householdNote: "\u4fa1\u683c\u4e0a\u6607\u6642\u306f\u8cb7\u3044\u63a7\u3048\u30fb\u4ee3\u66ff\u54c1\u9700\u8981\u3092\u78ba\u8a8d",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u91ce\u83dc\u5019\u88dc",
        price: vegetableFlow.price,
        priceNote: "\u4e2d\u5024\u3068\u524d\u5e74\u540c\u6708\u6bd4\u3067\u4ed5\u5165\u308c\u5727\u529b\u3092\u78ba\u8a8d",
        priceSource: "\u5378\u58f2\u5e02\u5834 \u4e2d\u5024",
        production: getCategoryProductionChange(vegetableFlow.supply),
        productionNote: "\u5165\u8377\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523\u30fb\u51fa\u8377\u5074\u306e\u4ee3\u7406\u3068\u3057\u3066\u78ba\u8a8d",
        productionSource: "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf / \u52a0\u91cd\u5e73\u5747",
        supply: vegetableFlow.supply,
        supplyNote: "\u5165\u8377\u91cf\u304c\u591a\u3044\u54c1\u76ee\u306f\u8ca9\u4fc3\u5019\u88dc",
        supplySource: "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf"
      })
    },
    {
      id: "fruit",
      group: "\u9752\u679c",
      label: "\u679c\u7269",
      summary: "\u9ad8\u6e29\u6642\u306e\u51b7\u3084\u3057\u9700\u8981\u3068\u5165\u8377\u91cf\u3092\u78ba\u8a8d",
      basis: "\u8a08\u7b97\u6839\u62e0: \u5378\u58f2\u5e02\u5834\u306e\u5165\u8377\u91cf\u3092\u91cd\u307f\u306b\u3057\u3066\u4e2d\u5024\u5909\u5316\u7387\u3092\u52a0\u91cd\u5e73\u5747\u3002\u6570\u91cf\u672a\u53d6\u5f97\u54c1\u76ee\u306f\u76f8\u5bfe\u91cd\u307f\u3067\u88dc\u5b8c\u3002",
      cells: makeCategoryCells({
        household: getCategoryHouseholdChange(fruitFlow.price, fruitFlow.supply, 4),
        householdNote: "\u6691\u3044\u65e5\u306f\u679c\u7269\u30fb\u30ab\u30c3\u30c8\u679c\u7269\u9700\u8981\u304c\u4f38\u3073\u3084\u3059\u3044",
        householdSource: "\u5bb6\u8a08\u8abf\u67fb \u679c\u7269\u5019\u88dc",
        price: fruitFlow.price,
        priceNote: "\u4fa1\u683c\u304c\u4e0b\u304c\u308a\u5165\u8377\u304c\u591a\u3044\u54c1\u76ee\u306f\u9732\u51fa\u5019\u88dc",
        priceSource: "\u5378\u58f2\u5e02\u5834 \u4e2d\u5024",
        production: getCategoryProductionChange(fruitFlow.supply),
        productionNote: "\u5165\u8377\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523\u30fb\u51fa\u8377\u5074\u306e\u4ee3\u7406\u3068\u3057\u3066\u78ba\u8a8d",
        productionSource: "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf / \u52a0\u91cd\u5e73\u5747",
        supply: fruitFlow.supply,
        supplyNote: "\u5165\u8377\u5897\u306f\u51b7\u3084\u3057\u58f2\u5834\u30fb\u5373\u98df\u9700\u8981\u3068\u9023\u52d5",
        supplySource: "\u5378\u58f2\u5e02\u5834 \u5165\u8377\u91cf"
      })
    }
  ];

  return (
    <section className="panel weather-money-flow-panel" aria-label={"\u5929\u5019\u3068\u304a\u91d1\u306e\u6d41\u308c"}>
      <div className="panel-header weather-money-flow-header">
        <div>
          <h2 className="panel-title">{"\u5929\u5019\u3068\u304a\u91d1\u306e\u6d41\u308c"}</h2>
        </div>
        <span className="panel-meta">{region.name + " / " + period.label}</span>
      </div>

      <div className="money-flow-graph" aria-label={"\u751f\u7523\u91cf\u304b\u3089\u5bb6\u8a08\u307e\u3067\u306e\u6d41\u308c"}>
        {stages.map((stage, index) => (
          <div className="money-flow-node-wrap" key={stage.id}>
            <article className={"money-flow-node " + toneClass[stage.tone]}>
              <span>{stage.metric}</span>
              <strong>{stage.label}</strong>
              <em>{stage.value}</em>
              <div className="money-flow-meter" aria-hidden="true">
                <i style={{ width: String(Math.min(96, Math.max(18, 48 + stage.change * 1.8))) + "%" }} />
              </div>
            </article>
            {index < stages.length - 1 && <div className="money-flow-arrow" aria-hidden="true">{"→"}</div>}
          </div>
        ))}
      </div>


      <div className="category-flow-section" aria-label={"\u30ab\u30c6\u30b4\u30ea\u5225\u306e\u751f\u7523\u91cf\u304b\u3089\u5bb6\u8a08\u307e\u3067\u306e\u6d41\u308c"}>
        <div className="category-flow-heading">
          <div>
            <h3>{"\u30ab\u30c6\u30b4\u30ea\u5225\u30d5\u30ed\u30fc"}</h3>
          </div>
          <span>{"\u751f\u7523\u91cf \u2192 \u4f9b\u7d66\u91cf \u2192 \u4ed5\u5165\u308c\u4fa1\u683c \u2192 \u5bb6\u8a08"}</span>
        </div>
        <details className="category-flow-method-details">
          <summary>{"\u8a08\u7b97\u6839\u62e0\u3092\u8868\u793a"}</summary>
          <div className="category-flow-method-grid" aria-label={"\u30ab\u30c6\u30b4\u30ea\u30fc\u5225\u30d5\u30ed\u30fc\u306e\u8a08\u7b97\u6839\u62e0"}>
          <div>
            <span>{"\u5f0f"}</span>
            <strong>{"\u52a0\u91cd\u5e73\u5747 = \u03a3(\u5909\u5316\u7387 \u00d7 \u6570\u91cf) / \u03a3\u6570\u91cf"}</strong>
            <p>{"\u4fa1\u683c\u30fb\u4f9b\u7d66\u91cf\u306f\u3001\u53d6\u5f97\u3067\u304d\u308b\u6570\u91cf\u304c\u5927\u304d\u3044\u54c1\u76ee\u307b\u3069\u5f37\u304f\u53cd\u6620\u3057\u307e\u3059\u3002"}</p>
          </div>
          <div>
            <span>{"\u751f\u7523\u91cf"}</span>
            <strong>{"\u5929\u5019\u88dc\u6b63\u306a\u3057"}</strong>
            <p>{"\u73fe\u6642\u70b9\u306f\u5165\u8377\u91cf\u30fb\u53d6\u5f15\u6570\u91cf\u306e\u52a0\u91cd\u5909\u5316\u3092\u751f\u7523/\u51fa\u8377\u306e\u4ee3\u7406\u6307\u6a19\u306b\u3057\u3066\u3044\u307e\u3059\u3002"}</p>
          </div>
          <div>
            <span>{"\u5c0f\u9ea6"}</span>
            <strong>{"\u56fd\u5185" + wheatMarketProfile.domesticSelfSufficiencyRate + "% / \u8f38\u5165\u7d04" + wheatMarketProfile.importShareRate + "%"}</strong>
            <p>{"\u653f\u5e9c\u58f2\u6e21\u4fa1\u683c: " + wheatMarketProfile.salePriceEffectivePeriod + " " + formatCount(wheatMarketProfile.salePriceYenPerTon) + "\u5186/t / \u66f4\u65b0\u65e5 " + wheatMarketProfile.salePricePublishedAt}</p>
          </div>
          </div>
        </details>
        <div className="category-flow-board">
          <div className="category-flow-row category-flow-row-head" aria-hidden="true">
            <div>{"\u5206\u985e"}</div>
            <div>{"\u751f\u7523\u91cf"}</div>
            <div>{"\u4f9b\u7d66\u91cf"}</div>
            <div>{"\u4ed5\u5165\u308c\u4fa1\u683c"}</div>
            <div>{"\u5bb6\u8a08/\u7d71\u8a08"}</div>
          </div>
          {categoryFlows.map((category) => (
            <article className="category-flow-row" key={category.id}>
              <div className="category-flow-label">
                <span>{category.group}</span>
                <strong>{category.label}</strong>
              </div>
              {category.cells.map((cell) => (
                <button
                  aria-label={category.label + " / " + cell.label + "\u306e\u63a8\u79fb\u3092\u958b\u304f"}
                  className={"category-flow-cell " + toneClass[cell.tone]}
                  key={category.id + cell.id}
                  onClick={() => setSelectedCategoryFlow({ category, cell })}
                  type="button"
                >
                  <span>{cell.label}</span>
                  <strong>{cell.value}</strong>
                  <small>{cell.source}</small>
                </button>
              ))}
            </article>
          ))}
        </div>
      </div>

      {selectedCategoryFlow && (
        <CategoryFlowTrendModal
          onClose={() => setSelectedCategoryFlow(null)}
          periodLabel={period.label}
          selection={selectedCategoryFlow}
        />
      )}
    </section>
  );
}

function DemandForecastPanel({
  data,
  error,
  region,
  status
}: {
  data: DemandForecastResponse | null;
  error: string;
  region: RegionProfile;
  status: ApiLoadStatus;
}) {
  return (
    <section className="panel demand-forecast-panel" aria-label="食品需要予測">
      <div className="panel-header demand-forecast-header">
        <div>
          <h2 className="panel-title">需要予測</h2>
          <span className="panel-subtitle">
            家計調査の過去候補、卸売・市況、生産高候補、気象庁予報から野菜・果物・肉・コメ・パンを予測
          </span>
        </div>
        <span className="panel-meta">{region.name}</span>
      </div>

      {status === "loading" && (
        <div className="api-state-box">需要予測モデルを計算しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">需要予測の取得に失敗しました。{error}</div>
      )}

      {status === "success" && data && (
        <>
          <div className="forecast-source-strip" aria-label="需要予測の入力データ">
            {data.inputs.map((input) => (
              <span className={input.ok ? "ok" : "warn"} key={input.source}>
                {input.source}
              </span>
            ))}
          </div>

          <div className="demand-forecast-grid">
            {data.forecasts.map((forecast) => (
              <article className={`demand-forecast-card ${toneClass[forecast.tone]}`} key={forecast.id}>
                <div className="demand-card-head">
                  <div>
                    <span>{forecast.demandLabel}</span>
                    <h3>{forecast.label}</h3>
                  </div>
                  <div className="demand-card-score">
                    <span>指数</span>
                    <strong>{forecast.demandScore}</strong>
                  </div>
                </div>

                <div className="demand-card-metrics">
                  <div>
                    <span>需要変化</span>
                    <strong>{formatPercent(forecast.demandChange)}</strong>
                  </div>
                  <div>
                    <span>信頼度</span>
                    <strong>{forecast.confidence}%</strong>
                  </div>
                </div>

                <div className="demand-mini-chart" aria-label={`${forecast.label}の過去データと予測`}>
                  {forecast.series.map((point) => (
                    <div key={`${forecast.id}-${point.label}`}>
                      <i
                        className={point.type}
                        style={{ height: `${Math.max(18, Math.min(100, point.value))}%` }}
                      />
                      <span>{point.label}</span>
                    </div>
                  ))}
                </div>

                <div className="demand-driver-list">
                  <p><span>天候</span>{forecast.weatherDriver}</p>
                  <p><span>履歴</span>{forecast.historyDriver}</p>
                  <p><span>供給</span>{forecast.supplyDriver}</p>
                </div>

                <strong className="demand-action">{forecast.action}</strong>
              </article>
            ))}
          </div>

          <p className="forecast-note">{data.model}</p>
        </>
      )}
    </section>
  );
}

function DatabaseSyncPanel({
  data,
  error,
  onSync,
  status
}: {
  data: DatabaseSyncResponse | null;
  error: string;
  onSync: () => void;
  status: ApiLoadStatus;
}) {
  const writes = data?.writes ?? [];
  const sources = data?.sources ?? [];

  return (
    <section className="panel database-sync-panel" aria-label="データベース保存">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">データベース保存</h2>
          <span className="panel-subtitle">
            取得できたAPIデータと需要予測をSupabaseへ日次保存します
          </span>
        </div>
        <button
          className="sync-button"
          disabled={status === "loading"}
          onClick={onSync}
          type="button"
        >
          {status === "loading" ? "保存中" : "取得して保存"}
        </button>
      </div>

      {status === "idle" && (
        <div className="api-state-box">
          保存前に Supabase のSQL Editorで <strong>supabase/schema.sql</strong> を実行してください。
        </div>
      )}

      {status === "loading" && (
        <div className="api-state-box">青果・気象・家計・生産高・宿泊・食肉・米・需要予測を取得して保存しています。</div>
      )}

      {status === "error" && (
        <div className="api-state-box error">
          DB保存に失敗しました。{error}
          {data?.schemaPath ? ` / SQL: ${data.schemaPath}` : ""}
        </div>
      )}

      {status === "success" && data && (
        <div className="database-sync-body">
          <div className="database-sync-summary">
            <div>
              <span>保存日</span>
              <strong>{data.snapshotDate}</strong>
            </div>
            <div>
              <span>保存テーブル</span>
              <strong>{writes.filter((write) => write.ok).length}/{writes.length}</strong>
            </div>
            <div>
              <span>取得元</span>
              <strong>{sources.filter((source) => source.ok).length}/{sources.length}</strong>
            </div>
          </div>
          <div className="database-sync-list">
            {writes.map((write) => (
              <div className={write.ok ? "ok" : "warn"} key={write.table}>
                <span>{write.table}</span>
                <strong>{write.ok ? `${formatCount(write.rows)}行保存` : "保存失敗"}</strong>
                {write.error && <small>{write.error}</small>}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function RiceDetailModal({
  item,
  onClose
}: {
  item: RiceHeatmapItem;
  onClose: () => void;
}) {
  const trend = buildRicePriceTrend(item);
  const range = getPriceRange(trend);
  const latest = trend[trend.length - 1];
  const latestX = getPriceTrendLabelX(trend.length - 1, trend.length);
  const latestY = 32 + ((range.max - latest.current) / Math.max(1, range.max - range.min)) * 188;
  const axisValues = [
    range.max,
    Math.round((range.max + range.min) / 2),
    range.min
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        aria-label={`${item.brand}の米価格グラフ`}
        aria-modal="true"
        className="price-modal rice-price-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className={`badge ${toneClass[getRicePeriodTone(item, "month")]}`}>{item.hasPrice ? "米価格" : "価格未取得"}</span>
            <h2>{item.brand}</h2>
            <p>{item.origin + " / " + item.priceLabel + " / " + item.quantityLabel}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} type="button">
            閉じる
          </button>
        </div>

        <div className="modal-summary-grid">
          <div>
            <span>産地</span>
            <strong>{item.origin}</strong>
            <small>銘柄別</small>
          </div>
          <div>
            <span>価格</span>
            <strong>{item.hasPrice ? formatYen(item.price) + "円" : "未取得"}</strong>
            <small>60kgあたり</small>
          </div>
          <div>
            <span>前年同月比</span>
            <strong className={item.yearChange > 0 ? "up-value" : "down-value"}>{formatPercent(item.yearChange)}</strong>
            <small>価格変動</small>
          </div>
          <div>
            <span>数量</span>
            <strong>{formatCount(item.volume)}</strong>
            <small>{formatPercent(item.volumeChange)}</small>
          </div>
        </div>

        <div className="modal-chart-panel">
          <div className="modal-chart-heading">
            <h3>米価格推移（12か月）</h3>
            <span>円/60kg</span>
          </div>
          <svg viewBox="0 0 640 270" role="img" aria-label={`${item.brand}の米価格推移グラフ`}>
            <rect x="0" y="0" width="640" height="270" fill="#ffffff" />
            {[32, 126, 220].map((y) => (
              <line key={y} x1="56" x2="596" y1={y} y2={y} stroke="#e5ebe6" />
            ))}
            <g className="chart-labels">
              {axisValues.map((value, index) => (
                <text key={value} x="10" y={36 + index * 94}>{formatYen(value)}</text>
              ))}
              {trend.map((point, index) => (
                <text key={point.label} textAnchor="middle" x={getPriceTrendLabelX(index, trend.length)} y="248">{point.label}</text>
              ))}
            </g>
            <polyline className="series normal-line" points={buildDynamicPolyline(trend, "normal", range)} />
            <polyline className="series last-line" points={buildDynamicPolyline(trend, "lastYear", range)} />
            <polyline className="series now-line" points={buildDynamicPolyline(trend, "current", range)} />
            <circle cx={latestX} cy={latestY} fill="#1f7a52" r="6" />
          </svg>
          <div className="legend">
            <span><i className="line-now" />今年12か月</span>
            <span><i className="line-last" />前年同月</span>
            <span><i className="line-normal" />平年水準</span>
          </div>
        </div>

        <div className="modal-action-box">
          <strong>データ根拠</strong>
          <p>農林水産省の米CSVから取得した価格、数量、前年同月比を使って表示しています。履歴がDBに蓄積されたら実測推移へ差し替えます。</p>
        </div>
      </section>
    </div>
  );
}

function PriceDetailModal({
  item,
  onClose
}: {
  item: WholesaleItem;
  onClose: () => void;
}) {
  const retail = getRetailEstimate(item);
  const trend = buildItemPriceTrend(item);
  const range = getPriceRange(trend);
  const latest = trend[trend.length - 1];
  const latestX = getPriceTrendLabelX(trend.length - 1, trend.length);
  const latestY = 32 + ((range.max - latest.current) / Math.max(1, range.max - range.min)) * 188;
  const axisValues = [
    range.max,
    Math.round((range.max + range.min) / 2),
    range.min
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        aria-label={`${item.name}の価格グラフ`}
        aria-modal="true"
        className="price-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className={`badge ${toneClass[item.tone]}`}>{item.judgment}</span>
            <h2>{item.name}</h2>
            <p>{item.department === "fruit" ? "くだもの" : "野菜"} / {item.group} / {item.supplyLabel}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} type="button">
            閉じる
          </button>
        </div>

        <div className="modal-summary-grid">
          <div>
            <span>店頭目安</span>
            <strong>{formatYen(retail.price)}円</strong>
            <small>{retail.unitLabel}</small>
          </div>
          <div>
            <span>中値</span>
            <strong>{formatYen(item.middlePrice)}円</strong>
            <small>{item.unit}</small>
          </div>
          <div>
            <span>前年同月比</span>
            <strong className={item.yearMonthChange > 0 ? "up-value" : "down-value"}>
              {formatPercent(item.yearMonthChange)}
            </strong>
            <small>価格変動</small>
          </div>
          <div>
            <span>平年比</span>
            <strong className={item.normalRatio > 0 ? "up-value" : "down-value"}>
              {formatPercent(item.normalRatio)}
            </strong>
            <small>5年中値比較</small>
          </div>
        </div>

        <div className="modal-chart-panel">
          <div className="modal-chart-heading">
            <h3>価格推移（2年）</h3>
            <span>2年分 月次 / 円/{item.unit}</span>
          </div>
          <svg viewBox="0 0 640 270" role="img" aria-label={`${item.name}の価格推移グラフ`}>
            <rect x="0" y="0" width="640" height="270" fill="#ffffff" />
            {[32, 126, 220].map((y) => (
              <line key={y} x1="56" x2="596" y1={y} y2={y} stroke="#e5ebe6" />
            ))}
            <g className="chart-labels">
              {axisValues.map((value, index) => (
                <text key={value} x="10" y={36 + index * 94}>{formatYen(value)}</text>
              ))}
              {trend.map((point, index) =>
                shouldShowPriceTrendLabel(index, trend.length) ? (
                  <text key={point.label} x={getPriceTrendLabelX(index, trend.length)} y="248">{point.label}</text>
                ) : null
              )}
            </g>
            <polyline className="series normal-line" points={buildDynamicPolyline(trend, "normal", range)} />
            <polyline className="series last-line" points={buildDynamicPolyline(trend, "lastYear", range)} />
            <polyline className="series now-line" points={buildDynamicPolyline(trend, "current", range)} />
            <circle cx={latestX} cy={latestY} fill="#1f7a52" r="6" />
          </svg>
          <div className="legend">
            <span><i className="line-now" />2年推移</span>
            <span><i className="line-last" />前年同月水準</span>
            <span><i className="line-normal" />平年水準</span>
          </div>
        </div>

        <div className="modal-action-box">
          <strong>価格算出</strong>
          <p>
            {item.priceBasisLabel ??
              "現在は品目別の代表価格を表示しています。実API接続後は市場・産地・規格別の明細から自動計算します。"}
          </p>
          {item.marketRows?.length ? (
            <div className="modal-source-rows">
              {item.marketRows.map((row) => (
                <div key={`${row.market}-${row.origin}-${row.grade}-${row.sizeClass}`}>
                  <span>{row.market} / {row.origin} / {row.grade}{row.sizeClass}</span>
                  <strong>
                    中値 {formatYen(row.middlePriceYen ?? 0)}円/{row.unitWeightKg}kg
                  </strong>
                  <small>数量 {row.quantityTons.toLocaleString("ja-JP")}t</small>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="modal-action-box">
          <strong>売場アクション</strong>
          <p>{item.action}</p>
        </div>
      </section>
    </div>
  );
}

function LivestockDetailModal({
  item,
  onClose
}: {
  item: LivestockBoardItem;
  onClose: () => void;
}) {
  const trend = buildLivestockPriceTrend(item);
  const range = getPriceRange(trend);
  const latest = trend[trend.length - 1];
  const latestX = getPriceTrendLabelX(trend.length - 1, trend.length);
  const latestY = 32 + ((range.max - latest.current) / Math.max(1, range.max - range.min)) * 188;
  const axisValues = [
    range.max,
    Math.round((range.max + range.min) / 2),
    range.min
  ];
  const chartTitle =
    item.kind === "pork"
      ? "豚価格推移（12か月）"
      : item.kind === "beef"
        ? "牛価格推移（12か月）"
        : "鶏卵価格推移（12か月）";

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        aria-label={`${item.label}の食肉・鶏卵詳細`}
        aria-modal="true"
        className="price-modal livestock-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <span className={`badge ${toneClass[item.tone]}`}>
              {item.tone === "green" ? "買い時" : item.tone === "red" ? "高値注意" : "比較確認"}
            </span>
            <h2>{item.label}</h2>
            <p>{item.categoryLabel} / {item.contextLabel} / {item.dateLabel}</p>
          </div>
          <button className="modal-close-button" onClick={onClose} type="button">
            閉じる
          </button>
        </div>

        <div className="modal-summary-grid">
          <div>
            <span>価格</span>
            <strong>{formatCount(item.price)}円</strong>
            <small>kgあたり</small>
          </div>
          <div>
            <span>市場平均差</span>
            <strong className={item.changeFromAverage > 0 ? "up-value" : "down-value"}>
              {formatPercent(item.changeFromAverage)}
            </strong>
            <small>同カテゴリ内比較</small>
          </div>
          <div>
            <span>平均価格</span>
            <strong>{formatCount(Math.round(item.averagePrice))}円</strong>
            <small>kgあたり</small>
          </div>
          <div>
            <span>{item.kind === "egg" ? "入荷量" : "成立頭数"}</span>
            <strong>{item.quantityLabel.replace("成立 ", "").replace("入荷量 ", "")}</strong>
            <small>当日データ</small>
          </div>
        </div>

        <div className="modal-chart-panel">
          <div className="modal-chart-heading">
            <h3>{chartTitle}</h3>
            <span>円/kg</span>
          </div>
          <svg viewBox="0 0 640 270" role="img" aria-label={`${item.label}の価格推移グラフ`}>
            <rect x="0" y="0" width="640" height="270" fill="#ffffff" />
            {[32, 126, 220].map((y) => (
              <line key={y} x1="56" x2="596" y1={y} y2={y} stroke="#e5ebe6" />
            ))}
            <g className="chart-labels">
              {axisValues.map((value, index) => (
                <text key={value} x="10" y={36 + index * 94}>{formatYen(value)}</text>
              ))}
              {trend.map((point, index) => (
                <text key={point.label} textAnchor="middle" x={getPriceTrendLabelX(index, trend.length)} y="248">
                  {point.label}
                </text>
              ))}
            </g>
            <polyline className="series normal-line" points={buildDynamicPolyline(trend, "normal", range)} />
            <polyline className="series last-line" points={buildDynamicPolyline(trend, "lastYear", range)} />
            <polyline className="series now-line" points={buildDynamicPolyline(trend, "current", range)} />
            <circle cx={latestX} cy={latestY} fill="#1f7a52" r="6" />
          </svg>
          <div className="legend">
            <span><i className="line-now" />今年12か月</span>
            <span><i className="line-last" />市場平均換算</span>
            <span><i className="line-normal" />市場平均</span>
          </div>
        </div>

        <div className="modal-action-box">
          <strong>データ根拠</strong>
          <p>
            農林水産省の食肉・鶏卵データから取得した価格、成立頭数・入荷量、市場平均との差を使って表示しています。
            履歴がDBに蓄積されたら、推定線から実測の月次推移へ差し替えます。
          </p>
        </div>

        <div className="market-rows-panel">
          <h3>取得元の行データ</h3>
          <div className="market-rows-grid">
            {Object.entries(item.record)
              .filter(([, value]) => value.trim().length > 0)
              .slice(0, 12)
              .map(([key, value]) => (
                <div key={key}>
                  <span>{key}</span>
                  <strong>{value}</strong>
                </div>
              ))}
          </div>
          <p>{item.sourceLabel}</p>
        </div>
      </section>
    </div>
  );
}

function WeatherChart() {
  const trend = priceTrend.slice(-12);
  const range = getPriceRange(trend);
  const latest = trend[trend.length - 1];
  const latestX = getPriceTrendLabelX(trend.length - 1, trend.length);
  const latestY = 32 + ((range.max - latest.current) / Math.max(1, range.max - range.min)) * 188;
  const alertValue = 200;
  const alertY = 32 + ((range.max - alertValue) / Math.max(1, range.max - range.min)) * 188;
  const axisValues = [
    range.max,
    Math.round((range.max + range.min) / 2),
    range.min
  ];

  return (
    <div className="chart-body">
      <div className="chart-wrap weather-price-chart-wrap">
        <svg viewBox="0 0 640 280" role="img" aria-label="キャベツ卸売価格12か月推移グラフ">
          <rect x="0" y="0" width="640" height="280" fill="#ffffff" />
          <g stroke="#e5ebe6" strokeWidth="1">
            {[32, 126, 220].map((y) => (
              <line key={y} x1="56" y1={y} x2="596" y2={y} />
            ))}
          </g>
          <g className="chart-labels weather-price-chart-labels">
            {axisValues.map((value, index) => (
              <text key={value} x="10" y={36 + index * 94}>{formatYen(value)}</text>
            ))}
            {trend.map((point, index) => (
              <text key={point.label} textAnchor="middle" x={getPriceTrendLabelX(index, trend.length)} y="252">{point.label}</text>
            ))}
          </g>
          <polyline className="series normal-line" points={buildDynamicPolyline(trend, "normal", range)} />
          <polyline className="series last-line" points={buildDynamicPolyline(trend, "lastYear", range)} />
          <polyline className="series now-line" points={buildDynamicPolyline(trend, "current", range)} />
          <line className="alert-line" x1="56" y1={alertY} x2="596" y2={alertY} />
          <circle cx={latestX} cy={latestY} r="6" fill="#b33a3a" />
        </svg>
      </div>
      <div className="legend">
        <span><i className="line-now" />今年12か月</span>
        <span><i className="line-last" />前年同月</span>
        <span><i className="line-normal" />5年中値</span>
        <span><i className="line-alert" />注意水準</span>
      </div>
    </div>
  );
}

function WeatherSignalPanel({ region }: { region: RegionProfile }) {
  return (
    <div className="weather-body">
      <div className="signal-card">
        {weatherSignals.map((signal) => (
          <div className="signal-row" key={signal.name}>
            <div className="signal-name">{signal.name}</div>
            <div className="prob-bar" aria-label={`${signal.name}の確率`}>
              <span className="low" style={{ width: `${signal.low}%` }} />
              <span className="normal" style={{ width: `${signal.normal}%` }} />
              <span className="high" style={{ width: `${signal.high}%` }} />
            </div>
            <div className="prob-value">{signal.value}</div>
          </div>
        ))}
      </div>
      <p className="weather-note">{region.demandNote}</p>
      <p className="weather-note">{region.logisticsNote}</p>
    </div>
  );
}

function LodgingStatsPanel({
  error,
  lodging,
  sourceLabel,
  status,
  tables
}: {
  error: string;
  lodging: PrefectureLodgingProfile;
  sourceLabel: string;
  status: ApiLoadStatus;
  tables: LodgingApiTable[];
}) {
  const topNationality = lodging.nationalityGuests[0];
  const lodgingYoYHeatmapItems = buildLodgingYoYHeatmapItems(lodging);
  const domesticGuests = Math.max(0, lodging.totalGuests - lodging.foreignGuests);
  const foreignShare = Math.round((lodging.foreignGuests / Math.max(1, lodging.totalGuests)) * 100);
  const occupancyMessage =
    lodging.roomOccupancyRate >= 85
      ? "販売余地が小さいため、清掃・備品・朝食の欠品を先に潰す"
      : lodging.roomOccupancyRate >= 72
        ? "週末とイベント日の単価調整、朝食・即食需要の補充を優先"
        : "空室余地があるため、近隣観光・飲食導線の露出を増やす";
  const statusLabel =
    status === "loading" ? "API取得中" : status === "error" ? "API補完表示" : sourceLabel;

  return (
    <div className="panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">{lodging.prefectureName}の宿泊統計</h2>
          <span className="panel-subtitle">
            宿泊者数・外国人宿泊者数・客室稼働率・国籍別宿泊者数・国籍別消費額
          </span>
        </div>
        <span className={`api-status-pill ${status}`}>{statusLabel}</span>
      </div>
      <div className="lodging-stat-grid">
        <div className="lodging-stat-card">
          <span>宿泊者数</span>
          <strong>{formatCount(lodging.totalGuests)}</strong>
          <small>人泊 / 前月比 {formatPercent(lodging.monthChange)}</small>
        </div>
        <div className="lodging-stat-card">
          <span>外国人宿泊者数</span>
          <strong>{formatCount(lodging.foreignGuests)}</strong>
          <small>人泊</small>
        </div>
        <div className="lodging-stat-card">
          <span>客室稼働率</span>
          <strong>{formatRate(lodging.roomOccupancyRate)}</strong>
          <small>宿泊施設の販売余地</small>
        </div>
        <div className="lodging-stat-card">
          <span>国籍別宿泊者数</span>
          <strong>{topNationality?.country ?? "集計中"}</strong>
          <small>{topNationality ? `${formatCount(topNationality.guests)}人泊` : "上位国籍を表示"}</small>
        </div>
      </div>
      <section className="lodging-insight-board" aria-label="宿泊需要の運営判断">
        <div className="lodging-mix-card">
          <div>
            <span>宿泊者ミックス</span>
            <strong>外国人比率 {foreignShare}%</strong>
          </div>
          <div className="guest-mix-bar" aria-label="国内宿泊者と外国人宿泊者の比率">
            <i style={{ width: `${Math.max(8, Math.min(92, 100 - foreignShare))}%` }} />
            <b style={{ width: `${Math.max(8, Math.min(92, foreignShare))}%` }} />
          </div>
          <div className="guest-mix-legend">
            <span>国内 {formatCount(domesticGuests)}人泊</span>
            <span>外国人 {formatCount(lodging.foreignGuests)}人泊</span>
          </div>
        </div>
        <div className="lodging-action-card">
          <span>今週の運営判断</span>
          <strong>{topNationality?.country ?? "主要国籍"}需要を軸に補充</strong>
          <div className="lodging-action-list">
            <p>稼働率 {formatRate(lodging.roomOccupancyRate)}: {occupancyMessage}</p>
            <p>消費単価: {topNationality ? `${formatYen(topNationality.travelExpense.totalTravelExpenseYen)}円` : "集計中"} を基準に飲食・買い物導線を確認</p>
            <p>国籍別: 上位国籍の朝食、飲料、日用品を小さく厚く持つ</p>
          </div>
        </div>
      </section>
      <section className="lodging-yoy-section" aria-label="前年同月比ヒートマップ">
        <div className="lodging-yoy-heading">
          <div>
            <h3>前年同月比ヒートマップ</h3>
            <span>増加は緑、減少は赤。面積は宿泊者数・国籍別消費額の影響度を示します。</span>
          </div>
          <small>前年同月比 / 宿泊・消費</small>
        </div>
        <div className="lodging-yoy-heatmap">
          {lodgingYoYHeatmapItems.map((item) => {
            const size = getLodgingYoYTileSize(item);
            const sizeClass = `size-col-${size.columns} size-row-${size.rows}`;

            return (
              <article className={`heatmap-tile lodging-yoy-tile ${toneClass[item.tone]} ${sizeClass}`} key={item.id}>
                <span>{item.category}</span>
                <strong>{item.label}</strong>
                <em>{formatPercent(item.change)}</em>
                <small>{item.valueLabel}</small>
              </article>
            );
          })}
        </div>
      </section>
      <div className="nationality-list" aria-label="国籍別宿泊者数">
        {lodging.nationalityGuests.map((market, marketIndex) => (
          <div className={`nationality-row ${toneClass[market.tone]}`} key={market.country}>
            <span>{market.country}</span>
            <div className="nationality-bar">
              <i style={{ width: `${Math.min(100, market.share)}%` }} />
            </div>
            <div className="nationality-row-expenses" aria-label={`${market.country}の消費内訳`}>
              {buildNationalityExpenseYoYItems(lodging, market, marketIndex).map((expense) => (
                <div className={`nationality-expense-mini ${toneClass[expense.tone]}`} key={expense.key}>
                  <span>{expense.label}</span>
                  <strong>{formatYen(expense.value)}円</strong>
                  <small className="nationality-yoy-pill">
                    <b>{expense.directionLabel}</b>
                    {formatPercent(expense.change)}
                  </small>
                  <em>前年同月 {formatYen(expense.lastYearValue)}円</em>
                </div>
              ))}
            </div>
            <strong>{formatCount(market.guests)}人泊</strong>
          </div>
        ))}
      </div>
      <p className="nationality-expense-source">
        国籍別の食費・買い物代・宿泊費・旅行費用は、観光庁 インバウンド消費動向調査を出典候補に表示しています。
      </p>
      <p className="lodging-note">{lodging.demandNote}</p>
      <div className="lodging-api-note">
        <strong>{lodging.updatedAt}</strong>
        <span>{error || sourceLabel}</span>
        {tables.length > 0 && <small>{tables.length}件のe-Stat候補テーブルを確認</small>}
      </div>
    </div>
  );
}

function MinpakuPanel({
  lodging,
  lodgingError,
  lodgingSourceLabel,
  lodgingStatus,
  lodgingTables,
  minpaku,
  region
}: {
  lodging: PrefectureLodgingProfile;
  lodgingError: string;
  lodgingSourceLabel: string;
  lodgingStatus: ApiLoadStatus;
  lodgingTables: LodgingApiTable[];
  minpaku: MinpakuProfile;
  region: RegionProfile;
}) {
  return (
    <section className="screen-panel-grid two-column-screen" aria-label="民泊需要画面">
      <div className="panel inbound-hero-panel">
        <div className="panel-header">
          <div>
            <h2 className="panel-title">{region.name}の民泊需要</h2>
            <span className="panel-subtitle">{minpaku.headline}</span>
          </div>
          <span className={`badge ${toneClass.green}`}>{minpaku.statusLabel}</span>
        </div>
        <div className="inbound-score-grid">
          <div>
            <span>民泊需要</span>
            <strong>{minpaku.demandIndex}</strong>
            <small>前週比 {formatPercent(minpaku.weekChange)}</small>
          </div>
          <div>
            <span>稼働見込み</span>
            <strong>{minpaku.occupancyIndex}</strong>
            <small>{minpaku.guestTypeLabel}</small>
          </div>
          <div>
            <span>清掃負荷</span>
            <strong>{minpaku.cleaningIndex}</strong>
            <small>{minpaku.riskLabel}</small>
          </div>
        </div>
        <div className="minpaku-meter" aria-label="備品補充指数">
          <div>
            <span>備品補充指数</span>
            <strong>{minpaku.supplyIndex}</strong>
          </div>
          <div className="meter-track">
            <span style={{ width: `${Math.min(100, minpaku.supplyIndex)}%` }} />
          </div>
        </div>
        <p className="inbound-note">{minpaku.foodDemandNote}</p>
      </div>

      <LodgingStatsPanel
        error={lodgingError}
        lodging={lodging}
        sourceLabel={lodgingSourceLabel}
        status={lodgingStatus}
        tables={lodgingTables}
      />
    </section>
  );
}

type WholesaleListPanelProps = {
  activeTab: CategoryTab["id"];
  filteredItems: WholesaleItem[];
  hasMoreItems: boolean;
  onLoadMore: () => void;
  onQueryChange: (value: string) => void;
  onSortModeChange: (value: SortMode) => void;
  onTabChange: (tabId: CategoryTab["id"]) => void;
  query: string;
  sortMode: SortMode;
  tabCounts: Record<string, number>;
  visibleItems: WholesaleItem[];
  note?: string;
};

function WholesaleListPanel({
  activeTab,
  filteredItems,
  hasMoreItems,
  note = "注目カードは上位4品目だけを固定表示",
  onLoadMore,
  onQueryChange,
  onSortModeChange,
  onTabChange,
  query,
  sortMode,
  tabCounts,
  visibleItems
}: WholesaleListPanelProps) {
  return (
    <div className="panel wholesale-panel">
      <div className="panel-header price-list-header">
        <div>
          <h2 className="panel-title">卸売価格一覧</h2>
          <span className="panel-subtitle">中値と店頭目安を並べ、検索・カテゴリ・並び順で担当範囲に絞り込み</span>
        </div>
        <span className="panel-meta">{formatCount(filteredItems.length)}品目該当</span>
      </div>

      <div className="list-tools" aria-label="卸売価格一覧の操作">
        <div className="tab-row" role="tablist" aria-label="カテゴリ">
          {categoryTabs.map((tab) => (
            <button
              className={`category-tab ${activeTab === tab.id ? "active" : ""}`}
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              type="button"
            >
              <strong>{tab.label}</strong>
              <span>{formatCount(tabCounts[tab.id] ?? 0)}品目</span>
            </button>
          ))}
        </div>
        <div className="search-row">
          <label className="search-box">
            <span>検索</span>
            <input
              aria-label="品目検索"
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="例: すいか、葉物、高騰"
              type="search"
              value={query}
            />
          </label>
          <label className="sort-box">
            <span>並び順</span>
            <select
              aria-label="並び順"
              onChange={(event) => onSortModeChange(event.target.value as SortMode)}
              value={sortMode}
            >
              <option value="risk">判断優先</option>
              <option value="movement">変動大</option>
              <option value="price">中値高い順</option>
            </select>
          </label>
        </div>
        <div className="list-summary">
          <span>{formatCount(filteredItems.length)}品目中 {formatCount(visibleItems.length)}品目を表示</span>
          <span>{note}</span>
        </div>
      </div>

      <div className="table-scroll price-table-scroll">
        <table className="price-table">
          <thead>
            <tr>
              <th>品目</th>
              <th className="number">中値</th>
              <th className="number">店頭目安</th>
              <th className="number optional-col">高値</th>
              <th className="number optional-col">安値</th>
              <th className="number">前年同月</th>
              <th className="number optional-col">平年比</th>
              <th>入荷</th>
              <th>判断</th>
              <th>売場アクション</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => {
              const retail = getRetailEstimate(item);

              return (
                <tr key={item.code}>
                  <td>
                    <div className="commodity">
                      <strong>{item.name}</strong>
                      <span>{item.department === "fruit" ? "くだもの" : "野菜"} / {item.group} / {item.unit}</span>
                    </div>
                  </td>
                  <td className="number price-strong">{formatYen(item.middlePrice)}</td>
                  <td className="number">
                    <div className="retail-table-price">
                      <strong>{formatYen(retail.price)}</strong>
                      <span>円/{retail.unitLabel}</span>
                    </div>
                  </td>
                  <td className="number optional-col">{formatYen(item.highPrice)}</td>
                  <td className="number optional-col">{formatYen(item.lowPrice)}</td>
                  <td className={`number ${item.yearMonthChange > 0 ? "up-value" : "down-value"}`}>
                    {formatPercent(item.yearMonthChange)}
                  </td>
                  <td className="number optional-col">{formatPercent(item.normalRatio)}</td>
                  <td>
                    <span className="supply-pill">{item.supplyLabel}</span>
                  </td>
                  <td>
                    <span className={`badge ${toneClass[item.tone]}`}>{item.judgment}</span>
                    <div className={`score ${toneClass[item.tone]}`}>
                      <span style={{ width: `${item.score}%` }} />
                    </div>
                  </td>
                  <td>{item.action}</td>
                </tr>
              );
            })}
            {visibleItems.length === 0 && (
              <tr>
                <td className="empty-row" colSpan={10}>
                  該当する品目がありません。検索語かカテゴリを変えてください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        {hasMoreItems ? (
          <button className="load-more-button" onClick={onLoadMore} type="button">
            さらに{formatCount(Math.min(PAGE_SIZE, filteredItems.length - visibleItems.length))}品目表示
          </button>
        ) : (
          <span>該当品目をすべて表示中</span>
        )}
      </div>
    </div>
  );
}

function RegionStrip({ region }: { region: RegionProfile }) {
  return (
    <section className="region-strip" aria-label="地域設定">
      <div>
        <span>初期表示地域</span>
        <strong>{region.name}</strong>
      </div>
      <div>
        <span>市場</span>
        <strong>{region.market}</strong>
      </div>
      <div>
        <span>天候</span>
        <strong>{region.weatherLabel}</strong>
      </div>
      <p>{region.demandNote}</p>
    </section>
  );
}

export function DashboardTop() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>("dashboard");
  const [preferredScreen, setPreferredScreen] = useState<PreferredScreenId>("dashboard");
  const [selectedRegionCode, setSelectedRegionCode] = useState<RegionCode>("kanto");
  const [selectedPrefectureCode, setSelectedPrefectureCode] = useState<PrefectureCode>("tokyo");
  const [activeTab, setActiveTab] = useState<CategoryTab["id"]>("all");
  const [heatmapPeriod, setHeatmapPeriod] = useState<HeatmapPeriod>("month");
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("risk");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedHeatmapItem, setSelectedHeatmapItem] = useState<WholesaleItem | null>(null);
  const [selectedRiceItem, setSelectedRiceItem] = useState<RiceHeatmapItem | null>(null);
  const [selectedLivestockItem, setSelectedLivestockItem] = useState<LivestockBoardItem | null>(null);
  const [estatProduceData, setEstatProduceData] = useState<EstatProduceResponse | null>(null);
  const [estatProduceError, setEstatProduceError] = useState("");
  const [estatProduceStatus, setEstatProduceStatus] = useState<ApiLoadStatus>("idle");
  const [maffLivestockData, setMaffLivestockData] = useState<MaffLivestockResponse | null>(null);
  const [maffLivestockError, setMaffLivestockError] = useState("");
  const [maffLivestockStatus, setMaffLivestockStatus] = useState<ApiLoadStatus>("idle");
  const [maffRiceData, setMaffRiceData] = useState<MaffRiceResponse | null>(null);
  const [maffRiceError, setMaffRiceError] = useState("");
  const [maffRiceStatus, setMaffRiceStatus] = useState<ApiLoadStatus>("idle");
  const [jmaWeatherData, setJmaWeatherData] = useState<JmaWeatherResponse | null>(null);
  const [jmaWeatherError, setJmaWeatherError] = useState("");
  const [jmaWeatherStatus, setJmaWeatherStatus] = useState<ApiLoadStatus>("idle");
  const [householdData, setHouseholdData] = useState<PublicDataResponse | null>(null);
  const [householdError, setHouseholdError] = useState("");
  const [householdStatus, setHouseholdStatus] = useState<ApiLoadStatus>("idle");
  const [productionData, setProductionData] = useState<PublicDataResponse | null>(null);
  const [productionError, setProductionError] = useState("");
  const [productionStatus, setProductionStatus] = useState<ApiLoadStatus>("idle");
  const [lodgingData, setLodgingData] = useState<LodgingApiResponse | null>(null);
  const [lodgingError, setLodgingError] = useState("");
  const [lodgingStatus, setLodgingStatus] = useState<ApiLoadStatus>("idle");
  const [databaseSyncData, setDatabaseSyncData] = useState<DatabaseSyncResponse | null>(null);
  const [databaseSyncError, setDatabaseSyncError] = useState("");
  const [databaseSyncStatus, setDatabaseSyncStatus] = useState<ApiLoadStatus>("idle");
  const [localArchiveData, setLocalArchiveData] = useState<LocalArchiveStatusResponse | null>(null);
  const [localArchiveError, setLocalArchiveError] = useState("");
  const [localArchiveStatus, setLocalArchiveStatus] = useState<ApiLoadStatus>("idle");
  const [settingsSaveMessage, setSettingsSaveMessage] = useState("");

  const selectedRegion =
    regionProfiles.find((region) => region.code === selectedRegionCode) ?? regionProfiles[0];
  const selectedPrefecture =
    prefectureOptions.find((prefecture) => prefecture.code === selectedPrefectureCode) ?? prefectureOptions[0];
  const selectedMinpaku =
    minpakuProfiles.find((profile) => profile.regionCode === selectedRegionCode) ?? minpakuProfiles[0];
  const fallbackSelectedLodging =
    prefectureLodgingProfiles.find((profile) => profile.prefectureCode === selectedPrefectureCode) ??
    prefectureLodgingProfiles[0];
  const apiSelectedLodging =
    lodgingData?.profile.prefectureCode === selectedPrefectureCode ? lodgingData.profile : null;
  const selectedLodging = apiSelectedLodging ?? fallbackSelectedLodging;
  const lodgingSourceLabel =
    lodgingData?.profile.prefectureCode === selectedPrefectureCode
      ? lodgingData.fallback
        ? "e-Stat候補確認 / サンプル補完"
        : lodgingData.source
      : "観光庁 / e-Stat 宿泊旅行統計";
  const lodgingTables =
    lodgingData?.profile.prefectureCode === selectedPrefectureCode ? lodgingData.tables : [];
  const preferredScreenLabel =
    preferredScreenItems.find((screen) => screen.id === preferredScreen)?.label ?? "食品";

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const storedScreen = window.localStorage.getItem(PREFERRED_SCREEN_STORAGE_KEY);
      const normalizedStoredScreen = storedScreen;
      const storedRegion = window.localStorage.getItem(REGION_STORAGE_KEY);
      const storedPrefecture = window.localStorage.getItem(PREFECTURE_STORAGE_KEY);

      if (isRegionCode(storedRegion)) {
        setSelectedRegionCode(storedRegion);
      }

      if (isPrefectureCode(storedPrefecture)) {
        const prefecture = prefectureOptions.find((option) => option.code === storedPrefecture);
        setSelectedPrefectureCode(storedPrefecture);
        if (prefecture) {
          setSelectedRegionCode(prefecture.regionCode);
        }
      }

      if (isPreferredScreenId(normalizedStoredScreen)) {
        const nextScreen = normalizedStoredScreen;
        setPreferredScreen(nextScreen);
        setActiveScreen(nextScreen);
      }
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!selectedHeatmapItem && !selectedRiceItem && !selectedLivestockItem) return undefined;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedHeatmapItem(null);
        setSelectedLivestockItem(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedHeatmapItem, selectedRiceItem, selectedLivestockItem]);

  useEffect(() => {
    let cancelled = false;

    async function loadEstatProduce() {
      setEstatProduceStatus("loading");
      setEstatProduceError("");

      try {
        const response = await fetch("/api/estat/produce");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "e-Stat API response was not ok");
        }

        if (!cancelled) {
          setEstatProduceData(data);
          setEstatProduceStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setEstatProduceError(error instanceof Error ? error.message : "Unknown error");
          setEstatProduceStatus("error");
        }
      }
    }

    loadEstatProduce();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMaffLivestock() {
      setMaffLivestockStatus("loading");
      setMaffLivestockError("");

      try {
        const response = await fetch("/api/maff/livestock");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "MAFF livestock API response was not ok");
        }

        if (!cancelled) {
          setMaffLivestockData(data);
          setMaffLivestockStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setMaffLivestockError(error instanceof Error ? error.message : "Unknown error");
          setMaffLivestockStatus("error");
        }
      }
    }

    loadMaffLivestock();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMaffRice() {
      setMaffRiceStatus("loading");
      setMaffRiceError("");

      try {
        const response = await fetch("/api/maff/rice");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "MAFF rice API response was not ok");
        }

        if (!cancelled) {
          setMaffRiceData(data);
          setMaffRiceStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setMaffRiceError(error instanceof Error ? error.message : "Unknown error");
          setMaffRiceStatus("error");
        }
      }
    }

    loadMaffRice();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadJmaWeather() {
      setJmaWeatherStatus("loading");
      setJmaWeatherError("");

      try {
        const response = await fetch(`/api/jma/weather?region=${selectedRegionCode}&days=7`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "JMA weather API response was not ok");
        }

        if (!cancelled) {
          setJmaWeatherData(data);
          setJmaWeatherStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setJmaWeatherError(error instanceof Error ? error.message : "Unknown error");
          setJmaWeatherStatus("error");
        }
      }
    }

    loadJmaWeather();

    return () => {
      cancelled = true;
    };
  }, [selectedRegionCode]);

  useEffect(() => {
    let cancelled = false;

    async function loadHousehold() {
      setHouseholdStatus("loading");
      setHouseholdError("");

      try {
        const response = await fetch("/api/estat/household");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "e-Stat household API response was not ok");
        }

        if (!cancelled) {
          setHouseholdData(data);
          setHouseholdStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setHouseholdError(error instanceof Error ? error.message : "Unknown error");
          setHouseholdStatus("error");
        }
      }
    }

    loadHousehold();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProduction() {
      setProductionStatus("loading");
      setProductionError("");

      try {
        const response = await fetch("/api/estat/production");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "e-Stat production API response was not ok");
        }

        if (!cancelled) {
          setProductionData(data);
          setProductionStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setProductionError(error instanceof Error ? error.message : "Unknown error");
          setProductionStatus("error");
        }
      }
    }

    loadProduction();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLodging() {
      setLodgingStatus("loading");
      setLodgingError("");

      try {
        const response = await fetch(`/api/estat/lodging?prefecture=${selectedPrefectureCode}`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "e-Stat lodging API response was not ok");
        }

        if (!cancelled) {
          setLodgingData(data);
          setLodgingError(data.fallback ? data.note ?? "" : "");
          setLodgingStatus(data.fallback ? "error" : "success");
        }
      } catch (error) {
        if (!cancelled) {
          setLodgingError(error instanceof Error ? error.message : "Unknown error");
          setLodgingStatus("error");
        }
      }
    }

    loadLodging();

    return () => {
      cancelled = true;
    };
  }, [selectedPrefectureCode]);

  useEffect(() => {
    let cancelled = false;

    async function loadLocalArchiveStatus() {
      setLocalArchiveStatus("loading");
      setLocalArchiveError("");

      try {
        const response = await fetch("/api/local-archive/status");
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error ?? "Local archive status response was not ok");
        }

        if (!cancelled) {
          setLocalArchiveData(data);
          setLocalArchiveStatus("success");
        }
      } catch (error) {
        if (!cancelled) {
          setLocalArchiveError(error instanceof Error ? error.message : "Unknown error");
          setLocalArchiveStatus("error");
        }
      }
    }

    loadLocalArchiveStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matched = wholesaleItems.filter((item) => {
      const tabMatched = matchesTab(item, activeTab);
      const queryMatched =
        normalizedQuery.length === 0 ||
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.group.toLowerCase().includes(normalizedQuery) ||
        item.judgment.toLowerCase().includes(normalizedQuery);
      return tabMatched && queryMatched;
    });
    return sortItems(matched, sortMode);
  }, [activeTab, query, sortMode]);

  const featuredItems = useMemo(() => {
    const regionCodes = new Set(selectedRegion.focusCodes);
    const regionItems = wholesaleItems.filter((item) => regionCodes.has(item.code));
    const fallbackItems = sortItems(wholesaleItems, "risk").filter(
      (item) => !regionCodes.has(item.code)
    );
    return sortItems([...regionItems, ...fallbackItems], "risk").slice(0, 4);
  }, [selectedRegion]);

  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMoreItems = visibleItems.length < filteredItems.length;

  const tabCounts = useMemo(() => {
    return categoryTabs.reduce<Record<string, number>>((counts, tab) => {
      counts[tab.id] = wholesaleItems.filter((item) => matchesTab(item, tab.id)).length;
      return counts;
    }, {});
  }, []);

  function resetVisibleItems() {
    setVisibleCount(PAGE_SIZE);
  }

  function handleTabChange(tabId: CategoryTab["id"]) {
    setActiveTab(tabId);
    resetVisibleItems();
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    resetVisibleItems();
  }

  function handleSortModeChange(value: SortMode) {
    setSortMode(value);
    resetVisibleItems();
  }

  function handleRegionChange(regionCode: RegionCode) {
    setSelectedRegionCode(regionCode);
    window.localStorage.setItem(REGION_STORAGE_KEY, regionCode);
    setSettingsSaveMessage("");
    resetVisibleItems();
  }

  function handlePrefectureChange(prefectureCode: PrefectureCode) {
    const prefecture = prefectureOptions.find((option) => option.code === prefectureCode);
    setSelectedPrefectureCode(prefectureCode);
    window.localStorage.setItem(PREFECTURE_STORAGE_KEY, prefectureCode);
    setSettingsSaveMessage("");
    if (prefecture) {
      setSelectedRegionCode(prefecture.regionCode);
      window.localStorage.setItem(REGION_STORAGE_KEY, prefecture.regionCode);
    }
  }

  function handlePreferredScreenChange(screenId: PreferredScreenId) {
    setPreferredScreen(screenId);
    window.localStorage.setItem(PREFERRED_SCREEN_STORAGE_KEY, screenId);
    setSettingsSaveMessage("");
  }

  function handleRegisterSettings() {
    window.localStorage.setItem(PREFERRED_SCREEN_STORAGE_KEY, preferredScreen);
    window.localStorage.setItem(REGION_STORAGE_KEY, selectedRegionCode);
    window.localStorage.setItem(PREFECTURE_STORAGE_KEY, selectedPrefectureCode);
    setSettingsSaveMessage("登録しました。次回アクセス時もこの設定で開きます。");
  }

  async function handleDatabaseSync() {
    setDatabaseSyncStatus("loading");
    setDatabaseSyncError("");

    try {
      const response = await fetch(
        `/api/admin/sync?region=${selectedRegionCode}&prefecture=${selectedPrefectureCode}`,
        {
          method: "POST"
        }
      );
      const data = await response.json();

      setDatabaseSyncData(data);

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Database sync failed");
      }

      setDatabaseSyncStatus("success");
    } catch (error) {
      setDatabaseSyncError(error instanceof Error ? error.message : "Unknown error");
      setDatabaseSyncStatus("error");
    }
  }

  const listPanelProps: WholesaleListPanelProps = {
    activeTab,
    filteredItems,
    hasMoreItems,
    onLoadMore: () => setVisibleCount((count) => count + PAGE_SIZE),
    onQueryChange: handleQueryChange,
    onSortModeChange: handleSortModeChange,
    onTabChange: handleTabChange,
    query,
    sortMode,
    tabCounts,
    visibleItems
  };

  return (
    <div className="app-shell">
      <aside className="rail" aria-label="主メニュー">
        <div className="brand-mark">
          <strong>{dashboardSummary.title}</strong>
          <span>地域仕入れ判断</span>
        </div>
        {screenItems.map((screen) => (
          <button
            className={`rail-button ${activeScreen === screen.id ? "active" : ""}`}
            key={screen.id}
            onClick={() => setActiveScreen(screen.id)}
            title={screen.label}
            aria-label={screen.label}
            type="button"
          >
            <span className={`rail-icon ${screen.icon}`} />
            <span className="rail-label">{screen.label}</span>
          </button>
        ))}
      </aside>

      <main className={`main screen-${activeScreen}`}>
        <header className="topbar">
          <div className="topbar-title">
            <h1>{dashboardSummary.title}</h1>
            <div className="subline">
              <span>{selectedRegion.market}</span>
              <span>{selectedRegion.weatherArea}</span>
              <span>{selectedRegion.updatedAt}</span>
            </div>
          </div>
          <div className="controls">
            <select
              className="select"
              aria-label="初期表示地域"
              onChange={(event) => handleRegionChange(event.target.value as RegionCode)}
              value={selectedRegionCode}
            >
              {regionProfiles.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.name}
                </option>
              ))}
            </select>
            <select className="select" aria-label="市場" value={selectedRegion.market} onChange={() => undefined}>
              <option>{selectedRegion.market}</option>
            </select>
            <span className="dashboard-weather-chip">
              <span className="weather-dot" aria-hidden="true" />
              <strong>{selectedRegion.weatherLabel}</strong>
              <small>23℃</small>
            </span>
            <span className="rain-chip">降水 10%</span>
            <span className="date-pill">{dashboardSummary.dateLabel}</span>
            <span className="update-pill">{selectedRegion.updatedAt}</span>
            <button className="topbar-icon-button" aria-label="通知" type="button">
              !
            </button>
            <span className="user-badge" aria-label="ユーザー">仕</span>
          </div>
        </header>

        <nav className="view-tabs" aria-label="画面切替">
          {screenItems.map((screen) => (
            <button
              className={`view-tab ${activeScreen === screen.id ? "active" : ""}`}
              key={screen.id}
              onClick={() => setActiveScreen(screen.id)}
              type="button"
            >
              {screen.label}
            </button>
          ))}
        </nav>

        {(activeScreen === "items" || activeScreen === "settings") && <RegionStrip region={selectedRegion} />}

        {activeScreen === "items" && (
          <>
            <RiceMarketPanel
              data={maffRiceData}
              error={maffRiceError}
              heatmapPeriod={heatmapPeriod}
              onHeatmapPeriodChange={setHeatmapPeriod}
              onSelectItem={setSelectedRiceItem}
              status={maffRiceStatus}
            />
            <WholesaleHeatmap
              heatmapPeriod={heatmapPeriod}
              items={wholesaleItems}
              onHeatmapPeriodChange={setHeatmapPeriod}
              onSelectItem={setSelectedHeatmapItem}
            />
            <LivestockHeatmap
              data={maffLivestockData}
              error={maffLivestockError}
              heatmapPeriod={heatmapPeriod}
              onHeatmapPeriodChange={setHeatmapPeriod}
              onSelectItem={setSelectedLivestockItem}
              status={maffLivestockStatus}
            />
          </>
        )}

        {activeScreen === "admin" && (
          <section className="admin-screen" aria-label="管理者画面">
            <DatabaseSyncPanel
              data={databaseSyncData}
              error={databaseSyncError}
              onSync={handleDatabaseSync}
              status={databaseSyncStatus}
            />
            <LocalArchivePanel
              data={localArchiveData}
              error={localArchiveError}
              status={localArchiveStatus}
            />
            <JmaWeatherPanel
              data={jmaWeatherData}
              error={jmaWeatherError}
              status={jmaWeatherStatus}
            />
            <PublicDataPanel
              data={householdData}
              error={householdError}
              status={householdStatus}
              subtitle="家計調査から野菜・果物・肉・魚・米/パンの支出候補を取得"
              title="家計調査データ"
            />
            <PublicDataPanel
              data={productionData}
              error={productionError}
              status={productionStatus}
              subtitle="作物統計・畜産物流通から生産高・作況・出荷量の候補を取得"
              title="生産高・作況データ"
            />
            <MaffLivestockPanel
              data={maffLivestockData}
              error={maffLivestockError}
              status={maffLivestockStatus}
            />
            <MaffRicePanel
              data={maffRiceData}
              error={maffRiceError}
              status={maffRiceStatus}
            />
            <EstatProducePanel
              data={estatProduceData}
              error={estatProduceError}
              status={estatProduceStatus}
            />
            <ScrapingSchedulePanel schedules={scrapingScheduleItems} />
          </section>
        )}

        {activeScreen === "dashboard" && (
          <section className="dashboard-screen" aria-label="ダッシュボード">
            <MonthlyWeatherOutlookPanel
              data={jmaWeatherData}
              error={jmaWeatherError}
              prefecture={selectedPrefecture}
              region={selectedRegion}
              status={jmaWeatherStatus}
            />

            <WeatherMoneyFlowPanel
              featuredItems={featuredItems}
              heatmapPeriod={heatmapPeriod}
              householdData={householdData}
              householdStatus={householdStatus}
              items={wholesaleItems}
              maffLivestockData={maffLivestockData}
              maffRiceData={maffRiceData}
              jmaWeatherData={jmaWeatherData}
              jmaWeatherStatus={jmaWeatherStatus}
              productionData={productionData}
              productionStatus={productionStatus}
              region={selectedRegion}
            />

            <WholesaleHeatmap
              heatmapPeriod={heatmapPeriod}
              items={wholesaleItems}
              onHeatmapPeriodChange={setHeatmapPeriod}
              onSelectItem={setSelectedHeatmapItem}
            />

            <section className="panel dashboard-lodging-panel" aria-label="宿泊需要サマリー">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">{selectedLodging.prefectureName}の宿泊需要</h2>
                  <span className="panel-subtitle">宿泊者数・外国人宿泊者数・客室稼働率</span>
                </div>
                <button className="panel-link-button" onClick={() => setActiveScreen("minpaku")} type="button">
                  詳細を見る
                </button>
              </div>
              <div className="dashboard-lodging-stats">
                <div>
                  <span>宿泊者数</span>
                  <strong>{formatCount(selectedLodging.totalGuests)}</strong>
                  <small>人泊</small>
                </div>
                <div>
                  <span>外国人宿泊者</span>
                  <strong>{formatCount(selectedLodging.foreignGuests)}</strong>
                  <small>人泊</small>
                </div>
                <div>
                  <span>客室稼働率</span>
                  <strong>{formatRate(selectedLodging.roomOccupancyRate)}</strong>
                  <small>前月比 {formatPercent(selectedLodging.monthChange)}</small>
                </div>
              </div>
              <div className="dashboard-nationality-bars" aria-label="国籍別宿泊者数">
                {selectedLodging.nationalityGuests.slice(0, 3).map((market) => (
                  <div key={market.country}>
                    <span>{market.country}</span>
                    <meter min={0} max={100} value={market.share} />
                    <strong>{formatCount(market.guests)}人泊</strong>
                  </div>
                ))}
              </div>
            </section>

          </section>
        )}

        {activeScreen === "items" && (
          <section className="screen-panel-grid" aria-label="食品画面">
            <div className="panel screen-intro-panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">食品</h2>
                  <span className="panel-subtitle">{selectedRegion.name}の食品を検索・カテゴリで確認</span>
                </div>
                <span className="panel-meta">{formatCount(filteredItems.length)}品目該当</span>
              </div>
              <div className="screen-intro-body">
                <strong>{selectedRegion.priceLabel}</strong>
                <p>{selectedRegion.demandNote}</p>
              </div>
            </div>
            <WholesaleListPanel {...listPanelProps} note="API化後はこの条件をDBクエリに渡す想定" />
          </section>
        )}

        {activeScreen === "minpaku" && (
          <MinpakuPanel
            lodging={selectedLodging}
            lodgingError={lodgingError}
            lodgingSourceLabel={lodgingSourceLabel}
            lodgingStatus={lodgingStatus}
            lodgingTables={lodgingTables}
            minpaku={selectedMinpaku}
            region={selectedRegion}
          />
        )}

        {activeScreen === "weather" && (
          <section className="screen-panel-grid two-column-screen" aria-label="天候画面">
            <JmaWeatherPanel
              className="full-width-panel"
              data={jmaWeatherData}
              error={jmaWeatherError}
              status={jmaWeatherStatus}
            />

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">{selectedRegion.name}の長期予報シグナル</h2>
                  <span className="panel-subtitle">{selectedRegion.weatherArea} / {selectedRegion.weatherLabel}</span>
                </div>
                <span className="panel-meta">長期予報</span>
              </div>
              <WeatherSignalPanel region={selectedRegion} />
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2 className="panel-title">天候連動の売場判断</h2>
                <span className="panel-meta">{selectedRegion.priceLabel}</span>
              </div>
              <div className="region-card-grid">
                {selectedRegion.highlights.map((metric) => (
                  <div className={`region-mini-card ${toneClass[metric.tone]}`} key={metric.label}>
                    <span>{metric.label}</span>
                    <strong>{metric.main}</strong>
                    <p>{metric.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel full-width-panel">
              <div className="panel-header">
                <h2 className="panel-title">価格推移と天候判断</h2>
                <span className="panel-meta">キャベツ中値 円/kg</span>
              </div>
              <WeatherChart />
            </div>
          </section>
        )}

        {activeScreen === "settings" && (
          <section className="screen-panel-grid" aria-label="設定画面">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">興味分野の初期設定</h2>
                  <span className="panel-subtitle">選んだ分野を次回アクセス時のトップ画面として開きます</span>
                </div>
                <span className="panel-meta">現在: {preferredScreenLabel}</span>
              </div>
              <div className="settings-region-grid">
                {preferredScreenItems.map((screen) => (
                  <button
                    className={`region-option ${preferredScreen === screen.id ? "active" : ""}`}
                    key={screen.id}
                    onClick={() => handlePreferredScreenChange(screen.id)}
                    type="button"
                  >
                    <span>{screen.label}</span>
                    <strong>{screen.label}をトップにする</strong>
                    <small>{screenDescriptions[screen.id]}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">初期表示地域の設定</h2>
                  <span className="panel-subtitle">選んだ地域の市場・天候・注目品目を各画面に反映します</span>
                </div>
                <span className="panel-meta">現在: {selectedRegion.name}</span>
              </div>
              <div className="settings-region-grid">
                {regionProfiles.map((region) => (
                  <button
                    className={`region-option ${selectedRegionCode === region.code ? "active" : ""}`}
                    key={region.code}
                    onClick={() => handleRegionChange(region.code)}
                    type="button"
                  >
                    <span>{region.name}</span>
                    <strong>{region.market}</strong>
                    <small>{region.weatherLabel} / {region.priceLabel}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="panel-title">自身の都道府県の設定</h2>
                  <span className="panel-subtitle">
                    登録した都道府県を、宿泊・天候・食品需要・民泊需要の初期表示に使います
                  </span>
                </div>
                <span className="panel-meta">現在: {selectedLodging.prefectureName}</span>
              </div>
              <div className="prefecture-setting-body">
                <label className="prefecture-select-box">
                  <span>自身の都道府県</span>
                  <select
                    aria-label="自身の都道府県"
                    onChange={(event) => handlePrefectureChange(event.target.value as PrefectureCode)}
                    value={selectedPrefectureCode}
                  >
                    {prefectureOptions.map((prefecture) => (
                      <option key={prefecture.code} value={prefecture.code}>
                        {prefecture.name}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="prefecture-preview-grid" aria-label="選択中の宿泊統計プレビュー">
                  <div>
                    <span>宿泊者数</span>
                    <strong>{formatCount(selectedLodging.totalGuests)}人泊</strong>
                  </div>
                  <div>
                    <span>外国人宿泊者数</span>
                    <strong>{formatCount(selectedLodging.foreignGuests)}人泊</strong>
                  </div>
                  <div>
                    <span>客室稼働率</span>
                    <strong>{formatRate(selectedLodging.roomOccupancyRate)}</strong>
                  </div>
                  <div>
                    <span>国籍別宿泊者数</span>
                    <strong>{selectedLodging.nationalityGuests[0]?.country ?? "集計中"}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel settings-save-panel">
              <div className="settings-save-body">
                <div>
                  <h2>設定を登録</h2>
                  <p>
                    トップ画面、初期表示地域、自身の都道府県を保存します。保存した設定は次回アクセス時にも反映されます。
                  </p>
                  <div className="settings-save-summary" aria-label="登録内容">
                    <span>トップ: {preferredScreenLabel}</span>
                    <span>地域: {selectedRegion.name}</span>
                    <span>都道府県: {selectedLodging.prefectureName}</span>
                  </div>
                </div>
                <div className="settings-save-actions">
                  <button className="settings-save-button" onClick={handleRegisterSettings} type="button">
                    登録する
                  </button>
                  {settingsSaveMessage && <strong>{settingsSaveMessage}</strong>}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      {selectedHeatmapItem && (
        <PriceDetailModal item={selectedHeatmapItem} onClose={() => setSelectedHeatmapItem(null)} />
      )}
      {selectedRiceItem && (
        <RiceDetailModal item={selectedRiceItem} onClose={() => setSelectedRiceItem(null)} />
      )}
      {selectedLivestockItem && (
        <LivestockDetailModal item={selectedLivestockItem} onClose={() => setSelectedLivestockItem(null)} />
      )}
    </div>
  );
}
