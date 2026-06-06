import { NextResponse } from "next/server";
import {
  getNationalityTravelExpense,
  prefectureLodgingProfiles,
  prefectureOptions,
  type LodgingNationalityGuest,
  type PrefectureCode,
  type PrefectureLodgingProfile,
  type Tone
} from "@/lib/mock-data";

const DEFAULT_ESTAT_BASE_URL = "https://api.e-stat.go.jp/rest/3.0/app/json";
const TABLE_FETCH_LIMIT = "8";
const VALUE_FETCH_LIMIT = "5000";

type LodgingMetricId = "totalGuests" | "foreignGuests" | "roomOccupancyRate" | "nationalityGuests";

type EstatTable = {
  id: string;
  title: string;
  statName: string;
  cycle: string;
  surveyDate: string;
  openDate: string;
  updatedDate: string;
};

type EstatValue = {
  label: string;
  unit: string;
  value: string;
  numericValue: number | null;
};

const lodgingSearches: Array<{
  id: LodgingMetricId;
  label: string;
  searchWord: string;
}> = [
  {
    id: "totalGuests",
    label: "宿泊者数",
    searchWord: "宿泊旅行統計調査 宿泊者数 都道府県"
  },
  {
    id: "foreignGuests",
    label: "外国人宿泊者数",
    searchWord: "宿泊旅行統計調査 外国人宿泊者数 都道府県"
  },
  {
    id: "roomOccupancyRate",
    label: "客室稼働率",
    searchWord: "宿泊旅行統計調査 客室稼働率 都道府県"
  },
  {
    id: "nationalityGuests",
    label: "国籍別宿泊者数",
    searchWord: "宿泊旅行統計調査 国籍別 外国人 宿泊者数 都道府県"
  }
];

const countryToneMap: Record<string, Tone> = {
  韓国: "green",
  台湾: "blue",
  中国: "red",
  米国: "amber",
  アメリカ: "amber",
  香港: "amber",
  タイ: "green",
  シンガポール: "blue",
  オーストラリア: "blue",
  イギリス: "blue",
  フランス: "blue",
  ドイツ: "blue"
};

function getText(value: unknown) {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (value && typeof value === "object" && "$" in value) {
    const text = (value as { $?: unknown }).$;
    return typeof text === "string" || typeof text === "number" ? String(text) : "";
  }
  return "";
}

