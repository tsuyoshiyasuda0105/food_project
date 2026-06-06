type SupabaseConfig = {
  key: string;
  url: string;
};

export type SupabaseWriteResult = {
  error?: string;
  ok: boolean;
  rows: number;
  table: string;
};

function normalizeSupabaseUrl(value: string) {
  return value.replace(/\/$/, "");
}

export function isSupabaseConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required for DB sync");
  }

  return {
    key,
    url: normalizeSupabaseUrl(url)
  };
}

export async function upsertSupabaseRows(
  table: string,
  rows: Array<Record<string, unknown>>,
  onConflict: string
): Promise<SupabaseWriteResult> {
  if (rows.length === 0) {
    return {
      ok: true,
      rows: 0,
      table
    };
  }

  const config = getSupabaseConfig();
  const url = new URL(`${config.url}/rest/v1/${table}`);
  url.searchParams.set("on_conflict", onConflict);

  const response = await fetch(url, {
    body: JSON.stringify(rows),
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
      apikey: config.key
    },
    method: "POST"
  });

  if (!response.ok) {
    const message = await response.text();

    return {
      error: message || `Supabase REST upsert failed with ${response.status}`,
      ok: false,
      rows: 0,
      table
    };
  }

  return {
    ok: true,
    rows: rows.length,
    table
  };
}
