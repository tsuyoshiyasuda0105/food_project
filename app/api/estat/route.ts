import { NextResponse } from "next/server";

const DEFAULT_ESTAT_BASE_URL = "https://api.e-stat.go.jp/rest/3.0/app/json";
const ESTAT_ENDPOINTS = new Set(["getStatsList", "getMetaInfo", "getStatsData"]);

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

function normalizeStatsList(data: unknown) {
  const root = data as {
    GET_STATS_LIST?: {
      DATALIST_INF?: {
        NUMBER?: number;
        RESULT_INF?: {
          FROM_NUMBER?: number;
          TO_NUMBER?: number;
          NEXT_KEY?: number;
        };
        TABLE_INF?: unknown | unknown[];
      };
    };
  };
  const dataList = root.GET_STATS_LIST?.DATALIST_INF;
  const tables = asArray(dataList?.TABLE_INF);

  return {
    total: dataList?.NUMBER ?? tables.length,
    result: dataList?.RESULT_INF ?? null,
    tables: tables.map((table) => {
      const item = table as Record<string, unknown>;
      return {
        id: getText(item["@id"]),
        statName: getText(item.STAT_NAME),
        organization: getText(item.GOV_ORG),
        title: getText(item.TITLE),
        cycle: getText(item.CYCLE),
        surveyDate: getText(item.SURVEY_DATE),
        openDate: getText(item.OPEN_DATE),
        updatedDate: getText(item.UPDATED_DATE)
      };
    })
  };
}

function buildEstatUrl(requestUrl: string) {
  const appId = process.env.ESTAT_APP_ID;

  if (!appId) {
    return {
      error: "ESTAT_APP_ID is not set",
      status: 503
    } as const;
  }

  const incomingUrl = new URL(requestUrl);
  const endpoint = incomingUrl.searchParams.get("endpoint") ?? "getStatsList";

  if (!ESTAT_ENDPOINTS.has(endpoint)) {
    return {
      error: `Unsupported e-Stat endpoint: ${endpoint}`,
      status: 400
    } as const;
  }

  const baseUrl = process.env.ESTAT_API_BASE_URL ?? DEFAULT_ESTAT_BASE_URL;
  const estatUrl = new URL(`${baseUrl.replace(/\/$/, "")}/${endpoint}`);
  estatUrl.searchParams.set("appId", appId);

  incomingUrl.searchParams.forEach((value, key) => {
    if (key !== "endpoint" && key !== "appId") {
      estatUrl.searchParams.set(key, value);
    }
  });

  if (endpoint === "getStatsList" && !estatUrl.searchParams.has("searchWord")) {
    estatUrl.searchParams.set("searchWord", "青果物卸売市場調査");
    estatUrl.searchParams.set("limit", "20");
  }

  return { estatUrl } as const;
}

export async function GET(request: Request) {
  const result = buildEstatUrl(request.url);
  const incomingUrl = new URL(request.url);

  if ("error" in result) {
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        help: "Add ESTAT_APP_ID to C:\\food_project\\web\\.env.local, then restart the dev server."
      },
      { status: result.status }
    );
  }

  try {
    const response = await fetch(result.estatUrl, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "e-Stat API request failed",
          status: response.status,
          body: await response.text()
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const endpoint = result.estatUrl.pathname.split("/").at(-1);
    const raw = incomingUrl.searchParams.get("raw") === "1";

    if (!raw && endpoint === "getStatsList") {
      return NextResponse.json({
        ok: true,
        source: "e-Stat",
        endpoint,
        searchWord: result.estatUrl.searchParams.get("searchWord"),
        data: normalizeStatsList(data)
      });
    }

    return NextResponse.json({
      ok: true,
      source: "e-Stat",
      endpoint,
      data
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown e-Stat API error"
      },
      { status: 502 }
    );
  }
}
