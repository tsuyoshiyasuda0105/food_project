# Data Scheduler

## Cause Found

The local scheduler was not running automatically because the project only had the Python scheduler script. There was no registered Windows scheduled task, and the dashboard command used `python ...` even though this PC does not expose `python` on `PATH`.

After admin API protection was added, scheduler requests also need to send `ADMIN_API_TOKEN` for admin endpoints. `python/data_scheduler.py` now loads `.env.local` and attaches the token when it calls protected endpoints.

## Runner

Use the Windows runner instead of calling Python directly:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/run-scheduler-once.ps1
```

The runner does four things:

1. Finds Python from `FOOD_PROJECT_PYTHON`, the bundled Codex runtime, or installed Python.
2. Checks `http://127.0.0.1:3001`.
3. Starts the Next.js dev server if it is not reachable.
4. Runs `python/data_scheduler.py --once` so missed jobs are caught up.
5. Archives extra local datasets and retries temporary API failures up to three times.

Logs are written to:

```text
data/logs/scheduler-YYYYMMDD.log
```

## Windows Scheduled Task

Install the task:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/install-scheduler-task.ps1
```

Default behavior:

- Runs every 5 minutes.
- Tries to also create a Windows-logon trigger.
- Starts missed jobs using the scheduler catch-up window.
- Avoids overlapping runs.

On some non-admin Windows sessions, the logon trigger is denied. In that case the installer falls back to a current-user 5-minute task. After the PC is restarted and the user signs in, the next 5-minute run catches up missed jobs.

Remove the task:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/uninstall-scheduler-task.ps1
```

## Environment

Keep secrets in `.env.local`.

```text
ADMIN_API_TOKEN=...
ESTAT_APP_ID=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

Do not commit `.env.local`.
