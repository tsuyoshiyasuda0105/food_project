import { NextResponse } from "next/server";
import { buildDemandForecasts, type DemandForecastInputs } from "@/lib/demand-forecast";
import { type RegionCode, wholesaleItems } from "@/lib/mock-data";

type EndpointResult = {
  data: unknown;
  ok: boolean;
  source: string;
};

const regionCodes = new Set(["kanto", "tokai", "kinki", "kyushu"]);

function isRegionCode(value: string | null): value is RegionCode {
  return Boolean(value && regionCodes.has(value));
}

async function fetchInternalJson(origin: string, path: string, source: string): Promise<EndpointResult> {
  try {
    const response = await fetch(`${origin}${path}`, {
      cache: "no-store",
      headers: {
        accept: "application/json"
      }
    });
    const data = await response.json();

    return {
      data,
      ok: response.ok && data?.ok !== false,
      source
    };
  } catch (error) {
    return {
      data: {
        error: error instanceof Error ? error.message : "Unknown API error"
      },
      ok: false,
      source
    };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const regionParam = url.searchParams.get("region");
  const regionCode: RegionCode = isRegionCode(regionParam) ? regionParam : "kanto";
  const generatedAt = new Date().toISOString();

  const [jma, household, production, livestock, rice] = await Promise.all([
    fetchInternalJson(origin, `/api/jma/weather?region=${regionCode}&days=7`, "気象庁"),
    fetchInternalJson(origin, "/api/estat/household", "e-Stat 家計調査"),
    fetchInternalJson(origin, "/api/estat/production", "e-Stat 生産高・作況"),
    fetchInternalJson(origin, "/api/maff/livestock", "農林水産省 食肉・鶏卵"),
    fetchInternalJson(origin, "/api/maff/rice", "農林水産省 米")
  ]);

  const forecasts = buildDemandForecasts({
    generatedAt,
    household: household.ok ? (household.data as DemandForecastInputs["household"]) : null,
    jma: jma.ok ? (jma.data as DemandForecastInputs["jma"]) : null,
    livestock: livestock.ok ? (livestock.data as DemandForecastInputs["livestock"]) : null,
    production: production.ok ? (production.data as DemandForecastInputs["production"]) : null,
    regionCode,
    rice: rice.ok ? (rice.data as DemandForecastInputs["rice"]) : null,
    wholesaleItems
  });

  return NextResponse.json({
    ok: true,
    source: "需要予測API",
    generatedAt,
    model: "家計調査の過去候補、気象庁予報、卸売/食肉/米市況、生産高候補を組み合わせた説明可能な初期モデル",
    regionCode,
    inputs: [jma, household, production, livestock, rice].map((result) => ({
      ok: result.ok,
      source: result.source
    })),
    forecasts
  });
}
