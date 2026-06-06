import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import {
  activeScrapingScheduleItems,
  executableScrapingScheduleItems,
  missingEndpointScrapingScheduleItems,
  pausedScrapingScheduleItems,
  plannedImplementationScrapingScheduleItems,
  plannedScrapingScheduleItems,
  scrapingScheduleConfig,
  scrapingScheduleItems,
  scrapingScheduleSummary,
  weatherScrapingSchedulePolicy
} from "@/lib/scraping-schedule";
import { getLocalArchiveStatus } from "@/lib/local-archive";

export const dynamic = "force-dynamic";

const SCHEDULER_STATE_ABSOLUTE_PATH = path.join(process.cwd(), "data", "scheduler_state.json");

type SchedulerStateResponse = {
  ageMinutes: number | null;
  exists: boolean;
  generatedAt: string | null;
  message: string;
  path: string;
  snapshot: unknown | null;
};

function generatedAtFromSnapshot(snapshot: unknown) {
  if (!snapshot || typeof snapshot !== "object" || !("generatedAt" in snapshot)) return null;
  const generatedAt = (snapshot as { generatedAt?: unknown }).generatedAt;
  return typeof generatedAt === "string" ? generatedAt : null;
}

function ageMinutes(generatedAt: string | null) {
  if (!generatedAt) return null;
  const timestamp = Date.parse(generatedAt);
  if (Number.isNaN(timestamp)) return null;
  return Math.max(0, Math.round((Date.now() - timestamp) / 1000 / 60));
}

function readSchedulerState(summaryPath: string): SchedulerStateResponse {
  const absolutePath = SCHEDULER_STATE_ABSOLUTE_PATH;

  if (!fs.existsSync(absolutePath)) {
    return {
      ageMinutes: null,
      exists: false,
      generatedAt: null,
      message: "Python scheduler has not written a state snapshot yet. Run python/data_scheduler.py --loop or --status to create it.",
      path: summaryPath,
      snapshot: null
    };
  }

  try {
    const snapshot = JSON.parse(fs.readFileSync(absolutePath, "utf-8")) as unknown;
    const generatedAt = generatedAtFromSnapshot(snapshot);
    return {
      ageMinutes: ageMinutes(generatedAt),
      exists: true,
      generatedAt,
      message: "Python scheduler state snapshot loaded.",
      path: summaryPath,
      snapshot
    };
  } catch {
    return {
      ageMinutes: null,
      exists: false,
      generatedAt: null,
      message: "Python scheduler state snapshot exists but could not be parsed.",
      path: summaryPath,
      snapshot: null
    };
  }
}

export async function GET() {
  const localArchive = getLocalArchiveStatus();
  const schedulerState = readSchedulerState(localArchive.schedulerStatePath);

  return NextResponse.json({
    ok: true,
    timezone: scrapingScheduleConfig.timezone,
    defaultBaseUrl: scrapingScheduleConfig.defaultBaseUrl,
    generatedAt: new Date().toISOString(),
    localArchive,
    policy: {
      catchUp: "Python scheduler runs missed jobs within each job catchUpWithinHours on startup. Missed runs outside that window are intentionally skipped.",
      retry: "Failed jobs are retried by retryMinutes and then marked failed until the next regular run creates a new scheduled slot.",
      weather: weatherScrapingSchedulePolicy,
      wagri: "disabled",
      jaficFish: "paused"
    },
    summary: scrapingScheduleSummary,
    implementation: {
      executableActiveJobIds: executableScrapingScheduleItems.map((item) => item.id),
      missingEndpointJobIds: missingEndpointScrapingScheduleItems.map((item) => item.id),
      plannedImplementationJobIds: plannedImplementationScrapingScheduleItems.map((item) => item.id),
      note: "Jobs with status=planned or without an endpoint are visible as implementation backlog and are not executed by the Python scheduler."
    },
    schedulerState,
    schedules: scrapingScheduleItems,
    activeSchedules: activeScrapingScheduleItems,
    plannedSchedules: plannedScrapingScheduleItems,
    pausedSchedules: pausedScrapingScheduleItems
  });
}
