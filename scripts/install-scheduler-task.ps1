param(
  [string]$TaskName = "FoodProjectDataScheduler",
  [int]$IntervalMinutes = 5
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$Runner = Join-Path $ProjectRoot "scripts\run-scheduler-once.ps1"

if (-not (Test-Path $Runner)) {
  throw "Scheduler runner was not found: $Runner"
}

$action = New-ScheduledTaskAction `
  -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$Runner`"" `
  -WorkingDirectory $ProjectRoot

$repeatTrigger = New-ScheduledTaskTrigger `
  -Once `
  -At (Get-Date).AddMinutes(1) `
  -RepetitionInterval (New-TimeSpan -Minutes $IntervalMinutes) `
  -RepetitionDuration (New-TimeSpan -Days 3650)

$logonTrigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

try {
  Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $action `
    -Trigger @($repeatTrigger, $logonTrigger) `
    -Settings $settings `
    -Description "Food project API acquisition scheduler. Starts Next.js if needed and catches up missed jobs." `
    -Force | Out-Null

  Write-Output "Registered scheduled task: $TaskName"
  Write-Output "Runner: $Runner"
  Write-Output "Interval: every $IntervalMinutes minutes plus at logon"
} catch {
  Write-Warning "Register-ScheduledTask failed. Falling back to schtasks.exe with current-user permissions. Error: $($_.Exception.Message)"

  $taskCommand = "powershell.exe -NoProfile -ExecutionPolicy Bypass -File `"$Runner`""
  & schtasks.exe /Create /TN $TaskName /SC MINUTE /MO $IntervalMinutes /TR $taskCommand /F | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "schtasks.exe minute task registration failed with exit code $LASTEXITCODE"
  }

  $logonTaskName = "$TaskName-AtLogon"
  $logonOutput = & schtasks.exe /Create /TN $logonTaskName /SC ONLOGON /TR $taskCommand /F 2>&1
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "schtasks.exe logon task registration failed with exit code $LASTEXITCODE. The minute task is still registered and will catch up after sign-in. $logonOutput"
  } else {
    Write-Output "Registered logon task with schtasks.exe: $logonTaskName"
  }

  Write-Output "Registered scheduled task with schtasks.exe: $TaskName"
  Write-Output "Runner: $Runner"
  Write-Output "Interval: every $IntervalMinutes minutes"
}
