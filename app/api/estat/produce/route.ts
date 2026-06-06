import { NextResponse } from "next/server";

const DEFAULT_ESTAT_BASE_URL = "https://api.e-stat.go.jp/rest/3.0/app/json";
const GROUPS = [
  {
    id: "vegetable",
    label: "野菜",
    searchWord: "青果物卸売市場調査 野菜"
  },
  {
    id: "fruit",
    label: "果物",
    searchWord: "青果物卸売市場調査 果実"
  }
] as const;

const TABLE_FETCH_LIMIT = "100";
const VALUE_FETCH_LIMIT = "200";

type EstatTable = {
  id: string;
  title: string;
  statName: string;
  cycle: string;
  surveyDate: string;
  openDate: string;
  updatedDate: string;
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

function normalizeTables(data: unknown): { total: number; tables: EstatTable[] } {
  const root = data as {
    GET_STATS_LIST?: {
      DATALIST_INF?: {
        NUMBER?: number;
        TABLE_INF?: unknown | unknown[];
      };
    };
  };
  const dataList = root.GET_STATS_LIST?.DATALIST_INF;
  const rawTables = asArray(dataList?.TABLE_INF);
  const tables = rawTables.map((table) => {
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

  return {
    total: dataList?.NUMBER ?? tables.length,
    tables
  };
}

function getTablePriority(table: EstatTable) {
  const title = table.title;

  if (title.includes("全国及び主要都市")) return 0;
  if (title.includes("主要都市の月別")) return 1;
  if (title.includes("卸売市場別")) return 2;
  if (title.includes("卸売数量・価額・価格")) return 3;
  if (title.includes("卸売価格")) return 4;
  return 9;
}

function sortTablesForPriceDisplay(tables: EstatTable[]) {
  return [...tables].sort((a, b) => getTablePriority(a) - getTablePriority(b));
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

function normalizeStatsSample(data: unknown) {
  const root = data as {
    GET_STATS_DATA?: {
      STATISTICAL_DATA?: {
        RESULT_INF?: {
          TOTAL_NUMBER?: number;
          FROM_NUMBER?: number;
          TO_NUMBER?: number;
          NEXT_KEY?: number;
        };
        TABLE_INF?: unknown;
        DATA_INF?: {
          VALUE?: unknown | unknown[];
        };
      };
    };
  };
  const statisticalData = root.GET_STATS_DATA?.STATISTICAL_DATA;
  const tableInfo = statisticalData?.TABLE_INF as Record<string, unknown> | undefined;
  const lookup = buildClassLookup(data);
  const values = asArray(statisticalData?.DATA_INF?.VALUE).map((value) => {
    const item = value as Record<string, unknown>;
    const labelParts = Object.entries(item)
      .filter(([key]) => key.startsWith("@cat"))
      .map(([key, code]) => {
        const categoryId = key.slice(1);
        return lookup.get(categoryId)?.get(String(code)) ?? String(code);
      })
      .filter(Boolean);

    return {
      label: labelParts.join(" / "),
      unit: getText(item["@unit"]),
      value: getText(item.$)
    };
  });
  const middleValues = values.filter((value) => `${value.label} ${value.unit}`.includes("中値"));
  const priceValues = values.filter((value) => {
    const text = `${value.label} ${value.unit}`;
    return (
      text.includes("中値") ||
      text.includes("価格") ||
      text.includes("高値") ||
      text.includes("安値") ||
      text.includes("円")
    );
  });

  return {
    totalRows: statisticalData?.RESULT_INF?.TOTAL_NUMBER ?? values.length,
    from: statisticalData?.RESULT_INF?.FROM_NUMBER ?? 1,
    to: statisticalData?.RESULT_INF?.TO_NUMBER ?? values.length,
    nextKey: statisticalData?.RESULT_INF?.NEXT_KEY ?? null,
    title: tableInfo ? getText(tableInfo.TITLE) : "",
    values,
    middleValues,
    priceValues
  };
}

export async function GET() {
  try {
    const groups = await Promise.all(
      GROUPS.map(async (group) => {
        const listData = await fetchEstat("getStatsList", {
          searchWord: group.searchWord,
          limit: TABLE_FETCH_LIMIT
        });
        const normalized = normalizeTables(listData);
        const tables = sortTablesForPriceDisplay(normalized.tables);
        const firstTable = tables[0];
        const sample = firstTable
          ? normalizeStatsSample(
              await fetchEstat("getStatsData", {
                statsDataId: firstTable.id,
                limit: VALUE_FETCH_LIMIT
              })
            )
          : null;

        return {
          ...group,
          totalTables: normalized.total,
          fetchedTables: tables.length,
          tables,
          sample
        };
      })
    );

    return NextResponse.json({
      ok: true,
      source: "e-Stat",
      generatedAt: new Date().toISOString(),
      groups
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown e-Stat produce API error"
      },
      { status: 502 }
    );
  }
}
