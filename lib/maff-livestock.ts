const MAFF_SEISEN_BASE_URL = "https://www.seisen.maff.go.jp";

type MaffKind = "pork" | "beef" | "egg";

type MaffKindConfig = {
  kind: MaffKind;
  label: string;
  indexPath: string;
  detailPath: string;
  csvPath: string;
  reportAreaLabel: string;
  notice: string;
};

export type MaffCsvRecord = Record<string, string>;

export type MaffLivestockReport = {
  reportId: string;
  areaName: string;
  records: MaffCsvRecord[];
  columns: string[];
};

export type MaffLivestockGroup = {
  kind: MaffKind;
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

const KIND_CONFIGS: MaffKindConfig[] = [
  {
    kind: "pork",
    label: "豚",
    indexPath: "/seisen/bs04b040md001/BS04B040UC040SC001-Evt001.do",
    detailPath: "/seisen/bs04b040md001/BS04B040UC040SC002-Evt001.do",
    csvPath: "/seisen/bs04b040md001/BS04B040UC040SC002-Evt005.do",
    reportAreaLabel: "市場",
    notice: "食肉卸売市場調査（日別）。価格単位は円/kg、税込8%。"
  },
  {
    kind: "beef",
    label: "牛",
    indexPath: "/seisen/bs04b040md001/BS04B040UC040SC001-Evt002.do",
    detailPath: "/seisen/bs04b040md001/BS04B040UC050SC001-Evt001.do",
    csvPath: "/seisen/bs04b040md001/BS04B040UC050SC001-Evt005.do",
    reportAreaLabel: "市場",
    notice: "食肉卸売市場調査（日別）。価格単位は円/kg、税込8%。"
  },
  {
    kind: "egg",
    label: "鶏卵",
    indexPath: "/seisen/bs04b040md001/BS04B040UC040SC001-Evt004.do",
    detailPath: "/seisen/bs04b040md001/BS04B040UC080SC001-Evt001.do",
    csvPath: "/seisen/bs04b040md001/BS04B040UC080SC001-Evt005.do",
    reportAreaLabel: "都市",
    notice: "鶏卵市況情報。入荷量はt、規格別卸売価格は円/kg、税別。"
  }
];

function getConfig(kind: MaffKind) {
  return KIND_CONFIGS.find((config) => config.kind === kind);
}

function buildUrl(path: string) {
  return `${MAFF_SEISEN_BASE_URL}${path}`;
}

function decodeBuffer(buffer: ArrayBuffer, encoding: "utf-8" | "shift_jis") {
  return new TextDecoder(encoding).decode(buffer);
}

async function fetchText(path: string, init?: RequestInit) {
  const response = await fetch(buildUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      accept: "text/html,application/xhtml+xml,text/plain,*/*",
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    throw new Error(`MAFF fetch failed: ${response.status} ${path}`);
  }

  return decodeBuffer(await response.arrayBuffer(), "utf-8");
}

async function postFormBytes(path: string, form: Record<string, string>) {
  const body = new URLSearchParams(form);
  const response = await fetch(buildUrl(path), {
    method: "POST",
    cache: "no-store",
    headers: {
      accept: "application/octet-stream,text/csv,*/*",
      "content-type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error(`MAFF POST failed: ${response.status} ${path}`);
  }

  return response.arrayBuffer();
}

function decodeEntities(value: string) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function cleanHtmlText(value: string) {
  return decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
}

function extractDates(html: string) {
  const dates = Array.from(html.matchAll(/name="s006\.dataDate"\s+value="(\d{8})"/g)).map(
    (match) => match[1]
  );
  return Array.from(new Set(dates));
}

function formatDateLabel(date: string) {
  if (!/^\d{8}$/.test(date)) return date;
  const year = Number(date.slice(0, 4));
  const month = Number(date.slice(4, 6));
  const day = Number(date.slice(6, 8));
  return `${year}年${month}月${day}日`;
}

function extractReportLinks(html: string, areaLabel: string) {
  const rows = Array.from(html.matchAll(/<tr[\s\S]*?<\/tr>/g)).map((match) => match[0]);

  return rows.flatMap((row) => {
    const csvId = row.match(/chohyoSubmit\('form003','([^']+)'\)/)?.[1];
    if (!csvId) return [];

    const cells = Array.from(row.matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/g)).map((match) =>
      cleanHtmlText(match[1])
    );
    const areaName = cells[1] || areaLabel;

    return [
      {
        reportId: csvId,
        areaName
      }
    ];
  });
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === "\"" && quoted && next === "\"") {
      cell += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      cells.push(cell.trim());
      cell = "";
      continue;
    }

    cell += char;
  }

  cells.push(cell.trim());
  return cells;
}

function parseCsv(text: string) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const [headerLine, ...bodyLines] = lines;
  const columns = headerLine ? parseCsvLine(headerLine) : [];
  const records = bodyLines.map((line) => {
    const cells = parseCsvLine(line);
    return columns.reduce<MaffCsvRecord>((record, column, index) => {
      record[column] = cells[index] ?? "";
      return record;
    }, {});
  });

  return {
    columns,
    records
  };
}

async function fetchReport(config: MaffKindConfig, report: { reportId: string; areaName: string }) {
  const bytes = await postFormBytes(config.csvPath, {
    "s004.chohyoKanriNo": report.reportId
  });
  const csvText = decodeBuffer(bytes, "shift_jis");
  const parsed = parseCsv(csvText);

  return {
    reportId: report.reportId,
    areaName: report.areaName,
    records: parsed.records,
    columns: parsed.columns
  };
}

export async function fetchMaffLivestockGroup(kind: MaffKind, date?: string) {
  const config = getConfig(kind);

  if (!config) {
    throw new Error(`Unknown MAFF livestock kind: ${kind}`);
  }

  const indexHtml = await fetchText(config.indexPath);
  const availableDates = extractDates(indexHtml);
  const latestDate = date ?? availableDates[0];

  if (!latestDate) {
    throw new Error(`No available dates found for ${kind}`);
  }

  const detailHtml = await fetchText(config.detailPath, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      "s006.dataDate": latestDate
    })
  });
  const reports = extractReportLinks(detailHtml, config.reportAreaLabel);
  const fetchedReports = await Promise.all(reports.map((report) => fetchReport(config, report)));
  const columns = Array.from(new Set(fetchedReports.flatMap((report) => report.columns)));
  const totalRecords = fetchedReports.reduce((sum, report) => sum + report.records.length, 0);

  return {
    kind: config.kind,
    label: config.label,
    latestDate,
    dateLabel: formatDateLabel(latestDate),
    availableDates,
    reportAreaLabel: config.reportAreaLabel,
    totalRecords,
    reports: fetchedReports,
    columns,
    notice: config.notice,
    sourceUrl: buildUrl(config.indexPath)
  };
}

export async function fetchMaffLivestock(date?: string) {
  const groups = await Promise.all(KIND_CONFIGS.map((config) => fetchMaffLivestockGroup(config.kind, date)));

  return {
    ok: true,
    source: "農林水産省 生鮮取引電子化推進協議会 日別市況",
    generatedAt: new Date().toISOString(),
    groups
  };
}
