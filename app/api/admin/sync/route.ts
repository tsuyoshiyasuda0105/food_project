import { NextResponse } from "next/server";
import { isSupabaseConfigured, upsertSupabaseRows } from "@/lib/supabase-rest";

type SyncEndpoint = {
  category: string;
  path: string;
  prefectureCode?: string;
  regionCode?: string;
  sourceKey: string;
  sourceName: string;
};

type EndpointPayload = {
  data: unknown;
  ok: boolean;
  sourceKey: string;
  sourceName: string;
};

function getJstDateString(date = new Date()) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== "literal") result[part.type] = part.value;
      return result;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

async function fetchInternalJson(origin: string, endpoint: SyncEndpoint): Promise<EndpointPayload> {
  try {
    const response = await fetch(`${origin}${endpoint.path}`, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });
    const data = await response.json();

    return {
      data,
      ok: response.ok && data?.ok !== false,
      sourceKey: endpoint.sourceKey,
      sourceName: endpoint.sourceName
    };
  } catch (error) {
    return {
      data: {
        error: error instanceof Error ? error.message : "Unknown API error"
      },
      ok: false,
      sourceKey: endpoint.sourceKey,
      sourceName: endpoint.sourceName
    };
  }
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toSnapshotRows(
  endpoints: SyncEndpoint[],
  payloads: EndpointPayload[],
  snapshotDate: string
) {
  const endpointLookup = new Map(endpoints.map((endpoint) => [endpoint.sourceKey, endpoint]));

  return payloads
    .filter((payload) => payload.ok)
    .flatMap((payload) => {
      const endpoint = endpointLookup.get(payload.sourceKey);
      if (!endpoint) return [];

      const data = asRecord(payload.data);
      const generatedAt =
        typeof data.generatedAt === "string" ? data.generatedAt : new Date().toISOString();
      const groups = Array.isArray(data.groups) ? data.groups : null;

      if (groups) {
        return groups.map((group) => {
          const groupRecord = asRecord(group);
          const category =
            typeof groupRecord.id === "string"
              ? groupRecord.id
              : typeof groupRecord.kind === "string"
                ? groupRecord.kind
                : endpoint.category;

          return {
            category,
            generated_at: generatedAt,
            payload: group,
            prefecture_code: endpoint.prefectureCode ?? "all",
            region_code: endpoint.regionCode ?? "all",
            snapshot_date: snapshotDate,
            source_key: endpoint.sourceKey,
            source_name: endpoint.sourceName
          };
        });
      }

      return [
        {
          category: endpoint.category,
          generated_at: generatedAt,
          payload: payload.data,
          prefecture_code: endpoint.prefectureCode ?? "all",
          region_code: endpoint.regionCode ?? "all",
          snapshot_date: snapshotDate,
          source_key: endpoint.sourceKey,
          source_name: endpoint.sourceName
        }
      ];
    });
}

function toForecastRows(forecastResponse: EndpointPayload, snapshotDate: string) {
  if (!forecastResponse.ok) return [];
  const data = asRecord(forecastResponse.data);
  const forecasts = Array.isArray(data.forecasts) ? data.forecasts : [];
  const generatedAt = typeof data.generatedAt === "string" ? data.generatedAt : new Date().toISOString();

  return forecasts.map((forecast) => {
    const item = asRecord(forecast);

    return {
      category: String(item.id ?? "unknown"),
      confidence: Number(item.confidence ?? 0),
      demand_label: String(item.demandLabel ?? ""),
      demand_score: Number(item.demandScore ?? 0),
      drivers: {
        history: item.historyDriver,
        supply: item.supplyDriver,
        weather: item.weatherDriver
      },
      forecast_date: snapshotDate,
      generated_at: generatedAt,
      payload: forecast,
      region_code: String(item.regionCode ?? "all")
    };
  });
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    configured: isSupabaseConfigured(),
    requiredTables: ["data_snapshots", "demand_forecasts"],
    schemaPath: "supabase/schema.sql",
    note: "POSTすると、取れる分だけAPI取得してSupabaseへupsertします。"
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const regionCode = url.searchParams.get("region") ?? "kanto";
  const prefectureCode = url.searchParams.get("prefecture") ?? "tokyo";
  const snapshotDate = getJstDateString();

  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        schemaPath: "supabase/schema.sql",
        error: "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for DB sync"
      },
      { status: 503 }
    );
  }

  const endpoints: SyncEndpoint[] = [
    {
      category: "weather",
      path: `/api/jma/weather?region=${regionCode}&days=7`,
      regionCode,
      sourceKey: "jma_weather",
      sourceName: "気象庁 天候・気温・降水量"
    },
    {
      category: "produce",
      path: "/api/estat/produce",
      sourceKey: "estat_produce",
      sourceName: "e-Stat 青果物卸売市場調査"
    },
    {
      category: "household",
      path: "/api/estat/household",
      sourceKey: "estat_household",
      sourceName: "e-Stat 家計調査"
    },
    {
      category: "production",
      path: "/api/estat/production",
      sourceKey: "estat_production",
      sourceName: "e-Stat 生産高・作況"
    },
    {
      category: "lodging",
      path: `/api/estat/lodging?prefecture=${prefectureCode}`,
      prefectureCode,
      sourceKey: "estat_lodging",
      sourceName: "e-Stat 宿泊旅行統計"
    },
    {
      category: "livestock",
      path: "/api/maff/livestock",
      sourceKey: "maff_livestock",
      sourceName: "農林水産省 食肉・鶏卵"
    },
    {
      category: "rice",
      path: "/api/maff/rice",
      sourceKey: "maff_rice",
      sourceName: "農林水産省 米相対取引価格"
    }
  ];

  const forecastEndpoint: SyncEndpoint = {
    category: "forecast",
    path: `/api/demand/forecast?region=${regionCode}`,
    regionCode,
    sourceKey: "demand_forecast",
    sourceName: "需要予測"
  };

  const [payloads, forecastPayload] = await Promise.all([
    Promise.all(endpoints.map((endpoint) => fetchInternalJson(origin, endpoint))),
    fetchInternalJson(origin, forecastEndpoint)
  ]);
  const snapshotRows = toSnapshotRows(endpoints, payloads, snapshotDate);
  const forecastRows = toForecastRows(forecastPayload, snapshotDate);
  const snapshotWrite = await upsertSupabaseRows(
    "data_snapshots",
    snapshotRows,
    "source_key,category,region_code,prefecture_code,snapshot_date"
  );
  const forecastWrite = await upsertSupabaseRows(
    "demand_forecasts",
    forecastRows,
    "category,region_code,forecast_date"
  );

  return NextResponse.json({
    ok: snapshotWrite.ok && forecastWrite.ok,
    generatedAt: new Date().toISOString(),
    snapshotDate,
    sources: payloads.map((payload) => ({
      ok: payload.ok,
      sourceKey: payload.sourceKey,
      sourceName: payload.sourceName
    })),
    writes: [snapshotWrite, forecastWrite]
  });
}
