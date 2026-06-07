param(
  [string]$BaseUrl = $env:FOOD_PROJECT_BASE_URL,
  [string]$Region = $(if ($env:FOOD_PROJECT_REGION) { $env:FOOD_PROJECT_REGION } else { "kanto" }),
  [string]$Prefecture = $(if ($env:FOOD_PROJECT_PREFECTURE) { $env:FOOD_PROJECT_PREFECTURE } else { "tokyo" }),
  [int]$ServerWaitSeconds = 90
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$LogDir = Join-Path $ProjectRoot "data\logs"
$LogPath = Join-Path $LogDir ("scheduler-{0}.log" -f (Get-Date -Format "yyyyMMdd"))

New-Item -ItemType Directory -Force -Path $LogDir | Out-Null

if (-not $BaseUrl) {
  $BaseUrl = "http://127.0.0.1:3001"
}

function Write-Log {
  param([string]$Message)
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Message
  $line | Tee-Object -FilePath $LogPath -Append
}

$LockPath = Join-Path $LogDir "scheduler.lock"
$LockStream = $null

if (Test-Path $LockPath) {
  $lockAge = (Get-Date) - (Get-Item $LockPath).LastWriteTime
  if ($lockAge.TotalMinutes -lt 45) {
    Write-Log "Another scheduler launcher appears to be running. lockAgeMinutes=$([Math]::Round($lockAge.TotalMinutes, 1))"
    exit 0
  }

  Write-Log "Removing stale scheduler lock. lockAgeMinutes=$([Math]::Round($lockAge.TotalMinutes, 1))"
  Remove-Item -Force $LockPath
}

try {
  $LockStream = [System.IO.File]::Open($LockPath, [System.IO.FileMode]::CreateNew, [System.IO.FileAccess]::ReadWrite, [System.IO.FileShare]::None)
  $lockBytes = [System.Text.Encoding]::UTF8.GetBytes(("pid={0}; started={1}" -f $PID, (Get-Date -Format "o")))
  $LockStream.Write($lockBytes, 0, $lockBytes.Length)
  $LockStream.Flush()
} catch {
  Write-Log "Another scheduler launcher acquired the lock first."
  exit 0
}

function Resolve-Python {
  $candidates = @()
  if ($env:FOOD_PROJECT_PYTHON) {
    $candidates += $env:FOOD_PROJECT_PYTHON
  }
  $candidates += "C:\Users\tsuyo\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
  $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
  if ($pythonCommand) {
    $candidates += $pythonCommand.Source
  }
  $pyCommand = Get-Command py.exe -ErrorAction SilentlyContinue
  if ($pyCommand) {
    $candidates += $pyCommand.Source
  }

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  throw "Python executable was not found. Set FOOD_PROJECT_PYTHON or install Python."
}

function Test-Server {
  param([string]$Url)
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 10
    return ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500)
  } catch {
    return $false
  }
}

function Start-DevServer {
  $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if (-not $npmCommand) {
    throw "npm.cmd was not found. Start the Next.js server manually or install Node.js."
  }

  $stdout = Join-Path $LogDir "next-dev.out.log"
  $stderr = Join-Path $LogDir "next-dev.err.log"
  Write-Log "Starting Next.js dev server for scheduler."
  Start-Process `
    -FilePath $npmCommand.Source `
    -ArgumentList @("run", "dev", "--", "-H", "127.0.0.1", "-p", "3001") `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr
}

$LocationPushed = $false

try {
  Write-Log "Scheduler launcher started. baseUrl=$BaseUrl region=$Region prefecture=$Prefecture"

  if (-not (Test-Server $BaseUrl)) {
    Start-DevServer
    $deadline = (Get-Date).AddSeconds($ServerWaitSeconds)
    while ((Get-Date) -lt $deadline) {
      Start-Sleep -Seconds 3
      if (Test-Server $BaseUrl) {
        break
      }
    }
  }

  if (-not (Test-Server $BaseUrl)) {
    throw "Next.js server is not reachable at $BaseUrl"
  }

  $python = Resolve-Python
  Write-Log "Using Python: $python"

  Push-Location $ProjectRoot
  $LocationPushed = $true
  $arguments = @(
    "python\data_scheduler.py",
    "--once",
    "--base-url",
    $BaseUrl,
    "--region",
    $Region,
    "--prefecture",
    $Prefecture
  )
  & $python @arguments 2>&1 | Tee-Object -FilePath $LogPath -Append
  if ($LASTEXITCODE -ne 0) {
    throw "data_scheduler.py failed with exit code $LASTEXITCODE"
  }

  $extraArchiveArguments = @(
    "python\local_archive.py",
    "--only-extra",
    "--fail-on-error",
    "--base-url",
    $BaseUrl,
    "--region",
    $Region,
    "--prefecture",
    $Prefecture
  )
  $archiveExitCode = 1
  for ($attempt = 1; $attempt -le 3; $attempt++) {
    Write-Log "Running local_archive.py --only-extra attempt $attempt/3."
    & $python @extraArchiveArguments 2>&1 | Tee-Object -FilePath $LogPath -Append
    $archiveExitCode = $LASTEXITCODE
    if ($archiveExitCode -eq 0) {
      break
    }
    if ($attempt -lt 3) {
      Start-Sleep -Seconds (20 * $attempt)
    }
  }
  if ($archiveExitCode -ne 0) {
    throw "local_archive.py --only-extra failed with exit code $archiveExitCode"
  }

  Write-Log "Scheduler launcher finished."
} finally {
  if ($LockStream) {
    $LockStream.Close()
  }
  Remove-Item -Force $LockPath -ErrorAction SilentlyContinue
  if ($LocationPushed) {
    Pop-Location
  }
}