function asArray<T>(value: T | T[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function normalizeNumber(value: string) {
  const normalized = value.replace(/,/g, "").trim();
  if (!normalized || normalized === "-") return null;
  const numericValue = Number(normalized);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function buildEstatUrl(endpoint: string, params: Record<string, string>) {
  const appId = process.env.ESTAT_APP_ID;

  if (!appId) {
    throw new Error("ESTAT_APP_ID is not set");
  }

  const baseUrl = process.env.ESTAT_API_BASE_URL ?? DEFAULT_ESTAT_BASE_URL;
  const url = new URL(`${baseUrl.replace(/\/$/, "")}/${endpoint}`);
  url.searchParams.set("appId", appId);

  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url;
}

async function fetchEstat(endpoint: string, params: Record<string, string>) {
  const response = await fetch(buildEstatUrl(endpoint, params), {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`e-Stat ${endpoint} failed: ${response.status}`);
  }

  return response.json();
}

function normalizeTables(data: unknown): EstatTable[] {
  const root = data as {
    GET_STATS_LIST?: {
      DATALIST_INF?: {
        TABLE_INF?: unknown | unknown[];
      };
    };
  };

  return asArray(root.GET_STATS_LIST?.DATALIST_INF?.TABLE_INF).map((table) => {
    const item = table as Record<string, unknown>;

    return {
      id: getText(item["@id"]),
      title: getText(item.TITLE),
      statName: getText(item.STAT_NAME),
      cycle: getText(item.CYCLE),
      surveyDate: getText(item.SURVEY_DATE),
      openDate: getText(item.OPEN_DATE),
      updatedDate: getText(item.UPDATED_DATE)
    };
  });
}

function buildClassLookup(data: unknown) {
  const lookup = new Map<string, Map<string, string>>();
  const root = data as {
    GET_STATS_DATA?: {
      STATISTICAL_DATA?: {
        CLASS_INF?: {
          CLASS_OBJ?: unknown | unknown[];
        };
      };
    };
  };
  const classObjects = asArray(root.GET_STATS_DATA?.STATISTICAL_DATA?.CLASS_INF?.CLASS_OBJ);

  classObjects.forEach((classObject) => {
    const item = classObject as {
      "@id"?: string;
      CLASS?: unknown | unknown[];
    };
    const id = item["@id"];
    if (!id) return;

    const values = new Map<string, string>();
    asArray(item.CLASS).forEach((classValue) => {
      const classItem = classValue as {
        "@code"?: string;
        "@name"?: string;
      };
      if (classItem["@code"] && classItem["@name"]) {
        values.set(classItem["@code"], classItem["@name"]);
      }
    });
    lookup.set(id, values);
  });

  return lookup;
}

function normalizeStatsValues(data: unknown): EstatValue[] {
  const root = data as {
    GET_STATS_DATA?: {
      STATISTICAL_DATA?: {
        DATA_INF?: {
          VALUE?: unknown | unknown[];
        };
      };
    };
  };
  const lookup = buildClassLookup(data);

  return asArray(root.GET_STATS_DATA?.STATISTICAL_DATA?.DATA_INF?.VALUE).map((value) => {
    const item = value as Record<string, unknown>;
    const labelParts = Object.entries(item)
      .filter(([key]) => key.startsWith("@cat"))
      .map(([key, code]) => {
        const categoryId = key.slice(1);
        return lookup.get(categoryId)?.get(String(code)) ?? String(code);
      })
      .filter(Boolean);
    const rawValue = getText(item.$);

    return {
      label: labelParts.join(" / "),
      unit: getText(item["@unit"]),
      value: rawValue,
      numericValue: normalizeNumber(rawValue)
    };
  });
}

function tablePriority(table: EstatTable, metricId: LodgingMetricId) {
  const title = `${table.title} ${table.statName}`;
  let score = 0;

  if (title.includes("宿泊旅行統計")) score -= 5;
  if (title.includes("都道府県")) score -= 4;
  if (title.includes("月次")) score -= 2;
  if (metricId === "foreignGuests" && title.includes("外国人")) score -= 5;
  if (metricId === "roomOccupancyRate" && title.includes("稼働率")) score -= 5;
  if (metricId === "nationalityGuests" && (title.includes("国籍") || title.includes("国・地域"))) score -= 5;

  return score;
}

function pickMetricValue(values: EstatValue[], prefectureName: string, metricId: LodgingMetricId) {
  const candidates = values.filter((value) => {
    if (!value.label.includes(prefectureName)) return false;
    if (value.numericValue === null) return false;
    if (metricId === "roomOccupancyRate") return value.unit.includes("%") || value.label.includes("稼働率");
    if (metricId === "foreignGuests") return value.label.includes("外国人") || value.label.includes("国籍");
    if (metricId === "totalGuests") return !value.label.includes("外国人") && !value.unit.includes("%");
    return false;
  });

  return candidates[0] ?? null;
}

function detectCountry(label: string) {
  return Object.keys(countryToneMap).find((country) => label.includes(country)) ?? null;
}

function pickNationalityValues(values: EstatValue[], prefectureName: string, foreignGuests: number) {
  const countryRows = values
    .map((value) => {
      const country = detectCountry(value.label);
      if (!country || value.numericValue === null) return null;
      if (!value.label.includes(prefectureName)) return null;

      return {
        country: country === "アメリカ" ? "米国" : country,
        guests: Math.round(value.numericValue),
        share: Math.max(4, Math.min(100, Math.round((value.numericValue / Math.max(1, foreignGuests)) * 100))),
        travelExpense: getNationalityTravelExpense(country, countryToneMap[country] ?? "slate"),
        tone: countryToneMap[country] ?? "slate"
      } satisfies LodgingNationalityGuest;
    })
    .filter((value): value is LodgingNationalityGuest => Boolean(value));

  const uniqueCountries = new Set<string>();
  return countryRows
    .sort((a, b) => b.guests - a.guests)
    .filter((row) => {
      if (uniqueCountries.has(row.country)) return false;
      uniqueCountries.add(row.country);
      return true;
    })
    .slice(0, 5);
}

function fallbackProfile(prefectureCode: PrefectureCode) {
  return (
    prefectureLodgingProfiles.find((profile) => profile.prefectureCode === prefectureCode) ??
    prefectureLodgingProfiles[0]
  );
}

function isPrefectureCode(value: string | null): value is PrefectureCode {
  return Boolean(value && prefectureOptions.some((prefecture) => prefecture.code === value));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const prefectureParam = url.searchParams.get("prefecture");
  const prefectureCode = isPrefectureCode(prefectureParam) ? prefectureParam : "tokyo";
  const fallback = fallbackProfile(prefectureCode);
  const prefectureName = fallback.prefectureName;

  if (!process.env.ESTAT_APP_ID) {
    return NextResponse.json({
      ok: true,
      source: "e-Stat API",
      generatedAt: new Date().toISOString(),
      fallback: true,
      note: "ESTAT_APP_ID未設定のため、都道府県別サンプルを表示しています。",
      profile: fallback,
      tables: []
    });
  }

  try {
    const metricResults = await Promise.all(
      lodgingSearches.map(async (search) => {
        const tables = normalizeTables(
          await fetchEstat("getStatsList", {
            searchWord: search.searchWord,
            limit: TABLE_FETCH_LIMIT
          })
        ).sort((a, b) => tablePriority(a, search.id) - tablePriority(b, search.id));
        const table = tables[0] ?? null;

        if (!table) {
          return {
            search,
            table: null,
            values: [],
            metricValue: null
          };
        }

        const statsData = await fetchEstat("getStatsData", {
          statsDataId: table.id,
          limit: VALUE_FETCH_LIMIT
        });
        const values = normalizeStatsValues(statsData);

        return {
          search,
          table,
          values,
          metricValue: search.id === "nationalityGuests" ? null : pickMetricValue(values, prefectureName, search.id)
        };
      })
    );

    const totalGuests =
      metricResults.find((result) => result.search.id === "totalGuests")?.metricValue?.numericValue ??
      fallback.totalGuests;
    const foreignGuests =
      metricResults.find((result) => result.search.id === "foreignGuests")?.metricValue?.numericValue ??
      fallback.foreignGuests;
    const roomOccupancyRate =
      metricResults.find((result) => result.search.id === "roomOccupancyRate")?.metricValue?.numericValue ??
      fallback.roomOccupancyRate;
    const nationalityValues =
      metricResults.find((result) => result.search.id === "nationalityGuests")?.values ?? [];
    const nationalityGuests = pickNationalityValues(nationalityValues, prefectureName, foreignGuests);
    const hasCoreMetric = metricResults.some((result) => result.metricValue?.numericValue !== null);
    const tables = metricResults
      .filter((result) => result.table)
      .map((result) => ({
        metricId: result.search.id,
        metricLabel: result.search.label,
        id: result.table?.id ?? "",
        title: result.table?.title ?? "",
        cycle: result.table?.cycle ?? "",
        surveyDate: result.table?.surveyDate ?? "",
        updatedDate: result.table?.updatedDate ?? "",
        matchedValue: result.metricValue?.value ?? null
      }));

    const profile: PrefectureLodgingProfile = {
      ...fallback,
      totalGuests: Math.round(totalGuests),
      foreignGuests: Math.round(foreignGuests),
      roomOccupancyRate: Number(roomOccupancyRate),
      nationalityGuests: nationalityGuests.length > 0 ? nationalityGuests : fallback.nationalityGuests,
      updatedAt: hasCoreMetric ? "e-Stat API取得済み" : "e-Stat候補確認 / サンプル補完",
      demandNote: hasCoreMetric
        ? `${prefectureName}の宿泊旅行統計調査候補から取得した宿泊・稼働データを表示しています。国籍別は取得できた候補を優先し、不足分はサンプルで補完します。`
        : `${fallback.demandNote} e-Statの候補テーブルは取得済みですが、画面用の値はサンプルで補完しています。`
    };

    return NextResponse.json({
      ok: true,
      source: "e-Stat 宿泊旅行統計調査",
      generatedAt: new Date().toISOString(),
      fallback: !hasCoreMetric,
      note: hasCoreMetric
        ? "宿泊者数・外国人宿泊者数・客室稼働率・国籍別候補をe-Statから取得しました。"
        : "e-Stat候補テーブルを取得し、値抽出できない項目はサンプルで補完しました。",
      profile,
      tables
    });
  } catch (error) {
    return NextResponse.json({
      ok: true,
      source: "e-Stat API",
      generatedAt: new Date().toISOString(),
      fallback: true,
      note: error instanceof Error ? error.message : "Unknown e-Stat lodging API error",
      profile: fallback,
      tables: []
    });
  }
}
