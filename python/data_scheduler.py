from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import sqlite3
import time
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "config" / "data-jobs.json"
ARCHIVE_CONFIG_PATH = ROOT / "config" / "local-archive.json"
STATE_DIR = ROOT / "data"
STATE_PATH = STATE_DIR / "scheduler_state.sqlite"
STATE_SUMMARY_PATH = STATE_DIR / "scheduler_state.json"


@dataclass(frozen=True)
class Job:
    action: str
    catch_up_within_hours: int
    endpoint: str
    failure_action: str
    id: str
    label: str
    max_retries: int
    method: str
    retry_minutes: list[int]
    run_times: list[str]
    source: str
    status: str
    target: str
    timeout_seconds: int


def load_config() -> dict[str, Any]:
    with CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_archive_config() -> dict[str, Any]:
    if not ARCHIVE_CONFIG_PATH.exists():
        return {"enabled": False}
    with ARCHIVE_CONFIG_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def load_jobs(config: dict[str, Any]) -> list[Job]:
    jobs = []
    for item in config["jobs"]:
        jobs.append(
            Job(
                action=item["action"],
                catch_up_within_hours=int(item["catchUpWithinHours"]),
                endpoint=item.get("endpoint", ""),
                failure_action=item["failureAction"],
                id=item["id"],
                label=item["label"],
                max_retries=int(item["maxRetries"]),
                method=item["method"],
                retry_minutes=[int(value) for value in item["retryMinutes"]],
                run_times=item["runTimes"],
                source=item["source"],
                status=item["status"],
                target=item["target"],
                timeout_seconds=int(item["timeoutSeconds"]),
            )
        )
    return jobs


def connect_state(path: Path) -> sqlite3.Connection:
    path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute(
        """
        create table if not exists job_runs (
          job_id text not null,
          scheduled_at text not null,
          status text not null,
          attempt integer not null default 0,
          next_attempt_at text,
          last_error text,
          started_at text,
          finished_at text,
          primary key (job_id, scheduled_at)
        )
        """
    )
    connection.commit()
    return connection


def parse_hhmm(value: str) -> tuple[int, int]:
    hour, minute = value.split(":", 1)
    return int(hour), int(minute)


