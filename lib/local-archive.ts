import fs from "node:fs";
import path from "node:path";
import localArchiveConfig from "@/config/local-archive.json";

const DATA_DIR = path.join(process.cwd(), "data");
const LOCAL_ARCHIVE_DIR = path.join(DATA_DIR, "local-archive");
const LOCAL_ARCHIVE_MANIFEST_PATH = path.join(LOCAL_ARCHIVE_DIR, "manifest.json");

export type LocalArchiveExtraEndpoint = {
  endpoint: string;
  id: string;
  label: string;
  method: string;
  source: string;
  target: string;
  timeoutSeconds: number;
};

export type LocalArchiveJobSummary = {
  archives: number;
  compressedBytes: number;
  label: string;
  lastArchivedAt: string | null;
  lastPath: string | null;
  lastScheduledAt: string | null;
  rawBytes: number;
  source: string;
};

export type LocalArchiveManifest = {
  generatedAt: string | null;
  jobs: Record<string, LocalArchiveJobSummary>;
  root: string;
  totals: {
    archives: number;
    compressedBytes: number;
    rawBytes: number;
  };
};

export type LocalArchiveStatus = {
  analysisRole: string;
  enabled: boolean;
  excludeJobIds: string[];
  excludedData: string[];
  extraEndpoints: LocalArchiveExtraEndpoint[];
  format: string;
  generatedAt: string;
  includeJobIds: string[];
  localStorageRole: string;
  manifest: LocalArchiveManifest;
  manifestExists: boolean;
  manifestPath: string;
  retentionYears: number;
  root: string;
  schedulerStatePath: string;
  supabaseRole: string;
  supabaseWindowYears: number;
  weatherDataPolicy: string;
};

type RawManifest = Partial<LocalArchiveManifest>;

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function extraEndpoints(): LocalArchiveExtraEndpoint[] {
  return localArchiveConfig.extraEndpoints.map((endpoint) => ({
    endpoint: String(endpoint.endpoint),
    id: String(endpoint.id),
    label: String(endpoint.label),
    method: String(endpoint.method),
    source: String(endpoint.source),
    target: String(endpoint.target),
    timeoutSeconds: Number(endpoint.timeoutSeconds)
  }));
}

function emptyManifest(): LocalArchiveManifest {
  return {
    generatedAt: null,
    jobs: {},
    root: String(localArchiveConfig.root),
    totals: {
      archives: 0,
      compressedBytes: 0,
      rawBytes: 0
    }
  };
}

function normalizeManifest(value: RawManifest): LocalArchiveManifest {
  return {
    generatedAt: typeof value.generatedAt === "string" ? value.generatedAt : null,
    jobs: value.jobs && typeof value.jobs === "object" ? value.jobs as Record<string, LocalArchiveJobSummary> : {},
    root: typeof value.root === "string" ? value.root : String(localArchiveConfig.root),
    totals: {
      archives: Number(value.totals?.archives ?? 0),
      compressedBytes: Number(value.totals?.compressedBytes ?? 0),
      rawBytes: Number(value.totals?.rawBytes ?? 0)
    }
  };
}

export function getLocalArchiveStatus(): LocalArchiveStatus {
  let manifest = emptyManifest();
  let manifestExists = false;

  if (fs.existsSync(LOCAL_ARCHIVE_MANIFEST_PATH)) {
    manifestExists = true;
    try {
      manifest = normalizeManifest(JSON.parse(fs.readFileSync(LOCAL_ARCHIVE_MANIFEST_PATH, "utf-8")) as RawManifest);
    } catch {
      manifest = emptyManifest();
    }
  }

  return {
    analysisRole: String(localArchiveConfig.analysisRole),
    enabled: Boolean(localArchiveConfig.enabled),
    excludeJobIds: stringArray(localArchiveConfig.excludeJobIds),
    excludedData: stringArray(localArchiveConfig.excludedData),
    extraEndpoints: extraEndpoints(),
    format: String(localArchiveConfig.format),
    generatedAt: new Date().toISOString(),
    includeJobIds: stringArray(localArchiveConfig.includeJobIds),
    localStorageRole: String(localArchiveConfig.localStorageRole),
    manifest,
    manifestExists,
    manifestPath: String(localArchiveConfig.manifestPath),
    retentionYears: Number(localArchiveConfig.retentionYears),
    root: String(localArchiveConfig.root),
    schedulerStatePath: String(localArchiveConfig.schedulerStatePath),
    supabaseRole: String(localArchiveConfig.supabaseRole),
    supabaseWindowYears: Number(localArchiveConfig.supabaseWindowYears),
    weatherDataPolicy: String(localArchiveConfig.weatherDataPolicy)
  };
}
