import { NextResponse } from "next/server";

const DEFAULT_ESTAT_BASE_URL = "https://api.e-stat.go.jp/rest/3.0/app/json";
const TABLE_FETCH_LIMIT = "20";
const VALUE_FETCH_LIMIT = "500";

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
};

const productionGroups = [
  {
    id: "vegetables",
    label: "野菜生産・出荷",
    searchWord: "作物統計調査 野菜 収穫量 出荷量",
    keywords: ["野菜", "収穫量", "出荷量", "作付面積"]
  },
  {
    id: "fruits",
    label: "果樹生産",
    searchWord: "作物統計調査 果樹 収穫量 出荷量",
    keywords: ["果樹", "果実", "収穫量", "出荷量"]
  },
  {
    id: "rice",
    label: "米生産・作況",
    searchWord: "作物統計調査 水稲 作況 収穫量",
    keywords: ["水稲", "作況", "収穫量", "作柄", "10a"]
  },
  {
    id: "livestock",
    label: "畜産・鶏卵生産",
    searchWord: "畜産物流通調査 鶏卵 生産量 出荷量",
    keywords: ["鶏卵", "生産量", "出荷量", "畜産"]
  }
] as const;

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

  return {
    total: dataList?.NUMBER ?? 0,
    tables: asArray(dataList?.TABLE_INF).map((table) => {
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
    })
  };
}

function getTablePriority(table: EstatTable) {
  const text = `${table.statName} ${table.title}`;
  let score = 0;

  if (text.includes("作物統計") || text.includes("畜産物流通")) score -= 8;
  if (text.includes("収穫量") || text.includes("出荷量") || text.includes("作況")) score -= 5;
  if (text.includes("年産") || text.includes("年次")) score -= 2;
  if (text.includes("都道府県")) score -= 2;
  return score;
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

  asArray(root.GET_STATS_DATA?.STATISTICAL_DATA?.CLASS_INF?.CLASS_OBJ).forEach((classObject) => {
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

function normalizeValues(data: unknown): EstatValue[] {
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
      .filter(([key]) => key.startsWith("@cat") || key.startsWith("@area") || key.startsWith("@time"))
      .map(([key, code]) => {
        const classId = key.slice(1);
        return lookup.get(classId)?.get(String(code)) ?? String(code);
      })
      .filter(Boolean);

    return {
      label: labelParts.join(" / "),
      unit: getText(item["@unit"]),
      value: getText(item.$)
    };
  });
}

function pickMatchedValues(values: EstatValue[], keywords: readonly string[]) {
  const matched = values.filter((value) => {
    const text = `${value.label} ${value.unit}`;
    return keywords.some((keyword) => text.includes(keyword));
  });
  return (matched.length > 0 ? matched : values).slice(0, 8);
}

export async function GET() {
  if (!process.env.ESTAT_APP_ID) {
    return NextResponse.json(
      {
        ok: false,
        error: "ESTAT_APP_ID is not set",
        help: "C:\\food_project\\web\\.env.local に ESTAT_APP_ID を設定してください。"
      },
      { status: 503 }
    );
  }

  try {
    const groups = await Promise.all(
      productionGroups.map(async (group) => {
        const listData = await fetchEstat("getStatsList", {
          searchWord: group.searchWord,
          limit: TABLE_FETCH_LIMIT
        });
        const normalized = normalizeTables(listData);
        const tables = [...normalized.tables].sort((a, b) => getTablePriority(a) - getTablePriority(b));
        const firstTable = tables[0];
        const values = firstTable
          ? normalizeValues(
              await fetchEstat("getStatsData", {
                statsDataId: firstTable.id,
                limit: VALUE_FETCH_LIMIT
              })
            )
          : [];

        return {
          id: group.id,
          label: group.label,
          searchWord: group.searchWord,
          totalTables: normalized.total,
          fetchedTables: tables.length,
          tables: tables.slice(0, 8),
          sample: {
            totalValues: values.length,
            matchedValues: pickMatchedValues(values, group.keywords)
          }
        };
      })
    );

    return NextResponse.json({
      ok: true,
      source: "e-Stat 作物統計・畜産物流通",
      generatedAt: new Date().toISOString(),
      groups,
      note: "生産高・作況・出荷量の候補統計表を取得しています。DB保存時は品目コード・地域コードを固定します。"
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown e-Stat production API error"
      },
      { status: 502 }
    );
  }
}
