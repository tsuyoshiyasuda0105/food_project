from __future__ import annotations

import argparse
import json
from dataclasses import dataclass
from datetime import datetime
from zoneinfo import ZoneInfo

from data_scheduler import (
    call_job,
    iso,
    load_archive_config,
    load_config,
    load_jobs,
    save_local_archive,
    should_archive_job,
)

@dataclass(frozen=True)
class ArchiveEndpoint:
    endpoint: str
    id: str
    label: str
    method: str
    source: str
    target: str
    timeout_seconds: int


def load_extra_endpoints(archive_config: dict) -> list[ArchiveEndpoint]:
    endpoints = []
    for item in archive_config.get("extraEndpoints", []):
        endpoints.append(
            ArchiveEndpoint(
                endpoint=item["endpoint"],
                id=item["id"],
                label=item["label"],
                method=item.get("method", "GET"),
                source=item["source"],
                target=item["target"],
                timeout_seconds=int(item.get("timeoutSeconds", 120)),
            )
        )
    return endpoints


def main() -> None:
    parser = argparse.ArgumentParser(description="Archive current API payloads to local 10-year storage")
    parser.add_argument("--base-url", default=None)
    parser.add_argument("--region", default="kanto")
    parser.add_argument("--prefecture", default="tokyo")
    args = parser.parse_args()

    config = load_config()
    archive_config = load_archive_config()
    timezone = ZoneInfo(config["timezone"])
    base_url = args.base_url or config["defaultBaseUrl"]
    now = datetime.now(timezone)
    results = []

    archive_jobs = [
        job
        for job in load_jobs(config)
        if job.status == "active" and should_archive_job(job, archive_config)
    ]
    archive_jobs.extend(load_extra_endpoints(archive_config))

    for job in archive_jobs:
        if not should_archive_job(job, archive_config):
            continue

        try:
            payload = call_job(base_url, job, args.region, args.prefecture)
            archive = save_local_archive(archive_config, job, now, datetime.now(timezone), payload)
            results.append(
                {
                    "archive": archive,
                    "jobId": job.id,
                    "label": job.label,
                    "ok": True,
                    "source": job.source,
                }
            )
        except Exception as error:  # noqa: BLE001 - command-line report should keep going by job.
            results.append(
                {
                    "error": str(error),
                    "jobId": job.id,
                    "label": job.label,
                    "ok": False,
                    "source": job.source,
                }
            )

    print(
        json.dumps(
            {
                "generatedAt": iso(datetime.now(timezone)),
                "localArchive": {
                    "enabled": bool(archive_config.get("enabled", False)),
                    "excludedData": archive_config.get("excludedData", []),
                    "excludeJobIds": archive_config.get("excludeJobIds", []),
                    "extraEndpointIds": [endpoint.id for endpoint in load_extra_endpoints(archive_config)],
                    "includeJobIds": archive_config.get("includeJobIds", []),
                    "manifestPath": archive_config.get("manifestPath", "data/local-archive/manifest.json"),
                    "retentionYears": archive_config.get("retentionYears", 10),
                    "root": archive_config.get("root", "data/local-archive"),
                    "weatherDataPolicy": archive_config.get("weatherDataPolicy", ""),
                },
                "results": results,
                "timezone": config["timezone"],
            },
            ensure_ascii=False,
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
