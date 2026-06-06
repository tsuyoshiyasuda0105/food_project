const MAFF_RICE_PAGE_URL = "https://www.maff.go.jp/j/seisan/keikaku/soukatu/aitaikakaku.html";

export type MaffRiceRecord = Record<string, string>;

function decodeBuffer(buffer: ArrayBuffer, encoding: "utf-8" | "shift_jis") {
  return new TextDecoder(encoding).decode(buffer);
}

async function fetchBytes(url: string) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      accept: "text/html,text/csv,application/octet-stream,*/*"
    }
  });

  if (!response.ok) {
    throw new Error(`MAFF rice fetch failed: ${response.status} ${url}`);
  }

  return response.arrayBuffer();
}

function cleanHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replace(/\s+/g, " ")
    .trim();
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
    return columns.reduce<MaffRiceRecord>((record, column, index) => {
      record[column || `column_${index + 1}`] = cells[index] ?? "";
      return record;
    }, {});
  });

  return { columns, records };
}

function findLatestRiceCsv(html: string) {
  const firstLatestBlock = html.match(/相対取引価格・数量[\s\S]*?CSV[^<]*<\/a>/)?.[0] ?? html;
  const csvMatch = firstLatestBlock.match(/href="([^"]+\.csv)"[^>]*>\s*CSV/i) ?? html.match(/href="([^"]+\.csv)"[^>]*>\s*CSV/i);

  if (!csvMatch?.[1]) {
    throw new Error("Latest rice CSV link was not found");
  }

  return new URL(csvMatch[1], MAFF_RICE_PAGE_URL).toString();
}

function findLatestRiceTitle(html: string) {
  const titleMatch = html.match(/<li>\s*<a[^>]+>[\s\S]*?(令和[^<]+相対取引価格・数量[^<]+)<\/a>[\s\S]*?CSV/i);
  return titleMatch ? cleanHtml(titleMatch[1]) : "米の相対取引価格・数量";
}

export async function fetchMaffRice() {
  const html = decodeBuffer(await fetchBytes(MAFF_RICE_PAGE_URL), "utf-8");
  const csvUrl = findLatestRiceCsv(html);
  const csvText = decodeBuffer(await fetchBytes(csvUrl), "utf-8");
  const parsed = parseCsv(csvText);

  return {
    ok: true,
    source: "農林水産省 米の相対取引価格・数量",
    generatedAt: new Date().toISOString(),
    title: findLatestRiceTitle(html),
    sourceUrl: MAFF_RICE_PAGE_URL,
    csvUrl,
    totalRecords: parsed.records.length,
    columns: parsed.columns,
    records: parsed.records
  };
}