def scheduled_datetimes(job: Job, now: datetime) -> list[datetime]:
    scheduled: list[datetime] = []
    for day_offset in range(0, max(1, (job.catch_up_within_hours // 24) + 2)):
        day = now.date() - timedelta(days=day_offset)
        for run_time in job.run_times:
            hour, minute = parse_hhmm(run_time)
            scheduled.append(
                datetime(day.year, day.month, day.day, hour, minute, tzinfo=now.tzinfo)
            )
    return sorted(scheduled)


def iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def project_path(value: str | Path, default: str | Path) -> Path:
    raw = Path(str(value or default))
    return raw if raw.is_absolute() else ROOT / raw


def display_path(path: Path) -> str:
    return str(path.relative_to(ROOT) if path.is_relative_to(ROOT) else path)


def row_for(connection: sqlite3.Connection, job_id: str, scheduled_at: str) -> sqlite3.Row | None:
    cursor = connection.execute(
        "select * from job_runs where job_id = ? and scheduled_at = ?",
        (job_id, scheduled_at),
    )
    return cursor.fetchone()


def due_runs(connection: sqlite3.Connection, jobs: list[Job], now: datetime) -> list[tuple[Job, datetime]]:
    due: list[tuple[Job, datetime]] = []
    for job in jobs:
        if job.status != "active" or not job.endpoint or not job.run_times:
            continue

        for scheduled_at in scheduled_datetimes(job, now):
            if scheduled_at > now:
                continue
            if now - scheduled_at > timedelta(hours=job.catch_up_within_hours):
                continue

            row = row_for(connection, job.id, iso(scheduled_at) or "")
            if row is None:
                due.append((job, scheduled_at))
                continue
            if row["status"] == "success":
                continue
            next_attempt = row["next_attempt_at"]
            if next_attempt and datetime.fromisoformat(next_attempt) <= now:
                due.append((job, scheduled_at))
    return due


def next_scheduled_datetime(job: Job, now: datetime) -> datetime | None:
    if not job.run_times:
        return None

    upcoming: list[datetime] = []
    for day_offset in range(0, 8):
        day = now.date() + timedelta(days=day_offset)
        for run_time in job.run_times:
            hour, minute = parse_hhmm(run_time)
            candidate = datetime(day.year, day.month, day.day, hour, minute, tzinfo=now.tzinfo)
            if candidate >= now:
                upcoming.append(candidate)
    return min(upcoming) if upcoming else None


def run_row_to_dict(row: sqlite3.Row | None) -> dict[str, Any] | None:
    if row is None:
        return None
    return {
        "attempt": int(row["attempt"]),
        "finishedAt": row["finished_at"],
        "jobId": row["job_id"],
        "lastError": row["last_error"],
        "nextAttemptAt": row["next_attempt_at"],
        "scheduledAt": row["scheduled_at"],
        "startedAt": row["started_at"],
        "status": row["status"],
    }


def latest_run_row(connection: sqlite3.Connection, job_id: str) -> sqlite3.Row | None:
    cursor = connection.execute(
        """
        select * from job_runs
        where job_id = ?
        order by scheduled_at desc
        limit 1
        """,
        (job_id,),
    )
    return cursor.fetchone()


def count_runs(connection: sqlite3.Connection, status: str | None = None, job_id: str | None = None) -> int:
    clauses = []
    params: list[str] = []
    if status is not None:
        clauses.append("status = ?")
        params.append(status)
    if job_id is not None:
        clauses.append("job_id = ?")
        params.append(job_id)
    where = f"where {' and '.join(clauses)}" if clauses else ""
    cursor = connection.execute(f"select count(*) as total from job_runs {where}", params)
    row = cursor.fetchone()
    return int(row["total"] if row else 0)


def status_totals(connection: sqlite3.Connection) -> dict[str, int]:
    cursor = connection.execute("select status, count(*) as total from job_runs group by status")
    return {str(row["status"]): int(row["total"]) for row in cursor.fetchall()}


def rows_for_status(connection: sqlite3.Connection, status: str, limit: int = 20) -> list[dict[str, Any]]:
    cursor = connection.execute(
        """
        select * from job_runs
        where status = ?
        order by coalesce(next_attempt_at, finished_at, started_at, scheduled_at) desc
        limit ?
        """,
        (status, limit),
    )
    return [row for row in (run_row_to_dict(item) for item in cursor.fetchall()) if row]


def due_run_details(
    connection: sqlite3.Connection,
    due: list[tuple[Job, datetime]],
) -> list[dict[str, Any]]:
    details = []
    for job, scheduled_at in due:
        row = row_for(connection, job.id, iso(scheduled_at) or "")
        details.append(
            {
                "attempt": int(row["attempt"]) + 1 if row else 1,
                "jobId": job.id,
                "label": job.label,
                "reason": "retry_due" if row else "catch_up",
                "scheduledAt": iso(scheduled_at),
            }
        )
    return details


def scheduler_state_snapshot(
    connection: sqlite3.Connection,
    jobs: list[Job],
    now: datetime,
    state_path: Path,
    summary_path: Path,
    recent_results: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    due = due_runs(connection, jobs, now)
    totals = status_totals(connection)
    active_jobs = [job for job in jobs if job.status == "active"]
    executable_jobs = [
        job for job in active_jobs if job.endpoint.strip() and job.run_times
    ]
    planned_jobs = [job for job in jobs if job.status == "planned"]
    paused_jobs = [job for job in jobs if job.status == "paused"]

    due_by_job: dict[str, list[str | None]] = {}
    for job, scheduled_at in due:
        due_by_job.setdefault(job.id, []).append(iso(scheduled_at))

    job_summaries = []
    for job in jobs:
        job_summaries.append(
            {
                "catchUpDueScheduledAt": due_by_job.get(job.id, []),
                "catchUpWithinHours": job.catch_up_within_hours,
                "endpointConfigured": bool(job.endpoint.strip()),
                "failedRuns": count_runs(connection, "failed", job.id),
                "id": job.id,
                "label": job.label,
                "lastRun": run_row_to_dict(latest_run_row(connection, job.id)),
                "maxRetries": job.max_retries,
                "nextRunAt": iso(next_scheduled_datetime(job, now)),
                "retryMinutes": job.retry_minutes,
                "retryWaitingRuns": count_runs(connection, "retry_wait", job.id),
                "runTimes": job.run_times,
                "source": job.source,
                "status": job.status,
            }
        )

    return {
        "generatedAt": iso(now),
        "paths": {
            "sqlite": display_path(state_path),
            "summary": display_path(summary_path),
        },
        "policy": {
            "catchUp": "起動時にcatchUpWithinHours以内の未実行スロットを補完する。範囲外の古いスロットはスキップする。",
            "retry": "失敗時はretryMinutes順に再実行し、上限後はfailedとして次の定期実行を待つ。",
            "weather": "気象庁は7日予報と日次傾向だけを対象にし、時間別観測履歴は補完しない。",
        },
        "counts": {
            "activeJobs": len(active_jobs),
            "dueNow": len(due),
            "executableActiveJobs": len(executable_jobs),
            "failedRuns": totals.get("failed", 0),
            "pausedJobs": len(paused_jobs),
            "plannedJobs": len(planned_jobs),
            "retryWaitingRuns": totals.get("retry_wait", 0),
            "runningRuns": totals.get("running", 0),
            "successfulRuns": totals.get("success", 0),
            "totalJobs": len(jobs),
        },
        "catchUpQueue": due_run_details(connection, due),
        "failedRuns": rows_for_status(connection, "failed", 20),
        "jobs": job_summaries,
        "recentResults": recent_results or [],
        "retryQueue": rows_for_status(connection, "retry_wait", 20),
    }


def write_scheduler_state_summary(path: Path, snapshot: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = path.with_suffix(".tmp")
    with temporary_path.open("w", encoding="utf-8") as file:
        json.dump(snapshot, file, ensure_ascii=False, indent=2)
    temporary_path.replace(path)


def build_url(base_url: str, endpoint: str, region: str, prefecture: str) -> str:
    replaced = endpoint.replace("{region}", urllib.parse.quote(region)).replace(
        "{prefecture}", urllib.parse.quote(prefecture)
    )
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", replaced.lstrip("/"))


def mark_started(connection: sqlite3.Connection, job: Job, scheduled_at: datetime, now: datetime) -> int:
    scheduled_key = iso(scheduled_at)
    row = row_for(connection, job.id, scheduled_key or "")
    attempt = int(row["attempt"]) + 1 if row else 1
    connection.execute(
        """
        insert into job_runs (job_id, scheduled_at, status, attempt, started_at)
        values (?, ?, 'running', ?, ?)
        on conflict(job_id, scheduled_at)
        do update set status = 'running', attempt = excluded.attempt, started_at = excluded.started_at
        """,
        (job.id, scheduled_key, attempt, iso(now)),
    )
    connection.commit()
    return attempt


def mark_success(connection: sqlite3.Connection, job: Job, scheduled_at: datetime, now: datetime) -> None:
    connection.execute(
        """
        update job_runs
        set status = 'success', next_attempt_at = null, last_error = null, finished_at = ?
        where job_id = ? and scheduled_at = ?
        """,
        (iso(now), job.id, iso(scheduled_at)),
    )
    connection.commit()


def mark_failed(
    connection: sqlite3.Connection,
    job: Job,
    scheduled_at: datetime,
    now: datetime,
    attempt: int,
    error: str,
) -> None:
    if attempt <= job.max_retries and attempt <= len(job.retry_minutes):
        next_attempt_at = now + timedelta(minutes=job.retry_minutes[attempt - 1])
        status = "retry_wait"
    else:
        next_attempt_at = None
        status = "failed"

    connection.execute(
        """
        update job_runs
        set status = ?, next_attempt_at = ?, last_error = ?, finished_at = ?
        where job_id = ? and scheduled_at = ?
        """,
        (status, iso(next_attempt_at), error[:1200], iso(now), job.id, iso(scheduled_at)),
    )
    connection.commit()


def call_job(base_url: str, job: Job, region: str, prefecture: str) -> dict[str, Any]:
    url = build_url(base_url, job.endpoint, region, prefecture)
    body = b"" if job.method == "POST" else None
    request = urllib.request.Request(
        url,
        data=body,
        method=job.method,
        headers={"Accept": "application/json", "Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request, timeout=job.timeout_seconds) as response:
        payload = response.read().decode("utf-8")
    data = json.loads(payload)
    if isinstance(data, dict) and data.get("ok") is False:
        raise RuntimeError(data.get("error") or f"{job.id} returned ok=false")
    return data


def archive_path(root: Path, job: Job, scheduled_at: datetime, digest: str) -> Path:
    return (
        root
        / job.id
        / f"{scheduled_at.year:04d}"
        / f"{scheduled_at.month:02d}"
        / f"{scheduled_at.date().isoformat()}_{scheduled_at.strftime('%H%M')}_{digest[:12]}.json.gz"
    )


def should_archive_job(job: Job, archive_config: dict[str, Any]) -> bool:
    if not archive_config.get("enabled", False):
        return False
    if not job.endpoint:
        return False
    if job.id in set(archive_config.get("excludeJobIds", [])):
        return False
    include_job_ids = set(archive_config.get("includeJobIds", []))
    return not include_job_ids or job.id in include_job_ids


def read_archive_manifest(manifest_path: Path, root: Path) -> dict[str, Any]:
    if not manifest_path.exists():
        return {
            "generatedAt": None,
            "jobs": {},
            "root": str(root.relative_to(ROOT) if root.is_relative_to(ROOT) else root),
            "totals": {
                "archives": 0,
                "compressedBytes": 0,
                "rawBytes": 0,
            },
        }
    try:
        with manifest_path.open("r", encoding="utf-8") as file:
            return json.load(file)
    except (OSError, json.JSONDecodeError):
        return {
            "generatedAt": None,
            "jobs": {},
            "root": str(root.relative_to(ROOT) if root.is_relative_to(ROOT) else root),
            "totals": {
                "archives": 0,
                "compressedBytes": 0,
                "rawBytes": 0,
            },
        }


def write_archive_manifest(manifest_path: Path, manifest: dict[str, Any]) -> None:
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = manifest_path.with_suffix(".tmp")
    with temporary_path.open("w", encoding="utf-8") as file:
        json.dump(manifest, file, ensure_ascii=False, indent=2)
    temporary_path.replace(manifest_path)


def save_local_archive(
    archive_config: dict[str, Any],
    job: Job,
    scheduled_at: datetime,
    archived_at: datetime,
    payload: dict[str, Any],
) -> dict[str, Any]:
    root = project_path(archive_config.get("root", "data/local-archive"), "data/local-archive")
    manifest_path = project_path(
        archive_config.get("manifestPath", "data/local-archive/manifest.json"),
        "data/local-archive/manifest.json",
    )
    retention_years = int(archive_config.get("retentionYears", 10))
    envelope = {
        "metadata": {
            "archivedAt": iso(archived_at),
            "jobId": job.id,
            "label": job.label,
            "retentionUntil": iso(scheduled_at + timedelta(days=retention_years * 365)),
            "scheduledAt": iso(scheduled_at),
            "source": job.source,
            "target": job.target,
        },
        "payload": payload,
    }
    raw_bytes = json.dumps(envelope, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    digest = hashlib.sha256(raw_bytes).hexdigest()
    output_path = archive_path(root, job, scheduled_at, digest)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with gzip.open(output_path, "wb", compresslevel=6) as file:
        file.write(raw_bytes)

    compressed_bytes = output_path.stat().st_size
    manifest = read_archive_manifest(manifest_path, root)
    jobs = manifest.setdefault("jobs", {})
    previous_job = jobs.get(job.id, {})
    previous_archives = int(previous_job.get("archives", 0))
    previous_raw_bytes = int(previous_job.get("rawBytes", 0))
    previous_compressed_bytes = int(previous_job.get("compressedBytes", 0))

    jobs[job.id] = {
        "archives": previous_archives + 1,
        "compressedBytes": previous_compressed_bytes + compressed_bytes,
        "label": job.label,
        "lastArchivedAt": iso(archived_at),
        "lastPath": display_path(output_path),
        "lastScheduledAt": iso(scheduled_at),
        "rawBytes": previous_raw_bytes + len(raw_bytes),
        "source": job.source,
    }
    manifest["generatedAt"] = iso(archived_at)
    manifest["root"] = str(root.relative_to(ROOT) if root.is_relative_to(ROOT) else root)
    manifest["totals"] = {
        "archives": sum(int(item.get("archives", 0)) for item in jobs.values()),
        "compressedBytes": sum(int(item.get("compressedBytes", 0)) for item in jobs.values()),
        "rawBytes": sum(int(item.get("rawBytes", 0)) for item in jobs.values()),
    }
    write_archive_manifest(manifest_path, manifest)

    return {
        "bytes": compressed_bytes,
        "path": display_path(output_path),
        "rawBytes": len(raw_bytes),
    }


def run_due_jobs(
    connection: sqlite3.Connection,
    jobs: list[Job],
    archive_config: dict[str, Any],
    base_url: str,
    region: str,
    prefecture: str,
    timezone: ZoneInfo,
) -> list[dict[str, Any]]:
    now = datetime.now(timezone)
    results = []
    for job, scheduled_at in due_runs(connection, jobs, now):
        attempt = mark_started(connection, job, scheduled_at, now)
        try:
            data = call_job(base_url, job, region, prefecture)
            local_archive = None
            if should_archive_job(job, archive_config):
                local_archive = save_local_archive(
                    archive_config,
                    job,
                    scheduled_at,
                    datetime.now(timezone),
                    data,
                )
            mark_success(connection, job, scheduled_at, datetime.now(timezone))
            results.append(
                {
                    "attempt": attempt,
                    "jobId": job.id,
                    "label": job.label,
                    "localArchive": local_archive,
                    "ok": True,
                    "scheduledAt": iso(scheduled_at),
                    "source": job.source,
                    "summary": data.get("source") if isinstance(data, dict) else "ok",
                }
            )
        except (urllib.error.URLError, TimeoutError, RuntimeError, json.JSONDecodeError) as error:
            mark_failed(connection, job, scheduled_at, datetime.now(timezone), attempt, str(error))
            results.append(
                {
                    "attempt": attempt,
                    "error": str(error),
                    "jobId": job.id,
                    "label": job.label,
                    "ok": False,
                    "scheduledAt": iso(scheduled_at),
                    "source": job.source,
                }
            )
    return results


def main() -> None:
    parser = argparse.ArgumentParser(description="Food project data acquisition scheduler")
    parser.add_argument("--base-url", default=None)
    parser.add_argument("--region", default="kanto")
    parser.add_argument("--prefecture", default="tokyo")
    parser.add_argument("--state", default=str(STATE_PATH))
    parser.add_argument("--state-summary", default=None)
    parser.add_argument("--no-local-archive", action="store_true")
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--loop", action="store_true")
    parser.add_argument("--status", action="store_true")
    parser.add_argument("--interval-seconds", type=int, default=300)
    args = parser.parse_args()

    config = load_config()
    timezone = ZoneInfo(config["timezone"])
    jobs = load_jobs(config)
    archive_config = load_archive_config()
    if args.no_local_archive:
        archive_config = {**archive_config, "enabled": False}
    base_url = args.base_url or config["defaultBaseUrl"]
    state_path = Path(args.state)
    summary_path = project_path(
        args.state_summary or archive_config.get("schedulerStatePath", "data/scheduler_state.json"),
        STATE_SUMMARY_PATH,
    )
    connection = connect_state(state_path)

    if args.status:
        snapshot = scheduler_state_snapshot(
            connection,
            jobs,
            datetime.now(timezone),
            state_path,
            summary_path,
        )
        write_scheduler_state_summary(summary_path, snapshot)
        print(json.dumps(snapshot, ensure_ascii=False, indent=2))
        return

    if not args.loop:
        args.once = True

    while True:
        results = run_due_jobs(
            connection,
            jobs,
            archive_config,
            base_url,
            args.region,
            args.prefecture,
            timezone,
        )
        snapshot = scheduler_state_snapshot(
            connection,
            jobs,
            datetime.now(timezone),
            state_path,
            summary_path,
            results,
        )
        write_scheduler_state_summary(summary_path, snapshot)
        print(
            json.dumps(
                {
                    "generatedAt": snapshot["generatedAt"],
                    "localArchive": {
                        "enabled": bool(archive_config.get("enabled", False)),
                        "retentionYears": archive_config.get("retentionYears", 10),
                        "root": archive_config.get("root", "data/local-archive"),
                    },
                    "results": results,
                    "schedulerState": {
                        "counts": snapshot["counts"],
                        "path": display_path(summary_path),
                    },
                    "timezone": config["timezone"],
                },
                ensure_ascii=False,
            )
        )
        if args.once:
            break
        time.sleep(max(30, args.interval_seconds))


if __name__ == "__main__":
    main()
