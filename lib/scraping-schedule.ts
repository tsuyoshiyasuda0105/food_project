import dataJobsConfig from "@/config/data-jobs.json";

export type ScrapingScheduleStatus = "active" | "planned" | "paused";
export type ScrapingSchedulePriority = "critical" | "high" | "medium" | "low";
export type ScrapingScheduleMethod = "GET" | "POST";

export type ScrapingScheduleItem = {
  action: string;
  cadence: string;
  catchUpWithinHours: number;
  endpoint: string;
  failureAction: string;
  id: string;
  label: string;
  maxRetries: number;
  method: ScrapingScheduleMethod;
  note?: string;
  ownerScreen: string;
  priority: ScrapingSchedulePriority;
  publishWindow: string;
  recoveryAction: string;
  retryMinutes: number[];
  runTimes: string[];
  source: string;
  status: ScrapingScheduleStatus;
  target: string;
  timeoutSeconds: number;
};

export type ScrapingScheduleConfig = {
  defaultBaseUrl: string;
  jobs: ScrapingScheduleItem[];
  timezone: string;
};

export type ScrapingScheduleStatusCounts = Record<ScrapingScheduleStatus, number>;

export type ScrapingScheduleSummary = {
  executableActiveJobs: number;
  missingEndpointJobs: number;
  plannedImplementationJobs: number;
  statusCounts: ScrapingScheduleStatusCounts;
  totalJobs: number;
};

export type WeatherScrapingSchedulePolicy = {
  activeJobIds: string[];
  excluded: string;
  included: string;
  note: string;
};

type RawScrapingScheduleItem = Omit<
  ScrapingScheduleItem,
  "method" | "priority" | "status"
> & {
  method: string;
  priority: string;
  status: string;
};

function toScheduleStatus(value: string): ScrapingScheduleStatus {
  if (value === "active" || value === "planned" || value === "paused") return value;
  return "planned";
}

function toSchedulePriority(value: string): ScrapingSchedulePriority {
  if (value === "critical" || value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "medium";
}

function toScheduleMethod(value: string): ScrapingScheduleMethod {
  return value === "POST" ? "POST" : "GET";
}

export const scrapingScheduleConfig: ScrapingScheduleConfig = {
  defaultBaseUrl: dataJobsConfig.defaultBaseUrl,
  jobs: (dataJobsConfig.jobs as RawScrapingScheduleItem[]).map((item) => ({
    ...item,
    method: toScheduleMethod(item.method),
    priority: toSchedulePriority(item.priority),
    status: toScheduleStatus(item.status)
  })),
  timezone: dataJobsConfig.timezone
};

export const scrapingScheduleItems = scrapingScheduleConfig.jobs;

export const activeScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.status === "active"
);

export const pausedScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.status === "paused"
);

export const plannedScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.status === "planned"
);

export const executableScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.status === "active" && item.endpoint.trim().length > 0 && item.runTimes.length > 0
);

export const missingEndpointScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.endpoint.trim().length === 0
);

export const plannedImplementationScrapingScheduleItems = scrapingScheduleItems.filter(
  (item) => item.status === "planned" || (item.status === "active" && item.endpoint.trim().length === 0)
);

export const scrapingScheduleSummary: ScrapingScheduleSummary = {
  executableActiveJobs: executableScrapingScheduleItems.length,
  missingEndpointJobs: missingEndpointScrapingScheduleItems.length,
  plannedImplementationJobs: plannedImplementationScrapingScheduleItems.length,
  statusCounts: {
    active: activeScrapingScheduleItems.length,
    paused: pausedScrapingScheduleItems.length,
    planned: plannedScrapingScheduleItems.length
  },
  totalJobs: scrapingScheduleItems.length
};

export const weatherScrapingSchedulePolicy: WeatherScrapingSchedulePolicy = {
  activeJobIds: scrapingScheduleItems
    .filter((item) => item.source === "気象庁" && item.status === "active")
    .map((item) => item.id),
  excluded: "気象庁の時間別観測履歴はスケジュール対象外です。",
  included: "気象庁は7日予報と日次の気温・降水傾向を需要予測向けに取得します。",
  note: "PC/サーバー復帰時も、時間別履歴を埋めるのではなく最新予報を優先して補完します。"
};
