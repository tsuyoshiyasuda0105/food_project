import { NextResponse } from "next/server";

type RegionCode = "kanto" | "tokai" | "kinki" | "kyushu";

const JMA_BASE_URL = "https://www.jma.go.jp/bosai";
const regionWeatherSources: Record<
  RegionCode,
  {
    label: string;
    forecastAreaCode: string;
    amedasCode: string;
    amedasName: string;
  }
> = {
  kanto: {
    label: "関東甲信",
    forecastAreaCode: "130000",
    amedasCode: "44132",
    amedasName: "東京"
  },
  tokai: {
    label: "東海",
    forecastAreaCode: "230000",
    amedasCode: "51106",
    amedasName: "名古屋"
  },
  kinki: {
    label: "近畿",
    forecastAreaCode: "270000",
    amedasCode: "62078",
    amedasName: "大阪"
  },
  kyushu: {
    label: "九州北部",
    forecastAreaCode: "400000",
    amedasCode: "82182",
    amedasName: "福岡"
  }
};

function isRegionCode(value: string | null): value is RegionCode {
  return value === "kanto" || value === "tokai" || value === "kinki" || value === "kyushu";
}

function getArrayValue(data: unknown, key: string) {
  const value = (data as Record<string, unknown> | undefined)?.[key];
  if (!Array.isArray(value)) return null;
  const numericValue = Number(value[0]);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function parseLatestTimeStamp(value: string) {
  const match = value.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/);
  if (!match) return null;
  return `${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}${match[6]}`;
}

function formatJstTimestamp(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Tokyo",
    year: "numeric"
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      if (part.type !== "literal") result[part.type] = part.value;
      return result;
    }, {});

  return `${parts.year}${parts.month}${parts.day}${parts.hour}${parts.minute}${parts.second}`;
}

async function fetchJson(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status}`);
  }

  return response.json();
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "text/plain"
    }
  });

  if (!response.ok) {
    throw new Error(`${url} failed: ${response.status}`);
  }

  return response.text();
}

function normalizeForecast(data: unknown) {
  const reports = Array.isArray(data) ? data : [];
  const firstReport = reports[0] as
    | {
        reportDatetime?: string;
        timeSeries?: Array<{
          timeDefines?: string[];
          areas?: Array<Record<string, unknown>>;
        }>;
      }
    | undefined;
  const weatherSeries = firstReport?.timeSeries?.[0];
  const popSeries = firstReport?.timeSeries?.find((series) =>
    series.areas?.some((area) => Array.isArray(area.pops))
  );
  const tempSeries = firstReport?.timeSeries?.find((series) =>
    series.areas?.some((area) => Array.isArray(area.temps))
  );
  const weatherArea = weatherSeries?.areas?.[0] ?? {};
  const popArea = popSeries?.areas?.[0] ?? {};
  const tempArea = tempSeries?.areas?.[0] ?? {};

  return {
    reportDatetime: firstReport?.reportDatetime ?? "",
    targetArea: String((weatherArea.area as { name?: string } | undefined)?.name ?? ""),
    weather:
      Array.isArray(weatherArea.weathers) && weatherArea.weathers.length > 0
        ? String(weatherArea.weathers[0])
        : "",
    wind:
      Array.isArray(weatherArea.winds) && weatherArea.winds.length > 0
        ? String(weatherArea.winds[0])
        : "",
    wave:
      Array.isArray(weatherArea.waves) && weatherArea.waves.length > 0
        ? String(weatherArea.waves[0])
        : "",
    precipitationProbabilities: Array.isArray(popArea.pops) ? popArea.pops.map(String).slice(0, 6) : [],
    temperatures: Array.isArray(tempArea.temps) ? tempArea.temps.map(String).slice(0, 6) : [],
    timeDefines: weatherSeries?.timeDefines?.slice(0, 6) ?? []
  };
}

function normalizeAmedasMap(data: unknown, amedasCode: string, timestamp: string) {
  const point = (data as Record<string, unknown>)[amedasCode];

  return {
    timestamp,
    temperature: getArrayValue(point, "temp"),
    precipitation10m: getArrayValue(point, "precipitation10m"),
    precipitation1h: getArrayValue(point, "precipitation1h"),
    precipitation24h: getArrayValue(point, "precipitation24h"),
    humidity: getArrayValue(point, "humidity"),
    sunshineDuration: getArrayValue(point, "sun10m"),
    wind: getArrayValue(point, "wind")
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const regionParam = url.searchParams.get("region");
  const region: RegionCode = isRegionCode(regionParam) ? regionParam : "kanto";
  const days = Math.min(10, Math.max(1, Number(url.searchParams.get("days") ?? 7)));
  const source = regionWeatherSources[region];

  try {
    const [forecastData, latestTimeText] = await Promise.all([
      fetchJson(`${JMA_BASE_URL}/forecast/data/forecast/${source.forecastAreaCode}.json`),
      fetchText(`${JMA_BASE_URL}/amedas/data/latest_time.txt`)
    ]);
    const latestTimestamp = parseLatestTimeStamp(latestTimeText.trim());

    if (!latestTimestamp) {
      throw new Error("JMA latest_time format was not recognized");
    }

    const latestDate = new Date(latestTimeText.trim());
    const timestamps = Array.from({ length: days }, (_, index) => {
      if (index === 0) return latestTimestamp;
      return formatJstTimestamp(new Date(latestDate.getTime() - index * 24 * 60 * 60 * 1000));
    });
    const observations = (
      await Promise.all(
        timestamps.map(async (timestamp) => {
          try {
            const mapData = await fetchJson(`${JMA_BASE_URL}/amedas/data/map/${timestamp}.json`);
            return normalizeAmedasMap(mapData, source.amedasCode, timestamp);
          } catch {
            return null;
          }
        })
      )
    ).filter(Boolean);

    return NextResponse.json({
      ok: true,
      source: "気象庁",
      generatedAt: new Date().toISOString(),
      region,
      area: source.label,
      station: {
        code: source.amedasCode,
        name: source.amedasName
      },
      forecast: normalizeForecast(forecastData),
      observations,
      note: "予報JSONとアメダス実況データから、天候・気温・降水量を取得しています。長期の過去データは気象庁CSVを別バッチで保存する想定です。"
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        source: "気象庁",
        error: error instanceof Error ? error.message : "Unknown JMA weather API error"
      },
      { status: 502 }
    );
  }
}
